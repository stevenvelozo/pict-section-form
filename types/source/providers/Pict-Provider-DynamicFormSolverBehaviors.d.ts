export = PictDynamicFormsSolverBehaviors;
/**
 * Provides functions available in the solver for manipulating the form.
 * Such as showing/hiding sections, inputs, groups.  Coloring inputs,
 * sections, groups.  Applying styles to inputs, sections, groups.
 * Extends the `libPictProvider` class.
 */
declare class PictDynamicFormsSolverBehaviors extends libPictProvider {
    /**
     * Creates an instance of the `PictDynamicFormsInformary` class.
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    /** @type {any} */
    options: any;
    /** @type {import('pict') & { newManyfest: (options: any) => import('manyfest') }} */
    pict: import("pict") & {
        newManyfest: (options: any) => import("manyfest");
    };
    /** @type {string} */
    cssHideSectionClass: string;
    cssHideGroupClass: string;
    cssSnippet: string;
    setCSSSnippets(pCSSHideClass: any, pCSSSnippet: any): void;
    cssHideClass: any;
    addSolverFunction(pExpressionParser: any, pFunctionName: any, pFunctionAddress: any, pFunctionComment: any): void;
    injectBehaviors(pExpressionParser: any): boolean;
    getSectionSelector(pSectionFormID: any): string;
    setSectionVisibility(pSectionHash: any, pVisible: any): boolean;
    hideSection(pSectionHash: any): boolean;
    showSection(pSectionHash: any): boolean;
    getGroupSelector(pSectionFormID: any, pGroupHash: any): string;
    setGroupVisibility(pSectionHash: any, pGroupHash: any, pVisible: any): boolean;
    hideGroup(pSectionHash: any, pGroupHash: any): boolean;
    showGroup(pSectionHash: any, pGroupHash: any): boolean;
    generateHTMLHexColor(pRed: any, pGreen: any, pBlue: any): string;
    colorSectionBackground(pSectionHash: any, pColor: any, pApplyChange: any): boolean;
    colorGroupBackground(pSectionHash: any, pGroupHash: any, pColor: any, pApplyChange: any): boolean;
    colorInputBackground(pSectionHash: any, pInputHash: any, pColor: any, pApplyChange: any): boolean;
    logValues(...args: any[]): any;
}
declare namespace PictDynamicFormsSolverBehaviors {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicFormSolverBehaviors.d.ts.map