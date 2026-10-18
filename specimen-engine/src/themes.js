// A theme is the set of tokens the stage reads. Dark is the approved ~/3d-icon-lab look; light keeps
// its logic with the medium inverted: white page, porcelain tile, a soft white studio, and the accent
// still arriving only as light, softer.
export const THEMES = {
	dark: { page: '#000000', tile: '#262626', ambient: 0, key: 6, bloom: 0.55, bloomThreshold: 0.85, grain: 'darks', tint: 1 },
	light: { page: '#ffffff', tile: '#eeeeef', ambient: 0.8, key: 4, bloom: 0.18, bloomThreshold: 1.6, grain: 'all', tint: 0.8 },
};
