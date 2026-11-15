'use client';

import React, { useState } from 'react';
import { KaizenProject, KaizenA3Data, A3ActionItem, KaizenLevel } from '../types';
import { KaizenLevelBadge } from './KaizenLevelBadge';
import { 
  X, 
  FileText, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  HelpCircle,
  Clock,
  DollarSign,
  Building2,
  Users
} from 'lucide-react';

interface KaizenA3ModalProps {
  project: KaizenProject;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProject: KaizenProject) => void;
  tintedGlass?: boolean;
}

export function KaizenA3Modal({
  project,
  isOpen,
  onClose,
  onSave,
  tintedGlass = false
}: KaizenA3ModalProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [activePdcaTab, setActivePdcaTab] = useState<'plan' | 'do' | 'check' | 'act'>('plan');

  // Dados do A3
  const [title, setTitle] = useState(project.title);
  const [level, setLevel] = useState<KaizenLevel>(project.level);
  const [leaderName, setLeaderName] = useState(project.leaderName);
  const [sector, setSector] = useState(project.sector);
  const [area, setArea] = useState(project.area);
  const [teamMembersText, setTeamMembersText] = useState(project.teamMembers.join(', '));

  // P - Plan
  const [background, setBackground] = useState(project.a3.background);
  const [problemStatement, setProblemStatement] = useState(project.a3.problemStatement);
  const [currentCondition, setCurrentCondition] = useState(project.a3.currentCondition);
  const [targetCondition, setTargetCondition] = useState(project.a3.targetCondition);
  const [targetKpiGoal, setTargetKpiGoal] = useState(project.a3.targetKpiGoal);

  // 5 Porquês
  const [why1, setWhy1] = useState(project.a3.fiveWhys.why1);
  const [why2, setWhy2] = useState(project.a3.fiveWhys.why2);
  const [why3, setWhy3] = useState(project.a3.fiveWhys.why3);
  const [why4, setWhy4] = useState(project.a3.fiveWhys.why4);
  const [why5, setWhy5] = useState(project.a3.fiveWhys.why5);
  const [rootCause, setRootCause] = useState(project.a3.fiveWhys.rootCause);

  // D - Do
  const [actionPlan, setActionPlan] = useState<A3ActionItem[]>(project.a3.actionPlan);
  const [newActionWhat, setNewActionWhat] = useState('');
  const [newActionWho, setNewActionWho] = useState('');
  const [newActionWhen, setNewActionWhen] = useState('');

  // C - Check
  const [verificationResults, setVerificationResults] = useState(project.a3.verificationResults);
  const [savingsAnnual, setSavingsAnnual] = useState(project.a3.savingsAnnual.toString());
  const [hoursSavedMonthly, setHoursSavedMonthly] = useState(project.a3.hoursSavedMonthly.toString());
  const [isTargetAchieved, setIsTargetAchieved] = useState(project.a3.isTargetAchieved);

  // A - Act
  const [standardizationSummary, setStandardizationSummary] = useState(project.a3.standardizationSummary);
  const [skillsMatrixUpdated, setSkillsMatrixUpdated] = useState(project.a3.skillsMatrixUpdated);
  const [lessonsLearned, setLessonsLearned] = useState(project.a3.lessonsLearned);

  if (!isOpen) return null;

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionWhat.trim()) return;

    const newAction: A3ActionItem = {
      id: `act-${Date.now()}`,
      what: newActionWhat.trim(),
      who: newActionWho.trim() || leaderName,
      when: newActionWhen || new Date().toISOString().split('T')[0],
      status: 'todo'
    };

    setActionPlan([...actionPlan, newAction]);
    setNewActionWhat('');
    setNewActionWho('');
    setNewActionWhen('');
  };

  const handleToggleActionStatus = (actionId: string) => {
    setActionPlan(actionPlan.map(a => {
      if (a.id === actionId) {
        const next = a.status === 'todo' ? 'doing' : a.status === 'doing' ? 'done' : 'todo';
        return { ...a, status: next };
      }
      return a;
    }));
  };

  const handleDeleteAction = (actionId: string) => {
    setActionPlan(actionPlan.filter(a => a.id !== actionId));
  };

  const handleSaveAll = () => {
    const updatedA3: KaizenA3Data = {
      background,
      problemStatement,
      currentCondition,
      targetCondition,
      targetKpiGoal,
      fiveWhys: {
        why1,
        why2,
        why3,
        why4,
        why5,
        rootCause
      },
      actionPlan,
      verificationResults,
      savingsAnnual: Number(savingsAnnual) || 0,
      hoursSavedMonthly: Number(hoursSavedMonthly) || 0,
      isTargetAchieved,
      standardizationSummary,
      skillsMatrixUpdated,
      lessonsLearned
    };

    const team = teamMembersText
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);

    const updatedProject: KaizenProject = {
      ...project,
      title,
      level,
      sector,
      area,
      leaderName,
      teamMembers: team,
      estimatedSavingsAnnual: Number(savingsAnnual) || 0,
      hoursSavedMonthly: Number(hoursSavedMonthly) || 0,
      a3: updatedA3
    };

    onSave(updatedProject);
    onClose();
  };

  const inputClass = tintedGlass
    ? 'w-full aptis-glass-input rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none'
    : 'w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500';

  const labelClass = `block font-semibold mb-1 ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className={`rounded-3xl border shadow-2xl w-full max-w-5xl overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 ${
        tintedGlass
          ? 'aptis-glass-modal border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* HEADER DO A3 */}
        <div className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                tintedGlass
                  ? 'text-purple-300 bg-purple-500/20 border-purple-500/35'
                  : 'text-purple-700 bg-purple-100 border-purple-200'
              }`}>
                Relatório A3 • Metodologia PDCA
              </span>
              <KaizenLevelBadge level={level} tintedGlass={tintedGlass} />
            </div>
            <h2 className={`text-base sm:text-lg font-black leading-snug ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h2>
            <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Líder: <strong className={tintedGlass ? 'text-white' : 'text-slate-700'}>{leaderName}</strong> • Setor: {sector} ({area})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador de Modo: Edição vs. Preview Imprimível */}
            <div className={`inline-flex rounded-xl p-1 border text-xs font-semibold ${
              tintedGlass ? 'bg-slate-950/70 border-white/10' : 'bg-slate-200 border-slate-300'
            }`}>
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'edit'
                    ? (tintedGlass ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                    : (tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600')
                }`}
              >
                Formulário PDCA
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'preview'
                    ? (tintedGlass ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-900 shadow-xs')
                    : (tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600')
                }`}
              >
                Layout A3 Clássico
              </button>
            </div>

            <button
              onClick={() => window.print()}
              title="Imprimir relatório A3"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                tintedGlass
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                tintedGlass
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTEÚDO: MODO DE EDIÇÃO POR ABAS PDCA */}
        {viewMode === 'edit' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Abas do Ciclo PDCA */}
            <div className={`flex items-center gap-2 border-b px-5 pt-3 overflow-x-auto text-xs font-bold ${
              tintedGlass ? 'border-white/10 bg-slate-950/40' : 'border-slate-200 bg-white'
            }`}>
              <button
                onClick={() => setActivePdcaTab('plan')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'plan'
                    ? (tintedGlass ? 'border-purple-400 text-purple-300' : 'border-purple-600 text-purple-700')
                    : (tintedGlass ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800')
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  tintedGlass ? 'bg-purple-500/25 text-purple-300' : 'bg-purple-100 text-purple-700'
                }`}>P</span>
                1. Plan (Planejar & 5 Porquês)
              </button>

              <button
                onClick={() => setActivePdcaTab('do')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'do'
                    ? (tintedGlass ? 'border-blue-400 text-blue-300' : 'border-blue-600 text-blue-700')
                    : (tintedGlass ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800')
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  tintedGlass ? 'bg-blue-500/25 text-blue-300' : 'bg-blue-100 text-blue-700'
                }`}>D</span>
                2. Do (Executar & 5W2H)
              </button>

              <button
                onClick={() => setActivePdcaTab('check')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'check'
                    ? (tintedGlass ? 'border-emerald-400 text-emerald-300' : 'border-emerald-600 text-emerald-700')
                    : (tintedGlass ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800')
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  tintedGlass ? 'bg-emerald-500/25 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                }`}>C</span>
                3. Check (Verificar Resultados)
              </button>

              <button
                onClick={() => setActivePdcaTab('act')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'act'
                    ? (tintedGlass ? 'border-amber-400 text-amber-300' : 'border-amber-600 text-amber-700')
                    : (tintedGlass ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800')
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  tintedGlass ? 'bg-amber-500/25 text-amber-300' : 'bg-amber-100 text-amber-700'
                }`}>A</span>
                4. Act (Padronizar & Agir)
              </button>
            </div>

            {/* Painéis das Abas */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* ABA 1: PLAN */}
              {activePdcaTab === 'plan' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className={labelClass}>Título do Projeto Kaizen *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`${inputClass} font-medium`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nível de Kaizen</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as KaizenLevel)}
                        className={`${inputClass} font-bold`}
                      >
                        <option value="quick" className="bg-slate-900 text-white">⚡ Quick Kaizen (Rápido)</option>
                        <option value="standard" className="bg-slate-900 text-white">🛠️ Standard Kaizen</option>
                        <option value="major" className="bg-slate-900 text-white">🏭 Major Kaizen</option>
                        <option value="advanced" className="bg-slate-900 text-white">🔬 Advanced Kaizen</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Líder do Projeto</label>
                      <input
                        type="text"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Setor Fabril</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Área / Célula / Posto</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Membros da Equipe (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={teamMembersText}
                      onChange={(e) => setTeamMembersText(e.target.value)}
                      placeholder="Ex: Mariana Souza, Carlos Silveira, Lucas Silva"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      1. Contexto & Declaração do Problema (com dados baseline) *
                    </label>
                    <textarea
                      rows={3}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* CAIXA DOS 5 PORQUÊS */}
                  <div className={`p-4 rounded-2xl border space-y-2.5 ${
                    tintedGlass
                      ? 'bg-purple-950/35 border-purple-500/30'
                      : 'bg-purple-50/50 border-purple-200'
                  }`}>
                    <div className={`flex items-center justify-between pb-1 border-b ${
                      tintedGlass ? 'border-purple-500/25' : 'border-purple-200'
                    }`}>
                      <span className={`font-bold text-xs flex items-center gap-1.5 ${
                        tintedGlass ? 'text-purple-200' : 'text-purple-900'
                      }`}>
                        <HelpCircle className={`w-4 h-4 ${tintedGlass ? 'text-purple-400' : 'text-purple-600'}`} />
                        Análise de Causa Raiz (Método dos 5 Porquês da Toyota)
                      </span>
                    </div>

                    {[
                      { label: '1º Por quê?', val: why1, set: setWhy1, ph: 'Ex: Por que a peça saiu invertida?...' },
                      { label: '2º Por quê?', val: why2, set: setWhy2, ph: '' },
                      { label: '3º Por quê?', val: why3, set: setWhy3, ph: '' },
                      { label: '4º Por quê?', val: why4, set: setWhy4, ph: '' },
                      { label: '5º Por quê?', val: why5, set: setWhy5, ph: '' },
                    ].map((item, idx) => (
                      <div key={idx}>
                        <span className={`text-[10px] font-bold ${tintedGlass ? 'text-purple-300' : 'text-purple-800'}`}>{item.label}</span>
                        <input
                          type="text"
                          value={item.val}
                          onChange={(e) => item.set(e.target.value)}
                          placeholder={item.ph}
                          className={`w-full rounded-lg px-2.5 py-1.5 text-xs ${
                            tintedGlass
                              ? 'aptis-glass-input text-white placeholder-slate-400'
                              : 'bg-white border border-purple-200 text-slate-800'
                          }`}
                        />
                      </div>
                    ))}

                    <div className={`pt-2 border-t ${tintedGlass ? 'border-purple-500/25' : 'border-purple-200'}`}>
                      <label className={`block font-black text-xs mb-1 ${tintedGlass ? 'text-purple-200' : 'text-purple-900'}`}>
                        🎯 Causa Raiz Conclusiva Identificada:
                      </label>
                      <input
                        type="text"
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        placeholder="Causa raiz fundamental a ser eliminada..."
                        className={`w-full rounded-xl px-3 py-2 font-bold text-xs ${
                          tintedGlass
                            ? 'bg-slate-900/90 border-2 border-purple-500/60 text-white'
                            : 'bg-white border-2 border-purple-400 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Condição Almejada (Target)</label>
                      <textarea
                        rows={2}
                        value={targetCondition}
                        onChange={(e) => setTargetCondition(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Meta SMART / KPI de Destino</label>
                      <textarea
                        rows={2}
                        value={targetKpiGoal}
                        onChange={(e) => setTargetKpiGoal(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: DO (5W2H) */}
              {activePdcaTab === 'do' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    tintedGlass ? 'bg-blue-950/35 border-blue-500/30' : 'bg-blue-50/50 border-blue-200'
                  }`}>
                    <span className={`font-bold text-xs block ${tintedGlass ? 'text-blue-200' : 'text-blue-900'}`}>
                      Adicionar Nova Ação ao Plano 5W2H
                    </span>
                    <form onSubmit={handleAddAction} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={newActionWhat}
                          onChange={(e) => setNewActionWhat(e.target.value)}
                          placeholder="O que fazer? (Ação corretiva/contramedida)..."
                          className={inputClass}
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newActionWho}
                          onChange={(e) => setNewActionWho(e.target.value)}
                          placeholder="Quem? (Responsável)"
                          className={inputClass}
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newActionWhen}
                          onChange={(e) => setNewActionWhen(e.target.value)}
                          className={inputClass}
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Lista de Ações 5W2H */}
                  <div className="space-y-2">
                    <span className={`font-bold text-xs block ${tintedGlass ? 'text-slate-200' : 'text-slate-800'}`}>
                      Ações do Plano ({actionPlan.length})
                    </span>
                    {actionPlan.map((act) => (
                      <div
                        key={act.id}
                        className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${
                          tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActionStatus(act.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors cursor-pointer ${
                              act.status === 'done' ? 'bg-emerald-600 text-white' :
                              act.status === 'doing' ? 'bg-amber-500 text-white' :
                              (tintedGlass ? 'bg-slate-800 text-slate-400 border border-white/15' : 'bg-slate-100 text-slate-400 border border-slate-300')
                            }`}
                          >
                            {act.status === 'done' ? '✓' : act.status === 'doing' ? '•' : '○'}
                          </button>
                          <div>
                            <span className={`font-medium text-xs ${
                              act.status === 'done'
                                ? 'line-through text-slate-400'
                                : (tintedGlass ? 'text-white' : 'text-slate-800')
                            }`}>
                              {act.what}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Responsável: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{act.who}</strong> • Prazo: {act.when}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAction(act.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA 3: CHECK */}
              {activePdcaTab === 'check' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className={labelClass}>
                      Verificação de Resultados (Antes vs. Depois)
                    </label>
                    <textarea
                      rows={3}
                      value={verificationResults}
                      onChange={(e) => setVerificationResults(e.target.value)}
                      placeholder="Descreva o que foi medido após a implementação..."
                      className={inputClass}
                    />
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border ${
                    tintedGlass ? 'bg-emerald-950/35 border-emerald-500/30' : 'bg-emerald-50/50 border-emerald-200'
                  }`}>
                    <div>
                      <label className={`block font-semibold mb-1 ${tintedGlass ? 'text-emerald-200' : 'text-emerald-900'}`}>
                        Economia Anual Estimada (R$)
                      </label>
                      <input
                        type="number"
                        value={savingsAnnual}
                        onChange={(e) => setSavingsAnnual(e.target.value)}
                        placeholder="Ex: 42000"
                        className={`w-full rounded-xl px-3 py-2 font-mono font-bold ${
                          tintedGlass
                            ? 'aptis-glass-input text-emerald-300'
                            : 'bg-white border border-emerald-300 text-emerald-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block font-semibold mb-1 ${tintedGlass ? 'text-emerald-200' : 'text-emerald-900'}`}>
                        Horas Salvas por Mês (Horas de Operador)
                      </label>
                      <input
                        type="number"
                        value={hoursSavedMonthly}
                        onChange={(e) => setHoursSavedMonthly(e.target.value)}
                        placeholder="Ex: 18"
                        className={`w-full rounded-xl px-3 py-2 font-mono font-bold ${
                          tintedGlass
                            ? 'aptis-glass-input text-emerald-300'
                            : 'bg-white border border-emerald-300 text-emerald-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="meta-atingida"
                      checked={isTargetAchieved}
                      onChange={(e) => setIsTargetAchieved(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="meta-atingida" className={`font-bold text-xs cursor-pointer ${tintedGlass ? 'text-slate-200' : 'text-slate-800'}`}>
                      Meta SMART do Kaizen foi plenamente atingida e comprovada
                    </label>
                  </div>
                </div>
              )}

              {/* ABA 4: ACT */}
              {activePdcaTab === 'act' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className={labelClass}>
                      Padronização Criada / Atualizada (POP, LPO, IT de Posto)
                    </label>
                    <textarea
                      rows={3}
                      value={standardizationSummary}
                      onChange={(e) => setStandardizationSummary(e.target.value)}
                      placeholder="Identifique quais procedimentos operacionais foram atualizados..."
                      className={inputClass}
                    />
                  </div>

                  <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                    tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="checkbox"
                      id="matriz-skills"
                      checked={skillsMatrixUpdated}
                      onChange={(e) => setSkillsMatrixUpdated(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <label htmlFor="matriz-skills" className={`font-semibold text-xs cursor-pointer ${tintedGlass ? 'text-slate-200' : 'text-slate-800'}`}>
                      A Matriz de Habilidades (Aptis Skills) foi atualizada com o novo procedimento
                    </label>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Lições Aprendidas & Próximos Passos (Yokoten / Replicação em outras linhas)
                    </label>
                    <textarea
                      rows={3}
                      value={lessonsLearned}
                      onChange={(e) => setLessonsLearned(e.target.value)}
                      placeholder="Como essa boa prática pode ser expandida para outros postos ou turnos?..."
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTEÚDO: MODO DE PREVIEW CLÁSSICO A3 TOYOTA (2 COLUNAS) */}
        {viewMode === 'preview' && (
          <div className={`flex-1 overflow-y-auto p-5 space-y-4 text-xs ${
            tintedGlass ? 'bg-slate-950/60' : 'bg-slate-100'
          }`}>
            {/* Folha A3 Estilizada (sempre fundo claro para impressão executiva A3) */}
            <div className="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-4xl mx-auto text-slate-900">
              {/* Cabeçalho A3 */}
              <div className="border-b-2 border-slate-800 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    TOYOTA PRODUCTION SYSTEM • RELATÓRIO A3 DE PROJETO KAIZEN
                  </span>
                  <h1 className="text-xl font-black text-slate-900">{title}</h1>
                  <div className="flex items-center gap-3 text-slate-600 text-[11px] mt-1">
                    <span>Líder: <strong>{leaderName}</strong></span>
                    <span>Setor: <strong>{sector} - {area}</strong></span>
                    <span>Data: <strong>{project.createdAt}</strong></span>
                  </div>
                </div>
                <KaizenLevelBadge level={level} tintedGlass={false} />
              </div>

              {/* Grid A3 de 2 Colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LADO ESQUERDO: P - PLAN (PLANEJAR) */}
                <div className="space-y-4 pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-slate-300 pb-4 md:pb-0">
                  <div className="border-b border-purple-200 pb-1">
                    <span className="font-black text-purple-900 uppercase text-[11px] flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-purple-700 text-white inline-flex items-center justify-center text-[10px]">P</span>
                      1. Contexto & Declaração do Problema
                    </span>
                    <p className="text-slate-700 text-[11px] mt-1 leading-relaxed">
                      {problemStatement || 'Problema não especificado.'}
                    </p>
                  </div>

                  <div className="border-b border-purple-200 pb-1">
                    <span className="font-black text-purple-900 uppercase text-[11px]">
                      2. Causa Raiz (5 Porquês)
                    </span>
                    <div className="bg-purple-50 p-2.5 rounded-lg text-[10px] text-purple-900 space-y-1 mt-1 font-mono">
                      {why1 && <div>1. {why1}</div>}
                      {why2 && <div>2. {why2}</div>}
                      {why3 && <div>3. {why3}</div>}
                      {why4 && <div>4. {why4}</div>}
                      {why5 && <div>5. {why5}</div>}
                      <div className="font-bold text-purple-950 pt-1 border-t border-purple-200">
                        🎯 Causa Raiz: {rootCause || 'Em análise'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-black text-purple-900 uppercase text-[11px]">
                      3. Condição Almejada & Meta SMART
                    </span>
                    <p className="text-slate-700 text-[11px] mt-1">
                      {targetCondition || 'Meta não especificada.'}
                    </p>
                    {targetKpiGoal && (
                      <span className="inline-block px-2 py-0.5 mt-1 bg-purple-100 text-purple-800 font-bold rounded text-[10px]">
                        KPI: {targetKpiGoal}
                      </span>
                    )}
                  </div>
                </div>

                {/* LADO DIREITO: D - DO, C - CHECK, A - ACT */}
                <div className="space-y-4">
                  {/* DO */}
                  <div className="border-b border-blue-200 pb-2">
                    <span className="font-black text-blue-900 uppercase text-[11px] flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-blue-700 text-white inline-flex items-center justify-center text-[10px]">D</span>
                      4. Plano de Ação (5W2H)
                    </span>
                    <div className="space-y-1.5 mt-1.5">
                      {actionPlan.map(a => (
                        <div key={a.id} className="flex items-center justify-between text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span>{a.status === 'done' ? '✅' : '⏳'} {a.what}</span>
                          <span className="text-slate-500 font-mono">{a.who}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CHECK */}
                  <div className="border-b border-emerald-200 pb-2">
                    <span className="font-black text-emerald-900 uppercase text-[11px] flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-emerald-700 text-white inline-flex items-center justify-center text-[10px]">C</span>
                      5. Verificação de Ganhos
                    </span>
                    <p className="text-slate-700 text-[11px] mt-1">{verificationResults}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      {Number(savingsAnnual) > 0 && (
                        <span className="font-bold text-emerald-700 font-mono">
                          Economia: R$ {Number(savingsAnnual).toLocaleString('pt-BR')}/ano
                        </span>
                      )}
                      {Number(hoursSavedMonthly) > 0 && (
                        <span className="font-bold text-blue-700 font-mono">
                          {hoursSavedMonthly}h salvas/mês
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACT */}
                  <div>
                    <span className="font-black text-amber-900 uppercase text-[11px] flex items-center gap-1">
                      <span className="w-4 h-4 rounded bg-amber-700 text-white inline-flex items-center justify-center text-[10px]">A</span>
                      6. Padronização & Lições Aprendidas
                    </span>
                    <p className="text-slate-700 text-[11px] mt-1">{standardizationSummary}</p>
                    <p className="text-slate-500 text-[10px] italic mt-1">{lessonsLearned}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER COM BOTÕES */}
        <div className={`p-4 border-t flex items-center justify-end gap-2 text-xs ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 cursor-pointer font-semibold ${
              tintedGlass ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Salvar Relatório A3
          </button>
        </div>
      </div>
    </div>
  );
}
