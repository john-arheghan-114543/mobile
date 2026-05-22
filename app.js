document.addEventListener("DOMContentLoaded", () => {
    console.log("App loaded");
    initServiceTabs();
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
