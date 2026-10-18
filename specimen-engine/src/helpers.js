import * as THREE from 'three/webgpu';

// Building blocks a piece gets through ctx: geometry helpers, the one dynamic texture, static
// gradients and the animation helpers.

export const TAU = Math.PI * 2;
export const bump = ( x, c, w ) => Math.exp( - Math.pow( ( x - c ) / w, 2 ) );
export const smoothstep = THREE.MathUtils.smoothstep;

// mulberry32: a repeatable random stream
export function seeded( seed ) {

	let a = seed >>> 0;
	return () => {

		a = ( a + 0x6d2b79f5 ) >>> 0;
		let t = a;
		t = Math.imul( t ^ ( t >>> 15 ), t | 1 );
		t ^= t + Math.imul( t ^ ( t >>> 7 ), t | 61 );
		return ( ( t ^ ( t >>> 14 ) ) >>> 0 ) / 4294967296;

	};

}

// w, h are half extents; works on a Shape or a Path (for holes)
export function roundedRect( s, w, h, r ) {

	s.moveTo( - w + r, - h );
	s.lineTo( w - r, - h );
	s.quadraticCurveTo( w, - h, w, - h + r );
	s.lineTo( w, h - r );
	s.quadraticCurveTo( w, h, w - r, h );
	s.lineTo( - w + r, h );
	s.quadraticCurveTo( - w, h, - w, h - r );
	s.lineTo( - w, - h + r );
	s.quadraticCurveTo( - w, - h, - w + r, - h );
	return s;

}

// planar uv from x/y position, 0..1 across [-w, w] x [-h, h] (sides inherit the face mapping)
export function planarUV( geo, w, h ) {

	const pos = geo.attributes.position, uv = geo.attributes.uv;
	for ( let i = 0; i < uv.count; i ++ ) uv.setXY( i, pos.getX( i ) / ( 2 * w ) + 0.5, pos.getY( i ) / ( 2 * h ) + 0.5 );
	return geo;

}

// revolve a profile of [x, y] pairs (or Vector2s) around +Y
export function lathe( profile, segments = 96 ) {

	return new THREE.LatheGeometry( profile.map( p => p.isVector2 ? p : new THREE.Vector2( p[ 0 ], p[ 1 ] ) ), segments );

}

// extrude a shape with soft rounded edges, centred on z = 0 (the bevel included)
export function bevelExtrude( shape, { depth = 0.16, bevel = 0.06, segments = 12, curveSegments = 24 } = {} ) {

	const geo = new THREE.ExtrudeGeometry( shape, {
		depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.8, bevelSegments: segments, curveSegments,
	} );
	geo.translate( 0, 0, - depth / 2 );
	return geo;

}

// canvas texture redrawn by fn(u, v) → [r, g, b] in 0..1; returns { tex, draw }
export function proceduralTexture( W, H ) {

	const c = document.createElement( 'canvas' );
	c.width = W; c.height = H;
	const ctx = c.getContext( '2d' );
	const img = ctx.createImageData( W, H );
	const tex = new THREE.CanvasTexture( c );
	tex.flipY = false;
	tex.colorSpace = THREE.SRGBColorSpace;

	function draw( fn ) {

		for ( let j = 0; j < H; j ++ ) for ( let i = 0; i < W; i ++ ) {

			const [ r, g, b ] = fn( ( i + 0.5 ) / W, ( j + 0.5 ) / H ); // flipY false: row j ↔ v
			const o = ( j * W + i ) * 4;
			img.data[ o ] = Math.min( 255, Math.max( 0, 255 * r ) );
			img.data[ o + 1 ] = Math.min( 255, Math.max( 0, 255 * g ) );
			img.data[ o + 2 ] = Math.min( 255, Math.max( 0, 255 * b ) );
			img.data[ o + 3 ] = 255;

		}

		ctx.putImageData( img, 0, 0 );
		tex.needsUpdate = true;

	}

	return { tex, draw };

}

// static vertical gradient, top (t = 0) → bottom (t = 1); stops are [t, css colour]
export function gradient( stops, { srgb = true } = {} ) {

	const c = document.createElement( 'canvas' );
	c.width = 4; c.height = 256;
	const ctx = c.getContext( '2d' );
	const g = ctx.createLinearGradient( 0, 0, 0, 256 );
	for ( const [ t, col ] of stops ) g.addColorStop( t, typeof col === 'string' ? col : '#' + new THREE.Color( col ).getHexString() );
	ctx.fillStyle = g; ctx.fillRect( 0, 0, 4, 256 );
	const tex = new THREE.CanvasTexture( c );
	tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
	return tex;

}
