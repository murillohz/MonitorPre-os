chrome.runtime.onInstalled.addListener(() => {
    console.log("Service worker instalado!");

    // Verifica preços imediatamente após a instalação
    verificarPrecos();

    // Define um intervalo para verificar os preços a cada 30 minutos
    setInterval(verificarPrecos, 1800000); // 30 minutos em milissegundos
});

// Função para verificar os preços
function verificarPrecos() {
    chrome.storage.local.get('products', function (data) {
        const products = data.products || [];

        products.forEach(function (product) {
            const currentPrice = Math.random() * 100; // Simulação de preço aleatório

            if (currentPrice <= product.price) {
                // Cria uma notificação quando o preço cair abaixo do preço alvo
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Alerta de Preço!',
                    message: `O produto ${product.url} está agora por R$${currentPrice.toFixed(2)}!`,
                    buttons: [
                        { title: 'Ver Produto' }
                    ],
                    requireInteraction: true  // Mantém a notificação até que o usuário interaja
                }, function(notificationId) {
                    // Adiciona listener para o clique no botão da notificação
                    chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
                        if (notifId === notificationId && btnIdx === 0) {
                            chrome.tabs.create({ url: product.url });
                        }
                    });
                });
            }

            // Atualiza o histórico de preços
            if (!product.history) {
                product.history = [];
            }
            product.history.push({
                date: new Date().toLocaleDateString(),
                price: currentPrice
            });
        });

        // Atualiza os produtos com o histórico de preços
        chrome.storage.local.set({ products });
    });
}