const gridSize = 4;
let grid = [];
let score = 0;
let tileAnimations = [];

function initGrid() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = 0;
        }
    }
    addRandomTile();
    addRandomTile();
    updateGrid();
    score = 0;
    document.getElementById('score-value').textContent = score;
}

function addRandomTile() {
    let empty = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) empty.push({i, j});
        }
    }
    if (empty.length === 0) return;
    let {i, j} = empty[Math.floor(Math.random() * empty.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
}

function updateGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            let tile;
            if (grid[i][j]) {
                tile = document.createElement('div');
                tile.className = 'tile tile-' + grid[i][j];
                tile.textContent = grid[i][j];
                // 檢查是否有動畫
                const anim = tileAnimations.find(a => a.to[0] === i && a.to[1] === j);
                if (anim) {
                    if (anim.type === 'move') tile.classList.add('move-' + anim.dir);
                    if (anim.type === 'merge') tile.classList.add('merge');
                    tile.addEventListener('animationend', () => {
                        tile.classList.remove('move-' + anim.dir);
                        tile.classList.remove('merge');
                    }, { once: true });
                }
            } else {
                tile = document.createElement('div');
                tile.className = 'tile-bg';
                tile.textContent = '';
            }
            container.appendChild(tile);
        }
    }
    tileAnimations = [];
}

function move(dir) {
    let moved = false;
    let merged = Array.from({length: gridSize}, () => Array(gridSize).fill(false));
    tileAnimations = [];
    function traverse(i, j) {
        let ni = i, nj = j;
        switch(dir) {
            case 'up':    ni--; break;
            case 'down':  ni++; break;
            case 'left':  nj--; break;
            case 'right': nj++; break;
        }
        if (ni < 0 || ni >= gridSize || nj < 0 || nj >= gridSize) return false;
        if (grid[ni][nj] === 0) {
            grid[ni][nj] = grid[i][j];
            grid[i][j] = 0;
            moved = true;
            tileAnimations.push({type: 'move', from: [i, j], to: [ni, nj], dir});
            return traverse(ni, nj) || true;
        } else if (grid[ni][nj] === grid[i][j] && !merged[ni][nj] && !merged[i][j]) {
            grid[ni][nj] *= 2;
            score += grid[ni][nj];
            grid[i][j] = 0;
            merged[ni][nj] = true;
            moved = true;
            tileAnimations.push({type: 'merge', from: [i, j], to: [ni, nj], dir});
            return true;
        }
        return false;
    }
    let order = [];
    for (let i = 0; i < gridSize; i++) for (let j = 0; j < gridSize; j++) order.push([i, j]);
    if (dir === 'right') order.reverse();
    if (dir === 'down') order.reverse();
    if (dir === 'up' || dir === 'down') order.sort((a, b) => dir === 'up' ? a[0] - b[0] : b[0] - a[0]);
    if (dir === 'left' || dir === 'right') order.sort((a, b) => dir === 'left' ? a[1] - b[1] : b[1] - a[1]);
    for (const [i, j] of order) {
        if (grid[i][j]) traverse(i, j);
    }
    if (moved) {
        addRandomTile();
        updateGrid();
        document.getElementById('score-value').textContent = score;
        if (isGameOver()) setTimeout(() => alert('遊戲結束！'), 100);
    }
}

function isGameOver() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 0) return false;
            if (i < gridSize-1 && grid[i][j] === grid[i+1][j]) return false;
            if (j < gridSize-1 && grid[i][j] === grid[i][j+1]) return false;
        }
    }
    return true;
}

document.addEventListener('keydown', e => {
    switch(e.key) {
        case 'ArrowUp': move('up'); break;
        case 'ArrowDown': move('down'); break;
        case 'ArrowLeft': move('left'); break;
        case 'ArrowRight': move('right'); break;
    }
});

document.getElementById('restart').onclick = initGrid;

window.onload = initGrid;

// 手機觸控手勢支援
let touchStartX = 0, touchStartY = 0;
let touchEndX = 0, touchEndY = 0;
const minSwipeDistance = 30; // 最小滑動距離

document.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});

document.addEventListener('touchend', function(e) {
    if (e.changedTouches.length === 1) {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) return;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) move('right');
            else move('left');
        } else {
            if (dy > 0) move('down');
            else move('up');
        }
    }
});