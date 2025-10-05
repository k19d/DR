class CartSystem {
    constructor() {
        this.items = [];
        this.init();
    }

    init() {
        this.loadCartFromStorage();
        this.setupEventListeners();
        this.updateCartUI();
    }

    setupEventListeners() {
        // فتح/إغلاق السلة
        document.getElementById('cartBtn').addEventListener('click', () => {
            this.toggleCart();
        });

        document.getElementById('closeCart').addEventListener('click', () => {
            this.hideCart();
        });

        // إتمام الشراء
        document.getElementById('checkoutBtn').addEventListener('click', () => {
            this.checkout();
        });
    }

    addToCart(product) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity += 1;
            } else {
                this.showNotification('الكمية المتاحة انتهت ❌');
                return;
            }
        } else {
            this.items.push({
                ...product,
                quantity: 1
            });
        }

        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('تمت الإضافة إلى السلة ✓');
    }

    removeFromCart(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCartToStorage();
        this.updateCartUI();
        this.showNotification('تم الحذف من السلة');
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(productId);
            return;
        }

        const item = this.items.find(item => item.id === productId);
        if (item && newQuantity <= item.stock) {
            item.quantity = newQuantity;
            this.saveCartToStorage();
            this.updateCartUI();
        } else {
            this.showNotification('الكمية المطلوبة غير متوفرة ❌');
        }
    }

    updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        // تحديث العداد
        if (cartCount) {
            cartCount.textContent = this.items.reduce((total, item) => total + item.quantity, 0);
        }

        // تحديث العناصر
        if (cartItems) {
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item">
                    <div class="item-info">
                        <div class="item-image">${item.image}</div>
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">$${item.price}</div>
                        </div>
                    </div>
                    <div class="item-controls">
                        <button class="btn-icon" onclick="cartSystem.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="btn-icon" onclick="cartSystem.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <button class="btn-icon" onclick="cartSystem.removeFromCart('${item.id}')">×</button>
                    </div>
                </div>
            `).join('') || '<div style="text-align: center; padding: 2rem;">السلة فارغة</div>';
        }

        // تحديث المجموع
        if (cartTotal) {
            const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toFixed(2);
        }
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cartSidebar');
        cartSidebar.classList.toggle('hidden');
    }

    hideCart() {
        document.getElementById('cartSidebar').classList.add('hidden');
    }

    async checkout() {
        if (this.items.length === 0) {
            this.showNotification('السلة فارغة ❌');
            return;
        }

        if (!authSystem.currentUser) {
            this.showNotification('يجب تسجيل الدخول أولاً 🔐');
            return;
        }

        const total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // عرض خيارات الدفع
        this.showPaymentOptions(total);
    }

    showPaymentOptions(total) {
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>إتمام الشراء</h3>
                        <button class="btn-icon close-modal">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="order-summary">
                            <h4>ملخص الطلب:</h4>
                            ${this.items.map(item => `
                                <div class="order-item">
                                    <span>${item.name} x ${item.quantity}</span>
                                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            `).join('')}
                            <div class="order-total">
                                <strong>المجموع: $${total.toFixed(2)}</strong>
                            </div>
                        </div>
                        
                        <div class="payment-methods">
                            <h4>اختر طريقة الدفع:</h4>
                            <div class="method-options">
                                <label class="method-option">
                                    <input type="radio" name="payment" value="vodafone" checked>
                                    <span class="method-icon">📱</span>
                                    <span>فودافون كاش</span>
                                </label>
                                <label class="method-option">
                                    <input type="radio" name="payment" value="instapay">
                                    <span class="method-icon">💳</span>
                                    <span>انستاباي</span>
                                </label>
                                <label class="method-option">
                                    <input type="radio" name="payment" value="binance">
                                    <span class="method-icon">₿</span>
                                    <span>بينانس</span>
                                </label>
                            </div>
                        </div>

                        <div class="customer-info">
                            <h4>معلومات التواصل:</h4>
                            <input type="text" id="customerPhone" placeholder="رقم الهاتف" class="form-input">
                            <input type="text" id="customerWhatsapp" placeholder="رقم الواتساب" class="form-input">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary close-modal">إلغاء</button>
                        <button class="btn-primary" id="confirmPayment">تأكيد الطلب</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupPaymentModalEvents(total);
    }

    setupPaymentModalEvents(total) {
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.modal-overlay').remove();
            });
        });

        document.getElementById('confirmPayment').addEventListener('click', () => {
            this.processPayment(total);
        });
    }

    async processPayment(total) {
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerWhatsapp = document.getElementById('customerWhatsapp').value;

        if (!customerPhone) {
            this.showNotification('يرجى إدخال رقم الهاتف ❌');
            return;
        }

        try {
            // حفظ الطلب في قاعدة البيانات
            const orderId = 'ORD_' + Date.now();
            const orderData = {
                id: orderId,
                items: this.items,
                total: total,
                paymentMethod: paymentMethod,
                customerPhone: customerPhone,
                customerWhatsapp: customerWhatsapp,
                status: 'pending',
                createdAt: new Date().toISOString(),
                userId: authSystem.currentUser.uid
            };

            // هنا سيتم حفظ الطلب في Firebase
            // await db.collection('orders').doc(orderId).set(orderData);

            this.showOrderConfirmation(orderId, paymentMethod, total);
            this.clearCart();
            document.querySelector('.modal-overlay').remove();
            this.hideCart();

        } catch (error) {
            this.showNotification('حدث خطأ في عملية الدفع ❌');
        }
    }

    showOrderConfirmation(orderId, paymentMethod, total) {
        const paymentInstructions = {
            vodafone: `ارسل $${total} إلى فودافون كاش: 01012345678\nرقم المرجع: ${orderId}`,
            instapay: `حول $${total} إلى الحساب: XXXX-XXXX-XXXX\nرقم المرجع: ${orderId}`,
            binance: `ارسل $${total} USDT إلى المحفظة: 0x7428b253defc164018c604a1ebbfebdf\nالمذكرة: ${orderId}`
        };

        const confirmationHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    <div class="modal-header">
                        <h3>✅ تم تأكيد الطلب</h3>
                    </div>
                    <div class="modal-body">
                        <div class="confirmation-info">
                            <p><strong>رقم الطلب:</strong> ${orderId}</p>
                            <p><strong>المجموع:</strong> $${total.toFixed(2)}</p>
                            <div class="payment-instructions">
                                <h4>تعليمات الدفع:</h4>
                                <pre>${paymentInstructions[paymentMethod]}</pre>
                            </div>
                            <div class="contact-info">
                                <p>بعد التحويل، راسلنا على الواتساب:</p>
                                <a href="https://wa.me/+201500461923" target="_blank" class="btn-primary">
                                    التواصل على الواتساب
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">
                            فهمت
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', confirmationHTML);
    }

    clearCart() {
        this.items = [];
        this.saveCartToStorage();
        this.updateCartUI();
    }

    saveCartToStorage() {
        localStorage.setItem('techStoreCart', JSON.stringify(this.items));
    }

    loadCartFromStorage() {
        const savedCart = localStorage.getItem('techStoreCart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
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
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize cart system
const cartSystem = new CartSystem();