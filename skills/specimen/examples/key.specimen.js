// Keycap: a sculpted cap on a chrome switch housing. Twice per loop it is pressed — it sinks, clicks,
// its return-arrow legend and the light under the cap flash, and it springs back up.

export const scene = {
	accent: '#22d3ee',
	glow: '#a5f3fc',
	duration: 8,
	fit: { scale: 0.8, y: - 0.04 },
};

export function object( { THREE, mat, geo, TAU, smoothstep } ) {

	// housing: a low chrome plate the cap sits on
	const plate = new THREE.Mesh( geo.bevelExtrude( geo.roundedRect( new THREE.Shape(), 0.42, 0.42, 0.1 ), { depth: 0.06, bevel: 0.03 } ), mat.chrome( { finish: 'perforated', finishRepeat: 8 } ) );
	plate.rotation.x = - Math.PI / 2;

	// under-glow: light that spills from the gap between cap and plate
	const underMat = mat.glow( 0.15 );
	const under = new THREE.Mesh( geo.bevelExtrude( geo.roundedRect( new THREE.Shape(), 0.33, 0.33, 0.08 ), { depth: 0.04, bevel: 0.01 } ), underMat );
	under.rotation.x = - Math.PI / 2; under.position.y = 0.06;

	// cap: wide at the base, narrower dished top
	const cap = new THREE.Group();
	const skirt = new THREE.Mesh( geo.bevelExtrude( geo.roundedRect( new THREE.Shape(), 0.31, 0.31, 0.1 ), { depth: 0.14, bevel: 0.06 } ), mat.body( { finish: 'matte' } ) );
	skirt.rotation.x = - Math.PI / 2; skirt.position.y = 0.13;
	const top = new THREE.Mesh( geo.bevelExtrude( geo.roundedRect( new THREE.Shape(), 0.25, 0.25, 0.09 ), { depth: 0.06, bevel: 0.05 } ), mat.body( { finish: 'speckle', finishRepeat: 4 } ) );
	top.rotation.x = - Math.PI / 2; top.position.y = 0.25;
	cap.add( skirt, top );

	// legend: a return arrow ↵ set into the top
	const a = new THREE.Shape();
	a.moveTo( 0.1, 0.1 ); a.lineTo( 0.1, - 0.02 ); a.lineTo( - 0.05, - 0.02 ); a.lineTo( - 0.05, - 0.07 ); a.lineTo( - 0.13, 0.0 );
	a.lineTo( - 0.05, 0.07 ); a.lineTo( - 0.05, 0.02 ); a.lineTo( 0.06, 0.02 ); a.lineTo( 0.06, 0.1 ); a.closePath();
	const legendMat = mat.glow( 0.4, { roughness: 0.4, clearcoat: 0 } );
	const legend = new THREE.Mesh( new THREE.ShapeGeometry( a ), legendMat );
	legend.rotation.x = - Math.PI / 2; legend.position.y = 0.334;
	cap.add( legend );

	const mesh = new THREE.Group();
	mesh.add( plate, under, cap );
	mesh.position.set( 0, - 0.12, 0.45 );
	mesh.rotation.set( 0.62, - 0.5, 0 );

	function update( phase ) {

		// two presses per loop: quick sink, hold, spring back with a small bounce
		const w = ( phase * 2 ) % 1;
		const down = smoothstep( w, 0.3, 0.36 ) - smoothstep( w, 0.5, 0.6 );
		const bounce = w > 0.6 ? 0.012 * Math.exp( - ( w - 0.6 ) * 14 ) * Math.sin( ( w - 0.6 ) * 60 ) : 0;
		cap.position.y = - 0.07 * down + bounce;
		const click = w > 0.36 ? Math.exp( - ( w - 0.36 ) * 30 ) : 0;
		legendMat.emissiveIntensity = 0.4 + 2.6 * down + 1.5 * click;
		underMat.emissiveIntensity = 0.15 + 1.2 * down + 1 * click;
		mesh.rotation.y = - 0.5 + 0.1 * Math.sin( phase * TAU );

	}

	return { mesh, update };

}
