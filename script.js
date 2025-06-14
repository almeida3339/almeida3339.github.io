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
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            productKeys = Object.keys(allProducts);
            loadMoreProducts();
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));

    // --- FUNÇÕES DA GALERIA E SCROLL INFINITO ---
    function loadMoreProducts() {
        if (isLoading) return;
        isLoading = true;
        loader.classList.remove('hidden');

        const startIndex = currentPage * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToLoad = productKeys.slice(startIndex, endIndex);

        productsToLoad.forEach(key => {
            const product = allProducts[key];
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-id', key);
            galleryItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="gallery-image">
                <div class="gallery-title">${key}. ${product.name}</div>
            `;
            galleryContainer.appendChild(galleryItem);
        });

        currentPage++;
        isLoading = false;
        loader.classList.add('hidden');
    }

    // --- FUNÇÃO DE BUSCA ATUALIZADA ---
    function findAndDisplayProduct(productNumber) {
        const product = allProducts[productNumber];

        if (product) {
            const productCard = `
                <div class="product-card-result">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <a href="${product.link}" target="_blank" class="link-button" data-id="${productNumber}" data-name="${product.name}">
                        ${product.name}
                    </a>
                </div>
            `;
            searchResultContainer.innerHTML = productCard;
            searchResultContainer.classList.remove('hidden'); // Mostra o container

            // Rastreia o evento
            gtag('event', 'view_item', {
                'item_id': productNumber,
                'item_name': product.name
            });
        } else {
            searchResultContainer.innerHTML = `<p class="error-message">Produto não encontrado. Tente outro número.</p>`;
            searchResultContainer.classList.remove('hidden'); // Mostra o erro
        }
    }

    // --- EVENT LISTENERS ---

    // Scroll Infinito
    window.addEventListener('scroll', () => {
        if (isLoading) return;
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
            loadMoreProducts();
        }
    });

    // Botão de busca
    searchButton.addEventListener('click', () => {
        const productNumber = productNumberInput.value.trim().replace('#', '');
        if (productNumber) {
            findAndDisplayProduct(productNumber);
            // Rastreia a busca
            gtag('event', 'search', { 'search_term': productNumber });
        }
    });

    // Busca com a tecla Enter
    productNumberInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    // Clique em um item da galeria
    galleryContainer.addEventListener('click', (event) => {
        const galleryItem = event.target.closest('.gallery-item');
        if (galleryItem) {
            const productId = galleryItem.getAttribute('data-id');
            findAndDisplayProduct(productId);
            // Rola a página para o topo para que o resultado seja visível
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // NOVA FUNÇÃO: Esconde o resultado se o campo de busca for limpo
    productNumberInput.addEventListener('input', () => {
        if (productNumberInput.value.trim() === '') {
            searchResultContainer.innerHTML = '';
            searchResultContainer.classList.add('hidden');
        }
    });
    
    // Rastreamento de clique no link de afiliado
    searchResultContainer.addEventListener('click', (event) => {
        if (event.target && event.target.classList.contains('link-button')) {
            const productId = event.target.getAttribute('data-id');
            const productName = event.target.getAttribute('data-name');
            gtag('event', 'select_item', {
                'item_id': productId,
                'item_name': productName
            });
        }
    });
});