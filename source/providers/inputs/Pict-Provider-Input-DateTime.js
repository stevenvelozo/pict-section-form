const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	getSelectInputHTMLID(pInputHTMLID)
	{
		return `#DATETIME-INPUT-FOR-${pInputHTMLID}`;
	}

	getTabularSelectInputID(pInputHTMLID, pRowIndex)
	{
		return `#DATETIME-TABULAR-DATA-${pInputHTMLID}-${pRowIndex}`;
	}

	getTabularSelectDateTimeID(pInputHTMLID, pRowIndex)
	{
		return `#DATETIME-TABULAR-DROPDOWN-${pInputHTMLID}-${pRowIndex}`;
	}


	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		let tmpDateTimeElement = this.pict.ContentAssignment.getElement(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		if (tmpDateTimeElement && tmpDateTimeElement.length > 0)
		{
			tmpDateTimeElement = tmpDateTimeElement[0];
		}
		else
		{
			return false;
		}

		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
	}

	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		let tmpDateTimeElement = this.pict.ContentAssignment.getElement(this.getTabularSelectDateTimeID(pInput.Macro.RawHTMLID, pRowIndex));
		if (tmpDateTimeElement && tmpDateTimeElement.length > 0)
		{
			tmpDateTimeElement = tmpDateTimeElement[0];
		}
		else
		{
			return super.onInputInitializeTabular(pView, pGroup, pInput, pHTMLSelector);
		}


		let tmpValueSelected = false;

		for (let i = 0; i < tmpDateTimeElement.options.length; i++)
		{
			if (tmpDateTimeElement.options[i].value === pValue)
			{
				tmpDateTimeElement.selectedIndex = i;
				tmpValueSelected = true;
				break;
			}
		}

		if (!tmpValueSelected)
		{
			tmpDateTimeElement.selectedIndex = -1;
			this.pict.log.error(`The value [${pValue}] was not found in the select options for input [${pInput.Macro.RawHTMLID}] but was set in the hidden HTML input.`);
		}

		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		let tmpDateTimeElement = this.pict.ContentAssignment.getElement(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		if (tmpDateTimeElement && tmpDateTimeElement.length > 0)
		{
			tmpDateTimeElement = tmpDateTimeElement[0];
		}
		else
		{
			return false;
		}

		try
		{
			let tmpDateValue = this.fable.Dates.dayJS(tmpDateTimeElement.value);
			let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
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
		let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getTabularSelectDateTimeID(pInput.Macro.RawHTMLID, pRowIndex));
		this.pict.ContentAssignment.assignContent(this.getTabularSelectInputID(pInput.Macro.RawHTMLID, pRowIndex), tmpInputSelectValue);
		pView.dataChangedTabular(pInput.PictForm.GroupIndex, pInput.PictForm.InputIndex, pRowIndex);
		return super.onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}


}

module.exports = CustomInputHandler;