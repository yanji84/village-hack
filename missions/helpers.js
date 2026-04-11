// missions/helpers.js — shared helper functions

// Caesar Cipher Encrypt
export function caesarEncrypt(text, shift) {
  return text.split('').map(c => {
    if (c === ' ') return ' ';
    const code = c.charCodeAt(0) - 65;
    return String.fromCharCode(((code + shift) % 26) + 65);
  }).join('');
}

// Render a 2D binary grid as colored pixel squares
export function renderPixelGrid(container, grid) {
  const gridDiv = document.createElement('div');
  gridDiv.style.cssText = 'display:inline-grid;gap:3px;margin:12px 0;padding:14px;border:1px solid #005a15;background:#050505;border-radius:4px;';
  gridDiv.style.gridTemplateColumns = `repeat(${grid[0].length}, 28px)`;
  for (const row of grid) {
    for (const bit of row) {
      const cell = document.createElement('div');
      cell.style.cssText = `width:28px;height:28px;border-radius:3px;border:1px solid ${bit ? '#00aa2a' : '#1a2a1a'};background:${bit ? '#00ff41' : '#111'};box-shadow:${bit ? '0 0 6px #00ff41' : 'none'};`;
      gridDiv.appendChild(cell);
    }
  }
  container.appendChild(gridDiv);
  container.scrollTop = container.scrollHeight;
}

// Render a visual "variable box"
export function renderBox(name, value) {
  const v = value === undefined ? '' : String(value);
  return `  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n  \u2502  ${name.padEnd(8)}\u2502\n  \u2502  ${(v || '        ').toString().padEnd(8)}\u2502\n  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`;
}

// Create an animated DOM-based variable box
export function createBoxElement(name, initialValue) {
  const box = document.createElement('div');
  box.style.cssText = 'border:1px solid #00aa2a;background:#0d1117;padding:10px 16px;border-radius:4px;min-width:80px;text-align:center;font-family:"Fira Mono",monospace;display:inline-block;transition:border-color 0.3s;';

  const label = document.createElement('div');
  label.textContent = name;
  label.style.cssText = 'font-size:11px;color:#00aa2a;text-transform:uppercase;margin-bottom:6px;';

  const valueEl = document.createElement('div');
  valueEl.style.cssText = 'font-size:20px;color:#00ff41;font-weight:bold;transition:opacity 0.3s,transform 0.3s;';
  if (initialValue !== undefined) {
    valueEl.textContent = String(initialValue);
  }

  box.appendChild(label);
  box.appendChild(valueEl);
  box._valueEl = valueEl;
  return box;
}

// Animate updating the value inside a box element
export function updateBoxValue(boxEl, newValue) {
  return new Promise(resolve => {
    const valEl = boxEl._valueEl;
    // Fade out old value
    valEl.style.opacity = '0';
    valEl.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      // Swap text
      valEl.textContent = String(newValue);
      // Fade in new value
      valEl.style.opacity = '1';
      valEl.style.transform = 'translateY(0)';
      setTimeout(resolve, 300);
    }, 350);
  });
}

// Briefly pulse the border color of a box for emphasis
export function flashBox(boxEl, color = '#ff4444') {
  return new Promise(resolve => {
    const orig = boxEl.style.borderColor;
    boxEl.style.borderColor = color;
    setTimeout(() => {
      boxEl.style.borderColor = orig;
      setTimeout(resolve, 300);
    }, 400);
  });
}
