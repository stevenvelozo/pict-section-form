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

		/** @type {string} */
		this.cssHideClass = 'pict-tab-hidden';
		this.cssSelectedTabClass = 'pict-tab-selectedtab';
		this.cssSnippet = '.pict-tab-hidden { display: none; } .pict-tab-selectedtab { font-weight: bold; }';

		this.setCSSSnippets();
	}

	setCSSSnippets(pCSSHideClass, pCSSSnippet)
	{
		this.cssHideClass = pCSSHideClass || this.cssHideClass;
		this.cssSnippet = pCSSSnippet || this.cssSnippet;
		this.pict.CSSMap.addCSS('Pict-Section-Form-Input-TabSelector', this.cssSnippet, 1001, 'Pict-Input-TabSelector');
	}

	getTabSelector(pView, pInput, pGroupHash)
	{
		return `#TAB-${pGroupHash}-${pInput.Macro.RawHTMLID}`;
	}

	getGroupSelector(pView, pGroupHash)
	{
		return `#GROUP-${pView.formID}-${pGroupHash}`;
	}

	selectTabByViewHash(pViewHash, pInputHash, pTabHash)
	{
		// First get the view
		let tmpView = this.pict.views[pViewHash];
		if (!tmpView)
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabHash}] but the view did not exist!`)
			return false;
		}
		// Then the input
		let tmpInput = tmpView.getInputFromHash(pInputHash)
		if (!tmpInput)
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabHash}] but the input did not exist!`)
			return false;
		}
		// Now enumerate the tabs and hide the others, then show this one.
		// TODO: This could be made more elegant by testing which ones are shown and swapping them faster.
		if (!(tmpInput?.PictForm?.TabGroupSet) || !Array.isArray(tmpInput.PictForm.TabGroupSet))
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabHash}] but the input did not have a valid TabGroupSet array in the PictForm object!`)
			return false;
		}

		for (let i = 0; i < tmpInput.PictForm.TabGroupSet.length; i++)
		{
			let tmpTabGroupHash = tmpInput.PictForm.TabGroupSet[i];
			if (tmpTabGroupHash != pTabHash)
			{
				// Hide this tab group if it isn't the "expected to be visible" group
				this.pict.ContentAssignment.addClass(this.getGroupSelector(tmpView, tmpTabGroupHash), this.cssHideClass);
				this.pict.ContentAssignment.removeClass(this.getTabSelector(tmpView, tmpInput, tmpTabGroupHash), this.cssSelectedTabClass);
			}
			else
			{
				// Show this tab group if it is the "expected to be visible" group
				this.pict.ContentAssignment.removeClass(this.getGroupSelector(tmpView, tmpTabGroupHash), this.cssHideClass);
				this.pict.ContentAssignment.addClass(this.getTabSelector(tmpView, tmpInput, tmpTabGroupHash), this.cssSelectedTabClass);
			}
		}
		return true;
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
		let tmpTabSet = pInput.PictForm?.TabGroupSet;

		if (!tmpTabSet || !Array.isArray(tmpTabSet) || tmpTabSet.length < 1)
		{
			this.pict.log.error(`TabSelector input provider tried to initialize Tab Group Set for HTML ID [${pInput.Macro.RawHTMLID}] but there were no valid entries in the tmpInput.PictForm.TabGroupSet array!`)
			return false;
		}

		let tmpEntryMetatemplateHash = this.pict.providers.DynamicInput.getInputTemplateHash(pView, { PictForm: { InputType: 'TabGroupSelector-TabElement', DataType: 'String' } });

		let tmpTabGroupSetEntries = '';

		for (let i = 0; i < tmpTabSet.length; i++)
		{
			tmpTabGroupSetEntries += this.pict.parseTemplateByHash(tmpEntryMetatemplateHash, pInput, null, [pView, {TabGroupHash: tmpTabSet[i]}]);
		}

		// TODO: Fix typescript types so this function has an optional rather than required fourth parameter.
		this.pict.ContentAssignment.projectContent('replace', this.getTabSelectorInputHTMLID(pInput.Macro.RawHTMLID), tmpTabGroupSetEntries, 'FixTheTypescriptTypes');

		// Now set the default tab (or first one)
		let tmpDefaultTabGroupHash = pInput.PictForm?.DefaultTabGroupHash || tmpTabSet[0];
		this.selectTabByViewHash(pView.Hash, pInput.Hash, tmpDefaultTabGroupHash);

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
