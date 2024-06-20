declare const _exports: {
    new (pFable: any, pOptions: any, pServiceHash: any): import("./views/Pict-View-DynamicForm.js");
    default_configuration: {
        AutoRender: boolean;
        AutoSolveWithApp: boolean;
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
                TabularCreateRowFunctionCall: string;
            };
            Input: {
                Informary: string;
                InformaryTabular: string;
                HTMLName: string;
                HTMLID: string;
                HTMLForID: string;
                InputFullProperties: string;
                InputChangeHandler: string;
            };
        };
        TargetElementAddress: string;
    };
    PictFormTemplateProvider: typeof import("./providers/Pict-Provider-DynamicTemplates.js");
    PictFormMetacontroller: typeof import("./views/Pict-View-Form-Metacontroller.js");
    PictFormApplication: typeof import("./application/Pict-Application-Form.js");
};
export = _exports;
//# sourceMappingURL=Pict-Section-Form.d.ts.map