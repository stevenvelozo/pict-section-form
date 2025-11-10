/**
 * @fileOverview A module for detecting data changes in Pict dynamic forms. It extends the functionality of the `pict-provider` module to include data change detection capabilities.
 */

const libPictProvider = require('pict-provider');

/**
 * Default configuration for the PictDataChangeDetection provider.
 * @type {Record<string, any>}
 */
const _DefaultProviderConfiguration = {
	ProviderIdentifier: "Pict-DynamicForms-Provider-DataChangeDetection",
	AutoInitialize: true,
	AutoInitializeOrdinal: 0,
	AutoSolveWithApp: false
};

/**
 * Class representing a data change detection provider for Pict dynamic forms.
 * @extends libPictProvider
 */
class PictDataChangeDetection extends libPictProvider
{
	/**
	 * Creates an instance of PictDataChangeDetection.
	 * @param {Object} pFable - The Fable object.
	 * @param {Object} pOptions - Custom options for the provider.
	 * @param {string} pServiceHash - The service hash.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		/**
		 * @property {Object} cachedValues - Stores the cached values for comparison.
		 */
		this.cachedValues = {};
	}

	/**
	 * Clears the cache of stored values.
	 */
	clearCache()
	{
		this.cachedValues = {};
	}

	/**
	 * Sets a value in the cache for a given address.
	 * @param {string} pAddress - The address to cache the value for.
	 * @param {*} pValue - The value to cache.
	 */
	setCache(pAddress, pValue)
	{
		this.cachedValues[pAddress] = pValue;
	}

	/**
	 * Checks if the value at the given address has changed.
	 * @param {string} pAddress - The address to check for a change.
	 * @param {*} pValue - The current value to compare against the cached value.
	 * @returns {boolean} True if the value has changed, false otherwise.
	 */
	valueHasChanged(pAddress, pValue)
	{
		if (!this.cachedValues.hasOwnProperty(pAddress))
		{
			return true;
		}

		if (this.cachedValues[pAddress] !== pValue)
		{
			return true;
		}

		return false;
	}
}

module.exports = PictDataChangeDetection;
module.exports.default_configuration = _DefaultProviderConfiguration;
