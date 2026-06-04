/*
	Integration tests for source/Pict-Provider-Input-RichText.js

	Exercises the view-mode mount path with a real jsdom DOM. We don't actually
	boot CodeMirror — that's covered by the example app + an upcoming puppeteer
	round-trip — but we do verify:

	  - _mountView renders parsed markdown into the slot
	  - _mountView sets the mode classes correctly
	  - _mountView stashes lastValue + input on the per-instance state
	  - onInputInitialize → mounts a view-mode slot from a record on first render
	  - onDataMarshalToForm with a new value re-renders view-mode content
	  - The form's hidden input is written to (via dispatched change events)
	    when we call commit (no-op in view mode, OK)
*/

const libBrowserEnv = require('browser-env');
libBrowserEnv();

const Chai   = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');
const libFormMain      = require('../source/Pict-Section-Form.js');
const libRichTextInput = libFormMain.RichTextInput;

function setupDom()
{
	document.body.innerHTML =
		'<form id="form">' +
		'  <input type="hidden" id="Body-input" value="">' +
		'  <div id="DISPLAY-FOR-Body-input"></div>' +
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
			InputType: 'RichText',
			RichText: { AllowImages: false }
		}
	};
}

function buildPict()
{
	return new libPict();
}

suite('Pict-Provider-Input-RichText integration (view-mode mount)', () =>
{
	test('_mountView renders parsed markdown into the slot', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		let tmpInput = buildInput('Body');
		tmpProvider._mountView(null, tmpInput, '# Hello\n\nA *paragraph*.');

		let tmpSlot = document.getElementById('DISPLAY-FOR-Body-input');
		Expect(tmpSlot.innerHTML).to.include('<h1');
		Expect(tmpSlot.innerHTML).to.include('Hello');
		Expect(tmpSlot.innerHTML).to.include('<em>paragraph</em>');
	});

	test('_mountView marks empty values with an "(empty)" placeholder', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		tmpProvider._mountView(null, buildInput('Body'), '');
		let tmpSlot = document.getElementById('DISPLAY-FOR-Body-input');
		Expect(tmpSlot.innerHTML).to.include('is-empty');
		Expect(tmpSlot.innerHTML).to.include('(empty)');
	});

	test('_mountView records the instance with mode=view and lastValue', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		tmpProvider._mountView(null, buildInput('Body'), 'live value');
		let tmpInst = tmpProvider._instances['Body'];
		Expect(tmpInst).to.exist;
		Expect(tmpInst.mode).to.equal('view');
		Expect(tmpInst.lastValue).to.equal('live value');
		Expect(tmpInst.viewInstance).to.equal(null);
	});

	test('onInputInitialize boots the slot in view mode', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		tmpProvider.onInputInitialize(null, {}, 0, buildInput('Body'),
			'## Section', '#Body-input', 'tx-1');

		let tmpSlot = document.getElementById('DISPLAY-FOR-Body-input');
		Expect(tmpSlot.innerHTML).to.include('<h2');
		Expect(tmpProvider.getMode('Body')).to.equal('view');
	});

	test('onDataMarshalToForm replaces view-mode content with the new value', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		let tmpInput = buildInput('Body');
		tmpProvider.onInputInitialize(null, {}, 0, tmpInput, 'one', '#sel', 'tx');

		let tmpSlot = document.getElementById('DISPLAY-FOR-Body-input');
		Expect(tmpSlot.innerHTML).to.include('one');

		tmpProvider.onDataMarshalToForm(null, {}, 0, tmpInput, 'two', '#sel', 'tx-2');
		Expect(tmpSlot.innerHTML).to.include('two');
		Expect(tmpSlot.innerHTML).to.not.include('one');
	});

	test('commit on a view-mode input is a no-op', (done) =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];
		tmpProvider.onInputInitialize(null, {}, 0, buildInput('Body'), 'value', '#sel', 'tx');

		tmpProvider.commit('Body', (pErr) =>
		{
			Expect(pErr).to.equal(null);
			done();
		});
	});

	test('_writeHiddenInputValue stamps the hidden form input', () =>
	{
		setupDom();
		let tmpPict = buildPict();
		tmpPict.addProvider('Pict-Input-RichText',
			libRichTextInput.default_configuration, libRichTextInput);
		let tmpProvider = tmpPict.providers['Pict-Input-RichText'];

		tmpProvider._writeHiddenInputValue('Body-input', 'new content');
		let tmpHidden = document.getElementById('Body-input');
		Expect(tmpHidden.value).to.equal('new content');
	});
});
