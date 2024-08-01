/**
 * Adjusts the auto-generated view configurations.
 *
 * @param {Object} pViewConfigurations - The view configurations object.
 */
function adjustViewConfigurations(pViewConfigurations)
{
	// Adjust the default destination address of the Manyfest-Basic-NavigationHtml-View
	pViewConfigurations['Manyfest-Basic-NavigationHtml-View'].DefaultDestinationAddress = '#NavigationContainer';
	pViewConfigurations['Manyfest-Basic-NavigationHtml-View'].AutoRender = true;
	return pViewConfigurations;
};

module.exports = adjustViewConfigurations;