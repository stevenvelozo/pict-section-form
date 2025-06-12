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
    setCSSSnippets(pCSSHideClass: any, pCSSSnippet: any): void;
    getViewHash(pManifestSectionHash: any): string;
    getTabSelector(pTabSectionHash: any, pInput: any): string;
    getSectionSelector(pTabViewSectionHash: any): string;
    selectTabByViewHash(pViewHash: any, pInputHash: any, pTabViewHash: any): boolean;
    /**
     * Generates the HTML ID for a select input element.
     * @param {string} pInputHTMLID - The HTML ID of the input element.
     * @returns {string} - The generated HTML ID for the select input element.
     */
    getTabSelectorInputHTMLID(pInputHTMLID: string): string;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-TabSectionSelector.d.ts.map