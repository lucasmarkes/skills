import * as THREE from 'three/webgpu';
import { seeded } from './helpers.js';

function roundedRectShape( size, radius ) {

	const h = size / 2, r = radius;
	const s = new THREE.Shape();
	s.moveTo( - h + r, - h );
	s.lineTo( h - r, - h );
	s.quadraticCurveTo( h, - h, h, - h + r );
	s.lineTo( h, h - r );
	s.quadraticCurveTo( h, h, h - r, h );
	s.lineTo( - h + r, h );
	s.quadraticCurveTo( - h, h, - h, h - r );
	s.lineTo( - h, - h + r );
	s.quadraticCurveTo( - h, - h, - h + r, - h );
	return s;

}

// Fine grain baked into the tile's roughness + albedo, like the noisy satin finish in the references.
function grainTexture( size = 512 ) {

	const c = document.createElement( 'canvas' );
	c.width = c.height = size;
	const ctx = c.getContext( '2d' );
	const img = ctx.createImageData( size, size );
	const rand = seeded( 7 ); // the same grain every run, so frames and checks are repeatable
	for ( let i = 0; i < size * size; i ++ ) {

		const n = 170 + rand() * 85;
		img.data[ i * 4 ] = img.data[ i * 4 + 1 ] = img.data[ i * 4 + 2 ] = n;
		img.data[ i * 4 + 3 ] = 255;

	}

	ctx.putImageData( img, 0, 0 );
	const tex = new THREE.CanvasTexture( c );
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set( 3, 3 );
	return tex;

}

function sheenTexture( size = 256 ) {

	const c = document.createElement( 'canvas' );
	c.width = c.height = size;
	const ctx = c.getContext( '2d' );
	const tex = new THREE.CanvasTexture( c );
	tex.flipY = false;
	tex.colorSpace = THREE.SRGBColorSpace;
	let last = null;

	function draw( center ) {

		// band perpendicular to the (1,1) diagonal; center = position along it in uv units
		if ( center === last ) return;
		last = center;
		const img = ctx.createImageData( size, size );
		for ( let j = 0; j < size; j ++ ) for ( let i = 0; i < size; i ++ ) {

			const u = ( i + 0.5 ) / size, v = ( j + 0.5 ) / size; // flipY false: row j ↔ v
			const d = ( u + v ) / 2 - center;
			const k = Math.exp( - ( d * d ) / ( 2 * 0.07 * 0.07 ) ) + 0.6 * Math.exp( - ( d * d ) / ( 2 * 0.2 * 0.2 ) );
			const e = Math.round( 255 * Math.min( k / 1.6, 1 ) );
			const o = ( j * size + i ) * 4;
			img.data[ o ] = img.data[ o + 1 ] = img.data[ o + 2 ] = e; img.data[ o + 3 ] = 255;

		}

		ctx.putImageData( img, 0, 0 );
		tex.needsUpdate = true;

	}

	return { tex, draw };

}

export function createTile( spec ) {

	const { size, cornerRadius, depth, color } = spec;
	const bevel = 0.05;
	const shape = roundedRectShape( size - bevel * 2, Math.max( cornerRadius - bevel, 0.01 ) );
	const geo = new THREE.ExtrudeGeometry( shape, {
		depth: depth - bevel * 2,
		bevelEnabled: true,
		bevelThickness: bevel,
		bevelSize: bevel,
		bevelSegments: 8,
		curveSegments: 48,
	} );
	geo.translate( 0, 0, - depth + bevel );
	geo.computeVertexNormals();

	// ExtrudeGeometry uvs are raw shape coordinates; remap to 0..1 across the tile face
	const pos = geo.attributes.position, uv = geo.attributes.uv;
	for ( let i = 0; i < uv.count; i ++ ) uv.setXY( i, pos.getX( i ) / size + 0.5, pos.getY( i ) / size + 0.5 );

	const grain = grainTexture();
	const mat = new THREE.MeshPhysicalMaterial( {
		color,
		map: grain,
		roughness: 0.7,
		roughnessMap: grain,
		metalness: 0,
		clearcoat: 0.15,
		clearcoatRoughness: 0.4,
	} );

	// sheen: a soft diagonal band of light that sweeps across the tile once per loop. Done as an
	// emissive map rather than a light so it doesn't streak across the glossy sphere.
	const sheen = sheenTexture();
	mat.emissive = new THREE.Color( '#ffffff' );
	mat.emissiveMap = sheen.tex;
	mat.emissiveIntensity = spec.sheenIntensity ?? 0.06;

	const mesh = new THREE.Mesh( geo, mat );
	mesh.name = 'tile';

	function update( phase ) {

		// sweep from the bottom-left corner to the top-right during the second half of the loop
		const s = THREE.MathUtils.smoothstep( phase, 0.4, 0.95 );
		sheen.draw( THREE.MathUtils.lerp( - 0.45, 1.45, s ) );

	}

	return { mesh, update };

}
