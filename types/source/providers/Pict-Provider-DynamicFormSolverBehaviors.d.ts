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
     * Returns a new array containing the union of two input arrays, removing duplicate values.
     *
     * @param {Array} pArrayA - The first array to union.
     * @param {Array} pArrayB - The second array to union.
     * @returns {Array} A new array containing unique elements from both input arrays.
     */
    unionArrays(pArrayA: any[], pArrayB: any[]): any[];
    /**
     * Returns an array containing the elements that are present in the first array but not in the second array.
     *
     * @param {Array} pArrayA - The array from which to subtract elements.
     * @param {Array} pArrayB - The array containing elements to exclude from the first array.
     * @returns {Array} An array of elements found in pArrayA but not in pArrayB.
     */
    differenceArrays(pArrayA: any[], pArrayB: any[]): any[];
    /**
     * Returns a new array containing only the unique elements from the input array.
     *
     * @param {Array} pArray - The array from which to extract unique elements.
     * @returns {Array} A new array with duplicate values removed.
     */
    uniqueArray(pArray: any[]): any[];
    /**
     * Sorts the given array in place using the default sort order.
     * If the input is not an array, returns an empty array.
     *
     * @param {Array} pArray - The array to be sorted.
     * @returns {Array} The sorted array, or an empty array if input is not an array.
     */
    sortArray(pArray: any[]): any[];
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
    /**
     * Shows multiple sections by their hash identifiers.
     *
     * Iterates over the provided array of section hash values and calls `showSection`
     * for each one to display the corresponding section.
     *
     * @param {Array<string>} pSectionHashArray - An array of section hash strings to be shown.
     */
    showSections(pSectionHashArray: Array<string>): void;
    /**
     * Hides multiple sections specified by their hash values.
     *
     * Iterates over the provided array of section hashes and hides each section
     * by calling the `hideSection` method for each hash.
     *
     * @param {Array<string>} pSectionHashArray - An array of section hash strings to be hidden.
     */
    hideSections(pSectionHashArray: Array<string>): void;
    hideSection(pSectionHash: any): boolean;
    showSection(pSectionHash: any): boolean;
    getGroupSelector(pSectionFormID: any, pGroupHash: any): string;
    setGroupVisibility(pSectionHash: any, pGroupHash: any, pVisible: any): boolean;
    hideGroup(pSectionHash: any, pGroupHash: any): boolean;
    showGroup(pSectionHash: any, pGroupHash: any): boolean;
    /**
     * Causes a tabular section to refresh its display
     *
     * @param {string} pSectionHash - The hash of the section containing the tabular group
     * @param {string} pGroupHash - The hash of the tabular group
     *
     * @return {void}
     */
    refreshTabularSection(pSectionHash: string, pGroupHash: string): void;
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