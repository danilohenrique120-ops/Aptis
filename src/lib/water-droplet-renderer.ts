export interface DropletColorPalette {
  rim: string;
  mid: string;
  core: string;
  glow: string;
  highlight: string;
}

export const WATER_DROPLET_PALETTES: Record<string, DropletColorPalette> = {
  cyan: {
    rim: 'rgba(186, 230, 253, 0.96)',
    mid: 'rgba(56, 189, 248, 0.78)',
    core: 'rgba(14, 116, 144, 0.42)',
    glow: 'rgba(34, 211, 238, 0.85)',
    highlight: 'rgba(255, 255, 255, 0.98)'
  },
  emerald: {
    rim: 'rgba(167, 243, 208, 0.96)',
    mid: 'rgba(52, 211, 153, 0.78)',
    core: 'rgba(6, 95, 70, 0.42)',
    glow: 'rgba(16, 185, 129, 0.85)',
    highlight: 'rgba(255, 255, 255, 0.98)'
  },
  purple: {
    rim: 'rgba(221, 214, 254, 0.96)',
    mid: 'rgba(167, 139, 250, 0.78)',
    core: 'rgba(76, 29, 149, 0.42)',
    glow: 'rgba(139, 92, 246, 0.85)',
    highlight: 'rgba(255, 255, 255, 0.98)'
  },
  amber: {
    rim: 'rgba(253, 230, 138, 0.96)',
    mid: 'rgba(251, 191, 36, 0.78)',
    core: 'rgba(120, 53, 15, 0.4)',
    glow: 'rgba(245, 158, 11, 0.85)',
    highlight: 'rgba(255, 255, 255, 0.98)'
  }
};

export function resolvePaletteFromColor(rawColor?: string): DropletColorPalette {
  const c = (rawColor || '').toLowerCase();
  if (c.includes('10b981') || c.includes('34d399') || c.includes('059669') || c.includes('16, 185, 129')) {
    return WATER_DROPLET_PALETTES.emerald;
  }
  if (c.includes('8b5cf6') || c.includes('a855f7') || c.includes('a78bfa') || c.includes('7c3aed') || c.includes('139, 92, 246')) {
    return WATER_DROPLET_PALETTES.purple;
  }
  if (c.includes('f59e0b') || c.includes('fbbf24') || c.includes('d97706') || c.includes('245, 158, 11')) {
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

/**
 * Desenha uma gota de água 3D translúcida com borda luminosa, núcleo profundo e brilho especular.
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

  // Halo externo suave
  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = Math.max(8, maxR * 1.35);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);

  // Volume translúcido 3D (centro profundo -> borda ciano brilhante)
  const bodyGrad = ctx.createRadialGradient(-rx * 0.15, -ry * 0.15, maxR * 0.08, 0, 0, maxR);
  bodyGrad.addColorStop(0, palette.core);
  bodyGrad.addColorStop(0.55, palette.mid);
  bodyGrad.addColorStop(0.88, palette.rim);
  bodyGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // Contorno luminoso da película de tensão superficial
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, maxR * 0.16);
  ctx.strokeStyle = palette.rim;
  ctx.stroke();

  // Reflexo secundário suave (inferior direito)
  const bounceGrad = ctx.createRadialGradient(rx * 0.34, ry * 0.34, 0, rx * 0.34, ry * 0.34, maxR * 0.42);
  bounceGrad.addColorStop(0, 'rgba(186, 230, 253, 0.72)');
  bounceGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
  ctx.fillStyle = bounceGrad;
  ctx.beginPath();
  ctx.ellipse(rx * 0.3, ry * 0.3, rx * 0.42, ry * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brilho especular branco cristalino (superior esquerdo, como no vídeo de referência)
  const hx = -rx * 0.34;
  const hy = -ry * 0.34;
  const specGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, maxR * 0.38);
  specGrad.addColorStop(0, palette.highlight);
  specGrad.addColorStop(0.45, 'rgba(224, 242, 254, 0.82)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.ellipse(hx, hy, Math.max(1.4, rx * 0.38), Math.max(1.2, ry * 0.32), -0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Desenha duas gotas unidas por um pescoço líquido orgânico (forma de amendoim / mitose da água).
 */
export function drawCoalescedPeanutDrop(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  waistFactor: number, // 1.0 = sobrepostas -> 0.15 = quase rompendo
  palette: DropletColorPalette,
  alpha = 1
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist < 1.2) {
    drawWaterSphere(ctx, (x1 + x2) / 2, (y1 + y2) / 2, radius, radius, 0, palette, alpha);
    return;
  }

  const angle = Math.atan2(dy, dx);
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const halfD = dist / 2;
  const r = radius;
  const waistY = Math.max(r * 0.14, r * waistFactor);

  // Ângulo de junção entre as calotas esféricas e a cintura côncava
  const joinAngle = Math.PI * 0.34;
  const jx = r * Math.cos(joinAngle);
  const jy = r * Math.sin(joinAngle);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(mx, my);
  ctx.rotate(angle);

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = Math.max(10, r * 1.4);

  ctx.beginPath();
  // Arco esquerdo (Gota 1)
  ctx.arc(-halfD, 0, r, joinAngle, Math.PI * 2 - joinAngle, false);
  // Cintura superior côncava ligando à Gota 2
  ctx.quadraticCurveTo(0, -waistY, halfD - jx, -jy);
  // Arco direito (Gota 2)
  ctx.arc(halfD, 0, r, Math.PI + joinAngle, Math.PI - joinAngle, false);
  // Cintura inferior côncava voltando para Gota 1
  ctx.quadraticCurveTo(0, waistY, -halfD + jx, jy);
  ctx.closePath();

  const bodyGrad = ctx.createRadialGradient(0, 0, waistY * 0.25, 0, 0, halfD + r);
  bodyGrad.addColorStop(0, palette.core);
  bodyGrad.addColorStop(0.55, palette.mid);
  bodyGrad.addColorStop(0.92, palette.rim);
  bodyGrad.addColorStop(1, '#ffffff');
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.restore();

  // Contorno nítido de tensão superficial
  ctx.lineWidth = Math.max(1.1, r * 0.16);
  ctx.strokeStyle = palette.rim;
  ctx.stroke();

  // Núcleos internos & brilhos especulares em cada lobo da gota em separação
  for (const lobeX of [-halfD, halfD]) {
    const innerGrad = ctx.createRadialGradient(lobeX, 0, r * 0.05, lobeX, 0, r * 0.72);
    innerGrad.addColorStop(0, palette.core);
    innerGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.28)');
    innerGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.arc(lobeX, 0, r * 0.72, 0, Math.PI * 2);
    ctx.fill();

    const hx = lobeX - r * 0.3;
    const hy = -r * 0.3;
    const spec = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.38);
    spec.addColorStop(0, palette.highlight);
    spec.addColorStop(0.5, 'rgba(224, 242, 254, 0.75)');
    spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spec;
    ctx.beginPath();
    ctx.arc(hx, hy, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export interface DropletTransitionFrameParams {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0 -> 1 ao longo de ~760ms
  baseRadius: number;
  palette: DropletColorPalette;
}

/**
 * Renderiza exatamente a coreografia do vídeo de referência:
 *  1) Alongamento e pescoço líquido (0.00 -> 0.26)
 *  2) Ruptura com recuo elástico (squash & stretch) + 3 micro-gotinhas suspensas o O o (0.26 -> 0.70)
 *  3) Fusão suave com a aba/menu destino e oscilação de acomodação (0.70 -> 1.00)
 */
export function renderWaterDropletTransitionFrame(
  ctx: CanvasRenderingContext2D,
  p: DropletTransitionFrameParams
) {
  const { fromX, fromY, toX, toY, progress, baseRadius, palette } = p;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return;

  const angle = Math.atan2(dy, dx);
  const dirX = dx / dist;
  const dirY = dy / dist;

  // Distância visual máxima do pescoço antes de romper (proporcional ao raio da gota)
  const snapBreakDist = Math.min(dist * 0.42, baseRadius * 2.55);

  if (progress < 0.26) {
    // FASE 1: Separação por tensão superficial (Amendoim líquido se esticando)
    const u = easeInOutCubic(progress / 0.26);
    const curSep = snapBreakDist * u;
    const x1 = fromX + dirX * (curSep * 0.1);
    const y1 = fromY + dirY * (curSep * 0.1);
    const x2 = fromX + dirX * curSep;
    const y2 = fromY + dirY * curSep;
    const waist = 0.85 - 0.68 * u;
    const radius = baseRadius * (0.9 + 0.14 * u);

    drawCoalescedPeanutDrop(ctx, x1, y1, x2, y2, radius, waist, palette, 1);
    return;
  }

  if (progress < 0.74) {
    // FASE 2: Ruptura com 3 gotinhas satélites (o O o) no meio do vão + recuo elástico das gotas!
    const u = (progress - 0.26) / 0.48;
    const easedTravel = easeOutCubic(u);

    // Gota que viaja para o destino
    const travelStartDist = snapBreakDist;
    const curDist2 = travelStartDist + (dist - travelStartDist) * Math.min(1, easedTravel * 0.96);
    const x2 = fromX + dirX * curDist2;
    const y2 = fromY + dirY * curDist2;

    // Gota de origem escorrega atrás para alcançar e se fundir na segunda metade
    const tailU = easeInOutCubic(Math.max(0, (u - 0.22) / 0.78));
    const curDist1 = snapBreakDist * 0.1 + (dist * 0.84) * tailU;
    const x1 = fromX + dirX * curDist1;
    const y1 = fromY + dirY * curDist1;

    // Recuo ortogonal preservando volume (comprime no eixo do corte, estica na perpendicular -> exatamente frame 00:02!)
    const snapOsc = Math.exp(-3.6 * u) * Math.cos(u * Math.PI * 2.6);
    const scaleParallel2 = 1 - 0.22 * snapOsc;
    const scalePerp2 = 1 / scaleParallel2;

    const scaleParallel1 = 1 - 0.18 * snapOsc;
    const scalePerp1 = 1 / scaleParallel1;

    // Desenha as 3 micro-gotinhas icônicas (o O o) entre Gota 1 e Gota 2!
    const gap = Math.hypot(x2 - x1, y2 - y1);
    if (gap > baseRadius * 1.45) {
      const beadAlpha = Math.sin(Math.min(1, u) * Math.PI) * 0.95;
      const beadMidX = (x1 + x2) / 2;
      const beadMidY = (y1 + y2) / 2;
      const beadSpread = Math.min(gap * 0.22, baseRadius * 1.55);

      const beads = [
        { offset: -beadSpread, r: baseRadius * 0.26 },
        { offset: 0, r: baseRadius * 0.44 },
        { offset: beadSpread, r: baseRadius * 0.26 }
      ];

      for (const b of beads) {
        drawWaterSphere(
          ctx,
          beadMidX + dirX * b.offset,
          beadMidY + dirY * b.offset,
          b.r,
          b.r,
          angle,
          palette,
          beadAlpha
        );
      }
    }

    // Se a cauda alcançou o destino, desenha coalescendo suavemente
    if (gap < baseRadius * 2.1 && u > 0.65) {
      const mergeWaist = 0.22 + (1 - gap / (baseRadius * 2.1)) * 0.55;
      drawCoalescedPeanutDrop(ctx, x1, y1, x2, y2, baseRadius, mergeWaist, palette, 1);
    } else {
      drawWaterSphere(
        ctx,
        x1,
        y1,
        baseRadius * 0.88 * scaleParallel1,
        baseRadius * 0.88 * scalePerp1,
        angle,
        palette,
        0.92
      );
      drawWaterSphere(
        ctx,
        x2,
        y2,
        baseRadius * scaleParallel2,
        baseRadius * scalePerp2,
        angle,
        palette,
        1
      );
    }
    return;
  }

  // FASE 3: Fusão final & acomodação elástica em água no destino (0.74 -> 1.00)
  const u = (progress - 0.74) / 0.26;
  const mergeGap = Math.max(0, baseRadius * 1.5 * (1 - easeOutCubic(u)));
  if (mergeGap > baseRadius * 0.35) {
    drawCoalescedPeanutDrop(
      ctx,
      toX - dirX * mergeGap,
      toY - dirY * mergeGap,
      toX,
      toY,
      baseRadius,
      0.55 + 0.35 * u,
      palette,
      1
    );
  } else {
    const wobble = Math.exp(-4.2 * u) * Math.sin(u * Math.PI * 3.0);
    const sx = 1 + 0.18 * wobble;
    const sy = 1 / sx;
    drawWaterSphere(ctx, toX, toY, baseRadius * sx, baseRadius * sy, angle, palette, 1);
  }
}
