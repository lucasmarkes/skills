export function object( { THREE, mat } ) {

	return { mesh: new THREE.Mesh( new THREE.SphereGeometry( 0.3 ), mat.body() ), update() {} };

}
