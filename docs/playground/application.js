// Application Code — your custom class extends the section's base
// PictApplication.  This whole editor is evaluated as a function body
// with `Base` bound to the section's application class (PictFormApplication
// for pict-section-form).  Return a class — the playground instantiates
// it via Pict.safeLoadPictApplication() with the configs from the other
// tabs already merged into default_configuration.
//
// Defining methods here lets you customize the bootstrap, register
// extra views/providers, override lifecycle hooks, or expose helper
// methods that views can call via _Pict.PictApplication.<method>().
//
// Tip: edits re-evaluate on every Run, so iterate freely — there's
// no in-place state to invalidate.  The iframe is rebuilt clean.

return class extends Base
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register extra views or providers here.  The section's own
		// PictFormApplication has already registered the form
		// metacontroller — anything you add is additive.
		//
		//   this.pict.addProvider('MyProvider', myConfig, MyProviderClass);
		//   this.pict.addView('MyView',         myViewConfig, MyViewClass);
	}

	onBeforeInitializeAsync(fCallback)
	{
		// Runs BEFORE the form renders.  Use this to seed AppData,
		// fetch starter data, or mutate the manifest.
		//
		//   this.pict.AppData.Contact.Greeting = 'Hello from custom code';
		return super.onBeforeInitializeAsync ? super.onBeforeInitializeAsync(fCallback) : fCallback();
	}

	onAfterInitializeAsync(fCallback)
	{
		// Runs AFTER the form renders.  Good place for one-time wiring
		// against the rendered DOM, or for logging via the playground
		// iframe's devtools console (the sandbox keeps its own context).
		//
		//   this.pict.log.info('Playground application booted', {
		//     product: this.options.Product
		//   });
		return super.onAfterInitializeAsync ? super.onAfterInitializeAsync(fCallback) : fCallback();
	}

	// Add your own methods — anything you can call from a manifest's
	// inline onclick handler or from a custom view will work.  Reach
	// the app from inline handlers via `_Pict.PictApplication.<name>(...)`.
	//
	// sayHello()
	// {
	//     window.alert('Hi from the playground app');
	// }
};
