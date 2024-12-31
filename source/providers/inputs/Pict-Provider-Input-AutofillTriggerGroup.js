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
		this.autoFillFromAddressList(pView, pInput, tmpTriggerGroupName, pHTMLSelector);
		return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent);
	}

	onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent)
	{
		return super.onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent);
	}
}

module.exports = CustomInputHandler;
