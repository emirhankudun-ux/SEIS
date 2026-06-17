<?php

declare(strict_types=1);

function seis_windows_platform_capability(): array
{
    return [
        'id' => 'windows-php-scripting',
        'languages' => ['PHP', 'PowerShell', 'Python', 'SQL'],
        'qualityGates' => [
            'php_syntax_when_available',
            'windows_path_safety',
            'permission_scope',
            'offline_fallback',
            'event_log_awareness',
        ],
        'offlineHelper' => true,
        'remoteBridge' => true,
    ];
}
