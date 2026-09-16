'use client';

import React, { useMemo } from 'react';
import { SkillStation, EmployeeSkillRecord } from '../types';
import { PieChart, BarChart3, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

interface SkillsDonutAndParetoProps {
  stations: SkillStation[];
  employees: EmployeeSkillRecord[];
  iluoDistribution: {
    n1: { count: number; pct: number };
    n2: { count: number; pct: number };
    n3: { count: number; pct: number };
    n4: { count: number; pct: number };
    total: number;
  };
}

export function SkillsDonutAndParetoCharts({
  stations,
  employees,
  iluoDistribution
}: SkillsDonutAndParetoProps) {
  // 1. CÁLCULO DOS ARCOS DO DONUT CHART (SVG)
  const donutData = useMemo(() => {
    const segments = [
      { key: 'n4', label: 'N4 Multiplicadores', count: iluoDistribution.n4.count, color: '#10b981', border: '#059669' },
      { key: 'n3', label: 'N3 Autônomos', count: iluoDistribution.n3.count, color: '#06b6d4', border: '#0891b2' },
      { key: 'n2', label: 'N2 Praticantes', count: iluoDistribution.n2.count, color: '#f59e0b', border: '#d97706' },
      { key: 'n1', label: 'N1 Aprendizes', count: iluoDistribution.n1.count, color: '#94a3b8', border: '#64748b' }
    ];

    const total = iluoDistribution.total || 1;
    let accumulatedAngle = -Math.PI / 2;

    const rOuter = 70;
    const rInner = 45;
    const cx = 90;
    const cy = 90;

    const paths = segments.map(seg => {
      const sliceAngle = (seg.count / total) * 2 * Math.PI;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle = endAngle;

      // Coordenadas do arco externo
      const x1 = cx + rOuter * Math.cos(startAngle);
      const y1 = cy + rOuter * Math.sin(startAngle);
      const x2 = cx + rOuter * Math.cos(endAngle);
      const y2 = cy + rOuter * Math.sin(endAngle);

      // Coordenadas do arco interno
      const x3 = cx + rInner * Math.cos(endAngle);
      const y3 = cy + rInner * Math.sin(endAngle);
      const x4 = cx + rInner * Math.cos(startAngle);
      const y4 = cy + rInner * Math.sin(startAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const pathData = seg.count === 0 ? '' : [
        `M ${x1} ${y1}`,
        `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');

      const pct = Math.round((seg.count / total) * 100);

      return {
        ...seg,
        pathData,
        pct
      };
    });

    const autonomousRate = Math.round(
      ((iluoDistribution.n3.count + iluoDistribution.n4.count) / total) * 100
    );

    return { paths, autonomousRate, cx, cy };
  }, [iluoDistribution]);

  // 2. CÁLCULO DO DIAGRAMA DE PARETO (80/20 DOS GARGALOS)
  const paretoData = useMemo(() => {
    // Para cada posto, calcula o déficit de operadores autônomos
    const stationDeficits = stations.map(st => {
      const qualified = employees.filter(e => (e.skills[st.id] || 0) >= 3).length;
      const deficit = Math.max(0, st.minOperatorsRequired - qualified);
      return {
        station: st,
        deficit,
        qualified,
        required: st.minOperatorsRequired
      };
    });

    // Ordena do maior déficit para o menor (regra de Pareto)
    const sorted = stationDeficits.sort((a, b) => b.deficit - a.deficit);
    const totalDeficit = sorted.reduce((acc, s) => acc + s.deficit, 0);

    let cumulative = 0;
    const items = sorted.map(item => {
      cumulative += item.deficit;
      const cumulativePct = totalDeficit > 0 ? Math.round((cumulative / totalDeficit) * 100) : 100;
      return {
        ...item,
        cumulativePct
      };
    });

    return { items, totalDeficit };
  }, [stations, employees]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. GRÁFICO DE PIZZA / DONUT: DISTRIBUIÇÃO ILUO */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
                <PieChart className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Distribuição ILUO (Gráfico Donut)
              </h4>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {iluoDistribution.total} avaliações
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-4">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
                {donutData.paths.map(seg => (
                  <path
                    key={seg.key}
                    d={seg.pathData}
                    fill={seg.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all hover:opacity-85 cursor-pointer"
                  >
                    <title>{`${seg.label}: ${seg.count} (${seg.pct}%)`}</title>
                  </path>
                ))}
              </svg>

              {/* Centro do Donut com % de Autonomia */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {donutData.autonomousRate}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                  Autônomos
                </span>
              </div>
            </div>

            {/* Legenda com Cores e Contagem */}
            <div className="space-y-2 text-xs w-full sm:w-auto">
              {donutData.paths.map(seg => (
                <div key={seg.key} className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="font-semibold text-slate-700 text-[11px]">
                      {seg.label}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    {seg.count} <span className="text-[10px] text-slate-400 font-normal">({seg.pct}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Autonomia Total (N3 + N4):</span>
          <span className="font-bold text-emerald-700">
            {iluoDistribution.n3.count + iluoDistribution.n4.count} postos aptos
          </span>
        </div>
      </div>

      {/* 2. DIAGRAMA DE PARETO: GARGALOS POR POSTO (80/20) */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Diagrama de Pareto dos Gargalos (Regra 80/20)
                </h4>
                <span className="text-[11px] text-slate-500">
                  Priorização dos postos que concentram o maior déficit de operadores
                </span>
              </div>
            </div>

            <span className="text-xs font-black text-rose-600 px-2 py-0.5 rounded bg-rose-50 border border-rose-200">
              Déficit Total: {paretoData.totalDeficit} vaga(s)
            </span>
          </div>

          <div className="py-3 space-y-3">
            {paretoData.items.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-6">Nenhum posto cadastrado.</p>
            ) : paretoData.totalDeficit === 0 ? (
              <div className="p-6 text-center bg-emerald-50/60 rounded-xl border border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                <p className="font-bold text-xs">Zero Déficit Operacional no Setor!</p>
                <p className="text-[11px] text-emerald-600">Todos os postos possuem o contingente mínimo de operadores qualificados.</p>
              </div>
            ) : (
              paretoData.items.map(item => {
                const isBottleneck = item.deficit > 0;
                const deficitPct = paretoData.totalDeficit > 0 
                  ? Math.round((item.deficit / paretoData.totalDeficit) * 100) 
                  : 0;

                return (
                  <div key={item.station.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isBottleneck ? 'text-slate-900' : 'text-slate-500'}`}>
                          {item.station.name}
                        </span>
                        {isBottleneck && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                            -{item.deficit} operador(es)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-500">
                          Disponível: <strong>{item.qualified}</strong> / Req: {item.required}
                        </span>
                        <span className="font-bold text-indigo-600 min-w-[55px] text-right">
                          {item.cumulativePct}% acum.
                        </span>
                      </div>
                    </div>

                    {/* Barra de Déficit + Linha Acumulada */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all ${
                          item.deficit > 1 ? 'bg-rose-500' :
                          item.deficit === 1 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, deficitPct)}%` }}
                        title={`Déficit: ${item.deficit}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-600">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            Resolvendo os postos no topo, você elimina a maior parte do risco de parada.
          </span>
        </div>
      </div>
    </div>
  );
}
