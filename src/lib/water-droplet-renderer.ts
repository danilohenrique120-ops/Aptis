export interface DropletColorPalette {
  rim: string;
  mid: string;
  core: string;
  glow: string;
  highlight: string;
}

export const WATER_DROPLET_PALETTES: Record<string, DropletColorPalette> = {
  cyan: {
    rim: 'rgba(186, 230, 253, 0.95)',
    mid: 'rgba(6, 182, 212, 0.42)',
    core: 'rgba(37, 99, 235, 0.55)',
    glow: 'rgba(34, 211, 238, 0.72)',
    highlight: 'rgba(255, 255, 255, 0.96)'
  },
  emerald: {
    rim: 'rgba(167, 243, 208, 0.95)',
    mid: 'rgba(16, 185, 129, 0.44)',
    core: 'rgba(5, 150, 105, 0.55)',
    glow: 'rgba(52, 211, 153, 0.72)',
    highlight: 'rgba(255, 255, 255, 0.96)'
  },
  purple: {
    rim: 'rgba(221, 214, 254, 0.95)',
    mid: 'rgba(139, 92, 246, 0.45)',
    core: 'rgba(109, 40, 217, 0.56)',
    glow: 'rgba(167, 139, 250, 0.72)',
    highlight: 'rgba(255, 255, 255, 0.96)'
  },
  amber: {
    rim: 'rgba(253, 230, 138, 0.95)',
    mid: 'rgba(245, 158, 11, 0.44)',
    core: 'rgba(217, 119, 6, 0.55)',
    glow: 'rgba(251, 191, 36, 0.72)',
    highlight: 'rgba(255, 255, 255, 0.96)'
  }
};

export function resolvePaletteFromColor(rawColor?: string): DropletColorPalette {
  const c = (rawColor || '').toLowerCase();
  if (
    c.includes('10b981') ||
    c.includes('34d399') ||
    c.includes('059669') ||
    c.includes('16, 185, 129')
  ) {
    return WATER_DROPLET_PALETTES.emerald;
  }
  if (
    c.includes('8b5cf6') ||
    c.includes('a855f7') ||
    c.includes('a78bfa') ||
    c.includes('7c3aed') ||
    c.includes('6d28d9') ||
    c.includes('139, 92, 246')
  ) {
    return WATER_DROPLET_PALETTES.purple;
  }
  if (
    c.includes('f59e0b') ||
    c.includes('fbbf24') ||
    c.includes('d97706') ||
    c.includes('245, 158, 11')
  ) {
    return WATER_DROPLET_PALETTES.amber;
  }
  return WATER_DROPLET_PALETTES.cyan;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export interface RectPill {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
}

function traceRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Desenha uma micro-gota d'água 3D cristalina (usada nas gotículas que se separam entre barras).
 */
export function drawWaterSphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleRad: number,
  palette: DropletColorPalette,
  alpha = 1
) {
  if (rx <= 0.4 || ry <= 0.4 || alpha <= 0.01) return;
  const maxR = Math.max(rx, ry);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = Math.max(8, maxR * 1.45);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

  const bodyGrad = ctx.createRadialGradient(-rx * 0.15, -ry * 0.15, maxR * 0.08, 0, 0, maxR);
  bodyGrad.addColorStop(0, palette.core);
  bodyGrad.addColorStop(0.55, palette.mid);
  bodyGrad.addColorStop(0.88, palette.rim);
  bodyGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, maxR * 0.18);
  ctx.strokeStyle = palette.rim;
  ctx.stroke();

  const hx = -rx * 0.34;
  const hy = -ry * 0.34;
  const specGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, maxR * 0.4);
  specGrad.addColorStop(0, palette.highlight);
  specGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.8)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(hx, hy, Math.max(1.2, rx * 0.38), Math.max(1.0, ry * 0.32), -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Desenha uma barra/pílula com estética de água líquida 3D (volume translúcido + brilho superior + contorno luminoso).
 */
function drawWaterPill(
  ctx: CanvasRenderingContext2D,
  pill: RectPill,
  palette: DropletColorPalette,
  alpha = 1
) {
  if (pill.w <= 2 || pill.h <= 2 || alpha <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 16;
  traceRoundedRect(ctx, pill.x, pill.y, pill.w, pill.h, pill.r);

  const grad = ctx.createLinearGradient(pill.x, pill.y, pill.x + pill.w, pill.y + pill.h);
  grad.addColorStop(0, palette.core);
  grad.addColorStop(0.55, palette.mid);
  grad.addColorStop(1, palette.core);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.restore();

  // Borda externa de tensão superficial
  traceRoundedRect(ctx, pill.x + 0.5, pill.y + 0.5, pill.w - 1, pill.h - 1, pill.r);
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = palette.rim;
  ctx.stroke();

  // Reflexo especular vítreo na borda superior da barra d'água
  ctx.save();
  traceRoundedRect(ctx, pill.x + 1, pill.y + 1, pill.w - 2, Math.max(3, pill.h * 0.45), pill.r);
  const topSheen = ctx.createLinearGradient(0, pill.y, 0, pill.y + pill.h * 0.45);
  topSheen.addColorStop(0, 'rgba(255, 255, 255, 0.34)');
  topSheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = topSheen;
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/**
 * Desenha a ponte líquida côncava conectando duas barras durante o descolamento (efeito tensão superficial).
 */
function drawLiquidBridgeBetweenPills(
  ctx: CanvasRenderingContext2D,
  pillA: RectPill,
  pillB: RectPill,
  pinchFactor: number, // 1 = largo -> 0.1 = quase rompendo
  palette: DropletColorPalette,
  alpha = 1
) {
  const ax = pillA.x + pillA.w / 2;
  const ay = pillA.y + pillA.h / 2;
  const bx = pillB.x + pillB.w / 2;
  const by = pillB.y + pillB.h / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return;

  const nx = -dy / dist;
  const ny = dx / dist;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;

  const isVertical = Math.abs(dy) >= Math.abs(dx);
  const baseSpan = isVertical
    ? Math.min(pillA.w, pillB.w) * 0.24
    : Math.min(pillA.h, pillB.h) * 0.34;

  const endHalf = Math.max(4, baseSpan);
  const waistHalf = Math.max(1.8, endHalf * pinchFactor);

  // Pontos nas extremidades de A e B voltadas para o vão
  const spanA = isVertical ? Math.min(pillA.h * 0.28, 12) : Math.min(pillA.w * 0.28, 18);
  const spanB = isVertical ? Math.min(pillB.h * 0.28, 12) : Math.min(pillB.w * 0.28, 18);
  const ux = dx / dist;
  const uy = dy / dist;

  const startX = ax + ux * spanA;
  const startY = ay + uy * spanA;
  const endX = bx - ux * spanB;
  const endY = by - uy * spanB;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(startX + nx * endHalf, startY + ny * endHalf);
  ctx.quadraticCurveTo(mx + nx * waistHalf, my + ny * waistHalf, endX + nx * endHalf, endY + ny * endHalf);
  ctx.lineTo(endX - nx * endHalf, endY - ny * endHalf);
  ctx.quadraticCurveTo(mx - nx * waistHalf, my - ny * waistHalf, startX - nx * endHalf, startY - ny * endHalf);
  ctx.closePath();

  const grad = ctx.createLinearGradient(startX, startY, endX, endY);
  grad.addColorStop(0, palette.mid);
  grad.addColorStop(0.5, palette.rim);
  grad.addColorStop(1, palette.mid);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.rim;
  ctx.stroke();
  ctx.restore();
}

export interface BarTransitionFrameParams {
  from: RectPill;
  to: RectPill;
  progress: number; // 0 -> 1 (~740ms)
  palette: DropletColorPalette;
}

/**
 * Anima a PRÓPRIA BARRA DE SELEÇÃO se separando e deslizando como gota de água:
 *  1) A pílula se descola da origem mantendo uma ponte líquida côncava (0.00 -> 0.28)
 *  2) A tensão rompe formando 3 micro-gotas d'água (o O o) atrás da barra que desliza (0.28 -> 0.74)
 *  3) A barra chega com leve oscilação elástica de água e assenta limpa na seleção (0.74 -> 1.00)
 */
export function renderWaterBarTransitionFrame(
  ctx: CanvasRenderingContext2D,
  p: BarTransitionFrameParams
) {
  const { from, to, progress, palette } = p;
  const ax = from.x + from.w / 2;
  const ay = from.y + from.h / 2;
  const bx = to.x + to.w / 2;
  const by = to.y + to.h / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) {
    drawWaterPill(ctx, to, palette, 1);
    return;
  }

  const angle = Math.atan2(dy, dx);
  const dirX = dx / dist;
  const dirY = dy / dist;
  const isVertical = Math.abs(dy) >= Math.abs(dx);

  if (progress < 0.28) {
    // FASE 1: Barra principal começa a sair mantendo poça líquida ancorada na origem + pescoço côncavo
    const u = easeInOutCubic(progress / 0.28);
    const pullFraction = 0.32 * u;

    const leadW = lerp(from.w, to.w, u * 0.35);
    const leadH = lerp(from.h, to.h, u * 0.35);
    const leadPill: RectPill = {
      x: ax + dx * pullFraction - leadW / 2,
      y: ay + dy * pullFraction - leadH / 2,
      w: leadW,
      h: leadH,
      r: lerp(from.r, to.r, u * 0.35)
    };

    const anchorScale = 1 - 0.35 * u;
    const anchorW = Math.max(18, from.w * (isVertical ? 0.72 : anchorScale));
    const anchorH = Math.max(14, from.h * (isVertical ? anchorScale : 0.78));
    const anchorPill: RectPill = {
      x: ax - anchorW / 2,
      y: ay - anchorH / 2,
      w: anchorW,
      h: anchorH,
      r: Math.min(anchorW, anchorH) / 2
    };

    drawLiquidBridgeBetweenPills(ctx, anchorPill, leadPill, 0.82 - 0.65 * u, palette, 0.92);
    drawWaterPill(ctx, anchorPill, palette, 0.65 - 0.2 * u);
    drawWaterPill(ctx, leadPill, palette, 0.98);
    return;
  }

  if (progress < 0.74) {
    // FASE 2: Ruptura — a barra desliza até o destino deixando 3 micro-gotinhas 3D (o O o) no rastro
    const u = (progress - 0.28) / 0.46;
    const travel = easeOutCubic(u);
    const globalPosT = 0.32 + 0.68 * travel;

    const curW = lerp(from.w, to.w, 0.35 + 0.65 * travel);
    const curH = lerp(from.h, to.h, 0.35 + 0.65 * travel);

    // Leve elasticidade de água durante o movimento
    const osc = Math.exp(-3.5 * u) * Math.cos(u * Math.PI * 2.4);
    const stretchW = isVertical ? 1 + 0.04 * osc : 1 - 0.05 * osc;
    const stretchH = isVertical ? 1 - 0.08 * osc : 1 + 0.06 * osc;

    const finalW = curW * stretchW;
    const finalH = curH * stretchH;

    const mainPill: RectPill = {
      x: ax + dx * globalPosT - finalW / 2,
      y: ay + dy * globalPosT - finalH / 2,
      w: finalW,
      h: finalH,
      r: lerp(from.r, to.r, travel)
    };

    // Ponto traseiro que vai se retraindo atrás da barra principal
    const tailU = easeInOutCubic(Math.min(1, u * 1.15));
    const tailCenterX = lerp(ax, bx, tailU * 0.85);
    const tailCenterY = lerp(ay, by, tailU * 0.85);

    const leadCenterX = mainPill.x + mainPill.w / 2;
    const leadCenterY = mainPill.y + mainPill.h / 2;
    const wakeGap = Math.hypot(leadCenterX - tailCenterX, leadCenterY - tailCenterY);

    // As 3 gotinhas de água 3D (o O o) se formam e acompanham na esteira da separação!
    if (wakeGap > 14) {
      const beadAlpha = Math.sin(Math.min(1, u) * Math.PI) * 0.95;
      const midX = (tailCenterX + leadCenterX) / 2;
      const midY = (tailCenterY + leadCenterY) / 2;
      const spread = Math.min(wakeGap * 0.26, 16);
      const baseR = isVertical ? 4.4 : 4.8;

      const beads = [
        { offset: -spread, r: baseR * 0.58 },
        { offset: 0, r: baseR },
        { offset: spread, r: baseR * 0.62 }
      ];

      for (const b of beads) {
        drawWaterSphere(
          ctx,
          midX + dirX * b.offset,
          midY + dirY * b.offset,
          b.r,
          b.r,
          angle,
          palette,
          beadAlpha
        );
      }
    }

    drawWaterPill(ctx, mainPill, palette, 1);
    return;
  }

  // FASE 3: Acomodação orgânica na barra de destino (oscilação suave da película de água)
  const u = (progress - 0.74) / 0.26;
  const wobble = Math.exp(-4.4 * u) * Math.sin(u * Math.PI * 2.8);
  const sx = isVertical ? 1 + 0.03 * wobble : 1 - 0.025 * wobble;
  const sy = isVertical ? 1 - 0.04 * wobble : 1 + 0.04 * wobble;

  const w = to.w * sx;
  const h = to.h * sy;
  drawWaterPill(
    ctx,
    {
      x: bx - w / 2,
      y: by - h / 2,
      w,
      h,
      r: to.r
    },
    palette,
    1
  );
}
