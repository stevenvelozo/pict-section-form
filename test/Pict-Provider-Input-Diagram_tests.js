/*
	Unit tests for source/Pict-Provider-Input-Diagram.js

	Verifies wiring (template injection, CSS, lifecycle guards, helper methods)
	without actually mounting Excalidraw. Deep edit-mode + scene extraction
	is covered by the puppeteer e2e.
*/

const libBrowserEnv = require('browser-env');
libBrowserEnv();

const Chai   = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const libFormMain     = require('../source/Pict-Section-Form.js');
const libDiagramInput = libFormMain.DiagramInput;

const _StubInput =
{
	Name:     'ArchDiagram',
	Hash:     'ArchDiagram',
	DataType: 'String',
	Macro:
	{
		RawHTMLID:           'ArchDiagram-input',
		InputFullProperties: '',
		InputChangeHandler:  '',
		ControlAttr:         ''
	},
	PictForm:
	{
		InputType: 'Diagram',
		Diagram:
		{
			ThemeColors:          true,
			EditorImplementation: 'react'
		}
	}
};

function buildPictWithStubs()
{
	return new libPict();
}

suite('Pict-Provider-Input-Diagram', () =>
{
	test('module loads — class + default_configuration exposed', () =>
	{
		Expect(typeof libDiagramInput).to.equal('function');
		Expect(libDiagramInput.default_configuration).to.be.an('object');
		Expect(libDiagramInput.default_configuration.ProviderIdentifier).to.equal('Pict-Input-Diagram');
	});

	test('canonical Diagram template hashes ship in the default template set', () =>
	{
		let tmpDefaults  = require('../source/providers/dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates.js');
		let tmpPostfixes = tmpDefaults.Templates.map((t) => t.HashPostfix);
		Expect(tmpPostfixes).to.include('-Template-Input-InputType-Diagram');
		Expect(tmpPostfixes).to.include('-VerticalTemplate-Input-InputType-Diagram');
	});

	test('every shipped Diagram template declares Pict-Input-Diagram as a DefaultInputExtension', () =>
	{
		let tmpDefaults = require('../source/providers/dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates.js');
		let tmpDiag     = tmpDefaults.Templates.filter((t) => /-InputType-Diagram$/.test(t.HashPostfix));
		Expect(tmpDiag.length).to.be.greaterThan(0);
		for (let i = 0; i < tmpDiag.length; i++)
		{
			Expect(tmpDiag[i].DefaultInputExtensions, 'entry ' + i).to.deep.equal(['Pict-Input-Diagram']);
		}
	});

	test('constructor registers CSS at priority 500', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		Expect(tmpPict.CSSMap.inlineCSSMap['Pict-Input-Diagram-CSS']).to.exist;
		Expect(tmpPict.CSSMap.inlineCSSMap['Pict-Input-Diagram-CSS'].Priority).to.equal(500);
	});

	test('onInputInitializeTabular throws with a helpful message', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];
		Expect(() => { tmpProvider.onInputInitializeTabular({}, {}, _StubInput, '', '#sel', 0, 'tx'); })
			.to.throw(/not supported inside Tabular rows/);
	});

	test('_isLikelySvg recognises an svg, rejects markdown / empty', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];
		Expect(tmpProvider._isLikelySvg('<svg xmlns="x"></svg>')).to.equal(true);
		Expect(tmpProvider._isLikelySvg('<svg>\nfoo')).to.equal(true);
		Expect(tmpProvider._isLikelySvg('## markdown')).to.equal(false);
		Expect(tmpProvider._isLikelySvg('')).to.equal(false);
		Expect(tmpProvider._isLikelySvg(null)).to.equal(false);
	});

	test('_buildViewHTML wraps an SVG, shows placeholder for empty', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];

		let tmpHTML = tmpProvider._buildViewHTML('<svg viewBox="0 0 10 10"><rect/></svg>');
		Expect(tmpHTML).to.include('class="pict-section-form-diagram-view"');
		Expect(tmpHTML).to.include('<svg viewBox="0 0 10 10">');

		let tmpEmpty = tmpProvider._buildViewHTML('');
		Expect(tmpEmpty).to.include('is-empty');
		Expect(tmpEmpty).to.include('empty diagram');
	});

	test('getMode returns null before mount', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		Expect(tmpPict.providers['Pict-Input-Diagram'].getMode('ArchDiagram')).to.equal(null);
	});

	test('setMode errors when input is not mounted', (done) =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		tmpPict.providers['Pict-Input-Diagram'].setMode('Unknown', 'edit', (pErr) =>
		{
			Expect(pErr).to.be.an('error');
			Expect(pErr.message).to.include('not mounted');
			done();
		});
	});

	test('setMode rejects unknown mode names', (done) =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];
		tmpProvider._instances['ArchDiagram'] = { mode: 'view', input: _StubInput, lastValue: '' };
		tmpProvider.setMode('ArchDiagram', 'preview', (pErr) =>
		{
			Expect(pErr).to.be.an('error');
			Expect(pErr.message).to.match(/unknown mode/);
			done();
		});
	});

	test('setMode is a no-op when already in the requested mode', (done) =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-Diagram',
			libDiagramInput.default_configuration, libDiagramInput);
		let tmpProvider = tmpPict.providers['Pict-Input-Diagram'];
		tmpProvider._instances['ArchDiagram'] = { mode: 'view', input: _StubInput, lastValue: '<svg/>' };
		tmpProvider.setMode('ArchDiagram', 'view', (pErr) =>
		{
			Expect(pErr).to.equal(null);
			Expect(tmpProvider.getMode('ArchDiagram')).to.equal('view');
			done();
		});
	});

	test('themeifySVG re-export is callable from the main module entry', () =>
	{
		Expect(typeof libFormMain.themeifySVG).to.equal('function');
		let tmpOut = libFormMain.themeifySVG('<svg><rect stroke="#1B1F23"/></svg>');
		Expect(tmpOut).to.include('var(--diagram-ink, #1B1F23)');
	});
});
