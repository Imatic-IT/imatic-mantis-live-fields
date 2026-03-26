# ImaticLiveFields

Mantis plugin for inline editing of issue fields directly on the issue view page — no page reload required.

Activate any field by pressing **Cmd+Click** (Mac) or **Ctrl+Click** (Windows/Linux) on the field value.

## Installation

1. Copy the `ImaticLiveFields` folder to your Mantis `plugins/` directory.
2. Go to **Manage → Plugins** and install **ImaticLiveFields**.
3. Run `npm install && npm run build` inside the plugin directory.

---

## Adding a new editable field

All editable fields are configured in `ImaticLiveFields.php` inside the `config()` method, under the `inline_edit_components` key.

The **array key** must match the **CSS class of the TD cell** on the issue view page (inspect the Mantis HTML to find it).

### Standard fields

```php
public function config(): array
{
    return [
        'inline_edit_components' => [

            // Text input (single line)
            'bug-summary' => [
                'field' => 'summary',
                'type'  => 'text',
            ],

            // Textarea with markdown editor
            'bug-description' => [
                'field' => 'description',
                'type'  => 'textarea',
            ],

            // Date/time picker
            'bug-due-date' => [
                'field' => 'due_date',
                'type'  => 'date',
            ],

            // Dropdown — assigned to (clones the handler_id select from DOM)
            'bug-assigned-to' => [
                'field' => 'bug-assigned-to',
                'type'  => 'assign',
            ],

            // Dropdown — issue status + optional note
            'bug-status' => [
                'field' => 'bug-status',
                'type'  => 'change_status',
            ],

            // Dropdown — priority (values loaded from Mantis priority enum)
            'bug-priority' => [
                'field' => 'priority',
                'type'  => 'select',
            ],

        ],
    ];
}
```

### Available field types

| `type`          | Editor rendered        | Use for                              |
|-----------------|------------------------|--------------------------------------|
| `text`          | Single-line input      | Summary, short text fields           |
| `textarea`      | Markdown editor        | Description, notes, long text        |
| `date`          | Date/time picker       | Due date, any datetime field         |
| `select`        | Native dropdown        | Priority or other enum fields        |
| `assign`        | Native dropdown        | Assigned-to (handler)                |
| `change_status` | Status dropdown + note | Issue status with optional bugnote   |

---

## Adding a custom field

Custom fields require two extra keys: `field_id` and `title`.

- **`field_id`** — the numeric ID of the custom field in Mantis (find it under **Manage → Custom Fields**). This ID can differ between environments (dev vs. prod), so double-check it.
- **`title`** — must **exactly match** the custom field label as it appears in the Mantis issue table header (case-sensitive, including diacritics).

```php
'bug-custom-field' => [
    [
        'field_id' => 2,               // check this ID per environment!
        'field'    => 'bug-custom-field',
        'title'    => 'plánovanýTermín', // must match the TH text in the issue table exactly
        'type'     => 'date',
    ],
],
```

Multiple custom fields on the same CSS class (`bug-custom-field`) are supported — wrap them in an array and each entry is matched by its `title` against the corresponding `<th>` header in the row.

> **Note:** If the title does not match exactly (including accented characters and capitalisation), the field will silently not render.

---

## How the matching works

For regular fields, the TD's CSS class is matched directly to the config key:

```
<td class="bug-summary"> → 'bug-summary' config entry
```

For custom fields, the TD shares the class `bug-custom-field`. The plugin additionally checks the `<th>` header in the same row:

```
<th class="bug-custom-field category">plánovanýTermín</th>
<td class="bug-custom-field"> ← this cell gets the editor
```

The `title` value in config must equal `th.textContent.trim()` (case-sensitive).
