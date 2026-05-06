<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);
set_time_limit(0);

echo "<div style='font-family: sans-serif; padding: 20px;'>";
echo "<h2>Direct Video Fetch Test</h2>";

$ytDlpPath = __DIR__ . DIRECTORY_SEPARATOR . 'yt-dlp.exe';

// ඔයාගේ පින්තූරේ තිබුණු YouTube ලින්ක් එක
$url = "https://youtu.be/8jCm0L4pdkE"; 

echo "<b>Target URL:</b> <a href='$url' target='_blank'>$url</a><br><br>";

$cmd = '"' . $ytDlpPath . '" --dump-json --no-warnings "' . $url . '" 2>&1';
echo "<b>Running Command:</b> <code style='background:#eee; padding:5px;'>$cmd</code><br><br>";

echo "<i>Please wait, fetching data from YouTube... (This might take a few seconds)</i><br><br>";

// කමාන්ඩ් එක රන් කිරීම
$output = shell_exec($cmd);

echo "<h3>Raw Output from yt-dlp:</h3>";

if ($output === null || trim($output) === '') {
    echo "<div style='background: #ffebee; color: #c62828; padding: 15px; border-radius: 5px;'>";
    echo "<b>❌ ERROR: NO OUTPUT!</b><br>";
    echo "PHP shell_exec() returned completely blank. The server might be crashing due to memory limits or Windows blocking the process.";
    echo "</div>";
} else {
    // දත්ත තියෙනවා නම් ඒක කොටුවක් ඇතුලේ පෙන්නනවා
    echo "<textarea style='width: 100%; height: 400px; padding: 10px; font-family: monospace; border: 2px solid #ccc;'>" . htmlspecialchars($output) . "</textarea>";
}
echo "</div>";
?>