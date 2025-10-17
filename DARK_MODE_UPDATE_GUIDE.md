# Quick Dark Mode Update Guide

## Common Pattern Replacements

Use find & replace in your IDE to quickly add dark mode support to all pages:

### Background Classes
```
Find: class="bg-gray-50"
Replace: class="bg-gray-50 dark:bg-gray-900"

Find: class="bg-white"
Replace: class="bg-white dark:bg-gray-800"

Find: class="bg-gray-100"
Replace: class="bg-gray-100 dark:bg-gray-700"
```

### Text Classes
```
Find: class="text-gray-900"
Replace: class="text-gray-900 dark:text-gray-100"

Find: class="text-gray-600"
Replace: class="text-gray-600 dark:text-gray-300"

Find: class="text-gray-500"
Replace: class="text-gray-500 dark:text-gray-400"

Find: class="text-gray-700"
Replace: class="text-gray-700 dark:text-gray-200"
```

### Border Classes
```
Find: class="border-gray-200"
Replace: class="border-gray-200 dark:border-gray-700"

Find: class="border-gray-300"
Replace: class="border-gray-300 dark:border-gray-600"

Find: class="border-gray-100"
Replace: class="border-gray-100 dark:border-gray-700"
```

### Combined Classes (Use regex)
```
Regex: (class="[^"]*)(bg-white)([^"]*)
Replace: $1$2 dark:bg-gray-800$3

Regex: (class="[^"]*)(text-gray-900)([^"]*)
Replace: $1$2 dark:text-gray-100$3
```

## Quick Reference for Each Page Type

### Auth Pages (login, register)
- Update form backgrounds
- Update input fields
- Update button hover states
- Update link colors

### List Pages (tickets/index)
- Update table headers
- Update table rows
- Update hover states
- Update pagination

### Detail Pages (tickets/[id])
- Update card backgrounds
- Update section headers
- Update comment sections
- Update action buttons

### Admin Pages
- Update stats cards
- Update data tables
- Update charts (if applicable)
- Update filters/dropdowns
