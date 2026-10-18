export const scene = { accent: '#38bdf8', duration: 4 };

export function object( { THREE, mat, geo } ) {

	const shape = geo.roundedRect( new THREE.Shape(), 0.35, 0.35, 0.1 );
	const cube = new THREE.Mesh( geo.bevelExtrude( shape, { depth: 0.4 } ), mat.body() );
	const mesh = new THREE.Group();
	mesh.add( cube );
	mesh.position.z = 0.5;
	// an eighth of a turn per loop: phase 1 does not land where phase 0 started
	return { mesh, update( phase ) { cube.rotation.z = phase * Math.PI / 2 * 0.5; } };

}
