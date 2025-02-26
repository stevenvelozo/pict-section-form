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

		/** @type {any} */
		this.options;
		/** @type {import('pict')} */
		this.pict;
		/** @type {import('pict')} */
		this.fable;
		/** @type {any} */
		this.log;
		/** @type {string} */
		this.UUID;
		/** @type {string} */
		this.Hash;

		this.computedLists = {};
		this.listDefinitions = {};
	}

	/**
	 * Retrieves a list based on the provided view hash and list hash.
	 *
	 * @param {string} pListHash - The list hash.
	 * @returns {Array} - The retrieved list.
	 */
	getList(pListHash)
	{
		if (pListHash in this.computedLists)
		{
			return this.computedLists[pListHash];
		}
		return [];
	}

	/**
	 * Checks if a list exists in the Pict Provider MetaLists.
	 *
	 * @param {string} pListHash - The hash of the list.
	 * @returns {boolean} - Returns true if the list exists, otherwise false.
	 */
	hasList(pListHash)
	{
		return (pListHash in this.computedLists);
	}

	/**
	 * Rebuilds any lists defined in specific views
	 * @param {Array} pViewHashes - An array of strings representing the view hashes to rebuild lists for.
	 */
	buildViewSpecificLists(pViewHashes)
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
				if (('PickLists' in tmpSection) && Array.isArray(tmpSection.PickLists))
				{
					for (let j = 0; j < tmpSection.PickLists.length; j++)
					{
						let tmpPickList = tmpSection.PickLists[j];
						this.buildList(tmpPickList);
					}
				}
			}
		}
	}

	/**
	 * Rebuilds a list based on the provided hash.
	 *
	 * @param {string} pListHash - The hash of the list to be rebuilt.
	 */
	rebuildListByHash(pListHash)
	{
		if (pListHash in this.listDefinitions)
		{
			this.buildList(this.listDefinitions[pListHash]);
		}
	}

	/**
	 * Builds a list based on the provided list object.  Stores it internally for use in dropdowns and list boxes.
	 * @param {Object} pListObject - The List definition object
	 * @returns boolean
	 */
	buildList(pListObject)
	{
		// Basic list validation
		if (typeof(pListObject) !== 'object')
		{
			this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList that is not an object. Skipping.`);
			return false;
		}
		if (!('Hash' in pListObject))
		{
			this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a Hash. Skipping.`);
			return false;
		}

		// Lazily add it if it doesn't exist
		if (!(pListObject.Hash in this.listDefinitions))
		{
			this.listDefinitions[pListObject.Hash] = pListObject;
			this.computedLists[pListObject.Hash] = [];
		}

		// Now try to build the list!
		let tmpResultingList = [];

		// Advanced list validation
		if (!('ListAddress' in pListObject))
		{
			this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a ListAddress. Skipping.`);
			this.computedLists[pListObject.Hash] = [];
			return false;
		}
		if (!('ListSourceAddress' in pListObject))
		{
			this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a ListSourceAddress. Skipping.`);
			this.computedLists[pListObject.Hash] = [];
			return false;
		}
		// TODO: Research easy ways to infer this...
		if (!('TextTemplate' in pListObject))
		{
			this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a TextTemplate. Skipping.`);
			this.computedLists[pListObject.Hash] = [];
			return false;
		}
		if (!('IDTemplate' in pListObject))
		{
			this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] found a PickList without a IDTemplate. Skipping.`);
			this.computedLists[pListObject.Hash] = [];
			return false;
		}

		// Now try to fetch the list data
		let tmpListData = this.pict.views.PictFormMetacontroller.getValueByHash(pListObject.ListSourceAddress);
		if (!tmpListData)
		{
			//this.log.warn(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] failed to fetch the list data for PickList [${pListObject.Hash}]. Skipping.`);
			this.computedLists[pListObject.Hash] = [];
			return false;
		}

		// Use this for the unique feature
		let tmpListHashes = {};

		if (Array.isArray(tmpListData))
		{
			for (let i = 0; i < tmpListData.length; i++)
			{
				let tmpListEntry = tmpListData[i];
				if (tmpListEntry && (typeof tmpListEntry === 'object'))
				{
					let tmpTextString = this.pict.parseTemplate(pListObject.TextTemplate, tmpListEntry);
					let tmpIDString = this.pict.parseTemplate(pListObject.IDTemplate, tmpListEntry);

					if (!tmpTextString || !tmpIDString)
					{
						this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] failed to generate the Text or ID for PickList [${pListObject.Hash}]. Skipping.`);
//						this.log.error(`Dynamic MetaList Provider [${this.UUID}]::[${this.Hash}] failed to generate the Text or ID for PickList [${pListObject.Hash}]. Skipping.`, {"Text": tmpTextString, "ID": tmpIDString, "Entry": tmpListEntry});
						continue;
					}

					if (pListObject.Unique && (tmpIDString in tmpListHashes))
					{
						continue;
					}
					tmpListHashes[tmpIDString] = true;
					tmpResultingList.push({"id": tmpIDString, "text": tmpTextString});
				}
			}
		}

		if (pListObject.Sorted)
		{
			tmpResultingList.sort((pLeft, pRight) => pLeft.text.localeCompare(pRight.text));
		}

		// Now store the list
		this.computedLists[pListObject.Hash] = tmpResultingList;
	}
}

module.exports = PictMetalist;
module.exports.default_configuration = _DefaultProviderConfiguration;
