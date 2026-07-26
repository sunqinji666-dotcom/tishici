<?php
declare(strict_types=1);

session_name('tishici_publish');
session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
]);
session_start();

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store, no-cache, must-revalidate');
if (($_SESSION['cache_reset_version'] ?? '') !== 'cursor-v10') {
    header('Clear-Site-Data: "cache"');
    $_SESSION['cache_reset_version'] = 'cursor-v10';
}

$dataDir = dirname(__DIR__) . '/tishici-storage';
$uploadDir = __DIR__ . '/uploads';
$dataFile = $dataDir . '/prompts.json';

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function ensure_storage(): void {
    global $dataDir, $uploadDir, $dataFile;
    if (!is_dir($dataDir)) mkdir($dataDir, 0750, true);
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0750, true);
    if (!is_file($dataFile)) file_put_contents($dataFile, "[]", LOCK_EX);
}
function read_items(): array {
    global $dataFile;
    ensure_storage();
    $handle = fopen($dataFile, 'c+');
    if (!$handle || !flock($handle, LOCK_SH)) respond(['error' => 'storage_unavailable'], 503);
    rewind($handle); $raw = stream_get_contents($handle); flock($handle, LOCK_UN); fclose($handle);
    $items = json_decode($raw ?: '[]', true);
    return is_array($items) ? $items : [];
}
function write_items(array $items): void {
    global $dataFile;
    $handle = fopen($dataFile, 'c+');
    if (!$handle || !flock($handle, LOCK_EX)) respond(['error' => 'storage_unavailable'], 503);
    ftruncate($handle, 0); rewind($handle);
    fwrite($handle, json_encode(array_values($items), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fflush($handle); flock($handle, LOCK_UN); fclose($handle);
}
function clean_text(string $value, int $max): string {
    $value = trim($value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}
function configured_publish_password(): ?string {
    $password = getenv('TISHICI_PUBLISH_PASSWORD');
    return is_string($password) && $password !== '' ? $password : null;
}
function require_publish_access(string $password = ''): void {
    if (!empty($_SESSION['publish_ok'])) return;
    $configuredPassword = configured_publish_password();
    if ($configuredPassword === null) respond(['error' => 'publish_password_not_configured'], 503);
    if (hash_equals($configuredPassword, $password)) { $_SESSION['publish_ok'] = true; return; }
    respond(['error' => 'publish_password_required'], 401);
}
function media_upload(): ?array {
    global $uploadDir;
    $uploaded = $_FILES['media'] ?? $_FILES['image'] ?? null;
    if (!$uploaded || $uploaded['error'] === UPLOAD_ERR_NO_FILE) return null;
    $file = $uploaded;
    if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > 1024 * 1024) respond(['error' => 'upload_too_large'], 422);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);
    // 浏览器端负责压缩；服务器只校验并保存，不做任何重编码。
    $imageExtensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $videoExtensions = ['video/webm' => 'webm', 'video/mp4' => 'mp4', 'video/quicktime' => 'mov'];
    if (isset($imageExtensions[$mime])) {
        if (!@getimagesize($file['tmp_name'])) respond(['error' => 'upload_failed'], 422);
        $extension = $imageExtensions[$mime]; $kind = 'image';
    } elseif (isset($videoExtensions[$mime])) {
        $extension = $videoExtensions[$mime]; $kind = 'video';
    } else {
        respond(['error' => 'upload_failed'], 422);
    }
    $name = bin2hex(random_bytes(12)) . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . '/' . $name)) respond(['error' => 'upload_failed'], 422);
    return ['url' => 'uploads/' . $name, 'kind' => $kind];
}

ensure_storage();
$action = $_GET['action'] ?? 'list';
if ($action === 'list') {
    $items = read_items();
    usort($items, fn($a, $b) => strcmp((string)($b['createdAt'] ?? ''), (string)($a['createdAt'] ?? '')));
    respond(['items' => $items, 'canPublish' => !empty($_SESSION['publish_ok'])]);
}
if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    require_publish_access((string)($_POST['password'] ?? ''));
    $prompt = clean_text((string)($_POST['prompt'] ?? ''), 12000);
    if ($prompt === '') respond(['error' => 'prompt_required'], 422);
    $models = [
        'image' => ['G Image 2', '香蕉2', '香蕉Pro', 'Seedream 5.0 Pro', 'Seedream 4.5'],
        'video' => ['Seedance 2.0', 'Seedance 2.0 Fast', 'Seedance 2.0 Mini', 'Hailuo 2.3 Fast', 'Hailuo 2.3'],
    ];
    $type = isset($models[(string)($_POST['type'] ?? '')]) ? (string)$_POST['type'] : 'image';
    $model = clean_text((string)($_POST['model'] ?? ''), 80);
    if (!in_array($model, $models[$type], true)) $model = $type === 'video' ? 'Seedance 2.0 Mini' : '香蕉Pro';
    $item = [
        'id' => 'p_' . date('ymdHis') . '_' . bin2hex(random_bytes(3)),
        'author' => 'jack',
        'type' => $type,
        'model' => $model,
        'title' => clean_text((string)($_POST['title'] ?? ''), 100),
        'prompt' => $prompt,
        'media' => media_upload(),
        'createdAt' => date(DATE_ATOM),
    ];
    $item['mediaUrl'] = $item['media']['url'] ?? null;
    $item['mediaType'] = $item['media']['kind'] ?? null;
    unset($item['media']);
    $items = read_items(); array_unshift($items, $item); write_items($items);
    respond(['ok' => true, 'item' => $item], 201);
}
if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input') ?: '{}', true);
    require_publish_access((string)($body['password'] ?? ''));
    $id = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)($body['id'] ?? ''));
    if ($id === '') respond(['error' => 'missing_id'], 422);
    $items = read_items(); $found = null;
    $items = array_values(array_filter($items, function ($item) use ($id, &$found) {
        if (($item['id'] ?? '') === $id) { $found = $item; return false; }
        return true;
    }));
    if ($found && !empty($found['mediaUrl'] ?? $found['imageUrl'] ?? '')) {
        $mediaUrl = (string)($found['mediaUrl'] ?? $found['imageUrl']);
        $path = __DIR__ . '/' . ltrim($mediaUrl, '/');
        if (str_starts_with(realpath($path) ?: '', realpath(__DIR__ . '/uploads') . DIRECTORY_SEPARATOR) && is_file($path)) @unlink($path);
    }
    write_items($items); respond(['ok' => true]);
}
respond(['error' => 'not_found'], 404);
