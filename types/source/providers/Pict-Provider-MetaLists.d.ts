export = PictMetalist;
/**
 * The PictMetalist class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
declare class PictMetalist extends libPictProvider {
    /** @type {any} */
    options: any;
    /** @type {import('pict') & { log: any, instantiateServiceProviderWithoutRegistration: (hash: String) => any, instantiateServiceProviderIfNotExists: (hash: string) => any, TransactionTracking: import('pict/types/source/services/Fable-Service-TransactionTracking') }} */
    pict: import("pict") & {
        log: any;
        instantiateServiceProviderWithoutRegistration: (hash: string) => any;
        instantiateServiceProviderIfNotExists: (hash: string) => any;
        TransactionTracking: import("pict/types/source/services/Fable-Service-TransactionTracking");
    };
    /** @type {import('pict')} */
    fable: import("pict");
    computedLists: {};
    listDefinitions: {};
    /** @typedef {{ id: string, text: string }} PickListItem */
    /**
     * Retrieves a list based on the provided view hash and list hash.
     *
     * @param {string} pListHash - The list hash.
     * @param {Object} [pOptions={}] - (optional) Additional options for retrieving the list. (ex. search term)
     *
     * @returns {Array<PickListItem>} - The retrieved list.
     */
    getList(pListHash: string, pOptions?: any): Array<{
        id: string;
        text: string;
    }>;
    /**
     * Checks if a list exists in the Pict Provider MetaLists.
     *
     * @param {string} pListHash - The hash of the list.
     * @returns {boolean} - Returns true if the list exists, otherwise false.
     */
    hasList(pListHash: string): boolean;
    /**
     * Rebuilds any lists defined in specific views
     * @param {Array} pViewHashes - An array of strings representing the view hashes to rebuild lists for.
     */
    buildViewSpecificLists(pViewHashes: any[]): void;
    /**
     * Rebuilds a list based on the provided hash.
     *
     * @param {string} pListHash - The hash of the list to be rebuilt.
     */
    rebuildListByHash(pListHash: string): void;
    /**
     * Builds a list based on the provided list object.  Stores it internally for use in dropdowns and list boxes.
     * @param {Object} pListObject - The List definition object
     * @returns boolean
     */
    buildList(pListObject: any): boolean;
}
declare namespace PictMetalist {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-MetaLists.d.ts.map