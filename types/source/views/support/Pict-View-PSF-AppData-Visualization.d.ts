export = PictFormsAppData;
declare class PictFormsAppData extends libPictViewFormSupportBase {
    flattenMarshalDestination(): any;
    flattenAppData(): any;
    flattenAddress(pAddress: any): any;
}
declare namespace PictFormsAppData {
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
//# sourceMappingURL=Pict-View-PSF-AppData-Visualization.d.ts.map