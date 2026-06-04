/*
	Integration tests for source/Pict-Provider-Input-Diagram.js

	Exercises the view-mode mount path with a real jsdom DOM. We don't actually
	boot Excalidraw (that's covered by the example app + future puppeteer
	round-trip) but we do verify:

	  - _mountView writes the inline SVG into the slot
	  - empty values show the placeholder
	  - onInputInitialize mounts the slot in view mode
	  - onDataMarshalToForm hot-swaps the inline SVG
	  - The hidden input bridge works
	  - The themeify pipeline runs end-to-end on a sample SVG
*/

const libBrowserEnv = require('browser-env');
libBrowserEnv();

const Chai   = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');
const libFormMain     = require('../source/Pict-Section-Form.js');
const libDiagramInput = libFormMain.DiagramInput;

function setupDom()
{
	document.body.innerHTML =
		'<form id="form">' +
		'  <input type="hidden" id="ArchDiagram-input" value="">' +
		'  <div id="DISPLAY-FOR-ArchDiagram-input"></div>' +
		'</form>';
}

function buildInput(pHash)
{
	return {
		Name:     pHash,
		Hash:     pHash,
		DataType: 'String',
		Macro:
		{
			RawHTMLID:           pHash + '-input',
			InputFullProperties: '',
			InputChangeHandler:  '',
			ControlAttr:         ''
		},
		PictForm:
		{
			InputType: 'Diagram',
			Diagram: { ThemeColors: true, EditorImplementation: 'react' }
		}
	};
}

function buildPict()
{
	return new libPict();
}

const _SampleSvg =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50">' +
		'<metadata><!-- payload-start --> e30= <!-- payload-end --></metadata>' +
		'<rect x="0" y="0" width="100" height="50" stroke="#1B1F23" fill="#FDFCF7" stroke-width="2"/>' +
	'</svg>';

suite('Pict-Provider-Input-Diagram integration (view-mode mount)', () =>
{
	test('_mountView writes the inline SVG into the slot', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		tmpProvider._mountView(null, buildInput('ArchDiagram'), _SampleSvg);

		let tmpSlot = document.getElementById('DISPLAY-FOR-ArchDiagram-input');
		Expect(tmpSlot.innerHTML).to.include('<svg');
		// The slot includes a wrapper div, and the SVG element should be inside.
		Expect(tmpSlot.querySelector('svg')).to.exist;
	});

	test('_mountView shows the empty placeholder for missing values', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		tmpProvider._mountView(null, buildInput('ArchDiagram'), '');
		let tmpSlot = document.getElementById('DISPLAY-FOR-ArchDiagram-input');
		Expect(tmpSlot.innerHTML).to.include('is-empty');
		Expect(tmpSlot.innerHTML).to.include('empty diagram');
	});

	test('_mountView records the instance with mode=view and lastValue', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		tmpProvider._mountView(null, buildInput('ArchDiagram'), _SampleSvg);
		let tmpInst = tmpProvider._instances['ArchDiagram'];
		Expect(tmpInst).to.exist;
		Expect(tmpInst.mode).to.equal('view');
		Expect(tmpInst.lastValue).to.equal(_SampleSvg);
		Expect(tmpInst.viewInstance).to.equal(null);
	});

	test('onInputInitialize boots the slot in view mode', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		tmpProvider.onInputInitialize(null, {}, 0, buildInput('ArchDiagram'),
			_SampleSvg, '#ArchDiagram-input', 'tx-1');

		let tmpSlot = document.getElementById('DISPLAY-FOR-ArchDiagram-input');
		Expect(tmpSlot.querySelector('svg')).to.exist;
		Expect(tmpProvider.getMode('ArchDiagram')).to.equal('view');
	});

	test('onDataMarshalToForm replaces the inline SVG with a new value', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		let tmpInput = buildInput('ArchDiagram');
		tmpProvider.onInputInitialize(null, {}, 0, tmpInput, _SampleSvg, '#sel', 'tx');

		let tmpNewSvg = _SampleSvg.replace('stroke="#1B1F23"', 'stroke="#FF0000"');
		tmpProvider.onDataMarshalToForm(null, {}, 0, tmpInput, tmpNewSvg, '#sel', 'tx-2');

		let tmpSlot = document.getElementById('DISPLAY-FOR-ArchDiagram-input');
		Expect(tmpSlot.innerHTML).to.include('stroke="#FF0000"');
	});

	test('_writeHiddenInputValue stamps the hidden form input', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		tmpProvider._writeHiddenInputValue('ArchDiagram-input', '<svg/>');
		let tmpHidden = document.getElementById('ArchDiagram-input');
		Expect(tmpHidden.value).to.equal('<svg/>');
	});

	test('themeify pipeline produces theme-variable SVG end-to-end', () =>
	{
		let tmpThemed = libFormMain.themeifySVG(_SampleSvg);
		Expect(tmpThemed).to.include('var(--diagram-ink, #1B1F23)');
		Expect(tmpThemed).to.include('var(--diagram-paper, #FDFCF7)');
		// Metadata block preserved.
		Expect(tmpThemed).to.include('payload-start');
		Expect(tmpThemed).to.include('e30=');
	});
});
