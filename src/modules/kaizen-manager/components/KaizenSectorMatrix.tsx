'use client';

import React, { useState, useMemo } from 'react';
import { KaizenProject, KaizenLevel, KaizenStage } from '../types';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { KAIZEN_LEVEL_CONFIG } from '../mock-data';
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
  tintedGlass?: boolean;
}

export function KaizenSectorMatrix({
  projects,
  onOpenA3,
  tintedGlass = false
}: KaizenSectorMatrixProps) {
  const { sectors: plantSectors } = usePlantSectors();
  const [selectedSectorFilter, setSelectedSectorFilter] = useState<string>('all');

  // Setores identificados a partir da planta e dos projetos existentes
  const safePlantSectors = Array.isArray(plantSectors) ? plantSectors : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  const allSectors = useMemo(() => {
    const set = new Set<string>(safePlantSectors.map(s => s.name));
    safeProjects.forEach(p => { if (p && p.sector) set.add(p.sector); });
    return Array.from(set);
  }, [safePlantSectors, safeProjects]);

  // Estatísticas por Setor
  const sectorStats = useMemo(() => {
    return allSectors.map(sector => {
      const sectorProjects = safeProjects.filter(p => p && p.sector === sector);
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
      <div className={`p-5 rounded-2xl space-y-3 transition-all ${
        tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className={`text-base font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              <Building2 className={`w-5 h-5 ${tintedGlass ? 'text-purple-400' : 'text-purple-600'}`} />
              Matriz de Kaizens por Setores & Áreas Fabris
            </h3>
            <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Controle quantitativo e qualitativo das melhorias contínuas distribuídas pelos postos de trabalho e níveis de maturidade.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className={`font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Filtrar Setor:</span>
            <select
              value={selectedSectorFilter}
              onChange={(e) => setSelectedSectorFilter(e.target.value)}
              className={`px-3 py-1.5 rounded-xl font-bold focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-700 focus:border-purple-500'
              }`}
            >
              <option value="all" className="bg-slate-900 text-white">Visão Consolidada (Todos os Setores)</option>
              {allSectors.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MATRIZ TABULAR: SETOR X NÍVEL DE KAIZEN */}
      <div className={`rounded-2xl overflow-hidden transition-all ${
        tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-2xs'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          tintedGlass ? 'border-white/10' : 'border-slate-200'
        }`}>
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            tintedGlass ? 'text-slate-200' : 'text-slate-700'
          }`}>
            <Layers className={`w-4 h-4 ${tintedGlass ? 'text-purple-400' : 'text-purple-600'}`} />
            Distribuição por Níveis de Kaizen (Setor × Nível)
          </span>
          <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`}>Total de {projects.length} Kaizens ativos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-bold uppercase text-[10px] tracking-wider ${
              tintedGlass
                ? 'bg-slate-950/70 border-white/10 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
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
            <tbody className={`divide-y ${tintedGlass ? 'divide-white/10' : 'divide-slate-100'}`}>
              {sectorStats.map((s) => (
                <tr 
                  key={s.sector} 
                  className={`transition-colors ${
                    tintedGlass
                      ? `hover:bg-white/[0.04] ${selectedSectorFilter === s.sector ? 'bg-purple-500/15 font-semibold' : ''}`
                      : `hover:bg-slate-50/80 ${selectedSectorFilter === s.sector ? 'bg-purple-50/40 font-semibold' : ''}`
                  }`}
                >
                  <td className={`py-3.5 px-4 font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    <Building2 className={`w-4 h-4 ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`} />
                    <span>{s.sector}</span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.quickCount > 0
                        ? (tintedGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35' : 'bg-amber-50 text-amber-700 border border-amber-200')
                        : (tintedGlass ? 'text-slate-600' : 'text-slate-300')
                    }`}>
                      {s.quickCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.standardCount > 0
                        ? (tintedGlass ? 'bg-blue-500/20 text-blue-300 border border-blue-500/35' : 'bg-blue-50 text-blue-700 border border-blue-200')
                        : (tintedGlass ? 'text-slate-600' : 'text-slate-300')
                    }`}>
                      {s.standardCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.majorCount > 0
                        ? (tintedGlass ? 'bg-purple-500/20 text-purple-300 border border-purple-500/35' : 'bg-purple-50 text-purple-700 border border-purple-200')
                        : (tintedGlass ? 'text-slate-600' : 'text-slate-300')
                    }`}>
                      {s.majorCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-mono font-bold text-xs ${
                      s.advancedCount > 0
                        ? (tintedGlass ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35' : 'bg-rose-50 text-rose-700 border border-rose-200')
                        : (tintedGlass ? 'text-slate-600' : 'text-slate-300')
                    }`}>
                      {s.advancedCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold font-mono">
                    <span className={`px-2 py-0.5 rounded border ${
                      tintedGlass
                        ? 'bg-slate-800/80 text-white border-white/15'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {s.total}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className={`w-14 h-1.5 rounded-full overflow-hidden ${tintedGlass ? 'bg-slate-800' : 'bg-slate-100'}`}>
                        <div 
                          className="bg-emerald-500 h-full rounded-full" 
                          style={{ width: `${s.completionRate}%` }}
                        />
                      </div>
                      <span className={`font-mono text-[11px] ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>{s.completionRate}%</span>
                    </div>
                  </td>

                  <td className={`py-3.5 px-4 text-right font-mono font-bold ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>
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
        <div className={`p-5 rounded-2xl space-y-4 animate-in fade-in duration-150 ${
          tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-2xs'
        }`}>
          <div className={`flex items-center justify-between pb-3 border-b ${
            tintedGlass ? 'border-white/10' : 'border-slate-100'
          }`}>
            <div>
              <h4 className={`text-sm font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <span>Projetos Kaizen em: </span>
                <span className={tintedGlass ? 'text-purple-400' : 'text-purple-700'}>{activeSectorData.sector}</span>
              </h4>
              <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                {activeSectorData.total} projetos registrados neste setor fabril.
              </p>
            </div>
            <button
              onClick={() => setSelectedSectorFilter('all')}
              className={`text-xs font-bold hover:underline cursor-pointer ${
                tintedGlass ? 'text-purple-400' : 'text-purple-600'
              }`}
            >
              Voltar para visão de todos os setores
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeSectorData.projects.map(p => (
              <div 
                key={p.id}
                className={`p-4 rounded-xl space-y-2 flex flex-col justify-between ${
                  tintedGlass
                    ? 'aptis-glass-subcard border border-white/10'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                    <span className={`text-[10px] font-bold uppercase ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>{p.stage}</span>
                  </div>
                  <h5 className={`font-bold text-xs ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{p.title}</h5>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>{p.a3.problemStatement}</p>
                </div>

                <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                  tintedGlass ? 'border-white/10' : 'border-slate-200'
                }`}>
                  <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                    Líder: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{p.leaderName}</strong>
                  </span>
                  <button
                    onClick={() => onOpenA3(p)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-colors text-[10px] cursor-pointer ${
                      tintedGlass
                        ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xs shadow-purple-500/20'
                        : 'bg-slate-900 text-white hover:bg-purple-600'
                    }`}
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
