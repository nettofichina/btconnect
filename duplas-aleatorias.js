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

let jogadores = [];
let duplas = [];
let jogos = [];
let dadosAlterados = false;

// Função para Normalizar Nomes (agora apenas para maiúsculas)
function normalizarNome(nome) {
    return nome.toUpperCase().trim();
}

// Função para salvar o estado dos dados
function salvarEstado() {
    localStorage.setItem('currentState', JSON.stringify({
        jogadores: jogadores,
        duplas: duplas,
        jogos: jogos,
        nomeTorneio: nomeTorneioInput.value,
        dataTorneio: dataTorneioInput.value
    }));
    dadosAlterados = true;
}

// Salvar Estado Completo antes de sair da página
window.addEventListener('beforeunload', (e) => {
    if (dadosAlterados) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Carregar estado completo do localStorage ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('currentState');
    if (savedState) {
        const { jogadores: savedJogadores, duplas: savedDuplas, jogos: savedJogos, nomeTorneio, dataTorneio } = JSON.parse(savedState);
        jogadores = savedJogadores;
        duplas = savedDuplas;
        jogos = savedJogos;
        nomeTorneioInput.value = nomeTorneio || '';  
        dataTorneioInput.value = dataTorneio || '';  

        atualizarListaJogadores();
        if (duplas.length) {
            gerarChaves();
        }
    }
});

// Adicionar jogador ao pressionar Enter
nomeJogadorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        adicionarJogador();
    }
});

// Adicionar jogador ao clicar no botão
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
        li.setAttribute('aria-label', `Jogador: ${jogador}`);
        li.setAttribute('role', 'listitem');
        li.addEventListener('dblclick', () => removerJogador(jogador, li));
        listaJogadores.appendChild(li);
    });
}

// Sortear duplas
sortearDuplasBtn.addEventListener('click', () => {
    const todosContraTodos = todosContraTodosCheckbox.checked;
    
    if (todosContraTodos) {
        if (jogadores.length < 4) {
            alert('Para o modo "Todos contra Todos", são necessários pelo menos 4 jogadores!');
            return;
        }
        sortearTodosContraTodos();
    } else {
        // Se não for todos contra todos, usa a lógica de duplas
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
    const placar = jogo.placar;

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
        salvarEstado();
    } else {
        alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
    }
}

function gerarChaves() {
    chavesDiv.innerHTML = '';
    jogos = [];
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < duplas.length; i++) {
        for (let j = i + 1; j < duplas.length; j++) {
            jogos.push({ dupla1: duplas[i], dupla2: duplas[j], placar: '', submetido: false });
        }
    }

    jogos.forEach((jogo, index) => {
        const jogoDiv = document.createElement('div');
        jogoDiv.className = 'jogo';
        jogoDiv.setAttribute('aria-label', `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`);

        const jogoInfo = document.createElement('span');
        jogoInfo.textContent = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;

        // Adicionar um contêiner para colocar o input e botão lado a lado
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
                salvarEstado(); // Salvar estado ao mudar placar
            } else {
                alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
                e.target.value = '';
            }
        });

        const submeterBtn = document.createElement('button');
        submeterBtn.textContent = 'Submeter';
        submeterBtn.className = 'submeter-jogo';
        submeterBtn.style.display = jogo.submetido ? 'none' : 'inline';
        submeterBtn.addEventListener('click', () => {
            submeterJogo(index, submeterBtn, inputPlacar);
        });

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.className = 'editar-placar';
        editarBtn.style.display = jogo.submetido ? 'inline' : 'none';
        editarBtn.addEventListener('click', () => {
            inputPlacar.disabled = false;
            jogo.submetido = false;
            submeterBtn.style.display = 'inline';
            editarBtn.style.display = 'none';
            salvarEstado(); // Salvar estado ao editar placar
        });

        placarContainer.appendChild(inputPlacar);
        placarContainer.appendChild(submeterBtn);
        placarContainer.appendChild(editarBtn);

        jogoDiv.appendChild(jogoInfo);
        jogoDiv.appendChild(placarContainer);
        fragment.appendChild(jogoDiv);
    });

    chavesDiv.appendChild(fragment);
}

// Salvar campeonato
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
    console.log('Campeonato salvo:', resultados);
    alert('Campeonato salvo com sucesso!');

    // Limpar o estado local e redirecionar para index.html
    localStorage.removeItem('currentState');
    dadosAlterados = false; // Resetando o estado de dados alterados
    window.location.href = 'index.html'; // Redireciona para a página inicial
});

// Voltar para a página inicial
voltarParaHomeBtn.addEventListener('click', () => {
    if (dadosAlterados) {
        if (confirm('Tem certeza que deseja sair? Alterações não salvas serão perdidas.')) {
            window.location.href = 'index.html';  // Redirecionamento, não recarregamento
        }
    } else {
        window.location.href = 'index.html';  // Redirecionamento, não recarregamento
    }
});

document.getElementById('limparCampos').addEventListener('click', () => {
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
        nomeJogadorInput.focus();
    }
});

// Sortear todos contra todos
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

    // Gerar todos os jogos possíveis
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

    // Gerando a interface para cada jogo
    jogos.forEach((jogo, index) => {
        const jogoDiv = document.createElement('div');
        jogoDiv.className = 'jogo';
        jogoDiv.setAttribute('aria-label', `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`);

        const jogoInfo = document.createElement('span');
        jogoInfo.textContent = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;

        const placarContainer = document.createElement('div');
        placarContainer.className = 'placar-container';

        const inputPlacar = document.createElement('input');
        inputPlacar.type = 'tel'; // Mude de 'text' para 'tel' aqui
        inputPlacar.placeholder = 'Placar (ex: 6-1)';
        inputPlacar.dataset.index = index;
        inputPlacar.value = jogo.placar;
        inputPlacar.disabled = jogo.submetido;
        inputPlacar.addEventListener('change', (e) => {
            const placar = e.target.value;
            if (/^\d+-\d+$/.test(placar)) {
                jogos[e.target.dataset.index].placar = placar;
                salvarEstado(); // Salvar estado ao mudar placar
            } else {
                alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
                e.target.value = '';
            }
        });

        const submeterBtn = document.createElement('button');
        submeterBtn.textContent = 'Submeter';
        submeterBtn.className = 'submeter-jogo';
        submeterBtn.style.display = jogo.submetido ? 'none' : 'inline';
        submeterBtn.addEventListener('click', () => {
            submeterJogo(index, submeterBtn, inputPlacar);
        });

        const editarBtn = document.createElement('button');
        editarBtn.textContent = 'Editar';
        editarBtn.className = 'editar-placar';
        editarBtn.style.display = jogo.submetido ? 'inline' : 'none';
        editarBtn.addEventListener('click', () => {
            inputPlacar.disabled = false;
            jogo.submetido = false;
            submeterBtn.style.display = 'inline';
            editarBtn.style.display = 'none';
            salvarEstado(); // Salvar estado ao editar placar
        });

        placarContainer.appendChild(inputPlacar);
        placarContainer.appendChild(submeterBtn);
        placarContainer.appendChild(editarBtn);

        jogoDiv.appendChild(jogoInfo);
        jogoDiv.appendChild(placarContainer);
        fragment.appendChild(jogoDiv);
    });

    chavesDiv.appendChild(fragment);
}