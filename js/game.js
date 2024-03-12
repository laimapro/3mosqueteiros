document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('keydown', (event) => {
        if (event.key === 'i' || event.key === 'I') {
            simularEscolha('1');
        } else if (event.key === 't' || event.key === 'T') {
            simularEscolha('2');
        }
    });

    

    
Swal.fire({
    
    title: 'Escolha posição do tabuleiro',
    input: 'select',
    inputOptions: {
        '1': 'Inferior',
        '2': 'Topo',
    },
    inputPlaceholder: 'iniciar com os mosqueteiros no',
    showCancelButton: true,
    confirmButtonText: 'Iniciar Jogo',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
        return new Promise((resolve) => {
            if (value === '1' || value === '2') {
                resolve();
            } else {
                resolve('Escolha um grupo válido.');
            }
        });
    },
}).then((result) => {
    if (result.isConfirmed) {
        simularEscolha(result.value);
        posicionarPecasIniciais(result.value);
        falarMensagem("Sua vez, escolha um mosqueteiro");
    }
});

function simularEscolha(valor) {
    console.log(`Simulando escolha: ${valor}`);
}



    const canvas = document.getElementById('tabuleiro');
    const ctx = canvas.getContext('2d');
    const tamanhoCelula = 100;
    const linhas = 7;
    const colunas = 8;
    const tabuleiro = Array.from({ length: linhas + 1 }, () => Array(colunas + 1).fill(0));
    const gruposDePecas = { 1: 'blue', 2: 'green', 3: 'purple',  4: 'red', 5: 'yellow'}; 


   
    const pecas = [
        { grupo: 1 }, { grupo: 1 }, { grupo: 1 }, //jogador
        { grupo: 2 }, { grupo: 2 }, { grupo: 2 }, //computador
        { grupo: 3 }, //matadora
        { grupo: 4 }, //impiedosa
        { grupo: 5 }, { grupo: 5 }, { grupo: 5 },{ grupo: 5 }, //auxiliar da impiedosa
    ];
    
    let posicaoPecas = [
        { linha: 1, coluna: 1 }, { linha: 2, coluna: 1 }, { linha: 3, coluna: 1 },
        { linha: 4, coluna: 1 }, { linha: 5, coluna: 1 }, { linha: 6, coluna: 1 },
        { linha: 4, coluna: 4 }, // Posição inicial da matadora
        { linha: 4, coluna: 8 }, //impiedosa 2 2 
        {linha: 0, coluna:0},{linha: 0, coluna:0},{linha: 0, coluna:0},{linha: 0, coluna:0},
    ];
    
    let grupoAtual = 1; 
    let movimentoRealizado = false; 
    let pecaSelecionada = 1;
    let utterance;
    let matadora = false;

    let impiedosaColocada = false;
    let isMuted = false; // Variável para controlar o estado de silenciamento


    function falarMensagem(mensagem, idioma = 'pt-BR') {
        if (vozAtivada) {
            if (utterance && typeof utterance.cancel === 'function') {
                utterance.cancel();
            }
            
            utterance = new SpeechSynthesisUtterance(mensagem);
            utterance.lang = idioma;
            speechSynthesis.speak(utterance);
        }
    }
    
  // Função para reproduzir som com base no número do movimento
  function reproduzirSom(moveNumber) {
    if (!isMuted) {
        const audio = new Audio(`../som/move${moveNumber}.wav`);
        audio.play();
    }
}

// Função para reproduzir o som da peça 'Impiedosa'
function somImpiedosa() {
    if (!isMuted) {
        const audioImpiedosa = new Audio(`../som/impiedosa.wav`);
        audioImpiedosa.play();
    }
}

// Função para reproduzir o som da peça 'Matadora'
function somMatadora() {
    if (!isMuted) {
        const audioMatadora = new Audio(`../som/matadora.wav`);
        audioMatadora.play();
    }
}

function somCaputura() {
    if (!isMuted) {
        const audioCaptura = new Audio(`../som/captura.wav`);
        audioCaptura.play();
    }
}

    function posicionarPecasIniciais(grupoEscolhido) {
        if (grupoEscolhido === '1') {
            for (let i = 0; i < pecas.length; i++) {
                if (pecas[i].grupo === 1) {
                    posicaoPecas[i] = { linha: 7, coluna: i + 3 };
                } else if (pecas[i].grupo === 2) {
                    posicaoPecas[i] = { linha: 1, coluna: (i % 3) + 3 };
                }
            }
        } else if (grupoEscolhido === '2') {
            for (let i = 0; i < pecas.length; i++) {
                if (pecas[i].grupo === 1) {
                    posicaoPecas[i] = { linha: 1, coluna: (i % 3) + 3 };
                } else if (pecas[i].grupo === 2) {
                    posicaoPecas[i] = { linha: 7, coluna: (i % 3) + 3 };
                }
            }
        }
        falarMensagem("Pressione 's' para desativar a voz e 's' para reativá-la. ")
        desenharTabuleiro();
    }
    
    
    
    
    var contaminjogador = 0;
    var contamincomput= 0;
    
    
    let vozAtivada = true;


    if( vozAtivada == true){
        falarMensagem("Escolha posição do tabuleiro. Pressione T para iniciar com os mosqueteiros no topo da tela. Pressione I para iniciar com os mosqueteiros na parte inferior. Então pressione enter para jogar");
    }

    let aguardandoPosicaoImpiedosa = false;
    let posicaoImpiedosaLinha = null;


    let pecaSelecionadaIndex = null; // Índice da peça selecionada no array posicaoPecas

    canvas.addEventListener('click', (event) => {
        console.log('Clique detectado no canvas');
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
    
        // Converter as coordenadas do clique para as coordenadas da grade do tabuleiro
        const colunaClicada = Math.floor(mouseX / tamanhoCelula) + 1;
        const linhaClicada = Math.floor(mouseY / tamanhoCelula) + 1;
    
        console.log("Clique nas coordenadas (linha, coluna):", linhaClicada, colunaClicada);
        console.log("Posições das peças:", posicaoPecas);
    
        if (pecaSelecionadaIndex === null) {
            // Se nenhuma peça foi selecionada, verificar se uma peça foi clicada
            let pecaClicada = false;
            for (let i = 0; i < posicaoPecas.length; i++) {
                if (posicaoPecas[i].linha === linhaClicada && posicaoPecas[i].coluna === colunaClicada) {
                    // Se a posição do clique corresponder à posição de uma peça, selecionar a peça
                    if (pecas[i].grupo <= 1) { // Verificar se a peça pertence ao grupo permitido(1)
                        pecaSelecionadaIndex = i;
                        console.log(`Peça número ${pecaSelecionadaIndex + 1} selecionada.`);
                        switch(pecaSelecionadaIndex) {
                            case 0:
                                falarMensagem("Você escolheu o Aramis", "fr-FR"); // Francês
                                break;
                            case 1:
                                falarMensagem("Você escolheu o D'Artagnan", "fr-FR"); // Francês
                                break;
                            case 2:
                                falarMensagem("Você escolheu o Porthos", "fr-FR"); // Francês
                                break;
                            default:
                                // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                                falarMensagem("Opção não reconhecida");
                                break;
                        }
                        const posicoesDisponiveis = calcularPosicoesDisponiveis(posicaoPecas[i]);
                        desenharPosicoesDisponiveis(posicoesDisponiveis);
                    } else {
                        console.log("Você não pode mover o guarda do oponente.");
                        falarMensagem("Você não pode mover o guarda do oponente");
                    }
                    pecaClicada = true;
                    break;
                }
            }
            if (!pecaClicada) {
                console.log("Você precisa selecionar um mosqueteiro primeiro.");
                falarMensagem("Você precisa selecionar um mosqueteiro primeiro.");
            }
        } else {
            // Se uma peça já foi selecionada, verificar se o clique foi em uma posição disponível
            const posicoesDisponiveis = calcularPosicoesDisponiveis(posicaoPecas[pecaSelecionadaIndex]);
            const posicaoDisponivelClicada = posicoesDisponiveis.some(posicao => posicao.linha === linhaClicada && posicao.coluna === colunaClicada);
            if (posicaoDisponivelClicada) {
                // Mover a peça para a posição clicada
                movePecaComMouse(pecaSelecionadaIndex, linhaClicada, colunaClicada);
                pecaSelecionadaIndex = null; // Resetar a peça selecionada
            } else {
                console.log("Movimento não Permitido");
                falarMensagem("Movimento não Permitido");
            }
        }
    });
    
    
    function calcularPosicoesDisponiveis(peca) {
        const linha = peca.linha;
        const coluna = peca.coluna;
    
        if (coluna === 8) {
            return []; // Se estiver na coluna 8, retornar um array vazio
        }
    
        const posicoesDisponiveis = [
            { linha: linha - 1, coluna }, // Acima
            { linha: linha + 1, coluna }, // Abaixo
            { linha, coluna: coluna - 1 }, // À esquerda
            { linha, coluna: coluna + 1 }  // À direita
        ].filter(posicao => posicao.linha >= 1 && posicao.linha <= linhas && posicao.coluna >= 1 && posicao.coluna <= colunas && !posicaoPecas.some(p => p.linha === posicao.linha && p.coluna === posicao.coluna));
    
        return posicoesDisponiveis;
    }
    
    function desenharPosicoesDisponiveis(posicoesDisponiveis) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'; // Verde transparente
        for (const posicao of posicoesDisponiveis) {
            // Verificar se a coluna não é igual a 8
            if (posicao.coluna !== 8) {
                ctx.fillRect((posicao.coluna - 1) * tamanhoCelula, (posicao.linha - 1) * tamanhoCelula, tamanhoCelula, tamanhoCelula);
            }
        }
    }

    
    function movePecaComMouse(indexPeca, novaLinha, novaColuna) {
        const peca = posicaoPecas[indexPeca];
    
        // Verificar se a nova posição está dentro dos limites do tabuleiro
        if (novaLinha < 1 || novaLinha > linhas || novaColuna < 1 || novaColuna > colunas || novaColuna === 8) {
            console.log("Movimento inválido");
            return;
        }
    
        // Verificar se a nova posição é ocupada por outra peça
        const indexPosicaoOcupada = posicaoPecas.findIndex(
            (p, i) => i !== indexPeca && p.linha === novaLinha && p.coluna === novaColuna
        );
        if (indexPosicaoOcupada !== -1) {
            console.log("Movimento inválido: a célula já está ocupada.");
            return;
        }
    
        // Aqui, adicionamos a verificação para garantir que a nova coluna não seja 8
        if (novaColuna === 8) {
            console.log("Movimento inválido: a peça está na coluna 8 e não pode ser movida.");
            return;
        }
    
        peca.linha = novaLinha;
        peca.coluna = novaColuna;
    
        // Atualizar o tabuleiro após o movimento
        desenharTabuleiro();
    
        // Adicionar qualquer lógica adicional necessária após o movimento
        console.log(`Mosqueteiro movido para faixa ${novaLinha}, trilha ${novaColuna}`);
        falarMensagem(`Mosqueteiro movido para faixa ${novaLinha}, trilha ${novaColuna}`)
        if(grupoAtual === 1){
            contaminjogador +=1;
            grupoAtual +=1;
        } else {
            grupoAtual-=1;
        }
    
        // Marcar o movimento como realizado
        movimentoRealizado = true;
    
        // Verificar se a peça foi movida com sucesso
        if (!movimentoRealizado) {
            // Se o movimento não foi realizado com sucesso, permitir que o jogador escolha outra peça
            console.log("Escolha outra peça.");
            return;
        }else{
            if (grupoAtual === 2) {
                movimentoComputador();
            } else {
                falarMensagem("Sua vez");
            } 
        }
    }
    
    
    
       
    
    
    
    

    
    document.addEventListener('keydown', (event) => {
        if (aguardandoPosicaoImpiedosa) {
            if (!isNaN(parseInt(event.key, 10))) {
                const num = parseInt(event.key, 10);
                if (posicaoImpiedosaLinha === null) {
                    posicaoImpiedosaLinha = num;
                    console.log(`Linha escolhida: ${num}. Agora digite a coluna.`);
                } else {
                    moverImpiedosa(posicaoImpiedosaLinha, num);
                    aguardandoPosicaoImpiedosa = false;
                    posicaoImpiedosaLinha = null;
                }
            }
            return; 
        }

        speechSynthesis.cancel();
        utterance = null;

        if (event.key.startsWith('Arrow') && !movimentoRealizado) {
            movePeca(event.key);
        } else if (event.key >= '1' && event.key <= '3') {
            pecaSelecionada = parseInt(event.key, 10);
            switch(pecaSelecionada) {
                case 1:
                    falarMensagem("Você escolheu o Aramis", "fr-FR"); // Francês
                    break;
                case 2:
                    falarMensagem("Você escolheu o D'Artagnan", "fr-FR"); // Francês
                    break;
                case 3:
                    falarMensagem("Você escolheu o Porthos", "fr-FR"); // Francês
                    break;
                default:
                    // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                    falarMensagem("Opção não reconhecida");
                    break;
            }
            console.log(`Peça ${pecaSelecionada} selecionada.`);
            

        } else if (event.key === 'c' || event.key === 'C') {
            falarPosicoesPecasComputador();
        } else if (event.key === 'j' || event.key === 'J') {
            falarPosicoesPecasJogador();
        } else if (event.key === 'e' || event.key === 'E') {
            informarPosicaoMatadoraImpiedosa();
        } else if (event.key === 'i' || event.key === 'I') {
            aguardandoPosicaoImpiedosa = true;
            console.log("Digite a linha e depois a coluna para a peça impiedosa");
            falarMensagem("Digite o numero da faixa e da trilha para posicionar a impiedosa")
        } else if (event.key === 's' || event.key === 'S') {
            if (vozAtivada) {
                vozAtivada = false;
            } else {
                vozAtivada = true;
                falarMensagem("Voz ativada. Pressione 's' novamente para desativar.");
            }
        } else if (event.key === 'm' || event.key === 'M') {
            matadora = true;
            falarMensagem("Você selecionou a matadora. prossiga com a captura.");
        }
        else if (event.key === 'q' || event.key === 'Q') {
            isMuted = !isMuted; // Alternando o estado de silenciamento
            if(isMuted === false){
                falarMensagem(`áudios ativados`);
            }else{
                falarMensagem(`áudios desativados`);
            }

        }

        if (matadora && event.key.startsWith('Arrow')) {
            movimentoMatadora(event.key);
            matadora = false;
        }
    });
    
    function informarPosicaoMatadoraImpiedosa() {
        const indexMatadora = pecas.findIndex(peca => peca.grupo === 3);
        const indexImpiedosa = pecas.findIndex(peca => peca.grupo === 4);
    
        if (indexMatadora !== -1) {
            const posicaoMatadora = posicaoPecas[indexMatadora];
            console.log(`Matadora está na faixa ${posicaoMatadora.linha}, trilha ${posicaoMatadora.coluna}.`);
            falarMensagem(`Matadora está na faixa ${posicaoMatadora.linha}, trilha ${posicaoMatadora.coluna}.`);
        }
    
        if (indexImpiedosa !== -1) {
            const posicaoImpiedosa = posicaoPecas[indexImpiedosa];
            console.log(`Impiedosa está na faixa ${posicaoImpiedosa.linha}, trilha ${posicaoImpiedosa.coluna}.`);
            if(posicaoImpiedosa.coluna === 8){
                falarMensagem('Impiedosa só está esperando você para capturar');

            }else if(posicaoImpiedosa.coluna === 8){
                falarMensagem('Impiedosa só está esperando você para capturar');
                


            }else{
                falarMensagem(`Impiedosa está na faixa ${posicaoImpiedosa.linha}, trilha ${posicaoImpiedosa.coluna}.`);
            }
            
        }
    }
    


    function podeMoverImpiedosa(linha, coluna) {
     
        // Verificar se a nova posição está ocupada por outra peça
        const indexPosicaoOcupada = posicaoPecas.findIndex(
            peca => peca.linha === linha && peca.coluna === coluna
        );
       
            if (indexPosicaoOcupada !== -1) {
                console.log("Movimento inválido: a célula já está ocupada.");
                falarMensagem("Movimento negado!");

                return false;
            }

     
        if(contaminjogador > 4){
             console.log('passos jogador: ' + contaminjogador);

            return true; // Movimento permitido
         }
    }
    
    function mostrarPecasProximas(linha, coluna) {

        console.log(`-------------------------------------Peças próximas à Impiedosa na posição solicitada (${linha}, ${coluna}):`);
    
        for (let i = linha - 2; i <= linha + 2; i++) {
            for (let j = coluna - 2; j <= coluna + 2; j++) {
                const indexPeca = posicaoPecas.findIndex(
                    peca => peca.linha === i && peca.coluna === j
                );
    
                if (indexPeca !== -1) {
                    const grupoPeca = pecas[indexPeca].grupo;
                    console.log(`Grupo ${grupoPeca} na linha ${i}, coluna ${j}`);
                }
            }
        }
    }
    

    function moverImpiedosa(linha, coluna) {
        const indexImpiedosa = pecas.findIndex(peca => peca.grupo === 4);
    
        // Mostrar as peças próximas antes de mover a Impiedosa
        mostrarPecasProximas(linha, coluna);
    
        // Verificar se o movimento é permitido
        if (!podeMoverImpiedosa(linha, coluna)) {
            return;
        }
    
        posicaoPecas[indexImpiedosa] = { linha: linha, coluna: coluna };
        desenharTabuleiro();
        console.log(`Peça impiedosa movida para linha ${linha}, coluna ${coluna}`);
    
        // Adicionando impressão das diagonais
        const diagonais = calcularDiagonais(linha, coluna);
        console.log("Linhas e colunas das células diagonais:");
    
        diagonais.forEach(celula => {
            console.log(`Linha: ${celula.linha}, Coluna: ${celula.coluna}`);
    
            const indexDiagonal = posicaoPecas.findIndex(
                peca => peca.linha === celula.linha && peca.coluna === celula.coluna
            );
    
            if (indexDiagonal === -1) {
                // Adiciona peça do grupo 5 nas diagonais
                posicaoPecas.push({ linha: celula.linha, coluna: celula.coluna });
                pecas.push({ grupo: 5 });
                console.log(`Peça do grupo 5 adicionada na linha ${celula.linha}, coluna ${celula.coluna}`);
            }
        });
    
        falarMensagem(`Impiedosa movida para faixa ${linha} e trilha ${coluna}. Prossiga para captura.`);
        somImpiedosa();
        mostrarPecasProximas(linha, coluna);
    
        // Armazenar a posição da peça impiedosa no localStorage
        localStorage.setItem('posicaoImpiedosa', JSON.stringify({ linha: linha, coluna: coluna }));
    }
    
    
    


function calcularDiagonais(linha, coluna) {
    const diagonais = [];
    const direcoes = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // diagonais superiores e inferiores

    direcoes.forEach(([dx, dy]) => {
        let linhaAtual = linha + dx;
        let colunaAtual = coluna + dy;

        if (linhaAtual >= 1 && linhaAtual <= linhas && colunaAtual >= 1 && colunaAtual <= colunas) {
            diagonais.push({ linha: linhaAtual, coluna: colunaAtual });
        }
    });

    return diagonais;
}

function verificarCerco(linha, coluna) {
    const adjacencias = [
        { linha: linha - 1, coluna: coluna },
        { linha: linha + 1, coluna: coluna },
        { linha: linha, coluna: coluna - 1 },
        { linha: linha, coluna: coluna + 1 }
    ];

    // Contar o número de peças ao redor da nova posição
    let contadorPecas = 0;

    adjacencias.forEach(adjacente => {
        const indexAdjacente = posicaoPecas.findIndex(
            peca => peca.linha === adjacente.linha && peca.coluna === adjacente.coluna
        );

        if (indexAdjacente !== -1) {
            contadorPecas++;
        }
    });

    // Se a Impiedosa está na borda e não fechou um cerco, retornar falso
    if (linha === 1 || linha === linhas || coluna === 1 || coluna === colunas) {
        return contadorPecas >= 2; // Dois vizinhos ou mais para cerco nas bordas
    }

    // Se não está na borda, um vizinho já fecha o cerco
    return contadorPecas >= 1;
}

    
    function podeCapturar(linha, coluna) {
        const direcoes = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // baixo, direita, cima, esquerda
        for (let [dx, dy] of direcoes) {
            const linhaAdjacente = linha + dx;
            const colunaAdjacente = coluna + dy;
    
            // Encontrar índice da peça adjacente (se houver)
            const indexPecaAdjacente = posicaoPecas.findIndex(
                peca => peca.linha === linhaAdjacente && peca.coluna === colunaAdjacente
            );
    
            if (indexPecaAdjacente !== -1) {
                const pecaAdjacente = pecas[indexPecaAdjacente];
    
                // Verifica se a peça adjacente é um mosqueteiro adversário
                if (pecaAdjacente.grupo === 1 || pecaAdjacente.grupo === 2) {
                    const posicaoPecaAdjacente = posicaoPecas[indexPecaAdjacente];
                    if (estaCercado(posicaoPecaAdjacente, indexPecaAdjacente)) {
                        return true; // Um mosqueteiro adversário será capturado
                    }
                }
            }
        }
        return false; // Nenhuma captura possível
    }
    
    
    function movimentoMatadora(direction) {
        posicaoPecas.forEach((posicao, index) => {
            if (pecas[index].grupo === 3) { // Se for a matadora
                let novaLinha = posicao.linha;
                let novaColuna = posicao.coluna;
    
                switch (direction) {
                    case 'ArrowUp':
                        novaLinha = Math.max(1, posicao.linha - 1);
                        break;
                    case 'ArrowDown':
                        novaLinha = Math.min(linhas, posicao.linha + 1);
                        break;
                    case 'ArrowLeft':
                        novaColuna = Math.max(1, posicao.coluna - 1);
                        break;
                    case 'ArrowRight':
                        novaColuna = Math.min(colunas, posicao.coluna + 1);
                        break;
                }
    
                const posicaoOcupada = posicaoPecas.some(
                    peca => peca.linha === novaLinha && peca.coluna === novaColuna
                );
    
                if (!posicaoOcupada && vaiCercar(novaLinha, novaColuna)) {
                    posicao.linha = novaLinha;
                    posicao.coluna = novaColuna;
                    somMatadora();
                    desenharTabuleiro();
                    verificarECapturarMosqueteiro(); // Chamada para verificar e capturar o mosqueteiro, se aplicável
    
                } else {
                    console.log("Movimento da matadora negado");
                    falarMensagem("Movimento da matadora negado");
                }
            }
        });
    }
    
    

        

    function vaiCercar(linha, coluna) {
        const direcoes = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // baixo, direita, cima, esquerda
        for (let [dx, dy] of direcoes) {
            const linhaAdjacente = linha + dx;
            const colunaAdjacente = coluna + dy;
    
            const indexPecaAdjacente = posicaoPecas.findIndex(
                peca => peca.linha === linhaAdjacente && peca.coluna === colunaAdjacente
            );
    
            if (indexPecaAdjacente !== -1 && (pecas[indexPecaAdjacente].grupo === 1 || pecas[indexPecaAdjacente].grupo === 2|| pecas[indexPecaAdjacente].grupo === 4 || pecas[indexPecaAdjacente].grupo === 5)) {
                // Verifica se a peça adjacente será cercada
                const posicaoPecaAdjacente = posicaoPecas[indexPecaAdjacente];
                console.log(`Peca Adjacente - Linha: ${posicaoPecaAdjacente.linha}, Coluna: ${posicaoPecaAdjacente.coluna}, Grupo: ${pecas[indexPecaAdjacente].grupo}`);
                if (estaCercadoComMatadora(posicaoPecaAdjacente, indexPecaAdjacente, linha, coluna)) {
                    console.log(`A peça matadora do grupo ${pecas[indexPecaAdjacente].grupo} está prestes a cercar a peça na linha ${linha} e coluna ${coluna}`);
                    return true; // Um mosqueteiro será cercado

                }
            }
        }
        return false;
    }
    
    function estaCercadoComMatadora(posicao, indexPeca, linhaMatadora, colunaMatadora) {
        const direcoes = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        return direcoes.every(([dx, dy]) => {
            const linhaAdjacente = posicao.linha + dx;
            const colunaAdjacente = posicao.coluna + dy;
    
            // Considera a nova posição da matadora como ocupada
            if (linhaAdjacente === linhaMatadora && colunaAdjacente === colunaMatadora) {
                return true;
            }
    
            return posicaoPecas.some((pos, i) => {
                return pos.linha === linhaAdjacente &&
                       pos.coluna === colunaAdjacente &&
                       pecas[i].grupo !== pecas[indexPeca].grupo;
            });
        });
    }
    
    
    
    
    function falarPosicoesPecasJogador() {
        posicaoPecas.forEach((peca, index) => {
            if (pecas[index] && pecas[index].grupo === 1) {
                switch(index) {
                    case 0:
                        falarMensagem(`o Aramis está na faixa ${peca.linha}, trilha ${peca.coluna}. `, "fr-FR"); // Francês
                        break;
                    case 1:
                        falarMensagem(`D'Artagnan está na faixa ${peca.linha}, trilha ${peca.coluna}. `, "fr-FR"); // Francês
                        break;
                    case 2:
                        falarMensagem(`o Porthos está na faixa ${peca.linha}, trilha ${peca.coluna}. `, "fr-FR"); // Francês
                        break;
                    default:
                        // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                        falarMensagem("Opção não reconhecida");
                        break;
                }
            }
        });
    }
    
    function falarPosicoesPecasComputador() {
        posicaoPecas.forEach((peca, index) => {
            if (pecas[index] && pecas[index].grupo === 2) {
                switch(index) {
                    case 3:
                        if (peca.coluna === 8) {
                            falarMensagem(`o Guarda 1 está capturado.`);
                        } else {
                            falarMensagem(`o Guarda 1 está na faixa ${peca.linha}, trilha ${peca.coluna}.`);
                        }
                        break;
                    case 4:
                        if (peca.coluna === 8) {
                            falarMensagem(`o Guarda 2 está capturado.`);
                        } else {
                            falarMensagem(`o Guarda 2 está na faixa ${peca.linha}, trilha ${peca.coluna}.`);
                        }
                        break;
                    case 5:
                        if (peca.coluna === 8) {
                            falarMensagem(`o Guarda 3 está capturado.`);
                        } else {
                            falarMensagem(`o Guarda 3 está na faixa ${peca.linha}, trilha ${peca.coluna}.`);
                        }
                        break;
                    default:
                        // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                        falarMensagem("Opção não reconhecida");
                        break;
                }
            }
        });
    }
    
    
    
    function pecaBloqueada(index) {
        if (index !== undefined && posicaoPecas[index]) {
            return bloqueada(index);
        }
        return true;
    }
    
    
    
    
    
    function desenharTabuleiro() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 6;
    
        for (let i = 1; i <= linhas; i++) {
            for (let j = 1; j <= colunas; j++) {
                const x = (j - 1) * tamanhoCelula;
                const y = (i - 1) * tamanhoCelula;
    
                ctx.fillStyle = j === colunas ? 'black' : tabuleiro[i][j] === 0 ? '#eee' : '#ddd';
                ctx.fillRect(x, y, tamanhoCelula, tamanhoCelula);
    
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x, y, tamanhoCelula, tamanhoCelula);
            }
        }
    
        for (let i = 0; i < pecas.length; i++) {
            if (posicaoPecas[i].linha !== -1 && posicaoPecas[i].coluna !== -1) {
                const xPeca = (posicaoPecas[i].coluna - 1) * tamanhoCelula + tamanhoCelula / 2;
                const yPeca = (posicaoPecas[i].linha - 1) * tamanhoCelula + tamanhoCelula / 2;
    
                if (pecas[i].grupo === 4) {
                    desenharCoracao(xPeca, yPeca, tamanhoCelula * 0.6);
                } else if (pecas[i].grupo !== 5) {
                    ctx.fillStyle = gruposDePecas[pecas[i].grupo];
                    ctx.beginPath();
                    ctx.arc(xPeca, yPeca, tamanhoCelula / 2 - 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                }
    
                ctx.font = '20px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
    
                let numeroTexto;
                if (pecas[i].grupo === 1) {
                    // Personalizar o texto para peças do Grupo 1
                    switch (i) {
                        case 0:
                            numeroTexto = 'A'; // Peça 1
                            break;
                        case 1:
                            numeroTexto = 'D'; // Peça 2
                            break;
                        case 2:
                            numeroTexto = 'P'; // Peça 3
                            break;
                        default:
                            numeroTexto = i + 1; // Outras peças do Grupo 1
                            break;
                    }
                } else if (pecas[i].grupo === 2) {
                    switch (i) {
                        case 3:
                            numeroTexto = '1'; // Peça 1
                            break;
                        case 4:
                            numeroTexto = '2'; // Peça 2
                            break;
                        case 5:
                            numeroTexto = '3'; // Peça 3
                            break;
                        default:
                            numeroTexto = i + 1; // Outras peças do Grupo 1
                            break;
                    }
                } else if (pecas[i].grupo === 3) {
                    numeroTexto = 'M'; // Matadora
                } else if (pecas[i].grupo === 4) {
                    numeroTexto = ''; // Impiedosa
                } else {
                    numeroTexto = ''; // Grupo 5 ou outras peças não especificadas
                }
    
                ctx.fillText(numeroTexto, xPeca, yPeca);
            }
        }  
    }
    
    
    
 
    function desenharCoracao(x, y, tamanho) {
        ctx.beginPath();
        const topCurveHeight = tamanho * 0.3;
        x -= tamanho * 0.4;
        y -= tamanho * 0.4;
    
        ctx.moveTo(x, y + topCurveHeight);
        // Top left curve
        ctx.bezierCurveTo(
            x, y, 
            x - tamanho / 2, y, 
            x - tamanho / 2, y + topCurveHeight
        );
    
        // Bottom left curve
        ctx.bezierCurveTo(
            x - tamanho / 2, y + (tamanho + topCurveHeight) / 2, 
            x, y + (tamanho + topCurveHeight) / 2, 
            x, y + tamanho
        );
    
        // Bottom right curve
        ctx.bezierCurveTo(
            x, y + (tamanho + topCurveHeight) / 2, 
            x + tamanho / 2, y + (tamanho + topCurveHeight) / 2, 
            x + tamanho / 2, y + topCurveHeight
        );
    
        // Top right curve
        ctx.bezierCurveTo(
            x + tamanho / 2, y, 
            x, y, 
            x, y + topCurveHeight
        );
    
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
    }
    
    function movePeca(direction) {
        const indexPeca = pecaSelecionada - 1; 

    if (indexPeca !== -1 && pecas[indexPeca].grupo === grupoAtual) {

        
    // Verificação para impedir movimento se a peça estiver na coluna 8
    if (indexPeca !== -1 && posicaoPecas[indexPeca].coluna === 8) {
        console.log("Movimento inválido: a peça está na coluna 8 e não pode ser movida.");
        return;
    }

        let novaLinha = posicaoPecas[indexPeca].linha;
        let novaColuna = posicaoPecas[indexPeca].coluna;

       
        switch (direction) {
            case 'ArrowUp':
                novaLinha = Math.max(1, novaLinha - 1);
                break;
            case 'ArrowDown':
                novaLinha = Math.min(linhas, novaLinha + 1);
                break;
            case 'ArrowLeft':
                novaColuna = Math.max(1, novaColuna - 1);
                break;
            case 'ArrowRight':
                novaColuna = Math.min(colunas - 1, novaColuna + 1); // Modificação aqui
                break;
        }

        const indexPosicaoOcupada = posicaoPecas.findIndex(
            peca => peca.linha === novaLinha && peca.coluna === novaColuna
        );

        if (indexPosicaoOcupada !== -1) {
            console.log("Movimento inválido: a célula já está ocupada.");
            const pecaOcupante = pecas[indexPosicaoOcupada];

            if (pecaOcupante.grupo === 3 && indexPosicaoOcupada === 6) {
                falarMensagem("Posição ocupada pela matadora.");
            } else if(pecaOcupante.grupo === 2) {
                let numeroPeca;
                if (pecaOcupante.grupo === 2) {
                    numeroPeca = indexPosicaoOcupada;
                    switch(numeroPeca) {
                        case 3:
                            falarMensagem(`Posição ocupada pelo guarda 1 do cardeal.`); // Francês
                            break;
                        case 4:
                            falarMensagem(`Posição ocupada pelo guarda 2 do cardeal.`); // Francês
                            break;
                        case 5:
                            falarMensagem(`Posição ocupada pelo guarda 3 do cardeal.`); // Francês
                            break;
                        default:
                            // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                            falarMensagem("Opção não reconhecida");
                            break;
                    }
                } else {
                    numeroPeca = indexPosicaoOcupada + 1;
                }
                
                

                
            } else if(pecaOcupante.grupo === 1){
                let numeroPeca;
                if (pecaOcupante.grupo === 1) {
                    numeroPeca = indexPosicaoOcupada;
                    switch(numeroPeca) {
                        case 0:
                            falarMensagem(`Posição ocupada pelo Aramis.`,"fr-FR"); // Francês
                            break;
                        case 1:
                            falarMensagem(`Posição ocupada pelo D'Artagnan.`,"fr-FR"); // Francês
                            break;
                        case 2:
                            falarMensagem(`Posição ocupada pelo Porthos.`,"fr-FR"); // Francês
                            break;
                        default:
                            // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                            falarMensagem("Opção não reconhecida");
                            break;
                    }
                } else {
                    numeroPeca = indexPosicaoOcupada+1;
                }

            }else if(pecaOcupante.grupo === 4 || pecaOcupante.grupo === 5){

                falarMensagem(`Posição ocupada pela impiedosa.`);
            }else{
                falarMensagem("Movimento negado. Você não pode fugir do tabuleiro");
            }


            return;
        }
        if (
            novaLinha !== posicaoPecas[indexPeca].linha ||
            novaColuna !== posicaoPecas[indexPeca].coluna
        ) {
            const novaPosicaoOcupada = posicaoPecas.some(
                (peca, i) =>
                    i !== indexPeca &&
                    peca &&
                    pecas[i] &&
                    pecas[indexPeca] &&
                    pecas[i].grupo === pecas[indexPeca].grupo &&
                    peca.linha === novaLinha &&
                    peca.coluna === novaColuna
            );

            const posicaoOcupadaPorGrupo2 = posicaoPecas.some(
                (peca, i) =>
                    peca &&
                    pecas[i] &&
                    pecas[i].grupo === 2 &&
                    peca.linha === novaLinha &&
                    peca.coluna === novaColuna
            );

            if (!novaPosicaoOcupada && !posicaoOcupadaPorGrupo2) {
                posicaoPecas[indexPeca].linha = novaLinha;
                posicaoPecas[indexPeca].coluna = novaColuna;

                reproduzirSom(grupoAtual);
                desenharTabuleiro();

                if(grupoAtual === 1){
                    contaminjogador +=1;
                    
                    switch(pecaSelecionada) {
                        case 1:
                            falarMensagem(`Você moveu o Aramis para faixa ${novaLinha}, trilha ${novaColuna}`,"fr-FR"); // Francês
                            break;
                        case 2:
                            falarMensagem(`Você moveu o D'Artagnan para faixa ${novaLinha}, trilha ${novaColuna}`,"fr-FR"); // Francês
                            break;
                        case 3:
                            falarMensagem(`Você moveu o Porthos para faixa ${novaLinha}, trilha ${novaColuna}`,"fr-FR"); // Francês
                            break;
                        default:
                            // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                            falarMensagem("Opção não reconhecida");
                            break;
                    }

                    console.log(`Jogador moveu Linha ${novaLinha}, Coluna ${novaColuna}`);
                    console.log(contamincomput);
                }
                else{
                    contamincomput +=1;
                    switch(pecaSelecionada -3) {
                        case 1:
                            falarMensagem(`o Cardeal escolheu guarda 1  e  moveu para faixa ${posicaoPecas[indexPeca].linha}, trilha ${posicaoPecas[indexPeca].coluna}`); // Francês
    
                            break;
                        case 2:
                            falarMensagem(`o Cardeal escolheu guarda 2  e  moveu para faixa ${posicaoPecas[indexPeca].linha}, trilha ${posicaoPecas[indexPeca].coluna}`); // Francês
    
                            break;
                        case 3:
                            falarMensagem(`o Cardeal escolheu guarda 3  e  moveu para faixa ${posicaoPecas[indexPeca].linha}, trilha ${posicaoPecas[indexPeca].coluna}`); // Francês
    
                            break;
                        default:
                            // Caso não seja nenhuma das opções específicas, usa o padrão pt-BR
                            falarMensagem("Opção não reconhecida");
                            break;
                    }
                    console.log(`Computador moveu para Linha ${posicaoPecas[indexPeca].linha}, Coluna ${posicaoPecas[indexPeca].coluna}.`)
                }
                
                movimentoRealizado = true;
                setTimeout(() => {
                    movimentoRealizado = false;
                    grupoAtual = (grupoAtual % 2) + 1;

                    if (grupoAtual === 2) {
                        movimentoComputador();
                    } else {
                        falarMensagem("Sua vez");
                    }
                }, 1000);
            }
        }
    }
}
let tentativas = 0; // Variável para contar as tentativas de escolha de outra peça

function movimentoComputador() {
    const pecasMoveis = posicaoPecas
        .map((peca, index) => ({ index, peca }))
        .filter(({ index, peca }) => 
            pecas[index].grupo === 2 && // Verifica se a peça pertence ao grupo 2 (computador)
            !bloqueada(index) && // Verifica se a peça não está bloqueada
            peca.coluna !== 8 // Verifica se a peça não está na coluna 8
        );

    if (pecasMoveis.length > 0) {
        const pecaEscolhida = pecasMoveis[Math.floor(Math.random() * pecasMoveis.length)];
        pecaSelecionada = pecaEscolhida.index + 1;

        console.log(`Computador escolheu a peça número ${pecaSelecionada - 3}`);
        const direcoesPossiveis = [];
        const { linha, coluna } = pecaEscolhida.peca;

        // Verifica as direções possíveis para mover a peça
        if (linha > 1 && !posicaoOcupada(linha - 1, coluna)) {
            direcoesPossiveis.push('ArrowUp');
        }
        if (linha < linhas && !posicaoOcupada(linha + 1, coluna)) {
            direcoesPossiveis.push('ArrowDown');
        }
        if (coluna > 1 && !posicaoOcupada(linha, coluna - 1)) {
            direcoesPossiveis.push('ArrowLeft');
        }
        if (coluna < colunas && !posicaoOcupada(linha, coluna + 1)) {
            direcoesPossiveis.push('ArrowRight');
        }

        if (direcoesPossiveis.length > 0) {
            const direcaoEscolhida = direcoesPossiveis[Math.floor(Math.random() * direcoesPossiveis.length)];
            movePeca(direcaoEscolhida);
        } else {
            console.log(`A peça número ${pecaSelecionada - 3} está bloqueada. Escolhendo outra peça.`);
            if (tentativas < 3) { 
                tentativas++;
                movimentoComputador(); // Escolhe outra peça se a escolhida está bloqueada
            } else {
                const ladosBloqueados = verificarLadosBloqueados(pecaEscolhida);
                if (ladosBloqueados === 4) {
                    falarMensagem("Os mosqueteiros capturaram todos os guardas do cardial. Fim de jogo. você venceu!.");

                    alert("Os mosqueteiros capturaram todos os guardas do cardial. Fim de jogo. você venceu!.");
                } else {
                    falarMensagem(`Empate! O guarda ${pecaSelecionada - 3} do cardial está cercado. fim de jogo`);

                    alert(`Empate! O guarda ${pecaSelecionada - 3} do cardial está cercado. fim de jogo.`);

                }
                return; // Encerra a função movimentoComputador()
            }
        }
    } else {
        
        // Se ainda houver peças disponíveis para movimento, escolher outra peça.
        console.log("Todas as peças selecionadas estão bloqueadas. Escolhendo outra peça.");
        movimentoComputador(); // Escolhe outra peça se todas as selecionadas estão bloqueadas
    }
    verificarECapturarMosqueteiro();
}

function verificarLadosBloqueados(pecaEscolhida) {
    const { linha, coluna } = pecaEscolhida.peca;
    let ladosBloqueados = 0;

    if (posicaoOcupada(linha - 1, coluna)) {
        ladosBloqueados++;
    }
    if (posicaoOcupada(linha + 1, coluna)) {
        ladosBloqueados++;
    }
    if (posicaoOcupada(linha, coluna - 1)) {
        ladosBloqueados++;
    }
    if (posicaoOcupada(linha, coluna + 1)) {
        ladosBloqueados++;
    }

    return ladosBloqueados;
}
   






    
        function posicaoOcupada(linha, coluna) {
            return posicaoPecas.some((peca) => peca && peca.linha === linha && peca.coluna === coluna);
        }

    

    function bloqueada(index) {
        if (index !== undefined && posicaoPecas[index]) {
            return posicaoPecas.some((peca, i) => i !== index && pecas[i] &&
                pecas[index] && pecas[i].grupo === pecas[index].grupo &&
                peca.linha === posicaoPecas[index].linha &&
                peca.coluna === posicaoPecas[index].coluna);
        }
        return false;
    }
    function verificarECapturarMosqueteiro() {
        let capturaOcorreu = false; // Variável para verificar se houve captura
    
        // Verificar se a peça do grupo 4 não está em qualquer linha da coluna 8
        let impiedosaPresente = false;
        for (let i = 0; i < posicaoPecas.length; i++) {
            if (pecas[i].grupo === 4 && posicaoPecas[i].coluna === 8) {
                impiedosaPresente = true;
                break;
            }
        }
    
        posicaoPecas.forEach((posicao, index) => {
            if (pecas[index].grupo === 1 || pecas[index].grupo === 2) {
                if (estaCercado(posicao, index)) {
                    somCaputura();
                    console.log(`Mosqueteiro na posição (linha ${posicao.linha}, coluna ${posicao.coluna}) foi capturado!`);
                    falarMensagem(`Mosqueteiro na posição (faixa ${posicao.linha}, trilha ${posicao.coluna}) foi capturado!`);
    
                    const remocaoBemSucedida = removerPecaDoTabuleiro(index);
    
                    // Verifique se a remoção foi bem-sucedida
                    if (remocaoBemSucedida) {
                        retiradaImpiedosa([4, 5]);
                        if (grupoAtual === 1) {
                            grupoAtual = 2;
                            movimentoComputador();
                        } else {
                            grupoAtual = 1;
                        }
                    }
                    capturaOcorreu = true; // Se houve captura, definimos como true
                }
    
                if (podeLiberarMatadora(posicao, index)) {
                    // Se o mosqueteiro estiver cercado por três lados, libere o movimento da matadora
                    matadora = true;
                }
    
            }
        });
    
        // Verifica se não houve captura e se a impiedosa não está presente
        if (!capturaOcorreu && !impiedosaPresente) {
            let temPecaNaColuna8 = false; // Variável para verificar se há peça na coluna 8
            let indexPecaNaColuna8 = null; // Índice da peça na coluna 8
    
            // Verificar se há peça do grupo atual na coluna 8
            for (let i = 0; i < posicaoPecas.length; i++) {
                if (pecas[i].grupo === grupoAtual && posicaoPecas[i].coluna === 8) {
                    temPecaNaColuna8 = true;
                    indexPecaNaColuna8 = i;
                    break;
                }
            }
    
            if (temPecaNaColuna8) {
                // Mover a peça da coluna 8 para a posição armazenada da impiedosa
                const posicaoImpiedosaArmazenada = JSON.parse(localStorage.getItem('posicaoImpiedosa'));
                if (posicaoImpiedosaArmazenada) {
                    posicaoPecas[indexPecaNaColuna8] = posicaoImpiedosaArmazenada;
                    console.log(`Movendo peça para posição (linha ${posicaoImpiedosaArmazenada.linha}, coluna ${posicaoImpiedosaArmazenada.coluna})`);
                    falarMensagem('Captura não realizada. Oponente resgatado para o tabuleiro')
                }
            } else {
                console.log('ARRUMAR AINDA MOVIMENTA PEÇA OPONENTE')
            }
    
            retiradaImpiedosa([4, 5]);
    
            const posicaoImpiedosaArmazenada = JSON.parse(localStorage.getItem('posicaoImpiedosa'));
            console.log('a impiedosa estava na:', posicaoImpiedosaArmazenada);
    
    
        }
    }
    
    
    
    
    
    
    


    function retiradaImpiedosa() {
        const novasPosicoes = [...posicaoPecas]; 
    
        novasPosicoes.forEach((posicao, index) => {
            const grupoDaPeca = pecas[index].grupo;
    
            if (grupoDaPeca === 4 || grupoDaPeca === 5) {
                novasPosicoes[index] = { linha: 4, coluna: 8 };
                console.log(`Impiedosa fora do tabuleiro ${index}`);
            }
        });
    
        posicaoPecas = novasPosicoes;
    
        desenharTabuleiro();
    }
    
    

     
    function removerPecaDoTabuleiro(index) {
        let linhaAleatoria = Math.floor(Math.random() * 7) + 1; // Gera um número aleatório entre 1 e 7
    
        // Verifica se a posição aleatória na coluna 8 está ocupada
        for (let i = 0; i < posicaoPecas.length; i++) {
            if (posicaoPecas[i].coluna === 8 && posicaoPecas[i].linha === linhaAleatoria) {
                while (posicaoPecas.some(peca => peca.coluna === 8 && peca.linha === linhaAleatoria)) {
                    linhaAleatoria = Math.floor(Math.random() * 7) + 1;
                }
                break; // Sai do loop assim que uma nova linha válida for encontrada
            }
        }
    
        posicaoPecas[index].linha = linhaAleatoria;
        posicaoPecas[index].coluna = 8;
    
        retiradaImpiedosa();
        desenharTabuleiro();
    }
    
    



    function podeLiberarMatadora(posicao, indexMosqueteiro) {
        const direcoes = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // baixo, direita, cima, esquerda
        let ladosOpostos = 0;
    
        for (let [dx, dy] of direcoes) {
            const linhaAdjacente = posicao.linha + dx;
            const colunaAdjacente = posicao.coluna + dy;
    
            const indexPecaAdjacente = posicaoPecas.findIndex(
                peca => peca.linha === linhaAdjacente && peca.coluna === colunaAdjacente
            );
    
            if (indexPecaAdjacente !== -1 && (pecas[indexPecaAdjacente].grupo === 1 || pecas[indexPecaAdjacente].grupo === 2 || pecas[indexPecaAdjacente].grupo === 4 || pecas[indexPecaAdjacente].grupo === 5)) {
                // Verifica se a peça adjacente é um mosqueteiro adversário
                const posicaoPecaAdjacente = posicaoPecas[indexPecaAdjacente];
                if (!estaCercado(posicaoPecaAdjacente, indexPecaAdjacente)) {
                    ladosOpostos++;
                }
            }
        }
    
        // Se o mosqueteiro estiver cercado por três lados, libera o movimento da matadora
        return ladosOpostos === 3;
    }
    
    
    function estaCercado(posicao, indexPeca) {
        const direcoes = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // Representa as quatro direções: baixo, direita, cima, esquerda
        return direcoes.every(([dx, dy]) => {
            const linhaAdjacente = posicao.linha + dx;
            const colunaAdjacente = posicao.coluna + dy;
            return posicaoPecas.some((pos, i) => {
                return pos.linha === linhaAdjacente &&
                       pos.coluna === colunaAdjacente &&
                       (pecas[i].grupo !== pecas[indexPeca].grupo || pecas[i].grupo === 3 || pecas[indexPeca].grupo === 4|| pecas[indexPeca].grupo === 5); // Verifica se é uma peça adversária ou a matadora
            });
        });
    }
   
    
});
