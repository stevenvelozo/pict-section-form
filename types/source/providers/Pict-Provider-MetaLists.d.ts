export = PictMetalist;
/**
 * The PictMetalist class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
declare class PictMetalist extends libPictProvider {
    /**
     * Creates an instance of the PictMetalist class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    /** @type {any} */
    options: any;
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict')} */
    fable: import("pict");
    computedLists: {};
    listDefinitions: {};
    /**
     * Retrieves a list based on the provided view hash and list hash.
     *
     * @param {string} pListHash - The list hash.
     * @returns {Array} - The retrieved list.
     */
    getList(pListHash: string): any[];
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