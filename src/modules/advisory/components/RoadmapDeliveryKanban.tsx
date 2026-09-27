'use client';

import React, { useState } from 'react';
import {
  Layers,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  X,
  FileText,
} from 'lucide-react';
import { ProjectDeliverable, ProjectPhase, DeliverableStatus, ConsultingClient } from '../types';

interface RoadmapDeliveryKanbanProps {
  deliverables: ProjectDeliverable[];
  clients: ConsultingClient[];
  selectedClientId: string;
  onSaveDeliverable: (deliverable: ProjectDeliverable) => void;
  onUpdateStatus: (id: string, newStatus: DeliverableStatus, blockReason?: string) => void;
}

const PHASES_CONFIG: { id: ProjectPhase; label: string; badge: string; color: string }[] = [
  { id: 'diagnostico', label: 'Fase 1 • Diagnóstico 360º', badge: 'Entrada', color: 'blue' },
  { id: 'desenho', label: 'Fase 2 • Desenho & Padrões', badge: 'Solução', color: 'indigo' },
  { id: 'implantacao', label: 'Fase 3 • Implantação no Gemba', badge: 'Execução', color: 'purple' },
  { id: 'sustentacao', label: 'Fase 4 • Sustentação & Autonomia', badge: 'Perenidade', color: 'emerald' },
];

export const RoadmapDeliveryKanban: React.FC<RoadmapDeliveryKanbanProps> = ({
  deliverables,
  clients,
  selectedClientId,
  onSaveDeliverable,
  onUpdateStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<'all' | ProjectPhase>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DeliverableStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [blockModalDeliverable, setBlockModalDeliverable] = useState<ProjectDeliverable | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');

  // Form states for new deliverable
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<ProjectPhase>('implantacao');
  const [newConsultant, setNewConsultant] = useState('Danilo Henrique');
  const [newClientPeer, setNewClientPeer] = useState('Mariana Esteves');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [newSummary, setNewSummary] = useState('');

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const filtered = deliverables.filter((d) => {
    if (d.clientId !== selectedClientId) return false;
    if (phaseFilter !== 'all' && d.phase !== phaseFilter) return false;
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    return (
      d.title.toLowerCase().includes(term) ||
      d.responsibleConsultant.toLowerCase().includes(term) ||
      d.responsibleClientPeer.toLowerCase().includes(term) ||
      (d.blockReason && d.blockReason.toLowerCase().includes(term))
    );
  });

  const blockedCount = deliverables.filter(
    (d) => d.clientId === selectedClientId && d.status === 'blocked_by_client'
  ).length;

  const completedCount = deliverables.filter(
    (d) => d.clientId === selectedClientId && d.status === 'completed'
  ).length;

  const totalCount = deliverables.filter((d) => d.clientId === selectedClientId).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreateDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newDel: ProjectDeliverable = {
      id: `del-${Date.now()}`,
      clientId: selectedClientId,
      title: newTitle.trim(),
      phase: newPhase,
      status: 'in_progress',
      responsibleConsultant: newConsultant,
      responsibleClientPeer: newClientPeer,
      dueDate: newDueDate,
      deliverableSummary: newSummary.trim() || 'Entregável em andamento no cliente.',
    };

    onSaveDeliverable(newDel);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewSummary('');
  };

  const handleConfirmBlock = () => {
    if (!blockModalDeliverable) return;
    onUpdateStatus(blockModalDeliverable.id, 'blocked_by_client', blockReasonInput);
    setBlockModalDeliverable(null);
    setBlockReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Client Progress and Block Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Evolução Física do Projeto
          </span>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="text-3xl font-black text-slate-900">{progressPercent}%</div>
            <div className="flex-1">
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                {completedCount} de {totalCount} entregáveis concluídos
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Líderes do Projeto
          </span>
          <div className="mt-1 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="font-bold text-blue-700">Consultoria:</span>
              <span>{currentClient?.consultantLead}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <span className="font-bold text-slate-700">Contraparte:</span>
              <span>{currentClient?.sponsorName}</span>
            </div>
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-sm transition ${
            blockedCount > 0
              ? 'bg-amber-50/80 border-amber-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Semáforo de Bloqueios no Cliente
            </span>
            {blockedCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {blockedCount} {blockedCount === 1 ? 'Ação Travada' : 'Ações Travadas'}
          </div>
          <span className="text-[11px] text-amber-800 font-medium">
            {blockedCount > 0
              ? 'Aguardando validação ou envio de dados pela equipe do cliente'
              : 'Nenhum gargalo reportado no cliente'}
          </span>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar entregável, responsável ou motivo de bloqueio..."
            className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          >
            <option value="all">Todas as Fases</option>
            <option value="diagnostico">Fase 1 • Diagnóstico</option>
            <option value="desenho">Fase 2 • Desenho</option>
            <option value="implantacao">Fase 3 • Implantação</option>
            <option value="sustentacao">Fase 4 • Sustentação</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          >
            <option value="all">Todos os Status</option>
            <option value="blocked_by_client">⚠️ Aguardando Cliente</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluídos</option>
            <option value="backlog">Backlog Futuro</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Entregável
          </button>
        </div>
      </div>

      {/* Deliverables Grouped by Phase or List */}
      <div className="space-y-6">
        {PHASES_CONFIG.map((phase) => {
          const phaseItems = filtered.filter((d) => d.phase === phase.id);
          if (phaseFilter !== 'all' && phaseFilter !== phase.id) return null;

          return (
            <div key={phase.id} className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900">{phase.label}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {phaseItems.length} {phaseItems.length === 1 ? 'entrega' : 'entregas'}
                  </span>
                </div>
              </div>

              {phaseItems.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-white text-center text-xs text-slate-400 italic">
                  Nenhum entregável cadastrado nesta fase para os filtros ativos.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phaseItems.map((item) => {
                    const isBlocked = item.status === 'blocked_by_client';
                    const isCompleted = item.status === 'completed';

                    return (
                      <div
                        key={item.id}
                        className={`p-5 rounded-2xl border transition shadow-sm flex flex-col justify-between space-y-3 ${
                          isBlocked
                            ? 'bg-amber-50/60 border-amber-300 hover:border-amber-500'
                            : isCompleted
                            ? 'bg-white border-slate-200 hover:border-emerald-400'
                            : 'bg-white border-slate-200 hover:border-blue-400'
                        }`}
                      >
                        <div>
                          {/* Header tags */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isBlocked
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 flex items-center gap-1'
                                  : isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {isBlocked && <AlertTriangle className="w-3 h-3 text-amber-700" />}
                              {isBlocked
                                ? 'Aguardando Cliente'
                                : isCompleted
                                ? 'Concluído'
                                : 'Em Andamento'}
                            </span>

                            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Prazo: <strong>{item.dueDate}</strong>
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.deliverableSummary}
                          </p>

                          {/* Block Warning Box if Blocked */}
                          {isBlocked && (
                            <div className="mt-3 p-3 rounded-xl bg-amber-100/70 border border-amber-300 text-xs text-amber-900 space-y-1">
                              <strong className="font-bold flex items-center gap-1 text-[11px] uppercase">
                                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                                Motivo do Bloqueio no Cliente:
                              </strong>
                              <p className="text-[11px]">{item.blockReason}</p>
                              {item.blockedSince && (
                                <span className="text-[10px] text-amber-800 font-mono block">
                                  Travado desde: {item.blockedSince}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Responsible Peers */}
                          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px]">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                                Consultor Responsável:
                              </span>
                              <span className="font-bold text-blue-700 truncate block">
                                {item.responsibleConsultant}
                              </span>
                            </div>

                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                              <span className="text-[9px] text-slate-400 font-bold uppercase block">
                                Contraparte do Cliente:
                              </span>
                              <span className="font-bold text-slate-800 truncate block">
                                {item.responsibleClientPeer}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, 'in_progress')}
                              className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold transition cursor-pointer text-[11px]"
                            >
                              Destravar Ação
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBlockModalDeliverable(item);
                                setBlockReasonInput(
                                  'Aguardando envio de documentação ou aprovação pelo setor do cliente.'
                                );
                              }}
                              className="text-slate-500 hover:text-amber-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Sinalizar Bloqueio no Cliente
                            </button>
                          )}

                          {!isCompleted ? (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(item.id, 'completed')}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition flex items-center gap-1 text-[11px] shadow-xs cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Concluir Entrega
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Validado com Sucesso
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal to Signal Client Block */}
      {blockModalDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Sinalizar Bloqueio no Cliente
              </h3>
              <button
                onClick={() => setBlockModalDeliverable(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Registre com clareza o motivo pelo qual a consultoria não consegue avançar nesta entrega
              (ex: falta de dados, validação do diretor, etc.). Isso constará na prestação de contas.
            </p>

            <div>
              <label className="font-bold text-slate-700 mb-1 block text-xs">
                Motivo do Gargalo / Pendência:
              </label>
              <textarea
                rows={3}
                value={blockReasonInput}
                onChange={(e) => setBlockReasonInput(e.target.value)}
                placeholder="Ex: Aguardando envio das planilhas de rateio contábil pela equipe de Controladoria..."
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 resize-none outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBlockModalDeliverable(null)}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="px-4 py-2 font-bold uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md shadow-amber-600/20"
              >
                Confirmar Bloqueio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add Deliverable */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Novo Entregável do Projeto
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeliverable} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Título da Entrega *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Mapeamento de VSM e Desenho do Fluxo Futuro..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Fase do Projeto</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as ProjectPhase)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none"
                  >
                    <option value="diagnostico">Fase 1 • Diagnóstico 360º</option>
                    <option value="desenho">Fase 2 • Desenho & Padrões</option>
                    <option value="implantacao">Fase 3 • Implantação Gemba</option>
                    <option value="sustentacao">Fase 4 • Sustentação</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Prazo Acordado</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Consultor Responsável</label>
                  <input
                    type="text"
                    value={newConsultant}
                    onChange={(e) => setNewConsultant(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Contraparte do Cliente</label>
                  <input
                    type="text"
                    value={newClientPeer}
                    onChange={(e) => setNewClientPeer(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Descrição do Escopo da Entrega</label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Detalhamento do que será entregue e critérios de aceite..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 resize-none outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25"
                >
                  Salvar Entregável
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
