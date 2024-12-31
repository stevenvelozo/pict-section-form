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
	 * @param {string} pInputHTMLID - The HTML ID of the input element.
	 * @returns {string} - The generated HTML ID for the select input element.
	 */
	getTabSelectorInputHTMLID(pInputHTMLID)
	{
		return `#TAB-SELECT-FOR-${pInputHTMLID}`;
	}

	/**
	 * Initializes the input element for the Pict provider select input.
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The input value.
	 * @param {string} pHTMLTabSelector - The HTML selector.
	 * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
	 */
	onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLTabSelector)
	{
		// Try to get the input element
		/** @type {Array<HTMLElement>} */
		const tmpInputTabSelectorElements = this.pict.ContentAssignment.getElement(this.getTabSelectorInputHTMLID(pInput.Macro.RawHTMLID));
		let tmpDefaultData = pInput.PictForm?.TabSelectorOptions;

		if (pInput.PictForm.TabSelectorOptionsPickList && this.pict.providers.DynamicMetaLists.hasList(pView.Hash, pInput.PictForm.TabSelectorOptionsPickList))
		{
			tmpDefaultData = this.pict.providers.DynamicMetaLists.getList(pView.Hash, pInput.PictForm.TabSelectorOptionsPickList);
		}

		// TODO: Determine later if this should ever be an array.
		if (!tmpInputTabSelectorElements || tmpInputTabSelectorElements.length < 1)
		{
			return false;
		}
		const tmpInputTabSelectorElement = tmpInputTabSelectorElements[0];

		if (tmpInputTabSelectorElement && tmpDefaultData && Array.isArray(tmpDefaultData))
		{
			for (let i = 0; i < tmpDefaultData.length; i++)
			{
				let tmpOption = document.createElement('option');
				tmpOption.value = tmpDefaultData[i].id;
				tmpOption.text = tmpDefaultData[i].text;
				tmpInputTabSelectorElement.appendChild(tmpOption);
			}
		}

		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLTabSelector);
	}

	/**
	 * Handles the change event for the data in the select input.
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The new value of the input.
	 * @param {string} pHTMLTabSelector - The HTML selector of the input.
	 * @returns {any} - The result of the super.onDataChange method.
	 */
	onDataChange(pView, pInput, pValue, pHTMLTabSelector)
	{
		return super.onDataChange(pView, pInput, pValue, pHTMLTabSelector);
	}

	/**
	 * Marshals data to the form for the given input.
	 * @param {Object} pView - The view object.
	 * @param {Object} pGroup - The group object.
	 * @param {Object} pRow - The row object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value to be marshaled.
	 * @param {string} pHTMLTabSelector - The HTML selector.
	 * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
	 */
	onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLTabSelector)
	{
		/** @type {Array<HTMLElement>} */
		const tmpInputTabSelectorElements = this.pict.ContentAssignment.getElement(this.getTabSelectorInputHTMLID(pInput.Macro.RawHTMLID));
		if (!tmpInputTabSelectorElements || tmpInputTabSelectorElements.length < 1)
		{
			return false;
		}
		const tmpInputTabSelectorElement = tmpInputTabSelectorElements[0];
		if (!(tmpInputTabSelectorElement instanceof HTMLSelectElement))
		{
			this.log.error(`The element with the ID [${this.getTabSelectorInputHTMLID(pInput.Macro.RawHTMLID)}] is not a select element.`);
			return false;
		}

		let tmpValueTabSelectored = false;

		for (let i = 0; i < tmpInputTabSelectorElement.options.length; i++)
		{
			if (tmpInputTabSelectorElement.options[i].value === pValue)
			{
				tmpInputTabSelectorElement.selectedIndex = i;
				tmpValueTabSelectored = true;
				break;
			}
		}

		if (!tmpValueTabSelectored)
		{
			tmpInputTabSelectorElement.selectedIndex = -1;
			this.log.error(`The value [${pValue}] was not found in the select options for input [${pInput.Macro.RawHTMLID}] but was set in the hidden HTML input.`);
		}

		return super.onDataMarshalToForm(pView, pGroup, pRow, pInput, pValue, pHTMLTabSelector);
	}

	/**
	 * Handles the data request event for a select input in the PictProviderInputTabSelector class.
	 * @param {Object} pView - The view object.
	 * @param {Object} pInput - The input object.
	 * @param {any} pValue - The value object.
	 * @param {string} pHTMLTabSelector - The HTML selector object.
	 * @returns {any} - The result of the onDataRequest method.
	 */
	onDataRequest(pView, pInput, pValue, pHTMLTabSelector)
	{
		let tmpInputTabSelectorValue = this.pict.ContentAssignment.readContent(this.getTabSelectorInputHTMLID(pInput.Macro.RawHTMLID));
		this.pict.ContentAssignment.assignContent(pHTMLTabSelector, tmpInputTabSelectorValue);
		pView.dataChanged(pInput.Hash);
		return super.onDataRequest(pView, pInput, tmpInputTabSelectorValue, pHTMLTabSelector);
	}
}

module.exports = CustomInputHandler;
