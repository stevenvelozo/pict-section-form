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
		this.cssHideClass = 'pict-tab-section-hidden';
		this.cssSelectedTabClass = 'pict-tab-section-selectedtab';
		this.cssSnippet = '.pict-tab-section-hidden { display: none; } .pict-tab-section-selectedtab { font-weight: bold; }';

		this.setCSSSnippets();
	}

	setCSSSnippets(pCSSHideClass, pCSSSnippet)
	{
		this.cssHideClass = pCSSHideClass || this.cssHideClass;
		this.cssSnippet = pCSSSnippet || this.cssSnippet;
		this.pict.CSSMap.addCSS('Pict-Section-Form-Input-Section-TabSelector', this.cssSnippet, 1001, 'Pict-Input-TabSelector');
	}

	getViewHash(pManifestSectionHash)
	{
		return `PictSectionForm-${pManifestSectionHash}`;
	}

	getTabSelector(pTabSectionHash, pInput)
	{
		return `#TAB-${pTabSectionHash}-${pInput.Macro.RawHTMLID}`;
	}

	getSectionSelector(pTabViewSectionHash)
	{
		return `#Pict-${this.pict.views.PictFormMetacontroller.UUID}-${pTabViewSectionHash}-Wrap`;
	}

	selectTabByViewHash(pViewHash, pInputHash, pTabViewHash)
	{
		// First get the view
		let tmpView = this.pict.views[pViewHash];
		if (!tmpView)
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabViewHash}] but the view did not exist!`)
			return false;
		}
		// Then the input
		let tmpInput = tmpView.getInputFromHash(pInputHash)
		if (!tmpInput)
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabViewHash}] but the input did not exist!`)
			return false;
		}
		// Now enumerate the tabs and hide the others, then show this one.
		// TODO: This could be made more elegant by testing which ones are shown and swapping them faster.
		if (!(tmpInput?.PictForm?.TabSectionSet) || !Array.isArray(tmpInput.PictForm.TabSectionSet))
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabViewHash}] but the input did not have a valid TabSectionSet array in the PictForm object!`)
			return false;
		}
		let tmpTabView = this.pict.views[this.getViewHash(pTabViewHash)];
		if (!tmpTabView)
		{
			this.pict.log.error(`TabSelector input provider tried to switch to view [${pViewHash}] input [${pInputHash}] tab [${pTabViewHash}] but the tab view did not exist!`)
			return false;
		}

		for (let i = 0; i < tmpInput.PictForm.TabSectionSet.length; i++)
		{
			let tmpTabSectionHash = tmpInput.PictForm.TabSectionSet[i];
			if (tmpTabSectionHash != pTabViewHash)
			{
				// Hide this tab group if it isn't the "expected to be visible" group
				this.pict.ContentAssignment.addClass(this.getSectionSelector(tmpTabSectionHash), this.cssHideClass);
				this.pict.ContentAssignment.removeClass(this.getTabSelector(tmpTabSectionHash, tmpInput), this.cssSelectedTabClass);
			}
			else
			{
				// Show this tab group if it is the "expected to be visible" group
				this.pict.ContentAssignment.removeClass(this.getSectionSelector(tmpTabSectionHash), this.cssHideClass);
				this.pict.ContentAssignment.addClass(this.getTabSelector(tmpTabSectionHash, tmpInput), this.cssSelectedTabClass);
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
		let tmpTabSet = pInput.PictForm?.TabSectionSet;

		if (!tmpTabSet || !Array.isArray(tmpTabSet) || tmpTabSet.length < 1)
		{
			this.pict.log.error(`TabSelector input provider tried to initialize Tab Group Set for HTML ID [${pInput.Macro.RawHTMLID}] but there were no valid entries in the tmpInput.PictForm.TabSectionSet array!`)
			return false;
		}

		let tmpEntryMetatemplateHash = this.pict.providers.DynamicInput.getInputTemplateHash(pView, { PictForm: { InputType: 'TabSectionSelector-TabElement', DataType: 'String' } });

		let tmpTabSectionSetEntries = '';
		// If there are tab group names, use them, otherwise use the hash
		let tempTabSetNames = pInput.PictForm?.TabSectionNames || [];

		for (let i = 0; i < tmpTabSet.length; i++)
		{
			tmpTabSectionSetEntries += this.pict.parseTemplateByHash(tmpEntryMetatemplateHash, pInput, null, [pView, {TabSectionHash: tmpTabSet[i], TabSectionName: (tempTabSetNames[i] || tmpTabSet[i])}]);
		}

		// TODO: Fix typescript types so this function has an optional rather than required fourth parameter.
		this.pict.ContentAssignment.projectContent('replace', this.getTabSelectorInputHTMLID(pInput.Macro.RawHTMLID), tmpTabSectionSetEntries, 'FixTheTypescriptTypes');

		// Now set the default tab (or first one)
		let tmpDefaultTabSectionHash = pInput.PictForm?.DefaultTabSectionHash || tmpTabSet[0];
		this.selectTabByViewHash(pView.Hash, pInput.Hash, tmpDefaultTabSectionHash);

		return super.onInputInitialize(pView, pGroup, pRow, pInput, pValue, pHTMLTabSelector);
	}
}

module.exports = CustomInputHandler;
