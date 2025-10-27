/* === CALCULADORA INTERATIVA - JAVASCRIPT === */

/**
 * CLASSE PRINCIPAL DA CALCULADORA
 * Gerencia todas as funcionalidades de cálculo e interface
 */
class CalculadoraInterativa {
    constructor() {
        // Elementos do DOM
        this.resultadosDiv = document.getElementById('calculadoraResultados');
        this.historicoLista = document.getElementById('historicoLista');
        
        // Histórico de cálculos (usando variável ao invés de localStorage)
        this.historico = [];
        
        // Gráfico atual (Chart.js)
        this.graficoAtual = null;
        
        this.init();
    }

    /**
     * INICIALIZAÇÃO
     * Configura eventos e interface
     */
    init() {
        // Configurar seletor de tipo de calculadora
        this.configurarSeletorTipo();
        
        // Configurar validação dos inputs
        this.configurarValidacoes();
        
        console.log('Calculadora inicializada!');
    }

    /**
     * CONFIGURAR SELETOR DE TIPO
     * Alterna entre diferentes calculadoras
     */
    configurarSeletorTipo() {
        const botoes = document.querySelectorAll('.tipo-btn');
        const secoes = document.querySelectorAll('.calc-section');

        botoes.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover active de todos
                botoes.forEach(b => b.classList.remove('active'));
                secoes.forEach(s => s.classList.remove('active'));

                // Adicionar active ao clicado
                btn.classList.add('active');
                const tipo = btn.getAttribute('data-tipo');
                const secao = document.querySelector(`[data-section="${tipo}"]`);
                
                if (secao) {
                    secao.classList.add('active');
                }

                // Limpar resultados
                this.limparResultados();
            });
        });
    }

    /**
     * CONFIGURAR VALIDAÇÕES
     * Valida inputs em tempo real
     */
    configurarValidacoes() {
        const inputs = document.querySelectorAll('input[type="number"]');
        
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const valor = parseFloat(e.target.value);
                const min = parseFloat(e.target.min);
                const max = parseFloat(e.target.max);

                // Validar range
                if (valor < min || valor > max) {
                    e.target.style.borderColor = '#dc3545';
                } else {
                    e.target.style.borderColor = '';
                }
            });

            // Prevenir valores negativos em alguns campos
            input.addEventListener('keypress', (e) => {
                if (e.key === '-' && input.min >= 0) {
                    e.preventDefault();
                }
            });
        });
    }

    /**
     * LIMPAR RESULTADOS
     * Restaura placeholder inicial
     */
    limparResultados() {
        this.resultadosDiv.innerHTML = `
            <div class="placeholder-resultado">
                <svg viewBox="0 0 24 24" fill="currentColor" class="calc-icon">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <h3>Aguardando Cálculo</h3>
                <p>Preencha os campos e clique em calcular para ver os resultados</p>
            </div>
        `;

        // Destruir gráfico se existir
        if (this.graficoAtual) {
            this.graficoAtual.destroy();
            this.graficoAtual = null;
        }
    }

    /**
     * EXIBIR RESULTADO
     * Mostra resultado formatado na interface
     */
    exibirResultado(dados) {
        const { tipo, valor, classificacao, detalhes, grafico } = dados;

        // Criar HTML do resultado
        let html = `
            <div class="resultado-visivel">
                <div class="resultado-header">
                    <h3>${this.obterTituloCalculo(tipo)}</h3>
                    <div class="resultado-valor">${valor}</div>
                    ${classificacao ? `<span class="resultado-classificacao ${classificacao.classe}">${classificacao.texto}</span>` : ''}
                </div>
        `;

        // Adicionar detalhes se houver
        if (detalhes && detalhes.length > 0) {
            html += '<div class="resultado-detalhes">';
            detalhes.forEach(detalhe => {
                html += `
                    <div class="detalhe-item">
                        <span class="detalhe-label">${detalhe.label}</span>
                        <span class="detalhe-valor">${detalhe.valor}</span>
                    </div>
                `;
            });
            html += '</div>';
        }

        // Adicionar container para gráfico
        if (grafico) {
            html += `
                <div class="resultado-grafico">
                    <canvas id="graficoResultado"></canvas>
                </div>
            `;
        }

        // Adicionar botões de ação
        html += `
            <div class="resultado-acoes">
                <button class="btn-acao" onclick="calculadora.compartilharResultado()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                    </svg>
                    Compartilhar
                </button>
                <button class="btn-acao" onclick="calcularIMC(); calcularCalorias(); calcularRacao();">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Recalcular
                </button>
            </div>
        `;

        html += '</div>';

        // Inserir no DOM
        this.resultadosDiv.innerHTML = html;

        // Criar gráfico se necessário
        if (grafico) {
            setTimeout(() => this.criarGrafico(grafico), 100);
        }

        // Adicionar ao histórico
        this.adicionarAoHistorico(dados);
    }

    /**
     * CRIAR GRÁFICO
     * Usa Chart.js para visualização
     */
    criarGrafico(dados) {
        const canvas = document.getElementById('graficoResultado');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destruir gráfico anterior
        if (this.graficoAtual) {
            this.graficoAtual.destroy();
        }

        // Criar novo gráfico
        this.graficoAtual = new Chart(ctx, {
            type: dados.tipo || 'bar',
            data: {
                labels: dados.labels,
                datasets: [{
                    label: dados.label,
                    data: dados.valores,
                    backgroundColor: dados.cores || [
                        'rgba(102, 126, 234, 0.2)',
                        'rgba(40, 167, 69, 0.2)',
                        'rgba(255, 193, 7, 0.2)',
                        'rgba(220, 53, 69, 0.2)'
                    ],
                    borderColor: dados.coresBorda || [
                        'rgba(102, 126, 234, 1)',
                        'rgba(40, 167, 69, 1)',
                        'rgba(255, 193, 7, 1)',
                        'rgba(220, 53, 69, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * ADICIONAR AO HISTÓRICO
     * Salva cálculo realizado
     */
    adicionarAoHistorico(dados) {
        const item = {
            tipo: dados.tipo,
            valor: dados.valor,
            data: new Date().toLocaleString('pt-BR'),
            detalhes: dados.detalhes
        };

        this.historico.unshift(item); // Adiciona no início

        // Limitar a 10 itens
        if (this.historico.length > 10) {
            this.historico.pop();
        }

        this.atualizarHistoricoUI();
    }

    /**
     * ATUALIZAR INTERFACE DO HISTÓRICO
     * Renderiza lista de cálculos
     */
    atualizarHistoricoUI() {
        if (this.historico.length === 0) {
            this.historicoLista.innerHTML = '<p class="historico-vazio">Nenhum cálculo realizado ainda</p>';
            return;
        }

        let html = '';
        this.historico.forEach((item, index) => {
            html += `
                <div class="historico-item">
                    <div class="historico-info">
                        <div class="historico-tipo">${this.obterTituloCalculo(item.tipo)}</div>
                        <div class="historico-resultado">${item.valor}</div>
                        <div class="historico-data">${item.data}</div>
                    </div>
                    <button class="btn-ver-historico" onclick="calculadora.verDetalheHistorico(${index})">
                        Ver Detalhes
                    </button>
                </div>
            `;
        });

        this.historicoLista.innerHTML = html;
    }

    /**
     * VER DETALHE DO HISTÓRICO
     * Mostra detalhes de um cálculo anterior
     */
    verDetalheHistorico(index) {
        const item = this.historico[index];
        if (!item) return;

        alert(`Detalhes do Cálculo:\n\nTipo: ${this.obterTituloCalculo(item.tipo)}\nResultado: ${item.valor}\nData: ${item.data}`);
    }

    /**
     * COMPARTILHAR RESULTADO
     * Usa Web Share API ou copia texto
     */
    compartilharResultado() {
        const resultadoTexto = this.resultadosDiv.querySelector('.resultado-valor')?.textContent;
        const tipoCalculo = this.resultadosDiv.querySelector('.resultado-header h3')?.textContent;

        if (!resultadoTexto) return;

        const texto = `Meu resultado de ${tipoCalculo}: ${resultadoTexto}`;

        if (navigator.share) {
            navigator.share({
                title: tipoCalculo,
                text: texto
            }).catch(err => console.log('Erro ao compartilhar:', err));
        } else {
            // Fallback: copiar para clipboard
            navigator.clipboard.writeText(texto).then(() => {
                alert('Resultado copiado para área de transferência!');
            });
        }
    }

    /**
     * OBTER TÍTULO DO CÁLCULO
     * Retorna nome formatado do tipo de cálculo
     */
    obterTituloCalculo(tipo) {
        const titulos = {
            'imc': 'Cálculo de IMC',
            'calorias': 'Gasto Calórico Diário',
            'racao': 'Quantidade de Ração'
        };
        return titulos[tipo] || 'Cálculo';
    }

    /**
     * VALIDAR INPUTS
     * Verifica se todos os campos obrigatórios estão preenchidos
     */
    validarInputs(ids) {
        for (let id of ids) {
            const elemento = document.getElementById(id);
            if (!elemento) continue;

            const valor = elemento.value.trim();
            
            if (valor === '' || valor === null) {
                elemento.focus();
                elemento.style.borderColor = '#dc3545';
                alert(`Por favor, preencha o campo: ${elemento.previousElementSibling?.textContent || id}`);
                return false;
            }

            if (elemento.type === 'number') {
                const num = parseFloat(valor);
                const min = parseFloat(elemento.min);
                const max = parseFloat(elemento.max);

                if (isNaN(num) || num < min || num > max) {
                    elemento.focus();
                    elemento.style.borderColor = '#dc3545';
                    alert(`Valor inválido no campo: ${elemento.previousElementSibling?.textContent || id}`);
                    return false;
                }
            }
        }
        return true;
    }
}

// Instância global da calculadora
let calculadora;

document.addEventListener('DOMContentLoaded', () => {
    calculadora = new CalculadoraInterativa();
});

/**
 * ========================================
 * FUNÇÕES DE CÁLCULO ESPECÍFICAS
 * ========================================
 */

/**
 * CALCULAR IMC
 * Calcula o Índice de Massa Corporal
 */
function calcularIMC() {
    // Validar inputs
    if (!calculadora.validarInputs(['peso', 'altura'])) {
        return;
    }

    // Obter valores
    const peso = parseFloat(document.getElementById('peso').value);
    const alturaEmCm = parseFloat(document.getElementById('altura').value);
    const alturaEmMetros = alturaEmCm / 100;

    // Calcular IMC
    const imc = peso / (alturaEmMetros * alturaEmMetros);

    // Classificar IMC
    let classificacao = '';
    let classe = '';
    let faixas = [];

    if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
        classe = 'classificacao-alerta';
    } else if (imc >= 18.5 && imc < 25) {
        classificacao = 'Peso normal';
        classe = 'classificacao-normal';
    } else if (imc >= 25 && imc < 30) {
        classificacao = 'Sobrepeso';
        classe = 'classificacao-alerta';
    } else if (imc >= 30 && imc < 35) {
        classificacao = 'Obesidade Grau I';
        classe = 'classificacao-perigo';
    } else if (imc >= 35 && imc < 40) {
        classificacao = 'Obesidade Grau II';
        classe = 'classificacao-perigo';
    } else {
        classificacao = 'Obesidade Grau III';
        classe = 'classificacao-perigo';
    }

    // Calcular peso ideal
    const pesoIdealMin = 18.5 * (alturaEmMetros * alturaEmMetros);
    const pesoIdealMax = 24.9 * (alturaEmMetros * alturaEmMetros);

    // Preparar dados para exibição
    const dados = {
        tipo: 'imc',
        valor: imc.toFixed(1),
        classificacao: {
            texto: classificacao,
            classe: classe
        },
        detalhes: [
            { label: 'Peso Atual', valor: `${peso.toFixed(1)} kg` },
            { label: 'Altura', valor: `${alturaEmCm} cm` },
            { label: 'Peso Ideal', valor: `${pesoIdealMin.toFixed(1)} - ${pesoIdealMax.toFixed(1)} kg` }
        ],
        grafico: {
            tipo: 'bar',
            label: 'Classificação IMC',
            labels: ['Abaixo', 'Normal', 'Sobrepeso', 'Obesidade'],
            valores: [18.5, 24.9, 29.9, imc > 30 ? imc : 30],
            cores: [
                imc < 18.5 ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 193, 7, 0.2)',
                imc >= 18.5 && imc < 25 ? 'rgba(40, 167, 69, 0.6)' : 'rgba(40, 167, 69, 0.2)',
                imc >= 25 && imc < 30 ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 193, 7, 0.2)',
                imc >= 30 ? 'rgba(220, 53, 69, 0.6)' : 'rgba(220, 53, 69, 0.2)'
            ]
        }
    };

    calculadora.exibirResultado(dados);
}

/**
 * CALCULAR CALORIAS
 * Calcula gasto calórico diário usando fórmula Harris-Benedict
 */
function calcularCalorias() {
    // Validar inputs
    if (!calculadora.validarInputs(['peso-cal', 'altura-cal', 'idade', 'sexo', 'atividade'])) {
        return;
    }

    // Obter valores
    const peso = parseFloat(document.getElementById('peso-cal').value);
    const altura = parseFloat(document.getElementById('altura-cal').value);
    const idade = parseInt(document.getElementById('idade').value);
    const sexo = document.getElementById('sexo').value;
    const nivelAtividade = parseFloat(document.getElementById('atividade').value);

    // Calcular Taxa Metabólica Basal (TMB)
    let tmb;
    if (sexo === 'masculino') {
        // Fórmula de Harris-Benedict para homens
        tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
    } else {
        // Fórmula de Harris-Benedict para mulheres
        tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
    }

    // Calcular TDEE (Total Daily Energy Expenditure)
    const tdee = tmb * nivelAtividade;

    // Calcular diferentes objetivos
    const manutencao = tdee;
    const perderPeso = tdee - 500; // Déficit de 500 cal/dia
    const ganharPeso = tdee + 500; // Superávit de 500 cal/dia

    // Obter descrição do nível de atividade
    const nivelAtividadeTexto = document.getElementById('atividade').options[document.getElementById('atividade').selectedIndex].text;

    // Preparar dados
    const dados = {
        tipo: 'calorias',
        valor: `${Math.round(tdee)} kcal/dia`,
        classificacao: {
            texto: 'Gasto Estimado',
            classe: 'classificacao-normal'
        },
        detalhes: [
            { label: 'TMB (repouso)', valor: `${Math.round(tmb)} kcal` },
            { label: 'TDEE (total)', valor: `${Math.round(tdee)} kcal` },
            { label: 'Para perder peso', valor: `${Math.round(perderPeso)} kcal` },
            { label: 'Para ganhar peso', valor: `${Math.round(ganharPeso)} kcal` },
            { label: 'Nível de atividade', valor: nivelAtividadeTexto }
        ],
        grafico: {
            tipo: 'bar',
            label: 'Calorias por Objetivo',
            labels: ['Perder Peso', 'Manutenção', 'Ganhar Peso'],
            valores: [Math.round(perderPeso), Math.round(manutencao), Math.round(ganharPeso)],
            cores: [
                'rgba(220, 53, 69, 0.6)',
                'rgba(40, 167, 69, 0.6)',
                'rgba(102, 126, 234, 0.6)'
            ]
        }
    };

    calculadora.exibirResultado(dados);
}

/**
 * CALCULAR RAÇÃO (Exemplo de cálculo personalizado)
 * Para Pet Shop - quantidade diária de ração
 */
function calcularRacao() {
    // Validar inputs
    if (!calculadora.validarInputs(['peso-pet', 'idade-pet', 'atividade-pet'])) {
        return;
    }

    // Obter valores
    const pesoPet = parseFloat(document.getElementById('peso-pet').value);
    const idadePet = document.getElementById('idade-pet').value;
    const atividadePet = document.getElementById('atividade-pet').value;

    // Cálculo base: 2-3% do peso corporal em gramas
    let percentualBase = 2.5;

    // Ajustar por idade
    if (idadePet === 'filhote') {
        percentualBase = 4.0; // Filhotes comem mais
    } else if (idadePet === 'senior') {
        percentualBase = 2.0; // Idosos comem menos
    }

    // Ajustar por atividade
    if (atividadePet === 'baixa') {
        percentualBase *= 0.9;
    } else if (atividadePet === 'alta') {
        percentualBase *= 1.2;
    }

    // Calcular quantidade em gramas
    const quantidadeDiaria = (pesoPet * 1000 * percentualBase) / 100;
    const quantidadePorRefeicao = quantidadeDiaria / 2; // 2 refeições por dia
    const quantidadeMensal = (quantidadeDiaria * 30) / 1000; // Em kg

    // Classificar peso do pet
    let classificacaoPeso = '';
    if (pesoPet < 5) {
        classificacaoPeso = 'Porte Pequeno';
    } else if (pesoPet >= 5 && pesoPet < 15) {
        classificacaoPeso = 'Porte Médio';
    } else if (pesoPet >= 15 && pesoPet < 30) {
        classificacaoPeso = 'Porte Grande';
    } else {
        classificacaoPeso = 'Porte Gigante';
    }

    // Preparar dados
    const dados = {
        tipo: 'racao',
        valor: `${Math.round(quantidadeDiaria)}g/dia`,
        classificacao: {
            texto: classificacaoPeso,
            classe: 'classificacao-normal'
        },
        detalhes: [
            { label: 'Peso do Pet', valor: `${pesoPet} kg` },
            { label: 'Por Refeição (2x/dia)', valor: `${Math.round(quantidadePorRefeicao)}g` },
            { label: 'Consumo Mensal', valor: `${quantidadeMensal.toFixed(1)} kg` },
            { label: 'Fase da Vida', valor: idadePet.charAt(0).toUpperCase() + idadePet.slice(1) },
            { label: 'Atividade', valor: atividadePet.charAt(0).toUpperCase() + atividadePet.slice(1) }
        ],
        grafico: {
            tipo: 'doughnut',
            label: 'Distribuição Diária',
            labels: ['Manhã', 'Noite', 'Petiscos (10%)'],
            valores: [
                Math.round(quantidadePorRefeicao),
                Math.round(quantidadePorRefeicao),
                Math.round(quantidadeDiaria * 0.1)
            ],
            cores: [
                'rgba(255, 193, 7, 0.6)',
                'rgba(102, 126, 234, 0.6)',
                'rgba(40, 167, 69, 0.6)'
            ]
        }
    };

    calculadora.exibirResultado(dados);
}

/**
 * LIMPAR HISTÓRICO
 * Remove todos os cálculos salvos
 */
function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        calculadora.historico = [];
        calculadora.atualizarHistoricoUI();
    }
}