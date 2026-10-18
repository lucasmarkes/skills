export const scene = { accent: '#38bdf8', duration: 4 };

export function object( { THREE, mat, texture } ) {

	texture( 8, 8 );
	texture( 8, 8 );
	return { mesh: new THREE.Mesh( new THREE.SphereGeometry( 0.3 ), mat.body() ), update() {} };

}
