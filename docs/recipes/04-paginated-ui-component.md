# Recipe 4: Paginated UI Component with Feature Flags

## Use Case
Generate an HTML snippet for a list of items that is paginated and where certain details are hidden behind a feature flag.

## Key Features Combined
This recipe demonstrates how multiple standard features combine to create a sophisticated result:
- **Array Slicing (`{offset,limit}`):** Selects only the items for the current page.
- **Conditionals (`<?...?>`):** Checks a feature flag (`show_admin_details`) to conditionally render extra information for each item.
- **Modern Iteration Variables (`.length`):** Used to display the total number of items for the pagination status text.
