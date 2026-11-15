'use client';

import React, { useState, useMemo } from 'react';
import { KaizenProject, ContributorRanking, KaizenLevel } from '../types';
import { KAIZEN_LEVEL_CONFIG } from '../mock-data';
import { KaizenLevelBadge } from './KaizenLevelBadge';
import { 
  Users, 
  Award, 
  Trophy, 
  TrendingUp, 
  Search, 
  Star, 
  DollarSign, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  UserCheck,
  Building2,
  X
} from 'lucide-react';

interface KaizenPeopleDashboardProps {
  projects: KaizenProject[];
  onOpenA3: (project: KaizenProject) => void;
  tintedGlass?: boolean;
}

export function KaizenPeopleDashboard({
  projects,
  onOpenA3,
  tintedGlass = false
}: KaizenPeopleDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'leaders' | 'participants'>('all');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  // Calcula estatísticas por pessoa
  const contributors = useMemo(() => {
    const map = new Map<string, {
      name: string;
      role: string;
      department: string;
      ledCount: number;
      participatedCount: number;
      ledProjects: KaizenProject[];
      participatedProjects: KaizenProject[];
      totalPoints: number;
      totalSavings: number;
    }>();

    const safeProjects = Array.isArray(projects) ? projects : [];
    safeProjects.forEach(p => {
      if (!p) return;
      // Líder
      if (p.leaderName) {
        const name = p.leaderName;
        const current = map.get(name) || {
          name,
          role: p.leaderRole || 'Operador',
          department: p.sector || 'Fábrica',
          ledCount: 0,
          participatedCount: 0,
          ledProjects: [],
          participatedProjects: [],
          totalPoints: 0,
          totalSavings: 0
        };

        current.ledCount += 1;
        current.ledProjects.push(p);
        const levelPts = (p.level && KAIZEN_LEVEL_CONFIG[p.level]?.points) || 20;
        current.totalPoints += (levelPts + 15); // +15 bônus de liderança
        current.totalSavings += (p.estimatedSavingsAnnual || 0);

        map.set(name, current);
      }

      // Participantes
      const team = Array.isArray(p.teamMembers) ? p.teamMembers : [];
      team.forEach(member => {
        if (member && member !== p.leaderName) {
          const current = map.get(member) || {
            name: member,
            role: 'Colaborador da Equipe',
            department: p.sector || 'Fábrica',
            ledCount: 0,
            participatedCount: 0,
            ledProjects: [],
            participatedProjects: [],
            totalPoints: 0,
            totalSavings: 0
          };

          current.participatedCount += 1;
          current.participatedProjects.push(p);
          const levelPts = KAIZEN_LEVEL_CONFIG[p.level]?.points || 15;
          current.totalPoints += levelPts;
          current.totalSavings += Math.round((p.estimatedSavingsAnnual || 0) * 0.5);

          map.set(member, current);
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [projects]);

  // Filtros
  const filteredContributors = contributors.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || c.department === selectedSector;
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'leaders' ? c.ledCount > 0 :
      c.participatedCount > 0;

    return matchesSearch && matchesSector && matchesTab;
  });

  const topLeader = [...contributors].sort((a, b) => b.ledCount - a.ledCount)[0];
  const topParticipant = [...contributors].sort((a, b) => b.participatedCount - a.participatedCount)[0];
  const totalEngaged = contributors.length;
  const totalPointsAll = contributors.reduce((acc, c) => acc + c.totalPoints, 0);

  const selectedPersonData = contributors.find(c => c.name === selectedPerson) || null;

  const cardClass = tintedGlass
    ? 'aptis-glass-dark p-5 rounded-2xl'
    : 'aptis-glass-light bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs';

  return (
    <div className="space-y-6 w-full">
      {/* 4 CARDS DE GESTÃO DE PESSOAS & RECONHECIMENTO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Engajamento Total</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              tintedGlass ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-600'
            }`}>
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{totalEngaged}</span>
            <span className={`text-xs font-semibold ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>Colaboradores</span>
          </div>
          <p className={`text-[11px] mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Líderes ou membros de equipe</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Maior Líder de Kaizen</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              tintedGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-600'
            }`}>
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-base font-bold truncate block ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {topLeader ? topLeader.name : 'Nenhum'}
            </span>
            <span className={`text-xs font-semibold font-mono ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>
              {topLeader ? `${topLeader.ledCount} projetos liderados` : '-'}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Destaque de protagonismo</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Mais Participativo</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              tintedGlass ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-blue-50 text-blue-600'
            }`}>
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className={`text-base font-bold truncate block ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {topParticipant ? topParticipant.name : 'Nenhum'}
            </span>
            <span className={`text-xs font-semibold font-mono ${tintedGlass ? 'text-blue-300' : 'text-blue-700'}`}>
              {topParticipant ? `${topParticipant.participatedCount} kaizens no time` : '-'}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Espírito de equipe e apoio</p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Pontos Lean da Fábrica</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalPointsAll}</span>
            <span className={`text-xs font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>pts acumulados</span>
          </div>
          <p className={`text-[11px] mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Quick=10, Std=25, Major=50, Adv=100</p>
        </div>
      </div>

      {/* BARRA DE FILTROS & ABAS */}
      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
        tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-2xs'
      }`}>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className={`inline-flex rounded-xl p-1 border text-xs ${
            tintedGlass ? 'bg-slate-950/70 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? (tintedGlass ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-900 text-white shadow-2xs')
                  : (tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Todos ({contributors.length})
            </button>
            <button
              onClick={() => setActiveTab('leaders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'leaders'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : (tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Líderes de Kaizen ({contributors.filter(c => c.ledCount > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'participants'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : (tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Participantes ({contributors.filter(c => c.participatedCount > 0).length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador..."
              className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder-slate-400'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:bg-white'
              }`}
            />
          </div>
        </div>
      </div>

      {/* TABELA DE RANKING DE PROTAGONISMO KAISEN */}
      <div className={`rounded-2xl overflow-hidden ${
        tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-2xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b font-bold uppercase text-[10px] tracking-wider ${
              tintedGlass
                ? 'bg-slate-950/70 border-white/10 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <tr>
                <th className="py-3 px-4">Posição & Colaborador</th>
                <th className="py-3 px-4">Setor / Função</th>
                <th className="py-3 px-4 text-center">Kaizens Liderados</th>
                <th className="py-3 px-4 text-center">Participações</th>
                <th className="py-3 px-4 text-center">Pontos Lean</th>
                <th className="py-3 px-4 text-right">Impacto Financeiro</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tintedGlass ? 'divide-white/10' : 'divide-slate-100'}`}>
              {filteredContributors.map((c, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null;

                return (
                  <tr key={c.name} className={`transition-colors ${
                    tintedGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'
                  }`}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          index === 0 ? (tintedGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-amber-100 text-amber-800 border border-amber-300') :
                          index === 1 ? (tintedGlass ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-700') :
                          index === 2 ? (tintedGlass ? 'bg-amber-500/15 text-amber-300' : 'bg-amber-50 text-amber-700') :
                          'text-slate-400'
                        }`}>
                          {medal || index + 1}
                        </span>
                        <div>
                          <span className={`font-bold block ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{c.name}</span>
                          <span className={`text-[10px] ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`}>{c.role}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded border text-[11px] ${
                        tintedGlass
                          ? 'bg-slate-800/80 text-slate-200 border-white/10'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {c.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${
                        c.ledCount > 0
                          ? (tintedGlass ? 'bg-amber-500/20 text-amber-300 border border-amber-500/35' : 'bg-amber-50 text-amber-700 border border-amber-200')
                          : (tintedGlass ? 'text-slate-600' : 'text-slate-400')
                      }`}>
                        {c.ledCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-xs ${
                        c.participatedCount > 0
                          ? (tintedGlass ? 'bg-blue-500/20 text-blue-300 border border-blue-500/35' : 'bg-blue-50 text-blue-700 border border-blue-200')
                          : (tintedGlass ? 'text-slate-600' : 'text-slate-400')
                      }`}>
                        {c.participatedCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded border ${
                        tintedGlass
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {c.totalPoints} pts
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {c.totalSavings > 0 ? (
                        <span className={tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}>
                          R$ {c.totalSavings.toLocaleString('pt-BR')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedPerson(c.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'bg-white/10 hover:bg-purple-600 text-slate-200 hover:text-white border border-white/10'
                            : 'bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700'
                        }`}
                      >
                        Ver Kaizens
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE HISTÓRICO DE KAIZENS DO COLABORADOR */}
      {selectedPersonData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`rounded-2xl border shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            tintedGlass
              ? 'aptis-glass-modal border-white/10 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className={`p-5 border-b flex items-center justify-between ${
              tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                  tintedGlass ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700'
                }`}>
                  {selectedPersonData.name.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{selectedPersonData.name}</h3>
                  <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>{selectedPersonData.role} • {selectedPersonData.department}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  tintedGlass ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              {/* Resumo do Colaborador */}
              <div className={`grid grid-cols-3 gap-3 p-3 rounded-xl border text-center ${
                tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Liderados</span>
                  <span className={`text-lg font-black ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>{selectedPersonData.ledCount}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Participações</span>
                  <span className={`text-lg font-black ${tintedGlass ? 'text-blue-300' : 'text-blue-700'}`}>{selectedPersonData.participatedCount}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pontos Lean</span>
                  <span className={`text-lg font-black ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>{selectedPersonData.totalPoints}</span>
                </div>
              </div>

              {/* Kaizens Liderados */}
              {selectedPersonData.ledProjects.length > 0 && (
                <div className="space-y-2">
                  <h4 className={`font-bold text-xs flex items-center gap-1.5 ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>
                    <Trophy className="w-3.5 h-3.5" /> Projetos que Liderou ({selectedPersonData.ledProjects.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPersonData.ledProjects.map(p => (
                      <div key={p.id} className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${
                        tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-white border-slate-200 shadow-2xs'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                            <span className={`text-[11px] font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>{p.title}</span>
                          </div>
                          <p className={`text-[10px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>{p.sector} • {p.area}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPerson(null);
                            onOpenA3(p);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] shrink-0 cursor-pointer ${
                            tintedGlass
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/35 hover:bg-purple-500/30'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          Ver A3
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kaizens que Participou */}
              {selectedPersonData.participatedProjects.length > 0 && (
                <div className="space-y-2">
                  <h4 className={`font-bold text-xs flex items-center gap-1.5 ${tintedGlass ? 'text-blue-300' : 'text-blue-700'}`}>
                    <Users className="w-3.5 h-3.5" /> Kaizens que Participou no Time ({selectedPersonData.participatedProjects.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPersonData.participatedProjects.map(p => (
                      <div key={p.id} className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${
                        tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-white border-slate-200 shadow-2xs'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                            <span className={`text-[11px] font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>{p.title}</span>
                          </div>
                          <p className={`text-[10px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Líder: {p.leaderName} • {p.sector}</p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPerson(null);
                            onOpenA3(p);
                          }}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[10px] shrink-0 cursor-pointer ${
                            tintedGlass
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/35 hover:bg-purple-500/30'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          Ver A3
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
