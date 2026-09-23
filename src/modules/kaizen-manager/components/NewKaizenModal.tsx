'use client';

import React, { useState } from 'react';
import { KaizenProject, KaizenLevel, KaizenCategory } from '../types';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { X, Sparkles, Plus, Layers, User } from 'lucide-react';

interface NewKaizenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: KaizenProject) => void;
  tenantId: string;
}

export function NewKaizenModal({
  isOpen,
  onClose,
  onSave,
  tenantId
}: NewKaizenModalProps) {
  const { sectors: plantSectors } = usePlantSectors();
  const availableSectors = plantSectors.map(s => s.name);
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<KaizenLevel>('quick');
  const [category, setCategory] = useState<KaizenCategory>('produtividade');
  const [sector, setSector] = useState(availableSectors[0] || 'Usinagem CNC & Precisão');
  const [area, setArea] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderRole, setLeaderRole] = useState('Operador de Célula');
  const [teamMembersText, setTeamMembersText] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [estimatedSavings, setEstimatedSavings] = useState('');
  const [hoursSaved, setHoursSaved] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problemDescription.trim()) return;

    const team = teamMembersText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newProject: KaizenProject = {
      id: `kz-${Date.now()}`,
      tenantId,
      title: title.trim(),
      level,
      category,
      stage: 'ideation',
      sector,
      area: area.trim() || 'Posto de Trabalho',
      leaderName: leaderName.trim() || 'Operador Líder',
      leaderRole: leaderRole.trim(),
      teamMembers: team.length > 0 ? team : [leaderName.trim() || 'Operador'],
      estimatedSavingsAnnual: Number(estimatedSavings) || 0,
      hoursSavedMonthly: Number(hoursSaved) || 0,
      createdAt: new Date().toISOString().split('T')[0],
      a3: {
        background: `Kaizen do setor ${sector}.`,
        problemStatement: problemDescription.trim(),
        currentCondition: 'Condição identificada em chão de fábrica.',
        fiveWhys: {
          why1: '',
          why2: '',
          why3: '',
          why4: '',
          why5: '',
          rootCause: ''
        },
        targetCondition: proposedSolution.trim(),
        targetKpiGoal: 'Meta a definir na análise',
        actionPlan: [
          {
            id: `act-${Date.now()}-1`,
            what: proposedSolution.trim() || 'Implementar melhoria',
            who: leaderName.trim() || 'Líder',
            when: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: 'todo'
          }
        ],
        verificationResults: 'Aguardando implementação.',
        savingsAnnual: Number(estimatedSavings) || 0,
        hoursSavedMonthly: Number(hoursSaved) || 0,
        isTargetAchieved: false,
        standardizationSummary: 'A definir após teste prático.',
        skillsMatrixUpdated: false,
        lessonsLearned: ''
      }
    };

    onSave(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Novo Projeto Kaizen</h3>
              <p className="text-xs text-slate-500">Cadastre a oportunidade de melhoria e atribua o nível e equipe.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Título da Melhoria *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Dispositivo Poka-Yoke na furação de chapas..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nível de Kaizen *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as KaizenLevel)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="quick">⚡ Quick Kaizen (Rápido / 1-3 dias)</option>
                <option value="standard">🛠️ Standard Kaizen (Célula / 1-2 sem)</option>
                <option value="major">🏭 Major Kaizen (Multidisciplinar / 1-2 meses)</option>
                <option value="advanced">🔬 Advanced Kaizen (Automação / Engenharia)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as KaizenCategory)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              >
                <option value="produtividade">Produtividade & SMED</option>
                <option value="qualidade">Qualidade & Refugo</option>
                <option value="segurança">Segurança & NR</option>
                <option value="ergonomia">Ergonomia</option>
                <option value="custo">Custo & Consumo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Setor Fabril</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              >
                {availableSectors.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Área / Máquina / Célula</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Prensa 04, Célula CNC 01..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Líder do Kaizen *</label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Ex: José Carlos Nascimento"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Cargo do Líder</label>
              <input
                type="text"
                value={leaderRole}
                onChange={(e) => setLeaderRole(e.target.value)}
                placeholder="Ex: Operador Líder de Turno"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Participantes da Equipe (separados por vírgula)
            </label>
            <input
              type="text"
              value={teamMembersText}
              onChange={(e) => setTeamMembersText(e.target.value)}
              placeholder="Ex: Mariana Souza, Lucas Silva, Aline Ferreira"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Descrição do Problema Encontrado *</label>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="O que está gerando retrabalho, perda de tempo ou risco?..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ideia de Solução Proposta</label>
            <textarea
              rows={2}
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="Qual dispositivo, procedimento ou alteração mecânica será feita?..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Economia Estimada Anual (R$)</label>
              <input
                type="number"
                value={estimatedSavings}
                onChange={(e) => setEstimatedSavings(e.target.value)}
                placeholder="Ex: 25000"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Horas Salvas por Mês</label>
              <input
                type="number"
                value={hoursSaved}
                onChange={(e) => setHoursSaved(e.target.value)}
                placeholder="Ex: 15"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 cursor-pointer font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Kaizen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
