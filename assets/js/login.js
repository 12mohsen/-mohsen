document.addEventListener("DOMContentLoaded", () => {
    const brandNameEnLogin = document.getElementById("brandNameEnLogin");
    const brandNameArLogin = document.getElementById("brandNameArLogin");
    const trialHintEl = document.getElementById("trialHint");

    const defaultBrand = {
        en: "Mohsen Hub",
        ar: "محسن هَب",
    };

    // تحميل اسم الهوية
    try {
        const raw = localStorage.getItem("brandInfo");
        const parsed = raw ? JSON.parse(raw) : null;
        const brand = parsed
            ? {
                  en: parsed.en || defaultBrand.en,
                  ar: parsed.ar || defaultBrand.ar,
              }
            : defaultBrand;

        if (brandNameEnLogin) brandNameEnLogin.textContent = brand.en;
        if (brandNameArLogin) brandNameArLogin.textContent = brand.ar;
    } catch (e) {
        if (brandNameEnLogin) brandNameEnLogin.textContent = defaultBrand.en;
        if (brandNameArLogin) brandNameArLogin.textContent = defaultBrand.ar;
    }

    // تحميل إعداد إظهار/إخفاء نص التجربة
    const defaultSettings = { showTrialHint: true };
    try {
        const rawSettings = localStorage.getItem("appSettings");
        const parsedSettings = rawSettings ? JSON.parse(rawSettings) : null;
        const settings = parsedSettings ? { ...defaultSettings, ...parsedSettings } : defaultSettings;
        if (trialHintEl) {
            trialHintEl.style.display = settings.showTrialHint ? "inline" : "none";
        }
    } catch (e) {
        if (trialHintEl) {
            trialHintEl.style.display = "inline";
        }
    }

    const form = document.getElementById("loginForm");
    const errorBox = document.getElementById("loginError");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        errorBox.textContent = "";

        if (username === "admin" && password === "12345") {
            localStorage.setItem("loggedInUser", username);
            window.location.href = "dashboard.html";
        } else {
            errorBox.textContent = "اسم المستخدم أو كلمة المرور غير صالحة. جرب ال admin / 12345.";
        }
    });
});
