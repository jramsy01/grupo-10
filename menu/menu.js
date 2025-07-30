// Estado simulado; en producción vendría del servidor
let userCoins = 1250;
let username  = "Jugador123";

// Actualiza avatar, nombre y monedas en la UI
function updateUserInfo() {
  document.getElementById('username').textContent  = username;
  document.getElementById('userCoins').textContent = userCoins.toLocaleString();
}

// Abre el modal de dificultad de bots
function openBotDifficulty() {
  document.getElementById('botDifficultyModal').classList.add('active');
}

// Cierra el modal
function closeModal() {
  document.getElementById('botDifficultyModal').classList.remove('active');
  document.getElementById('hardWarning').style.display = 'none';
}

// Muestra el overlay de carga
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

// Oculta el overlay de carga
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

// Inicia la partida contra bot según la dificultad
function startBotGame(difficulty) {
  if (difficulty === 'hard') {
    if (userCoins < 5) {
      return alert('No tienes suficientes monedas para jugar en modo difícil.');
    }
    // Confirmación extra
    if (!confirm('¿Seguro? Se cobrarán 5 monedas. Si ganas, obtendrás 10.')) return;
    userCoins -= 5;
    updateUserInfo();
  }

  showLoading();
  setTimeout(() => {
    hideLoading();
    closeModal();
    // Aquí redirigirías realmente a tu juego:
    // window.location.href = `/game/bot/${difficulty}`;
    simulateGameResult(difficulty);
  }, 2000);
}

// Simula el resultado (solo demo)
function simulateGameResult(difficulty) {
  const winChance = difficulty === 'easy'
                  ? 0.8
                  : difficulty === 'medium'
                  ? 0.6
                  : 0.4;
  const won = Math.random() < winChance;

  if (difficulty === 'hard') {
    if (won) {
      userCoins += 10;
      updateUserInfo();
      alert('¡Ganaste la partida difícil y recibiste 10 monedas!');
    } else {
      alert('Perdiste la partida difícil. Has perdido las 5 monedas apostadas.');
    }
  } else {
    alert(won
      ? `¡Felicidades! Ganaste en modo ${difficulty}.`
      : `Perdiste la partida en modo ${difficulty}.`);
  }
}

// Jugar contra amigo (demo)
function playWithFriend() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    alert('Función de juego con amigos próximamente disponible.');
    // En producción: window.location.href = '/game/multiplayer';
  }, 1500);
}

// Abrir tienda de monedas (demo)
function openCoinStore() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    alert('Redirigiendo a la tienda de monedas...');
    // window.location.href = '/store';
  }, 1500);
}

// Abrir retiro de dinero (demo)
function openWithdrawal() {
  showLoading();
  setTimeout(() => {
    hideLoading();
    alert('Redirigiendo a la sección de retiros...');
    // window.location.href = '/withdrawal';
  }, 1500);
}

// Muestra advertencia al pasar el ratón sobre Difícil
document.addEventListener('DOMContentLoaded', () => {
  updateUserInfo();
  const hardCard = document.querySelector('.difficulty-card.hard');
  hardCard?.addEventListener('mouseenter', () => {
    document.getElementById('hardWarning').style.display = 'block';
  });
  hardCard?.addEventListener('mouseleave', () => {
    document.getElementById('hardWarning').style.display = 'none';
  });
});

// Cierra el modal haciendo click fuera de él
window.onclick = (e) => {
  const modal = document.getElementById('botDifficultyModal');
  if (e.target === modal) closeModal();
};
