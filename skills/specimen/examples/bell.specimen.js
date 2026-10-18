// Notification bell: a lathe-turned bell that rings twice per loop (damped swing around its top), a
// chrome clapper that lags behind, and a glowing badge that pops when it rings.

export const scene = {
	accent: '#3b82f6',
	glow: '#60a5fa',
	duration: 8,
	fit: { scale: 0.9, x: - 0.04, y: 0.05 },
};

export function object( { THREE, mat, geo, TAU, bump, smoothstep } ) {

	// bell profile (radius, height) from the lip up to the crown; pivot at the crown (y = 0):
	// flared lip → concave waist → straight shoulder → round dome
	const H = 0.8;
	const prof = new THREE.SplineCurve( [
		[ 0.5, - 0.8 ], [ 0.43, - 0.74 ], [ 0.35, - 0.62 ], [ 0.315, - 0.46 ], [ 0.295, - 0.3 ],
		[ 0.26, - 0.14 ], [ 0.18, - 0.04 ], [ 0.08, - 0.004 ], [ 0.0005, 0 ],
	].map( ( [ x, y ] ) => new THREE.Vector2( x, y ) ) ).getPoints( 80 );

	// lip roll: a small rounded edge back inside so the bell has wall thickness
	const lip = [];
	for ( let i = 0; i <= 10; i ++ ) {

		const a = Math.PI * ( i / 10 );
		lip.push( new THREE.Vector2( prof[ 0 ].x - 0.028 + 0.028 * Math.cos( a ), - H - 0.028 * Math.sin( a ) ) );

	}

	// inner wall (crown → lip), lip roll (inside → outside), outer wall (lip → crown)
	const inner = prof.slice( 0, 60 ).map( p => new THREE.Vector2( Math.max( p.x - 0.05, 0.0005 ), p.y ) ).reverse();
	const outline = [ ...inner, ...lip.slice().reverse(), ...prof ];
	const body = new THREE.Mesh( geo.lathe( outline, 128 ), mat.body( { side: THREE.DoubleSide } ) );

	// crown loop
	const loop = new THREE.Mesh( new THREE.TorusGeometry( 0.065, 0.022, 16, 48 ), mat.body() );
	loop.position.y = 0.06;

	// clapper: chrome ball on a short rod, hangs from the inside of the crown
	const clapperPivot = new THREE.Group();
	clapperPivot.position.y = - 0.2;
	const rod = new THREE.Mesh( new THREE.CylinderGeometry( 0.012, 0.012, 0.6, 12 ), mat.chrome() );
	rod.position.y = - 0.3;
	const ball = new THREE.Mesh( new THREE.SphereGeometry( 0.075, 48, 32 ), mat.chrome() );
	ball.position.y = - 0.64;
	clapperPivot.add( rod, ball );

	const swing = new THREE.Group(); // pivot at the crown
	swing.add( body, loop, clapperPivot );
	swing.position.y = 0.42;

	// notification badge: glossy dot with an emissive core, top right
	const badgeMat = mat.glow( 2 );
	const badge = new THREE.Mesh( new THREE.SphereGeometry( 0.1, 48, 32 ), badgeMat );
	badge.position.set( 0.4, 0.28, 0.32 );

	const mesh = new THREE.Group();
	mesh.add( swing, badge );
	mesh.position.set( - 0.02, - 0.02, 0.5 );
	mesh.scale.setScalar( 1.12 );
	mesh.rotation.x = 0.12; // tilt the mouth slightly towards the camera

	function update( phase ) {

		// two rings per loop: damped swing, with silence in between
		const w = ( phase * 2 ) % 1;
		const env = w < 0.7 ? Math.exp( - w * 5 ) * smoothstep( w, 0, 0.04 ) * ( 1 - smoothstep( w, 0.55, 0.7 ) ) : 0;
		swing.rotation.z = 0.32 * env * Math.sin( w * TAU * 5 );
		clapperPivot.rotation.z = - 1.6 * 0.32 * env * Math.sin( w * TAU * 5 - 0.9 ); // lags and overshoots
		mesh.rotation.y = 0.15 * Math.sin( phase * TAU );

		// badge pops on each strike and glows, then settles
		badge.scale.setScalar( 1 + 0.35 * bump( w, 0.06, 0.05 ) );
		badgeMat.emissiveIntensity = 1.1 + 2.2 * bump( w, 0.08, 0.12 );

	}

	return { mesh, update };

}
