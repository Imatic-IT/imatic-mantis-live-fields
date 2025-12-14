<?php

namespace Parser;

use DTO\UpdateRequest;

class ValueParser
{

    public function parse(UpdateRequest $req)
    {
        if ($req->type !== 'date') {
            return $req->value;
        }

        $raw = trim((string)$req->value);

        if ($raw === '') {
            return $req->customFieldId ? '' : 1;
        }

        return $this->parseDate($raw);
    }

    private function parseDate(string $raw): int
    {
        $ts = ctype_digit($raw) ? (int)$raw : strtotime($raw);
        if (!$ts) throw new InvalidArgumentException('invalid date');
        return $ts;
    }
}

