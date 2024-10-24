export = PictMetatemplateMacros;
/**
 * Class representing PictMetatemplateMacros.
 * @extends libPictProvider
 */
declare class PictMetatemplateMacros {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
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
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-MetatemplateMacros.d.ts.map