const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-ListDistilling",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictListDistilling class is a provider that filters lists based on input rules.
 */
class PictListDistilling extends libPictProvider
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
	}
	
	/*
	  * This is a sidecar just for making filtration simpler.
	  *
	  * Types of Filtration:
	  * 1. Filter by an explicit value list (union of a set of values)
	  *   Example (explicit:
	  *		{ FilterType: "Explicit", FilterList: ["B", "C"] }
	  *   Example (implicit):
	  * 	{ FilterType: "Explicit", FilterListAddress: 'AppData.Bundle.Colors' }
	  * 2. Filter by a cross-map to a "join" list
	  *   Example (explicit):
	  * 	{ FilterType: "CrossMap", FilterValue:10, FilterValueAddress:'IDColor', FilterValueLookupAddress:'AppData.CurrentSelections.IDColor', FilterMap: [{IDColor:10, IDFruit:20}, {IDColor:10, IDFruit:30, {IDColor:20, IDFruit:30}] }
	  *   Example (implicit):
	  * 	{ FilterType: "CrossMap", FilterValue:10, FilterValueAddress:'IDColor', FilterValueLookupAddress:'AppData.CurrentSelections.IDColor', FilterMapAddress: 'AppData.Bundle.ColorFruitJoin' }
	  * 3. Filter by a string match (from an address?!  Would be cool)
	  *   Example:
	  * 	{ FilterType: "StringMatch", StringMatch: '*Apple* }
	  */
	filterList(pView, pInput, pList)
	{
		// The list is expected to be an array of objects with "id" and "text" properties.  This is because of Select2.
		if (typeof(pInput) != 'object')
		{
			this.log.warn(`FilterList failed because the input is not an object.`);
			return pList;
		}
		if (!('PictForm' in pInput))
		{
			this.log.warn(`FilterList failed because the input does not have a PictForm stanza object.`);
			return pList;
		}
		if (!Array.isArray(pList))
		{
			this.log.warn(`FilterList for input [${pInput.Hash}] failed because the list is not an array.`);
			return [];
		}
		let tmpFilterRules = pInput.PictForm.ListFilterRules;
		if ((!tmpFilterRules) || (tmpFilterRules.length == 0) || (!Array.isArray(tmpFilterRules)))
		{
			return pList;
		}

		let tmpFilteredList = [];
		for (let h = 0; h < pList.length; h++)
		{
			let tmpListEntry = pList[h];
			for (let i = 0; i < tmpFilterRules.length; i++)
			{
				let tmpFilterRule = tmpFilterRules[i];
				let tmpEntryAllowed = true;

				switch(tmpFilterRule.FilterType)
				{
					case 'Explicit':
						if (!('FilterList' in tmpFilterRule) || (!Array.isArray(tmpFilterRule.FilterList)))
						{
							this.log.warn(`FilterList failed because the FilterList is not an array.`);
							break;
						}
						if (tmpFilterRule.FilterList.indexOf(tmpListEntry) == -1)
						{
							tmpEntryAllowed = false;
						}
						break;
					case 'CrossMap':
						// This either works from hard-coded values or from an address.
						let tmpFilterValue = tmpFilterRule.FilterValue;
						let tmpFilterValueAddress = tmpFilterRule.FilterValueAddress;
						let tmpFilterValueLookupAddress = tmpFilterRule.FilterValueLookupAddress;
						let tmpFilterMap = tmpFilterRule.FilterMap;
						let tmpFilterMapAddress = tmpFilterRule.FilterMapAddress;
						break;
						
				}

				// Now enumerate each rule and check the filter.
				if (tmpEntryAllowed)
				{
					tmpFilteredList.push(tmpListEntry);
				}
			}
		}
		return tmpFilteredList;
	}
}

module.exports = PictListDistilling;
module.exports.default_configuration = _DefaultProviderConfiguration;
