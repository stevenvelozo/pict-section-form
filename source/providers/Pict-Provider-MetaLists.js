const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-MetaList",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictMetalist class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
class PictMetalist extends libPictProvider
{
	/**
	 * Creates an instance of the PictMetalist class.
	 * 
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.computedLists = {};
		this.globalLists = {};
	}

	getList(pViewHash, pListHash)
	{
		if ((pViewHash in this.computedLists) && (pListHash in this.computedLists[pViewHash]))
		{
			return this.computedLists[pViewHash][pListHash];
		}
		else if (pListHash in this.globalLists)
		{
			return this.globalLists[pListHash];
		}
		return [];
	}

	hasList(pViewHash, pListHash)
	{
		return ((pViewHash in this.computedLists) && (pListHash in this.computedLists[pViewHash])) || (pListHash in this.globalLists);
	}

	buildLists(pViewHashes)
	{
		// this.log.trace(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] pulling Metalists.`);
		let tmpViewHashes = Array.isArray(pViewHashes) ? pViewHashes : Object.keys(this.fable.views);

		for (let i = 0; i < tmpViewHashes.length; i++)
		{
			let tmpViewHash = tmpViewHashes[i];
			let tmpView = this.fable.views[tmpViewHash];
			if (tmpView.isPictSectionForm)
			{
				let tmpSection = tmpView.sectionDefinition;
				let tmpListSourceObject = tmpView.getMarshalDestinationObject();
				// For uniqueness tracking
				let tmpListHashes = [];

				if (('PickLists' in tmpSection) && Array.isArray(tmpSection.PickLists))
				{
					for (let i = 0; i < tmpSection.PickLists.length; i++)
					{
						let tmpPickList = tmpSection.PickLists[i];
						let tmpResultingList = [];

						if (!('Hash' in tmpPickList))
						{
							this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a Hash. Skipping.`);
							continue;
						}
						if (!('ListAddress' in tmpPickList))
						{
							this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a ListAddress. Skipping.`);
							continue;
						}
						if (!('ListSourceAddress' in tmpPickList))
						{
							this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a ListSourceAddress. Skipping.`);
							continue;
						}
						// TODO: Research easy ways to infer this...
						if (!('TextTemplate' in tmpPickList))
						{
							this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a TextTemplate. Skipping.`);
							continue
						}
						if (!('IDTemplate' in tmpPickList))
						{
							this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a IDTemplate. Skipping.`);
							continue;
						}

						// Now try to fetch the list data
						let tmpListData = tmpView.sectionManifest.getValueByHash(tmpListSourceObject, tmpPickList.ListSourceAddress);
						if (!tmpListData)
						{
							this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] failed to fetch the list data for PickList [${tmpPickList.Hash}]. Skipping.`);
							continue;
						}

						if (Array.isArray(tmpListData))
						{
							for (let i = 0; i < tmpListData.length; i++)
							{
								let tmpListEntry = tmpListData[i];
								if (tmpListEntry && (typeof tmpListEntry === 'object'))
								{
									debugger;
									let tmpTextString = this.pict.parseTemplate(tmpPickList.TextTemplate, tmpListEntry);
									let tmpIDString = this.pict.parseTemplate(tmpPickList.IDTemplate, tmpListEntry);

									if (!tmpTextString || !tmpIDString)
									{
										this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] failed to generate the Text or ID for PickList [${tmpPickList.Hash}]. Skipping.`);
										continue;
									}

									if (tmpPickList.Unique && (tmpIDString in tmpListHashes))
									{
										continue;
									}
									tmpListHashes[tmpIDString] = true;
									tmpResultingList.push({"id": tmpIDString, "text": tmpTextString});
								}
							}
						}

						if (tmpPickList.Sorted)
						{
							tmpResultingList.sort((pLeft, pRight) => pLeft.text.localeCompare(pRight.text));
						}

						// Now store the list, both in this as well as at the data location address
						if (!(tmpViewHash in this.computedLists))
						{
							this.computedLists[tmpViewHash] = {};
						}
						this.computedLists[tmpViewHash][tmpPickList.Hash] = tmpResultingList;
						this.globalLists[tmpPickList.Hash] = tmpResultingList;
						// Right now all that's available is pict and AppData... which means if they associate it with "Nonce" or such, it will be lost.
						// TODO: This is intentional to allow lists managed here, but should be revisited.
						tmpView.sectionManifest.setValueByHash({Pict:this.pict, AppData:this.pict.AppData}, tmpPickList.ListAddress, tmpResultingList);
					}
				}
			}
		}
	}
}

module.exports = PictMetalist;
module.exports.default_configuration = _DefaultProviderConfiguration;
