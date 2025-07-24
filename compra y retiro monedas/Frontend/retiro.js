let selectedWithdrawal = null;
let selectedPaymentMethod = 'stripe';
let userCoins = 2500; // Simulated - in production this would come from the server

// Update UI based on available coins
function updateUI() {
    document.getElementById('userCoins').textContent = userCoins.toLocaleString();
    document.getElementById('usdValue').textContent = '$' + (userCoins * 0.005).toFixed(2);

    // Enable/disable options based on available coins
    const buttons = [
        { amount: 5, coins: 1000, id: 'btn-5' },
        { amount: 10, coins: 2000, id: 'btn-10' },
        { amount: 25, coins: 5000, id: 'btn-25' },
        { amount: 50, coins: 10000, id: 'btn-50' }
    ];

    buttons.forEach(button => {
        const btnElement = document.getElementById(button.id);
        const cardElement = btnElement.closest('.withdrawal-card');

        if (userCoins >= button.coins) {
            btnElement.disabled = false;
            btnElement.textContent = `Retirar $${button.amount}.00`;
            cardElement.classList.remove('disabled');
            cardElement.onclick = () => initiateWithdrawal(button.amount, button.coins);
        } else {
            btnElement.disabled = true;
            btnElement.textContent = 'Monedas insuficientes';
            cardElement.classList.add('disabled');
            cardElement.onclick = null; // Remove click handler when disabled
        }
    });
}

function initiateWithdrawal(amount, coinsRequired) {
    if (userCoins < coinsRequired) {
        alert('No tienes suficientes monedas para este retiro');
        return;
    }

    selectedWithdrawal = { amount, coinsRequired };
    document.getElementById('withdrawalAmount').textContent = `$${amount}.00 USD`;
    document.getElementById('coinsToUse').textContent = `${coinsRequired.toLocaleString()} monedas`;
    document.getElementById('withdrawalModal').style.display = 'flex';
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;

    // Update buttons
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-method="${method}"]`).classList.add('active');

    // Show/hide fields
    if (method === 'stripe') {
        document.getElementById('stripeFields').style.display = 'block';
        document.getElementById('pagueloFields').style.display = 'none';
    } else {
        document.getElementById('stripeFields').style.display = 'none';
        document.getElementById('pagueloFields').style.display = 'block';
    }
}

function processWithdrawal() {
    if (!selectedWithdrawal) return;

    // Validate fields
    const password = document.getElementById('confirmPassword').value;
    if (!password) {
        alert('Por favor ingresa tu contraseña');
        return;
    }

    if (selectedPaymentMethod === 'stripe') {
        const email = document.getElementById('stripeEmail').value;
        if (!email) {
            alert('Por favor ingresa tu email de Stripe');
            return;
        }
    } else {
        const account = document.getElementById('accountNumber').value;
        const bank = document.getElementById('bankSelect').value;
        if (!account || !bank) {
            alert('Por favor completa los datos bancarios');
            return;
        }
    }

    showLoading();

    // Simulate processing
    setTimeout(() => {
        hideLoading();

        // In a production environment, you would make an API call to your backend here
        /*
        fetch('/process-withdrawal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: selectedWithdrawal.amount,
                coins: selectedWithdrawal.coinsRequired,
                paymentMethod: selectedPaymentMethod,
                email: selectedPaymentMethod === 'stripe' ? document.getElementById('stripeEmail').value : null,
                bankData: selectedPaymentMethod === 'paguelo' ? {
                    account: document.getElementById('accountNumber').value,
                    bank: document.getElementById('bankSelect').value
                } : null
            })
        })
        .then(response => response.json())
        .then(data => {
            // Handle success or failure from the backend
            if (data.success) {
                userCoins -= selectedWithdrawal.coinsRequired;
                updateUI();
                alert(`¡Retiro procesado exitosamente!\n$${selectedWithdrawal.amount} USD será transferido a tu cuenta en 1-3 días hábiles.\n\nMonedas restantes: ${userCoins.toLocaleString()}`);
            } else {
                alert(`Error al procesar el retiro: ${data.message}`);
            }
            closeModal();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.');
            closeModal();
        });
        */

        // Update user coins on successful simulated withdrawal
        userCoins -= selectedWithdrawal.coinsRequired;
        updateUI();

        alert(`¡Retiro procesado exitosamente!\n$${selectedWithdrawal.amount} USD será transferido a tu cuenta en 1-3 días hábiles.\n\nMonedas restantes: ${userCoins.toLocaleString()}`);
        closeModal();
    }, 2000);
}

function closeModal() {
    document.getElementById('withdrawalModal').style.display = 'none';
    document.getElementById('withdrawalForm').reset();
    selectedWithdrawal = null;
}

function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('withdrawalModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize UI when the page loads
updateUI();