document.addEventListener('DOMContentLoaded', () => {
    // Elementos da página
    const searchButton = document.getElementById('search-button');
    const productNumberInput = document.getElementById('product-number');
    const galleryContainer = document.getElementById('gallery-container');
    const loader = document.getElementById('loader');
    const searchResultContainer = document.getElementById('search-result-container');

    // Variáveis de estado
    let allProducts = {};
    let productKeys = [];
    let currentPage = 0;
    const productsPerPage = 12;
    let isLoading = false;

    // --- FUNÇÃO DE LIMPEZA DE EMOJI (ACESSIBILIDADE) ---
    function getCleanAltText(text) {
        if (!text) return '';
        const emojiRegex = /[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26ff]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]/g;
        return text.replace(emojiRegex, '').trim();
    }
    
    // --- CARREGAMENTO INICIAL DOS DADOS ---
    fetch('products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro de rede ao carregar products.json');
            }
            return response.json();
        })
        .then(data => {
            allProducts = data;
            productKeys = Object.keys(allProducts).reverse();
            loadMoreProducts();
            
            // Inicia o observador APÓS os primeiros produtos serem carregados
            if (loader) {
                const observer = new IntersectionObserver(handleIntersection, { rootMargin: '100px' });
                observer.observe(loader);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar ou processar o arquivo de produtos:', error);
            galleryContainer.innerHTML = "<p class='error-message'>Não foi possível carregar os produtos. Verifique o arquivo products.json.</p>";
        });

    // --- LÓGICA DO INTERSECTION OBSERVER ---
    function handleIntersection(entries, observer) {
        const firstEntry = entries[0];
        // a 'isIntersecting' é a propriedade chave que nos diz se o elemento está na tela
        if (firstEntry.isIntersecting && !isLoading) {
            console.log("Loader está visível, carregando mais produtos...");
            loadMoreProducts();
        }
    }

    // --- FUNÇÕES DA GALERIA ---
    function loadMoreProducts() {
        if (isLoading) return;
        
        const startIndex = currentPage * productsPerPage;
        
        // Se o startIndex for maior ou igual ao total de produtos, não há mais nada a carregar.
        if (startIndex >= productKeys.length) {
            loader.textContent = "Fim dos resultados :)";
            return;
        }

        isLoading = true;
        loader.classList.remove('hidden');

        const endIndex = startIndex + productsPerPage;
        const productsToLoad = productKeys.slice(startIndex, endIndex);

        productsToLoad.forEach(key => {
            const product = allProducts[key];
            const galleryItem = createGalleryItem(key, product);
            galleryContainer.appendChild(galleryItem);
        });

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
            <img src="${product.image}" alt="${cleanAltText}" class="gallery-image" loading="lazy" width="280" height="280">
            <div class="gallery-title">${key}. ${product.name}</div>
        `;
        return galleryItem;
    }

    // --- FUNÇÃO DE BUSCA ---
    function displaySearchResults(keys) {
        searchResultContainer.innerHTML = ''; // Limpa antes de adicionar novos
        if (keys.length > 0) {
            keys.forEach(key => {
                const product = allProducts[key];
                const cleanAltText = getCleanAltText(product.name);
                const productCard = document.createElement('div');
                productCard.className = 'product-card-result';
                productCard.innerHTML = `
                    <img src="${product.image}" alt="${cleanAltText}" class="product-image" loading="lazy">
                    <a href="${product.link}" target="_blank" class="link-button" data-id="${key}" data-name="${product.name}">
                        ${product.name}
                    </a>
                `;
                searchResultContainer.appendChild(productCard);
            });
            searchResultContainer.classList.remove('hidden');
        } else {
            searchResultContainer.innerHTML = `<p class="error-message">Nenhum produto encontrado para "${productNumberInput.value}".</p>`;
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
            matchingKeys = productKeys.filter(key => 
                allProducts[key].name.toLowerCase().includes(searchTerm)
            );
        }
        displaySearchResults(matchingKeys);
        gtag('event', 'search', { 'search_term': searchTerm });
    }

    // --- EVENT LISTENERS ---
    searchButton.addEventListener('click', performSearch);
    productNumberInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    const trackItemClick = (container, listName) => {
        container.addEventListener('click', (event) => {
            const item = event.target.closest('.gallery-item, .product-card-result');
            if (item) {
                const linkButton = item.querySelector('.link-button');
                const targetElement = linkButton || item;

                const productId = targetElement.getAttribute('data-id');
                const productName = targetElement.getAttribute('data-name');
                if (productId && productName) {
                    gtag('event', 'select_item', {
                        'item_id': productId,
                        'item_name': productName,
                        'item_list_name': listName
                    });
                }
            }
        });
    };

    trackItemClick(galleryContainer, 'Gallery');
    trackItemClick(searchResultContainer, 'Search Result');

    productNumberInput.addEventListener('input', () => {
        if (productNumberInput.value.trim() === '') {
            searchResultContainer.innerHTML = '';
            searchResultContainer.classList.add('hidden');
        }
    });
});