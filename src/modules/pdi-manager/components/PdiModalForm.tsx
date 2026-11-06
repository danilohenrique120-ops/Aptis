'use client';

import React, { useState, useEffect } from 'react';
import { EmployeePdi, PdiActionItem } from '../types';
import { PDI_TEMPLATES } from '../mock-data';
import { 
  X, 
  Compass, 
  Sparkles, 
  User, 
  Target, 
  Calendar, 
  Briefcase, 
  Plus, 
  Check,
  Edit3
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
  const [employeeName, setEmployeeName] = useState('');
  const [employeeRole, setEmployeeRole] = useState('');
  const [currentLevel, setCurrentLevel] = useState('Pleno / N2');
  const [department, setDepartment] = useState('Usinagem CNC');
  const [shift, setShift] = useState('Turno A');
  const [targetRole, setTargetRole] = useState('');
  const [targetLevel, setTargetLevel] = useState('Nível 3 (Autônomo / Multi-posto)');
  const [cycleYear, setCycleYear] = useState('2026 - 1º Ciclo');
  const [careerGoal, setCareerGoal] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetEndDate, setTargetEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  const [strengths, setStrengths] = useState<string[]>([
    'Pontualidade e comprometimento',
    'Bom relacionamento interpessoal'
  ]);
  const [growthGaps, setGrowthGaps] = useState<string[]>([
    'Autonomia em resolução de problemas técnicos',
    'Postura de liderança na passagem de turno'
  ]);
  const [strengthInput, setStrengthInput] = useState('');
  const [gapInput, setGapInput] = useState('');
  const [editingStrengthIdx, setEditingStrengthIdx] = useState<number | null>(null);
  const [editingStrengthText, setEditingStrengthText] = useState('');
  const [editingGapIdx, setEditingGapIdx] = useState<number | null>(null);
  const [editingGapText, setEditingGapText] = useState('');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Sincroniza os campos sempre que o modal abre ou quando muda o PDI em edição
  useEffect(() => {
    if (!isOpen) return;
    if (existingPdi) {
      setEmployeeName(existingPdi.employeeName || '');
      setEmployeeRole(existingPdi.employeeRole || '');
      setCurrentLevel(existingPdi.currentLevel || 'Pleno / N2');
      setDepartment(existingPdi.department || 'Usinagem CNC');
      setShift(existingPdi.shift || 'Turno A');
      setTargetRole(existingPdi.targetRole || '');
      setTargetLevel(existingPdi.targetLevel || 'Nível 3 (Autônomo / Multi-posto)');
      setCycleYear(existingPdi.cycleYear || '2026 - 1º Ciclo');
      setCareerGoal(existingPdi.careerGoal || '');
      setStartDate(existingPdi.startDate || new Date().toISOString().split('T')[0]);
      setTargetEndDate(existingPdi.targetEndDate || new Date().toISOString().split('T')[0]);
      setStrengths(existingPdi.strengths || []);
      setGrowthGaps(existingPdi.growthGaps || []);
      setSelectedTemplateId('');
    } else {
      setEmployeeName('');
      setEmployeeRole('');
      setCurrentLevel('Operador I');
      setDepartment('Usinagem CNC');
      setShift('Turno A');
      setTargetRole('');
      setTargetLevel('Nível 3 (Autônomo / Multi-posto)');
      setCycleYear('2026 - 1º Ciclo');
      setCareerGoal('');
      setStartDate(new Date().toISOString().split('T')[0]);
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setTargetEndDate(d.toISOString().split('T')[0]);
      setStrengths(['Pontualidade e comprometimento', 'Bom relacionamento interpessoal']);
      setGrowthGaps([
        'Autonomia em resolução de problemas técnicos',
        'Postura de liderança na passagem de turno'
      ]);
      setSelectedTemplateId('');
    }
    setStrengthInput('');
    setGapInput('');
    setEditingStrengthIdx(null);
    setEditingGapIdx(null);
  }, [isOpen, existingPdi]);

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

  const handleSaveStrengthEdit = (idx: number) => {
    if (!editingStrengthText.trim()) return;
    setStrengths(strengths.map((s, i) => (i === idx ? editingStrengthText.trim() : s)));
    setEditingStrengthIdx(null);
    setEditingStrengthText('');
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

  const handleSaveGapEdit = (idx: number) => {
    if (!editingGapText.trim()) return;
    setGrowthGaps(growthGaps.map((g, i) => (i === idx ? editingGapText.trim() : g)));
    setEditingGapIdx(null);
    setEditingGapText('');
  };

  const handleRemoveGap = (index: number) => {
    setGrowthGaps(growthGaps.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim() || !targetRole.trim()) return;

    let initialActions: PdiActionItem[] = existingPdi?.actions || [];

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
      department: department.trim() || 'Operações',
      shift,
      currentLevel: currentLevel.trim() || 'Operador I',
      targetRole: targetRole.trim(),
      targetLevel: targetLevel.trim() || 'Nível 3',
      cycleYear: cycleYear.trim() || '2026',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="aptis-glass-modal rounded-3xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
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
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[78vh] overflow-y-auto">
          {/* Templates Rápidos (Apenas na criação) */}
          {!existingPdi && (
            <div className="p-4 aptis-glass-subcard rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Modelos Prontos de Chão de Fábrica (Opcional):
                </span>
                <span className="text-[10px] text-slate-400">Clique para auto-preencher</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PDI_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTemplateId === tpl.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/60 border-white/10 hover:border-cyan-400/40 text-slate-300'
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
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-white/10 pb-1.5">
              1. Identificação do Colaborador
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome Completo do Colaborador *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={employeeName}
                    onChange={e => setEmployeeName(e.target.value)}
                    placeholder="Ex: José Carlos Nascimento"
                    className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cargo Atual *</label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={employeeRole}
                    onChange={e => setEmployeeRole(e.target.value)}
                    placeholder="Ex: Operador de Torno CNC II"
                    className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Setor / Departamento</label>
                <input
                  type="text"
                  list="pdi-departments-list"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="Digite ou selecione o setor..."
                  className="w-full aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                />
                <datalist id="pdi-departments-list">
                  <option value="Usinagem CNC" />
                  <option value="Estamparia & Prensas" />
                  <option value="Linha de Montagem" />
                  <option value="Pintura Industrial" />
                  <option value="Manutenção & Ferramentaria" />
                  <option value="Logística & Expedição" />
                </datalist>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Turno de Trabalho</label>
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value)}
                  className="w-full aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="Turno A" className="bg-slate-900 text-white">Turno A (Manhã)</option>
                  <option value="Turno B" className="bg-slate-900 text-white">Turno B (Tarde/Noite)</option>
                  <option value="Turno C" className="bg-slate-900 text-white">Turno C (Madrugada)</option>
                  <option value="Horário Central" className="bg-slate-900 text-white">Horário Central / Administrativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Objetivo do PDI e Prazos */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-white/10 pb-1.5">
              2. Objetivo Estratégico & Ciclo de Desenvolvimento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cargo / Posição Almejada *</label>
                <div className="relative">
                  <Target className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    placeholder="Ex: Operador Líder de Turno"
                    className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nível Almejado</label>
                <input
                  type="text"
                  value={targetLevel}
                  onChange={e => setTargetLevel(e.target.value)}
                  placeholder="Ex: Nível 3 (Autônomo)"
                  className="w-full aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ciclo / Semestre</label>
                <input
                  type="text"
                  value={cycleYear}
                  onChange={e => setCycleYear(e.target.value)}
                  placeholder="Ex: 2026 - 1º Ciclo"
                  className="w-full aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nível Atual</label>
                <input
                  type="text"
                  value={currentLevel}
                  onChange={e => setCurrentLevel(e.target.value)}
                  placeholder="Ex: Pleno / N2"
                  className="w-full aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Data de Início</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prazo p/ Homologação</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={targetEndDate}
                    onChange={e => setTargetEndDate(e.target.value)}
                    className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Propósito / Objetivo Central de Carreira & Benefício para a Operação
              </label>
              <textarea
                rows={2}
                value={careerGoal}
                onChange={e => setCareerGoal(e.target.value)}
                placeholder="Explique onde o colaborador quer chegar e como isso fortalecerá a fábrica..."
                className="w-full aptis-glass-input rounded-xl p-3 focus:outline-none"
              />
            </div>
          </div>

          {/* Diagnóstico: Forças e Gaps */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] border-b border-white/10 pb-1.5">
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
                  onChange={e => setStrengthInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddStrength();
                    }
                  }}
                  placeholder="Ex: Pontualidade britânica, zelo com ferramentas..."
                  className="flex-1 aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddStrength}
                  className="px-3 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400/35 rounded-xl font-bold hover:bg-emerald-500/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((str, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-[11px]"
                  >
                    {editingStrengthIdx === idx ? (
                      <>
                        <input
                          type="text"
                          value={editingStrengthText}
                          onChange={e => setEditingStrengthText(e.target.value)}
                          className="bg-slate-900 border border-emerald-500 rounded px-1.5 py-0.5 text-white text-[11px] w-40"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveStrengthEdit(idx)}
                          className="text-emerald-300 hover:text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{str}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStrengthIdx(idx);
                            setEditingStrengthText(str);
                          }}
                          className="text-emerald-400/70 hover:text-emerald-200 cursor-pointer"
                          title="Editar ponto forte"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveStrength(idx)}
                          className="text-emerald-400 hover:text-rose-400 cursor-pointer"
                          title="Remover ponto forte"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
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
                  onChange={e => setGapInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddGap();
                    }
                  }}
                  placeholder="Ex: Habilidade de comunicação, autonomia em setups..."
                  className="flex-1 aptis-glass-input rounded-xl px-3 py-2 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddGap}
                  className="px-3 py-2 bg-amber-500/20 text-amber-300 border border-amber-400/35 rounded-xl font-bold hover:bg-amber-500/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {growthGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-400/30 text-[11px]"
                  >
                    {editingGapIdx === idx ? (
                      <>
                        <input
                          type="text"
                          value={editingGapText}
                          onChange={e => setEditingGapText(e.target.value)}
                          className="bg-slate-900 border border-amber-500 rounded px-1.5 py-0.5 text-white text-[11px] w-40"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveGapEdit(idx)}
                          className="text-amber-300 hover:text-white"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span>{gap}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGapIdx(idx);
                            setEditingGapText(gap);
                          }}
                          className="text-amber-400/70 hover:text-amber-200 cursor-pointer"
                          title="Editar gap"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveGap(idx)}
                          className="text-amber-400 hover:text-rose-400 cursor-pointer"
                          title="Remover gap"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer do Modal */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-white/25 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)'
              }}
            >
              <Compass className="w-4 h-4" />
              {existingPdi ? 'Salvar Alterações do PDI' : 'Criar PDI com Metas 70-20-10'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
