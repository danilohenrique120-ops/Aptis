'use client';

import { useEffect } from 'react';
import {
  renderWaterBarTransitionFrame,
  resolvePaletteFromColor,
  RectPill
} from '@/lib/water-droplet-renderer';

interface ActiveTrackCanvasAnim {
  canvas: HTMLCanvasElement;
  rafId: number;
  targetButton: HTMLElement;
  currentPill: RectPill;
}

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

function getButtonPillRect(el: HTMLElement, container: HTMLElement): RectPill {
  const elRect = el.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  const br = parseFloat(window.getComputedStyle(el).borderRadius || '16');
  return {
    x: elRect.left - cRect.left + container.scrollLeft,
    y: elRect.top - cRect.top + container.scrollTop,
    w: elRect.width,
    h: elRect.height,
    r: Number.isFinite(br) ? Math.min(br, elRect.height / 2) : elRect.height / 2
  };
}

function extractAccentColor(btn: HTMLElement): string {
  const inlineBg = (btn.style.background || btn.style.backgroundImage || '').trim();
  const hexMatch = inlineBg.match(/#[0-9a-fA-F]{6}/);
  if (hexMatch) return hexMatch[0];

  const inlineShadow = (btn.style.boxShadow || '').trim();
  const rgbaMatch = inlineShadow.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/);
  if (rgbaMatch) return rgbaMatch[0];

  const computed = window.getComputedStyle(btn);
  const bgImgRgb = (computed.backgroundImage || '').match(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/);
  if (bgImgRgb) return bgImgRgb[0];

  return '#38bdf8';
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
      { button: HTMLElement; pill: RectPill; color: string }
    >();
    const activeAnimByTrack = new WeakMap<HTMLElement, ActiveTrackCanvasAnim>();

    const cleanupTrackAnimation = (track: HTMLElement) => {
      const anim = activeAnimByTrack.get(track);
      if (!anim) return;
      window.cancelAnimationFrame(anim.rafId);
      anim.targetButton.classList.remove('aptis-pill-in-flight');
      anim.canvas.remove();
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
        pendingSourceByTrack.set(track, {
          button: existingAnim.targetButton,
          pill: { ...existingAnim.currentPill },
          color: extractAccentColor(clickedBtn)
        });
        return;
      }

      const prevActive = findActiveButtonInTrack(track, clickedBtn);
      if (!prevActive) return;

      pendingSourceByTrack.set(track, {
        button: prevActive,
        pill: getButtonPillRect(prevActive, track),
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

        const from = source.pill;
        const to = getButtonPillRect(clickedBtn, track);
        const dist = Math.hypot(
          to.x + to.w / 2 - (from.x + from.w / 2),
          to.y + to.h / 2 - (from.y + from.h / 2)
        );
        if (dist < 4) return;

        const palette = resolvePaletteFromColor(extractAccentColor(clickedBtn) || source.color);

        // Esconde o fundo estático do botão de destino enquanto a barra líquida viaja até ele
        clickedBtn.classList.add('aptis-pill-in-flight');

        const width = Math.max(track.scrollWidth, track.clientWidth);
        const height = Math.max(track.scrollHeight, track.clientHeight);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const canvas = document.createElement('canvas');
        canvas.className = 'aptis-water-canvas-overlay';
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        Object.assign(canvas.style, {
          position: 'absolute',
          left: '0px',
          top: '0px',
          width: `${width}px`,
          height: `${height}px`,
          pointerEvents: 'none',
          zIndex: '1'
        });

        track.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          clickedBtn.classList.remove('aptis-pill-in-flight');
          canvas.remove();
          return;
        }

        const DURATION_MS = 740;
        const startTime = performance.now();

        const animState: ActiveTrackCanvasAnim = {
          canvas,
          rafId: 0,
          targetButton: clickedBtn,
          currentPill: { ...from }
        };

        const tick = (now: number) => {
          if (!track.isConnected || !canvas.isConnected) {
            cleanupTrackAnimation(track);
            return;
          }

          const elapsed = now - startTime;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.clearRect(0, 0, width, height);

          if (elapsed < DURATION_MS) {
            const p = Math.min(1, elapsed / DURATION_MS);
            animState.currentPill = {
              x: from.x + (to.x - from.x) * p,
              y: from.y + (to.y - from.y) * p,
              w: from.w + (to.w - from.w) * p,
              h: from.h + (to.h - from.h) * p,
              r: from.r + (to.r - from.r) * p
            };

            renderWaterBarTransitionFrame(ctx, {
              from,
              to,
              progress: p,
              palette
            });

            animState.rafId = window.requestAnimationFrame(tick);
            return;
          }

          cleanupTrackAnimation(track);
        };

        animState.rafId = window.requestAnimationFrame(tick);
        activeAnimByTrack.set(track, animState);
      });
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  return null;
}
