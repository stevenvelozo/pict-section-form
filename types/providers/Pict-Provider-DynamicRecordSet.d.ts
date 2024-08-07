export = PictRecordSet;
/**
 * The PictRecordSet class is a provider to read and write record sets.
 *
 * Record sets are bodies of records that are larger than what we would want to
 * be projected into a view.
 */
declare class PictRecordSet {
    /**
     * Creates an instance of the PictRecordSet class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    recordProviders: {};
    count(pFilter: any, fCallback: any): any;
    readRecordList(pFilter: any, fCallback: any): any;
    readRecord(pFilter: any, fCallback: any): any;
    writeRecord(pRecord: any, fCallback: any): any;
    deleteRecord(pRecord: any, fCallback: any): any;
}
declare namespace PictRecordSet {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-DynamicRecordSet.d.ts.map