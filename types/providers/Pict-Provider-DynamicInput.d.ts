export = PictDynamicInput;
/**
 * The PictDynamicInput class is a provider that manages data brokering and provider mappings for dynamic inputs.
 */
declare class PictDynamicInput {
    /**
     * Creates an instance of the PictDynamicInput class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    templateProviderMap: {};
    getInputTemplateHash(pView: any, pInput: any): any;
    addDefaultInputProvider(pTemplateFullHash: any, pProvider: any): void;
    getDefaultInputProviders(pView: any, pInput: any): any;
}
declare namespace PictDynamicInput {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-DynamicInput.d.ts.map