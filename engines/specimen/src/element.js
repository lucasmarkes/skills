import { mount } from './stage.js';

// <specimen-icon src="rocket.specimen.js" poster="rocket-dark-poster.jpg" poster-light?="rocket-light-poster.jpg" theme?="dark|light">
// Shows the poster for its theme first (poster-light in light, when given), then runs the raster stage over it when WebGPU is there and motion is welcome.
// Without a theme attribute it follows prefers-color-scheme live. Stops off screen, disposes on removal,
// and on any mount error keeps the poster and logs once.

const reduceMotion = matchMedia( '(prefers-reduced-motion: reduce)' );
const prefersLight = matchMedia( '(prefers-color-scheme: light)' );

const STYLE = `
:host { display: inline-block; position: relative; width: 160px; aspect-ratio: 1 / 1; }
img, canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
`;

export class SpecimenIcon extends HTMLElement {

	static observedAttributes = [ 'src', 'poster', 'poster-light', 'theme' ];

	#img;
	#stage = null;
	#canvas = null;
	#gen = 0;
	#visible = true;
	#logged = false;
	#observer = null;
	#remount = () => this.#mount();
	#follow = () => { if ( this.hasAttribute( 'theme' ) ) return; this.#syncPoster(); this.#mount(); };

	constructor() {

		super();
		const root = this.attachShadow( { mode: 'open' } );
		const style = document.createElement( 'style' );
		style.textContent = STYLE;
		this.#img = document.createElement( 'img' );
		this.#img.alt = '';
		root.append( style, this.#img );
		/** Settles when the current mount attempt is over: true when the stage runs. */
		this.ready = Promise.resolve( false );

	}

	/** The running stage (null while the poster shows). */
	get stage() {

		return this.#stage;

	}

	get theme() {

		const t = this.getAttribute( 'theme' );
		return t === 'dark' || t === 'light' ? t : prefersLight.matches ? 'light' : 'dark';

	}

	connectedCallback() {

		this.#syncPoster();
		prefersLight.addEventListener( 'change', this.#follow );
		reduceMotion.addEventListener( 'change', this.#remount );
		this.#observer = new IntersectionObserver( ( entries ) => {

			this.#visible = entries[ entries.length - 1 ].isIntersecting;
			if ( ! this.#stage ) return;
			if ( this.#visible ) this.#stage.start(); else this.#stage.stop();

		} );
		this.#observer.observe( this );
		this.#mount();

	}

	disconnectedCallback() {

		prefersLight.removeEventListener( 'change', this.#follow );
		reduceMotion.removeEventListener( 'change', this.#remount );
		this.#observer?.disconnect();
		this.#observer = null;
		this.#gen ++;
		this.#unmount();

	}

	attributeChangedCallback( name ) {

		if ( name === 'poster' || name === 'poster-light' || name === 'theme' ) this.#syncPoster();
		if ( name !== 'poster' && name !== 'poster-light' && this.isConnected ) this.#mount();

	}

	#syncPoster() {

		const p = ( this.theme === 'light' && this.getAttribute( 'poster-light' ) ) || this.getAttribute( 'poster' );
		if ( p ) this.#img.src = p; else this.#img.removeAttribute( 'src' );

	}

	#unmount() {

		this.#stage?.dispose();
		this.#stage = null;
		this.#canvas?.remove();
		this.#canvas = null;

	}

	#mount() {

		const gen = ++ this.#gen;
		this.#unmount();
		this.ready = this.#attempt( gen );
		return this.ready;

	}

	async #attempt( gen ) {

		const src = this.getAttribute( 'src' );
		if ( ! src || reduceMotion.matches || ! navigator.gpu ) return false;
		const canvas = document.createElement( 'canvas' );
		let stage;
		try {

			if ( ! await navigator.gpu.requestAdapter() ) return false;
			if ( gen !== this.#gen ) return false;
			const size = Math.round( this.clientWidth || 160 );
			stage = await mount( canvas, {
				pieceUrl: new URL( src, document.baseURI ).href,
				theme: this.theme,
				mode: 'rt',
				size,
				pixelRatio: Math.min( devicePixelRatio || 1, 2 ),
			} );

		} catch ( e ) {

			if ( ! this.#logged ) console.warn( `<specimen-icon src="${ src }">: ${ e.message }; showing the poster` );
			this.#logged = true;
			return false;

		}

		if ( gen !== this.#gen ) {

			stage.dispose();
			return false;

		}

		this.#stage = stage;
		this.#canvas = canvas;
		this.shadowRoot.append( canvas );
		if ( this.#visible ) stage.start();
		return true;

	}

}

if ( ! customElements.get( 'specimen-icon' ) ) customElements.define( 'specimen-icon', SpecimenIcon );
