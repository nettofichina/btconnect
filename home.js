document.addEventListener('DOMContentLoaded', () => {
    // Navegação para outras páginas
    document.getElementById('informarDuplas').addEventListener('click', () => {
        window.location.href = 'duplas-manuais.html';
    });

    document.getElementById('sortearDuplas').addEventListener('click', () => {
        window.location.href = 'duplas-aleatorias.html';
    });

    // Funções para gerenciar campeonatos e ranking
    let campeonatos = JSON.parse(localStorage.getItem('campeonatos') || '[]');

    const campeonatosDiv = document.getElementById('campeonatos');
    const verCampeonatosBtn = document.getElementById('verCampeonatosBtn');
    const rankingDiv = document.getElementById('ranking');

    document.getElementById('verCampeonatosBtn').addEventListener('click', () => {
        const dataInicio = document.getElementById('dataInicio')?.value;
        const dataFim = document.getElementById('dataFim')?.value;
        const campeonatosDiv = document.getElementById('campeonatos');
        const verCampeonatosBtn = document.getElementById('verCampeonatosBtn');

        if (verCampeonatosBtn.textContent === 'Ver Campeonatos') {
            verCampeonatosBtn.textContent = 'Ocultar Campeonatos';
            if (campeonatosDiv) {
                campeonatosDiv.innerHTML = '';

                let campeonatosFiltrados = campeonatos;
                if (dataInicio && dataFim) {
                    const inicio = new Date(dataInicio);
                    const fim = new Date(dataFim);
                    campeonatosFiltrados = campeonatos.filter(campeonato => {
                        const dataCampeonato = new Date(campeonato.data);
                        return dataCampeonato >= inicio && dataCampeonato <= fim;
                    });
                }

                campeonatosFiltrados.forEach((campeonato, index) => {
                    const campeonatoDiv = document.createElement('div');
                    campeonatoDiv.className = 'campeonato';

                    const titulo = document.createElement('h4');
                    titulo.textContent = campeonato.torneio;
                    campeonatoDiv.appendChild(titulo);

                    const dataSpan = document.createElement('p');
                    dataSpan.textContent = `Dia do Torneio: ${campeonato.data}`;
                    campeonatoDiv.appendChild(dataSpan);

                    const buttonsContainer = document.createElement('div');
                    buttonsContainer.className = 'button-container';
                    campeonatoDiv.appendChild(buttonsContainer);

                    const toggleResultadosBtn = document.createElement('button');
                    toggleResultadosBtn.textContent = 'Ver Resultados';
                    toggleResultadosBtn.className = 'toggle-resultados';
                    buttonsContainer.appendChild(toggleResultadosBtn);

                    const verRankingBtn = document.createElement('button');
                    verRankingBtn.textContent = 'Ver Ranking';
                    verRankingBtn.className = 'ver-ranking';
                    verRankingBtn.style.backgroundColor = '#007BFF'; // Azul
                    verRankingBtn.style.color = 'white';
                    buttonsContainer.appendChild(verRankingBtn);

                    const excluirTorneioBtn = document.createElement('button');
                    excluirTorneioBtn.textContent = 'Excluir Torneio';
                    excluirTorneioBtn.className = 'excluir-torneio';
                    excluirTorneioBtn.style.backgroundColor = '#DC3545'; // Vermelho
                    excluirTorneioBtn.style.color = 'white';
                    buttonsContainer.appendChild(excluirTorneioBtn);

                    const resultadosContainer = document.createElement('div');
                    resultadosContainer.className = 'resultados-container';
                    resultadosContainer.style.display = 'none';
                    campeonatoDiv.appendChild(resultadosContainer);

                    toggleResultadosBtn.addEventListener('click', () => {
                        resultadosContainer.style.display = resultadosContainer.style.display === 'none' ? 'block' : 'none';
                        toggleResultadosBtn.textContent = toggleResultadosBtn.textContent === 'Ver Resultados' ? 'Ocultar Resultados' : 'Ver Resultados';
                        
                        resultadosContainer.innerHTML = '';
                        campeonato.jogos.forEach((jogo) => {
                            const jogoDiv = document.createElement('div');
                            jogoDiv.className = 'jogo-resultado';
                            let resultadoTexto = `${jogo.dupla1.join(' e ')} vs ${jogo.dupla2.join(' e ')}`;
                            if (jogo.placar) {
                                resultadoTexto += ` - Placar: ${jogo.placar}`;
                                const [set1, set2] = jogo.placar.split('-').map(Number);
                                const vencedor = set1 > set2 ? jogo.dupla1 : (set2 > set1 ? jogo.dupla2 : 'Empate');
                                const pontos = Math.abs(set1 - set2); // Calcula os pontos ganhos
                                resultadoTexto += `<br>Vencedor: ${vencedor.join(' e ')} - Pontos: ${pontos}`;
                            } else {
                                resultadoTexto += '<br>- Sem placar registrado';
                            }
                            jogoDiv.innerHTML = resultadoTexto;
                            resultadosContainer.appendChild(jogoDiv);
                        });
                    });

                    verRankingBtn.addEventListener('click', () => {
                        let ranking = {};
                        campeonato.jogos.forEach((jogo) => {
                            const { dupla1, dupla2, placar } = jogo;
                            if (placar) {
                                const [set1, set2] = placar.split('-').map(Number);
                                const pontos = set1 - set2;
                                [...dupla1, ...dupla2].forEach((jogador) => {
                                    const nomeNormalizado = jogador.toUpperCase().trim();
                                    ranking[nomeNormalizado] = ranking[nomeNormalizado] || { pontos: 0, jogos: 0 };
                                    ranking[nomeNormalizado].pontos += (dupla1.includes(jogador) ? pontos : -pontos);
                                    ranking[nomeNormalizado].jogos++;
                                });
                            }
                        });
                    
                        const rankingArray = Object.entries(ranking).sort((a, b) => b[1].pontos - a[1].pontos);
                    
                        // Alterna a visibilidade do ranking
                        if (rankingDiv.style.display === 'none' || !rankingDiv.style.display) {
                            rankingDiv.style.display = 'block';
                            verRankingBtn.textContent = 'Ocultar Ranking'; // Muda o texto para "Ocultar Ranking"
                        } else {
                            rankingDiv.style.display = 'none';
                            verRankingBtn.textContent = 'Ver Ranking'; // Muda o texto de volta para "Ver Ranking"
                            rankingDiv.innerHTML = ''; // Limpa o ranking quando oculta
                            return; // Sai da função para não gerar o ranking novamente quando oculta
                        }
                    
                        rankingDiv.innerHTML = ''; // Limpa o conteúdo atual antes de adicionar novo
                        rankingDiv.classList.remove('filtrado'); // Remove a classe para não mostrar a linha
                    
                        let currentPosition = 1;
                        let lastPoints = Infinity;
                        let currentGroup = [];
                        
                        rankingArray.forEach(([jogador, { pontos, jogos }], index) => {
                            if (pontos === lastPoints) {
                                // Adiciona o jogador ao grupo atual se houver empate
                                currentGroup.push({ jogador, pontos, jogos });
                            } else {
                                // Processa o grupo anterior se não for o primeiro item
                                if (currentGroup.length > 0) {
                                    processGroup(currentGroup, currentPosition, rankingDiv);
                                    currentPosition++;  // Incrementa a posição apenas uma vez por grupo
                                }
                                
                                // Adiciona o jogador ao novo grupo
                                currentGroup = [{ jogador, pontos, jogos }];
                                lastPoints = pontos;
                            }
                        
                            // Processa o último grupo após o loop
                            if (index === rankingArray.length - 1) {
                                processGroup(currentGroup, currentPosition, rankingDiv);
                            }
                        });
                        
                        function processGroup(group, position, container) {
                            let medalha = '';
                            let color = 'black';  // Cor padrão para texto
                        
                            if (position === 1) {
                                medalha = '🥇';
                                color = 'gold';
                            } else if (position === 2) {
                                medalha = '🥈';
                                color = 'silver';
                            } else if (position === 3) {
                                medalha = '🥉';
                                color = 'brown'; // bronze usa uma cor próxima ao marrom
                            }
                        
                            // Cria um container para o grupo de jogadores empatados
                            const groupContainer = document.createElement('div');
                            groupContainer.classList.add('ranking-group');
                        
                            const positionSpan = document.createElement('span');
                            positionSpan.className = 'position';
                            positionSpan.textContent = `${position}º lugar:`;
                            groupContainer.appendChild(positionSpan);
                        
                            group.forEach(({ jogador, pontos, jogos }) => {
                                const rankItem = document.createElement('div');
                                rankItem.style.margin = '0 0 2px 20px';  // Aplica margem de forma explícita
                                rankItem.innerHTML = `
                                    ${medalha} ${jogador}: ${pontos} pontos 
                                    <span class="jogos-info">(${jogos} jogos)</span>
                                `;
                                rankItem.style.color = color;  // Aplica a cor correspondente
                                rankItem.setAttribute('aria-label', `${jogador} tem ${pontos} pontos e ${jogos} jogos e está na posição ${position}.`);
                                groupContainer.appendChild(rankItem);
                            });
                        
                            container.appendChild(groupContainer);
                        }
                    
                        // Desce a página até o ranking após gerar ou mostrar o ranking
                        rankingDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });

                    let clickCount = 0;

                    excluirTorneioBtn.addEventListener('click', (e) => {
                        clickCount++;
                        
                        if (clickCount === 1) {
                            setTimeout(() => {
                                clickCount = 0;
                            }, 500); // 500ms, ajuste conforme necessário
                        } else if (clickCount === 2) {
                            if (confirm('Tem certeza que deseja excluir este torneio?')) {
                                campeonatos.splice(index, 1);
                                localStorage.setItem('campeonatos', JSON.stringify(campeonatos));
                                verCampeonatosBtn.click(); // Atualiza a lista após remover
                            }
                            clickCount = 0; // Resetar o contador após a ação
                        }
                    });

                    // Adicionar evento de toque para dispositivos móveis
                    excluirTorneioBtn.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        excluirTorneioBtn.dispatchEvent(new Event('click'));
                    });

                    campeonatosDiv.appendChild(campeonatoDiv);
                });
            }
        } else {
            verCampeonatosBtn.textContent = 'Ver Campeonatos';
            if (campeonatosDiv) {
                campeonatosDiv.innerHTML = '';  // Limpa a lista de campeonatos
            }
            rankingDiv.innerHTML = ''; // Limpa o ranking quando oculta os campeonatos
        }
    });

    document.getElementById('rankingBtn').addEventListener('click', () => {
        const dataInicio = document.getElementById('dataInicio')?.value;
        const dataFim = document.getElementById('dataFim')?.value;
        const rankingDiv = document.getElementById('ranking');
        if (rankingDiv) {
            let ranking = {};
    
            if (!dataInicio || !dataFim) {
                alert('Por favor, selecione um intervalo de datas para gerar o ranking.');
                return;
            }

            rankingDiv.classList.add('filtrado'); // Adiciona a classe para mostrar a linha

            campeonatos.filter(campeonato => {
                const dataCampeonato = new Date(campeonato.data);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataCampeonato >= inicio && dataCampeonato <= fim;
            }).forEach((campeonato) => {
                campeonato.jogos.forEach((jogo) => {
                    const { dupla1, dupla2, placar } = jogo;
    
                    if (placar) {
                        const [set1, set2] = placar.split('-').map(Number);
                        const pontos = set1 - set2;
    
                        [...dupla1, ...dupla2].forEach((jogador) => {
                            const nomeNormalizado = jogador.toUpperCase().trim();
                            ranking[nomeNormalizado] = ranking[nomeNormalizado] || { pontos: 0, jogos: 0 };
                            ranking[nomeNormalizado].pontos += (dupla1.includes(jogador) ? pontos : -pontos);
                            ranking[nomeNormalizado].jogos++;
                        });
                    }
                });
            });
    
            const rankingArray = Object.entries(ranking).sort((a, b) => b[1].pontos - a[1].pontos);
    
            rankingDiv.innerHTML = '<h3>Ranking</h3>';
            rankingArray.forEach(([jogador, { pontos, jogos }], index) => {
                const rankItem = document.createElement('div');
                rankItem.className = 'nome'; // Adiciona a classe 'nome' para aplicar o estilo da linha
                
                let medalha = '';
                let color = 'gray';  // Cor padrão para texto
            
                if (index === 0) {
                    medalha = '🥇';
                    color = 'gold';
                } else if (index === 1) {
                    medalha = '🥈';
                    color = 'silver';
                } else if (index === 2) {
                    medalha = '🥉';
                    color = 'brown';
                }
                
                rankItem.innerHTML = `
                    <span class="position">${index + 1}.</span> 
                    ${medalha} ${jogador}: ${pontos} pontos 
                    <span class="jogos-info">(${jogos} jogos)</span>
                `;
                rankItem.style.color = color; // Aplica a cor correspondente
                rankItem.setAttribute('aria-label', `${jogador} tem ${pontos} pontos e ${jogos} jogos e está na posição ${index + 1}.`);
                rankingDiv.appendChild(rankItem);
            });
        } else {
            console.error('Elemento com ID "ranking" não encontrado');
        }
    });
    
    // Função para exportar dados
    document.getElementById('exportarDados').addEventListener('click', exportarDados);
    document.getElementById('exportarDados').addEventListener('touchstart', exportarDados);

    // Função para importar dados
    document.getElementById('importarDados').addEventListener('click', importarDados);
    document.getElementById('importarDados').addEventListener('touchstart', importarDados);

    function exportarDados(e) {
        e.preventDefault();
        const dados = {
            campeonatos: campeonatos
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dados, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "dados_beach_tennis.json");
        downloadAnchorNode.setAttribute("target", "_blank"); 
        document.body.appendChild(downloadAnchorNode); 
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function importarDados(e) {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const dadosImportados = JSON.parse(event.target.result);
                    if (dadosImportados.campeonatos) {
                        localStorage.setItem('campeonatos', JSON.stringify(dadosImportados.campeonatos));
                        campeonatos = dadosImportados.campeonatos;
                        alert('Dados importados com sucesso! A base de dados foi atualizada.');
                    } else {
                        alert('Arquivo inválido ou dados corrompidos.');
                    }
                } catch (error) {
                    alert('Erro ao importar dados: ' + error.message);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    document.getElementById('organogramaBtn').addEventListener('click', function() {
        window.location.href = 'organograma-torneio.html';
    });
    
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