// Лабораторна робота №2 - Minesweeper Game Logic
// Хомякова Крістіна

// 1. ОБ'ЄКТ КЛІТИНКИ 
class Cell {
    constructor(hasMine = false) {
        this.hasMine = hasMine;              // чи є міна
        this.neighborMines = 0;              // кількість сусідніх мін
        this.state = 'closed';               // стан: 'closed', 'opened', 'flagged'
    }
}

// 2. СТРУКТУРА ГРИ 
class GameState {
    constructor(boardSize = 9, mineCount = 10) {
        this.boardSize = boardSize;          // розмірність поля
        this.mineCount = mineCount;          // кількість мін
        this.gameState = 'playing';          // стан гри: 'playing', 'win', 'lose'
        this.board = [];                     // ігрове поле
        this.initializeBoard();
    }

    // 3. ПОБУДОВА СТРУКТУРИ ІГРОВОГО ПОЛЯ 
    initializeBoard() {
        // Створення порожнього поля
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = new Cell();
            }
        }
        
        // Розміщення мін
        this.placeMines();
        
        // Підрахунок сусідніх мін
        this.calculateNeighborMines();
    }

    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            
            if (!this.board[row][col].hasMine) {
                this.board[row][col].hasMine = true;
                minesPlaced++;
            }
        }
    }

    calculateNeighborMines() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (!this.board[i][j].hasMine) {
                    this.board[i][j].neighborMines = this.countNeighborMines(i, j);
                }
            }
        }
    }

    countNeighborMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize) {
                    if (this.board[newRow][newCol].hasMine) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
}

// 4. ТЕСТОВИЙ ПРИКЛАД
const testGame = new GameState(9, 10);
console.log("Тестове ігрове поле:", testGame);
console.log("Стан гри:", testGame.gameState);
console.log("Розмір поля:", testGame.boardSize);
console.log("Кількість мін:", testGame.mineCount);

// Тестування окремих клітинок
console.log("Клітинка [0][0]:", testGame.board[0][0]);
console.log("Клітинка [4][4]:", testGame.board[4][4]);