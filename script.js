/* =====================================================
   BHARAT DISTRIBUTORS - PRODUCT LOADER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Current year
    const yearElement = document.getElementById("current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // GitHub repository settings
    const GITHUB_OWNER = "manishhaatwa-dot";
    const GITHUB_REPO = "Bharat-Dishtributors-pali";
    const GITHUB_BRANCH = "main";

    // Product folders and their HTML containers
    const categories = {
        cello: "cello-products",
        bluline: "bluline-products",
        patel: "patel-products",
        ritu: "ritu-products",
        pearl: "pearl-products",
        aera: "aera-products",
        other: "other-products"
    };

    const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif"
    ];

    async function loadProducts() {
        for (const [category, containerId] of Object.entries(categories)) {
            const container = document.getElementById(containerId);

            if (!container) continue;

            try {
                const apiUrl =
                    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/assets/products/${category}?ref=${GITHUB_BRANCH}`;

                const response = await fetch(apiUrl, {
                    cache: "no-store"
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(
                            `Folder not found: assets/products/${category}`
                        );
                    }

                    if (response.status === 403) {
                        throw new Error(
                            "GitHub API rate limit exceeded. Please try again later."
                        );
                    }

                    throw new Error(`GitHub API error: ${response.status}`);
                }

                const files = await response.json();

                if (!Array.isArray(files)) {
                    throw new Error("Unexpected GitHub response.");
                }

                const images = files.filter(file =>
                    file.type === "file" &&
                    imageExtensions.some(extension =>
                        file.name.toLowerCase().endsWith(extension)
                    )
                );

                renderProducts(container, images, category);

            } catch (error) {
                console.error(`Error loading ${category}:`, error);
                showMessage(container, error.message, true);
            }
        }
    }

    function makeProductName(filename) {
        let name = filename
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // Capitalize English words; Hindi names remain unchanged.
        if (/^[a-zA-Z]/.test(name)) {
            name = name.replace(/\b[a-z]/g, letter =>
                letter.toUpperCase()
            );
        }

        return name;
    }

    function renderProducts(container, images, category) {
        container.innerHTML = "";

        if (!images.length) {
            showMessage(
                container,
                "इस कैटेगरी के प्रोडक्ट्स जल्द जोड़े जाएंगे।"
            );
            return;
        }

        images.forEach(file => {
            const card = document.createElement("article");
            card.className = "product-card";

            const imageWrap = document.createElement("div");
            imageWrap.className = "product-image-wrap";

            const image = document.createElement("img");
            image.className = "product-image";
            image.alt = `${makeProductName(file.name)} - Bharat Distributors Pali`;
            image.loading = "lazy";
            image.decoding = "async";

            // Use the file's GitHub download URL.
            image.src = file.download_url;

            image.onerror = () => {
                imageWrap.innerHTML = `
                    <div class="empty-collection">
                        <i class="fa-regular fa-image"></i>
                        <p>Image load नहीं हुई</p>
                    </div>
                `;
            };

            imageWrap.appendChild(image);

            const name = document.createElement("div");
            name.className = "product-name";
            name.textContent = makeProductName(file.name);

            card.appendChild(imageWrap);
            card.appendChild(name);
            container.appendChild(card);
        });
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

    loadProducts();
});
