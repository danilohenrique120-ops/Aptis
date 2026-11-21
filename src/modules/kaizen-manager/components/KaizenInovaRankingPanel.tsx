'use client';

import React, { useMemo, useState } from 'react';
import type { User } from '@/types';
import type { PlantSector } from '@/types/sectors';
import { KaizenProject } from '../types';
import {
  INOVA_LIKE_POINTS,
  INOVA_YOKOTEN_POINTS,
  buildCompletedSectorLeaderboard,
  buildInovaLeaderboard,
  canEditKaizen,
  getKaizenLikesCount
} from '../kaizen-helpers';
import { KaizenLevelBadge } from './KaizenLevelBadge';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Crown,
  FileText,
  Globe,
  Heart,
  Repeat2,
  Search,
  Trophy,
  Users,
  X
} from 'lucide-react';

interface KaizenInovaRankingPanelProps {
  allProjects: KaizenProject[];
  plantSectors: PlantSector[];
  effectiveUser: User;
  onOpenA3: (project: KaizenProject, readOnly: boolean) => void;
  tintedGlass?: boolean;
}

export function KaizenInovaRankingPanel({
  allProjects,
  plantSectors,
  effectiveUser,
  onOpenA3,
  tintedGlass = false
}: KaizenInovaRankingPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'leaders' | 'participants'>('all');
  const [sortBy, setSortBy] = useState<'inova_score' | 'completed' | 'likes' | 'savings'>('inova_score');
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null);

  // Ranking global estritamente baseado em projetos CONCLUÍDOS & IMPLEMENTADOS
  const contributors = useMemo(() => buildInovaLeaderboard(allProjects), [allProjects]);
  const sectorRanking = useMemo(() => buildCompletedSectorLeaderboard(allProjects), [allProjects]);

  const sortedContributors = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = contributors.filter(c => {
      if (roleFilter === 'leaders' && c.ledCount === 0) return false;
      if (roleFilter === 'participants' && c.participatedCount === 0) return false;
      if (term) {
        const matches =
          c.name.toLowerCase().includes(term) ||
          c.department.toLowerCase().includes(term) ||
          c.role.toLowerCase().includes(term);
        if (!matches) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'completed') {
        if (b.totalKaizens !== a.totalKaizens) return b.totalKaizens - a.totalKaizens;
        return b.likesReceived - a.likesReceived;
      }
      if (sortBy === 'likes') {
        if (b.likesReceived !== a.likesReceived) return b.likesReceived - a.likesReceived;
        return b.totalKaizens - a.totalKaizens;
      }
      if (sortBy === 'savings') {
        return b.totalSavingsGenerated - a.totalSavingsGenerated;
      }
      return b.totalPoints - a.totalPoints;
    });
  }, [contributors, roleFilter, searchTerm, sortBy]);

  const top3 = sortedContributors.slice(0, 3);
  const selectedPerson = contributors.find(c => c.name === selectedPersonName) || null;

  const completedProjectsAll = useMemo(
    () => (Array.isArray(allProjects) ? allProjects : []).filter(p => p && p.stage === 'standardized'),
    [allProjects]
  );

  const plantSummary = useMemo(() => {
    const totalCompleted = completedProjectsAll.length;
    const totalLikes = completedProjectsAll.reduce(
      (acc, p) => acc + (p.isPublishedToFeed ? getKaizenLikesCount(p) : 0),
      0
    );
    const totalReplications = completedProjectsAll.reduce(
      (acc, p) => acc + (p.isPublishedToFeed ? p.replicationCount || 0 : 0),
      0
    );
    return {
      innovatorsCount: contributors.length,
      totalCompleted,
      totalLikes,
      totalReplications
    };
  }, [completedProjectsAll, contributors.length]);

  const cardClass = tintedGlass
    ? 'aptis-glass-dark p-5 rounded-2xl border border-white/10'
    : 'aptis-glass-light bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs';

  return (
    <div className="space-y-6 w-full">
      {/* 1. HEADER DO HALL DA FAMA & GAMIFICAÇÃO INOVA */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 ${
          tintedGlass
            ? 'aptis-glass-dark text-white border-white/10'
            : 'aptis-glass-light text-slate-900 border-slate-200 shadow-sm'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.65) 0%, rgba(234, 88, 12, 0.25) 65%, transparent 80%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  tintedGlass
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                Ranking Público da Fábrica • Meritocracia Real
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Pontua apenas projetos finalizados, curtidas no Feed (+{INOVA_LIKE_POINTS} pts) e replicações Yokoten (+{INOVA_YOKOTEN_POINTS} pts)
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Ranking Inova &amp; Hall da Fama da Melhoria Contínua
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Reconheça os colaboradores e áreas com mais projetos Kaizen efetivamente implementados, curtidos pela planta e replicados em outras operações.
            </p>
          </div>
        </div>

        {/* 4 KPIs de Engajamento Real */}
        <div
          className={`relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t ${
            tintedGlass ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>
              <span>Inovadores Ativos</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {plantSummary.innovatorsCount}
            </p>
            <span className="text-[10px] text-slate-400">com entregas concluídas</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <span>Projetos Finalizados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-emerald-300' : 'text-emerald-600'}`}>
              {plantSummary.totalCompleted}
            </p>
            <span className="text-[10px] text-slate-400">padronizados na planta</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-rose-300' : 'text-rose-700'}`}>
              <span>Curtidas Acumuladas</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-rose-300' : 'text-rose-600'}`}>
              {plantSummary.totalLikes}
            </p>
            <span className="text-[10px] text-slate-400">votos no Mural Inova</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
              <span>Yokotens Gerados</span>
              <Repeat2 className="w-4 h-4 text-cyan-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
              {plantSummary.totalReplications}
            </p>
            <span className="text-[10px] text-slate-400">melhorias multiplicadas</span>
          </div>
        </div>
      </div>

      {/* 2. PÓDIO TOP 3 INOVADORES */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((person, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
            const rankTitle = idx === 0 ? '1º Lugar • Destaque Inova' : idx === 1 ? '2º Lugar • Vice-Líder' : '3º Lugar • Top Inovador';
            const borderAccent =
              idx === 0
                ? tintedGlass
                  ? 'border-amber-400/50 bg-gradient-to-br from-amber-500/15 via-slate-900/70 to-slate-950/90'
                  : 'border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white'
                : idx === 1
                  ? tintedGlass
                    ? 'border-slate-300/35 bg-gradient-to-br from-slate-400/15 via-slate-900/70 to-slate-950/90'
                    : 'border-slate-300 bg-gradient-to-br from-slate-50 via-white to-white'
                  : tintedGlass
                    ? 'border-orange-400/35 bg-gradient-to-br from-orange-500/15 via-slate-900/70 to-slate-950/90'
                    : 'border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-white';

            return (
              <div
                key={person.name}
                onClick={() => setSelectedPersonName(person.name)}
                className={`rounded-3xl p-5 border shadow-lg transition-all hover:scale-[1.01] cursor-pointer flex flex-col justify-between gap-3 ${borderAccent}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                      idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : 'text-orange-400'
                    }`}>
                      {idx === 0 && <Crown className="w-3.5 h-3.5" />}
                      {rankTitle}
                    </span>
                    <span className="text-2xl leading-none">{medal}</span>
                  </div>

                  <h3 className={`text-base font-black truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {person.name}
                  </h3>
                  <p className={`text-xs truncate ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                    {person.department} • {person.role}
                  </p>

                  {person.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {person.badges.slice(0, 3).map(b => (
                        <span
                          key={b.id}
                          title={b.description}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            tintedGlass ? b.darkClass : b.lightClass
                          }`}
                        >
                          {b.icon} {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`grid grid-cols-3 gap-2 pt-3 border-t text-center ${
                    tintedGlass ? 'border-white/10' : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className={`text-sm font-black font-mono ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      {person.totalKaizens}
                    </div>
                    <div className="text-[10px] text-slate-400">Finalizados</div>
                  </div>
                  <div>
                    <div className={`text-sm font-black font-mono ${tintedGlass ? 'text-rose-300' : 'text-rose-600'}`}>
                      {person.likesReceived}
                    </div>
                    <div className="text-[10px] text-slate-400">Curtidas</div>
                  </div>
                  <div>
                    <div className={`text-sm font-black font-mono ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>
                      {person.totalPoints}
                    </div>
                    <div className="text-[10px] text-slate-400">XP Inova</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. CONTROLES & TABELA COMPLETA DO RANKING */}
      <div className={cardClass}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`inline-flex rounded-xl p-1 border text-xs ${
                tintedGlass ? 'bg-slate-950/70 border-white/10' : 'bg-slate-100 border-slate-200'
              }`}
            >
              {([
                { id: 'all', label: `Todos (${contributors.length})` },
                { id: 'leaders', label: 'Líderes' },
                { id: 'participants', label: 'Coautores' }
              ] as const).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRoleFilter(item.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    roleFilter === item.id
                      ? 'bg-amber-600 text-white shadow-xs'
                      : tintedGlass
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={e =>
                setSortBy(e.target.value as 'inova_score' | 'completed' | 'likes' | 'savings')
              }
              className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-amber-300 [&>option]:bg-slate-900 [&>option]:text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="inova_score">🏆 Ordenar por Score Inova (XP)</option>
              <option value="completed">✅ Mais Projetos Finalizados</option>
              <option value="likes">❤️ Mais Curtidos no Feed</option>
              <option value="savings">💰 Maior Economia Gerada</option>
            </select>
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador ou setor..."
              className={`w-full rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900'
              }`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b font-bold uppercase text-[10px] tracking-wider ${
                tintedGlass
                  ? 'bg-slate-950/70 border-white/10 text-slate-300'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <tr>
                <th className="py-3 px-3">Posição &amp; Inovador</th>
                <th className="py-3 px-3">Setor / Insígnias</th>
                <th className="py-3 px-3 text-center">Finalizados (Líder / Time)</th>
                <th className="py-3 px-3 text-center">Curtidas</th>
                <th className="py-3 px-3 text-center">Yokoten</th>
                <th className="py-3 px-3 text-center">XP Inova</th>
                <th className="py-3 px-3 text-right">Economia</th>
                <th className="py-3 px-3 text-right">Dossiê</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tintedGlass ? 'divide-white/10' : 'divide-slate-100'}`}>
              {sortedContributors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    Nenhum projeto concluído registrado para exibir no Ranking Inova ainda.
                  </td>
                </tr>
              ) : (
                sortedContributors.map((c, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                  return (
                    <tr
                      key={c.name}
                      className={`transition-colors ${
                        tintedGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 text-center font-black text-sm shrink-0">
                            {medal}
                          </span>
                          <div>
                            <div className={`font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                              {c.name}
                            </div>
                            <div className="text-[11px] text-slate-400">{c.role}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className={`font-semibold text-[11px] ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                          {c.department}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.badges.slice(0, 2).map(b => (
                            <span
                              key={b.id}
                              title={b.description}
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                tintedGlass ? b.darkClass : b.lightClass
                              }`}
                            >
                              {b.icon} {b.label}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <span
                          className={`px-2.5 py-1 rounded-lg font-bold border ${
                            tintedGlass
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {c.totalKaizens}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          {c.ledCount}L / {c.participatedCount}T
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            c.likesReceived > 0
                              ? tintedGlass ? 'text-rose-300' : 'text-rose-600'
                              : 'text-slate-500'
                          }`}
                        >
                          <Heart className="w-3 h-3 fill-current" />
                          {c.likesReceived}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            c.replicationsReceived > 0
                              ? tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                              : 'text-slate-500'
                          }`}
                        >
                          <Repeat2 className="w-3 h-3" />
                          {c.replicationsReceived}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono">
                        <span
                          className={`px-2.5 py-1 rounded-full font-black border ${
                            tintedGlass
                              ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {c.totalPoints} pts
                        </span>
                      </td>

                      <td
                        className={`py-3.5 px-3 text-right font-mono font-bold ${
                          tintedGlass ? 'text-emerald-400' : 'text-emerald-700'
                        }`}
                      >
                        {c.totalSavingsGenerated > 0
                          ? `R$ ${c.totalSavingsGenerated.toLocaleString('pt-BR')}`
                          : '-'}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPersonName(c.name)}
                          className={`inline-flex items-center gap-1 font-bold text-[11px] hover:underline cursor-pointer ${
                            tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                          }`}
                        >
                          Entregas
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RANKING SAUDÁVEL DE SETORES (APENAS ENTREGAS CONCLUÍDAS) */}
      {sectorRanking.length > 0 && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <Building2 className="w-4 h-4 text-cyan-400" />
                Ranking de Setores Inovadores (Somente Entregas Concluídas)
              </h3>
              <p className={`text-[11px] mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Visão pública de resultados concluídos por área sem expor projetos em andamento ou pendências privadas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sectorRanking.map((sec, idx) => (
              <div
                key={sec.sector}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-2 ${
                  tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-bold text-xs truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`} {sec.sector}
                  </span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                    tintedGlass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {sec.completedCount} entrega(s)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/10">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" /> {sec.totalLikes} curtidas
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 className="w-3 h-3 text-cyan-400" /> {sec.totalReplications} Yokoten
                  </span>
                  <span className={`font-mono font-bold ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    R$ {(sec.totalSavings / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DOSSIÊ DE PROJETOS CONCLUÍDOS DO COLABORADOR */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 my-8 ${
              tintedGlass ? 'aptis-glass-modal text-white' : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setSelectedPersonName(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black flex items-center justify-center shadow-md">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  {selectedPerson.name}
                </h3>
                <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                  {selectedPerson.department} • {selectedPerson.totalPoints} pts Inova • {selectedPerson.totalKaizens} entrega(s) concluída(s)
                </p>
              </div>
            </div>

            {selectedPerson.badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedPerson.badges.map(b => (
                  <span
                    key={b.id}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      tintedGlass ? b.darkClass : b.lightClass
                    }`}
                  >
                    {b.icon} {b.label} — {b.description}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {selectedPerson.completedProjects.map(p => {
                const canEdit = canEditKaizen(p, plantSectors, effectiveUser);
                const canOpen = canEdit || Boolean(p.isPublishedToFeed);
                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                        <span className="text-[10px] font-semibold text-slate-400">
                          {p.sector} • {p.leaderName === selectedPerson.name ? 'Líder' : 'Coautor'}
                        </span>
                        {p.isPublishedToFeed && (
                          <span className="text-[10px] font-bold text-rose-400 inline-flex items-center gap-0.5">
                            ❤️ {getKaizenLikesCount(p)}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                        {p.title}
                      </h4>
                    </div>

                    {canOpen && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPersonName(null);
                          onOpenA3(p, !canEdit);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Ver A3
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
