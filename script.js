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
        })
        .catch(error => {
            console.error('Erro ao carregar ou processar o arquivo de produtos:', error);
            galleryContainer.innerHTML = "<p class='error-message'>Não foi possível carregar os produtos. Verifique o arquivo products.json.</p>";
        });

    // --- FUNÇÕES DA GALERIA E SCROLL INFINITO (sem alterações) ---
    function loadMoreProducts() {
        if (isLoading) return;
        isLoading = true;
        loader.classList.remove('hidden');

        const startIndex = currentPage * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToLoad = productKeys.slice(startIndex, endIndex);
        
        if (productsToLoad.length === 0 && currentPage > 0) {
            loader.textContent = "Fim dos resultados :)";
        } else {
            loader.classList.add('hidden');
        }

        productsToLoad.forEach(key => {
            const product = allProducts[key];
            const galleryItem = document.createElement('a');
            galleryItem.className = 'gallery-item';
            galleryItem.href = product.link;
            galleryItem.target = '_blank';
            galleryItem.setAttribute('data-id', key);
            galleryItem.setAttribute('data-name', product.name);
            galleryItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="gallery-image">
                <div class="gallery-title">${key}. ${product.name}</div>
            `;
            galleryContainer.appendChild(galleryItem);
        });

        currentPage++;
        isLoading = false;
    }

    // ======================================================
    // === NOVA LÓGICA DE BUSCA (POR NOME OU NÚMERO) ===
    function performSearch() {
        const searchTerm = productNumberInput.value.trim().toLowerCase();
        searchResultContainer.innerHTML = ''; // Limpa resultados anteriores

        if (!searchTerm) {
            searchResultContainer.classList.add('hidden');
            return;
        }

        let matchingKeys = [];

        // 1. Tenta buscar pelo número exato (limpando o '#')
        const cleanNumber = searchTerm.replace('#', '');
        if (allProducts[cleanNumber]) {
            matchingKeys.push(cleanNumber);
        } else {
            // 2. Se não achar por número, busca pelo nome (busca parcial)
            matchingKeys = productKeys.filter(key => 
                allProducts[key].name.toLowerCase().includes(searchTerm)
            );
        }

        displaySearchResults(matchingKeys);
        
        // Rastreia a busca no Google Analytics
        gtag('event', 'search', { 'search_term': searchTerm });
    }

    function displaySearchResults(keys) {
        if (keys.length > 0) {
            keys.forEach(key => {
                const product = allProducts[key];
                const productCard = `
                    <div class="product-card-result">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <a href="${product.link}" target="_blank" class="link-button" data-id="${key}" data-name="${product.name}">
                            ${product.name}
                        </a>
                    </div>
                `;
                searchResultContainer.innerHTML += productCard; // Usa += para adicionar múltiplos resultados
            });
            searchResultContainer.classList.remove('hidden');
        } else {
            searchResultContainer.innerHTML = `<p class="error-message">Nenhum produto encontrado para "${productNumberInput.value}".</p>`;
            searchResultContainer.classList.remove('hidden');
        }
    }
    // ======================================================

    // --- EVENT LISTENERS ---
    window.addEventListener('scroll', () => {
        if (isLoading) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadMoreProducts();
        }
    });

    // Botão e tecla Enter agora chamam a nova função de busca
    searchButton.addEventListener('click', performSearch);
    productNumberInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    // Clique na galeria agora leva direto ao link, mas mantemos o rastreio
    galleryContainer.addEventListener('click', (event) => {
        const galleryItem = event.target.closest('.gallery-item');
        if (galleryItem) {
            const productId = galleryItem.getAttribute('data-id');
            const productName = galleryItem.getAttribute('data-name');
            gtag('event', 'select_item', {
                'item_id': productId,
                'item_name': productName,
                'item_list_name': 'Gallery'
            });
        }
    });

    // Esconde o resultado se o campo de busca for limpo
    productNumberInput.addEventListener('input', () => {
        if (productNumberInput.value.trim() === '') {
            searchResultContainer.innerHTML = '';
            searchResultContainer.classList.add('hidden');
        }
    });
    
    // Rastreamento de clique no link do resultado da busca
    searchResultContainer.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('link-button')) {
            const productId = event.target.getAttribute('data-id');
            const productName = event.target.getAttribute('data-name');
            gtag('event', 'select_item', {
                'item_id': productId,
                'item_name': productName,
                'item_list_name': 'Search Result'
            });
        }
    });
});