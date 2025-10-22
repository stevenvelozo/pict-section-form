export = PictFormsSpecificSolve;
declare class PictFormsSpecificSolve extends libPictViewFormSupportBase {
}
declare namespace PictFormsSpecificSolve {
    export { defaultViewConfiguration as default_configuration };
}
import libPictViewFormSupportBase = require("./Pict-View-PSF-SupportBase.js");
declare namespace defaultViewConfiguration {
    let ViewIdentifier: string;
    let DefaultRenderable: string;
    let DefaultDestinationAddress: string;
    let RenderOnLoad: boolean;
    let CSS: string;
    let Templates: {
        Hash: string;
        Template: string;
    }[];
    let Renderables: {
        RenderableHash: string;
        TemplateHash: string;
    }[];
}
//# sourceMappingURL=Pict-View-PSF-SpecificSolve-Visualization.d.ts.map