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
