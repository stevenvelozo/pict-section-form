export = CustomInputHandler;
declare class CustomInputHandler extends libPictSectionInputExtension {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    getDateTimeInputHTMLID(pInputHTMLID: any): string;
    getTabularDateTimeHiddenInputHTMLID(pInputHTMLID: any, pRowIndex: any): string;
    getTabularDateTimeInputHTMLID(pInputHTMLID: any, pRowIndex: any): string;
    onDataMarshalToForm(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    onDataMarshalToFormTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
    onDataRequest(pView: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    onDataRequestTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-DateTime.d.ts.map