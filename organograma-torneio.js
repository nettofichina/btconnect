let duplas = [];
const minDuplas = 8;
let jogos = [];
let duplasClassificadas = [];
let jogosEliminatoria = [];
let finalistas = [];
let terceiroLugar = [];
let resultadosFinais = {};
let duplasEstatisticas = {};


function calcularPontos(placar1, placar2) {
    const diferenca = Math.abs(placar1 - placar2);
    return diferenca > 0 ? diferenca : 1; // No caso de empate, atribuímos 1 ponto por time
}

function exibirResumo(fase, div) {
    let resumoHTML = `<h4>Resultado da ${fase}</h4>`;
    // Ordenar as duplas por pontos, do maior para o menor
    const sortedDuplas = Object.entries(duplasEstatisticas).sort((a, b) => b[1].pontos - a[1].pontos);
    
    for (let [dupla, stats] of sortedDuplas) {
        resumoHTML += `<p>${dupla.split(',').join(' e ')} - ${stats.jogos} Jogos | ${stats.pontos} Pontos</p>`;
    }
    div.innerHTML += resumoHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('adicionarDupla').addEventListener('click', adicionarDupla);
    document.getElementById('sortearChaves').addEventListener('click', sortearChaves);
    document.getElementById('encerrarEtapa').addEventListener('click', encerrarEtapa);
    document.getElementById('encerrarEtapaEliminatoria').addEventListener('click', encerrarEtapaEliminatoria);
    document.getElementById('encerrarCampeonato').addEventListener('click', encerrarCampeonato);
    document.getElementById('adicionar8Duplas').addEventListener('click', adicionar8Duplas);
    document.getElementById('salvarCampeonato').addEventListener('click', salvarCampeonato);
    document.getElementById('limparCampos').addEventListener('click', limparCampos);
    document.getElementById('salvarCampeonato').addEventListener('click', salvarCampeonato);
    document.getElementById('voltarParaHome').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
});

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
        salvarEstado(); // Salva o estado após adicionar uma nova dupla
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

function removerDupla(index, element) {
    duplas.splice(index, 1);
    element.remove();
    updateListaDuplas();
    document.getElementById('sortearChaves').disabled = duplas.length < minDuplas;
    salvarEstado(); // Salva o estado após remover uma dupla
}

// Função para adicionar 8 duplas temporariamente (IREMOS APAGAR ESSA FUNÇÃO POSTERIORMENTE)
function adicionar8Duplas() {
    for (let i = 1; i <= 8; i++) {
        duplas.push([`JOGADOR${i * 2 - 1}`, `JOGADOR${i * 2}`]);
    }
    updateListaDuplas();
    document.getElementById('sortearChaves').disabled = false; // Habilita o botão "Começar Torneio"
    salvarEstado(); // Salva o estado após adicionar as duplas de teste
}

function sortearChaves() {
    if (duplas.length < minDuplas) {
        alert('É necessário no mínimo 8 duplas para começar o torneio.');
        return;
    }

    const grupos = [];
    const duplasEmbaralhadas = [...duplas].sort(() => Math.random() - 0.5);

    for (let i = 0; i < duplasEmbaralhadas.length; i += 4) {
        grupos.push(duplasEmbaralhadas.slice(i, i + 4));
    }

    const organogramaSection = document.getElementById('organogramaSection');
    organogramaSection.style.display = 'block';

    const faseGruposDiv = document.getElementById('faseGrupos');
    faseGruposDiv.innerHTML = '';
    jogos = [];
    duplasClassificadas = [];
    jogosEliminatoria = []; // Resetando jogos da fase eliminatória

    grupos.forEach((grupo, grupoIndex) => {
        const grupoDiv = document.createElement('div');
        grupoDiv.innerHTML = `<h3>Grupo ${grupoIndex + 1}</h3>`;
        grupoDiv.appendChild(criarJogosParaGrupo(grupo, grupoIndex));
        faseGruposDiv.appendChild(grupoDiv);
    });

    // Mostrar "Fase de Grupos"
    document.getElementById('faseAtual').style.display = 'block';
    document.getElementById('faseAtual').textContent = 'Fase de Grupos';

    document.getElementById('encerrarEtapa').style.display = 'block'; // Mostra o botão "Encerrar Etapa"
    document.getElementById('faseEliminatoria').innerHTML = ''; // Mantém a div vazia até que seja necessário
    document.getElementById('encerrarEtapaEliminatoria').style.display = 'none'; // Oculta o botão
    document.getElementById('encerrarCampeonato').style.display = 'none'; // Oculta o botão
    salvarEstado(); // Salva o estado após sortear as chaves
}

function criarJogosParaGrupo(grupo, grupoIndex) {
    let jogosGrupo = document.createElement('div');
    let grupoEmbaralhado = [...grupo].sort(() => Math.random() - 0.5);
    let jogosArray = [];

    for (let i = 0; i < grupoEmbaralhado.length; i += 2) {
        jogosArray.push({ dupla1: grupoEmbaralhado[i], dupla2: grupoEmbaralhado[i + 1], placar: '', submetido: false, grupoIndex, jogoIndex: i / 2 });
    }

    jogosArray.forEach(jogo => {
        const jogoDiv = document.createElement('p');
        jogoDiv.innerHTML = `
            Jogo ${jogo.jogoIndex + 1}: <span class="jogadores">${jogo.dupla1.join(' e ')}</span> vs <span class="jogadores">${jogo.dupla2.join(' e ')}</span>
            <div class="score-container">
                <input type="tel" id="placar_${jogo.grupoIndex}_${jogo.jogoIndex}" placeholder="Placar (ex: 6-1)">
                <button onclick="submeterPlacar(${jogo.grupoIndex}, ${jogo.jogoIndex})">Submeter</button>
            </div>
        `;
        jogosGrupo.appendChild(jogoDiv);
        jogos.push(jogo);
    });

    return jogosGrupo;
}

function submeterPlacar(grupoIndex, jogoIndex) {
    const placarInput = document.getElementById(`placar_${grupoIndex}_${jogoIndex}`);
    const placar = placarInput.value;
    const jogo = jogos.find(j => j.grupoIndex === grupoIndex && j.jogoIndex === jogoIndex);

    if (placar.match(/^\d+-\d+$/)) {
        jogo.placar = placar;
        if (!jogo.submetido) {
            jogo.submetido = true;
            placarInput.disabled = true; // Desabilita o input para evitar novas edições
            const button = placarInput.nextElementSibling;
            button.textContent = 'Editar'; // Altera o texto do botão para 'Editar'
            button.onclick = () => editarPlacar(grupoIndex, jogoIndex); // Define a função para editar
        }
        salvarEstado(); // Salva o estado após submeter um placar
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function editarPlacar(grupoIndex, jogoIndex) {
    const placarInput = document.getElementById(`placar_${grupoIndex}_${jogoIndex}`);
    const jogo = jogos.find(j => j.grupoIndex === grupoIndex && j.jogoIndex === jogoIndex);
    
    if (jogo.submetido) {
        jogo.submetido = false; // Reverte o status para não submetido
        placarInput.disabled = false; // Reabilita o input para edição
        placarInput.value = ''; // Limpa o valor para evitar confusão
        const button = placarInput.nextElementSibling;
        button.textContent = 'Submeter'; // Altera o texto de volta para 'Submeter'
        button.onclick = () => submeterPlacar(grupoIndex, jogoIndex); // Redefine a função para submeter
        salvarEstado(); // Salva o estado após permitir edição
    }
}

function encerrarEtapa() {
    if (jogos.some(jogo => !jogo.submetido)) {
        alert('Todos os jogos devem ser submetidos antes de encerrar a etapa.');
        return;
    }

    duplasClassificadas = jogos.map(jogo => {
        const [set1, set2] = jogo.placar.split('-').map(Number);
        return set1 > set2 ? jogo.dupla1 : jogo.dupla2;
    });

    // Fecha a fase de grupos
    document.getElementById('faseGruposDetails').open = false;

    // Abre a fase eliminatória
    const faseEliminatoriaDetails = document.getElementById('faseEliminatoriaDetails');
    faseEliminatoriaDetails.style.display = 'block'; // Certifica-se de que está visível
    faseEliminatoriaDetails.open = true;

    const faseEliminatoriaDiv = document.getElementById('faseEliminatoria');
    faseEliminatoriaDiv.innerHTML = '<h3>Fase Eliminatória</h3>';
    
    // Cria confrontos da fase eliminatória com inputs para placar
    for (let i = 0; i < duplasClassificadas.length; i += 2) {
        const jogoDiv = document.createElement('p');
        jogoDiv.innerHTML = `
            Jogo ${i/2 + 1}: <span class="jogadores">${duplasClassificadas[i].join(' e ')}</span> vs <span class="jogadores">${duplasClassificadas[i + 1].join(' e ')}</span>
            <div class="score-container">
                <input type="tel" id="placar_eliminatoria_${i/2}" placeholder="Placar (ex: 6-1)">
                <button onclick="submeterPlacarEliminatoria(${i/2})">Submeter</button>
            </div>
        `;
        faseEliminatoriaDiv.appendChild(jogoDiv);
        jogosEliminatoria.push({ dupla1: duplasClassificadas[i], dupla2: duplasClassificadas[i + 1], placar: '', submetido: false, jogoIndex: i/2 });
    }

    // Manipulação dos botões
    document.getElementById('encerrarEtapa').style.display = 'none';
    document.getElementById('encerrarEtapaEliminatoria').style.display = 'block';

    // Esconde todos os botões de "Submeter" ou "Editar" na etapa encerrada
    document.querySelectorAll('#faseGrupos button').forEach(button => {
        if (button.textContent === 'Submeter' || button.textContent === 'Editar') {
            button.style.display = 'none';
        }
    });

    salvarEstado(); // Salva o estado ao encerrar a etapa de grupos
}

function submeterPlacarEliminatoria(jogoIndex) {
    const placarInput = document.getElementById(`placar_eliminatoria_${jogoIndex}`);
    const placar = placarInput.value;
    const jogo = jogosEliminatoria.find(j => j.jogoIndex === jogoIndex);

    if (placar.match(/^\d+-\d+$/)) {
        jogo.placar = placar;
        if (!jogo.submetido) {
            jogo.submetido = true;
            placarInput.disabled = true; // Desabilita o input para evitar novas edições
            const button = placarInput.nextElementSibling;
            button.textContent = 'Editar'; // Altera o texto do botão para 'Editar'
            button.onclick = () => editarPlacarEliminatoria(jogoIndex); // Define a função para editar
        }
        salvarEstado(); // Salva o estado após submeter um placar
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function editarPlacarEliminatoria(jogoIndex) {
    const placarInput = document.getElementById(`placar_eliminatoria_${jogoIndex}`);
    const jogo = jogosEliminatoria.find(j => j.jogoIndex === jogoIndex);
    
    if (jogo.submetido) {
        jogo.submetido = false; // Reverte o status para não submetido
        placarInput.disabled = false; // Reabilita o input para edição
        placarInput.value = ''; // Limpa o valor para evitar confusão
        const button = placarInput.nextElementSibling;
        button.textContent = 'Submeter'; // Altera o texto de volta para 'Submeter'
        button.onclick = () => submeterPlacarEliminatoria(jogoIndex); // Redefine a função para submeter
        salvarEstado(); // Salva o estado após permitir edição
    }
}

function encerrarEtapaEliminatoria() {
    if (jogosEliminatoria.some(jogo => !jogo.submetido)) {
        alert('Todos os jogos da fase eliminatória devem ser submetidos antes de encerrar a etapa.');
        return;
    }

    // Determina os vencedores da fase eliminatória
    finalistas = jogosEliminatoria.map(jogo => {
        const [set1, set2] = jogo.placar.split('-').map(Number);
        return set1 > set2 ? jogo.dupla1 : jogo.dupla2;
    });

    terceiroLugar = jogosEliminatoria.map(jogo => {
        const [set1, set2] = jogo.placar.split('-').map(Number);
        return set1 < set2 ? jogo.dupla1 : jogo.dupla2;
    });

    // Fecha a fase eliminatória
    document.getElementById('faseEliminatoriaDetails').open = false;

    // Abre a decisão
    const decisaoDetails = document.getElementById('decisaoDetails');
    decisaoDetails.style.display = 'block';
    decisaoDetails.open = true;

    // Configura os elementos para a final e a disputa pelo terceiro lugar
    const finalDiv = document.getElementById('final');
    finalDiv.innerHTML = `
        <h3>Final</h3>
        <p>Final: <span class="jogadores">${finalistas[0].join(' e ')}</span> vs <span class="jogadores">${finalistas[1].join(' e ')}</span>
        <div class="score-container">
            <input type="tel" id="placar_final" placeholder="Placar (ex: 6-1)">
            <button onclick="submeterPlacarFinal()">Submeter</button>
        </div></p>
    `;

    const terceiroLugarDiv = document.getElementById('terceiroLugar');
    terceiroLugarDiv.innerHTML = `
        <h3>Disputa pelo Terceiro Lugar</h3>
        <p>Disputa pelo Terceiro Lugar: <span class="jogadores">${terceiroLugar[0].join(' e ')}</span> vs <span class="jogadores">${terceiroLugar[1].join(' e ')}</span>
        <div class="score-container">
            <input type="tel" id="placar_terceiro" placeholder="Placar (ex: 6-1)">
            <button onclick="submeterPlacarTerceiro()">Submeter</button>
        </div></p>
    `;

    // Esconde os botões "Submeter" ou "Editar" na fase eliminatória
    document.querySelectorAll('#faseEliminatoria button').forEach(button => {
        if (button.textContent === 'Submeter' || button.textContent === 'Editar') {
            button.style.display = 'none';
        }
    });

    // Manipulação dos botões
    document.getElementById('encerrarEtapaEliminatoria').style.display = 'none';
    document.getElementById('encerrarCampeonato').style.display = 'block';

    salvarEstado();
}

function submeterPlacarFinal() {
    const placarInput = document.getElementById('placar_final');
    const placar = placarInput.value;
    if (placar.match(/^\d+-\d+$/)) {
        placarInput.disabled = true;
        const button = placarInput.nextElementSibling;
        button.textContent = 'Editar';
        button.onclick = () => {
            placarInput.disabled = false;
            placarInput.value = '';
            button.textContent = 'Submeter';
            button.onclick = submeterPlacarFinal;
        };
        resultadosFinais.final = placar;
        atualizarEstatisticas({ placar: placar, dupla1: finalistas[0], dupla2: finalistas[1] }); // Atualizar estatísticas imediatamente
        salvarEstado(); // Salva o estado após submeter o placar final
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function submeterPlacarTerceiro() {
    const placarInput = document.getElementById('placar_terceiro');
    const placar = placarInput.value;
    if (placar.match(/^\d+-\d+$/)) {
        placarInput.disabled = true;
        const button = placarInput.nextElementSibling;
        button.textContent = 'Editar';
        button.onclick = () => {
            placarInput.disabled = false;
            placarInput.value = '';
            button.textContent = 'Submeter';
            button.onclick = submeterPlacarTerceiro;
        };
        resultadosFinais.terceiro = placar;
        atualizarEstatisticas({ placar: placar, dupla1: terceiroLugar[0], dupla2: terceiroLugar[1] }); // Atualizar estatísticas imediatamente
        salvarEstado(); // Salva o estado após submeter o placar pela terceira colocação
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function encerrarCampeonato() {
    if (!resultadosFinais.final || !resultadosFinais.terceiro) {
        alert('Todos os placares finais devem ser submetidos antes de encerrar o campeonato.');
        return;
    }

    console.log("EncerrarCampeonato chamado", resultadosFinais, finalistas, terceiroLugar);

    // Gerar ranking final sem basear-se em pontos
    const ranking = [
        { dupla: finalistas[0], posicao: 1 },
        { dupla: finalistas[1], posicao: 2 },
        { dupla: resultadosFinais.final.split('-')[0] > resultadosFinais.final.split('-')[1] ? terceiroLugar[1] : terceiroLugar[0], posicao: 3 },
        { dupla: resultadosFinais.final.split('-')[0] > resultadosFinais.final.split('-')[1] ? terceiroLugar[0] : terceiroLugar[1], posicao: 4 }
    ];

    const rankingDiv = document.getElementById('rankingFinal');
    if (rankingDiv) {
        rankingDiv.style.display = 'block';
        rankingDiv.innerHTML = '<h3>Ranking Final</h3>';

        ranking.forEach(({ dupla, posicao }) => {
            const rankItem = document.createElement('div');
            rankItem.className = 'nome';
            
            let medalha = '';
            let color = 'gray';
            
            if (posicao === 1) {
                medalha = '🥇';
                color = 'gold';
            } else if (posicao === 2) {
                medalha = '🥈';
                color = 'silver';
            } else if (posicao === 3) {
                medalha = '🥉';
                color = 'brown';
            }

            rankItem.innerHTML = `
                <span class="position">${posicao}.</span> 
                ${medalha} ${dupla.join(' e ')}
            `;
            rankItem.style.color = color;
            rankItem.setAttribute('aria-label', `${dupla.join(' e ')} está na posição ${posicao}.`);
            rankingDiv.appendChild(rankItem);
        });
    }

    // Ocultar botões "Editar" na decisão
    document.querySelectorAll('#decisaoDetails button').forEach(button => {
        if (button.textContent === 'Editar') {
            button.style.display = 'none';
        }
    });

    // Mostrar o botão "Salvar Campeonato"
    document.getElementById('salvarCampeonato').style.display = 'block';
    document.getElementById('salvarCampeonato').disabled = false; 

    // Ocultar o botão "Encerrar Campeonato" para evitar múltiplas submissões
    document.getElementById('encerrarCampeonato').style.display = 'none';

    salvarEstado(); // Salva o estado ao encerrar o campeonato
}

function salvarEstado() {
    localStorage.setItem('torneioEstado', JSON.stringify({
        duplas: duplas,
        jogos: jogos,
        jogosEliminatoria: jogosEliminatoria,
        finalistas: finalistas,
        terceiroLugar: terceiroLugar,
        resultadosFinais: resultadosFinais
    }));
}

function carregarEstado() {
    const estadoSalvo = localStorage.getItem('torneioEstado');
    if (estadoSalvo) {
        const { duplas: savedDuplas, jogos: savedJogos, jogosEliminatoria: savedJogosEliminatoria, finalistas: savedFinalistas, terceiroLugar: savedTerceiroLugar, resultadosFinais: savedResultadosFinais } = JSON.parse(estadoSalvo);
        duplas = savedDuplas || [];
        jogos = savedJogos || [];
        jogosEliminatoria = savedJogosEliminatoria || [];
        finalistas = savedFinalistas || [];
        terceiroLugar = savedTerceiroLugar || [];
        resultadosFinais = savedResultadosFinais || {};

        // Atualiza a interface com os dados salvos
        updateListaDuplas();
        
        // Reconstruir os jogos da fase de grupos
        const faseGruposDiv = document.getElementById('faseGrupos');
        faseGruposDiv.innerHTML = '';
        for (let grupoIndex = 0; grupoIndex < jogos.length / 2; grupoIndex++) {
            const grupoDiv = document.createElement('div');
            grupoDiv.innerHTML = `<h3>Grupo ${grupoIndex + 1}</h3>`;
            const grupoJogos = jogos.filter(j => j.grupoIndex === grupoIndex);
            grupoJogos.forEach(jogo => {
                const jogoDiv = document.createElement('p');
                jogoDiv.innerHTML = `
                    Jogo ${jogo.jogoIndex + 1}: ${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}
                    <input type="tel" id="placar_${jogo.grupoIndex}_${jogo.jogoIndex}" value="${jogo.placar}" ${jogo.submetido ? 'disabled' : ''} placeholder="Placar (ex: 6-1)">
                    <button onclick="${jogo.submetido ? 'editarPlacar(' + jogo.grupoIndex + ',' + jogo.jogoIndex + ')' : 'submeterPlacar(' + jogo.grupoIndex + ',' + jogo.jogoIndex + ')' }">${jogo.submetido ? 'Editar' : 'Submeter'}</button>
                `;
                grupoDiv.appendChild(jogoDiv);
            });
            faseGruposDiv.appendChild(grupoDiv);
        }

        // Fase Eliminatória
        const faseEliminatoriaDiv = document.getElementById('faseEliminatoria');
        faseEliminatoriaDiv.innerHTML = '<h3>Fase Eliminatória</h3>';
        jogosEliminatoria.forEach(jogo => {
            const jogoDiv = document.createElement('p');
            jogoDiv.innerHTML = `
                Jogo ${jogo.jogoIndex + 1}: ${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}
                <input type="tel" id="placar_eliminatoria_${jogo.jogoIndex}" value="${jogo.placar}" ${jogo.submetido ? 'disabled' : ''} placeholder="Placar (ex: 6-1)">
                <button onclick="${jogo.submetido ? 'editarPlacarEliminatoria(' + jogo.jogoIndex + ')' : 'submeterPlacarEliminatoria(' + jogo.jogoIndex + ')' }">${jogo.submetido ? 'Editar' : 'Submeter'}</button>
            `;
            faseEliminatoriaDiv.appendChild(jogoDiv);
        });

        // Mostra ou esconde botões conforme o estado do torneio
        document.getElementById('sortearChaves').disabled = duplas.length < minDuplas;
        document.getElementById('encerrarEtapa').style.display = jogos.length > 0 ? 'block' : 'none';
        document.getElementById('encerrarEtapaEliminatoria').style.display = jogosEliminatoria.some(j => j.submetido) ? 'block' : 'none';
        document.getElementById('encerrarCampeonato').style.display = (finalistas.length && terceiroLugar.length) ? 'block' : 'none';

        // Final e Terceiro Lugar
        if (finalistas.length && terceiroLugar.length) {
            faseEliminatoriaDiv.innerHTML += `
                <h3>Final</h3>
                <p>Final: ${finalistas[0].join(' e ')} vs ${finalistas[1].join(' e ')}
                <input type="tel" id="placar_final" value="${resultadosFinais.final || ''}" ${resultadosFinais.final ? 'disabled' : ''} placeholder="Placar (ex: 6-1)">
                <button onclick="${resultadosFinais.final ? 'editarPlacarFinal()' : 'submeterPlacarFinal()'}">${resultadosFinais.final ? 'Editar' : 'Submeter'}</button></p>
                <h3>Disputa pelo Terceiro Lugar</h3>
                <p>Disputa pelo Terceiro Lugar: ${terceiroLugar[0].join(' e ')} vs ${terceiroLugar[1].join(' e ')}
                <input type="tel" id="placar_terceiro" value="${resultadosFinais.terceiro || ''}" ${resultadosFinais.terceiro ? 'disabled' : ''} placeholder="Placar (ex: 6-1)">
                <button onclick="${resultadosFinais.terceiro ? 'editarPlacarTerceiro()' : 'submeterPlacarTerceiro()'}">${resultadosFinais.terceiro ? 'Editar' : 'Submeter'}</button></p>
            `;
        }
    }
}

function salvarCampeonato() {
    const nomeTorneio = document.getElementById('nomeTorneio').value.trim();
    const dataTorneio = document.getElementById('dataTorneio').value;
    
    if (!nomeTorneio || !dataTorneio) {
        alert('Por favor, insira ambos o nome e a data do torneio.');
        return;
    }

    const campeonato = {
        torneio: nomeTorneio,
        data: dataTorneio,
        duplas: duplas,
        jogos: jogos,
        jogosEliminatoria: jogosEliminatoria,
        finalistas: finalistas,
        terceiroLugar: terceiroLugar,
        resultadosFinais: resultadosFinais
    };

    // Adicionar ao localStorage
    let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');
    campeonatos.push(campeonato);
    localStorage.setItem('campeonatos', JSON.stringify(campeonatos));

    alert('Campeonato salvo com sucesso!');

    // Resetar o estado atual do torneio
    localStorage.removeItem('torneioEstado');
    location.reload(); // Recarrega a página para limpar o estado atual
}

function limparCampos() {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        duplas = [];
        jogos = [];
        duplasClassificadas = [];
        jogosEliminatoria = [];
        finalistas = [];
        terceiroLugar = [];
        resultadosFinais = {};
        
        // Limpa a lista de duplas
        document.getElementById('duplasListadas').innerHTML = '';
        
        // Limpa os campos de entrada de jogadores
        document.getElementById('jogador1').value = '';
        document.getElementById('jogador2').value = '';
        
        // Limpa as fases do torneio
        document.getElementById('faseGrupos').innerHTML = '';
        document.getElementById('faseEliminatoria').innerHTML = '';
        document.getElementById('rankingFinal').innerHTML = '';

        // Esconde botões
        document.getElementById('encerrarEtapa').style.display = 'none';
        document.getElementById('encerrarEtapaEliminatoria').style.display = 'none';
        document.getElementById('encerrarCampeonato').style.display = 'none';
        document.getElementById('salvarCampeonato').style.display = 'none';
        
        // Habilita/desabilita botões conforme o estado inicial
        document.getElementById('sortearChaves').disabled = true;
        
        // Limpa o estado salvo
        localStorage.removeItem('torneioEstado');

        // Atualiza o estado da interface
        document.getElementById('organogramaSection').style.display = 'none';
    }
}

// Ao sair da página
window.addEventListener('beforeunload', function(e) {
    // Salva o estado atual da página (exemplo: scroll position)
    sessionStorage.setItem('scrollPosition', window.scrollY);
});

// Ao carregar a página
window.addEventListener('load', function() {
    // Recupera o estado salvo
    var scrollPosition = sessionStorage.getItem('scrollPosition');
    if (scrollPosition) {
        window.scrollTo(0, parseInt(scrollPosition));
    }
});