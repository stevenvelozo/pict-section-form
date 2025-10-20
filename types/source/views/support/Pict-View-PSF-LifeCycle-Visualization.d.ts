export = PictSectionFormsLifecycleVisualization;
declare class PictSectionFormsLifecycleVisualization extends libPictView {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
}
declare namespace PictSectionFormsLifecycleVisualization {
    export { defaultViewConfiguration as default_configuration };
}
import libPictView = require("pict-view");
declare namespace defaultViewConfiguration {
    let ViewIdentifier: string;
    let DefaultRenderable: string;
    let DefaultDestinationAddress: string;
    let RenderOnLoad: boolean;
    let Templates: {
        Hash: string;
        Template: string;
    }[];
    let Renderables: {
        RenderableHash: string;
        TemplateHash: string;
    }[];
}
//# sourceMappingURL=Pict-View-PSF-LifeCycle-Visualization.d.ts.map