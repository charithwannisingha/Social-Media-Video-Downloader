"use strict";

const form = document.getElementById("fetchForm");
const urlInput = document.getElementById("urlInput");
const clearBtn = document.getElementById("clearBtn");
const fetchBtn = document.getElementById("fetchBtn");
const card = document.getElementById("card");
const platformBadge = document.getElementById("platformBadge");
const platformIcon = platformBadge.querySelector(".platform-icon");
const platformName = platformBadge.querySelector(".platform-name");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const resultState = document.getElementById("resultState");
const mediaTitle = document.getElementById("mediaTitle");
const mediaMeta = document.getElementById("mediaMeta");
const qualitySelect = document.getElementById("qualitySelect");
const finalDownloadBtn = document.getElementById("finalDownloadBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const downloadAnotherBtn = document.getElementById("downloadAnotherBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

let currentOptions = [];
const HISTORY_KEY = "mediafetch_history_v1";
const THEME_KEY = "mediafetch_theme_v1";
const MAX_HISTORY_ITEMS = 8;

const PLATFORM_RULES = [
  { id: "youtube", label: "YouTube", icon: "▶️", regex: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i },
  { id: "facebook", label: "Facebook", icon: "📘", regex: /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\//i },
  { id: "twitter", label: "X (Twitter)", icon: "𝕏", regex: /^(https?:\/\/)?(www\.)?(x\.com|twitter\.com)\//i },
  { id: "instagram", label: "Instagram", icon: "📸", regex: /^(https?:\/\/)?(www\.)?instagram\.com\//i },
  { id: "tiktok", label: "TikTok", icon: "🎵", regex: /^(https?:\/\/)?(www\.)?(vm\.)?tiktok\.com\//i }
];

function detectPlatform(url) {
  for (const platform of PLATFORM_RULES) {
    if (platform.regex.test(url.trim())) {
      return platform;
    }
  }
  return null;
}

function setPlatformUI(platform) {
  const classesToRemove = Array.from(card.classList).filter((c) => c.startsWith("platform-"));
  card.classList.remove(...classesToRemove);

  if (!platform) {
    card.classList.add("platform-default");
    platformBadge.className = "platform-badge default";
    platformIcon.textContent = "🌐";
    platformName.textContent = "Paste a supported URL";
    return;
  }

  card.classList.add(`platform-${platform.id}`);
  platformBadge.className = "platform-badge";
  platformIcon.textContent = platform.icon;
  platformName.textContent = `${platform.label} URL detected`;
}

function applyTheme(theme) {
  const normalized = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", normalized);
  localStorage.setItem(THEME_KEY, normalized);
  themeToggleBtn.textContent = normalized === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
}

function loadInitialTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}

function showElement(el) {
  el.classList.remove("hidden");
  el.setAttribute("aria-hidden", "false");
}

function hideElement(el) {
  el.classList.add("hidden");
  el.setAttribute("aria-hidden", "true");
}

function setLoading(isLoading) {
  fetchBtn.disabled = isLoading;
  fetchBtn.textContent = isLoading ? "Fetching..." : "Fetch Download Options";
  if (isLoading) {
    showElement(loadingState);
    hideElement(errorState);
    hideElement(resultState);
  } else {
    hideElement(loadingState);
  }
}

function showError(message) {
  errorMessage.textContent = message || "An unexpected error occurred.";
  showElement(errorState);
}

function clearError() {
  errorMessage.textContent = "";
  hideElement(errorState);
}

function clearResult() {
  qualitySelect.innerHTML = "";
  currentOptions = [];
  mediaTitle.textContent = "Available Formats";
  mediaMeta.textContent = "";
  updateFinalDownloadButton(null);
  hideElement(resultState);
}

function updateFinalDownloadButton(option) {
  if (!option || !option.download_url) {
    finalDownloadBtn.href = "#";
    finalDownloadBtn.classList.add("disabled");
    finalDownloadBtn.setAttribute("aria-disabled", "true");
    return;
  }
  finalDownloadBtn.href = option.download_url;
  finalDownloadBtn.classList.remove("disabled");
  finalDownloadBtn.setAttribute("aria-disabled", "false");
}

function readHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

function renderHistory() {
  const items = readHistory();
  historyList.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.className = "history-empty";
    li.textContent = "No downloads yet.";
    historyList.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const title = document.createElement("p");
    title.className = "history-title";
    title.textContent = `${item.title} (${item.qualityLabel})`;

    const meta = document.createElement("p");
    title.className = "history-meta";
    meta.textContent = `${item.platform} • ${new Date(item.timestamp).toLocaleString()}`;

    li.appendChild(title);
    li.appendChild(meta);
    historyList.appendChild(li);
  });
}

function addHistoryEntry(option) {
  if (!option || !option.download_url) {
    return;
  }

  const platform = detectPlatform(urlInput.value.trim());
  const items = readHistory();
  items.unshift({
    title: mediaTitle.textContent || "Untitled",
    qualityLabel: buildQualityLabel(option),
    platform: platform?.label || "Unknown",
    timestamp: Date.now(),
    sourceUrl: urlInput.value.trim(),
    downloadUrl: option.download_url
  });

  saveHistory(items.slice(0, MAX_HISTORY_ITEMS));
  renderHistory();
}

function buildQualityLabel(item) {
  const format = item.format ? item.format.toUpperCase() : "FILE";
  const quality = item.quality ? item.quality : "Download";
  return `${quality} (${format})`;
}

function renderResult(data) {
  clearResult();

  mediaTitle.textContent = data.title || "Available Formats";
  mediaMeta.textContent = `${data.platform || "Unknown URL"} • Options ready`;

  currentOptions = Array.isArray(data.options) ? data.options : [];
  
  if (!currentOptions.length) {
    showError("No download options found for this URL.");
    return;
  }

  currentOptions.forEach((option, index) => {
    const opt = document.createElement("option");
    opt.value = String(index);
    opt.textContent = buildQualityLabel(option);
    qualitySelect.appendChild(opt);
  });

  updateFinalDownloadButton(currentOptions[0]);
  showElement(resultState);
  hideElement(fetchBtn); 
}

function resetApp() {
  urlInput.value = "";
  setPlatformUI(null);
  clearError();
  clearResult();
  setLoading(false);
  showElement(fetchBtn); 
  urlInput.focus();
}

urlInput.addEventListener("input", () => {
  const inputValue = urlInput.value.trim();
  if (!inputValue) {
    setPlatformUI(null);
    clearError();
    return;
  }
  setPlatformUI(detectPlatform(inputValue));
});

clearBtn.addEventListener("click", () => {
  resetApp();
});

qualitySelect.addEventListener("change", () => {
  const selected = currentOptions[Number(qualitySelect.value)];
  updateFinalDownloadButton(selected);
});

themeToggleBtn.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
});

copyLinkBtn.addEventListener("click", async () => {
  const selected = currentOptions[Number(qualitySelect.value)];
  const downloadUrl = selected?.download_url;
  if (!downloadUrl) {
    showError("Please select a valid quality option before copying.");
    return;
  }

  try {
    await navigator.clipboard.writeText(downloadUrl);
    const originalText = copyLinkBtn.textContent;
    copyLinkBtn.textContent = "Copied!";
    setTimeout(() => {
      copyLinkBtn.textContent = originalText;
    }, 2000);
  } catch (err) {
    showError("Clipboard access failed. Please copy manually.");
  }
});

finalDownloadBtn.addEventListener("click", () => {
  const selected = currentOptions[Number(qualitySelect.value)];
  addHistoryEntry(selected);
});

clearHistoryBtn.addEventListener("click", () => {
  saveHistory([]);
  renderHistory();
});

downloadAnotherBtn.addEventListener("click", () => {
  resetApp();
});

// ---------------------------------------------------------------------------
// UPDATED SUBMIT EVENT (Advanced Error Tracking)
// ---------------------------------------------------------------------------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  clearResult();

  const sourceUrl = urlInput.value.trim();
  if (!sourceUrl) {
    showError("Please paste a URL first.");
    return;
  }

  const platform = detectPlatform(sourceUrl);
  
  setPlatformUI(platform);
  setLoading(true);

  try {
    const response = await fetch("api.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: sourceUrl,
        platform: platform ? platform.id : 'generic'
      })
    });

    // 1. Read the raw response as text first
    const rawText = await response.text();
    let data = null;

    // 2. Try to parse it as JSON
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        // If it's not JSON, it means PHP/yt-dlp threw a raw text error.
        // We throw this error so it gets caught by the catch block below.
        throw new Error("Server Error: " + rawText.substring(0, 200) + "...");
    }
    
    // 3. Handle specific rate limit errors
    if (response.status === 429) {
      throw new Error(data?.message || "Too many requests. Please wait and try again.");
    }

    // 4. Handle other API errors safely
    if (!response.ok || !data.success) {
      throw new Error(data?.message || "API error. Failed to fetch download options.");
    }

    // 5. If everything is good, render the results
    renderResult(data.data || {});
    
  } catch (error) {
    // Show the exact error message on the screen
    showError(error.message || "Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
});

// Initialize
setPlatformUI(null);
loadInitialTheme();
renderHistory();