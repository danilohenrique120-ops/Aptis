'use client';

import React, { useState, useMemo } from 'react';
import { SkillStation, EmployeeSkillRecord, SkillLevel } from '../types';
import { IluoCircle } from './IluoCircle';
import { Target, Users, Award, Sparkles, HelpCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SkillsRadarChartProps {
  stations: SkillStation[];
  employees: EmployeeSkillRecord[];
}

export function SkillsRadarChart({ stations, employees }: SkillsRadarChartProps) {
  // Operador selecionado como primário
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    employees[0]?.employeeId || ''
  );

  // Comparador: 'target_n3' | employeeId | 'none'
  const [compareMode, setCompareMode] = useState<string>('target_n3');

  // Operador ativo
  const primaryOperator = useMemo(() => {
    return employees.find(e => e.employeeId === selectedEmpId) || employees[0];
  }, [employees, selectedEmpId]);

  // Operador comparativo (se selecionado outro operador)
  const compareOperator = useMemo(() => {
    if (compareMode === 'none' || compareMode === 'target_n3') return null;
    return employees.find(e => e.employeeId === compareMode) || null;
  }, [employees, compareMode]);

  // Se houver menos de 3 postos no setor ativo, usamos os postos disponíveis ou geramos eixos limpos
  const radarStations = useMemo(() => {
    if (stations.length >= 3) return stations;
    return stations;
  }, [stations]);

  // Dimensões do SVG
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 115;
  const numAxes = Math.max(3, radarStations.length);

  // Ângulos e coordenadas dos eixos
  const axisAngles = useMemo(() => {
    return radarStations.map((_, i) => {
      return -Math.PI / 2 + (2 * Math.PI * i) / numAxes;
    });
  }, [radarStations, numAxes]);

  // Polígonos de teia concêntrica (Níveis 1, 2, 3, 4)
  const rings = [1, 2, 3, 4].map(level => {
    const r = (level / 4) * maxRadius;
    const points = axisAngles.map(angle => {
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return { level, points, r };
  });

  // Polígono do Benchmark Nível 3 (Target Autônomo)
  const targetPolygonPoints = useMemo(() => {
    const r = (3 / 4) * maxRadius;
    return axisAngles.map(angle => {
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  }, [axisAngles, cx, cy, maxRadius]);

  // Polígono do Operador Primário
  const primaryPointsData = useMemo(() => {
    if (!primaryOperator || radarStations.length === 0) return [];
    return radarStations.map((st, i) => {
      const level = (primaryOperator.skills[st.id] || 1) as SkillLevel;
      const r = (level / 4) * maxRadius;
      const angle = axisAngles[i];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { x, y, level, station: st };
    });
  }, [primaryOperator, radarStations, axisAngles, cx, cy, maxRadius]);

  const primaryPolygonString = useMemo(() => {
    return primaryPointsData.map(p => `${p.x},${p.y}`).join(' ');
  }, [primaryPointsData]);

  // Polígono do Operador Comparador
  const comparePointsData = useMemo(() => {
    if (!compareOperator || radarStations.length === 0) return [];
    return radarStations.map((st, i) => {
      const level = (compareOperator.skills[st.id] || 1) as SkillLevel;
      const r = (level / 4) * maxRadius;
      const angle = axisAngles[i];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      return { x, y, level, station: st };
    });
  }, [compareOperator, radarStations, axisAngles, cx, cy, maxRadius]);

  const comparePolygonString = useMemo(() => {
    return comparePointsData.map(p => `${p.x},${p.y}`).join(' ');
  }, [comparePointsData]);

  // Métricas do Operador Selecionado
  const primaryStats = useMemo(() => {
    if (!primaryOperator || radarStations.length === 0) {
      return { avg: 0, autonomous: 0, gaps: 0, coveragePct: 0 };
    }
    const levels = radarStations.map(st => primaryOperator.skills[st.id] || 1);
    const sum = levels.reduce((a, b) => a + b, 0);
    const avg = (sum / levels.length).toFixed(1);
    const autonomous = levels.filter(l => l >= 3).length;
    const gaps = levels.filter(l => l < 3).length;
    const coveragePct = Math.round((sum / (radarStations.length * 4)) * 100);
    return { avg, autonomous, gaps, coveragePct };
  }, [primaryOperator, radarStations]);

  if (employees.length === 0 || stations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-600 font-bold text-xs">Dados insuficientes para gerar o Radar de Competências.</p>
        <span className="text-[11px] text-slate-400">Cadastre postos e operadores ou carregue a demonstração.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
      {/* Cabeçalho do Radar & Seletores */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Target className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Radar Chart Dinâmico de Competências Lean (Spider Plot)
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Visualize o perfil de polivalência individual, compare com a linha de base N3 ou faça benchmarking entre operadores.
          </p>
        </div>

        {/* Controles Dinâmicos */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Operador Principal */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Colaborador:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-cyan-500/40 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
            >
              {employees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.employeeName} ({emp.role})
                </option>
              ))}
            </select>
          </div>

          {/* Comparador */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Comparar com:</span>
            <select
              value={compareMode}
              onChange={e => setCompareMode(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="target_n3">🎯 Benchmark Padrão (Nível 3 Autônomo)</option>
              <option value="none">Sem Comparação</option>
              <optgroup label="Outro Colaborador">
                {employees
                  .filter(e => e.employeeId !== selectedEmpId)
                  .map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} ({emp.role})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo: Gráfico SVG do Radar + Painel de Diagnóstico Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Lado Esquerdo: Canvas SVG Interativo */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full max-w-[340px] h-auto overflow-visible select-none"
          >
            {/* Definições de Gradientes */}
            <defs>
              <radialGradient id="radarBackdrop" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0891b2" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="primaryFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="compareFill" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Fundo sutil circular */}
            <circle cx={cx} cy={cy} r={maxRadius} fill="url(#radarBackdrop)" />

            {/* Teia Concéntrica (Níveis 1 a 4) */}
            {rings.map(ring => (
              <polygon
                key={ring.level}
                points={ring.points}
                fill="none"
                stroke={ring.level === 3 ? '#10b981' : '#e2e8f0'}
                strokeWidth={ring.level === 3 ? '1.5' : '1'}
                strokeDasharray={ring.level === 3 ? '3 3' : 'none'}
              />
            ))}

            {/* Raios / Eixos para cada Posto */}
            {axisAngles.map((angle, i) => {
              const x = cx + maxRadius * Math.cos(angle);
              const y = cy + maxRadius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Rótulos de Nível ao longo do raio vertical superior */}
            {[1, 2, 3, 4].map(lvl => (
              <text
                key={lvl}
                x={cx + 4}
                y={cy - (lvl / 4) * maxRadius + 3}
                fill={lvl === 3 ? '#059669' : '#94a3b8'}
                fontSize="8"
                fontWeight="bold"
              >
                N{lvl}
              </text>
            ))}

            {/* Polígono do Benchmark (Nível 3 Autônomo) */}
            {compareMode === 'target_n3' && (
              <polygon
                points={targetPolygonPoints}
                fill="#10b981"
                fillOpacity="0.08"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            )}

            {/* Polígono do Operador Comparador (se selecionado) */}
            {compareOperator && (
              <polygon
                points={comparePolygonString}
                fill="url(#compareFill)"
                stroke="#f59e0b"
                strokeWidth="2"
              />
            )}

            {/* Polígono do Operador Primário */}
            <polygon
              points={primaryPolygonString}
              fill="url(#primaryFill)"
              stroke="#06b6d4"
              strokeWidth="2.5"
            />

            {/* Vértices / Pontos do Operador Primário */}
            {primaryPointsData.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all hover:scale-125 cursor-pointer shadow-sm"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="8"
                  fill="#06b6d4"
                  opacity="0.25"
                />
              </g>
            ))}

            {/* Vértices do Operador Comparador */}
            {comparePointsData.map((pt, i) => (
              <circle
                key={`comp-${i}`}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            ))}

            {/* Rótulos dos Eixos (Nomes dos Postos) */}
            {radarStations.map((st, i) => {
              const angle = axisAngles[i];
              // Offset para fora do polígono
              const labelRadius = maxRadius + 24;
              const lx = cx + labelRadius * Math.cos(angle);
              const ly = cy + labelRadius * Math.sin(angle);

              // Alinhamento inteligente do texto
              let textAnchor: 'start' | 'middle' | 'end' = 'middle';
              if (Math.cos(angle) > 0.3) textAnchor = 'start';
              else if (Math.cos(angle) < -0.3) textAnchor = 'end';

              const curLevel = primaryOperator?.skills[st.id] || 1;

              return (
                <g key={st.id}>
                  <text
                    x={lx}
                    y={ly - 4}
                    textAnchor={textAnchor}
                    fill="#1e293b"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {st.name.length > 20 ? `${st.name.substring(0, 18)}...` : st.name}
                  </text>
                  <text
                    x={lx}
                    y={ly + 8}
                    textAnchor={textAnchor}
                    fill="#0891b2"
                    fontSize="8.5"
                    fontWeight="600"
                  >
                    Nível N{curLevel} ({curLevel >= 3 ? 'Autônomo' : 'Gap'})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legenda do Gráfico */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-cyan-700">
              <span className="w-3 h-3 rounded-full bg-cyan-500 border border-white shadow-xs" />
              <span>{primaryOperator?.employeeName}</span>
            </div>

            {compareMode === 'target_n3' && (
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <span className="w-3 h-0.5 bg-emerald-500 border-b border-dashed border-emerald-500" />
                <span>Benchmark Desejado (N3)</span>
              </div>
            )}

            {compareOperator && (
              <div className="flex items-center gap-1.5 font-bold text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-xs" />
                <span>{compareOperator.employeeName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Diagnóstico & Indicadores do Colaborador */}
        <div className="lg:col-span-5 space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
          <div className="flex items-start justify-between border-b border-slate-200 pb-2.5">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Diagnóstico de Polivalência</span>
              <h5 className="text-sm font-black text-slate-900">{primaryOperator?.employeeName}</h5>
              <span className="text-xs text-slate-500">{primaryOperator?.role} • {primaryOperator?.shift}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-cyan-700">{primaryStats.coveragePct}%</span>
              <span className="text-[10px] text-slate-400 block">Área Coberta</span>
            </div>
          </div>

          {/* KPIs Resumo do Operador */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">Nível Médio</span>
              <p className="font-bold text-slate-900 mt-0.5">{primaryStats.avg} / 4.0</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-emerald-600 block">Autônomos</span>
              <p className="font-bold text-emerald-700 mt-0.5">{primaryStats.autonomous} postos</p>
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-rose-500 block">Gaps (Abaixo N3)</span>
              <p className="font-bold text-rose-600 mt-0.5">{primaryStats.gaps} postos</p>
            </div>
          </div>

          {/* Lista detalhada das habilidades no radar */}
          <div className="space-y-1.5 pt-1 text-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Detalhamento por Posto de Trabalho:
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {radarStations.map(st => {
                const lvl = (primaryOperator?.skills[st.id] || 1) as SkillLevel;
                const isAut = lvl >= 3;

                return (
                  <div 
                    key={st.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs text-[11px]"
                  >
                    <span className="font-medium text-slate-800">{st.name}</span>
                    <div className="flex items-center gap-1.5">
                      <IluoCircle level={lvl} size={16} />
                      <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        isAut ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        N{lvl} {isAut ? '✓ Autônomo' : '• Treinar'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendação Lean do Gestor */}
          <div className="bg-cyan-50/60 p-2.5 rounded-lg border border-cyan-200 text-[11px] text-cyan-950 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-cyan-900 font-bold">Direcionamento do Gestor:</strong>
              <p className="text-slate-700 leading-tight">
                {primaryStats.gaps === 0 
                  ? 'Colaborador 100% polivalente na célula. Candidato prioritário para formação como Multiplicador (N4) ou Sucessor de Liderança.'
                  : `Focar o plano de capacitação nos ${primaryStats.gaps} postos em gap para elevar o colaborador ao status multifuncional pleno.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
