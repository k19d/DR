class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.setupEventListeners();
        this.loadStats();
        this.loadProducts();
        this.loadOrders();
    }

    async checkAuth() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user && user.email === 'admin@gh0ststore.com') {
                this.currentUser = user;
                console.log('✅ Admin authenticated');
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    setupEventListeners() {
        // نموذج إضافة المنتج
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });
    }

    async addProduct() {
        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value,
            stock: parseInt(document.getElementById('productStock').value),
            features: document.getElementById('productFeatures').value.split(',').map(f => f.trim()).filter(f => f),
            status: 'active',
            vendorId: 'admin',
            vendorName: 'الإدارة'
        };

        try {
            await firebaseManager.addProduct(formData);
            this.showNotification('✅ تم إضافة المنتج بنجاح');
            this.resetForm();
            this.loadProducts();
            this.loadStats();
        } catch (error) {
            this.showNotification('❌ فشل إضافة المنتج: ' + error.message);
        }
    }

    resetForm() {
        document.getElementById('addProductForm').reset();
    }

    async loadProducts() {
        try {
            const products = await firebaseManager.getProducts('all');
            this.renderProducts(products);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    renderProducts(products) {
        const container = document.getElementById('productsList');
        container.innerHTML = products.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <strong>${product.name}</strong>
                    <span>$${product.price}</span>
                    <span>${product.stock} متبقي</span>
                    <span class="status ${product.status === 'active' ? 'completed' : 'pending'}">
                        ${product.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="btn-small" onclick="adminSystem.editProduct('${product.id}')">تعديل</button>
                    <button class="btn-small btn-danger" onclick="adminSystem.deleteProduct('${product.id}')">حذف</button>
                </div>
            </div>
        `).join('');
    }

    async loadOrders() {
        try {
            // محاكاة بيانات الطلبات
            const orders = [
                { id: 'ORD_12345', total: 99.99, status: 'pending', customerName: 'محمد أحمد' },
                { id: 'ORD_12346', total: 149.99, status: 'completed', customerName: 'أحمد علي' },
                { id: 'ORD_12347', total: 79.99, status: 'pending', customerName: 'فاطمة حسن' }
            ];
            
            this.renderOrders(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    renderOrders(orders) {
        const container = document.getElementById('ordersList');
        container.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <span>${order.id}</span>
                    <span>$${order.total}</span>
                    <span>${order.customerName}</span>
                    <span class="status ${order.status}">
                        ${order.status === 'pending' ? 'قيد الانتظار' : 'مكتمل'}
                    </span>
                </div>
            </div>
        `).join('');
    }

    async loadStats() {
        try {
            const products = await firebaseManager.getProducts('all');
            
            document.getElementById('totalProducts').textContent = products.length;
            document.getElementById('totalSales').textContent = '$' + products.reduce((sum, p) => sum + (p.price * (p.salesCount || 0)), 0);
            document.getElementById('totalOrders').textContent = '25'; // محاكاة
            document.getElementById('totalUsers').textContent = '156'; // محاكاة
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async deleteProduct(productId) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                await firebaseDB.collection('products').doc(productId).delete();
                this.showNotification('✅ تم حذف المنتج بنجاح');
                this.loadProducts();
                this.loadStats();
            } catch (error) {
                this.showNotification('❌ فشل حذف المنتج: ' + error.message);
            }
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
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}