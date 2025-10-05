class ProductSystem {
    constructor() {
        this.products = [];
        this.currentCategory = 'all';
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
    }

    async loadProducts() {
        try {
            this.products = await firebaseManager.getProducts();
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = firebaseManager.getSampleProducts();
            this.renderProducts();
        }
    }

    setupEventListeners() {
        // تصفية حسب الفئة
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
                
                this.currentCategory = e.target.dataset.category;
                this.renderProducts();
            });
        });

        // بحث المنتجات
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }
    }

    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;

        const filteredProducts = this.currentCategory === 'all' 
            ? this.products 
            : this.products.filter(product => product.category === this.currentCategory);

        productsGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">${product.image}</div>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-features">
                    ${product.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="product-price">$${product.price}</div>
                <div class="product-stock">المتبقي: ${product.stock}</div>
                <div class="product-actions">
                    <button class="btn-primary" onclick="productSystem.addToCart('${product.id}')">
                        إضافة للسلة
                    </button>
                    <button class="btn-secondary" onclick="productSystem.viewDetails('${product.id}')">
                        التفاصيل
                    </button>
                </div>
            </div>
        `).join('');
    }

    addToCart(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            if (window.cartSystem) {
                window.cartSystem.addToCart(product);
            }
            this.showNotification('✅ تمت الإضافة إلى السلة');
        }
    }

    showNotification(message) {
        if (window.authSystem) {
            window.authSystem.showNotification(message);
        }
    }
}

// Initialize product system
const productSystem = new ProductSystem();
window.productSystem = productSystem;