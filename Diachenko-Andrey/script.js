

// --------- Стани клітинки ---------
const CellState = {
    CLOSED: 'closed',
    OPENED: 'opened',
    FLAGGED: 'flagged',
};

// --------- Створення клітинки ---------
function createCell() {
    return {
        hasMine: false,
        nearbyMines: 0,
        state: CellState.CLOSED,
    };
}

// --------- Стани гри ---------
const GameStatus = {
    IN_PROGRESS: 'in_progress',
    WIN: 'win',
    LOSE: 'lose',
};

// --------- Генерація поля ---------
function generateField(rows, cols, mines) {
    const field = [];
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(createCell());
        }
        field.push(row);
    }

    // Розставляємо міни
    let placed = 0;
    while (placed < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!field[r][c].hasMine) {
            field[r][c].hasMine = true;
            placed++;
        }
    }

    // Рахуємо сусідні міни
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            field[r][c].nearbyMines = countNeighbourMines(field, r, c);
        }
    }

    return field;
}

// --------- Підрахунок сусідніх мін ---------
function countNeighbourMines(field, row, col) {
    let count = 0;
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (
                r >= 0 &&
                r < field.length &&
                c >= 0 &&
                c < field[0].length &&
                !(r === row && c === col)
            ) {
                if (field[r][c].hasMine) count++;
            }
        }
    }
    return count;
}

// --------- Відкриття клітинки ---------
function openCell(gameState, row, col) {
    const field = gameState.field;
    const cell = field[row][col];

    if (cell.state !== CellState.CLOSED || gameState.status !== GameStatus.IN_PROGRESS) return;

    if (cell.hasMine) {
        cell.state = CellState.OPENED;
        gameState.status = GameStatus.LOSE;
        stopTimer();
        renderField(gameState);
        alert('💥 Ви програли!');
        return;
    }

    cell.state = CellState.OPENED;

    if (cell.nearbyMines === 0) {
        for (let r = row - 1; r <= row + 1; r++) {
            for (let c = col - 1; c <= col + 1; c++) {
                if (r >= 0 && r < field.length && c >= 0 && c < field[0].length) {
                    openCell(gameState, r, c);
                }
            }
        }
    }

    if (checkWin(field)) {
        gameState.status = GameStatus.WIN;
        stopTimer();
        renderField(gameState);
        alert('🏆 Ви виграли!');
    }
}

// --------- Прапорець ---------
function toggleFlag(field, row, col) {
    const cell = field[row][col];
    if (cell.state === CellState.OPENED) return;
    cell.state = cell.state === CellState.FLAGGED ? CellState.CLOSED : CellState.FLAGGED;
}

// --------- Перевірка виграшу ---------
function checkWin(field) {
    for (const row of field) {
        for (const cell of row) {
            if (!cell.hasMine && cell.state !== CellState.OPENED) return false;
        }
    }
    return true;
}

// --------- Таймер ---------
let timer = null;
let seconds = 0;

function startTimer() {
    seconds = 0;
    timer = setInterval(() => {
        seconds++;
        updateDisplays(gameState);
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

// --------- Оновлення дисплеїв ---------
function updateDisplays(gameState) {
    const flagsCount = gameState.field
        .flat()
        .filter((cell) => cell.state === CellState.FLAGGED).length;
    const displays = document.querySelectorAll('.display');
    displays[0].textContent = String(flagsCount).padStart(3, '0');
    displays[1].textContent = String(seconds).padStart(3, '0');
}

// --------- Рендеринг поля ---------
function renderField(gameState) {
    const fieldContainer = document.querySelector('.field');
    fieldContainer.innerHTML = '';

    for (let r = 0; r < gameState.height; r++) {
        for (let c = 0; c < gameState.width; c++) {
            const cell = gameState.field[r][c];
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');

            if (cell.state === CellState.CLOSED) cellDiv.classList.add('closed');
            else if (cell.state === CellState.OPENED) cellDiv.classList.add('open');
            else if (cell.state === CellState.FLAGGED) cellDiv.classList.add('flag');

            if (cell.state === CellState.OPENED && cell.nearbyMines > 0) {
                cellDiv.textContent = cell.nearbyMines;
                const colors = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
                cellDiv.classList.add(colors[cell.nearbyMines - 1]);
            }

            cellDiv.dataset.row = r;
            cellDiv.dataset.col = c;

            fieldContainer.appendChild(cellDiv);
        }
    }

    updateDisplays(gameState);
}

// --------- Старт/Рестарт гри ---------
function resetGame() {
    stopTimer();
    gameState.field = generateField(gameState.height, gameState.width, gameState.minesCount);
    gameState.status = GameStatus.IN_PROGRESS;
    seconds = 0;
    startTimer();
    renderField(gameState);
}

document.querySelector('.face').addEventListener('click', resetGame);

// --------- Обробка кліків по клітинках ---------
document.querySelector('.field').addEventListener('click', (e) => {
    const cellDiv = e.target.closest('.cell');
    if (!cellDiv) return;

    const row = +cellDiv.dataset.row;
    const col = +cellDiv.dataset.col;

    openCell(gameState, row, col);
    renderField(gameState);
});

document.querySelector('.field').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const cellDiv = e.target.closest('.cell');
    if (!cellDiv) return;

    const row = +cellDiv.dataset.row;
    const col = +cellDiv.dataset.col;

    toggleFlag(gameState.field, row, col);
    renderField(gameState);
});

// --------- Ініціалізація гри ---------
const gameState = {
    width: 5,
    height: 5,
    minesCount: 5,
    status: GameStatus.IN_PROGRESS,
    field: generateField(5, 5, 5),
};

window.addEventListener('DOMContentLoaded', () => {
    startTimer();
    renderField(gameState);
});


