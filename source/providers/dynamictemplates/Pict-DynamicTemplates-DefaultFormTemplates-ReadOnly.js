module.exports = (
{
	"TemplatePrefix": "Pict-Forms-ReadOnly",

	"Templates":
	[
		/*
		 *
		 * [ Metacontroller Templates ]
		 *
		 */
		// the form "Header", rendered once before the dynamic views, after which come the section(s), then their group(s)
		{
			"HashPostfix": "-Template-Form-Container-Header",
			"Template": /*HTML*/`
<!-- Pict Form Metacontroller container Header

  ;,//;,    ,;/
 o:::::::;;///
>::::::::;;\\\
  ''\\\\'" ';\

Glug glug glug Oo... -->
<div id="Pict-{~D:Context[0].UUID~}-FormContainer" class="pict-form">`
		},
		//
		{
			"HashPostfix": "-Template-Form-Container-Wrap-Prefix",
			"Template": /*HTML*/`
<!-- Pict Form Metacontroller container [{~D:Context[0].UUID~}] -->
<div id="Pict-{~D:Context[0].UUID~}-{~D:Record.options.Hash~}-Wrap" class="pict-form">`
		},
		// the container div into which the actual view renders.
		// if you overwrite this template, make sure this ID is available on a container somewhere or auto rendering won't work
		{
			"HashPostfix": "-Template-Form-Container",
			"Template": /*HTML*/`

	<!-- Pict Form View Container [{~D:Record.UUID~}]::[{~D:Record.Hash~}] -->
	<div id="Pict-Form-Container-{~D:Record.options.Hash~}" class="pict-form-view"></div>`
		},
		{
			"HashPostfix": "-Template-Form-Container-Custom",
			"Template": /*HTML*/`

	<!-- Pict Form View Container [{~D:Record.UUID~}]::[{~D:Record.Hash~}] -->
	<div id="{~D:Record.options.CustomTargetID~}" class="pict-form-view"></div>`
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
		 * [ Basic Form Templates START ]
		 *
		 */
		// the wrapping container for a view which is a collection of form section(s)...
		{
			"HashPostfix": "-Template-Wrap-Prefix",
			"Template": /*HTML*/`
	<!-- Pict Form Wrap Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
`
		},
		{
			"HashPostfix": "-Template-Wrap-Postfix",
			"Template": /*HTML*/`
	<!-- Pict Form Wrap Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] -->
`
		},
		// the wrapping container for each specific section in a form... for legends and the like
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
		 * BEGIN Group and Row Templates (default)
		 */
		// a "group" is a cluster of inputs that are further categorized into row(s)
		{
			"HashPostfix": "-Template-Group-Prefix",
			"Template": /*HTML*/`
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
			<div id="GROUP-{~D:Context[0].formID~}-{~D:Record.Hash~}" {~D:Record.Macro.PictFormLayout~}>
			<h3>Group: {~D:Record.Name~}</h3>
`
		},
		// row(s) are useful when our form has multiple inputs on some lines and a single on another...
		// like city, state and zip all in the same "row" of an address form
		{
			"HashPostfix": "-Template-Row-Prefix",
			"Template": /*HTML*/`
				<!-- Form Template Row Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
				<div>
`
		},
		{
			"HashPostfix": "-Template-Row-Postfix",
			"Template": /*HTML*/`
				</div>
				<!-- Form Template Row Postfix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},
		{
			"HashPostfix": "-Template-Group-Postfix",
			"Template": /*HTML*/`
			</div>
			<!-- Form Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},
		/*
		 * END Group and Row Templates (default)
		 */

		/*
		 * BEGIN Input Templates (default)
		 */
		{
			"HashPostfix": "-Template-Input",
			"Template": /*HTML*/`
					<!-- DEFAULT Input {~"D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input disabled type="text" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
`
		},
		{
			"HashPostfix": "-Template-Input-DataType-String",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input disabled type="text" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
`
		},
		{
			"HashPostfix": "-Template-Input-DataType-Number",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <input disabled type="Number" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
`
		},
		{
			"HashPostfix": "-Template-Input-InputType-TextArea",
			"Template": /*HTML*/`
					<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} -->
					<span>{~D:Record.Name~}:</span> <textarea disabled {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~}></textarea>
`
		},
		{
			"HashPostfix": "-Template-Input-InputType-Option",
			"DefaultInputExtensions": ["Pict-Input-Select"],
			"Template": /*HTML*/`
					<!-- InputType Option {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="hidden" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
					<span>{~D:Record.Name~}:</span> <select disabled id="SELECT-FOR-{~D:Record.Macro.RawHTMLID~}" onchange="{~D:Record.Macro.DataRequestFunction~}"></select>
`
		},
		{
			"HashPostfix": "-Template-Input-InputType-Boolean",
			"Template": /*HTML*/`
					<!-- InputType Boolean {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="checkbox" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
`
		},
		{
			"HashPostfix": "-Template-Input-DataType-DateTime",
			"DefaultInputExtensions": ["Pict-Input-DateTime"],
			"Template": /*HTML*/`
					<!-- DataType DateTime {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="hidden" {~D:Record.Macro.InputFullProperties~} value="">
					<span>{~D:Record.Name~}:</span> <input disabled id="DATETIME-INPUT-FOR-{~D:Record.Macro.RawHTMLID~}" onchange="{~D:Record.Macro.DataRequestFunction~}" type="datetime-local" value="" />
`
		},
		/*
		 * END Input Templates (default)
		 */
		/*
		 *
		 * [ External Control Templates START ]
		 *
		 */
		/*
		 * Tab Groups are sets of Groups within a single Section that are shown/hidden when a tab control is clicked.
		 * 
		 * For example from the complex tabular application manifest descriptors:
		 *
		...
			"UI.StatisticsTabState": {
				Name: "Statistics Tab State",
				Hash: "StatisticsTabState",
				DataType: "String",
				PictForm: { Section: "Recipe", Group: "StatisticsTabs", 
					InputType: "TabGroupSelector",
					// The default when there is no state is the first entry here.
					// If you want to set a default, you can just do it in the state address though.
					TabGroupSet: ["Statistics", "FruitStatistics"] }
			},
		...
		 *
		 */
		{
			"HashPostfix": "-Template-Input-InputType-TabGroupSelector",
			"DefaultInputExtensions": ["Pict-Input-TabGroupSelector"],
			"Template": /*HTML*/`
					<!-- InputType TabGroupSelector {~D:Record.Hash~} {~D:Record.DataType~} -->
					<!-- the TabSelector Input provider deals with populating this from the manifest. -->
					<input disabled type="hidden" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} value="">
					<!-- <span>{~D:Record.Name~}:</span> -->
					<div id="TAB-SELECT-FOR-{~D:Record.Macro.RawHTMLID~}"></div>
`
		},
		{
			"HashPostfix": "-Template-Input-InputType-TabGroupSelector-TabElement",
			"Template": /*HTML*/`
			<!-- Sections have "tab groups" which are defined by the hash of the Descriptor that hosts the current TabGroup value. -->
			<a href="#" id="TAB-{~D:Context[1].TabGroupHash~}-{~D:Record.Macro.RawHTMLID~}" onclick="{~P~}.providers['Pict-Input-TabGroupSelector'].selectTabByViewHash('{~D:Context[0].Hash~}','{~D:Record.Hash~}', '{~D:Context[1].TabGroupHash~}')">{~D:Context[1].TabGroupHash~}</a>
`
		},
		{
			"HashPostfix": "-Template-Input-InputType-TabGroupSelector-EmptyGroupContent",
			"Template": /*HTML*/`
			<!-- This is the template for if the tmpInput.PictForm.TabGroupSet array is empty. -->
			<p>Warning! No tabs to select from for {~D:Record.TabGroupSetRawHTMLID~}</p>
`
		},		/*
		 * END View Management Templates (default)
		 */
		/*
		 *
		 * [ Basic Form Templates END ]
		 *
		 */

		/*
		 *
		 * [ External Control Templates START ]
		 *
		 */
		{
			"HashPostfix": "-TuiGrid-Container",
			"Template": /*HTML*/`
			<div id="{~D:Record.TuiGridHTMLID~}"></div>
`
		},
		{
			"HashPostfix": "-TuiGrid-Controls",
			"Template": /*HTML*/`
			<div>[ <a href="#" onclick="{~P~}.providers['Pict-Layout-TuiGrid'].addRow('{~D:Context[0].Hash~}', {~D:Record.GroupIndex~})">create</a> ]</div>
`
		},
		/*
		 *
		 * [ External Control Templates END ]
		 *
		 */


		/*
		 *
		 * [ Tabular Templates START ]
		 *
		 */
		{
			"HashPostfix": "-TabularTemplate-Group-Prefix",
			"Template": /*HTML*/`
			<div {~D:Record.Macro.PictFormLayout~}>
			<table>
					<tbody>
			<!-- Form Tabular Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},
		{
			"HashPostfix": "-TabularTemplate-Group-Postfix",
			"Template": /*HTML*/`
				</tbody>
			</table>
			<div><a href="#" onclick="{~D:Record.Macro.TabularCreateRowFunctionCall~}">create</a></div>
			</div>
			<!-- Form Tabular Template Group Prefix [{~D:Context[0].UUID~}]::[{~D:Context[0].Hash~}] {~D:Record.Hash~}::{~D:Record.Name~} -->
`
		},

		/*
		 * BEGIN Tabular Template "Extra" Columns
		 * these are meant to be easy ways to add controls to the left or right side of a record column
		 */
		{
			"HashPostfix": "-TabularTemplate-RowHeader-ExtraPrefix",
			"Template": /*HTML*/`<!-- TabularTemplateRowHeader-ExtraPrefix -->`
		},
		// because the row extension template below adds an extra column, we need to make our header have parity
		{
			"HashPostfix": "-TabularTemplate-RowHeader-ExtraPostfix",
			"Template": /*HTML*/`<!-- TabularTemplateRowHeader-ExtraPostfix -->
						<th style="min-width:100px;"></th>
`
		},
		{
			"HashPostfix": "-TabularTemplate-Row-ExtraPrefix",
			"Template": /*HTML*/`<!-- TabularTemplateRow-ExtraPrefix -->`
		},
		// by default PICT puts a "delete row" button on the right side of a tabular templateset
		{
			"HashPostfix": "-TabularTemplate-Row-ExtraPostfix",
			"Template": /*HTML*/`<!-- TabularTemplateRow-ExtraPostfix-->
					<td><a href="#" onClick="{~P~}.views['{~D:Context[0].Hash~}'].deleteDynamicTableRow({~D:Record.Group~},'{~D:Record.Key~}')">del</a>
					<a href="#" onClick="{~P~}.views['{~D:Context[0].Hash~}'].moveDynamicTableRowUp({~D:Record.Group~},'{~D:Record.Key~}')">up</a>
					<a href="#" onClick="{~P~}.views['{~D:Context[0].Hash~}'].moveDynamicTableRowDown({~D:Record.Group~},'{~D:Record.Key~}')">down</a></td>
`
		},
		/*
		 * END Tabular Template "Extra" Columns
		 */

		/*
		 * BEGIN Tabular Template Header Columns
		 */
		{
			"HashPostfix": "-TabularTemplate-RowHeader-Prefix",
			"Template": /*HTML*/`
				<thead>
					<tr>
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
					</tr>
				</thead>
				<tbody>
`
		},
		/*
		 * END Tabular Template Header Columns
		 */

		/*
		 * BEGIN Tabular TemplateSet Templates (row and cell prefix/postfix ... tr/td)
		 * (these are repeated for each "row" which is a record, and then wrap each "cell" which is a columnar input)
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
		 * END Tabular TemplateSet Templates
		 */


		/*
		 * BEGIN Tabular Input Templates
		 */
		{
			"HashPostfix": "-TabularTemplate-Begin-Input",
			"Template": /*HTML*/`
					<!-- DEFAULT Input {~"D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="text" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input",
			"Template": /*HTML*/` value="">`
		},

		{
			"HashPostfix": "-TabularTemplate-Mid-Input",
			"Template": /*HTML*/`  `
		},
		{
			"HashPostfix": "-TabularTemplate-InformaryAddress-Input",
			"Template": /*HTML*/` data-i-index="{~D:Context[2].Key~}" onchange="{~P~}.views['{~D:Context[0].Hash~}'].dataChangedTabular('{~D:Context[2].Group~}', '{~D:Record.PictForm.InputIndex~}', '{~D:Context[2].Key~}')"  `
		},

		{
			"HashPostfix": "-TabularTemplate-Begin-Input-DataType-String",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="text" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-DataType-String",
			"Template": /*HTML*/` value="">`
		},

		{
			"HashPostfix": "-TabularTemplate-Begin-Input-DataType-Number",
			"Template": /*HTML*/`
					<!-- DataType Number {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="Number" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-DataType-Number",
			"Template": /*HTML*/` value="">
`
		},
		{
			"HashPostfix": "-TabularTemplate-Begin-Input-InputType-TextArea",
			"Template": /*HTML*/`
					<!-- InputType TextArea {~D:Record.Hash~} {~D:Record.DataType~} -->
					<textarea disabled {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-InputType-TextArea",
			"Template": /*HTML*/` ></textarea>
`
		},
		{
			"HashPostfix": "-TabularTemplate-Begin-Input-InputType-Option",
			"DefaultInputExtensions": ["Pict-Input-Select"],
			"Template": /*HTML*/`
					<!-- InputType Option {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="hidden" id="SELECT-TABULAR-DATA-{~D:Record.Macro.RawHTMLID~}-{~D:Context[2].Key~}" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-InputType-Option",
			"Template": /*HTML*/` value="">
					<select disabled id="SELECT-TABULAR-DROPDOWN-{~D:Record.Macro.RawHTMLID~}-{~D:Context[2].Key~}" onchange="{~P~}.views['{~D:Context[0].Hash~}'].inputDataRequestTabular('{~D:Context[2].Group~}', '{~D:Record.PictForm.InputIndex~}', '{~D:Context[2].Key~}')"></select>
`
		},
		{
			"HashPostfix": "-TabularTemplate-Begin-Input-InputType-Boolean",
			"Template": /*HTML*/`
					<!-- InputType Boolean {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="checkbox" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-InputType-Boolean",
			"Template": /*HTML*/` value="" />
`
		},
		{
			"HashPostfix": "-TabularTemplate-Begin-Input-DataType-DateTime",
			"DefaultInputExtensions": ["Pict-Input-DateTime"],
			"Template": /*HTML*/`
					<!-- DataType DateTime {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="hidden" id="DATETIME-TABULAR-DATA-{~D:Record.Macro.RawHTMLID~}-{~D:Context[2].Key~}" {~D:Record.Macro.HTMLName~} {~D:Record.Macro.InformaryTabular~} `
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-DataType-DateTime",
			"Template": /*HTML*/` value="">
					<input disabled id="DATETIME-TABULAR-INPUT-{~D:Record.Macro.RawHTMLID~}-{~D:Context[2].Key~}" onchange="{~P~}.views['{~D:Context[0].Hash~}'].inputDataRequestTabular('{~D:Context[2].Group~}', '{~D:Record.PictForm.InputIndex~}', '{~D:Context[2].Key~}')" type="datetime-local" value="" />
`
		},
		{
			"HashPostfix": "-TabularTemplate-Begin-Input-InputType-Hidden",
			"Template": /*HTML*/`
					<!-- InputType Hidden {~D:Record.Hash~} {~D:Record.DataType~} -->
					<input disabled type="hidden" {~D:Record.Macro.InputFullProperties~} {~D:Record.Macro.InputChangeHandler~} {~D:Record.Macro.InformaryTabular~}
`
		},
		{
			"HashPostfix": "-TabularTemplate-End-Input-InputType-Hidden",
			"Template": /*HTML*/` value="">
`
		},

		/*
		 * END Tabular Input Templates
		 */
		/*
		 *
		 * [ Tabular Templates END ]
		 *
		 */
	]
});
