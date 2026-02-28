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
                'bug-priority' => [
                    'field' => 'priority',
                    'type' => 'select',
                ],
                'bug-custom-field' => [
                    [
                        'field_id' => 2, // PROD id 2 dev 8
                        'field' => 'bug-custom-field',
                        'title' => 'plánováno',
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
            'priorities' => $this->getPriorities(),
        ];

        $jsonConfig = json_encode($configForJs, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);

        echo '<link rel="stylesheet" type="text/css" href="' . plugin_file('style.css') . '">
		<script id="imatic-inline-edit" data-inline-config=\'' . $jsonConfig . '\' type="text/javascript" src="' . plugin_file('index.js') . '"></script>';
    }

    private function getPriorities(){
        $priorities = MantisEnum::getAssocArrayIndexedByValues(config_get('priority_enum_string'));

        foreach ($priorities as $key => $priority) {
            $priorities[$key] =  get_enum_element('priority', $key );
        }
        return $priorities;
    }

    function getFieldValues($bug_id, $config)
    {
        $bug = bug_get_row($bug_id, true);
        $bug_text = bug_text_cache_row( $bug_id );
        $bug = array_merge($bug, $bug_text);

        $fields = $config['inline_edit_components'];

        foreach ($fields as $key => &$field) {

            switch ($field['field']) {
                case 'description':
                    $field['value'] = $bug['description'];
                    break;
                case 'summary':
                    $field['value'] = $bug['summary'];
                    break;
                case 'additional_information':
                    $field['value'] = $bug['additional_information'];
                    break;
                case 'bug-custom-field':
                    $fieldId = $field['field_id'];
                    $field['value'] = custom_field_get_value($fieldId, $bug_id);
                    break;
                case 'bug-status':
                    $fieldId = $field['status'];
                    $field['value'] = $bug['status'];
                    break;
            }
        }

        return $fields;
    }

}
