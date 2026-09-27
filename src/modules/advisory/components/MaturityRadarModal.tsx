'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { MaturityPillar } from '../types';

interface MaturityRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillars: MaturityPillar[];
  onSavePillars: (updatedPillars: MaturityPillar[]) => void;
  clientName: string;
}

export const MaturityRadarModal: React.FC<MaturityRadarModalProps> = ({
  isOpen,
  onClose,
  pillars,
  onSavePillars,
  clientName,
}) => {
  const [localPillars, setLocalPillars] = useState<MaturityPillar[]>([...pillars]);
  const [activeTab, setActiveTab] = useState<'visual' | 'edit'>('visual');

  if (!isOpen) return null;

  const initialAvg =
    localPillars.reduce((acc, p) => acc + p.initialScore, 0) / (localPillars.length || 1);
  const currentAvg =
    localPillars.reduce((acc, p) => acc + p.currentScore, 0) / (localPillars.length || 1);
  const targetAvg =
    localPillars.reduce((acc, p) => acc + p.targetScore, 0) / (localPillars.length || 1);

  const growthPercent = (((currentAvg - initialAvg) / (initialAvg || 1)) * 100).toFixed(0);

  const handleScoreChange = (
    index: number,
    field: 'initialScore' | 'currentScore' | 'targetScore',
    value: number
  ) => {
    const updated = [...localPillars];
    updated[index] = { ...updated[index], [field]: Math.max(1, Math.min(5, value)) };
    setLocalPillars(updated);
  };

  const handleNotesChange = (
    index: number,
    field: 'initialNotes' | 'currentNotes',
    value: string
  ) => {
    const updated = [...localPillars];
    updated[index] = { ...updated[index], [field]: value };
    setLocalPillars(updated);
  };

  const handleAddPillar = () => {
    const newP: MaturityPillar = {
      id: `pil-${Date.now()}`,
      name: `${localPillars.length + 1}. Novo Pilar Estratégico`,
      description: 'Critérios de avaliação e conformidade com as melhores práticas de mercado.',
      initialScore: 2.0,
      currentScore: 3.5,
      targetScore: 4.5,
      initialNotes: 'Diagnóstico da condição de entrada.',
      currentNotes: 'Avanços observados após intervenção da consultoria.',
    };
    setLocalPillars([...localPillars, newP]);
    setActiveTab('edit');
  };

  const handleRemovePillar = (index: number) => {
    setLocalPillars(localPillars.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSavePillars(localPillars);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  Assessment de Maturidade
                </span>
                <span className="text-xs text-slate-500 font-semibold">{clientName}</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Radar de Evolução da Empresa (Antes vs Atual)
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'visual'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Visualização Gráfica & Comparativo
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'edit'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Ajustar Notas & Pilares Customizados ({localPillars.length})
          </button>
        </div>

        {/* Body Content - Solid White */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-white">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Maturidade Inicial (Entrada)
              </span>
              <div className="text-2xl font-black text-slate-700 mt-1">
                {initialAvg.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
              <span className="text-[11px] text-slate-500">Fotografia no Kick-off</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
              <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider block">
                Maturidade Atual (Em Curso)
              </span>
              <div className="text-2xl font-black text-blue-700 mt-1">
                {currentAvg.toFixed(1)}{' '}
                <span className="text-xs text-blue-400 font-normal">/ 5.0</span>
              </div>
              <span className="text-[11px] text-blue-600 font-medium">Ciclo atual de consultoria</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                Ganho de Maturidade
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">+{growthPercent}%</div>
              <span className="text-[11px] text-emerald-600 font-medium">Evolução comprovada</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Meta do Projeto (Alvo)
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {targetAvg.toFixed(1)}{' '}
                <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
              </div>
              <span className="text-[11px] text-slate-500">Padrão Classe Mundial</span>
            </div>
          </div>

          {activeTab === 'visual' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {localPillars.map((pillar) => {
                  const percentInit = (pillar.initialScore / 5.0) * 100;
                  const percentCurr = (pillar.currentScore / 5.0) * 100;
                  const percentTarget = (pillar.targetScore / 5.0) * 100;

                  return (
                    <div
                      key={pillar.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{pillar.name}</h4>
                          <p className="text-[11px] text-slate-500">{pillar.description}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono font-bold shrink-0">
                          <span className="text-slate-400">Início: {pillar.initialScore.toFixed(1)}</span>
                          <span className="text-blue-600 text-sm">Atual: {pillar.currentScore.toFixed(1)}</span>
                          <span className="text-slate-700">Meta: {pillar.targetScore.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Visual Progression Bars */}
                      <div className="space-y-1 pt-1">
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                          {/* Target marker */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-slate-400 z-10"
                            style={{ left: `${percentTarget}%` }}
                            title={`Meta: ${pillar.targetScore}`}
                          />
                          {/* Initial (gray) */}
                          <div
                            className="h-full bg-slate-300 rounded-full absolute left-0"
                            style={{ width: `${percentInit}%` }}
                          />
                          {/* Current (blue) */}
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                            style={{ width: `${percentCurr}%` }}
                          />
                        </div>
                      </div>

                      {/* Observations before vs now */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                          <strong className="text-slate-800 block text-[10px] uppercase font-bold text-slate-500">
                            Condição no Diagnóstico Inicial:
                          </strong>
                          {pillar.initialNotes}
                        </div>
                        <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900">
                          <strong className="text-blue-800 block text-[10px] uppercase font-bold">
                            Evolução Apurada pela Consultoria:
                          </strong>
                          {pillar.currentNotes}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Defina os pilares específicos da sua metodologia e ajuste as notas (1.0 a 5.0) para refletir a realidade do cliente.
                </p>
                <button
                  type="button"
                  onClick={handleAddPillar}
                  className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Novo Pilar
                </button>
              </div>

              <div className="space-y-3">
                {localPillars.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...localPillars];
                          updated[idx].name = e.target.value;
                          setLocalPillars(updated);
                        }}
                        className="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg p-2 flex-1 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePillar(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition"
                        title="Remover Pilar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Nota Inicial (1 a 5)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={p.initialScore}
                          onChange={(e) =>
                            handleScoreChange(idx, 'initialScore', parseFloat(e.target.value) || 1)
                          }
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-blue-700 block mb-1">
                          Nota Atual (1 a 5)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={p.currentScore}
                          onChange={(e) =>
                            handleScoreChange(idx, 'currentScore', parseFloat(e.target.value) || 1)
                          }
                          className="w-full text-xs font-mono font-bold bg-white border border-blue-300 rounded-lg p-2 text-blue-700"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Nota Meta (1 a 5)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="5"
                          value={p.targetScore}
                          onChange={(e) =>
                            handleScoreChange(idx, 'targetScore', parseFloat(e.target.value) || 5)
                          }
                          className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">
                          Diagnóstico Inicial (Evidência):
                        </label>
                        <textarea
                          rows={2}
                          value={p.initialNotes}
                          onChange={(e) => handleNotesChange(idx, 'initialNotes', e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-blue-700 block mb-1">
                          Avanços Comprovados Atuais:
                        </label>
                        <textarea
                          rows={2}
                          value={p.currentNotes}
                          onChange={(e) => handleNotesChange(idx, 'currentNotes', e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Maturidade calculada sob metodologia padronizada Aptis Advisory</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Salvar Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
