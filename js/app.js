class TechStoreApp {
    constructor() {
        this.theme = 'dark';
        this.init();
    }

    init() {
        this.setupTheme();
        this.setupLoadingScreen();
        this.setupGlobalEventListeners();
        this.setupSantaBackground(); // ← أضف هذا السطر
    }

    // أضف هذه الدالة الجديدة
    setupSantaBackground() {
        // تفاعل الخلفية مع حركة الماوس
        document.addEventListener('mousemove', (e) => {
            const santaBg = document.querySelector('.santa-background');
            if (santaBg) {
                const x = (e.clientX / window.innerWidth - 0.5) * 40;
                const y = (e.clientY / window.innerHeight - 0.5) * 40;
                santaBg.style.transform = `translateX(${x}px) translateY(${y}px) scale(1.05)`;
            }
        });

        // تفاعل مع التمرير
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const santaBg = document.querySelector('.santa-background');
            if (santaBg) {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.3;
                santaBg.style.transform = `translateY(${rate}px) scale(1.02)`;
                
                // تأثير السرعة
                const scrollDelta = window.scrollY - lastScrollY;
                const blurAmount = Math.min(Math.abs(scrollDelta) * 0.5, 10);
                santaBg.style.filter = `brightness(0.8) contrast(1.2) blur(${blurAmount}px)`;
                
                lastScrollY = window.scrollY;
                
                // إعادة الضبط بعد التمرير
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    santaBg.style.filter = 'brightness(0.8) contrast(1.2) blur(0px)';
                }, 100);
            }
        });

        // تفاعل مع تغيير الحجم
        window.addEventListener('resize', () => {
            const santaBg = document.querySelector('.santa-background');
            const santaGlitch = document.querySelector('.santa-glitch');
            if (santaBg && santaGlitch) {
                // إعادة تحميل الخلفية لتجنب مشاكل التكبير
                santaBg.style.backgroundImage = `url('../SANTA.PNG')`;
                santaGlitch.style.backgroundImage = `url('../SANTA.PNG')`;
            }
        });
    }

    setupTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        const savedTheme = localStorage.getItem('techStoreTheme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        this.setTheme(this.theme);
        localStorage.setItem('techStoreTheme', this.theme);
        
        // تحديث شفافية الخلفية حسب الثيم
        this.updateSantaBackground();
    }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }

    updateSantaBackground() {
        const santaBg = document.querySelector('.santa-background');
        if (santaBg) {
            if (this.theme === 'light') {
                santaBg.style.opacity = '0.08';
                santaBg.style.filter = 'brightness(1.2) contrast(1.1)';
            } else {
                santaBg.style.opacity = '0.15';
                santaBg.style.filter = 'brightness(0.8) contrast(1.2)';
            }
        }
    }

    setupLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // بدء تحريك الخلفية بعد التحميل
                    this.startSantaAnimation();
                }, 500);
            }
        }, 3000);
    }

    startSantaAnimation() {
        const santaBg = document.querySelector('.santa-background');
        if (santaBg) {
            santaBg.style.animationPlayState = 'running';
        }
    }

    setupGlobalEventListeners() {
        // إغلاق المودالات عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.remove();
            }
        });

        // تأثيرات إضافية للخلفية
        this.addSantaHoverEffects();
    }

    addSantaHoverEffects() {
        // تأثير عند hover على العناصر المهمة
        const interactiveElements = document.querySelectorAll('.product-card, .btn-primary, .nav-link');
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                const santaBg = document.querySelector('.santa-background');
                if (santaBg) {
                    santaBg.style.filter = 'brightness(1.1) contrast(1.3) blur(1px)';
                }
            });
            
            element.addEventListener('mouseleave', () => {
                const santaBg = document.querySelector('.santa-background');
                if (santaBg) {
                    santaBg.style.filter = 'brightness(0.8) contrast(1.2) blur(0px)';
                }
            });
        });
    }
}

// Initialize the main app
document.addEventListener('DOMContentLoaded', function() {
    window.techStoreApp = new TechStoreApp();
});