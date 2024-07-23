export = PictMetatemplateGenerator;
declare class PictMetatemplateGenerator {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    getMetatemplateTemplateReferenceRaw(pView: any, pTemplatePostfix: any, pRawTemplateDataAddress: any): string | false;
    getMetatemplateTemplateReference(pView: any, pTemplatePostfix: any, pViewDataAddress: any): string | false;
    checkMetatemplateReference(pView: any, pDataType: any, pInputType: any): string | false;
    getInputMetatemplateTemplateReference(pView: any, pDataType: any, pInputType: any, pViewDataAddress: any): string | false;
    getTabularInputMetatemplateTemplateReference(pView: any, pDataType: any, pInputType: any, pViewDataAddress: any, pGroupIndex: any, pRowIndex: any): string;
    getGroupLayoutProvider(pView: any, pGroup: any): any;
    rebuildCustomTemplate(pView: any): void;
}
declare namespace PictMetatemplateGenerator {
    export { _DefaultProviderConfiguration as default_configuration };
}
declare namespace _DefaultProviderConfiguration {
    let ProviderIdentifier: string;
    let AutoInitialize: boolean;
    let AutoInitializeOrdinal: number;
    let AutoSolveWithApp: boolean;
}
//# sourceMappingURL=Pict-Provider-MetatemplateGenerator.d.ts.map