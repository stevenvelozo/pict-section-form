const libPictFormSection = require('../../../source/Pict-Section-Form.js');

class CustomInputHandler extends libPictFormSection.PictInputExtensionProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * @param {import('../../../source/views/Pict-View-DynamicForm.js')} pView
	 * @param {Object} pInput
	 * @param {any} pValue
	 * @param {string} pHTMLSelector
	 * @param {string} pEvent
	 * @param {string} pTransactionGUID
	 */
	onEvent(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID)
	{
		console.log(`Alert alert event happened for ${pInput}: ${pEvent} [${pTransactionGUID}]`);
		pView.registerEventTransactionAsyncOperation(pTransactionGUID, 'testAsyncOp');
		pView.registerOnTransactionCompleteCallback(pTransactionGUID, () =>
		{
			this.pict.log.info(`Transaction ${pTransactionGUID} is complete!`);
		});
		setTimeout(() =>
		{
			pView.eventTransactionAsyncOperationComplete(pTransactionGUID, 'testAsyncOp');
		}, 5000);
		return super.onEvent(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID);
	}

	/**
	 * @param {import('../../../source/views/Pict-View-DynamicForm.js')} pView
	 * @param {Object} pInput
	 * @param {any} pValue
	 * @param {string} pHTMLSelector
	 * @param {string} pEvent
	 * @param {string} pTransactionGUID
	 */
	onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID)
	{
		this.pict.log.info(`After event completion for ${pInput}: ${pEvent} [${pTransactionGUID}]`);
		super.onAfterEventCompletion(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID);
	}

	onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID)
	{
		console.log(`Alert alert event happened for ${pInput} row ${pRowIndex}: ${pEvent} [${pTransactionGUID}]`);
		return super.onEventTabular(pView, pInput, pValue, pHTMLSelector, pRowIndex, pEvent, pTransactionGUID);
	}
}

module.exports = CustomInputHandler;
