export = PictMetatemplateMacros;
/**
 * Class representing PictMetatemplateMacros.
 * @extends libPictProvider
 */
declare class PictMetatemplateMacros {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {any} */
    options: any;
    /** @type {import('pict') & { settings: any }} */
    pict: import("pict") & {
        settings: any;
    };
    /** @type {import('pict')} */
    fable: import("pict");
    /** @type {any} */
    log: any;
    /** @type {string} */
    UUID: string;
    /** @type {string} */
    Hash: string;
    additionalInputMacros: any;
    AdditionalInputMacros: any;
    additionalGroupMacros: any;
    additionalSectionMacros: any;
    /**
     * Builds macros for the given input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     */
    buildInputMacros(pView: any, pInput: any): void;
    /**
     * Rebuilds macros for the given view.
     *
     * @param {Object} pView - The view object.
     * @returns {boolean} - Returns false if MacroTemplates is not present in pView.options.
     */
    rebuildMacros(pView: any): boolean;
}
declare namespace PictMetatemplateMacros {
    export { _DefaultProviderConfiguration as default_configuration };
}
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-MetatemplateMacros.d.ts.map