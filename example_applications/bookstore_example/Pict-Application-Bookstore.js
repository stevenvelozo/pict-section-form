const libPictApplication = require('../../source/Pict-Application.js');

class BookstoreApp extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Initialize the REST client
		this.fable.instantiateServiceProvider('RestClient');

		// Add the books view
		this.pict.addView('Bookstore-Books', {}, require('./views/PictView-Bookstore-Books.js'));
	}
};

module.exports = BookstoreApp

module.exports.default_configuration = (
	{
		"Name": "A Plain Old Bookstore Application",
		"MainViewportViewIdentifier": 'Bookstore-Books'
	});

module.exports.pict_configuration = { RestClientURLPrefix: 'http://localhost:8086/1.0/' };