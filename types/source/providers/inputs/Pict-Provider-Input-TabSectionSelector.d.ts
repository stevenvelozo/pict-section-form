export = CustomInputHandler;
/**
 * CustomInputHandler class.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
declare class CustomInputHandler extends libPictSectionInputExtension {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict')} */
    fable: import("pict");
    /** @type {string} */
    cssHideClass: string;
    cssSelectedTabClass: string;
    cssSnippet: string;
    /**
     * @param {string} [pCSSHideClass]
     * @param {string} [pCSSSnippet]
     */
    setCSSSnippets(pCSSHideClass?: string, pCSSSnippet?: string): void;
    /**
     * @param {string} pManifestSectionHash
     *
     * @return {string}
     */
    getViewHash(pManifestSectionHash: string): string;
    /**
     * @param {string} pTabSectionHash
     * @param {Object} pInput
     *
     * @return {string}
     */
    getTabSelector(pTabSectionHash: string, pInput: any): string;
    /**
     * @param {string} pTabViewSectionHash
     *
     * @return {string}
     */
    getSectionSelector(pTabViewSectionHash: string): string;
    /**
     * @param {string} pViewHash
     * @param {string} pInputHash
     * @param {string} pTabViewHash
     *
     * @return {boolean}
     */
    selectTabByViewHash(pViewHash: string, pInputHash: string, pTabViewHash: string): boolean;
    /**
     * Generates the HTML ID for a select input element.
     *
     * @param {string} pInputHTMLID - The HTML ID of the input element.
     *
     * @return {string} - The generated HTML ID for the select input element.
     */
    getTabSelectorInputHTMLID(pInputHTMLID: string): string;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-TabSectionSelector.d.ts.map