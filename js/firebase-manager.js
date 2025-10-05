class FirebaseManager {
    constructor() {
        this.db = firebaseDB;
        this.auth = firebaseAuth;
        this.storage = firebaseStorage;
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Firebase Manager...');
    }

    // 🔐 Authentication Methods
    async loginWithGoogle() {
        try {
            const result = await this.auth.signInWithPopup(googleProvider);
            await this.saveUserData(result.user);
            return result;
        } catch (error) {
            console.error('❌ Google login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await this.auth.signOut();
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    }

    // 👥 User Management
    async saveUserData(user) {
        try {
            const userData = {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                isActive: true
            };

            await this.db.collection('users').doc(user.uid).set(userData, { merge: true });
            console.log('✅ User data saved:', user.uid);
        } catch (error) {
            console.error('❌ Error saving user data:', error);
        }
    }

    async getUserData(uid) {
        try {
            const doc = await this.db.collection('users').doc(uid).get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('❌ Error getting user data:', error);
            return null;
        }
    }

    // 🛍️ Products Management
    async getProducts(category = 'all') {
        try {
            let query = this.db.collection('products').where('status', '==', 'active');
            
            if (category !== 'all') {
                query = query.where('category', '==', category);
            }

            const snapshot = await query.get();
            const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('📦 Products loaded:', products.length);
            return products;
        } catch (error) {
            console.error('❌ Error getting products:', error);
            // Return sample products if Firebase fails
            return this.getSampleProducts();
        }
    }

    async addProduct(productData) {
        try {
            const product = {
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active',
                salesCount: 0,
                rating: 5.0
            };

            const docRef = await this.db.collection('products').add(product);
            console.log('✅ Product added with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error adding product:', error);
            throw error;
        }
    }

    // 📦 Orders Management
    async createOrder(orderData) {
        try {
            const order = {
                ...orderData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                orderId: 'ORD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5).toUpperCase()
            };

            const docRef = await this.db.collection('orders').add(order);
            console.log('✅ Order created:', order.orderId);
            
            // إشعار الأدمن بطلب جديد
            await this.notifyAdminNewOrder(order);
            
            return { id: docRef.id, ...order };
        } catch (error) {
            console.error('❌ Error creating order:', error);
            throw error;
        }
    }

    async getOrders(userId) {
        try {
            const snapshot = await this.db.collection('orders')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('❌ Error getting orders:', error);
            return [];
        }
    }

    // 💰 Wallet System
    async createWallet(userId) {
        try {
            const walletData = {
                userId,
                balance: 0,
                currency: 'USD',
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await this.db.collection('wallets').doc(userId).set(walletData);
            return walletData;
        } catch (error) {
            console.error('❌ Error creating wallet:', error);
            throw error;
        }
    }

    async getWallet(userId) {
        try {
            const doc = await this.db.collection('wallets').doc(userId).get();
            if (doc.exists) {
                return doc.data();
            } else {
                return await this.createWallet(userId);
            }
        } catch (error) {
            console.error('❌ Error getting wallet:', error);
            throw error;
        }
    }

    // 🔔 Notifications
    async notifyAdminNewOrder(order) {
        try {
            await this.db.collection('admin_notifications').add({
                type: 'new_order',
                orderId: order.orderId,
                customerName: order.customerName || 'Unknown',
                total: order.total,
                status: 'unread',
                createdAt: new Date().toISOString()
            });
            console.log('🔔 Admin notified of new order');
        } catch (error) {
            console.error('❌ Error notifying admin:', error);
        }
    }

    // 📊 Sample Data for Testing
    getSampleProducts() {
        return [
            {
                id: '1',
                name: 'بوت أندرويد متقدم',
                description: 'بوت أتمتة متطور لأجهزة الأندرويد مع واجهة تحكم',
                price: 49.99,
                category: 'android',
                image: '🤖',
                features: ['أتمتة متقدمة', 'دعم 24/7', 'تحديثات مستمرة'],
                stock: 10,
                status: 'active'
            },
            {
                id: '2',
                name: 'أدوات iOS تطوير',
                description: 'مجموعة أدوات تطوير وتعديل لتطبيقات iOS',
                price: 79.99,
                category: 'ios',
                image: '📱',
                features: ['توقيع تطبيقات', 'أدوات تصحيح', 'دعم فني'],
                stock: 5,
                status: 'active'
            },
            {
                id: '3',
                name: 'سكريبت أمان',
                description: 'سكريبت حماية متقدم للخوادم والمواقع',
                price: 99.99,
                category: 'pc',
                image: '🔒',
                features: ['حماية شاملة', 'مراقبة مستمرة', 'تحديثات أمنية'],
                stock: 8,
                status: 'active'
            }
        ];
    }

    // 🎯 Initialize Sample Data
    async initializeSampleData() {
        try {
            const products = await this.getProducts();
            if (products.length === 0) {
                console.log('🔄 Initializing sample products...');
                for (const product of this.getSampleProducts()) {
                    await this.addProduct(product);
                }
                console.log('✅ Sample products initialized');
            }
        } catch (error) {
            console.error('❌ Error initializing sample data:', error);
        }
    }
}

// Initialize Firebase Manager
const firebaseManager = new FirebaseManager();
window.firebaseManager = firebaseManager;

// Initialize sample data on load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        firebaseManager.initializeSampleData();
    }, 2000);
});