export = PictSectionFormApplication;
/**
 * Represents a PictSectionFormApplication.
 *
 * This is the automagic controller for a dyncamic form application.
 *
 * @class
 * @extends libPictApplication
 */
declare class PictSectionFormApplication extends libPictApplication {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
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
import libPictApplication = require("pict-application");
declare const default_configuration: Record<string, any>;
//# sourceMappingURL=Pict-Application-Form.d.ts.map