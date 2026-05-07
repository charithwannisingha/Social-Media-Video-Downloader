# 🌐 Social Media Video Downloader API

![PHP Version](https://img.shields.io/badge/PHP-7.4%2B-blue.svg?style=flat&logo=php)
![yt-dlp](https://img.shields.io/badge/Powered_by-yt--dlp-red.svg?style=flat&logo=youtube)
![License](https://img.shields.io/badge/License-MIT-green.svg)

<img width="1887" height="928" alt="Screenshot 2026-05-06 133123" src="https://github.com/user-attachments/assets/54f4e626-51b7-4bab-ab60-f852e139edfd" />


A lightweight and powerful self-hosted PHP API to extract direct, high-quality media download links from over 1,000+ social media platforms including Instagram, Facebook, TikTok, X (Twitter), and YouTube.

---

## ✨ Key Features

* **Universal Compatibility:** Powered by `yt-dlp`, supporting almost any media platform on the web.
* **Bypass Restrictions:** Built-in `cookies.txt` support allows you to bypass bot protections (e.g., YouTube's "Sign in to confirm you're not a bot") and access private/age-restricted content.
* **Smart Filtering:** Automatically extracts and filters the best available MP4 and audio formats.
* **Developer Friendly:** Returns clean, predictable JSON responses ready to be integrated into any frontend app or bot.
* **Lightweight:** No heavy frameworks required. Just pure PHP.

---

## ⚙️ Requirements

1. **Web Server:** Apache or Nginx with PHP 7.4 or higher.
2. **PHP Functions:** `exec()` and `shell_exec()` must be enabled in your `php.ini`.
3. **yt-dlp:** The latest yt-dlp executable.
4. **Permissions:** Read/Write permissions for the directory to create temporary process files.

---

## 🚀 Installation Guide

**Step 1: Clone the repository**
```bash
git clone [https://github.com/charithwannisingha/Social-Media-Video-Downloader.git](https://github.com/charithwannisingha/Social-Media-Video-Downloader.git)
cd Social-Media-Video-Downloader

Step 2: Add yt-dlp
Download the latest yt-dlp release for your operating system from the official GitHub page and place it in the root folder.

Windows: Rename it to yt-dlp.exe

Linux: Rename it to yt-dlp and give execution permissions (chmod +x yt-dlp).

Step 3: Setup Cookies (Important)
To avoid getting blocked by platforms like Meta (Instagram/Facebook) and Google (YouTube):

Install a browser extension like "Get cookies.txt LOCALLY".

Log into the social media platforms on your browser.

Export the cookies and save the file exactly as cookies.txt in the same folder as api.php.

📖 API Documentation
Send a POST request to api.php to extract media links.

📥 Request
Endpoint: POST /api.php

Headers: Content-Type: application/json
{
    "url": "[https://www.instagram.com/reel/XXXXX/](https://www.instagram.com/reel/XXXXX/)",
    "platform": "instagram"
}

📤 Success Response (200 OK)

{
    "success": true,
    "data": {
        "title": "Extracted Media Title",
        "platform": "Instagram",
        "source_url": "[https://www.instagram.com/reel/XXXXX/](https://www.instagram.com/reel/XXXXX/)",
        "options": [
            {
                "format": "mp4",
                "quality": "1080p",
                "download_url": "[https://video-cdn-server.com/download/](https://video-cdn-server.com/download/)..."
            },
            {
                "format": "mp4",
                "quality": "720p",
                "download_url": "[https://video-cdn-server.com/download/](https://video-cdn-server.com/download/)..."
            }
        ]
    }
}

❌ Error Response (502 Bad Gateway)

{
    "success": false,
    "message": "YouTube Bot Block: Sign in to confirm you’re not a bot."
}
(Fix: Update your cookies.txt file as your current session might have expired).

⚖️ Disclaimer
This tool is strictly developed for educational purposes and personal archiving. Downloading copyrighted material may violate the Terms of Service of respective platforms. The creator is not responsible for any misuse of this API.
