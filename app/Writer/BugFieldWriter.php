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