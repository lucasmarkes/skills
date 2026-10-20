// Padlock: a chunky body, a chrome shackle that pops up and swings open once per loop, and a keyhole
// that lights up while the lock is open.

export const scene = {
	accent: '#f43f5e',
	glow: '#fb7185',
	duration: 8,
	fit: { scale: 0.82, y: - 0.083 },
};

export function object( { THREE, mat, geo, TAU, smoothstep } ) {

	const W = 0.44, H = 0.34, D = 0.26, LIFT = 0.09;

	// body
	const bodyGeo = new THREE.ExtrudeGeometry( geo.roundedRect( new THREE.Shape(), W, H, 0.15 ), {
		depth: D, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 12, curveSegments: 32,
	} );
	bodyGeo.translate( 0, 0, - D / 2 );
	const body = new THREE.Mesh( bodyGeo, mat.body( { finish: 'brushed', finishRepeat: 5 } ) );
	const front = D / 2 + 0.06;

	// keyhole: round head + tapered slot, inset into a chrome ring on the front face
	const keyMat = mat.glow( 0.4, { roughness: 0.4, clearcoat: 0 } );
	const kh = new THREE.Shape();
	kh.absarc( 0, 0.03, 0.055, - 0.35 * Math.PI, 1.35 * Math.PI, false );
	kh.lineTo( - 0.04, - 0.13 );
	kh.lineTo( 0.04, - 0.13 );
	kh.closePath();
	const key = new THREE.Mesh( new THREE.ShapeGeometry( kh, 24 ), keyMat );
	key.position.z = front + 0.002;
	const ring = new THREE.Mesh( new THREE.TorusGeometry( 0.135, 0.018, 16, 64 ), mat.chrome() );
	ring.position.set( 0, - 0.02, front );

	// shackle: U-shaped tube; legs sit at ±R, pivot on the right leg
	const R = 0.27, legY = H - 0.05, legH = 0.22, rad = 0.065;
	const path = new THREE.CurvePath();
	path.add( new THREE.LineCurve3( new THREE.Vector3( - R, legY - 0.12, 0 ), new THREE.Vector3( - R, legY + legH, 0 ) ) );
	const arc = new THREE.EllipseCurve( 0, legY + legH, R, R, Math.PI, 0, true );
	path.add( new THREE.CatmullRomCurve3( arc.getPoints( 48 ).map( p => new THREE.Vector3( p.x, p.y, 0 ) ) ) );
	path.add( new THREE.LineCurve3( new THREE.Vector3( R, legY + legH, 0 ), new THREE.Vector3( R, legY - 0.12, 0 ) ) );
	const shackleGeo = new THREE.TubeGeometry( path, 200, rad, 24, false );
	shackleGeo.translate( - R, 0, 0 );
	const shackle = new THREE.Mesh( shackleGeo, mat.chrome( { roughness: 0.12 } ) );
	const pivot = new THREE.Group();
	pivot.position.x = R;
	pivot.add( shackle );

	const mesh = new THREE.Group();
	mesh.add( body, ring, key, pivot );
	mesh.position.set( 0, - 0.12, 0.45 );

	const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow( - 2 * t + 2, 3 ) / 2;

	function update( phase ) {

		mesh.rotation.y = - 0.3 + 0.18 * Math.sin( phase * TAU );
		mesh.rotation.x = 0.06 * Math.sin( phase * TAU + 0.8 );
		mesh.position.y = - 0.12 + 0.02 * Math.sin( phase * TAU * 2 );

		// closed → pop up → swing open → hold → swing back → drop and click shut
		const lift = ease( smoothstep( phase, 0.08, 0.2 ) ) - ease( smoothstep( phase, 0.78, 0.88 ) );
		const swing = ease( smoothstep( phase, 0.18, 0.36 ) ) - ease( smoothstep( phase, 0.64, 0.8 ) );
		const click = phase > 0.88 ? Math.exp( - ( phase - 0.88 ) * 40 ) : 0;
		pivot.position.y = LIFT * lift - 0.012 * click;
		pivot.rotation.y = - 1.1 * swing;

		keyMat.emissiveIntensity = 0.35 + 3.2 * Math.max( lift, swing ) + 1.5 * click;

	}

	return { mesh, update };

}
