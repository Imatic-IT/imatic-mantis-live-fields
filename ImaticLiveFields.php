<?php

class ImaticLiveFieldsPlugin extends MantisPlugin
{
    public function register()
    {
        $this->name = 'ImaticLiveFields';
        $this->description = 'Inline editing of fields on issue view page.';
        $this->page = 'config';
        $this->version = '0.1.0';
        $this->requires = array('MantisCore' => '2.0.0');
        $this->author = 'Imatic Software s.r.o.';
        $this->contact = 'info@imatic.cz';
        $this->url = 'http://www.imatic.cz';
    }

    public function config(): array
    {
        return [
            'inline_edit_components' => [
                'bug-due-date' => [
                    'field' => 'due_date',
                    'type' => 'date'
                ],
                'bug-description' => [
                    'field' => 'description',
                    'type' => 'textarea',
                ],
                'bug-summary' => [
                    'field' => 'summary',
                    'type' => 'text',
                ],
                'bug-additional-information' => [
                    'field' => 'additional_information',
                    'type' => 'textarea',
                ],
                'bug-assigned-to' => [
                    'field' => 'bug-assigned-to',
                    'type' => BUG_UPDATE_TYPE_ASSIGN,
                ],
                'bug-status' => [
                    'field' => 'bug-status',
                    'type' => BUG_UPDATE_TYPE_CHANGE_STATUS,
                ],
                // Enum select fields — options are built from the matching
                // Mantis enum string (see getEnumOptions()).
                'bug-priority' => [
                    'field' => 'priority',
                    'type' => 'select',
                    'enum' => 'priority',
                ],
                'bug-severity' => [
                    'field' => 'severity',
                    'type' => 'select',
                    'enum' => 'severity',
                ],
                'bug-reproducibility' => [
                    'field' => 'reproducibility',
                    'type' => 'select',
                    'enum' => 'reproducibility',
                ],
                'bug-view-status' => [
                    'field' => 'view_state',
                    'type' => 'select',
                    'enum' => 'view_state',
                ],
                'bug-projection' => [
                    'field' => 'projection',
                    'type' => 'select',
                    'enum' => 'projection',
                ],
                'bug-eta' => [
                    'field' => 'eta',
                    'type' => 'select',
                    'enum' => 'eta',
                ],
                // Category — options come from the project's category list.
                'bug-category' => [
                    'field' => 'category_id',
                    'type' => 'select',
                    'source' => 'category',
                ],
                'bug-custom-field' => [
                    [
                        'field_id' => 2, // PROD id 2 dev 8
                        'field' => 'bug-custom-field',
                        'title' => 'plánovanýTermín',
                        'type' => 'date'
                    ]
                ]
            ],
        ];
    }

    function hooks()
    {
        return array(
            "EVENT_LAYOUT_PAGE_FOOTER" => 'eventLayoutPageFooter',
        );
    }

    function eventLayoutPageFooter()
    {
        $bug_id = gpc_get_int('id', null);

        if ($bug_id == null) {
            return;
        }

        $t_issue_readonly = bug_is_readonly($bug_id);

        $canEdit = !$t_issue_readonly && access_has_bug_level(config_get('update_bug_threshold'), $bug_id);

        if (!$canEdit) {
            return;
        }

        $config = $this->config();

        $fields = $this->getFieldValues($bug_id, $config);

        $configForJs = [
            'fields' => $fields,
            'ajaxUpdatePage' => plugin_page('ajax_update_field.php'),
        ];

        $jsonConfig = json_encode($configForJs, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);

        echo '<link rel="stylesheet" type="text/css" href="' . $this->assetUrl('style.css') . '">
		<script id="imatic-inline-edit" data-inline-config=\'' . $jsonConfig . '\' type="text/javascript" src="' . $this->assetUrl('index.js') . '"></script>';
    }

    /**
     * Build a plugin asset URL with a cache-busting version based on the file's
     * modification time, so a new build is picked up immediately instead of
     * being served from the browser cache for the plugin_file max-age window.
     */
    private function assetUrl(string $file): string
    {
        $url = plugin_file($file);
        $path = plugin_file_path($file, plugin_get_current());
        $version = $path !== false ? filemtime($path) : $this->version;
        $separator = strpos($url, '?') !== false ? '&' : '?';

        return $url . $separator . 'v=' . $version;
    }

    /**
     * Build the option list ({value, label}) for a Mantis enum field
     * (priority, severity, reproducibility, view_state, projection, eta, ...).
     */
    private function getEnumOptions(string $enumName): array
    {
        $assoc = MantisEnum::getAssocArrayIndexedByValues(config_get($enumName . '_enum_string'));

        $options = [];
        foreach ($assoc as $value => $label) {
            $options[] = [
                'value' => (string)$value,
                'label' => get_enum_element($enumName, $value),
            ];
        }
        return $options;
    }

    /**
     * Build the option list ({value, label}) for the category field of a
     * project, including inherited categories.
     */
    private function getCategoryOptions(int $projectId): array
    {
        $options = [];
        foreach (category_get_all_rows($projectId) as $row) {
            $options[] = [
                'value' => (string)$row['id'],
                'label' => $row['name'],
            ];
        }
        return $options;
    }

    function getFieldValues($bug_id, $config)
    {
        $bug = bug_get_row($bug_id, true);
        $bug_text = bug_text_cache_row( $bug_id );
        $bug = array_merge($bug, $bug_text);

        $fields = $config['inline_edit_components'];

        foreach ($fields as $key => &$field) {

            // Custom fields are configured as a list of field definitions; the
            // value is loaded per field id (date values are formatted to match
            // the inline flatpickr format).
            if ($key === 'bug-custom-field') {
                foreach ($field as &$customField) {
                    $rawValue = isset($customField['field_id'])
                        ? custom_field_get_value($customField['field_id'], $bug_id)
                        : false;

                    if (($customField['type'] ?? null) === 'date') {
                        $customField['value'] = ($rawValue && !date_is_null((int)$rawValue))
                            ? date('Y-m-d H:i', (int)$rawValue)
                            : '';
                    } else {
                        $customField['value'] = $rawValue !== false ? (string)$rawValue : '';
                    }
                }
                unset($customField);
                continue;
            }

            // Enum select fields — attach options + the current value.
            if (isset($field['enum'])) {
                $field['options'] = $this->getEnumOptions($field['enum']);
                $field['value'] = isset($bug[$field['field']]) ? (string)$bug[$field['field']] : '';
                continue;
            }

            // Category select — options from the project category list.
            if (($field['source'] ?? null) === 'category') {
                $field['options'] = $this->getCategoryOptions((int)$bug['project_id']);
                $field['value'] = (string)$bug['category_id'];
                continue;
            }

            switch ($field['field'] ?? null) {
                case 'due_date':
                    // Formatted to match the inline flatpickr format (Y-m-d H:i).
                    $field['value'] = !date_is_null($bug['due_date'])
                        ? date('Y-m-d H:i', $bug['due_date'])
                        : '';
                    break;
                case 'bug-status':
                    // The status cell is rendered by React from these values;
                    // 'value' drives the status colour class, 'label' the text.
                    $field['value'] = (string)$bug['status'];
                    $field['label'] = get_enum_element('status', (int)$bug['status']);
                    break;
                case 'description':
                    $field['value'] = $bug['description'];
                    break;
                case 'summary':
                    $field['value'] = $bug['summary'];
                    break;
                case 'additional_information':
                    $field['value'] = $bug['additional_information'];
                    break;
            }
        }
        unset($field);

        return $fields;
    }

}
