// Microchip: a package with chrome pins on every side and a glass die in the middle where square
// pulses of light ripple outward along a fine grid, twice per loop.

export const scene = {
	accent: '#84cc16',
	glow: '#a3e635',
	duration: 8,
	fit: { scale: 0.9 },
};

export function object( { THREE, mat, geo, texture, glow, TAU } ) {

	const B = 0.4, T = 0.08; // package half size, thickness

	const ext = { depth: T, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 8, curveSegments: 24 };
	const bodyGeo = new THREE.ExtrudeGeometry( geo.roundedRect( new THREE.Shape(), B, B, 0.09 ), ext );
	bodyGeo.translate( 0, 0, - T / 2 );
	const body = new THREE.Mesh( bodyGeo, mat.body( { finish: 'speckle', finishRepeat: 4 } ) );
	const top = T / 2 + 0.03;

	// raised frame around the die
	const d = 0.23;
	const frameShape = geo.roundedRect( new THREE.Shape(), d + 0.05, d + 0.05, 0.06 );
	frameShape.holes.push( geo.roundedRect( new THREE.Path(), d, d, 0.035 ) );
	const frame = new THREE.Mesh( new THREE.ExtrudeGeometry( frameShape, { ...ext, depth: 0.02, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 4 } ), mat.body( { finish: 'brushed', finishRepeat: 8 } ) );
	frame.position.z = top;

	// die: glossy dark glass with the pulse texture as emission
	const pulse = texture( 256, 256 );
	const dieGeo = geo.planarUV( new THREE.ShapeGeometry( geo.roundedRect( new THREE.Shape(), d + 0.005, d + 0.005, 0.035 ), 16 ), d, d );
	const die = new THREE.Mesh( dieGeo, mat.glass( { emissiveMap: pulse.tex, emissiveIntensity: 1.6 } ) );
	die.position.z = top + 0.006;

	// pins: 5 per side, rounded chrome tabs
	const pinGeo = new THREE.CapsuleGeometry( 0.026, 0.1, 6, 16 );
	pinGeo.rotateZ( Math.PI / 2 );
	const pinMat = mat.chrome();
	const pins = new THREE.Group();
	for ( let s = 0; s < 4; s ++ ) for ( let i = 0; i < 5; i ++ ) {

		const p = new THREE.Mesh( pinGeo, pinMat );
		const k = ( i - 2 ) * 0.14;
		const a = s * Math.PI / 2;
		const r = B + 0.07;
		p.position.set( Math.cos( a ) * r - Math.sin( a ) * k, Math.sin( a ) * r + Math.cos( a ) * k, 0 );
		p.rotation.z = a;
		pins.add( p );

	}

	const mesh = new THREE.Group();
	mesh.add( body, frame, die, pins );
	mesh.position.set( 0, 0.02, 0.4 );
	mesh.scale.setScalar( 1.18 );

	const N = 8; // grid cells across the die

	function update( phase ) {

		mesh.rotation.x = - 0.55 + 0.06 * Math.sin( phase * TAU );
		mesh.rotation.z = 0.12 * Math.sin( phase * TAU + 0.5 );
		mesh.rotation.y = 0.14 * Math.sin( phase * TAU );
		mesh.position.y = 0.02 + 0.02 * Math.sin( phase * TAU * 2 );

		const w = ( phase * 2 ) % 1;
		pulse.draw( ( u, v ) => {

			const x = u - 0.5, y = v - 0.5;
			const r = Math.max( Math.abs( x ), Math.abs( y ) ) * 2; // 0 centre → 1 edge (square rings)
			const gx = Math.abs( ( ( u * N ) % 1 ) - 0.5 ), gy = Math.abs( ( ( v * N ) % 1 ) - 0.5 );
			const grid = Math.pow( Math.max( gx, gy ) * 2, 14 ); // thin lines
			const ring = Math.exp( - Math.pow( ( r - w * 1.3 ) / 0.07, 2 ) ); // pulse front
			const wake = Math.exp( - Math.pow( ( r - w * 1.3 + 0.18 ) / 0.12, 2 ) ) * 0.35;
			const core = Math.exp( - r * r / 0.02 ) * ( 0.6 + 0.4 * Math.cos( w * TAU ) );
			const k = grid * ( 0.12 + 1.1 * ( ring + wake ) ) + ring * 0.25 + core * 0.9 + 0.03;
			return [ glow.r * k, glow.g * k, glow.b * k ];

		} );

	}

	return { mesh, update };

}
