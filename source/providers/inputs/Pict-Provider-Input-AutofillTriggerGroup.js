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

	getTriggerGroupConfigurationArray(pInput)
	{
		let tmpAutoFillTriggerGroups = pInput.PictForm.AutofillTriggerGroup;
		if (!tmpAutoFillTriggerGroups)
		{
			return [];
		}
		if (!Array.isArray(tmpAutoFillTriggerGroups))
		{
			tmpAutoFillTriggerGroups = [tmpAutoFillTriggerGroups];
		}
		return tmpAutoFillTriggerGroups;
	}

	autoFillFromAddressList(pView, pInput, tmpTriggerGroupInfo, pHTMLSelector)
	{
		// First sanity check the triggergroupinfo
		if (!('TriggerGroupName' in tmpTriggerGroupInfo) || (typeof(tmpTriggerGroupInfo.TriggerGroupName) != 'string'))
		{
			this.log.warn(`AutofillTriggerGroup failed to autofill because a TriggerGroupName string is not present.`);
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
		pView.setDataByInput(pInput, tmpValue);
		pView.manualMarshalDataToViewByInput(pInput);
		return true;
	}

	autoFillFromAddressListTabular(pView, pInput, tmpTriggerGroupInfo, pHTMLSelector, pRowIndex)
	{
		// First sanity check the triggergroupinfo
		if (!('TriggerGroupName' in tmpTriggerGroupInfo) || (typeof(tmpTriggerGroupInfo.TriggerGroupName) != 'string'))
		{
			this.log.warn(`AutofillTriggerGroup failed to autofill because a TriggerGroupName string is not present.`);
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
		// Setting data is in the view intentionally, to allow triggered events.  Probabbly needs to be a separate provider.
		pView.setDataByInputTabular(pInput.PictForm.GroupIndex, pInput.Hash, pRowIndex, tmpValue);
		pView.manualMarshalDataToViewByInput(pInput);
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
		let tmpTriggerGroupConfigurations = this.getTriggerGroupConfigurationArray(pInput);
		if (Array.isArray(tmpTriggerGroupConfigurations) && this.pict.views.PictFormMetacontroller)
		{
			for (let i = 0; i < tmpTriggerGroupConfigurations.length; i++)
			{
				if (tmpTriggerGroupConfigurations[i].TriggerAllInputs)
				{
					this.pict.views.PictFormMetacontroller.triggerGlobalInputEvent(`AFTG-ODC-${this.pict.getUUID()}`);
				}
			}
		}
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
		let tmpTriggerGroupConfigurations = this.getTriggerGroupConfigurationArray(pInput);
		if (Array.isArray(tmpTriggerGroupConfigurations) && this.pict.views.PictFormMetacontroller)
		{
			for (let i = 0; i < tmpTriggerGroupConfigurations.length; i++)
			{
				if (tmpTriggerGroupConfigurations[i].TriggerAllInputs)
				{
					this.pict.views.PictFormMetacontroller.triggerGlobalInputEvent(`AFTG-ODC-${this.pict.getUUID()}`);
				}
			}
		}
		return super.onDataChangeTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex);
	}

	// This input extension only responds to events
	onEvent(pView, pInput, pValue, pHTMLSelector, pEvent)
	{
		// Get all inputs that are in this autofill trigger group
		let tmpEventGUID = (typeof(pEvent) === 'string') ? pEvent : this.pict.getUUID();

		let tmpAutoFillTriggerGroups = pInput.PictForm.AutofillTriggerGroup;
		if (!tmpAutoFillTriggerGroups)
		{
			return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);			
		}
		if (!Array.isArray(tmpAutoFillTriggerGroups))
		{
			tmpAutoFillTriggerGroups = [tmpAutoFillTriggerGroups];
		}
		for (let i = 0; i < tmpAutoFillTriggerGroups.length; i++)
		{
			let tmpAutoFillTriggerGroup = tmpAutoFillTriggerGroups[i];

			if ('TriggerAddress' in tmpAutoFillTriggerGroup)
			{
				// Autofill based on the address list as it isn't a select option
				this.autoFillFromAddressList(pView, pInput, tmpAutoFillTriggerGroup, pHTMLSelector);
			}
			
			if (tmpAutoFillTriggerGroup.SelectOptionsRefresh)
			{
				// Regenerate the picklist
				// Because the pick lists are view specific, we need to lookup the view the input is in
				let tmpInputView = this.pict.views[pInput.PictForm.ViewHash];
				this.pict.providers.DynamicMetaLists.rebuildListByHash(pInput.PictForm.SelectOptionsPickList);
				this.pict.providers['Pict-Input-Select'].refreshSelectList(tmpInputView, tmpInputView.getGroup(pInput.PictForm.GroupIndex), tmpInputView.getRow(pInput.PictForm.GroupIndex, pInput.PictForm.Row), pInput, pValue, pHTMLSelector);
				tmpInputView.manualMarshalDataToViewByInput(pInput, tmpEventGUID);
			}
		}

		return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);
	}

	onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent)
	{
		let tmpEventGUID = (typeof(pEvent) === 'string') ? pEvent : this.pict.getUUID();

		if (!pInput.PictForm.hasOwnProperty('AutofillTriggerGroup'))
		{
			// Do nothing for now -- this is the triggering element
		}
		else if (pInput.PictForm.hasOwnProperty('AutofillTriggerGroup') && 
			(!('SelectOptionsRefresh' in pInput.PictForm.AutofillTriggerGroup) || !pInput.PictForm.AutofillTriggerGroup.SelectOptionsRefresh))
		{
			// Autofill based on the address list as it isn't a select option
			this.autoFillFromAddressListTabular(pView, pInput, pHTMLSelector, pRowIndex);
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
				// Use the transaction stuff at some point, now that we have it in the event.
				let tmpInputView = this.pict.views[pInput.PictForm.ViewHash];
				this.pict.providers.DynamicMetaLists.rebuildListByHash(pInput.PictForm.SelectOptionsPickList);
				this.pict.providers['Pict-Input-Select'].refreshSelectListTabular(tmpInputView, tmpInputView.getGroup(pInput.PictForm.GroupIndex), tmpInputView.getRow(pInput.PictForm.GroupIndex, pInput.PictForm.Row), pInput, pValue, pHTMLSelector, pRowIndex);
				tmpInputView.manualMarshalTabularDataToViewByInput(pInput, pRowIndex, tmpEventGUID);
			}
		}

		return super.onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent);
	}
}

module.exports = CustomInputHandler;
