export = PictFormsInlineEditor;
declare class PictFormsInlineEditor extends libPictViewFormSupportBase {
}
declare namespace PictFormsInlineEditor {
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
    let Renderables: ({
        RenderableHash: string;
        TemplateHash: string;
        ContentDestinationAddress?: undefined;
        RenderMethod?: undefined;
        TestAddress?: undefined;
    } | {
        RenderableHash: string;
        TemplateHash: string;
        ContentDestinationAddress: string;
        RenderMethod: string;
        TestAddress: string;
    })[];
}
//# sourceMappingURL=Pict-View-PSF-DebugViewer.d.ts.map