const libPictProvider = require('pict-provider');

// Picked an open source npm module that saw a lot of use as our router
const libRouterJS = require('router_js');

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

		this.manyfestList = [];
		this.loadManyfestList();
	}

	listManyfests()
	{
		return this.manyfestList.map((pValue, pIndex) => { return { Index: pIndex, Scope: pValue }; })
	}

	getManyfestKey(pScope)
	{
		// Default to the loaded manyfest if nothing is passed in.
		let tmpScope = (typeof(pScope) === 'string') ? pScope : this.pict.AppData.Scope;
		return `Manyfest_Scoped_As_${tmpScope}`;
	}

	loadManyfestList()
	{
		let tmpManyfestListJSON = this.storageProvider.getItem(`Manyfest_List`);

		if (!tmpManyfestListJSON)
		{
			tmpManyfestListJSON = '[]';
			this.storageProvider.setItem('Manyfest_List', tmpManyfestListJSON);
		}

		this.manyfestList = JSON.parse(tmpManyfestListJSON);

		if (!Array.isArray(this.manyfestList))
		{
			this.manyfestList = [];
			this.saveManyfestList()
		}

		if (this.pict.views.ManyfestLoadListView)
		{
			this.pict.views.ManyfestLoadListView.render()
		}

		return this.manyfestList;
	}

	saveManyfestList(pManyfestList)
	{
		if (Array.isArray(pManyfestList))
		{
			this.manyfestList = pManyfestList;
		}
		if (!Array.isArray(this.manyfestList))
		{
			this.manyfestList = [];
		}
		this.storageProvider.setItem('Manyfest_List', JSON.stringify(this.manyfestList));

		if (this.pict.views.ManyfestLoadListView)
		{
			this.pict.views.ManyfestLoadListView.render()
		}

		return true;
	}

	addScopeToManyfestList(pScope)
	{
		let tmpManyfestList = this.loadManyfestList();

		let tmpManyfestScopeIndex = tmpManyfestList.indexOf(pScope);

		if (tmpManyfestScopeIndex >= 0)
		{
			return false;
		}

		this.manyfestList.push(pScope);

		this.saveManyfestList();
	}

	removeScopeFromManyfestList(pScope)
	{
		let tmpManyfestList = this.loadManyfestList();

		let tmpManyfestScopeIndex = tmpManyfestList.indexOf(pScope);

		if (tmpManyfestScopeIndex >= 0)
		{
			// Could use array splice but meh
			let tmpNewManyfestList = [];

			for (let i = 0; i < tmpManyfestList.length; i++)
			{
				if (tmpManyfestList[i]!= pScope)
				{
					tmpNewManyfestList.push(tmpManyfestList[i]);
				}

				this.saveManyfestList(tmpNewManyfestList);

				if (this.pict.views.ManyfestLoadListView)
				{
					this.pict.views.ManyfestLoadListView.render()
				}

				return true;
			}
		}

		return false;
	}

	saveManyfest()
	{
		let tmpManyfestScope = this.pict.AppData.Scope;

		this.storageProvider.setItem(this.getManyfestKey(tmpManyfestScope), JSON.stringify(this.pict.AppData));

		this.addScopeToManyfestList(tmpManyfestScope);
	}

	loadManyfest(pManyfestScope)
	{
		let tmpManyfestJSON = this.storageProvider.getItem(this.getManyfestKey(pManyfestScope));

		if (tmpManyfestJSON)
		{
			this.pict.AppData = JSON.parse(tmpManyfestJSON);
		}
	}

	getItem(pKey)
	{
		if (this.keyCache.hasOwnProperty(pKey))
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
		if (this.keyCache.hasOwnProperty(pKey))
		{
			delete this.keyCache[pKey];
			return true;
		}

		return false;
	}
}

module.exports = ManyfestDataProvider;
module.exports.default_configuration = _DEFAULT_PROVIDER_CONFIGURATION;