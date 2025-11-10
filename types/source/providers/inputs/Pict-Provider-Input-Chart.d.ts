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
    defaultCoreParsingConfiguration: any;
    defaultLabelParsingConfiguration: any;
    defaultDataParsingConfiguration: any;
    currentChartObjects: {};
    currentChartDataObjects: {};
    /**
     *
     * @param {Object} pInput - The PictForm input object
     * @param {*} pChartConfiguration - The current configuration object for the form
     * @param {*} pParsingConfiguration - The parsing configuration to apply
     * @param {*} pInputParsingConfigurationScope - The input-specific parsing configuration string address for additional configuration
     * @returns
     */
    applyInputParsingConfiguration(pInput: any, pChartConfiguration: any, pParsingConfiguration: any, pInputParsingConfigurationScope: any): boolean;
    getInputChartConfiguration(pView: any, pInput: any, pValue: any): any;
    initializeChartVisualization(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    /**
     * Initializes a tabular input element.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the row.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the initialization.
     */
    onInputInitializeTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pTransactionGUID: string): any;
    /**
     * Handles the change event for the data in the select input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value of the input.
     * @param {string} pHTMLSelector - The HTML selector of the input.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the super.onDataChange method.
     */
    onDataChange(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pTransactionGUID: string): any;
    /**
     * Handles the change event for tabular data.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the row.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the super method.
     */
    onDataChangeTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pTransactionGUID: string): any;
    /**
     * Marshals data to the form for the given input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to be marshaled.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
     */
    onDataMarshalToForm(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: string, pTransactionGUID: string): boolean;
    /**
     * Marshals data to a form in tabular format.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value parameter.
     * @param {string} pHTMLSelector - The HTML selector parameter.
     * @param {number} pRowIndex - The row index parameter.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the data marshaling.
     */
    onDataMarshalToFormTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pTransactionGUID: string): any;
    /**
     * Handles the data request event for a select input in the PictProviderInputSelect class.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value object.
     * @param {string} pHTMLSelector - The HTML selector object.
     * @returns {any} - The result of the onDataRequest method.
     */
    onDataRequest(pView: any, pInput: any, pValue: any, pHTMLSelector: string): any;
    /**
     * Handles the data request event for a tabular input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value object.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The row index.
     * @returns {any} - The result of the data request.
     */
    onDataRequestTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): any;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-Chart.d.ts.map