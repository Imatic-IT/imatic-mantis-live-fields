<?php

namespace Handler;

use DTO\UpdateRequest;
use Factory\ResponseFactory;
use Parser\ValueParser;
use Service\BugNotificationService;
use Writer\BugFieldWriter;
use PHPUnit\Framework\InvalidArgumentException;

class UpdateBugFieldHandler
{

    private ValueParser $parser;
    private BugFieldWriter $writer;

    public function __construct()
    {
        $this->parser = new ValueParser();
        $this->writer = new BugFieldWriter();
    }

    public function run(): array
    {
        try {
            $req = new UpdateRequest($_POST);

            $req->validate();

            $parsed = $this->parser->parse($req);

            $result = $this->writer->write($req, $parsed);

            (new BugNotificationService())->notify(
                $result['before'],
                $result['after']
            );

            return ResponseFactory::success($req, $result);

        } catch (InvalidArgumentException $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}
