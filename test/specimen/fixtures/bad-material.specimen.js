export const scene = { accent: '#38bdf8', duration: 4 };

export function object( { THREE } ) {

	const mesh = new THREE.Mesh( new THREE.SphereGeometry( 0.3 ), new THREE.MeshStandardMaterial( { color: '#222222' } ) );
	mesh.position.z = 0.5;
	return { mesh, update() {} };

}
