const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

const libMarked = require('marked');

/**
 * CustomInputHandler class.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class CustomInputHandler extends libPictSectionInputExtension
{
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

	getInputContent(pInput, pValue)
	{
		let tmpContent = null;
		if (pValue && (typeof(pValue) === 'string'))
		{
			tmpContent = pValue;
		}
		if (pInput.Content && (typeof(pInput.Content) === 'string'))
		{
			tmpContent = pInput.Content;
		}
		if (pInput.Default && (typeof(pInput.Default) === 'string'))
		{
			tmpContent = pInput.Default;
		}

		if (tmpContent)
		{
			tmpContent = libMarked.parse(tmpContent);
		}
		return tmpContent;
	}

	/**
	 * Initializes the input element for the Pict provider select input.
	 *
	 * @param {Object} pView - The view object.
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
		let tmpContent = this.getInputContent(pInput, pValue);
		if (tmpContent)
		{
			this.pict.ContentAssignment.assignContent(this.getContentDisplayHTMLID(pInput.Macro.RawHTMLID), tmpContent);
		}
		return super.onInputInitialize(pView, pGroup, pRow, pInput, tmpContent, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Initializes a tabular input element.
	 *
	 * @param {Object} pView - The view object.
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
		let tmpContent = this.getInputContent(pInput, pValue);
		if (tmpContent)
		{
			this.pict.ContentAssignment.assignContent(this.getTabularContentDisplayInputID(pInput.Macro.RawHTMLID, pRowIndex), tmpContent);
		}
		return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}

	/**
	 * Marshals data to the form for the given input.
	 *
	 * @param {Object} pView - The view object.
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
		let tmpContent = this.getInputContent(pInput, pValue);
		if (tmpContent)
		{
			this.pict.ContentAssignment.assignContent(this.getContentDisplayHTMLID(pInput.Macro.RawHTMLID), tmpContent);
		}
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector, pTransactionGUID);
	}

	/**
	 * Marshals data to a form in tabular format.
	 *
	 * @param {Object} pView - The view object.
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
		let tmpContent = this.getInputContent(pInput, pValue);
		if (tmpContent)
		{
			this.pict.ContentAssignment.assignContent(this.getTabularContentDisplayInputID(pInput.Macro.RawHTMLID, pRowIndex), tmpContent);
		}
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex, pTransactionGUID);
	}
}

module.exports = CustomInputHandler;
