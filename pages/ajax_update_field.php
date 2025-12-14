<?php

header('Content-Type: application/json');

plugin_require_api('core/functions.php');
require_api('authentication_api.php');
auth_ensure_user_authenticated();
require_api('bug_api.php');
require_api('custom_field_api.php');

require_once __DIR__ . '/../app/bootstrap.php';

use Handler\UpdateBugFieldHandler;

$handler = new UpdateBugFieldHandler();

echo json_encode($handler->run());