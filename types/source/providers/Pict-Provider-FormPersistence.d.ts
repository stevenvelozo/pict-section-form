export = PictFormPersistence;
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
declare class PictFormPersistence extends libPictProvider {
    /** @type {any} */
    options: any;
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {string|null} */
    _activeFormGUID: string | null;
    /** @type {any} */
    _persistTimerHandle: any;
    storageAdapter: any;
    /**
     * Creates the default localStorage adapter.
     *
     * @returns {object} An adapter object with setItem, getItem, removeItem, getKeysWithPrefix methods.
     */
    createLocalStorageAdapter(): object;
    /**
     * Replace the storage adapter with a custom implementation.
     *
     * The adapter must implement: setItem(key, value), getItem(key), removeItem(key), getKeysWithPrefix(prefix).
     *
     * @param {object} pAdapter - The storage adapter to use.
     * @returns {boolean} True if the adapter was accepted.
     */
    setStorageAdapter(pAdapter: object): boolean;
    /**
     * Returns the application identifier for storage key scoping.
     *
     * @returns {string}
     */
    getAppIdentifier(): string;
    /**
     * Returns the form type identifier for storage key scoping.
     *
     * @returns {string}
     */
    getFormTypeIdentifier(): string;
    /**
     * Builds a storage key for a specific record type and identifier.
     *
     * @param {string} pRecordType - The record type (e.g. "Form", "Bundle", "Index").
     * @param {string} [pIdentifier] - The specific record identifier (e.g. GUID or context ID).
     * @returns {string} The fully qualified storage key.
     */
    getStorageKey(pRecordType: string, pIdentifier?: string): string;
    /**
     * Returns the storage key for the form index.
     *
     * @returns {string}
     */
    getIndexKey(): string;
    /**
     * Retrieves the form index from storage.
     *
     * The index contains metadata for all persisted form records.
     *
     * @returns {object} The index object with a Records property.
     */
    getFormIndex(): object;
    /**
     * Saves the form index to storage.
     *
     * @param {object} pIndex - The index object to persist.
     * @returns {boolean} True if saved successfully.
     */
    _saveFormIndex(pIndex: object): boolean;
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
    newFormRecord(pBundleContextIdentifier?: string, pLabel?: string): string;
    /**
     * Saves the current in-memory form data to storage for a specific instance GUID.
     *
     * Reads from the DataBroker marshal destination (or the configured FormDataSourceAddress).
     *
     * @param {string} pInstanceGUID - The GUID of the form record to save.
     * @returns {boolean} True if saved successfully.
     */
    saveFormData(pInstanceGUID: string): boolean;
    /**
     * Returns the raw serialized form data string for a given GUID without loading it into memory.
     *
     * Useful for synchronization -- the wrapping app can send this directly to the server.
     *
     * @param {string} pInstanceGUID - The GUID of the form record.
     * @returns {string|null} The raw JSON string, or null if not found.
     */
    getFormDataRaw(pInstanceGUID: string): string | null;
    /**
     * Loads form data from storage and applies it to the in-memory marshal destination.
     *
     * After loading, calls marshalToView() on the metacontroller if available.
     *
     * @param {string} pInstanceGUID - The GUID of the form record to load.
     * @returns {boolean} True if loaded successfully.
     */
    loadFormData(pInstanceGUID: string): boolean;
    /**
     * Deletes a form record from storage and removes it from the index.
     *
     * @param {string} pInstanceGUID - The GUID of the form record to delete.
     * @returns {boolean} True if deleted successfully.
     */
    deleteFormRecord(pInstanceGUID: string): boolean;
    /**
     * Saves bundle data for a given context identifier.
     *
     * Reads from the configured BundleSourceAddress (default: "Bundle").
     *
     * @param {string} pContextIdentifier - The bundle context identifier (e.g. a project ID).
     * @returns {boolean} True if saved successfully.
     */
    saveBundleData(pContextIdentifier: string): boolean;
    /**
     * Loads bundle data for a given context identifier into the bundle source address.
     *
     * @param {string} pContextIdentifier - The bundle context identifier (e.g. a project ID).
     * @returns {boolean} True if loaded successfully.
     */
    loadBundleData(pContextIdentifier: string): boolean;
    /**
     * Deletes bundle data for a given context identifier.
     *
     * @param {string} pContextIdentifier - The bundle context identifier.
     * @returns {boolean} True if deleted successfully.
     */
    deleteBundleData(pContextIdentifier: string): boolean;
    /**
     * Returns an array of all form record metadata objects from the index.
     *
     * @returns {Array<object>} An array of form record metadata.
     */
    listFormRecords(): Array<object>;
    /**
     * Returns an array of form records that have not been marked as synced.
     *
     * @returns {Array<object>} An array of unsynced form record metadata.
     */
    listUnsyncedFormRecords(): Array<object>;
    /**
     * Returns an array of form records associated with a specific bundle context.
     *
     * @param {string} pContextIdentifier - The bundle context identifier.
     * @returns {Array<object>} An array of matching form record metadata.
     */
    listFormRecordsForContext(pContextIdentifier: string): Array<object>;
    /**
     * Marks a form record as synced.
     *
     * @param {string} pInstanceGUID - The GUID of the form record.
     * @returns {boolean} True if the record was found and updated.
     */
    markFormSynced(pInstanceGUID: string): boolean;
    /**
     * Marks a form record as dirty (unsynced).
     *
     * @param {string} pInstanceGUID - The GUID of the form record.
     * @returns {boolean} True if the record was found and updated.
     */
    markFormDirty(pInstanceGUID: string): boolean;
    /**
     * Gets the currently active form instance GUID.
     *
     * @returns {string|null} The active form GUID, or null if none is set.
     */
    getActiveFormGUID(): string | null;
    /**
     * Sets the active form instance GUID.
     *
     * This is used by persistActiveForm() and triggerDebouncedPersist().
     *
     * @param {string} pInstanceGUID - The GUID to set as active.
     */
    setActiveFormGUID(pInstanceGUID: string): void;
    /**
     * Saves the currently active form's data to storage.
     *
     * When AutoPersistBundleWithForm is true and the active form record has
     * a BundleContextIdentifier, the bundle data is also persisted.
     *
     * @returns {boolean} True if persisted successfully, false if no active form or save failed.
     */
    persistActiveForm(): boolean;
    /**
     * Triggers a debounced persist of the active form.
     *
     * Call this from a dataChanged handler to avoid persisting on every keystroke.
     * The persist fires after AutoPersistDebounceMs of inactivity.
     */
    triggerDebouncedPersist(): void;
    /**
     * Called by DynamicForm views when data changes (dataChanged or dataChangedTabular).
     *
     * When AutoPersistOnDataChange is enabled, triggers a debounced persist.
     * This method exists as the integration hook between the form lifecycle and
     * the persistence provider -- the DynamicForm view calls this if the provider exists.
     */
    onFormDataChanged(): void;
}
declare namespace PictFormPersistence {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-FormPersistence.d.ts.map