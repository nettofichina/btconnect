document.addEventListener('DOMContentLoaded', function() {
    let duplasManuais = JSON.parse(localStorage.getItem('duplasManuais')) || [];
    let jogosManuais = JSON.parse(localStorage.getItem('jogosManuais')) || [];
    let dadosAlterados = false; // Indicador para saber se os dados foram alterados

    const nomeTorneioInput = document.getElementById('nomeTorneio');
    const dataTorneioInput = document.getElementById('dataTorneio');
    const duplasListadas = document.getElementById('duplasListadas');
    const chavesManuais = document.getElementById('chavesManuais');
    const melhorDeTresCheckbox = document.getElementById('melhorDeTres');

    // Restaurar dados ao carregar a página
    function restaurarDados() {
        duplasManuais.forEach((dupla, index) => {
            const li = document.createElement('li');
            li.textContent = `DUPLA ${index + 1}: ${dupla.join(' e ')}`;
            li.addEventListener('dblclick', () => removerDupla(dupla, li));
            duplasListadas.appendChild(li);
        });
        atualizarJogos();
    }

    // Função para salvar estado no localStorage
    function salvarEstado() {
        localStorage.setItem('duplasManuais', JSON.stringify(duplasManuais));
        localStorage.setItem('jogosManuais', JSON.stringify(jogosManuais));
    }

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
                salvarEstado();
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
            salvarEstado();
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
        chavesManuais.innerHTML = '';
        jogosManuais.forEach((jogo, index) => {
            const jogoDiv = document.createElement('div');
            jogoDiv.className = 'jogo';
            const placarInputHTML = `<input type="tel" placeholder="Placar (ex: 6-1)" data-jogo-index="${index}" ${jogo.submetido ? 'disabled' : ''}>`;
            const buttonHTML = `<button class="submeter-placar" data-jogo-index="${index}" ${jogo.submetido ? 'disabled' : ''}>${jogo.submetido ? 'Editado' : 'Submeter'}</button>`;
            jogoDiv.innerHTML = `<span>${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}</span><div class="placar-container">${placarInputHTML} ${buttonHTML}</div>`;
            chavesManuais.appendChild(jogoDiv);
        });

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

        const duplasEmbaralhadas = [...duplasManuais].sort(() => Math.random() - 0.5);
        jogosManuais = [];

        for (let i = 0; i < duplasEmbaralhadas.length; i++) {
            for (let j = i + 1; j < duplasEmbaralhadas.length; j++) {
                jogosManuais.push({ dupla1: duplasEmbaralhadas[i], dupla2: duplasEmbaralhadas[j], placar: '', submetido: false });
            }
        }

        atualizarJogos();
        dadosAlterados = true; // Marca que os dados foram alterados
        salvarEstado();
    });

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

            let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');
            campeonatos.push(campeonato);
            localStorage.setItem('campeonatos', JSON.stringify(campeonatos));

            dadosAlterados = false;
            alert('Torneio salvo com sucesso!');
            window.location.href = 'index.html';
        } else {
            alert('Por favor, forneça um nome e uma data para o torneio.');
        }
    }

    // Função de normalizar nome
    function normalizarNome(nome) {
        return nome.toUpperCase().trim();
    }

    document.getElementById('submeterDupla').addEventListener('click', adicionarDupla);
    document.getElementById('salvarCampeonato').addEventListener('click', salvarTorneio);

    restaurarDados();
});
