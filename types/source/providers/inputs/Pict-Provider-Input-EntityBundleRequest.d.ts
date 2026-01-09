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
     * @param {string} [pTransactionGUID] - (optional) The transaction GUID for the event dispatch.
     *
     * @return {Promise<Error?>} - Returns a promise that resolves when the data has been gathered.
     */
    gatherDataFromServer(pView: any, pInput: any, pValue: any, pHTMLSelector: string, pTransactionGUID?: string): Promise<Error | null>;
    /**
     * @param {Object} pInput - The input object.
     * @param {string} pTriggerGroupHash - The trigger group hash.
     * @return {Array<Record<string, any>>} - An array of trigger group configurations.
     */
    getTriggerGroupConfigurationArray(pInput: any, pTriggerGroupHash: string): Array<Record<string, any>>;
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
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-EntityBundleRequest.d.ts.map