const libPictProvider = require('pict-provider');

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'ManyfestDataProvider',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,
}

class ManyfestDataProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, _DEFAULT_PROVIDER_CONFIGURATION, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		// This allows unit tests to run
		this.storageProvider = this;
		this.keyCache = {};
		if ((typeof(window) === 'object') && (typeof(window.localStorage) === 'object'))
		{
			this.storageProvider = window.localStorage;
		}
	}

	onInitialize()
	{
		this.AppData.StudentList = [];
		this.AppData.AssignmentList = [];

		this.loadData();
	}

	saveData()
	{
		this.storageProvider.setItem('StudentList', JSON.stringify(this.pict.AppData.StudentList));
		this.storageProvider.setItem('AssignmentList', JSON.stringify(this.pict.AppData.AssignmentList));
	}

	loadData()
	{
		let tmpStudentJSON = this.storageProvider.getItem('StudentList');
		if (tmpStudentJSON)
		{
			this.pict.AppData.StudentList = JSON.parse(tmpStudentJSON);
		}
		let tmpAssignmentJSON = this.storageProvider.getItem('AssignmentList');
		if (tmpAssignmentJSON)
		{
			this.pict.AppData.AssignmentList = JSON.parse(tmpAssignmentJSON);
		}
	}

	getItem(pKey)
	{
		if (pKey in this.keyCache)
		{
			return this.keyCache[pKey];
		}

		return false;
	}

	setItem(pKey, pValue)
	{
		this.keyCache[pKey] = pValue;
		return true;
	}

	removeItem(pKey)
	{
		if (pKey in this.keyCache)
		{
			delete this.keyCache[pKey];
			return true;
		}

		return false;
	}
}

module.exports = ManyfestDataProvider;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;