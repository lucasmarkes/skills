// Thick, soft-bevelled lightning bolt. A charge of light runs down through it twice per loop and
// pools in the tip; the bolt turns a little so its bevels catch the key light.

export const scene = {
	accent: '#eab308',
	glow: '#fde047',
	duration: 8,
	fit: { scale: 0.8 },
	// the thin studio strips swept through the inner bevels as the bolt turns and flickered there as a
	// sub-pixel line; the key light alone still traces the edges
	lights: { strips: 0 },
};

export function object( { THREE, mat, geo, texture, glow, TAU, bump, smoothstep } ) {

	const S = 1.22;

	// bolt outline (y up), roughly 0.9 wide x 1.3 tall
	const P = [ [ 0.12, 0.66 ], [ - 0.36, - 0.06 ], [ - 0.04, - 0.06 ], [ - 0.16, - 0.66 ], [ 0.36, 0.12 ], [ 0.04, 0.12 ] ];
	const shape = new THREE.Shape();
	P.forEach( ( [ x, y ], i ) => i ? shape.lineTo( x * S, y * S ) : shape.moveTo( x * S, y * S ) );
	shape.closePath();

	const g = geo.bevelExtrude( shape, { depth: 0.16, bevel: 0.08, segments: 12, curveSegments: 4 } );
	geo.planarUV( g, 0.4 * S, 0.7 * S );

	const charge = texture( 64, 256 );
	const bolt = new THREE.Mesh( g, mat.body( { emissiveMap: charge.tex, emissiveIntensity: 3, finish: 'gloss' } ) );

	const mesh = new THREE.Group();
	mesh.add( bolt );
	mesh.position.set( 0, 0, 0.45 );

	function update( phase ) {

		mesh.rotation.y = 0.32 * Math.sin( phase * TAU );
		mesh.rotation.x = 0.08 * Math.sin( phase * TAU * 2 + 0.6 );
		mesh.position.y = 0.025 * Math.sin( phase * TAU * 2 );

		// two charges per loop: a short band of light runs top → bottom, then its energy pools in the
		// tip and fades out. Every term is continuous and ~0 at the loop seam, so nothing pops.
		const w = ( phase * 2 ) % 1;
		const head = THREE.MathUtils.lerp( 1.2, - 0.2, smoothstep( w, 0.04, 0.58 ) );
		const env = smoothstep( w, 0.0, 0.08 ) * ( 1 - smoothstep( w, 0.48, 0.62 ) ); // band fades in and out
		const pool = Math.pow( smoothstep( w, 0.42, 0.6 ), 2 ) * ( 1 - smoothstep( w, 0.62, 0.98 ) ); // swell, then a long fade
		charge.draw( ( u, v ) => {

			const d = v - head; // band head with a short trail above it
			const band = d < 0 ? bump( d, 0, 0.06 ) : Math.exp( - d / 0.12 );
			const tip = Math.exp( - v / 0.22 ); // brightest at the bottom tip, gone by mid-bolt
			const base = 0.05 + 0.22 * Math.pow( 1 - v, 3 ); // embers pooled at the tip
			const k = band * env * 0.9 + tip * pool * 0.45 + base;
			return [ glow.r * k, glow.g * k, glow.b * k ];

		} );

	}

	return { mesh, update };

}
