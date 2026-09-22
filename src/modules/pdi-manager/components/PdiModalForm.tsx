'use client';

import React, { useState } from 'react';
import { EmployeePdi, PdiTemplate, PdiActionItem } from '../types';
import { PDI_TEMPLATES } from '../mock-data';
import { 
  X, 
  Compass, 
  Sparkles, 
  User, 
  Target, 
  Calendar, 
  Briefcase, 
  Layers, 
  Plus, 
  Trash2,
  Check
} from 'lucide-react';

interface PdiModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pdi: EmployeePdi) => void;
  existingPdi?: EmployeePdi | null;
}

export function PdiModalForm({
  isOpen,
  onClose,
  onSave,
  existingPdi
}: PdiModalFormProps) {
  const [employeeName, setEmployeeName] = useState(existingPdi?.employeeName || '');
  const [employeeRole, setEmployeeRole] = useState(existingPdi?.employeeRole || '');
  const [department, setDepartment] = useState(existingPdi?.department || 'Usinagem CNC');
  const [shift, setShift] = useState(existingPdi?.shift || 'Turno A');
  const [targetRole, setTargetRole] = useState(existingPdi?.targetRole || '');
  const [targetLevel, setTargetLevel] = useState(existingPdi?.targetLevel || 'Nível 3 (Autônomo / Multi-posto)');
  const [cycleYear, setCycleYear] = useState(existingPdi?.cycleYear || '2026 - 1º Ciclo');
  const [careerGoal, setCareerGoal] = useState(existingPdi?.careerGoal || '');
  const [startDate, setStartDate] = useState(existingPdi?.startDate || new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(() => {
    if (existingPdi?.targetEndDate) return existingPdi.targetEndDate;
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  const [strengths, setStrengths] = useState<string[]>(
    existingPdi?.strengths || ['Pontualidade e comprometimento', 'Bom relacionamento interpessoal']
  );
  const [growthGaps, setGrowthGaps] = useState<string[]>(
    existingPdi?.growthGaps || ['Autonomia em resolução de problemas técnicos', 'Postura de liderança na passagem de turno']
  );
  const [strengthInput, setStrengthInput] = useState('');
  const [gapInput, setGapInput] = useState('');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  if (!isOpen) return null;

  const handleApplyTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = PDI_TEMPLATES.find(t => t.id === tplId);
    if (!tpl) return;

    setTargetRole(tpl.targetRole);
    setCareerGoal(tpl.description);
    setStrengths(tpl.suggestedStrengths);
    setGrowthGaps(tpl.suggestedGaps);
  };

  const handleAddStrength = () => {
    if (strengthInput.trim() && !strengths.includes(strengthInput.trim())) {
      setStrengths([...strengths, strengthInput.trim()]);
      setStrengthInput('');
    }
  };

  const handleRemoveStrength = (index: number) => {
    setStrengths(strengths.filter((_, i) => i !== index));
  };

  const handleAddGap = () => {
    if (gapInput.trim() && !growthGaps.includes(gapInput.trim())) {
      setGrowthGaps([...growthGaps, gapInput.trim()]);
      setGapInput('');
    }
  };

  const handleRemoveGap = (index: number) => {
    setGrowthGaps(growthGaps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !targetRole.trim()) return;

    let initialActions: PdiActionItem[] = existingPdi?.actions || [];

    // Se é novo e selecionou um template, gera ações iniciais baseadas no template
    if (!existingPdi && selectedTemplateId) {
      const tpl = PDI_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (tpl && tpl.suggestedActions) {
        const now = new Date();
        initialActions = tpl.suggestedActions.map((act, index) => {
          const deadlineDate = new Date();
          deadlineDate.setDate(now.getDate() + act.deadlineDays);

          return {
            id: `act-${Date.now()}-${index}`,
            title: act.title,
            pillar: act.pillar,
            skillCategory: act.skillCategory,
            status: 'todo',
            deadline: deadlineDate.toISOString().split('T')[0],
            mentorOrSupport: act.mentorOrSupport,
            evidenceCriteria: act.evidenceCriteria
          };
        });
      }
    }

    const savedPdi: EmployeePdi = {
      id: existingPdi?.id || `pdi-${Date.now()}`,
      tenantId: existingPdi?.tenantId || 'tenant-1',
      employeeId: existingPdi?.employeeId || `emp-${Date.now()}`,
      employeeName: employeeName.trim(),
      employeeRole: employeeRole.trim() || 'Operador de Produção',
      department,
      shift,
      currentLevel: existingPdi?.currentLevel || 'Operador I',
      targetRole: targetRole.trim(),
      targetLevel,
      cycleYear,
      status: existingPdi?.status || 'in_progress',
      progressPercent: existingPdi?.progressPercent || 0,
      startDate,
      targetEndDate,
      careerGoal: careerGoal.trim(),
      strengths,
      growthGaps,
      actions: initialActions,
      checkIns: existingPdi?.checkIns || [],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSave(savedPdi);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {existingPdi ? 'Editar Plano de Desenvolvimento (PDI)' : 'Criar Novo PDI de Colaborador'}
              </h3>
              <p className="text-xs text-slate-400">
                Estruturação de metas, forças e acompanhamento de evolução profissional.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Templates Rápidos (Apenas na criação) */}
          {!existingPdi && (
            <div className="p-3.5 bg-slate-950 rounded-xl border border-purple-900/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Modelos Prontos de Chão de Fábrica (Opcional):
                </span>
                <span className="text-[10px] text-slate-500">Clique para auto-preencher</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PDI_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTemplateId === tpl.id
                        ? 'bg-purple-950/40 border-purple-500 text-purple-200'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[11px] leading-tight mb-1">{tpl.title}</div>
                      <p className="text-[10px] text-slate-400 line-clamp-2">{tpl.description}</p>
                    </div>
                    {selectedTemplateId === tpl.id && (
                      <span className="mt-2 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Modelo Selecionado
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dados do Colaborador */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              1. Identificação do Colaborador
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome Completo do Colaborador *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Ex: José Carlos Nascimento"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cargo Atual na Fábrica *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value)}
                    placeholder="Ex: Operador de Torno CNC II"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Setor / Departamento</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Usinagem CNC">Usinagem CNC</option>
                  <option value="Estamparia & Prensas">Estamparia & Prensas</option>
                  <option value="Linha de Montagem">Linha de Montagem</option>
                  <option value="Pintura Industrial">Pintura Industrial</option>
                  <option value="Manutenção & Ferramentaria">Manutenção & Ferramentaria</option>
                  <option value="Logística & Expedição">Logística & Expedição</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Turno de Trabalho</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="Turno A">Turno A (Manhã)</option>
                  <option value="Turno B">Turno B (Tarde/Noite)</option>
                  <option value="Turno C">Turno C (Madrugada)</option>
                  <option value="Horário Central">Horário Central / Administrativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Objetivo do PDI e Prazos */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              2. Objetivo Estratégico & Ciclo de Desenvolvimento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cargo / Posição Almejada *</label>
                <div className="relative">
                  <Target className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Ex: Operador Líder de Turno"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ciclo / Semestre</label>
                <input
                  type="text"
                  value={cycleYear}
                  onChange={(e) => setCycleYear(e.target.value)}
                  placeholder="Ex: 2026 - 1º Ciclo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Data de Início</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Data Almejada para Homologação</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={(e) => setTargetEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Propósito / Objetivo Central de Carreira & Benefício para a Operação
              </label>
              <textarea
                rows={2}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="Explique onde o colaborador quer chegar e como isso fortalecerá a fábrica..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Diagnóstico: Forças e Gaps */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1">
              3. Diagnóstico de Competências (Forças vs. Gaps)
            </h4>

            {/* Forças Atuais */}
            <div>
              <label className="block text-emerald-400 font-semibold mb-1">
                Pontos Fortes & Competências Já Consolidadas
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={strengthInput}
                  onChange={(e) => setStrengthInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddStrength(); }}}
                  placeholder="Ex: Pontualidade britânica, zelo com ferramentas..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="px-3 py-2 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 text-[11px]"
                  >
                    <span>{str}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStrength(idx)}
                      className="text-emerald-400 hover:text-emerald-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Gaps de Desenvolvimento */}
            <div>
              <label className="block text-amber-400 font-semibold mb-1">
                Gaps de Desenvolvimento Prioritários (O que precisa evoluir)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={gapInput}
                  onChange={(e) => setGapInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGap(); }}}
                  placeholder="Ex: Habilidade de comunicação, autonomia em setups..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddGap}
                  className="px-3 py-2 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold hover:bg-amber-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {growthGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-800/50 text-[11px]"
                  >
                    <span>{gap}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGap(idx)}
                      className="text-amber-400 hover:text-amber-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              {existingPdi ? 'Salvar Alterações' : 'Criar PDI com Metas 70-20-10'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
