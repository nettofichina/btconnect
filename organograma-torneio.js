let duplas = [];
const minDuplas = 2; // Reduzido para testes com menos duplas
let jogos = [];
let duplasClassificadas = [];
let jogosEliminatoria = [];
let finalistas = [];
let terceiroLugar = [];
let resultadosFinais = {};
let duplasEstatisticas = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adicionarDupla').addEventListener('click', adicionarDupla);
    document.getElementById('limparCampos').addEventListener('click', () => {
        if (confirm('Tem certeza que deseja limpar todos os campos?')) {
            duplas = [];
            jogos = [];
            duplasClassificadas = [];
            jogosEliminatoria = [];
            finalistas = [];
            terceiroLugar = [];
            resultadosFinais = {};
            duplasEstatisticas = {};
            updateListaDuplas();
            document.getElementById('sortearChaves').disabled = true;
            document.getElementById('organogramaSection').style.display = 'none';
        }
    });
    document.getElementById('adicionar8Duplas').addEventListener('click', adicionar8Duplas);
    document.getElementById('sortearChaves').addEventListener('click', sortearChaves);
    document.getElementById('encerrarEtapa').addEventListener('click', encerrarEtapa);
    document.getElementById('encerrarEtapaEliminatoria').addEventListener('click', encerrarEtapaEliminatoria);
    document.getElementById('encerrarSemifinal').addEventListener('click', encerrarSemifinal);
    document.getElementById('encerrarCampeonato').addEventListener('click', encerrarCampeonato);
});

// Função Adicionar Duplas
function adicionarDupla() {
    const jogador1 = document.getElementById('jogador1').value.trim().toUpperCase();
    const jogador2 = document.getElementById('jogador2').value.trim().toUpperCase();

    if (jogador1 && jogador2) {
        if (duplas.some(d => d.includes(jogador1) || d.includes(jogador2))) {
            alert('Os nomes dos jogadores devem ser únicos. Um ou ambos já estão registrados.');
            return;
        }

        duplas.push([jogador1, jogador2]);
        updateListaDuplas();
        document.getElementById('jogador1').value = '';
        document.getElementById('jogador2').value = '';
        document.getElementById('sortearChaves').disabled = duplas.length < minDuplas;
    } else {
        alert('Por favor, preencha ambos os campos.');
    }
}

function updateListaDuplas() {
    const listaDuplas = document.getElementById('duplasListadas');
    listaDuplas.innerHTML = '';
    duplas.forEach((dupla, index) => {
        const li = document.createElement('li');
        li.textContent = `Dupla ${index + 1}: ${dupla.join(' e ')}`;
        li.addEventListener('dblclick', () => removerDupla(index, li));
        listaDuplas.appendChild(li);
    });
}

// Função Remover Duplas
function removerDupla(index, element) {
    duplas.splice(index, 1);
    element.remove();
    updateListaDuplas();
    document.getElementById('sortearChaves').disabled = duplas.length < minDuplas;
}

// Função Temporária
function adicionar8Duplas() {
    for (let i = 1; i <= 8; i++) {
        duplas.push([`JOGADOR${i * 2 - 1}`, `JOGADOR${i * 2}`]);
    }
    updateListaDuplas();
    document.getElementById('sortearChaves').disabled = false;
}

function sortearChaves() {
    if (duplas.length < 3) {
        alert('É necessário pelo menos 3 duplas para começar o torneio.');
        return;
    }

    let grupos = dividirGrupos([...duplas].sort(() => Math.random() - 0.5));
    jogos = [];
    duplasClassificadas = [];

    document.getElementById('organogramaSection').style.display = 'block';
    document.getElementById('faseGrupos').innerHTML = '';
    document.getElementById('faseAtual').style.display = 'block';
    document.getElementById('faseAtual').textContent = 'Fase de Grupos';

    grupos.forEach((grupo, grupoIndex) => {
        const grupoDiv = document.createElement('div');
        grupoDiv.innerHTML = `<h3>Grupo ${grupoIndex + 1}</h3>`;
        
        let jogosGrupo = criarJogosParaGrupo(grupo, grupoIndex);
        jogos.push(...jogosGrupo);
        renderizarJogosParaFase('grupo', jogosGrupo, grupoDiv);
        document.getElementById('faseGrupos').appendChild(grupoDiv);
    });

    document.getElementById('encerrarEtapa').style.display = 'block';
    document.getElementById('encerrarEtapaEliminatoria').style.display = 'none';
}

function dividirGrupos(duplas) {
    if (duplas.length < 3) {
        alert("É necessário pelo menos 3 duplas para formar grupos.");
        return [];
    }
    
    let numGrupos;
    if (duplas.length <= 5) numGrupos = 1;
    else if (duplas.length <= 8) numGrupos = 2;
    else if (duplas.length <= 11) numGrupos = 3;
    else if (duplas.length <= 14) numGrupos = 4;
    else if (duplas.length <= 17) numGrupos = 5;
    else numGrupos = 6; // Para 18 a 20 duplas

    let grupos = [];
    let duplasPorGrupo = Math.floor(duplas.length / numGrupos);
    let resto = duplas.length % numGrupos;

    for (let i = 0; i < numGrupos; i++) {
        let grupoSize = duplasPorGrupo + (i < resto ? 1 : 0);
        grupos.push(duplas.splice(0, grupoSize));
    }

    // Corrigir para garantir distribuição igual para 6 a 8 duplas
    if (duplas.length === 8) {
        if (grupos[0].length !== grupos[1].length) {
            let ajuste = grupos[0].length - grupos[1].length;
            if (ajuste > 0) {
                grupos[1].push(...grupos[0].splice(duplasPorGrupo, ajuste));
            } else {
                grupos[0].push(...grupos[1].splice(duplasPorGrupo, -ajuste));
            }
        }
    }

    return grupos;
}

// Função para criar jogos para um grupo específico
function criarJogosParaGrupo(grupo, grupoIndex) {
    let jogosGrupo = [];
    for (let i = 0; i < grupo.length; i++) {
        for (let j = i + 1; j < grupo.length; j++) {
            jogosGrupo.push({
                dupla1: grupo[i],
                dupla2: grupo[j],
                placar: '',
                submetido: false,
                grupoIndex,
                jogoIndex: jogos.length + jogosGrupo.length // Garantir unicidade
            });
        }
    }
    return jogosGrupo;
}

// Função para renderizar jogos de uma fase específica
function renderizarJogosParaFase(fase, jogos, containerDiv) {
    let jogosDiv = document.createElement('div');
    jogos.forEach(jogo => {
        let jogoElement = document.createElement('p');
        jogoElement.innerHTML = `
            Jogo ${jogo.jogoIndex + 1}: <span class="jogadores">${jogo.dupla1.join(' e ')}</span> vs <span class="jogadores">${jogo.dupla2.join(' e ')}</span>
            <div class="score-container">
                <input type="tel" id="placar_${fase}_${jogo.jogoIndex}" placeholder="Placar (ex: 6-1)">
                <button onclick="submeterPlacarGenerico('${fase}', ${jogo.jogoIndex})">Submeter</button>
            </div>
        `;
        jogosDiv.appendChild(jogoElement);
    });
    containerDiv.appendChild(jogosDiv);
}

// Função para submeter o placar (não incluída na pergunta, mas necessária para o contexto)
function submeterPlacarGenerico(fase, jogoIndex) {
    // Implementação desta função deve ser adicionada ou substituída pela existente
    console.log(`Submeter placar para o jogo ${jogoIndex} da fase ${fase}`);
}

function submeterPlacarGenerico(fase, jogoIndex = undefined) {
    let placarInputId = fase === 'final' ? 'placar_final' : (fase === 'terceiro' ? 'placar_terceiro' : `placar_${fase}_${jogoIndex}`);
    const placarInput = document.getElementById(placarInputId);
    if (!placarInput) {
        console.error(`Elemento "${placarInputId}" não encontrado.`);
        return;
    }

    const placar = placarInput.value;
    if (placar.match(/^\d+-\d+$/)) {
        if (fase === 'final' || fase === 'terceiro') {
            resultadosFinais[fase] = placar;
        } else {
            let jogo = fase === 'grupo' ? jogos.find(j => j.jogoIndex === jogoIndex) : jogosEliminatoria.find(j => j.jogoIndex === jogoIndex);
            if (jogo) {
                jogo.placar = placar;
                jogo.submetido = true;
            } else {
                console.error('Jogo não encontrado para o índice:', jogoIndex);
                return;
            }
        }
        placarInput.disabled = true;
        placarInput.nextElementSibling.textContent = 'Editar';
        placarInput.nextElementSibling.onclick = () => editarPlacarGenerico(fase, jogoIndex);
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function editarPlacarGenerico(fase, jogoIndex = undefined) {
    let placarInputId = fase === 'final' ? 'placar_final' : (fase === 'terceiro' ? 'placar_terceiro' : `placar_${fase}_${jogoIndex}`);
    const placarInput = document.getElementById(placarInputId);
    if (!placarInput) {
        console.error(`Elemento "${placarInputId}" não encontrado.`);
        return;
    }

    if (fase === 'final' || fase === 'terceiro') {
        delete resultadosFinais[fase];
    } else {
        const jogo = jogosEliminatoria.find(j => j.jogoIndex === jogoIndex) || jogos.find(j => j.jogoIndex === jogoIndex);
        if (jogo && jogo.submetido) {
            jogo.submetido = false;
        } else {
            console.error('Jogo não encontrado ou não submetido para o índice:', jogoIndex);
            return;
        }
    }
    placarInput.disabled = false;
    placarInput.value = '';
    placarInput.nextElementSibling.textContent = 'Submeter';
    placarInput.nextElementSibling.onclick = () => submeterPlacarGenerico(fase, jogoIndex);
}

function classificarDuplasPorDesempate(grupo) {
    return grupo.sort((a, b) => {
        let statsA = duplasEstatisticas[a.join(',')] || { pontos: 0, setsVencidos: 0, setsPerdidos: 0 };
        let statsB = duplasEstatisticas[b.join(',')] || { pontos: 0, setsVencidos: 0, setsPerdidos: 0 };
        
        if (statsB.pontos !== statsA.pontos) return statsB.pontos - statsA.pontos;
        let saldoA = statsA.setsVencidos - statsA.setsPerdidos;
        let saldoB = statsB.setsVencidos - statsB.setsPerdidos;
        if (saldoA !== saldoB) return saldoB - saldoA;
        
        // Adicione lógica para confronto direto ou sorteio aqui
        return 0;
    });
}

function encerrarEtapa() {
    console.log("Iniciando encerrarEtapa");
    if (jogos.some(jogo => !jogo.submetido)) {
        alert('Todos os jogos devem ser submetidos antes de encerrar a etapa.');
        return;
    }

    console.log("Atualizando estatísticas:", jogos.length);
    jogos.forEach(jogo => {
        if (jogo.submetido) {
            console.log("Atualizando jogo:", jogo);
            atualizarEstatisticas(jogo);
        }
    });

    console.log("Classificando duplas:", duplasEstatisticas);
    let classificadosPorGrupo = {};
    jogos.forEach(jogo => {
        let dupla1Key = jogo.dupla1.join(',');
        let dupla2Key = jogo.dupla2.join(',');
        if (!classificadosPorGrupo[jogo.grupoIndex]) classificadosPorGrupo[jogo.grupoIndex] = [];
        classificadosPorGrupo[jogo.grupoIndex].push(dupla1Key, dupla2Key);
    });

    let classificados = [];
    Object.values(classificadosPorGrupo).forEach((grupo, index) => {
        console.log(`Classificando grupo ${index}:`, grupo);
        let sorted = classificarDuplasPorDesempate(grupo.map(key => key.split(',')));
        if (duplas.length <= 5) {
            classificados = [sorted[0]]; // Apenas o campeão
        } else {
            classificados.push(...sorted.slice(0, 2)); // 2 primeiros de cada grupo
        }
        console.log("Classificados deste grupo:", sorted.slice(0, 2));
    });

    console.log("Classificados após fase de grupos:", classificados);
    if (duplas.length <= 5) {
        alert(`Campeão: ${classificados[0].join(' e ')}`);
        encerrarCampeonato(classificados[0]);
    } else {
        criarFaseEliminatoria(classificados);
    }

    console.log("Atualizando UI após encerrar etapa");
    const encerrarEtapaBtn = document.getElementById('encerrarEtapa');
    const encerrarEliminatoriaBtn = document.getElementById('encerrarEtapaEliminatoria');
    const faseAtual = document.getElementById('faseAtual');

    if (encerrarEtapaBtn) encerrarEtapaBtn.style.display = 'none';
    if (encerrarEliminatoriaBtn) encerrarEliminatoriaBtn.style.display = 'block';
    if (faseAtual) {
        faseAtual.style.display = 'block';
        faseAtual.textContent = duplas.length <= 8 ? 'Semifinal' : 'Fase Eliminatória';
    }
    console.log("EncerrarEtapa concluída");
}

function criarFaseEliminatoria(classificados) {
    let fase = duplas.length <= 8 ? 'semifinal' : 'quartas';
    jogosEliminatoria = [];
    let nextClassificados = classificados.map(d => d.join(','));

    while (nextClassificados.length > 1) {
        let proximaFase = [];
        for (let i = 0; i < nextClassificados.length; i += 2) {
            jogosEliminatoria.push({
                dupla1: nextClassificados[i].split(','),
                dupla2: nextClassificados[i + 1] ? nextClassificados[i + 1].split(',') : ['Bye', ''],
                placar: '',
                submetido: false,
                jogoIndex: jogosEliminatoria.length,
                fase: fase + 'Details'
            });
            if (nextClassificados[i + 1]) {
                proximaFase.push(nextClassificados[i], nextClassificados[i + 1]);
            } else {
                proximaFase.push(nextClassificados[i]);
            }
        }
        nextClassificados = proximaFase;
        fase = fase === 'quartas' ? 'semifinal' : 'final';
    }

    console.log("Jogos eliminatórios criados:", jogosEliminatoria);

    ['quartasDetails', 'semifinalDetails', 'finalDetails'].forEach(detailsId => {
        let details = document.getElementById(detailsId);
        if (details) {
            details.style.display = 'block';
            details.open = true;
            let faseDiv = document.getElementById(detailsId.replace('Details', ''));
            if (faseDiv) {
                faseDiv.innerHTML = `<h3>${detailsId.replace('Details', '')}</h3>`;
                renderizarJogosParaFase(detailsId.replace('Details', ''), 
                    jogosEliminatoria.filter(j => j.fase === detailsId), faseDiv);
            }
        }
    });
}

function criarSemifinal(classificados) {
    jogosEliminatoria = [];
    for (let i = 0; i < classificados.length; i += 2) {
        jogosEliminatoria.push({
            dupla1: classificados[i],
            dupla2: classificados[i + 1] || ['Bye', ''],
            placar: '',
            submetido: false,
            jogoIndex: jogosEliminatoria.length,
            fase: 'semifinalDetails'
        });
    }

    document.getElementById('semifinalDetails').style.display = 'block';
    document.getElementById('semifinalDetails').open = true;
    let semifinalDiv = document.getElementById('semifinal');
    if (semifinalDiv) {
        semifinalDiv.innerHTML = '<h3>Semifinal</h3>';
        renderizarJogosParaFase('semifinal', jogosEliminatoria, semifinalDiv);
    }
}

function encerrarEtapaEliminatoria() {
    if (jogosEliminatoria.some(jogo => !jogo.submetido)) {
        alert('Todos os jogos da etapa atual devem ser submetidos antes de encerrar.');
        return;
    }

    let currentPhase = document.getElementById('faseAtual').textContent.trim().toLowerCase();
    if (currentPhase === 'semifinal') {
        finalistas = jogosEliminatoria.map(jogo => {
            const [set1, set2] = jogo.placar.split('-').map(Number);
            return set1 > set2 ? jogo.dupla1 : jogo.dupla2;
        });

        let disputaTerceiro = jogosEliminatoria.map(jogo => {
            const [set1, set2] = jogo.placar.split('-').map(Number);
            return set1 < set2 ? jogo.dupla1 : jogo.dupla2;
        });

        // Fechar a fase das semifinais
        document.getElementById('semifinalDetails').open = false;

        // Criar e abrir a fase da disputa pelo terceiro lugar
        const terceiroDetails = document.getElementById('terceiroLugarDetails');
        if (!terceiroDetails) {
            const newDetails = document.createElement('details');
            newDetails.id = 'terceiroLugarDetails';
            newDetails.innerHTML = `<summary>Disputa pelo 3º Lugar</summary><div id="terceiroLugar"></div>`;
            document.getElementById('organogramaSection').insertBefore(newDetails, document.getElementById('finalDetails'));
        }
        document.getElementById('terceiroLugarDetails').style.display = 'block';
        document.getElementById('terceiroLugarDetails').open = true;

        document.getElementById('terceiroLugar').innerHTML = `
            <h3>Disputa pelo 3º Lugar</h3>
            <p>Disputa pelo 3º Lugar: <span class="jogadores">${disputaTerceiro[0].join(' e ')}</span> vs <span class="jogadores">${disputaTerceiro[1].join(' e ')}</span>
            <div class="score-container">
                <input type="tel" id="placar_terceiro" placeholder="Placar (ex: 6-1)">
                <button onclick="submeterPlacarGenerico('terceiro', 0)">Submeter</button>
            </div></p>
        `;

        document.getElementById('finalDetails').style.display = 'block';
        document.getElementById('finalDetails').open = true;
        document.getElementById('final').innerHTML = `
            <h3>Final</h3>
            <p>Final: <span class="jogadores">${finalistas[0].join(' e ')}</span> vs <span class="jogadores">${finalistas[1].join(' e ')}</span>
            <div class="score-container">
                <input type="tel" id="placar_final" placeholder="Placar (ex: 6-1)">
                <button onclick="submeterPlacarGenerico('final', 0)">Submeter</button>
            </div></p>
        `;

        document.getElementById('encerrarEtapaEliminatoria').style.display = 'none';
        document.getElementById('encerrarCampeonato').style.display = 'block';
        document.getElementById('faseAtual').textContent = 'Final';
    }
}

function encerrarCampeonato() {
    if (!resultadosFinais.final || !resultadosFinais.terceiro) {
        alert('Os placares da final e da disputa pelo terceiro lugar devem ser submetidos antes de encerrar o torneio.');
        return;
    }

    const [finalSet1, finalSet2] = resultadosFinais.final.split('-').map(Number);
    const vencedorFinal = finalSet1 > finalSet2 ? finalistas[0] : finalistas[1];
    const perdedorFinal = vencedorFinal === finalistas[0] ? finalistas[1] : finalistas[0];

    // Atualizar terceiroLugar com as duplas que disputaram o terceiro lugar
    const terceiroLugarElement = document.querySelector('#terceiroLugar span.jogadores:nth-child(1)');
    const quartoLugarElement = document.querySelector('#terceiroLugar span.jogadores:nth-child(3)');

    if (terceiroLugarElement && quartoLugarElement) {
        terceiroLugar = [
            terceiroLugarElement.textContent.split(' e '),
            quartoLugarElement.textContent.split(' e ')
        ];
    } else {
        console.error('Elementos para disputa pelo terceiro lugar não encontrados.');
        // Aqui você pode definir valores padrão ou tratar o erro de outra forma se necessário
        terceiroLugar = [['Jogador Desconhecido1', 'Jogador Desconhecido2'], ['Jogador Desconhecido3', 'Jogador Desconhecido4']];
    }

    const [terceiroSet1, terceiroSet2] = resultadosFinais.terceiro.split('-').map(Number);
    const vencedorTerceiro = terceiroSet1 > terceiroSet2 ? terceiroLugar[0] : terceiroLugar[1];
    const perdedorTerceiro = vencedorTerceiro === terceiroLugar[0] ? terceiroLugar[1] : terceiroLugar[0];

    const ranking = [
        { dupla: vencedorFinal, posicao: 1 },
        { dupla: perdedorFinal, posicao: 2 },
        { dupla: vencedorTerceiro, posicao: 3 },
        { dupla: perdedorTerceiro, posicao: 4 }
    ];

    const rankingDiv = document.getElementById('rankingFinal');
    if (rankingDiv) {
        rankingDiv.style.display = 'block';
        rankingDiv.innerHTML = '<h3>Ranking Final</h3>';
        ranking.forEach(({ dupla, posicao }) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'nome';
            
            let medalha = '', color = 'gray';
            switch (posicao) {
                case 1: medalha = '🥇'; color = 'gold'; break;
                case 2: medalha = '🥈'; color = 'silver'; break;
                case 3: medalha = '🥉'; color = 'brown'; break;
            }

            rankItem.innerHTML = `
                <span class="position">${posicao}.</span> 
                ${medalha} ${dupla.join(' e ')}
            `;
            rankItem.style.color = color;
            rankItem.setAttribute('aria-label', `${dupla.join(' e ')} está na posição ${posicao}.`);
            rankingDiv.appendChild(rankItem);
        });

        // Atualiza a fase atual
        document.getElementById('faseAtual').textContent = 'Torneio Encerrado';
        document.getElementById('faseAtual').style.display = 'block';
    }
}

function transitarParaProximaFase(nextPhase, vencedores) {
    const nextPhaseDetailsId = `${nextPhase.toLowerCase()}Details`;
    const nextPhaseDivId = nextPhase.toLowerCase();

    const nextPhaseDetails = document.getElementById(nextPhaseDetailsId);
    if (!nextPhaseDetails) {
        console.error('Elemento da próxima fase não encontrado:', nextPhaseDetailsId);
        return;
    }
    nextPhaseDetails.style.display = 'block';
    nextPhaseDetails.open = true;

    const nextPhaseDiv = document.getElementById(nextPhaseDivId);
    if (!nextPhaseDiv) {
        console.error('Div da próxima fase não encontrado:', nextPhaseDivId);
        return;
    }
    nextPhaseDiv.innerHTML = `<h3>${nextPhase}</h3>`;
    
    jogosEliminatoria = [];
    for (let i = 0; i < vencedores.length; i += 2) {
        jogosEliminatoria.push({
            dupla1: vencedores[i],
            dupla2: vencedores[i + 1] || ['Bye', ''], // Adiciona 'Bye' se necessário
            placar: '',
            submetido: false,
            jogoIndex: jogosEliminatoria.length
        });
    }

    renderizarJogosParaFase(nextPhase.toLowerCase(), jogosEliminatoria, nextPhaseDiv);

    document.getElementById('faseAtual').textContent = nextPhase;
    document.getElementById('encerrarEtapaEliminatoria').style.display = 'block';
    document.getElementById('encerrarEtapa').style.display = 'none';
}

function atualizarBotaoEncerrarEtapa() {
    const botaoEncerrar = document.getElementById('encerrarEtapa');
    if (botaoEncerrar) {
        switch(document.getElementById('faseAtual').textContent.trim().toLowerCase()) {
            case 'fase de grupos':
                botaoEncerrar.textContent = 'Encerrar Fase de Grupos';
                botaoEncerrar.onclick = encerrarEtapa;
                break;
            case 'quartas de final':
                botaoEncerrar.textContent = 'Encerrar Quartas de Final';
                botaoEncerrar.onclick = encerrarEtapaEliminatoria;
                break;
            case 'semifinal':
                botaoEncerrar.textContent = 'Encerrar Semifinal';
                botaoEncerrar.onclick = encerrarSemifinal; // Supondo que você tenha essa função
                break;
            case 'final':
                botaoEncerrar.textContent = 'Encerrar Torneio';
                botaoEncerrar.onclick = encerrarCampeonato; // Supondo que você tenha essa função
                break;
            default:
                botaoEncerrar.textContent = 'Encerrar Etapa';
                botaoEncerrar.onclick = encerrarEtapaEliminatoria;
        }
        botaoEncerrar.style.display = 'block';
    } else {
        console.error("Botão 'encerrarEtapa' não encontrado.");
    }
}

function atualizarEstatisticas(jogo) {
    const [set1, set2] = jogo.placar.split('-').map(Number);
    const vencedor = set1 > set2 ? jogo.dupla1 : jogo.dupla2;
    const perdedor = vencedor === jogo.dupla1 ? jogo.dupla2 : jogo.dupla1;

    function updateStats(dupla, pontos) {
        const duplaKey = dupla.join(',');
        if (!duplasEstatisticas[duplaKey]) {
            duplasEstatisticas[duplaKey] = { jogos: 0, pontos: 0, setsVencidos: 0, setsPerdidos: 0 };
        }
        duplasEstatisticas[duplaKey].jogos++;
        duplasEstatisticas[duplaKey].pontos += pontos;
        if (dupla === vencedor) {
            duplasEstatisticas[duplaKey].setsVencidos += set1;
            duplasEstatisticas[duplaKey].setsPerdidos += set2;
        } else {
            duplasEstatisticas[duplaKey].setsVencidos += set2;
            duplasEstatisticas[duplaKey].setsPerdidos += set1;
        }
    }

    updateStats(vencedor, 3); // Supondo 3 pontos por vitória
    updateStats(perdedor, 1); // Supondo 1 ponto por derrota
}