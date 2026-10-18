export const scene = { accent: '#38bdf8', duration: 4, fit: { scale: 0.9 } };

export function object( { THREE, mat } ) {

	const mesh = new THREE.Group();
	const ball = new THREE.Mesh( new THREE.SphereGeometry( 0.3, 48, 24 ), mat.body() );
	ball.position.z = 0.5;
	// a big glowing halo behind the tile, wider than it: its light spills past the tile's edge
	const plane = new THREE.Mesh( new THREE.PlaneGeometry( 4, 4 ), mat.glow( 4, { transparent: true, depthWrite: false } ) );
	plane.position.z = - 1;
	mesh.add( ball, plane );
	return { mesh, update() {} };

}
