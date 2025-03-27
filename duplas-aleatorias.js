// Seleção de elementos
const nomeTorneioInput = document.getElementById('nomeTorneio');
const dataTorneioInput = document.getElementById('dataTorneio');
const nomeJogadorInput = document.getElementById('nomeJogador');
const adicionarJogadorBtn = document.getElementById('adicionarJogador');
const listaJogadores = document.getElementById('listaJogadores');
const sortearDuplasBtn = document.getElementById('sortearDuplas');
const chavesDiv = document.getElementById('chaves');
const salvarCampeonatoBtn = document.getElementById('salvarCampeonato');
const voltarParaHomeBtn = document.getElementById('voltarParaHome');
const todosContraTodosCheckbox = document.getElementById('todosContraTodos');
const limparCamposBtn = document.getElementById('limparCampos');

let jogadores = [];
let duplas = [];
let jogos = [];
let dadosAlterados = false;

function normalizarNome(nome) {
    return nome.toUpperCase().trim();
}

function salvarEstado() {
    const estadoAtual = {
        jogadores,
        duplas,
        jogos,
        nomeTorneio: nomeTorneioInput.value,
        dataTorneio: dataTorneioInput.value,
    };
    localStorage.setItem('currentState', JSON.stringify(estadoAtual));
    dadosAlterados = true;
}

function carregarEstadoSalvo() {
    const savedState = localStorage.getItem('currentState');
    if (savedState) {
        try {
            const { jogadores: savedJogadores, duplas: savedDuplas, jogos: savedJogos, nomeTorneio, dataTorneio } = JSON.parse(savedState);
            jogadores = savedJogadores || [];
            duplas = savedDuplas || [];
            jogos = savedJogos || [];
            nomeTorneioInput.value = nomeTorneio || '';
            dataTorneioInput.value = dataTorneio || '';

            atualizarListaJogadores();
            if (duplas.length > 0 || jogos.length > 0) {
                gerarChaves();
            }
        } catch (error) {
            console.error("Erro ao restaurar estado:", error);
            localStorage.removeItem('currentState');
        }
    }
}

document.addEventListener('DOMContentLoaded', carregarEstadoSalvo);
window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        carregarEstadoSalvo();
    }
});

nomeJogadorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarJogador();
});

adicionarJogadorBtn.addEventListener('click', adicionarJogador);

function adicionarJogador() {
    const nomeJogador = normalizarNome(nomeJogadorInput.value);
    if (nomeJogador) {
        if (!jogadores.includes(nomeJogador)) {
            jogadores.push(nomeJogador);
            atualizarListaJogadores();
            nomeJogadorInput.value = '';
            nomeJogadorInput.focus();
            salvarEstado();
        } else {
            alert('Este jogador já foi adicionado!');
        }
    } else {
        alert('Por favor, insira um nome válido para o jogador.');
    }
}

function removerJogador(nomeJogador, elemento) {
    const index = jogadores.indexOf(nomeJogador);
    if (index !== -1) {
        jogadores.splice(index, 1);
        listaJogadores.removeChild(elemento);
        nomeJogadorInput.focus();
        salvarEstado();
    }
}

function atualizarListaJogadores() {
    listaJogadores.innerHTML = '';
    jogadores.forEach(jogador => {
        const li = document.createElement('li');
        li.textContent = jogador;
        li.addEventListener('dblclick', () => removerJogador(jogador, li));
        listaJogadores.appendChild(li);
    });
}

sortearDuplasBtn.addEventListener('click', () => {
    const todosContraTodos = todosContraTodosCheckbox.checked;
    if (todosContraTodos) {
        if (jogadores.length < 4) {
            alert('Para o modo "Todos contra Todos", são necessários pelo menos 4 jogadores!');
            return;
        }
        sortearTodosContraTodos();
    } else {
        if (jogadores.length < 4 || jogadores.length % 2 !== 0) {
            alert('Para formar duplas, é necessário pelo menos 4 jogadores e um número par de jogadores!');
            return;
        }
        const jogadoresEmbaralhados = [...jogadores].sort(() => Math.random() - 0.5);
        duplas = [];
        for (let i = 0; i < jogadoresEmbaralhados.length; i += 2) {
            duplas.push([jogadoresEmbaralhados[i], jogadoresEmbaralhados[i + 1]]);
        }
        gerarChaves();
    }
    salvarEstado();
});

function submeterJogo(index, btn, input) {
    const jogo = jogos[index];
    const placar = input.value;
    if (/^\d+-\d+$/.test(placar)) {
        if (!jogo.submetido) {
            input.disabled = true;
            jogo.submetido = true;
            btn.textContent = 'Editar';
            btn.classList.add('edit-button');
        } else {
            input.disabled = false;
            jogo.submetido = false;
            btn.textContent = 'Submeter';
            btn.classList.remove('edit-button');
        }
        jogo.placar = placar;
        salvarEstado();
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function criarElementoPlacar(jogo, index) {
    const placarContainer = document.createElement('div');
    placarContainer.className = 'placar-container';

    const inputPlacar = document.createElement('input');
    inputPlacar.type = 'tel';
    inputPlacar.placeholder = 'Placar (ex: 6-1)';
    inputPlacar.dataset.index = index;
    inputPlacar.value = jogo.placar;
    inputPlacar.disabled = jogo.submetido;
    inputPlacar.addEventListener('change', (e) => {
        const placar = e.target.value;
        if (/^\d+-\d+$/.test(placar)) {
            jogos[e.target.dataset.index].placar = placar;
            salvarEstado();
        } else {
            alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
            e.target.value = '';
        }
    });

    const submeterBtn = document.createElement('button');
    submeterBtn.textContent = jogo.submetido ? 'Editar' : 'Submeter';
    submeterBtn.className = jogo.submetido ? 'edit-button' : 'submeter-jogo';
    submeterBtn.addEventListener('click', () => {
        submeterJogo(index, submeterBtn, inputPlacar);
    });

    placarContainer.appendChild(inputPlacar);
    placarContainer.appendChild(submeterBtn);

    return placarContainer;
}

function criarElementoJogo(jogo, index) {
    const jogoDiv = document.createElement('div');
    jogoDiv.className = 'jogo';
    jogoDiv.setAttribute('aria-label', `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`);

    const jogoInfo = document.createElement('span');
    jogoInfo.textContent = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;

    const placarContainer = criarElementoPlacar(jogo, index);

    jogoDiv.appendChild(jogoInfo);
    jogoDiv.appendChild(placarContainer);

    return jogoDiv;
}

function gerarChaves() {
    chavesDiv.innerHTML = '';
    jogos = jogos.length > 0 ? jogos : [];
    const fragment = document.createDocumentFragment();

    if (jogos.length === 0 && duplas.length > 0) {
        for (let i = 0; i < duplas.length; i++) {
            for (let j = i + 1; j < duplas.length; j++) {
                jogos.push({ dupla1: duplas[i], dupla2: duplas[j], placar: '', submetido: false });
            }
        }
    }

    jogos.forEach((jogo, index) => {
        const jogoDiv = criarElementoJogo(jogo, index);
        fragment.appendChild(jogoDiv);
    });

    chavesDiv.appendChild(fragment);
}

salvarCampeonatoBtn.addEventListener('click', () => {
    const nomeTorneio = nomeTorneioInput.value.trim();
    const dataTorneio = dataTorneioInput.value;
    if (!nomeTorneio || !dataTorneio) {
        alert('Digite o nome do torneio e a data antes de salvar!');
        return;
    }

    const resultados = {
        torneio: nomeTorneio,
        data: dataTorneio,
        jogadores: jogadores,
        jogos: jogos,
    };

    let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');
    campeonatos.push(resultados);
    localStorage.setItem('campeonatos', JSON.stringify(campeonatos));
    alert('Campeonato salvo com sucesso!');

    if (confirm('Deseja limpar os dados e voltar para a página inicial?')) {
        localStorage.removeItem('currentState');
        dadosAlterados = false;
        window.location.href = 'index.html';
    }
});

voltarParaHomeBtn.addEventListener('click', () => {
    if (dadosAlterados && !confirm('Tem certeza que deseja sair? Alterações não salvas serão perdidas.')) {
        return;
    }
    window.location.href = 'index.html';
});

limparCamposBtn.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        jogadores = [];
        duplas = [];
        jogos = [];
        listaJogadores.innerHTML = '';
        chavesDiv.innerHTML = '';
        nomeTorneioInput.value = '';
        dataTorneioInput.value = '';
        nomeJogadorInput.value = '';
        localStorage.removeItem('currentState');
        dadosAlterados = false;
        nomeJogadorInput.focus();
    }
});

function sortearTodosContraTodos() {
    chavesDiv.innerHTML = '';
    jogos = [];
    const fragment = document.createDocumentFragment();

    function getUniqueKey(dupla1, dupla2) {
        const sortedDupla1 = dupla1.slice().sort().join(',');
        const sortedDupla2 = dupla2.slice().sort().join(',');
        return sortedDupla1 < sortedDupla2 ? `${sortedDupla1}-${sortedDupla2}` : `${sortedDupla2}-${sortedDupla1}`;
    }

    const uniqueGames = new Set();

    for (let i = 0; i < jogadores.length; i++) {
        for (let j = i + 1; j < jogadores.length; j++) {
            for (let k = 0; k < jogadores.length; k++) {
                if (k !== i && k !== j) {
                    for (let l = k + 1; l < jogadores.length; l++) {
                        if (l !== i && l !== j) {
                            const key = getUniqueKey([jogadores[i], jogadores[j]], [jogadores[k], jogadores[l]]);
                            if (!uniqueGames.has(key)) {
                                uniqueGames.add(key);
                                jogos.push({
                                    dupla1: [jogadores[i], jogadores[j]],
                                    dupla2: [jogadores[k], jogadores[l]],
                                    placar: '',
                                    submetido: false
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    jogos.forEach((jogo, index) => {
        const jogoDiv = criarElementoJogo(jogo, index);
        fragment.appendChild(jogoDiv);
    });

    chavesDiv.appendChild(fragment);
}

window.addEventListener('beforeunload', (e) => {
    if (dadosAlterados) {
        const mensagem = 'Você tem alterações não salvas. Tem certeza que deseja sair?';
        e.returnValue = mensagem;
        return mensagem;
    }
});