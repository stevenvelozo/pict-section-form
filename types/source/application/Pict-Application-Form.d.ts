export = PictSectionFormApplication;
/**
 * Represents a PictSectionFormApplication.
 *
 * This is the automagic controller for a dyncamic form application.
 *
 * @class
 * @extends libPictApplication
 */
declare class PictSectionFormApplication {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    /** @type {import('pict') & import('fable')} */
    pict: import("pict") & any;
    /**
     * Marshals data from any rendered dynamic views to application data.
     */
    marshalDataFromDynamicViewsToAppData(): void;
    /**
     * Marshals data from the application data to any rendered dynamic views.
     */
    marshalDataFromAppDataToDynamicViews(): void;
}
declare namespace PictSectionFormApplication {
    export { default_configuration };
}
declare namespace default_configuration {
    let Name: string;
    let Hash: string;
    let MainViewportViewIdentifier: string;
    namespace pict_configuration {
        let Product: string;
    }
}
//# sourceMappingURL=Pict-Application-Form.d.ts.map