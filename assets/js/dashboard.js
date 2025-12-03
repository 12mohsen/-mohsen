document.addEventListener("DOMContentLoaded", () => {
    const userSpan = document.getElementById("loggedInUser");
    const logoutBtn = document.getElementById("logoutBtn");
    const linkForm = document.getElementById("linkForm");
    const linksList = document.getElementById("linksList");
    const statusBox = document.getElementById("statusMessage");
    const searchInput = document.getElementById("searchInput");
    const previewOverlay = document.getElementById("linkPreviewOverlay");
    const previewFrame = document.getElementById("previewFrame");
    const previewTitle = document.getElementById("previewTitle");
    const previewExternalLink = document.getElementById("previewExternalLink");
    const previewCloseBtn = document.getElementById("previewCloseBtn");
    const previewLoader = document.getElementById("previewLoader");
    const previewFavicon = document.getElementById("previewFavicon");
    const brandNameEnEl = document.getElementById("brandNameEn");
    const brandNameArEl = document.getElementById("brandNameAr");
    const editBrandBtn = document.getElementById("editBrandBtn");
    const toggleTrialHintBtn = document.getElementById("toggleTrialHintBtn");

    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser) {
        window.location.href = "index.html";
        return;
    }

    if (previewFrame && previewLoader) {
        previewFrame.addEventListener("load", () => {
            previewLoader.classList.remove("is-active");
        });
    }

    const defaultBrand = {
        en: "Mohsen Hub",
        ar: "محسن هَب",
    };

    const defaultAppSettings = {
        showTrialHint: true,
    };

    function loadBrand() {
        try {
            const raw = localStorage.getItem("brandInfo");
            if (!raw) return { ...defaultBrand };
            const parsed = JSON.parse(raw);
            return {
                en: parsed.en || defaultBrand.en,
                ar: parsed.ar || defaultBrand.ar,
            };
        } catch (e) {
            return { ...defaultBrand };
        }
    }

    function saveBrand(brand) {
        localStorage.setItem("brandInfo", JSON.stringify(brand));
    }

    function applyBrandToHeader(brand) {
        if (brandNameEnEl) brandNameEnEl.textContent = brand.en;
        if (brandNameArEl) brandNameArEl.textContent = brand.ar;
    }

    function loadAppSettings() {
        try {
            const raw = localStorage.getItem("appSettings");
            if (!raw) return { ...defaultAppSettings };
            const parsed = JSON.parse(raw);
            return { ...defaultAppSettings, ...parsed };
        } catch (e) {
            return { ...defaultAppSettings };
        }
    }

    function saveAppSettings(settings) {
        localStorage.setItem("appSettings", JSON.stringify(settings));
    }

    const currentBrand = loadBrand();
    applyBrandToHeader(currentBrand);

    let appSettings = loadAppSettings();

    if (userSpan) {
        userSpan.textContent = loggedInUser;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }

    if (editBrandBtn) {
        editBrandBtn.addEventListener("click", () => {
            const brand = loadBrand();
            const newEn = window.prompt("اكتب الاسم الإنجليزي للهوية:", brand.en) ?? brand.en;
            const newAr = window.prompt("اكتب الاسم العربي للهوية:", brand.ar) ?? brand.ar;

            const updated = {
                en: newEn.trim() || brand.en,
                ar: newAr.trim() || brand.ar,
            };

            saveBrand(updated);
            applyBrandToHeader(updated);
            showStatus("تم تحديث اسم الهوية بنجاح.", "success");
        });
    }

    if (toggleTrialHintBtn) {
        const applyButtonLabel = () => {
            toggleTrialHintBtn.textContent = appSettings.showTrialHint
                ? "إخفاء تعليمات تجربة الدخول"
                : "إظهار تعليمات تجربة الدخول";
        };

        applyButtonLabel();

        toggleTrialHintBtn.addEventListener("click", () => {
            appSettings.showTrialHint = !appSettings.showTrialHint;
            saveAppSettings(appSettings);
            applyButtonLabel();
            showStatus(
                appSettings.showTrialHint
                    ? "سيتم إظهار تعليمات تجربة الدخول في صفحة تسجيل الدخول."
                    : "سيتم إخفاء تعليمات تجربة الدخول في صفحة تسجيل الدخول.",
                "success"
            );
        });
    }

    function buildFaviconUrl(url) {
        try {
            const u = new URL(url);
            return "https://www.google.com/s2/favicons?domain=" + encodeURIComponent(u.hostname) + "&sz=64";
        } catch (e) {
            return "";
        }
    }

    function openPreview(url, title) {
        if (!previewOverlay || !previewFrame) return;
        if (previewLoader) {
            previewLoader.classList.add("is-active");
        }
        previewFrame.src = url;
        if (previewTitle) {
            previewTitle.textContent = title || url;
        }
        if (previewExternalLink) {
            previewExternalLink.href = url;
        }
        if (previewFavicon) {
            const favUrl = buildFaviconUrl(url);
            previewFavicon.src = favUrl || "";
            previewFavicon.style.visibility = favUrl ? "visible" : "hidden";
        }
        previewOverlay.classList.add("is-open");
        previewOverlay.setAttribute("aria-hidden", "false");
    }

    function closePreview() {
        if (!previewOverlay || !previewFrame) return;
        previewOverlay.classList.remove("is-open");
        previewOverlay.setAttribute("aria-hidden", "true");
        previewFrame.src = "about:blank";
        if (previewLoader) {
            previewLoader.classList.remove("is-active");
        }
    }

    if (previewCloseBtn && previewOverlay) {
        previewCloseBtn.addEventListener("click", () => {
            closePreview();
        });
        previewOverlay.addEventListener("click", (e) => {
            if (e.target === previewOverlay) {
                closePreview();
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                closePreview();
            }
        });
    }

    function showStatus(message, type = "info") {
        if (!statusBox) return;
        statusBox.textContent = message || "";
        statusBox.classList.remove("status-message--success", "status-message--error");

        if (!message) return;
        if (type === "success") {
            statusBox.classList.add("status-message--success");
        } else if (type === "error") {
            statusBox.classList.add("status-message--error");
        }
    }

    function loadLinks() {
        try {
            const data = localStorage.getItem("userLinks");
            const parsed = data ? JSON.parse(data) : [];
            return parsed.map((l) => ({
                ...l,
                // حافظ على id و isFavorite إن وُجدا، وإلا أنشئ قيم افتراضية
                id: typeof l.id !== "undefined" ? l.id : Date.now() + Math.random(),
                isFavorite: typeof l.isFavorite === "boolean" ? l.isFavorite : false,
            }));
        } catch (err) {
            console.error("Failed to parse links from localStorage", err);
            return [];
        }
    }

    function saveLinks(links) {
        localStorage.setItem("userLinks", JSON.stringify(links));
    }

    function renderLinks(filterText = "") {
        const links = loadLinks();
        linksList.innerHTML = "";

        const term = filterText.trim().toLowerCase();
        const base = links
            .slice()
            .sort((a, b) => (b.isFavorite === true) - (a.isFavorite === true));

        const filtered = term
            ? base.filter((link) => {
                  const t = (link.title || "").toLowerCase();
                  const u = (link.url || "").toLowerCase();
                  return t.includes(term) || u.includes(term);
              })
            : base;

        if (!filtered.length) {
            const empty = document.createElement("div");
            empty.className = "links-empty";
            empty.textContent = links.length
                ? "لا توجد نتائج مطابقة لبحثك."
                : "لا توجد روابط حتى الآن. ابدأ بإضافة أول رابط من الأعلى.";
            linksList.appendChild(empty);
            return;
        }

        filtered.forEach((link) => {
            const item = document.createElement("div");
            item.className = "link-item";

            const main = document.createElement("div");
            main.className = "link-main";

            const titleEl = document.createElement("div");
            titleEl.className = "link-title";
            const favBtn = document.createElement("button");
            favBtn.type = "button";
            favBtn.className = "fav-toggle" + (link.isFavorite ? " fav-toggle--active" : "");
            favBtn.textContent = "★";
            favBtn.title = link.isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة";
            favBtn.addEventListener("click", () => {
                const all = loadLinks();
                const idx = all.findIndex((l) => l.id === link.id);
                if (idx !== -1) {
                    all[idx].isFavorite = !all[idx].isFavorite;
                    saveLinks(all);
                    showStatus(
                        all[idx].isFavorite ? "تمت إضافة الرابط إلى المفضلة." : "تمت إزالة الرابط من المفضلة.",
                        "success"
                    );
                    renderLinks(searchInput ? searchInput.value : "");
                }
            });

            const titleText = document.createElement("span");
            titleText.textContent = link.title || "Untitled";

            titleEl.appendChild(favBtn);
            titleEl.appendChild(titleText);

            const urlEl = document.createElement("a");
            urlEl.className = "link-url";
            urlEl.href = link.url;
            urlEl.textContent = link.url;
            urlEl.addEventListener("click", (e) => {
                e.preventDefault();
                openPreview(link.url, link.title);
            });

            main.appendChild(titleEl);
            main.appendChild(urlEl);

            const actions = document.createElement("div");
            actions.className = "link-actions";

            const copyBtn = document.createElement("button");
            copyBtn.className = "btn btn-outline";
            copyBtn.type = "button";
            copyBtn.textContent = "نسخ الرابط";
            copyBtn.addEventListener("click", async () => {
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(link.url);
                        showStatus("تم نسخ الرابط إلى الحافظة.", "success");
                    } else {
                        showStatus("متصفحك لا يدعم النسخ التلقائي.", "error");
                    }
                } catch (err) {
                    console.error("copy failed", err);
                    showStatus("تعذر نسخ الرابط.", "error");
                }
            });

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "btn btn-danger";
            deleteBtn.type = "button";
            deleteBtn.textContent = "حذف";
            deleteBtn.addEventListener("click", () => {
                const confirmed = window.confirm("هل أنت متأكد من حذف هذا الرابط؟");
                if (!confirmed) return;

                const current = loadLinks();
                const idx = current.findIndex((l) => l.id === link.id);
                if (idx !== -1) {
                    current.splice(idx, 1);
                    saveLinks(current);
                }
                renderLinks(searchInput ? searchInput.value : "");
                showStatus("تم حذف الرابط بنجاح.", "success");
            });

            actions.appendChild(copyBtn);
            actions.appendChild(deleteBtn);

            item.appendChild(main);
            item.appendChild(actions);

            linksList.appendChild(item);
        });
    }

    if (linkForm) {
        linkForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const titleInput = document.getElementById("linkTitle");
            const urlInput = document.getElementById("linkUrl");

            const title = titleInput.value.trim();
            let url = urlInput.value.trim();

            if (!title || !url) {
                showStatus("يرجى إدخال العنوان والرابط قبل الإضافة.", "error");
                return;
            }

            if (!/^https?:\/\//i.test(url)) {
                url = "https://" + url;
            }

            const links = loadLinks();
            links.push({ id: Date.now() + Math.random(), title, url, owner: loggedInUser, isFavorite: false });
            saveLinks(links);
            renderLinks(searchInput ? searchInput.value : "");

            showStatus("تمت إضافة الرابط بنجاح.", "success");

            titleInput.value = "";
            urlInput.value = "";
            titleInput.focus();
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            renderLinks(searchInput.value || "");
        });
    }

    renderLinks();
});
