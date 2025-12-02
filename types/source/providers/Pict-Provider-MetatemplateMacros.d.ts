export = PictMetatemplateMacros;
/**
 * Class representing PictMetatemplateMacros.
 * @extends libPictProvider
 */
declare class PictMetatemplateMacros extends libPictProvider {
    /** @type {any} */
    options: any;
    /** @type {import('pict') & { settings: any }} */
    pict: import("pict") & {
        settings: any;
    };
    /** @type {import('pict')} */
    fable: import("pict");
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
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-MetatemplateMacros.d.ts.map