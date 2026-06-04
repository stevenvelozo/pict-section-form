/**
 * Pict-Provider-Input-RichText.js
 *
 * A pict-section-form input provider that pairs the markdown editor
 * (edit mode) with rendered markdown (view mode). Boots in VIEW mode —
 * the heavy CodeMirror bundle isn't pulled until the host UI calls
 * `provider.setMode(pInputHash, 'edit')`.
 *
 * Descriptor shape:
 *
 *   {
 *     "Name": "Body",
 *     "Hash": "PostBody",
 *     "DataType": "String",
 *     "PictForm": {
 *       "InputType": "RichText",
 *       "RichText": {
 *         "AllowImages": true,
 *         "ImageUploader": "uploadImage",     // method on pict.PictApplication
 *         "Height": "400px",                  // applied to the slot in edit mode
 *         "EditorOptions": { ... },           // pass-through to markdowneditor
 *         "ViewerOptions": { ... }            // reserved for future use
 *       }
 *     }
 *   }
 *
 * Runtime API:
 *
 *   provider.setMode(inputHash, 'edit' | 'view', fCallback)
 *   provider.getMode(inputHash)            // 'edit' | 'view' | null (not mounted)
 *   provider.toggleMode(inputHash)         // convenience for buttons
 *   provider.commit(inputHash, fCallback)  // force-save edit-mode editor → form
 */

const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');
const libMarked                    = require('marked');

// Heavy markdown-editor dep — lazy-required on the first setMode('edit') so
// hosts that never edit (read-mostly forms) don't pull CodeMirror at module
// load.
let _MarkdownEditorClass = null;
function _resolveMarkdownEditor()
{
	if (_MarkdownEditorClass) return _MarkdownEditorClass;
	try
	{
		_MarkdownEditorClass = require('pict-section-markdowneditor');
	}
	catch (pErr)
	{
		throw new Error(
			'[Pict-Input-RichText] Cannot mount edit mode — ' +
			'pict-section-markdowneditor is not installed. ' +
			'Add it to your app\'s dependencies (it\'s an optional peer of pict-section-form).');
	}
	return _MarkdownEditorClass;
}

// Form templates live in pict-section-form's default-template set, so no
// runtime template injection is needed here. CSS still needs registering
// — the scoped slot styling lives next to the provider.
const libCSS = require('./Pict-Provider-Input-RichText-CSS.js');

const _DefaultProviderConfiguration =
{
	ProviderIdentifier: 'Pict-Input-RichText',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,

	AutoSolveWithApp: false
};

class PictInputRichText extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		/** @type {import('pict')} */ this.pict;
		/** @type {any}            */ this.log;

		// inputHash → { mode: 'view'|'edit', slotID, lastValue, viewInstance?: Pict-Section-MarkdownEditor, input }
		this._instances = {};

		// Register the scoped CSS for the slot.
		if (this.pict && this.pict.CSSMap && typeof this.pict.CSSMap.addCSS === 'function')
		{
			this.pict.CSSMap.addCSS('Pict-Input-RichText-CSS', libCSS, 500);
		}
	}

	// ----------------------------------------------------------------------------
	// Helpers
	// ----------------------------------------------------------------------------

	getContentDisplayHTMLID(pInputHTMLID)
	{
		return `#DISPLAY-FOR-${pInputHTMLID}`;
	}

	getTabularContentDisplayInputID(pInputHTMLID, pRowIndex)
	{
		return `#DISPLAY-FOR-TABULAR-${pInputHTMLID}-${pRowIndex}`;
	}

	/**
	 * Resolve a string value from various places the form may stash content.
	 */
	_resolveContent(pInput, pValue)
	{
		if (typeof pValue === 'string' && pValue.length > 0) return pValue;
		if (pInput && pInput.Content && typeof pInput.Content === 'string') return pInput.Content;
		if (pInput && pInput.Default && typeof pInput.Default === 'string') return pInput.Default;
		return '';
	}

	/**
	 * Render markdown to HTML. Falls back to escaping if marked throws.
	 */
	_renderMarkdown(pMarkdown)
	{
		try
		{
			return libMarked.parse(pMarkdown || '');
		}
		catch (pErr)
		{
			if (this.log) this.log.warn('[Pict-Input-RichText] marked.parse failed', { error: pErr.message });
			let tmpEscaped = String(pMarkdown || '').replace(/[&<>"]/g, (c) =>
				({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
			return `<pre>${tmpEscaped}</pre>`;
		}
	}

	_writeHiddenInputValue(pInputHTMLID, pValue)
	{
		// The hidden <input> the form template emits — referenced as just the
		// raw HTML ID (no #DISPLAY-FOR- prefix). Inform Informary of the change
		// via a dispatched event so the form's AppData updates downstream.
		let tmpEl = (typeof document !== 'undefined') ? document.getElementById(pInputHTMLID) : null;
		if (!tmpEl) return false;
		tmpEl.value = (pValue == null) ? '' : String(pValue);
		try
		{
			tmpEl.dispatchEvent(new Event('change', { bubbles: true }));
		}
		catch (pErr)
		{
			// jsdom-in-test sometimes lacks Event constructor; harmless in browser.
		}
		return true;
	}

	_assignSlotContent(pSlotID, pHTML)
	{
		if (this.pict && this.pict.ContentAssignment &&
			typeof this.pict.ContentAssignment.assignContent === 'function')
		{
			this.pict.ContentAssignment.assignContent(pSlotID, pHTML);
			return true;
		}
		return false;
	}

	// ----------------------------------------------------------------------------
	// View mode
	// ----------------------------------------------------------------------------

	_mountView(pView, pInput, pValue)
	{
		let tmpRawHTMLID = pInput.Macro.RawHTMLID;
		let tmpSlotID    = this.getContentDisplayHTMLID(tmpRawHTMLID);
		let tmpContent   = this._resolveContent(pInput, pValue);

		let tmpInnerHTML;
		if (tmpContent && tmpContent.length > 0)
		{
			tmpInnerHTML =
				`<div class="pict-section-form-richtext-view">${this._renderMarkdown(tmpContent)}</div>`;
		}
		else
		{
			tmpInnerHTML =
				`<div class="pict-section-form-richtext-view is-empty">(empty)</div>`;
		}

		this._assignSlotContent(tmpSlotID, tmpInnerHTML);

		// Mode flag on the outer slot so the optional toggle chip can pick the
		// right "Edit" / "Done" label via the ::after pseudo selector.
		if (typeof document !== 'undefined')
		{
			let tmpOuter = document.getElementById(tmpRawHTMLID + '-CONTAINER') ||
				document.querySelector(tmpSlotID);
			if (tmpOuter && tmpOuter.classList)
			{
				tmpOuter.classList.remove('mode-edit');
				tmpOuter.classList.add('mode-view');
			}
		}

		let tmpInst = this._instances[pInput.Hash] || {};
		tmpInst.mode      = 'view';
		tmpInst.slotID    = tmpSlotID;
		tmpInst.lastValue = tmpContent;
		tmpInst.input     = pInput;
		// If we previously held an editor, it's already been torn down by caller.
		tmpInst.viewInstance = null;
		this._instances[pInput.Hash] = tmpInst;
	}

	// ----------------------------------------------------------------------------
	// Edit mode
	// ----------------------------------------------------------------------------

	_buildEditorOptions(pInput, pValue, pInst)
	{
		let tmpRichTextOpts = (pInput.PictForm && pInput.PictForm.RichText) || {};
		let tmpEditorOpts   = tmpRichTextOpts.EditorOptions || {};
		let tmpRawHTMLID    = pInput.Macro.RawHTMLID;

		// Per-input AppData address for segments. Picked to be unlikely to collide
		// with anything a host app puts in AppData.
		let tmpSegmentsAddr = `AppData._PictInputRichText.${pInput.Hash}.Segments`;

		// Ensure the segments array exists at that address. Single segment per
		// editor — multi-segment is a power-feature the markdown editor itself
		// supports, but inside a single form field one segment is the right
		// surface.
		if (!this.pict.AppData._PictInputRichText)
		{
			this.pict.AppData._PictInputRichText = {};
		}
		this.pict.AppData._PictInputRichText[pInput.Hash] =
		{
			Segments: [{ Content: (pValue || '') }]
		};

		let tmpOptions = Object.assign({}, tmpEditorOpts,
		{
			ViewIdentifier:      `Pict-Input-RichText-Editor-${pInput.Hash}`,
			TargetElementAddress: this.getContentDisplayHTMLID(tmpRawHTMLID),
			ContentDataAddress:   tmpSegmentsAddr,
			ReadOnly:             false
		});

		return tmpOptions;
	}

	_mountEdit(pView, pInput, pValue, fCallback)
	{
		let tmpRawHTMLID = pInput.Macro.RawHTMLID;
		let tmpSlotID    = this.getContentDisplayHTMLID(tmpRawHTMLID);
		let tmpContent   = this._resolveContent(pInput, pValue);
		let tmpInst      = this._instances[pInput.Hash] || {};
		tmpInst.input    = pInput;

		// Clear view-mode content so the editor mounts into a clean slot.
		this._assignSlotContent(tmpSlotID, '');

		let tmpEditorOpts  = this._buildEditorOptions(pInput, tmpContent, tmpInst);
		let tmpViewHash    = tmpEditorOpts.ViewIdentifier;
		let tmpRichTextOpts = (pInput.PictForm && pInput.PictForm.RichText) || {};

		// Build a subclass that captures content changes back to the form's
		// hidden input. Subclassing is how pict-section-markdowneditor itself
		// is meant to be extended (its constructor accepts options + the parent
		// view class is libPictViewClass).
		let tmpProvider = this;

		// Lazy-resolve the markdown editor base class. Throws helpfully if the
		// peer dep is missing.
		let libMarkdownEditor;
		try { libMarkdownEditor = _resolveMarkdownEditor(); }
		catch (pErr)
		{
			if (this.log) this.log.error('[Pict-Input-RichText] ' + pErr.message);
			if (typeof fCallback === 'function') fCallback(pErr);
			return;
		}

		class RichTextFormEditor extends libMarkdownEditor
		{
			constructor(pSubFable, pSubOptions, pSubServiceHash)
			{
				super(pSubFable, pSubOptions, pSubServiceHash);
			}

			onContentChange(pSegmentIndex, pContent)
			{
				try
				{
					// Single-segment editor — every change replaces the value.
					tmpProvider._writeHiddenInputValue(tmpRawHTMLID, pContent);
					let tmpLatest = tmpProvider._instances[pInput.Hash];
					if (tmpLatest) tmpLatest.lastValue = pContent;
				}
				catch (pErr)
				{
					if (tmpProvider.log)
					{
						tmpProvider.log.warn('[Pict-Input-RichText] onContentChange handler failed',
							{ error: pErr.message, inputHash: pInput.Hash });
					}
				}
				if (super.onContentChange) super.onContentChange(pSegmentIndex, pContent);
			}

			onImageUpload(pFile, pSegmentIndex, fImgCallback)
			{
				if (!tmpRichTextOpts.AllowImages)
				{
					if (tmpProvider.log)
					{
						tmpProvider.log.info('[Pict-Input-RichText] image upload rejected (AllowImages=false)',
							{ inputHash: pInput.Hash, fileName: pFile && pFile.name });
					}
					// Returning false lets the base markdown editor fall through to
					// its default base64 inline; we *don't* want that when text-only,
					// so we eat the file by calling back with an error.
					fImgCallback('Image uploads are disabled for this field.');
					return true;
				}

				let tmpUploaderName = tmpRichTextOpts.ImageUploader;
				if (tmpUploaderName &&
					tmpProvider.pict && tmpProvider.pict.PictApplication &&
					typeof tmpProvider.pict.PictApplication[tmpUploaderName] === 'function')
				{
					try
					{
						return tmpProvider.pict.PictApplication[tmpUploaderName](pFile, pInput, fImgCallback);
					}
					catch (pErr)
					{
						if (tmpProvider.log)
						{
							tmpProvider.log.warn('[Pict-Input-RichText] ImageUploader threw',
								{ error: pErr.message, inputHash: pInput.Hash });
						}
						fImgCallback(pErr.message);
						return true;
					}
				}

				// No uploader configured + AllowImages=true → default base64 inline.
				return false;
			}
		}

		this.pict.addView(tmpViewHash, tmpEditorOpts, RichTextFormEditor);
		let tmpEditorView = this.pict.views[tmpViewHash];

		if (!tmpEditorView)
		{
			let tmpErr = new Error('Failed to instantiate RichText editor view ' + tmpViewHash);
			if (this.log) this.log.error('[Pict-Input-RichText] addView returned nothing', { viewHash: tmpViewHash });
			if (typeof fCallback === 'function') fCallback(tmpErr);
			return;
		}

		// Surface mode on the outer slot for the optional toggle-chip pseudo.
		if (typeof document !== 'undefined')
		{
			let tmpOuter = document.querySelector(tmpSlotID);
			if (tmpOuter && tmpOuter.classList)
			{
				tmpOuter.classList.remove('mode-view');
				tmpOuter.classList.add('mode-edit', 'pict-section-form-richtext-edit');
			}
		}

		tmpInst.mode         = 'edit';
		tmpInst.slotID       = tmpSlotID;
		tmpInst.lastValue    = tmpContent;
		tmpInst.viewInstance = tmpEditorView;
		tmpInst.viewHash     = tmpViewHash;
		this._instances[pInput.Hash] = tmpInst;

		// Render the editor. The view's render() resolves TargetElementAddress
		// against ContentAssignment and paints into the slot.
		try
		{
			let tmpResult = tmpEditorView.render();
			// Some renders are async (Promise-returning) and some are sync.
			if (tmpResult && typeof tmpResult.then === 'function')
			{
				tmpResult.then(
					() => { if (typeof fCallback === 'function') fCallback(null); },
					(pRenderErr) => { if (typeof fCallback === 'function') fCallback(pRenderErr); }
				);
			}
			else
			{
				if (typeof fCallback === 'function') fCallback(null);
			}
		}
		catch (pErr)
		{
			if (this.log) this.log.error('[Pict-Input-RichText] editor.render threw', { error: pErr.message });
			if (typeof fCallback === 'function') fCallback(pErr);
		}
	}

	_destroyEdit(pInput)
	{
		let tmpInst = this._instances[pInput.Hash];
		if (!tmpInst || !tmpInst.viewInstance) return;

		let tmpView = tmpInst.viewInstance;

		try
		{
			if (typeof tmpView.destroy === 'function')
			{
				tmpView.destroy();
			}
		}
		catch (pErr)
		{
			if (this.log) this.log.warn('[Pict-Input-RichText] editor.destroy threw', { error: pErr.message });
		}

		// Drop the per-input AppData branch (we re-seed on next edit-mode mount).
		if (this.pict.AppData._PictInputRichText &&
			this.pict.AppData._PictInputRichText[pInput.Hash])
		{
			delete this.pict.AppData._PictInputRichText[pInput.Hash];
		}

		// Remove the view registration so subsequent mounts re-register cleanly.
		if (tmpInst.viewHash && this.pict.views && this.pict.views[tmpInst.viewHash])
		{
			try { delete this.pict.views[tmpInst.viewHash]; }
			catch (pErr) { /* not all environments allow delete on this collection */ }
		}

		tmpInst.viewInstance = null;
		tmpInst.viewHash     = null;
	}

	// ----------------------------------------------------------------------------
	// Public runtime API
	// ----------------------------------------------------------------------------

	getMode(pInputHash)
	{
		let tmpInst = this._instances[pInputHash];
		return tmpInst ? tmpInst.mode : null;
	}

	setMode(pInputHash, pMode, fCallback)
	{
		let tmpInst = this._instances[pInputHash];
		if (!tmpInst)
		{
			let tmpErr = new Error('Cannot setMode — input is not mounted: ' + pInputHash);
			if (typeof fCallback === 'function') fCallback(tmpErr);
			return;
		}

		if (pMode !== 'edit' && pMode !== 'view')
		{
			let tmpErr = new Error('setMode: unknown mode "' + pMode + '" (use "edit" or "view")');
			if (typeof fCallback === 'function') fCallback(tmpErr);
			return;
		}

		if (tmpInst.mode === pMode)
		{
			if (typeof fCallback === 'function') fCallback(null);
			return;
		}

		if (pMode === 'edit')
		{
			this._mountEdit(null, tmpInst.input, tmpInst.lastValue, fCallback);
			return;
		}

		// pMode === 'view': pull the latest, tear down editor, re-render view.
		this._destroyEdit(tmpInst.input);
		this._mountView(null, tmpInst.input, tmpInst.lastValue);
		if (typeof fCallback === 'function') fCallback(null);
	}

	toggleMode(pInputHash, fCallback)
	{
		let tmpMode = this.getMode(pInputHash);
		let tmpNext = (tmpMode === 'edit') ? 'view' : 'edit';
		this.setMode(pInputHash, tmpNext, fCallback);
	}

	commit(pInputHash, fCallback)
	{
		let tmpInst = this._instances[pInputHash];
		if (!tmpInst || tmpInst.mode !== 'edit' || !tmpInst.viewInstance)
		{
			if (typeof fCallback === 'function') fCallback(null);
			return;
		}
		// The editor writes through onContentChange on every keystroke, so the
		// hidden input is already up to date. We just confirm.
		if (typeof fCallback === 'function') fCallback(null);
	}

	// ----------------------------------------------------------------------------
	// Lifecycle hooks (called by pict-section-form during form rendering)
	// ----------------------------------------------------------------------------

	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		this._mountView(pView, pInput, pValue);
		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		let tmpErr = new Error('RichText InputType is not supported inside Tabular rows in Phase 1.');
		if (this.log) this.log.warn('[Pict-Input-RichText] tabular not supported', { inputHash: pInput && pInput.Hash });
		throw tmpErr;
	}

	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		let tmpInst = this._instances[pInput.Hash];
		if (!tmpInst)
		{
			// First time seeing this input — boot in view mode.
			this._mountView(pView, pInput, pValue);
		}
		else if (tmpInst.mode === 'view')
		{
			this._mountView(pView, pInput, pValue);
		}
		else
		{
			// Edit mode: push the new value into the editor's segment store.
			tmpInst.lastValue = (typeof pValue === 'string') ? pValue : tmpInst.lastValue;
			if (this.pict.AppData._PictInputRichText &&
				this.pict.AppData._PictInputRichText[pInput.Hash])
			{
				this.pict.AppData._PictInputRichText[pInput.Hash].Segments =
					[{ Content: tmpInst.lastValue }];
				// Re-render the editor so it picks up the new segments.
				if (tmpInst.viewInstance && typeof tmpInst.viewInstance.render === 'function')
				{
					try { tmpInst.viewInstance.render(); }
					catch (pErr)
					{
						if (this.log) this.log.warn('[Pict-Input-RichText] re-render after marshal threw',
							{ error: pErr.message });
					}
				}
			}
		}
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		// Tabular is unsupported — silent no-op (the initialize step already threw).
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}
}

module.exports = PictInputRichText;
module.exports.default_configuration = _DefaultProviderConfiguration;
