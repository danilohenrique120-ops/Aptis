'use client';

import React, { useState } from 'react';
import { 
  X, 
  BrainCircuit, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  Cpu, 
  Eye, 
  GraduationCap, 
  Save, 
  Check,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Printer
} from 'lucide-react';
import { 
  HercaInvestigation, 
  InvestigationStatus, 
  SeverityLevel, 
  ImpactCategory, 
  ErrorClassificationType, 
  ActionHierarchy, 
  HercaAction,
  OnePointLesson
} from '../types';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

interface InvestigationModalProps {
  investigation?: HercaInvestigation | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: HercaInvestigation) => void;
  onOpenOpl?: (inv: HercaInvestigation) => void;
  onOpenPdfReport?: (inv: HercaInvestigation) => void;
}

const defaultInvestigation: HercaInvestigation = {
  id: '',
  code: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
  title: '',
  incidentDate: new Date().toISOString().split('T')[0],
  shift: '1º Turno (06h - 14h)',
  sector: 'Fermentação & Biorreatores',
  station: '',
  operatorName: '',
  operatorExperienceMonths: 6,
  severity: 'medium',
  impactCategory: 'quality',
  estimatedLossReais: 0,
  incidentDescription: '',
  immediateContainment: '',
  status: 'under_investigation',
  leadInvestigator: '',
  twttp: {
    knewWhat: false,
    knewWhatDetails: '',
    knewHow: false,
    knewHowDetails: '',
    knewWhy: false,
    knewWhyDetails: '',
    hadConditions: false,
    hadConditionsDetails: '',
    leaderInstructionMethod: 2,
    leaderNotes: '',
  },
  hercaErrorType: 'slip',
  hercaSystemicFactors: [],
  fiveWhys: {
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: '',
    rootCauseCategory: 'Metodo',
    rootCauseStatement: '',
  },
  actions: [],
  recurrenceCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function InvestigationModal({
  investigation,
  isOpen,
  onClose,
  onSave,
  onOpenOpl,
  onOpenPdfReport,
}: InvestigationModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<HercaInvestigation>(
    investigation || { ...defaultInvestigation, id: `inv-${Date.now()}` }
  );

  const [systemicFactorInput, setSystemicFactorInput] = useState('');
  const { sectors: plantSectors } = usePlantSectors();

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as any);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as any);
  };

  const handleSave = () => {
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  // Add Action helper
  const handleAddAction = () => {
    const newAction: HercaAction = {
      id: `act-${Date.now()}`,
      investigationId: formData.id,
      title: '',
      what: '',
      why: '',
      who: '',
      where: formData.station || formData.sector,
      whenDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      how: '',
      hierarchy: 'poka_yoke',
      status: 'pending',
    };
    setFormData({
      ...formData,
      actions: [...formData.actions, newAction],
    });
  };

  const handleRemoveAction = (actionId: string) => {
    setFormData({
      ...formData,
      actions: formData.actions.filter((a) => a.id !== actionId),
    });
  };

  const handleUpdateAction = (actionId: string, updates: Partial<HercaAction>) => {
    setFormData({
      ...formData,
      actions: formData.actions.map((a) => (a.id === actionId ? { ...a, ...updates } : a)),
    });
  };

  // Generate OPL Helper
  const handleGenerateOpl = () => {
    const opl: OnePointLesson = {
      id: `opl-${Date.now()}`,
      investigationId: formData.id,
      code: `OPL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: `Padrão de Prevenção: ${formData.title || 'Operação Segura'}`,
      area: formData.sector,
      station: formData.station,
      classification: 'trouble_case',
      problemScenario: formData.incidentDescription,
      standardPractice: formData.actions.length > 0 ? formData.actions[0].how || formData.actions[0].what : 'Descreva a prática padrão aprovada...',
      keySafetyQualityPoint: formData.immediateContainment || 'Ponto crítico de segurança e conformidade operacional.',
      whyItMatters: formData.fiveWhys.rootCauseStatement || 'Evitar reincidência de perdas produtivas e riscos operacionais.',
      preparedBy: formData.leadInvestigator || 'Líder de WCM',
      approvedBy: 'Gerência de Planta',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = { ...formData, opl };
    setFormData(updated);
    if (onOpenOpl) {
      onOpenOpl(updated);
    }
  };

  // Add systemic factor chip
  const handleAddFactor = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && systemicFactorInput.trim()) {
      e.preventDefault();
      if (!formData.hercaSystemicFactors.includes(systemicFactorInput.trim())) {
        setFormData({
          ...formData,
          hercaSystemicFactors: [...formData.hercaSystemicFactors, systemicFactorInput.trim()],
        });
      }
      setSystemicFactorInput('');
    }
  };

  const handleRemoveFactor = (factor: string) => {
    setFormData({
      ...formData,
      hercaSystemicFactors: formData.hercaSystemicFactors.filter((f) => f !== factor),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-8 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                  {formData.code}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {investigation ? 'Editar Investigação' : 'Nova Investigação de Falha Humana'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {formData.title || 'Nova Análise de Causa Raiz'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold">
          {[
            { num: 1, label: '1. Fato & Impacto' },
            { num: 2, label: '2. TWTTP (Gemba)' },
            { num: 3, label: '3. HERCA & 5 Porquês' },
            { num: 4, label: '4. Plano 5W2H & OPL' },
          ].map((tab) => (
            <button
              key={tab.num}
              onClick={() => setCurrentStep(tab.num as any)}
              className={`py-3 px-2 text-center transition flex items-center justify-center gap-2 border-b-2 ${
                currentStep === tab.num
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === tab.num ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.num}
              </span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Body Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* STEP 1: FATO & IMPACTO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Troca Inadvertida de Válvula de CIP"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Status da Investigação
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InvestigationStatus })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="under_investigation">Em Investigação</option>
                    <option value="actions_pending">Ações em Execução</option>
                    <option value="effective_validated">Eficácia Comprovada</option>
                    <option value="closed">Encerrada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Data do Incidente
                  </label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Turno
                  </label>
                  <input
                    type="text"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    placeholder="Ex: 2º Turno (14h - 22h)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Severidade
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as SeverityLevel })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Setor Industrial
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {plantSectors.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                    {formData.sector && !plantSectors.some(s => s.name === formData.sector) && (
                      <option value={formData.sector}>{formData.sector}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Posto / Máquina
                  </label>
                  <input
                    type="text"
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    placeholder="Ex: Skid CIP Linha 03"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Perda Estimada (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedLossReais || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedLossReais: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Operador Envolvido
                  </label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                    placeholder="Nome do operador"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Tempo no Posto (meses)
                  </label>
                  <input
                    type="number"
                    value={formData.operatorExperienceMonths}
                    onChange={(e) => setFormData({ ...formData, operatorExperienceMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Líder Investigador (WCM)
                  </label>
                  <input
                    type="text"
                    value={formData.leadInvestigator}
                    onChange={(e) => setFormData({ ...formData, leadInvestigator: e.target.value })}
                    placeholder="Nome do líder/engenheiro"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Descrição Factual do Incidente (Gemba) *
                </label>
                <textarea
                  rows={3}
                  value={formData.incidentDescription}
                  onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                  placeholder="Descreva o que ocorreu de maneira objetiva, sem juízo de valor ou termos culpabilizantes..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Ação de Contenção Imediata
                </label>
                <textarea
                  rows={2}
                  value={formData.immediateContainment}
                  onChange={(e) => setFormData({ ...formData, immediateContainment: e.target.value })}
                  placeholder="Qual bloqueio imediato foi realizado para evitar que o lote ou a máquina seguisse em não conformidade?"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-hidden"
                />
              </div>
            </div>
          )}

          {/* STEP 2: DIAGNÓSTICO TWTTP */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-xs">
                <div className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300 mb-1">
                  <GraduationCap className="w-4 h-4" />
                  Metodologia TWTTP (The Way To Teach People - O Jeito de Ensinar Pessoas)
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  No WCM, a falha nunca é responsabilidade exclusiva do operador. Avalie as 4 perguntas no Gemba e classifique com honestidade o método que o líder utilizou ao capacitar este profissional.
                </p>
              </div>

              {/* 4 Gemba Questions */}
              <div className="space-y-4">
                {/* 1. Knew What */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      1. Sabia o QUE fazer? (Conhecia o padrão ou procedimento estabelecido?)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhat: true } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${formData.twttp.knewWhat ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        SIM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhat: false } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${!formData.twttp.knewWhat ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.twttp.knewWhatDetails}
                    onChange={(e) => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhatDetails: e.target.value } })}
                    placeholder="Evidência no Gemba: qual documento ou rotina existia..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* 2. Knew How */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      2. Sabia COMO fazer? (Possuía habilidade motora e prática comprovada na máquina?)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, knewHow: true } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${formData.twttp.knewHow ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        SIM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, knewHow: false } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${!formData.twttp.knewHow ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.twttp.knewHowDetails}
                    onChange={(e) => setFormData({ ...formData, twttp: { ...formData.twttp, knewHowDetails: e.target.value } })}
                    placeholder="Evidência: fez prova prática ou apenas leu o documento?"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* 3. Knew Why */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      3. Sabia o PORQUÊ fazer? (Entendia as consequências e o risco no processo?)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhy: true } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${formData.twttp.knewWhy ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        SIM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhy: false } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${!formData.twttp.knewWhy ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.twttp.knewWhyDetails}
                    onChange={(e) => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhyDetails: e.target.value } })}
                    placeholder="Evidência: sabia qual perda de qualidade ou segurança decorre deste passo?"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>

                {/* 4. Had Conditions */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      4. Tinha CONDIÇÕES físicas/ergonômicas no posto para não errar?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, hadConditions: true } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${formData.twttp.hadConditions ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        SIM
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, hadConditions: false } })}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition ${!formData.twttp.hadConditions ? 'bg-rose-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.twttp.hadConditionsDetails}
                    onChange={(e) => setFormData({ ...formData, twttp: { ...formData.twttp, hadConditionsDetails: e.target.value } })}
                    placeholder="Evidência: havia iluminação, identificação clara, ausência de peças espelhadas..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Leader Instruction Method Scale (1 to 4) */}
              <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  Classificação do Método de Ensino do Líder (Escala WCM 1 a 4)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { val: 1, title: 'Nível 1: Leitura Autônoma', desc: 'Apenas entregou texto/POP para ler sozinho' },
                    { val: 2, title: 'Nível 2: Instrução Verbal', desc: 'Explicou verbalmente o que fazer, sem Gemba' },
                    { val: 3, title: 'Nível 3: Demonstração', desc: 'Explicou e mostrou no posto, mas não testou' },
                    { val: 4, title: 'Nível 4: Ciclo TWTTP', desc: 'Mostrou, fez executar explicando o porquê e auditou' },
                  ].map((level) => (
                    <button
                      key={level.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, twttp: { ...formData.twttp, leaderInstructionMethod: level.val as any } })}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        formData.twttp.leaderInstructionMethod === level.val
                          ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-[11px] mb-1">{level.title}</div>
                      <div className={`text-[10px] leading-tight ${formData.twttp.leaderInstructionMethod === level.val ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {level.desc}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.twttp.leaderNotes}
                    onChange={(e) => setFormData({ ...formData, twttp: { ...formData.twttp, leaderNotes: e.target.value } })}
                    placeholder="Observações sobre a atuação da liderança no treinamento..."
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HERCA & 5 PORQUÊS */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* HERCA Error Classification */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                  Classificação do Erro Humano (Taxonomia HERCA) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'slip', label: 'Deslize (Slip)', desc: 'Falha na execução de ação rotineira conhecida (atenção)' },
                    { key: 'lapse', label: 'Lapso (Lapse)', desc: 'Esquecimento de etapa ou omissão de passo na memória' },
                    { key: 'mistake_rule', label: 'Engano de Regra', desc: 'Aplicação de regra inadequada para a situação' },
                    { key: 'mistake_knowledge', label: 'Engano de Conhecimento', desc: 'Desconhecimento do procedimento correto' },
                    { key: 'system_induced_violation', label: 'Violação Sistêmica', desc: 'Desvio induzido por layout ruim ou pressão de tempo' },
                    { key: 'ergonomic_overload', label: 'Sobrecarga Ergonômica', desc: 'Cansaço físico, esforço repetitivo ou postura' },
                  ].map((err) => (
                    <button
                      key={err.key}
                      type="button"
                      onClick={() => setFormData({ ...formData, hercaErrorType: err.key as ErrorClassificationType })}
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.hercaErrorType === err.key
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{err.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{err.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Systemic Factors Tags */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Fatores Sistêmicos Contribuintes (Pressione Enter para adicionar)
                </label>
                <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[44px]">
                  {formData.hercaSystemicFactors.map((factor) => (
                    <span
                      key={factor}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium"
                    >
                      {factor}
                      <button
                        type="button"
                        onClick={() => handleRemoveFactor(factor)}
                        className="hover:text-rose-600 ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={systemicFactorInput}
                    onChange={(e) => setSystemicFactorInput(e.target.value)}
                    onKeyDown={handleAddFactor}
                    placeholder="Adicionar fator (ex: Ruído > 85dB, Peças simétricas, Falta de Poka-Yoke)..."
                    className="flex-1 bg-transparent border-none text-xs outline-hidden min-w-[200px]"
                  />
                </div>
              </div>

              {/* 5 Whys Chain */}
              <div className="space-y-3 p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-500" />
                    Cadeia dos 5 Porquês HERCA
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-semibold">Categoria Ishikawa:</span>
                    <select
                      value={formData.fiveWhys.rootCauseCategory}
                      onChange={(e) => setFormData({
                        ...formData,
                        fiveWhys: { ...formData.fiveWhys, rootCauseCategory: e.target.value as any }
                      })}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    >
                      <option value="Metodo">Método</option>
                      <option value="Maquina">Máquina / Ferramenta</option>
                      <option value="MaoDeObra">Mão de Obra (Instrução)</option>
                      <option value="Material">Material</option>
                      <option value="GestaoEngenharia">Gestão & Engenharia</option>
                    </select>
                  </div>
                </div>

                {[
                  { num: 1, key: 'why1', placeholder: '1º Por que o problema aconteceu?' },
                  { num: 2, key: 'why2', placeholder: '2º Por que ocorreu a resposta do 1º porquê?' },
                  { num: 3, key: 'why3', placeholder: '3º Por que o sistema ou posto permitiu?' },
                  { num: 4, key: 'why4', placeholder: '4º Por que a barreira falhou ou não existia?' },
                  { num: 5, key: 'why5', placeholder: '5º Por que a causa raiz sistêmica não foi prevenida?' },
                ].map((item) => (
                  <div key={item.num} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {item.num}
                    </span>
                    <input
                      type="text"
                      value={(formData.fiveWhys as any)[item.key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        fiveWhys: { ...formData.fiveWhys, [item.key]: e.target.value }
                      })}
                      placeholder={item.placeholder}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                ))}

                <div className="pt-2">
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 uppercase mb-1">
                    Declaração da Causa Raiz HERCA (Sistêmica) *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.fiveWhys.rootCauseStatement}
                    onChange={(e) => setFormData({
                      ...formData,
                      fiveWhys: { ...formData.fiveWhys, rootCauseStatement: e.target.value }
                    })}
                    placeholder="Síntese da causa raiz sistêmica sem culpabilização do colaborador..."
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl text-xs outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PLANO 5W2H & GERAÇÃO DE OPL */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Top Banner with OPL Quick Generator */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200 dark:border-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-300 text-xs">
                    <Sparkles className="w-4 h-4" />
                    Hierarquia de Contramedidas WCM & Lição de Ponto Único
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Priorize ações físicas à prova de erro (Poka-Yoke) e gere uma OPL ilustrada para o posto de trabalho.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateOpl}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {formData.opl ? 'Visualizar / Editar OPL' : 'Gerar OPL Automática'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Ação
                  </button>
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-4">
                {formData.actions.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-semibold">Nenhuma ação cadastrada para esta investigação.</p>
                    <p className="text-[11px] mt-0.5">Clique no botão &quot;Adicionar Ação&quot; para planejar contramedidas robustas.</p>
                  </div>
                ) : (
                  formData.actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={act.title}
                            onChange={(e) => handleUpdateAction(act.id, { title: e.target.value })}
                            placeholder="Título da Ação (ex: Trava Poka-Yoke no Skid 03)"
                            className="font-bold text-xs bg-transparent border-none outline-hidden text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Hierarchy Selector */}
                          <select
                            value={act.hierarchy}
                            onChange={(e) => handleUpdateAction(act.id, { hierarchy: e.target.value as ActionHierarchy })}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-none"
                          >
                            <option value="poka_yoke">★ Poka-Yoke (Mecânico/Elétrico)</option>
                            <option value="engineering">Engenharia / Sensor</option>
                            <option value="visual_control">Gestão Visual</option>
                            <option value="procedure_opl">Procedimento / OPL</option>
                            <option value="training_twttp">Treinamento 4 Passos TWTTP</option>
                          </select>

                          {/* Status */}
                          <select
                            value={act.status}
                            onChange={(e) => handleUpdateAction(act.id, { status: e.target.value as any })}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-none"
                          >
                            <option value="pending">Pendente</option>
                            <option value="in_progress">Em Andamento</option>
                            <option value="completed">Concluída</option>
                            <option value="verified_effective">Eficácia Validada</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveAction(act.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 5W2H Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">O que (What)</label>
                          <input
                            type="text"
                            value={act.what}
                            onChange={(e) => handleUpdateAction(act.id, { what: e.target.value })}
                            placeholder="O que será feito..."
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Por que (Why)</label>
                          <input
                            type="text"
                            value={act.why}
                            onChange={(e) => handleUpdateAction(act.id, { why: e.target.value })}
                            placeholder="Motivo / benefício..."
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Quem (Who)</label>
                          <input
                            type="text"
                            value={act.who}
                            onChange={(e) => handleUpdateAction(act.id, { who: e.target.value })}
                            placeholder="Responsável..."
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Quando (When)</label>
                          <input
                            type="date"
                            value={act.whenDate}
                            onChange={(e) => handleUpdateAction(act.id, { whenDate: e.target.value })}
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Como (How)</label>
                          <input
                            type="text"
                            value={act.how}
                            onChange={(e) => handleUpdateAction(act.id, { how: e.target.value })}
                            placeholder="Método de implementação técnica..."
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Custo Estimado (R$)</label>
                          <input
                            type="number"
                            value={act.howMuchCost || ''}
                            onChange={(e) => handleUpdateAction(act.id, { howMuchCost: Number(e.target.value) })}
                            placeholder="0"
                            className="w-full mt-0.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}

            {onOpenPdfReport && (
              <button
                type="button"
                onClick={() => onOpenPdfReport(formData)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs font-bold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Dossiê em PDF
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancelar
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Próxima Etapa
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20"
              >
                <Save className="w-4 h-4" />
                Salvar Investigação
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

