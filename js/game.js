document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('keydown', (event) => {
        if (event.key === 'i' || event.key === 'I') {
            simularEscolha('1');
        } else if (event.key === 't' || event.key === 'T') {
            simularEscolha('2');
        }
    });

    

    
Swal.fire({
    
    title: 'Choose board position',
    input: 'select',
    inputOptions: {
        '1': 'Bottom',
        '2': 'Top',
    },
    inputPlaceholder: 'start with the musketeers on the',
    showCancelButton: true,
    confirmButtonText: 'Start Game',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
        return new Promise((resolve) => {
            if (value === '1' || value === '2') {
                resolve();
            } else {
                resolve('Choose a valid group.');
            }
        });
    },
}).then((result) => {
    if (result.isConfirmed) {
        simularEscolha(result.value);
        posicionarPecasIniciais(result.value);
        falarMensagem("Your turn, choose a musketeer");
    }
});

function simularEscolha(valor) {
    console.log(`Simulando escolha: ${valor}`);
}



    const canvas = document.getElementById('tabuleiro');
    const ctx = canvas.getContext('2d');
    const tamanhoCelula = 50;
    const linhas = 7;
    const colunas = 7;
    const tabuleiro = Array.from({ length: linhas + 1 }, () => Array(colunas + 1).fill(0));
    const gruposDePecas = { 1: 'blue', 2: 'green', 3: 'purple',  4: 'red', 5: 'yellow'}; 


   
    const pecas = [
        { grupo: 1 }, { grupo: 1 }, { grupo: 1 }, //jogador
        { grupo: 2 }, { grupo: 2 }, { grupo: 2 }, //computador
        { grupo: 3 }, //matadora
        { grupo: 4 }, //impiedosa
        { grupo: 5 }, { grupo: 5 }, { grupo: 5 },{ grupo: 5 },
    ];
    
    let posicaoPecas = [
        { linha: 1, coluna: 1 }, { linha: 2, coluna: 1 }, { linha: 3, coluna: 1 },
        { linha: 4, coluna: 1 }, { linha: 5, coluna: 1 }, { linha: 6, coluna: 1 },
        { linha: 4, coluna: 4 }, // Posição inicial da matadora
        { linha: 0, coluna: 0 }, //impiedosa 2 2 
        {linha: 0, coluna:0},{linha: 0, coluna:0},{linha: 0, coluna:0},{linha: 0, coluna:0},
    ];
    
    let grupoAtual = 1; 
    let movimentoRealizado = false; 
    let pecaSelecionada = 1;
    let utterance;
    let matadora = false;

    let impiedosaColocada = false;



    function falarMensagem(mensagem) {
        if (vozAtivada) {
            if (utterance && typeof utterance.cancel === 'function') {
                utterance.cancel();
            }
    
            utterance = new SpeechSynthesisUtterance(mensagem);
    
            // Defina o idioma para inglês britânico
            utterance.lang = 'en-GB';
    
            speechSynthesis.speak(utterance);
        }
    }
    
    function reproduzirSom(moveNumber) {
        const audio = new Audio(`../som/move${moveNumber}.wav`);
        audio.play();
    }

    function somImpiedosa(){
        const audioImpiedosa = new Audio(`../som/impiedosa.wav`);
        audioImpiedosa.play();
    }

    function somMatadora(){
        const audioMatadora = new Audio(`../som/matadora.wav`);
        audioMatadora.play();
    }

    function somCaputura(){
        const audioCaptura = new Audio(`../som/captura.wav`);
        audioCaptura.play();
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
        falarMensagem("Press 's' to turn off the voice and 's' to turn it back on.")
        desenharTabuleiro();
    }
    
    
    
    
    var contaminjogador = 0;
    var contamincomput= 0;
    
    
    let vozAtivada = true;


    if( vozAtivada == true){
        falarMensagem("Choose board position. Press T to start with the musketeers at the top of the screen. Press I to start with the musketeers at the bottom. Then press enter to play");
    }

    let aguardandoPosicaoImpiedosa = false;
    let posicaoImpiedosaLinha = null;
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
            console.log(`Peça ${pecaSelecionada} selecionada.`);
            falarMensagem(`You chose musketeer ${pecaSelecionada}`);
        } else if (event.key === 'c' || event.key === 'C') {
            falarPosicoesPecasComputador();
        } else if (event.key === 'j' || event.key === 'J') {
            falarPosicoesPecasJogador();
        } else if (event.key === 'e' || event.key === 'E') {
            informarPosicaoMatadoraImpiedosa();
        } else if (event.key === 'i' || event.key === 'I') {
            aguardandoPosicaoImpiedosa = true;
            console.log("Digite a linha e depois a coluna para a peça impiedosa");
            falarMensagem("Enter a number for the stripe and for the track to position the ruthless lady ")
        } else if (event.key === 's' || event.key === 'S') {
            if (vozAtivada) {
                vozAtivada = false;
            } else {
                vozAtivada = true;
                falarMensagem("Voice activated. Press 's' again to deactivate it.");
            }
        } else if (event.key === 'm' || event.key === 'M') {
            matadora = true;
            falarMensagem("You have selected the killer girl. proceed with the capture.");
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
            falarMensagem(`Killer girls is on stripe ${posicaoMatadora.linha}, track ${posicaoMatadora.coluna}.`);
        }
    
        if (indexImpiedosa !== -1) {
            const posicaoImpiedosa = posicaoPecas[indexImpiedosa];
            console.log(`The ruthless lady is on stripe ${posicaoImpiedosa.linha}, track ${posicaoImpiedosa.coluna}.`);
            if(posicaoImpiedosa.linha === 0){
                falarMensagem('The ruthless lady is just waiting for you to capture');

            }else if(posicaoImpiedosa.linha === -1){
                falarMensagem('The ruthless lady is just waiting for you to capture');
                


            }else{
                falarMensagem(`The ruthless lady is on stripe ${posicaoImpiedosa.linha}, track ${posicaoImpiedosa.coluna}.`);
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
                falarMensagem("Movement denied!");

                return false;
            }
        
        // Verificar se a nova posição fecha um cerco
        const cercoFechado = verificarCerco(linha, coluna);
    
        if (!cercoFechado) {
            falarMensagem("Movement denied!");

            return false;
        }
        if(contaminjogador > 4){
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
      
            if (!podeMoverImpiedosa(linha, coluna) ) {
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
    
        falarMensagem(`the ruthless lady movies to stripe ${linha} and track ${coluna}. Procreed to capture.`);
        somImpiedosa();
        mostrarPecasProximas(linha, coluna);
        
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
                } else {
                    console.log("Movimento da matadora negado");
                    falarMensagem("Killer girl's move denied");
                }
            }
        });
        verificarECapturarMosqueteiro();
    }
    

        

    function vaiCercar(linha, coluna) {
        const direcoes = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // baixo, direita, cima, esquerda
        for (let [dx, dy] of direcoes) {
            const linhaAdjacente = linha + dx;
            const colunaAdjacente = coluna + dy;
    
            const indexPecaAdjacente = posicaoPecas.findIndex(
                peca => peca.linha === linhaAdjacente && peca.coluna === colunaAdjacente
            );
    
            if (indexPecaAdjacente !== -1 && (pecas[indexPecaAdjacente].grupo === 1 || pecas[indexPecaAdjacente].grupo === 2)) {
                // Verifica se a peça adjacente será cercada
                const posicaoPecaAdjacente = posicaoPecas[indexPecaAdjacente];
                if (estaCercadoComMatadora(posicaoPecaAdjacente, indexPecaAdjacente, linha, coluna)) {
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
        let mensagem = " ";
        posicaoPecas.forEach((peca, index) => {
            if (pecas[index] && pecas[index].grupo === 1) {
                mensagem += `Musketeer ${index + 1} on stripe ${peca.linha}, and track ${peca.coluna}. `;
            }
        });
        falarMensagem(mensagem);
    }
    
    function falarPosicoesPecasComputador() {
        let mensagem = "";
        posicaoPecas.forEach((peca, index) => {
            if (pecas[index] && pecas[index].grupo === 2) {
                const numeroMosqueteiro = index - Math.floor(pecas.length / 2) + 4;
                mensagem += `Musketeer ${index + 1} on stripe ${peca.linha}, and track ${peca.coluna}. `;
            }
        });
        falarMensagem(mensagem);
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
    
                ctx.fillStyle = tabuleiro[i][j] === 0 ? '#eee' : '#ddd';
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
                    numeroTexto = i + 1; // Mosqueteiros do jogador
                } else if (pecas[i].grupo === 2) {
                    numeroTexto = i - 2; // Mosqueteiros do computador
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
                novaColuna = Math.min(colunas, novaColuna + 1);
                break;
        }

        const indexPosicaoOcupada = posicaoPecas.findIndex(
            peca => peca.linha === novaLinha && peca.coluna === novaColuna
        );

        if (indexPosicaoOcupada !== -1) {
            console.log("Movimento inválido: a célula já está ocupada.");
            const pecaOcupante = pecas[indexPosicaoOcupada];

            if (pecaOcupante.grupo === 3 && indexPosicaoOcupada === 6) {
                falarMensagem("Position occupied by the killer girl.");
            } else if(pecaOcupante.grupo === 2) {
                let numeroPeca;
                if (pecaOcupante.grupo === 2) {
                    numeroPeca = indexPosicaoOcupada - 2;
                } else {
                    numeroPeca = indexPosicaoOcupada + 1;
                }

                falarMensagem(`Position occupied by the musketeer ${numeroPeca} of the computer.`);
            } else if(pecaOcupante.grupo === 1){
                let numeroPeca;
                if (pecaOcupante.grupo === 1) {
                    numeroPeca = indexPosicaoOcupada+1;
                } else {
                    numeroPeca = indexPosicaoOcupada+1;
                }

                falarMensagem(`Position occupied by the player's musketeer ${numberPeca}.`);
            }else if(pecaOcupante.grupo === 4 || pecaOcupante.grupo === 5){

                falarMensagem(`Position occupied by the ruthless.`);
            }else{
                falarMensagem("Move denied. You cannot escape the board");
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
                    falarMensagem(`You moved musketeer ${pecaSelecionada}  to stripe ${novaLinha}, track ${novaColuna}`);
                    console.log(`Jogador moveu Linha ${novaLinha}, Coluna ${novaColuna}`);
                    console.log(contamincomput);
                }
                else{
                    contamincomput +=1;
                    falarMensagem(`Computer chose musketeer  ${pecaSelecionada -3} and movied it to stripe ${posicaoPecas[indexPeca].linha}, and track ${posicaoPecas[indexPeca].coluna}.`);
                    console.log(`Computador moveu para Linha ${posicaoPecas[indexPeca].linha}, Coluna ${posicaoPecas[indexPeca].coluna}.`)
                }

                movimentoRealizado = true;
                setTimeout(() => {
                    movimentoRealizado = false;
                    grupoAtual = (grupoAtual % 2) + 1;

                    if (grupoAtual === 2) {
                        movimentoComputador();
                    } else {
                        falarMensagem("Your turm");
                    }
                }, 1000);
            }
        }
    }
    verificarECapturarMosqueteiro();
}

function movimentoComputador() {
    const pecasMoveis = posicaoPecas
        .map((peca, index) => ({ index, peca }))
        .filter(({ index, peca }) => pecas[index].grupo === 2 && !bloqueada(index));

    if (pecasMoveis.length > 0) {
        const pecaEscolhida = pecasMoveis[Math.floor(Math.random() * pecasMoveis.length)];
        pecaSelecionada = pecaEscolhida.index + 1;

        console.log(`Computer chose piece number ${pecaSelecionada - 3}`);
        const direcoesPossiveis = [];
        const { linha, coluna } = pecaEscolhida.peca;

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
            console.log(`The piece númber ${pecaSelecionada - 3} is blocked. Choosing another piece.`);
            movimentoComputador(); // Escolhe outra peça se a escolhida está bloqueada
        }
    }
    verificarECapturarMosqueteiro();
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
        posicaoPecas.forEach((posicao, index) => {
            if (pecas[index].grupo === 1 || pecas[index].grupo === 2) {
                if (estaCercado(posicao, index)) {
                    somCaputura();
                    console.log(`Mosqueteiro na posição (linha ${posicao.linha}, coluna ${posicao.coluna}) foi capturado!`);
                    falarMensagem(`Musketeer at position stripe ${posicao.linha}, track ${posicao.coluna} has been captured!`);
                    
                    const remocaoBemSucedida = removerPecaDoTabuleiro(index);

                    // Verifique se a remoção foi bem-sucedida
                    if (remocaoBemSucedida) {
                        console.log(`A peça foi removida com sucesso!`);
                        retiradaImpiedosa([4,5]);
                        if(grupoAtual === 1){
                            grupoAtual = 2;
                            movimentoComputador();
                        }else{
                            grupoAtual = 1;
                        }
                    } else {
                        console.log(`Falha ao remover a peça!`);
                    }
                   
                }
    
                if (podeLiberarMatadora(posicao, index)) {
                    // Se o mosqueteiro estiver cercado por três lados, libere o movimento da matadora
                    console.log(`Mosqueteiro na posição (linha ${posicao.linha}, coluna ${posicao.coluna}) está cercado por três lados. Movimento da matadora liberado!`);
                    falarMensagem(`Musketeer at position stripe ${posicao.linha}, track ${posicao.coluna}) it is surrounded on three sides. Killer girl movement released!`);
                    matadora = true;
                }

            }
            
        });

    }
    
    



    function retiradaImpiedosa() {
        posicaoPecas.forEach((posicao, index) => {
            const grupoDaPeca = pecas[index].grupo;
    
            // Verifica se a peça pertence aos grupos 4 ou 5
            if (grupoDaPeca === 4 || grupoDaPeca === 5) {
                posicaoPecas[index] = { linha: -1, coluna: -1 };
                console.log(`Impiedosa (linha -1, coluna -1) movida para o índice ${index}`);
            }
        });
    
        // Atualiza o tabuleiro após mover as peças
        desenharTabuleiro();
    }
    
    

     
    function removerPecaDoTabuleiro(index) {
        // Remove a peça do tabuleiro. A lógica exata dependerá de como seu tabuleiro e peças são gerenciados.
        posicaoPecas.splice(index, 1);
        pecas.splice(index, 1);
        // Atualize o tabuleiro para refletir a remoção da peça
        desenharTabuleiro();
        return true;
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
    
            if (indexPecaAdjacente !== -1 && (pecas[indexPecaAdjacente].grupo === 1 || pecas[indexPecaAdjacente].grupo === 2)) {
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
                       (pecas[i].grupo !== pecas[indexPeca].grupo || pecas[i].grupo === 3); // Verifica se é uma peça adversária ou a matadora
            });
        });
    }
   
    
});
