const libPictProvider = require('pict-provider');

const _DEFAULT_PROVIDER_CONFIGURATION =
{
	ProviderIdentifier: 'ManyfestDataProvider',

	AutoInitialize: true,
	AutoInitializeOrdinal: 0,

	DefaultManifest: require(`../manifests/Manifest-Default.json`)
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

		this.defaultManyfestMeta = {"LastScope":"Default", "ManyfestList":[] };

		this.lastScope = 'Default';
		this.manyfestList = [];

		this.loadManyfestMeta();
		this.saveManyfestMeta();
	}

	onBeforeInitialize()
	{
		if (typeof(this.lastScope) !== 'string')
		{
			this.log.error(`Manyfest Data Provider tried to initialize with nothing in this.lastScope -- which should not be possible.  Things may get weird.`);
			return super.onBeforeInitialize();
		}
		this.loadManyfest(this.lastScope);
		return super.onBeforeInitialize();
	}

	/**
	 * List all available Manyfests (from the Manyfest Meta data)
	 * 
	 * @returns Array<Object> - a list of Manyfests as Index/Scope entries
	 */
	listManyfests()
	{
		this.loadManyfestMeta();
		let tmpManyfestList = this.manyfestList.map((pValue, pIndex) => { return { Index: pIndex, Scope: pValue }; });
		return tmpManyfestList;
	}

	/**
	 * Check if a particular scope is in use.
	 * @param {string} pScope - the manyfest scope to check the existence of
	 * @returns 
	 */
	checkManyfestExists(pScope)
	{
		if (this.AppData.ManyfestRecord.Scope == pScope)
		{
			return true;
		}
		else
		{
			// Make sure other tabs didn't do something funny.
			// Also.  This means users can do FUNNY BUSINESS and mess with the state if they have a 
			// crapton of tabs open and delete a manyfest in one tab and later this check happens.
			// Will not result in data loss but will result in flaky behavior.
			this.loadManyfestMeta(false);
			if (this.manyfestList.indexOf(pScope) >= 0)
			{
				return true;
			}
		}

		return false;
	}

	/**
	 * Resolve a key in the LocalStorage keyspace for the manyfest
	 * 
	 * @param {string} pScope - The scope to resolve a key for
	 * @returns A string that points to the record for the scoped manyfest.
	 */
	getManyfestStorageKey(pScope)
	{
		this.loadManyfestMeta(false);
		// Default to the loaded manyfest if nothing is passed in.
		let tmpScope = (typeof(pScope) === 'string') ? pScope : this.pict.AppData?.ManyfestRecord?.Scope ?? 'DEFAULT';
		return `Manyfest_Scoped_As_${tmpScope}`;
	}

	/**
	 * Save the application metadata (list of Manyfests, last loaded Scope, etc.)
	 * @param {boolean} pRender - Whether or not to also render the list of Manyfests in the UI automatically
	 */
	saveManyfestMeta(pRender)
	{
		let tmpRender = (typeof(pRender) === 'undefined') ? false : pRender;
		if (!Array.isArray(this.manyfestList))
		{
			this.manyfestList = [];
		}

		// TODO: BUG: Gotta have a more complex merge happen here for multiple tabs
		this.storageProvider.setItem('Manyfest_Meta', JSON.stringify({LastScope:this.lastScope, ManyfestList:this.manyfestList}));

		if (tmpRender && this.pict.views.ManyfestPersistenceView)
		{
			this.pict.views.ManyfestPersistenceView.render()
		}

		return true;
	}

	/**
	 * Save the application metadata (list of Manyfests, last loaded Scope, etc.)
	 * @param {boolean} pRender - Whether or not to also render the list of Manyfests in the UI automatically
	 * @returns {Array<object>} The list of available Manyfests.
	 */
	loadManyfestMeta(pRender)
	{
		let tmpRender = (typeof(pRender) === 'undefined') ? false : pRender;
		// We get this every time in case the user has multiple tabs open
		let tmpManyfestMetaJSON = this.storageProvider.getItem(`Manyfest_Meta`);
		if (!tmpManyfestMetaJSON)
		{
			tmpManyfestMetaJSON = JSON.stringify(this.defaultManyfestMeta);
			this.storageProvider.setItem('Manyfest_Meta', tmpManyfestMetaJSON);
		}
		let tmpManyfestMeta = JSON.parse(tmpManyfestMetaJSON)

		this.manyfestList = tmpManyfestMeta.ManyfestList;
		this.lastScope = tmpManyfestMeta.LastScope;

		if (!Array.isArray(this.manyfestList))
		{
			this.manyfestList = [];
			this.saveManyfestMeta()
		}

		if (tmpRender && this.pict.views.ManyfestPersistenceView)
		{
			this.pict.views.ManyfestPersistenceView.render()
		}

		return this.manyfestList;
	}

	addScopeToManyfestList(pScope, pRender)
	{
		let tmpRender = (typeof(pRender) === 'undefined') ? true : pRender;

		this.loadManyfestMeta();

		let tmpManyfestList = this.manyfestList;

		let tmpManyfestScopeIndex = tmpManyfestList.indexOf(pScope);

		if (tmpManyfestScopeIndex >= 0)
		{
			return false;
		}

		this.manyfestList.push(pScope);

		this.saveManyfestMeta();

		if (tmpRender && this.pict.views.ManyfestPersistenceView)
		{
			this.pict.views.ManyfestPersistenceView.render()
		}

		return true;
	}

	removeScopeFromManyfestList(pScope, pRender)
	{
		let tmpRender = (typeof(pRender) === 'undefined') ? true : pRender;

		let tmpManyfestList = this.loadManyfestMeta();

		let tmpManyfestScopeIndex = tmpManyfestList.indexOf(pScope);

		if (tmpManyfestScopeIndex >= 0)
		{
			// Could use array splice but meh
			let tmpNewManyfestList = [];

			for (let i = 0; i < tmpManyfestList.length; i++)
			{
				if (tmpManyfestList[i] != pScope)
				{
					tmpNewManyfestList.push(tmpManyfestList[i]);
				}
			}

			this.manyfestList = tmpNewManyfestList;

			this.saveManyfestMeta(true);

			if (tmpRender && this.pict.views.ManyfestPersistenceView)
			{
				this.pict.views.ManyfestPersistenceView.render()
			}

			return true;
		}

		return false;
	}

	newManyfest(pScope)
	{
		let tmpScope = ((typeof(pScope) === 'string') && (pScope.length > 0)) ? pScope : false;

		if (!tmpScope)
		{
			// Autogenerate a scope
			let tmpProspectiveIndex = this.manyfestList.length;

			// If a user has more than 10,000 manifests we need to talk.  In person.
			for (let i = 0; i < 10000; i++)
			{
				let tmpManyfestScope = `New Manifest ${tmpProspectiveIndex}`;

				if (!this.checkManyfestExists(tmpManyfestScope))
				{
					tmpScope = tmpManyfestScope;
					break;
				}
			}
		}
		else
		{
			// Check to ensure the manyfest doesn't already exist.
			if (this.checkManyfestExists(tmpScope))
			{
				this.log.warn(`Manyfest ${tmpScope} already exists but it was explicitly requested by the user.  Loading insted.`);
				return this.loadManyfest(tmpScope);
			}
		}

		// As far as I can tell this only happens if the user has more than 10,000 manifests
		if (!tmpScope)
		{
			this.log.warn(`You have won the lottery.  Seriously.  Call us to learn more!  Please email steven@velozo.com for more details.`);
			tmpScope = 'LotteryWinner';
		}

		// Now create the new manyfest
		let tmpNewManifest = JSON.parse(JSON.stringify(this.options.DefaultManifest));
		tmpNewManifest.Scope = tmpScope;

		// Now save it.
		this.storageProvider.setItem(this.getManyfestStorageKey(tmpScope), JSON.stringify(tmpNewManifest));
		this.addScopeToManyfestList(tmpScope, true);

		// TODO: Do we load it?  Maaaaaaaybe.  Figure out the "autosave before load" workflow.

		this.loadManyfest(tmpScope);
	}

	saveManyfest()
	{
		let tmpManyfestScope = this.pict.AppData.ManyfestRecord.Scope;
		// TODO: Should this be a .... merge?  Yikes.  Multiple tabs is bonkers.
		this.storageProvider.setItem(this.getManyfestStorageKey(tmpManyfestScope), JSON.stringify(this.pict.AppData.ManyfestRecord));
		this.addScopeToManyfestList(tmpManyfestScope);
	}

	loadManyfest(pManyfestScope)
	{
		let tmpManyfestJSON = this.storageProvider.getItem(this.getManyfestStorageKey(pManyfestScope));
		if (tmpManyfestJSON)
		{
			this.pict.AppData.ManyfestRecord = JSON.parse(tmpManyfestJSON);
		}
		this.pict.providers.ManyfestRouter.postPersistNavigate();
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