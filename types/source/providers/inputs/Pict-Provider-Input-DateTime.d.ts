export = CustomInputHandler;
/**
 * CustomInputHandler class.
 * Represents a custom input handler for a Pict section form.
 * @extends libPictSectionInputExtension
 */
declare class CustomInputHandler extends libPictSectionInputExtension {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {any} */
    log: any;
    /**
     * Generates the HTML ID for a DateTime input element based on the given input HTML ID.
     *
     * @param {string} pInputHTMLID - The input HTML ID.
     * @returns {string} The generated DateTime input HTML ID.
     */
    getDateTimeInputHTMLID(pInputHTMLID: string): string;
    /**
     * Generates the HTML ID for a hidden input element in a tabular datetime data provider.
     *
     * @param {string} pInputHTMLID - The HTML ID of the input element.
     * @param {number} pRowIndex - The index of the row in the tabular data.
     * @returns {string} - The generated HTML ID for the hidden input element.
     */
    getTabularDateTimeHiddenInputHTMLID(pInputHTMLID: string, pRowIndex: number): string;
    /**
     * Generates a tabular date-time input HTML ID based on the provided input HTML ID and row index.
     *
     * @param {string} pInputHTMLID - The input HTML ID.
     * @param {number} pRowIndex - The row index.
     * @returns {string} The tabular date-time input HTML ID.
     */
    getTabularDateTimeInputHTMLID(pInputHTMLID: string, pRowIndex: number): string;
    /**
     * Fires after data has been marshaled to the form.
     *
     * This is important because the DateTime has a "shadow" hidden input that stores the value for the date control.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to be assigned.
     * @param {string} pHTMLSelector - The HTML selector.
     * @returns {any} - The result of the super method call.
     */
    onDataMarshalToForm(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: string): any;
    /**
     * Marshals data to the form in a tabular format.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to be assigned.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the row.
     * @returns {any} - The result of the data marshaling.
     */
    onDataMarshalToFormTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): any;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-DateTime.d.ts.map