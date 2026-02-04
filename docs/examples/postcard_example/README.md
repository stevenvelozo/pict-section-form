# Postcard Example

The Postcard Example demonstrates a complete web application with dynamic form
generation, theme switching, and navigation-based view management. It simulates
a postcard creation and delivery service.

## What This Example Demonstrates

- **Theme Switching**: Runtime switching between different visual themes
- **Navigation System**: Sidebar menu with multiple views
- **Dynamic Form Generation**: Forms generated from server-provided manifests
- **Custom Input Types**: Extended input providers with event handling
- **View Marshal Destinations**: Controlling where form data is stored
- **Metacontroller Override**: Extending the form lifecycle

## Key Files

- `Pict-Application-Postcard.js` - Main application class
- `Pict-Application-Postcard-Configuration.json` - Application configuration
- `providers/PictProvider-BestPostcardTheme.js` - Custom theme provider
- `providers/PictProvider-PostKardInputExtension.js` - Custom input extension
- `providers/PictProvider-Dynamic-Sections.js` - Dynamic section loading
- `views/` - Various view configurations

## Configuration Highlights

### Application Configuration

```json
{
  "Name": "A Simple Postcard Application",
  "Hash": "Postcard",
  "MainViewportViewIdentifier": "PostcardNavigation",
  "pict_configuration": {
    "Product": "Postkard-Pict-Application",
    "CustomInputMacros": {
      "CustomPictSettingsProperty": "ThisCustomProperty=\"CustomValue\""
    }
  }
}
```

### Theme Switching

```javascript
changeToPostcardTheme() {
  this.pict.views.PictFormMetacontroller.formTemplatePrefix = 'Postcard-Theme';
  this.pict.views.PictFormMetacontroller.generateMetatemplate();
  this.pict.views.PictFormMetacontroller.regenerateFormSectionTemplates();
  this.pict.views.PictFormMetacontroller.render();
  this.pict.views.PictFormMetacontroller.renderFormSections();
  this.pict.marshalDataFromAppDataToView();
}
```

### Custom Theme Templates

```javascript
TemplateSet: [
  {
    "HashPostfix": "Template-Form-Container-Header",
    "Template": `<form class="pure-form">`
  },
  {
    "HashPostfix": "Template-Section-Prefix",
    "Template": `<fieldset class="..."><legend>{~D:Context[0].Name~}</legend>`
  },
  {
    "HashPostfix": "Template-Input-InputType-PostKardSignature",
    "Template": `<div class="signature-input">...</div>`
  }
]
```

### Custom Input Extension with Async Events

```javascript
onEvent(pView, pInput, pValue, pHTMLSelector, pEvent, pTransactionGUID) {
  // Register async operation
  pView.registerEventTransactionAsyncOperation(pTransactionGUID, 'testAsyncOp');

  // Register completion callback
  pView.registerOnTransactionCompleteCallback(pTransactionGUID, () => {
    this.pict.log.info(`Transaction ${pTransactionGUID} is complete!`);
  });

  // Simulate async operation
  setTimeout(() => {
    pView.eventTransactionAsyncOperationComplete(pTransactionGUID, 'testAsyncOp');
  }, 5000);

  return super.onEvent(...arguments);
}
```

### View Marshal Destination

```javascript
this.pict.AppData.PostKard = {};
this.pict.views.PictFormMetacontroller.viewMarshalDestination = 'AppData.PostKard';
```

### Navigation Template

```json
{
  "Template": "<ul class=\"pure-menu-list\"><li class=\"pure-menu-item\"><a href=\"#\" onclick=\"{~P~}.views.PostcardMainApplication.render()\" class=\"pure-menu-link\">Send a Kard</a></li><li><a onclick=\"{~P~}.PictApplication.changeToPostcardTheme()\">Switch Theme</a></li></ul>"
}
```

### Dynamic Input Creation

```javascript
makeMoreInputs() {
  this.pict.AppData.CustomDescriptors.push({
    Hash: `CustomPostkardData${tmpIndex}`,
    Name: `Custom PostKard Data ${tmpIndex}`,
    DataType: 'PreciseNumber'
  });

  this.pict.parseTemplate(
    `{~IWVDA:MyDynamicView:AppData.CustomDescriptors[${tmpIndex}]~}`,
    data,
    (pError, pParsedTemplate) => {
      this.pict.ContentAssignment.appendContent('#DynamicInputContainer', pParsedTemplate);
    }
  );
}
```

## Form Manifest Structure

The postcard form includes sections for:
- **Postcard Content**: Recipient name, send date, message, signature
- **Delivery Destination**: Street address, city, state, zip
- **Sender Data**: Email, phone, marketing consent

```json
{
  "Sections": [
    {
      "Hash": "Postcard",
      "Name": "Postcard Information",
      "Groups": [
        { "Hash": "Content", "Name": "Content" },
        { "Hash": "Destination", "Name": "Delivery Destination" }
      ]
    },
    {
      "Hash": "Confirmation",
      "Name": "Delivery Confirmation Contact Info"
    }
  ]
}
```

## Running the Example

```bash
cd example_applications/postcard_example
npm install
npm run build
# Open html/index.html in a browser
```

## Key Concepts Illustrated

1. **Theme Architecture**: Complete visual customization via template sets
2. **Navigation Patterns**: Multi-view applications with shared state
3. **Async Operations**: Transaction-based async event handling
4. **Dynamic Forms**: Runtime descriptor and input creation
5. **Provider Composition**: Multiple providers working together
