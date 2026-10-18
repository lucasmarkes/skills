import * as THREE from 'three/webgpu';

// Procedural studio HDRI: black void with a few soft boxes.
// Directions follow three.js equirect convention: u = atan(z, x) / 2PI + 0.5, v = asin(y) / PI + 0.5.

function softbox( dir, center, right, up, halfW, halfH, soft ) {

	const d = dir.dot( center );
	if ( d <= 0 ) return 0;
	// project onto the plane facing the box (gnomonic), in tangent units
	const x = dir.dot( right ) / d;
	const y = dir.dot( up ) / d;
	const fx = 1 - THREE.MathUtils.smoothstep( Math.abs( x ), halfW - soft, halfW + soft );
	const fy = 1 - THREE.MathUtils.smoothstep( Math.abs( y ), halfH - soft, halfH + soft );
	return fx * fy;

}

function makeBox( centerDir, roll, halfW, halfH, soft, color, intensity ) {

	const center = centerDir.clone().normalize();
	const worldUp = Math.abs( center.y ) > 0.95 ? new THREE.Vector3( 0, 0, 1 ) : new THREE.Vector3( 0, 1, 0 );
	const right = new THREE.Vector3().crossVectors( worldUp, center ).normalize();
	const up = new THREE.Vector3().crossVectors( center, right ).normalize();
	right.applyAxisAngle( center, roll );
	up.applyAxisAngle( center, roll );
	return { center, right, up, halfW, halfH, soft, color: new THREE.Color( color ), intensity };

}

export function createStudioEnvironment( accent, { fakeAccentBounce = 0, accentFloor = 2.5, ambient = 0, key = 6 } = {} ) {

	const W = 1024, H = 512;
	const data = new Uint16Array( W * H * 4 );
	const half = THREE.DataUtils.toHalfFloat;

	const boxes = [
		// key: large soft box above, right and slightly behind → highlight hugging the top-right rim
		makeBox( new THREE.Vector3( 0.6, 0.75, - 0.3 ), 0.6, 0.75, 0.45, 0.4, '#ffffff', key ),
		// broad dim box top-left → soft gray reflections on the shadow side, keeps the rings readable
		makeBox( new THREE.Vector3( - 0.8, 0.6, 0.4 ), - 0.4, 1.1, 0.8, 0.7, '#ffffff', 0.8 ),
		// very faint front fill so the black surfaces keep some shape
		makeBox( new THREE.Vector3( 0, 0.2, 1 ), 0, 1.2, 0.6, 0.6, '#ffffff', 0.25 ),
	];

	// soft purple glow straight below the sphere: the sphere's glossy underside mirrors it as a smooth
	// gradient cap, and the tile's bottom bevel (facing down) picks it up as a purple edge
	if ( accentFloor > 0 ) boxes.push( makeBox( new THREE.Vector3( 0, - 1, 0.15 ), 0, 0.7, 0.45, 0.4, accent, accentFloor ) );

	// Raster has no reflections between objects, so fake the purple glow the sphere would pick up
	// from the lit tile underneath it. The path tracer gets this for free and must not double it.
	if ( fakeAccentBounce ) boxes.push( makeBox( new THREE.Vector3( 0, - 1, - 0.5 ), 0, 0.6, 0.22, 0.25, accent, 14 * fakeAccentBounce ) ); // number = strength scale

	const dir = new THREE.Vector3();
	for ( let j = 0; j < H; j ++ ) {

		const v = ( j + 0.5 ) / H;
		const lat = ( v - 0.5 ) * Math.PI;
		for ( let i = 0; i < W; i ++ ) {

			const u = ( i + 0.5 ) / W;
			const phi = ( u - 0.5 ) * 2 * Math.PI;
			dir.set( Math.cos( phi ) * Math.cos( lat ), Math.sin( lat ), Math.sin( phi ) * Math.cos( lat ) );

			// light theme: a soft white studio instead of a black void, brighter overhead than below
			const amb = ambient * ( 0.3 + 0.7 * Math.max( dir.y, 0 ) ); // darker below → form shadow on light heroes
			let r = amb, g = amb, b = amb;
			for ( const bx of boxes ) {

				const k = softbox( dir, bx.center, bx.right, bx.up, bx.halfW, bx.halfH, bx.soft ) * bx.intensity;
				r += bx.color.r * k; g += bx.color.g * k; b += bx.color.b * k;

			}

			const o = ( j * W + i ) * 4;
			data[ o ] = half( r ); data[ o + 1 ] = half( g ); data[ o + 2 ] = half( b ); data[ o + 3 ] = half( 1 );

		}

	}

	const tex = new THREE.DataTexture( data, W, H, THREE.RGBAFormat, THREE.HalfFloatType ); // float32 is not filterable in WebGPU
	tex.mapping = THREE.EquirectangularReflectionMapping;
	tex.colorSpace = THREE.LinearSRGBColorSpace;
	tex.minFilter = THREE.LinearFilter;
	tex.magFilter = THREE.LinearFilter;
	tex.generateMipmaps = false;
	tex.needsUpdate = true;
	return tex;

}
