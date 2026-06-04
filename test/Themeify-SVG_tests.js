/*
	Unit tests for source/util/Themeify-SVG.js
*/

const Chai = require('chai');
const Expect = Chai.expect;

const { themeifySVG, paletteTokens, defaultPalette } = require('../source/providers/inputs/util/Themeify-SVG.js');

const _SampleSVG = [
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">',
	'  <metadata>',
	'    <!-- payload-type:application/vnd.excalidraw+json -->',
	'    <!-- payload-start --> abc123== <!-- payload-end -->',
	'    "strokeColor": "#1B1F23"',
	'  </metadata>',
	'  <g stroke-linecap="round">',
	'    <rect x="10" y="10" width="100" height="60" stroke="#1B1F23" fill="#FDFCF7" stroke-width="2"/>',
	'    <path d="M 20 80 L 80 80" stroke="#E66C2C" fill="none"/>',
	'    <text style="fill: #1B1F23; font-family: sans-serif;">Hi</text>',
	'    <text style="stroke:#2E7D74;">Link</text>',
	'  </g>',
	'</svg>'
].join('\n');

suite('Themeify-SVG', () =>
{
	test('exports the canonical palette token list', () =>
	{
		Expect(paletteTokens).to.deep.equal(['ink', 'paper', 'accent', 'highlight', 'deemphasis', 'link']);
	});

	test('exports a default palette covering every token', () =>
	{
		for (let i = 0; i < paletteTokens.length; i++)
		{
			Expect(defaultPalette[paletteTokens[i]]).to.match(/^#[0-9A-Fa-f]{6}$/);
		}
	});

	test('rewrites stroke="#hex" using the standard palette into var(--diagram-<token>, #hex)', () =>
	{
		let tmpOut = themeifySVG(_SampleSVG);
		Expect(tmpOut).to.include('stroke="var(--diagram-ink, #1B1F23)"');
		Expect(tmpOut).to.include('fill="var(--diagram-paper, #FDFCF7)"');
		Expect(tmpOut).to.include('stroke="var(--diagram-accent, #E66C2C)"');
	});

	test('rewrites style="fill:#hex" and style="stroke:#hex" inside style attributes', () =>
	{
		let tmpOut = themeifySVG(_SampleSVG);
		Expect(tmpOut).to.include('fill: var(--diagram-ink, #1B1F23)');
		Expect(tmpOut).to.include('stroke:var(--diagram-link, #2E7D74)');
	});

	test('does NOT touch the metadata block (round-trip preserved)', () =>
	{
		let tmpOut = themeifySVG(_SampleSVG);
		Expect(tmpOut).to.include('<!-- payload-start --> abc123== <!-- payload-end -->');
		// And the "strokeColor" attribute inside the JSON metadata is NOT rewritten.
		Expect(tmpOut).to.include('"strokeColor": "#1B1F23"');
		// The placeholder leaked nowhere.
		Expect(tmpOut).to.not.include('PICT-SECTION-EXCALIDRAW-METADATA');
	});

	test('returns the input untouched when not a string', () =>
	{
		Expect(themeifySVG(null)).to.equal(null);
		Expect(themeifySVG(undefined)).to.equal(undefined);
		Expect(themeifySVG(42)).to.equal(42);
	});

	test('accepts a profile-shaped object via .Palette', () =>
	{
		let tmpProfile = { Palette: { ink: '#1B1F23', accent: '#FF00AA' } };
		let tmpOut = themeifySVG(_SampleSVG, tmpProfile);
		Expect(tmpOut).to.include('stroke="var(--diagram-ink, #1B1F23)"');
		// Custom accent — the SVG had #E66C2C, but the profile's accent is #FF00AA,
		// so the SVG hex shouldn't be rewritten under the accent token (no #E66C2C → token).
		Expect(tmpOut).to.include('stroke="#E66C2C"');
	});

	test('accepts a bare palette object', () =>
	{
		let tmpPalette = { ink: '#1B1F23' };
		let tmpOut = themeifySVG(_SampleSVG, tmpPalette);
		Expect(tmpOut).to.include('var(--diagram-ink, #1B1F23)');
	});

	test('ignores palette entries that aren\'t valid 6-digit hex', () =>
	{
		let tmpPalette = { ink: 'notahex', accent: '#E66C2C' };
		let tmpOut = themeifySVG(_SampleSVG, tmpPalette);
		// ink still raw
		Expect(tmpOut).to.include('stroke="#1B1F23"');
		// accent rewritten
		Expect(tmpOut).to.include('stroke="var(--diagram-accent, #E66C2C)"');
	});

	test('does not rewrite "strokeColor" key in a JSON metadata block (regex anchored on stroke/fill = or :)', () =>
	{
		let tmpSVG = '<svg><metadata>"strokeColor": "#1B1F23"</metadata><rect stroke="#1B1F23"/></svg>';
		let tmpOut = themeifySVG(tmpSVG);
		// metadata still has the original key+hex
		Expect(tmpOut).to.include('"strokeColor": "#1B1F23"');
		// outside metadata the hex IS rewritten
		Expect(tmpOut).to.include('stroke="var(--diagram-ink, #1B1F23)"');
	});

	test('is idempotent — running it twice yields the same output as once', () =>
	{
		let tmpOnce  = themeifySVG(_SampleSVG);
		let tmpTwice = themeifySVG(tmpOnce);
		Expect(tmpTwice).to.equal(tmpOnce);
	});
});
