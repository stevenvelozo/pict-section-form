export = PictDynamicInputEvents;
/**
 * The PictDynamicInputEvents class is a provider that manages data brokering and provider mappings for dynamic inputs.
 */
declare class PictDynamicInputEvents extends libPictProvider {
    /**
     * Requests input data from the view based on the provided input hash.
     *
     * @param {Object} pView - The view object.
     * @param {string} pInputHash - The input hash.
     * @param {any} [pEvent] - The input event.
     */
    inputDataRequest(pView: any, pInputHash: string, pEvent?: any): void;
    /**
     * Handles the input event for a dynamic form.
     *
     * @param {Object} pView - The view object.
     * @param {string} pInputHash - The input hash.
     * @param {string} pEvent - The input event.
     * @param {string} [pTransactionGUID] - (optional) The active transaction GUID.
     */
    inputEvent(pView: any, pInputHash: string, pEvent: string, pTransactionGUID?: string): void;
    /**
     * Requests input data for a tabular record.
     *
     * @param {import('../views/Pict-View-DynamicForm')} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pInputIndex - The index of the input.
     * @param {number} pRowIndex - The index of the row.
     * @param {any} [pEvent] - The input event.
     */
    inputDataRequestTabular(pView: import("../views/Pict-View-DynamicForm"), pGroupIndex: number, pInputIndex: number, pRowIndex: number, pEvent?: any): void;
    /**
     * Handles the tabular input event.
     *
     * @param {Object} pView - The view object.
     * @param {number} pGroupIndex - The index of the group.
     * @param {number} pInputIndex - The index of the input.
     * @param {number} pRowIndex - The index of the row.
     * @param {string} pEvent - The input event.
     * @param {string} [pTransactionGUID] - (optional) The active transaction GUID.
     */
    inputEventTabular(pView: any, pGroupIndex: number, pInputIndex: number, pRowIndex: number, pEvent: string, pTransactionGUID?: string): void;
}
declare namespace PictDynamicInputEvents {
    export { _DefaultProviderConfiguration as default_configuration };
}
import libPictProvider = require("pict-provider");
/** @type {Record<string, any>} */
declare const _DefaultProviderConfiguration: Record<string, any>;
//# sourceMappingURL=Pict-Provider-DynamicInputEvents.d.ts.map