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

		let tmpMarshalDestinationObject = pView.getMarshalDestinationObject();

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
						let tmpFilterValueAddress = tmpFilterRule.FilterValueAddres;
						let tmpFilterValueListAddress = tmpFilterRule.FilterValueListAddress;
						let tmpFilterValueTemplate = tmpFilterRule.FilterValueTemplate;

						// Check if there is a value to filter on; otherwise this won't remove values from the set.
						break;
						
				}
			}

			if (!tmpEntryAllowed)
			{
				tmpFilteredList = tmpFilteredList.splice(h,1);
			}
		}
		return tmpFilteredList;
	}
}

module.exports = PictListDistilling;
module.exports.default_configuration = _DefaultProviderConfiguration;
