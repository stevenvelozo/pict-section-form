# AutofillTriggerGroup Input Provider

The AutofillTriggerGroup provider listens for trigger group events and
auto-fills input values based on address references, with support for
pre/post-trigger solvers.

## Provider Information

| Property | Value |
|----------|-------|
| Provider Hash | `Pict-Input-AutofillTriggerGroup` |
| Input Type | Any (provider-based) |
| Supports Tabular | Yes |

## Basic Usage

```json
{
  "Customer.Name": {
    "Name": "Customer Name",
    "Hash": "CustomerName",
    "DataType": "String",
    "PictForm": {
      "Section": "Order",
      "Providers": ["Pict-Input-AutofillTriggerGroup"],
      "AutofillTriggerGroup": {
        "TriggerGroupHash": "CustomerSelected",
        "TriggerAddress": "AppData.CurrentCustomer.Name"
      }
    }
  }
}
```

## Configuration Options

### AutofillTriggerGroup Object

Can be a single object or array of objects:

```json
"AutofillTriggerGroup": {
  "TriggerGroupHash": "GroupName",
  "TriggerAddress": "AppData.Path.To.Value",
  "MarshalEmptyValues": true,
  "SelectOptionsRefresh": false,
  "PreSolvers": [],
  "PostSolvers": [],
  "TriggerAllInputs": false
}
```

### Configuration Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `TriggerGroupHash` | string | - | Trigger group to listen for |
| `TriggerAddress` | string | - | AppData address to read value from |
| `MarshalEmptyValues` | boolean | false | Fill even if source is empty |
| `SelectOptionsRefresh` | boolean | false | Rebuild picklist after fill |
| `PreSolvers` | array | [] | Solvers to run before autofill |
| `PostSolvers` | array | [] | Solvers to run after autofill |
| `TriggerAllInputs` | boolean | false | Fire trigger on value change |

## Lifecycle Hooks

### onDataChange

If `TriggerAllInputs` is true, fires the TriggerGroup event when this
input's value changes.

### onAfterEventCompletion

Listens for configured trigger group events and:
1. Runs PreSolvers
2. Gets value from TriggerAddress
3. Sets input value
4. Marshals to form
5. Optionally refreshes select options
6. Runs PostSolvers

## Example: Coordinated Form Fill

```json
{
  "Descriptors": {
    "Customer.Select": {
      "Name": "Select Customer",
      "Hash": "CustomerID",
      "DataType": "String",
      "PictForm": {
        "Section": "Order",
        "InputType": "Select",
        "SelectOptionsPickList": "CustomerList",
        "Providers": ["Pict-Input-Select", "Pict-Input-EntityBundleRequest"],
        "EntitiesBundle": [{
          "Entity": "Customer",
          "Filter": "FBV~IDCustomer~EQ~{~D:Record.Value~}",
          "Destination": "AppData.CurrentCustomer",
          "SingleRecord": true
        }],
        "EntityBundleTriggerGroup": "CustomerLoaded"
      }
    },
    "Order.CustomerName": {
      "Name": "Customer Name",
      "Hash": "CustomerName",
      "DataType": "String",
      "PictForm": {
        "Section": "Order",
        "Providers": ["Pict-Input-AutofillTriggerGroup"],
        "AutofillTriggerGroup": {
          "TriggerGroupHash": "CustomerLoaded",
          "TriggerAddress": "AppData.CurrentCustomer.Name"
        }
      }
    },
    "Order.CustomerEmail": {
      "Name": "Email",
      "Hash": "CustomerEmail",
      "DataType": "String",
      "PictForm": {
        "Section": "Order",
        "Providers": ["Pict-Input-AutofillTriggerGroup"],
        "AutofillTriggerGroup": {
          "TriggerGroupHash": "CustomerLoaded",
          "TriggerAddress": "AppData.CurrentCustomer.Email"
        }
      }
    },
    "Order.CustomerPhone": {
      "Name": "Phone",
      "Hash": "CustomerPhone",
      "DataType": "String",
      "PictForm": {
        "Section": "Order",
        "Providers": ["Pict-Input-AutofillTriggerGroup"],
        "AutofillTriggerGroup": {
          "TriggerGroupHash": "CustomerLoaded",
          "TriggerAddress": "AppData.CurrentCustomer.Phone"
        }
      }
    }
  }
}
```

## Pre/Post Solvers

Run calculations before or after autofill:

```json
"AutofillTriggerGroup": {
  "TriggerGroupHash": "DataLoaded",
  "TriggerAddress": "AppData.BasePrice",
  "PreSolvers": [
    "NumItems = getvalue('AppData.Items.length')"
  ],
  "PostSolvers": [
    "runSolvers()",
    "TotalPrice = BasePrice * NumItems"
  ]
}
```

## Select Options Refresh

Refresh a picklist after trigger:

```json
{
  "State.Select": {
    "Name": "State",
    "Hash": "StateID",
    "DataType": "String",
    "PictForm": {
      "InputType": "Select",
      "SelectOptionsPickList": "StateList",
      "Providers": ["Pict-Input-Select", "Pict-Input-AutofillTriggerGroup"],
      "AutofillTriggerGroup": {
        "TriggerGroupHash": "CountryChanged",
        "SelectOptionsRefresh": true
      }
    }
  }
}
```

## Multiple Trigger Groups

Listen to multiple triggers:

```json
"AutofillTriggerGroup": [
  {
    "TriggerGroupHash": "CustomerLoaded",
    "TriggerAddress": "AppData.Customer.DefaultShipping"
  },
  {
    "TriggerGroupHash": "AddressSelected",
    "TriggerAddress": "AppData.SelectedAddress.Street"
  }
]
```

## Bidirectional Triggers

Create inputs that both trigger and respond:

```json
{
  "Quantity": {
    "PictForm": {
      "Providers": ["Pict-Input-AutofillTriggerGroup"],
      "AutofillTriggerGroup": {
        "TriggerGroupHash": "LineItemUpdated",
        "TriggerAllInputs": true
      }
    }
  }
}
```

## Tabular Usage

```json
{
  "ReferenceManifests": {
    "LineItem": {
      "Descriptors": {
        "ProductName": {
          "Name": "Product",
          "Hash": "ProductName",
          "DataType": "String",
          "PictForm": {
            "Providers": ["Pict-Input-AutofillTriggerGroup"],
            "AutofillTriggerGroup": {
              "TriggerGroupHash": "ProductSelected",
              "TriggerAddress": "AppData.TempProduct.Name"
            }
          }
        }
      }
    }
  }
}
```

## How Trigger Groups Work

1. **Event Source**: EntityBundleRequest or other provider fires trigger
2. **Event Name**: `TriggerGroup:{TriggerGroupHash}`
3. **Listeners**: AutofillTriggerGroup inputs with matching hash respond
4. **Action**: Each listener reads from its TriggerAddress and updates

```
[Select Change] → [EntityBundleRequest fetches] → [Fires TriggerGroup]
                                                         ↓
[AutofillTriggerGroup A] ← reads from Address A ←──────────
[AutofillTriggerGroup B] ← reads from Address B ←──────────
[AutofillTriggerGroup C] ← reads from Address C ←──────────
```

## Notes

- Trigger groups enable loose coupling between inputs
- Order of autofill is not guaranteed; use PreSolvers for dependencies
- Empty values are skipped unless MarshalEmptyValues is true
- Can be combined with any other input type

## Related Documentation

- [EntityBundleRequest Provider](010-entity-bundle-request.md) - Trigger source
- [Templated Provider](007-templated.md) - Also responds to triggers
- [Select Provider](001-select.md) - Common pairing
