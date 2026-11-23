'use client';

import React, { useEffect } from 'react';

interface Point2D {
  x: number;
  y: number;
}

interface ActiveMoleculeAnimation {
  gooStage: HTMLDivElement;
  glowStage: HTMLDivElement;
  daughter: HTMLDivElement;
  cleanupTimer: number | null;
  timers: number[];
}

const DEFAULT_MOLECULE_COLOR = '#38bdf8';

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
    const rgbaMatch = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
      const alpha = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
      if (alpha >= 0.35) return true;
    }
  }
  return false;
}

function getTabMoleculeAnchor(el: HTMLElement, container: HTMLElement): Point2D {
  const elRect = el.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  // Posiciona a bolinha molecular na base central do item da aba (sem tampar o texto)
  return {
    x: elRect.left - cRect.left + container.scrollLeft + elRect.width / 2,
    y: elRect.top - cRect.top + container.scrollTop + elRect.height - 4
  };
}

function extractAccentColor(btn: HTMLElement): string {
  const inlineBg = (btn.style.background || btn.style.backgroundImage || '').trim();
  const hexMatch = inlineBg.match(/#[0-9a-fA-F]{6}/);
  if (hexMatch) return hexMatch[0];

  const inlineShadow = (btn.style.boxShadow || '').trim();
  const rgbaMatch = inlineShadow.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/);
  if (rgbaMatch) return `${rgbaMatch[0]}, 1)`;

  const computed = window.getComputedStyle(btn);
  const bgImgHex = (computed.backgroundImage || '').match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
  if (bgImgHex) return bgImgHex[0];

  return DEFAULT_MOLECULE_COLOR;
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
      { button: HTMLElement; anchor: Point2D; color: string }
    >();
    const activeAnimByTrack = new WeakMap<HTMLElement, ActiveMoleculeAnimation>();

    const cleanupTrackAnimation = (track: HTMLElement) => {
      const anim = activeAnimByTrack.get(track);
      if (!anim) return;
      if (anim.cleanupTimer !== null) window.clearTimeout(anim.cleanupTimer);
      anim.timers.forEach(t => window.clearTimeout(t));
      anim.gooStage.remove();
      anim.glowStage.remove();
      activeAnimByTrack.delete(track);
    };

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickedBtn = target.closest<HTMLElement>(
        '.aptis-meniscus-track > button, .aptis-meniscus-track > a'
      );
      if (!clickedBtn) return;
      const track = clickedBtn.parentElement;
      if (!track || !track.classList.contains('aptis-meniscus-track')) return;

      const existingAnim = activeAnimByTrack.get(track);
      if (existingAnim) {
        const cRect = track.getBoundingClientRect();
        const dRect = existingAnim.daughter.getBoundingClientRect();
        pendingSourceByTrack.set(track, {
          button: clickedBtn,
          anchor: {
            x: dRect.left - cRect.left + track.scrollLeft + dRect.width / 2,
            y: dRect.top - cRect.top + track.scrollTop + dRect.height / 2
          },
          color: existingAnim.daughter.style.backgroundColor || DEFAULT_MOLECULE_COLOR
        });
        return;
      }

      const prevActive = findActiveButtonInTrack(track, clickedBtn);
      if (!prevActive) return;

      pendingSourceByTrack.set(track, {
        button: prevActive,
        anchor: getTabMoleculeAnchor(prevActive, track),
        color: extractAccentColor(prevActive)
      });
    };

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const clickedBtn = target.closest<HTMLElement>(
        '.aptis-meniscus-track > button, .aptis-meniscus-track > a'
      );
      if (!clickedBtn) return;
      const track = clickedBtn.parentElement;
      if (!track || !track.classList.contains('aptis-meniscus-track')) return;

      const source = pendingSourceByTrack.get(track);
      pendingSourceByTrack.delete(track);
      if (!source || source.button === clickedBtn) return;

      cleanupTrackAnimation(track);

      requestAnimationFrame(() => {
        if (!track.isConnected || !clickedBtn.isConnected) return;

        const from = source.anchor;
        const to = getTabMoleculeAnchor(clickedBtn, track);
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 6) return;

        const targetColor = extractAccentColor(clickedBtn) || source.color || DEFAULT_MOLECULE_COLOR;
        const stageWidth = Math.max(track.scrollWidth, track.clientWidth);
        const stageHeight = Math.max(track.scrollHeight, track.clientHeight) + 12;

        const gooStage = document.createElement('div');
        gooStage.className = 'aptis-molecule-goo-stage';
        gooStage.style.width = `${stageWidth}px`;
        gooStage.style.height = `${stageHeight}px`;

        const glowStage = document.createElement('div');
        glowStage.className = 'aptis-molecule-glow-stage';
        glowStage.style.width = `${stageWidth}px`;
        glowStage.style.height = `${stageHeight}px`;

        const ORB = 12; // Pequena bolha/molécula principal (12px)
        const MOTHER = 11; // Bolha-mãe que segura na origem e se desprende (11px)
        const MICRO = 7; // Micro-bolha satélite que se destaca no meio da separação (7px)

        // 1. Bolha-Mãe (fica ancorada por um instante na origem formando a ponte molecular)
        const mother = document.createElement('div');
        mother.className = 'aptis-molecule-orb';
        Object.assign(mother.style, {
          width: `${MOTHER}px`,
          height: `${MOTHER}px`,
          backgroundColor: source.color || targetColor,
          transform: `translate3d(${from.x - MOTHER / 2}px, ${from.y - MOTHER / 2}px, 0) scale(1)`,
          opacity: '0.95',
          transition: 'none'
        });

        // 2. Bolha-Filha (se descola da mãe, estica o elo molecular e desliza até a nova aba)
        const daughter = document.createElement('div');
        daughter.className = 'aptis-molecule-orb';
        Object.assign(daughter.style, {
          width: `${ORB}px`,
          height: `${ORB}px`,
          backgroundColor: targetColor,
          transform: `translate3d(${from.x - ORB / 2}px, ${from.y - ORB / 2}px, 0) scale(0.9)`,
          opacity: '1',
          transition: 'none'
        });

        // 3. Micro-molécula satélite (pequena gotinha que se desprende no meio do trajeto)
        const micro = document.createElement('div');
        micro.className = 'aptis-molecule-orb';
        Object.assign(micro.style, {
          width: `${MICRO}px`,
          height: `${MICRO}px`,
          backgroundColor: '#e0f2fe',
          transform: `translate3d(${from.x - MICRO / 2}px, ${from.y - MICRO / 2}px, 0) scale(0.75)`,
          opacity: '0.95',
          transition: 'none'
        });

        // 4. Núcleo brilhante nítido fora do filtro goo (dá brilho de gota cristalina)
        const coreGlow = document.createElement('div');
        coreGlow.className = 'aptis-molecule-orb';
        Object.assign(coreGlow.style, {
          width: '6px',
          height: '6px',
          backgroundColor: '#ffffff',
          boxShadow: `0 0 12px 3px ${targetColor}`,
          transform: `translate3d(${from.x - 3}px, ${from.y - 3}px, 0) scale(0.9)`,
          opacity: '0.95',
          transition: 'none'
        });

        gooStage.appendChild(mother);
        gooStage.appendChild(micro);
        gooStage.appendChild(daughter);
        glowStage.appendChild(coreGlow);

        track.appendChild(gooStage);
        track.appendChild(glowStage);

        // Force reflow
        void daughter.offsetWidth;

        // Passo 1 (0ms → 130ms): Separação inicial da molécula (a bolha-filha brota 18px em direção ao destino enquanto a mãe segura, formando o pescoço molecular visível!)
        const dirX = dx / dist;
        const dirY = dy / dist;
        const budOffset = Math.min(18, dist * 0.28);

        daughter.style.transition = 'transform 130ms cubic-bezier(0.3, 0, 0.2, 1)';
        daughter.style.transform = `translate3d(${from.x + dirX * budOffset - ORB / 2}px, ${
          from.y + dirY * budOffset - ORB / 2
        }px, 0) scale(1.12)`;

        coreGlow.style.transition = 'transform 130ms cubic-bezier(0.3, 0, 0.2, 1)';
        coreGlow.style.transform = `translate3d(${from.x + dirX * budOffset - 3}px, ${
          from.y + dirY * budOffset - 3
        }px, 0) scale(1.05)`;

        micro.style.transition = 'transform 130ms ease-out';
        micro.style.transform = `translate3d(${from.x + dirX * (budOffset * 0.52) - MICRO / 2}px, ${
          from.y + dirY * (budOffset * 0.52) - MICRO / 2
        }px, 0) scale(1.05)`;

        const timers: number[] = [];

        // Passo 2 (125ms): Ruptura da ligação molecular — a bolinha se solta e voa suavemente até a nova aba!
        const t1 = window.setTimeout(() => {
          daughter.style.transition =
            'transform 380ms cubic-bezier(0.22, 1.16, 0.36, 1), opacity 220ms ease 320ms';
          daughter.style.transform = `translate3d(${to.x - ORB / 2}px, ${
            to.y - ORB / 2
          }px, 0) scale(1)`;

          coreGlow.style.transition =
            'transform 380ms cubic-bezier(0.22, 1.16, 0.36, 1), opacity 220ms ease 320ms';
          coreGlow.style.transform = `translate3d(${to.x - 3}px, ${to.y - 3}px, 0) scale(1)`;

          // Micro-bolha acompanha logo atrás num leve arco orgânico
          micro.style.transition =
            'transform 430ms cubic-bezier(0.35, 0, 0.2, 1) 35ms, opacity 200ms ease 300ms';
          micro.style.transform = `translate3d(${to.x - MICRO / 2}px, ${
            to.y - MICRO / 2
          }px, 0) scale(0.65)`;

          // Bolha-mãe encolhe ao se desprender e desliza atrás para se fundir novamente na aba de destino
          mother.style.transition =
            'transform 450ms cubic-bezier(0.42, 0, 0.2, 1) 60ms, background-color 300ms ease, opacity 220ms ease 340ms';
          mother.style.backgroundColor = targetColor;
          mother.style.transform = `translate3d(${to.x - MOTHER / 2}px, ${
            to.y - MOTHER / 2
          }px, 0) scale(0.72)`;
        }, 125);
        timers.push(t1);

        // Passo 3 (470ms): Pequena ondulação (ripple) ao absorver na aba de destino e dissolve suavemente
        const t2 = window.setTimeout(() => {
          const ripple = document.createElement('div');
          ripple.className = 'aptis-molecule-ripple';
          ripple.style.width = '12px';
          ripple.style.height = '12px';
          ripple.style.setProperty('--mx', `${to.x - 6}px`);
          ripple.style.setProperty('--my', `${to.y - 6}px`);
          glowStage.appendChild(ripple);

          daughter.style.opacity = '0';
          mother.style.opacity = '0';
          micro.style.opacity = '0';
          coreGlow.style.opacity = '0';
        }, 470);
        timers.push(t2);

        const cleanupTimer = window.setTimeout(() => {
          gooStage.remove();
          glowStage.remove();
          activeAnimByTrack.delete(track);
        }, 880);

        activeAnimByTrack.set(track, {
          gooStage,
          glowStage,
          daughter,
          cleanupTimer,
          timers
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
        {/* Filtro Gooey calibrado especificamente para pequenas bolhas/moléculas (10px-12px) */}
        <filter id="aptis-molecule-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 19 -7.5
            "
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}
