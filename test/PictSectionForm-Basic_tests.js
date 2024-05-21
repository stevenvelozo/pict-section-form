/*
	Unit tests for PictSectionForm Basic
	
*/

// This is temporary, but enables unit tests
const libBrowserEnv = require('browser-env')
libBrowserEnv();

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');

const libPictSectionForm = require('../source/Pict-Section-Form.js');

suite
(
	'PictSectionForm Basic',
	() =>
	{
		setup(() => { });

		suite
			(
				'Basic Basic Tests',
				() =>
				{
					test(
							'Basic Initialization',
							(fDone) =>
							{
								let _Pict = new libPict();
								_Pict.LogNoisiness = 1;
								let _PictEnvironment = new libPict.EnvironmentObject(_Pict);
								let _PictSectionForm = _Pict.addView({}, 'Pict-View-TestForm',  libPictSectionForm);
								Expect(_PictSectionForm).to.be.an('object');
								return fDone();
							}
						);
				}
			);
	}
);