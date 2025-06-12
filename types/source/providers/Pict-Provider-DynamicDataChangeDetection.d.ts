export = PictDataChangeDetection;
/**
 * Class representing a data change detection provider for Pict dynamic forms.
 * @extends libPictProvider
 */
declare class PictDataChangeDetection extends libPictProvider {
    /**
     * Creates an instance of PictDataChangeDetection.
     * @param {Object} pFable - The Fable object.
     * @param {Object} pOptions - Custom options for the provider.
     * @param {string} pServiceHash - The service hash.
     */
    constructor(pFable: any, pOptions: any, pServiceHash: string);
    /**
     * @property {Object} cachedValues - Stores the cached values for comparison.
     */
    cachedValues: {};
    /**
     * Clears the cache of stored values.
     */
    clearCache(): void;
    /**
     * Sets a value in the cache for a given address.
     * @param {string} pAddress - The address to cache the value for.
     * @param {*} pValue - The value to cache.
     */
    setCache(pAddress: string, pValue: any): void;
    /**
     * Checks if the value at the given address has changed.
     * @param {string} pAddress - The address to check for a change.
     * @param {*} pValue - The current value to compare against the cached value.
     * @returns {boolean} True if the value has changed, false otherwise.
     */
    valueHasChanged(pAddress: string, pValue: any): boolean;
}
declare namespace PictDataChangeDetection {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/**
 * Default configuration for the PictDataChangeDetection provider.
 * @type {Record<string, any>}
 */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicDataChangeDetection.d.ts.map