const libPictProvider = require('pict-provider');

/** @type {Record<string, any>} */
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-DynamicTabularData",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * @typedef {Object} ElementDescriptor
 * @property {string} Hash - The hash of the element.
 */

/**
 * The DynamicTabularData class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
class DynamicTabularData extends libPictProvider
{
	/**
	 * Creates an instance of the DynamicTabularData class.
	 *
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		/** @type {any} */
		this.options;
		/** @type {import('pict')} */
		this.pict;
		/** @type {any} */
		this.log;
	}

	/**
	 * Retrieves the tabular record set from the specified view and group index.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @returns {Array|Object|boolean} - The tabular record set if it exists, otherwise false.
	 */
	getTabularRecordSet(pView, pGroupIndex)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = pView.getGroup(pGroupIndex);
		if (!tmpGroup || !tmpGroup?.RecordSetAddress)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRecordSet ${pGroupIndex} was not a valid group or did not have a valid RecordSetAddress.`);
			return false;
		}

		let tmpRowSource = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

		return tmpRowSource;
	}

	/**
	 * Retrieves the tabular record input from the specified view, group, and input indexes.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @param {number} pInputIndex - The index of the input.
	 * @returns {ElementDescriptor|boolean} The tabular record input or false if the group is invalid.
	 */
	getTabularRecordInput(pView, pGroupIndex, pInputIndex)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (!tmpGroup)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} was not a valid group.`);
			return false;
		}

		// Now get the supporting manifest and the input element
		// This needs more guards
		let tmpSupportingManifestHash = tmpGroup.supportingManifest.elementAddresses[pInputIndex];
		return tmpGroup.supportingManifest.elementDescriptors[tmpSupportingManifestHash];
	}

	/**
	 * Retrieves tabular record data based on the provided parameters.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @param {string} pRowIdentifier - The identifier of the row.
	 * @returns {boolean|Object} - The tabular record data or false if not found.
	 */
	getTabularRecordData(pView, pGroupIndex, pRowIdentifier)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (!tmpGroup)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} was not a valid group.`);
			return false;
		}

		// Now identify the group
		let tmpRowSourceRecord =  pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

		if (!tmpRowSourceRecord)
		{
			// Try the address
			tmpRowSourceRecord = pView.sectionManifest.getValueAtAddress(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);
		}

		if (!tmpRowSourceRecord)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} could not find the record set for ${tmpGroup.RecordSetAddress}.`);
			return false;
		}

		// Now we have the source record let's see what it is
		try
		{
			if (Array.isArray(tmpRowSourceRecord))
			{
				return tmpRowSourceRecord[pRowIdentifier];
			}
			else if (typeof(tmpRowSourceRecord) === 'object')
			{
				return tmpRowSourceRecord[pRowIdentifier];
			}
			else
			{
				this.log.warn(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} could not determine the type of the record set for ${tmpGroup.RecordSetAddress}.`);
				return false;
			}
		}
		catch (pError)
		{
			this.log.error(`PICT View Metatemplate Helper getTabularRowData ${pGroupIndex} encountered an error: ${pError}`);
			return false;
		}
	}

	/**
	 * Creates a dynamic table row for the given view and group index.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 */
	createDynamicTableRow(pView, pGroupIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				if (tmpGroup.MaximumRowCount && (tmpDestinationObject.length >= tmpGroup.MaximumRowCount))
				{
					this.log.warn(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to add a row but the maximum rows ${tmpGroup.MaximumRowCount} has been reached.`);
					return;
				}
				let tmpRowPrototype = {};
				if (tmpGroup.DefaultRows && tmpDestinationObject.length < tmpGroup.DefaultRows.length)
				{
					tmpRowPrototype = JSON.parse(JSON.stringify(tmpGroup.DefaultRows[tmpDestinationObject.length]));
				}
				tmpDestinationObject.push(tmpGroup.supportingManifest.populateDefaults(tmpRowPrototype));
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				pView.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = pView.fable.getUUID();
				tmpDestinationObject[tmpRowIndex] = tmpGroup.supportingManifest.populateDefaults({});
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				pView.marshalToView();
			}
		}
	}


	/**
	 * Creates a dynamic table row for the given view and group index without firing render or marshal events.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 */
	createDynamicTableRowWithoutEvents(pView, pGroupIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				if (tmpGroup.MaximumRowCount && (tmpDestinationObject.length >= tmpGroup.MaximumRowCount))
				{
					this.log.warn(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to add a row but the maximum rows ${tmpGroup.MaximumRowCount} has been reached.`);
					return;
				}
				let tmpRowPrototype = {};
				if (tmpGroup.DefaultRows && tmpDestinationObject.length < tmpGroup.DefaultRows.length)
				{
					tmpRowPrototype = JSON.parse(JSON.stringify(tmpGroup.DefaultRows[tmpDestinationObject.length]));
				}
				console.log(tmpRowPrototype);
				console.log(tmpGroup.supportingManifest.populateDefaults(tmpRowPrototype));
				tmpDestinationObject.push(tmpGroup.supportingManifest.populateDefaults(tmpRowPrototype))
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = pView.fable.getUUID();
				tmpDestinationObject[tmpRowIndex] = tmpGroup.supportingManifest.populateDefaults({});
			}
		}
	}

	/**
	 * Sets the index of a dynamic table row in a view.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @param {number|string} pRowIndex - The current index of the row.
	 * @param {number} pNewRowIndex - The new index to move the row to.
	 * @returns {boolean} - Returns false if the index is out of bounds, otherwise returns undefined.
	 */
	setDynamicTableRowIndex(pView, pGroupIndex, pRowIndex, pNewRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(String(pRowIndex), 10);
				let tmpNewRowIndex = parseInt(String(pNewRowIndex), 10);
				if ((tmpDestinationObject.length <= tmpRowIndex) || (tmpRowIndex < 0))
				{
					this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] to [${pNewRowIndex}] but the index is out of bounds.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpNewRowIndex, 0, tmpElementToBeMoved[0]);
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				//pView.marshalToView();
				// We've re-rendered but we don't know what needs to be marshaled based on the solve that ran above so marshal everything
				this.pict.views.PictFormMetacontroller.marshalFormSections();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] to [${pNewRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}

	/**
	 * Moves a dynamic table row down within a view.
	 *
	 * @param {Object} pView - The view containing the dynamic table.
	 * @param {number} pGroupIndex - The index of the group containing the row.
	 * @param {number|string} pRowIndex - The index of the row to be moved.
	 * @returns {boolean} - Returns true if the row was successfully moved, false otherwise.
	 */
	moveDynamicTableRowDown(pView, pGroupIndex, pRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(String(pRowIndex), 10);
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] down but it's already at the bottom.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpRowIndex + 1, 0, tmpElementToBeMoved[0]);
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				//pView.marshalToView();
				// We've re-rendered but we don't know what needs to be marshaled based on the solve that ran above so marshal everything
				this.pict.views.PictFormMetacontroller.marshalFormSections();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}

	/**
	 * Moves a dynamic table row up.
	 *
	 * @param {Object} pView - The view object.
	 * @param {number} pGroupIndex - The index of the group.
	 * @param {number|string} pRowIndex - The index of the row to be moved.
	 * @returns {boolean} Returns true if the row was moved successfully, false otherwise.
	 */
	moveDynamicTableRowUp(pView, pGroupIndex, pRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(String(pRowIndex), 10);
				if (tmpRowIndex == 0)
				{
					this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] up but it's already at the top.`);
					return false;
				}
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but the index is out of bounds.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpRowIndex - 1, 0, tmpElementToBeMoved[0]);
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				//pView.marshalToView();
				// We've re-rendered but we don't know what needs to be marshaled based on the solve that ran above so marshal everything
				this.pict.views.PictFormMetacontroller.marshalFormSections();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}


	/**
	 * Deletes a dynamic table row from the specified view.
	 *
	 * @param {Object} pView - The view from which to delete the row.
	 * @param {number} pGroupIndex - The index of the group containing the row.
	 * @param {number|string} pRowIndex - The index or key of the row to delete.
	 * @returns {boolean} - Returns true if the row was successfully deleted, false otherwise.
	 */
	deleteDynamicTableRow(pView, pGroupIndex, pRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				if (tmpGroup.MinimumRowCount && (tmpDestinationObject.length <= tmpGroup.MinimumRowCount))
				{
					this.log.warn(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to delete a row but the minimum rows ${tmpGroup.MinimumRowCount} has been reached.`);
					return false;
				}

				let tmpRowIndex = parseInt(String(pRowIndex), 10);
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to delete row [${pRowIndex}] but the index is out of bounds.`);
					return false;
				}
				tmpDestinationObject.splice(tmpRowIndex, 1);
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				//pView.marshalToView();
				// We've re-rendered but we don't know what needs to be marshaled based on the solve that ran above so marshal everything
				this.pict.views.PictFormMetacontroller.marshalFormSections();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = pRowIndex.toString();
				if (!(tmpRowIndex in tmpDestinationObject))
				{
					this.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to delete row [${pRowIndex}] but the object does not contain pView entry.`);
					return false;
				}
				delete tmpDestinationObject[tmpRowIndex]
				this.pict.providers.DynamicSolver.solveViews();
				pView.render();
				//pView.marshalToView();
				// We've re-rendered but we don't know what needs to be marshaled based on the solve that ran above so marshal everything
				this.pict.views.PictFormMetacontroller.marshalFormSections();
			}
		}
	}
}

module.exports = DynamicTabularData;
module.exports.default_configuration = _DefaultProviderConfiguration;
