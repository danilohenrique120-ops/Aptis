'use client';

import React, { useState, useEffect } from 'react';
import {
  ManagerFollowUpItem,
  FollowUpAttentionLevel,
  FollowUpStatus,
  FollowUpUpdate
} from '../types';
import {
  Eye,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  Calendar,
  UserCheck,
  CheckCircle2,
  MessageSquare,
  ChevronRight,
  Edit3,
  Trash2,
  Sparkles,
  Send,
  CalendarClock,
  History
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

interface ManagerFollowUpPanelProps {
  followUps: ManagerFollowUpItem[];
  onSaveFollowUp: (
    item: Omit<ManagerFollowUpItem, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'tenantId'> & {
      id?: string;
      history?: FollowUpUpdate[];
    }
  ) => void;
  onDeleteFollowUp: (id: string) => void;
  onAddQuickUpdate: (id: string, note: string) => void;
  onChangeStatus: (id: string, newStatus: FollowUpStatus) => void;
  onResetExamples: () => void;
  selectedSectorFilter?: string;
}

export function ManagerFollowUpPanel({
  followUps,
  onSaveFollowUp,
  onDeleteFollowUp,
  onAddQuickUpdate,
  onChangeStatus,
  onResetExamples,
  selectedSectorFilter = 'all'
}: ManagerFollowUpPanelProps) {
  const { sectors: plantSectors } = usePlantSectors();
  const safePlantSectors = Array.isArray(plantSectors) ? plantSectors : [];

  const [search, setSearch] = useState('');
  const [attentionFilter, setAttentionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quickNoteInputs, setQuickNoteInputs] = useState<Record<string, string>>({});
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});
  const [tintedGlass, setTintedGlass] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setTintedGlass(customEvent.detail);
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ManagerFollowUpItem | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formContext, setFormContext] = useState('');
  const [formCounterpart, setFormCounterpart] = useState('');
  const [formSector, setFormSector] = useState('');
  const [formAttentionLevel, setFormAttentionLevel] = useState<FollowUpAttentionLevel>('alto');
  const [formStatus, setFormStatus] = useState<FollowUpStatus>('em_monitoramento');
  const [formNextDate, setFormNextDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // Open modal
  const handleOpenNewModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormContext('');
    setFormCounterpart('');
    setFormSector(
      selectedSectorFilter !== 'all'
        ? selectedSectorFilter
        : safePlantSectors[0]?.name || 'Geral'
    );
    setFormAttentionLevel('alto');
    setFormStatus('em_monitoramento');
    setFormNextDate(
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ManagerFollowUpItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContext(item.context);
    setFormCounterpart(item.counterpart);
    setFormSector(item.sector);
    setFormAttentionLevel(item.attentionLevel);
    setFormStatus(item.status);
    setFormNextDate(item.nextFollowUpDate);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    onSaveFollowUp({
      id: editingItem ? editingItem.id : undefined,
      title: formTitle.trim(),
      context: formContext.trim(),
      counterpart: formCounterpart.trim() || 'Equipe Interna',
      sector: formSector || 'Geral',
      attentionLevel: formAttentionLevel,
      status: formStatus,
      nextFollowUpDate: formNextDate,
      history: editingItem ? editingItem.history : []
    });

    setIsModalOpen(false);
  };

  const handleSendQuickNote = (itemId: string) => {
    const note = quickNoteInputs[itemId]?.trim();
    if (!note) return;
    onAddQuickUpdate(itemId, note);
    setQuickNoteInputs(prev => ({ ...prev, [itemId]: '' }));
  };

  const toggleHistory = (id: string) => {
    setExpandedHistories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter items
  const filteredItems = followUps.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.counterpart.toLowerCase().includes(search.toLowerCase()) ||
      item.context.toLowerCase().includes(search.toLowerCase()) ||
      item.sector.toLowerCase().includes(search.toLowerCase());

    const matchesAttention = attentionFilter === 'all' || item.attentionLevel === attentionFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSector =
      selectedSectorFilter === 'all' ||
      item.sector.toLowerCase().includes(selectedSectorFilter.toLowerCase()) ||
      selectedSectorFilter.toLowerCase().includes(item.sector.toLowerCase());

    return matchesSearch && matchesAttention && matchesStatus && matchesSector;
  });

  // Attention Level Badge
  const getAttentionBadge = (level: FollowUpAttentionLevel) => {
    switch (level) {
      case 'critico':
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              tintedGlass
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
                : 'bg-rose-100 text-rose-800 border-rose-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            🔴 Crítico / Imediato
          </span>
        );
      case 'alto':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              tintedGlass
                ? 'bg-orange-500/20 text-orange-300 border-orange-400/35'
                : 'bg-orange-100 text-orange-800 border-orange-200'
            }`}
          >
            🟠 Alta Atenção
          </span>
        );
      case 'medio':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
              tintedGlass
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            🟡 Atenção Regular
          </span>
        );
      case 'estavel':
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              tintedGlass
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            🟢 Estável / Observação
          </span>
        );
    }
  };

  // Status Badge
  const getStatusBadge = (status: FollowUpStatus) => {
    switch (status) {
      case 'aguardando_retorno':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/35'
                : 'text-purple-700 bg-purple-50 border-purple-200'
            }`}
          >
            <Clock className="w-3 h-3" /> Aguardando Retorno
          </span>
        );
      case 'em_monitoramento':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                : 'text-blue-700 bg-blue-50 border-blue-200'
            }`}
          >
            <Eye className="w-3 h-3" /> Em Monitoramento
          </span>
        );
      case 'agendar_alinhamento':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                : 'text-amber-800 bg-amber-50 border-amber-200'
            }`}
          >
            <Calendar className="w-3 h-3" /> Agendar Alinhamento
          </span>
        );
      case 'encerrado':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border line-through ${
              tintedGlass
                ? 'bg-white/[0.06] text-slate-400 border-white/[0.12]'
                : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" /> Concluído / Encerrado
          </span>
        );
    }
  };

  // Follow-up SLA badge
  const getFollowUpDateBadge = (dateStr: string, isClosed: boolean) => {
    if (isClosed) return null;
    const days = getDaysUntil(dateStr);

    if (days < 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border animate-pulse ${
            tintedGlass
              ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
              : 'text-rose-700 bg-rose-100 border-rose-200'
          }`}
        >
          ⚠️ Follow-up Atrasado ({Math.abs(days)}d)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
              : 'text-amber-800 bg-amber-100 border-amber-200'
          }`}
        >
          🔔 Follow-up Hoje!
        </span>
      );
    }
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
          tintedGlass
            ? 'bg-white/[0.06] text-slate-300 border-white/[0.12]'
            : 'text-slate-600 bg-slate-100 border-slate-200'
        }`}
      >
        <CalendarClock className="w-3 h-3 text-cyan-400" /> Próx. Checagem: {formatDate(dateStr)} (
        {days}d)
      </span>
    );
  };

  // KPIs
  const totalActive = followUps.filter(i => i.status !== 'encerrado').length;
  const criticalCount = followUps.filter(
    i => i.attentionLevel === 'critico' && i.status !== 'encerrado'
  ).length;
  const waitingReturnCount = followUps.filter(i => i.status === 'aguardando_retorno').length;
  const dueTodayOrLate = followUps.filter(
    i => i.status !== 'encerrado' && getDaysUntil(i.nextFollowUpDate) <= 0
  ).length;

  return (
    <div className="space-y-5">
      {/* Top Banner Explicativo de Governança em Vidro (Estilo Ardena Vídeo 3) */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -right-12 -top-12 w-64 h-64 rounded-full opacity-35 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.55) 0%, rgba(234, 88, 12, 0.25) 60%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  tintedGlass
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                Pilar de Gestão & Alinhamento
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                • Acompanhamento Direto do Líder
              </span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" />
              Radar de Follow-up & Assuntos sob Atenção Especial
            </h2>
            <p
              className={`text-xs max-w-2xl leading-relaxed ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Monitore pautas estratégicas, alinhamentos sindicais, desvios operacionais complexos, negociações com fornecedores e assuntos que dependem do seu acompanhamento direto.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {followUps.length === 0 && (
              <button
                onClick={onResetExamples}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Carregar Casos de Exemplo
              </button>
            )}
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                border: '1px solid rgba(253, 224, 71, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(234, 88, 12, 0.5)'
              }}
            >
              <Plus className="w-4 h-4" />
              Novo Assunto sob Atenção
            </button>
          </div>
        </div>

        {/* KPI Cards Rápidos do Follow-up */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.08]">
          <div
            className={`p-3.5 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-medium ${
                tintedGlass ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              <span>Pautas Ativas</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black font-mono mt-1">{totalActive}</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-medium ${
                tintedGlass ? 'text-rose-300' : 'text-rose-600'
              }`}
            >
              <span>Nível Crítico</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl font-black font-mono text-rose-400 mt-1">{criticalCount}</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-medium ${
                tintedGlass ? 'text-purple-300' : 'text-purple-600'
              }`}
            >
              <span>Aguardando Retorno</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-black font-mono text-purple-400 mt-1">
              {waitingReturnCount}
            </p>
          </div>

          <div
            className={`p-3.5 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-medium ${
                tintedGlass ? 'text-amber-300' : 'text-amber-700'
              }`}
            >
              <span>Follow-up Hoje / Vencido</span>
              <CalendarClock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black font-mono text-amber-400 mt-1">{dueTodayOrLate}</p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div
        className={`p-3.5 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por assunto, interlocutor, contexto ou setor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
              tintedGlass
                ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-400 focus:border-amber-400/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
              tintedGlass
                ? 'aptis-glass-subcard text-slate-200'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs font-semibold">Criticidade:</span>
            <select
              value={attentionFilter}
              onChange={e => setAttentionFilter(e.target.value)}
              className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${
                tintedGlass ? 'text-amber-300' : 'text-slate-900'
              }`}
            >
              <option value="all" className="bg-slate-900 text-white">
                Todas
              </option>
              <option value="critico" className="bg-slate-900 text-white">
                🔴 Crítico
              </option>
              <option value="alto" className="bg-slate-900 text-white">
                🟠 Alto
              </option>
              <option value="medio" className="bg-slate-900 text-white">
                🟡 Médio
              </option>
              <option value="estavel" className="bg-slate-900 text-white">
                🟢 Estável
              </option>
            </select>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
              tintedGlass
                ? 'aptis-glass-subcard text-slate-200'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            <span className="text-xs font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${
                tintedGlass ? 'text-cyan-300' : 'text-slate-900'
              }`}
            >
              <option value="all" className="bg-slate-900 text-white">
                Todos os Status
              </option>
              <option value="em_monitoramento" className="bg-slate-900 text-white">
                Em Monitoramento
              </option>
              <option value="aguardando_retorno" className="bg-slate-900 text-white">
                Aguardando Retorno
              </option>
              <option value="agendar_alinhamento" className="bg-slate-900 text-white">
                Agendar Alinhamento
              </option>
              <option value="encerrado" className="bg-slate-900 text-white">
                Encerrado / Resolvido
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Assuntos em Cards Executivos de Vidro (Estilo Ardena Vídeo 3) */}
      <div className="space-y-4 max-h-[calc(100vh-290px)] min-h-[400px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div
            className={`rounded-3xl p-12 text-center space-y-3 ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="w-12 h-12 bg-amber-500/20 text-amber-300 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold">Nenhum assunto sob atenção encontrado</h3>
            <p className={`text-xs max-w-md mx-auto ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Cadastre negociações, alinhamentos intersetoriais, acompanhamentos com fornecedores ou assuntos da diretoria que necessitam do seu follow-up regular.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Primeiro Assunto
            </button>
          </div>
        ) : (
          filteredItems.map(item => {
            const isClosed = item.status === 'encerrado';
            const isExpanded = !!expandedHistories[item.id];
            const historyCount = item.history?.length || 0;

            return (
              <div
                key={item.id}
                className={`rounded-3xl p-5 transition-all duration-300 ${
                  tintedGlass
                    ? `aptis-glass-dark aptis-glass-dark-interactive text-white ${isClosed ? 'opacity-65' : ''}`
                    : `aptis-glass-light hover:shadow-lg hover:-translate-y-1 text-slate-900 ${isClosed ? 'opacity-70' : ''}`
                }`}
              >
                {/* Cabeçalho do Card */}
                <div
                  className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b ${
                    tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getAttentionBadge(item.attentionLevel)}
                      {getStatusBadge(item.status)}
                      <span
                        className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                          tintedGlass
                            ? 'bg-white/[0.06] text-cyan-200 border-white/[0.12]'
                            : 'text-slate-500 bg-slate-100 border-slate-200'
                        }`}
                      >
                        {item.sector}
                      </span>
                      {getFollowUpDateBadge(item.nextFollowUpDate, isClosed)}
                    </div>

                    <h3
                      className={`text-base font-black ${
                        isClosed ? 'opacity-60 line-through' : ''
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Editar Assunto"
                      className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Deseja realmente excluir o assunto "${item.title}"?`
                          )
                        ) {
                          onDeleteFollowUp(item.id);
                        }
                      }}
                      title="Excluir Assunto"
                      className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Corpo do Assunto: Contexto & Stakeholder em Sub-cards de Vidro */}
                <div className="py-3.5 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      Contexto & O que está em jogo
                    </span>
                    <p
                      className={`text-xs leading-relaxed p-3.5 rounded-2xl ${
                        tintedGlass
                          ? 'aptis-glass-subcard text-slate-200'
                          : 'bg-slate-50/80 border border-slate-200 text-slate-700'
                      }`}
                    >
                      {item.context || 'Nenhum contexto registrado ainda.'}
                    </p>
                  </div>

                  <div
                    className={`space-y-2 p-3.5 rounded-2xl flex flex-col justify-between ${
                      tintedGlass
                        ? 'aptis-glass-subcard'
                        : 'bg-slate-50/80 border border-slate-200'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        Interlocutores / Stakeholders
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>{item.counterpart}</span>
                      </div>
                    </div>

                    <div
                      className={`pt-2 border-t flex items-center justify-between gap-2 ${
                        tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/60'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-medium ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Mudar status:
                      </span>
                      <select
                        value={item.status}
                        onChange={e =>
                          onChangeStatus(item.id, e.target.value as FollowUpStatus)
                        }
                        className={`text-[11px] font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none border ${
                          tintedGlass
                            ? 'bg-black/30 border-white/[0.15] text-cyan-300'
                            : 'bg-white border-slate-300 text-slate-700'
                        }`}
                      >
                        <option value="em_monitoramento" className="bg-slate-900 text-white">
                          Em Monitoramento
                        </option>
                        <option value="aguardando_retorno" className="bg-slate-900 text-white">
                          Aguardando Retorno
                        </option>
                        <option value="agendar_alinhamento" className="bg-slate-900 text-white">
                          Agendar Alinhamento
                        </option>
                        <option value="encerrado" className="bg-slate-900 text-white">
                          Encerrar Assunto
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Histórico de Atualizações / Timeline */}
                <div
                  className={`mt-1 pt-3 border-t ${
                    tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => toggleHistory(item.id)}
                      className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-200 hover:text-cyan-300'
                          : 'text-slate-700 hover:text-blue-600'
                      }`}
                    >
                      <History className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Histórico de Registros ({historyCount})</span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                    <span
                      className={`text-[10px] ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      Última atualização: {formatDate(item.updatedAt || item.createdAt)}
                    </span>
                  </div>

                  {isExpanded && (
                    <div
                      className={`space-y-2 mb-3 p-3.5 rounded-2xl ${
                        tintedGlass
                          ? 'aptis-glass-subcard'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      {historyCount === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          Nenhuma anotação registrada ainda.
                        </p>
                      ) : (
                        item.history.map(hist => (
                          <div
                            key={hist.id}
                            className="text-xs border-l-2 border-cyan-400 pl-2.5 py-1"
                          >
                            <div
                              className={`flex items-center gap-2 text-[10px] font-semibold mb-0.5 ${
                                tintedGlass ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              <span>{formatDate(hist.date)}</span>
                              {hist.author && <span>• {hist.author}</span>}
                            </div>
                            <p className="leading-normal">{hist.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Input Rápido para Inserir Nota de Follow-up */}
                  {!isClosed && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative flex-1">
                        <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Registrar nota rápida de acompanhamento (ex: conversei com fornecedor, retorno prometido para amanhã)..."
                          value={quickNoteInputs[item.id] || ''}
                          onChange={e =>
                            setQuickNoteInputs(prev => ({
                              ...prev,
                              [item.id]: e.target.value
                            }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendQuickNote(item.id);
                            }
                          }}
                          className={`w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
                            tintedGlass
                              ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-400 focus:border-cyan-400/50'
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
                          }`}
                        />
                      </div>
                      <button
                        onClick={() => handleSendQuickNote(item.id)}
                        disabled={!quickNoteInputs[item.id]?.trim()}
                        className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-3 h-3" />
                        <span>Anotar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de Criação / Edição de Assunto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl w-full max-w-xl overflow-hidden relative ${
              tintedGlass
                ? 'aptis-glass-modal text-white'
                : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
            }`}
          >
            {tintedGlass && (
              <div
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)'
                }}
              />
            )}

            <div
              className={`px-6 py-4 border-b flex items-center justify-between relative z-10 ${
                tintedGlass
                  ? 'border-white/[0.08] bg-white/[0.02]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    tintedGlass
                      ? 'aptis-glass-subcard text-amber-300'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                </div>
                <h3
                  className={`text-base font-black ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {editingItem
                    ? 'Editar Assunto sob Monitoramento'
                    : 'Novo Assunto sob Atenção do Gestor'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`text-lg font-bold cursor-pointer p-1.5 rounded-xl transition-colors ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 relative z-10">
              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    tintedGlass ? 'text-amber-300' : 'text-slate-700'
                  }`}
                >
                  Título do Assunto / Pauta Estratégica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Homologação emergencial de novo fornecedor de aço"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className={`w-full text-xs font-medium rounded-xl p-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Interlocutor / Envolvidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Diretoria, RH, Fornecedor X"
                    value={formCounterpart}
                    onChange={e => setFormCounterpart(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Área / Setor Relacionado
                  </label>
                  <select
                    value={formSector}
                    onChange={e => setFormSector(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none cursor-pointer ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <option value="Geral">Geral da Planta / Corporativo</option>
                    {safePlantSectors.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Nível de Atenção
                  </label>
                  <select
                    value={formAttentionLevel}
                    onChange={e =>
                      setFormAttentionLevel(e.target.value as FollowUpAttentionLevel)
                    }
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none font-medium cursor-pointer ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <option value="critico">🔴 Crítico / Imediato</option>
                    <option value="alto">🟠 Alta Atenção</option>
                    <option value="medio">🟡 Atenção Regular</option>
                    <option value="estavel">🟢 Estável / Observação</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Status Atual
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as FollowUpStatus)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none font-medium cursor-pointer ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <option value="em_monitoramento">Em Monitoramento</option>
                    <option value="aguardando_retorno">Aguardando Retorno</option>
                    <option value="agendar_alinhamento">Agendar Alinhamento</option>
                    <option value="encerrado">Encerrado / Resolvido</option>
                  </select>
                </div>

                <div>
                  <label
                    className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Próx. Follow-up
                  </label>
                  <input
                    type="date"
                    required
                    value={formNextDate}
                    onChange={e => setFormNextDate(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input'
                        : 'border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Contexto, Histórico & O que está em jogo
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva o que motivou a atenção especial, quais os impactos operacionais se falhar, e quais os próximos passos esperados..."
                  value={formContext}
                  onChange={e => setFormContext(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div
                className={`pt-4 border-t flex items-center justify-end gap-2.5 ${
                  tintedGlass ? 'border-white/[0.08]' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    tintedGlass
                      ? 'border border-white/[0.15] text-slate-300 hover:bg-white/[0.08]'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                >
                  {editingItem ? 'Salvar Alterações' : 'Criar Assunto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
