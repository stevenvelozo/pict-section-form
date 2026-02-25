const libPictProvider = require('pict-provider');

/** @type {Record<string, any>} */
const _DefaultProviderConfiguration = (
{
	"ProviderIdentifier": "Pict-DynamicForms-Provider-FormPersistence",

	"AutoInitialize": true,
	"AutoInitializeOrdinal": 0,

	"AutoSolveWithApp": false,

	// Scoping configuration
	// Override the app identifier; defaults to pict.settings.Product
	"AppIdentifier": false,
	// Override the form type identifier; defaults to "DefaultForm"
	"FormTypeIdentifier": false,

	// Auto-persistence settings
	// When true, the provider will automatically persist the active form on data changes
	// triggered from DynamicForm views (dataChanged / dataChangedTabular).
	"AutoPersistOnDataChange": false,
	"AutoPersistDebounceMs": 2000,
	// When true, bundle data is also saved alongside form data during autosave
	// if the active form record has a BundleContextIdentifier.
	"AutoPersistBundleWithForm": true,

	// Storage key prefix
	"StorageKeyPrefix": "PSF",

	// The address to resolve bundle data from (e.g. "Bundle")
	"BundleSourceAddress": "Bundle",
	// The address to resolve form data from; false means use DataBroker.marshalDestination
	"FormDataSourceAddress": false
});

/**
 * Provider for offline form data persistence.
 *
 * Stores form data and bundle data in scoped records (localStorage by default).
 * The wrapping application can override the storage backend by calling setStorageAdapter().
 *
 * This provider is opt-in; the wrapping application registers it when needed.
 *
 * @extends libPictProvider
 */
class PictFormPersistence extends libPictProvider
{
	/**
	 * @param {import('fable')} pFable - The Fable instance.
	 * @param {Record<string, any>} [pOptions] - The options for the provider.
	 * @param {string} [pServiceHash] - The service hash for the provider.
	 */
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(_DefaultProviderConfiguration)), pOptions);

		super(pFable, tmpOptions, pServiceHash);

		/** @type {any} */
		this.options;
		/** @type {import('pict')} */
		this.pict;
		/** @type {any} */
		this.log;

		/** @type {string|null} */
		this._activeFormGUID = null;

		/** @type {any} */
		this._persistTimerHandle = null;

		// Initialize the default localStorage adapter
		this.storageAdapter = this.createLocalStorageAdapter();
	}

	// ========================================================================
	// Storage Adapter
	// ========================================================================

	/**
	 * Creates the default localStorage adapter.
	 *
	 * @returns {object} An adapter object with setItem, getItem, removeItem, getKeysWithPrefix methods.
	 */
	createLocalStorageAdapter()
	{
		let tmpSelf = this;

		return (
		{
			setItem: function (pKey, pValue)
			{
				try
				{
					if (typeof (window) !== 'undefined' && window.localStorage)
					{
						window.localStorage.setItem(pKey, pValue);
						return true;
					}
					tmpSelf.log.warn('FormPersistence: localStorage is not available.');
					return false;
				}
				catch (pError)
				{
					tmpSelf.log.error(`FormPersistence: localStorage setItem error: ${pError.message}`);
					return false;
				}
			},

			getItem: function (pKey)
			{
				try
				{
					if (typeof (window) !== 'undefined' && window.localStorage)
					{
						return window.localStorage.getItem(pKey);
					}
					tmpSelf.log.warn('FormPersistence: localStorage is not available.');
					return null;
				}
				catch (pError)
				{
					tmpSelf.log.error(`FormPersistence: localStorage getItem error: ${pError.message}`);
					return null;
				}
			},

			removeItem: function (pKey)
			{
				try
				{
					if (typeof (window) !== 'undefined' && window.localStorage)
					{
						window.localStorage.removeItem(pKey);
						return true;
					}
					tmpSelf.log.warn('FormPersistence: localStorage is not available.');
					return false;
				}
				catch (pError)
				{
					tmpSelf.log.error(`FormPersistence: localStorage removeItem error: ${pError.message}`);
					return false;
				}
			},

			getKeysWithPrefix: function (pPrefix)
			{
				let tmpKeys = [];
				try
				{
					if (typeof (window) !== 'undefined' && window.localStorage)
					{
						for (let i = 0; i < window.localStorage.length; i++)
						{
							let tmpKey = window.localStorage.key(i);
							if (tmpKey && tmpKey.startsWith(pPrefix))
							{
								tmpKeys.push(tmpKey);
							}
						}
					}
				}
				catch (pError)
				{
					tmpSelf.log.error(`FormPersistence: localStorage getKeysWithPrefix error: ${pError.message}`);
				}
				return tmpKeys;
			}
		});
	}

	/**
	 * Replace the storage adapter with a custom implementation.
	 *
	 * The adapter must implement: setItem(key, value), getItem(key), removeItem(key), getKeysWithPrefix(prefix).
	 *
	 * @param {object} pAdapter - The storage adapter to use.
	 * @returns {boolean} True if the adapter was accepted.
	 */
	setStorageAdapter(pAdapter)
	{
		if (typeof (pAdapter) !== 'object' || pAdapter === null)
		{
			this.log.error('FormPersistence setStorageAdapter called with an invalid adapter.');
			return false;
		}

		let tmpRequiredMethods = ['setItem', 'getItem', 'removeItem', 'getKeysWithPrefix'];

		for (let i = 0; i < tmpRequiredMethods.length; i++)
		{
			if (typeof (pAdapter[tmpRequiredMethods[i]]) !== 'function')
			{
				this.log.error(`FormPersistence setStorageAdapter: adapter is missing required method [${tmpRequiredMethods[i]}].`);
				return false;
			}
		}

		this.storageAdapter = pAdapter;
		return true;
	}

	// ========================================================================
	// Key Generation
	// ========================================================================

	/**
	 * Returns the application identifier for storage key scoping.
	 *
	 * @returns {string}
	 */
	getAppIdentifier()
	{
		if (this.options.AppIdentifier)
		{
			return this.options.AppIdentifier;
		}
		if (this.pict && this.pict.settings && this.pict.settings.Product)
		{
			return this.pict.settings.Product;
		}
		return 'DefaultApp';
	}

	/**
	 * Returns the form type identifier for storage key scoping.
	 *
	 * @returns {string}
	 */
	getFormTypeIdentifier()
	{
		if (this.options.FormTypeIdentifier)
		{
			return this.options.FormTypeIdentifier;
		}
		return 'DefaultForm';
	}

	/**
	 * Builds a storage key for a specific record type and identifier.
	 *
	 * @param {string} pRecordType - The record type (e.g. "Form", "Bundle", "Index").
	 * @param {string} [pIdentifier] - The specific record identifier (e.g. GUID or context ID).
	 * @returns {string} The fully qualified storage key.
	 */
	getStorageKey(pRecordType, pIdentifier)
	{
		let tmpPrefix = `${this.options.StorageKeyPrefix}:${this.getAppIdentifier()}:${this.getFormTypeIdentifier()}`;

		if (pIdentifier)
		{
			return `${tmpPrefix}:${pRecordType}:${pIdentifier}`;
		}
		return `${tmpPrefix}:${pRecordType}`;
	}

	/**
	 * Returns the storage key for the form index.
	 *
	 * @returns {string}
	 */
	getIndexKey()
	{
		return this.getStorageKey('Index');
	}

	// ========================================================================
	// Index Management
	// ========================================================================

	/**
	 * Retrieves the form index from storage.
	 *
	 * The index contains metadata for all persisted form records.
	 *
	 * @returns {object} The index object with a Records property.
	 */
	getFormIndex()
	{
		let tmpIndexKey = this.getIndexKey();
		let tmpRawIndex = this.storageAdapter.getItem(tmpIndexKey);

		if (tmpRawIndex)
		{
			try
			{
				let tmpIndex = JSON.parse(tmpRawIndex);
				if (typeof (tmpIndex) === 'object' && tmpIndex !== null && ('Records' in tmpIndex))
				{
					return tmpIndex;
				}
			}
			catch (pError)
			{
				this.log.error(`FormPersistence getFormIndex: failed to parse index: ${pError.message}`);
			}
		}

		// Return a fresh empty index
		return { Records: {} };
	}

	/**
	 * Saves the form index to storage.
	 *
	 * @param {object} pIndex - The index object to persist.
	 * @returns {boolean} True if saved successfully.
	 */
	_saveFormIndex(pIndex)
	{
		let tmpIndexKey = this.getIndexKey();
		return this.storageAdapter.setItem(tmpIndexKey, JSON.stringify(pIndex));
	}

	// ========================================================================
	// Form Data CRUD
	// ========================================================================

	/**
	 * Creates a new form record in the index and returns its GUID.
	 *
	 * This does not save any form data yet; it only creates the index entry.
	 * Call saveFormData() to persist the actual form content.
	 *
	 * @param {string} [pBundleContextIdentifier] - An optional context identifier linking this form to a bundle (e.g. a project ID).
	 * @param {string} [pLabel] - An optional human-readable label for this form instance.
	 * @returns {string} The GUID assigned to the new form record.
	 */
	newFormRecord(pBundleContextIdentifier, pLabel)
	{
		let tmpGUID = this.fable.getUUID();
		let tmpNow = new Date().toISOString();

		let tmpFormIndex = this.getFormIndex();

		tmpFormIndex.Records[tmpGUID] = (
		{
			GUID: tmpGUID,
			Created: tmpNow,
			Modified: tmpNow,
			BundleContextIdentifier: pBundleContextIdentifier || null,
			Synced: false,
			SyncedTimestamp: null,
			Label: pLabel || null
		});

		this._saveFormIndex(tmpFormIndex);

		this.log.info(`FormPersistence: created new form record [${tmpGUID}]${pLabel ? ` labeled "${pLabel}"` : ''}.`);

		return tmpGUID;
	}

	/**
	 * Saves the current in-memory form data to storage for a specific instance GUID.
	 *
	 * Reads from the DataBroker marshal destination (or the configured FormDataSourceAddress).
	 *
	 * @param {string} pInstanceGUID - The GUID of the form record to save.
	 * @returns {boolean} True if saved successfully.
	 */
	saveFormData(pInstanceGUID)
	{
		if (!pInstanceGUID)
		{
			this.log.error('FormPersistence saveFormData called without an instance GUID.');
			return false;
		}

		let tmpFormIndex = this.getFormIndex();
		if (!(pInstanceGUID in tmpFormIndex.Records))
		{
			this.log.error(`FormPersistence saveFormData called for unknown GUID [${pInstanceGUID}].`);
			return false;
		}

		let tmpFormDataSource;
		try
		{
			if (this.options.FormDataSourceAddress)
			{
				tmpFormDataSource = this.pict.resolveStateFromAddress(this.options.FormDataSourceAddress);
			}
			else
			{
				tmpFormDataSource = this.pict.providers.DataBroker.marshalDestinationObject;
			}
		}
		catch (pError)
		{
			this.log.error(`FormPersistence saveFormData: failed to resolve form data source: ${pError.message}`);
			return false;
		}

		let tmpSerializedData;
		try
		{
			tmpSerializedData = JSON.stringify(tmpFormDataSource);
		}
		catch (pError)
		{
			this.log.error(`FormPersistence saveFormData: failed to serialize form data: ${pError.message}`);
			return false;
		}

		let tmpStorageKey = this.getStorageKey('Form', pInstanceGUID);
		let tmpResult = this.storageAdapter.setItem(tmpStorageKey, tmpSerializedData);

		if (tmpResult)
		{
			// Update index metadata
			tmpFormIndex.Records[pInstanceGUID].Modified = new Date().toISOString();
			tmpFormIndex.Records[pInstanceGUID].Synced = false;
			this._saveFormIndex(tmpFormIndex);
		}

		return tmpResult;
	}

	/**
	 * Returns the raw serialized form data string for a given GUID without loading it into memory.
	 *
	 * Useful for synchronization -- the wrapping app can send this directly to the server.
	 *
	 * @param {string} pInstanceGUID - The GUID of the form record.
	 * @returns {string|null} The raw JSON string, or null if not found.
	 */
	getFormDataRaw(pInstanceGUID)
	{
		if (!pInstanceGUID)
		{
			this.log.error('FormPersistence getFormDataRaw called without an instance GUID.');
			return null;
		}

		let tmpStorageKey = this.getStorageKey('Form', pInstanceGUID);
		return this.storageAdapter.getItem(tmpStorageKey);
	}

	/**
	 * Loads form data from storage and applies it to the in-memory marshal destination.
	 *
	 * After loading, calls marshalToView() on the metacontroller if available.
	 *
	 * @param {string} pInstanceGUID - The GUID of the form record to load.
	 * @returns {boolean} True if loaded successfully.
	 */
	loadFormData(pInstanceGUID)
	{
		if (!pInstanceGUID)
		{
			this.log.error('FormPersistence loadFormData called without an instance GUID.');
			return false;
		}

		let tmpStorageKey = this.getStorageKey('Form', pInstanceGUID);
		let tmpSerializedData = this.storageAdapter.getItem(tmpStorageKey);

		if (tmpSerializedData === null)
		{
			this.log.warn(`FormPersistence loadFormData: no data found for GUID [${pInstanceGUID}].`);
			return false;
		}

		let tmpFormData;
		try
		{
			tmpFormData = JSON.parse(tmpSerializedData);
		}
		catch (pError)
		{
			this.log.error(`FormPersistence loadFormData: failed to parse stored data for GUID [${pInstanceGUID}]: ${pError.message}`);
			return false;
		}

		// Resolve the destination object
		let tmpDestinationObject;
		try
		{
			if (this.options.FormDataSourceAddress)
			{
				tmpDestinationObject = this.pict.resolveStateFromAddress(this.options.FormDataSourceAddress);
			}
			else
			{
				tmpDestinationObject = this.pict.providers.DataBroker.marshalDestinationObject;
			}
		}
		catch (pError)
		{
			this.log.error(`FormPersistence loadFormData: failed to resolve destination object: ${pError.message}`);
			return false;
		}

		// Clear existing data and apply loaded data
		let tmpExistingKeys = Object.keys(tmpDestinationObject);
		for (let i = 0; i < tmpExistingKeys.length; i++)
		{
			delete tmpDestinationObject[tmpExistingKeys[i]];
		}
		Object.assign(tmpDestinationObject, tmpFormData);

		// Marshal to view if the metacontroller is available
		if (this.pict.views && this.pict.views.PictFormMetacontroller)
		{
			this.pict.views.PictFormMetacontroller.marshalToView();
		}

		this.log.info(`FormPersistence: loaded form data for GUID [${pInstanceGUID}].`);
		return true;
	}

	/**
	 * Deletes a form record from storage and removes it from the index.
	 *
	 * @param {string} pInstanceGUID - The GUID of the form record to delete.
	 * @returns {boolean} True if deleted successfully.
	 */
	deleteFormRecord(pInstanceGUID)
	{
		if (!pInstanceGUID)
		{
			this.log.error('FormPersistence deleteFormRecord called without an instance GUID.');
			return false;
		}

		let tmpStorageKey = this.getStorageKey('Form', pInstanceGUID);
		this.storageAdapter.removeItem(tmpStorageKey);

		let tmpFormIndex = this.getFormIndex();
		if (pInstanceGUID in tmpFormIndex.Records)
		{
			delete tmpFormIndex.Records[pInstanceGUID];
			this._saveFormIndex(tmpFormIndex);
		}

		this.log.info(`FormPersistence: deleted form record [${pInstanceGUID}].`);
		return true;
	}

	// ========================================================================
	// Bundle Data
	// ========================================================================

	/**
	 * Saves bundle data for a given context identifier.
	 *
	 * Reads from the configured BundleSourceAddress (default: "Bundle").
	 *
	 * @param {string} pContextIdentifier - The bundle context identifier (e.g. a project ID).
	 * @returns {boolean} True if saved successfully.
	 */
	saveBundleData(pContextIdentifier)
	{
		if (!pContextIdentifier)
		{
			this.log.error('FormPersistence saveBundleData called without a context identifier.');
			return false;
		}

		let tmpBundleData;
		try
		{
			tmpBundleData = this.pict.resolveStateFromAddress(this.options.BundleSourceAddress);
		}
		catch (pError)
		{
			this.log.error(`FormPersistence saveBundleData: failed to resolve bundle data source: ${pError.message}`);
			return false;
		}

		let tmpSerializedData;
		try
		{
			tmpSerializedData = JSON.stringify(tmpBundleData);
		}
		catch (pError)
		{
			this.log.error(`FormPersistence saveBundleData: failed to serialize bundle data: ${pError.message}`);
			return false;
		}

		let tmpStorageKey = this.getStorageKey('Bundle', pContextIdentifier);
		return this.storageAdapter.setItem(tmpStorageKey, tmpSerializedData);
	}

	/**
	 * Loads bundle data for a given context identifier into the bundle source address.
	 *
	 * @param {string} pContextIdentifier - The bundle context identifier (e.g. a project ID).
	 * @returns {boolean} True if loaded successfully.
	 */
	loadBundleData(pContextIdentifier)
	{
		if (!pContextIdentifier)
		{
			this.log.error('FormPersistence loadBundleData called without a context identifier.');
			return false;
		}

		let tmpStorageKey = this.getStorageKey('Bundle', pContextIdentifier);
		let tmpSerializedData = this.storageAdapter.getItem(tmpStorageKey);

		if (tmpSerializedData === null)
		{
			this.log.warn(`FormPersistence loadBundleData: no data found for context [${pContextIdentifier}].`);
			return false;
		}

		let tmpBundleData;
		try
		{
			tmpBundleData = JSON.parse(tmpSerializedData);
		}
		catch (pError)
		{
			this.log.error(`FormPersistence loadBundleData: failed to parse stored data for context [${pContextIdentifier}]: ${pError.message}`);
			return false;
		}

		// Resolve the bundle destination
		let tmpBundleDestination;
		try
		{
			tmpBundleDestination = this.pict.resolveStateFromAddress(this.options.BundleSourceAddress);
		}
		catch (pError)
		{
			this.log.error(`FormPersistence loadBundleData: failed to resolve bundle destination: ${pError.message}`);
			return false;
		}

		// Clear existing bundle data and apply loaded data
		let tmpExistingKeys = Object.keys(tmpBundleDestination);
		for (let i = 0; i < tmpExistingKeys.length; i++)
		{
			delete tmpBundleDestination[tmpExistingKeys[i]];
		}
		Object.assign(tmpBundleDestination, tmpBundleData);

		this.log.info(`FormPersistence: loaded bundle data for context [${pContextIdentifier}].`);
		return true;
	}

	/**
	 * Deletes bundle data for a given context identifier.
	 *
	 * @param {string} pContextIdentifier - The bundle context identifier.
	 * @returns {boolean} True if deleted successfully.
	 */
	deleteBundleData(pContextIdentifier)
	{
		if (!pContextIdentifier)
		{
			this.log.error('FormPersistence deleteBundleData called without a context identifier.');
			return false;
		}

		let tmpStorageKey = this.getStorageKey('Bundle', pContextIdentifier);
		this.storageAdapter.removeItem(tmpStorageKey);

		this.log.info(`FormPersistence: deleted bundle data for context [${pContextIdentifier}].`);
		return true;
	}

	// ========================================================================
	// Listing
	// ========================================================================

	/**
	 * Returns an array of all form record metadata objects from the index.
	 *
	 * @returns {Array<object>} An array of form record metadata.
	 */
	listFormRecords()
	{
		let tmpFormIndex = this.getFormIndex();
		return Object.values(tmpFormIndex.Records);
	}

	/**
	 * Returns an array of form records that have not been marked as synced.
	 *
	 * @returns {Array<object>} An array of unsynced form record metadata.
	 */
	listUnsyncedFormRecords()
	{
		let tmpRecords = this.listFormRecords();
		let tmpUnsynced = [];

		for (let i = 0; i < tmpRecords.length; i++)
		{
			if (!tmpRecords[i].Synced)
			{
				tmpUnsynced.push(tmpRecords[i]);
			}
		}

		return tmpUnsynced;
	}

	/**
	 * Returns an array of form records associated with a specific bundle context.
	 *
	 * @param {string} pContextIdentifier - The bundle context identifier.
	 * @returns {Array<object>} An array of matching form record metadata.
	 */
	listFormRecordsForContext(pContextIdentifier)
	{
		let tmpRecords = this.listFormRecords();
		let tmpMatching = [];

		for (let i = 0; i < tmpRecords.length; i++)
		{
			if (tmpRecords[i].BundleContextIdentifier === pContextIdentifier)
			{
				tmpMatching.push(tmpRecords[i]);
			}
		}

		return tmpMatching;
	}

	// ========================================================================
	// Sync Support
	// ========================================================================

	/**
	 * Marks a form record as synced.
	 *
	 * @param {string} pInstanceGUID - The GUID of the form record.
	 * @returns {boolean} True if the record was found and updated.
	 */
	markFormSynced(pInstanceGUID)
	{
		if (!pInstanceGUID)
		{
			this.log.error('FormPersistence markFormSynced called without an instance GUID.');
			return false;
		}

		let tmpFormIndex = this.getFormIndex();

		if (!(pInstanceGUID in tmpFormIndex.Records))
		{
			this.log.warn(`FormPersistence markFormSynced: GUID [${pInstanceGUID}] not found in index.`);
			return false;
		}

		tmpFormIndex.Records[pInstanceGUID].Synced = true;
		tmpFormIndex.Records[pInstanceGUID].SyncedTimestamp = new Date().toISOString();
		this._saveFormIndex(tmpFormIndex);

		return true;
	}

	/**
	 * Marks a form record as dirty (unsynced).
	 *
	 * @param {string} pInstanceGUID - The GUID of the form record.
	 * @returns {boolean} True if the record was found and updated.
	 */
	markFormDirty(pInstanceGUID)
	{
		if (!pInstanceGUID)
		{
			this.log.error('FormPersistence markFormDirty called without an instance GUID.');
			return false;
		}

		let tmpFormIndex = this.getFormIndex();

		if (!(pInstanceGUID in tmpFormIndex.Records))
		{
			this.log.warn(`FormPersistence markFormDirty: GUID [${pInstanceGUID}] not found in index.`);
			return false;
		}

		tmpFormIndex.Records[pInstanceGUID].Synced = false;
		this._saveFormIndex(tmpFormIndex);

		return true;
	}

	// ========================================================================
	// Active Form Management
	// ========================================================================

	/**
	 * Gets the currently active form instance GUID.
	 *
	 * @returns {string|null} The active form GUID, or null if none is set.
	 */
	getActiveFormGUID()
	{
		return this._activeFormGUID;
	}

	/**
	 * Sets the active form instance GUID.
	 *
	 * This is used by persistActiveForm() and triggerDebouncedPersist().
	 *
	 * @param {string} pInstanceGUID - The GUID to set as active.
	 */
	setActiveFormGUID(pInstanceGUID)
	{
		this._activeFormGUID = pInstanceGUID || null;
	}

	/**
	 * Saves the currently active form's data to storage.
	 *
	 * When AutoPersistBundleWithForm is true and the active form record has
	 * a BundleContextIdentifier, the bundle data is also persisted.
	 *
	 * @returns {boolean} True if persisted successfully, false if no active form or save failed.
	 */
	persistActiveForm()
	{
		if (!this._activeFormGUID)
		{
			this.log.warn('FormPersistence persistActiveForm: no active form GUID set.');
			return false;
		}

		let tmpResult = this.saveFormData(this._activeFormGUID);

		// Also persist the associated bundle context if configured
		if (tmpResult && this.options.AutoPersistBundleWithForm)
		{
			let tmpFormIndex = this.getFormIndex();
			let tmpRecord = tmpFormIndex.Records[this._activeFormGUID];
			if (tmpRecord && tmpRecord.BundleContextIdentifier)
			{
				this.saveBundleData(tmpRecord.BundleContextIdentifier);
			}
		}

		return tmpResult;
	}

	/**
	 * Triggers a debounced persist of the active form.
	 *
	 * Call this from a dataChanged handler to avoid persisting on every keystroke.
	 * The persist fires after AutoPersistDebounceMs of inactivity.
	 */
	triggerDebouncedPersist()
	{
		if (!this._activeFormGUID)
		{
			return;
		}

		if (this._persistTimerHandle)
		{
			clearTimeout(this._persistTimerHandle);
		}

		let tmpSelf = this;
		this._persistTimerHandle = setTimeout(
			function ()
			{
				tmpSelf.persistActiveForm();
				tmpSelf._persistTimerHandle = null;
			},
			this.options.AutoPersistDebounceMs);
	}

	/**
	 * Called by DynamicForm views when data changes (dataChanged or dataChangedTabular).
	 *
	 * When AutoPersistOnDataChange is enabled, triggers a debounced persist.
	 * This method exists as the integration hook between the form lifecycle and
	 * the persistence provider -- the DynamicForm view calls this if the provider exists.
	 */
	onFormDataChanged()
	{
		if (this.options.AutoPersistOnDataChange)
		{
			this.triggerDebouncedPersist();
		}
	}
}

module.exports = PictFormPersistence;
module.exports.default_configuration = _DefaultProviderConfiguration;
