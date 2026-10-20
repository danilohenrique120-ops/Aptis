'use client';

import React, { useRef, useState } from 'react';
import { ToolDefinition } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { Check, ArrowRight, Mail, Sparkles } from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  onRequestDemo: (tool: ToolDefinition) => void;
  index?: number;
}

export function ToolCard({ tool, onRequestDemo, index = 0 }: ToolCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    setTilt({
      rotateX: -normY * 10,
      rotateY: normX * 12,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      active: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, active: false });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tilt.active
          ? `perspective(1100px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.015, 1.015, 1.015)`
          : 'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: tilt.active ? 'transform 80ms ease-out' : 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="relative rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-slate-800/90 hover:border-cyan-400/60 shadow-2xl shadow-black/70 flex flex-col justify-between overflow-hidden group"
    >
      {/* Dynamic 3D Cursor Spotlight Glare */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(420px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(6, 182, 212, 0.16), transparent 70%)`,
        }}
      />

      {/* Top Chromatic Laser Line (ALCHE card frame signature) */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/70 to-blue-500/70 opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="p-6 sm:p-7 relative z-10">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-cyan-500/25 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-12 h-12 rounded-xl bg-slate-900/95 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner group-hover:scale-110 group-hover:border-cyan-400 transition-all">
              <ToolIcon name={tool.iconName} className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-500 mr-1">
              0{index + 1} //
            </span>
            {tool.badge && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-2xs font-mono flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                {tool.badge}
              </span>
            )}
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/80 font-mono">
              {tool.recommendedPlan}
            </span>
          </div>
        </div>

        {/* Categoria e Título */}
        <div className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 mb-1 font-mono">
          {tool.category}
        </div>
        <h3 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug tracking-tight">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-300/90 leading-relaxed mb-6">
          {tool.shortDescription}
        </p>

        {/* 3 Recursos Chave */}
        <div className="space-y-2.5 pt-4 border-t border-slate-800/80 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-mono">
            Destaques Operacionais
          </div>
          {tool.keyFeatures.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-200">
              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Comerciais */}
      <div className="p-4 sm:p-5 bg-slate-900/70 border-t border-slate-800/90 flex flex-col items-center gap-2.5 relative z-10">
        <button
          onClick={() => onRequestDemo(tool)}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 text-cyan-200 hover:text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-cyan-500/40 hover:border-cyan-300 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:text-slate-950 group-hover/btn:scale-110 transition-transform" />
          <span>Solicitar Demonstração & Orçamento</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:text-slate-950 group-hover/btn:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-between w-full text-[10px] text-slate-400 px-1 font-mono">
          <span>Licenciamento modular por planta</span>
          <span className="font-semibold text-cyan-400">Implantação guiada inclusa</span>
        </div>
      </div>
    </div>
  );
}
