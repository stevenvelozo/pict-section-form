/**
 * Pict-Provider-Input-ObjectEditor.js
 *
 * A pict-section-form input provider that embeds pict-section-objecteditor as
 * an interactive JSON-object editor. In edit mode the tree is editable
 * (Editable:true); in view / read-only mode the same tree renders read-only
 * (Editable:false). Unlike the Diagram input, the object editor is a light,
 * pure-JS view, so there is no lazy heavy-bundle split — both modes mount the
 * same view and only the Editable flag differs.
 *
 * The object the editor mutates lives in a per-input AppData stash at
 *
 *   AppData._PictInputObjectEditor.<InputHash>.Data
 *
 * The object editor mutates that object in place. On a data request (the form
 * gathering its values for a save) the stash is serialized to JSON and written
 * into the input's hidden field, so the form marshals it like any other value.
 *
 * Incoming values may be a live object OR a JSON string — both are accepted.
 *
 * Descriptor shape:
 *
 *   {
 *     "Name": "Custom Properties",
 *     "Hash": "CustomProperties",
 *     "DataType": "Object",
 *     "PictForm": {
 *       "InputType": "ObjectEditor",
 *       "ReadOnly": false,                 // true renders a read-only tree
 *       "ObjectEditor": {                  // all optional
 *         "Editable":           true,      // explicit override of ReadOnly
 *         "InitialExpandDepth": 2
 *       }
 *     }
 *   }
 *
 * Runtime API (parity with the other section inputs):
 *
 *   provider.setMode(inputHash, 'edit' | 'view', fCallback)
 *   provider.getMode(inputHash)
 *   provider.toggleMode(inputHash)
 *   provider.commit(inputHash, fCallback)
 */

const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');
const libPictSectionObjectEditor   = require('pict-section-objecteditor');

const _DefaultProviderConfiguration =
{
	ProviderIdentifier: 'Pict-Input-ObjectEditor',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,

	AutoSolveWithApp: false
};

/**
 * @typedef {Object} Instance
 * @property {string} mode - 'edit' or 'view'
 * @property {string} slotID - The HTML ID selector of the content slot for this input
 * @property {Object} viewInstance - The object editor view instance
 * @property {string} viewHash - The hash of the object editor view
 * @property {Object} input - The input definition object
 */

class PictInputObjectEditor extends libPictSectionInputExtension
{
	/**
	 * Creates an instance of the PictInputObjectEditor class.
	 *
	 * @param {import('pict')} pFable - The Pict instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		/** @type {import('pict')} */ this.pict;
		/** @type {any}            */ this.log;

		// inputHash -> Instance
		/** @type {Record<String, Instance>} */
		this._instances = {};
	}

	// ----------------------------------------------------------------------------
	// Helpers
	// ----------------------------------------------------------------------------

	/**
	 * @param {string} pInputHTMLID - The RawHTMLID of the input.
	 * @returns {string} The HTML ID selector for the content display slot.
	 */
	getContentDisplayHTMLID(pInputHTMLID)
	{
		return `#DISPLAY-FOR-${pInputHTMLID}`;
	}

	/**
	 * The AppData address where this input's editable object is stashed.
	 *
	 * @param {string} pInputHash - The input Hash.
	 * @returns {string} The dotted AppData address the object editor binds to.
	 */
	getObjectDataAddress(pInputHash)
	{
		return `AppData._PictInputObjectEditor.${pInputHash}.Data`;
	}

	/**
	 * Resolve the incoming value to a plain object, accepting either a live
	 * object or a JSON string. Falls back to the input's Content / Default /
	 * an empty object.
	 *
	 * @param {Object} pInput - The input definition object.
	 * @param {any} pValue - The value provided for the input.
	 * @returns {Object} The resolved object to edit/display.
	 */
	_resolveValue(pInput, pValue)
	{
		let tmpCandidate = pValue;
		if (tmpCandidate === null || typeof tmpCandidate === 'undefined' || tmpCandidate === '')
		{
			if (pInput && typeof pInput.Content !== 'undefined' && pInput.Content !== null && pInput.Content !== '')
			{
				tmpCandidate = pInput.Content;
			}
			else if (pInput && typeof pInput.Default !== 'undefined' && pInput.Default !== null && pInput.Default !== '')
			{
				tmpCandidate = pInput.Default;
			}
		}

		if (typeof tmpCandidate === 'string')
		{
			let tmpTrimmed = tmpCandidate.trim();
			if (tmpTrimmed.length < 1)
			{
				return {};
			}
			try
			{
				let tmpParsed = JSON.parse(tmpTrimmed);
				return (tmpParsed && typeof tmpParsed === 'object') ? tmpParsed : { Value: tmpParsed };
			}
			catch (pErr)
			{
				if (this.log)
				{
					this.log.warn('[Pict-Input-ObjectEditor] value was a non-JSON string; wrapping as { Value }',
						{ error: pErr.message });
				}
				return { Value: tmpCandidate };
			}
		}

		if (tmpCandidate && typeof tmpCandidate === 'object')
		{
			return tmpCandidate;
		}

		return {};
	}

	/**
	 * Determine whether the editor should be editable for this input. An
	 * explicit PictForm.ObjectEditor.Editable boolean wins; otherwise the tree
	 * is editable unless PictForm.ReadOnly is true.
	 *
	 * @param {Object} pInput - The input definition object.
	 * @returns {boolean} True if the tree should be editable.
	 */
	_resolveEditable(pInput)
	{
		let tmpPictForm = (pInput && pInput.PictForm) || {};
		if (tmpPictForm.ObjectEditor && typeof tmpPictForm.ObjectEditor.Editable === 'boolean')
		{
			return tmpPictForm.ObjectEditor.Editable;
		}
		return (tmpPictForm.ReadOnly !== true);
	}

	/**
	 * Ensure the per-input AppData stash exists and return its wrapper.
	 *
	 * @param {string} pInputHash - The input Hash.
	 * @returns {Object} The stash wrapper { Data }.
	 */
	_ensureStash(pInputHash)
	{
		if (!this.pict.AppData._PictInputObjectEditor)
		{
			this.pict.AppData._PictInputObjectEditor = {};
		}
		if (!this.pict.AppData._PictInputObjectEditor[pInputHash])
		{
			this.pict.AppData._PictInputObjectEditor[pInputHash] = { Data: {} };
		}
		return this.pict.AppData._PictInputObjectEditor[pInputHash];
	}

	/**
	 * @param {string} pInputHash - The input Hash.
	 * @returns {Object} The current edited object from the stash.
	 */
	_currentObject(pInputHash)
	{
		return this._ensureStash(pInputHash).Data;
	}

	/**
	 * Serialize an object into the input's hidden field.
	 *
	 * @param {string} pInputHTMLID - The RawHTMLID of the input.
	 * @param {Object} pObject - The object to serialize.
	 * @param {boolean} [pDispatchChange] - When true, dispatch a DOM change event.
	 * @returns {boolean} True if the value was written.
	 */
	_writeHiddenInputValue(pInputHTMLID, pObject, pDispatchChange)
	{
		let tmpEl = (typeof document !== 'undefined') ? document.getElementById(pInputHTMLID) : null;
		if (!tmpEl) return false;

		let tmpString = '';
		try
		{
			tmpString = (pObject === null || typeof pObject === 'undefined') ? '' : JSON.stringify(pObject);
		}
		catch (pErr)
		{
			if (this.log)
			{
				this.log.warn('[Pict-Input-ObjectEditor] could not stringify object for hidden input',
					{ error: pErr.message });
			}
			tmpString = '';
		}
		tmpEl.value = tmpString;

		if (pDispatchChange)
		{
			try { tmpEl.dispatchEvent(new Event('change', { bubbles: true })); }
			catch (pErr) { /* jsdom may lack Event */ }
		}
		return true;
	}

	// ----------------------------------------------------------------------------
	// Mount / render
	// ----------------------------------------------------------------------------

	/**
	 * Mount (or re-render) the object editor for an input. Re-uses the view
	 * instance across re-renders, re-painting into the (possibly fresh) slot.
	 *
	 * @param {Object} pInput - The input definition object.
	 * @param {any} pValue - The value to edit/display.
	 * @param {boolean} pEditable - Whether the tree is editable.
	 * @param {Function} [fCallback] - Optional completion callback.
	 */
	_mount(pInput, pValue, pEditable, fCallback)
	{
		let tmpRawHTMLID = pInput.Macro.RawHTMLID;
		let tmpSlotID    = this.getContentDisplayHTMLID(tmpRawHTMLID);
		let tmpViewHash  = `Pict-Input-ObjectEditor-${pInput.Hash}`;

		// Seed the per-input stash with the resolved object (the editor mutates
		// this object in place).
		let tmpStash = this._ensureStash(pInput.Hash);
		tmpStash.Data = this._resolveValue(pInput, pValue);

		let tmpView = this.pict.views[tmpViewHash];
		if (!tmpView)
		{
			let tmpOverrides = (pInput.PictForm && pInput.PictForm.ObjectEditor) || {};
			let tmpEditorOptions =
			{
				ViewIdentifier:    tmpViewHash,
				AutoRender:        false,
				Editable:          pEditable,
				ObjectDataAddress: this.getObjectDataAddress(pInput.Hash),
				// Point this instance's container renderable at our own slot so
				// multiple editors on a page never share a destination.
				Renderables:
				[
					{
						RenderableHash:     'ObjectEditor-Container',
						TemplateHash:       'ObjectEditor-Container-Template',
						// pict-view resolves a renderable's destination from ContentDestinationAddress
						// (see Pict-View.buildRenderOptions). A bare DestinationAddress is ignored, so the
						// container template never painted into the slot and the tree had nowhere to mount.
						ContentDestinationAddress: tmpSlotID,
						RenderMethod:       'replace'
					}
				]
			};
			if (typeof tmpOverrides.InitialExpandDepth === 'number')
			{
				tmpEditorOptions.InitialExpandDepth = tmpOverrides.InitialExpandDepth;
			}

			this.pict.addView(tmpViewHash, tmpEditorOptions, libPictSectionObjectEditor);
			tmpView = this.pict.views[tmpViewHash];
			// The object editor builds its per-type node renderers in onBeforeInitialize; a view added
			// after the boot cycle isn't initialized automatically, so initialize it before first render.
			if (tmpView && typeof tmpView.initialize === 'function') { tmpView.initialize(); }
		}
		else
		{
			// Re-use: update the mutable option before re-rendering into the slot.
			tmpView.options.Editable = pEditable;
		}

		if (!tmpView)
		{
			let tmpErr = new Error('Failed to instantiate ObjectEditor view ' + tmpViewHash);
			if (this.log) this.log.error('[Pict-Input-ObjectEditor] addView returned nothing', { viewHash: tmpViewHash });
			if (typeof fCallback === 'function') fCallback(tmpErr);
			return;
		}

		let tmpInst = this._instances[pInput.Hash] || {};
		tmpInst.mode         = pEditable ? 'edit' : 'view';
		tmpInst.slotID       = tmpSlotID;
		tmpInst.viewInstance = tmpView;
		tmpInst.viewHash     = tmpViewHash;
		tmpInst.input        = pInput;
		this._instances[pInput.Hash] = tmpInst;

		try
		{
			// Render the container into the CURRENT slot explicitly. The host slot's RawHTMLID is
			// regenerated on every form re-render, so a re-used view instance would otherwise paint into
			// its original (now-removed) slot; passing the destination here re-points it every mount.
			let tmpResult = tmpView.render('ObjectEditor-Container', tmpSlotID);
			if (tmpResult && typeof tmpResult.then === 'function')
			{
				tmpResult.then(
					() => { if (typeof fCallback === 'function') fCallback(null); },
					(pErr) => { if (typeof fCallback === 'function') fCallback(pErr); }
				);
			}
			else if (typeof fCallback === 'function')
			{
				fCallback(null);
			}
		}
		catch (pErr)
		{
			if (this.log) this.log.error('[Pict-Input-ObjectEditor] render threw', { error: pErr.message });
			if (typeof fCallback === 'function') fCallback(pErr);
		}
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
		this._mount(tmpInst.input, this._currentObject(pInputHash), (pMode === 'edit'), fCallback);
	}

	toggleMode(pInputHash, fCallback)
	{
		let tmpMode = this.getMode(pInputHash);
		let tmpNext = (tmpMode === 'edit') ? 'view' : 'edit';
		this.setMode(pInputHash, tmpNext, fCallback);
	}

	/**
	 * Flush the current edited object to the input's hidden field.
	 *
	 * @param {string} pInputHash - The input Hash.
	 * @param {Function} [fCallback] - Optional completion callback.
	 */
	commit(pInputHash, fCallback)
	{
		let tmpInst = this._instances[pInputHash];
		if (!tmpInst)
		{
			if (typeof fCallback === 'function') fCallback(null);
			return;
		}
		this._writeHiddenInputValue(tmpInst.input.Macro.RawHTMLID, this._currentObject(pInputHash), true);
		if (typeof fCallback === 'function') fCallback(null);
	}

	// ----------------------------------------------------------------------------
	// Lifecycle hooks
	// ----------------------------------------------------------------------------

	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		this._mount(pInput, pValue, this._resolveEditable(pInput));
		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * The ObjectEditor InputType is not supported inside Tabular rows.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group definition object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value of the input object.
	 * @param {string} pHTMLSelector - The HTML selector for the input object.
	 * @param {number} pRowIndex - The row index of the tabular data.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @return {boolean}
	 */
	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
		let tmpErr = new Error('ObjectEditor InputType is not supported inside Tabular rows.');
		if (this.log) this.log.warn('[Pict-Input-ObjectEditor] tabular not supported', { inputHash: pInput && pInput.Hash });
		throw tmpErr;
	}

	/**
	 * Fires when data is marshaled to the form for this input — re-seed the
	 * stash with the fresh value and re-paint, preserving the current mode.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group definition object.
	 * @param {number} pRow - The Row index.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to marshal.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean}
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		let tmpInst = this._instances[pInput.Hash];
		let tmpEditable = tmpInst ? (tmpInst.mode === 'edit') : this._resolveEditable(pInput);
		this._mount(pInput, pValue, tmpEditable);
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Fires when the form gathers this input's value (the save direction).
	 * Serialize the (in-place-mutated) stash into the hidden field so the form
	 * marshals the latest object. No change dispatch — this is a read.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value from AppData.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @returns {boolean}
	 */
	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		if (this._instances[pInput.Hash])
		{
			this._writeHiddenInputValue(pInput.Macro.RawHTMLID, this._currentObject(pInput.Hash), false);
		}
		return super.onDataRequest(pView, pInput, pValue, pHTMLSelector);
	}
}

module.exports = PictInputObjectEditor;
module.exports.default_configuration = _DefaultProviderConfiguration;
