<?php
/**
 * SEIS contact endpoint — reference implementation for PHP hosting.
 *
 * The portfolio form (apps/web/index.html #contact-form) posts:
 *   name, email, message, and the honeypot field "_gotcha".
 * site-config.json's "contactEndpoint" is empty today (mailto fallback);
 * deploying this file and pointing contactEndpoint at it upgrades the
 * form to a real POST target without touching the front end.
 *
 * Security model: honeypot rejection, CR/LF header-injection stripping,
 * strict field validation, JSON responses, optional origin allowlist via
 * SEIS_ALLOWED_ORIGIN. Mail dispatch only happens when SEIS_CONTACT_TO
 * is configured — never during validation or self-test.
 *
 * Self-test: php polyglot/php/contact-endpoint.php --self-test
 */

declare(strict_types=1);

const NAME_MIN = 2;
const NAME_MAX = 100;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 5000;

/** Strip header-injection vectors and trim. */
function seis_sanitize_line(string $value): string
{
    return trim(str_replace(["\r", "\n", "%0a", "%0d", "%0A", "%0D"], "", $value));
}

/**
 * Validate a raw form submission.
 * @return array{ok: bool, errors: array<string,string>, clean: array<string,string>}
 */
function seis_validate_submission(array $input): array
{
    $errors = [];
    $clean = [];

    // Honeypot: humans never fill "_gotcha"; bots do. A filled value is a
    // hard reject with no field-level hint.
    if (($input['_gotcha'] ?? '') !== '') {
        return ['ok' => false, 'errors' => ['_gotcha' => 'rejected'], 'clean' => []];
    }

    $name = seis_sanitize_line((string)($input['name'] ?? ''));
    $len = mb_strlen($name);
    if ($len < NAME_MIN || $len > NAME_MAX) {
        $errors['name'] = sprintf('name must be %d-%d characters', NAME_MIN, NAME_MAX);
    } else {
        $clean['name'] = $name;
    }

    $email = seis_sanitize_line((string)($input['email'] ?? ''));
    if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
        $errors['email'] = 'invalid email address';
    } else {
        $clean['email'] = $email;
    }

    $message = trim((string)($input['message'] ?? ''));
    $len = mb_strlen($message);
    if ($len < MESSAGE_MIN || $len > MESSAGE_MAX) {
        $errors['message'] = sprintf('message must be %d-%d characters', MESSAGE_MIN, MESSAGE_MAX);
    } else {
        $clean['message'] = $message;
    }

    return ['ok' => $errors === [], 'errors' => $errors, 'clean' => $clean];
}

/** Build the outbound mail pieces from a validated submission. */
function seis_compose_mail(array $clean, string $to): array
{
    $subject = 'Portfolio contact: ' . mb_substr($clean['name'], 0, 60);
    $body = "From: {$clean['name']} <{$clean['email']}>\n\n{$clean['message']}\n";
    $headers = implode("\r\n", [
        'From: portfolio@' . (seis_sanitize_line($_SERVER['SERVER_NAME'] ?? 'localhost')),
        'Reply-To: ' . $clean['email'],
        'Content-Type: text/plain; charset=UTF-8',
    ]);
    return [$to, $subject, $body, $headers];
}

function seis_json_response(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
}

function seis_handle_request(): void
{
    $allowed = getenv('SEIS_ALLOWED_ORIGIN') ?: '';
    if ($allowed !== '') {
        header('Access-Control-Allow-Origin: ' . $allowed);
        header('Vary: Origin');
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin !== '' && $origin !== $allowed) {
            seis_json_response(403, ['ok' => false, 'error' => 'origin not allowed']);
            return;
        }
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        seis_json_response(405, ['ok' => false, 'error' => 'POST only']);
        return;
    }

    $result = seis_validate_submission($_POST);
    if (!$result['ok']) {
        seis_json_response(422, ['ok' => false, 'errors' => $result['errors']]);
        return;
    }

    $to = getenv('SEIS_CONTACT_TO') ?: '';
    if ($to === '') {
        seis_json_response(503, ['ok' => false, 'error' => 'endpoint not configured']);
        return;
    }

    [$rcpt, $subject, $body, $headers] = seis_compose_mail($result['clean'], $to);
    $sent = mail($rcpt, $subject, $body, $headers);
    seis_json_response($sent ? 200 : 502, ['ok' => $sent]);
}

function seis_self_test(): int
{
    $failures = 0;
    $check = function (string $name, bool $cond) use (&$failures): void {
        if (!$cond) {
            echo "  FAIL {$name}\n";
            $failures++;
        }
    };

    $valid = seis_validate_submission([
        'name' => 'Ada Lovelace',
        'email' => 'ada@example.com',
        'message' => 'I would like to discuss a branding project.',
        '_gotcha' => '',
    ]);
    $check('valid submission passes', $valid['ok']);

    $bot = seis_validate_submission(['name' => 'x', '_gotcha' => 'http://spam']);
    $check('honeypot rejects bots', !$bot['ok'] && isset($bot['errors']['_gotcha']));

    $inject = seis_validate_submission([
        'name' => "Eve\r\nBcc: everyone@example.com",
        'email' => 'eve@example.com',
        'message' => 'Header injection attempt message body.',
    ]);
    $check('CRLF stripped from name',
        $inject['ok']
        && !str_contains($inject['clean']['name'], "\n")
        && !str_contains($inject['clean']['name'], "\r"));

    $bad_email = seis_validate_submission([
        'name' => 'Real Person', 'email' => 'not-an-email', 'message' => 'Long enough message here.',
    ]);
    $check('bad email rejected', !$bad_email['ok'] && isset($bad_email['errors']['email']));

    $short = seis_validate_submission([
        'name' => 'A', 'email' => 'a@b.co', 'message' => 'short',
    ]);
    $check('short name+message rejected',
        !$short['ok'] && isset($short['errors']['name'], $short['errors']['message']));

    $unicode = seis_validate_submission([
        'name' => 'Şükrü Çağrı', 'email' => 'sukru@example.com',
        'message' => 'Türkçe karakterli mesaj — çizim projesi hakkında.',
    ]);
    $check('unicode names accepted', $unicode['ok']);

    [, $subject, , $headers] = seis_compose_mail(
        ['name' => 'Ada', 'email' => 'ada@example.com', 'message' => 'Hi'], 'owner@example.com'
    );
    $check('mail subject composed', str_contains($subject, 'Ada'));
    $check('reply-to header set', str_contains($headers, 'Reply-To: ada@example.com'));

    printf("[%s] contact-endpoint self-test  8 checks, %d failures\n",
        $failures ? 'FAIL' : 'PASS', $failures);
    return $failures ? 1 : 0;
}

if (PHP_SAPI === 'cli') {
    exit(in_array('--self-test', $argv, true) ? seis_self_test() : 0);
}

seis_handle_request();
