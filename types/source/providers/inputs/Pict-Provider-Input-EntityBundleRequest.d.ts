export = CustomInputHandler;
/**
 * CustomInputHandler class for Entity Bundle Requests.
 *
 * When an input is flagged as an EntityBundleRequest entity, it will go pull a
 * sequential list of records on data selection.
 *
 * Paired with the AutofillTriggerGroup, this allows other values to be filled
 * when a record is selected and fetched.

Providers: ["Pict-Input-EntityBundleRequest", "Pict-Input-TriggerGroup"],
        EntitiesBundle: [
        {
            "Entity": "Author",
            "Filter": "FBV~IDAuthor~EQ~{~D:Record.Value~}",
            "Destination": "AppData.CurrentAuthor",
            // This marshals a single record
            "SingleRecord": true
        },
        {
            "Entity": "BookAuthorJoin",
            "Filter": "FBV~IDAuthor~EQ~{~D:Appdata.CurrentAuthor.IDAuthor~}",
            "Destination": "AppData.BookAuthorJoins"
        },
        {
            "Entity": "Book",
            "Filter": "FBL~IDBook~LK~{PJU~:,^IDBook^Appdata.BookAuthorJoins~}",
            "Destination": "AppData.BookAuthorJoins"
        }
    ],
    EntityBundleTriggerGroup: "BookTriggerGroup"

 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
declare class CustomInputHandler extends libPictSectionInputExtension {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict')} */
    pict: import("pict");
    /** @type {import('pict') & { newAnticipate: () => any }} */
    fable: import("pict") & {
        newAnticipate: () => any;
    };
    gatherEntitySet(fCallback: any, pEntityInformation: any, pView: any, pInput: any, pValue: any): any;
    gatherCustomDataSet(fCallback: any, pCustomRequestInformation: any, pView: any, pInput: any, pValue: any): any;
    /**
     * TODO: I added a proise return here to know when this data load is done for the dashboard usecase. Could use a revisit.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The value of the input.
     * @param {string} pHTMLSelector - The HTML selector.
     *
     * @return {Promise<any>} - Returns a promise that resolves when the data has been gathered.
     */
    gatherDataFromServer(pView: any, pInput: any, pValue: any, pHTMLSelector: string): Promise<any>;
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
     * Handles the change event for the data in the select input.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value of the input.
     * @param {string} pHTMLSelector - The HTML selector of the input.
     * @returns {any} - The result of the super.onDataChange method.
     */
    onDataChange(pView: any, pInput: any, pValue: any, pHTMLSelector: string): any;
    /**
     * Handles the change event for tabular data.
     *
     * @param {Object} pView - The view object.
     * @param {Object} pInput - The input object.
     * @param {any} pValue - The new value.
     * @param {string} pHTMLSelector - The HTML selector.
     * @param {number} pRowIndex - The index of the row.
     * @returns {any} - The result of the super method.
     */
    onDataChangeTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pRowIndex: number): any;
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
//# sourceMappingURL=Pict-Provider-Input-EntityBundleRequest.d.ts.map