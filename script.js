/* BHARAT DISTRIBUTORS - PRODUCTS JSON LOADER */

document.addEventListener("DOMContentLoaded", async () => {
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
        container.replaceChildren();

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

        return decodeURIComponent(filename)
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function renderProducts(container, paths) {
        container.replaceChildren();

        if (!Array.isArray(paths) || paths.length === 0) {
            showMessage(container, "इस कैटेगरी में अभी कोई प्रोडक्ट नहीं मिला।");
            return;
        }

        paths.forEach(path => {
            const card = document.createElement("article");
            card.className = "product-card";

            const wrap = document.createElement("div");
            wrap.className = "product-image-wrap";

            const img = document.createElement("img");
            img.className = "product-image";
            img.alt = productName(path) + " - Bharat Distributors";
            img.loading = "lazy";
            img.decoding = "async";

            // products.json contains paths such as:
            // assets/products/aera/All Type Aera product.jpg
            img.src = "./" + path.replace(/^\.?\//, "");

            img.onerror = () => {
                img.style.display = "none";

                const errorText = document.createElement("p");
                errorText.className = "empty-collection";
                errorText.textContent = "Image load nahi hui: " + path;

                wrap.appendChild(errorText);
            };

            const name = document.createElement("div");
            name.className = "product-name";
            name.textContent = productName(path);

            wrap.append(img);
            card.append(wrap, name);
            container.appendChild(card);
        });
    }

    try {
        const response = await fetch("./products.json?v=" + Date.now(), {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("products.json load nahi hui. HTTP " + response.status);
        }

        const products = await response.json();

        Object.entries(categories).forEach(([category, containerId]) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            renderProducts(container, products[category]);
        });

    } catch (error) {
        console.error("Products loading error:", error);

        Object.values(categories).forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                showMessage(
                    container,
                    "Products load nahi hue. products.json check karein.",
                    true
                );
            }
        });
    }
});
