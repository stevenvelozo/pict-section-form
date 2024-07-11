export = CustomInputHandler;
declare class CustomInputHandler extends libPictSectionInputExtension {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    getSelectInputHTMLID(pInputHTMLID: any): string;
    getTabularSelectInputID(pInputHTMLID: any, pRowIndex: any): string;
    getTabularSelectDropdownID(pInputHTMLID: any, pRowIndex: any): string;
    onInputInitialize(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    onInputInitializeTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
    onDataChange(pView: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    onDataChangeTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
    onDataMarshalToForm(pView: any, pGroup: any, pRow: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    onDataMarshalToFormTabular(pView: any, pGroup: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
    onDataRequest(pView: any, pInput: any, pValue: any, pHTMLSelector: any): boolean;
    onDataRequestTabular(pView: any, pInput: any, pValue: any, pHTMLSelector: any, pRowIndex: any): boolean;
}
import libPictSectionInputExtension = require("../Pict-Provider-InputExtension.js");
//# sourceMappingURL=Pict-Provider-Input-Select.d.ts.map