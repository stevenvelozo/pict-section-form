module.exports = (
{
	"TemplatePrefix": "Pict-Forms-Basic",

	"Templates":[
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

Glug glug glug
-->
<div id="Pict-{~D:Context[0].UUID~}-FormContainer~}" class="pict-form">`
		},

		// -Form-Container-Wrap-Prefix
		{
			"HashPostfix": "-Template-Form-Container-Wrap-Prefix",
			"Template": /*HTML*/`
<!-- Pict Form Metacontroller container [{~D:Context[0].UUID~}] -->
<div id="Pict-{~D:Context[0].UUID~}-FormContainer~}" class="pict-form">`
		},
		// -Form-Container
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


		// -Form-Template-Group-Prefix
		{
			"HashPostfix": "-Template-Group-Prefix",
			"Template": /*HTML*/`
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
			<h3>Group: {~D:Record.Name~}</h3>
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

		// -Form-Template-Row-Prefix
		{
			"HashPostfix": "-Template-Row-Prefix",
			"Template": /*HTML*/`
				<!-- Form Template Row Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
				<div>
`
		},
		// -Form-Template-Group-Postfix
		{
			"HashPostfix": "-Template-Row-Postfix",
			"Template": /*HTML*/`
				</div>
				<!-- Form Template Row Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},

		// -Form-Template-Input
		{
			"HashPostfix": "-Template-Input",
			"Template": /*HTML*/`
					<!-- Input {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input type="hidden" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" value="">
`
		},
		// -Form-Template-Input-DataType-String
		{
			"HashPostfix": "-Template-Input-DataType-String",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input type="text" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" value="">
`
		},
		// -Form-Template-Input-DataType-Number
		{
			"HashPostfix": "-Template-Input-DataType-Number",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input type="Number" id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}" value="">
`
		},
		// -Form-Template-Input-InputType-TextArea
		{
			"HashPostfix": "-Template-Input-InputType-TextArea",
			"Template": /*HTML*/`
					<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <textarea id="{~D:Context[0].UUID~}-FormInput-{~D:Record.Hash~}" name="{~D:Record.Name~}"></textarea>
`
		}
	]
});