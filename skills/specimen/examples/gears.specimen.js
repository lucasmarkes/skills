// Gears: a large and a small chrome gear in mesh. They tick forward one tooth at a time — four ticks per
// loop, like an escapement — and the light in each hub flares on every tick.

export const scene = {
	accent: '#10b981',
	glow: '#6ee7b7',
	duration: 8,
	fit: { scale: 0.8 },
};

export function object( { THREE, mat, geo, TAU, smoothstep } ) {

	const M = 0.04; // pitch radius per tooth: gears in mesh share it
	function gear( n, hole ) {

		const rp = M * n / 2 * 2, rt = rp + 0.04, rr = rp - 0.045, s = new THREE.Shape();
		for ( let i = 0; i < n; i ++ ) {

			const a = i / n * TAU, d = TAU / n;
			const pt = ( r, t ) => [ r * Math.cos( a + t * d ), r * Math.sin( a + t * d ) ];
			const pts = [ pt( rr, - 0.5 ), pt( rr, - 0.28 ), pt( rt, - 0.16 ), pt( rt, 0.16 ), pt( rr, 0.28 ) ];
			pts.forEach( ( [ x, y ], j ) => ( i || j ) ? s.lineTo( x, y ) : s.moveTo( x, y ) );

		}
		s.closePath();
		const h = new THREE.Path(); h.absarc( 0, 0, hole, 0, TAU, true ); s.holes.push( h );
		// lightening holes in the web of the big gear
		if ( n > 12 ) for ( let i = 0; i < 7; i ++ ) { const a = i / 7 * TAU, w = new THREE.Path(); w.absarc( Math.cos( a ) * rp * 0.58, Math.sin( a ) * rp * 0.58, rp * 0.13, 0, TAU, true ); s.holes.push( w ); }
		const g = new THREE.Mesh( geo.bevelExtrude( s, { depth: 0.07, bevel: 0.025, segments: 6, curveSegments: 16 } ), mat.chrome( { roughness: 0.14 } ) );
		const hubMat = mat.glow( 0.5 );
		const hub = new THREE.Mesh( new THREE.CylinderGeometry( hole * 0.92, hole * 0.92, 0.1, 48 ), hubMat );
		hub.rotation.x = Math.PI / 2;
		const ring = new THREE.Mesh( new THREE.TorusGeometry( hole, 0.018, 16, 64 ), mat.chrome() );
		ring.position.z = 0.06;
		const grp = new THREE.Group(); grp.add( g, hub, ring );
		return { grp, hubMat, rp };

	}

	const N1 = 14, N2 = 9;
	const big = gear( N1, 0.09 ), small = gear( N2, 0.065 );
	const dist = big.rp + small.rp, th = 0.6; // direction from the big gear to the small one
	big.grp.position.set( - Math.cos( th ) * dist * 0.42, - Math.sin( th ) * dist * 0.42, 0 );
	small.grp.position.set( Math.cos( th ) * dist * 0.58, Math.sin( th ) * dist * 0.58, 0 );
	const b0 = th, s0 = th + Math.PI - Math.PI / N2; // a tooth of one faces a gap of the other

	const mesh = new THREE.Group();
	mesh.add( big.grp, small.grp );
	mesh.position.z = 0.45;
	mesh.rotation.set( - 0.35, 0.45, 0 );

	function update( phase ) {

		// four ticks, one tooth each: a fast step with a slight overshoot, then rest
		const s = phase * 4, i = Math.floor( s ), w = s - i;
		const u = smoothstep( w, 0.5, 0.62 ) + 0.06 * Math.sin( Math.PI * smoothstep( w, 0.6, 0.78 ) );
		const teeth = i + u;
		big.grp.rotation.z = b0 + teeth * TAU / N1;
		small.grp.rotation.z = s0 - teeth * TAU / N2;
		const flare = w > 0.6 ? Math.exp( - ( w - 0.6 ) * 9 ) : 0;
		big.hubMat.emissiveIntensity = small.hubMat.emissiveIntensity = 0.5 + 0.9 * flare;
		mesh.rotation.y = 0.45 + 0.1 * Math.sin( phase * TAU );

	}

	return { mesh, update };

}
