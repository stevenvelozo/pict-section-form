const libPictProvider = require('pict-provider');

const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-RecordSet",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false
});

/**
 * The PictRecordSet class is a provider to read and write record sets.
 *
 * Record sets are bodies of records that are larger than what we would want to
 * be projected into a view.
 */
class PictRecordSet extends libPictProvider
{
	/**
	 * Creates an instance of the PictRecordSet class.
	 *
	 * @param {object} pFable - The fable object.
	 * @param {object} pOptions - The options object.
	 * @param {object} pServiceHash - The service hash object.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.recordProviders = {};
	}

	/**
	 * Returns the count for a specific dynamic record set.
	 *
	 * @param {Object} pFilter - The filter object.
	 * @param {Function} fCallback - The callback function to be called after the count is returned.
	 * @returns {any} - The result of the callback function.
	 */
	count(pFilter, fCallback)
	{
		return fCallback();
	}

	/**
	 * Reads a record list.
	 *
	 * @param {Object} pFilter - The filter object.
	 * @param {Function} fCallback - The callback function to be called after the record list is read.
	 * @returns {any} - The result of the callback function.
	 */
	readRecordList(pFilter, fCallback)
	{
		return fCallback();
	}

	/**
	 * Reads a record.
	 *
	 * @param {Object} pFilter - The filter object.
	 * @param {Function} fCallback - The callback function to be called after the record is read.
	 * @returns {any} - The result of the callback function.
	 */
	readRecord(pFilter, fCallback)
	{
		return fCallback();
	}

	/**
	 * Writes a record.
	 *
	 * @param {Object} pRecord - The record to be written.
	 * @param {Function} fCallback - The callback function to be called after the record is written.
	 * @returns {any} - The result of the callback function.
	 */
	writeRecord(pRecord, fCallback)
	{
		return fCallback();
	}

	/**
	 * Deletes a record.
	 *
	 * @param {Object} pRecord - The record to be deleted.
	 * @param {Function} fCallback - The callback function to be called after the record is deleted.
	 * @returns {any} - The result of the callback function.
	 */
	deleteRecord(pRecord, fCallback)
	{
		return fCallback();
	}
}

module.exports = PictRecordSet;
module.exports.default_configuration = _DefaultProviderConfiguration;
