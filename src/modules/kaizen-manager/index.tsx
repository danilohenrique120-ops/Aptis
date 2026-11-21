'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { DEFAULT_PLANT_SECTORS, PlantSector } from '@/types/sectors';
import { getAccessibleSectors, isPlantAdminUser } from '@/lib/sector-access';
import {
  KaizenCategory,
  KaizenFeedComment,
  KaizenProject,
  KaizenStage,
  KaizenViewTab
} from './types';
import {
  canEditKaizen,
  canPublishToFeed,
  filterKaizensForUser,
  getKaizenLikesCount,
  getPublishedFeedProjects,
  kaizenBelongsToSector
} from './kaizen-helpers';
import { INITIAL_KAIZEN_PROJECTS } from './mock-data';
import { KaizenLevelBadge } from './components/KaizenLevelBadge';
import { KaizenSectorMatrix } from './components/KaizenSectorMatrix';
import { KaizenA3Modal } from './components/KaizenA3Modal';
import { NewKaizenModal } from './components/NewKaizenModal';
import { KaizenInovaFeedPanel } from './components/KaizenInovaFeedPanel';
import { KaizenInovaRankingPanel } from './components/KaizenInovaRankingPanel';
import { PlantSectorsManagerModal } from '@/components/modals/PlantSectorsManagerModal';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Filter,
  Globe,
  Heart,
  Kanban,
  Lock,
  Plus,
  PlusCircle,
  Repeat2,
  Search,
  Sparkles,
  Trash2,
  Trophy
} from 'lucide-react';

const STAGES: { id: KaizenStage; label: string; dot: string }[] = [
  { id: 'ideation', label: '1. Ideação & Submissão', dot: 'bg-purple-500' },
  { id: 'analysis', label: '2. Análise de Viabilidade', dot: 'bg-blue-500' },
  { id: 'implementation', label: '3. Em Implementação', dot: 'bg-amber-500' },
  { id: 'standardized', label: '4. Concluído & Padronizado', dot: 'bg-emerald-500' }
];

const getTodayIso = () => new Date().toISOString().split('T')[0];
const createKaizenId = (prefix = 'kz') =>
  `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;

const subscribeTintedGlass = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('aptis-glass-mode-change', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('aptis-glass-mode-change', callback);
    window.removeEventListener('storage', callback);
  };
};

const getTintedGlassSnapshot = () => {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('aptis_tinted_glass_mode');
  return saved !== null ? saved === 'true' : true;
};

const getTintedGlassServerSnapshot = () => true;

export default function KaizenManagerModule() {
  const { currentTenant, effectiveUser, isSimulatingManager, simulateAreaManager } = useTenant();
  const isPlantAdmin = isPlantAdminUser(effectiveUser);

  const { sectors: plantSectors } = usePlantSectors();
  const safePlantSectors: PlantSector[] = useMemo(
    () => (Array.isArray(plantSectors) && plantSectors.length > 0 ? plantSectors : DEFAULT_PLANT_SECTORS),
    [plantSectors]
  );

  // Isolamento Estrito por Área (mesma diretriz do Aptis Skills)
  const accessibleSectors = useMemo(
    () => getAccessibleSectors(safePlantSectors, effectiveUser),
    [safePlantSectors, effectiveUser]
  );

  const [projects, setProjects] = useTenantStorage<KaizenProject[]>(
    'kaizen-manager',
    'projects',
    INITIAL_KAIZEN_PROJECTS
  );

  const safeProjects = useMemo(() => (Array.isArray(projects) ? projects : []), [projects]);

  // Projetos privados de gestão visíveis somente para as áreas autorizadas do gestor
  const accessibleProjects = useMemo(
    () => filterKaizensForUser(safeProjects, safePlantSectors, effectiveUser),
    [safeProjects, safePlantSectors, effectiveUser]
  );

  // Projetos públicos do Mural Inova (estritamente Concluídos + Publicados)
  const publishedFeedProjects = useMemo(
    () => getPublishedFeedProjects(safeProjects),
    [safeProjects]
  );

  const [activeTab, setActiveTab] = useState<KaizenViewTab>('kanban');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [selectedA3State, setSelectedA3State] = useState<{
    project: KaizenProject;
    readOnly: boolean;
  } | null>(null);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  const tintedGlass = useSyncExternalStore(
    subscribeTintedGlass,
    getTintedGlassSnapshot,
    getTintedGlassServerSnapshot
  );

  // Filtro de setor derivado de forma segura (sem setState em effect)
  const effectiveSectorFilter = useMemo(() => {
    if (isPlantAdmin) {
      if (sectorFilter === 'all') return 'all';
      return safePlantSectors.some(s => s.id === sectorFilter) ? sectorFilter : 'all';
    }
    if (accessibleSectors.length <= 1) {
      return accessibleSectors[0]?.id || 'all';
    }
    if (sectorFilter === 'all') return 'all';
    return accessibleSectors.some(s => s.id === sectorFilter) ? sectorFilter : 'all';
  }, [isPlantAdmin, sectorFilter, safePlantSectors, accessibleSectors]);

  const activeSectorLabel = useMemo(() => {
    if (effectiveSectorFilter === 'all') {
      return isPlantAdmin ? 'Fábrica Inteira' : 'Minhas Áreas';
    }
    const found = safePlantSectors.find(s => s.id === effectiveSectorFilter);
    return found ? `${found.name} (${found.code})` : 'Área Ativa';
  }, [effectiveSectorFilter, isPlantAdmin, safePlantSectors]);

  const showToast = (message: string) => {
    setFeedbackBanner(message);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  // Importação de Excel protegida pelo escopo de setores do usuário
  const handleImportKaizenExcel = (rows: Record<string, unknown>[]) => {
    const fallbackSector = accessibleSectors[0] || safePlantSectors[0];
    const today = getTodayIso();

    const newKaizens: KaizenProject[] = rows.map((row, idx) => {
      const rawCat = String(row.category || '').trim().toLowerCase();
      let category: KaizenCategory = 'produtividade';
      if (rawCat.includes('segur')) category = 'segurança';
      else if (rawCat.includes('qual')) category = 'qualidade';
      else if (rawCat.includes('cust')) category = 'custo';
      else if (rawCat.includes('ergo')) category = 'ergonomia';

      const rawStage = String(row.stage || '').trim().toLowerCase();
      let stage: KaizenStage = 'ideation';
      if (rawStage.includes('anal')) stage = 'analysis';
      else if (rawStage.includes('impl')) stage = 'implementation';
      else if (rawStage.includes('conc') || rawStage.includes('padr')) stage = 'standardized';

      const savings = Number(row.impactValue) || 5000;
      const rawSectorText = String(row.sector || '').trim();
      const matchedSector =
        accessibleSectors.find(
          s =>
            s.name.toLowerCase() === rawSectorText.toLowerCase() ||
            s.code.toLowerCase() === rawSectorText.toLowerCase()
        ) || fallbackSector;

      return {
        id: `kz-imp-${Date.now()}-${idx}`,
        tenantId: currentTenant.id,
        title: String(row.title || 'Iniciativa Kaizen').trim(),
        level: savings > 50000 ? 'major' : savings > 15000 ? 'standard' : 'quick',
        category,
        stage,
        sectorId: matchedSector?.id,
        sector: matchedSector?.name || rawSectorText || 'Operações Fabris',
        area: 'Chão de Fábrica',
        leaderName: String(row.author || effectiveUser.name || 'Líder Kaizen').trim(),
        leaderRole: 'Operador / Melhoria Contínua',
        teamMembers: [],
        estimatedSavingsAnnual: savings,
        hoursSavedMonthly: Math.round(savings / 500),
        createdAt: today,
        completedAt: stage === 'standardized' ? today : undefined,
        isPublishedToFeed: false,
        likes: [],
        comments: [],
        replicationCount: 0,
        a3: {
          background: String(row.description || '').trim(),
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

    setProjects(prev => [...newKaizens, ...(Array.isArray(prev) ? prev : [])]);

    return {
      successCount: newKaizens.length,
      message: `${newKaizens.length} projetos Kaizen importados para suas áreas autorizadas!`
    };
  };

  // CRUD & Fluxo do Funil
  const handleAddProject = (newProject: KaizenProject) => {
    setProjects(prev => [newProject, ...(Array.isArray(prev) ? prev : [])]);
  };

  const handleUpdateProject = (updatedProject: KaizenProject) => {
    setProjects(prev =>
      (Array.isArray(prev) ? prev : []).map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
  };

  const handleAdvanceStage = (id: string, currentStage: KaizenStage) => {
    const order: KaizenStage[] = ['ideation', 'analysis', 'implementation', 'standardized'];
    const currentIndex = order.indexOf(currentStage);
    if (currentIndex < order.length - 1) {
      const nextStage = order[currentIndex + 1];
      const today = getTodayIso();
      setProjects(prev =>
        (Array.isArray(prev) ? prev : []).map(p => {
          if (p.id === id) {
            return {
              ...p,
              stage: nextStage,
              completedAt: nextStage === 'standardized' ? today : p.completedAt
            };
          }
          return p;
        })
      );
      if (nextStage === 'standardized') {
        showToast('Kaizen concluído e padronizado! Agora ele já pode ser publicado no Feed Inova.');
      }
    }
  };

  // Ações da Camada Social & Feed Inova
  const handlePublishToFeed = (projectId: string, feedSummary?: string) => {
    const today = getTodayIso();
    setProjects(prev =>
      (Array.isArray(prev) ? prev : []).map(p => {
        if (p.id !== projectId) return p;
        if (!canPublishToFeed(p) || !canEditKaizen(p, safePlantSectors, effectiveUser)) {
          return p;
        }
        return {
          ...p,
          isPublishedToFeed: true,
          publishedAt: p.publishedAt || today,
          publishedBy: effectiveUser.name,
          feedSummary: feedSummary || p.feedSummary || p.a3?.verificationResults || p.a3?.lessonsLearned,
          likes: Array.isArray(p.likes) ? p.likes : [],
          comments: Array.isArray(p.comments) ? p.comments : [],
          replicationCount: p.replicationCount || 0
        };
      })
    );
    showToast('Projeto publicado no Feed Inova da fábrica!');
  };

  const handleUnpublishFromFeed = (projectId: string) => {
    setProjects(prev =>
      (Array.isArray(prev) ? prev : []).map(p => {
        if (p.id !== projectId) return p;
        if (!canEditKaizen(p, safePlantSectors, effectiveUser)) return p;
        return {
          ...p,
          isPublishedToFeed: false
        };
      })
    );
  };

  const handleToggleLike = (projectId: string) => {
    const userId = effectiveUser.id;
    setProjects(prev =>
      (Array.isArray(prev) ? prev : []).map(p => {
        if (p.id !== projectId || !p.isPublishedToFeed || p.stage !== 'standardized') return p;
        const currentLikes = Array.isArray(p.likes) ? p.likes : [];
        const hasLiked = currentLikes.includes(userId);
        return {
          ...p,
          likes: hasLiked ? currentLikes.filter(id => id !== userId) : [...currentLikes, userId]
        };
      })
    );
  };

  const handleAddComment = (projectId: string, comment: KaizenFeedComment) => {
    setProjects(prev =>
      (Array.isArray(prev) ? prev : []).map(p => {
        if (p.id !== projectId || !p.isPublishedToFeed || p.stage !== 'standardized') return p;
        const existing = Array.isArray(p.comments) ? p.comments : [];
        return {
          ...p,
          comments: [...existing, comment]
        };
      })
    );
  };

  const handleReplicateYokoten = (sourceProject: KaizenProject, targetSector: PlantSector) => {
    const today = getTodayIso();
    const clonedProject: KaizenProject = {
      id: createKaizenId('kz-yok'),
      tenantId: currentTenant.id,
      title: `[Yokoten] ${sourceProject.title}`,
      level: sourceProject.level,
      category: sourceProject.category,
      stage: 'ideation',
      sectorId: targetSector.id,
      sector: targetSector.name,
      area: `Replicação em ${targetSector.code}`,
      leaderName: effectiveUser.name,
      leaderRole: effectiveUser.department || 'Gestor de Área',
      teamMembers: [effectiveUser.name],
      estimatedSavingsAnnual: sourceProject.estimatedSavingsAnnual || 0,
      hoursSavedMonthly: sourceProject.hoursSavedMonthly || 0,
      createdAt: today,
      isPublishedToFeed: false,
      likes: [],
      comments: [],
      replicationCount: 0,
      replicatedFromId: sourceProject.id,
      replicatedFromTitle: sourceProject.title,
      replicatedFromSector: sourceProject.sector,
      a3: {
        ...sourceProject.a3,
        background: `Replicação horizontal (Yokoten) baseada no Kaizen concluído em ${sourceProject.sector} por ${sourceProject.leaderName}.`,
        actionPlan: (sourceProject.a3?.actionPlan || []).map((a, idx) => ({
          ...a,
          id: `${createKaizenId('act')}-${idx}`,
          status: 'todo'
        })),
        verificationResults: 'Aguardando adaptação e implementação na área de destino.',
        isTargetAchieved: false,
        skillsMatrixUpdated: false
      }
    };

    setProjects(prev => {
      const list = Array.isArray(prev) ? prev : [];
      const updatedSourceList = list.map(p =>
        p.id === sourceProject.id
          ? { ...p, replicationCount: (p.replicationCount || 0) + 1 }
          : p
      );
      return [clonedProject, ...updatedSourceList];
    });
  };

  // Filtragem de projetos privados no Kanban & Central A3 (estritamente dentro de accessibleProjects)
  const filteredProjects = useMemo(() => {
    const selectedSectorObj =
      effectiveSectorFilter !== 'all'
        ? safePlantSectors.find(s => s.id === effectiveSectorFilter)
        : null;

    return accessibleProjects.filter(p => {
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
      const matchesSector = !selectedSectorObj || kaizenBelongsToSector(p, selectedSectorObj);

      return matchesSearch && matchesLevel && matchesSector;
    });
  }, [accessibleProjects, effectiveSectorFilter, safePlantSectors, search, levelFilter]);

  // Métricas do Cabeçalho (refletem estritamente o escopo autorizado do usuário!)
  const totalScopedProjects = accessibleProjects.length;
  const standardizedScopedCount = accessibleProjects.filter(p => p.stage === 'standardized').length;
  const totalScopedSavings = accessibleProjects.reduce(
    (acc, p) => acc + (p?.estimatedSavingsAnnual || 0),
    0
  );
  const totalScopedHours = accessibleProjects.reduce(
    (acc, p) => acc + (p?.hoursSavedMonthly || 0),
    0
  );

  // Abas no padrão Meniscus Liquid Bead
  const kaizenTabs: Array<{
    id: KaizenViewTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    glowColor: string;
    beadGradient: string;
    badgeCount?: number;
  }> = [
    {
      id: 'kanban',
      label: isPlantAdmin ? 'Funil & Kanban' : 'Minha Área (Kanban)',
      icon: Kanban,
      glowColor: 'rgba(59, 130, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)'
    },
    {
      id: 'feed',
      label: 'Feed Inova (Planta)',
      icon: Globe,
      glowColor: 'rgba(16, 185, 129, 0.58)',
      beadGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      badgeCount: publishedFeedProjects.length
    },
    {
      id: 'ranking',
      label: 'Ranking & Hall da Fama',
      icon: Trophy,
      glowColor: 'rgba(245, 158, 11, 0.58)',
      beadGradient: 'linear-gradient(135deg, #fbbf24 0%, #ea580c 100%)'
    },
    {
      id: 'sectors',
      label: isPlantAdmin ? 'Setores & Níveis' : 'Minha Matriz Setorial',
      icon: Building2,
      glowColor: 'rgba(139, 92, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)'
    },
    {
      id: 'a3_central',
      label: 'Central A3 (PDCA)',
      icon: FileText,
      glowColor: 'rgba(6, 182, 212, 0.58)',
      beadGradient: 'linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)'
    }
  ];

  const activeMeniscusTab = kaizenTabs.find(t => t.id === activeTab) || kaizenTabs[0];

  // Bloqueio completo se Gestor de Área não possui nenhum setor vinculado
  if (!isPlantAdmin && accessibleSectors.length === 0) {
    return (
      <div
        className={`rounded-3xl border p-10 text-center space-y-4 ${
          tintedGlass ? 'aptis-glass-dark border-white/10 text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border ${
            tintedGlass
              ? 'bg-amber-500/20 border-amber-500/35 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}
        >
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black">Nenhuma Área Vinculada ao Seu Perfil</h2>
        <p className={`text-sm max-w-lg mx-auto ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
          Por política de governança e privacidade do Aptis Kaizen, cada gestor acompanha o funil apenas das áreas atribuídas ao seu usuário ({effectiveUser.email}). Solicite ao Administrador da Planta que vincule seus setores em <strong>Áreas &amp; Gestores</strong>.
        </p>
        {isSimulatingManager && (
          <button
            type="button"
            onClick={() => simulateAreaManager(null)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Sair da Simulação e Voltar para Admin
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* =====================================================================
          1. CABEÇALHO EXECUTIVO EM VIDRO ESPECULAR (PADRÃO APTIS SKILLS/ROUTINE)
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
              'radial-gradient(circle, rgba(59, 130, 246, 0.65) 0%, rgba(16, 185, 129, 0.25) 60%, transparent 75%)'
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
                <Sparkles className="w-3 h-3" /> Plataforma Inova &amp; Melhoria Contínua
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Unidade: {currentTenant.name} • Escopo: {activeSectorLabel}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aptis Kaizen • Plataforma de Melhorias &amp; Mural Inova
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Gestão isolada por área com relatórios A3 (PDCA), vitrine social da planta exclusiva para projetos concluídos, curtidas, Yokoten e Ranking de Inovadores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {accessibleProjects.length === 0 && isPlantAdmin ? (
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
            ) : accessibleProjects.length > 0 ? (
              <button
                onClick={() => {
                  const confirmMsg = isPlantAdmin
                    ? 'Tem certeza que deseja zerar todos os projetos Kaizen da planta?'
                    : 'Tem certeza que deseja limpar os projetos Kaizen apenas das suas áreas autorizadas?';
                  if (window.confirm(confirmMsg)) {
                    if (isPlantAdmin) {
                      setProjects([]);
                    } else {
                      setProjects(prev =>
                        (Array.isArray(prev) ? prev : []).filter(
                          p => !accessibleSectors.some(sec => kaizenBelongsToSector(p, sec))
                        )
                      );
                    }
                  }
                }}
                title={isPlantAdmin ? 'Limpar todos os projetos Kaizen' : 'Limpar apenas os Kaizens das suas áreas'}
                className={`inline-flex items-center gap-1 px-2.5 py-2 text-xs transition-colors cursor-pointer rounded-xl ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                    : 'text-slate-400 hover:text-rose-600'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isPlantAdmin ? 'Limpar Kaizens' : 'Limpar Minha Área'}
              </button>
            ) : null}

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

        {/* KPI Cards Rápidos (restritos às áreas do usuário logado) */}
        <div
          className={`relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
          }`}
        >
          <div
            className={`p-4 rounded-2xl ${
              tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>{isPlantAdmin ? 'Total de Kaizens' : 'Kaizens da Área'}</span>
              <Sparkles className="w-4 h-4 text-slate-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {totalScopedProjects}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              <span>Concluídos &amp; Padronizados</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {standardizedScopedCount}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200 shadow-2xs'
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
              <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-cyan-300' : 'text-slate-900'}`}>
                R$ {(totalScopedSavings / 1000).toFixed(0)}k
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/ano</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200 shadow-2xs'
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
              <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-blue-400' : 'text-blue-600'}`}>
                {totalScopedHours}h
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/mês</span>
            </div>
          </div>
        </div>
      </div>

      {feedbackBanner && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            tintedGlass
              ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* =====================================================================
          2. TRILHO MENISCUS LIQUID BEAD & CÁPSULA SETORIAL COM ISOLAMENTO
         ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative inline-flex self-start max-w-full overflow-x-auto pb-1 lg:pb-0">
          <div
            className="absolute -inset-2 rounded-full blur-2xl opacity-45 pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${activeMeniscusTab.glowColor} 0%, transparent 70%)`
            }}
          />

          <div className="aptis-meniscus-track rounded-full p-1.5 inline-flex items-center gap-1 relative z-10">
            {kaizenTabs.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-500 whitespace-nowrap cursor-pointer ${
                    isSelected ? 'text-white scale-[1.03]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: tab.beadGradient,
                          boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255,255,255,0.65)`
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cápsula Setorial à Direita (restrita ao escopo do gestor) */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl shrink-0 ${
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
            value={effectiveSectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer min-w-[170px] ${
              tintedGlass
                ? 'text-cyan-300 [&>option]:bg-slate-900 [&>option]:text-white'
                : 'text-slate-900 [&>option]:bg-white [&>option]:text-slate-900'
            }`}
          >
            {isPlantAdmin && (
              <option value="all" className="py-1">
                🏭 Fábrica Inteira (Todos)
              </option>
            )}
            {!isPlantAdmin && accessibleSectors.length > 1 && (
              <option value="all" className="py-1">
                Minhas Áreas ({accessibleSectors.length})
              </option>
            )}
            {accessibleSectors.map(sec => (
              <option key={sec.id} value={sec.id} className="py-1">
                {sec.name} ({sec.code})
              </option>
            ))}
          </select>

          {isPlantAdmin ? (
            <button
              type="button"
              onClick={() => setIsSectorModalOpen(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                tintedGlass ? 'hover:bg-white/10 text-cyan-400' : 'hover:bg-slate-100 text-blue-600'
              }`}
              title="Gerenciar Setores & Gestores da Planta"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          ) : (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                tintedGlass
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
              title="Gestão do funil restrita às áreas vinculadas ao seu perfil"
            >
              <Lock className="w-3 h-3" />
              Área Restrita
            </span>
          )}
        </div>
      </div>

      {/* =====================================================================
          3. CONTEÚDO DINÂMICO POR ABA
         ===================================================================== */}

      {/* ABA 1: FUNIL & QUADRO KANBAN (ISOLADO POR GESTOR) */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <div
            className={`p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-all ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar no seu funil por título, líder ou participante..."
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
                  onChange={e => setLevelFilter(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STAGES.map(stage => {
              const stageProjects = filteredProjects.filter(p => p.stage === stage.id);

              return (
                <div
                  key={stage.id}
                  className={`rounded-3xl p-4 space-y-3 flex flex-col min-h-[520px] transition-all duration-500 ${
                    tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
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
                    {stageProjects.map(p => (
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

                        {p.replicatedFromTitle && (
                          <div className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
                            <Repeat2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">Yokoten de {p.replicatedFromSector}</span>
                          </div>
                        )}

                        <h4 className={`font-bold text-xs leading-snug ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
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
                              tintedGlass ? 'bg-slate-950/60 border-white/10' : 'bg-slate-50 border-slate-100'
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
                            onClick={() => setSelectedA3State({ project: p, readOnly: false })}
                            className={`text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer ${
                              tintedGlass ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-800'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver A3
                          </button>

                          {stage.id !== 'standardized' ? (
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
                          ) : p.isPublishedToFeed ? (
                            <button
                              type="button"
                              onClick={() => setActiveTab('feed')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                                tintedGlass
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                              title="Projeto visível no Feed Inova da fábrica"
                            >
                              <Globe className="w-3 h-3" />
                              <span>No Feed</span>
                              <span className="inline-flex items-center gap-0.5 text-rose-300 ml-0.5">
                                <Heart className="w-2.5 h-2.5 fill-current" />
                                {getKaizenLikesCount(p)}
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handlePublishToFeed(p.id)}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 cursor-pointer shadow-xs"
                              title="Publicar este projeto concluído no Mural Inova para toda a fábrica ver e curtir"
                            >
                              <Globe className="w-3 h-3" />
                              <span>Subir p/ Feed</span>
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

      {/* ABA 2: FEED INOVA DA PLANTA (PÚBLICO - SOMENTE PROJETOS CONCLUÍDOS) */}
      {activeTab === 'feed' && (
        <KaizenInovaFeedPanel
          allProjects={safeProjects}
          accessibleProjects={accessibleProjects}
          plantSectors={safePlantSectors}
          allowedSectors={accessibleSectors}
          effectiveUser={effectiveUser}
          tenantId={currentTenant.id}
          onToggleLike={handleToggleLike}
          onAddComment={handleAddComment}
          onPublishProject={handlePublishToFeed}
          onUnpublishProject={handleUnpublishFromFeed}
          onQuickPublishNew={handleAddProject}
          onReplicateYokoten={handleReplicateYokoten}
          onOpenA3={(project, readOnly) => setSelectedA3State({ project, readOnly })}
          tintedGlass={tintedGlass}
        />
      )}

      {/* ABA 3: RANKING INOVA & HALL DA FAMA (PÚBLICO - PROJETOS CONCLUÍDOS & CURTIDOS) */}
      {activeTab === 'ranking' && (
        <KaizenInovaRankingPanel
          allProjects={safeProjects}
          plantSectors={safePlantSectors}
          effectiveUser={effectiveUser}
          onOpenA3={(project, readOnly) => setSelectedA3State({ project, readOnly })}
          tintedGlass={tintedGlass}
        />
      )}

      {/* ABA 4: DISTRIBUIÇÃO POR SETORES (ISOLADO AO ESCOPO DO GESTOR) */}
      {activeTab === 'sectors' && (
        <KaizenSectorMatrix
          projects={accessibleProjects}
          allowedSectors={accessibleSectors}
          canViewAllSectors={isPlantAdmin}
          onOpenA3={p => setSelectedA3State({ project: p, readOnly: false })}
          tintedGlass={tintedGlass}
        />
      )}

      {/* ABA 5: CENTRAL DE RELATÓRIOS A3 (ISOLADO AO ESCOPO DO GESTOR) */}
      {activeTab === 'a3_central' && (
        <div className="space-y-4">
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
              tintedGlass ? 'aptis-glass-dark text-white border-white/10' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                <FileText className={`w-5 h-5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                Central de Relatórios A3 (Metodologia PDCA)
              </h3>
              <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Acesse, edite ou imprima os formulários A3 das suas áreas seguindo o padrão Toyota.
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
            {filteredProjects.map(p => (
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
                    <div className="flex items-center gap-1.5">
                      <KaizenLevelBadge level={p.level} tintedGlass={tintedGlass} />
                      {p.isPublishedToFeed && p.stage === 'standardized' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          🌐 No Feed
                        </span>
                      )}
                    </div>
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
                      tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-blue-50/50 border-blue-100'
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
                    <span>
                      Líder: <strong className={tintedGlass ? 'text-white' : 'text-slate-700'}>{p.leaderName}</strong>
                    </span>
                    <span className="mx-1.5">•</span>
                    <span>{p.sector}</span>
                  </div>

                  <button
                    onClick={() => setSelectedA3State({ project: p, readOnly: false })}
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

      {/* MODAIS DO MÓDULO */}
      <PlantSectorsManagerModal
        isOpen={isSectorModalOpen}
        onClose={() => setIsSectorModalOpen(false)}
        tenantName={currentTenant?.name}
        tintedGlass={tintedGlass}
      />

      <NewKaizenModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSave={handleAddProject}
        tenantId={currentTenant.id}
        allowedSectors={accessibleSectors}
        tintedGlass={tintedGlass}
      />

      {selectedA3State && (
        <KaizenA3Modal
          key={`${selectedA3State.project.id}-${selectedA3State.readOnly ? 'ro' : 'rw'}`}
          project={selectedA3State.project}
          isOpen={true}
          readOnly={selectedA3State.readOnly}
          onClose={() => setSelectedA3State(null)}
          onSave={handleUpdateProject}
          onTogglePublishFeed={(proj, publish) => {
            if (publish) {
              handlePublishToFeed(proj.id);
            } else {
              handleUnpublishFromFeed(proj.id);
            }
            setSelectedA3State(prev =>
              prev ? { ...prev, project: { ...prev.project, isPublishedToFeed: publish } } : null
            );
          }}
          tintedGlass={tintedGlass}
        />
      )}

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
