// === MODAL DE LOGIN/REGISTRO ===
document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.querySelector('.wrapper');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const btnPopup = document.querySelector('.btnLogin-popup');
    const iconClose = document.querySelector('.icon-close');

    // Abrir modal de login
    if (btnPopup) {
        btnPopup.addEventListener('click', () => {
            wrapper.classList.add('active-popup');
        });
    }

    // Fechar modal
    if (iconClose) {
        iconClose.addEventListener('click', () => {
            wrapper.classList.remove('active-popup');
            wrapper.classList.remove('active');
        });
    }

    // Alternar para formulário de registro
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            wrapper.classList.add('active');
        });
    }

    // Alternar para formulário de login
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            wrapper.classList.remove('active');
        });
    }

    // Fechar modal ao clicar fora
    document.addEventListener('click', (e) => {
        if (wrapper && !wrapper.contains(e.target) && 
            btnPopup && !btnPopup.contains(e.target)) {
            wrapper.classList.remove('active-popup');
            wrapper.classList.remove('active');
        }
    });

    // Prevenir fechamento ao clicar dentro do wrapper
    if (wrapper) {
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // === VALIDAÇÃO DE FORMULÁRIOS ===
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const inputs = this.querySelectorAll('input[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('erro');
                    isValid = false;
                } else {
                    input.classList.remove('erro');
                }
            });

            if (isValid) {
                alert('Formulário enviado com sucesso!');
                this.reset();
            }
        });
    });

    // Remover classe de erro ao digitar
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('erro');
        });
    });

    // === SCROLL SUAVE PARA LINKS ÂNCORA ===
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // === ANIMAÇÃO DE ENTRADA DOS ELEMENTOS ===
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.itens, .principal p');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});