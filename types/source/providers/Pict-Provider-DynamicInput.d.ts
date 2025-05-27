export = PictDynamicInput;
/**
 * The PictDynamicInput class is a provider that manages data brokering and provider mappings for dynamic inputs.
 */
declare class PictDynamicInput {
    /**
     * Creates an instance of the PictDynamicInput class.
     *
     * @param {import('pict')} pFable - The fable object.
     * @param {any} [pOptions={}] - The options object.
     * @param {string} [pServiceHash] - The service hash object.
     */
    constructor(pFable: import("pict"), pOptions?: any, pServiceHash?: string);
    templateProviderMap: {};
    /**
     * Retrieves the template hash for the input based on the provided view and input.
     *
     * @param {import('../views/Pict-View-DynamicForm')} pView - The view object.
     * @param {any} pInput - The input object.
     * @returns {string|boolean} - The template hash if found, otherwise false.
     */
    getInputTemplateHash(pView: import("../views/Pict-View-DynamicForm"), pInput: any): string | boolean;
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
     * @param {import('../views/Pict-View-DynamicForm')} pView - The view object.
     * @param {string} pInput - The input to retrieve input providers for.
     * @returns {Array} An array of default input providers.
     */
    getDefaultInputProviders(pView: import("../views/Pict-View-DynamicForm"), pInput: string): any[];
}
declare namespace PictDynamicInput {
    export { _DefaultProviderConfiguration as default_configuration };
}
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicInput.d.ts.map