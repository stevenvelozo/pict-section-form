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
    /**
     * Generates the HTML ID for a content display input element.
     *
     * @param {string} pInputHTMLID - The HTML ID of the input element.
     * @returns {string} - The generated HTML ID for the content display input element.
     */
    getContentDisplayHTMLID(pInputHTMLID: string): string;
    /**
     * Generates a tabular content display input ID based on the provided input HTML ID and row index.
     *
     * @param {string} pInputHTMLID - The input HTML ID.
     * @param {number} pRowIndex - The row index.
     * @returns {string} - The generated tabular content display input ID.
     */
    getTabularContentDisplayInputID(pInputHTMLID: string, pRowIndex: number): string;
    getInputContent(pInput: any, pValue: any): any;
    /**
     * Initializes a tabular input element.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the row.
     * @returns {any} - The result of the initialization.
     */
    onInputInitializeTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): any;
    /**
     * Marshals data to the form for the given input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to be marshaled.
     * @param {string} pHTMLSelector - The HTML selector.
     * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
     */
    onDataMarshalToForm(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: string): boolean;
    /**
     * Marshals data to a form in tabular format.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value parameter.
     * @param {string} pHTMLSelector - The HTML selector parameter.
     * @param {number} pRowIndex - The row index parameter.
     * @returns {any} - The result of the data marshaling.
     */
    onDataMarshalToFormTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): any;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-Markdown.d.ts.map