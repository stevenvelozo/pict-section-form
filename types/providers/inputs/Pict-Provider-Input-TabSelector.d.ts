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
    /**
     * Generates the HTML ID for a select input element.
     * @param {string} pInputHTMLID - The HTML ID of the input element.
     * @returns {string} - The generated HTML ID for the select input element.
     */
    getTabSelectorInputHTMLID(pInputHTMLID: string): string;
    /**
     * Initializes the input element for the Pict provider select input.
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {string} pHTMLTabSelector - The HTML selector.
     * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
     */
    onInputInitialize(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLTabSelector: string): boolean;
    /**
     * Handles the change event for the data in the select input.
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value of the input.
     * @param {string} pHTMLTabSelector - The HTML selector of the input.
     * @returns {any} - The result of the super.onDataChange method.
     */
    onDataChange(pView: any, pInput: any, pValue: any, pHTMLTabSelector: string): any;
    /**
     * Marshals data to the form for the given input.
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to be marshaled.
     * @param {string} pHTMLTabSelector - The HTML selector.
     * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
     */
    onDataMarshalToForm(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLTabSelector: string): boolean;
    /**
     * Handles the data request event for a select input in the PictProviderInputTabSelector class.
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value object.
     * @param {string} pHTMLTabSelector - The HTML selector object.
     * @returns {any} - The result of the onDataRequest method.
     */
    onDataRequest(pView: any, pInput: any, pValue: any, pHTMLTabSelector: string): any;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-TabSelector.d.ts.map