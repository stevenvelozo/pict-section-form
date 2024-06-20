export = PictViewDynamicForm;
declare class PictViewDynamicForm {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    sectionDefinition: any;
    sectionManifest: any;
    sectionSolvers: any[];
    formsTemplateSetPrefix: string;
    defaultTemplatePrefix: string;
    formID: string;
    viewMarshalDestination: boolean;
    renderToPrimary(): void;
    dataChanged(pInputHash: any): void;
    getMarshalDestinationAddress(): any;
    getMarshalDestinationObject(): boolean;
    onMarshalToView(): any;
    onMarshalFromView(): any;
    onSolve(): any;
    initializeFormGroups(): void;
    rebuildMacros(): boolean;
    checkViewSpecificTemplate(pTemplatePostfix: any): boolean;
    checkThemeSpecificTemplate(pTemplatePostfix: any): boolean;
    getMetatemplateTemplateReferenceRaw(pTemplatePostfix: any, pRawTemplateDataAddress: any): string | false;
    getMetatemplateTemplateReference(pTemplatePostfix: any, pViewDataAddress: any): string | false;
    getInputMetatemplateTemplateReference(pDataType: any, pInputType: any, pViewDataAddress: any): string | false;
    getTabularInputMetatemplateTemplateReference(pDataType: any, pInputType: any, pViewDataAddress: any, pRecordSubAddress: any): string;
    rebuildCustomTemplate(): void;
    getTabularRecordInput(pGroupIndex: any, pInputIndex: any): any;
    getTabularRecordData(pGroupIndex: any, pRowIdentifier: any): any;
    getTabularRecordSet(pGroupIndex: any): any;
    getGroup(pGroupIndex: any): any;
    createDynamicTableRow(pGroupIndex: any): void;
    setDynamicTableRowIndex(pGroupIndex: any, pRowIndex: any, pNewRowIndex: any): boolean;
    moveDynamicTableRowDown(pGroupIndex: any, pRowIndex: any): boolean;
    moveDynamicTableRowUp(pGroupIndex: any, pRowIndex: any): boolean;
    deleteDynamicTableRow(pGroupIndex: any, pRowIndex: any): boolean;
    getRow(pGroupIndex: any, pRowIndex: any): any;
    getRowKeyValuePair(pGroupIndex: any, pRowIndex: any): {
        Key: any;
        Value: any;
        Group: any;
    };
    getInput(pGroupIndex: any, pRowIndex: any, pInputIndex: any): any;
    get isPictSectionForm(): boolean;
}
//# sourceMappingURL=Pict-View-DynamicForm.d.ts.map