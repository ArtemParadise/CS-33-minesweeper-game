class Minesweeper {
    constructor() {
        this.boardSize = 10;
        this.minesCount = 10;
        this.flagsCount = 10;
        this.gameStarted = false;
        this.gameOver = false;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.gameBoard = document.getElementById('gameBoard');
        this.flagsCountElement = document.getElementById('flagsCount');
        this.timerElement = document.getElementById('timer');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.gameMessage = document.getElementById('gameMessage');
        
        this.createBoard();
        this.updateDisplay();
    }

    createBoard() {
        this.gameBoard.innerHTML = '';
        this.board = Array(this.boardSize).fill().map(() => 
            Array(this.boardSize).fill().map(() => ({
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            }))
        );

        // Створюємо клітинки
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell closed';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(i, j);
                });

                this.gameBoard.appendChild(cell);
            }
        }
    }

    setupEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
    }

    startNewGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.flagsCount = this.minesCount;
        this.timer = 0;
        
        this.clearTimer();
        this.createBoard();
        this.updateDisplay();
        this.hideMessage();
    }

    handleCellClick(row, col) {
        if (this.gameOver) return;
        
        if (!this.gameStarted) {
            this.placeMines(row, col);
            this.calculateAdjacentMines();
            this.gameStarted = true;
            this.startTimer();
        }

        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;

        this.revealCell(row, col);
        this.checkGameStatus();
    }

    handleRightClick(row, col) {
        if (this.gameOver || !this.gameStarted) return;
        
        const cell = this.board[row][col];
        if (cell.isRevealed) return;

        if (!cell.isFlagged && this.flagsCount > 0) {
            cell.isFlagged = true;
            this.flagsCount--;
            this.updateCellDisplay(row, col);
        } else if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flagsCount++;
            this.updateCellDisplay(row, col);
        }

        this.updateDisplay();
    }

    placeMines(firstRow, firstCol) {
        let minesPlaced = 0;
        
        while (minesPlaced < this.minesCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            
            // Запобігаємо розміщенню міни на першому кліку та дублюванню
            if (!this.board[row][col].isMine && 
                (row !== firstRow || col !== firstCol)) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
    }

    calculateAdjacentMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (!this.board[i][j].isMine) {
                    this.board[i][j].adjacentMines = this.countAdjacentMines(i, j);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize && 
                    this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }

    revealCell(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;

        if (cell.isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.showMessage('Ви програли! 💥', 'lose');
            this.clearTimer();
            return;
        }

        if (cell.adjacentMines === 0) {
            // Рекурсивно відкриваємо сусідні клітинки
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const newRow = row + i;
                    const newCol = col + j;
                    
                    if (newRow >= 0 && newRow < this.boardSize && 
                        newCol >= 0 && newCol < this.boardSize) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }

        this.updateCellDisplay(row, col);
    }

    updateCellDisplay(row, col) {
        const cellElement = this.gameBoard.querySelector(
            `[data-row="${row}"][data-col="${col}"]`
        );
        const cell = this.board[row][col];

        cellElement.className = 'cell';

        if (cell.isRevealed) {
            cellElement.classList.add('open');
            if (cell.isMine) {
                cellElement.classList.add('mine');
            } else if (cell.adjacentMines > 0) {
                cellElement.classList.add(`number-${cell.adjacentMines}`);
                cellElement.textContent = cell.adjacentMines;
            }
        } else if (cell.isFlagged) {
            cellElement.classList.add('flag', 'closed');
        } else {
            cellElement.classList.add('closed');
        }
    }

    revealAllMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = this.board[i][j];
                if (cell.isMine) {
                    cell.isRevealed = true;
                    this.updateCellDisplay(i, j);
                }
            }
        }
    }

    checkGameStatus() {
        let unrevealedSafeCells = 0;
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = this.board[i][j];
                if (!cell.isMine && !cell.isRevealed) {
                    unrevealedSafeCells++;
                }
            }
        }

        if (unrevealedSafeCells === 0) {
            this.gameOver = true;
            this.showMessage('Вітаю! Ви виграли! 🎉', 'win');
            this.clearTimer();
        }
    }

    startTimer() {
        this.clearTimer();
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }

    clearTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateDisplay() {
        this.flagsCountElement.textContent = this.flagsCount;
        this.timerElement.textContent = this.timer;
    }

    showMessage(text, type) {
        this.gameMessage.textContent = text;
        this.gameMessage.className = `game-message show ${type}`;
    }

    hideMessage() {
        this.gameMessage.className = 'game-message';
    }
}

// Ініціалізація гри при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});