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
  tintedGlass?: boolean;
  onBack: () => void;
  onUpdatePdi: (updated: EmployeePdi) => void;
  onEditPdi?: (pdi: EmployeePdi) => void;
  onDeletePdi?: (pdiId: string) => void;
  onExportPdiPdf?: (pdi: EmployeePdi) => void;
}

export function PdiDetailView({
  pdi,
  tintedGlass = true,
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

  const pillarTabs: {
    id: 'all' | LearningPillar;
    label: string;
    count: number;
    beadGradient: string;
    glowColor: string;
  }[] = [
    {
      id: 'all',
      label: 'Todas as Metas',
      count: pdi.actions.length,
      beadGradient: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
      glowColor: 'rgba(6, 182, 212, 0.5)'
    },
    {
      id: '70_practice',
      label: '70% Prática On-the-Job',
      count: count70,
      beadGradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
      glowColor: 'rgba(59, 130, 246, 0.5)'
    },
    {
      id: '20_mentoring',
      label: '20% Mentoria / Troca',
      count: count20,
      beadGradient: 'linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)',
      glowColor: 'rgba(139, 92, 246, 0.5)'
    },
    {
      id: '10_courses',
      label: '10% Cursos & Formação',
      count: count10,
      beadGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      glowColor: 'rgba(16, 185, 129, 0.5)'
    }
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Top Bar de Navegação & Identificação do PDI em Liquid Glass */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 space-y-5 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none blur-[90px] opacity-25"
          style={{
            background:
              'radial-gradient(circle, rgba(37, 99, 235, 0.85) 0%, rgba(6, 182, 212, 0.4) 60%, transparent 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              onClick={onBack}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-slate-200 hover:text-white hover:border-cyan-400/40'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Voltar para a lista de colaboradores"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  className={`text-xl sm:text-2xl font-black tracking-tight ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {pdi.employeeName}
                </h1>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-bold border ${
                    tintedGlass
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {pdi.shift} • {pdi.department}
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Cargo Atual:{' '}
                <strong className={tintedGlass ? 'text-white' : 'text-slate-800'}>
                  {pdi.employeeRole}
                </strong>{' '}
                ({pdi.currentLevel})
              </p>
            </div>
          </div>

          {/* Botões de Ação no Topo do PDI: Dossiê PDF, Editar PDI, Excluir PDI e Registrar Check-in */}
          <div className="flex flex-wrap items-center gap-2">
            {onExportPdiPdf && (
              <button
                type="button"
                onClick={() => onExportPdiPdf(pdi)}
                className={`px-3.5 py-2 border font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  tintedGlass
                    ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-400/35'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 shadow-2xs'
                }`}
                title="Visualizar Dossiê Inteligente e Baixar PDI em PDF para Evidência"
              >
                <FileCheck2 className="w-4 h-4" />
                Dossiê / Baixar PDF
              </button>
            )}

            {onEditPdi && (
              <button
                type="button"
                onClick={() => onEditPdi(pdi)}
                className={`px-3.5 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                  tintedGlass
                    ? 'aptis-glass-subcard text-slate-200 hover:text-white hover:border-cyan-400/40'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                }`}
                title="Editar dados gerais deste PDI"
              >
                <Edit3 className={`w-3.5 h-3.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                Editar PDI
              </button>
            )}

            {onDeletePdi && (
              <button
                type="button"
                onClick={() => onDeletePdi(pdi.id)}
                className={`px-3.5 py-2 border font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  tintedGlass
                    ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-400/30'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
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
              className="px-4 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer border border-white/25"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow:
                  '0 0 20px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35)'
              }}
            >
              <TrendingUp className="w-4 h-4" />
              Registrar Check-in de Evolução
            </button>
          </div>
        </div>

        {/* Sub-cápsulas de Foco Estratégico & Barra de Progresso */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t text-xs ${
            tintedGlass ? 'border-white/10' : 'border-slate-200/80'
          }`}
        >
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-blue-50/50 border border-blue-100'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                tintedGlass
                  ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300'
                  : 'bg-blue-100 border-blue-200 text-blue-700'
              }`}
            >
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`text-[10px] uppercase font-bold ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Objetivo Almejado (Meta de Carreira)
              </span>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                {pdi.targetRole}
              </div>
              <div
                className={`text-[11px] font-medium ${
                  tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                }`}
              >
                {pdi.targetLevel}
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl flex items-start gap-3 ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white border border-slate-200'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                tintedGlass
                  ? 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`text-[10px] uppercase font-bold ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Ciclo & Prazo de Homologação
              </span>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                {pdi.cycleYear}
              </div>
              <div
                className={`text-[11px] font-mono ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Meta: {pdi.targetEndDate}
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl flex flex-col justify-between ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white border border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] uppercase font-bold flex items-center gap-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                <Award className={`w-3.5 h-3.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                Evolução Geral do PDI
              </span>
              <span
                className={`text-sm font-mono font-black ${
                  tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                }`}
              >
                {pdi.progressPercent}%
              </span>
            </div>
            <div
              className={`w-full h-2.5 rounded-full overflow-hidden mt-2 ${
                tintedGlass ? 'bg-slate-950/80 border border-white/5' : 'bg-slate-200'
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, pdi.progressPercent))}%`,
                  background: 'linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)',
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.5)'
                }}
              />
            </div>
            <div
              className={`text-[10px] mt-1.5 flex justify-between ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>
                {pdi.actions.filter(a => a.status === 'done').length} de {pdi.actions.length} metas
                concluídas
              </span>
              <span>{pdi.checkIns.length} check-ins realizados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnóstico de Competências: Forças vs. Gaps (COM ADICIONAR, EDITAR E EXCLUIR) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Forças */}
        <div
          className={`rounded-3xl p-5 space-y-3.5 transition-all ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2.5 border-b ${
              tintedGlass ? 'border-white/10' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <h3
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                Pontos Fortes Consolidados (Alavancas)
              </h3>
            </div>
            <span className={`text-[10px] ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`}>
              {pdi.strengths.length} itens
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {pdi.strengths.map((str, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium ${
                  tintedGlass
                    ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {editingStrengthIndex === idx ? (
                  <>
                    <input
                      type="text"
                      value={editingStrengthValue}
                      onChange={e => setEditingStrengthValue(e.target.value)}
                      className={`rounded px-1.5 py-0.5 text-xs w-40 focus:outline-none border ${
                        tintedGlass
                          ? 'bg-slate-900 border-emerald-400 text-white'
                          : 'bg-white border-emerald-400 text-slate-900'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveStrengthEdit(idx)}
                      className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingStrengthIndex(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
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
                      className="opacity-70 hover:opacity-100 cursor-pointer ml-0.5"
                      title="Editar ponto forte"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteStrength(idx)}
                      className="opacity-70 hover:text-rose-400 hover:opacity-100 cursor-pointer"
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
              className={`flex-1 text-xs rounded-xl px-3.5 py-2 focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-emerald-500'
              }`}
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Incluir
            </button>
          </form>
        </div>

        {/* Gaps de Desenvolvimento */}
        <div
          className={`rounded-3xl p-5 space-y-3.5 transition-all ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-2.5 border-b ${
              tintedGlass ? 'border-white/10' : 'border-slate-100'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <h3
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  tintedGlass ? 'text-amber-300' : 'text-amber-700'
                }`}
              >
                Gaps Críticos a Desenvolver (Oportunidades)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">{pdi.growthGaps.length} itens</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {pdi.growthGaps.map((gap, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium ${
                  tintedGlass
                    ? 'bg-amber-500/15 text-amber-200 border-amber-400/30'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {editingGapIndex === idx ? (
                  <>
                    <input
                      type="text"
                      value={editingGapValue}
                      onChange={e => setEditingGapValue(e.target.value)}
                      className={`rounded px-1.5 py-0.5 text-xs w-40 focus:outline-none border ${
                        tintedGlass
                          ? 'bg-slate-900 border-amber-400 text-white'
                          : 'bg-white border-amber-400 text-slate-900'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveGapEdit(idx)}
                      className="text-amber-400 hover:text-amber-200 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGapIndex(null)}
                      className="text-slate-400 hover:text-white cursor-pointer"
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
                      className="opacity-70 hover:opacity-100 cursor-pointer ml-0.5"
                      title="Editar gap"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteGap(idx)}
                      className="opacity-70 hover:text-rose-400 hover:opacity-100 cursor-pointer"
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
              className={`flex-1 text-xs rounded-xl px-3.5 py-2 focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-amber-500'
              }`}
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Incluir
            </button>
          </form>
        </div>
      </div>

      {/* PAINEL DE AÇÕES 70-20-10 COM BARRA MENISCUS LIQUID BEAD */}
      <div
        className={`rounded-3xl p-6 space-y-5 transition-all ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b ${
            tintedGlass ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div>
            <h2
              className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
              Plano de Ação Estruturado (Metodologia 70-20-10)
            </h2>
            <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Ações práticas na fábrica (70%), mentoria/troca (20%) e cursos teóricos (10%).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Meniscus Liquid Bead Bar para os Pilares 70-20-10 */}
            <div className="aptis-meniscus-track flex items-center gap-1 p-1 rounded-full overflow-x-auto">
              {pillarTabs.map(tab => {
                const isActive = selectedPillarFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedPillarFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    style={
                      isActive
                        ? {
                            background: tab.beadGradient,
                            boxShadow: `0 0 18px ${tab.glowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.55)`
                          }
                        : undefined
                    }
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowAddActionForm(!showAddActionForm)}
              className="px-4 py-2 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/25 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)'
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Meta 70-20-10
            </button>
          </div>
        </div>

        {/* Formulário Inline de Nova Ação */}
        {showAddActionForm && (
          <form
            onSubmit={handleAddAction}
            className={`p-5 rounded-2xl border space-y-3.5 animate-in fade-in duration-150 text-xs ${
              tintedGlass
                ? 'aptis-glass-subcard border-cyan-400/30'
                : 'bg-slate-50 border-blue-200'
            }`}
          >
            <div
              className={`font-bold text-xs flex items-center gap-1.5 ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Meta Prática ao PDI
            </div>

            <div>
              <label
                className={`block mb-1 font-semibold ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Título / Descrição da Meta Prática *
              </label>
              <input
                type="text"
                value={newActionTitle}
                onChange={e => setNewActionTitle(e.target.value)}
                placeholder="Ex: Liderar resolução de problema A3 na Linha 02..."
                className={`w-full rounded-xl px-3.5 py-2 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input'
                    : 'bg-white border border-slate-300 text-slate-900 focus:border-blue-500'
                }`}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Pilar 70-20-10
                </label>
                <select
                  value={newActionPillar}
                  onChange={e => setNewActionPillar(e.target.value as LearningPillar)}
                  className={`w-full rounded-xl px-2.5 py-2 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="70_practice" className="bg-slate-900 text-white">
                    70% Prática On-the-job
                  </option>
                  <option value="20_mentoring" className="bg-slate-900 text-white">
                    20% Mentoria / Troca
                  </option>
                  <option value="10_courses" className="bg-slate-900 text-white">
                    10% Capacitação Formal
                  </option>
                </select>
              </div>

              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Categoria de Competência
                </label>
                <input
                  type="text"
                  value={newActionCategory}
                  onChange={e => setNewActionCategory(e.target.value)}
                  placeholder="Ex: SMED, Qualidade, Liderança"
                  className={`w-full rounded-xl px-2.5 py-2 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Tutor / Mentor de Suporte
                </label>
                <input
                  type="text"
                  value={newActionMentor}
                  onChange={e => setNewActionMentor(e.target.value)}
                  placeholder="Ex: Danilo (Gestor) ou Engenharia"
                  className={`w-full rounded-xl px-2.5 py-2 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block mb-1 font-semibold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Data Limite
                </label>
                <input
                  type="date"
                  value={newActionDeadline}
                  onChange={e => setNewActionDeadline(e.target.value)}
                  className={`w-full rounded-xl px-2.5 py-2 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block mb-1 font-semibold ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Critério de Evidência / Sucesso
              </label>
              <input
                type="text"
                value={newActionEvidence}
                onChange={e => setNewActionEvidence(e.target.value)}
                placeholder="Ex: Apresentar relatório A3 aprovado ou certidão de teste prático"
                className={`w-full rounded-xl px-3.5 py-2 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input'
                    : 'bg-white border border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddActionForm(false)}
                className={`px-3.5 py-1.5 rounded-xl cursor-pointer ${
                  tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-white font-bold rounded-xl cursor-pointer border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)'
                }}
              >
                Salvar Meta
              </button>
            </div>
          </form>
        )}

        {/* Lista de Metas */}
        <div className="space-y-3">
          {filteredActions.length === 0 ? (
            <div
              className={`p-8 text-center italic rounded-2xl border ${
                tintedGlass
                  ? 'bg-slate-950/40 border-white/10 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
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
                      color: tintedGlass
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/35'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }
                  : action.pillar === '20_mentoring'
                  ? {
                      text: '20% Mentoria / Shadowing',
                      color: tintedGlass
                        ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/35'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }
                  : {
                      text: '10% Treinamento Formal',
                      color: tintedGlass
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    };

              return (
                <div
                  key={action.id}
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                    tintedGlass
                      ? `aptis-glass-subcard aptis-glass-subcard-interactive ${
                          isDone ? 'opacity-75' : ''
                        }`
                      : `border ${
                          isDone
                            ? 'bg-slate-50/70 border-slate-200 opacity-75'
                            : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 shadow-2xs'
                        }`
                  }`}
                >
                  {isEditingThis ? (
                    <div className="space-y-3 text-xs">
                      <div
                        className={`flex items-center justify-between border-b pb-2 ${
                          tintedGlass ? 'border-white/10' : 'border-slate-100'
                        }`}
                      >
                        <span
                          className={`font-bold ${
                            tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                          }`}
                        >
                          Editar Meta 70-20-10
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingActionId(null)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label
                          className={`block font-semibold mb-1 ${
                            tintedGlass ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          Título da Meta
                        </label>
                        <input
                          type="text"
                          value={editActionTitle}
                          onChange={e => setEditActionTitle(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2 font-semibold ${
                            tintedGlass
                              ? 'aptis-glass-input'
                              : 'bg-slate-50 border border-slate-300 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div>
                          <label
                            className={`block font-semibold mb-1 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            Pilar
                          </label>
                          <select
                            value={editActionPillar}
                            onChange={e => setEditActionPillar(e.target.value as LearningPillar)}
                            className={`w-full rounded-xl px-2.5 py-1.5 ${
                              tintedGlass
                                ? 'aptis-glass-input'
                                : 'bg-slate-50 border border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="70_practice" className="bg-slate-900 text-white">
                              70% Prática
                            </option>
                            <option value="20_mentoring" className="bg-slate-900 text-white">
                              20% Mentoria
                            </option>
                            <option value="10_courses" className="bg-slate-900 text-white">
                              10% Cursos
                            </option>
                          </select>
                        </div>

                        <div>
                          <label
                            className={`block font-semibold mb-1 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            Categoria
                          </label>
                          <input
                            type="text"
                            value={editActionCategory}
                            onChange={e => setEditActionCategory(e.target.value)}
                            className={`w-full rounded-xl px-2.5 py-1.5 ${
                              tintedGlass
                                ? 'aptis-glass-input'
                                : 'bg-slate-50 border border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block font-semibold mb-1 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            Mentor / Suporte
                          </label>
                          <input
                            type="text"
                            value={editActionMentor}
                            onChange={e => setEditActionMentor(e.target.value)}
                            className={`w-full rounded-xl px-2.5 py-1.5 ${
                              tintedGlass
                                ? 'aptis-glass-input'
                                : 'bg-slate-50 border border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block font-semibold mb-1 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            Prazo
                          </label>
                          <input
                            type="date"
                            value={editActionDeadline}
                            onChange={e => setEditActionDeadline(e.target.value)}
                            className={`w-full rounded-xl px-2.5 py-1.5 ${
                              tintedGlass
                                ? 'aptis-glass-input'
                                : 'bg-slate-50 border border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="sm:col-span-2">
                          <label
                            className={`block font-semibold mb-1 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            Critério de Evidência
                          </label>
                          <input
                            type="text"
                            value={editActionEvidence}
                            onChange={e => setEditActionEvidence(e.target.value)}
                            className={`w-full rounded-xl px-3 py-1.5 ${
                              tintedGlass
                                ? 'aptis-glass-input'
                                : 'bg-slate-50 border border-slate-300 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block font-semibold mb-1 ${
                              tintedGlass ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            Status
                          </label>
                          <select
                            value={editActionStatus}
                            onChange={e =>
                              setEditActionStatus(e.target.value as PdiActionItem['status'])
                            }
                            className={`w-full rounded-xl px-2.5 py-1.5 font-semibold ${
                              tintedGlass
                                ? 'aptis-glass-input'
                                : 'bg-slate-50 border border-slate-300 text-slate-900'
                            }`}
                          >
                            <option value="todo" className="bg-slate-900 text-white">
                              A Fazer
                            </option>
                            <option value="doing" className="bg-slate-900 text-white">
                              Em Andamento
                            </option>
                            <option value="done" className="bg-slate-900 text-white">
                              Concluído
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingActionId(null)}
                          className={`px-3 py-1.5 font-bold rounded-xl cursor-pointer ${
                            tintedGlass
                              ? 'bg-white/10 text-slate-200 hover:bg-white/15'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveActionEdit(action.id)}
                          className="px-4 py-1.5 text-white font-bold rounded-xl cursor-pointer"
                          style={{
                            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)'
                          }}
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
                              ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : isDoing
                              ? tintedGlass
                                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 animate-pulse'
                                : 'bg-blue-50 border border-blue-400 text-blue-600 animate-pulse'
                              : tintedGlass
                              ? 'bg-slate-900/70 border border-white/20 text-slate-400 hover:border-cyan-400'
                              : 'bg-slate-50 border border-slate-300 text-slate-400 hover:border-blue-500'
                          }`}
                          title="Clique para alternar o status da meta (A Fazer -> Em Andamento -> Concluído)"
                        >
                          {isDone && <Check className="w-4 h-4" />}
                          {isDoing && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pillarBadge.color}`}
                            >
                              {pillarBadge.text}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded border font-medium ${
                                tintedGlass
                                  ? 'bg-white/5 text-slate-300 border-white/10'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {action.skillCategory}
                            </span>
                            {isDone && (
                              <span
                                className={`text-[10px] font-bold flex items-center gap-1 ${
                                  tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                                }`}
                              >
                                <CheckCircle2 className="w-3 h-3" /> Concluído ({action.completedAt})
                              </span>
                            )}
                          </div>

                          <p
                            className={`text-xs font-bold ${
                              isDone
                                ? 'line-through text-slate-400'
                                : tintedGlass
                                ? 'text-white'
                                : 'text-slate-900'
                            }`}
                          >
                            {action.title}
                          </p>

                          <div
                            className={`text-[11px] flex flex-wrap items-center gap-3 pt-0.5 ${
                              tintedGlass ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            <span>
                              👤 Mentor/Suporte:{' '}
                              <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>
                                {action.mentorOrSupport}
                              </strong>
                            </span>
                            <span>
                              🎯 Evidência:{' '}
                              <span
                                className={`italic ${
                                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                                }`}
                              >
                                {action.evidenceCriteria}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-0 text-xs shrink-0 ${
                          tintedGlass ? 'border-white/10' : 'border-slate-100'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-mono flex items-center gap-1 mr-1 ${
                            tintedGlass ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          Prazo: {action.deadline}
                        </span>

                        <button
                          type="button"
                          onClick={() => startEditingAction(action)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            tintedGlass
                              ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                              : 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'
                          }`}
                          title="Editar esta meta"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAction(action.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            tintedGlass
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          }`}
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

      {/* HISTÓRICO DE CHECK-INS & LINHA DO TEMPO DA EVOLUÇÃO */}
      <div
        className={`rounded-3xl p-6 space-y-4 transition-all ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            tintedGlass ? 'border-white/10' : 'border-slate-100'
          }`}
        >
          <div>
            <h2
              className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              <TrendingUp className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
              Linha do Tempo de Evolução & Histórico de Check-ins
            </h2>
            <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Registros periódicos de acompanhamento e validação de autonomia pelo gestor.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingCheckIn(null);
              setIsCheckInOpen(true);
            }}
            className={`px-3.5 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              tintedGlass
                ? 'bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 border-cyan-400/35'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Check-in
          </button>
        </div>

        <div className="space-y-4">
          {pdi.checkIns.length === 0 ? (
            <div
              className={`p-8 text-center italic rounded-2xl border ${
                tintedGlass
                  ? 'bg-slate-950/40 border-white/10 text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              Nenhum check-in registrado ainda. Clique em{' '}
              <strong>&quot;Registrar Check-in de Evolução&quot;</strong> após realizar a conversa
              com o colaborador.
            </div>
          ) : (
            pdi.checkIns.map((chk, index) => (
              <div
                key={chk.id}
                className={`p-4 rounded-2xl space-y-2.5 relative transition-all ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-6 h-6 rounded-full border flex items-center justify-center font-bold text-xs ${
                        tintedGlass
                          ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                          : 'bg-blue-100 border-blue-200 text-blue-700'
                      }`}
                    >
                      {pdi.checkIns.length - index}
                    </span>
                    <span
                      className={`font-bold text-xs ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Check-in de Acompanhamento ({chk.date})
                    </span>
                    <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      por{' '}
                      <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>
                        {chk.reviewerName}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      Evolução Registrada:
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                        tintedGlass
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                          : 'bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {chk.evolutionPercent}%
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingCheckIn(chk);
                        setIsCheckInOpen(true);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/10'
                          : 'text-slate-400 hover:text-blue-700 hover:bg-blue-100'
                      }`}
                      title="Editar este Check-in"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteCheckIn(chk.id)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title="Excluir este Check-in"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p
                  className={`text-xs leading-relaxed pt-1 ${
                    tintedGlass ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {chk.summary}
                </p>

                {(chk.strengthsNoticed || chk.blockersAndAdjustments) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                    {chk.strengthsNoticed && (
                      <div
                        className={`p-3 border rounded-xl ${
                          tintedGlass
                            ? 'bg-emerald-500/10 border-emerald-400/25 text-emerald-200'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}
                      >
                        <span
                          className={`font-bold text-[11px] block mb-0.5 ${
                            tintedGlass ? 'text-emerald-300' : 'text-emerald-800'
                          }`}
                        >
                          ✓ Evoluções Notadas:
                        </span>
                        <p className="text-[11px]">{chk.strengthsNoticed}</p>
                      </div>
                    )}

                    {chk.blockersAndAdjustments && (
                      <div
                        className={`p-3 border rounded-xl ${
                          tintedGlass
                            ? 'bg-amber-500/10 border-amber-400/25 text-amber-200'
                            : 'bg-amber-50 border-amber-200 text-amber-900'
                        }`}
                      >
                        <span
                          className={`font-bold text-[11px] block mb-0.5 ${
                            tintedGlass ? 'text-amber-300' : 'text-amber-800'
                          }`}
                        >
                          ⚠️ Ajustes de Rota / Bloqueios:
                        </span>
                        <p className="text-[11px]">{chk.blockersAndAdjustments}</p>
                      </div>
                    )}
                  </div>
                )}

                <div
                  className={`pt-2 border-t flex items-center justify-between text-[11px] ${
                    tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  <span>
                    Próximo Check-in acordado para:{' '}
                    <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>
                      {chk.nextCheckInDate}
                    </strong>
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
