declare const _exports: {
    new (pFable: any, pOptions: any, pServiceHash: any): import("./views/Pict-View-DynamicForm.js");
    default_configuration: {
        AutoRender: boolean;
        AutoSolveWithApp: boolean;
        ExecuteSolversWithoutMetacontroller: boolean;
        IncludeInMetatemplateSectionGeneration: boolean;
        IncludeInDefaultDynamicRender: boolean;
        DefaultRenderable: string;
        DefaultDestinationAddress: string;
        Renderables: any[];
        Templates: any[];
        MacroTemplates: {
            Section: {
                HTMLID: string;
            };
            Group: {
                HTMLID: string;
                PictFormLayout: string;
                TabularCreateRowFunctionCall: string;
            };
            Input: {
                Informary: string;
                InformaryTabular: string;
                HTMLSelector: string;
                HTMLSelectorTabular: string;
                RawHTMLID: string;
                HTMLName: string;
                HTMLIDAddress: string;
                HTMLID: string;
                HTMLForID: string;
                InputFullProperties: string;
                InputChangeHandler: string;
                DataRequestFunction: string;
            };
        };
        TargetElementAddress: string;
    };
    PictDynamicApplicationService: typeof import("./services/Pict-Service-DynamicApplication.js");
    PictFormTemplateProvider: typeof import("./providers/Pict-Provider-DynamicTemplates.js");
    PictInputExtensionProvider: typeof import("./providers/Pict-Provider-InputExtension.js");
    PictFormMetacontroller: typeof import("./views/Pict-View-Form-Metacontroller.js");
    PictFormApplication: typeof import("./application/Pict-Application-Form.js");
    PictDynamicLayoutProvider: typeof import("./providers/Pict-Provider-DynamicLayout.js");
    ManifestFactory: typeof import("./services/ManifestFactory.js");
};
export = _exports;
//# sourceMappingURL=Pict-Section-Form.d.ts.map