'use client';

import React, { useState } from 'react';
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
  Filter, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  MessageSquare, 
  ChevronRight, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  Sparkles,
  Send,
  Building2,
  CalendarClock,
  History
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

interface ManagerFollowUpPanelProps {
  followUps: ManagerFollowUpItem[];
  onSaveFollowUp: (item: Omit<ManagerFollowUpItem, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'tenantId'> & { id?: string; history?: FollowUpUpdate[] }) => void;
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
    setFormSector(selectedSectorFilter !== 'all' ? selectedSectorFilter : (safePlantSectors[0]?.name || 'Geral'));
    setFormAttentionLevel('alto');
    setFormStatus('em_monitoramento');
    setFormNextDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
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
    const matchesSector = selectedSectorFilter === 'all' || 
      item.sector.toLowerCase().includes(selectedSectorFilter.toLowerCase()) ||
      selectedSectorFilter.toLowerCase().includes(item.sector.toLowerCase());

    return matchesSearch && matchesAttention && matchesStatus && matchesSector;
  });

  // Attention Level Badge
  const getAttentionBadge = (level: FollowUpAttentionLevel) => {
    switch (level) {
      case 'critico':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
            🔴 Crítico / Imediato
          </span>
        );
      case 'alto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200 shadow-2xs">
            🟠 Alta Atenção
          </span>
        );
      case 'medio':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
            🟡 Atenção Regular
          </span>
        );
      case 'estavel':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
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
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" /> Aguardando Retorno
          </span>
        );
      case 'em_monitoramento':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            <Eye className="w-3 h-3 text-blue-600" /> Em Monitoramento
          </span>
        );
      case 'agendar_alinhamento':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Calendar className="w-3 h-3 text-amber-600" /> Agendar Alinhamento
          </span>
        );
      case 'encerrado':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 line-through">
            <CheckCircle2 className="w-3 h-3 text-slate-500" /> Concluído / Encerrado
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
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
          ⚠️ Follow-up Atrasado ({Math.abs(days)}d)
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
          🔔 Follow-up Hoje!
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
        <CalendarClock className="w-3 h-3 text-slate-400" /> Próx. Checagem: {formatDate(dateStr)} ({days}d)
      </span>
    );
  };

  // KPIs
  const totalActive = followUps.filter(i => i.status !== 'encerrado').length;
  const criticalCount = followUps.filter(i => i.attentionLevel === 'critico' && i.status !== 'encerrado').length;
  const waitingReturnCount = followUps.filter(i => i.status === 'aguardando_retorno').length;
  const dueTodayOrLate = followUps.filter(i => i.status !== 'encerrado' && getDaysUntil(i.nextFollowUpDate) <= 0).length;

  return (
    <div className="space-y-5">
      {/* Top Banner Explicativo de Governança */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[11px] font-bold uppercase tracking-wider border border-blue-400/30">
                Pilar de Gestão & Alinhamento
              </span>
              <span className="text-xs text-slate-400">• Não é tarefa delegável</span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Radar de Follow-up & Assuntos sob Atenção Especial
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Monitore pautas estratégicas, alinhamentos sindicais, desvios operacionais complexos, negociações com fornecedores e assuntos que dependem do seu acompanhamento direto como líder.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {followUps.length === 0 && (
              <button
                onClick={onResetExamples}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Carregar Casos de Exemplo
              </button>
            )}
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Novo Assunto sob Atenção
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Rápidos do Follow-up */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pautas sob Monitoramento</span>
            <Eye className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalActive}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 text-xs font-medium">
            <span>Nível Crítico</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-1">{criticalCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 text-xs font-medium">
            <span>Aguardando Retorno</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-1">{waitingReturnCount}</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-medium">
            <span>Follow-up Hoje / Vencido</span>
            <CalendarClock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{dueTodayOrLate}</p>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por assunto, interlocutor, contexto ou setor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Criticidade:</span>
            <select
              value={attentionFilter}
              onChange={(e) => setAttentionFilter(e.target.value)}
              className="text-xs border border-slate-300 bg-white rounded-lg py-1.5 px-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todas</option>
              <option value="critico">🔴 Crítico</option>
              <option value="alto">🟠 Alto</option>
              <option value="medio">🟡 Médio</option>
              <option value="estavel">🟢 Estável</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 bg-white rounded-lg py-1.5 px-2.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="em_monitoramento">Em Monitoramento</option>
              <option value="aguardando_retorno">Aguardando Retorno</option>
              <option value="agendar_alinhamento">Agendar Alinhamento</option>
              <option value="encerrado">Encerrado / Resolvido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Assuntos com Barra de Rolagem Interna */}
      <div className="space-y-4 max-h-[calc(100vh-290px)] min-h-[400px] overflow-y-auto pr-1">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Nenhum assunto sob atenção encontrado</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Cadastre negociações, alinhamentos intersetoriais, acompanhamentos com fornecedores ou assuntos da diretoria que necessitam do seu follow-up regular.
            </p>
            <button
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
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
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
                  isClosed
                    ? 'border-slate-200 bg-slate-50/70 opacity-75'
                    : item.attentionLevel === 'critico'
                    ? 'border-rose-300 ring-1 ring-rose-200/50'
                    : 'border-slate-200'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getAttentionBadge(item.attentionLevel)}
                      {getStatusBadge(item.status)}
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.sector}
                      </span>
                      {getFollowUpDateBadge(item.nextFollowUpDate, isClosed)}
                    </div>

                    <h3 className={`text-base font-bold ${isClosed ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      title="Editar Assunto"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja realmente excluir o assunto "${item.title}"?`)) {
                          onDeleteFollowUp(item.id);
                        }
                      }}
                      title="Excluir Assunto"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Corpo do Assunto: Contexto & Stakeholder */}
                <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Contexto & O que está em jogo
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-200/80">
                      {item.context || 'Nenhum contexto registrado ainda.'}
                    </p>
                  </div>

                  <div className="space-y-2 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Interlocutores / Stakeholders
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                        <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{item.counterpart}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-medium text-slate-500">Mudar status:</span>
                      <select
                        value={item.status}
                        onChange={(e) => onChangeStatus(item.id, e.target.value as FollowUpStatus)}
                        className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 cursor-pointer focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="em_monitoramento">Em Monitoramento</option>
                        <option value="aguardando_retorno">Aguardando Retorno</option>
                        <option value="agendar_alinhamento">Agendar Alinhamento</option>
                        <option value="encerrado">Encerrar Assunto</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Histórico de Atualizações / Timeline */}
                <div className="mt-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => toggleHistory(item.id)}
                      className="text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Histórico de Registros ({historyCount})</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                    <span className="text-[10px] text-slate-400">
                      Última atualização: {formatDate(item.updatedAt || item.createdAt)}
                    </span>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {historyCount === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">Nenhuma anotação registrada ainda.</p>
                      ) : (
                        item.history.map(hist => (
                          <div key={hist.id} className="text-xs border-l-2 border-blue-500 pl-2.5 py-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mb-0.5">
                              <span>{formatDate(hist.date)}</span>
                              {hist.author && <span>• {hist.author}</span>}
                            </div>
                            <p className="text-slate-800 leading-normal">{hist.note}</p>
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
                          onChange={(e) => setQuickNoteInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendQuickNote(item.id);
                            }
                          }}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                      </div>
                      <button
                        onClick={() => handleSendQuickNote(item.id)}
                        disabled={!quickNoteInputs[item.id]?.trim()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingItem ? 'Editar Assunto sob Monitoramento' : 'Novo Assunto sob Atenção do Gestor'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Título do Assunto / Pauta Estratégica *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Homologação emergencial de novo fornecedor de aço"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interlocutor / Envolvidos *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Diretoria, RH, Fornecedor X"
                    value={formCounterpart}
                    onChange={(e) => setFormCounterpart(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Área / Setor Relacionado
                  </label>
                  <select
                    value={formSector}
                    onChange={(e) => setFormSector(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Geral">Geral da Planta / Corporativo</option>
                    {safePlantSectors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nível de Atenção
                  </label>
                  <select
                    value={formAttentionLevel}
                    onChange={(e) => setFormAttentionLevel(e.target.value as FollowUpAttentionLevel)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="critico">🔴 Crítico / Imediato</option>
                    <option value="alto">🟠 Alta Atenção</option>
                    <option value="medio">🟡 Atenção Regular</option>
                    <option value="estavel">🟢 Estável / Observação</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Atual
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as FollowUpStatus)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                  >
                    <option value="em_monitoramento">Em Monitoramento</option>
                    <option value="aguardando_retorno">Aguardando Retorno</option>
                    <option value="agendar_alinhamento">Agendar Alinhamento</option>
                    <option value="encerrado">Encerrado / Resolvido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Próx. Follow-up
                  </label>
                  <input
                    type="date"
                    required
                    value={formNextDate}
                    onChange={(e) => setFormNextDate(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contexto, Histórico & O que está em jogo
                </label>
                <textarea
                  rows={4}
                  placeholder="Descreva o que motivou a atenção especial, quais os impactos operacionais se falhar, e quais os próximos passos esperados..."
                  value={formContext}
                  onChange={(e) => setFormContext(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
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
