export const scene = { accent: '#38bdf8', duration: 4, fit: { scale: 0.9 } };

export function object( { THREE, mat, geo, TAU } ) {

	const shape = geo.roundedRect( new THREE.Shape(), 0.35, 0.35, 0.1 );
	const cube = new THREE.Mesh( geo.bevelExtrude( shape, { depth: 0.4 } ), mat.body() );
	const mesh = new THREE.Group();
	mesh.add( cube );
	mesh.position.z = 0.5;
	return { mesh, update( phase ) { cube.rotation.y = 0.4 * Math.sin( phase * TAU ); } };

}
