const libPictSectionInputExtension = require('../Pict-Provider-InputExtension.js');

/**
 * CustomInputHandler class for Entity Bundle Requests.
 *
 * When an input is flagged as an EntityBundleRequest entity, it will go pull a
 * sequential list of records on data selection.
 *
 * Paired with the AutofillTriggerGroup, this allows other values to be filled
 * when a record is selected and fetched.

Providers: ["Pict-Input-EntityBundleRequest", "Pict-Input-TriggerGroup"],
		EntitiesBundle: [
		{
			"Entity": "Author",
			"Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
			"Destination": "AppData.CurrentAuthor",
			// This marshals a single record
			"SingleRecord": true
		},
		{
			"Entity": "BookAuthorJoin",
			"Filter": "FBV~IDAuthor~EQ~{~D:Appdata.CurrentAuthor.IDAuthor~}",
			"Destination": "AppData.BookAuthorJoins"
		},
		{
			"Entity": "Book",
			"Filter": "FBL~IDBook~LK~{PJU~:,^IDBook^Appdata.BookAuthorJoins~}",
			"Destination": "AppData.BookAuthorJoins"
		}
	],
	EntityBundleTriggerGroup: "BookTriggerGroup"

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
		/** @type {import('pict') & { newAnticipate: () => any }} */
		this.fable;
		/** @type {any} */
		this.log;
	}

	gatherEntitySet(fCallback, pEntityInformation, pView, pInput, pValue)
	{
		// First sanity check the pEntityInformation
		if (!('Entity' in pEntityInformation) || (typeof(pEntityInformation.Entity) != 'string'))
		{
			this.log.warn(`EntityBundleRequest failed to parse entity request because the entity stanza did not contain an Entity string.`);
			return fCallback();
		}
		if (!('Filter' in pEntityInformation) || (typeof(pEntityInformation.Filter) != 'string'))
		{
			this.log.warn(`EntityBundleRequest failed to parse entity request because the entity stanza did not contain a Filter string.`);
			return fCallback();
		}
		if (!('Destination' in pEntityInformation) || (typeof(pEntityInformation.Destination) != 'string'))
		{
			this.log.warn(`EntityBundleRequest failed to parse entity request because the entity stanza did not contain a Destination string.`);
			return fCallback();
		}

		const tmpFilterTemplateRecord = { Value:pValue, Input:pInput, View:pView };
		// Parse the filter template
		const tmpFilterString = this.pict.parseTemplate(pEntityInformation.Filter, tmpFilterTemplateRecord);
		if (tmpFilterString == '')
		{
			// We may want to continue, but for now let's say nah and nope out.
			this.log.warn(`EntityBundleRequest failed to parse entity request because the entity Filter did not return a string for FilterBy`)
		}

		// Now get the records
		this.pict.EntityProvider.getEntitySet(pEntityInformation.Entity, tmpFilterString,
			function (pError, pRecordSet)
			{
				if (pError)
				{
					this.log.error(`EntityBundleRequest request Error getting entity set for [${pEntityInformation.Entity}] with filter [${tmpFilterString}]: ${pError}`, pError);
					return fCallback(pError, '');
				}

				this.log.trace(`EntityBundleRequest found ${pRecordSet.length} records for ${pEntityInformation.Entity} filtered to [${tmpFilterString}]`);

				// Now assign it back to the destination; because this is not view specific it doesn't use the manifests from them (to deal with scope overlap with subgrids).
				if (pEntityInformation.SingleRecord)
				{
					if (pRecordSet.length > 1)
					{
						this.log.warn(`EntityBundleRequest found more than one record for ${pEntityInformation.Entity} filtered to [${tmpFilterString}] but SingleRecord is true; setting the first record.`);
					}
					if (pRecordSet.length < 1)
					{
						this.pict.manifest.setValueByHash(this.pict, pEntityInformation.Destination, false);
					}
					this.pict.manifest.setValueByHash(this.pict, pEntityInformation.Destination, pRecordSet[0]);
				}
				else
				{
					this.pict.manifest.setValueByHash(this.pict, pEntityInformation.Destination, pRecordSet);
				}

				return fCallback();
			}.bind(this));
	}

	gatherDataFromServer(pView, pInput, pValue, pHTMLSelector)
	{
		// Gather data from the server
		// These have to date not been asyncronous.  Now they will be...
		if ((typeof(pInput) !== 'object') || !('PictForm' in pInput) || !('EntitiesBundle' in pInput.PictForm) || !Array.isArray(pInput.PictForm.EntitiesBundle))
		{
			this.log.warn(`Input at ${pHTMLSelector} is set as an EntityBundleRequest input but no array of entity requests was found`);
			return false;
		}

		let tmpInput = pInput;
		let tmpValue = pValue;
		let tmpAnticipate = this.fable.newAnticipate();

		for (let i = 0; i < tmpInput.PictForm.EntitiesBundle.length; i++)
		{
			let tmpEntityBundleEntry = tmpInput.PictForm.EntitiesBundle[i];
			tmpAnticipate.anticipate(
				function (fNext)
				{
					try
					{
						return this.gatherEntitySet(fNext, tmpEntityBundleEntry, pView, tmpInput, tmpValue);
					}
					catch (pError)
					{
						this.log.error(`EntityBundleRequest error gathering entity set: ${pError}`, pError);
						return fNext();
					}
				}.bind(this));
		}

		tmpAnticipate.anticipate(
			function (fNext)
			{
				if (tmpInput.PictForm.EntityBundleTriggerGroup)
				{
					// Trigger the autofill global event
					this.pict.views.PictFormMetacontroller.triggerGlobalInputEvent(`AutoFill-${tmpInput.PictForm.EntityBundleTriggerGroup}`);
				}
			}.bind(this))

		// Now fire the "autofilldata" event for the groups.
		tmpAnticipate.wait(
			function (pError)
			{
				return true;
			}.bind(this));
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
		// This is in case we need to do a request on initial load!
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
		this.gatherDataFromServer(pView, pInput, pValue, pHTMLSelector);
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
		this.gatherDataFromServer(pView, pInput, pValue, pHTMLSelector);
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
		return super.onDataMarshalToFormTabular(pView, pGroup, pInput, pValue, pHTMLSelector, pRowIndex);
	}
}

module.exports = CustomInputHandler;
