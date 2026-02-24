export = ManifestConversionToCSV;
declare class ManifestConversionToCSV extends libFableServiceProviderBase {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict') & { instantiateServiceProviderWithoutRegistration: (hash: string, options?: any, uuid?: string) => any }} */
    fable: import("pict") & {
        instantiateServiceProviderWithoutRegistration: (hash: string, options?: any, uuid?: string) => any;
    };
    CSV_HEADER: string[];
    CSV_COLUMN_MAP: {};
    getRowFromDescriptor(pForm: any, pDescriptorKey: any, pDescriptor: any): false | any[];
    createTabularArrayFromManifests(pManifest: any): any[][];
}
import libFableServiceProviderBase = require("fable-serviceproviderbase");
//# sourceMappingURL=ManifestConversionToCSV.d.ts.map