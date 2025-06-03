const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * CustomInputHandler class.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
class LinkInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict') & { Math: any } & { DataFormat: any }} */
		this.fable;
		/** @type {any} */
		this.log;
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
	 * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		this.pict.ContentAssignment.setAttribute(this.getInputHTMLID(pInput.Macro.RawHTMLID), 'href', pValue);
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
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
	 * @returns {any} - The result of the data marshaling.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		this.pict.ContentAssignment.setAttribute(this.getTabularInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex), 'href', pValue);
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = LinkInputHandler;
