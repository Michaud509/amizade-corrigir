/* === DARK MODE JAVASCRIPT === */

class DarkModeToggle {
    constructor() {
        this.init();
        this.loadSavedTheme();
        this.bindEvents();
    }

    init() {
        // Criar o botão de toggle
        this.createToggleButton();
        
        // Definir tema padrão baseado na preferência do sistema
        this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Escutar mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!this.hasUserPreference()) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    createToggleButton() {
        // Criar elementos do botão
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'dark-mode-toggle';
        this.toggleButton.setAttribute('aria-label', 'Alternar tema escuro/claro');
        this.toggleButton.setAttribute('title', 'Alternar tema');

        // Ícone do sol (modo claro)
        const sunIcon = `
            <svg class="toggle-icon sun-icon" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
        `;

        // Ícone da lua (modo escuro)
        const moonIcon = `
            <svg class="toggle-icon moon-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        `;

        // Texto do toggle (aparece apenas no hover em desktop)
        const toggleText = `
            <span class="toggle-text">Alternar tema</span>
        `;

        this.toggleButton.innerHTML = sunIcon + moonIcon + toggleText;

        // Adicionar ao body
        document.body.appendChild(this.toggleButton);

        // Referências para os ícones
        this.sunIcon = this.toggleButton.querySelector('.sun-icon');
        this.moonIcon = this.toggleButton.querySelector('.moon-icon');
        this.toggleText = this.toggleButton.querySelector('.toggle-text');
    }

    bindEvents() {
        // Evento de clique no botão
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });

        // Atalho de teclado (Ctrl/Cmd + Shift + D)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Evento personalizado para outras partes do código
        document.addEventListener('themeChanged', (e) => {
            this.onThemeChange(e.detail.theme);
        });
    }

    toggle() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Adicionar classe de animação
        this.toggleButton.classList.add('switching');
        
        // Remover após animação
        setTimeout(() => {
            this.toggleButton.classList.remove('switching');
        }, 600);

        this.setTheme(newTheme);
    }

    setTheme(theme) {
        // Aplicar tema ao documento
        document.documentElement.setAttribute('data-theme', theme);
        
        // Salvar preferência do usuário
        this.saveTheme(theme);
        
        // Atualizar ícones
        this.updateIcons(theme);
        
        // Atualizar texto do botão
        this.updateButtonText(theme);
        
        // Disparar evento personalizado
        this.dispatchThemeChange(theme);
        
        // Log para debug (remover em produção)
        console.log(`Tema alterado para: ${theme}`);
    }

    updateIcons(theme) {
        if (theme === 'dark') {
            this.sunIcon.style.display = 'none';
            this.moonIcon.style.display = 'block';
        } else {
            this.sunIcon.style.display = 'block';
            this.moonIcon.style.display = 'none';
        }
    }

    updateButtonText(theme) {
        const text = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
        this.toggleText.textContent = text;
        this.toggleButton.setAttribute('aria-label', `Alternar para ${text.toLowerCase()}`);
        this.toggleButton.setAttribute('title', `Alternar para ${text.toLowerCase()}`);
    }

    getCurrentTheme() {
        return document.documentElement.getAttribute('data-theme') || 'light';
    }

    saveTheme(theme) {
        try {
            // Salvar no localStorage (não disponível em artifacts do Claude)
            // localStorage.setItem('theme-preference', theme);
            
            // Como alternativa, usar sessionStorage ou cookie
            document.cookie = `theme=${theme}; path=/; max-age=31536000`; // 1 ano
        } catch (error) {
            console.warn('Não foi possível salvar a preferência de tema:', error);
        }
    }

    loadSavedTheme() {
        try {
            // Tentar carregar do localStorage primeiro
            // let savedTheme = localStorage.getItem('theme-preference');
            
            // Como alternativa, carregar do cookie
            let savedTheme = this.getCookieValue('theme');
            
            if (!savedTheme) {
                // Se não há preferência salva, usar a preferência do sistema
                savedTheme = this.systemPrefersDark ? 'dark' : 'light';
            }

            this.setTheme(savedTheme);
            
        } catch (error) {
            console.warn('Erro ao carregar tema salvo:', error);
            // Fallback para tema claro
            this.setTheme('light');
        }
    }

    getCookieValue(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
        return null;
    }

    hasUserPreference() {
        try {
            return this.getCookieValue('theme') !== null;
            // return localStorage.getItem('theme-preference') !== null;
        } catch {
            return false;
        }
    }

    dispatchThemeChange(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    onThemeChange(theme) {
        // Callback para quando o tema muda
        // Pode ser usado para lógicas adicionais
        
        // Exemplo: Atualizar gráficos ou mapas
        if (typeof updateChartsTheme === 'function') {
            updateChartsTheme(theme);
        }
        
        // Exemplo: Notificar outros componentes
        const themeChangeEvent = new Event('darkModeToggled');
        window.dispatchEvent(themeChangeEvent);
    }

    // Métodos públicos para uso externo
    enableDarkMode() {
        this.setTheme('dark');
    }

    enableLightMode() {
        this.setTheme('light');
    }

    isDarkMode() {
        return this.getCurrentTheme() === 'dark';
    }

    // Método para debug
    getThemeInfo() {
        return {
            currentTheme: this.getCurrentTheme(),
            systemPrefersDark: this.systemPrefersDark,
            hasUserPreference: this.hasUserPreference()
        };
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Criar instância global do dark mode
    window.darkModeToggle = new DarkModeToggle();
    
    // Log para debug (remover em produção)
    console.log('Dark Mode Toggle inicializado:', window.darkModeToggle.getThemeInfo());
});

// Função utilitária para outros scripts usarem
function toggleTheme() {
    if (window.darkModeToggle) {
        window.darkModeToggle.toggle();
    }
}

// Função para definir tema programaticamente
function setTheme(theme) {
    if (window.darkModeToggle) {
        window.darkModeToggle.setTheme(theme);
    }
}

// Função para verificar se está em modo escuro
function isDarkMode() {
    return window.darkModeToggle ? window.darkModeToggle.isDarkMode() : false;
}

// Export para uso em módulos (se necessário)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DarkModeToggle, toggleTheme, setTheme, isDarkMode };
}