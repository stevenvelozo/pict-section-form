const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	getDateTimeInputHTMLID(pInputHTMLID)
	{
		return `#DATETIME-INPUT-FOR-${pInputHTMLID}`;
	}

	getTabularDateTimeHiddenInputHTMLID(pInputHTMLID, pRowIndex)
	{
		return `#DATETIME-TABULAR-DATA-${pInputHTMLID}-${pRowIndex}`;
	}

	getTabularDateTimeInputHTMLID(pInputHTMLID, pRowIndex)
	{
		return `#DATETIME-TABULAR-INPUT-${pInputHTMLID}-${pRowIndex}`;
	}


	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		this.pict.ContentAssignment.assignContent(this.getDateTimeInputHTMLID(pInput.Macro.RawHTMLID), pValue);
		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
	}

	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		this.pict.ContentAssignment.assignContent(this.getTabularDateTimeInputHTMLID(pInput.Macro.RawHTMLID, pRowIndex), pValue);
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}

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