document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-button');
    const productNumberInput = document.getElementById('product-number');
    const resultContainer = document.getElementById('result-container');
    let products = {};

    // Carrega o banco de dados de produtos do arquivo JSON
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            console.log('Banco de dados de produtos carregado!');
        })
        .catch(error => console.error('Erro ao carregar produtos:', error));

    const findProduct = () => {
        // Pega o valor bruto do input e remove espaços em branco no início e no fim
        const rawInput = productNumberInput.value.trim();

        // ==================================================================
        // AJUSTE PARA ACEITAR O "#" NO INPUT
        // Verifica se o texto começa com '#' e, se sim, remove o primeiro caractere.
        // Se não começar com '#', usa o texto como está.
        const productNumber = rawInput.startsWith('#') ? rawInput.slice(1) : rawInput;
        // ==================================================================

        // RASTREAMENTO DA BUSCA
        // Envia um evento para o Google Analytics registrando o número buscado (já limpo).
        gtag('event', 'search', {
            'search_term': productNumber
        });
        
        const product = products[productNumber];

        resultContainer.innerHTML = ''; // Limpa o resultado anterior

        if (product) {
            // Adicionamos 'data-id' e 'data-name' para rastrear o clique depois
            const productCard = `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <a href="${product.link}" target="_blank" class="link-button" data-id="${productNumber}" data-name="${product.name}">
                        ${product.name}
                    </a>
                </div>
            `;
            resultContainer.innerHTML = productCard;
        } else {
            // Mostra uma mensagem de erro se não encontrar
            resultContainer.innerHTML = '<p class="error-message">Produto não encontrado. Tente outro número.</p>';
        }
    };

    // Adiciona o evento de clique no botão
    searchButton.addEventListener('click', findProduct);

    // Opcional: permite buscar apertando "Enter" no campo de número
    productNumberInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            findProduct();
        }
    });

    // RASTREAMENTO DO CLIQUE NO LINK
    // Adiciona um "escutador" de cliques no container de resultado.
    resultContainer.addEventListener('click', (event) => {
        // Verifica se o clique foi em um botão de link de produto
        if (event.target && event.target.classList.contains('link-button')) {
            const productId = event.target.getAttribute('data-id');
            const productName = event.target.getAttribute('data-name');

            // Envia um evento para o Google Analytics registrando o clique
            gtag('event', 'select_item', {
                'item_id': productId,
                'item_name': productName
            });
        }
    });
});