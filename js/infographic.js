/**
 * js/infographic.js — Shared branded PNG infographic builder
 * Last War Survival Guides — The Command Post
 *
 * Usage:
 *   new IG.Builder('Title', 'Subtitle', {icon:'🔬'})
 *     .section('Section Name')
 *     .list([{text:'Item', note:'Note', highlight:true, color:'#fff'}], {numbered:true})
 *     .table(['Col A','Col B'], [['val','val']], {colWidths:[0.4,0.6]})
 *     .stats([{label:'Iron', value:'1.2M', color:'#60a5fa'}], 3)
 *     .callout('Tip text', 'tip') // type: tip | warning | info
 *     .twoCol(leftGroups, rightGroups) // for checklist-style layouts
 *     .download('filename.png');
 */
const IG = (() => {

  // ── Brand tokens ────────────────────────────────────────────────────────
  const C = {
    BG:       '#09101a',
    ROW_EVEN: 'rgba(18,28,42,0.85)',
    ROW_ODD:  'rgba(28,40,57,0.85)',
    ORANGE:   '#e8720c',
    GOLD:     '#ffd700',
    GOLD_DIM: 'rgba(255,215,0,0.45)',
    TEXT:     '#e8e6f0',
    TEXT_DIM: '#9d9baf',
    BORDER:   'rgba(232,114,14,0.18)',
    SECT_BG:  'rgba(232,114,14,0.07)',
    GREEN:    '#34d399',
    BLUE:     '#60a5fa',
    RED:      '#f87171',
    AMBER:    '#fbbf24',
    PURPLE:   '#c084fc',
    W:        800,
    PAD:      20,
    get CW()  { return this.W - this.PAD * 2; },
    FTITLE:   'Orbitron, "Arial Black", Arial, sans-serif',
    FBODY:    '"Exo 2", Arial, sans-serif',
  };

  // ── Drawing primitives ──────────────────────────────────────────────────

  function _grid(ctx, w, h) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
    ctx.restore();
  }

  function _accent(ctx, w, y, h = 3) {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, 'transparent'); g.addColorStop(0.2, C.ORANGE);
    g.addColorStop(0.8, C.GOLD);    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, y, w, h);
  }

  function _wrap(ctx, text, maxW) {
    const words = String(text).split(' ');
    const lines = []; let cur = '';
    for (const word of words) {
      const t = cur ? `${cur} ${word}` : word;
      if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = word; }
      else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function _trunc(ctx, text, maxW) {
    if (ctx.measureText(text).width <= maxW) return text;
    let t = String(text);
    while (t.length > 0 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }

  function _rr(ctx, x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x+r, y); ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r); ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r); ctx.closePath();
    if (fill)   { ctx.fillStyle   = fill;   ctx.fill();   }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }

  // ── Header & Footer ─────────────────────────────────────────────────────

  const HDR_H = 112, FTR_H = 36;

  function _header(ctx, title, subtitle, icon) {
    const w = C.W;
    const bg = ctx.createLinearGradient(0, 0, 0, HDR_H);
    bg.addColorStop(0, '#09101a'); bg.addColorStop(1, '#060c13');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, HDR_H);
    _grid(ctx, w, HDR_H);
    _accent(ctx, w, 0);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `bold 26px ${C.FTITLE}`;
    ctx.fillStyle = C.GOLD; ctx.shadowColor = C.ORANGE; ctx.shadowBlur = 14;
    ctx.fillText((icon ? icon + ' ' : '') + title, w / 2, 46);
    ctx.shadowBlur = 0;
    if (subtitle) {
      ctx.font = `14px ${C.FBODY}`; ctx.fillStyle = C.TEXT_DIM;
      ctx.fillText(subtitle, w / 2, 70);
    }
    ctx.restore();
    _accent(ctx, w, HDR_H - 3);
    return HDR_H;
  }

  function _footer(ctx, totalH) {
    ctx.save();
    ctx.font = `12px ${C.FBODY}`; ctx.fillStyle = C.GOLD_DIM; ctx.textAlign = 'center';
    ctx.fillText('commandpost.ashmasters.org', C.W / 2, totalH - 10);
    ctx.restore();
  }

  // ── Block registry ──────────────────────────────────────────────────────
  // Each block: { measure(b, mctx) → height,  draw(ctx, b, y) → new_y }

  const BLOCKS = {

    section: {
      measure: () => 38,
      draw(ctx, {text}, y) {
        _rr(ctx, C.PAD, y+5, C.CW, 26, 4, C.SECT_BG);
        ctx.save(); ctx.strokeStyle = C.BORDER; ctx.lineWidth = 1;
        _rr(ctx, C.PAD, y+5, C.CW, 26, 4, null, C.BORDER);
        ctx.font = `bold 11px ${C.FBODY}`; ctx.fillStyle = C.ORANGE; ctx.textAlign = 'left';
        ctx.fillText('▸ ' + text.toUpperCase(), C.PAD + 10, y + 22); ctx.restore();
        return y + 38;
      },
    },

    divider: {
      measure: () => 14,
      draw(ctx, _, y) { _accent(ctx, C.W, y + 6, 1); return y + 14; },
    },

    spacer: {
      measure: (b) => b.h || 12,
      draw(ctx, {h}, y) { return y + (h || 12); },
    },

    table: {
      measure: ({rows}) => 34 + rows.length * 30 + 8,
      draw(ctx, {headers, rows, opts = {}}, y) {
        const cw = C.CW, pad = C.PAD, cols = headers.length;
        const fracs = opts.colWidths || headers.map(() => 1 / cols);
        const cws   = fracs.map(f => f * cw);

        _rr(ctx, pad, y, cw, 34, 5, C.ORANGE);
        ctx.save(); ctx.font = `bold 11px ${C.FBODY}`; ctx.fillStyle = '#fff';
        let cx = pad;
        headers.forEach((h, i) => {
          const al = opts.headerAlign?.[i] || (i === 0 ? 'left' : 'center');
          ctx.textAlign = al;
          ctx.fillText(String(h).toUpperCase(), al === 'center' ? cx + cws[i] / 2 : cx + 8, y + 22);
          cx += cws[i];
        });
        ctx.restore();

        let ry = y + 34;
        rows.forEach((row, ri) => {
          ctx.fillStyle = ri % 2 === 0 ? C.ROW_EVEN : C.ROW_ODD;
          ctx.fillRect(pad, ry, cw, 30);
          ctx.save(); ctx.strokeStyle = C.BORDER; ctx.lineWidth = 1;
          ctx.strokeRect(pad, ry, cw, 30);
          ctx.font = `12px ${C.FBODY}`;
          let cx2 = pad;
          row.forEach((cell, ci) => {
            const al = opts.cellAlign?.[ci] || (ci === 0 ? 'left' : 'center');
            ctx.textAlign = al;
            ctx.fillStyle = opts.cellColor?.[ci] || (ci === 0 ? C.TEXT : C.TEXT_DIM);
            const tx = al === 'center' ? cx2 + cws[ci] / 2 : cx2 + 8;
            ctx.fillText(_trunc(ctx, String(cell ?? '—'), cws[ci] - 16), tx, ry + 19);
            cx2 += cws[ci];
          });
          ctx.restore();
          ry += 30;
        });
        return ry + 8;
      },
    },

    list: {
      measure: ({items}) => items.reduce((h, item) =>
        h + 28 + (typeof item === 'object' && item.detail ? 17 : 0), 0) + 10,
      draw(ctx, {items, opts = {}}, y) {
        const pad = C.PAD + 6; let iy = y + 5;
        items.forEach((item, i) => {
          const text   = typeof item === 'string' ? item : item.text;
          const note   = typeof item === 'object' ? item.note   : null;
          const color  = typeof item === 'object' ? item.color  : null;
          const hi     = typeof item === 'object' ? item.highlight : false;
          const detail = typeof item === 'object' ? item.detail : null;
          const rowH   = 28 + (detail ? 17 : 0);
          if (hi) { ctx.fillStyle = 'rgba(232,114,14,0.10)'; ctx.fillRect(C.PAD, iy, C.CW, rowH); }
          ctx.save(); ctx.textAlign = 'left';
          const maxTW = C.CW - (opts.numbered ? 52 : 34) - (note ? 120 : 8);
          if (opts.numbered) {
            ctx.font = `bold 12px ${C.FBODY}`; ctx.fillStyle = C.GOLD;
            ctx.fillText(`${i + 1}.`, pad, iy + 18);
            ctx.font = `13px ${C.FBODY}`; ctx.fillStyle = color || (hi ? C.GOLD : C.TEXT);
            ctx.fillText(_trunc(ctx, text, maxTW), pad + 26, iy + 18);
          } else {
            ctx.font = `12px ${C.FBODY}`; ctx.fillStyle = C.ORANGE;
            ctx.fillText('▸', pad, iy + 18);
            ctx.font = `13px ${C.FBODY}`; ctx.fillStyle = color || C.TEXT;
            ctx.fillText(_trunc(ctx, text, maxTW), pad + 18, iy + 18);
          }
          if (note) {
            ctx.font = `11px ${C.FBODY}`; ctx.fillStyle = C.TEXT_DIM; ctx.textAlign = 'right';
            ctx.fillText(String(note), C.W - C.PAD, iy + 18);
          }
          if (detail) {
            ctx.font = `11px ${C.FBODY}`; ctx.fillStyle = C.TEXT_DIM; ctx.textAlign = 'left';
            ctx.fillText(_trunc(ctx, detail, C.CW - (opts.numbered ? 52 : 30)), pad + (opts.numbered ? 26 : 18), iy + 33);
          }
          ctx.restore(); iy += rowH;
        });
        return iy + 5;
      },
    },

    stats: {
      _cols: ({items, cols}) => cols || (items.length <= 4 ? items.length : 3),
      measure({items, cols}) { const c = this._cols({items,cols}); return Math.ceil(items.length / c) * 72 + 10; },
      draw(ctx, {items, cols}, y) {
        const c  = this._cols({items, cols});
        const cw = (C.CW - (c - 1) * 8) / c;
        let iy = y + 6;
        for (let r = 0; r < Math.ceil(items.length / c); r++) {
          for (let ci = 0; ci < c; ci++) {
            const idx = r * c + ci; if (idx >= items.length) break;
            const s = items[idx]; const x = C.PAD + ci * (cw + 8);
            _rr(ctx, x, iy, cw, 62, 8, C.ROW_EVEN, C.BORDER);
            ctx.save(); ctx.textAlign = 'center';
            ctx.font = `bold 18px ${C.FTITLE}`; ctx.fillStyle = s.color || C.GOLD;
            ctx.fillText(_trunc(ctx, String(s.value), cw - 16), x + cw / 2, iy + 30);
            ctx.font = `10px ${C.FBODY}`; ctx.fillStyle = C.TEXT_DIM;
            ctx.fillText(String(s.label).toUpperCase(), x + cw / 2, iy + 48);
            ctx.restore();
          }
          iy += 72;
        }
        return iy + 4;
      },
    },

    text: {
      measure(b, mctx) {
        mctx.font = `${b.opts?.bold ? 'bold ' : ''}${b.opts?.size || 13}px ${C.FBODY}`;
        return _wrap(mctx, b.text, C.CW - 8).length * 20 + 10;
      },
      draw(ctx, {text, opts = {}}, y) {
        ctx.save();
        ctx.font = `${opts.bold ? 'bold ' : ''}${opts.size || 13}px ${C.FBODY}`;
        ctx.fillStyle = opts.color || C.TEXT; ctx.textAlign = opts.align || 'left';
        const lines = _wrap(ctx, text, C.CW - 8);
        const x = opts.align === 'center' ? C.W / 2 : C.PAD + 8;
        lines.forEach((l, i) => ctx.fillText(l, x, y + 16 + i * 20));
        ctx.restore(); return y + lines.length * 20 + 10;
      },
    },

    badgeRow: {
      // Returns number of rows needed to lay out all badges within CW
      _rows(mctx, badges) {
        mctx.font = `bold 11px ${C.FBODY}`;
        let bx = C.PAD, rows = 1;
        badges.forEach(b => {
          const tw = mctx.measureText(b.text).width + 20;
          if (bx + tw > C.W - C.PAD && bx > C.PAD) { bx = C.PAD; rows++; }
          bx += tw + 8;
        });
        return rows;
      },
      measure(b, mctx) { return this._rows(mctx, b.badges) * 34 + 14; },
      draw(ctx, {badges}, y) {
        ctx.save(); ctx.font = `bold 11px ${C.FBODY}`;
        let bx = C.PAD, row = 0;
        badges.forEach(b => {
          const tw = ctx.measureText(b.text).width + 20;
          if (bx + tw > C.W - C.PAD && bx > C.PAD) { bx = C.PAD; row++; }
          const by = y + 8 + row * 34;
          _rr(ctx, bx, by, tw, 24, 12, b.bg || C.SECT_BG, b.color || C.ORANGE);
          ctx.fillStyle = b.color || C.ORANGE; ctx.textAlign = 'center';
          ctx.fillText(b.text, bx + tw / 2, by + 16); bx += tw + 8;
        });
        ctx.restore(); return y + (row + 1) * 34 + 14;
      },
    },

    callout: {
      measure(b, mctx) {
        mctx.font = `13px ${C.FBODY}`;
        return _wrap(mctx, b.text, C.CW - 36).length * 20 + 22;
      },
      draw(ctx, {text, calloutType}, y) {
        const styles = {
          tip:     { bg: 'rgba(255,215,0,0.08)',   border: C.GOLD,   icon: '💡' },
          warning: { bg: 'rgba(232,114,14,0.12)',  border: C.ORANGE, icon: '⚠️' },
          info:    { bg: 'rgba(100,150,255,0.08)', border: '#6496ff', icon: 'ℹ️' },
        };
        const s = styles[calloutType] || styles.tip;
        ctx.save(); ctx.font = `13px ${C.FBODY}`;
        const lines = _wrap(ctx, text, C.CW - 36);
        const h = lines.length * 20 + 22;
        _rr(ctx, C.PAD, y, C.CW, h, 6, s.bg, s.border);
        ctx.fillStyle = s.border; ctx.textAlign = 'left';
        lines.forEach((l, i) => ctx.fillText((i === 0 ? s.icon + ' ' : '    ') + l, C.PAD + 12, y + 16 + i * 20));
        ctx.restore(); return y + h + 8;
      },
    },

    // Two-column checklist layout: [{label, color, items:[{text, done}]}] × 2
    twoCol: {
      measure({leftGroups, rightGroups}) {
        const colH = groups => groups.reduce((s, g) => s + 22 + g.items.length * 26 + 8, 0);
        return Math.max(colH(leftGroups), colH(rightGroups)) + 16;
      },
      draw(ctx, {leftGroups, rightGroups}, y) {
        const colW = (C.CW - 8) / 2;
        let maxY = y;
        [[leftGroups, C.PAD], [rightGroups, C.PAD + colW + 8]].forEach(([groups, ox]) => {
          let cy = y + 8;
          groups.forEach(g => {
            ctx.save();
            ctx.font = `bold 11px ${C.FBODY}`; ctx.fillStyle = g.color || C.ORANGE; ctx.textAlign = 'left';
            ctx.fillText(('▸ ' + g.label).toUpperCase(), ox + 4, cy + 14); cy += 22;
            g.items.forEach(item => {
              const text = typeof item === 'string' ? item : item.text;
              const done = typeof item === 'object' ? !!item.done : false;
              ctx.font = `13px ${C.FBODY}`;
              ctx.fillStyle = done ? C.GREEN : C.TEXT_DIM; ctx.textAlign = 'left';
              ctx.fillText(done ? '☑' : '☐', ox + 4, cy + 16);
              ctx.fillStyle = done ? C.TEXT_DIM : C.TEXT;
              ctx.fillText(_trunc(ctx, text, colW - 38), ox + 22, cy + 16);
              cy += 26;
            });
            cy += 8; ctx.restore();
          });
          maxY = Math.max(maxY, cy);
        });
        return maxY;
      },
    },

  };

  // ── Builder class ────────────────────────────────────────────────────────

  class Builder {
    constructor(title, subtitle, opts = {}) {
      this._title    = title;
      this._subtitle = subtitle || '';
      this._icon     = opts.icon || '';
      this._queue    = [];
      const mc = document.createElement('canvas');
      mc.width = C.W; mc.height = 2;
      this._mx = mc.getContext('2d');
    }

    section(text)                    { this._queue.push({ type: 'section', text });                       return this; }
    divider()                        { this._queue.push({ type: 'divider' });                             return this; }
    spacer(h)                        { this._queue.push({ type: 'spacer', h });                           return this; }
    table(headers, rows, opts)       { this._queue.push({ type: 'table', headers, rows, opts });          return this; }
    list(items, opts)                { this._queue.push({ type: 'list', items, opts });                   return this; }
    stats(items, cols)               { this._queue.push({ type: 'stats', items, cols });                  return this; }
    text(t, opts)                    { this._queue.push({ type: 'text', text: t, opts });                 return this; }
    badgeRow(badges)                 { this._queue.push({ type: 'badgeRow', badges });                    return this; }
    callout(text, type)              { this._queue.push({ type: 'callout', text, calloutType: type || 'tip' }); return this; }
    twoCol(leftGroups, rightGroups)  { this._queue.push({ type: 'twoCol', leftGroups, rightGroups });    return this; }

    _measure(b) {
      const blk = BLOCKS[b.type]; if (!blk) return 0;
      return blk.measure(b, this._mx);
    }

    _render() {
      const contentH = this._queue.reduce((s, b) => s + this._measure(b), 0);
      const totalH   = HDR_H + C.PAD + contentH + FTR_H;
      const cv = document.createElement('canvas');
      cv.width = C.W; cv.height = totalH;
      const ctx = cv.getContext('2d');

      const bg = ctx.createLinearGradient(0, 0, 0, totalH);
      bg.addColorStop(0, C.BG); bg.addColorStop(1, '#060c13');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, C.W, totalH);
      _grid(ctx, C.W, totalH);

      let y = _header(ctx, this._title, this._subtitle, this._icon) + C.PAD;
      for (const b of this._queue) {
        const blk = BLOCKS[b.type]; if (blk) y = blk.draw(ctx, b, y);
      }
      _footer(ctx, totalH);
      return cv;
    }

    getDataURL() { return this._render().toDataURL('image/png'); }

    download(filename) {
      document.fonts.ready.then(() => {
        const url = this.getDataURL();
        const a = document.createElement('a');
        a.href = url; a.download = filename || 'infographic.png'; a.click();
      });
    }
  }

  return { Builder, C };
})();
