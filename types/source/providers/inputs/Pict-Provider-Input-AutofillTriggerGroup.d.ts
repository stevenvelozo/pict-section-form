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
            TriggerGroupName: "Author",
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
    /** @type {any} */
    log: any;
    autoFillFromAddressList(pView: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    autoFillFromAddressListTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
    onEvent(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pEvent: any): boolean;
    onEventTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any, pEvent: any): boolean;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-AutofillTriggerGroup.d.ts.map