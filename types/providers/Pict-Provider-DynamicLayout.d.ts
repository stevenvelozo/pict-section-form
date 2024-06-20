export = PictDynamicLayout;
/**
 * The PictDynamicLayout class is a provider that generates dynamic layouts based on configuration.
 */
declare class PictDynamicLayout {
    /**
     * Creates an instance of the PictDynamicLayout class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
}
declare namespace PictDynamicLayout {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-DynamicLayout.d.ts.map