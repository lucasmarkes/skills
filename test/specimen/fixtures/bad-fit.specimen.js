export const scene = { accent: '#38bdf8', duration: 4, fit: { scale: 2.2 } };

export function object( { THREE, mat } ) {

	const mesh = new THREE.Mesh( new THREE.SphereGeometry( 0.4, 48, 24 ), mat.body() );
	mesh.position.z = 0.5;
	return { mesh, update() {} };

}
