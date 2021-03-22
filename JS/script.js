//players factory
const Player = (marker) => {
    let _symbol = marker;
    const play = function (playedCell) {
        events.emit("moveFinished", [_symbol, playedCell]);
    }
    return { play };
};

const playerX = Player('X');
const playerO = Player('O');

//events (publish subscribe) pattern
var events = {
    events: {},
    on: function (eventName, fn) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(fn);
    },
    off: function (eventName, fn) {
        if (this.events[eventName]) {
            for (var i = 0; i < this.events[eventName].length; i++) {
                if (this.events[eventName][i] === fn) {
                    this.events[eventName].splice(i, 1);
                    break;
                }
            };
        }
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                fn(data);
            });
        }
    }
};

const gameBoard = (function () {
    let _boardMoves = [];
    //bind events
    events.on('moveFinished', storePlay);
    events.on('clearBoard', clearBoard);

    function storePlay(arguments) {
        const [value, index] = arguments;
        if (_boardMoves[index] == undefined)
            _boardMoves[index] = value;
        events.emit("moveStored", [_boardMoves, value]);
        render();
    };
    function clearBoard() {
        _boardMoves = [];
        render();
    }

    const render = function () {
        const grid = Array.from(document.querySelectorAll(".cell"));
        grid.forEach(cell => {
            cell.textContent = _boardMoves[cell.dataset.index];
        });
        console.log(_boardMoves);
    }
})();


const gameController = (function () {
    const root = document.documentElement;
    let _currentPlayer = "playerX";
    //bind events
    events.on('gameFinished', blockBoard);
    events.on('gameFinished', announceResult);
    events.on('moveStored', switchPlayer);
    events.on('moveStored', checkWinner);
    events.on('clearBoard', switchPlayer);

    const _getCellIndex = (e) => {
        if (_currentPlayer == "playerX")
            playerX.play(e.target.dataset.index)
        else playerO.play(e.target.dataset.index)
    }

    function switchPlayer() {
        if (_currentPlayer == "playerX") {
            _currentPlayer = "playerO";
            root.style.setProperty('--boardBackground', "rgb(170, 166, 148)");
        }
        else {
            _currentPlayer = "playerX"
            root.style.setProperty('--boardBackground', "rgb(124, 108, 119)");
        }
        //modify results/current player label
        const playAnnouncer = document.querySelector("#playAnnouncer");
        let newLabel = (`${_currentPlayer.slice(6)}'s turn`);
        playAnnouncer.textContent = newLabel;
    }

    function announceResult(winner) {
        const playAnnouncer = document.querySelector("#playAnnouncer");
        root.style.setProperty('--boardBackground', "rgb(235, 248, 184)");
        root.style.setProperty('--fontColorAnnouncer', "black");
        if(winner)
        playAnnouncer.textContent = `Player ${winner} Wins!!`;
        else playAnnouncer.textContent = `Tie - Game Over :(`;
    }
    function blockBoard() {
        const grid = document.querySelector("#grid");
        grid.style.pointerEvents = "none";
    }
    function checkWinner(boardArray) {
        let [board, valuePlayed] = boardArray;
        let concatValuePlayed = valuePlayed + valuePlayed + valuePlayed;
        if (board[0] + board[1] + board[2] == concatValuePlayed ||
            board[3] + board[4] + board[5] == concatValuePlayed ||
            board[6] + board[7] + board[8] == concatValuePlayed ||
            board[0] + board[3] + board[6] == concatValuePlayed ||
            board[1] + board[4] + board[7] == concatValuePlayed ||
            board[2] + board[5] + board[8] == concatValuePlayed ||
            board[0] + board[4] + board[8] == concatValuePlayed ||
            board[2] + board[4] + board[6] == concatValuePlayed) {
            events.emit("gameFinished", valuePlayed);
        }else if(!board.includes(undefined)&&board.length==9)
        events.emit("gameFinished");
    }
    const clearBoard=function(){
        grid.style.pointerEvents="auto";
        _currentPlayer = "playerO";
        root.style.setProperty('--fontColorAnnouncer', "white");
        events.emit("clearBoard");
    }
    //listeners for clear button and cells clicked
    const _clearListener=document.querySelector("button");
    _clearListener.addEventListener('click', clearBoard);
    const _cellListener = Array.from(document.querySelectorAll(".cell"));
    _cellListener.forEach(selectedCell => selectedCell.addEventListener('click', _getCellIndex));
})();
