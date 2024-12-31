const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

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
	 * Generates the HTML ID for a select input element.
	 *
	 * @param {string} pInputHTMLID - The HTML ID of the input element.
	 * @returns {string} - The generated HTML ID for the select input element.
	 */
	getSelectInputHTMLID(pInputHTMLID)
	{
		return `#SELECT-FOR-${pInputHTMLID}`;
	}

	/**
	 * Generates a tabular select input ID based on the provided input HTML ID and row index.
	 *
	 * @param {string} pInputHTMLID - The input HTML ID.
	 * @param {number} pRowIndex - The row index.
	 * @returns {string} - The generated tabular select input ID.
	 */
	getTabularSelectInputID(pInputHTMLID, pRowIndex)
	{
		return `#SELECT-TABULAR-DATA-${pInputHTMLID}-${pRowIndex}`;
	}

	/**
	 * Generates a tabular select dropdown ID based on the input HTML ID and row index.
	 *
	 * @param {string} pInputHTMLID - The HTML ID of the input.
	 * @param {number} pRowIndex - The index of the row.
	 * @returns {string} - The generated tabular select dropdown ID.
	 */
	getTabularSelectDropdownID(pInputHTMLID, pRowIndex)
	{
		return `#SELECT-TABULAR-DROPDOWN-${pInputHTMLID}-${pRowIndex}`;
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
	 * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
	 */
	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLSelector)
	{
		// Try to get the input element
		/** @type {Array<HTMLElement>|HTMLElement} */
		let tmpInputSelectElement = this.pict.ContentAssignment.getElement(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		let tmpDefaultData = pInput.PictForm?.SelectOptions;

		if (pInput.PictForm.SelectOptionsPickList && this.pict.providers.DynamicMetaLists.hasList(pView.Hash, pInput.PictForm.SelectOptionsPickList))
		{
			tmpDefaultData = this.pict.providers.DynamicMetaLists.getList(pView.Hash, pInput.PictForm.SelectOptionsPickList);
		}

		// TODO: Determine later if this should ever be an array.
		if (!tmpInputSelectElement || tmpInputSelectElement.length < 1)
		{
			return false;
		}

		tmpInputSelectElement = tmpInputSelectElement[0];

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

	/**
	 * Initializes a tabular input element.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @returns {any} - The result of the initialization.
	 */
	onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		// Try to get the input element
		/** @type {Array<HTMLElement>|HTMLElement} */
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
			return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
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

	/**
	 * Handles the change event for the data in the select input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value of the input.
	 * @param {string} pHTMLSelector - The HTML selector of the input.
	 * @returns {any} - The result of the super.onDataChange method.
	 */
	onDataChange(pView, pInput, pValue, pHTMLSelector)
	{
		return super.onDataChange(pView, pInput, pValue, pHTMLSelector);
	}

	/**
	 * Handles the change event for tabular data.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The index of the row.
	 * @returns {any} - The result of the super method.
	 */
	onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		return super.onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
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
		/** @type {Array<HTMLElement>|HTMLElement} */
		const tmpInputSelectElements = this.pict.ContentAssignment.getElement(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		if (!tmpInputSelectElements || tmpInputSelectElements.length < 1)
		{
			return false;
		}
		const tmpInputSelectElement = tmpInputSelectElements[0];
		if (!(tmpInputSelectElement instanceof HTMLSelectElement))
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
			this.log.error(`The value [${pValue}] was not found in the select options for input [${pInput.Macro.RawHTMLID}] but was set in the hidden HTML input.`);
		}

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
		/** @type {Array<HTMLElement>|HTMLElement} */
		const tmpInputSelectElements = this.pict.ContentAssignment.getElement(this.getTabularSelectDropdownID(pInput.Macro.RawHTMLID, pRowIndex));
		if (!tmpInputSelectElements || tmpInputSelectElements.length < 1)
		{
			return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
		}
		const tmpInputSelectElement = tmpInputSelectElements[0];
		if (!(tmpInputSelectElement instanceof HTMLSelectElement))
		{
			return super.onInputInitializeTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
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
			this.log.error(`The value [${pValue}] was not found in the select options for input [${pInput.Macro.RawHTMLID}] but was set in the hidden HTML input.`);
		}

		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	/**
	 * Handles the data request event for a select input in the PictProviderInputSelect class.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value object.
	 * @param {string} pHTMLSelector - The HTML selector object.
	 * @returns {any} - The result of the onDataRequest method.
	 */
	onDataRequest(pView, pInput, pValue, pHTMLSelector)
	{
		let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getSelectInputHTMLID(pInput.Macro.RawHTMLID));
		this.pict.ContentAssignment.assignContent(pHTMLSelector, tmpInputSelectValue);
		pView.dataChanged(pInput.Hash);
		return super.onDataRequest(pView, pInput, tmpInputSelectValue, pHTMLSelector);
	}

	/**
	 * Handles the data request event for a tabular input.
	 *
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value object.
	 * @param {string} pHTMLSelector - The HTML selector.
	 * @param {number} pRowIndex - The row index.
	 * @returns {any} - The result of the data request.
	 */
	onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		let tmpInputSelectValue = this.pict.ContentAssignment.readContent(this.getTabularSelectDropdownID(pInput.Macro.RawHTMLID, pRowIndex));
		this.pict.ContentAssignment.assignContent(this.getTabularSelectInputID(pInput.Macro.RawHTMLID, pRowIndex), tmpInputSelectValue);
		pView.dataChangedTabular(pInput.PictForm.GroupIndex, pInput.PictForm.InputIndex, pRowIndex);
		return super.onDataRequestTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = CustomInputHandler;
