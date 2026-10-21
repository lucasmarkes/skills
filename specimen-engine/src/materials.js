import * as THREE from 'three/webgpu';
import { finish } from './finishes.js';

// Semantic materials. A piece asks for a role and the theme answers with the colour and finish, so
// one piece reads in both themes: remapping colours after the fact left glass and textured objects
// dark and made emissive detail vanish on white. `o` overrides physical values only.

const COLOUR_KEYS = [ 'color', 'emissive', 'sheenColor', 'specularColor', 'attenuationColor' ];

function physical( base, o, roleName ) {

	// a finish sits between the role's values and the piece's own overrides
	if ( 'finish' in o || 'finishRepeat' in o ) { const { finish: f, finishRepeat, ...rest } = o; base = { ...base, ...finish( f, finishRepeat ) }; o = rest; }
	for ( const k of COLOUR_KEYS ) if ( k in o ) throw new Error( `mat.${ roleName }(): "${ k }" is set by the theme; a piece never picks colours` );
	// the light theme's dynamic texture is pigment: it colours the surface instead of emitting
	if ( o.emissiveMap?.userData.specimen === 'pigment' ) {

		const { emissiveMap, ...rest } = o;
		return new THREE.MeshPhysicalMaterial( { ...base, ...rest, map: emissiveMap, emissive: '#000000' } );

	}

	const m = new THREE.MeshPhysicalMaterial( { ...base, ...o } );
	// a map that emits carries its own colour, so the emissive term is white under it
	if ( o.emissiveMap ) m.emissive.set( '#ffffff' );
	return m;

}

// emissiveIntensity the piece sets is scaled by the theme (light keeps glow faint on white)
function scaleEmission( m, f ) {

	if ( f === 1 ) return m;
	let v = m.emissiveIntensity;
	Object.defineProperty( m, 'emissiveIntensity', { get: () => v * f, set: x => { v = x; }, configurable: true } );
	return m;

}

export function createMaterials( theme, glow ) {

	const L = theme === 'light';
	const g = new THREE.Color( glow );

	const roles = {
		body: ( o = {} ) => scaleEmission( physical( L
			? { color: '#ebeae7', roughness: Math.max( o.roughness ?? 0.25, 0.35 ), metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }
			: { color: '#0b0b0c', roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 },
		L ? { ...o, roughness: Math.max( o.roughness ?? 0.25, 0.35 ) } : o, 'body' ), L ? 0.5 : 1 ),
		chrome: ( o = {} ) => physical( { color: L ? '#c8c8c8' : '#b8b8b8', roughness: 0.16, metalness: 1 }, o, 'chrome' ),
		glass: ( o = {} ) => scaleEmission( physical( L
			? { color: '#eef0f0', roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.02 }
			: { color: '#0b0b0c', roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03 }, o, 'glass' ), L ? 0.5 : 1 ),
		inlay: ( o = {} ) => physical( L
			? { color: '#dddbd7', roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06 }
			: { color: '#161618', roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 }, o, 'inlay' ),
		glow: ( k = 1, o = {} ) => {

			const m = physical( { color: L ? g : '#000000', roughness: 0.15, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, emissiveIntensity: k }, o, 'glow' );
			if ( ! o.emissiveMap ) m.emissive.copy( g );
			return scaleEmission( m, L ? 0.35 : 1 );

		},
		light: ( k = 1, o = {} ) => {

			const m = physical( { color: L ? '#fbf6ef' : '#000000', roughness: 0.05, metalness: 0, clearcoat: 1, emissiveIntensity: k }, o, 'light' );
			if ( ! o.emissiveMap ) m.emissive.set( '#ffcf9e' ); // warm white: windows, trails
			return scaleEmission( m, L ? 0.5 : 1 );

		},
	};

	return Object.freeze( roles );

}

// the glow colour when the piece names none: the accent, a step lighter (Tailwind 500 → 400)
export function glowFrom( accent ) {

	const c = new THREE.Color( accent ), hsl = {};
	c.getHSL( hsl );
	return c.setHSL( hsl.h, Math.min( 1, hsl.s * 1.05 ), Math.min( 0.85, hsl.l + 0.1 ) );

}
