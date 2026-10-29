/* BHARAT DISTRIBUTORS - API-FREE PRODUCT LOADER */

document.addEventListener("DOMContentLoaded", () => {
    const year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();

    const categories = {
        cello: "cello-products",
        bluline: "bluline-products",
        patel: "patel-products",
        pearl: "pearl-products",
        aera: "aera-products",
        ritu: "ritu-products",
        other: "other-products"
    };

    function showMessage(container, message, error = false) {
        container.innerHTML = "";

        const box = document.createElement("div");
        box.className = "empty-collection";

        const icon = document.createElement("i");
        icon.className = error
            ? "fa-solid fa-circle-exclamation"
            : "fa-regular fa-images";

        const text = document.createElement("p");
        text.textContent = message;

        box.append(icon, text);
        container.appendChild(box);
    }

    function productName(path) {
        const filename = path.split("/").pop();

        return filename
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim()
            .replace(/\b[a-z]/g, letter => letter.toUpperCase());
    }

    function renderProducts(container, images) {
        container.innerHTML = "";

        if (!images || images.length === 0) {
            showMessage(container, "इस कैटेगरी में अभी कोई प्रोडक्ट नहीं है।");
            return;
        }

        images.forEach(path => {
            const card = document.createElement("article");
            card.className = "product-card";

            const wrap = document.createElement("div");
            wrap.className = "product-image-wrap";

            const img = document.createElement("img");
            img.className = "product-image";
            img.src = path.startsWith("./") ? path : `./${path}`;
            img.alt = `${productName(path)} - Bharat Distributors`;
            img.loading = "lazy";
            img.decoding = "async";

            img.onerror = () => {
                img.alt = "Product image unavailable";
                img.style.display = "none";

                const errorText = document.createElement("p");
                errorText.className = "empty-collection";
                errorText.textContent = "Image नहीं मिली: " + path;
                wrap.appendChild(errorText);
            };

            const name = document.createElement("div");
            name.className = "product-name";
            name.textContent = productName(path);

            wrap.appendChild(img);
            card.append(wrap, name);
            container.appendChild(card);
        });
    }

    async function loadProducts() {
        try {
            const response = await fetch("./products.json", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    "products.json नहीं मिली। इसे repository के root में upload करें।"
                );
            }

            const products = await response.json();

            Object.entries(categories).forEach(([category, containerId]) => {
                const container = document.getElementById(containerId);
                if (!container) return;

                renderProducts(container, products[category] || []);
            });
        } catch (error) {
            console.error("Product loading error:", error);

            Object.values(categories).forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    showMessage(container, error.message, true);
                }
            });
        }
    }

    loadProducts();
});
