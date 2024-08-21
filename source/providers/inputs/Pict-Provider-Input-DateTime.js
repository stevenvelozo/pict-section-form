const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * CustomInputHandler class.
 * Represents a custom input handler for a Pict section form.
 * @extends libPictSectionInputExtension
 */
class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Generates the HTML ID for a DateTime input element based on the given input HTML ID.
	 *
	 * @param {string} pInputHTMLID - The input HTML ID.
	 * @returns {string} The generated DateTime input HTML ID.
	 */
	getDateTimeInputHTMLID(pInputHTMLID)
	{
		return `#DATETIME-INPUT-FOR-${pInputHTMLID}`;
	}

	/**
	 * Generates the HTML ID for a hidden input element in a tabular datetime data provider.
	 *
	 * @param {string} pInputHTMLID - The HTML ID of the input element.
	 * @param {number} pRowIndex - The index of the row in the tabular data.
	 * @returns {string} - The generated HTML ID for the hidden input element.
	 */
	getTabularDateTimeHiddenInputHTMLID(pInputHTMLID, pRowIndex)
	{
		return `#DATETIME-TABULAR-DATA-${pInputHTMLID}-${pRowIndex}`;
	}

	/**
	 * Generates a tabular date-time input HTML ID based on the provided input HTML ID and row index.
	 *
	 * @param {string} pInputHTMLID - The input HTML ID.
	 * @param {number} pRowIndex - The row index.
	 * @returns {string} The tabular date-time input HTML ID.
	 */
	getTabularDateTimeInputHTMLID(pInputHTMLID, pRowIndex)
	{
		return `#DATETIME-TABULAR-INPUT-${pInputHTMLID}-${pRowIndex}`;
	}

	/**
	 * Fires after data has been marshaled to the form.
	 * 
	 * This is important because the DateTime has a "shadow" hidden input that stores the value for the date control.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be assigned.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @returns {any} - The result of the super method call.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		this.pict.ContentAssignment.assignContent(this.getDateTimeInputHTMLID(pInput.Macro.RawHTMLID), pValue);
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
	}

	/**
	 * Marshals data to the form in a tabular format.
	 * 
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be assigned.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @returns {any} - The result of the data marshaling.
	 */
	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		this.pict.ContentAssignment.assignContent(this.getTabularDateTimeInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex), pValue);
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	/**
	 * Handles the data request event for the specified input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be assigned.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @returns {boolean} - Returns true if the data request is successful, otherwise false.
	 */
	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		// TODO: Should this be opinionated about time zone?  If so, this is the start of it.
		// let tmpDateTimeElement = this.pict.ContentAssignment.getElement(this.getDateTimeInputHTMLID(pInput.Macro.RawHTMLID));
		// if (tmpDateTimeElement && tmpDateTimeElement.length > 0)
		// {
		// 	tmpDateTimeElement = tmpDateTimeElement[0];
		// }
		// else
		// {
		// 	return false;
		// }
		//let tmpDateValue = this.fable.Dates.dayJS(tmpDateTimeElement.value);

		try
		{
			let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getDateTimeInputHTMLID(pInput.Macro.RawHTMLID));
			this.pict.ContentAssignment.assignContent(pHTMLSelector, tmpInputSelectValue);
			pView.dataChanged(pInput.Hash);
		}
		catch
		{
			this.pict.log.error(`The value [${tmpDateTimeElement.value}] is not a valid date; skipping parsing for [#${pInput.Macro.RawHTMLID}].`);
		}

		return super.onDataRequest(pView, pInput, pValue, pHTMLSelector);
	}

	/**
	 * Handles the data request event for the specified input when in a tabular section.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be assigned.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @returns {boolean} - Returns true if the data request is successful, otherwise false.
	 */
	onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		// TODO: If we decide to be opinionated about time zone, use the above here as well
		try
		{
			let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getTabularDateTimeInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex));
			this.pict.ContentAssignment.assignContent(this.getTabularDateTimeHiddenInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex), tmpInputSelectValue);
			pView.dataChangedTabular(pInput.PictForm.GroupIndex, pInput.PictForm.InputIndex, pRowIndex);
		}
		catch
		{
			this.pict.log.error(`The value [${tmpDateTimeElement.value}] is not a valid date; skipping parsing for [#${pInput.Macro.RawHTMLID}].`);
		}

		return super.onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = CustomInputHandler;