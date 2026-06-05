// Calculator state
let current = '0', expr = '', operator = '', prevVal = '', justCalc = false;
let history = [];

// Helper: format number with commas
function fmt(n) {
    if (n === 'Error') return 'Error';
    let num = parseFloat(n);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { maximumFractionDigits: 10, useGrouping: true });
}

function updateDisplay() {
    const resultDiv = document.getElementById('result');
    const exprDiv = document.getElementById('expr');
    let formattedCurr = fmt(current);
    resultDiv.textContent = formattedCurr;
    const rawLen = formattedCurr.replace(/[.,]/g, '').length;
    resultDiv.className = 'display-result' + (rawLen > 8 ? ' small' : '');
    exprDiv.textContent = expr;
}

function addHistory(entry) {
    history.unshift(entry);
    const panel = document.getElementById('historyPanel');
    const emptyDiv = document.getElementById('historyEmpty');
    if (emptyDiv) emptyDiv.style.display = 'none';
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = entry;
    // insert at top
    if (panel.firstChild && panel.firstChild.classList && panel.firstChild.classList.contains('history-empty')) {
        panel.insertBefore(historyItem, panel.firstChild.nextSibling);
    } else {
        panel.insertBefore(historyItem, panel.firstChild);
    }
    // limit history items to 20
    while (panel.children.length > 21) {
        panel.removeChild(panel.lastChild);
    }
}

function pressNum(n) {
    if (justCalc && n !== '.') {
        current = '0';
        expr = '';
        operator = '';
        prevVal = '';
        justCalc = false;
        document.getElementById('exprTop').textContent = '';
        document.getElementById('expr').textContent = '';
    }
    justCalc = false;
    if (n === '.' && current.includes('.')) return;
    if (current === '0' && n !== '.') current = n;
    else current += n;
    updateDisplay();
}

function pressOp(op) {
    if (justCalc) {
        justCalc = false;
    }
    if (prevVal !== '' && operator) {
        calculate(false);
    }
    if (current === 'Error') {
        pressAC();
        return;
    }
    prevVal = current;
    operator = op;
    let prettyPrev = fmt(prevVal);
    expr = prettyPrev + ' ' + op;
    current = '0';
    document.getElementById('exprTop').textContent = '';
    document.getElementById('expr').textContent = expr;
    document.getElementById('result').textContent = fmt(prevVal);
    updateDisplay();
}

function calculate(finish) {
    if (!prevVal || !operator) return false;
    let a = parseFloat(prevVal.replace(/,/g, ''));
    let b = parseFloat(current.replace(/,/g, ''));
    if (isNaN(a)) a = 0;
    if (isNaN(b)) b = 0;
    let res;
    const fullExprRaw = fmt(a) + ' ' + operator + ' ' + fmt(b);
    if (operator === '+') res = a + b;
    else if (operator === '−') res = a - b;
    else if (operator === '×') res = a * b;
    else if (operator === '÷') {
        if (b === 0) res = 'Error';
        else res = a / b;
    }
    else if (operator === '%') res = a * (b / 100);
    else res = 'Error';

    let resultStr = (res === 'Error') ? 'Error' : fmt(res);
    if (finish) {
        const finalEntry = fullExprRaw + ' = ' + resultStr;
        document.getElementById('exprTop').textContent = finalEntry;
        document.getElementById('expr').textContent = '';
        addHistory(finalEntry);
        current = (res === 'Error') ? 'Error' : String(res);
        prevVal = '';
        operator = '';
        expr = '';
        justCalc = true;
        updateDisplay();
        if (current === 'Error') document.getElementById('result').textContent = 'Error';
        return true;
    } else {
        current = (res === 'Error') ? 'Error' : String(res);
        updateDisplay();
        return true;
    }
}

function pressEq() {
    if (prevVal && operator && current !== 'Error') {
        calculate(true);
    } else if (current === 'Error') {
        pressAC();
    } else {
        justCalc = true;
    }
}

function pressAC() {
    current = '0';
    expr = '';
    operator = '';
    prevVal = '';
    justCalc = false;
    document.getElementById('exprTop').textContent = '';
    document.getElementById('expr').textContent = '';
    document.getElementById('result').textContent = '0';
    document.getElementById('result').className = 'display-result';
}

function pressDel() {
    if (justCalc || current === 'Error') {
        pressAC();
        return;
    }
    if (current.length > 1) current = current.slice(0, -1);
    else current = '0';
    updateDisplay();
}

function toggleHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    panel.classList.toggle('open');
}

// Keyboard support
document.addEventListener('keydown', function (e) {
    const key = e.key;
    if (key >= '0' && key <= '9') {
        pressNum(key);
        e.preventDefault();
    } else if (key === '.') {
        pressNum('.');
        e.preventDefault();
    } else if (key === '+') {
        pressOp('+');
        e.preventDefault();
    } else if (key === '-') {
        pressOp('−');
        e.preventDefault();
    } else if (key === '*') {
        pressOp('×');
        e.preventDefault();
    } else if (key === '/') {
        e.preventDefault();
        pressOp('÷');
    } else if (key === '%') {
        pressOp('%');
        e.preventDefault();
    } else if (key === 'Enter' || key === '=') {
        pressEq();
        e.preventDefault();
    } else if (key === 'Backspace') {
        pressDel();
        e.preventDefault();
    } else if (key === 'Escape') {
        pressAC();
        e.preventDefault();
    }
});

// initial display
updateDisplay();
