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
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

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
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);
  const [tintedGlass, setTintedGlass] = useState<boolean>(true);

  useEffect(() => {
    const syncGlassMode = () => {
      try {
        const saved = localStorage.getItem('aptis_tinted_glass_mode');
        setTintedGlass(saved === null ? true : saved === 'true');
      } catch {
        setTintedGlass(true);
      }
    };
    syncGlassMode();
    window.addEventListener('aptis-glass-mode-change', syncGlassMode);
    return () => window.removeEventListener('aptis-glass-mode-change', syncGlassMode);
  }, []);

  const handleImportKaizenExcel = (rows: Record<string, any>[]) => {
    const newKaizens: KaizenProject[] = rows.map((row, idx) => {
      const rawCat = (row.category || '').trim().toLowerCase();
      let category: KaizenCategory = 'produtividade';
      if (rawCat.includes('segur')) category = 'segurança';
      else if (rawCat.includes('qual')) category = 'qualidade';
      else if (rawCat.includes('cust')) category = 'custo';
      else if (rawCat.includes('ergo')) category = 'ergonomia';

      const rawStage = (row.stage || '').trim().toLowerCase();
      let stage: KaizenStage = 'ideation';
      if (rawStage.includes('anal')) stage = 'analysis';
      else if (rawStage.includes('impl')) stage = 'implementation';
      else if (rawStage.includes('conc') || rawStage.includes('padr')) stage = 'standardized';

      const savings = Number(row.impactValue) || 5000;

      return {
        id: `kz-imp-${Date.now()}-${idx}`,
        tenantId: currentTenant.id,
        title: (row.title || 'Iniciativa Kaizen').trim(),
        level: savings > 50000 ? 'major' : savings > 15000 ? 'standard' : 'quick',
        category,
        stage,
        sector: (row.sector || 'Usinagem CNC').trim(),
        area: 'Chão de Fábrica',
        leaderName: (row.author || 'Líder Kaizen').trim(),
        leaderRole: 'Operador / Melhoria Contínua',
        teamMembers: [],
        estimatedSavingsAnnual: savings,
        hoursSavedMonthly: Math.round(savings / 500),
        createdAt: new Date().toISOString().split('T')[0],
        a3: {
          background: (row.description || '').trim(),
          problemStatement: 'Desvio identificado na rotina de chão de fábrica.',
          currentCondition: '',
          fiveWhys: { why1: '', why2: '', why3: '', why4: '', why5: '', rootCause: '' },
          targetCondition: '',
          targetKpiGoal: 'Otimização de processo',
          actionPlan: [],
          verificationResults: '',
          savingsAnnual: savings,
          hoursSavedMonthly: Math.round(savings / 500),
          isTargetAchieved: stage === 'standardized',
          standardizationSummary: '',
          skillsMatrixUpdated: false,
          lessonsLearned: ''
        }
      };
    });

    setProjects(prev => [...newKaizens, ...prev]);

    return {
      successCount: newKaizens.length,
      message: `${newKaizens.length} projetos Kaizen importados e adicionados ao funil A3!`
    };
  };

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
      {/* =====================================================================
          1. CABEÇALHO EXECUTIVO COM SUB-CÁPSULAS DE KPIS (PADRÃO APTIS ROUTINE)
         ===================================================================== */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.65) 0%, rgba(6, 182, 212, 0.25) 60%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  tintedGlass
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/35'
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Melhoria Contínua & Lean Manufacturing
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Unidade: {currentTenant.name}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aptis Kaizen • Gestão de Melhorias & A3 PDCA
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Governança de melhorias nos 4 níveis (Quick, Standard, Major, Advanced), controle de líderes e participantes, distribuição setorial e relatórios A3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {safeProjects.length === 0 ? (
              <button
                onClick={() => setProjects(INITIAL_KAIZEN_PROJECTS)}
                title="Carregar exemplos de Kaizen para teste"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Carregar Exemplos
              </button>
            ) : (
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja zerar todos os projetos Kaizen?')) {
                    setProjects([]);
                  }
                }}
                title="Limpar todos os projetos Kaizen"
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs transition-colors cursor-pointer rounded-xl ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar Kaizens
              </button>
            )}

            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar ideias Kaizen a partir do Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Importar Excel
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              <Plus className="w-4 h-4" />
              Novo Projeto Kaizen
            </button>
          </div>
        </div>

        {/* KPI Cards Rápidos em Sub-cápsulas de Vidro */}
        <div
          className={`relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
          }`}
        >
          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Total de Kaizens</span>
              <Sparkles className="w-4 h-4 text-slate-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalProjects}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              <span>Padronizados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {standardizedCount}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-cyan-300' : 'text-cyan-700'
              }`}
            >
              <span>Economia Financeira</span>
              <DollarSign className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span
                className={`text-2xl font-black font-mono ${
                  tintedGlass ? 'text-cyan-300' : 'text-slate-900'
                }`}
              >
                R$ {(totalSavings / 1000).toFixed(0)}k
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/ano</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-blue-300' : 'text-blue-600'
              }`}
            >
              <span>Horas Liberadas</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1">
              <span
                className={`text-2xl font-black font-mono ${
                  tintedGlass ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {totalHours}h
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. TRILHO DE MENISCO & CÁPSULA SETORIAL (PADRÃO APTIS ROUTINE)
         ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="overflow-x-auto pb-1 lg:pb-0">
          <div className="aptis-meniscus-track inline-flex items-center gap-1 p-1.5">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'kanban'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeTab === 'kanban'
                  ? {
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #06b6d4 100%)',
                      border: '1px solid rgba(147, 197, 253, 0.5)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -3px rgba(37, 99, 235, 0.55)'
                    }
                  : undefined
              }
            >
              <Kanban className="w-3.5 h-3.5" />
              Funil & Quadro Kanban
            </button>

            <button
              onClick={() => setActiveTab('people')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'people'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeTab === 'people'
                  ? {
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #06b6d4 100%)',
                      border: '1px solid rgba(147, 197, 253, 0.5)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -3px rgba(37, 99, 235, 0.55)'
                    }
                  : undefined
              }
            >
              <Users className="w-3.5 h-3.5" />
              Pessoas & Liderança
            </button>

            <button
              onClick={() => setActiveTab('sectors')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'sectors'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeTab === 'sectors'
                  ? {
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #06b6d4 100%)',
                      border: '1px solid rgba(147, 197, 253, 0.5)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -3px rgba(37, 99, 235, 0.55)'
                    }
                  : undefined
              }
            >
              <Building2 className="w-3.5 h-3.5" />
              Distribuição por Setores & Níveis
            </button>

            <button
              onClick={() => setActiveTab('a3_central')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'a3_central'
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={
                activeTab === 'a3_central'
                  ? {
                      background:
                        'linear-gradient(135deg, #2563eb 0%, #3b82f6 55%, #06b6d4 100%)',
                      border: '1px solid rgba(147, 197, 253, 0.5)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px -3px rgba(37, 99, 235, 0.55)'
                    }
                  : undefined
              }
            >
              <FileText className="w-3.5 h-3.5" />
              Central de Relatórios A3 (PDCA)
            </button>
          </div>
        </div>

        {/* Cápsula Setorial à Direita */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-white'
              : 'bg-white border border-slate-200 shadow-2xs text-slate-800'
          }`}
        >
          <label
            htmlFor="kaizen-sector-select"
            className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área / Setor:</span>
          </label>
          <select
            id="kaizen-sector-select"
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer min-w-[180px] ${
              tintedGlass
                ? 'text-cyan-300 [&>option]:bg-slate-900 [&>option]:text-white'
                : 'text-slate-900 [&>option]:bg-white [&>option]:text-slate-900'
            }`}
          >
            <option value="all" className="py-1">Todos os Setores</option>
            {sectorsList.map(s => (
              <option key={s} value={s} className="py-1">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ABA 1: FUNIL & QUADRO KANBAN */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          {/* BARRA DE FILTRO */}
          <div
            className={`p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-all ${
              tintedGlass
                ? 'aptis-glass-dark text-white'
                : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, líder, participante ou setor..."
                className={`w-full rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder-slate-400'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-white'
                    : 'bg-white border border-slate-200 text-slate-800'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  Nível:
                </span>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${
                    tintedGlass
                      ? 'text-cyan-300 [&>option]:bg-slate-900 [&>option]:text-white'
                      : 'text-slate-900 [&>option]:bg-white [&>option]:text-slate-900'
                  }`}
                >
                  <option value="all">Todos os Níveis</option>
                  <option value="quick">⚡ Quick Kaizen</option>
                  <option value="standard">🛠️ Standard Kaizen</option>
                  <option value="major">🏭 Major Kaizen</option>
                  <option value="advanced">🔬 Advanced Kaizen</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4 COLUNAS KANBAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map((stage) => {
              const stageProjects = filteredProjects.filter(p => p.stage === stage.id);

              return (
                <div
                  key={stage.id}
                  className={`rounded-3xl p-4 space-y-3 flex flex-col min-h-[520px] transition-all duration-500 ${
                    tintedGlass
                      ? 'aptis-glass-dark text-white'
                      : 'aptis-glass-light text-slate-900'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between pb-3 border-b ${
                      tintedGlass ? 'border-white/10' : 'border-slate-200/80'
                    }`}
                  >
                    <span
                      className={`font-black text-xs uppercase tracking-wider flex items-center gap-2 ${
                        tintedGlass ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                      {stage.label}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold font-mono text-[11px] ${
                        tintedGlass
                          ? 'bg-white/10 text-slate-200 border border-white/15'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {stageProjects.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                    {stageProjects.map((p) => (
                      <div
                        key={p.id}
                        className={`rounded-2xl p-3.5 transition-all space-y-2.5 ${
                          tintedGlass
                            ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                            : 'bg-white border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                          <span className="text-[10px] text-slate-400 font-mono">{p.createdAt}</span>
                        </div>

                        <h4
                          className={`font-bold text-xs leading-snug ${
                            tintedGlass ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {p.title}
                        </h4>

                        <div className={`text-[11px] space-y-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          <p>
                            Setor: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{p.sector}</strong> ({p.area})
                          </p>
                          <p>
                            Líder: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{p.leaderName}</strong>
                          </p>
                        </div>

                        {(p.estimatedSavingsAnnual > 0 || p.hoursSavedMonthly > 0) && (
                          <div
                            className={`p-2 rounded-xl border flex items-center justify-between text-[10px] font-mono ${
                              tintedGlass
                                ? 'bg-slate-950/60 border-white/10'
                                : 'bg-slate-50 border-slate-100'
                            }`}
                          >
                            {p.estimatedSavingsAnnual > 0 && (
                              <span className={`font-bold ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                R$ {p.estimatedSavingsAnnual.toLocaleString('pt-BR')}/ano
                              </span>
                            )}
                            {p.hoursSavedMonthly > 0 && (
                              <span className={`font-bold ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
                                {p.hoursSavedMonthly}h/mês
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          className={`pt-2 border-t flex items-center justify-between gap-2 ${
                            tintedGlass ? 'border-white/10' : 'border-slate-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedProjectForA3(p)}
                            className={`text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                              tintedGlass ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver A3
                          </button>

                          {stage.id !== 'standardized' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(p.id, p.stage)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                                tintedGlass
                                  ? 'bg-white/10 hover:bg-blue-600 text-slate-200 hover:text-white border border-white/10'
                                  : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                              }`}
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
          tintedGlass={tintedGlass}
        />
      )}

      {/* ABA 3: DISTRIBUIÇÃO POR SETORES */}
      {activeTab === 'sectors' && (
        <KaizenSectorMatrix
          projects={projects}
          onOpenA3={(p) => setSelectedProjectForA3(p)}
          tintedGlass={tintedGlass}
        />
      )}

      {/* ABA 4: CENTRAL DE RELATÓRIOS A3 */}
      {activeTab === 'a3_central' && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              tintedGlass
                ? 'aptis-glass-dark text-white border-white/10'
                : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <FileText className={`w-5 h-5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                Central de Relatórios A3 (Metodologia PDCA)
              </h3>
              <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Acesse, edite ou imprima os formulários A3 de cada iniciativa Lean seguindo o padrão Toyota.
              </p>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Novo Relatório A3
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((p) => (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  tintedGlass
                    ? 'aptis-glass-dark border-white/10 hover:border-cyan-400/40 text-white'
                    : 'aptis-glass-light hover:border-blue-400 text-slate-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                    <span className="text-[11px] font-bold text-slate-400 font-mono">{p.createdAt}</span>
                  </div>

                  <h4 className={`text-sm font-bold leading-snug ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {p.title}
                  </h4>

                  <p className={`text-xs line-clamp-2 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                    {p.a3.problemStatement}
                  </p>

                  <div
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      tintedGlass
                        ? 'aptis-glass-subcard border-white/10'
                        : 'bg-blue-50/50 border-blue-100'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase block ${tintedGlass ? 'text-cyan-400' : 'text-blue-800'}`}>
                      Causa Raiz Identificada (5 Porquês):
                    </span>
                    <p className={`text-[11px] font-medium ${tintedGlass ? 'text-slate-200' : 'text-slate-800'}`}>
                      {p.a3.fiveWhys.rootCause || 'Em investigação'}
                    </p>
                  </div>
                </div>

                <div
                  className={`pt-3 border-t flex items-center justify-between text-xs ${
                    tintedGlass ? 'border-white/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>Líder: <strong className={tintedGlass ? 'text-white' : 'text-slate-700'}>{p.leaderName}</strong></span>
                    <span className="mx-1.5">•</span>
                    <span>{p.sector}</span>
                  </div>

                  <button
                    onClick={() => setSelectedProjectForA3(p)}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      tintedGlass
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                        : 'bg-slate-900 hover:bg-blue-600 text-white'
                    }`}
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
        tintedGlass={tintedGlass}
      />

      {/* MODAL DO RELATÓRIO A3 COM ABAS PDCA & PREVIEW TOYOTA */}
      {selectedProjectForA3 && (
        <KaizenA3Modal
          project={selectedProjectForA3}
          isOpen={Boolean(selectedProjectForA3)}
          onClose={() => setSelectedProjectForA3(null)}
          onSave={handleUpdateProject}
          tintedGlass={tintedGlass}
        />
      )}

      {/* MODAL DE IMPORTAÇÃO DE EXCEL INTELIGENTE */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['kaizen-manager'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['kaizen-manager'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['kaizen-manager'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['kaizen-manager'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['kaizen-manager'].sampleRows}
        onImport={handleImportKaizenExcel}
      />
    </div>
  );
}
