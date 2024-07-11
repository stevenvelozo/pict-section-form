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
    computedLists: {};
    globalLists: {};
    getList(pViewHash: any, pListHash: any): any;
    hasList(pViewHash: any, pListHash: any): boolean;
    buildLists(pViewHashes: any): void;
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