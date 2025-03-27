let torneio = {
    grupos: [],
    eliminatória: {
        quartas: [],
        semi: [],
        final: [],
        byes: []
    }
};
let jogadoresAdicionados = [];
let duplasAdicionadas = [];
let duplaCounter = 1;
let jogadorCounter = 1;
let faseAtual = 'grupos'; // Indicador da fase atual do torneio

// Função para embaralhar array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para adicionar uma dupla
function adicionarDupla(jogador1, jogador2) {
    if (jogadoresAdicionados.indexOf(jogador1) !== -1 || jogadoresAdicionados.indexOf(jogador2) !== -1) {
        alert('Jogador já adicionado. Por favor, escolha nomes diferentes.');
        return;
    }

    let duplaName = `Dupla ${duplaCounter}: ${jogador1} e ${jogador2}`;
    duplasAdicionadas.push(duplaName);
    jogadoresAdicionados.push(jogador1, jogador2);

    let listItem = document.createElement('li');
    listItem.textContent = duplaName;
    listItem.addEventListener('dblclick', function () {
        removerDupla(this, duplaName, jogador1, jogador2);
    });
    document.getElementById('duplasList').appendChild(listItem);
    duplaCounter++;
    salvarEstado(); // Salva o estado após adicionar uma dupla
}

// Função para letras maiusculas
function toUpperCase(event) {
    event.target.value = event.target.value.toUpperCase();
}

function removerDupla(element, duplaName, jogador1, jogador2) {
    element.remove();
    duplasAdicionadas = duplasAdicionadas.filter(d => d !== duplaName);
    jogadoresAdicionados = jogadoresAdicionados.filter(j => j !== jogador1 && j !== jogador2);
    duplaCounter--;
    salvarEstado(); // Adicionar esta linha para salvar o estado após a remoção
}

// Função para calcular classificação dentro de um grupo
function calcularClassificacao(grupo) {
    let classificacao = grupo.duplas.map(dupla => ({
        nome: dupla,
        vitorias: 0,
        setsVencidos: 0,
        setsPerdidos: 0,
        diferencaSets: 0  // Adicionando esta nova propriedade
    }));

    grupo.resultados.forEach(resultado => {
        let [dupla1, dupla2] = resultado.confronto.split(' vs ');
        let [set1, set2] = resultado.placar.split('-').map(Number);

        let dupla1Info = classificacao.find(d => d.nome === dupla1);
        let dupla2Info = classificacao.find(d => d.nome === dupla2);

        if (set1 > set2) {
            dupla1Info.vitorias++;
        } else {
            dupla2Info.vitorias++;
        }
        dupla1Info.setsVencidos += set1;
        dupla1Info.setsPerdidos += set2;
        dupla2Info.setsVencidos += set2;
        dupla2Info.setsPerdidos += set1;

        // Calculando a diferença de sets
        dupla1Info.diferencaSets += (set1 - set2);
        dupla2Info.diferencaSets += (set2 - set1);
    });

    return classificacao.sort((a, b) => {
        if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
        return b.diferencaSets - a.diferencaSets; // Usando diferença de sets como critério de desempate
    });
}

// Função para determinar quem avança para a fase eliminatória
function determinarClassificados(fase) {
    switch(fase) {
        case 'grupos':
            let classificados = [];
            let allDuplas = [];

            torneio.grupos.forEach(grupo => {
                let classificacao = calcularClassificacao(grupo);
                classificados.push(...classificacao.slice(0, 2).map(c => ({ ...c, grupo: grupo.nome })));
                allDuplas = allDuplas.concat(classificacao);
            });

            // Ordenar todas as duplas pelo desempenho geral
            let melhorDesempenho = allDuplas.sort((a, b) => {
                if (b.vitorias !== a.vitorias) return b.vitorias - a.vitorias;
                return b.diferencaSets - a.diferencaSets;
            })[0].nome;

            // Configurar BYE para a melhor dupla geral
            torneio.eliminatória.byes = [melhorDesempenho];

            // Quartas de final: partidas diretas para as outras duplas
            let quartasDeFinal = [];
            let duplasSemBye = classificados.filter(d => d.nome !== melhorDesempenho);
            for (let i = 0; i < duplasSemBye.length; i += 2) {
                quartasDeFinal.push({ 
                    dupla1: duplasSemBye[i].nome, 
                    dupla2: duplasSemBye[i + 1] ? duplasSemBye[i + 1].nome : "BYE", 
                    placar: null 
                });
            }
            torneio.eliminatória.quartas = quartasDeFinal;

            // Retornar todos os classificados para futuras verificações
            return classificados.map(c => c.nome);

        case 'quartas':
            if (!torneio.eliminatória.quartas) {
                console.error('Quartas de final não configuradas.');
                return [];
            }
            return torneio.eliminatória.quartas.map(partida => {
                if (partida.dupla2 === "BYE") {
                    return partida.dupla1;
                }
                if (!partida.placar) {
                    console.error('Placar não definido para a quarta de final:', partida);
                    return null;
                }
                let [dupla1, dupla2] = partida.placar.split('-').map(Number);
                return dupla1 > dupla2 ? partida.dupla1 : partida.dupla2;
            }).filter(dupla => dupla !== null);

        case 'semi':
            let vencedoresQuartas = determinarClassificados('quartas');
            return [torneio.eliminatória.byes[0], ...vencedoresQuartas];

        case 'final':
            if (!torneio.eliminatória.final[0].placar) {
                console.error('Placar não definido para a final:', torneio.eliminatória.final[0]);
                return [];
            }
            let [dupla1, dupla2] = torneio.eliminatória.final[0].placar.split('-').map(Number);
            return [dupla1 > dupla2 ? torneio.eliminatória.final[0].dupla1 : torneio.eliminatória.final[0].dupla2];

        default:
            console.error('Fase desconhecida:', fase);
            return [];
    }
}

// Função para configurar a fase eliminatória
function configurarFaseEliminatoria(classificados, fase) {
    let eliminatóriaDiv = document.getElementById('faseEliminatoria') || document.createElement('div');
    if (!document.getElementById('faseEliminatoria')) {
        eliminatóriaDiv.id = 'faseEliminatoria';
        document.body.appendChild(eliminatóriaDiv);
    }

    let faseText = {
        'quartas': 'Quartas de Final',
        'semi': 'Semifinal',
        'final': 'Final'
    };

    eliminatóriaDiv.innerHTML += `<h2>Fase Eliminatória - ${faseText[fase]}</h2>`;

    switch (fase) {
        case 'quartas':
            torneio.eliminatória.quartas.forEach((partida, index) => {
                let partidaDiv = document.createElement('div');
                if (partida.dupla2 !== "BYE") {
                    partidaDiv.innerHTML = `Partida ${index + 1}: ${partida.dupla1} vs ${partida.dupla2} - Placar: <input type="text" placeholder="6-1" size="4"><button onclick="submeterPlacarEliminatoria(this, 'quartas', ${index})">Submeter</button>`;
                } else {
                    partidaDiv.innerHTML = `Partida ${index + 1}: ${partida.dupla1} avança por BYE`;
                }
                eliminatóriaDiv.appendChild(partidaDiv);
            });
            break;

        case 'semi':
            let semifinalistas = determinarClassificados('semi');
            for (let i = 0; i < semifinalistas.length; i++) {
                if (i === 0) { // Primeiro item é o BYE
                    eliminatóriaDiv.innerHTML += `<p>${semifinalistas[i]} avança por BYE para a semifinal</p>`;
                } else {
                    let partidaDiv = document.createElement('div');
                    partidaDiv.innerHTML = `Partida ${Math.floor((i - 1) / 2) + 1}: ${semifinalistas[i]} vs ${semifinalistas[i + 1]} - Placar: <input type="text" placeholder="6-1" size="4"><button onclick="submeterPlacarEliminatoria(this, 'semi', ${Math.floor((i - 1) / 2)})">Submeter</button>`;
                    eliminatóriaDiv.appendChild(partidaDiv);
                    i++; // Pula para o próximo par
                }
            }
            break;

        case 'final':
            if (!torneio.eliminatória.semi || torneio.eliminatória.semi.length !== 2) {
                console.error('Semifinal não configurada corretamente para prosseguir à final');
                return;
            }
            let finalistas = determinarClassificados('semi');
            torneio.eliminatória.final = [{ dupla1: finalistas[0], dupla2: finalistas[1], placar: null }];
            let partidaFinalDiv = document.createElement('div');
            partidaFinalDiv.innerHTML = `Partida 1: ${finalistas[0]} vs ${finalistas[1]} - Placar: <input type="text" placeholder="6-1" size="4"><button onclick="submeterPlacarEliminatoria(this, 'final', 0)">Submeter</button>`;
            eliminatóriaDiv.appendChild(partidaFinalDiv);
            break;
        default:
            console.error('Fase desconhecida:', fase);
    }
}

// Função para submeter placar na fase eliminatória
function submeterPlacarEliminatoria(button, fase, index) {
    let input = button.previousElementSibling;
    let placar = input.value;
    if (placar && /^\d+-\d+$/.test(placar)) {
        if (!torneio.eliminatória[fase] || !torneio.eliminatória[fase][index]) {
            console.error('Dados da fase ou partida não encontrados:', fase, index);
            return;
        }
        torneio.eliminatória[fase][index].placar = placar;
        input.disabled = true;
        button.textContent = 'Editar';
        button.onclick = function () {
            input.disabled = false;
            this.textContent = 'Submeter';
            this.onclick = () => submeterPlacarEliminatoria(this, fase, index);
        };
    } else {
        alert('Formato de placar inválido. Use o formato "X-Y".');
    }
    salvarEstado(); // Salva o estado após submeter um placar na fase eliminatória
}

// Função para verificar se todos os placares foram submetidos
function verificarTodosPlacaresSubmetidos(fase) {
    if (fase === 'grupos') {
        let grupos = document.getElementById('gruposChaves').children;
        return Array.from(grupos).every(grupo => {
            let inputs = grupo.querySelectorAll('input[type="text"]');
            return Array.from(inputs).every(input => input.disabled);
        });
    } else {
        let faseDiv = document.getElementById('faseEliminatoria');
        if (!faseDiv) return false;
        let jogos = faseDiv.querySelectorAll('input[type="text"]');
        return Array.from(jogos).every(input => input.disabled);
    }
}

// Função para encerrar a etapa atual do torneio
function encerrarEtapa() {
    switch (faseAtual) {
        case 'grupos':
            if (verificarTodosPlacaresSubmetidos(faseAtual)) {
                let classificados = determinarClassificados(faseAtual);
                let byes = torneio.eliminatória.byes || [];
                alert(`As seguintes duplas avançam por BYE: ${byes.join(', ')}`);
                if (torneio.eliminatória.quartas) {
                    configurarFaseEliminatoria(classificados, 'quartas');
                    faseAtual = 'quartas';
                    document.getElementById('encerrarEtapa').textContent = 'Encerrar Quartas de Final';
                } else {
                    configurarFaseEliminatoria(classificados, 'semi');
                    faseAtual = 'semi';
                    document.getElementById('encerrarEtapa').textContent = 'Encerrar Semifinal';
                }
            } else {
                alert('Todos os placares devem ser submetidos antes de encerrar a etapa.');
            }
            break;
        case 'quartas':
            if (verificarTodosPlacaresSubmetidos(faseAtual)) {
                let vencedoresQuartas = determinarClassificados(faseAtual);
                configurarFaseEliminatoria(vencedoresQuartas, 'semi');
                faseAtual = 'semi';
                document.getElementById('encerrarEtapa').textContent = 'Encerrar Semifinal';
            } else {
                alert('Todos os placares das quartas de final devem ser submetidos antes de avançar.');
            }
            break;
        case 'semi':
            if (verificarTodosPlacaresSubmetidos(faseAtual)) {
                let vencedoresSemi = determinarClassificados(faseAtual);
                configurarFaseEliminatoria(vencedoresSemi, 'final');

                let perdedoresSemi = torneio.eliminatória.semi.map(partida => {
                    let [dupla1, dupla2] = partida.placar.split('-').map(Number);
                    return dupla1 < dupla2 ? partida.dupla1 : partida.dupla2;
                });
                configurarFaseEliminatoria(perdedoresSemi, 'terceiro');
                faseAtual = 'final';
                document.getElementById('encerrarEtapa').textContent = 'Encerrar Final';
            } else {
                alert('Todos os placares da semifinal devem ser submetidos antes de avançar.');
            }
            break;
        case 'final':
            if (verificarTodosPlacaresSubmetidos(faseAtual)) {
                encerrarCampeonato();
            } else {
                alert('O placar da final e da disputa pelo 3º lugar devem ser submetidos antes de encerrar.');
            }
            break;
        default:
            console.error('Fase desconhecida:', faseAtual);
    }
    salvarEstado(); // Salva o estado após encerrar uma etapa
}

// Função para começar o torneio
function comecarTorneio() {
    const numDuplas = parseInt(document.getElementById('numDuplas').value);
    const numGrupos = parseInt(document.getElementById('numGrupos').value);

    if (duplasAdicionadas.length !== numDuplas) {
        alert(`Por favor, adicione exatamente ${numDuplas} duplas para começar o torneio.`);
        return;
    }

    if (numDuplas < numGrupos) {
        alert('O número de duplas deve ser maior ou igual ao número de grupos.');
        return;
    }

    torneio.grupos = [];
    for (let i = 0; i < numGrupos; i++) {
        torneio.grupos.push({ nome: `Grupo ${i + 1}`, duplas: [], resultados: [] });
    }

    let duplasSorteadas = shuffleArray(duplasAdicionadas);
    let duplasPorGrupo = Math.floor(numDuplas / numGrupos);
    let excesso = numDuplas % numGrupos;

    duplasSorteadas.forEach((dupla, index) => {
        let grupoIndex = Math.floor(index / duplasPorGrupo);
        if (excesso > 0 && index >= (numDuplas - excesso)) {
            grupoIndex = numGrupos - 1; // Adiciona a dupla extra ao último grupo
            excesso--;
        }
        if (dupla) {
            let duplaNome = dupla.split(':')[1];
            if (duplaNome) {
                torneio.grupos[grupoIndex].duplas.push(duplaNome.trim());
            } else {
                console.error("Nome da dupla inválido:", dupla);
            }
        } else {
            console.error("Dupla não definida na posição:", index);
        }
    });

    const gruposChavesDiv = document.getElementById('gruposChaves');
    gruposChavesDiv.innerHTML = '';

    torneio.grupos.forEach(grupo => {
        const grupoDiv = document.createElement('div');
        grupoDiv.innerHTML = `<h3>${grupo.nome}</h3>`;

        let jogoCounter = 1;
        for (let i = 0; i < grupo.duplas.length; i++) {
            for (let j = i + 1; j < grupo.duplas.length; j++) {
                const confronto = document.createElement('div');
                let input = document.createElement('input');
                input.type = 'text';
                input.placeholder = '6-1';
                input.size = '4';

                let submeterButton = document.createElement('button');
                submeterButton.textContent = 'Submeter';
                submeterButton.addEventListener('click', function () {
                    if (this.textContent === 'Submeter') {
                        let placar = input.value;
                        if (placar && /^\d+-\d+$/.test(placar)) {
                            this.textContent = 'Editar';
                            this.setAttribute('data-placar', placar);
                            input.disabled = true;
                            
                            // Encontra o índice do grupo atual
                            let grupoIndex = torneio.grupos.indexOf(grupo);
                            torneio.grupos[grupoIndex].resultados.push({
                                confronto: `${grupo.duplas[i]} vs ${grupo.duplas[j]}`,
                                placar: placar
                            });
                            salvarEstado(); // Salva o estado após submeter um placar na fase de grupo
                        } else {
                            alert('Formato de placar inválido. Use o formato "X-Y".');
                        }
                    } else {
                        this.textContent = 'Submeter';
                        input.disabled = false;
                        input.value = this.getAttribute('data-placar') || '';
                    }
                });

                confronto.innerHTML = `Jogo ${jogoCounter}: ${grupo.duplas[i]} vs ${grupo.duplas[j]}: `;
                confronto.appendChild(input);
                confronto.appendChild(submeterButton);
                grupoDiv.appendChild(confronto);
                jogoCounter++;
            }
        }
        gruposChavesDiv.appendChild(grupoDiv);
    });

    const encerrarEtapaButton = document.createElement('button');
    encerrarEtapaButton.id = 'encerrarEtapa';
    encerrarEtapaButton.textContent = 'Encerrar etapa';
    gruposChavesDiv.appendChild(encerrarEtapaButton);

    encerrarEtapaButton.addEventListener('click', encerrarEtapa);

    console.log(torneio);
    alert('Torneio começado! Grupos configurados e confrontos criados.');
    salvarEstado(); // Salva o estado inicial do torneio
}

// Função temporária para adicionar 8 duplas para testes
function adicionarDuplasTeste() {
    for (let i = 1; i <= 8; i++) {
        let jogador1 = `JOGADOR${jogadorCounter}`;
        let jogador2 = `JOGADOR${jogadorCounter + 1}`;
        adicionarDupla(jogador1, jogador2);
        jogadorCounter += 2;
    }
}

// Função para encerrar campeonato
function encerrarCampeonato() {
    if (verificarTodosPlacaresSubmetidos('final') && verificarTodosPlacaresSubmetidos('terceiro')) {
        let finalistas = determinarClassificados('final');
        let terceiroLugar = determinarClassificados('terceiro');

        if (finalistas.length < 1 || terceiroLugar.length < 1) {
            console.error('Erro ao determinar classificados finais. Final:', finalistas, 'Terceiro:', terceiroLugar);
            alert('Ocorreu um erro ao determinar os classificados finais. Por favor, verifique os placares.');
            return;
        }

        // Aqui, estamos assumindo que só temos um vencedor e um terceiro lugar.
        let vencedor = finalistas[0];
        let segundoLugar = torneio.eliminatória.final[0].dupla1 === vencedor ? torneio.eliminatória.final[0].dupla2 : torneio.eliminatória.final[0].dupla2;
        let terceiro = terceiroLugar[0];
        let quarto = torneio.eliminatória.terceiro[0].dupla1 === terceiro ? torneio.eliminatória.terceiro[0].dupla2 : torneio.eliminatória.terceiro[0].dupla2;

        alert(`Parabéns! O vencedor do torneio é: ${vencedor}`);

        let classificacaoFinal = [
            { lugar: 1, dupla: vencedor },
            { lugar: 2, dupla: segundoLugar },
            { lugar: 3, dupla: terceiro },
            { lugar: 4, dupla: quarto }
        ];

        let rankingHTML = '<h2>Classificação Final</h2>';
        classificacaoFinal.forEach(item => {
            rankingHTML += `<p>${item.lugar}º Lugar: ${item.dupla}</p>`;
        });

        let rankingDiv = document.createElement('div');
        rankingDiv.innerHTML = rankingHTML;

        let faseEliminatoriaDiv = document.getElementById('faseEliminatoria');
        faseEliminatoriaDiv.appendChild(rankingDiv);

        document.getElementById('encerrarEtapa').disabled = true;
        document.getElementById('encerrarEtapa').textContent = 'Torneio Encerrado';
    } else {
        alert('Todos os placares da final e da disputa pelo 3º lugar devem ser submetidos antes de encerrar o torneio.');
    }
}

function salvarEstado() {
    localStorage.setItem('torneioState', JSON.stringify(torneio));
}

function carregarEstado() {
    const savedState = localStorage.getItem('torneioState');
    if (savedState) {
        torneio = JSON.parse(savedState);
    }
}

// Carregar estado ao iniciar a aplicação
document.addEventListener('DOMContentLoaded', carregarEstado);

// Event listeners
document.getElementById('comecarTorneio').addEventListener('click', comecarTorneio);
document.getElementById('adicionarDupla').addEventListener('click', function () {
    let jogador1 = document.getElementById('jogador1').value;
    let jogador2 = document.getElementById('jogador2').value;
    if (jogador1 && jogador2) {
        adicionarDupla(jogador1, jogador2);
        document.getElementById('jogador1').value = '';
        document.getElementById('jogador2').value = '';
    } else {
        alert('Por favor, preencha ambos os campos para adicionar uma dupla.');
    }
});

document.getElementById('adicionarDuplasTeste').addEventListener('click', adicionarDuplasTeste);

document.getElementById('jogador1').addEventListener('input', toUpperCase);
document.getElementById('jogador2').addEventListener('input', toUpperCase);