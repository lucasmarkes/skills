import * as THREE from 'three/webgpu';

// Surface finishes a piece can ask any role for: mat.body( { finish: 'brushed' } ). Each is a set of
// physical values plus, for the textured ones, a static tiling map made once and shared. Values the
// piece passes itself still win over the finish.

const smooth = THREE.MathUtils.smoothstep;

// n×n tiling map from a height fn(u, v) → 0..1; as a normal map (from its slope) or a grey value map
function tile( n, fn, normal ) {

	const d = new Uint8Array( n * n * 4 );
	const h = ( x, y ) => fn( ( ( x % n ) + n ) % n / n, ( ( y % n ) + n ) % n / n );
	for ( let y = 0; y < n; y ++ ) for ( let x = 0; x < n; x ++ ) {

		const o = ( y * n + x ) * 4;
		if ( normal ) {

			const dx = ( h( x + 1, y ) - h( x - 1, y ) ) * 2, dy = ( h( x, y + 1 ) - h( x, y - 1 ) ) * 2, l = Math.hypot( dx, dy, 1 );
			d[ o ] = ( - dx / l * 0.5 + 0.5 ) * 255; d[ o + 1 ] = ( - dy / l * 0.5 + 0.5 ) * 255; d[ o + 2 ] = ( 1 / l * 0.5 + 0.5 ) * 255;

		} else d[ o ] = d[ o + 1 ] = d[ o + 2 ] = h( x, y ) * 255;
		d[ o + 3 ] = 255;

	}
	const t = new THREE.DataTexture( d, n, n );
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	t.magFilter = t.minFilter = THREE.LinearFilter;
	t.needsUpdate = true;
	return t;

}

let maps;
function textures() {

	if ( maps ) return maps;
	let s = 7;
	const rnd = () => ( s = ( s * 16807 ) % 2147483647 ) / 2147483647;
	const grain = Array.from( { length: 128 * 128 }, () => rnd() < 0.18 ? 0.15 : 0.7 );
	maps = {
		// a grid of round holes; repeat sets the pitch in the geometry's UV units
		perforated: tile( 64, ( u, v ) => 1 - smooth( Math.hypot( ( u * 4 % 1 ) - 0.5, ( v * 4 % 1 ) - 0.5 ), 0.18, 0.3 ), true ),
		// fine wavering lines along u
		brushed: tile( 128, ( u, v ) => 0.5 + 0.5 * Math.sin( v * 128 * 2.7 + Math.sin( v * 40 ) * 3 ), true ),
		// sparse glints in a rough field
		speckle: tile( 128, ( u, v ) => grain[ Math.round( v * 128 ) % 128 * 128 + Math.round( u * 128 ) % 128 ] ),
	};
	return maps;

}

// repeat: how many tiles per UV unit; pieces built from extruded shapes have UVs in scene units
export function finish( name, repeat = 10 ) {

	const rep = t => { const c = t.clone(); c.repeat.set( repeat, repeat ); c.needsUpdate = true; return c; };
	switch ( name ) {

		case undefined: return {};
		case 'gloss': return { roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 };
		case 'matte': return { roughness: 0.8, clearcoat: 0 };
		case 'brushed': return { metalness: 1, roughness: 0.32, normalMap: rep( textures().brushed ), normalScale: new THREE.Vector2( 0.07, 0.07 ) };
		case 'perforated': return { metalness: 0.85, roughness: 0.42, clearcoat: 0, normalMap: rep( textures().perforated ), normalScale: new THREE.Vector2( 1.2, 1.2 ) };
		case 'speckle': return { metalness: 0.7, roughness: 0.5, clearcoat: 0.6, roughnessMap: rep( textures().speckle ) };
		default: throw new Error( `finish "${ name }": use gloss, matte, brushed, perforated or speckle` );

	}

}
