'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { KaizenProject, KaizenLevel, KaizenCategory, KaizenStage } from './types';
import { INITIAL_KAIZEN_PROJECTS, KAIZEN_LEVEL_CONFIG, SECTORS_LIST } from './mock-data';
import { KaizenLevelBadge } from './components/KaizenLevelBadge';
import { KaizenPeopleDashboard } from './components/KaizenPeopleDashboard';
import { KaizenSectorMatrix } from './components/KaizenSectorMatrix';
import { KaizenA3Modal } from './components/KaizenA3Modal';
import { NewKaizenModal } from './components/NewKaizenModal';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Filter, 
  Kanban, 
  Users, 
  Building2, 
  FileText, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Award, 
  Trash2
} from 'lucide-react';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

const STAGES: { id: KaizenStage; label: string; dot: string }[] = [
  { id: 'ideation', label: '1. Ideação & Submissão', dot: 'bg-purple-500' },
  { id: 'analysis', label: '2. Análise de Viabilidade', dot: 'bg-blue-500' },
  { id: 'implementation', label: '3. Em Implementação', dot: 'bg-amber-500' },
  { id: 'standardized', label: '4. Concluído & Padronizado', dot: 'bg-emerald-500' }
];

const STORAGE_KEY = 'aptis_kaizen_projects_v2';

export default function KaizenManagerModule() {
  const { currentTenant } = useTenant();
  const { sectors: plantSectors } = usePlantSectors();
  const safePlantSectors = Array.isArray(plantSectors) && plantSectors.length > 0 ? plantSectors : [];
  const sectorsList = safePlantSectors.map(s => s.name);
  const [activeTab, setActiveTab] = useState<'kanban' | 'people' | 'sectors' | 'a3_central'>('kanban');
  const [projects, setProjects] = useTenantStorage<KaizenProject[]>('kaizen-manager', 'projects', INITIAL_KAIZEN_PROJECTS);
  const [isLoaded, setIsLoaded] = useState(true);

  // Filtros
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedProjectForA3, setSelectedProjectForA3] = useState<KaizenProject | null>(null);

  // Salvar no Supabase e LocalStorage via useTenantStorage
  const persistProjects = (newProjects: KaizenProject[]) => {
    setProjects(newProjects);
  };

  const handleAddProject = (newProject: KaizenProject) => {
    const updated = [newProject, ...projects];
    persistProjects(updated);
  };

  const handleUpdateProject = (updatedProject: KaizenProject) => {
    const updated = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    persistProjects(updated);
  };

  const handleAdvanceStage = (id: string, currentStage: KaizenStage) => {
    const order: KaizenStage[] = ['ideation', 'analysis', 'implementation', 'standardized'];
    const currentIndex = order.indexOf(currentStage);
    if (currentIndex < order.length - 1) {
      const nextStage = order[currentIndex + 1];
      const updated = projects.map(p => {
        if (p.id === id) {
          return {
            ...p,
            stage: nextStage,
            completedAt: nextStage === 'standardized' ? new Date().toISOString().split('T')[0] : p.completedAt
          };
        }
        return p;
      });
      persistProjects(updated);
    }
  };

  const handleDeleteProject = (id: string) => {
    const updated = (projects || []).filter(p => p.id !== id);
    persistProjects(updated);
  };

  // Filtragem de Projetos 100% segura contra campos nulos
  const safeProjects = Array.isArray(projects) ? projects : [];
  const filteredProjects = safeProjects.filter(p => {
    if (!p) return false;
    const title = p.title || '';
    const leader = p.leaderName || '';
    const sector = p.sector || '';
    const team = Array.isArray(p.teamMembers) ? p.teamMembers : [];

    const matchesSearch = 
      title.toLowerCase().includes(search.toLowerCase()) ||
      leader.toLowerCase().includes(search.toLowerCase()) ||
      sector.toLowerCase().includes(search.toLowerCase()) ||
      team.some(m => (m || '').toLowerCase().includes(search.toLowerCase()));

    const matchesLevel = levelFilter === 'all' || p.level === levelFilter;
    const matchesSector = sectorFilter === 'all' || sector === sectorFilter;

    return matchesSearch && matchesLevel && matchesSector;
  });

  // Métricas Globais
  const totalProjects = safeProjects.length;
  const standardizedCount = safeProjects.filter(p => p && p.stage === 'standardized').length;
  const totalSavings = safeProjects.reduce((acc, p) => acc + (p?.estimatedSavingsAnnual || 0), 0);
  const totalHours = safeProjects.reduce((acc, p) => acc + (p?.hoursSavedMonthly || 0), 0);

  return (
    <div className="space-y-6 w-full pb-12">
      {/* HEADER DO MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Melhoria Contínua & Lean Manufacturing
            </span>
            <span className="text-xs text-slate-500 font-medium">Planta: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            Aptis Kaizen • Gestão de Melhorias & A3 PDCA
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1">
            Governança de melhorias nos 4 níveis (Quick, Standard, Major, Advanced), controle de líderes e participantes, distribuição setorial e relatórios A3.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Projeto Kaizen
          </button>
        </div>
      </div>

      {/* KPI CARDS GLOBAIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Total de Kaizens</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              K
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalProjects}</span>
            <span className="text-xs text-purple-700 font-semibold">iniciativas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Projetos no pipeline</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Padronizados</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{standardizedCount}</span>
            <span className="text-xs text-emerald-700 font-semibold">concluídos</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Com POP e matriz atualizados</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Economia Financeira</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">
              R$ {(totalSavings / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-500 font-mono">/ano</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ganhos comprovados</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Horas Liberadas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 font-mono">{totalHours}h</span>
            <span className="text-xs text-blue-700 font-semibold">/mês</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Tempo útil devolvido ao operador</p>
        </div>
      </div>

      {/* 4 ABAS PRINCIPAIS */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('kanban')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'kanban'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Kanban className="w-4 h-4" />
          Funil & Quadro Kanban
        </button>

        <button
          onClick={() => setActiveTab('people')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'people'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Pessoas & Liderança
        </button>

        <button
          onClick={() => setActiveTab('sectors')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sectors'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Distribuição por Setores & Níveis
        </button>

        <button
          onClick={() => setActiveTab('a3_central')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'a3_central'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Central de Relatórios A3 (PDCA)
        </button>
      </div>

      {/* ABA 1: FUNIL & QUADRO KANBAN */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          {/* BARRA DE FILTRO */}
          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, líder ou setor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todos os Níveis</option>
                <option value="quick">⚡ Quick Kaizen</option>
                <option value="standard">🛠️ Standard Kaizen</option>
                <option value="major">🏭 Major Kaizen</option>
                <option value="advanced">🔬 Advanced Kaizen</option>
              </select>

              <select
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-purple-500"
              >
                <option value="all">Todos os Setores</option>
                {sectorsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 COLUNAS KANBAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map((stage) => {
              const stageProjects = filteredProjects.filter(p => p.stage === stage.id);

              return (
                <div
                  key={stage.id}
                  className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                      {stage.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 font-bold font-mono text-[11px]">
                      {stageProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {stageProjects.map((p) => (
                      <div
                        key={p.id}
                        className="bg-white border border-slate-200 hover:border-purple-400 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <KaizenLevelBadge level={p.level} />
                          <span className="text-[10px] text-slate-400 font-mono">{p.createdAt}</span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs leading-snug">
                          {p.title}
                        </h4>

                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <p>Setor: <strong className="text-slate-700">{p.sector}</strong> ({p.area})</p>
                          <p>Líder: <strong className="text-slate-700">{p.leaderName}</strong></p>
                        </div>

                        {(p.estimatedSavingsAnnual > 0 || p.hoursSavedMonthly > 0) && (
                          <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-[10px] font-mono">
                            {p.estimatedSavingsAnnual > 0 && (
                              <span className="font-bold text-emerald-700">
                                R$ {p.estimatedSavingsAnnual.toLocaleString('pt-BR')}/ano
                              </span>
                            )}
                            {p.hoursSavedMonthly > 0 && (
                              <span className="font-bold text-blue-700">
                                {p.hoursSavedMonthly}h/mês
                              </span>
                            )}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProjectForA3(p)}
                            className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver A3
                          </button>

                          {stage.id !== 'standardized' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(p.id, p.stage)}
                              className="px-2 py-1 bg-slate-100 hover:bg-purple-600 hover:text-white rounded-lg text-[10px] font-bold text-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Avançar para próxima etapa do funil"
                            >
                              <span>Avançar</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {stageProjects.length === 0 && (
                      <div className="p-6 text-center text-slate-400 italic text-xs">
                        Nenhum Kaizen nesta etapa.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA 2: PESSOAS & LIDERANÇA */}
      {activeTab === 'people' && (
        <KaizenPeopleDashboard
          projects={projects}
          onOpenA3={(p) => setSelectedProjectForA3(p)}
        />
      )}

      {/* ABA 3: DISTRIBUIÇÃO POR SETORES */}
      {activeTab === 'sectors' && (
        <KaizenSectorMatrix
          projects={projects}
          onOpenA3={(p) => setSelectedProjectForA3(p)}
        />
      )}

      {/* ABA 4: CENTRAL DE RELATÓRIOS A3 */}
      {activeTab === 'a3_central' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Central de Relatórios A3 (Metodologia PDCA)
              </h3>
              <p className="text-xs text-slate-500">
                Acesse, edite ou imprima os formulários A3 de cada iniciativa Lean seguindo o padrão Toyota.
              </p>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Novo Relatório A3
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 hover:border-purple-400 p-5 rounded-2xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <KaizenLevelBadge level={p.level} />
                    <span className="text-[11px] font-bold text-slate-500 font-mono">{p.createdAt}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {p.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {p.a3.problemStatement}
                  </p>

                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-800 block">Causa Raiz Identificada (5 Porquês):</span>
                    <p className="text-slate-800 text-[11px] font-medium">{p.a3.fiveWhys.rootCause || 'Em investigação'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500">
                    <span>Líder: <strong className="text-slate-700">{p.leaderName}</strong></span>
                    <span className="mx-1.5">•</span>
                    <span>{p.sector}</span>
                  </div>

                  <button
                    onClick={() => setSelectedProjectForA3(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Abrir A3
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE NOVO KAIZEN */}
      <NewKaizenModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleAddProject}
        tenantId={currentTenant.id}
      />

      {/* MODAL DO RELATÓRIO A3 COM ABAS PDCA & PREVIEW TOYOTA */}
      {selectedProjectForA3 && (
        <KaizenA3Modal
          project={selectedProjectForA3}
          isOpen={Boolean(selectedProjectForA3)}
          onClose={() => setSelectedProjectForA3(null)}
          onSave={handleUpdateProject}
        />
      )}
    </div>
  );
}
