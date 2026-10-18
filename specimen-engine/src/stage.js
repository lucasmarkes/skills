import * as THREE from 'three/webgpu';
import { lights, pass, texture, uniform, float, vec4, hash, screenCoordinate, screenUV, smoothstep, dot, vec3, renderOutput, abs, max, length, mix } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';
import { RectAreaLightTexturesLib } from 'three/addons/lights/RectAreaLightTexturesLib.js';
import { WebGPUPathTracer, OIDNDenoiser } from 'three-gpu-pathtracer/webgpu';
import { initUNetFromURL } from 'oidn-web';
import { createStudioEnvironment } from './studio.js';
import { createTile } from './tile.js';
import { THEMES } from './themes.js';
import { createMaterials, glowFrom } from './materials.js';
import * as H from './helpers.js';

export const FPS = 30;
export const TILE = { size: 2, cornerRadius: 0.4, depth: 0.3 };

export class PieceError extends Error {

	constructor( message ) {

		super( message );
		this.name = 'PieceError';

	}

}

// "msg (rocket.specimen.js:42)" from an error thrown inside the piece module
function pieceError( e, pieceUrl ) {

	const file = pieceUrl.split( '/' ).pop().split( '?' )[ 0 ];
	const esc = file.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
	const at = String( e?.stack ?? '' ).match( new RegExp( esc + '(?:\\?[^:]*)?:(\\d+)' ) );
	return new PieceError( `${ e?.message ?? e } (${ file }${ at ? ':' + at[ 1 ] : '' })` );

}

async function requireWebGPU() {

	if ( ! navigator.gpu ) throw new Error( 'WebGPU is not available in this Chrome (navigator.gpu missing)' );
	if ( ! await navigator.gpu.requestAdapter() ) throw new Error( 'WebGPU is not available in this Chrome (no adapter)' );

}

/**
 * Mounts a piece on a stage: tile, studio, lights, post. mode 'rt' is raster (live, sheet, checks),
 * 'pt' is path traced (video). Resolves to { scene, duration, frames, renderFrame, start, stop, dispose }.
 */
export async function mount( canvas, { pieceUrl, piece, theme = 'dark', mode = 'rt', size = 768, denoise = false, weightsUrl, pixelRatio = 1 } = {} ) {

	await requireWebGPU();
	const T = THEMES[ theme ];
	if ( ! T ) throw new Error( `unknown theme "${ theme }" (dark or light)` );

	// --- the piece ---
	let mod = piece;
	if ( ! mod ) {

		try {

			mod = await import( /* @vite-ignore */ pieceUrl );

		} catch ( e ) {

			throw new PieceError( `${ e.message } (${ pieceUrl.split( '/' ).pop() })` );

		}

	}

	const spec = mod.scene;
	if ( ! spec || typeof mod.object !== 'function' ) throw new PieceError( `a piece exports \`scene\` and \`object\` (${ ( pieceUrl ?? 'piece' ).split( '/' ).pop() })` );
	const duration = spec.duration ?? 8;
	const frames = Math.round( duration * FPS );
	const TINT = spec.lights?.tint ?? 0.45;
	const glow = new THREE.Color( spec.glow ?? glowFrom( spec.accent ) );

	// --- renderer ---
	const renderer = new THREE.WebGPURenderer( { canvas, antialias: true, alpha: false } );
	renderer.setPixelRatio( pixelRatio );
	renderer.setSize( size, size, false );
	renderer.toneMapping = THREE.NeutralToneMapping; // keeps the accent saturated (AgX washes it out)
	renderer.toneMappingExposure = T.exposure;
	await renderer.init();
	THREE.RectAreaLightNode.setLTC( RectAreaLightTexturesLib.init() );

	// --- scene ---
	const scene = new THREE.Scene();
	scene.background = new THREE.Color( T.page );
	scene.environment = createStudioEnvironment( spec.accent, { fakeAccentBounce: mode === 'rt' ? TINT : 0, accentFloor: ( spec.lights?.floor ?? 0 ) * TINT, ambient: T.ambient, key: T.key } );

	const camera = new THREE.PerspectiveCamera( 14, 1, 1, 100 );
	camera.position.set( 0, 0, 10.4 );
	camera.lookAt( 0, 0, 0 );

	const tile = createTile( { ...TILE, color: T.tile } );
	scene.add( tile.mesh );

	let textures = 0;
	const ctx = Object.freeze( {
		THREE,
		theme,
		mat: createMaterials( theme, glow ),
		accent: new THREE.Color( spec.accent ),
		glow,
		geo: Object.freeze( { roundedRect: H.roundedRect, planarUV: H.planarUV, lathe: H.lathe, bevelExtrude: H.bevelExtrude } ),
		texture( w, h ) {

			if ( ++ textures > 1 ) throw new Error( 'ctx.texture() can be called once per object: the path tracer holds one dynamic texture per object' );
			return H.proceduralTexture( w, h, { pigment: theme === 'light' } );

		},
		gradient: H.gradient,
		TAU: H.TAU, bump: H.bump, smoothstep: H.smoothstep,
	} );

	let hero;
	try {

		hero = mod.object( ctx );
		if ( ! hero?.mesh?.isObject3D ) throw new Error( 'object() returns { mesh, update }' );
		hero.update?.( 0 );

	} catch ( e ) {

		renderer.dispose();
		throw pieceError( e, pieceUrl ?? 'piece' );

	}

	// optical fit: every hero's solid mass sits in the same safe area (58% of the tile, centred a touch
	// above the geometric middle). fit = { scale, x, y } nudges one object into it without touching its
	// own animation; scaling keeps the object's depth in front of the tile.
	const fit = new THREE.Group();
	const F = spec.fit || {};
	const fs = F.scale ?? 1;
	fit.scale.setScalar( fs );
	fit.position.set( F.x ?? 0, F.y ?? 0, hero.mesh.position.z * ( 1 - fs ) );
	fit.add( hero.mesh );
	scene.add( fit );

	// Raster: the tile's accent/rim lights would show up on glossy heroes as thin hard strips. Keep the
	// hero on environment lighting only (in the path tracer the glow floor reflection hides them).
	if ( mode === 'rt' ) hero.mesh.traverse( o => { if ( o.isMesh ) for ( const m of [ o.material ].flat() ) m.lightsNode = lights( [] ); } );

	// accent light: tucked under the hero, facing the tile → a soft pool below it.
	// Never aim a light exactly along +Y: lookAt degenerates and produces NaNs.
	const L = spec.lights || {};
	const accent = new THREE.RectAreaLight( spec.accent, ( L.accent ?? 4 ) * TINT * T.tint, 0.8, 0.25 );
	accent.position.set( 0, - 0.62, 0.3 );
	accent.lookAt( 0, - 1.0, - 0.3 );
	scene.add( accent );

	// glow floor: a large emissive plane below the tile, out of frame, with a soft radial falloff. Glossy
	// undersides mirror it as a smooth gradient. Path tracer only — raster uses the env-map fake.
	const under = createGlowFloor( spec.accent, ( L.under ?? 65 ) * TINT * T.tint );
	under.visible = mode === 'pt';
	scene.add( under );

	// raster stand-in for the glow floor's light on the tile (emissive meshes light nothing in raster)
	const underFill = new THREE.RectAreaLight( spec.accent, mode === 'rt' ? ( L.underFill ?? 6 ) * TINT * T.tint : 0, 2.6, 0.3 );
	underFill.position.set( 0, - 1.15, 0.25 );
	underFill.lookAt( 0, 0, 0.27 );
	scene.add( underFill );

	// accent rim light along the bottom bevel of the tile
	const rim = new THREE.RectAreaLight( spec.accent, ( L.rim ?? 24 ) * TINT * T.tint * ( mode === 'rt' ? 1.6 : 1 ), 1.6, 0.1 ); // raster misses the glow floor's share
	rim.position.set( 0, - 1.6, 0.6 );
	rim.lookAt( 0, - 0.9, 0 );
	scene.add( rim );

	function setTime( phase ) {

		hero.update?.( phase );
		tile.update( phase );
		scene.updateMatrixWorld( true );

	}

	// --- path tracer ---
	let pathTracer = null;
	if ( mode === 'pt' ) {

		pathTracer = new WebGPUPathTracer( renderer );
		pathTracer.renderDelay = 0;
		pathTracer.fadeDuration = 0;
		pathTracer.minSamples = 0;
		pathTracer.dynamicLowRes = false;
		pathTracer.filterGlossyFactor = 0.5;
		pathTracer.setScene( scene, camera );

	}

	let denoiser = null;
	if ( pathTracer && denoise ) {

		denoiser = new OIDNDenoiser( { initUNetFromURL, auxWeightsUrl: weightsUrl } );
		denoiser.init( renderer );
		denoiser.setScene( scene, camera );

	}

	// --- post: input → bloom → tone map → grain → page colour outside the tile ---
	const pipeline = new THREE.RenderPipeline( renderer );
	pipeline.outputColorTransform = false;

	const input = pathTracer ? texture( new THREE.Texture() ) : pass( scene, camera );
	const seed = uniform( 0 );
	const tileHalf = ( TILE.size / 2 ) / ( camera.position.z * Math.tan( THREE.MathUtils.degToRad( camera.fov / 2 ) ) );
	const tileR = tileHalf * TILE.cornerRadius / ( TILE.size / 2 );
	const sp = abs( screenUV.sub( 0.5 ).mul( 2 ) ).sub( tileHalf - tileR );
	const tileSDF = length( max( sp, 0 ) ).sub( tileR );
	const bloomMask = float( 1 ).sub( smoothstep( - 0.03, 0.03, tileSDF ) );
	const hdr = input.add( bloom( input, T.bloom, 0.6, T.bloomThreshold ).mul( bloomMask ) );
	const ldr = renderOutput( hdr );
	const n = hash( screenCoordinate.x.add( screenCoordinate.y.mul( 4099 ) ).add( seed.mul( 7919 ) ) ).sub( 0.5 );
	const lum = dot( ldr.rgb, vec3( 0.299, 0.587, 0.114 ) );
	const grainMask = T.grain === 'all'
		? float( 0.5 ).mul( float( 1 ).sub( smoothstep( 0.93, 0.995, lum ) ) ) // faint satin grain everywhere but page white
		: smoothstep( 0.01, 0.12, lum ).mul( float( 1 ).sub( smoothstep( 0.25, 0.6, lum ) ) ); // grain in the darks only
	// outside the tile the frame is exactly the page colour (tone mapping would turn white into grey),
	// so the video disappears into the page under screen / multiply blending
	const tileMask = float( 1 ).sub( smoothstep( 0.0, 0.006, tileSDF ) );
	const pageColor = vec3( ...new THREE.Color( T.page ).convertLinearToSRGB().toArray() );
	const final = ldr.rgb.add( n.mul( float( 0.035 ) ).mul( grainMask ) );
	pipeline.outputNode = vec4( mix( pageColor, final, tileMask ), 1 );

	function present( frameSeed ) {

		seed.value = frameSeed % 97;
		if ( pathTracer ) input.value = ( denoiser && denoiser.complete && denoiser.texture ) || pathTracer.target;
		pipeline.render();

	}

	const nextFrame = () => new Promise( r => requestAnimationFrame( r ) );

	async function tracePT( phase, samples ) {

		setTime( phase );
		pathTracer.updateTransforms();
		pathTracer.updateMaterials();
		pathTracer.updateLights();
		for ( ;; ) {

			pathTracer.renderSample();
			await nextFrame();
			const counts = await pathTracer.getSampleCountsAsync();
			if ( counts.min >= samples ) break;

		}

		if ( denoiser ) {

			denoiser.reset();
			denoiser.update( pathTracer.target );
			while ( ! denoiser.complete ) await nextFrame();

		}

	}

	function guard( fn ) {

		try {

			return fn();

		} catch ( e ) {

			throw pieceError( e, pieceUrl ?? 'piece' );

		}

	}

	let running = false;

	return {
		scene: spec,
		theme,
		duration,
		frames,
		internals: { THREE, scene, camera, renderer, hero, tile, fit, tileHalf },
		setTime: phase => guard( () => setTime( phase ) ),
		// draws frame n (phase n / frames) and leaves it on the canvas
		async renderFrame( frame, samples = 32 ) {

			const phase = ( ( frame % frames ) + frames ) % frames / frames;
			if ( pathTracer ) await guard( () => tracePT( phase, samples ) );
			else guard( () => setTime( phase ) );
			// read back inside a fresh animation frame, right after drawing: a WebGPU canvas only holds
			// the current frame until the browser presents it
			await nextFrame();
			present( frame );

		},
		start() {

			if ( running ) return;
			running = true;
			const t0 = performance.now();
			renderer.setAnimationLoop( () => {

				const t = ( performance.now() - t0 ) / 1000;
				guard( () => setTime( ( t / duration ) % 1 ) );
				present( Math.floor( t * FPS ) );

			} );

		},
		stop() {

			running = false;
			renderer.setAnimationLoop( null );

		},
		dispose() {

			this.stop();
			pathTracer?.dispose?.();
			scene.traverse( o => {

				if ( ! o.isMesh ) return;
				o.geometry.dispose();
				for ( const m of [ o.material ].flat() ) m.dispose();

			} );
			renderer.dispose();

		},
	};

}

function createGlowFloor( color, intensity ) {

	const c = document.createElement( 'canvas' );
	c.width = c.height = 256;
	const ctx = c.getContext( '2d' );
	const g = ctx.createRadialGradient( 128, 128, 0, 128, 128, 128 );
	g.addColorStop( 0, '#fff' ); g.addColorStop( 0.35, '#888' ); g.addColorStop( 1, '#000' );
	ctx.fillStyle = g; ctx.fillRect( 0, 0, 256, 256 );
	const map = new THREE.CanvasTexture( c );
	map.colorSpace = THREE.SRGBColorSpace;
	const mat = new THREE.MeshStandardMaterial( { color: '#000', roughness: 1, emissive: color, emissiveIntensity: intensity, emissiveMap: map } );
	const m = new THREE.Mesh( new THREE.PlaneGeometry( 3.2, 0.9 ), mat );
	m.rotation.x = - Math.PI / 2; // face up
	m.position.set( 0, - 1.45, 0.3 );
	return m;

}
