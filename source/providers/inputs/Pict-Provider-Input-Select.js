const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

class CustomInputHandler extends libPictSectionInputExtension
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	getSelectInputHTMLID(pInputHTMLID)
	{
		return `#SELECT-FOR-${pInputHTMLID}`;
	}

	getTabularSelectInputID(pInputHTMLID, pRowIndex)
	{
		return `#SELECT-TABULAR-DATA-${pInputHTMLID}-${pRowIndex}`;
	}

	getTabularSelectDropdownID(pInputHTMLID, pRowIndex)
	{
		return `#SELECT-TABULAR-DROPDOWN-${pInputHTMLID}-${pRowIndex}`;
	}

	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		// Try to get the input element
		let tmpInputSelectElement = this.pict.ContentAssignment.getElement(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		let tmpDefaultData = pInput.PictForm.SelectOptions;

		if (pInput.PictForm.SelectOptionsPickList && this.pict.providers.DynamicMetaLists.hasList(pView.Hash, pInput.PictForm.SelectOptionsPickList))
		{
			tmpDefaultData = this.pict.providers.DynamicMetaLists.getList(pView.Hash, pInput.PictForm.SelectOptionsPickList);
		}

		// TODO: Determine later if this should ever be an array.
		if (tmpInputSelectElement && tmpInputSelectElement.length > 0)
		{
			tmpInputSelectElement = tmpInputSelectElement[0];
		}
		else
		{
			return false;
		}

		if (tmpInputSelectElement && tmpDefaultData && Array.isArray(tmpDefaultData))
		{
			for (let i = 0; i < tmpDefaultData.length; i++)
			{
				let tmpOption = document.createElement('option');
				tmpOption.value = tmpDefaultData[i].id;
				tmpOption.text = tmpDefaultData[i].text;
				tmpInputSelectElement.appendChild(tmpOption);
			}
		}

		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
	}

	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		// Try to get the input element
		let tmpInputSelectElement = this.pict.ContentAssignment.getElement(this.getTabularSelectDropdownID(pInput.Macro.RawHTMLID, pRowIndex));
		let tmpDefaultData = pInput.PictForm.SelectOptions;

		if (pInput.PictForm.SelectOptionsPickList && this.pict.providers.DynamicMetaLists.hasList(pView.Hash, pInput.PictForm.SelectOptionsPickList))
		{
			tmpDefaultData = this.pict.providers.DynamicMetaLists.getList(pView.Hash, pInput.PictForm.SelectOptionsPickList);
		}

		// TODO: Determine later if this should ever be an array.
		if (tmpInputSelectElement && tmpInputSelectElement.length > 0)
		{
			tmpInputSelectElement = tmpInputSelectElement[0];
		}
		else
		{
			return super.onInputInitializeTabular(pView, pGroup, pInput, pHTMLSelector);
		}

		if (tmpInputSelectElement && tmpDefaultData && Array.isArray(tmpDefaultData))
		{
			for (let i = 0; i < tmpDefaultData.length; i++)
			{
				let tmpOption = document.createElement('option');
				tmpOption.value = tmpDefaultData[i].id;
				tmpOption.text = tmpDefaultData[i].text;
				tmpInputSelectElement.appendChild(tmpOption);
			}
		}

		return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	onDataChange(pView, pInput, pValue, pHTMLSelector)
	{
		return super.onDataChange(pView, pInput, pValue, pHTMLSelector);
	}

	onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return super.onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		let tmpInputSelectElement = this.pict.ContentAssignment.getElement(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		if (tmpInputSelectElement && tmpInputSelectElement.length > 0)
		{
			tmpInputSelectElement = tmpInputSelectElement[0];
		}
		else
		{
			return false;
		}

		let tmpValueSelected = false;

		for (let i = 0; i < tmpInputSelectElement.options.length; i++)
		{
			if (tmpInputSelectElement.options[i].value === pValue)
			{
				tmpInputSelectElement.selectedIndex = i;
				tmpValueSelected = true;
				break;
			}
		}

		if (!tmpValueSelected)
		{
			tmpInputSelectElement.selectedIndex = -1;
			this.pict.log.error(`The value [${pValue}] was not found in the select options for input [${pInput.Macro.RawHTMLID}] but was set in the hidden HTML input.`);
		}

		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLSelector);
	}

	onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		let tmpInputSelectElement = this.pict.ContentAssignment.getElement(this.getTabularSelectDropdownID(pInput.Macro.RawHTMLID, pRowIndex));
		if (tmpInputSelectElement && tmpInputSelectElement.length > 0)
		{
			tmpInputSelectElement = tmpInputSelectElement[0];
		}
		else
		{
			return super.onInputInitializeTabular(pView, pGroup, pInput, pHTMLSelector);
		}


		let tmpValueSelected = false;

		for (let i = 0; i < tmpInputSelectElement.options.length; i++)
		{
			if (tmpInputSelectElement.options[i].value === pValue)
			{
				tmpInputSelectElement.selectedIndex = i;
				tmpValueSelected = true;
				break;
			}
		}

		if (!tmpValueSelected)
		{
			tmpInputSelectElement.selectedIndex = -1;
			this.pict.log.error(`The value [${pValue}] was not found in the select options for input [${pInput.Macro.RawHTMLID}] but was set in the hidden HTML input.`);
		}

		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		this.pict.ContentAssignment.assignContent(pHTMLSelector, tmpInputSelectValue);
		pView.dataChanged(pInput.Hash);
		return super.onDataRequest(pView, pInput, tmpInputSelectValue, pHTMLSelector);
	}

	onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getTabularSelectDropdownID(pInput.Macro.RawHTMLID, pRowIndex));
		this.pict.ContentAssignment.assignContent(this.getTabularSelectInputID(pInput.Macro.RawHTMLID, pRowIndex), tmpInputSelectValue);
		pView.dataChangedTabular(pInput.PictForm.GroupIndex, pInput.PictForm.InputIndex, pRowIndex);
		return super.onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = CustomInputHandler;