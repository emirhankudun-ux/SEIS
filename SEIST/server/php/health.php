<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$healthPath = __DIR__ . '/../health.json';

if (is_readable($healthPath)) {
    readfile($healthPath);
    exit;
}

echo json_encode([
    'ok' => true,
    'name' => 'seis-static',
    'source' => 'php-health',
    'releaseReadable' => false,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL;

