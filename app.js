document.addEventListener("DOMContentLoaded", () => {
    const yearEl = document.getElementById("year");
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    initServiceTabs();
    initPaymentPage();

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

const FEE_RATE = 0.05;

function formatMoney(amount) {
    return "$" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function initPaymentPage() {
    const form = document.getElementById("paymentForm");
    if (!form) return;

    const checks = Array.from(form.querySelectorAll(".service-check"));
    const summaryItems = document.getElementById("summaryItems");
    const subtotalEl = document.getElementById("summarySubtotal");
    const feeEl = document.getElementById("summaryFee");
    const totalEl = document.getElementById("summaryTotal");
    const payButtonTotal = document.getElementById("payButtonTotal");
    const status = document.getElementById("paymentStatus");

    const updateSummary = () => {
        const picked = checks.filter((c) => c.checked);
        const subtotal = picked.reduce((sum, c) => sum + Number(c.dataset.price || 0), 0);
        const fee = subtotal * FEE_RATE;
        const total = subtotal + fee;

        if (summaryItems) {
            summaryItems.innerHTML = "";
            if (picked.length === 0) {
                const li = document.createElement("li");
                li.className = "summary-empty";
                li.textContent = "No services selected yet.";
                summaryItems.appendChild(li);
            } else {
                picked.forEach((c) => {
                    const li = document.createElement("li");
                    li.className = "summary-item";
                    const name = document.createElement("span");
                    name.className = "summary-item-name";
                    name.textContent = c.dataset.name || "Service";
                    const price = document.createElement("span");
                    price.className = "summary-item-price";
                    price.textContent = formatMoney(Number(c.dataset.price || 0));
                    li.append(name, price);
                    summaryItems.appendChild(li);
                });
            }
        }

        if (subtotalEl) subtotalEl.textContent = formatMoney(subtotal);
        if (feeEl) feeEl.textContent = formatMoney(fee);
        if (totalEl) totalEl.textContent = formatMoney(total);
        if (payButtonTotal) payButtonTotal.textContent = formatMoney(total);
    };

    checks.forEach((c) => c.addEventListener("change", updateSummary));

    const cardNumber = document.getElementById("cardNumber");
    if (cardNumber) {
        cardNumber.addEventListener("input", () => {
            const digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
            cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
        });
    }

    const cardExpiry = document.getElementById("cardExpiry");
    if (cardExpiry) {
        cardExpiry.addEventListener("input", () => {
            const digits = cardExpiry.value.replace(/\D/g, "").slice(0, 4);
            cardExpiry.value = digits.length > 2
                ? digits.slice(0, 2) + "/" + digits.slice(2)
                : digits;
        });
    }

    const cardCvc = document.getElementById("cardCvc");
    if (cardCvc) {
        cardCvc.addEventListener("input", () => {
            cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 4);
        });
    }

    const setInvalid = (id, invalid) => {
        const el = form.elements.namedItem(id);
        if (el && "setAttribute" in el) {
            el.setAttribute("aria-invalid", invalid ? "true" : "false");
        }
    };

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (status) {
            status.classList.remove("error");
            status.textContent = "";
        }

        const picked = checks.filter((c) => c.checked);
        if (picked.length === 0) {
            if (status) {
                status.classList.add("error");
                status.textContent = "Please select at least one service.";
            }
            const firstCheck = checks[0];
            if (firstCheck && typeof firstCheck.focus === "function") firstCheck.focus();
            return;
        }

        const requiredFields = [
            "payName", "payEmail", "payPhone", "payAddress", "payZip",
            "cardName", "cardNumber", "cardExpiry", "cardCvc",
        ];
        const missing = requiredFields.filter((id) => {
            const el = form.elements.namedItem(id);
            const value = el && "value" in el ? String(el.value).trim() : "";
            setInvalid(id, !value);
            return !value;
        });

        if (missing.length > 0) {
            if (status) {
                status.classList.add("error");
                status.textContent = "Please complete the highlighted fields.";
            }
            const first = form.elements.namedItem(missing[0]);
            if (first && typeof first.focus === "function") first.focus();
            return;
        }

        const cardDigits = (form.elements.namedItem("cardNumber")?.value || "").replace(/\D/g, "");
        if (cardDigits.length < 13 || cardDigits.length > 16) {
            setInvalid("cardNumber", true);
            if (status) {
                status.classList.add("error");
                status.textContent = "Please enter a valid card number.";
            }
            form.elements.namedItem("cardNumber")?.focus?.();
            return;
        }

        const expiry = form.elements.namedItem("cardExpiry")?.value || "";
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            setInvalid("cardExpiry", true);
            if (status) {
                status.classList.add("error");
                status.textContent = "Please enter the expiry as MM/YY.";
            }
            form.elements.namedItem("cardExpiry")?.focus?.();
            return;
        }

        const total = picked.reduce((sum, c) => sum + Number(c.dataset.price || 0), 0) * (1 + FEE_RATE);
        if (status) {
            status.textContent = `Payment of ${formatMoney(total)} authorized. We'll email a confirmation shortly.`;
        }
        form.reset();
        updateSummary();
    });

    updateSummary();
}

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
