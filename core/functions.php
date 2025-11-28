<?php
function update_long_text_field(int $bugId, string $field, string $value): bool {
    $allowedFields = ['description', 'steps_to_reproduce', 'additional_information'];
    if (!in_array($field, $allowedFields, true)) {
        throw new \InvalidArgumentException('Unsupported long text field: ' . $field);
    }

    $t_query = 'SELECT bug_text_id FROM {bug} WHERE id=' . db_param();
    $t_result = db_query($t_query, [$bugId]);
    $t_row = db_fetch_array($t_result);
    $bugTextId = $t_row['bug_text_id'] ?? null;

    if (!$bugTextId) {
        throw new \RuntimeException('Bug text ID not found for bug ' . $bugId);
    }

    $t_query = 'UPDATE {bug_text} SET ' . $field . '=' . db_param() . ' WHERE id=' . db_param();
    db_query($t_query, [$value, $bugTextId]);

    history_log_event_direct($bugId, $field, '', $value);

    bug_clear_cache($bugId);

    return true;
}
