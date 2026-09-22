'use client';

import React, { useState, useMemo } from 'react';
import { KaizenProject, KaizenLevel, KaizenStage } from '../types';
import { SECTORS_LIST, KAIZEN_LEVEL_CONFIG } from '../mock-data';
import { KaizenLevelBadge } from './KaizenLevelBadge';
import { 
  Building2, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface KaizenSectorMatrixProps {
  projects: KaizenProject[];
  onOpenA3: (project: KaizenProject) => void;
}

export function KaizenSectorMatrix({
  projects,
  onOpenA3
}: KaizenSectorMatrixProps) {
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');

  // Setores identificados a partir dos dados e da lista padrão
  const allSectors = useMemo(() => {
    const set = new Set<string>(SECTORS_LIST);
    projects.forEach(p => { if (p.sector) set.add(p.sector); });
    return Array.from(set);
  }, [projects]);

  // Estatísticas por Setor
  const sectorStats = useMemo(() => {
    return allSectors.map(sector => {
      const sectorProjects = projects.filter(p => p.sector === sector);
      const total = sectorProjects.length;

      const quickCount = sectorProjects.filter(p => p.level === 'quick').length;
      const standardCount = sectorProjects.filter(p => p.level === 'standard').length;
      const majorCount = sectorProjects.filter(p => p.level === 'major').length;
      const advancedCount = sectorProjects.filter(p => p.level === 'advanced').length;

      const standardizedCount = sectorProjects.filter(p => p.stage === 'standardized').length;
      const inProgressCount = sectorProjects.filter(p => p.stage === 'implementation' || p.stage === 'analysis').length;
      const ideationCount = sectorProjects.filter(p => p.stage === 'ideation').length;

      const totalSavings = sectorProjects.reduce((acc, p) => acc + (p.estimatedSavingsAnnual || 0), 0);
      const totalHours = sectorProjects.reduce((acc, p) => acc + (p.hoursSavedMonthly || 0), 0);

      // Taxa de conclusão
      const completionRate = total > 0 ? Math.round((standardizedCount / total) * 100) : 0;

      return {
        sector,
        total,
        quickCount,
        standardCount,
        majorCount,
        advancedCount,
        standardizedCount,
        inProgressCount,
        ideationCount,
        totalSavings,
        totalHours,
        completionRate,
        projects: sectorProjects
      };
    }).sort((a, b) => b.total - a.total);
  }, [allSectors, projects]);

  const activeSectorData = selectedSectorFilter === 'all' 
    ? null 
    : sectorStats.find(s => s.sector === selectedSectorFilter) || null;

  return (
    <div className="space-y-6 w-full">
      {/* HEADER EXPLICATIVO */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Matriz de Kaizens por Setores & Áreas Fabris
            </h3>
            <p className="text-xs text-slate-500">
              Controle quantitativo e qualitativo das melhorias contínuas distribuídas pelos postos de trabalho e níveis de maturidade.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Filtrar Setor:</span>
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl font-bold focus:outline-none focus:border-purple-500"
            >
              <option value="all">Visão Consolidada (Todos os Setores)</option>
              {allSectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MATRIZ TABULAR: SETOR X NÍVEL DE KAIZEN */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            Distribuição por Níveis de Kaizen (Setor × Nível)
          </span>
          <span className="text-xs text-slate-400">Total de {projects.length} Kaizens ativos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Setor Fabril</th>
                <th className="py-3 px-4 text-center">⚡ Quick (Rápido)</th>
                <th className="py-3 px-4 text-center">🛠️ Standard</th>
                <th className="py-3 px-4 text-center">🏭 Major</th>
                <th className="py-3 px-4 text-center">🔬 Advanced</th>
                <th className="py-3 px-4 text-center">Total Kaizens</th>
                <th className="py-3 px-4 text-center">Conclusão %</th>
                <th className="py-3 px-4 text-right">Economia Anual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sectorStats.map((s) => (
                <tr 
                  key={s.sector} 
                  className={`hover:bg-slate-50/80 transition-colors ${
                    selectedSectorFilter === s.sector ? 'bg-purple-50/40 font-semibold' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{s.sector}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.quickCount > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'text-slate-300'
                    }`}>
                      {s.quickCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.standardCount > 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-300'
                    }`}>
                      {s.standardCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.majorCount > 0 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-300'
                    }`}>
                      {s.majorCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.advancedCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-300'
                    }`}>
                      {s.advancedCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-900">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-800 border border-slate-200">
                      {s.total}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-14 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${s.completionRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-slate-600">{s.completionRate}%</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                    {s.totalSavings > 0 ? `R$ ${s.totalSavings.toLocaleString('pt-BR')}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETALHAMENTO DE PROJETOS POR SETOR SELECIONADO */}
      {activeSectorData && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Projetos Kaizen em: </span>
                <span className="text-purple-700">{activeSectorData.sector}</span>
              </h4>
              <p className="text-xs text-slate-500">
                {activeSectorData.total} projetos registrados neste setor fabril.
              </p>
            </div>
            <button
              onClick={() => setSelectedSectorFilter('all')}
              className="text-xs text-purple-600 font-bold hover:underline cursor-pointer"
            >
              Voltar para visão de todos os setores
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSectorData.projects.map(p => (
              <div 
                key={p.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <KaizenLevelBadge level={p.level} />
                    <span className="text-[10px] font-bold uppercase text-slate-500">{p.stage}</span>
                  </div>
                  <h5 className="font-bold text-slate-900 text-xs">{p.title}</h5>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{p.a3.problemStatement}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Líder: <strong className="text-slate-700">{p.leaderName}</strong></span>
                  <button
                    onClick={() => onOpenA3(p)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold hover:bg-purple-600 transition-colors text-[10px]"
                  >
                    Abrir Formulário A3
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
