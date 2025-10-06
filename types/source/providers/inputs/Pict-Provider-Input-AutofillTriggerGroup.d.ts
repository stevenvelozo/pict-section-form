export = CustomInputHandler;
/**
 * CustomInputHandler class for the Autofill Trigger Group
 *
 * Autofill Trigger Groups have three parameters:
 *  - the group hash
 *  - a boolean defining whether the input triggers all inputs on the group
 *    to autofill themselves
 *  - an address (either in Pict or AppData) to pull data from
 *  - whether or not to marshal values if the result is empty/null/undefined
 *
 * In practice this looks like this:
 *
    Providers: ["Pict-Input-AutofillTriggerGroup"],
    AutofillTriggerGroup:
        {
            TriggerGroupHash: "Author",
            TriggerAddress: "AppData.CurrentAuthor.Name",
            MarshalEmptyValues: true
        }
 *
 *
 * The group is cavalier about clearing data when
 *
 * @class
 * @extends libPictSectionInputExtension
 * @memberof providers.inputs
 */
declare class CustomInputHandler extends libPictSectionInputExtension {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict')} */
    pict: import("pict");
    getTriggerGroupConfigurationArray(pInput: any): any;
    autoFillFromAddressList(pView: any, pInput: any, pTriggerGroupInfo: any, pHTMLSelector: any): boolean;
    autoFillFromAddressListTabular(pView: any, pInput: any, pTriggerGroupInfo: any, pHTMLSelector: any, pRowIndex: any): boolean;
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
    onEvent(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pEvent: any): boolean;
    onEventTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any, pEvent: any): boolean;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-AutofillTriggerGroup.d.ts.map