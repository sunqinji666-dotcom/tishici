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
function normalize_media_uploads(): array {
    $uploaded = $_FILES['media'] ?? $_FILES['image'] ?? null;
    if (!$uploaded || !isset($uploaded['error'])) return [];
    if (!is_array($uploaded['error'])) return [[
        'name' => (string)($uploaded['name'] ?? ''),
        'tmp_name' => (string)($uploaded['tmp_name'] ?? ''),
        'error' => (int)$uploaded['error'],
        'size' => (int)($uploaded['size'] ?? 0),
    ]];
    $files = [];
    foreach ($uploaded['error'] as $index => $error) {
        $files[] = [
            'name' => (string)($uploaded['name'][$index] ?? ''),
            'tmp_name' => (string)($uploaded['tmp_name'][$index] ?? ''),
            'error' => (int)$error,
            'size' => (int)($uploaded['size'][$index] ?? 0),
        ];
    }
    return $files;
}
function media_uploads(): array {
    global $uploadDir;
    $files = array_values(array_filter(normalize_media_uploads(), fn($file) => $file['error'] !== UPLOAD_ERR_NO_FILE));
    if (!$files) return [];
    if (count($files) > 12) respond(['error' => 'too_many_uploads'], 422);
    // 浏览器端负责压缩；服务器只校验并保存，不做任何重编码。
    $imageExtensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    $videoExtensions = ['video/webm' => 'webm', 'video/mp4' => 'mp4', 'video/quicktime' => 'mov', 'video/x-m4v' => 'm4v'];
    $plan = [];
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    foreach ($files as $file) {
        if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || $file['size'] > 1024 * 1024) {
            respond(['error' => 'upload_too_large'], 422);
        }
        if ($file['error'] !== UPLOAD_ERR_OK || $file['tmp_name'] === '' || !is_uploaded_file($file['tmp_name'])) {
            respond(['error' => 'upload_failed'], 422);
        }
        $mime = (string)$finfo->file($file['tmp_name']);
        if (isset($imageExtensions[$mime])) {
            if (!@getimagesize($file['tmp_name'])) respond(['error' => 'upload_failed'], 422);
            $extension = $imageExtensions[$mime]; $kind = 'image';
        } elseif (isset($videoExtensions[$mime])) {
            $extension = $videoExtensions[$mime]; $kind = 'video';
        } else {
            respond(['error' => 'upload_failed'], 422);
        }
        $plan[] = [
            'tmp_name' => $file['tmp_name'],
            'name' => bin2hex(random_bytes(12)) . '.' . $extension,
            'kind' => $kind,
        ];
    }
    $saved = [];
    foreach ($plan as $entry) {
        $target = $uploadDir . '/' . $entry['name'];
        if (!move_uploaded_file($entry['tmp_name'], $target)) {
            foreach ($saved as $savedItem) @unlink(__DIR__ . '/' . $savedItem['url']);
            respond(['error' => 'upload_failed'], 422);
        }
        $saved[] = ['url' => 'uploads/' . $entry['name'], 'kind' => $entry['kind']];
    }
    return $saved;
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
    $collection = (string)($_POST['collection'] ?? '') === 'note' ? 'note' : 'prompt';
    $prompt = clean_text((string)($_POST['prompt'] ?? ''), 12000);
    if ($prompt === '') respond(['error' => $collection === 'note' ? 'note_required' : 'prompt_required'], 422);
    $models = [
        'image' => ['G Image 2', '香蕉2', '香蕉Pro', 'Seedream 5.0 Pro', 'Seedream 4.5'],
        'video' => ['Seedance 2.0', 'Seedance 2.0 Fast', 'Seedance 2.0 Mini', 'Hailuo 2.3 Fast', 'Hailuo 2.3'],
    ];
    $mediaItems = media_uploads();
    if ($collection === 'note') {
        $mediaKinds = array_values(array_unique(array_column($mediaItems, 'kind')));
        $type = count($mediaKinds) > 1 ? 'mixed' : (string)($mediaKinds[0] ?? 'text');
        $model = '';
    } else {
        $type = isset($models[(string)($_POST['type'] ?? '')]) ? (string)$_POST['type'] : 'image';
        $model = clean_text((string)($_POST['model'] ?? ''), 80);
        if (!in_array($model, $models[$type], true)) $model = $type === 'video' ? 'Seedance 2.0 Mini' : '香蕉Pro';
    }
    $item = [
        'id' => ($collection === 'note' ? 'n_' : 'p_') . date('ymdHis') . '_' . bin2hex(random_bytes(3)),
        'author' => 'jack',
        'collection' => $collection,
        'type' => $type,
        'model' => $model,
        'title' => clean_text((string)($_POST['title'] ?? ''), 100),
        'prompt' => $prompt,
        'mediaItems' => $mediaItems,
        'createdAt' => date(DATE_ATOM),
    ];
    $item['mediaUrl'] = $mediaItems[0]['url'] ?? null;
    $item['mediaType'] = $mediaItems[0]['kind'] ?? null;
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
    if ($found) {
        $urls = [];
        foreach (($found['mediaItems'] ?? []) as $mediaItem) {
            if (is_array($mediaItem) && !empty($mediaItem['url'])) $urls[] = (string)$mediaItem['url'];
        }
        foreach (['mediaUrl', 'imageUrl', 'videoUrl'] as $legacyKey) {
            if (!empty($found[$legacyKey])) $urls[] = (string)$found[$legacyKey];
        }
        $uploadBase = realpath(__DIR__ . '/uploads');
        foreach (array_unique($urls) as $mediaUrl) {
            $path = __DIR__ . '/' . ltrim($mediaUrl, '/');
            $realPath = realpath($path);
            if ($uploadBase && $realPath && str_starts_with($realPath, $uploadBase . DIRECTORY_SEPARATOR) && is_file($realPath)) @unlink($realPath);
        }
    }
    write_items($items); respond(['ok' => true]);
}
respond(['error' => 'not_found'], 404);
