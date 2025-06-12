export = PictInputExtensionProvider;
/**
 * The PictInputExtensionProvider class is a provider that allows extensions to the input fields of a form.
 *
 * Can be mapped in via the PictForm property of a descriptor.
 */
declare class PictInputExtensionProvider extends libPictProvider {
    /**
     * Creates an instance of the PictInputExtensionProvider class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    /**
     * Generates the HTML ID for a custom input element based on the given input HTML ID.
     *
     * @param {string} pInputHTMLID - The input HTML ID.
     * @returns {string} The generated input HTML ID.
     */
    getInputHTMLID(pInputHTMLID: string): string;
    /**
     * Generates the HTML ID for a hidden input element in a tabular data provider.
     *
     * @param {string} pInputHTMLID - The HTML ID of the input element.
     * @param {number} pRowIndex - The index of the row in the tabular data.
     * @returns {string} - The generated HTML ID for the hidden input element.
     */
    getTabularInputHTMLID(pInputHTMLID: string, pRowIndex: number): string;
    /**
     * An input has been initialized (rendered into the DOM)
     *
     * Called when an input has this Provider hash in its 'Providers' array.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group definition object.
     * @param {Object} pRow - The Row index.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value of the input object
     * @param {string} pHTMLSelector - The HTML selector for the input object
     */
    onInputInitialize(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: string): boolean;
    /**
     * A tabular input has been initialized (rendered into the DOM)
     *
     * Called when an input has this Provider hash in its 'Providers' array.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group definition object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value of the input object
     * @param {string} pHTMLSelector - The HTML selector for the input object (it will return an array).
     * @param {number} pRowIndex - The row index of the tabular data
     */
    onInputInitializeTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): boolean;
    /**
     * Called when the data change function is called
     *
     * Called when an input has this Provider hash in its 'Providers' array.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value of the input object
     * @param {string} pHTMLSelector - The HTML selector for the input object
     */
    onDataChange(pView: any, pInput: any, pValue: any, pHTMLSelector: string): boolean;
    /**
     * Called when an input has this Provider hash in its 'Providers' array.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value of the input object
     * @param {string} pHTMLSelector - The HTML selector for the input object
     * @param {number} pRowIndex - The row index of the tabular data
     */
    onDataChangeTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): boolean;
    /**
     * Fires when data is marshaled to the form for this input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group definition object.
     * @param {number} pRow - The Row index.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to marshal.
     * @param {string} pHTMLSelector - The HTML selector.
     * @returns {boolean} - Returns true if the data was successfully marshaled to the form.
     */
    onDataMarshalToForm(pView: any, pGroup: any, pRow: number, pInput: any, pValue: any, pHTMLSelector: string): boolean;
    /**
     * Fires when data is marshaled to the form for this input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pGroup - The group definition object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value to marshal.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the input in the row columns.
     * @returns {boolean} - Returns true if the data was successfully marshaled to the form.
     */
    onDataMarshalToFormTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): boolean;
    /**
     * Handles data requests for the Pict-Provider-InputExtension.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value from AppData.
     * @param {string} pHTMLSelector - The HTML selector.
     * @returns {boolean} - Returns true.
     */
    onDataRequest(pView: any, pInput: any, pValue: any, pHTMLSelector: string): boolean;
    /**
     * Handles data requests for the Pict-Provider-InputExtension.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value from AppData.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The row index of the tabular data.
     * @returns {boolean} - Returns true.
     */
    onDataRequestTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): boolean;
    /**
     * Handles events for the Pict-Provider-InputExtension.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value from AppData.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {string} pEvent - The event hash that is expected to be triggered.
     * @returns {boolean} - Returns true.
     */
    onEvent(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pEvent: string): boolean;
    /**
     * Handles events for the Pict-Provider-InputExtension.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value from AppData.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The row index of the tabular data.
     * @param {string} pEvent - The event hash that is expected to be triggered.
     * @returns {boolean} - Returns true.
     */
    onEventTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number, pEvent: string): boolean;
}
declare namespace PictInputExtensionProvider {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-InputExtension.d.ts.map