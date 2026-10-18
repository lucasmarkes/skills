export const scene = { accent: '#38bdf8', duration: 4 };

export function object( { THREE, mat, theme } ) {

	const roles = { body: mat.body(), chrome: mat.chrome(), glass: mat.glass(), inlay: mat.inlay(), glow: mat.glow( 2 ), light: mat.light( 1 ) };
	globalThis.__roles = Object.fromEntries( Object.entries( roles ).map( ( [ k, m ] ) => [ k, m.color.getHexString() ] ) );
	const mesh = new THREE.Group();
	for ( const m of Object.values( roles ) ) mesh.add( new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), m ) );
	return { mesh, update() {} };

}
