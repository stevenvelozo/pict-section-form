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

	count(pFilter, fCallback)
	{
		return fCallback();
	}

	readRecordList(pFilter, fCallback)
	{
		return fCallback();
	}

	readRecord(pFilter, fCallback)
	{
		return fCallback();
	}

	writeRecord(pRecord, fCallback)
	{
		return fCallback();
	}

	deleteRecord(pRecord, fCallback)
	{
		return fCallback();
	}
}

module.exports = PictRecordSet;
module.exports.default_configuration = _DefaultProviderConfiguration;
