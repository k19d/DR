class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        // الانتظار حتى يتم تحميل Firebase
        if (typeof firebaseAuth === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }

        firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                await this.handleLogin(user);
            } else {
                this.handleLogout();
            }
        });
    }

    async loginWithGoogle() {
        try {
            const result = await firebaseManager.loginWithGoogle();
            this.showNotification('✅ تم التسجيل بنجاح!');
            return result;
        } catch (error) {
            this.showError('❌ فشل التسجيل: ' + error.message);
            throw error;
        }
    }

    async loginAsGuest() {
        this.handleLogin({
            uid: 'guest_' + Date.now(),
            displayName: 'زائر',
            email: null,
            isAnonymous: true
        });
        this.showNotification('👋 مرحباً بك كزائر!');
    }

    async logout() {
        try {
            await firebaseManager.logout();
            this.showNotification('👋 تم تسجيل الخروج');
        } catch (error) {
            this.showError('❌ فشل تسجيل الخروج: ' + error.message);
        }
    }

    async handleLogin(user) {
        this.currentUser = user;
        this.updateUI(user);
        this.hideLoginScreen();
        this.showMainApp();
        
        // إنشاء محفظة للمستخدم الجديد
        if (!user.isAnonymous) {
            await firebaseManager.getWallet(user.uid);
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.showLoginScreen();
        this.hideMainApp();
    }

    updateUI(user) {
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = user.displayName || 'زائر';
        }
    }

    hideLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'none';
        }
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
        }
    }

    showMainApp() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
    }

    hideMainApp() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.add('hidden');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: var(--bg-dark);
            padding: 1rem 2rem;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 255, 65, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showError(message) {
        this.showNotification('❌ ' + message);
    }
}

// Initialize auth system
const authSystem = new AuthSystem();
window.authSystem = authSystem;