const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * Input provider for simple templated content display.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class TemplatedInputProvider extends libPictSectionInputExtension
{
	/**
	 * @param {import('fable')} pFable - The Fable instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict')} */
		this.fable;
		/** @type {any} */
		this.log;
	}

	/**
	 * Generates the HTML ID for a content display input element.
	 *
	 * @param {string} pInputHTMLID - The HTML ID of the input element.
	 * @returns {string} - The generated HTML ID for the content display input element.
	 */
	getContentDisplayHTMLID(pInputHTMLID)
	{
		return `#DISPLAY-FOR-${pInputHTMLID}`;
	}

	/**
	 * Generates a tabular content display input ID based on the provided input HTML ID and row index.
	 *
	 * @param {string} pInputHTMLID - The input HTML ID.
	 * @param {number} pRowIndex - The row index.
	 * @returns {string} - The generated tabular content display input ID.
	 */
	getTabularContentDisplayInputID(pInputHTMLID, pRowIndex)
	{
		return `#DISPLAY-FOR-TABULAR-${pInputHTMLID}-${pRowIndex}`;
	}

	/**
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {number} [pRowIndex] - (optional) The row index for tabular data.
	 *
	 * @return {void}
	 */
	handleContentUpdate(pView, pInput, pValue, pRowIndex)
	{
		let tmpContent = '';
		if (pValue && (typeof(pValue) === 'string'))
		{
			tmpContent = pValue;
		}
		let tmpIsLocked = false;
		//TODO: support more templates
		//TODO: support "locked" content?
		if (!tmpIsLocked && pInput.PictForm && pInput.PictForm.Template && (typeof(pInput.PictForm.Template) === 'string'))
		{
			tmpContent = this.pict.parseTemplate(pInput.PictForm.Template, Object.assign({}, this.pict, { Data: pView.getMarshalDestinationObject() }), null, [this], this);
		}
		if (!tmpContent && !tmpIsLocked && pInput.Default && (typeof(pInput.Default) === 'string'))
		{
			tmpContent = pInput.Default;
		}

		if (pRowIndex != null)
		{
			pView.setDataTabularByHash(pInput.PictForm.GroupIndex, pInput.Hash, pRowIndex, tmpContent);
		}
		else
		{
			pView.setDataByInput(pInput, tmpContent);
		}
	}

	/**
	 * Initializes the input element for the Pict provider select input.
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
	 */
	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		this._handleInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, null, pTransactionGUID);
		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Initializes a tabular input element.
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the initialization.
	 */
	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		this._handleInitialize(pView, pGroup, null, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
		return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * Initializes a tabular input element.
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object|null} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number|null} pRowIndex - The index of the row.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the initialization.
	 */
	_handleInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		if (pInput.PictForm && pInput.PictForm.Templates && typeof pInput.PictForm.Templates === 'object' && !Array.isArray(pInput.PictForm.Templates))
		{
			for (const [ tmpTemplateHash, tmpTemplate ] of Object.entries(pInput.PictForm.Templates))
			{
				if (this.pict.TemplateProvider.templates[tmpTemplateHash])
				{
					this.pict.log.error(`[Pict-Input-Templated] Attempt to override template with hash: ${tmpTemplateHash}; skipping.`);
					continue;
				}
				this.pict.TemplateProvider.addTemplate(tmpTemplateHash, tmpTemplate, `Templated Input hash: ${pInput.Hash}`);
			}
		}
		this.handleContentUpdate(pView, pInput, pValue);
	}

	/**
	 * Marshals data to the form for the given input.
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be marshaled.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID)
	{
		this.pict.ContentAssignment.assignContent(this.getContentDisplayHTMLID(pInput.Macro.RawHTMLID), pValue);
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Marshals data to a form in tabular format.
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value parameter.
	 * @param {string} pHTMLSelector - The HTML selector parameter.
	 * @param {number} pRowIndex - The row index parameter.
	 * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
	 * @returns {any} - The result of the data marshaling.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID)
	{
		this.pict.ContentAssignment.assignContent(this.getTabularContentDisplayInputID(pInput.Macro.RawHTMLID, pRowIndex), pValue);
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * This input extension only responds to events
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value from AppData.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {string} pEvent - The event hash that is expected to be triggered.
	 * @param {string} pTransactionGUID - The transaction GUID, if any.
	 * @returns {boolean} - Returns true.
	 */
	onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID)
	{
		const tmpPayload = typeof pEvent === 'string' ? pEvent : '';
		let [ tmpType, tmpGroupHash ] = tmpPayload.split(':');

		if (tmpType !== 'TriggerGroup')
		{
			return super.onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID);
		}

		const tmpTriggerGroupHashes = Array.isArray(pInput.PictForm?.TriggerGroupHash) ? pInput.PictForm.TriggerGroupHash : [pInput.PictForm?.TriggerGroupHash];
		if (!pInput.PictForm || !pInput.PictForm.TriggerGroupHash || !tmpTriggerGroupHashes.includes(tmpGroupHash))
		{
			return super.onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID);
		}
		this.handleContentUpdate(pView, pInput, pValue);
		pView.manualMarshalDataToViewByInput(pInput, pTransactionGUID);
		return super.onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID);
	}

	/**
	 * Handles events for the Pict-Provider-InputExtension.
	 *
	 * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value from AppData.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index of the tabular data.
	 * @param {string} pEvent - The event hash that is expected to be triggered.
	 * @param {string} pTransactionGUID - The transaction GUID, if any.
	 * @returns {boolean} - Returns true.
	 */
	onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID)
	{
		const tmpPayload = typeof pEvent === 'string' ? pEvent : '';
		let [ tmpType, tmpGroupHash ] = tmpPayload.split(':');

		if (tmpType !== 'TriggerGroup')
		{
			return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
		}

		const tmpTriggerGroupHashes = Array.isArray(pInput.PictForm?.TriggerGroupHash) ? pInput.PictForm.TriggerGroupHash : [pInput.PictForm?.TriggerGroupHash];
		if (!pInput.PictForm || !pInput.PictForm.TriggerGroupHash || !tmpTriggerGroupHashes.includes(tmpGroupHash))
		{
			return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
		}
		this.handleContentUpdate(pView, pInput, pValue, pRowIndex);
		pView.manualMarshalTabularDataToViewByInput(pInput, pRowIndex, pTransactionGUID);
		return super.onAfterEventTabularCompletion(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
	}
}

module.exports = TemplatedInputProvider;
