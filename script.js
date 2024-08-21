const socket = io()


const chessboard = document.querySelector(".chessboard")
const msgbox = document.querySelector(".replace")
const startGame = document.querySelector("#play")
const netLabel = document.querySelector("#network")
const timelabel = document.getElementById("time")



let selectedCell = null;
let selectedPiece = null;
let playChance = "white"
let roomName = null
let oddOrEven = 0

startGame.addEventListener('click', () => {
    netLabel.innerHTML = "Searching..."
    socket.emit("joinRoom", roomName)
});

socket.on("StartGame", (data) => {
    roomName = data
    netLabel.innerHTML = "Active game"
})

// socket.on("roomIsFull", (data) => {
//     alert(data)
// })

// if the clients side receive this message it will have to rotate the board indicating that this client is th black one
socket.on("side", (data) => {
    playChance = data

    if (data === "black") {
        chessboard.style.transform = 'rotateX(180deg)'
        chessboard.querySelectorAll(".cell").forEach(cell => {
            cell.style.transform = 'rotateX(180deg)'
            cell.background = "red"
        })
    }
});

// piece movement from the opponet
socket.on("updateBoard", (data) => {
    row = data[0]
    col = data[1]

    let initialRow = data[3]
    let initialCol = data[4]

    const currentCell = getCell(row, col)
    const initialCell = getCell(initialRow, initialCol)


    if (currentCell.firstElementChild) {
        currentCell.innerHTML = ""


    }
    console.log(currentCell.children)
    if (currentCell.children.length === 0) {
        currentCell.appendChild(initialCell.firstElementChild)
    }
})

socket.on("startTimer", (data) => {
    alert("")
    let startTime = 10
    let time = startTime * 60

    let funct = setInterval(timer, 1000)

    function timer() {
        minutes = Math.floor(time / 60)
        seconds = time % 60

        timelabel.innerHTML = `${minutes}:${seconds}`

        if (minutes === 0 && seconds === 0) {
            clearInterval(funct);
        }

        time--;
    }
})









const pieces = {
    'bpawn': '../pieces/bpawn.png',
    'wpawn': '../pieces/wpawn.png',
    'brook': '../pieces/brook.png',
    'wrook': '../pieces/wrook.png',
    'bknight': '../pieces/bknight.png',
    'wknight': '../pieces/wknight.png',
    'bbishop': '../pieces/bbishop.png',
    'wbishop': '../pieces/wbishop.png',
    'bqueen': '../pieces/bqueen.png',
    'wqueen': '../pieces/wqueen.png',
    'bking': '../pieces/bking.png',
    'wking': '../pieces/wking.png',
};




// Creating a chessbord
for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
        const cell = document.createElement('div');

        cell.classList.add('cell', (i + j) % 2 === 0 ? 'white' : 'black');
        chessboard.appendChild(cell)

        cell.setAttribute('data-row', i)
        cell.setAttribute('data-col', j)

        const piece = determinePiece(i, j);

        if (piece) {

            const img = document.createElement('img');
            img.src = piece;
            img.alt = checkPieceColor(piece);
            img.setAttribute("piece-type", checkPieceType(piece))

            if (i === 0 && j === 6 || i === 7 && j === 6) {
                img.style.transform = 'rotateY(180deg)'
            }


            if (piece === '../pieces/bpawn.png' || piece === '../pieces/wpawn.png') {
                img.style.width = "50%"
                img.style.marginTop = "20px"
            }
            else if (piece === '../pieces/bbishop.png' || piece === '../pieces/wbishop.png') {
                img.style.width = "80%"
                img.style.marginTop = "1px"
            }
            else if (piece === '../pieces/bqueen.png' || piece === '../pieces/wqueen.png' || piece === '../pieces/bking.png' || piece === '../pieces/wking.png') {
                img.style.width = "80%"
                img.style.marginTop = "5px"
            }

            cell.appendChild(img)
        }
        cell.addEventListener('click', () => {

            if (cell.children.length > 0 && cell.firstElementChild.alt === playChance) {

                highlightcell(cell)


            }
            else {

                if (selectedPiece) {
                    console.log(cell.classList[2])
                    if (cell.classList[2] === "highlight" || cell.classList[2] === "highlighttake") {
                        console.log(cell.classList)
                        move(cell)
                    }
                    else {
                        selectedCell.classList.toggle('selected')
                        selectedCell = null
                        selectedPiece = null
                        clearHighlights()


                    }
                }


            }
        })
    }
}
function highlightcell(cell) {

    // if the cell is pressed again it needs to deactivate
    if (selectedCell === cell) {
        cell.classList.toggle('selected')
        selectedCell = null
        selectedPiece = null
        clearHighlights()


    }
    // this would check if a different cell is clicked after another
    else {
        if (selectedCell) {
            selectedCell.classList.toggle('selected')
            if (cell.firstElementChild) {
                cell.classList.toggle('selected')
                selectedCell = cell
                selectedPiece = null
                possiblemoves(cell)

            }

        }
        // first click and activation
        else if (cell.firstElementChild) {
            cell.classList.toggle('selected')
            selectedCell = cell
            possiblemoves(cell)

        }

    }
    // we check if there is a selected cell to assing the piece
    if (selectedPiece === null && selectedCell) {
        selectedPiece = cell.firstElementChild

    }
}


function move(cell) {
    selectedCell.classList.toggle('selected')
    //take the opponents piece

    if (cell.firstElementChild) {
        cell.innerHTML = ""
    }

    if (selectedPiece && cell.firstElementChild === null) {


        cell.appendChild(selectedPiece)

        let row = parseInt(cell.getAttribute('data-row'))
        let col = parseInt(cell.getAttribute('data-col'))

        let piece = null

        if (cell.children.length > 0) {
            piece = cell.firstElementChild
        }
        let initRow = parseInt(selectedCell.getAttribute('data-row'))
        let initCol = parseInt(selectedCell.getAttribute('data-col'))


        socket.emit("movedPiece", [row, col, roomName, initRow, initCol])
        // reset variables

        if (row == 0 && cell.firstElementChild.getAttribute("piece-type") === "pawn") {

            msgbox.style.display = "block"
            document.querySelectorAll(".change").forEach(img => {
                function changer() {
                    cell.innerHTML = ""
                    msgbox.style.display = "none"
                    cell.append(img)
                    img.removeEventListener("click", changer)
                }
                img.addEventListener("click", changer)

            })


        }
        if (row == 7 && cell.firstElementChild.getAttribute("piece-type") === "king") {
            let forwadCell = getCell(row + 1, col)
            let secondCell = getCell(row - 1, col)

            if (forwadCell) {
                secondCell.append(forwadCell.firstElementChild)
            }
        }
        selectedPiece = null
        selectedCell = null
        clearHighlights()
    }
}
function possiblemoves(cell) {
    clearHighlights()

    let row = parseInt(cell.getAttribute('data-row'))
    let col = parseInt(cell.getAttribute('data-col'))


    let pieceColorType = cell.firstElementChild.alt
    let pieceType = cell.firstElementChild.getAttribute("piece-type")


    //pawn movement 
    if (row > 0 && pieceType === 'pawn' && pieceColorType === 'white') {
        const forwadCell = getCell(row - 1, col)
        if (forwadCell.children.length <= 0) {
            forwadCell.classList.toggle('highlight')
            if (row == 6) {
                const secondForwadCell = getCell(row - 2, col)
                if (secondForwadCell.children.length <= 0) {
                    secondForwadCell.classList.toggle('highlight')
                }
            }


        }
    }
    if (col > 0, row > 0 && pieceType === 'pawn' && pieceColorType === 'white') {
        const leftCaptureCell = getCell(row - 1, col - 1)
        if (leftCaptureCell.children.length > 0) {
            leftCaptureCell.classList.toggle('highlight')

        }
    }
    if (col < 7 && row > 0 && pieceType === 'pawn' && pieceColorType === 'white') {
        const rightCaptureCell = getCell(row - 1, col + 1)
        if (rightCaptureCell.children.length > 0) {
            rightCaptureCell.classList.toggle('highlight')

        }
    }
    if (row > 0 && pieceType === 'pawn' && pieceColorType === 'black') {
        const forwadCell = getCell(row + 1, col)
        if (forwadCell.children.length <= 0) {
            forwadCell.classList.toggle('highlight')
            if (row == 1) {
                const secondForwadCell = getCell(row + 2, col)
                if (secondForwadCell.children.length <= 0) {
                    secondForwadCell.classList.toggle('highlight')
                }
            }


        }
    }
    if (col < 7 && pieceType === 'pawn' && pieceColorType === 'black') {
        const leftCaptureCell = getCell(row + 1, col + 1)
        if (leftCaptureCell.children.length > 0) {
            leftCaptureCell.classList.toggle('highlight')

        }
    }
    if (col > 0 && pieceType === 'pawn' && pieceColorType === 'black') {
        const rightCaptureCell = getCell(row + 1, col - 1)
        if (rightCaptureCell.children.length > 0) {
            rightCaptureCell.classList.toggle('highlight')

        }
    }
    //rook movement 

    //rook upwards  movement highlights 
    let obst = false

    if (row > 0 && pieceType === 'rook' && pieceColorType === 'white' || row > 0 && pieceType === 'queen' && pieceColorType === 'white') {
        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row - i, col)



            if (!obst && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    // forwadCell.style.background =  'red'
                    forwadCell.classList.toggle('highlight')
                    console.log(forwadCell)
                };
                if (forwadCell.children.length > 0) {
                    console.log("piece")
                    console.log(forwadCell)
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'black') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                        };
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }
            }


        }

    }
    //rook downward movement highlights
    obst = false

    if (row < 7 && pieceType === 'rook' && pieceColorType === 'white' || row < 7 && pieceType === 'queen' && pieceColorType === 'white') {
        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row + i, col)

            if (!obst && forwadCell != null) {
                console.log(obst)

                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                else if (forwadCell.children.length > 0) {
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'black') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                        };
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }
            }


        }
    }

    //rook leftside  movement highlights 
    obst = false

    if (col > 0 && pieceType === 'rook' && pieceColorType === 'white' || col > 0 && pieceType === 'queen' && pieceColorType === 'white') {

        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row, col - i)

            if (!obst && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                else if (forwadCell.children.length > 0) {
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'black') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                        };
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }
            }
        }
    }

    //rook rightside  movement highlights 
    obst = false

    if (col < 7 && pieceType === 'rook' && pieceColorType === 'white' || col < 7 && pieceType === 'queen' && pieceColorType === 'white') {

        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row, col + i)

            if (!obst && forwadCell != null) {
                console.log(obst)

                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                else if (forwadCell.children.length > 0) {
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'black') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                            if (forwadCell.firstElementChild.alt === 'white') {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    // black rook piece movement
    obst = false

    if (row > 0 && pieceType === 'rook' && pieceColorType === 'black' || row > 0 && pieceType === 'queen' && pieceColorType === 'black') {
        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row - i, col)



            if (!obst && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    // forwadCell.style.background =  'red'
                    forwadCell.classList.toggle('highlight')
                    console.log(forwadCell)
                };
                if (forwadCell.children.length > 0) {
                    console.log("piece")
                    console.log(forwadCell)
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'white') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                        };
                        if (forwadCell.firstElementChild.alt === 'black') {
                            break;
                        }
                    }
                }
            }


        }

    }
    //rook downward movement highlights
    obst = false

    if (row < 7 && pieceType === 'rook' && pieceColorType === 'black' || row < 7 && pieceType === 'queen' && pieceColorType === 'black') {
        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row + i, col)

            if (!obst && forwadCell != null) {
                console.log(obst)

                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                else if (forwadCell.children.length > 0) {
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'white') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                        };
                        if (forwadCell.firstElementChild.alt === 'black') {
                            break;
                        }
                    }
                }
            }


        }
    }

    //rook leftside  movement highlights 
    obst = false

    if (col > 0 && pieceType === 'rook' && pieceColorType === 'black' || col > 0 && pieceType === 'queen' && pieceColorType === 'black') {

        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row, col - i)

            if (!obst && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                else if (forwadCell.children.length > 0) {
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'white') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                        };
                        if (forwadCell.firstElementChild.alt === 'black') {
                            break;
                        }
                    }
                }
            }
        }
    }

    //rook rightside  movement highlights 
    obst = false

    if (col < 7 && pieceType === 'rook' && pieceColorType === 'black' || col < 7 && pieceType === 'queen' && pieceColorType === 'black') {

        for (let i = 1; i < 9; i++) {
            const forwadCell = getCell(row, col + i)

            if (!obst && forwadCell != null) {
                console.log(obst)

                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                else if (forwadCell.children.length > 0) {
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'white') {
                            forwadCell.classList.toggle('highlight')
                            obst = true
                            if (forwadCell.firstElementChild.alt === 'black') {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    //the knight movements
    if (pieceType === 'knight' && pieceColorType === 'white') {
        if (row > 1 && col > 0) {
            firstLeftCell = getCell(row - 2, col - 1)
            firstLeftCell.classList.toggle('highlight')
        }


        if (row > 2 && col < 7) {
            firstLeftCell = getCell(row - 2, col + 1)
            firstLeftCell.classList.toggle('highlight')
        }


        if (col > 0 && row > 0) {
            firstLeftCell = getCell(row - 1, col - 2)
            firstLeftCell.classList.toggle('highlight')
        }
        if (col > 1 && row < 7) {
            firstLeftCell = getCell(row + 1, col - 2)
            firstLeftCell.classList.toggle('highlight')
        }



        if (row < 7 && col > 0) {
            firstLeftCell = getCell(row + 2, col - 1)
            firstLeftCell.classList.toggle('highlight')
        }



        //the two left
        if (row > 0 && col < 6) {
            firstLeftCell = getCell(row - 1, col + 2)
            firstLeftCell.classList.toggle('highlight')
        }
        if (row < 7 && col < 6) {
            firstLeftCell = getCell(row + 1, col + 2)
            firstLeftCell.classList.toggle('highlight')
        }


        if (row < 7 && col < 7) {
            firstLeftCell = getCell(row + 2, col + 1)
            firstLeftCell.classList.toggle('highlight')
        }


    }
    if (row >= 0 && pieceType === 'knight' && pieceColorType === 'black') {

        if (row < 6 && col < 7) {
            firstLeftCell = getCell(row + 2, col + 1)
            firstLeftCell.classList.toggle('highlight')
        }

        if (row < 6 && col > 0) {
            firstLeftCell = getCell(row + 2, col - 1)
            firstLeftCell.classList.toggle('highlight')
        }


        if (row < 7 && col < 6) {
            firstLeftCell = getCell(row + 1, col + 2)
            firstLeftCell.classList.toggle('highlight')
        }
        if (row > 0 && col < 6) {
            firstLeftCell = getCell(row - 1, col + 2)
            firstLeftCell.classList.toggle('highlight')
        }



        if (row > 2 && col < 7) {
            firstLeftCell = getCell(row - 2, col + 1)
            firstLeftCell.classList.toggle('highlight')
        }



        // the two left
        if (row < 7 && col > 2) {
            firstLeftCell = getCell(row + 1, col - 2)
            firstLeftCell.classList.toggle('highlight')
        }
        if (row > 0 && col > 1) {
            firstLeftCell = getCell(row - 1, col - 2)
            firstLeftCell.classList.toggle('highlight')
        }


        if (row > 1 && col > 0) {
            firstLeftCell = getCell(row - 2, col - 1)
            firstLeftCell.classList.toggle('highlight')
        }


    };

    let obstacle = false

    if (row >= 0 && pieceType === 'bishop' && pieceColorType === 'white' || row >= 0 && pieceType === 'queen' && pieceColorType === 'white') {
        for (i = 1; i < 9; i++) {
            const forwadCell = getCell(row + i, col + i)

            if (!obst && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }

            }
        }
    }


    obstacle = false

    if (row > 0 && pieceType === 'bishop' && pieceColorType === 'white' || row > 0 && pieceType === 'queen' && pieceColorType === 'white') {
        for (i = 1; i < 9; i++) {
            const forwadCell = getCell(row - i, col - i)

            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.children.length > 0) {
                        if (forwadCell.firstElementChild.alt === 'black') {
                            forwadCell.classList.toggle('highlighttake')
                            if (forwadCell.firstElementChild.alt === 'white') {
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    obstacle = false

    if (row < 7 && pieceType === 'bishop' && pieceColorType === 'white' || row < 7 && pieceType === 'queen' && pieceColorType === 'white') {
        for (i = 1; i < 9; i++) {
            const forwadCell = getCell(row + i, col - i)


            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }

                }
            }
        }

    }


    obstacle = false

    if (row > 0 && pieceType === 'bishop' && pieceColorType === 'white' || row > 0 && pieceType === 'queen' && pieceColorType === 'white') {
        for (i = 1; i < 9; i++) {
            const forwadCell = getCell(row - i, col + i)

            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        obstacle = true
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }

                    }
                }
            }
        }
    }

    obstacle = false

    if (col === 4 && row === 7 && pieceType === 'king' && pieceColorType === 'white') {

        for (i = 1; i < 3; i++) {
            const forwadCell = getCell(row, col + i)

            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }

            }
        }
    }
    else {
        obstacle = false

        if (col < 6 && pieceType === 'king' && pieceColorType === 'white') {

            for (i = 1; i < 2; i++) {
                const forwadCell = getCell(row, col + i)

                if (!obstacle && forwadCell != null) {
                    if (forwadCell.children.length <= 0) {
                        forwadCell.classList.toggle('highlight')
                    }
                    if (forwadCell.children.length > 0) {
                        obstacle = true
                        if (forwadCell.firstElementChild.alt === 'black') {
                            forwadCell.classList.toggle('highlighttake')
                            if (forwadCell.firstElementChild.alt === 'white') {
                                break;
                            }
                        }
                    }

                }
            }
        }
    }

    obstacle = false

    if (col > 1 && pieceType === 'king' && pieceColorType === 'white') {

        for (i = 1; i < 2; i++) {
            const forwadCell = getCell(row, col - i)

            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }

            }
        }
    }

    obstacle = false

    if (row < 7 && pieceType === 'king' && pieceColorType === 'white') {

        for (i = 1; i < 2; i++) {
            const forwadCell = getCell(row + 1, col)

            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }

            }
        }
    }
    obstacle = false

    if (row > 0 && pieceType === 'king' && pieceColorType === 'white') {

        for (i = 1; i < 2; i++) {
            const forwadCell = getCell(row - 1, col)

            if (!obstacle && forwadCell != null) {
                if (forwadCell.children.length <= 0) {
                    forwadCell.classList.toggle('highlight')
                }
                if (forwadCell.children.length > 0) {
                    obstacle = true
                    if (forwadCell.firstElementChild.alt === 'black') {
                        forwadCell.classList.toggle('highlighttake')
                        if (forwadCell.firstElementChild.alt === 'white') {
                            break;
                        }
                    }
                }

            }
        }
    }
}





function clearHighlights() {
    document.querySelectorAll('.highlight').forEach(cell => {
        cell.classList.toggle('highlight')
    })
    document.querySelectorAll('.highlighttake').forEach(cell => {
        cell.classList.toggle('highlighttake')
    })
}
function getCell(row, col) {
    return chessboard.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`)

}
function determinePiece(row, col) {
    if (row === 1) {
        return pieces['bpawn'];
    }
    if (row === 6) {
        return pieces['wpawn'];
    }
    if (row === 0 || row === 7) {
        if (col === 0 || col === 7) {
            return row === 0 ? pieces['brook'] : pieces['wrook'];
        }
        if (col === 1 || col === 6) {
            return row === 0 ? pieces['bknight'] : pieces['wknight'];
        }
        if (col === 2 || col === 5) {
            return row === 0 ? pieces['bbishop'] : pieces['wbishop'];
        }
        if (col === 3) {
            return row === 0 ? pieces['bqueen'] : pieces['wqueen'];
        }
        if (col === 4) {
            return row === 0 ? pieces['bking'] : pieces['wking'];
        }
    }

    return null;
}
function checkPieceType(piece) {
    if (piece === '../pieces/wpawn.png' || piece === '../pieces/bpawn.png') {
        return 'pawn'
    }
    if (piece === '../pieces/wrook.png' || piece === '../pieces/brook.png') {
        return 'rook'
    }
    if (piece === '../pieces/wknight.png' || piece === '../pieces/bknight.png') {
        return 'knight'
    }
    if (piece === '../pieces/wbishop.png' || piece === '../pieces/bbishop.png') {
        return 'bishop'
    }
    if (piece === '../pieces/wqueen.png' || piece === '../pieces/bqueen.png') {
        return 'queen'
    }
    if (piece === '../pieces/wking.png' || piece === '../pieces/bking.png') {
        return 'king'
    }


}

function checkPieceColor(piece) {
    if (piece === '../pieces/wpawn.png' || piece === '../pieces/wrook.png' || piece === '../pieces/wknight.png' || piece === '../pieces/wbishop.png'
        || piece === '../pieces/wqueen.png' || piece === '../pieces/wking.png') {
        return 'white'
    }
    else {
        return "black"
    }
}


//ajax 

$(document).ready(function () {
    $.ajax({
        url: '/api/user-info',
        method: 'GET',
        success: function (data) {
            if (data.username) {

                $('#usernameDisplay').text(data.username); // Update the UI with the username
                roomName = data.username

            }
        },
        error: function (err) {
            console.log('Error fetching user data:', err);
        }
    });
});