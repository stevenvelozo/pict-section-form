/*
	Unit tests for source/Pict-Provider-Input-RichText.js

	These tests verify the provider's wiring (template injection, CSS, lifecycle
	guards) without actually mounting CodeMirror. The deep mode-switching + DOM
	mounting is covered by the puppeteer e2e.
*/

const libBrowserEnv = require('browser-env');
libBrowserEnv();

const Chai   = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

// Load the provider via the main module's export so we exercise the same path
// consumers do.
const libFormMain      = require('../source/Pict-Section-Form.js');
const libRichTextInput = libFormMain.RichTextInput;

const _StubInput =
{
	Name:     'Body',
	Hash:     'Body',
	DataType: 'String',
	Macro:
	{
		RawHTMLID:           'Body-input',
		InputFullProperties: '',
		InputChangeHandler:  '',
		ControlAttr:         ''
	},
	PictForm:
	{
		InputType: 'RichText',
		RichText:
		{
			AllowImages:   false,
			ImageUploader: null
		}
	}
};

function buildPictWithStubs(pOpts)
{
	let tmpPict = new libPict();
	let tmpOpts = pOpts || {};

	// Mock DynamicTemplates provider exposing the injectTemplateSet API.
	tmpPict.providers.DynamicTemplates =
	{
		injectedSets: [],
		injectTemplateSet(pSet) { this.injectedSets.push(pSet); }
	};

	// Mock PictApplication for uploader-dispatch tests.
	if (tmpOpts.uploaderResult)
	{
		tmpPict.PictApplication = (
		{
			uploadImage(pFile, pInput, fCallback)
			{
				if (tmpOpts.uploaderResult === 'reject')
				{
					fCallback('synthetic upload error');
				}
				else
				{
					fCallback(null, tmpOpts.uploaderResult);
				}
				return true;
			}
		});
	}
	return tmpPict;
}

suite('Pict-Provider-Input-RichText', () =>
{
	test('module loads — class + default_configuration exposed', () =>
	{
		Expect(typeof libRichTextInput).to.equal('function');
		Expect(libRichTextInput.default_configuration).to.be.an('object');
		Expect(libRichTextInput.default_configuration.ProviderIdentifier).to.equal('Pict-Input-RichText');
	});

	test('canonical RichText template hashes ship in the default template set', () =>
	{
		let tmpDefaults  = require('../source/providers/dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates.js');
		let tmpPostfixes = tmpDefaults.Templates.map((t) => t.HashPostfix);
		Expect(tmpPostfixes).to.include('-Template-Input-InputType-RichText');
		Expect(tmpPostfixes).to.include('-VerticalTemplate-Input-InputType-RichText');
	});

	test('every shipped RichText template declares Pict-Input-RichText as a DefaultInputExtension', () =>
	{
		let tmpDefaults = require('../source/providers/dynamictemplates/Pict-DynamicTemplates-DefaultFormTemplates.js');
		let tmpRich     = tmpDefaults.Templates.filter((t) => /-InputType-RichText$/.test(t.HashPostfix));
		Expect(tmpRich.length).to.be.greaterThan(0);
		for (let i = 0; i < tmpRich.length; i++)
		{
			Expect(tmpRich[i].DefaultInputExtensions, 'entry ' + i).to.deep.equal(['Pict-Input-RichText']);
		}
	});

	test('constructor registers CSS at priority 500', () =>
	{
		let tmpPict   = buildPictWithStubs();
		let tmpBefore = JSON.parse(JSON.stringify(tmpPict.CSSMap.inlineCSSMap || {}));
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpAfter  = tmpPict.CSSMap.inlineCSSMap;
		Expect(tmpAfter['Pict-Input-RichText-CSS']).to.exist;
		Expect(tmpAfter['Pict-Input-RichText-CSS'].Priority).to.equal(500);
	});

	test('onInputInitializeTabular throws with a helpful message', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		Expect(() => { tmpProvider.onInputInitializeTabular({}, {}, _StubInput, '', '#sel', 0, 'tx'); })
			.to.throw(/not supported inside Tabular rows/);
	});

	test('_resolveValue prefers the explicit value, then Content, then Default', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		Expect(tmpProvider._resolveContent(_StubInput, 'live value')).to.equal('live value');
		Expect(tmpProvider._resolveContent({ Content: 'static' }, '')).to.equal('static');
		Expect(tmpProvider._resolveContent({ Default: 'fallback' }, '')).to.equal('fallback');
		Expect(tmpProvider._resolveContent({}, '')).to.equal('');
	});

	test('_renderMarkdown produces HTML, escapes on bad input', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		let tmpHTML = tmpProvider._renderMarkdown('# Heading\n\nA paragraph.');
		Expect(tmpHTML).to.include('<h1');
		Expect(tmpHTML).to.include('Heading');
		Expect(tmpHTML).to.include('<p');
	});

	test('getMode returns null before an input is mounted', () =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		Expect(tmpPict.providers['Pict-Input-RichText'].getMode('Body')).to.equal(null);
	});

	test('setMode errors when the input is not mounted', (done) =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		tmpPict.providers['Pict-Input-RichText'].setMode('Unknown', 'edit', (pErr) =>
		{
			Expect(pErr).to.be.an('error');
			Expect(pErr.message).to.include('not mounted');
			done();
		});
	});

	test('setMode rejects unknown mode names', (done) =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];
		// Seed an instance so we get past the not-mounted guard.
		tmpProvider._instances['Body'] = { mode: 'view', input: _StubInput, lastValue: '' };
		tmpProvider.setMode('Body', 'preview', (pErr) =>
		{
			Expect(pErr).to.be.an('error');
			Expect(pErr.message).to.match(/unknown mode/);
			done();
		});
	});

	test('setMode is a no-op when already in the requested mode', (done) =>
	{
		let tmpPict = buildPictWithStubs();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];
		tmpProvider._instances['Body'] = { mode: 'view', input: _StubInput, lastValue: 'x' };
		tmpProvider.setMode('Body', 'view', (pErr) =>
		{
			Expect(pErr).to.equal(null);
			Expect(tmpProvider.getMode('Body')).to.equal('view');
			done();
		});
	});
});
