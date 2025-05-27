export = PictDynamicApplication;
declare class PictDynamicApplication {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict') & { addAndInstantiateSingletonService: (hash: string, options: any, prototype: any) => any }} */
    fable: import("pict") & {
        addAndInstantiateSingletonService: (hash: string, options: any, prototype: any) => any;
    };
    /** @type {any} */
    log: any;
    /** @type {string} */
    UUID: string;
}
declare namespace PictDynamicApplication {
    let default_configuration: Record<string, any>;
}
//# sourceMappingURL=Pict-Service-DynamicApplication.d.ts.map