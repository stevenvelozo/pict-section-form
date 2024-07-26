export = TuiGridLayout;
declare class TuiGridLayout extends libPictSectionGroupLayout {
    constructor(pFable: any, pOptions: any, pServiceHash: any);
    viewGridConfigurations: {};
    viewTuiGrids: {};
    viewGridState: {};
    getGridHtmlID(pView: any, pGroup: any): string;
    getViewTuiHtmlID(pView: any, pGroup: any): string;
    getViewGrid(pView: any, pGroup: any): any;
    createViewTuiGrid(pView: any, pGroup: any): any;
    getViewTuiConfiguration(pView: any, pGroup: any): any;
    generateDataRepresentation(pView: any, pGroup: any): {
        RecordIndex: number;
    }[];
}
import libPictSectionGroupLayout = require("../Pict-Provider-DynamicLayout.js");
//# sourceMappingURL=Pict-Layout-TuiGrid.d.ts.map