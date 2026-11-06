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
  Trash2, 
  Edit3, 
  X,
  FileCheck2
} from 'lucide-react';

interface PdiDetailViewProps {
  pdi: EmployeePdi;
  onBack: () => void;
  onUpdatePdi: (updated: EmployeePdi) => void;
  onEditPdi?: (pdi: EmployeePdi) => void;
  onDeletePdi?: (pdiId: string) => void;
  onExportPdiPdf?: (pdi: EmployeePdi) => void;
}

export function PdiDetailView({
  pdi,
  onBack,
  onUpdatePdi,
  onEditPdi,
  onDeletePdi,
  onExportPdiPdf
}: PdiDetailViewProps) {
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState<PdiCheckIn | null>(null);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState<'all' | LearningPillar>('all');
  const [showAddActionForm, setShowAddActionForm] = useState(false);

  // Edição e adição rápida de Forças e Gaps direto na tela
  const [newStrengthText, setNewStrengthText] = useState('');
  const [editingStrengthIndex, setEditingStrengthIndex] = useState<number | null>(null);
  const [editingStrengthValue, setEditingStrengthValue] = useState('');

  const [newGapText, setNewGapText] = useState('');
  const [editingGapIndex, setEditingGapIndex] = useState<number | null>(null);
  const [editingGapValue, setEditingGapValue] = useState('');

  // Form de nova ação 70-20-10
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

  // Estado de edição inline de uma Meta 70-20-10 existente
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editActionTitle, setEditActionTitle] = useState('');
  const [editActionPillar, setEditActionPillar] = useState<LearningPillar>('70_practice');
  const [editActionCategory, setEditActionCategory] = useState('');
  const [editActionMentor, setEditActionMentor] = useState('');
  const [editActionDeadline, setEditActionDeadline] = useState('');
  const [editActionEvidence, setEditActionEvidence] = useState('');
  const [editActionStatus, setEditActionStatus] = useState<PdiActionItem['status']>('todo');

  // Handlers de Forças (Strengths)
  const handleAddStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrengthText.trim()) return;
    onUpdatePdi({
      ...pdi,
      strengths: [...pdi.strengths, newStrengthText.trim()],
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setNewStrengthText('');
  };

  const handleSaveStrengthEdit = (idx: number) => {
    if (!editingStrengthValue.trim()) return;
    const updated = pdi.strengths.map((s, i) => (i === idx ? editingStrengthValue.trim() : s));
    onUpdatePdi({
      ...pdi,
      strengths: updated,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setEditingStrengthIndex(null);
    setEditingStrengthValue('');
  };

  const handleDeleteStrength = (idx: number) => {
    onUpdatePdi({
      ...pdi,
      strengths: pdi.strengths.filter((_, i) => i !== idx),
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  // Handlers de Gaps (Growth Gaps)
  const handleAddGap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGapText.trim()) return;
    onUpdatePdi({
      ...pdi,
      growthGaps: [...pdi.growthGaps, newGapText.trim()],
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setNewGapText('');
  };

  const handleSaveGapEdit = (idx: number) => {
    if (!editingGapValue.trim()) return;
    const updated = pdi.growthGaps.map((g, i) => (i === idx ? editingGapValue.trim() : g));
    onUpdatePdi({
      ...pdi,
      growthGaps: updated,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setEditingGapIndex(null);
    setEditingGapValue('');
  };

  const handleDeleteGap = (idx: number) => {
    onUpdatePdi({
      ...pdi,
      growthGaps: pdi.growthGaps.filter((_, i) => i !== idx),
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  // Adicionar Ação 70-20-10
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
    const autoProgress =
      totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : pdi.progressPercent;

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

  // Iniciar Edição de Ação 70-20-10
  const startEditingAction = (action: PdiActionItem) => {
    setEditingActionId(action.id);
    setEditActionTitle(action.title);
    setEditActionPillar(action.pillar);
    setEditActionCategory(action.skillCategory);
    setEditActionMentor(action.mentorOrSupport);
    setEditActionDeadline(action.deadline);
    setEditActionEvidence(action.evidenceCriteria);
    setEditActionStatus(action.status);
  };

  // Salvar Edição de Ação 70-20-10
  const handleSaveActionEdit = (actionId: string) => {
    if (!editActionTitle.trim()) return;

    const updatedActions = pdi.actions.map(act => {
      if (act.id === actionId) {
        return {
          ...act,
          title: editActionTitle.trim(),
          pillar: editActionPillar,
          skillCategory: editActionCategory.trim() || 'Geral',
          mentorOrSupport: editActionMentor.trim() || 'Gestor',
          deadline: editActionDeadline,
          evidenceCriteria: editActionEvidence.trim() || 'Validação prática',
          status: editActionStatus,
          completedAt:
            editActionStatus === 'done'
              ? act.completedAt || new Date().toISOString().split('T')[0]
              : undefined
        };
      }
      return act;
    });

    const totalActions = updatedActions.length;
    const completedActions = updatedActions.filter(a => a.status === 'done').length;
    const autoProgress =
      totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : pdi.progressPercent;

    onUpdatePdi({
      ...pdi,
      actions: updatedActions,
      progressPercent: autoProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });

    setEditingActionId(null);
  };

  // Alternar Status da Ação
  const handleToggleActionStatus = (actionId: string, currentStatus: PdiActionItem['status']) => {
    const nextStatus: PdiActionItem['status'] =
      currentStatus === 'todo'
        ? 'doing'
        : currentStatus === 'doing'
        ? 'done'
        : currentStatus === 'done'
        ? 'todo'
        : 'doing';

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
    const autoProgress =
      totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : pdi.progressPercent;

    onUpdatePdi({
      ...pdi,
      actions: updatedActions,
      progressPercent: autoProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  // Excluir Ação
  const handleDeleteAction = (actionId: string) => {
    if (!window.confirm('Deseja realmente excluir esta meta do PDI?')) return;
    const updatedActions = pdi.actions.filter(a => a.id !== actionId);
    const totalActions = updatedActions.length;
    const completedActions = updatedActions.filter(a => a.status === 'done').length;
    const autoProgress =
      totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : pdi.progressPercent;

    onUpdatePdi({
      ...pdi,
      actions: updatedActions,
      progressPercent: autoProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  // Salvar ou Atualizar Check-in
  const handleSaveCheckIn = (checkIn: PdiCheckIn, newProgress: number) => {
    const exists = pdi.checkIns.some(c => c.id === checkIn.id);
    const updatedCheckIns = exists
      ? pdi.checkIns.map(c => (c.id === checkIn.id ? checkIn : c))
      : [checkIn, ...pdi.checkIns];

    onUpdatePdi({
      ...pdi,
      checkIns: updatedCheckIns,
      progressPercent: newProgress,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setEditingCheckIn(null);
  };

  // Excluir Check-in
  const handleDeleteCheckIn = (checkInId: string) => {
    if (!window.confirm('Deseja realmente excluir este registro de Check-in?')) return;
    const updatedCheckIns = pdi.checkIns.filter(c => c.id !== checkInId);
    onUpdatePdi({
      ...pdi,
      checkIns: updatedCheckIns,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  const filteredActions =
    selectedPillarFilter === 'all'
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
              <div className="flex items-center gap-2 flex-wrap">
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

          {/* Botões de Ação no Topo do PDI: Dossiê PDF, Editar PDI, Excluir PDI e Registrar Check-in */}
          <div className="flex flex-wrap items-center gap-2">
            {onExportPdiPdf && (
              <button
                type="button"
                onClick={() => onExportPdiPdf(pdi)}
                className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Visualizar Dossiê Inteligente e Baixar PDI em PDF para Evidência"
              >
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                Dossiê / Baixar PDF
              </button>
            )}

            {onEditPdi && (
              <button
                type="button"
                onClick={() => onEditPdi(pdi)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Editar dados gerais deste PDI"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                Editar PDI
              </button>
            )}

            {onDeletePdi && (
              <button
                type="button"
                onClick={() => onDeletePdi(pdi.id)}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Excluir este PDI"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir PDI
              </button>
            )}

            <button
              onClick={() => {
                setEditingCheckIn(null);
                setIsCheckInOpen(true);
              }}
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
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Objetivo Almejado (Meta de Carreira)
              </span>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{pdi.targetRole}</div>
              <div className="text-[11px] text-purple-700 font-medium">{pdi.targetLevel}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Ciclo & Prazo de Homologação
              </span>
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
              <span>
                {pdi.actions.filter(a => a.status === 'done').length} de {pdi.actions.length} metas concluídas
              </span>
              <span>{pdi.checkIns.length} check-ins realizados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnóstico de Competências: Forças vs. Gaps (COM ADICIONAR, EDITAR E EXCLUIR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Forças */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Pontos Fortes Consolidados (Alavancas)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">{pdi.strengths.length} itens</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {pdi.strengths.map((str, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium"
              >
                {editingStrengthIndex === idx ? (
                  <>
                    <input
                      type="text"
                      value={editingStrengthValue}
                      onChange={e => setEditingStrengthValue(e.target.value)}
                      className="bg-white border border-emerald-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-40 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveStrengthEdit(idx)}
                      className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStrengthIndex(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>✓ {str}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStrengthIndex(idx);
                        setEditingStrengthValue(str);
                      }}
                      className="text-emerald-600/70 hover:text-emerald-950 cursor-pointer ml-0.5"
                      title="Editar ponto forte"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStrength(idx)}
                      className="text-emerald-600/70 hover:text-rose-600 cursor-pointer"
                      title="Excluir ponto forte"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </span>
            ))}
          </div>

          <form onSubmit={handleAddStrength} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Adicionar novo ponto forte..."
              value={newStrengthText}
              onChange={e => setNewStrengthText(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Incluir
            </button>
          </form>
        </div>

        {/* Gaps de Desenvolvimento */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Gaps Críticos a Desenvolver (Oportunidades)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">{pdi.growthGaps.length} itens</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {pdi.growthGaps.map((gap, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium"
              >
                {editingGapIndex === idx ? (
                  <>
                    <input
                      type="text"
                      value={editingGapValue}
                      onChange={e => setEditingGapValue(e.target.value)}
                      className="bg-white border border-amber-400 rounded px-1.5 py-0.5 text-xs text-slate-900 w-40 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGapEdit(idx)}
                      className="text-amber-700 hover:text-amber-950 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGapIndex(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>🎯 {gap}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGapIndex(idx);
                        setEditingGapValue(gap);
                      }}
                      className="text-amber-600/70 hover:text-amber-950 cursor-pointer ml-0.5"
                      title="Editar gap"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGap(idx)}
                      className="text-amber-600/70 hover:text-rose-600 cursor-pointer"
                      title="Excluir gap"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                )}
              </span>
            ))}
          </div>

          <form onSubmit={handleAddGap} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Adicionar novo gap a desenvolver..."
              value={newGapText}
              onChange={e => setNewGapText(e.target.value)}
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Incluir
            </button>
          </form>
        </div>
      </div>

      {/* PAINEL DE AÇÕES 70-20-10 (COM EDITAR E EXCLUIR) */}
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedPillarFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
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
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
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
          <form
            onSubmit={handleAddAction}
            className="p-4 bg-slate-50 rounded-xl border border-purple-200 space-y-3 animate-in fade-in duration-150 text-xs"
          >
            <div className="font-bold text-purple-700 text-xs flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Adicionar Meta ao PDI
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">
                Título / Descrição da Meta Prática *
              </label>
              <input
                type="text"
                value={newActionTitle}
                onChange={e => setNewActionTitle(e.target.value)}
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
                  onChange={e => setNewActionPillar(e.target.value as LearningPillar)}
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
                  onChange={e => setNewActionCategory(e.target.value)}
                  placeholder="Ex: SMED, Qualidade, Liderança"
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Tutor / Mentor de Suporte</label>
                <input
                  type="text"
                  value={newActionMentor}
                  onChange={e => setNewActionMentor(e.target.value)}
                  placeholder="Ex: Danilo (Gestor) ou Engenharia"
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-semibold">Data Limite</label>
                <input
                  type="date"
                  value={newActionDeadline}
                  onChange={e => setNewActionDeadline(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-semibold">
                Critério de Evidência / Sucesso
              </label>
              <input
                type="text"
                value={newActionEvidence}
                onChange={e => setNewActionEvidence(e.target.value)}
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
            filteredActions.map(action => {
              const isDone = action.status === 'done';
              const isDoing = action.status === 'doing';
              const isEditingThis = editingActionId === action.id;

              const pillarBadge =
                action.pillar === '70_practice'
                  ? {
                      text: '70% Prática On-the-job',
                      color: 'bg-blue-50 text-blue-700 border-blue-200'
                    }
                  : action.pillar === '20_mentoring'
                  ? {
                      text: '20% Mentoria / Shadowing',
                      color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }
                  : {
                      text: '10% Treinamento Formal',
                      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    };

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isDone
                      ? 'bg-slate-50/60 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {isEditingThis ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-purple-700">Editar Meta 70-20-10</span>
                        <button
                          type="button"
                          onClick={() => setEditingActionId(null)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">Título da Meta</label>
                        <input
                          type="text"
                          value={editActionTitle}
                          onChange={e => setEditActionTitle(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Pilar</label>
                          <select
                            value={editActionPillar}
                            onChange={e => setEditActionPillar(e.target.value as LearningPillar)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900"
                          >
                            <option value="70_practice">70% Prática</option>
                            <option value="20_mentoring">20% Mentoria</option>
                            <option value="10_courses">10% Cursos</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Categoria</label>
                          <input
                            type="text"
                            value={editActionCategory}
                            onChange={e => setEditActionCategory(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Mentor / Suporte</label>
                          <input
                            type="text"
                            value={editActionMentor}
                            onChange={e => setEditActionMentor(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Prazo</label>
                          <input
                            type="date"
                            value={editActionDeadline}
                            onChange={e => setEditActionDeadline(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label className="block text-slate-600 font-semibold mb-1">
                            Critério de Evidência
                          </label>
                          <input
                            type="text"
                            value={editActionEvidence}
                            onChange={e => setEditActionEvidence(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Status</label>
                          <select
                            value={editActionStatus}
                            onChange={e =>
                              setEditActionStatus(e.target.value as PdiActionItem['status'])
                            }
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold"
                          >
                            <option value="todo">A Fazer</option>
                            <option value="doing">Em Andamento</option>
                            <option value="done">Concluído</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingActionId(null)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveActionEdit(action.id)}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl cursor-pointer"
                        >
                          Salvar Alterações
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
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
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pillarBadge.color}`}
                            >
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

                          <p
                            className={`text-xs font-semibold text-slate-900 ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {action.title}
                          </p>

                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3 pt-0.5">
                            <span>
                              👤 Mentor/Suporte:{' '}
                              <strong className="text-slate-700">{action.mentorOrSupport}</strong>
                            </span>
                            <span>
                              🎯 Evidência:{' '}
                              <span className="text-slate-600 italic">{action.evidenceCriteria}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 text-xs shrink-0">
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mr-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Prazo: {action.deadline}
                        </span>

                        <button
                          type="button"
                          onClick={() => startEditingAction(action)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                          title="Editar esta meta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAction(action.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir esta meta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* HISTÓRICO DE CHECK-INS & LINHA DO TEMPO DA EVOLUÇÃO (COM EDITAR E EXCLUIR) */}
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
            onClick={() => {
              setEditingCheckIn(null);
              setIsCheckInOpen(true);
            }}
            className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Check-in
          </button>
        </div>

        <div className="space-y-4">
          {pdi.checkIns.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic bg-slate-50 rounded-xl border border-slate-200">
              Nenhum check-in registrado ainda. Clique em{' '}
              <strong>"Registrar Check-in de Evolução"</strong> após realizar a conversa com o
              colaborador.
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

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCheckIn(chk);
                        setIsCheckInOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                      title="Editar este Check-in"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCheckIn(chk.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Excluir este Check-in"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed pt-1">{chk.summary}</p>

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
                  <span>
                    Próximo Check-in acordado para:{' '}
                    <strong className="text-slate-700">{chk.nextCheckInDate}</strong>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Registro / Edição de Check-in */}
      <PdiCheckInModal
        pdi={pdi}
        isOpen={isCheckInOpen}
        existingCheckIn={editingCheckIn}
        onClose={() => {
          setIsCheckInOpen(false);
          setEditingCheckIn(null);
        }}
        onSaveCheckIn={handleSaveCheckIn}
      />
    </div>
  );
}
