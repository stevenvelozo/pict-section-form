export = ManifestConversionToCSV;
declare class ManifestConversionToCSV {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict') & { instantiateServiceProviderWithoutRegistration: (hash: string, options?: any, uuid?: string) => any }} */
    fable: import("pict") & {
        instantiateServiceProviderWithoutRegistration: (hash: string, options?: any, uuid?: string) => any;
    };
    /** @type {any} */
    log: any;
    /** @type {string} */
    UUID: string;
    CSV_HEADER: string[];
    CSV_COLUMN_MAP: {};
    getRowFromDescriptor(pForm: any, pDescriptorKey: any, pDescriptor: any): false | any[];
    createTabularArrayFromManifests(pManifest: any): any[][];
}
//# sourceMappingURL=ManifestConversionToCSV.d.ts.map