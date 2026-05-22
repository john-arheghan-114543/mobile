document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const navToggle = document.querySelector(".nav-toggle");
    const primaryNav = document.getElementById("primary-nav");
    if (navToggle && primaryNav) {
        navToggle.addEventListener("click", () => {
            const open = primaryNav.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        });

        primaryNav.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                primaryNav.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    const form = document.getElementById("quoteForm");
    const status = document.getElementById("formStatus");
    if (form && status) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            status.classList.remove("error");
            status.textContent = "";

            const required = ["name", "phone", "email", "service"];
            const missing = required.filter((id) => {
                const el = form.elements.namedItem(id);
                const value = el && "value" in el ? String(el.value).trim() : "";
                if (el) {
                    el.setAttribute("aria-invalid", value ? "false" : "true");
                }
                return !value;
            });

            if (missing.length > 0) {
                status.classList.add("error");
                status.textContent = "Please fill in the required fields.";
                const firstMissing = form.elements.namedItem(missing[0]);
                if (firstMissing && typeof firstMissing.focus === "function") {
                    firstMissing.focus();
                }
                return;
            }

            status.textContent = "Thanks! We'll be in touch shortly.";
            form.reset();
        });
    }
});

function initServiceTabs() {
    const tabs = Array.from(document.querySelectorAll(".tabs .tab"));
    if (tabs.length === 0) return;

    const activate = (tab) => {
        const targetId = `panel-${tab.dataset.target}`;
        tabs.forEach((t) => {
            const isActive = t === tab;
            t.classList.toggle("is-active", isActive);
            t.setAttribute("aria-selected", isActive ? "true" : "false");
            t.setAttribute("tabindex", isActive ? "0" : "-1");
            const panel = document.getElementById(t.getAttribute("aria-controls"));
            if (panel) {
                panel.classList.toggle("is-active", isActive);
                panel.hidden = !isActive;
            }
        });
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.focus?.();
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => activate(tab));
        tab.addEventListener("keydown", (e) => {
            const idx = tabs.indexOf(tab);
            if (e.key === "ArrowRight") {
                e.preventDefault();
                const next = tabs[(idx + 1) % tabs.length];
                next.focus();
                activate(next);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                const prev = tabs[(idx - 1 + tabs.length) % tabs.length];
                prev.focus();
                activate(prev);
            }
        });
    });
}
