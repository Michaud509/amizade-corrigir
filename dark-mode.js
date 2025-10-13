// === MODO ESCURO ===
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    
    // Verificar preferência salva
    const darkModePreference = localStorage.getItem('darkMode');
    
    if (darkModePreference === 'enabled') {
        body.classList.add('dark-mode');
        updateToggleButton(true);
    }

    // Toggle do modo escuro
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            
            const isDarkMode = body.classList.contains('dark-mode');
            
            // Salvar preferência
            localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
            
            updateToggleButton(isDarkMode);
        });
    }

    function updateToggleButton(isDarkMode) {
        const toggleText = darkModeToggle.querySelector('.toggle-text');
        const toggleIcon = darkModeToggle.querySelector('.toggle-icon');
        
        if (isDarkMode) {
            toggleText.textContent = 'Light Mode';
            toggleIcon.textContent = '☀️';
        } else {
            toggleText.textContent = 'Dark Mode';
            toggleIcon.textContent = '🌙';
        }
    }
});