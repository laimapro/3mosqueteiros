document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('keydown', (event) => {
        if (event.key === 'b' || event.key === 'B') {
            chooseBoardPosition('1');
        } else if (event.key === 't' || event.key === 'T') {
            chooseBoardPosition('2');
        }
    });

    

    
Swal.fire({
    
    title: 'Choose board position',
    input: 'select',
    inputOptions: {
        '1': 'Bottom',
        '2': 'Top',
    },
    inputPlaceholder: 'start  game with the musketeers on the',
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
        chooseBoardPosition(result.value);
        placepiecesatStart(result.value);
        speakMessage("Your turn, choose a musketeer");
    }
});

function chooseBoardPosition(valor) {
    console.log(`choose board Position: ${valor}`);
}



    const canvas = document.getElementById('tabuleiro');
    const ctx = canvas.getContext('2d');
    const cellSize = 50;
    const rows = 7;
    const columns = 7;
    const board = Array.from({ length: rows + 1 }, () => Array(columns + 1).fill(0));
    const groupPieces = { 1: 'blue', 2: 'green', 3: 'purple',  4: 'red', 5: 'yellow'}; 
    let isMuted = false; // Variável para controlar o estado de silenciamento


   
    const pieces = [
        { group: 1 }, { group: 1 }, { group: 1 }, //jogador
        { group: 2 }, { group: 2 }, { group: 2 }, //computador
        { group: 3 }, //killerGirl
        { group: 4 }, //impiedosa
        { group: 5 }, { group: 5 }, { group: 5 },{ group: 5 },
    ];
    
    let positionPieces = [
        { row: 1, column: 1 }, { row: 2, column: 1 }, { row: 3, column: 1 },
        { row: 4, column: 1 }, { row: 5, column: 1 }, { row: 6, column: 1 },
        { row: 4, column: 4 }, // Posição inicial da killerGirl
        { row: 0, column: 0 }, //impiedosa 2 2 
        {row: 0, column:0},{row: 0, column:0},{row: 0, column:0},{row: 0, column:0},
    ];
    
    let currentgroup = 1; 
    let movementExecuted = false; 
    let pieceSelected = 1;
    let utterance;
    let killerGirl = false;

    let ruthlessLadyPlaced = false;



    function speakMessage(message) {
        if (VoiceActivated) {
            if (utterance && typeof utterance.cancel === 'function') {
                utterance.cancel();
            }
    
            utterance = new SpeechSynthesisUtterance(message);
    
            // Defina o idioma para inglês britânico
            utterance.lang = 'en-GB';
    
            speechSynthesis.speak(utterance);
        }
    }
    
    function playSound(moveNumber) {
        if (!isMuted) {
            const audio = new Audio(`../som/move${moveNumber}.wav`);
            audio.play();
        }
    }

    function soundRuthless(){
        if (!isMuted) {
            const audioImpiedosa = new Audio(`../som/impiedosa.wav`);
            audioImpiedosa.play();
        }
    }

    function soundKillerGirl(){
        if (!isMuted) {
            const audioMatadora = new Audio(`../som/matadora.wav`);
            audioMatadora.play();
        }
    }

    function SoundCapture(){
        if (!isMuted) {
            const audioCaptura = new Audio(`../som/captura.wav`);
            audioCaptura.play();
        }
    }
    function placepiecesatStart(groupChosen) {
        if (groupChosen === '1') {
            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i].group === 1) {
                    positionPieces[i] = { row: 7, column: i + 3 };
                } else if (pieces[i].group === 2) {
                    positionPieces[i] = { row: 1, column: (i % 3) + 3 };
                }
            }
        } else if (groupChosen === '2') {
            for (let i = 0; i < pieces.length; i++) {
                if (pieces[i].group === 1) {
                    positionPieces[i] = { row: 1, column: (i % 3) + 3 };
                } else if (pieces[i].group === 2) {
                    positionPieces[i] = { row: 7, column: (i % 3) + 3 };
                }
            }
        }
        speakMessage("Press 's' to turn off the voice and 's' to turn it back on.")
        drawBoard();
    }
    
    
    
    
    var minimumplayeraccount = 0;
    var minimumcomputeraccount= 0;
    
    
    let VoiceActivated = true;


    if( VoiceActivated == true){
        speakMessage("Choose board position. Press T to start game with the musketeers at the top of the screen. Press B to start game with the musketeers at the bottom. Then press enter to play");
    }

    let awaitingruthlessLadyPosition = false;
    let positionRuthlessLine = null;
    document.addEventListener('keydown', (event) => {
        if (awaitingruthlessLadyPosition) {
            if (!isNaN(parseInt(event.key, 10))) {
                const num = parseInt(event.key, 10);
                if (positionRuthlessLine === null) {
                    positionRuthlessLine = num;
                    console.log(`chosen row: ${num}. Now type the column.`);
                } else {
                    moveRuthlessLady(positionRuthlessLine, num);
                    awaitingruthlessLadyPosition = false;
                    positionRuthlessLine = null;
                }
            }
            return; 
        }

        speechSynthesis.cancel();
        utterance = null;

        if (event.key.startsWith('Arrow') && !movementExecuted) {
            movePiece(event.key);
        } else if (event.key >= '1' && event.key <= '3') {
            pieceSelected = parseInt(event.key, 10);
            console.log(`${pieceSelected} piece selected.`);
            speakMessage(`You chose musketeer ${pieceSelected}`);
        } else if (event.key === 'c' || event.key === 'C') {
            talkPositionsPartsComputer();
        } else if (event.key === 'p' || event.key === 'P') {
            talkPositionsPecasPlayer();
        } else if (event.key === 'e' || event.key === 'E') {
            informRuthlessLadyAndKillerGirlPosition();
        } else if (event.key === 'r' || event.key === 'R') {
            awaitingruthlessLadyPosition = true;
            console.log("Digite a row e depois a column para a peça impiedosa");
            speakMessage("Enter a number for the strip and for the track to position the ruthless lady ")
        } else if (event.key === 's' || event.key === 'S') {
            if (VoiceActivated) {
                VoiceActivated = false;
            } else {
                VoiceActivated = true;
                speakMessage("Voice activated. Press 's' again to deactivate it.");
            }
        } else if (event.key === 'k' || event.key === 'K') {
            killerGirl = true;
            speakMessage("You have selected the killer girl. proceed with the capture.");
        }else if (event.key === 'q' || event.key === 'Q') {
            isMuted = !isMuted; 
            if(isMuted === false){
                speakMessage(`audios activated`);
            }else{
                speakMessage(`audios disabled`);
            }

        }

        if (killerGirl && event.key.startsWith('Arrow')) {
            movimentKillerGirl(event.key);
            killerGirl = false;
        }
    });
    
    function informRuthlessLadyAndKillerGirlPosition() {
        const indexkillergirl = pieces.findIndex(piece => piece.group === 3);
        const indexRuthless = pieces.findIndex(piece => piece.group === 4);
    
        if (indexkillergirl !== -1) {
            const posicaoMatadora = positionPieces[indexkillergirl];
            console.log(`Killer girls is on strip ${posicaoMatadora.row}, track ${posicaoMatadora.column}.`);
            speakMessage(`Killer girls is on strip ${posicaoMatadora.row}, track ${posicaoMatadora.column}.`);
        }
    
        if (indexRuthless !== -1) {
            const ruthlessLadyposition = positionPieces[indexRuthless];
            console.log(`The ruthless lady is on strip ${ruthlessLadyposition.row}, track ${ruthlessLadyposition.column}.`);
            if(ruthlessLadyposition.row === 0){
                speakMessage('The ruthless lady is just waiting for you to capture');

            }else if(ruthlessLadyposition.row === -1){
                speakMessage('The ruthless lady is just waiting for you to capture');
                


            }else{
                speakMessage(`The ruthless lady is on strip ${ruthlessLadyposition.row}, track ${ruthlessLadyposition.column}.`);
            }
            
        }
    }
    


    function canMoveruthless(row, column) {
     
        // Verificar se a nova posição está ocupada por outra peça
        const indexOccupiedPosition = positionPieces.findIndex(
            piece => piece.row === row && piece.column === column
        );
       
            if (indexOccupiedPosition !== -1) {
                console.log("Invalid movement: cell is already occupied.");
                speakMessage("Movement denied!");

                return false;
            }
        
        const siegeClosed = checksiege(row, column);
    
        if (!siegeClosed) {
            speakMessage("Movement denied!");

            return false;
        }
        if(minimumplayeraccount > 4){
            return true; 
         }
    }
    
    function showPlacesNext(row, column) {
        console.log(`-------------------------------------Pieces close to Merciless in the requested position (${row}, ${column}):`);
    
        for (let i = row - 2; i <= row + 2; i++) {
            for (let j = column - 2; j <= column + 2; j++) {
                const indexPiece = positionPieces.findIndex(
                    piece => piece.row === i && piece.column === j
                );
    
                if (indexPiece !== -1) {
                    const grupoPeca = pieces[indexPiece].group;
                    console.log(`group ${grupoPeca} na row ${i}, column ${j}`);
                }
            }
        }
    }
    

    function moveRuthlessLady(row, column) {
        const indexRuthless = pieces.findIndex(piece => piece.group === 4);
    
        showPlacesNext(row, column);
    
      
            if (!canMoveruthless(row, column) ) {
                return;
                
            }
        
        
        positionPieces[indexRuthless] = { row: row, column: column };
        drawBoard();
    
        const diagonals = calculateDiagonals(row, column);
    
        diagonals.forEach(celula => {
            console.log(`row: ${celula.row}, column: ${celula.column}`);
    
            const indexDiagonal = positionPieces.findIndex(
                piece => piece.row === celula.row && piece.column === celula.column
            );
    
            if (indexDiagonal === -1) {
                positionPieces.push({ row: celula.row, column: celula.column });
                pieces.push({ group: 5 });
            }
        });
    
        speakMessage(`the ruthless lady movies to strip ${row} and track ${column}. Procreed to capture.`);
        soundRuthless();
        showPlacesNext(row, column);
        
    } 
    
    


function calculateDiagonals(row, column) {
    const diagonals = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // upper and lower diagonals

    directions.forEach(([dx, dy]) => {
        let currentline = row + dx;
        let currentcolumn = column + dy;

        if (currentline >= 1 && currentline <= rows && currentcolumn >= 1 && currentcolumn <= columns) {
            diagonals.push({ row: currentline, column: currentcolumn });
        }
    });

    return diagonals;
}

function checksiege(row, column) {
    const adjacencias = [
        { row: row - 1, column: column },
        { row: row + 1, column: column },
        { row: row, column: column - 1 },
        { row: row, column: column + 1 }
    ];

    let counterPieces = 0;

    adjacencias.forEach(adjacente => {
        const indexAdjacent = positionPieces.findIndex(
            piece => piece.row === adjacente.row && piece.column === adjacente.column
        );

        if (indexAdjacent !== -1) {
            counterPieces++;
        }
    });

    if (row === 1 || row === rows || column === 1 || column === columns) {
        return counterPieces >= 2; 
    }

    return counterPieces >= 1;
}
    
    
    function movimentKillerGirl(direction) {
        positionPieces.forEach((position, index) => {
            if (pieces[index].group === 3) { 
                let newLine = position.row;
                let newColumn = position.column;
    
                switch (direction) {
                    case 'ArrowUp':
                        newLine = Math.max(1, position.row - 1);
                        break;
                    case 'ArrowDown':
                        newLine = Math.min(rows, position.row + 1);
                        break;
                    case 'ArrowLeft':
                        newColumn = Math.max(1, position.column - 1);
                        break;
                    case 'ArrowRight':
                        newColumn = Math.min(columns, position.column + 1);
                        break;
                }
    
                const positionoccupied = positionPieces.some(
                    piece => piece.row === newLine && piece.column === newColumn
                );
    
                if (!positionoccupied && ItWillSurround(newLine, newColumn)) {
                    position.row = newLine;
                    position.column = newColumn;
                    soundKillerGirl();
                    drawBoard();
                } else {
                    speakMessage("Killer girl's move denied");
                }
            }
        });
        checkAndCaptureMusketeer();
    }
    

        

    function ItWillSurround(row, column) {
        const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]; 
        for (let [dx, dy] of directions) {
            const lineAdjacent = row + dx;
            const columnAdjacent = column + dy;
    
            const indexPieceAdjacent = positionPieces.findIndex(
                piece => piece.row === lineAdjacent && piece.column === columnAdjacent
            );
    
            if (indexPieceAdjacent !== -1 && (pieces[indexPieceAdjacent].group === 1 || pieces[indexPieceAdjacent].group === 2)) {
                const positionPieceAdjacent = positionPieces[indexPieceAdjacent];
                if (thisSurroundedWithKillerGirl(positionPieceAdjacent, indexPieceAdjacent, row, column)) {
                    return true; 
                }
            }
        }
        return false;
    }
    
    function thisSurroundedWithKillerGirl(position, indexPiece, lineKillerGirl, columnKillerGirl) {
        const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        return directions.every(([dx, dy]) => {
            const lineAdjacent = position.row + dx;
            const columnAdjacent = position.column + dy;
    
            if (lineAdjacent === lineKillerGirl && columnAdjacent === columnKillerGirl) {
                return true;
            }
    
            return positionPieces.some((pos, i) => {
                return pos.row === lineAdjacent &&
                       pos.column === columnAdjacent &&
                       pieces[i].group !== pieces[indexPiece].group;
            });
        });
    }
    
    
    
    
    function talkPositionsPecasPlayer() {
        let message = " ";
        positionPieces.forEach((piece, index) => {
            if (pieces[index] && pieces[index].group === 1) {
                message += `Musketeer ${index + 1} on strip ${piece.row}, and track ${piece.column}. `;
            }
        });
        speakMessage(message);
    }
    
    function talkPositionsPartsComputer() {
        let message = "";
        positionPieces.forEach((piece, index) => {
            if (pieces[index] && pieces[index].group === 2) {
                const numberMusketeer = index - Math.floor(pieces.length / 2) + 4;
                message += `Musketeer ${index + 1} on strip ${piece.row}, and track ${piece.column}. `;
            }
        });
        speakMessage(message);
    }
    
    
    function pieceBlocked(index) {
        if (index !== undefined && positionPieces[index]) {
            return blocked(index);
        }
        return true;
    }
    
    
    
    
    
    function drawBoard() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 6;
    
        for (let i = 1; i <= rows; i++) {
            for (let j = 1; j <= columns; j++) {
                const x = (j - 1) * cellSize;
                const y = (i - 1) * cellSize;
    
                ctx.fillStyle = board[i][j] === 0 ? '#eee' : '#ddd';
                ctx.fillRect(x, y, cellSize, cellSize);
    
                ctx.strokeStyle = '#000';
                ctx.strokeRect(x, y, cellSize, cellSize);
            }
        }
    
        for (let i = 0; i < pieces.length; i++) {
            if (positionPieces[i].row !== -1 && positionPieces[i].column !== -1) {
                const xPiece = (positionPieces[i].column - 1) * cellSize + cellSize / 2;
                const yPiece = (positionPieces[i].row - 1) * cellSize + cellSize / 2;
    
                if (pieces[i].group === 4) {
                    drawHeart(xPiece, yPiece, cellSize * 0.6);
                } else if (pieces[i].group !== 5) {
                    ctx.fillStyle = groupPieces[pieces[i].group];
                    ctx.beginPath();
                    ctx.arc(xPiece, yPiece, cellSize / 2 - 5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                }
    
                ctx.font = '20px Arial';
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
    
                let numberText;
                if (pieces[i].group === 1) {
                    numberText = i + 1; 
                } else if (pieces[i].group === 2) {
                    numberText = i - 2; 
                } else if (pieces[i].group === 3) {
                    numberText = 'K'; // killerGirl
                } else if (pieces[i].group === 4) {
                    numberText = ''; 
                } else {
                    numberText = ''; 
                }
    
                ctx.fillText(numberText, xPiece, yPiece);
            }
        }
    }
    
    
 
    function drawHeart(x, y, size) {
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        x -= size * 0.4;
        y -= size * 0.4;
    
        ctx.moveTo(x, y + topCurveHeight);
        // Top left curve
        ctx.bezierCurveTo(
            x, y, 
            x - size / 2, y, 
            x - size / 2, y + topCurveHeight
        );
    
        // Bottom left curve
        ctx.bezierCurveTo(
            x - size / 2, y + (size + topCurveHeight) / 2, 
            x, y + (size + topCurveHeight) / 2, 
            x, y + size
        );
    
        // Bottom right curve
        ctx.bezierCurveTo(
            x, y + (size + topCurveHeight) / 2, 
            x + size / 2, y + (size + topCurveHeight) / 2, 
            x + size / 2, y + topCurveHeight
        );
    
        // Top right curve
        ctx.bezierCurveTo(
            x + size / 2, y, 
            x, y, 
            x, y + topCurveHeight
        );
    
        ctx.closePath();
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.stroke();
    }
    
    function movePiece(direction) {
        const indexPiece = pieceSelected - 1; 

    if (indexPiece !== -1 && pieces[indexPiece].group === currentgroup) {
        let newLine = positionPieces[indexPiece].row;
        let newColumn = positionPieces[indexPiece].column;

        switch (direction) {
            case 'ArrowUp':
                newLine = Math.max(1, newLine - 1);
                break;
            case 'ArrowDown':
                newLine = Math.min(rows, newLine + 1);
                break;
            case 'ArrowLeft':
                newColumn = Math.max(1, newColumn - 1);
                break;
            case 'ArrowRight':
                newColumn = Math.min(columns, newColumn + 1);
                break;
        }

        const indexOccupiedPosition = positionPieces.findIndex(
            piece => piece.row === newLine && piece.column === newColumn
        );

        if (indexOccupiedPosition !== -1) {
            const pieceOccupant = pieces[indexOccupiedPosition];

            if (pieceOccupant.group === 3 && indexOccupiedPosition === 6) {
                speakMessage("Position occupied by the killer girl.");
            } else if(pieceOccupant.group === 2) {
                let numberPiece;
                if (pieceOccupant.group === 2) {
                    numberPiece = indexOccupiedPosition - 2;
                } else {
                    numberPiece = indexOccupiedPosition + 1;
                }

                speakMessage(`Position occupied by the musketeer ${numberPiece} of the computer.`);
            } else if(pieceOccupant.group === 1){
                let numberPiece;
                if (pieceOccupant.group === 1) {
                    numberPiece = indexOccupiedPosition+1;
                } else {
                    numberPiece = indexOccupiedPosition+1;
                }

                speakMessage(`Position occupied by the player's musketeer ${numberPiece}.`);
            }else if(pieceOccupant.group === 4 || pieceOccupant.group === 5){

                speakMessage(`Position occupied by the ruthless.`);
            }else{
                speakMessage("Move denied. You cannot escape the board");
            }


            return;
        }
        if (
            newLine !== positionPieces[indexPiece].row ||
            newColumn !== positionPieces[indexPiece].column
        ) {
            const newPositionOccupied = positionPieces.some(
                (piece, i) =>
                    i !== indexPiece &&
                    piece &&
                    pieces[i] &&
                    pieces[indexPiece] &&
                    pieces[i].group === pieces[indexPiece].group &&
                    piece.row === newLine &&
                    piece.column === newColumn
            );

            const positionOccupiedByGroup2 = positionPieces.some(
                (piece, i) =>
                    piece &&
                    pieces[i] &&
                    pieces[i].group === 2 &&
                    piece.row === newLine &&
                    piece.column === newColumn
            );

            if (!newPositionOccupied && !positionOccupiedByGroup2) {
                positionPieces[indexPiece].row = newLine;
                positionPieces[indexPiece].column = newColumn;

                playSound(currentgroup);
                drawBoard();

                if(currentgroup === 1){
                    minimumplayeraccount +=1;
                    speakMessage(`You moved musketeer ${pieceSelected}  to strip ${newLine}, track ${newColumn}`);
                    console.log(minimumcomputeraccount);
                }
                else{
                    minimumcomputeraccount +=1;
                    speakMessage(`Computer chose musketeer  ${pieceSelected -3} and movied it to strip ${positionPieces[indexPiece].row}, and track ${positionPieces[indexPiece].column}.`);
                }

                movementExecuted = true;
                setTimeout(() => {
                    movementExecuted = false;
                    currentgroup = (currentgroup % 2) + 1;

                    if (currentgroup === 2) {
                        movementComputer();
                    } else {
                        speakMessage("Your turm");
                    }
                }, 1000);
            }
        }
    }
    checkAndCaptureMusketeer();
}

function movementComputer() {
    const FurniturePieces = positionPieces
        .map((piece, index) => ({ index, piece }))
        .filter(({ index, piece }) => pieces[index].group === 2 && !blocked(index));

    if (FurniturePieces.length > 0) {
        const pieceChosen = FurniturePieces[Math.floor(Math.random() * FurniturePieces.length)];
        pieceSelected = pieceChosen.index + 1;

        console.log(`Computer chose piece number ${pieceSelected - 3}`);
        const possibleDirections = [];
        const { row, column } = pieceChosen.piece;

        if (row > 1 && !positionOccupied(row - 1, column)) {
            possibleDirections.push('ArrowUp');
        }
        if (row < rows && !positionOccupied(row + 1, column)) {
            possibleDirections.push('ArrowDown');
        }
        if (column > 1 && !positionOccupied(row, column - 1)) {
            possibleDirections.push('ArrowLeft');
        }
        if (column < columns && !positionOccupied(row, column + 1)) {
            possibleDirections.push('ArrowRight');
        }

        if (possibleDirections.length > 0) {
            const direcaoEscolhida = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
            movePiece(direcaoEscolhida);
        } else {
            console.log(`The piece númber ${pieceSelected - 3} is blocked. Choosing another piece.`);
            movementComputer(); 
        }
    }
    checkAndCaptureMusketeer();
}



    
        function positionOccupied(row, column) {
            return positionPieces.some((piece) => piece && piece.row === row && piece.column === column);
        }

    

    function blocked(index) {
        if (index !== undefined && positionPieces[index]) {
            return positionPieces.some((piece, i) => i !== index && pieces[i] &&
                pieces[index] && pieces[i].group === pieces[index].group &&
                piece.row === positionPieces[index].row &&
                piece.column === positionPieces[index].column);
        }
        return false;
    }

    
    function checkAndCaptureMusketeer() {
        positionPieces.forEach((position, index) => {
            if (pieces[index].group === 1 || pieces[index].group === 2) {
                if (thissurrounded(position, index)) {
                    SoundCapture();
                    speakMessage(`Musketeer at position strip ${position.row}, track ${position.column} has been captured!`);
                    
                    const successfulRemoval = removePieceFromBoard(index);

                    // Check if the removal was successful
                    if (successfulRemoval) {
                        console.log(`The piece was removed successfully!`);
                        rethlessLadyWithdrawal([4,5]);
                        if(currentgroup === 1){
                            currentgroup = 2;
                            movementComputer();
                        }else{
                            currentgroup = 1;
                        }
                    } else {
                        console.log(`Failed to remove piece!`);
                    }
                   
                }
    
                if (canReleaseKillerGirl(position, index)) {
                    // If the musketeer is surrounded on three sides, release killerGirl's movement
                    speakMessage(`Musketeer at position strip ${position.row}, track ${position.column}) it is surrounded on three sides. Killer girl movement released!`);
                    killerGirl = true;
                }

            }
            
        });

    }
    
    



    function rethlessLadyWithdrawal() {
        positionPieces.forEach((position, index) => {
            const groupofthepiece = pieces[index].group;
    
            if (groupofthepiece === 4 || groupofthepiece === 5) {
                positionPieces[index] = { row: -1, column: -1 };
                console.log(`Ruthless Lady (row -1, column -1) moved to index ${index}`);
            }
        });
    
        drawBoard();
    }
    
    

     
    function removePieceFromBoard(index) {
        positionPieces.splice(index, 1);
        pieces.splice(index, 1);
        drawBoard();
        return true;
    }




    function canReleaseKillerGirl(position, indexMusketeer) {
        const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]]; 
        let oppositeSides = 0;
    
        for (let [dx, dy] of directions) {
            const lineAdjacent = position.row + dx;
            const columnAdjacent = position.column + dy;
    
            const indexPieceAdjacent = positionPieces.findIndex(
                piece => piece.row === lineAdjacent && piece.column === columnAdjacent
            );
    
            if (indexPieceAdjacent !== -1 && (pieces[indexPieceAdjacent].group === 1 || pieces[indexPieceAdjacent].group === 2)) {
                const positionPieceAdjacent = positionPieces[indexPieceAdjacent];
                if (!thissurrounded(positionPieceAdjacent, indexPieceAdjacent)) {
                    oppositeSides++;
                }
            }
        }
    
        return oppositeSides === 3;
    }
    
    
    function thissurrounded(position, indexPiece) {
        const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        return directions.every(([dx, dy]) => {
            const lineAdjacent = position.row + dx;
            const columnAdjacent = position.column + dy;
            return positionPieces.some((pos, i) => {
                return pos.row === lineAdjacent &&
                       pos.column === columnAdjacent &&
                       (pieces[i].group !== pieces[indexPiece].group || pieces[i].group === 3); 
            });
        });
    }
   
    
});
