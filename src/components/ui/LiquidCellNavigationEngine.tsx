'use client';

import React, { useEffect } from 'react';

interface RectBox {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: string;
}

interface ActiveTrackAnimation {
  gooStage: HTMLDivElement;
  sheenStage: HTMLDivElement;
  lead: HTMLDivElement;
  trail: HTMLDivElement;
  bud: HTMLDivElement;
  sheen: HTMLDivElement;
  targetButton: HTMLElement;
  cleanupTimer: number | null;
  midFlightTimer: number | null;
}

const DEFAULT_CELL_GRADIENT = 'linear-gradient(135deg, #22d3ee 0%, #2563eb 100%)';

function isButtonVisuallyActive(btn: HTMLElement): boolean {
  const inlineBg = (btn.style.background || btn.style.backgroundImage || '').trim();
  if (inlineBg && inlineBg !== 'none' && inlineBg !== 'transparent') {
    return true;
  }
  if (btn.getAttribute('aria-selected') === 'true' || btn.dataset.active === 'true') {
    return true;
  }
  const computed = window.getComputedStyle(btn);
  if (computed.backgroundImage && computed.backgroundImage !== 'none') {
    return true;
  }
  const bg = computed.backgroundColor;
  if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
    // Ignore very faint hover/inactive tint (< 0.18 alpha)
    const rgbaMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const alpha = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
      if (alpha >= 0.35) return true;
    }
  }
  return false;
}

function getRelativeRect(el: HTMLElement, container: HTMLElement): RectBox {
  const elRect = el.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  const computed = window.getComputedStyle(el);
  return {
    x: elRect.left - cRect.left + container.scrollLeft,
    y: elRect.top - cRect.top + container.scrollTop,
    width: elRect.width,
    height: elRect.height,
    borderRadius: computed.borderRadius || '9999px'
  };
}

function extractVisualFill(btn: HTMLElement): { background: string; boxShadow: string } {
  const inlineBg = (btn.style.background || btn.style.backgroundImage || '').trim();
  const inlineShadow = (btn.style.boxShadow || '').trim();
  const computed = window.getComputedStyle(btn);

  let background = DEFAULT_CELL_GRADIENT;
  if (inlineBg && inlineBg !== 'none' && inlineBg !== 'transparent') {
    background = inlineBg;
  } else if (computed.backgroundImage && computed.backgroundImage !== 'none') {
    background = computed.backgroundImage;
  } else if (
    computed.backgroundColor &&
    computed.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
    computed.backgroundColor !== 'transparent'
  ) {
    background = computed.backgroundColor;
  }

  const boxShadow =
    inlineShadow && inlineShadow !== 'none'
      ? inlineShadow
      : computed.boxShadow && computed.boxShadow !== 'none'
      ? computed.boxShadow
      : '0 0 22px rgba(34, 211, 238, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.55)';

  return { background, boxShadow };
}

function findActiveButtonInTrack(track: HTMLElement, exclude?: HTMLElement): HTMLElement | null {
  const buttons = Array.from(track.querySelectorAll<HTMLElement>(':scope > button, :scope > a'));
  for (const btn of buttons) {
    if (btn === exclude) continue;
    if (isButtonVisuallyActive(btn)) {
      return btn;
    }
  }
  return null;
}

export function LiquidCellNavigationEngine() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pendingSourceByTrack = new WeakMap<
      HTMLElement,
      { button: HTMLElement; rect: RectBox; fill: { background: string; boxShadow: string } }
    >();
    const activeAnimByTrack = new WeakMap<HTMLElement, ActiveTrackAnimation>();

    const cleanupTrackAnimation = (track: HTMLElement) => {
      const anim = activeAnimByTrack.get(track);
      if (!anim) return;
      if (anim.cleanupTimer !== null) window.clearTimeout(anim.cleanupTimer);
      if (anim.midFlightTimer !== null) window.clearTimeout(anim.midFlightTimer);
      anim.targetButton.classList.remove('aptis-cell-in-flight');
      anim.gooStage.remove();
      anim.sheenStage.remove();
      activeAnimByTrack.delete(track);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickedBtn = target.closest<HTMLElement>('.aptis-meniscus-track > button, .aptis-meniscus-track > a');
      if (!clickedBtn) return;
      const track = clickedBtn.parentElement;
      if (!track || !track.classList.contains('aptis-meniscus-track')) return;

      // If an animation is already mid-flight on this track, capture the live blob rect!
      const existingAnim = activeAnimByTrack.get(track);
      if (existingAnim) {
        const liveRect = getRelativeRect(existingAnim.lead, track);
        const liveFill = {
          background: existingAnim.lead.style.background || DEFAULT_CELL_GRADIENT,
          boxShadow: existingAnim.sheen.style.boxShadow || ''
        };
        pendingSourceByTrack.set(track, {
          button: existingAnim.targetButton,
          rect: liveRect,
          fill: liveFill
        });
        return;
      }

      const prevActive = findActiveButtonInTrack(track, clickedBtn);
      if (!prevActive) return;

      pendingSourceByTrack.set(track, {
        button: prevActive,
        rect: getRelativeRect(prevActive, track),
        fill: extractVisualFill(prevActive)
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickedBtn = target.closest<HTMLElement>('.aptis-meniscus-track > button, .aptis-meniscus-track > a');
      if (!clickedBtn) return;
      const track = clickedBtn.parentElement;
      if (!track || !track.classList.contains('aptis-meniscus-track')) return;

      const source = pendingSourceByTrack.get(track);
      pendingSourceByTrack.delete(track);
      if (!source || source.button === clickedBtn) return;

      // Cancel any previous in-flight overlay before launching the new transfer
      cleanupTrackAnimation(track);

      // Wait 1 frame so React renders the newly selected tab's active styles/dimensions
      requestAnimationFrame(() => {
        if (!track.isConnected || !clickedBtn.isConnected) return;

        const fromRect = source.rect;
        const toRect = getRelativeRect(clickedBtn, track);
        const dx = toRect.x - fromRect.x;
        const dy = toRect.y - fromRect.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 4) return;

        const targetFill = extractVisualFill(clickedBtn);
        const activeBg =
          targetFill.background !== DEFAULT_CELL_GRADIENT
            ? targetFill.background
            : source.fill.background;

        // Hide static fill of destination tab while the liquid cell travels to it
        clickedBtn.classList.add('aptis-cell-in-flight');

        const stageWidth = Math.max(track.scrollWidth, track.clientWidth);
        const stageHeight = Math.max(track.scrollHeight, track.clientHeight);

        const gooStage = document.createElement('div');
        gooStage.className = 'aptis-cell-goo-stage';
        gooStage.style.width = `${stageWidth}px`;
        gooStage.style.height = `${stageHeight}px`;

        const sheenStage = document.createElement('div');
        sheenStage.className = 'aptis-cell-sheen-stage';
        sheenStage.style.width = `${stageWidth}px`;
        sheenStage.style.height = `${stageHeight}px`;

        // 1. Lead Cell (Núcleo principal que se descola e guia o movimento)
        const lead = document.createElement('div');
        lead.className = 'aptis-cell-blob';
        Object.assign(lead.style, {
          width: `${fromRect.width}px`,
          height: `${fromRect.height}px`,
          borderRadius: fromRect.borderRadius,
          background: activeBg,
          transform: `translate3d(${fromRect.x}px, ${fromRect.y}px, 0) scale(1, 1)`,
          transition: 'none'
        });

        // 2. Trail / Mitosis Membrane Cell (Cauda orgânica que estica e se descola como divisão celular)
        const trail = document.createElement('div');
        trail.className = 'aptis-cell-blob';
        Object.assign(trail.style, {
          width: `${fromRect.width * 0.88}px`,
          height: `${fromRect.height * 0.88}px`,
          borderRadius: fromRect.borderRadius,
          background: source.fill.background || activeBg,
          opacity: '0.94',
          transform: `translate3d(${fromRect.x + fromRect.width * 0.06}px, ${
            fromRect.y + fromRect.height * 0.06
          }px, 0) scale(1, 1)`,
          transition: 'none'
        });

        // 3. Satellite Mitosis Droplet (Gota filha que se desprende no meio do trajeto e se funde no destino)
        const budWidth = Math.max(24, Math.min(fromRect.width * 0.52, toRect.width * 0.52));
        const budHeight = Math.max(18, fromRect.height * 0.68);
        const bud = document.createElement('div');
        bud.className = 'aptis-cell-blob';
        Object.assign(bud.style, {
          width: `${budWidth}px`,
          height: `${budHeight}px`,
          borderRadius: '9999px',
          background: activeBg,
          opacity: '0.92',
          transform: `translate3d(${fromRect.x + (fromRect.width - budWidth) / 2}px, ${
            fromRect.y + (fromRect.height - budHeight) / 2
          }px, 0) scale(0.85)`,
          transition: 'none'
        });

        // 4. Crisp Specular Rim Sheen (reflexo vítreo nítido fora do filtro goo)
        const sheen = document.createElement('div');
        sheen.className = 'aptis-cell-blob';
        Object.assign(sheen.style, {
          width: `${fromRect.width}px`,
          height: `${fromRect.height}px`,
          borderRadius: fromRect.borderRadius,
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.03) 55%, transparent 100%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: targetFill.boxShadow,
          transform: `translate3d(${fromRect.x}px, ${fromRect.y}px, 0) scale(1, 1)`,
          transition: 'none'
        });

        gooStage.appendChild(trail);
        gooStage.appendChild(bud);
        gooStage.appendChild(lead);
        sheenStage.appendChild(sheen);

        track.appendChild(gooStage);
        track.appendChild(sheenStage);

        // Force layout reflow so initial position paints before transition triggers
        void lead.offsetWidth;

        const isHorizontalDominant = Math.abs(dx) >= Math.abs(dy);
        const stretchScale = isHorizontalDominant ? 'scale(1.06, 0.84)' : 'scale(0.86, 1.08)';
        const midX = fromRect.x + dx * 0.56;
        const midY = fromRect.y + dy * 0.56;

        // Phase 1: Detachment & Mitosis Stretch (Lead launches while Trail holds and stretches!)
        lead.style.transition =
          'transform 380ms cubic-bezier(0.22, 1.18, 0.36, 1), width 380ms cubic-bezier(0.22, 1.18, 0.36, 1), height 380ms cubic-bezier(0.22, 1.18, 0.36, 1), border-radius 380ms ease';
        lead.style.width = `${toRect.width}px`;
        lead.style.height = `${toRect.height}px`;
        lead.style.borderRadius = toRect.borderRadius;
        lead.style.transform = `translate3d(${toRect.x}px, ${toRect.y}px, 0) ${stretchScale}`;

        sheen.style.transition =
          'transform 380ms cubic-bezier(0.22, 1.18, 0.36, 1), width 380ms cubic-bezier(0.22, 1.18, 0.36, 1), height 380ms cubic-bezier(0.22, 1.18, 0.36, 1), opacity 220ms ease';
        sheen.style.width = `${toRect.width}px`;
        sheen.style.height = `${toRect.height}px`;
        sheen.style.borderRadius = toRect.borderRadius;
        sheen.style.transform = `translate3d(${toRect.x}px, ${toRect.y}px, 0) scale(1, 0.94)`;

        // Satellite droplet buds off halfway then snaps into destination
        bud.style.transition =
          'transform 250ms cubic-bezier(0.18, 0.9, 0.32, 1.1), opacity 250ms ease';
        bud.style.transform = `translate3d(${midX + (toRect.width - budWidth) / 2}px, ${
          midY + (toRect.height - budHeight) / 2
        }px, 0) scale(1.12, 0.72)`;

        // Trail cell stretches & detaches 55ms later for authentic liquid cell mitosis pull!
        trail.style.transition =
          'transform 470ms cubic-bezier(0.42, 0, 0.2, 1) 55ms, width 470ms cubic-bezier(0.42, 0, 0.2, 1) 55ms, height 470ms cubic-bezier(0.42, 0, 0.2, 1) 55ms, background 350ms ease 55ms, opacity 260ms ease 250ms';
        trail.style.width = `${toRect.width * 0.9}px`;
        trail.style.height = `${toRect.height * 0.9}px`;
        trail.style.borderRadius = toRect.borderRadius;
        trail.style.background = activeBg;
        trail.style.transform = `translate3d(${toRect.x + toRect.width * 0.05}px, ${
          toRect.y + toRect.height * 0.05
        }px, 0) scale(0.96, 0.96)`;

        // Phase 2: Mid-flight relaxation — satellite merges into target & lead plumps back to 100%
        const midFlightTimer = window.setTimeout(() => {
          lead.style.transition = 'transform 190ms cubic-bezier(0.22, 1, 0.36, 1)';
          lead.style.transform = `translate3d(${toRect.x}px, ${toRect.y}px, 0) scale(1, 1)`;

          sheen.style.transition = 'transform 190ms cubic-bezier(0.22, 1, 0.36, 1)';
          sheen.style.transform = `translate3d(${toRect.x}px, ${toRect.y}px, 0) scale(1, 1)`;

          bud.style.transition = 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease';
          bud.style.transform = `translate3d(${toRect.x + (toRect.width - budWidth) / 2}px, ${
            toRect.y + (toRect.height - budHeight) / 2
          }px, 0) scale(0.7)`;
          bud.style.opacity = '0';
        }, 235);

        // Phase 3: Seamless handoff back to static active button + organic settle bounce
        const cleanupTimer = window.setTimeout(() => {
          clickedBtn.classList.remove('aptis-cell-in-flight');
          clickedBtn.classList.add('aptis-cell-landed');
          gooStage.remove();
          sheenStage.remove();
          activeAnimByTrack.delete(track);
          window.setTimeout(() => {
            clickedBtn.classList.remove('aptis-cell-landed');
          }, 360);
        }, 520);

        activeAnimByTrack.set(track, {
          gooStage,
          sheenStage,
          lead,
          trail,
          bud,
          sheen,
          targetButton: clickedBtn,
          cleanupTimer,
          midFlightTimer
        });
      });
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'fixed',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      <defs>
        {/* Filtro Gooey Orgânico para barras de abas internas (Efeito Mitose / Célula Líquida) */}
        <filter id="aptis-cell-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 21 -8.5
            "
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>

        {/* Filtro Gooey Orgânico para o menu lateral principal entre ferramentas */}
        <filter id="aptis-sidebar-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 23 -9.5
            "
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
