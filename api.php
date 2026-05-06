<?php
error_reporting(0);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respondError('Use POST method only.', 405);
}

$rawBody = file_get_contents('php://input');
$payload = json_decode((string)$rawBody, true);

$url = trim((string)($payload['url'] ?? ''));
$platform = trim(strtolower((string)($payload['platform'] ?? 'generic')));

if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
    respondError('Invalid URL provided.', 422);
}

$ytDlpPath = __DIR__ . DIRECTORY_SEPARATOR . 'yt-dlp.exe';
$cookiesPath = __DIR__ . DIRECTORY_SEPARATOR . 'cookies.txt';

if (!file_exists($ytDlpPath)) {
    respondError('yt-dlp.exe is missing.', 500);
}

// ---------------------------------------------------------------------------
// ADVANCED FILE-BASED EXTRACTION WITH COOKIES
// ---------------------------------------------------------------------------

$tempDataFile = __DIR__ . DIRECTORY_SEPARATOR . 'yt_data_' . time() . '_' . rand(1000, 9999) . '.json';
$tempErrorFile = __DIR__ . DIRECTORY_SEPARATOR . 'yt_error_' . time() . '_' . rand(1000, 9999) . '.txt';

$safeUrl = str_replace('"', '', $url);

// Cookies ෆයිල් එක තියෙනවා නම් ඒක පාවිච්චි කරන්න කමාන්ඩ් එකට එකතු කිරීම
$cookieCmd = file_exists($cookiesPath) ? ' --cookies "' . $cookiesPath . '"' : '';

$cmd = '"' . $ytDlpPath . '" --dump-json --no-warnings --no-playlist' . $cookieCmd . ' "' . $safeUrl . '" > "' . $tempDataFile . '" 2> "' . $tempErrorFile . '"';

exec($cmd);

$jsonData = file_exists($tempDataFile) ? file_get_contents($tempDataFile) : '';
$errorData = file_exists($tempErrorFile) ? file_get_contents($tempErrorFile) : '';

@unlink($tempDataFile);
@unlink($tempErrorFile);

if (empty(trim($jsonData))) {
    $realError = trim(strip_tags($errorData));
    if (empty($realError)) $realError = "Unknown Server Block.";
    if (strlen($realError) > 250) $realError = substr($realError, 0, 250) . '...';
    
    respondError("YouTube Bot Block: " . $realError, 502);
}

$data = json_decode($jsonData, true);

if (!is_array($data) || !isset($data['formats'])) {
    respondError('Video format not found. Could be restricted.', 502);
}

$options = [];
$title = $data['title'] ?? 'Downloaded Media';

foreach ($data['formats'] as $format) {
    if (($format['ext'] ?? '') === 'mp4' && ($format['vcodec'] ?? 'none') !== 'none' && ($format['acodec'] ?? 'none') !== 'none') {
        $quality = $format['format_note'] ?? $format['resolution'] ?? 'Video';
        $options[] = [
            'format' => 'mp4',
            'quality' => $quality,
            'download_url' => $format['url']
        ];
    }
}

if (empty($options) && isset($data['url'])) {
    $options[] = [
        'format' => $data['ext'] ?? 'mp4',
        'quality' => 'Best Available Quality',
        'download_url' => $data['url']
    ];
}

$options = array_reverse($options);
$finalOptions = [];
$seenQualities = [];

foreach ($options as $opt) {
    if (!in_array($opt['quality'], $seenQualities)) {
        $seenQualities[] = $opt['quality'];
        $finalOptions[] = $opt;
    }
    if (count($finalOptions) >= 5) break; 
}

if (empty($finalOptions)) {
    respondError('No suitable MP4 download links were found.', 502);
}

echo json_encode([
    'success' => true,
    'data' => [
        'title' => $title,
        'platform' => ucfirst($platform),
        'source_url' => $url,
        'options' => $finalOptions
    ]
]);
exit;

function respondError(string $message, int $statusCode = 400): void {
    http_response_code($statusCode);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}
?>