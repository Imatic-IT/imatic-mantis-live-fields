<?php

namespace Writer;

use DTO\UpdateRequest;

class BugFieldWriter
{

    const BUGNOTE_VIEW_STATE_PRIVATE = 50;
    
    private array $longTextFields = [
        'description',
        'steps_to_reproduce',
        'additional_information'
    ];

    private array $before = [];

    public function getBefore(): array
    {
        return $this->before;
    }

    public function getAfter(): array
    {
        return bug_get_row($this->before['id']);
    }

    public function write(UpdateRequest $req, $value): array
    {
        $before = bug_get_row($req->bugId);

        if ($req->customFieldId) {
            $this->writeCustomField($req->customFieldId, $req->bugId, $value);
        } elseif (in_array($req->field, $this->longTextFields, true)) {
            update_long_text_field($req->bugId, $req->field, $value);
        } elseif ($req->type === BUG_UPDATE_TYPE_ASSIGN) {
            $this->assignBug($req->bugId, (int)$value);
        } elseif ($req->type === BUG_UPDATE_TYPE_CHANGE_STATUS) {
            $this->changeStatus($req->bugId, $req->value);

            if (!is_blank($req->bugnote)) {
                $p_bugnote_private = $req->bugnoteViewState == self::BUGNOTE_VIEW_STATE_PRIVATE;
                $t_bugnote_id = bugnote_add($req->bugId, $req->bugnote, 0, $p_bugnote_private, 0, '', null, false);
                bugnote_process_mentions($req->bugId, $t_bugnote_id, $req->bugnote);
            }
        } else {
            bug_set_field($req->bugId, $req->field, $value);
        }

        $after = bug_get_row($req->bugId);

        return [
            'before' => $before,
            'after' => $after,
        ];
    }

    private function writeCustomField(int $id, int $bugId, $value): void
    {
        custom_field_set_value($id, $bugId, $value);
    }

    private function changeStatus(string $bugId, string $value): void
    {
        bug_set_field($bugId, 'status', $value);
    }

    private function assignBug(int $bugId, int $handlerId): void
    {
        bug_set_field($bugId, 'handler_id', $handlerId);
    }
}



# Validate any change to the handler of an issue.
# The new handler is checked at project level.
//        if ($t_existing_bug->handler_id != $t_updated_bug->handler_id) {
//            $t_issue_is_sponsored = config_get('enable_sponsorship')
//                && sponsorship_get_amount(sponsorship_get_all_ids($f_bug_id)) > 0;
//            access_ensure_bug_level(config_get('update_bug_assign_threshold'), $f_bug_id);
//            if ($t_issue_is_sponsored && !access_has_project_level(config_get('handle_sponsored_bugs_threshold'), $t_updated_bug->project_id, $t_updated_bug->handler_id)) {
//                trigger_error(ERROR_SPONSORSHIP_HANDLER_ACCESS_LEVEL_TOO_LOW, ERROR);
//            }
//            if ($t_updated_bug->handler_id != NO_USER) {
//                if (!access_has_project_level(config_get('handle_bug_threshold'), $t_updated_bug->project_id, $t_updated_bug->handler_id)) {
//                    trigger_error(ERROR_HANDLER_ACCESS_TOO_LOW, ERROR);
//                }
//                if ($t_issue_is_sponsored && !access_has_bug_level(config_get('assign_sponsored_bugs_threshold'), $f_bug_id)) {
//                    trigger_error(ERROR_SPONSORSHIP_ASSIGNER_ACCESS_LEVEL_TOO_LOW, ERROR);
//                }
//            }
//        }

//$t_resolved_status = config_get( 'bug_resolved_status_threshold' );
//$t_closed_status = config_get( 'bug_closed_status_threshold' );
//$t_reopen_resolution = config_get( 'bug_reopen_resolution' );
//$t_resolve_issue = false;
//$t_close_issue = false;
//$t_reopen_issue = false;
//if( $t_existing_bug->status < $t_resolved_status &&
//$t_updated_bug->status >= $t_resolved_status &&
//$t_updated_bug->status < $t_closed_status
//) {
//$t_resolve_issue = true;
//} else if( $t_existing_bug->status < $t_closed_status &&
//    $t_updated_bug->status >= $t_closed_status
//) {
//    $t_close_issue = true;
//} else if( $t_existing_bug->status >= $t_resolved_status &&
//    $t_updated_bug->status <= config_get( 'bug_reopen_status' )
//) {
//    $t_reopen_issue = true;
//}


# Send a notification of changes via email.
//if( $t_resolve_issue ) {
//email_resolved( $f_bug_id );
//email_relationship_child_resolved( $f_bug_id );
//} else if( $t_close_issue ) {
//    email_close( $f_bug_id );
//    email_relationship_child_closed( $f_bug_id );
//} else if( $t_reopen_issue ) {
//    email_bug_reopened( $f_bug_id );
//} else if( $t_existing_bug->handler_id != $t_updated_bug->handler_id ) {
//    email_owner_changed( $f_bug_id, $t_existing_bug->handler_id, $t_updated_bug->handler_id );
//} else if( $t_existing_bug->status != $t_updated_bug->status ) {
//    $t_new_status_label = MantisEnum::getLabel( config_get( 'status_enum_string' ), $t_updated_bug->status );
//    $t_new_status_label = str_replace( ' ', '_', $t_new_status_label );
//    email_bug_status_changed( $f_bug_id, $t_new_status_label );
//} else {
//    email_bug_updated( $f_bug_id );
//}


//# Validate any change to the handler of an issue.
//# The new handler is checked at project level.
//if( $t_existing_bug->handler_id != $t_updated_bug->handler_id ) {
//    $t_issue_is_sponsored = config_get( 'enable_sponsorship' )
//        && sponsorship_get_amount( sponsorship_get_all_ids( $f_bug_id ) ) > 0;
//    access_ensure_bug_level( config_get( 'update_bug_assign_threshold' ), $f_bug_id );
//    if( $t_issue_is_sponsored && !access_has_project_level( config_get( 'handle_sponsored_bugs_threshold' ),  $t_updated_bug->project_id, $t_updated_bug->handler_id ) ) {
//        trigger_error( ERROR_SPONSORSHIP_HANDLER_ACCESS_LEVEL_TOO_LOW, ERROR );
//    }
//    if( $t_updated_bug->handler_id != NO_USER ) {
//        if( !access_has_project_level( config_get( 'handle_bug_threshold' ),  $t_updated_bug->project_id, $t_updated_bug->handler_id ) ) {
//            trigger_error( ERROR_HANDLER_ACCESS_TOO_LOW, ERROR );
//        }
//        if( $t_issue_is_sponsored && !access_has_bug_level( config_get( 'assign_sponsored_bugs_threshold' ), $f_bug_id ) ) {
//            trigger_error( ERROR_SPONSORSHIP_ASSIGNER_ACCESS_LEVEL_TOO_LOW, ERROR );
//        }
//    }
//}
