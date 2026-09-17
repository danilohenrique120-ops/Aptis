'use client';

import React from 'react';
import Link from 'next/link';
import { ToolDefinition } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { Check, ArrowRight, Mail } from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  onRequestDemo: (tool: ToolDefinition) => void;
}

export function ToolCard({ tool, onRequestDemo }: ToolCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1">
      <div className="p-6 sm:p-7">
        {/* Header do Card */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl ${tool.colorTheme.lightBg} border ${tool.colorTheme.border} flex items-center justify-center ${tool.colorTheme.text} shadow-xs group-hover:scale-105 transition-transform`}>
            <ToolIcon name={tool.iconName} className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-1.5">
            {tool.badge && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950 text-cyan-300 border border-slate-800 shadow-2xs font-mono">
                {tool.badge}
              </span>
            )}
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {tool.recommendedPlan}
            </span>
          </div>
        </div>

        {/* Categoria e Título */}
        <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-700 mb-1">
          {tool.category}
        </div>
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-cyan-700 transition-colors mb-2 leading-snug">
          {tool.name}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          {tool.shortDescription}
        </p>

        {/* 3 Recursos Chave */}
        <div className="space-y-2 pt-4 border-t border-slate-100 mb-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Destaques Operacionais
          </div>
          {tool.keyFeatures.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
              <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações Comerciais */}
      <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 flex flex-col items-center gap-2">
        <button
          onClick={() => onRequestDemo(tool)}
          className="w-full py-3 px-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-cyan-950 hover:to-slate-900 text-white font-bold text-xs rounded-xl shadow-md border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:scale-110 transition-transform" />
          <span>Solicitar Demonstração & Orçamento</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center justify-between w-full text-[10px] text-slate-500 px-1">
          <span>Licenciamento modular por planta</span>
          <span className="font-semibold text-cyan-700">Implantação guiada inclusa</span>
        </div>
      </div>
    </div>
  );
}
