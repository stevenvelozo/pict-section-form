export = PictMetalist;
/**
 * The PictMetalist class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
declare class PictMetalist {
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
    /** @type {any} */
    log: any;
    /** @type {string} */
    UUID: string;
    /** @type {string} */
    Hash: string;
    computedLists: {};
    globalLists: {};
    /**
     * Retrieves a list based on the provided view hash and list hash.
     *
     * @param {string} pViewHash - The view hash.
     * @param {string} pListHash - The list hash.
     * @returns {Array} - The retrieved list.
     */
    getList(pViewHash: string, pListHash: string): any[];
    /**
     * Checks if a list exists in the Pict Provider MetaLists.
     *
     * @param {string} pViewHash - The hash of the view.
     * @param {string} pListHash - The hash of the list.
     * @returns {boolean} - Returns true if the list exists, otherwise false.
     */
    hasList(pViewHash: string, pListHash: string): boolean;
    /**
     * Builds meta lists for the Pict provider.
     *
     * @param {Array|string} pViewHashes - The view hashes to build meta lists for.
     */
    buildLists(pViewHashes: any[] | string): void;
    /**
     * Builds meta lists for the Pict provider.
     *
     * @param {Object} pView - The view hashes to build meta lists for.
     * @param {string} pListHash - The list hash.
     */
    buildList(pView: any, pListHash: string): void;
}
declare namespace PictMetalist {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-MetaLists.d.ts.map