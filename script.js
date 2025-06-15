document.addEventListener('DOMContentLoaded', () => {

    // Lógica do Cookie Consent Banner (LGPD)
    function initGoogleAnalytics() {
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-VC716PNSD2';
        document.head.appendChild(gaScript);
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-VC716PNSD2');
        window.gtag = gtag;
        console.log("Cookie consent aceito. Google Analytics inicializado.");
    }

    CookieConsent.run({
        guiOptions: {
            consentModal: { layout: "box", position: "bottom left" },
            preferencesModal: { layout: "box", position: "right" }
        },
        categories: {
            necessary: { readOnly: true },
            analytics: { autoClear: { cookies: [{ name: /^_ga/ }] } }
        },
        language: {
            default: "pt",
            translations: {
                pt: {
                    consentModal: {
                        title: "Este site usa cookies",
                        description: "Nós usamos cookies e tecnologias de análise para entender melhor nosso público e otimizar nosso conteúdo. Ao aceitar, você nos ajuda a criar uma experiência melhor.",
                        acceptAllBtn: "Aceitar todos",
                        acceptNecessaryBtn: "Rejeitar todos",
                        showPreferencesBtn: "Gerenciar preferências",
                        footer: "<a href=\"/politica-de-privacidade.html\">Política de Privacidade</a>"
                    },
                    preferencesModal: {
                        title: "Preferências de Consentimento",
                        acceptAllBtn: "Aceitar todos",
                        acceptNecessaryBtn: "Rejeitar todos",
                        savePreferencesBtn: "Salvar preferências",
                        closeIconLabel: "Fechar modal",
                        sections: [
                            { title: "Uso de Cookies", description: "Utilizamos cookies para garantir a funcionalidade básica do website e para melhorar a sua experiência online." },
                            { title: "Cookies de Análise (Google Analytics) <span class=\"pm__badge\">Opcional</span>", description: "Estes cookies coletam informações sobre como você usa o nosso site. Todos os dados são anonimizados e não podem ser usados para identificá-lo.", linkedCategory: "analytics" },
                            { title: "Mais informações", description: "Para qualquer dúvida, por favor <a class=\"cc__link\" href=\"/politica-de-privacidade.html\">leia nossa política de privacidade</a>." }
                        ]
                    }
                }
            }
        },
        onAccept: (cookie) => { if(cookie.categories.includes('analytics')) initGoogleAnalytics(); },
        onChange: (cookie) => { if(cookie.categories.includes('analytics')) initGoogleAnalytics(); }
    });

    // --- Lógica Principal da Página ---
    const searchButton = document.getElementById('search-button');
    const productNumberInput = document.getElementById('product-number');
    const galleryContainer = document.getElementById('gallery-container');
    const loader = document.getElementById('loader');
    const searchResultContainer = document.getElementById('search-result-container');

    let allProducts = {};
    let productKeys = [];
    let currentPage = 0;
    const productsPerPage = 12;
    let isLoading = false;
    let itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": []
    };

    function getCleanAltText(text) {
        if (!text) return '';
        const emojiRegex = /[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26ff]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]/g;
        return text.replace(emojiRegex, '').trim();
    }
    
    function updateItemListSchema(newProducts) {
        let schemaTag = document.getElementById('item-list-schema');
        if (!schemaTag) {
            schemaTag = document.createElement('script');
            schemaTag.type = 'application/ld+json';
            schemaTag.id = 'item-list-schema';
            document.head.appendChild(schemaTag);
        }
        newProducts.forEach(productData => {
            const position = itemListSchema.itemListElement.length + 1;
            itemListSchema.itemListElement.push({
                "@type": "ListItem", "position": position,
                "item": {
                    "@type": "Product", "name": getCleanAltText(productData.product.name),
                    "image": `https://cozinha-criativpromo.netlify.app/${productData.product.image}`,
                    "url": productData.product.link, "sku": productData.key
                }
            });
        });
        schemaTag.textContent = JSON.stringify(itemListSchema);
    }
    
    fetch('products.json')
        .then(response => response.ok ? response.json() : Promise.reject('Erro de rede'))
        .then(data => {
            allProducts = data;
            productKeys = Object.keys(allProducts).reverse();
            loadMoreProducts();
            if (loader) {
                const observer = new IntersectionObserver(handleIntersection, { rootMargin: '200px' });
                observer.observe(loader);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar ou processar o arquivo de produtos:', error);
            galleryContainer.innerHTML = "<p class='error-message'>Não foi possível carregar os produtos.</p>";
        });

    function handleIntersection(entries) {
        if (entries[0].isIntersecting && !isLoading) {
            loadMoreProducts();
        }
    }

    function loadMoreProducts() {
        if (isLoading) return;
        const startIndex = currentPage * productsPerPage;
        if (startIndex >= productKeys.length) {
            loader.textContent = "Fim dos resultados :)";
            if(observer) observer.unobserve(loader);
            return;
        }
        isLoading = true;
        const endIndex = startIndex + productsPerPage;
        const productsToLoadKeys = productKeys.slice(startIndex, endIndex);
        const productsToLoadForSchema = [];
        productsToLoadKeys.forEach(key => {
            const product = allProducts[key];
            const galleryItem = createGalleryItem(key, product);
            galleryContainer.appendChild(galleryItem);
            productsToLoadForSchema.push({ key: key, product: product });
        });
        updateItemListSchema(productsToLoadForSchema);
        currentPage++;
        isLoading = false;
    }
    
    function createGalleryItem(key, product) {
        const galleryItem = document.createElement('a');
        galleryItem.className = 'gallery-item';
        galleryItem.href = product.link;
        galleryItem.target = '_blank';
        galleryItem.setAttribute('data-id', key);
        galleryItem.setAttribute('data-name', product.name);
        const cleanAltText = getCleanAltText(product.name);
        galleryItem.innerHTML = `
            <img src="${product.image}" alt="${cleanAltText}" class="gallery-image" loading="lazy" decoding="async" width="280" height="280">
            <div class="gallery-title">${key}. ${product.name}</div>
        `;
        return galleryItem;
    }

    function displaySearchResults(keys) {
        searchResultContainer.innerHTML = '';
        const oldSchema = document.getElementById('product-schema-search');
        if (oldSchema) oldSchema.remove();
        if (keys.length > 0) {
            const firstKey = keys[0];
            const product = allProducts[firstKey];
            const cleanName = getCleanAltText(product.name);
            const schemaScript = document.createElement('script');
            schemaScript.type = 'application/ld+json';
            schemaScript.id = 'product-schema-search';
            schemaScript.text = JSON.stringify({
                "@context": "https://schema.org", "@type": "Product", "name": cleanName,
                "image": `https://cozinha-criativpromo.netlify.app/${product.image}`,
                "description": `Achado de cozinha: ${cleanName}`, "sku": firstKey,
                "offers": { "@type": "Offer", "url": product.link, "availability": "https://schema.org/InStock" }
            });
            document.head.appendChild(schemaScript);
            keys.forEach(key => {
                const currentProduct = allProducts[key];
                const productCard = document.createElement('div');
                productCard.className = 'product-card-result';
                const cleanAltText = getCleanAltText(currentProduct.name);
                productCard.innerHTML = `
                    <img src="${currentProduct.image}" alt="${cleanAltText}" class="product-image" loading="lazy" decoding="async">
                    <a href="${currentProduct.link}" target="_blank" class="link-button" data-id="${key}" data-name="${currentProduct.name}">${currentProduct.name}</a>
                `;
                searchResultContainer.appendChild(productCard);
            });
            searchResultContainer.classList.remove('hidden');
        } else {
            searchResultContainer.innerHTML = `<p class="error-message">Nenhum produto encontrado.</p>`;
            searchResultContainer.classList.remove('hidden');
        }
    }

    function performSearch() {
        const searchTerm = productNumberInput.value.trim().toLowerCase();
        searchResultContainer.classList.add('hidden');
        if (!searchTerm) {
            searchResultContainer.innerHTML = '';
            return;
        }
        let matchingKeys = [];
        const cleanNumber = searchTerm.replace('#', '');
        if (allProducts[cleanNumber]) {
            matchingKeys.push(cleanNumber);
        } else {
            matchingKeys = productKeys.filter(key => allProducts[key].name.toLowerCase().includes(searchTerm));
        }
        displaySearchResults(matchingKeys);
        if (typeof gtag === 'function') gtag('event', 'search', { 'search_term': searchTerm });
    }

    searchButton.addEventListener('click', performSearch);
    productNumberInput.addEventListener('keyup', (event) => { if (event.key === 'Enter') performSearch(); });
    productNumberInput.addEventListener('input', () => {
        if (productNumberInput.value.trim() === '') {
            searchResultContainer.innerHTML = '';
            searchResultContainer.classList.add('hidden');
            const oldSchema = document.getElementById('product-schema-search');
            if (oldSchema) oldSchema.remove();
        }
    });

    const trackItemClick = (container, listName) => {
        container.addEventListener('click', (event) => {
            const item = event.target.closest('.gallery-item, .product-card-result');
            if (item) {
                const link = item.querySelector('.link-button') || item;
                const productId = link.getAttribute('data-id');
                const productName = link.getAttribute('data-name');
                if (productId && productName && typeof gtag === 'function') {
                    gtag('event', 'select_item', { 'item_id': productId, 'item_name': productName, 'item_list_name': listName });
                }
            }
        });
    };
    trackItemClick(galleryContainer, 'Gallery');
    trackItemClick(searchResultContainer, 'Search Result');
});