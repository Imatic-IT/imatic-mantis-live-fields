<?php

class ImaticLiveFieldsPlugin extends MantisPlugin
{
    public function register()
    {
        $this->name = 'ImaticLiveFields';
        $this->description = 'Inline editing of fields on issue view page.';
        $this->page = 'config';
        $this->version = '0.0.1';
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
                'bug-additional-information' => [
                    'field' => 'additional_information',
                    'type' => 'textarea',
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
q
        if ($bug_id == null) {
            return;
        }

        $t_issue_readonly = bug_is_readonly( $bug_id );

        $canEdit = !$t_issue_readonly && access_has_bug_level( config_get( 'update_bug_threshold' ), $bug_id );

        if (!$canEdit) {
            return;
        }

        $config = $this->config();

        $configForJs = [
            'fields' => $config['inline_edit_components'] ?? [],
            'ajaxUpdatePage' => plugin_page('ajax_update_field.php')
        ];

        $jsonConfig = json_encode($configForJs, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);

        echo '<link rel="stylesheet" type="text/css" href="' . plugin_file('style.css') . '">
		<script id="imatic-inline-edit" data-inline-config=\'' . $jsonConfig . '\' type="text/javascript" src="' . plugin_file('index.js') . '"></script>';
    }
}
