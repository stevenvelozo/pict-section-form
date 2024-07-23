export = PictDynamicInputEvents;
/**
 * The PictDynamicInputEvents class is a provider that manages data brokering and provider mappings for dynamic inputs.
 */
declare class PictDynamicInputEvents {
    /**
     * Creates an instance of the PictDynamicInputEvents class.
     *
     * @param {object} pFable - The fable object.
     * @param {object} pOptions - The options object.
     * @param {object} pServiceHash - The service hash object.
     */
    constructor(pFable: object, pOptions: object, pServiceHash: object);
    inputDataRequest(pView: any, pInputHash: any): void;
    inputEvent(pView: any, pInputHash: any, pEvent: any): void;
    inputDataRequestTabular(pView: any, pGroupIndex: any, pInputIndex: any, pRowIndex: any): void;
    inputEventTabular(pView: any, pGroupIndex: any, pInputIndex: any, pRowIndex: any, pEvent: any): void;
}
declare namespace PictDynamicInputEvents {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-DynamicInputEvents.d.ts.map