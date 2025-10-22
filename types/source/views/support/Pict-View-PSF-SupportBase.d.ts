export = PictFormsSupportBase;
declare class PictFormsSupportBase extends libPictView {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    DisplayShortName: string;
    DisplayLongName: string;
    getDynamicState(): {
        Scope: any;
        Description: string;
        Manifest: any;
        ManifestDescription: any;
        AllViews: any;
        SectionViews: any[];
        DynamicInputView: boolean;
        Solvers: any[];
    } | {
        Scope: string;
        Description: string;
        Manifest: any;
        Sections: any[];
    };
    getSectionSolvers(pSectionViewHash: any): any;
    downloadJSONObjectAsFile(pAddress: any): void;
    updateExpressionFromElement(pExpressionElementAddress: any, pExpressionScope: any, pSectionViewHash: any, pSectionOrdinal: any, pSolverIndex: any, pExpressionElementRepresentationAddress: any): void;
    bootstrapContainer(): boolean;
}
declare namespace PictFormsSupportBase {
    export { defaultViewConfiguration as default_configuration };
}
import libPictView = require("pict-view");
declare namespace defaultViewConfiguration {
    let ViewIdentifier: string;
    let DefaultRenderable: string;
    let RenderOnLoad: boolean;
    let Templates: any[];
    let Renderables: {
        RenderableHash: string;
        TemplateHash: string;
    }[];
}
//# sourceMappingURL=Pict-View-PSF-SupportBase.d.ts.map