class AIChatSystem {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.addWelcomeMessage();
    }

    setupEventListeners() {
        document.getElementById('chatToggle').addEventListener('click', () => {
            this.toggleChat();
        });

        document.getElementById('closeChat').addEventListener('click', () => {
            this.closeChat();
        });

        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        const chatWindow = document.getElementById('chatWindow');
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            chatWindow.classList.remove('hidden');
            document.getElementById('chatInput').focus();
        } else {
            chatWindow.classList.add('hidden');
        }
    }

    closeChat() {
        document.getElementById('chatWindow').classList.add('hidden');
        this.isOpen = false;
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // إضافة رسالة المستخدم
        this.addMessage('user', message);
        input.value = '';

        // إظهار مؤشر الكتابة
        this.showTypingIndicator();

        // محاكاة رد الذكاء الاصطناعي
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message);
            this.addMessage('ai', aiResponse);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(sender, content) {
        this.messages.push({ sender, content, timestamp: new Date() });
        this.renderMessages();
    }

    renderMessages() {
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = this.messages.map(msg => `
            <div class="message ${msg.sender}">
                ${msg.content}
            </div>
        `).join('');

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai typing';
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    addWelcomeMessage() {
        this.addMessage('ai', 'مرحباً! أنا المساعد الذكي لمتجر Tech Store. كيف يمكنني مساعدتك في اختيار المنتجات التقنية المناسبة؟');
    }

    generateAIResponse(userMessage) {
        const responses = {
            greetings: [
                'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',
                'مرحباً بك! أنا هنا لمساعدتك في اختيار أفضل المنتجات.',
                'أهلاً! يسعدني مساعدتك في متجرنا التقني.'
            ],
            products: [
                'لدينا مجموعة متنوعة من المنتجات التقنية. أي فئة تهمك؟',
                'يمكنني مساعدتك في اختيار المنتجات المناسبة لاحتياجاتك.',
                'ما نوع المنتج الذي تبحث عنه؟ أدوات برمجة، سكريبتات، أم شيء آخر؟'
            ],
            pricing: [
                'أسعارنا تنافسية وتتوافق مع جودة المنتجات.',
                'يمكنك رؤية الأسعار مباشرة على صفحة المنتج.',
                'جميع الأسعار مدونة بالدولار الأمريكي.'
            ],
            support: [
                'فريق الدعم الفني متاح 24/7 لمساعدتك.',
                'يمكنك التواصل معنا عبر الواتساب للدعم الفوري.',
                'لأي استفسار تقني، نحن هنا لمساعدتك.'
            ],
            default: [
                'هذا سؤال مثير للاهتمام! دعني أساعدك في ذلك.',
                'أفهم ما تقصده. هل يمكنك توضيح أكثر؟',
                'شكراً لسؤالك! سأقوم بمساعدتك في هذا الأمر.'
            ]
        };

        const message = userMessage.toLowerCase();
        let category = 'default';

        if (message.includes('مرحبا') || message.includes('اهلا') || message.includes('سلام')) {
            category = 'greetings';
        } else if (message.includes('منتج') || message.includes('شراء') || message.includes('اشتري')) {
            category = 'products';
        } else if (message.includes('سعر') || message.includes('ثمن') || message.includes('كم')) {
            category = 'pricing';
        } else if (message.includes('دعم') || message.includes('مساعدة') || message.includes('مشكلة')) {
            category = 'support';
        }

        const categoryResponses = responses[category];
        return categoryResponses[Math.floor(Math.random() * categoryResponses.length)];
    }
}

// Initialize AI Chat System
const aiChatSystem = new AIChatSystem();