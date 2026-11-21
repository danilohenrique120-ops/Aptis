'use client';

import React, { useMemo, useState } from 'react';
import { KaizenProject, KaizenLevel, KaizenCategory } from '../types';
import type { PlantSector } from '@/types/sectors';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { X, Sparkles, Plus } from 'lucide-react';

const createKaizenId = () => `kz-${Date.now()}`;
const createActionId = () => `act-${Date.now()}-1`;
const getTodayIso = () => new Date().toISOString().split('T')[0];
const getFutureIso = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

interface NewKaizenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: KaizenProject) => void;
  tenantId: string;
  allowedSectors?: PlantSector[];
  tintedGlass?: boolean;
}

export function NewKaizenModal({
  isOpen,
  onClose,
  onSave,
  tenantId,
  allowedSectors,
  tintedGlass = false
}: NewKaizenModalProps) {
  const { sectors: plantSectors } = usePlantSectors();
  const availableSectors = useMemo(() => {
    if (Array.isArray(allowedSectors) && allowedSectors.length > 0) return allowedSectors;
    return Array.isArray(plantSectors) && plantSectors.length > 0 ? plantSectors : [];
  }, [allowedSectors, plantSectors]);

  const [title, setTitle] = useState('');
  const [level, setLevel] = useState<KaizenLevel>('quick');
  const [category, setCategory] = useState<KaizenCategory>('produtividade');
  const [selectedSectorId, setSelectedSectorId] = useState(availableSectors[0]?.id || '');
  const [area, setArea] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderRole, setLeaderRole] = useState('Operador de Célula');
  const [teamMembersText, setTeamMembersText] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [estimatedSavings, setEstimatedSavings] = useState('');
  const [hoursSaved, setHoursSaved] = useState('');

  if (!isOpen) return null;

  const activeSectorObj =
    availableSectors.find(s => s.id === selectedSectorId) || availableSectors[0];
  const effectiveSectorName = activeSectorObj?.name || 'Operações Fabris';
  const effectiveSectorId = activeSectorObj?.id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problemDescription.trim()) return;

    const team = teamMembersText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newProject: KaizenProject = {
      id: createKaizenId(),
      tenantId,
      title: title.trim(),
      level,
      category,
      stage: 'ideation',
      sectorId: effectiveSectorId,
      sector: effectiveSectorName,
      area: area.trim() || 'Posto de Trabalho',
      leaderName: leaderName.trim() || 'Operador Líder',
      leaderRole: leaderRole.trim(),
      teamMembers: team.length > 0 ? team : [leaderName.trim() || 'Operador'],
      estimatedSavingsAnnual: Number(estimatedSavings) || 0,
      hoursSavedMonthly: Number(hoursSaved) || 0,
      createdAt: getTodayIso(),
      isPublishedToFeed: false,
      likes: [],
      comments: [],
      replicationCount: 0,
      a3: {
        background: `Kaizen do setor ${effectiveSectorName}.`,
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
            id: createActionId(),
            what: proposedSolution.trim() || 'Implementar melhoria',
            who: leaderName.trim() || 'Líder',
            when: getFutureIso(14),
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
    setTitle('');
    setArea('');
    setLeaderName('');
    setTeamMembersText('');
    setProblemDescription('');
    setProposedSolution('');
    setEstimatedSavings('');
    setHoursSaved('');
    onClose();
  };

  const inputClass = tintedGlass
    ? 'w-full aptis-glass-input rounded-xl px-3 py-2 text-white placeholder-slate-400 focus:outline-none'
    : 'w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-purple-500';

  const labelClass = `block font-semibold mb-1 ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className={`rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-6 border ${
        tintedGlass
          ? 'aptis-glass-modal border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className={`p-5 border-b flex items-center justify-between ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              tintedGlass ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-purple-100 text-purple-700'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>Novo Projeto Kaizen</h3>
              <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Cadastre a oportunidade de melhoria e atribua o nível e equipe.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tintedGlass ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          <div>
            <label className={labelClass}>Título da Melhoria *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Dispositivo Poka-Yoke na furação de chapas..."
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nível de Kaizen *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as KaizenLevel)}
                className={`${inputClass} font-bold`}
              >
                <option value="quick" className="bg-slate-900 text-white">⚡ Quick Kaizen (Rápido / 1-3 dias)</option>
                <option value="standard" className="bg-slate-900 text-white">🛠️ Standard Kaizen (Célula / 1-2 sem)</option>
                <option value="major" className="bg-slate-900 text-white">🏭 Major Kaizen (Multidisciplinar / 1-2 meses)</option>
                <option value="advanced" className="bg-slate-900 text-white">🔬 Advanced Kaizen (Automação / Engenharia)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as KaizenCategory)}
                className={inputClass}
              >
                <option value="produtividade" className="bg-slate-900 text-white">Produtividade & SMED</option>
                <option value="qualidade" className="bg-slate-900 text-white">Qualidade & Refugo</option>
                <option value="segurança" className="bg-slate-900 text-white">Segurança & NR</option>
                <option value="ergonomia" className="bg-slate-900 text-white">Ergonomia</option>
                <option value="custo" className="bg-slate-900 text-white">Custo & Consumo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Setor Fabril</label>
              <select
                value={effectiveSectorId || ''}
                onChange={(e) => setSelectedSectorId(e.target.value)}
                className={inputClass}
              >
                {availableSectors.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Área / Máquina / Célula</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="Ex: Prensa 04, Célula CNC 01..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Líder do Kaizen *</label>
              <input
                type="text"
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Ex: José Carlos Nascimento"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Cargo do Líder</label>
              <input
                type="text"
                value={leaderRole}
                onChange={(e) => setLeaderRole(e.target.value)}
                placeholder="Ex: Operador Líder de Turno"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Participantes da Equipe (separados por vírgula)
            </label>
            <input
              type="text"
              value={teamMembersText}
              onChange={(e) => setTeamMembersText(e.target.value)}
              placeholder="Ex: Mariana Souza, Lucas Silva, Aline Ferreira"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Descrição do Problema Encontrado *</label>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="O que está gerando retrabalho, perda de tempo ou risco?..."
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Ideia de Solução Proposta</label>
            <textarea
              rows={2}
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="Qual dispositivo, procedimento ou alteração mecânica será feita?..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Economia Estimada Anual (R$)</label>
              <input
                type="number"
                value={estimatedSavings}
                onChange={(e) => setEstimatedSavings(e.target.value)}
                placeholder="Ex: 25000"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Horas Salvas por Mês</label>
              <input
                type="number"
                value={hoursSaved}
                onChange={(e) => setHoursSaved(e.target.value)}
                placeholder="Ex: 15"
                className={inputClass}
              />
            </div>
          </div>

          <div className={`pt-3 border-t flex items-center justify-end gap-2 ${
            tintedGlass ? 'border-white/10' : 'border-slate-200'
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
