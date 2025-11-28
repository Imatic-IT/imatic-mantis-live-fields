<?php

header('Content-Type: application/json');

plugin_require_api('core/functions.php');


require_api('authentication_api.php');
auth_ensure_user_authenticated();
require_api('bug_api.php');
require_api('custom_field_api.php');


$bugId = (int)($_POST['bug_id'] ?? 0);
$field = $_POST['field'] ?? null;
$value = $_POST['value'] ?? null;
$type = $_POST['type'] ?? null;

if (!$bugId || !$field || !isset($value)) {
    echo json_encode(['success' => false, 'error' => 'missing parameters']);
    exit;
}

function parseDateToTimestamp(string $input): int
{
    $raw = trim($input);
    $ts = ctype_digit($raw) ? (int)$raw : strtotime($raw);
    if (!$ts) throw new \InvalidArgumentException('invalid date');
    return $ts;
}

try {
    $isDate = $type === 'date';
    $isCustom = isset($_POST['custom_field_id']);
    $valueToWrite = $value;

    if ($isDate) {
        $raw = trim($value);
        if ($raw === '') {
            $valueToWrite = $isCustom ? '' : 1;
        } else {
            $valueToWrite = parseDateToTimestamp($raw);
        }
    }

    if ($isCustom) {
        $id = (int)$_POST['custom_field_id'];
        custom_field_set_value($id, $bugId, $valueToWrite);
    } else {
        $textFields = ['description', 'steps_to_reproduce', 'additional_information'];
        if (in_array($field, $textFields, true)) {
            update_long_text_field($bugId, $field, $valueToWrite);
        } else {
            bug_set_field($bugId, $field, $valueToWrite);
        }
    }

} catch (\InvalidArgumentException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

echo json_encode([
    'success' => true,
    'bug_id' => $bugId,
    'field' => $field,
    'overdue_level' => bug_overdue_level($bugId),
]);












//
//require_api('authentication_api.php');
//auth_ensure_user_authenticated();
//require_api('bug_api.php');
//
//// TODO - REMOVE TESTING CODE
//if ($_SERVER['REQUEST_METHOD'] === 'GET') {
//    $_POST['bug_id'] = '0000449';
////    $_POST['field']  = 'due_date';
//    $_POST['field'] = 'bug-custom-field';
//    $_POST['value'] = '2025-11-28 10:00';
//    $_POST['custom_field_id'] = 8;
//}
//
//if (!isset($_POST['bug_id'], $_POST['field'], $_POST['value'])) {
//    echo json_encode(['error' => 'Missing parameters']);
//    exit;
//}
//
//$bugId = (int)$_POST['bug_id'];
//$field = $_POST['field'];
//$value = $_POST['value'];
//
//if ($field === 'bug-custom-field') {
//    $raw = $_POST['value'] ?? '';
//
//    $ts = ctype_digit($raw) ? (int)$raw : strtotime($raw);
//    if (!$ts) {
//        echo json_encode(['success' => false, 'error' => 'invalid date']);
//        exit;
//    }
//
//    custom_field_set_value((int)$_POST['custom_field_id'], $bugId, $ts);
//}
//
//if ($field === 'due_date') {
//    $timestamp = strtotime($value);
//    if (!$timestamp) {
//        echo json_encode(['error' => 'Invalid date format']);
//        exit;
//    }
//    bug_set_field($bugId, 'due_date', $timestamp);
//}
//
//$t_level = bug_overdue_level($bugId);
//
//
//echo json_encode([
//    'success' => true,
//    'bug_id' => $bugId,
//    'field' => $field,
//    'value' => $value,
//    'overdue_level' => $t_level,
//]);