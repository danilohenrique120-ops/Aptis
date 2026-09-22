'use client';

import React, { useState } from 'react';
import { EmployeePdi, PdiActionItem, LearningPillar, PdiCheckIn } from '../types';
import { PdiCheckInModal } from './PdiCheckInModal';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Check, 
  Sparkles, 
  Trash2
} from 'lucide-react';

interface PdiDetailViewProps {
  pdi: EmployeePdi;
  onBack: () => void;
  onUpdatePdi: (updated: EmployeePdi) => void;
  onDeletePdi?: (pdiId: string) => void;
}

export function PdiDetailView({
  pdi,
  onBack,
  onUpdatePdi
}: PdiDetailViewProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<'all' | LearningPillar>('all');
  const [showAddActionForm, setShowAddActionForm] = useState(false);

  // Form de nova ação
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionPillar, setNewActionPillar] = useState<LearningPillar>('70_practice');
  const [newActionCategory, setNewActionCategory] = useState('Prática Operacional');
  const [newActionMentor, setNewActionMentor] = useState('');
  const [newActionDeadline, setNewActionDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [newActionEvidence, setNewActionEvidence] = useState('');

  // Adicionar Ação
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const action: PdiActionItem = {
      id: `act-${Date.now()}`,
      title: newActionTitle.trim(),
      pillar: newActionPillar,
      skillCategory: newActionCategory.trim() || 'Geral',
      status: 'todo',
      deadline: newActionDeadline,
      mentorOrSupport: newActionMentor.trim() || 'Gestor de Turno',
      evidenceCriteria: newActionEvidence.trim() || 'Validação prática pelo gestor'
    };

    const updatedActions = [...pdi.actions, action];
    const totalActions = updatedActions.length;
    const completedActions = updatedActions.filter(a => a.status === 'done').length;
    const autoProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : pdi.progressPercent;

    onUpdatePdi({
      ...pdi,
      actions: updatedActions,
      progressPercent: autoProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });

    setNewActionTitle('');
    setNewActionMentor('');
    setNewActionEvidence('');
    setShowAddActionForm(false);
  };

  // Alternar Status da Ação
  const handleToggleActionStatus = (actionId: string, currentStatus: PdiActionItem['status']) => {
    const nextStatus: PdiActionItem['status'] = 
      currentStatus === 'todo' ? 'doing' :
      currentStatus === 'doing' ? 'done' :
      currentStatus === 'done' ? 'todo' : 'doing';

    const updatedActions = pdi.actions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          status: nextStatus,
          completedAt: nextStatus === 'done' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return act;
    });

    const totalActions = updatedActions.length;
    const completedActions = updatedActions.filter(a => a.status === 'done').length;
    const autoProgress = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : pdi.progressPercent;

    onUpdatePdi({
      ...pdi,
      actions: updatedActions,
      progressPercent: autoProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  // Excluir Ação
  const handleDeleteAction = (actionId: string) => {
    const updatedActions = pdi.actions.filter(a => a.id !== actionId);
    onUpdatePdi({
      ...pdi,
      actions: updatedActions,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  // Salvar Check-in
  const handleSaveCheckIn = (checkIn: PdiCheckIn, newProgress: number) => {
    const updatedCheckIns = [checkIn, ...pdi.checkIns];
    onUpdatePdi({
      ...pdi,
      checkIns: updatedCheckIns,
      progressPercent: newProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  const filteredActions = selectedPillarFilter === 'all'
    ? pdi.actions
    : pdi.actions.filter(a => a.pillar === selectedPillarFilter);

  const count70 = pdi.actions.filter(a => a.pillar === '70_practice').length;
  const count20 = pdi.actions.filter(a => a.pillar === '20_mentoring').length;
  const count10 = pdi.actions.filter(a => a.pillar === '10_courses').length;

  return (
    <div className="space-y-6 w-full">
      {/* Top Bar de Navegação & Identificação do PDI */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Voltar para a lista de colaboradores"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {pdi.employeeName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {pdi.shift} • {pdi.department}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Cargo Atual: <strong className="text-slate-700">{pdi.employeeRole}</strong> ({pdi.currentLevel})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" />
              Registrar Check-in de Evolução
            </button>
          </div>
        </div>

        {/* Card de Foco Estratégico & Barra de Progresso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3.5 bg-purple-50/40 rounded-xl border border-purple-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Objetivo Almejado (Meta de Carreira)</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{pdi.targetRole}</div>
              <div className="text-[11px] text-purple-700 font-medium">{pdi.targetLevel}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Ciclo & Prazo de Homologação</span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{pdi.cycleYear}</div>
              <div className="text-[11px] text-slate-500">Meta: {pdi.targetEndDate}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-600" />
                Evolução Geral do PDI
              </span>
              <span className="text-sm font-mono font-black text-purple-700">
                {pdi.progressPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, pdi.progressPercent))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
              <span>{pdi.actions.filter(a => a.status === 'done').length} de {pdi.actions.length} metas concluídas</span>
              <span>{pdi.checkIns.length} check-ins realizados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnóstico de Competências: Forças vs. Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Forças */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Pontos Fortes Consolidados (Alavancas)
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pdi.strengths.map((str, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium"
              >
                ✓ {str}
              </span>
            ))}
          </div>
        </div>

        {/* Gaps de Desenvolvimento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Gaps Críticos a Desenvolver (Oportunidades)
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {pdi.growthGaps.map((gap, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium"
              >
                🎯 {gap}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* PAINEL DE AÇÕES 70-20-10 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Plano de Ação Estruturado (Metodologia 70-20-10)
            </h2>
            <p className="text-xs text-slate-500">
              Ações práticas na fábrica (70%), mentoria/troca (20%) e cursos teóricos (10%).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro por Pilar */}
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedPillarFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedPillarFilter === 'all'
                    ? 'bg-purple-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todas ({pdi.actions.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPillarFilter('70_practice')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedPillarFilter === '70_practice'
                    ? 'bg-blue-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                70% Prática ({count70})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPillarFilter('20_mentoring')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedPillarFilter === '20_mentoring'
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                20% Mentoria ({count20})
              </button>
              <button
                type="button"
                onClick={() => setSelectedPillarFilter('10_courses')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedPillarFilter === '10_courses'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                10% Cursos ({count10})
              </button>
            </div>

            <button
              onClick={() => setShowAddActionForm(!showAddActionForm)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Meta
            </button>
          </div>
        </div>

        {/* Formulário Inline de Nova Ação */}
        {showAddActionForm && (
          <form onSubmit={handleAddAction} className="p-4 bg-slate-50 rounded-xl border border-purple-200 space-y-3 animate-in fade-in duration-150 text-xs">
            <div className="font-bold text-purple-700 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Adicionar Meta ao PDI
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Título / Descrição da Meta Prática *</label>
              <input
                type="text"
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                placeholder="Ex: Liderar resolução de problema A3 na Linha 02..."
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Pilar 70-20-10</label>
                <select
                  value={newActionPillar}
                  onChange={(e) => setNewActionPillar(e.target.value as LearningPillar)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                >
                  <option value="70_practice">70% Prática On-the-job</option>
                  <option value="20_mentoring">20% Mentoria / Troca</option>
                  <option value="10_courses">10% Capacitação Formal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Categoria de Competência</label>
                <input
                  type="text"
                  value={newActionCategory}
                  onChange={(e) => setNewActionCategory(e.target.value)}
                  placeholder="Ex: SMED, Qualidade, Liderança"
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Tutor / Mentor de Suporte</label>
                <input
                  type="text"
                  value={newActionMentor}
                  onChange={(e) => setNewActionMentor(e.target.value)}
                  placeholder="Ex: Danilo (Gestor) ou Engenharia"
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Data Limite</label>
                <input
                  type="date"
                  value={newActionDeadline}
                  onChange={(e) => setNewActionDeadline(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Critério de Evidência / Sucesso</label>
              <input
                type="text"
                value={newActionEvidence}
                onChange={(e) => setNewActionEvidence(e.target.value)}
                placeholder="Ex: Apresentar relatório A3 aprovado ou certidão de teste prático"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddActionForm(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Salvar Meta
              </button>
            </div>
          </form>
        )}

        {/* Lista de Metas */}
        <div className="space-y-3">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic bg-slate-50 rounded-xl border border-slate-200">
              Nenhuma ação cadastrada neste filtro.
            </div>
          ) : (
            filteredActions.map((action) => {
              const isDone = action.status === 'done';
              const isDoing = action.status === 'doing';

              const pillarBadge = 
                action.pillar === '70_practice' ? { text: '70% Prática On-the-job', color: 'bg-blue-50 text-blue-700 border-blue-200' } :
                action.pillar === '20_mentoring' ? { text: '20% Mentoria / Shadowing', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' } :
                { text: '10% Treinamento Formal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDone 
                      ? 'bg-slate-50/60 border-slate-200 opacity-75' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox interativo */}
                    <button
                      type="button"
                      onClick={() => handleToggleActionStatus(action.id, action.status)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isDoing
                          ? 'bg-purple-50 border border-purple-400 text-purple-600 animate-pulse'
                          : 'bg-slate-50 border border-slate-300 text-slate-400 hover:border-purple-500'
                      }`}
                      title="Clique para alternar o status da meta (A Fazer -> Em Andamento -> Concluído)"
                    >
                      {isDone && <Check className="w-4 h-4" />}
                      {isDoing && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillarBadge.color}`}>
                          {pillarBadge.text}
                        </span>
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          {action.skillCategory}
                        </span>
                        {isDone && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Concluído ({action.completedAt})
                          </span>
                        )}
                      </div>

                      <p className={`text-xs font-semibold text-slate-900 ${isDone ? 'line-through text-slate-400' : ''}`}>
                        {action.title}
                      </p>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                        <span>👤 Mentor/Suporte: <strong className="text-slate-700">{action.mentorOrSupport}</strong></span>
                        <span>🎯 Evidência: <span className="text-slate-600 italic">{action.evidenceCriteria}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 text-xs shrink-0">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Prazo: {action.deadline}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteAction(action.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      title="Remover meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* HISTÓRICO DE CHECK-INS & LINHA DO TEMPO DA EVOLUÇÃO */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              Linha do Tempo de Evolução & Histórico de Check-ins
            </h2>
            <p className="text-xs text-slate-500">
              Registros periódicos de acompanhamento e validação de autonomia pelo gestor.
            </p>
          </div>

          <button
            onClick={() => setIsCheckInOpen(true)}
            className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Check-in
          </button>
        </div>

        <div className="space-y-4">
          {pdi.checkIns.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic bg-slate-50 rounded-xl border border-slate-200">
              Nenhum check-in registrado ainda. Clique em <strong>"Registrar Check-in de Evolução"</strong> após realizar a conversa com o colaborador.
            </div>
          ) : (
            pdi.checkIns.map((chk, index) => (
              <div
                key={chk.id}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {pdi.checkIns.length - index}
                    </span>
                    <span className="font-bold text-xs text-slate-900">
                      Check-in de Acompanhamento ({chk.date})
                    </span>
                    <span className="text-xs text-slate-500">
                      por <strong className="text-slate-700">{chk.reviewerName}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Evolução Registrada:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                      {chk.evolutionPercent}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pt-1">
                  {chk.summary}
                </p>

                {(chk.strengthsNoticed || chk.blockersAndAdjustments) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {chk.strengthsNoticed && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="font-bold text-[11px] text-emerald-800 block mb-0.5">
                          ✓ Evoluções Notadas:
                        </span>
                        <p className="text-emerald-900 text-[11px]">{chk.strengthsNoticed}</p>
                      </div>
                    )}

                    {chk.blockersAndAdjustments && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                        <span className="font-bold text-[11px] text-amber-800 block mb-0.5">
                          ⚠️ Ajustes de Rota / Bloqueios:
                        </span>
                        <p className="text-amber-900 text-[11px]">{chk.blockersAndAdjustments}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Próximo Check-in acordado para: <strong className="text-slate-700">{chk.nextCheckInDate}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Registro de Check-in */}
      <PdiCheckInModal
        pdi={pdi}
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        onSaveCheckIn={handleSaveCheckIn}
      />
    </div>
  );
}
