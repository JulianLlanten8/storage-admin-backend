class Auth {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('user_data') || 'null');
        if (window.location.pathname === '/') {
            this.init();
        }
    }

    async init() {
        await this.setupCSRF();
        
        // Si ya está autenticado, redirigir inmediatamente
        if (this.token && this.user) {
            this.redirectToDashboard();
            return;
        }
        
        this.setupLogin();
    }

    async setupCSRF() {
        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error setting CSRF token:', error);
        }
    }

    setupLogin() {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const button = e.target.querySelector('button[type="submit"]');

        if (!email || !password) {
            this.showError('Por favor completa todos los campos');
            return;
        }

        Utils.showLoading(button);
        button.textContent = 'Iniciando sesión...';

        try {
            const result = await ApiService.login({ email, password });

            if (result.success) {
                // Tu API retorna { data: { token, user }, message, error }
                this.token = result.data.token;
                this.user = result.data.user;
                
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('user_data', JSON.stringify(this.user));
                
                this.showSuccess('¡Login exitoso! Redirigiendo...');
                
                setTimeout(() => this.redirectToDashboard(), 1000);
            } else {
                const errorMsg = result.message || result.error || 'Error en el login';
                this.showError(errorMsg);
                console.error('Login error:', result);
            }
        } catch (error) {
            this.showError('Error de conexión: ' + error.message);
            console.error('Login exception:', error);
        } finally {
            Utils.hideLoading(button);
            button.textContent = 'Iniciar Sesión';
        }
    }

    redirectToDashboard() {
        const isAdmin = this.user.roles && this.user.roles.some(role => role.name === 'admin');
        if (isAdmin) {
            window.location.href = '/admin';
        } else {
            window.location.href = '/user';
        }
    }

    // Métodos para mostrar notificaciones con SweetAlert2
    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
        });
    }

    showError(message) {
        Swal.fire({
            icon: 'error',
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true
        });
    }

    static async logout() {
        try {
            await ApiService.logout();
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            window.location.href = '/';
        }
    }

    static async checkAuth() {
        const token = localStorage.getItem('auth_token');
        const user = JSON.parse(localStorage.getItem('user_data') || 'null');
        
        
        if (!token || !user) {
            window.location.href = '/';
            return false;
        }

        try {
            const result = await ApiService.getUser();
            
            // Tu API retorna { success, data, message, error }
            if (result.success && result.data) {
                return true;
            }
            
            // Si hay error de autenticación
            if (result.status === 401 || result.status === 403) {
                await this.logout();
                return false;
            }
            
            // Otros errores, permitir continuar
            return true;
            
        } catch (error) {
            console.error('❌ Error verificando auth:', error);
            return true;
        }
    }

    static isAdmin() {
        const user = JSON.parse(localStorage.getItem('user_data') || 'null');
        return user && user.roles && user.roles.some(role => role.name === 'admin');
    }
}

window.Auth = Auth;

document.addEventListener('DOMContentLoaded', () => {
    new Auth();
});