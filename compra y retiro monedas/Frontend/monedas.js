let selectedPackage = null;

        function selectPackage(coins, price) {
            selectedPackage = { coins, price };
            document.getElementById('packageInfo').innerHTML = 
                `<strong>${coins.toLocaleString()} monedas</strong><br>Precio: <strong>$${price}</strong>`;
            document.getElementById('paymentModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('paymentModal').style.display = 'none';
        }

        function showLoading() {
            document.getElementById('loading').style.display = 'flex';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        // Función para procesar pago con Stripe
        function payWithStripe() {
            if (!selectedPackage) return;
            
            showLoading();
            
            // Simular llamada a API de Stripe
            setTimeout(() => {
                hideLoading();
                
                // Aquí implementarías la integración real con Stripe
                // Ejemplo de URL de checkout de Stripe:
                const stripeUrl = `https://checkout.stripe.com/pay/cs_test_${generateSessionId()}`;
                
                // En producción, harías una llamada a tu backend:
                /*
                fetch('/create-stripe-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        coins: selectedPackage.coins,
                        price: selectedPackage.price,
                        currency: 'usd'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    window.location.href = data.checkout_url;
                });
                */
                
                alert(`Redirigiendo a Stripe para procesar el pago de ${selectedPackage.coins} monedas por $${selectedPackage.price}`);
                closeModal();
            }, 1500);
        }

        // Función para procesar pago con PagueloFacil
        function payWithPagueloFacil() {
            if (!selectedPackage) return;
            
            showLoading();
            
            // Simular llamada a API de PagueloFacil
            setTimeout(() => {
                hideLoading();
                
                // Aquí implementarías la integración real con PagueloFacil
                // En producción, harías una llamada a tu backend:
                /*
                fetch('/create-paguelo-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        coins: selectedPackage.coins,
                        price: selectedPackage.price,
                        currency: 'usd'
                    })
                })
                .then(response => response.json())
                .then(data => {
                    window.location.href = data.payment_url;
                });
                */
                
                alert(`Redirigiendo a PagueloFacil para procesar el pago de ${selectedPackage.coins} monedas por $${selectedPackage.price}`);
                closeModal();
            }, 1500);
        }

        // Función auxiliar para generar ID de sesión (solo para demo)
        function generateSessionId() {
            return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }

        // Cerrar modal al hacer clic fuera de él
        window.onclick = function(event) {
            const modal = document.getElementById('paymentModal');
            if (event.target === modal) {
                closeModal();
            }
        }