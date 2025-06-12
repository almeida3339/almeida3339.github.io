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
        const productNumber = productNumberInput.value;
        const product = products[productNumber];

        resultContainer.innerHTML = ''; // Limpa o resultado anterior

        if (product) {
            // Cria o card do produto se ele for encontrado
            const productCard = `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <a href="${product.link}" target="_blank" class="link-button">${product.name}</a>
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
});