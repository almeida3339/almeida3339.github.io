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

    // --- FUNÇÕES DA GALERIA E SCROLL INFINITO ---
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
            const galleryItem = createGalleryItem(key, product); // Usa a nova função
            galleryContainer.appendChild(galleryItem);
        });

        currentPage++;
        isLoading = false;
    }
    
    // --- NOVA FUNÇÃO REUTILIZÁVEL PARA CRIAR CARDS ---
    function createGalleryItem(key, product) {
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
        return galleryItem;
    }

    // --- FUNÇÃO DE BUSCA ATUALIZADA ---
    function displaySearchResults(keys) {
        if (keys.length > 0) {
            keys.forEach(key => {
                const product = allProducts[key];
                const productCard = createGalleryItem(key, product); // Reutiliza a função de criar cards
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
        searchResultContainer.innerHTML = ''; // Limpa resultados anteriores
        searchResultContainer.classList.add('hidden'); // Esconde antes da nova busca

        if (!searchTerm) {
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
    window.addEventListener('scroll', () => {
        if (isLoading) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadMoreProducts();
        }
    });

    searchButton.addEventListener('click', performSearch);
    productNumberInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });

    const trackItemClick = (container, listName) => {
        container.addEventListener('click', (event) => {
            const galleryItem = event.target.closest('.gallery-item');
            if (galleryItem) {
                const productId = galleryItem.getAttribute('data-id');
                const productName = galleryItem.getAttribute('data-name');
                gtag('event', 'select_item', {
                    'item_id': productId,
                    'item_name': productName,
                    'item_list_name': listName
                });
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