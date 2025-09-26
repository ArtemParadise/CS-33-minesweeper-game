/**
 * Створює об'єкт, що представляє одну клітинку ігрового поля.
 * @param {boolean} [hasMine=false] - Чи містить клітинка міну.
 * @returns {object} Об'єкт клітинки.
 */
function createCell(hasMine = false) {
    return {
        hasMine: hasMine,          // boolean - indicates if there is a mine
        neighborMines: 0,          // number - how many mines are around
        state: "closed"            // string - can be "closed", "open", or "flagged"
    };
}

// допоміжна функція: підрахунок мін навколо клітинки
/**
 * Підраховує кількість мін у 8 сусідніх клітинках (включно з діагональними).
 * @param {object[][]} board - 2D ігрове поле.
 * @param {number} row - Індекс рядка поточної клітинки.
 * @param {number} col - Індекс стовпця поточної клітинки.
 * @returns {number} Кількість сусідніх мін.
 */
function countAdjacentMines(board, row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue; // пропустити саму клітинку
            let nr = row + dr;
            let nc = col + dc;
            if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length) {
                if (board[nr][nc].hasMine) {
                    count++;
                }
            }
        }
    }
    return count;
}

// 2. Game Board Structure (Two-dimensional array)
/**
 * Створює ініціалізоване ігрове поле (2D масив клітинок).
 * Включає розміщення мін та підрахунок сусідніх мін.
 * @param {number} rows - Кількість рядків.
 * @param {number} cols - Кількість стовпців.
 * @param {number} minesCount - Загальна кількість мін, які потрібно розмістити.
 * @returns {object[][]} Двовимірний масив клітинок (ігрове поле).
 */
function createBoard(rows, cols, minesCount) {
    let board = [];

    // Initialize empty cells
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            row.push(createCell());
        }
        board.push(row);
    }

    // Random mine placement
    let placedMines = 0;
    while (placedMines < minesCount) {
        let r = Math.floor(Math.random() * rows);
        let c = Math.floor(Math.random() * cols);
        if (!board[r][c].hasMine) {
            board[r][c].hasMine = true;
            placedMines++;
        }
    }

    // Count neighboring mines
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!board[r][c].hasMine) {
                board[r][c].neighborMines = countAdjacentMines(board, r, c);
            }
        }
    }

    return board;
}

// 3. Game State Structure
/**
 * Створює об'єкт, що містить повний стан гри.
 * Ініціалізує нове ігрове поле.
 * @param {number} rows - Кількість рядків поля.
 * @param {number} cols - Кількість стовпців поля.
 * @param {number} mines - Загальна кількість мін.
 * @returns {object} Об'єкт стану гри.
 */
function createGame(rows, cols, mines) {
    return {
        rows: rows,             // number - dimensions of the field
        cols: cols,             // number - dimensions of the field
        mines: mines,           // number - number of mines
        status: "in-progress",  // string - can be "in-progress", "win", or "lose"
        board: createBoard(rows, cols, mines)
    };
}

// 4. Sample Game Board with Test Values
/**
 * Створює і повертає невелике статичне тестове ігрове поле (3x3).
 * Використовується для перевірки та налагодження.
 * @returns {object[][]} 2D тестовий масив клітинок.
 */
function createSampleBoard() {
    // Create a 3x3 sample board for testing
    const sampleBoard = [
        [
            { hasMine: false, neighborMines: 1, state: "closed" },
            { hasMine: true, neighborMines: 0, state: "closed" },
            { hasMine: false, neighborMines: 2, state: "closed" }
        ],
        [
            { hasMine: false, neighborMines: 1, state: "closed" },
            { hasMine: true, neighborMines: 0, state: "closed" },
            { hasMine: true, neighborMines: 0, state: "closed" }
        ],
        [
            { hasMine: false, neighborMines: 0, state: "closed" },
            { hasMine: false, neighborMines: 2, state: "closed" },
            { hasMine: false, neighborMines: 1, state: "closed" }
        ]
    ];

    return sampleBoard;
}

// Sample game state for testing
const sampleGame = {
    rows: 3,
    cols: 3,
    mines: 3,
    status: "in-progress",
    board: createSampleBoard()
};

// Display sample data in console for verification
console.log("Sample Game State:", sampleGame);
console.log("Sample Board (3x3 with 3 mines):", createSampleBoard());

// 4. Рендер та взаємодія з DOM
/**
 * Отримує посилання на ключові елементи DOM, необхідні для гри.
 * @returns {{field: Element, startBtn: Element, timerEl: Element, minesCounterEl: Element}} Об'єкти елементів DOM.
 */
let game = null;
let firstClickHappened = false;
let timerIntervalId = null;
let elapsedSeconds = 0;

function getElements() {
    const field = document.querySelector('.field');
    const startBtn = document.getElementById('start-btn');
    const timerEl = document.getElementById('timer');
    const minesCounterEl = document.getElementById('mines-counter');
    return { field, startBtn, timerEl, minesCounterEl };
}

/**
 * Форматує загальну кількість секунд у формат MM:SS (хвилини:секунди).
 * @param {number} totalSeconds - Загальна кількість секунд.
 * @returns {string} Форматований час.
 */
function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/**
 * Запускає таймер гри (кожну секунду збільшує лічильник та оновлює DOM).
 */
function startTimer() {
    stopTimer();
    elapsedSeconds = 0;
    const { timerEl } = getElements();
    if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
    timerIntervalId = setInterval(() => {
        elapsedSeconds += 1;
        if (timerEl) timerEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
}

/**
 * Зупиняє запущений інтервал таймера.
 */
function stopTimer() {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

/**
 * Підраховує кількість клітинок, позначених прапорцем на поточному полі.
 * @returns {number} Кількість встановлених прапорців.
 */
function getFlagCount() {
    if (!game) return 0;
    let flags = 0;
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            if (game.board[r][c].state === 'flagged') flags++;
        }
    }
    return flags;
}

/**
 * Оновлює лічильник мін на екрані, відображаючи кількість мін мінус кількість прапорців.
 */
function updateMinesCounter() {
    const { minesCounterEl } = getElements();
    if (!minesCounterEl || !game) return;
    const remaining = Math.max(0, game.mines - getFlagCount());
    minesCounterEl.textContent = String(remaining);
}

/**
 * Рендерить ігрове поле на основі поточного стану об'єкта 'game'.
 * Створює елементи DOM для кожної клітинки та застосовує вигляд.
 */
function renderBoard() {
    const { field } = getElements();
    if (!field || !game) return;
    field.innerHTML = '';
    for (let r = 0; r < game.rows; r++) {
        const rowEl = document.createElement('div');
        rowEl.className = 'row';
        for (let c = 0; c < game.cols; c++) {
            const cell = game.board[r][c];
            const cellEl = document.createElement('div');
            cellEl.className = 'cell';
            cellEl.dataset.r = String(r);
            cellEl.dataset.c = String(c);
            applyCellAppearance(cellEl, cell);
            rowEl.appendChild(cellEl);
        }
        field.appendChild(rowEl);
    }
}

/**
 * Повертає назву CSS-класу для відображення числа суміжних мін (від number-1 до number-8).
 * @param {number} value - Кількість суміжних мін.
 * @returns {string} Назва CSS-класу.
 */
function numberClassFor(value) {
    return value >= 1 && value <= 8 ? `number-${value}` : '';
}

/**
 * Застосовує відповідні CSS-класи та текстовий вміст до елемента клітинки DOM
 * відповідно до її стану (відкрито, закрито, прапорець, міна, число).
 * @param {Element} cellEl - Елемент клітинки DOM.
 * @param {object} cell - Об'єкт клітинки.
 */
function applyCellAppearance(cellEl, cell) {
    cellEl.className = 'cell';
    cellEl.textContent = '';
    if (cell.state === 'flagged') {
        cellEl.classList.add('flag');
        return;
    }
    if (cell.state === 'open') {
        if (cell.hasMine) {
            cellEl.classList.add('mine', 'detonated');
            return;
        }
        if (cell.neighborMines > 0) {
            cellEl.classList.add(numberClassFor(cell.neighborMines));
            cellEl.textContent = String(cell.neighborMines);
        }
        return;
    }
    // closed state: no extra classes/content
}

/**
 * Перевіряє, чи знаходяться координати (r, c) в межах ігрового поля.
 * @param {number} r - Індекс рядка.
 * @param {number} c - Індекс стовпця.
 * @returns {boolean} True, якщо координати в межах поля.
 */
function inBounds(r, c) {
    return r >= 0 && r < game.rows && c >= 0 && c < game.cols;
}

/**
 * Рекурсивно відкриває клітинку та поширюється на сусідні клітинки, якщо поточна
 * не має сусідніх мін (логіка "нульового розкриття").
 * Використовує нерекурсивний підхід (стек) для запобігання переповненню стека.
 * @param {number} r - Індекс рядка, з якого починається розкриття.
 * @param {number} c - Індекс стовпця, з якого починається розкриття.
 */
function floodOpen(r, c) {
    const stack = [[r, c]];
    while (stack.length) {
        const [cr, cc] = stack.pop();
        const cell = game.board[cr][cc];
        if (cell.state !== 'closed' || cell.hasMine) continue;
        cell.state = 'open';
        if (cell.neighborMines === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = cr + dr, nc = cc + dc;
                    if (inBounds(nr, nc) && game.board[nr][nc].state === 'closed' && !game.board[nr][nc].hasMine) {
                        stack.push([nr, nc]);
                    }
                }
            }
        }
    }
}

/**
 * Обробляє клік гравця (ліва кнопка миші) для відкриття клітинки.
 * Перевіряє наявність міни, викликає 'floodOpen' для нульових клітинок та перевіряє умову перемоги.
 * @param {number} r - Індекс рядка клітинки.
 * @param {number} c - Індекс стовпця клітинки.
 */
function openCell(r, c) {
    if (game.status !== 'in-progress') return;
    const cell = game.board[r][c];
    if (cell.state !== 'closed') return;
    if (!firstClickHappened) {
        firstClickHappened = true;
        startTimer();
    }
    if (cell.hasMine) {
        cell.state = 'open';
        game.status = 'lose';
        revealAllMines();
        stopTimer();
        renderBoard();
        return;
    }
    if (cell.neighborMines === 0) {
        floodOpen(r, c);
    } else {
        cell.state = 'open';
    }
    checkWinCondition();
    renderBoard();
}

/**
 * Перемикає стан клітинки між 'flagged' (прапорець) та 'closed' (закрито).
 * Працює лише для закритих клітинок. Оновлює лічильник мін.
 * @param {number} r - Індекс рядка клітинки.
 * @param {number} c - Індекс стовпця клітинки.
 */
function toggleFlag(r, c) {
    if (game.status !== 'in-progress') return;
    const cell = game.board[r][c];
    if (cell.state === 'open') return;
    cell.state = cell.state === 'flagged' ? 'closed' : 'flagged';
    updateMinesCounter();
    renderBoard();
}

/**
 * Розкриває всі клітинки з мінами на полі.
 * Викликається після програшу.
 */
function revealAllMines() {
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            const cell = game.board[r][c];
            if (cell.hasMine) {
                cell.state = 'open';
            }
        }
    }
}

/**
 * Перевіряє умову перемоги: чи всі клітинки, які НЕ є мінами, відкриті.
 * Якщо так, встановлює статус гри на 'win' і зупиняє таймер.
 */
function checkWinCondition() {
    // Win if all non-mine cells are opened
    let unopenedSafe = 0;
    for (let r = 0; r < game.rows; r++) {
        for (let c = 0; c < game.cols; c++) {
            const cell = game.board[r][c];
            if (!cell.hasMine && cell.state !== 'open') unopenedSafe++;
        }
    }
    if (unopenedSafe === 0) {
        game.status = 'win';
        stopTimer();
    }
}

/**
 * Додає обробники подій до елементів DOM:
 * - Клік по кнопці "Start" для ініціалізації нової гри.
 * - Клік мишею по ігровому полю для відкриття клітинок (ЛКМ) або встановлення/зняття прапорця (ПКМ).
 */
function attachEvents() {
    const { field, startBtn } = getElements();
    if (startBtn) {
        startBtn.addEventListener('click', () => initGame());
    }
    if (field) {
        field.addEventListener('contextmenu', (e) => e.preventDefault());
        field.addEventListener('mousedown', (e) => {
            const target = e.target;
            if (!(target instanceof Element)) return;
            if (!target.classList.contains('cell')) return;
            const r = Number(target.dataset.r);
            const c = Number(target.dataset.c);
            if (!Number.isInteger(r) || !Number.isInteger(c)) return;
            if (e.button === 2) {
                toggleFlag(r, c);
            } else if (e.button === 0) {
                openCell(r, c);
            }
        });
    }
}

/**
 * Ініціалізує нову гру зі стандартними параметрами (9x10, 15 мін).
 * Скидає стан гри, таймер, лічильник прапорців і рендерить поле.
 */
function initGame() {
    const rows = 9;
    const cols = 10;
    const mines = 15;
    game = createGame(rows, cols, mines);
    firstClickHappened = false;
    stopTimer();
    const { timerEl } = getElements();
    if (timerEl) timerEl.textContent = '00:00';
    updateMinesCounter();
    renderBoard();
}

// Ініціалізація після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    attachEvents();
    initGame();
});
