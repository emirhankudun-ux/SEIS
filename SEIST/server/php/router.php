<?php
declare(strict_types=1);

$root = realpath(__DIR__ . '/..');
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$candidate = realpath($root . '/' . ltrim($path, '/'));

if ($path === '/_server/health') {
    require __DIR__ . '/health.php';
    exit;
}

if ($candidate !== false && path_starts_with($candidate, $root) && is_file($candidate)) {
    return false;
}

if ($candidate !== false && path_starts_with($candidate, $root) && is_dir($candidate) && is_file($candidate . '/index.html')) {
    readfile($candidate . '/index.html');
    exit;
}

readfile($root . '/index.html');

function path_starts_with(string $path, string $prefix): bool
{
    return substr($path, 0, strlen($prefix)) === $prefix;
}
