<?php

declare(strict_types=1);

function seis_source_contract(string $id, string $pluginRef, string $layer): array
{
    return [
        'id' => $id,
        'pluginRef' => $pluginRef,
        'layer' => $layer,
        'visibleInPortfolio' => str_starts_with($pluginRef, 'plugin://'),
    ];
}
