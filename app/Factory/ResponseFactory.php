<?php

namespace Factory;

use DTO\UpdateRequest;

class ResponseFactory
{
    public static function success(UpdateRequest $req, $result): array
    {
        return [
            'success' => true,
            'bug_id' => $req->bugId,
            'field' => $req->field,
            'overdue_level' => bug_overdue_level($req->bugId),
            'html' => self::renderFieldHtml($req, $result),
        ];
    }

    public static function error(\Throwable $e): array
    {
        return [
            'success' => false,
            'error' => $e->getMessage(),
        ];
    }

    /**
     * TODO FOR CREATE BUGNOTE RENDERING USE TEMPLATES
     */
    private static function renderFieldHtml(UpdateRequest $req, $result): string
    {
        $afterValue = htmlspecialchars($result->after['value'] ?? '');
        $fieldName = htmlspecialchars($req->field);

        return <<<HTML
<div class="inline-field-update">
    <strong>{$fieldName}:</strong>
    <span>{$afterValue}</span>
</div>
HTML;
    }
}
