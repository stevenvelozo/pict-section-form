module.exports = (
{
	"TemplatePrefix": "Pict-Forms-Basic",

	"Templates":[
		/*
		*
		* [ Metacontroller Templates ]
		*
		*/
		// -Form-Container-Header
		{
			"HashPostfix": "-Template-Form-Container-Header",
			"Template": /*HTML*/`
<!-- 
Pict Form Metacontroller container Header

  ;,//;,    ,;/
 o:::::::;;///
>::::::::;;\\\
  ''\\\\\'" ';\

Glug glug glug Oo...
-->
<div id="Pict-{~D:Context[0].UUID~}-FormContainer" class="pict-form">`
		},

		// -Form-Container-Wrap-Prefix
		{
			"HashPostfix": "-Template-Form-Container-Wrap-Prefix",
			"Template": /*HTML*/`
<!-- Pict Form Metacontroller container [{~D:Context[0].UUID~}] -->
<div id="Pict-{~D:Context[0].UUID~}-FormContainer" class="pict-form">`
		},
		// -Form-Container
		// This is the DIV each section (view) renders into.
		{
			"HashPostfix": "-Template-Form-Container",
			"Template": /*HTML*/`

	<!-- Pict Form View Container [{~D:Record.UUID~}]::[{~D:Record.Hash~}] -->
	<div id="Pict-Form-Container-{~D:Record.options.Hash~}" class="pict-form-view"></div>`
		},

		// -Form-Container-Wrap-Postfix
		{
			"HashPostfix": "-Template-Form-Container-Wrap-Postfix",
			"Template": /*HTML*/`
</div>
<!-- Pict Form Metacontroller container [{~D:Context[0].UUID~}] -->
`
		},


		/*
		*
		* [ Section Wrap Templates ]
		*
		*/
		// -Form-Template-Wrap-Prefix
		{
			"HashPostfix": "-Template-Wrap-Prefix",
			"Template": /*HTML*/`
	<!-- Pict Form Wrap Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
`
		},
		// -Form-Template-Wrap-Postfix
		{
			"HashPostfix": "-Template-Wrap-Postfix",
			"Template": /*HTML*/`
	<!-- Pict Form Wrap Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
`
		},


		// -Form-Template-Section-Prefix
		{
			"HashPostfix": "-Template-Section-Prefix",
			"Template": /*HTML*/`
		<!-- Form Section Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
		<div class="pict-form-section">
		<h2>{~D:Record.Name~}</h2>
`
		},
		// -Form-Template-Section-Postfix
		{
			"HashPostfix": "-Template-Section-Postfix",
			"Template": /*HTML*/`
		</div>
		<!-- Form Section Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},


		/*
		*
		* [ Group and Row Templates (default) ]
		*
		*/
		// -Form-Template-Group-Prefix
		{
			"HashPostfix": "-Template-Group-Prefix",
			"Template": /*HTML*/`
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
			<h3>Group: {~D:Record.Name~}</h3>
			<div>
`
		},
		// -Form-Template-Row-Prefix
		{
			"HashPostfix": "-Template-Row-Prefix",
			"Template": /*HTML*/`
				<!-- Form Template Row Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
				<div>
`
		},
		// -Form-Template-Row-Postfix
		{
			"HashPostfix": "-Template-Row-Postfix",
			"Template": /*HTML*/`
				</div>
				<!-- Form Template Row Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},
		// -Form-Template-Group-Postfix
		{
			"HashPostfix": "-Template-Group-Postfix",
			"Template": /*HTML*/`
			</div>
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},


		/*
		*
		* [ Input Templates (Default) ]
		*
		*/
		// -Form-Template-Input
		{
			"HashPostfix": "-Template-Input",
			"Template": /*HTML*/`
					<!-- DEFAULT Input {~"D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input type="text" {~D:Record.Macro.InputFullProperties~} value="">
`
		},
		// -Form-Template-Input-DataType-String
		{
			"HashPostfix": "-Template-Input-DataType-String",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input type="text" {~D:Record.Macro.InputFullProperties~} value="">
`
		},
		// -Form-Template-Input-DataType-Number
		{
			"HashPostfix": "-Template-Input-DataType-Number",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input type="Number" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
`
		},
		// -Form-Template-Input-InputType-TextArea
		{
			"HashPostfix": "-Template-Input-InputType-TextArea",
			"Template": /*HTML*/`
					<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <textarea {~D:Record.Macro.InputFullProperties~}></textarea>
`
		},


		/*
		*
		* [ Tabular Templates ]
		*
		*/
		{
			"HashPostfix": "-TabularTemplate-Group-Prefix",
			"Template": /*HTML*/`
			<div>
			<table>
					<tbody>
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},


		// These templates are meant to be an easily overridable "add buttons to the row" template.
		{
			"HashPostfix": "-TabularTemplate-RowHeader-ExtraPrefix",
			"Template": /*HTML*/`<!-- TabularTemplateRowHeader-ExtraPrefix -->`
		},
		{
			"HashPostfix": "-TabularTemplate-Row-ExtraPrefix",
			"Template": /*HTML*/`<!-- TabularTemplateRow-ExtraPrefix -->`
		},
		{
			"HashPostfix": "-TabularTemplate-RowHeader-ExtraPostfix",
			"Template": /*HTML*/`<!-- TabularTemplateRowHeader-ExtraPostfix -->`
		},
		{
			"HashPostfix": "-TabularTemplate-Row-ExtraPostfix",
			"Template": /*HTML*/`<!-- TabularTemplateRow-ExtraPostfix -->`
		},

		{
			"HashPostfix": "-TabularTemplate-RowHeader-Prefix",
			"Template": /*HTML*/`
				<thead>
					<tr>{~T:TabularTemplateRowHeader-ExtraPrefix~}
`
		},
		{
			"HashPostfix": "-TabularTemplate-HeaderCell",
			"Template": /*HTML*/`
						<!-- Descriptor {~D:Record.Name~} [{~D:Record.Hash~}] -> {~D:Record.Address~} -->
						<th>{~D:Record.Name~}</th>
`
		},
		{
			"HashPostfix": "-TabularTemplate-RowHeader-Postfix",
			"Template": /*HTML*/`
					{~T:TabularTemplateRowHeader-ExtraPostfix~}</tr>
				</thead>
				<tbody>
`
		},


		/*
		 *
		 * BEGINNING of the  Tabular TemplateSet metatemplate entries
		 * 
		 */
		{
			"HashPostfix": "-TabularTemplate-Row-Prefix",
			"Template": /*HTML*/`
					<tr>{~T:TabularTemplateRow-ExtraPrefix~}
`
		},
		{
			"HashPostfix": "-TabularTemplate-Cell-Prefix",
			"Template": /*HTML*/`
						<td><!-- {~D:Record.Name~}  -->
`
		},
		{
			"HashPostfix": "-TabularTemplate-Cell-Postfix",
			"Template": /*HTML*/`
						</td>
`
		},
		{
			"HashPostfix": "-TabularTemplate-Row-Postfix",
			"Template": /*HTML*/`
					{~T:TabularTemplateRow-ExtraPostfix~}</tr>`
		},
		/*
		 *
		 * END of the above Tabular TemplateSet metatemplate entries
		 * 
		 */


		{
			"HashPostfix": "-TabularTemplate-Group-Postfix",
			"Template": /*HTML*/`
				</tbody>
			</table>
			</div>
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},

		/*
		 *
		 * Input Templates (tabular)
		 *
		 */
		{
			"HashPostfix": "-TabularTemplate-Begin-Input",
			"Template": /*HTML*/`
					<!-- DEFAULT Input {~"D:Record.Hash~} {~D:Record.DataType~} -->
					<input type="text" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input",
			"Template": /*HTML*/` value="">`
		},

		{
			"HashPostfix": "-TabularTemplate-Begin-Input-DataType-String",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input type="text" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-DataType-String",
			"Template": /*HTML*/` value="">`
		},

		{
			"HashPostfix": "-TabularTemplate-Begin-Input-DataType-Number",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input type="Number" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-DataType-Number",
			"Template": /*HTML*/` {~D:Record.Macro.InputChangeHandler~} value="">
`
		},
		{
			"HashPostfix": "-TabularTemplate-Begin-Input-InputType-TextArea",
			"Template": /*HTML*/`
					<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} -->
					<textarea {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-InputType-TextArea",
			"Template": /*HTML*/`></textarea>
`
		}

	]
});