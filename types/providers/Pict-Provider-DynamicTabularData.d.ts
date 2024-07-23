export = DynamicTabularData;
/**
 * The DynamicTabularData class is a provider that translates simple list entries into arrays of entries ready to use in drop-down lists and such
 */
declare class DynamicTabularData {
    /**
     * Creates an instance of the DynamicTabularData class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    getTabularRecordSet(pView: any, pGroupIndex: any): any;
    getTabularRecordInput(pView: any, pGroupIndex: any, pInputIndex: any): any;
    getTabularRecordData(pView: any, pGroupIndex: any, pRowIdentifier: any): any;
    createDynamicTableRow(pView: any, pGroupIndex: any): void;
    setDynamicTableRowIndex(pView: any, pGroupIndex: any, pRowIndex: any, pNewRowIndex: any): boolean;
    moveDynamicTableRowDown(pView: any, pGroupIndex: any, pRowIndex: any): boolean;
    moveDynamicTableRowUp(pView: any, pGroupIndex: any, pRowIndex: any): boolean;
    deleteDynamicTableRow(pView: any, pGroupIndex: any, pRowIndex: any): boolean;
}
declare namespace DynamicTabularData {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-DynamicTabularData.d.ts.map