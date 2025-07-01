const API_BASE_URL = 'http://localhost:3000/api';
    
class AuthManager {
  constructor() {
    this.initEventListeners();
    this.checkAuthStatus();
  }

  initEventListeners() {
    // Toggle between login and signup
    document.getElementById('loginToggle').addEventListener('click', () => this.showLogin());
    document.getElementById('signupToggle').addEventListener('click', () => this.showSignup());
    
    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('signupFormElement').addEventListener('submit', (e) => this.handleSignup(e));
  }

  showLogin() {
    document.getElementById('loginToggle').classList.add('active');
    document.getElementById('signupToggle').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('signupForm').classList.remove('active');
    this.clearMessages();
  }

  showSignup() {
    document.getElementById('loginToggle').classList.remove('active');
    document.getElementById('signupToggle').classList.add('active');
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    this.clearMessages();
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const loginData = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      this.showLoading(true);
      const response = await this.apiRequest('/auth/login', 'POST', loginData);
      
      if (response.success) {
        this.showSuccess('¡Inicio de sesión exitoso!');
        this.saveAuthData(response.data);
        setTimeout(() => {
          window.location.href = 'game.html';
        }, 1500);
      } else {
        this.showError(response.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      this.showError('Error de conexión. Verifica tu internet.');
      console.error('Login error:', error);
    } finally {
      this.showLoading(false);
    }
  }

  async handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const signupData = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword')
    };

    // Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return;
    }

    try {
      this.showLoading(true);
      const response = await this.apiRequest('/auth/register', 'POST', signupData);
      
      if (response.success) {
        this.showSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setTimeout(() => {
          this.showLogin();
        }, 2000);
      } else {
        this.showError(response.message || 'Error al registrar usuario');
      }
    } catch (error) {
      this.showError('Error de conexión. Verifica tu internet.');
      console.error('Signup error:', error);
    } finally {
      this.showLoading(false);
    }
  }

  async apiRequest(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    return await response.json();
  }

  saveAuthData(data) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.user.id);
    localStorage.setItem('userName', data.user.name);
    localStorage.setItem('userEmail', data.user.email);
    localStorage.setItem('userBalance', data.user.balance || 50);
  }

  checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token is still valid
      this.apiRequest('/auth/verify')
        .then(response => {
          if (response.success) {
            // User is logged in, redirect to game
            window.location.href = 'game.html';
          } else {
            // Token expired, clear storage
            this.clearAuthData();
          }
        })
        .catch(() => {
          this.clearAuthData();
        });
    }
  }

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userBalance');
  }

  showLoading(show) {
    const loading = document.getElementById('loading');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (show) {
      loading.style.display = 'block';
      loginBtn.disabled = true;
      signupBtn.disabled = true;
    } else {
      loading.style.display = 'none';
      loginBtn.disabled = false;
      signupBtn.disabled = false;
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
  }

  showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    document.getElementById('errorMessage').style.display = 'none';
  }

  clearMessages() {
    document.getElementById('errorMessage').style.display = 'none';
    document.getElementById('successMessage').style.display = 'none';
  }
}

// Social login functions (placeholder - implement with actual providers)
function loginWithGoogle() {
  alert('Integración con Google próximamente disponible');
}

function loginWithFacebook() {
  alert('Integración con Facebook próximamente disponible');
}

function showForgotPassword() {
  const email = prompt('Ingresa tu email para recuperar la contraseña:');
  if (email) {
    // Simulate password reset
    alert('Se ha enviado un enlace de recuperación a tu email (simulado)');
  }
}

// Initialize auth manager
const authManager = new AuthManager();