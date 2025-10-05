// تحديث نظام المصادقة
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupAuthListeners();
        this.setupLoginButtons();
    }

    setupAuthListeners() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.showUserMenu(user);
            } else {
                this.showLoginButtons();
            }
        });
    }

    setupLoginButtons() {
        document.getElementById('googleLoginBtn').addEventListener('click', () => {
            this.signInWithGoogle();
        });

        document.getElementById('guestLoginBtn').addEventListener('click', () => {
            this.signInAsGuest();
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.signOut();
        });
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            await firebase.auth().signInWithPopup(provider);
        } catch (error) {
            console.error('خطأ في تسجيل الدخول:', error);
        }
    }

    signInAsGuest() {
        // يمكنك إضافة منطق الدخول كزائر هنا
        console.log('الدخول كزائر');
    }

    async signOut() {
        try {
            await firebase.auth().signOut();
        } catch (error) {
            console.error('خطأ في تسجيل الخروج:', error);
        }
    }

    showUserMenu(user) {
        document.getElementById('userMenu').classList.remove('hidden');
        document.getElementById('loginButtons').classList.add('hidden');
        document.getElementById('userName').textContent = user.displayName || 'مستخدم';
    }

    showLoginButtons() {
        document.getElementById('userMenu').classList.add('hidden');
        document.getElementById('loginButtons').classList.remove('hidden');
    }
}

// تهيئة نظام المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});