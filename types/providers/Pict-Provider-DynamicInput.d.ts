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
    /**
     * Retrieves the template hash for the input based on the provided view and input.
     *
     * @param {View} pView - The view object.
     * @param {Input} pInput - The input object.
     * @returns {string|boolean} - The template hash if found, otherwise false.
     */
    getInputTemplateHash(pView: View, pInput: Input): string | boolean;
    /**
     * Adds a default input provider for a given template full hash.
     *
     * @param {string} pTemplateFullHash - The full hash of the template.
     * @param {any} pProvider - The provider to be added.
     */
    addDefaultInputProvider(pTemplateFullHash: string, pProvider: any): void;
    /**
     * Retrieves the default input providers based on the given view and input.
     *
     * @param {string} pView - The view to retrieve input providers for.
     * @param {string} pInput - The input to retrieve input providers for.
     * @returns {Array} An array of default input providers.
     */
    getDefaultInputProviders(pView: string, pInput: string): any[];
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