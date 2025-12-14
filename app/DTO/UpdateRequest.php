<?php

namespace DTO;

use http\Exception\InvalidArgumentException;

class UpdateRequest
{
    public int $bugId;
    public string $field;
    public $value;
    public ?string $type;
    public ?int $customFieldId;
    public ?string $bugnote;
    public ?string $bugnoteViewState;


    public function __construct(array $data)
    {
        $this->bugId = (int)($data['bug_id'] ?? 0);
        $this->field = $data['field'] ?? '';
        $this->value = $data['value'] ?? null;
        $this->type = $data['type'] ?? null;
        $this->customFieldId = isset($data['custom_field_id']) ? (int)$data['custom_field_id'] : null;
        $this->bugnote = isset($data['bugnote']) ? $data['bugnote'] : null;
        $this->bugnoteViewState = isset($data['bugnote_view_state']) ? $data['bugnote_view_state'] : null;
    }

    public function validate(): void
    {
        if (!$this->bugId || !$this->field || !isset($this->value)) {
            throw new InvalidArgumentException('missing parameters');
        }
    }
}