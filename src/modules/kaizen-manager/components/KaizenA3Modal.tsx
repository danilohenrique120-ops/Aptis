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
}

export function KaizenA3Modal({
  project,
  isOpen,
  onClose,
  onSave
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER DO A3 */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded">
                Relatório A3 • Metodologia PDCA
              </span>
              <KaizenLevelBadge level={level} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {title}
            </h2>
            <p className="text-xs text-slate-500">
              Líder: <strong className="text-slate-700">{leaderName}</strong> • Setor: {sector} ({area})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternador de Modo: Edição vs. Preview Imprimível */}
            <div className="inline-flex rounded-xl p-1 bg-slate-200 border border-slate-300 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Formulário PDCA
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Layout A3 Clássico
              </button>
            </div>

            <button
              onClick={() => window.print()}
              title="Imprimir relatório A3"
              className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTEÚDO: MODO DE EDIÇÃO POR ABAS PDCA */}
        {viewMode === 'edit' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Abas do Ciclo PDCA */}
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 pt-3 bg-white overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActivePdcaTab('plan')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'plan'
                    ? 'border-purple-600 text-purple-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">P</span>
                1. Plan (Planejar & 5 Porquês)
              </button>

              <button
                onClick={() => setActivePdcaTab('do')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'do'
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">D</span>
                2. Do (Executar & 5W2H)
              </button>

              <button
                onClick={() => setActivePdcaTab('check')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'check'
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">C</span>
                3. Check (Verificar Resultados)
              </button>

              <button
                onClick={() => setActivePdcaTab('act')}
                className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  activePdcaTab === 'act'
                    ? 'border-amber-600 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">A</span>
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
                      <label className="block text-slate-700 font-semibold mb-1">Título do Projeto Kaizen *</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nível de Kaizen</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value as KaizenLevel)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
                      >
                        <option value="quick">⚡ Quick Kaizen (Rápido)</option>
                        <option value="standard">🛠️ Standard Kaizen</option>
                        <option value="major">🏭 Major Kaizen</option>
                        <option value="advanced">🔬 Advanced Kaizen</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Líder do Projeto</label>
                      <input
                        type="text"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Setor Fabril</label>
                      <input
                        type="text"
                        value={sector}
                        onChange={(e) => setSector(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Área / Célula / Posto</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Membros da Equipe (separados por vírgula)
                    </label>
                    <input
                      type="text"
                      value={teamMembersText}
                      onChange={(e) => setTeamMembersText(e.target.value)}
                      placeholder="Ex: Mariana Souza, Carlos Silveira, Lucas Silva"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      1. Contexto & Declaração do Problema (com dados baseline) *
                    </label>
                    <textarea
                      rows={3}
                      value={problemStatement}
                      onChange={(e) => setProblemStatement(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* CAIXA DOS 5 PORQUÊS */}
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-2.5">
                    <div className="flex items-center justify-between pb-1 border-b border-purple-200">
                      <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-purple-600" />
                        Análise de Causa Raiz (Método dos 5 Porquês da Toyota)
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-800">1º Por quê?</span>
                      <input
                        type="text"
                        value={why1}
                        onChange={(e) => setWhy1(e.target.value)}
                        placeholder="Ex: Por que a peça saiu invertida?..."
                        className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-800">2º Por quê?</span>
                      <input
                        type="text"
                        value={why2}
                        onChange={(e) => setWhy2(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-800">3º Por quê?</span>
                      <input
                        type="text"
                        value={why3}
                        onChange={(e) => setWhy3(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-800">4º Por quê?</span>
                      <input
                        type="text"
                        value={why4}
                        onChange={(e) => setWhy4(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-purple-800">5º Por quê?</span>
                      <input
                        type="text"
                        value={why5}
                        onChange={(e) => setWhy5(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-lg px-2.5 py-1.5 text-slate-800 text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-purple-200">
                      <label className="block text-purple-900 font-black text-xs mb-1">
                        🎯 Causa Raiz Conclusiva Identificada:
                      </label>
                      <input
                        type="text"
                        value={rootCause}
                        onChange={(e) => setRootCause(e.target.value)}
                        placeholder="Causa raiz fundamental a ser eliminada..."
                        className="w-full bg-white border-2 border-purple-400 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Condição Almejada (Target)</label>
                      <textarea
                        rows={2}
                        value={targetCondition}
                        onChange={(e) => setTargetCondition(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Meta SMART / KPI de Destino</label>
                      <textarea
                        rows={2}
                        value={targetKpiGoal}
                        onChange={(e) => setTargetKpiGoal(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ABA 2: DO (5W2H) */}
              {activePdcaTab === 'do' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 space-y-3">
                    <span className="font-bold text-blue-900 text-xs block">
                      Adicionar Nova Ação ao Plano 5W2H
                    </span>
                    <form onSubmit={handleAddAction} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={newActionWhat}
                          onChange={(e) => setNewActionWhat(e.target.value)}
                          placeholder="O que fazer? (Ação corretiva/contramedida)..."
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={newActionWho}
                          onChange={(e) => setNewActionWho(e.target.value)}
                          placeholder="Quem? (Responsável)"
                          className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-900 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newActionWhen}
                          onChange={(e) => setNewActionWhen(e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-xl px-2.5 py-2 text-slate-900 text-xs"
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
                    <span className="font-bold text-slate-800 text-xs block">
                      Ações do Plano ({actionPlan.length})
                    </span>
                    {actionPlan.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleActionStatus(act.id)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs transition-colors ${
                              act.status === 'done' ? 'bg-emerald-600 text-white' :
                              act.status === 'doing' ? 'bg-amber-500 text-white' :
                              'bg-slate-100 text-slate-400 border border-slate-300'
                            }`}
                          >
                            {act.status === 'done' ? '✓' : act.status === 'doing' ? '•' : '○'}
                          </button>
                          <div>
                            <span className={`font-medium text-xs ${act.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {act.what}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Responsável: <strong>{act.who}</strong> • Prazo: {act.when}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteAction(act.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
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
                    <label className="block text-slate-700 font-semibold mb-1">
                      Verificação de Resultados (Antes vs. Depois)
                    </label>
                    <textarea
                      rows={3}
                      value={verificationResults}
                      onChange={(e) => setVerificationResults(e.target.value)}
                      placeholder="Descreva o que foi medido após a implementação..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                    <div>
                      <label className="block text-emerald-900 font-semibold mb-1">
                        Economia Anual Estimada (R$)
                      </label>
                      <input
                        type="number"
                        value={savingsAnnual}
                        onChange={(e) => setSavingsAnnual(e.target.value)}
                        placeholder="Ex: 42000"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-emerald-900 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-900 font-semibold mb-1">
                        Horas Salvas por Mês (Horas de Operador)
                      </label>
                      <input
                        type="number"
                        value={hoursSavedMonthly}
                        onChange={(e) => setHoursSavedMonthly(e.target.value)}
                        placeholder="Ex: 18"
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-emerald-900 font-mono font-bold"
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
                    <label htmlFor="meta-atingida" className="text-slate-800 font-bold text-xs cursor-pointer">
                      Meta SMART do Kaizen foi plenamente atingida e comprovada
                    </label>
                  </div>
                </div>
              )}

              {/* ABA 4: ACT */}
              {activePdcaTab === 'act' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Padronização Criada / Atualizada (POP, LPO, IT de Posto)
                    </label>
                    <textarea
                      rows={3}
                      value={standardizationSummary}
                      onChange={(e) => setStandardizationSummary(e.target.value)}
                      placeholder="Identifique quais procedimentos operacionais foram atualizados..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input
                      type="checkbox"
                      id="matriz-skills"
                      checked={skillsMatrixUpdated}
                      onChange={(e) => setSkillsMatrixUpdated(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <label htmlFor="matriz-skills" className="text-slate-800 font-semibold text-xs cursor-pointer">
                      A Matriz de Habilidades (Aptis Skills) foi atualizada com o novo procedimento
                    </label>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Lições Aprendidas & Próximos Passos (Yokoten / Replicação em outras linhas)
                    </label>
                    <textarea
                      rows={3}
                      value={lessonsLearned}
                      onChange={(e) => setLessonsLearned(e.target.value)}
                      placeholder="Como essa boa prática pode ser expandida para outros postos ou turnos?..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTEÚDO: MODO DE PREVIEW CLÁSSICO A3 TOYOTA (2 COLUNAS) */}
        {viewMode === 'preview' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-100 text-xs">
            {/* Folha A3 Estilizada */}
            <div className="bg-white border-2 border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 max-w-4xl mx-auto">
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
                <KaizenLevelBadge level={level} />
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer font-semibold"
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
