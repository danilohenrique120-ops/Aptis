'use client';

import React, { useMemo, useState } from 'react';
import type { User } from '@/types';
import type { PlantSector } from '@/types/sectors';
import {
  KaizenCategory,
  KaizenFeedComment,
  KaizenLevel,
  KaizenProject
} from '../types';
import {
  canEditKaizen,
  getKaizenLikesCount,
  getPublishedFeedProjects
} from '../kaizen-helpers';
import { KaizenLevelBadge } from './KaizenLevelBadge';
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  EyeOff,
  FileText,
  Globe,
  Heart,
  MessageSquare,
  Plus,
  Repeat2,
  Search,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  X
} from 'lucide-react';

const getTodayIso = () => new Date().toISOString().split('T')[0];
const createFeedId = (prefix: string) =>
  `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;

const CATEGORY_LABELS: Record<
  KaizenCategory,
  { label: string; darkClass: string; lightClass: string }
> = {
  segurança: {
    label: 'Segurança & NR',
    darkClass: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
    lightClass: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  qualidade: {
    label: 'Qualidade & Zero Defeito',
    darkClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/35',
    lightClass: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  produtividade: {
    label: 'Produtividade & SMED',
    darkClass: 'bg-blue-500/20 text-blue-300 border-blue-500/35',
    lightClass: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  custo: {
    label: 'Redução de Custo',
    darkClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35',
    lightClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  ergonomia: {
    label: 'Ergonomia & Bem-estar',
    darkClass: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
    lightClass: 'bg-purple-50 text-purple-700 border-purple-200'
  }
};

interface KaizenInovaFeedPanelProps {
  allProjects: KaizenProject[];
  accessibleProjects: KaizenProject[];
  plantSectors: PlantSector[];
  allowedSectors: PlantSector[];
  effectiveUser: User;
  tenantId: string;
  onToggleLike: (projectId: string) => void;
  onAddComment: (projectId: string, comment: KaizenFeedComment) => void;
  onPublishProject: (projectId: string, feedSummary?: string) => void;
  onUnpublishProject: (projectId: string) => void;
  onQuickPublishNew: (project: KaizenProject) => void;
  onReplicateYokoten: (sourceProject: KaizenProject, targetSector: PlantSector) => void;
  onOpenA3: (project: KaizenProject, readOnly: boolean) => void;
  tintedGlass?: boolean;
}

export function KaizenInovaFeedPanel({
  allProjects,
  accessibleProjects,
  plantSectors,
  allowedSectors,
  effectiveUser,
  tenantId,
  onToggleLike,
  onAddComment,
  onPublishProject,
  onUnpublishProject,
  onQuickPublishNew,
  onReplicateYokoten,
  onOpenA3,
  tintedGlass = false
}: KaizenInovaFeedPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | KaizenCategory>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | KaizenLevel>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'most_liked' | 'highest_savings' | 'most_replicated'>('recent');

  // Comentários expandidos & rascunho por card
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Feedback visual
  const [feedback, setFeedback] = useState<string | null>(null);

  // Modal de Publicação no Feed Inova (apenas projetos concluídos)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishMode, setPublishMode] = useState<'existing' | 'quick_new'>('existing');
  const [selectedExistingId, setSelectedExistingId] = useState<string>('');
  const [existingSummary, setExistingSummary] = useState<string>('');

  // Form Quick Publish (Melhoria já concluída e implementada)
  const [qpTitle, setQpTitle] = useState('');
  const [qpLevel, setQpLevel] = useState<KaizenLevel>('quick');
  const [qpCategory, setQpCategory] = useState<KaizenCategory>('produtividade');
  const [qpSectorId, setQpSectorId] = useState<string>(allowedSectors[0]?.id || plantSectors[0]?.id || '');
  const [qpArea, setQpArea] = useState('');
  const [qpLeaderName, setQpLeaderName] = useState(effectiveUser.name || '');
  const [qpLeaderRole, setQpLeaderRole] = useState(effectiveUser.department || 'Líder Kaizen');
  const [qpTeamText, setQpTeamText] = useState('');
  const [qpBefore, setQpBefore] = useState('');
  const [qpAfter, setQpAfter] = useState('');
  const [qpSavings, setQpSavings] = useState('');
  const [qpHours, setQpHours] = useState('');

  // Modal de Replicação Yokoten
  const [yokotenSource, setYokotenSource] = useState<KaizenProject | null>(null);
  const [yokotenTargetSectorId, setYokotenTargetSectorId] = useState<string>(allowedSectors[0]?.id || '');

  // Somente projetos CONCLUÍDOS & PUBLICADOS aparecem no Feed
  const feedProjects = useMemo(() => getPublishedFeedProjects(allProjects), [allProjects]);

  // Projetos concluídos das áreas do usuário que ainda não subiram para o Feed
  const myReadyToPublish = useMemo(
    () => accessibleProjects.filter(p => p.stage === 'standardized' && !p.isPublishedToFeed),
    [accessibleProjects]
  );

  const myInProgressCount = useMemo(
    () => accessibleProjects.filter(p => p.stage !== 'standardized').length,
    [accessibleProjects]
  );

  const feedSectors = useMemo(() => {
    const set = new Set<string>();
    feedProjects.forEach(p => {
      if (p.sector) set.add(p.sector);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [feedProjects]);

  // KPIs do Feed
  const feedStats = useMemo(() => {
    const totalLikes = feedProjects.reduce((acc, p) => acc + getKaizenLikesCount(p), 0);
    const totalReplications = feedProjects.reduce((acc, p) => acc + (p.replicationCount || 0), 0);
    const totalSavings = feedProjects.reduce((acc, p) => acc + (p.estimatedSavingsAnnual || 0), 0);
    return {
      count: feedProjects.length,
      totalLikes,
      totalReplications,
      totalSavings
    };
  }, [feedProjects]);

  // Filtragem & Ordenação do Feed
  const displayedFeed = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const filtered = feedProjects.filter(p => {
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      if (levelFilter !== 'all' && p.level !== levelFilter) return false;
      if (sectorFilter !== 'all' && p.sector !== sectorFilter) return false;

      if (term) {
        const matchesTitle = (p.title || '').toLowerCase().includes(term);
        const matchesLeader = (p.leaderName || '').toLowerCase().includes(term);
        const matchesSector = (p.sector || '').toLowerCase().includes(term);
        const matchesSummary = (p.feedSummary || p.a3?.verificationResults || '').toLowerCase().includes(term);
        const matchesTeam = (p.teamMembers || []).some(m => m.toLowerCase().includes(term));
        if (!matchesTitle && !matchesLeader && !matchesSector && !matchesSummary && !matchesTeam) {
          return false;
        }
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'most_liked') {
        return getKaizenLikesCount(b) - getKaizenLikesCount(a);
      }
      if (sortBy === 'highest_savings') {
        return (b.estimatedSavingsAnnual || 0) - (a.estimatedSavingsAnnual || 0);
      }
      if (sortBy === 'most_replicated') {
        return (b.replicationCount || 0) - (a.replicationCount || 0);
      }
      const dateA = a.publishedAt || a.completedAt || a.createdAt || '';
      const dateB = b.publishedAt || b.completedAt || b.createdAt || '';
      return dateB.localeCompare(dateA);
    });
  }, [feedProjects, categoryFilter, levelFilter, sectorFilter, searchTerm, sortBy]);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleOpenPublishModal = () => {
    if (myReadyToPublish.length > 0) {
      setPublishMode('existing');
      setSelectedExistingId(myReadyToPublish[0].id);
      setExistingSummary(
        myReadyToPublish[0].a3?.verificationResults ||
          myReadyToPublish[0].a3?.lessonsLearned ||
          ''
      );
    } else {
      setPublishMode('quick_new');
    }
    setQpSectorId(allowedSectors[0]?.id || plantSectors[0]?.id || '');
    setQpLeaderName(effectiveUser.name || '');
    setQpLeaderRole(effectiveUser.department || 'Líder Kaizen');
    setIsPublishModalOpen(true);
  };

  const handleSubmitExistingPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExistingId) return;
    onPublishProject(selectedExistingId, existingSummary.trim() || undefined);
    setIsPublishModalOpen(false);
    showToast('Projeto concluído publicado no Feed Inova da fábrica!');
  };

  const handleSubmitQuickPublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qpTitle.trim() || !qpBefore.trim() || !qpAfter.trim()) return;

    const targetSector =
      allowedSectors.find(s => s.id === qpSectorId) ||
      allowedSectors[0] ||
      plantSectors[0];
    const today = getTodayIso();
    const team = qpTeamText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const savingsNum = Number(qpSavings) || 0;
    const hoursNum = Number(qpHours) || 0;

    const newCompletedProject: KaizenProject = {
      id: createFeedId('kz'),
      tenantId,
      title: qpTitle.trim(),
      level: qpLevel,
      category: qpCategory,
      stage: 'standardized',
      sectorId: targetSector?.id,
      sector: targetSector?.name || 'Operações Fabris',
      area: qpArea.trim() || 'Chão de Fábrica',
      leaderName: qpLeaderName.trim() || effectiveUser.name,
      leaderRole: qpLeaderRole.trim() || 'Líder Kaizen',
      teamMembers: team.length > 0 ? team : [qpLeaderName.trim() || effectiveUser.name],
      estimatedSavingsAnnual: savingsNum,
      hoursSavedMonthly: hoursNum,
      createdAt: today,
      completedAt: today,
      isPublishedToFeed: true,
      publishedAt: today,
      publishedBy: effectiveUser.name,
      feedSummary: qpAfter.trim(),
      likes: [effectiveUser.id],
      comments: [],
      replicationCount: 0,
      a3: {
        background: `Melhoria implementada e publicada diretamente no Feed Inova pelo setor ${targetSector?.name || 'Fábrica'}.`,
        problemStatement: qpBefore.trim(),
        currentCondition: qpBefore.trim(),
        fiveWhys: {
          why1: '',
          why2: '',
          why3: '',
          why4: '',
          why5: '',
          rootCause: 'Eliminada na implementação prática.'
        },
        targetCondition: qpAfter.trim(),
        targetKpiGoal: 'Melhoria comprovada em rotina',
        actionPlan: [
          {
            id: createFeedId('act'),
            what: 'Implementação e validação em campo',
            who: qpLeaderName.trim() || effectiveUser.name,
            when: today,
            status: 'done'
          }
        ],
        verificationResults: qpAfter.trim(),
        savingsAnnual: savingsNum,
        hoursSavedMonthly: hoursNum,
        isTargetAchieved: true,
        standardizationSummary: 'Implementado, validado e compartilhado no Mural Inova da planta.',
        skillsMatrixUpdated: false,
        lessonsLearned: qpAfter.trim()
      }
    };

    onQuickPublishNew(newCompletedProject);
    setQpTitle('');
    setQpArea('');
    setQpTeamText('');
    setQpBefore('');
    setQpAfter('');
    setQpSavings('');
    setQpHours('');
    setIsPublishModalOpen(false);
    showToast(`Melhoria "${newCompletedProject.title}" registrada como concluída e publicada no Feed Inova!`);
  };

  const handleSubmitComment = (e: React.FormEvent, projectId: string) => {
    e.preventDefault();
    const text = (commentDrafts[projectId] || '').trim();
    if (!text) return;

    const newComment: KaizenFeedComment = {
      id: createFeedId('cmt'),
      authorId: effectiveUser.id,
      authorName: effectiveUser.name,
      authorDepartment: effectiveUser.department || 'Fábrica',
      text,
      createdAt: getTodayIso()
    };

    onAddComment(projectId, newComment);
    setCommentDrafts(prev => ({ ...prev, [projectId]: '' }));
    setExpandedComments(prev => ({ ...prev, [projectId]: true }));
  };

  const handleConfirmYokoten = () => {
    if (!yokotenSource) return;
    const targetSector =
      allowedSectors.find(s => s.id === yokotenTargetSectorId) || allowedSectors[0];
    if (!targetSector) return;

    onReplicateYokoten(yokotenSource, targetSector);
    setYokotenSource(null);
    showToast(
      `Yokoten criado! A melhoria "${yokotenSource.title}" entrou no funil de ${targetSector.name} (${targetSector.code}) para replicação.`
    );
  };

  return (
    <div className="space-y-6 w-full">
      {/* 1. HERO DO MURAL INOVA (VITRINE PÚBLICA DE PROJETOS CONCLUÍDOS) */}
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
              'radial-gradient(circle, rgba(16, 185, 129, 0.65) 0%, rgba(6, 182, 212, 0.25) 65%, transparent 80%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  tintedGlass
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                Feed Público da Fábrica • Estilo Plataforma Inova
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Somente projetos 100% Concluídos &amp; Implementados sobem para o mural
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Mural Inova • Vitrine de Kaizens Implementados
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Explore as melhores soluções concluídas em toda a planta, curta e reconheça os autores no Ranking Inova, troque aprendizados nos comentários e replique boas práticas na sua área via <strong>Yokoten</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenPublishModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 self-start lg:self-auto"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: '1px solid rgba(110, 231, 183, 0.45)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(5, 150, 105, 0.5)'
            }}
          >
            <Plus className="w-4 h-4" />
            Publicar Projeto Concluído
            {myReadyToPublish.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                {myReadyToPublish.length}
              </span>
            )}
          </button>
        </div>

        {/* KPIs do Mural */}
        <div
          className={`relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t ${
            tintedGlass ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <span>Kaizens no Feed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {feedStats.count}
            </p>
            <span className="text-[10px] text-slate-400">100% implementados</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-rose-300' : 'text-rose-700'}`}>
              <span>Curtidas da Planta</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-rose-300' : 'text-rose-600'}`}>
              {feedStats.totalLikes}
            </p>
            <span className="text-[10px] text-slate-400">reconhecimentos sociais</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
              <span>Replicações Yokoten</span>
              <Repeat2 className="w-4 h-4 text-cyan-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
              {feedStats.totalReplications}
            </p>
            <span className="text-[10px] text-slate-400">disseminadas entre áreas</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>
              <span>Economia Validada</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              R$ {(feedStats.totalSavings / 1000).toFixed(0)}k
            </p>
            <span className="text-[10px] text-slate-400">impacto anual publicado</span>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            tintedGlass
              ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2. BARRA DE BUSCA, FILTROS & ORDENAÇÃO DO FEED */}
      <div
        className={`rounded-2xl p-4 border space-y-3 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="lg:col-span-2">
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Pesquisar no Mural Inova
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por título, autor, setor ou resultado..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as 'all' | KaizenCategory)}
              className={`w-full px-2.5 py-2 rounded-xl font-semibold focus:outline-none cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Todas as Categorias</option>
              <option value="produtividade">Produtividade &amp; SMED</option>
              <option value="qualidade">Qualidade &amp; Zero Defeito</option>
              <option value="segurança">Segurança &amp; NR</option>
              <option value="ergonomia">Ergonomia</option>
              <option value="custo">Redução de Custo</option>
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Setor de Origem
            </label>
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className={`w-full px-2.5 py-2 rounded-xl font-semibold focus:outline-none cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Toda a Fábrica</option>
              {feedSectors.map(sec => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Ordenar Por
            </label>
            <select
              value={sortBy}
              onChange={e =>
                setSortBy(
                  e.target.value as 'recent' | 'most_liked' | 'highest_savings' | 'most_replicated'
                )
              }
              className={`w-full px-2.5 py-2 rounded-xl font-semibold focus:outline-none cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="recent">🕒 Mais Recentes</option>
              <option value="most_liked">❤️ Mais Curtidos</option>
              <option value="highest_savings">💰 Maior Economia</option>
              <option value="most_replicated">🔁 Mais Replicados (Yokoten)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>Nível:</span>
            {(['all', 'quick', 'standard', 'major', 'advanced'] as const).map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setLevelFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  levelFilter === lvl
                    ? 'bg-emerald-600 text-white'
                    : tintedGlass
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'all'
                  ? 'Todos'
                  : lvl === 'quick'
                    ? '⚡ Quick'
                    : lvl === 'standard'
                      ? '🛠️ Standard'
                      : lvl === 'major'
                        ? '🏭 Major'
                        : '🔬 Advanced'}
              </button>
            ))}
          </div>

          <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
            Exibindo <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>{displayedFeed.length}</strong> melhoria(s) concluída(s)
          </span>
        </div>
      </div>

      {/* 3. LISTA DO FEED SOCIAL DE INOVAÇÃO */}
      {displayedFeed.length === 0 ? (
        <div
          className={`rounded-3xl border p-12 text-center space-y-3 ${
            tintedGlass ? 'aptis-glass-dark border-white/10 text-slate-300' : 'aptis-glass-light text-slate-600'
          }`}
        >
          <Sparkles className="w-10 h-10 mx-auto text-emerald-400 opacity-80" />
          <h4 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
            Nenhum Kaizen concluído encontrado no Mural Inova
          </h4>
          <p className="text-xs max-w-md mx-auto opacity-80">
            Conclua e padronize uma melhoria no seu Kanban e clique em &quot;Publicar no Feed Inova&quot;, ou registre uma melhoria já implementada agora mesmo.
          </p>
          <button
            type="button"
            onClick={handleOpenPublishModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Publicar Primeira Melhoria Concluída
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {displayedFeed.map(project => {
            const likesArr = Array.isArray(project.likes) ? project.likes : [];
            const isLiked = likesArr.includes(effectiveUser.id);
            const commentsArr = Array.isArray(project.comments) ? project.comments : [];
            const isCommentsOpen = Boolean(expandedComments[project.id]);
            const catMeta = CATEGORY_LABELS[project.category] || CATEGORY_LABELS.produtividade;
            const userCanManage = canEditKaizen(project, plantSectors, effectiveUser);
            const initials = (project.leaderName || 'KZ')
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <article
                key={project.id}
                className={`rounded-3xl border p-5 sm:p-6 space-y-4 transition-all ${
                  tintedGlass
                    ? 'aptis-glass-dark border-white/10 hover:border-emerald-500/35 text-white'
                    : 'aptis-glass-light hover:border-emerald-300 text-slate-900'
                }`}
              >
                {/* Cabeçalho do Post Social */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md border border-white/20"
                      style={{
                        background: 'linear-gradient(135deg, #059669 0%, #06b6d4 100%)'
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-sm font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                          {project.leaderName}
                        </span>
                        <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          • {project.leaderRole}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-semibold border ${
                            tintedGlass
                              ? 'bg-white/5 border-white/10 text-cyan-300'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}
                        >
                          <Building2 className="w-3 h-3" />
                          {project.sector} ({project.area})
                        </span>
                        <span className="text-slate-400 font-mono">
                          Concluído em {project.completedAt || project.publishedAt || project.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <KaizenLevelBadge level={project.level} tintedGlass={tintedGlass} />
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        tintedGlass ? catMeta.darkClass : catMeta.lightClass
                      }`}
                    >
                      {catMeta.label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                        tintedGlass
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Implementado
                    </span>
                  </div>
                </div>

                {/* Título + Destaque + Origem Yokoten */}
                <div className="space-y-2">
                  {project.replicatedFromTitle && (
                    <div
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                        tintedGlass
                          ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      }`}
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                      Yokoten replicado de &quot;{project.replicatedFromTitle}&quot; ({project.replicatedFromSector})
                    </div>
                  )}

                  <h3 className={`text-base sm:text-lg font-black leading-snug ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {project.title}
                  </h3>

                  {project.feedSummary && (
                    <p className={`text-xs sm:text-sm leading-relaxed ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                      {project.feedSummary}
                    </p>
                  )}
                </div>

                {/* Bloco Visual ANTES vs DEPOIS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-2xl border space-y-1 ${
                      tintedGlass
                        ? 'bg-rose-500/10 border-rose-500/25'
                        : 'bg-rose-50/70 border-rose-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                        tintedGlass ? 'text-rose-300' : 'text-rose-700'
                      }`}
                    >
                      Antes • Problema / Cenário Anterior
                    </span>
                    <p className={`text-xs leading-relaxed ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                      {project.a3?.problemStatement || project.a3?.currentCondition || 'Oportunidade de melhoria identificada no setor.'}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border space-y-1 ${
                      tintedGlass
                        ? 'bg-emerald-500/10 border-emerald-500/25'
                        : 'bg-emerald-50/70 border-emerald-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider block ${
                        tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                      }`}
                    >
                      Depois • Solução &amp; Resultado Validado
                    </span>
                    <p className={`text-xs leading-relaxed ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                      {project.a3?.verificationResults || project.a3?.targetCondition || 'Melhoria padronizada e consolidada.'}
                    </p>
                  </div>
                </div>

                {/* Equipe + Métricas de Impacto */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className={`inline-flex items-center gap-1 font-semibold ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Users className="w-3.5 h-3.5" />
                      Equipe:
                    </span>
                    {(project.teamMembers || []).length > 0 ? (
                      project.teamMembers.map(member => (
                        <span
                          key={member}
                          className={`px-2 py-0.5 rounded-full font-medium border ${
                            tintedGlass
                              ? 'bg-white/5 border-white/10 text-slate-200'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {member}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">{project.leaderName}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
                    {project.estimatedSavingsAnnual > 0 && (
                      <span
                        className={`px-2.5 py-1 rounded-xl border inline-flex items-center gap-1 ${
                          tintedGlass
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        R$ {project.estimatedSavingsAnnual.toLocaleString('pt-BR')}/ano
                      </span>
                    )}
                    {project.hoursSavedMonthly > 0 && (
                      <span
                        className={`px-2.5 py-1 rounded-xl border inline-flex items-center gap-1 ${
                          tintedGlass
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {project.hoursSavedMonthly}h/mês
                      </span>
                    )}
                    {(project.replicationCount || 0) > 0 && (
                      <span
                        className={`px-2.5 py-1 rounded-xl border inline-flex items-center gap-1 ${
                          tintedGlass
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        <Repeat2 className="w-3.5 h-3.5" />
                        {project.replicationCount} Yokoten(s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra de Ações Sociais (Curtir, Comentar, Yokoten, Ver A3) */}
                <div
                  className={`pt-3.5 border-t flex flex-wrap items-center justify-between gap-2 ${
                    tintedGlass ? 'border-white/10' : 'border-slate-200/80'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleLike(project.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                        isLiked
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm shadow-rose-600/30'
                          : tintedGlass
                            ? 'aptis-glass-subcard text-slate-200 hover:text-rose-300 hover:border-rose-400/40'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{isLiked ? 'Curtido' : 'Curtir'}</span>
                      <span className="font-mono px-1.5 py-0.2 rounded-md bg-black/15">
                        {likesArr.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedComments(prev => ({ ...prev, [project.id]: !prev[project.id] }))
                      }
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition cursor-pointer ${
                        tintedGlass
                          ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Comentários</span>
                      <span className="font-mono opacity-80">({commentsArr.length})</span>
                    </button>

                    {allowedSectors.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setYokotenSource(project);
                          setYokotenTargetSectorId(allowedSectors[0].id);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition cursor-pointer ${
                          tintedGlass
                            ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/35'
                            : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-200'
                        }`}
                        title="Clonar esta melhoria concluída para replicar no seu setor (Yokoten)"
                      >
                        <Repeat2 className="w-3.5 h-3.5" />
                        Replicar na Minha Área
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenA3(project, !userCanManage)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition cursor-pointer ${
                        tintedGlass
                          ? 'aptis-glass-subcard text-cyan-300 hover:text-white'
                          : 'bg-slate-900 hover:bg-blue-600 text-white border-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      {userCanManage ? 'Abrir A3' : 'Ver A3 (Leitura)'}
                    </button>

                    {userCanManage && (
                      <button
                        type="button"
                        onClick={() => {
                          onUnpublishProject(project.id);
                          showToast('Projeto removido da vitrine pública (mantido no seu Kanban).');
                        }}
                        className={`p-2 rounded-xl border transition cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-amber-300 border-white/10 hover:bg-amber-500/15'
                            : 'text-slate-400 hover:text-amber-700 border-slate-200 hover:bg-amber-50'
                        }`}
                        title="Retirar do Feed Público (mantém salvo na sua área)"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Seção Expansível de Comentários */}
                {isCommentsOpen && (
                  <div
                    className={`pt-3 border-t space-y-3 animate-in fade-in ${
                      tintedGlass ? 'border-white/10' : 'border-slate-200/80'
                    }`}
                  >
                    {commentsArr.length === 0 ? (
                      <p className="text-xs italic text-slate-400">
                        Seja o primeiro a parabenizar a equipe ou perguntar sobre a implementação!
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {commentsArr.map(cmt => (
                          <div
                            key={cmt.id}
                            className={`p-3 rounded-xl border text-xs ${
                              tintedGlass
                                ? 'aptis-glass-subcard border-white/10'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className={`font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                                {cmt.authorName}
                                {cmt.authorDepartment && (
                                  <span className="font-normal text-slate-400 ml-1.5">
                                    • {cmt.authorDepartment}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {cmt.createdAt}
                              </span>
                            </div>
                            <p className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>
                              {cmt.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={e => handleSubmitComment(e, project.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder="Escreva um elogio, pergunta técnica ou ideia de replicação..."
                        value={commentDrafts[project.id] || ''}
                        onChange={e =>
                          setCommentDrafts(prev => ({ ...prev, [project.id]: e.target.value }))
                        }
                        className={`flex-1 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          tintedGlass
                            ? 'aptis-glass-input text-white placeholder:text-slate-500'
                            : 'bg-slate-50 border border-slate-200 text-slate-900'
                        }`}
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Enviar
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* MODAL: PUBLICAR PROJETO CONCLUÍDO NO FEED INOVA */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={`rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-200 my-8 ${
              tintedGlass ? 'aptis-glass-modal text-white' : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(false)}
              className={`absolute right-4 top-4 p-1.5 rounded-xl cursor-pointer ${
                tintedGlass ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                  tintedGlass
                    ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                }`}
              >
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    tintedGlass
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  Regra de Qualidade Inova • Apenas Concluídos
                </span>
                <h3 className={`text-lg font-bold mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  Publicar Melhoria Implementada no Feed
                </h3>
              </div>
            </div>

            {/* Alternador de Fluxo */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPublishMode('existing')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  publishMode === 'existing'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : tintedGlass
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Subir Kaizen Concluído do Meu Funil ({myReadyToPublish.length})
              </button>
              <button
                type="button"
                onClick={() => setPublishMode('quick_new')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  publishMode === 'quick_new'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : tintedGlass
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Registrar Nova Melhoria Já Implementada
              </button>
            </div>

            {publishMode === 'existing' ? (
              myReadyToPublish.length === 0 ? (
                <div
                  className={`p-6 rounded-2xl border text-center space-y-2 text-xs ${
                    tintedGlass ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <TrendingUp className="w-8 h-8 mx-auto text-amber-400" />
                  <p className="font-bold">
                    Nenhum Kaizen concluído pendente de publicação na sua área.
                  </p>
                  <p className="opacity-80">
                    {myInProgressCount > 0
                      ? `Você possui ${myInProgressCount} projeto(s) em andamento no Kanban. Conclua e padronize (Etapa 4) para liberar a publicação, ou use a aba "Registrar Nova Melhoria Já Implementada".`
                      : 'Conclua um projeto na Etapa 4 do Kanban ou clique na aba ao lado para registrar uma melhoria já executada.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitExistingPublish} className="space-y-4 text-xs">
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Selecione o Projeto Concluído (Etapa 4 - Padronizado) *
                    </label>
                    <select
                      required
                      value={selectedExistingId}
                      onChange={e => {
                        setSelectedExistingId(e.target.value);
                        const chosen = myReadyToPublish.find(p => p.id === e.target.value);
                        if (chosen) {
                          setExistingSummary(
                            chosen.a3?.verificationResults || chosen.a3?.lessonsLearned || ''
                          );
                        }
                      }}
                      className={`w-full rounded-xl p-2.5 font-semibold cursor-pointer ${
                        tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    >
                      {myReadyToPublish.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.sector} • Líder: {p.leaderName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Destaque para o Mural Inova (Resumo do Ganho)
                    </label>
                    <textarea
                      rows={3}
                      value={existingSummary}
                      onChange={e => setExistingSummary(e.target.value)}
                      placeholder="Conte em 2 linhas o resultado prático alcançado para inspirar outras áreas..."
                      className={`w-full rounded-xl p-2.5 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsPublishModalOpen(false)}
                      className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                    >
                      Publicar no Feed da Fábrica
                    </button>
                  </div>
                </form>
              )
            ) : (
              <form onSubmit={handleSubmitQuickPublish} className="space-y-3 text-xs max-h-[65vh] overflow-y-auto pr-1">
                <div>
                  <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Título da Melhoria Implementada *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carrinho 5S de Setup Rápido na Linha 02"
                    value={qpTitle}
                    onChange={e => setQpTitle(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 ${
                      tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Setor *
                    </label>
                    <select
                      value={qpSectorId}
                      onChange={e => setQpSectorId(e.target.value)}
                      className={`w-full rounded-xl px-2.5 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    >
                      {(allowedSectors.length > 0 ? allowedSectors : plantSectors).map(sec => (
                        <option key={sec.id} value={sec.id}>
                          {sec.name} ({sec.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Nível Kaizen
                    </label>
                    <select
                      value={qpLevel}
                      onChange={e => setQpLevel(e.target.value as KaizenLevel)}
                      className={`w-full rounded-xl px-2.5 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="quick">⚡ Quick Kaizen</option>
                      <option value="standard">🛠️ Standard Kaizen</option>
                      <option value="major">🏭 Major Kaizen</option>
                      <option value="advanced">🔬 Advanced Kaizen</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Categoria
                    </label>
                    <select
                      value={qpCategory}
                      onChange={e => setQpCategory(e.target.value as KaizenCategory)}
                      className={`w-full rounded-xl px-2.5 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    >
                      <option value="produtividade">Produtividade</option>
                      <option value="qualidade">Qualidade</option>
                      <option value="segurança">Segurança</option>
                      <option value="ergonomia">Ergonomia</option>
                      <option value="custo">Custo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Líder / Autor *
                    </label>
                    <input
                      type="text"
                      required
                      value={qpLeaderName}
                      onChange={e => setQpLeaderName(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Cargo do Autor
                    </label>
                    <input
                      type="text"
                      value={qpLeaderRole}
                      onChange={e => setQpLeaderRole(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Célula / Posto
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Prensa 02"
                      value={qpArea}
                      onChange={e => setQpArea(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Coautores / Equipe (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Maria Souza, João Pedro"
                    value={qpTeamText}
                    onChange={e => setQpTeamText(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 ${
                      tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-rose-300' : 'text-rose-700'}`}>
                      ANTES • Qual era o problema? *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Descreva o desperdício, risco ou gargalo anterior..."
                      value={qpBefore}
                      onChange={e => setQpBefore(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
                      DEPOIS • Solução e resultado comprovado *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="O que foi implementado e qual ganho foi verificado?"
                      value={qpAfter}
                      onChange={e => setQpAfter(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Economia Anual Validada (R$)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Ex: 18000"
                      value={qpSavings}
                      onChange={e => setQpSavings(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                      Horas Liberadas / Mês
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="Ex: 12"
                      value={qpHours}
                      onChange={e => setQpHours(e.target.value)}
                      className={`w-full rounded-xl px-3 py-2 ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                  >
                    Concluir &amp; Publicar no Feed
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REPLICAR VIA YOKOTEN PARA A MINHA ÁREA */}
      {yokotenSource && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className={`rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 ${
              tintedGlass ? 'aptis-glass-modal text-white' : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={() => setYokotenSource(null)}
              className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                  tintedGlass
                    ? 'bg-cyan-500/20 border-cyan-500/35 text-cyan-300'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                }`}
              >
                <Repeat2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Disseminação Horizontal • Yokoten
                </span>
                <h3 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  Replicar Melhoria na Sua Área
                </h3>
              </div>
            </div>

            <p className={`text-xs mb-4 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Você vai clonar <strong>&quot;{yokotenSource.title}&quot;</strong> (origem: {yokotenSource.sector}) para o funil Kanban da sua área como uma nova iniciativa em <em>Ideação</em>, gerando <strong>+25 pts Yokoten</strong> para o autor original no Ranking!
            </p>

            <div className="mb-4 text-xs">
              <label className={`block font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Setor de Destino (Sua Área):
              </label>
              <select
                value={yokotenTargetSectorId}
                onChange={e => setYokotenTargetSectorId(e.target.value)}
                className={`w-full rounded-xl p-2.5 font-semibold cursor-pointer ${
                  tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              >
                {allowedSectors.map(sec => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} ({sec.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setYokotenSource(null)}
                className="px-3.5 py-2 rounded-xl font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmYokoten}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold cursor-pointer"
              >
                Confirmar Replicação Yokoten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
