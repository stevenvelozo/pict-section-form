const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-DynamicTabularData",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

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
	}

	getTabularRecordSet(pView, pGroupIndex)
	{
		// The neat thing about how the tabular groups work is that we can make it clever about whether it's an object or an array.
		let tmpGroup = pView.getGroup(pGroupIndex);
		if (!tmpGroup)
		{
			this.log.warn(`PICT View Metatemplate Helper getTabularRecordSet ${pGroupIndex} was not a valid group.`);
			return false;
		}
		return pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);
	}

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

	createDynamicTableRow(pView, pGroupIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				tmpDestinationObject.push(tmpGroup.supportingManifest.populateDefaults({}))
				pView.render();
				pView.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = pView.fable.getUUID();
				tmpDestinationObject[tmpRowIndex] = tmpGroup.supportingManifest.populateDefaults({});
				pView.render();
				pView.marshalToView();
			}
		}
	}

	setDynamicTableRowIndex(pView, pGroupIndex, pRowIndex, pNewRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				let tmpNewRowIndex = parseInt(pNewRowIndex, 10);
				if ((tmpDestinationObject.length <= tmpRowIndex) || (tmpRowIndex < 0))
				{
					this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] to [${pNewRowIndex}] but the index is out of bounds.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpNewRowIndex, 0, tmpElementToBeMoved[0]);
				pView.render();
				pView.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] to [${pNewRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}

	moveDynamicTableRowDown(pView, pGroupIndex, pRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] down but it's already at the bottom.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpRowIndex + 1, 0, tmpElementToBeMoved[0]);
				pView.render();
				pView.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}

	moveDynamicTableRowUp(pView, pGroupIndex, pRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				if (tmpRowIndex == 0)
				{
					this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] up but it's already at the top.`);
					return false;
				}
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but the index is out of bounds.`);
					return false;
				}
				let tmpElementToBeMoved = tmpDestinationObject.splice(tmpRowIndex, 1);
				tmpDestinationObject.splice(tmpRowIndex - 1, 0, tmpElementToBeMoved[0]);
				pView.render();
				pView.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to move row [${pRowIndex}] but it's an object not an array; order isn't controllable.`);
			}
		}
	}


	deleteDynamicTableRow(pView, pGroupIndex, pRowIndex)
	{
		let tmpGroup = pView.getGroup(pGroupIndex);

		if (tmpGroup)
		{
			let tmpDestinationObject = pView.sectionManifest.getValueByHash(pView.getMarshalDestinationObject(), tmpGroup.RecordSetAddress);

			if (Array.isArray(tmpDestinationObject))
			{
				let tmpRowIndex = parseInt(pRowIndex, 10);
				if (tmpDestinationObject.length <= tmpRowIndex)
				{
					this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to delete row [${pRowIndex}] but the index is out of bounds.`);
					return false;
				}
				tmpDestinationObject.splice(tmpRowIndex, 1);
				pView.render();
				pView.marshalToView();
			}
			else if (typeof(tmpDestinationObject) === 'object')
			{
				let tmpRowIndex = pRowIndex.toString();
				if (!(tmpRowIndex in tmpDestinationObject))
				{
					this.pict.log.error(`Dynamic View [${pView.UUID}]::[${pView.Hash}] Group ${tmpGroup.Hash} attempting to delete row [${pRowIndex}] but the object does not contain pView entry.`);
					return false;
				}
				delete tmpDestinationObject[tmpRowIndex]
				pView.render();
				pView.marshalToView();
			}
		}
	}
}

module.exports = DynamicTabularData;
module.exports.default_configuration = _DefaultProviderConfiguration;
