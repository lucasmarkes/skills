// Rocket flying diagonally up-right: ogive body, three swept fins, a glowing porthole, chrome band and
// nozzle, and a flickering flame that also lights the tile in path tracing. One barrel roll per loop.

export const scene = {
	accent: '#f97316',
	glow: '#ff8a3d', // flame colour
	duration: 8,
	fit: { scale: 0.95 },
	lights: { accent: 2.5, underFill: 4 },
};

export function object( { THREE, mat, geo, gradient, glow, TAU } ) {

	const R = 0.21;
	const black = mat.body( { roughness: 0.22 } );
	const chrome = mat.chrome( { finish: 'brushed', finishRepeat: 4 } );

	// body: ogive nose blending into a slightly tapered tail, revolved around +Y
	const prof = [];
	const yTail = - 0.5, yTip = 0.62, c0 = - 0.12, L = yTip - c0;
	for ( let i = 0; i <= 64; i ++ ) {

		const y = THREE.MathUtils.lerp( yTail, yTip, i / 64 );
		const r = R * Math.sqrt( Math.max( 0, 1 - Math.pow( ( y - c0 ) / ( y > c0 ? L : 0.75 ), 2 ) ) );
		prof.push( [ Math.max( r, i === 64 ? 0 : 0.001 ), y ] );

	}

	prof.unshift( [ 0, yTail ] );
	const body = new THREE.Mesh( geo.lathe( prof, 96 ), black );

	const ship = new THREE.Group(); // spins around its own long axis
	ship.add( body );

	// chrome band near the tail
	const band = new THREE.Mesh( new THREE.TorusGeometry( R * 0.93, 0.014, 16, 96 ), chrome );
	band.rotation.x = Math.PI / 2; band.position.y = - 0.34;
	ship.add( band );

	// porthole: chrome ring + warm glowing glass
	const port = new THREE.Group();
	port.position.set( 0, 0.14, 0 );
	const zr = R * Math.sqrt( 1 - Math.pow( ( 0.14 - c0 ) / L, 2 ) );
	const ring = new THREE.Mesh( new THREE.TorusGeometry( 0.075, 0.018, 16, 64 ), chrome );
	ring.position.z = zr - 0.004;
	const glass = new THREE.Mesh( new THREE.CircleGeometry( 0.07, 48 ), mat.light( 1.4 ) );
	glass.position.z = zr + 0.003; // flat disc on a curved hull: its rim tucks under the ring
	port.add( ring, glass );
	ship.add( port );

	// nozzle: short chrome bell under the tail
	const bell = [];
	for ( let i = 0; i <= 16; i ++ ) {

		const t = i / 16;
		bell.push( [ 0.085 + 0.045 * t * t, yTail - 0.11 * t ] );

	}

	ship.add( new THREE.Mesh( geo.lathe( bell, 64 ), chrome ) );

	// fins: swept back, extruded thin with rounded bevels
	const fs = new THREE.Shape();
	fs.moveTo( 0, 0.02 );
	fs.bezierCurveTo( 0.12, - 0.02, 0.2, - 0.12, 0.22, - 0.3 );
	fs.lineTo( 0.2, - 0.34 );
	fs.bezierCurveTo( 0.14, - 0.27, 0.06, - 0.26, 0, - 0.24 );
	fs.closePath();
	const finGeo = new THREE.ExtrudeGeometry( fs, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.008, bevelSegments: 4, curveSegments: 24 } );
	finGeo.translate( 0, 0, - 0.016 );
	for ( let k = 0; k < 3; k ++ ) {

		const holder = new THREE.Group();
		holder.rotation.y = ( k / 3 ) * TAU + Math.PI / 2;
		const fin = new THREE.Mesh( finGeo, black );
		fin.position.set( R * 0.82, - 0.18, 0 );
		holder.add( fin );
		ship.add( holder );

	}

	// flame: teardrop of light out of the nozzle, white-hot at the root
	const fl = [];
	for ( let i = 0; i <= 32; i ++ ) {

		const t = i / 32; // 0 = root, 1 = tip
		fl.push( [ 0.115 * Math.pow( 1 - t, 0.65 ) + 0.0005, - t * 0.5 ] );

	}

	fl.reverse();
	// lathe uv.v runs tip (0) → root (1); the gradient's top sits at the root
	const flame = new THREE.Mesh( geo.lathe( fl, 48 ), mat.light( 3, {
		roughness: 1, clearcoat: 0, transparent: true, depthWrite: false,
		emissiveMap: gradient( [ [ 0, '#ffffff' ], [ 0.15, '#ffd9b0' ], [ 0.45, glow ], [ 1, '#000000' ] ] ),
		alphaMap: gradient( [ [ 0, '#ffffff' ], [ 0.5, '#bbbbbb' ], [ 1, '#000000' ] ], { srgb: false } ),
	} ) );
	const flameRoot = new THREE.Group();
	flameRoot.position.y = yTail - 0.1;
	flameRoot.add( flame );

	const craft = new THREE.Group(); // ship + flame, pointing along +Y
	craft.add( ship, flameRoot );

	const mesh = new THREE.Group();
	mesh.add( craft );
	mesh.rotation.z = - Math.PI / 4; // fly towards the top-right corner
	mesh.position.set( 0.04, 0.0, 0.5 );
	mesh.scale.setScalar( 1.05 );

	function update( phase ) {

		ship.rotation.y = phase * TAU; // one barrel roll per loop
		// float along the flight axis and sway a little
		craft.position.y = 0.05 * Math.sin( phase * TAU * 2 );
		craft.rotation.z = 0.06 * Math.sin( phase * TAU );
		craft.rotation.x = 0.1 * Math.sin( phase * TAU + 0.8 );
		// flicker: integer harmonics keep the loop seamless
		const f = 1 + 0.12 * Math.sin( phase * TAU * 18 ) + 0.07 * Math.sin( phase * TAU * 31 + 1.3 ) + 0.1 * Math.sin( phase * TAU * 2 * 2 );
		flame.scale.set( 1 - ( f - 1 ) * 0.3, f, 1 - ( f - 1 ) * 0.3 );

	}

	return { mesh, update };

}
