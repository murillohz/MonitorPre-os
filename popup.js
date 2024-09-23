document.getElementById('price-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const productUrl = document.getElementById('product-url').value;
    const targetPrice = document.getElementById('target-price').value;

    if (!productUrl || !targetPrice) {
        alert("Preencha todos os campos.");
        return;
    }

    // Armazena o produto e o preço no armazenamento local
    chrome.storage.local.get('products', function (data) {
        let products = data.products || [];
        products.push({ url: productUrl, price: targetPrice, history: [] });

        chrome.storage.local.set({ products }, function () {
            alert('Produto adicionado com sucesso!');
            displayProducts();
        });
    });

    document.getElementById('product-url').value = '';
    document.getElementById('target-price').value = '';
});

// Função para exibir os produtos monitorados
function displayProducts() {
    chrome.storage.local.get('products', function (data) {
        const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        const products = data.products || [];
        products.forEach(function (product, index) {
            const li = document.createElement('li');
            li.textContent = `Produto: ${product.url}, Preço Alvo: ${product.price}`;
            

            const showHistoryButton = document.createElement('button');
            showHistoryButton.textContent = 'Mostrar Histórico';
            showHistoryButton.onclick = function () {
                displayPriceHistory(product);
            };

            // Remover o produto
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remover';
            removeButton.classList.add('remove-button');
            removeButton.onclick = function () {
                removeProduct(index);
            };

            // Adicionar os botões ao item da lista
            li.appendChild(showHistoryButton);
            li.appendChild(removeButton);
            productList.appendChild(li);
        });
    });
}

// Histórico de preços
function displayPriceHistory(product) {
    const history = product.history || [];
    
    if (history.length === 0) {
        alert('Nenhum histórico de preços disponível para este produto.');
        return;
    }
    
    let historyText = `Histórico de Preços para ${product.url}:\n\n`;
    history.forEach(entry => {
        historyText += `Data: ${entry.date}, Preço: R$${entry.price.toFixed(2)}\n`;
    });
    
    alert(historyText);
}

// Remover produto
function removeProduct(index) {
    chrome.storage.local.get('products', function (data) {
        let products = data.products || [];
        products.splice(index, 1);  

        chrome.storage.local.set({ products }, function () {
            alert('Produto removido com sucesso!');
            displayProducts();  
        });
    });
}

document.getElementById('export-csv').addEventListener('click', function () {
    chrome.storage.local.get('products', function (data) {
        const products = data.products || [];
        let csvContent = "data:text/csv;charset=utf-8,Produto,Data,Preço\n";

        products.forEach(function (product) {
            product.history.forEach(function (entry) {
                csvContent += `${product.url},${entry.date},${entry.price.toFixed(2)}\n`;
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'historico_precos.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

displayProducts();
