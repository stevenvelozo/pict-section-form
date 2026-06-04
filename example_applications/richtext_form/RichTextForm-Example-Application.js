/**
 * RichTextForm-Example-Application.js
 *
 * Demonstrates the RichText InputType from pict-section-markdowneditor inside
 * a pict-section-form. The form boots with every RichText field in VIEW mode
 * (rendered markdown). A "Edit" button on the page calls
 * `provider.setMode(hash, 'edit')` to flip a single field into the markdown
 * editor; "Done" flips it back.
 *
 * Image handling has three live demo modes:
 *   - AllowImages=false        → image paste is rejected with a toast
 *   - AllowImages=true, no uploader → base64 inline (default editor behaviour)
 *   - AllowImages=true + uploader   → a stubbed `uploadImage` on the application
 *     hands back a fake CDN URL after 600ms.
 */

const libPictApplication = require('pict-application');
const libPictSectionForm = require('pict-section-form');

const _FormDescriptors =
{
	'Body':
	{
		Name: 'Body',
		Hash: 'Body',
		DataType: 'String',
		PictForm:
		{
			Section:   'Article',
			Row:       1,
			Width:     12,
			InputType: 'RichText',
			RichText:
			{
				AllowImages:   true,
				ImageUploader: 'uploadImage',
				Height:        '320px'
			}
		}
	}
};

const _FormManifest =
{
	Scope: 'RichTextDemoForm',
	Sections:
	[
		{
			Hash: 'Article',
			Name: 'Article Body'
		}
	],
	Descriptors: _FormDescriptors
};

class RichTextFormApplication extends libPictSectionForm.PictFormApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register the RichText input provider. The provider lives in
		// pict-section-form (where the InputType + form templates are defined);
		// it lazy-requires pict-section-markdowneditor on the first edit toggle
		// so a never-edited form pays nothing for CodeMirror.
		let libRichTextInput = libPictSectionForm.RichTextInput;
		this.pict.addProvider(
			libRichTextInput.default_configuration.ProviderIdentifier,
			libRichTextInput.default_configuration,
			libRichTextInput
		);

		// Seed AppData with a record so the form has something to render in view mode.
		this.pict.AppData.RichTextDemoForm =
		{
			Body: '## Welcome\n\nThis form is in **view** mode by default. Click *Edit* to swap a field into the markdown editor.\n\n- Boot-time DOM is just rendered markdown — no CodeMirror loaded.\n- First `setMode("edit")` lazy-loads the editor bundle.\n- Image uploads are routed through `uploadImage(file, descriptor, cb)`.'
		};

		// Allow-images toggle backing flag (read by uploadImage stub).
		this._imageUploaderEnabled = true;
	}

	/**
	 * Stubbed image uploader. Resolves to a fake CDN URL after a brief delay so
	 * the demo shows the upload-in-progress UX. Real apps wire this to their own
	 * storage (S3, a content-delivery API, etc.).
	 *
	 * The signature matches the pict-section-markdowneditor onImageUpload
	 * contract: return true if we'll handle it; call fCallback(err, url).
	 */
	uploadImage(pFile, pDescriptor, fCallback)
	{
		if (!this._imageUploaderEnabled)
		{
			// Returning false from the inner provider tells the markdown editor
			// to fall through to base64 inline.
			return false;
		}

		setTimeout(() =>
		{
			let tmpFakeURL = '/uploads/' + Date.now() + '-' + (pFile.name || 'image.png').replace(/[^A-Za-z0-9._-]/g, '_');
			fCallback(null, tmpFakeURL);
			if (this.log) this.log.info('[richtext_form demo] uploadImage resolved', { url: tmpFakeURL });
		}, 600);

		return true;
	}

	// ----------------------------------------------------------------------------
	// Demo control surface — invoked from inline onclick handlers in index.html.
	// ----------------------------------------------------------------------------

	demo_toggleMode(pInputHash)
	{
		let tmpProvider = this.pict.providers['Pict-Input-RichText'];
		if (!tmpProvider) return;
		tmpProvider.toggleMode(pInputHash, (pErr) =>
		{
			if (pErr && this.log) this.log.warn('[richtext_form demo] toggleMode error', { error: pErr.message });
			this._refreshModeLabel(pInputHash);
		});
	}

	demo_setAllowImages(pInputHash, pAllowed)
	{
		let tmpDescriptor = _FormDescriptors[pInputHash];
		if (tmpDescriptor) tmpDescriptor.PictForm.RichText.AllowImages = !!pAllowed;
	}

	demo_setUploaderEnabled(pEnabled)
	{
		this._imageUploaderEnabled = !!pEnabled;
	}

	_refreshModeLabel(pInputHash)
	{
		let tmpProvider = this.pict.providers['Pict-Input-RichText'];
		if (!tmpProvider) return;
		let tmpMode  = tmpProvider.getMode(pInputHash);
		let tmpLabel = (tmpMode === 'edit') ? 'Done' : 'Edit';
		let tmpBtn   = (typeof document !== 'undefined') ? document.getElementById('toggle-' + pInputHash) : null;
		if (tmpBtn) tmpBtn.textContent = tmpLabel;
	}
}

module.exports = RichTextFormApplication;

module.exports.default_configuration =
{
	Name: 'RichText Form Example',
	Hash: 'RichTextFormExample',
	pict_configuration:
	{
		Product: 'RichTextForm-Example',
		DefaultFormManifest: _FormManifest
	}
};
