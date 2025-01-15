document.addEventListener('DOMContentLoaded', function() {
    let duplasManuais = [];
    let jogosManuais = [];
    let dadosAlterados = false; // Indicador para saber se os dados foram alterados

    const nomeTorneioInput = document.getElementById('nomeTorneio');
    const dataTorneioInput = document.getElementById('dataTorneio');
    const duplasListadas = document.getElementById('duplasListadas');
    const chavesManuais = document.getElementById('chavesManuais');
    const melhorDeTresCheckbox = document.getElementById('melhorDeTres');

    // Função para adicionar uma dupla manualmente
    function adicionarDupla() {
        const jogador1 = document.getElementById('jogador1').value;
        const jogador2 = document.getElementById('jogador2').value;
        
        if (jogador1 && jogador2) {
            const dupla = [normalizarNome(jogador1), normalizarNome(jogador2)];
            if (!duplasManuais.some(d => d.includes(jogador1) || d.includes(jogador2))) {
                duplasManuais.push(dupla);
                const li = document.createElement('li');
                li.textContent = `DUPLA ${duplasManuais.length}: ${dupla.join(' e ')}`;
                li.addEventListener('dblclick', () => removerDupla(dupla, li));
                duplasListadas.appendChild(li);
                limparInputs();
                dadosAlterados = true; // Marca que os dados foram alterados
            } else {
                alert('Um ou ambos os jogadores já estão em uma dupla.');
            }
        } else {
            alert('Por favor, preencha ambos os campos da dupla.');
        }
    }

    // Função para remover uma dupla
    function removerDupla(dupla, element) {
        const index = duplasManuais.findIndex(d => d[0] === dupla[0] && d[1] === dupla[1]);
        if (index !== -1) {
            duplasManuais.splice(index, 1);
            duplasListadas.removeChild(element);
            // Reajustar a numeração das duplas restantes
            Array.from(duplasListadas.children).forEach((li, i) => {
                li.textContent = `DUPLA ${i + 1}: ${duplasManuais[i].join(' e ')}`;
            });
            // Remover jogos que envolviam a dupla removida
            jogosManuais = jogosManuais.filter(jogo => 
                !(jogo.dupla1[0] === dupla[0] && jogo.dupla1[1] === dupla[1] || jogo.dupla2[0] === dupla[0] && jogo.dupla2[1] === dupla[1])
            );
            atualizarJogos();
            dadosAlterados = true; // Marca que os dados foram alterados
        }
    }

    // Função para limpar os campos de input
    function limparInputs() {
        document.getElementById('jogador1').value = '';
        document.getElementById('jogador2').value = '';
        document.getElementById('jogador1').focus();
    }

    // Função para atualizar os jogos mostrados
    function atualizarJogos() {
        chavesManuais.innerHTML = '';  // Limpa os jogos atuais
        jogosManuais.forEach((jogo, index) => {
            const jogoDiv = document.createElement('div');
            jogoDiv.className = 'jogo';
            if (melhorDeTresCheckbox.checked) {
                jogoDiv.innerHTML = `
                    <span>Set ${jogo.set}: ${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}</span>
                    <div class="placar-container">
                        <input type="tel" placeholder="Placar (ex: 6-1)" data-jogo-index="${index}" ${jogo.submetido ? 'disabled' : ''}>
                        <button class="submeter-placar" data-jogo-index="${index}" ${jogo.submetido ? 'disabled' : ''}>${jogo.submetido ? 'Editado' : 'Submeter'}</button>
                    </div>
                `;
            } else {
                jogoDiv.innerHTML = `
                    <span>${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}</span>
                    <div class="placar-container">
                        <input type="tel" placeholder="Placar (ex: 6-1)" data-jogo-index="${index}" ${jogo.submetido ? 'disabled' : ''}>
                        <button class="submeter-placar" data-jogo-index="${index}" ${jogo.submetido ? 'disabled' : ''}>${jogo.submetido ? 'Editado' : 'Submeter'}</button>
                    </div>
                `;
            }
            chavesManuais.appendChild(jogoDiv);
        });
        // Re-adicionar eventos de submissão de placar
        document.querySelectorAll('.submeter-placar').forEach(button => {
            button.addEventListener('click', submeterPlacar);
        });
    }

    // Função para sortear duplas manuais
    document.getElementById('sortearDuplasManuais').addEventListener('click', () => {
        if (duplasManuais.length < 2) {
            alert('Você precisa adicionar pelo menos duas duplas para sortear.');
            return;
        }

        // Embaralhar duplas
        const duplasEmbaralhadas = [...duplasManuais].sort(() => Math.random() - 0.5);

        // Limpar o conteúdo anterior
        jogosManuais = [];

        // Gerar chaves com as novas duplas
        for (let i = 0; i < duplasEmbaralhadas.length; i++) {
            for (let j = i + 1; j < duplasEmbaralhadas.length; j++) {
                if (melhorDeTresCheckbox.checked) {
                    for (let k = 1; k <= 3; k++) {
                        jogosManuais.push({ dupla1: duplasEmbaralhadas[i], dupla2: duplasEmbaralhadas[j], placar: '', submetido: false, set: k });
                    }
                } else {
                    jogosManuais.push({ dupla1: duplasEmbaralhadas[i], dupla2: duplasEmbaralhadas[j], placar: '', submetido: false });
                }
            }
        }

        atualizarJogos();
        dadosAlterados = true; // Marca que os dados foram alterados
    });

    // Função para submeter placar
    function submeterPlacar(event) {
        const button = event.target;
        const index = button.getAttribute('data-jogo-index');
        const jogo = jogosManuais[index];
        const placarInput = chavesManuais.querySelector(`input[data-jogo-index="${index}"]`);
        const placar = placarInput.value;

        if (/^\d+-\d+$/.test(placar)) {
            jogo.placar = placar;
            if (!jogo.submetido) {
                jogo.submetido = true;
                button.textContent = 'Editado';
                placarInput.disabled = true;
                
                if (melhorDeTresCheckbox.checked) {
                    const duplas = [jogo.dupla1.join(''), jogo.dupla2.join('')];
                    const sets = jogosManuais.filter(j => duplas.includes(j.dupla1.join('')) && duplas.includes(j.dupla2.join('')) && j.submetido);
                    const pontos = sets.map(s => {
                        const [set1, set2] = s.placar.split('-').map(Number);
                        return set1 > set2 ? 1 : -1;
                    });
                    if (pontos.filter(p => p === 1).length === 2 || pontos.filter(p => p === -1).length === 2) {
                        // Desabilitar o terceiro set se um time já ganhou dois sets
                        const terceiroSet = jogosManuais.find(j => j.set === 3 && duplas.includes(j.dupla1.join('')) && duplas.includes(j.dupla2.join('')));
                        if (terceiroSet && !terceiroSet.submetido) {
                            const terceiroSetIndex = jogosManuais.indexOf(terceiroSet);
                            const terceiroSetInput = chavesManuais.querySelector(`input[data-jogo-index="${terceiroSetIndex}"]`);
                            const terceiroSetButton = chavesManuais.querySelector(`button[data-jogo-index="${terceiroSetIndex}"]`);
                            terceiroSetInput.disabled = true;
                            terceiroSetButton.disabled = true;
                            terceiroSetButton.textContent = 'Desnecessário';
                        }
                    }
                }
                dadosAlterados = true; // Marca que os dados foram alterados
            } else {
                // Habilitar novamente todos os sets para edição
                jogo.submetido = false;
                button.textContent = 'Submeter';
                placarInput.disabled = false;

                if (melhorDeTresCheckbox.checked) {
                    const duplas = [jogo.dupla1.join(''), jogo.dupla2.join('')];
                    const sets = jogosManuais.filter(j => duplas.includes(j.dupla1.join('')) && duplas.includes(j.dupla2.join('')));
                    sets.forEach(set => {
                        const setIndex = jogosManuais.indexOf(set);
                        const setInput = chavesManuais.querySelector(`input[data-jogo-index="${setIndex}"]`);
                        const setButton = chavesManuais.querySelector(`button[data-jogo-index="${setIndex}"]`);
                        set.submetido = false; // Resetar o estado submetido de todos os sets
                        setInput.disabled = false;
                        setButton.disabled = false;
                        setButton.textContent = 'Submeter';
                    });
                }
            }
        } else {
            alert('Formato de placar inválido. Use "X-Y", por exemplo, "6-1".');
        }
    }

    // Função para salvar o torneio
    function salvarTorneio() {
        const nomeTorneio = nomeTorneioInput.value.trim();
        const dataTorneio = dataTorneioInput.value;

        if (nomeTorneio && dataTorneio) {
            const campeonato = {
                torneio: nomeTorneio,
                data: dataTorneio,
                duplas: duplasManuais,
                jogos: jogosManuais,
                melhorDeTres: melhorDeTresCheckbox.checked
            };

            // Adicionar ao localStorage
            let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');
            campeonatos.push(campeonato);
            localStorage.setItem('campeonatos', JSON.stringify(campeonatos));

            dadosAlterados = false; // Marca que os dados foram salvos
            alert('Torneio salvo com sucesso!');
            window.location.href = 'index.html'; // Redireciona para a página inicial
        } else {
            alert('Por favor, forneça um nome e uma data para o torneio.');
        }
    }

    // Função de normalizar nome
    function normalizarNome(nome) {
        return nome.toUpperCase().trim();
    }

    // Adicionar evento para submeter dupla
    document.getElementById('submeterDupla').addEventListener('click', adicionarDupla);

    // Adicionar evento de clique para voltar ao início
    function voltarParaHome() {
        if (dadosAlterados) {
            if (confirm('Tem certeza que deseja sair? Alterações não salvas serão perdidas.')) {
                window.location.href = 'index.html';  // Redirecionamento, não recarregamento
            }
        } else {
            window.location.href = 'index.html';  // Redirecionamento, não recarregamento
        }
    }

    // Adicionar evento de recarregamento para evitar perda de dados
    window.addEventListener('beforeunload', (e) => {
        if (dadosAlterados) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // Função para limpar os campos
    function limparCampos() {
        if (confirm('Tem certeza que deseja limpar todos os campos?')) {
            duplasManuais = [];
            jogosManuais = [];
            duplasListadas.innerHTML = '';
            chavesManuais.innerHTML = '';
            nomeTorneioInput.value = '';
            dataTorneioInput.value = '';
            document.getElementById('jogador1').value = '';
            document.getElementById('jogador2').value = '';
            melhorDeTresCheckbox.checked = false;
            dadosAlterados = false;
            localStorage.removeItem('currentState');
            document.getElementById('jogador1').focus();
        }
    }

    // Adicionar eventos para os botões
    document.getElementById('salvarCampeonato').addEventListener('click', salvarTorneio);
    document.getElementById('limparCampos').addEventListener('click', limparCampos);
    document.getElementById('voltarParaHome').addEventListener('click', voltarParaHome);
});

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