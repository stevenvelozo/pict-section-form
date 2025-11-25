const libPictViewFormSupportBase = require(`./Pict-View-PSF-SupportBase.js`);

const defaultViewConfiguration = (
{
	ViewIdentifier: "Pict-Form-AppData",

	DefaultRenderable: 'Pict-Form-AppData-Renderable',
	DefaultDestinationAddress: "#Pict-Form-Extensions-Container",

	RenderOnLoad: false,

	CSS: /*css*/``,

	Templates: [
		{
			Hash: "Pict-Form-AppData-Content",
			Template: /*html*/`
<div id="Pict-Form-AppData-Content">
	<h2 class="PSFAD-Global-Header">Pict Form Data Visualization</h2>
	<p class="PSFExt-Data">
		<span class="PSFExt-Label">Form Marshal Destination</span> {~D:Pict.views.PictFormMetacontroller.viewMarshalDestination~}
	</p>
	<p class="PSFExt-Data">
		<span class="PSFExt-Label">Form Data</span> [<a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].downloadJSONObjectAsFile('Pict.{~D:Pict.views.PictFormMetacontroller.viewMarshalDestination~}')">Download JSON</a>]
	</p>
	<p class="PSFExt-Data">
		<span class="PSFExt-Label">AppData</span> [<a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].downloadJSONObjectAsFile('Pict.AppData')">Download AppData JSON</a>]
	</p>
	<p class="PSFExt-Data">
		<span class="PSFExt-Label">Fable Settings</span> [<a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].downloadJSONObjectAsFile('Pict.settings')">Download fable settings JSON</a>]
	</p>
	<p class="PSFExt-Data">
		<span class="PSFExt-Label">Application Options</span> [<a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].downloadJSONObjectAsFile('Pict.PictApplication.options')">Download Application options JSON</a>]
	</p>
	<div id="PSFExt-Data-Browser" class="PSFExt-Section">
		{~TVS:Pict-Form-AppData:Context[0].flattenMarshalDestination()~}
	</div>
`
		},
		{
			Hash: "Pict-Form-AppData",
			Template: /*html*/`
	<div class="PSFExt-Section">
		<h3 class="PSFExt-Section-Header"><span class="PSFExt-DeEmphasize">Address:</span> 
			{~D:Record.Key~}
		</h3>
		<div id="PSFExt-AD-{~D:Record.Key~}-Extra" class="PSFExt-Section-ExtraData">
			{~TIfAbs:Pict-Form-AppData-ObjectValueDisplay:Record:Record.Value.DataType^==^Object~}
			{~TIfAbs:Pict-Form-AppData-NotObjectValueDisplay:Record:Record.Value.DataType^!=^Object~}
		</div>
	</div>
`
		},
		{
			Hash: "Pict-Form-AppData-NotObjectValueDisplay",
			Template: /*html*/`
				<!-- Not Object Value Display -->
				{~TIfAbs:Pict-Form-AppData-ArrayValueDisplay:Record:Record.Value.DataType^==^Array~}
				{~TIfAbs:Pict-Form-AppData-PrimitiveValueDisplay:Record:Record.Value.DataType^!=^Array~}
`
		},
		{
			Hash: "Pict-Form-AppData-ObjectValueDisplay",
			Template: /*html*/`
			<!-- Object Value Display -->
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">Type</span> Javascript Object {~T:Pict-Form-AppData-ObjectDownloadLink~}
			</p>
`
		},
		{
			Hash: "Pict-Form-AppData-ArrayValueDisplay",
			Template: /*html*/`
			<!-- Array Value Display -->
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">Type</span> Array {~TIfAbs:Pict-Form-AppData-ArrayDownloadLink~}

			</p>
`
		},
		{
			Hash: "Pict-Form-AppData-PrimitiveValueDisplay",
			Template: /*html*/`
			<!-- Primitive Value Display -->
			<p class="PSFExt-Data">
				<span class="PSFExt-Label">Value</span> {~D:Record.Value.Default~}
			</p>
`
		},
		{
			Hash: "Pict-Form-AppData-ObjectDownloadLink",
			Template: /*html*/`[<a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].downloadJSONObjectAsFile('Pict.{~D:Pict.views.PictFormMetacontroller.viewMarshalDestination~}')">Download JSON</a>]`
		},
		{
			Hash: "Pict-Form-AppData-ArrayDownloadLink",
			Template: /*html*/`[<a href="javascript:void(0);" onclick="{~P~}.views['{~D:Context[0].Hash~}'].downloadJSONObjectAsFile('Pict.{~D:Pict.views.PictFormMetacontroller.viewMarshalDestination~}')">Download Array</a>]`
		}
	],
	Renderables: [
		{
			RenderableHash: "Pict-Form-AppData-Renderable",
			TemplateHash: "Pict-Form-AppData-Content"
		}
	]
});

class PictFormsAppData extends libPictViewFormSupportBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.DisplayShortName = 'FDT';
		this.DisplayLongName = 'FormData';
	}

	flattenMarshalDestination()
	{
		return this.flattenAddress(this.pict.views.PictFormMetacontroller.viewMarshalDestination);
	}

	flattenAppData()
	{
		return this.flattenAddress('AppData');
	}

	flattenAddress(pAddress)
	{
		let tmpData = this.pict.resolveStateFromAddress(pAddress);
		// Now flatten the entire data structure...
		return this.pict.manifest.objectAddressGeneration.generateAddressses(tmpData);
	}
}

module.exports = PictFormsAppData;

module.exports.default_configuration = defaultViewConfiguration;
