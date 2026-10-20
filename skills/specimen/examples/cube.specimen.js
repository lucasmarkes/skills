// Puzzle cube without colours: every sticker is a different finish of the same black (white in light) —
// gloss, matte, brushed metal, perforated plate, speckle — so it reads by how each face takes the light.
// Layers snap a quarter turn four times per loop (top, right, right back, top back): the loop closes solved.

export const scene = {
	accent: '#a1a1aa',
	glow: '#f4f4f5',
	duration: 8,
	fit: { scale: 1.2 },
};

// a static normal or roughness map, n×n texels, from fn(u, v) → value 0..1 (tiled with repeat)
function map( THREE, n, fn, normal ) {

	const d = new Uint8Array( n * n * 4 );
	const h = ( x, y ) => fn( ( ( x % n ) + n ) % n / n, ( ( y % n ) + n ) % n / n );
	for ( let y = 0; y < n; y ++ ) for ( let x = 0; x < n; x ++ ) {

		const o = ( y * n + x ) * 4;
		if ( normal ) {

			const dx = ( h( x + 1, y ) - h( x - 1, y ) ) * 2, dy = ( h( x, y + 1 ) - h( x, y - 1 ) ) * 2;
			const l = Math.hypot( dx, dy, 1 );
			d[ o ] = ( - dx / l * 0.5 + 0.5 ) * 255; d[ o + 1 ] = ( - dy / l * 0.5 + 0.5 ) * 255; d[ o + 2 ] = ( 1 / l * 0.5 + 0.5 ) * 255;

		} else d[ o ] = d[ o + 1 ] = d[ o + 2 ] = fn( x / n, y / n ) * 255;
		d[ o + 3 ] = 255;

	}
	const t = new THREE.DataTexture( d, n, n );
	t.wrapS = t.wrapT = THREE.RepeatWrapping;
	t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
	t.needsUpdate = true;
	return t;

}

export function object( { THREE, mat, geo, smoothstep } ) {

	const P = 0.2, B = 0.022, H = 0.094;
	const cubieGeo = geo.bevelExtrude( geo.roundedRect( new THREE.Shape(), H - B * 0.8, H - B * 0.8, 0.018 ), { depth: 2 * H - 2 * B, bevel: B, segments: 6 } );
	const plateGeo = geo.bevelExtrude( geo.roundedRect( new THREE.Shape(), 0.068, 0.068, 0.012 ), { depth: 0.004, bevel: 0.007, segments: 3 } );

	// the finishes; UVs on the plate run over its own x, y (about ±0.075), so repeat sets the pitch
	const perf = map( THREE, 64, ( u, v ) => { const x = ( u * 4 % 1 ) - 0.5, y = ( v * 4 % 1 ) - 0.5; return 1 - smoothstep( Math.hypot( x, y ), 0.18, 0.3 ); }, true );
	perf.repeat.set( 12, 12 );
	let s = 7;
	const rnd = () => ( s = ( s * 16807 ) % 2147483647 ) / 2147483647;
	const speck = map( THREE, 128, () => rnd() < 0.18 ? 0.15 : 0.7 );
	speck.repeat.set( 3, 3 );
	const brushed = map( THREE, 128, ( u, v ) => 0.5 + 0.5 * Math.sin( v * 128 * 2.7 + Math.sin( v * 40 ) * 3 ), true );
	brushed.repeat.set( 2, 2 );

	const finishes = [
		mat.body( { roughness: 0.06 } ), // gloss
		mat.body( { roughness: 0.06 } ),
		mat.body( { roughness: 0.8, clearcoat: 0 } ), // matte
		mat.body( { metalness: 1, roughness: 0.32, normalMap: brushed, normalScale: new THREE.Vector2( 0.25, 0.25 ) } ), // brushed
		mat.body( { metalness: 0.85, roughness: 0.42, clearcoat: 0, normalMap: perf, normalScale: new THREE.Vector2( 1.2, 1.2 ) } ), // perforated
		mat.body( { metalness: 0.7, roughness: 0.5, roughnessMap: speck, clearcoat: 0.6 } ), // speckle
	];
	const shell = mat.body( { roughness: 0.2 } );

	const cubies = [];
	const puzzle = new THREE.Group();
	let pick = 3;
	for ( let i = - 1; i <= 1; i ++ ) for ( let j = - 1; j <= 1; j ++ ) for ( let k = - 1; k <= 1; k ++ ) {

		if ( ! i && ! j && ! k ) continue;
		const c = new THREE.Group();
		c.add( new THREE.Mesh( cubieGeo, shell ) );
		// a plate on each outward face, each one a finish picked by a fixed sequence
		for ( const [ n, a ] of [ [ i, 'x' ], [ j, 'y' ], [ k, 'z' ] ] ) {

			if ( ! n ) continue;
			pick = ( pick * 7 + 3 ) % 11;
			const m = new THREE.Mesh( plateGeo, finishes[ pick % finishes.length ] );
			const N = new THREE.Vector3( a === 'x' ? n : 0, a === 'y' ? n : 0, a === 'z' ? n : 0 );
			m.quaternion.setFromUnitVectors( new THREE.Vector3( 0, 0, 1 ), N );
			m.position.copy( N ).multiplyScalar( H + 0.004 );
			c.add( m );

		}
		cubies.push( { m: c, home: new THREE.Vector3( i, j, k ) } );
		puzzle.add( c );

	}
	// a dark core so the seams show depth, not the tile behind
	puzzle.add( new THREE.Mesh( new THREE.BoxGeometry( 3 * P - 0.04, 3 * P - 0.04, 3 * P - 0.04 ), mat.body( { roughness: 0.9, clearcoat: 0 } ) ) );

	const mesh = new THREE.Group();
	mesh.add( puzzle );
	mesh.position.z = 0.45;
	mesh.rotation.set( 0.52, - 0.66, 0 );

	const X = new THREE.Vector3( 1, 0, 0 ), Y = new THREE.Vector3( 0, 1, 0 );
	const MOVES = [ [ Y, 1, - 1 ], [ X, 1, - 1 ], [ X, 1, 1 ], [ Y, 1, 1 ] ]; // axis, layer, direction
	const q = new THREE.Quaternion(), p = new THREE.Vector3(), r = new THREE.Quaternion();

	// a turn: rests, then snaps over 0.42–0.66 of its quarter with a little overshoot that settles
	const turn = w => smoothstep( w, 0.42, 0.66 ) + ( w < 0.8 ? 0.07 * Math.sin( Math.PI * smoothstep( w, 0.62, 0.8 ) ) : 0 );

	function update( phase ) {

		const s = phase * 4;
		for ( const c of cubies ) {

			p.copy( c.home ); q.identity();
			MOVES.forEach( ( [ ax, layer, dir ], n ) => {

				const t = n < Math.floor( s ) ? 1 : n > Math.floor( s ) ? 0 : turn( s - n );
				if ( ! t || Math.round( p.dot( ax ) ) !== layer ) return;
				r.setFromAxisAngle( ax, dir * t * Math.PI / 2 );
				p.applyQuaternion( r ); q.premultiply( r );

			} );
			c.m.position.copy( p ).multiplyScalar( P ); c.m.quaternion.copy( q );

		}
		// a slow sway, so the strip lights travel across the finishes
		mesh.rotation.y = - 0.66 + 0.16 * Math.sin( phase * Math.PI * 2 );

	}

	return { mesh, update };

}
