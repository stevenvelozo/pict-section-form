const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * CustomInputHandler class for the Autofill Trigger Group
 *
 * Autofill Trigger Groups have three parameters:
 *  - the group hash
 *  - a boolean defining whether the input triggers all inputs on the group
 *    to autofill themselves
 *  - an address (either in Pict or AppData) to pull data from
 *  - whether or not to marshal values if the result is empty/null/undefined
 *
 * In practice this looks like this:
 *
	Providers: ["Pict-Input-AutofillTriggerGroup"],
	AutofillTriggerGroup:
		{
			TriggerGroupName: "Author",
			TriggerAddress: "AppData.CurrentAuthor.Name",
			MarshalEmptyValues: true
		}
 *
 *
 * The group is cavalier about clearing data when
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
		/** @type {any} */
		this.log;
	}

	autoFillFromAddressList(pView, pInput, pValue, pHTMLSelector)
	{
		let tmpInput = pInput;
		if (!('AutofillTriggerGroup' in tmpInput.PictForm))
		{
			this.log.warn(`AutofillTriggerGroup failed to find configuration in ${pHTMLSelector} ... autofill is not possible.`);
			return false;
		}
		let tmpTriggerGroupInfo = pInput.PictForm.AutofillTriggerGroup;

		// First sanity check the triggergroupinfo
		if (!('TriggerGroupName' in tmpTriggerGroupInfo) || (typeof(tmpTriggerGroupInfo.TriggerGroupName) != 'string'))
		{
			this.log.warn(`AutofillTriggerGroup failed to autofill because a TriggerGroupName string is not present.`);
			return false;
		}
		if (tmpTriggerGroupInfo.TriggerGroupName != pValue)
		{
			this.log.warn(`AutofillTriggerGroup did not match names so no action will be taken.`);
			return false;
		}
		if (!('TriggerAddress' in tmpTriggerGroupInfo) || (typeof(tmpTriggerGroupInfo.TriggerAddress) != 'string'))
		{
			this.log.warn(`AutofillTriggerGroup failed to autofill because a TriggerAddress string is not present.`);
			return false;
		}

		let tmpValue = this.pict.manifest.getValueByHash(this.pict, tmpTriggerGroupInfo.TriggerAddress);

		if ((!tmpValue) && !tmpTriggerGroupInfo.MarshalEmptyValues)
		{
			return false;
		}
		// Maybe this just works!
		this.pict.ContentAssignment.assignContent(pHTMLSelector, tmpValue);
		return true;
	}

	autoFillFromAddressListTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex)
	{
		let tmpInput = pInput;
		if (!('AutofillTriggerGroup' in tmpInput.PictForm))
		{
			this.log.warn(`AutofillTriggerGroup failed to find configuration in ${pHTMLSelector} ... autofill is not possible.`);
			return false;
		}
		let tmpTriggerGroupInfo = pInput.PictForm.AutofillTriggerGroup;

		// First sanity check the triggergroupinfo
		if (!('TriggerGroupName' in tmpTriggerGroupInfo) || (typeof(tmpTriggerGroupInfo.TriggerGroupName) != 'string'))
		{
			this.log.warn(`AutofillTriggerGroup failed to autofill because a TriggerGroupName string is not present.`);
			return false;
		}
		if (tmpTriggerGroupInfo.TriggerGroupName != pValue)
		{
			this.log.warn(`AutofillTriggerGroup did not match names so no action will be taken.`);
			return false;
		}
		if (!('TriggerAddress' in tmpTriggerGroupInfo) || (typeof(tmpTriggerGroupInfo.TriggerAddress) != 'string'))
		{
			this.log.warn(`AutofillTriggerGroup failed to autofill because a TriggerAddress string is not present.`);
			return false;
		}

		let tmpValue = this.pict.manifest.getValueByHash(this.pict, tmpTriggerGroupInfo.TriggerAddress);

		if ((!tmpValue) && !tmpTriggerGroupInfo.MarshalEmptyValues)
		{
			return false;
		}
		// Maybe this just works!
		this.pict.ContentAssignment.assignContent(pInput.Macro.RawHTMLID, tmpValue);
		return true;
	}

	// Trigger the group if it's flagged as a triggering input
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
		let tmpTriggerGroupConfiguration = pInput.PictForm.AutofillTriggerGroup;
		if (tmpTriggerGroupConfiguration && tmpTriggerGroupConfiguration.TriggerAllInputs)
		{
			this.pict.views.PictFormMetacontroller.triggerGlobalInputEvent(`${pInput.PictForm.AutofillTriggerGroup.TriggerGroup}`);
		}
		return super.onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	// This input extension only responds to events
	onEvent(pView, pInput, pValue, pHTMLSelector, pEvent)
	{
		// Get all inputs that are in this autofill trigger group
		let tmpSeparatorIndex = pEvent.indexOf('-');
		if (pEvent.length <= tmpSeparatorIndex+1)
		{
			return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);
		}
		let tmpTriggerGroupName = pEvent.substring(tmpSeparatorIndex+1);
		//console.log(`Event ${pEvent} triggered for ${pInput.Hash} with the group ${tmpTriggerGroupName}...`);

		if (!pInput.PictForm.hasOwnProperty('AutofillTriggerGroup'))
		{
			// Do nothing for now -- this is the triggering element
		}
		else if (pInput.PictForm.hasOwnProperty('AutofillTriggerGroup') && 
			(!('SelectOptionsRefresh' in pInput.PictForm.AutofillTriggerGroup) || !pInput.PictForm.AutofillTriggerGroup.SelectOptionsRefresh))
		{
			// Autofill based on the address list as it isn't a select option
			this.autoFillFromAddressList(pView, pInput, tmpTriggerGroupName, pHTMLSelector);
		}
		else if (pInput.PictForm.AutofillTriggerGroup.SelectOptionsRefresh)
		{
			// Regenerate the picklist
			// Because the pick lists are view specific, we need to lookup the view the input is in
			let tmpInputView = this.pict.views[pInput.PictForm.ViewHash];
			this.pict.providers.DynamicMetaLists.buildViewSpecificList(tmpInputView, pInput.PictForm.SelectOptionsPickList);
			this.pict.providers['Pict-Input-Select'].refreshSelectList(tmpInputView, tmpInputView.getGroup(pInput.PictForm.GroupIndex), tmpInputView.getRow(pInput.PictForm.Row), pInput, pValue, pHTMLSelector);
		}

		return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);
	}

	onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent)
	{
		// Get all inputs that are in this autofill trigger group
		let tmpSeparatorIndex = pEvent.indexOf('-');
		if (pEvent.length <= tmpSeparatorIndex+1)
		{
			return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);
		}
		let tmpTriggerGroupName = pEvent.substring(tmpSeparatorIndex+1);
		//console.log(`Event ${pEvent} triggered for ${pInput.Hash} with the group ${tmpTriggerGroupName}...`);

		if (!pInput.PictForm.hasOwnProperty('AutofillTriggerGroup'))
		{
			// Do nothing for now -- this is the triggering element
		}
		else if (pInput.PictForm.hasOwnProperty('AutofillTriggerGroup') && 
			(!('SelectOptionsRefresh' in pInput.PictForm.AutofillTriggerGroup) || !pInput.PictForm.AutofillTriggerGroup.SelectOptionsRefresh))
		{
			// Autofill based on the address list as it isn't a select option
			this.autoFillFromAddressListTabular(pView, pInput, tmpTriggerGroupName, pHTMLSelector, pRowIndex);
		}
		else if (pInput.PictForm.AutofillTriggerGroup.SelectOptionsRefresh)
		{
			if (!pInput.PictForm.SelectOptionsPickList)
			{
				// There is no select options picklist so we can't auto refresh it.
			}
			else
			{
				// Regenerate the picklist
				// TODO: This is inefficient -- it regenerates the list for every single row.  Easy optimization.
				let tmpInputView = this.pict.views[pInput.PictForm.ViewHash];
				this.pict.providers.DynamicMetaLists.buildViewSpecificList(tmpInputView, pInput.PictForm.SelectOptionsPickList);
				this.pict.providers['Pict-Input-Select'].refreshSelectListTabular(tmpInputView, tmpInputView.getGroup(pInput.PictForm.GroupIndex), tmpInputView.getRow(pInput.PictForm.Row), pInput, pValue, pHTMLSelector, pRowIndex);
			}
		}

		return super.onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent);
	}
}

module.exports = CustomInputHandler;
