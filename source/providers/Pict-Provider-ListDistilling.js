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
	/**
	  * Filter a list of options based on the filtering rules in a dynamic form input.
	  * 
	  * Example Configuration:
	  * ...
			"ListFilterRules": [
					{
						"Filter": "Colour Entry Filter",
						"FilterType": "Explicit",
						"FilterValueComparison": "==",
						"FilterValueAddress": "Listopia.Filters.Colour",
						"IgnoreEmptyValue": true
					},
					{
						"Filter": "Colour List Distilling Filter",
						"FilterType": "CrossMap",
						"JoinListAddress": "View.sectionDefinition.Intersections.Colors.FruitSelectionColorsJoin",
						"JoinListAddressGlobal": true,
						"JoinListValueAddress": "GUIDColors",
						"ExternalValueAddress": "GUIDFruitSelection",
						"FilterToValueAddress": "Listopia.Fruit",
						"IgnoreEmpty": true
					}
				],
	  * ...
	  * 
	  * @param {Object} pView - The pict view the list is within
	  * @param {*} pInput - The input within the dynamic forms view
	  * @param {*} pList - The raw list of options to filter
	  * @returns 
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

		// Make a copy of the incoming list of options
		let tmpFilteredList = pList.slice(0);
		// We walk backwards so we can remove items from the end without breaking this loop.
		for (let h = pList.length - 1; h >= 0; h--)
		{
			let tmpListEntry = pList[h];
			let tmpEntryAllowed = true;
			for (let i = 0; i < tmpFilterRules.length; i++)
			{
				let tmpFilterRule = tmpFilterRules[i];

				// Remember that options are objects with "id" and "text" properties.  Because of Select2.
				// Genericising this with templating.  Most users will not leverage this technology.
				let tmpRecordComparisonValueAddress = ('FilteredRecordComparisonValue' in tmpFilterRule) ? tmpFilterRule.FilteredRecordComparisonValueAddress : false;
				let tmpComparisonValue;
				if (!tmpRecordComparisonValueAddress)
				{
					// Presume it's filtering on 'id'
					tmpComparisonValue = tmpListEntry.id;
				}
				else
				{
					tmpComparisonValue = pView.getValueByHash(tmpRecordComparisonValueAddress);
				}

				switch(tmpFilterRule.FilterType)
				{
					case 'Explicit':
						let tmpExplicitFilterValueAddress = tmpFilterRule.FilterValueAddress;
						let tmpExplicitFilterValueComparison = ('FilterValueComparison' in tmpFilterRule) ? tmpFilterRule.FilterValueComparison : '==';
						let tmpExplicitFilterIgnoreEmpty = ('IgnoreEmptyValue' in tmpFilterRule) ? tmpFilterRule.IgnoreEmptyValue : false;

						// TODO: This can be massively optimized by only solving this when something changes in the data location.
						//       Cache invalidation will be a PITA on this one.
						let tmpExplicitFilterValue = pView.getValueByHash(tmpExplicitFilterValueAddress);

						if (tmpExplicitFilterIgnoreEmpty && ((!tmpExplicitFilterValue) || (tmpExplicitFilterValue == '')))
						{
							// The comparison value is empty, so ignore it.
							break;
						}

						// Now check each value in the list to see if it matches the filter.
						switch(tmpExplicitFilterValueComparison.toLowerCase())
						{
							// Equal To
							case '=':
							case '==':
							case 'eq':
								if (tmpComparisonValue != tmpExplicitFilterValue)
								{
									this.fable.log.debug(`FilterList: ${tmpComparisonValue} != ${tmpExplicitFilterValue}; distilling is removing from the outcome array.`);
									tmpEntryAllowed = false;
								}
								break;

							// Not Equal
							case '!=':
							case 'ne':
								if (tmpComparisonValue == tmpExplicitFilterValue)
								{
									this.fable.log.debug(`FilterList: ${tmpComparisonValue} == ${tmpExplicitFilterValue}; distilling is removing from the outcome array.`);
									tmpEntryAllowed = false;
								}
								break;

							// Approximately Equal
							case '~=':
							case 'ae':
								if (tmpComparisonValue == tmpExplicitFilterValue)
								{
									this.fable.log.debug(`FilterList: ${tmpComparisonValue} == ${tmpExplicitFilterValue}; distilling is removing from the outcome array.`);
									tmpEntryAllowed = false;
								}
								break;
						}
						break;

					case 'CrossMap':
						// Filter based on a list of "join" records, with:
						// A "JoinListAddress" address - where to find the list of joins in the application state
						// A "JoinListAddressGlobal" boolean - if the list is global or not (global means scoped to pict vs appdata/state location)
						// A "JoinListValueAddress" address - the address within the record that maps to the ID of the list value
						// A "ExternalValueAddress" address - the address of the external value we are comparing to
						// A "FilterToValueAddress" address - the external address to use to see if the ExternalValue matches
						// A "IgnoreEmpty" boolean - makes the tech ignore empty ExternalValue (including undefined etc.)
						//
						// So for example, if you had a list of Colors with id: "Red", "Green", "Blue"
						/*
							...And you had a list of joins they would be something like:
							AppData.BrandList [
								{ Brand: "Santa", DominantColor: "Red"},
								{ Brand: "Subaru", DominantColor: "Off White"},
								{ Brand: "Subaru", DominantColor: "Green"},
								{ Brand: "IBM", DominantColor: "Blue"},
								{ .... }
							]

							...And somewhere else we had the following state:

							AppData.SelectedBrand: "Subaru"
						*/
						/*
							The values would be:
								-> JoinListAddress: "AppData.BrandList"
								-> JoinListAddressGlobal: false
								-> JoinListValueAddress: "Record.Color"          <-- (this maps to the id in the select list)
								-> ExternalValueAddress: "Record.Brand"          <-- (this maps to the id for the external lookup)
								-> FilterToValueAddress: "AppData.SelectedBrand"
								-> IgnoreEmpty: true                             <-- Don't filter if the AppData.SelectedBrand is an empty string or such
						*/
						let tmpJoinListAddress = tmpFilterRule.JoinListAddress;
						let tmpJoinListAddressGlobal = ('JoinListAddressGlobal' in tmpFilterRule) ? tmpFilterRule.JoinListAddressGlobal : false;
						let tmpJoinListValueAddress = tmpFilterRule.JoinListValueAddress;
						let tmpExternalValueAddress = tmpFilterRule.ExternalValueAddress;
						let tmpFilterToValueAddress = tmpFilterRule.FilterToValueAddress;
						let tmpIgnoreEmpty = ('IgnoreEmpty' in tmpFilterRule) ? tmpFilterRule.IgnoreEmpty : false;

						let tmpJoinList;
						
						if (tmpJoinListAddressGlobal)
						{
							tmpJoinList = this.pict.manifest.getValueAtAddress({Pict: this.pict, AppData: this.pict.AppData, View: pView}, tmpJoinListAddress);
						}
						else
						{
							tmpJoinList = pView.getValueByHash(tmpJoinListAddress);
						}
						let tmpFilterToValueAddressValue = pView.getValueByHash(tmpFilterToValueAddress);

						if (tmpIgnoreEmpty && ((!tmpFilterToValueAddressValue) || (tmpFilterToValueAddressValue == '')))
						{
							// The comparison value is empty, so ignore it.
							break;
						}
						if ((!Array.isArray(tmpJoinList)) && (tmpJoinList != null) && (typeof(tmpJoinList) == 'object'))
						{
							let tmpJoinListKeys = Object.keys(tmpJoinList);
							let tmpNewJoinList = [];
							for (let i = 0; i < tmpJoinListKeys.length; i++)
							{
								tmpNewJoinList.push(tmpJoinList[tmpJoinListKeys[i]]);
							}
							tmpJoinList = tmpNewJoinList;
						}

						if ((!Array.isArray(tmpJoinList)) || (tmpJoinList.length == 0))
						{
							// The join list is not an array.  We can't filter it.
							break;
						}

						//this.pict.log.trace(`FilterList: CrossMap: JoinListAddress[${tmpJoinListAddress}](${tmpJoinList.length})->${tmpJoinListValueAddress} ExternalValueAddress[${tmpExternalValueAddress}] FilterToValueAddress[${tmpFilterToValueAddress}]`);

						// TODO: This is not industrial grade, yo.  Small lists only please.  O(n^2) is not cool.
						let tmpPossiblyAllowed = false;
						for (let i = 0; i < tmpJoinList.length; i++)
						{
							let tmpJoinListValue = this.pict.manifest.getValueAtAddress(tmpJoinList[i], tmpJoinListValueAddress);
							let tmpExternalValue = this.pict.manifest.getValueAtAddress(tmpJoinList[i], tmpExternalValueAddress);

							if (tmpIgnoreEmpty && ((!tmpJoinListValue) || (tmpJoinListValue == '')))
							{
								// The comparison value is empty, so ignore it.
								continue;
							}

							//this.pict.log.trace(`          CrossMap Test: JoinListValue[${tmpJoinListValue}]<==>ComparisonValue[${tmpComparisonValue}] ExternalValue[${tmpExternalValue}]<==>FilterToValue[${tmpFilterToValueAddressValue}]`);
							if ((tmpFilterToValueAddressValue == tmpExternalValue) && (tmpJoinListValue == tmpComparisonValue))
							{
								//this.pict.log.trace(`   !!! CrossMap: Matched: ${tmpJoinListValue} == ${tmpComparisonValue} && ${tmpExternalValue} == ${tmpFilterToValueAddressValue}`);
								tmpPossiblyAllowed = true;
								break;
							}
						}
						tmpEntryAllowed = tmpPossiblyAllowed && tmpEntryAllowed;

						break;

					default:
						// See if there is a provider for it
						let tmpProvider = this.pict.providers[tmpFilterRule.FilterType];
						if (tmpProvider)
						{
							// Your provider could do anything here.
							// We may want a second place to bolt one of these on
							tmpEntryAllowed = tmpProvider.filterList(pView, pInput, pList, tmpListEntry);
						}
						break;
				}
			}

			if (!tmpEntryAllowed)
			{
				tmpFilteredList.splice(h,1);
			}
		}

		//this.log.trace(`FilterList: Input [${pInput.Hash}] has [${pList.length}] options to filter with [${tmpFilterRules.length}] rules.`);

		return tmpFilteredList;
	}
}

module.exports = PictListDistilling;
module.exports.default_configuration = _DefaultProviderConfiguration;
