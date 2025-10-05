class VendorSystem {
    constructor() {
        this.currentUser = null;
        this.vendorId = null;
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.loadVendorStats();
        this.loadMyProducts();
    }

    async checkAuth() {
        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.vendorId = user.uid;
                console.log('✅ Vendor authenticated:', user.email);
            } else {
                window.location.href = 'index.html';
            }
        });
    }

    showAddProductForm() {
        document.getElementById('vendorProductModal').classList.remove('hidden');
    }

    hideAddProductForm() {
        document.getElementById('vendorProductModal').classList.add('hidden');
    }

    async addProduct() {
        const formData = {
            name: document.getElementById('vendorProductName').value,
            description: document.getElementById('vendorProductDescription').value,
            price: parseFloat(document.getElementById('vendorProductPrice').value),
            category: document.getElementById('vendorProductCategory').value,
            image: document.getElementById('vendorProductImage').value,
            stock: parseInt(document.getElementById('vendorProductStock').value),
            features: document.getElementById('vendorProductFeatures').value.split(',').map(f => f.trim()).filter(f => f),
            status: 'active',
            vendorId: this.vendorId,
            vendorName: this.currentUser.displayName || this.currentUser.email,
            vendorEmail: this.currentUser.email
        };

        try {
            await firebaseManager.addProduct(formData);
            this.showNotification('✅ تم إضافة المنتج بنجاح');
            this.hideAddProductForm();
            this.resetForm();
            this.loadMyProducts();
            this.loadVendorStats();
        } catch (error) {
            this.showNotification('❌ فشل إضافة المنتج: ' + error.message);
        }
    }

    resetForm() {
        document.getElementById('vendorProductForm').reset();
    }

    async loadMyProducts() {
        try {
            const allProducts = await firebaseManager.getProducts('all');
            const myProducts = allProducts.filter(product => product.vendorId === this.vendorId);
            this.renderMyProducts(myProducts);
        } catch (error) {
            console.error('Error loading vendor products:', error);
        }
    }

    renderMyProducts(products) {
        const container = document.getElementById('vendorProductsList');
        
        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد منتجات مضافة حتى الآن</p>
                    <button class="btn-primary" onclick="vendorSystem.showAddProductForm()">إضافة أول منتج</button>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">${product.image}</div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-features">
                    ${product.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="product-price">$${product.price}</div>
                <div class="product-stock">المتبقي: ${product.stock}</div>
                <div class="product-meta">
                    <small>المبيعات: ${product.salesCount || 0}</small>
                    <small>الحالة: ${product.status === 'active' ? 'نشط' : 'غير نشط'}</small>
                </div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="vendorSystem.editProduct('${product.id}')">تعديل</button>
                    <button class="btn-secondary" onclick="vendorSystem.deleteProduct('${product.id}')">حذف</button>
                </div>
            </div>
        `).join('');
    }

    async loadVendorStats() {
        try {
            const allProducts = await firebaseManager.getProducts('all');
            const myProducts = allProducts.filter(product => product.vendorId === this.vendorId);
            
            const totalEarnings = myProducts.reduce((sum, product) => {
                return sum + (product.price * (product.salesCount || 0));
            }, 0);

            document.getElementById('vendorEarnings').textContent = '$' + totalEarnings.toFixed(2);
            document.getElementById('vendorProducts').textContent = myProducts.length;
            document.getElementById('vendorOrders').textContent = myProducts.reduce((sum, p) => sum + (p.salesCount || 0), 0);
            
        } catch (error) {
            console.error('Error loading vendor stats:', error);
        }
    }

    async deleteProduct(productId) {
        if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                await firebaseDB.collection('products').doc(productId).delete();
                this.showNotification('✅ تم حذف المنتج بنجاح');
                this.loadMyProducts();
                this.loadVendorStats();
            } catch (error) {
                this.showNotification('❌ فشل حذف المنتج: ' + error.message);
            }
        }
    }

    editProduct(productId) {
        this.showNotification('⏳ ميزة التعديل قريباً...');
    }

    viewReports() {
        this.showNotification('⏳ التقارير قريباً...');
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