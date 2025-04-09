export = TransactionTracking;
declare class TransactionTracking {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict') & { addAndInstantiateSingletonService: (hash: string, options: any, prototype: any) => any }} */
    fable: import("pict") & {
        addAndInstantiateSingletonService: (hash: string, options: any, prototype: any) => any;
    };
    /** @type {any} */
    log: any;
    /** @type {string} */
    UUID: string;
    transactionMap: {};
    get transactions(): {};
    logToTransaction(pKey: any, pMessage: any, pCategory: any): boolean;
    registerTransaction(pKey: any): any;
    checkEvent(pKey: any, pEvent: any, pHash: any): boolean;
}
declare namespace TransactionTracking {
    let default_configuration: {};
}
//# sourceMappingURL=Fable-Service-TransactionTracking.d.ts.map