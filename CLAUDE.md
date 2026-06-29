# ImaticLiveFields

Mantis plugin for inline editing of issue fields directly on the issue view page — no page reload.

## Stack

- **Frontend:** React 19 + TypeScript, bundled via Webpack → `files/index.js` (lean entry) + lazily-loaded `*.chunk.js`
- **Backend:** PHP (Mantis plugin API), AJAX endpoint `pages/ajax_update_field.php`
- **Date picker:** flatpickr (Czech locale)
- **Editor:** @toast-ui/react-editor (markdown, used for change status notes)

## Code-splitting (performance)

The heavy editors (`CustomTextarea`, `CustomChangeStatus` → @toast-ui markdown editor;
`CustomDate` → flatpickr) are loaded via `React.lazy()` in `components/InlineField.tsx`,
so the ~940 KiB toast-ui bundle is **not** in the entry chunk. The entry `index.js`
is ~200 KiB; the heavy chunk downloads only when the user actually activates such a field.

Because Mantis serves plugin assets through `plugin_file.php?file=<plugin>/<file>`,
webpack's public path is set **at runtime** at the top of `src/index.tsx` by reading the
injected `<script id="imatic-inline-edit">` src and stripping `index.js…`. This makes
lazy chunks resolve to `plugin_file.php?file=ImaticLiveFields/<chunk>.chunk.js`.
`tsconfig.json` therefore uses `"module": "esnext"` (required for dynamic `import()`).

Stale `*.chunk.js` (content-hashed) accumulate in `files/` across builds — clean up
old ones periodically (do **not** enable webpack `output.clean`, it would also wipe
`style.css` / `status_modal.html`, which are not webpack outputs).

## Build

```bash
npm run build        # production
npm run build:dev    # development
npm run watch        # watch mode
```

## How it works

1. PHP hook `EVENT_LAYOUT_PAGE_FOOTER` in `ImaticLiveFields.php` injects `<script id="imatic-inline-edit" data-inline-config='...'>` into the page with a JSON config of fields + AJAX URL.
2. `src/index.tsx` reads the config via `getConfig()` (`utils/utils.ts`), iterates over TD elements by CSS class and mounts React components via `createRoot`.
3. Each field is activated by **cmd+click** (or ctrl+click) on the TD cell.
4. Changes are sent via AJAX POST to `ajax_update_field.php` → `UpdateBugFieldHandler`.

## Field types and their components

| type in config    | Component             | Description                                  |
|-------------------|-----------------------|----------------------------------------------|
| `date`            | `CustomDate`          | flatpickr datetime picker                    |
| `text`            | `CustomText`          | inline text input with markdown link support |
| `textarea`        | `CustomTextarea`      | toast-ui markdown editor                     |
| `select`          | `CustomSelect`        | native `<select>` for any enum/category field; options + current value supplied per-field from PHP (`field.options`, `field.value`) |
| `assign`          | `CustomAssign`        | clone of `select[name="handler_id"]` from DOM |
| `change_status`   | `CustomChangeStatus`  | status select + toast-ui editor for note     |

## Important implementation details

### Opening a select on cmd+click
A native `<select>` **cannot** be opened via `click()`. Use `showPicker()`:
```ts
(selectRef.current as any)?.showPicker?.();
```
Must be called inside `useLayoutEffect` (not `useEffect`) to preserve the user gesture activation window.

### CustomAssign
Does not use its own `<select>` in JSX. Clones the existing `select[name="handler_id"]` from Mantis DOM and appends it to a wrapper div. The entire effect runs in `useLayoutEffect` for the same reason.

### CustomDate
After initializing flatpickr, call `fpRef.current.open()` explicitly so the calendar opens immediately on activation.

### Config — custom field ID
`ImaticLiveFields.php` has a hardcoded `field_id` for the custom field "plánovanýTermín":
```php
'field_id' => 2, // PROD id 2, dev 8
```
Verify this ID when deploying to a different environment.

### Permissions
The plugin only renders editable fields if the user has `update_bug_threshold` access level and the issue is not readonly — checked in PHP before injecting the script.

## File structure

```
src/
  index.tsx              # entry point, mounts components into TD cells
  components/
    InlineField.tsx      # router — picks component based on field.type
    InlineHint.tsx       # wrapper showing "cmd+click to edit" hint
    InlineLoader.tsx     # loading spinner
    Actions.tsx          # Save/Cancel/Clear buttons
    MentionsToolbar.tsx  # @mention toolbar for the editor
  fields/
    CustomDate.tsx
    CustomText.tsx
    CustomTextarea.tsx
    CustomSelect.tsx
    CustomAssign.tsx
    CustomChangeStatus.tsx
  utils/
    ajaxUpdateField.ts   # sendAjaxUpdate() — POST to AJAX endpoint
    utils.ts             # getConfig, getSelectOptionsNew, getUsersForMention, ...
  types/
    types.ts

app/                     # PHP backend
  Handler/UpdateBugFieldHandler.php
  Writer/BugFieldWriter.php
  Parser/ValueParser.php
  Service/BugNotificationService.php
  DTO/UpdateRequest.php
  Factory/ResponseFactory.php
```
