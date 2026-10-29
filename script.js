/* =====================================================
   BHARAT DISTRIBUTORS - PRODUCT LOADER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    const GITHUB_OWNER = "manishhaatwa-dot";
    const GITHUB_REPO = "Bharat-Dishtributors-pali";
    const GITHUB_BRANCH = "main";

    // Folder names must match the GitHub folder names.
    const categories = {
        cello: "cello-products",
        bluline: "bluline-products",
        patel: "patel-products",
        pearl: "pearl-products",
        aera: "aera-products",
        ritu: "ritu-products",
        other: "other-products"
    };

    const imageExtensions = [
        ".jpg", ".jpeg", ".png", ".webp", ".gif"
    ];

    const apiBase =
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents`;

    async function getFolderContents(path) {
        const url =
            `${apiBase}/${path.split("/").map(encodeURIComponent).join("/")}` +
            `?ref=${encodeURIComponent(GITHUB_BRANCH)}`;

        const response = await fetch(url, { cache: "no-store" });

        if (response.status === 404) {
            throw new Error(`GitHub folder not found: ${path}`);
        }

        if (response.status === 403) {
            throw new Error(
                "GitHub API rate limit exceeded. Thodi der baad dobara try karein."
            );
        }

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(`Folder contents read nahi ho sake: ${path}`);
        }

        return data;
    }

    function isImageFile(filename) {
        const lower = filename.toLowerCase();
        return imageExtensions.some(ext => lower.endsWith(ext));
    }

    // Recursively collect images from a category and its subfolders.
    async function collectImages(path, results = []) {
        const items = await getFolderContents(path);

        for (const item of items) {
            if (item.type === "file" && isImageFile(item.name)) {
                results.push(item);
            } else if (item.type === "dir") {
                await collectImages(item.path, results);
            }
        }

        return results;
    }

    function makeProductName(filename) {
        let name = filename
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        if (/^[a-zA-Z]/.test(name)) {
            name = name.replace(/\b[a-z]/g, letter =>
                letter.toUpperCase()
            );
        }

        return name || "Bharat Distributors Product";
    }

    function renderProducts(container, images) {
        container.innerHTML = "";

        if (!images.length) {
            showMessage(
                container,
                "इस कैटेगरी में अभी कोई प्रोडक्ट इमेज नहीं मिली।"
            );
            return;
        }

        images.sort((a, b) =>
            a.path.localeCompare(b.path, undefined, {
                numeric: true,
                sensitivity: "base"
            })
        );

        for (const file of images) {
            const card = document.createElement("article");
            card.className = "product-card";

            const imageWrap = document.createElement("div");
            imageWrap.className = "product-image-wrap";

            const image = document.createElement("img");
            image.className = "product-image";
            image.alt =
                `${makeProductName(file.name)} - Bharat Distributors Pali`;
            image.loading = "lazy";
            image.decoding = "async";

            // Use the GitHub-provided image URL.
            image.src = file.download_url;

            image.onerror = () => {
                image.style.display = "none";

                const errorBox = document.createElement("div");
                errorBox.className = "empty-collection";

                const message = document.createElement("p");
                message.textContent = "Image load नहीं हुई";

                errorBox.appendChild(message);
                imageWrap.appendChild(errorBox);
            };

            imageWrap.appendChild(image);

            const name = document.createElement("div");
            name.className = "product-name";
            name.textContent = makeProductName(file.name);

            card.appendChild(imageWrap);
            card.appendChild(name);
            container.appendChild(card);
        }
    }

    function showMessage(container, message, isError = false) {
        container.innerHTML = "";

        const box = document.createElement("div");
        box.className = "empty-collection";

        const icon = document.createElement("i");
        icon.className = isError
            ? "fa-solid fa-circle-exclamation"
            : "fa-regular fa-images";

        const text = document.createElement("p");
        text.textContent = message;

        box.appendChild(icon);
        box.appendChild(text);
        container.appendChild(box);
    }

    async function loadCategory(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const folderPath = `assets/products/${category}`;

        try {
            container.innerHTML =
                '<div class="loading-products">Products लोड हो रहे हैं...</div>';

            const images = await collectImages(folderPath);
            renderProducts(container, images);
        } catch (error) {
            console.error(`Error loading ${category}:`, error);
            showMessage(container, error.message, true);
        }
    }

    async function loadProducts() {
        // Load categories independently so one missing folder
        // does not stop the remaining categories from loading.
        await Promise.all(
            Object.entries(categories).map(([category, containerId]) =>
                loadCategory(category, containerId)
            )
        );
    }

    loadProducts();
});
