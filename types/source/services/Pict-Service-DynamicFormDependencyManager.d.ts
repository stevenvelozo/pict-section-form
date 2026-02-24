export = PictDynamicFormDependencyManager;
declare class PictDynamicFormDependencyManager extends libFableServiceProviderBase {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict') & { addAndInstantiateSingletonService: (hash: string, options: any, prototype: any) => any }} */
    fable: import("pict") & {
        addAndInstantiateSingletonService: (hash: string, options: any, prototype: any) => any;
    };
}
declare namespace PictDynamicFormDependencyManager {
    let default_configuration: Record<string, any>;
}
import libFableServiceProviderBase = require("fable-serviceproviderbase");
//# sourceMappingURL=Pict-Service-DynamicFormDependencyManager.d.ts.map