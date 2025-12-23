export = PictDynamicFormsSolverBehaviors;
/**
 * Provides functions available in the solver for manipulating the form.
 * Such as showing/hiding sections, inputs, groups.  Coloring inputs,
 * sections, groups.  Applying styles to inputs, sections, groups.
 * Extends the `libPictProvider` class.
 */
declare class PictDynamicFormsSolverBehaviors extends libPictProvider {
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
    solverOrdinalMap: {};
    setCSSSnippets(pCSSHideClass: any, pCSSSnippet: any): void;
    cssHideClass: any;
    addSolverFunction(pExpressionParser: any, pFunctionName: any, pFunctionAddress: any, pFunctionComment: any): void;
    runSolvers(): void;
    injectBehaviors(pExpressionParser: any): boolean;
    /**
     * @param {number|string} pSolverOrdinal
     * @param {boolean|string|number} pEnabled
     */
    setSolverOrdinalEnabled(pSolverOrdinal: number | string, pEnabled: boolean | string | number): void;
    /**
     * @param {number|string} pSolverOrdinal
     */
    enableSolverOrdinal(pSolverOrdinal: number | string): void;
    /**
     * @param {number|string} pSolverOrdinal
     */
    disableSolverOrdinal(pSolverOrdinal: number | string): void;
    /**
     * @param {number|string} pSolveOrdinal
     *
     * @return {boolean}
     */
    checkSolverOrdinalEnabled(pSolveOrdinal: number | string): boolean;
    getSectionSelector(pSectionFormID: any): string;
    setSectionVisibility(pSectionHash: any, pVisible: any): boolean;
    hideSection(pSectionHash: any): boolean;
    showSection(pSectionHash: any): boolean;
    getGroupSelector(pSectionFormID: any, pGroupHash: any): string;
    setGroupVisibility(pSectionHash: any, pGroupHash: any, pVisible: any): boolean;
    hideGroup(pSectionHash: any, pGroupHash: any): boolean;
    showGroup(pSectionHash: any, pGroupHash: any): boolean;
    /**
     * Set the length of a tabular set
     * @param {string} pSectionHash - The hash of the section containing the tabular group
     * @param {string} pGroupHash - The hash of the tabular group
     * @param {number|string} pLength - The desired length of the tabular set
     * @param {boolean|string} pDeleteExtraRows - If true, will delete extra rows from the end if the length is less than current
     * @returns
     */
    setTabularRowLength(pSectionHash: string, pGroupHash: string, pLength: number | string, pDeleteExtraRows?: boolean | string): boolean;
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
    /**
     * Colors an input background or its container with a HTML hex color (e.g. #FF0000 for red).
     * @param {string} pSectionHash - The hash of the section containing the input.
     * @param {string} pGroupHash - The hash of the group containing the input.
     * @param {number} pRowIndex - The index of the row.
     * @param {string} pInputHash - The hash of the input to color.
     * @param {string} pColor - The HTML hex color to apply (e.g. #FF0000 for red).
     * @param {string} pApplyChange - If "0", the change will not be applied.
     * @param {string} [pCSSSelector] - Optional. If provided, the color will be applied to the closest element matching this selector instead of the input itself.
     * @param {string} [pElementIDPrefix] - Optional. The prefix for the tabular element ID. Default is 'TABULAR-DATA-'.
     * @returns {boolean} - Returns true if the color was applied successfully or if the change was skipped for pApplyChange equal to "0", false otherwise.
     */
    colorInputBackgroundTabular(pSectionHash: string, pGroupHash: string, pInputHash: string, pRowIndex: number, pColor: string, pApplyChange: string, pCSSSelector?: string, pElementIDPrefix?: string): boolean;
    /**
     * @param {Array<HTMLElement>} pElementSet - The element to color.
     * @param {string} pColor - The HTML hex color to apply (e.g. #FF0000 for red).
     * @param {string} [pCSSSelector] - Optional. If provided, the color will be applied to the closest element matching this selector instead of the input itself.
     *
     * @returns {boolean}
     */
    colorElementBackground(pElementSet: Array<HTMLElement>, pColor: string, pCSSSelector?: string): boolean;
    logValues(...args: any[]): any;
}
declare namespace PictDynamicFormsSolverBehaviors {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicFormSolverBehaviors.d.ts.map