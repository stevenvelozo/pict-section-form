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
    /**
     * Colors an input background or its container with a HTML hex color (e.g. #FF0000 for red).
     * @param {string} pSectionHash - The hash of the section containing the input.
     * @param {string} pInputHash - The hash of the input to color.
     * @param {string} pColor - The HTML hex color to apply (e.g. #FF0000 for red).
     * @param {string} pApplyChange - If "0", the change will not be applied.
     * @param {string} [pCSSSelector] - Optional. If provided, the color will be applied to the closest element matching this selector instead of the input itself.
     * @returns {boolean} - Returns true if the color was applied successfully or if the change was skipped for pApplyChange equal to "0", false otherwise.
     */
    colorInputBackground(pSectionHash: string, pInputHash: string, pColor: string, pApplyChange: string, pCSSSelector?: string): boolean;
    logValues(...args: any[]): any;
}
declare namespace PictDynamicFormsSolverBehaviors {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicFormSolverBehaviors.d.ts.map