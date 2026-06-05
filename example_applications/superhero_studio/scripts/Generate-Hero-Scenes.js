/**
 * Generate-Hero-Scenes.js
 *
 * Generates real Excalidraw-exported SVGs for each superhero portrait (and
 * for the diagram_form demo SVG) by booting puppeteer + the wrapper bundle
 * and running vendor.exportToSvg with appState.exportEmbedScene = true. The
 * resulting SVGs round-trip through vendor.loadFromBlob so the Diagram input
 * provider can extract the scene on edit-mode toggle.
 *
 * Usage:
 *
 *     # From example_applications/superhero_studio/
 *     node scripts/Generate-Hero-Scenes.js
 *
 * Writes the generated SVGs to scripts/generated-scenes.json so the result
 * is inspectable. Superheroes.js and DiagramForm-Example-Application.js are
 * updated by hand from that file.
 */

const libPath = require('path');
const libFs   = require('fs');

// --------------------------------------------------------------------------
// Scene skeletons
// --------------------------------------------------------------------------
// Each skeleton is an array of "skeleton elements" that vendor.convertTo-
// ExcalidrawElements promotes into full Excalidraw elements. Keep them
// simple: a hero ID rectangle, a "power" ellipse, a name label, an arrow.
// Editable, not pretty.

const ROUGHNESS = 1;       // hand-drawn feel
const STROKE_WIDTH = 2;

const _HEROES =
{
	'captain-verbose':
	{
		Name: 'Captain Verbose',
		Skeleton: [
			{ type: 'ellipse',  x: 200, y:  60, width: 260, height: 80,  strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'hachure', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 230, y:  85, text: 'In the beginning,\nthere were words…', fontSize: 16,  fontFamily: 1, strokeColor: '#2E7D74' },
			{ type: 'arrow',    x: 330, y: 145, width: 0,   height: 50,  strokeColor: '#1B1F23', roughness: ROUGHNESS, strokeWidth: 1.5, points: [[0,0],[0,50]], endArrowhead: 'arrow' },
			{ type: 'ellipse',  x: 290, y: 200, width: 80,  height: 80,  strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'rectangle',x: 295, y: 290, width: 70,  height: 100, strokeColor: '#1B1F23', backgroundColor: '#E66C2C', fillStyle: 'cross-hatch', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 310, y: 330, text: 'C', fontSize: 32, fontFamily: 1, strokeColor: '#FDFCF7' },
			{ type: 'text',     x: 240, y: 410, text: 'Captain Verbose', fontSize: 18, fontFamily: 1, strokeColor: '#1B1F23' }
		]
	},
	'the-notebook':
	{
		Name: 'The Notebook',
		Skeleton: [
			{ type: 'rectangle',x: 260, y:  80, width: 140, height: 180, strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'line',     x: 270, y: 120, width: 120, height: 0,   strokeColor: '#2E7D74', roughness: ROUGHNESS, points: [[0,0],[120,0]] },
			{ type: 'line',     x: 270, y: 145, width: 120, height: 0,   strokeColor: '#2E7D74', roughness: ROUGHNESS, points: [[0,0],[120,0]] },
			{ type: 'line',     x: 270, y: 170, width: 120, height: 0,   strokeColor: '#2E7D74', roughness: ROUGHNESS, points: [[0,0],[120,0]] },
			{ type: 'line',     x: 270, y: 195, width: 120, height: 0,   strokeColor: '#2E7D74', roughness: ROUGHNESS, points: [[0,0],[120,0]] },
			{ type: 'line',     x: 270, y: 220, width: 120, height: 0,   strokeColor: '#2E7D74', roughness: ROUGHNESS, points: [[0,0],[120,0]] },
			{ type: 'ellipse',  x: 305, y: 280, width: 50,  height: 50,  strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'arrow',    x: 380, y: 280, width: 60,  height: 0,   strokeColor: '#E66C2C', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, points: [[0,0],[60,0]], endArrowhead: 'arrow' },
			{ type: 'text',     x: 250, y: 350, text: 'The Notebook', fontSize: 18, fontFamily: 1, strokeColor: '#1B1F23' }
		]
	},
	'markdown-marauder':
	{
		Name: 'Markdown Marauder',
		Skeleton: [
			{ type: 'rectangle',x: 240, y:  80, width: 180, height: 90,  strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 285, y:  95, text: '# Heading',   fontSize: 22, fontFamily: 3, strokeColor: '#E66C2C' },
			{ type: 'text',     x: 285, y: 125, text: '> blockquote', fontSize: 14, fontFamily: 3, strokeColor: '#5A4A3C' },
			{ type: 'text',     x: 285, y: 145, text: '- bullet item', fontSize: 14, fontFamily: 3, strokeColor: '#2E7D74' },
			{ type: 'arrow',    x: 330, y: 180, width: 0,   height: 60,  strokeColor: '#2E7D74', roughness: ROUGHNESS, points: [[0,0],[0,60]], endArrowhead: 'arrow' },
			{ type: 'ellipse',  x: 290, y: 250, width: 80,  height: 80,  strokeColor: '#1B1F23', backgroundColor: '#2E7D74', fillStyle: 'cross-hatch', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 313, y: 273, text: '#',  fontSize: 38, fontFamily: 3, strokeColor: '#FDFCF7' },
			{ type: 'text',     x: 235, y: 360, text: 'Markdown Marauder', fontSize: 18, fontFamily: 1, strokeColor: '#1B1F23' }
		]
	},
	'the-modal-avenger':
	{
		Name: 'The Modal Avenger',
		Skeleton: [
			{ type: 'rectangle',x: 220, y:  80, width: 220, height: 280, strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'rectangle',x: 220, y:  80, width: 220, height: 30,  strokeColor: '#1B1F23', backgroundColor: '#E66C2C', fillStyle: 'cross-hatch', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 235, y:  88, text: 'Alert', fontSize: 14, fontFamily: 1, strokeColor: '#FDFCF7' },
			{ type: 'text',     x: 410, y:  88, text: '×',     fontSize: 18, fontFamily: 1, strokeColor: '#FDFCF7' },
			{ type: 'ellipse',  x: 300, y: 150, width: 60,  height: 60,  strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 322, y: 165, text: '!',   fontSize: 28, fontFamily: 1, strokeColor: '#E66C2C' },
			{ type: 'text',     x: 250, y: 230, text: 'Are you sure?', fontSize: 16, fontFamily: 1, strokeColor: '#1B1F23' },
			{ type: 'rectangle',x: 245, y: 305, width: 80,  height: 30,  strokeColor: '#1B1F23', backgroundColor: '#A0A0A0', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, label: { text: 'CANCEL', fontSize: 12 } },
			{ type: 'rectangle',x: 335, y: 305, width: 80,  height: 30,  strokeColor: '#1B1F23', backgroundColor: '#2E7D74', fillStyle: 'solid', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, label: { text: 'CONFIRM', fontSize: 12 } },
			{ type: 'text',     x: 230, y: 380, text: 'The Modal Avenger', fontSize: 18, fontFamily: 1, strokeColor: '#1B1F23' }
		]
	},
	'vector-vince':
	{
		Name: 'Vector Vince',
		Skeleton: [
			{ type: 'rectangle',x: 260, y:  80, width: 140, height: 140, strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: 0, strokeWidth: STROKE_WIDTH },
			{ type: 'diamond',  x: 285, y: 100, width: 90,  height: 90,  strokeColor: '#1B1F23', backgroundColor: '#E66C2C', fillStyle: 'cross-hatch', roughness: 0, strokeWidth: STROKE_WIDTH },
			{ type: 'arrow',    x: 200, y: 150, width: 60,  height: 0,   strokeColor: '#1B1F23', roughness: 0, strokeWidth: STROKE_WIDTH, points: [[0,0],[60,0]], endArrowhead: 'arrow' },
			{ type: 'arrow',    x: 400, y: 150, width: 60,  height: 0,   strokeColor: '#1B1F23', roughness: 0, strokeWidth: STROKE_WIDTH, points: [[0,0],[60,0]], endArrowhead: 'arrow' },
			{ type: 'arrow',    x: 330, y: 240, width: 0,   height: 60,  strokeColor: '#1B1F23', roughness: 0, strokeWidth: STROKE_WIDTH, points: [[0,0],[0,60]], endArrowhead: 'arrow' },
			{ type: 'ellipse',  x: 305, y: 270, width: 50,  height: 50,  strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'solid', roughness: 0, strokeWidth: STROKE_WIDTH },
			{ type: 'text',     x: 265, y: 350, text: 'Vector Vince', fontSize: 18, fontFamily: 1, strokeColor: '#1B1F23' }
		]
	}
};

const _ARCHITECTURE =
{
	Name: 'Architecture',
	Skeleton: [
		{ type: 'rectangle',x: 100, y: 120, width: 120, height: 70, strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'cross-hatch', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, label: { text: 'Client', fontSize: 18 } },
		{ type: 'arrow',    x: 230, y: 155, width: 130, height: 0,  strokeColor: '#E66C2C', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, points: [[0,0],[130,0]], endArrowhead: 'arrow' },
		{ type: 'rectangle',x: 370, y: 120, width: 150, height: 70, strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'cross-hatch', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, label: { text: 'API Server', fontSize: 18 } },
		{ type: 'arrow',    x: 445, y: 200, width: 0,   height: 70, strokeColor: '#2E7D74', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, points: [[0,0],[0,70]], endArrowhead: 'arrow' },
		{ type: 'ellipse',  x: 380, y: 280, width: 140, height: 60, strokeColor: '#1B1F23', backgroundColor: '#FDFCF7', fillStyle: 'cross-hatch', roughness: ROUGHNESS, strokeWidth: STROKE_WIDTH, label: { text: 'Database', fontSize: 16 } }
	]
};

// --------------------------------------------------------------------------
// Generator (puppeteer + the wrapper bundle)
// --------------------------------------------------------------------------

async function main()
{
	// Reach into pict-section-excalidraw's installed puppeteer (this script is
	// dev-only — sibling module's puppeteer is the simplest way to avoid an
	// install in the example app).
	let tmpPuppeteerPath = libPath.resolve(__dirname, '../../../../pict-section-excalidraw/node_modules/puppeteer');
	const puppeteer = require(tmpPuppeteerPath);
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();

	let tmpHostHtml =
		'file://' + libPath.resolve(__dirname, '../dist/index.html');
	console.log('Loading host page:', tmpHostHtml);
	await page.goto(tmpHostHtml, { waitUntil: 'networkidle0', timeout: 30000 });
	await new Promise(r => setTimeout(r, 1500));

	let tmpOut = { Heroes: {}, Architecture: null };

	for (let tmpSlug of Object.keys(_HEROES))
	{
		let tmpHero = _HEROES[tmpSlug];
		let tmpSvg = await page.evaluate(async (pSkeleton) =>
		{
			const V = window.PictSectionExcalidrawVendor;
			const tmpElements = V.convertToExcalidrawElements(pSkeleton);
			const tmpSvgEl = await V.exportToSvg({
				elements: tmpElements,
				appState: {
					exportEmbedScene: true,
					exportBackground: true,
					viewBackgroundColor: '#FDFCF7'
				},
				files: {}
			});
			return tmpSvgEl.outerHTML;
		}, tmpHero.Skeleton);
		console.log('  ' + tmpSlug + ': ' + tmpSvg.length + ' bytes');
		tmpOut.Heroes[tmpSlug] = tmpSvg;
	}

	let tmpArchSvg = await page.evaluate(async (pSkeleton) =>
	{
		const V = window.PictSectionExcalidrawVendor;
		const tmpElements = V.convertToExcalidrawElements(pSkeleton);
		const tmpSvgEl = await V.exportToSvg({
			elements: tmpElements,
			appState: {
				exportEmbedScene: true,
				exportBackground: true,
				viewBackgroundColor: '#FDFCF7'
			},
			files: {}
		});
		return tmpSvgEl.outerHTML;
	}, _ARCHITECTURE.Skeleton);
	console.log('  architecture: ' + tmpArchSvg.length + ' bytes');
	tmpOut.Architecture = tmpArchSvg;

	await browser.close();

	let tmpOutPath = libPath.resolve(__dirname, 'generated-scenes.json');
	libFs.writeFileSync(tmpOutPath, JSON.stringify(tmpOut, null, 2));
	console.log('\nWrote ' + tmpOutPath);
}

main().catch((pErr) =>
{
	console.error('[generator] ' + (pErr && pErr.stack || pErr));
	process.exit(1);
});
