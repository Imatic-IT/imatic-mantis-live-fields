<?php

namespace Service;

class BugNotificationService
{
    public function notify(array $before, array $after): void
    {
        $id = $before['id'];

        $resolved = config_get('bug_resolved_status_threshold');
        $closed   = config_get('bug_closed_status_threshold');

        if ($before['status'] < $resolved && $after['status'] >= $resolved && $after['status'] < $closed) {
            email_resolved($id);
            email_relationship_child_resolved($id);
            return;
        }

        if ($before['status'] < $closed && $after['status'] >= $closed) {
            email_close($id);
            email_relationship_child_closed($id);
            return;
        }

        if ($before['status'] >= $resolved && $after['status'] <= config_get('bug_reopen_status')) {
            email_bug_reopened($id);
            return;
        }

        if ($before['handler_id'] != $after['handler_id']) {
            email_owner_changed($id, $before['handler_id'], $after['handler_id']);
            return;
        }

        if ($before['status'] != $after['status']) {
            $label = \MantisEnum::getLabel(config_get('status_enum_string'), $after['status']);
            $label = str_replace(' ', '_', $label);
            email_bug_status_changed($id, $label);
            return;
        }

        email_bug_updated($id);
    }

}