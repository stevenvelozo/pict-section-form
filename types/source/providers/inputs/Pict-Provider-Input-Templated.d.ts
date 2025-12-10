export = TemplatedInputProvider;
/**
 * Input provider for simple templated content display.
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
declare class TemplatedInputProvider extends libPictSectionInputExtension {
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
    /**
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {number} [pRowIndex] - (optional) The row index for tabular data.
     *
     * @return {void}
     */
    handleContentUpdate(pView: import("../../views/Pict-View-DynamicForm.js"), pInput: any, pValue: any, pRowIndex?: number): void;
    /**
     * Initializes the input element for the Pict provider select input.
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {boolean} - Returns true if the input element is successfully initialized, false otherwise.
     */
    onInputInitialize(pView: import("../../views/Pict-View-DynamicForm.js"), pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: string, pTransactionGUID: string): boolean;
    /**
     * Initializes a tabular input element.
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the row.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the initialization.
     */
    onInputInitializeTabular(pView: import("../../views/Pict-View-DynamicForm.js"), pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pTransactionGUID: string): any;
    /**
     * Initializes a tabular input element.
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object|null} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The input value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number|null} pRowIndex - The index of the row.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the initialization.
     */
    _handleInitialize(pView: import("../../views/Pict-View-DynamicForm.js"), pGroup: any, pRow: any | null, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number | null, pTransactionGUID: string): any;
    /**
     * Marshals data to the form for the given input.
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pRow - The row object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to be marshaled.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {boolean} - Returns true if the value is successfully marshaled to the form, otherwise false.
     */
    onDataMarshalToForm(pView: import("../../views/Pict-View-DynamicForm.js"), pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: string, pTransactionGUID: string): boolean;
    /**
     * Marshals data to a form in tabular format.
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pGroup - The group object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value parameter.
     * @param {string} pHTMLSelector - The HTML selector parameter.
     * @param {number} pRowIndex - The row index parameter.
     * @param {string} pTransactionGUID - The transaction GUID for the event dispatch.
     * @returns {any} - The result of the data marshaling.
     */
    onDataMarshalToFormTabular(pView: import("../../views/Pict-View-DynamicForm.js"), pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pTransactionGUID: string): any;
    /**
     * This input extension only responds to events
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value from AppData.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {string} pEvent - The event hash that is expected to be triggered.
     * @param {string} pTransactionGUID - The transaction GUID, if any.
     * @returns {boolean} - Returns true.
     */
    onAfterEventCompletion(pView: import("../../views/Pict-View-DynamicForm.js"), pInput: any, pValue: any, pHTMLSelector: string, pEvent: string, pTransactionGUID: string): boolean;
    /**
     * Handles events for the Pict-Provider-InputExtension.
     *
     * @param {import('../../views/Pict-View-DynamicForm.js')} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value from AppData.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The row index of the tabular data.
     * @param {string} pEvent - The event hash that is expected to be triggered.
     * @param {string} pTransactionGUID - The transaction GUID, if any.
     * @returns {boolean} - Returns true.
     */
    onAfterEventTabularCompletion(pView: import("../../views/Pict-View-DynamicForm.js"), pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pEvent: string, pTransactionGUID: string): boolean;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-Templated.d.ts.map