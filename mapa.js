/* === MAPA INTERATIVO COM LEAFLET.JS === */

// Dados das unidades - ATUALIZE COM SUAS COORDENADAS REAIS
const unidades = [
    {
        id: 'unidade1',
        nome: 'Unidade Alto Alegre',
        lat: -25.0627,  // Cascavel, PR
        lng: -53.4555,
        endereco: 'Rua Selvini Casagrande, 123<br>Alto Alegre - Cascavel/PR',
        telefone: '+554597400-2054',
        horario: 'Seg-Sex: 8h-17h | Sáb: 8h-14h',
        descricao: 'Nossa unidade principal em Alto Alegre.'
    },
    {
        id: 'unidade2',
        nome: 'Unidade Centro',
        lat: -25.0700,
        lng: -53.4600,
        endereco: 'Av. Brasil, 456<br>Centro - Cascavel/PR',
        telefone: '+554597400-2054',
        horario: 'Seg-Sex: 9h-18h | Sáb: 9h-15h',
        descricao: 'Unidade moderna no centro da cidade.'
    }
];

/**
 * CLASSE PRINCIPAL DO MAPA
 */
class MapaInterativo {
    constructor() {
        // Elementos do DOM
        this.mapaElement = document.getElementById('mapa');
        this.btnMinhaLocalizacao = document.getElementById('btnMinhaLocalizacao');
        this.btnCalcularRota = document.getElementById('btnCalcularRota');
        this.btnCompartilhar = document.getElementById('btnCompartilhar');
        this.tipoMapa = document.getElementById('tipoMapa');
        this.infoPanel = document.getElementById('infoPanel');
        this.fecharPanel = document.getElementById('fecharPanel');
        
        // Variáveis do mapa
        this.mapa = null;
        this.marcadores = [];
        this.minhaLocalizacao = null;
        this.marcadorUsuario = null;
        
        // Camadas de mapa
        this.camadasMapa = {
            streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri'
            }),
            terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenTopoMap'
            })
        };
        
        this.init();
    }

    /**
     * INICIALIZAÇÃO
     */
    init() {
        if (typeof L === 'undefined') {
            console.error('Leaflet não carregado. Verifique a conexão.');
            this.mapaElement.innerHTML = '<p style="text-align:center; padding:50px; color:#dc3545;">Erro ao carregar o mapa. Verifique sua conexão com a internet.</p>';
            return;
        }

        try {
            // Criar mapa
            const primeiraUnidade = unidades[0];
            this.mapa = L.map('mapa').setView([primeiraUnidade.lat, primeiraUnidade.lng], 13);

            // Adicionar camada padrão
            this.camadasMapa.streets.addTo(this.mapa);

            // Adicionar marcadores
            this.adicionarMarcadores();

            // Configurar eventos
            this.configurarEventos();

            console.log('Mapa inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar mapa:', error);
            this.mapaElement.innerHTML = '<p style="text-align:center; padding:50px; color:#dc3545;">Erro ao carregar o mapa.</p>';
        }
    }

    /**
     * ADICIONAR MARCADORES
     */
    adicionarMarcadores() {
        unidades.forEach(unidade => {
            // Criar ícone customizado
            const iconeCustomizado = L.divIcon({
                className: 'custom-marker',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40]
            });

            // Criar marcador
            const marcador = L.marker([unidade.lat, unidade.lng], {
                icon: iconeCustomizado,
                title: unidade.nome
            }).addTo(this.mapa);

            // Popup
            const popupContent = `
                <div style="text-align: center; min-width: 200px;">
                    <h4 style="margin: 0 0 12px 0; color: #333;">${unidade.nome}</h4>
                    <p style="margin: 8px 0; color: #666;">${unidade.endereco}</p>
                    <p style="margin: 8px 0; font-size: 0.9em; color: #999;">${unidade.horario}</p>
                    <a href="tel:${unidade.telefone}" style="
                        display: inline-block;
                        margin-top: 12px;
                        padding: 10px 20px;
                        background: #28a745;
                        color: white;
                        text-decoration: none;
                        border-radius: 20px;
                        font-size: 0.95em;
                        font-weight: bold;
                    ">📞 Ligar</a>
                </div>
            `;

            marcador.bindPopup(popupContent);

            // Evento de clique
            marcador.on('click', () => {
                this.mostrarInfoUnidade(unidade);
            });

            this.marcadores.push({ unidade: unidade.id, marcador });
        });
    }

    /**
     * CONFIGURAR EVENTOS
     */
    configurarEventos() {
        // Botão Minha Localização
        if (this.btnMinhaLocalizacao) {
            this.btnMinhaLocalizacao.addEventListener('click', () => {
                this.obterMinhaLocalizacao();
            });
        }

        // Botão Calcular Rota
        if (this.btnCalcularRota) {
            this.btnCalcularRota.addEventListener('click', () => {
                this.calcularRota();
            });
        }

        // Botão Compartilhar
        if (this.btnCompartilhar) {
            this.btnCompartilhar.addEventListener('click', () => {
                this.compartilharLocalizacao();
            });
        }

        // Seletor de tipo de mapa
        if (this.tipoMapa) {
            this.tipoMapa.addEventListener('change', (e) => {
                this.trocarTipoMapa(e.target.value);
            });
        }

        // Fechar painel
        if (this.fecharPanel) {
            this.fecharPanel.addEventListener('click', () => {
                this.infoPanel.classList.remove('show');
            });
        }

        // Botões "Ver no Mapa"
        document.querySelectorAll('.btn-ir-mapa').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unidadeId = e.target.getAttribute('data-target');
                const unidade = unidades.find(u => u.id === unidadeId);
                if (unidade) {
                    this.centralizarUnidade(unidade);
                }
            });
        });
    }

    /**
     * OBTER LOCALIZAÇÃO DO USUÁRIO
     */
    obterMinhaLocalizacao() {
        if (!navigator.geolocation) {
            alert('Seu navegador não suporta geolocalização.');
            return;
        }

        this.btnMinhaLocalizacao.disabled = true;
        this.btnMinhaLocalizacao.textContent = 'Localizando...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                this.minhaLocalizacao = { lat, lng };

                // Remover marcador anterior
                if (this.marcadorUsuario) {
                    this.mapa.removeLayer(this.marcadorUsuario);
                }

                // Criar marcador do usuário
                const iconeUsuario = L.divIcon({
                    className: 'user-marker',
                    html: '<div style="background: #28a745; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                this.marcadorUsuario = L.marker([lat, lng], {
                    icon: iconeUsuario
                }).addTo(this.mapa);

                this.marcadorUsuario.bindPopup('Você está aqui!');

                // Centralizar
                this.mapa.setView([lat, lng], 14);

                // Atualizar distâncias
                this.atualizarDistancias();

                // Reabilitar botão
                this.btnMinhaLocalizacao.disabled = false;
                this.btnMinhaLocalizacao.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                    </svg>
                    Minha Localização
                `;

                console.log('Localização obtida:', lat, lng);
            },
            (error) => {
                console.error('Erro ao obter localização:', error);
                
                let mensagem = 'Não foi possível obter sua localização. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        mensagem += 'Você negou a permissão.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensagem += 'Localização indisponível.';
                        break;
                    case error.TIMEOUT:
                        mensagem += 'Tempo limite excedido.';
                        break;
                }
                
                alert(mensagem);

                this.btnMinhaLocalizacao.disabled = false;
                this.btnMinhaLocalizacao.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                    </svg>
                    Minha Localização
                `;
            }
        );
    }

    /**
     * ATUALIZAR DISTÂNCIAS
     */
    atualizarDistancias() {
        if (!this.minhaLocalizacao) return;

        unidades.forEach(unidade => {
            const distancia = this.calcularDistanciaEntre(
                this.minhaLocalizacao.lat,
                this.minhaLocalizacao.lng,
                unidade.lat,
                unidade.lng
            );

            const elemento = document.querySelector(`[data-distancia="${unidade.id}"]`);
            if (elemento) {
                if (distancia < 1) {
                    elemento.textContent = `${Math.round(distancia * 1000)}m de você`;
                } else {
                    elemento.textContent = `${distancia.toFixed(1)}km de você`;
                }
            }
        });
    }

    /**
     * CALCULAR DISTÂNCIA (Haversine)
     */
    calcularDistanciaEntre(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLng = this.degreesToRadians(lng2 - lng1);
        
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(lat1)) * 
            Math.cos(this.degreesToRadians(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * CALCULAR ROTA
     */
    calcularRota() {
        if (!this.minhaLocalizacao) {
            alert('Primeiro ative sua localização clicando em "Minha Localização"');
            return;
        }

        // Encontrar unidade mais próxima
        let unidadeMaisProxima = null;
        let menorDistancia = Infinity;

        unidades.forEach(unidade => {
            const distancia = this.calcularDistanciaEntre(
                this.minhaLocalizacao.lat,
                this.minhaLocalizacao.lng,
                unidade.lat,
                unidade.lng
            );

            if (distancia < menorDistancia) {
                menorDistancia = distancia;
                unidadeMaisProxima = unidade;
            }
        });

        if (unidadeMaisProxima) {
            const origem = `${this.minhaLocalizacao.lat},${this.minhaLocalizacao.lng}`;
            const destino = `${unidadeMaisProxima.lat},${unidadeMaisProxima.lng}`;
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origem}&destination=${destino}&travelmode=driving`;
            
            window.open(url, '_blank');
        }
    }

    /**
     * COMPARTILHAR LOCALIZAÇÃO
     */
    compartilharLocalizacao() {
        const primeiraUnidade = unidades[0];
        const texto = `Confira a localização de ${primeiraUnidade.nome}: https://www.google.com/maps?q=${primeiraUnidade.lat},${primeiraUnidade.lng}`;

        if (navigator.share) {
            navigator.share({
                title: 'Localização - ' + primeiraUnidade.nome,
                text: texto
            }).catch((error) => {
                console.log('Erro ao compartilhar:', error);
                this.copiarParaClipboard(texto);
            });
        } else {
            this.copiarParaClipboard(texto);
        }
    }

    copiarParaClipboard(texto) {
        const temp = document.createElement('textarea');
        temp.value = texto;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        
        alert('Link copiado!');
    }

    /**
     * TROCAR TIPO DE MAPA
     */
    trocarTipoMapa(tipo) {
        Object.values(this.camadasMapa).forEach(camada => {
            this.mapa.removeLayer(camada);
        });

        if (this.camadasMapa[tipo]) {
            this.camadasMapa[tipo].addTo(this.mapa);
        }
    }

    /**
     * CENTRALIZAR UNIDADE
     */
    centralizarUnidade(unidade) {
        this.mapa.setView([unidade.lat, unidade.lng], 16);
        
        const marcadorInfo = this.marcadores.find(m => m.unidade === unidade.id);
        if (marcadorInfo) {
            marcadorInfo.marcador.openPopup();
        }

        this.mostrarInfoUnidade(unidade);
        this.mapaElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * MOSTRAR INFO DA UNIDADE
     */
    mostrarInfoUnidade(unidade) {
        const infoContent = document.getElementById('infoContent');
        
        let distanciaText = '';
        if (this.minhaLocalizacao) {
            const distancia = this.calcularDistanciaEntre(
                this.minhaLocalizacao.lat,
                this.minhaLocalizacao.lng,
                unidade.lat,
                unidade.lng
            );
            distanciaText = distancia < 1 
                ? `<p><strong>Distância:</strong> ${Math.round(distancia * 1000)}m</p>`
                : `<p><strong>Distância:</strong> ${distancia.toFixed(1)}km</p>`;
        }

        infoContent.innerHTML = `
            <h4>${unidade.nome}</h4>
            <p>${unidade.endereco}</p>
            <p><strong>Horário:</strong><br>${unidade.horario}</p>
            ${distanciaText}
            <p>${unidade.descricao}</p>
            <a href="tel:${unidade.telefone}" class="btn-rota">📞 Ligar Agora</a>
        `;

        this.infoPanel.classList.add('show');
    }
}

// Inicializar quando página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.mapaInterativo = new MapaInterativo();
    console.log('Sistema de mapa carregado!');
});