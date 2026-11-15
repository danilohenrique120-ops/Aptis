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
  tintedGlass?: boolean;
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
  tintedGlass = false,
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

  const inputClass = tintedGlass
    ? 'w-full px-3 py-2 aptis-glass-input rounded-xl text-white placeholder-slate-400 text-xs focus:outline-none'
    : 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 outline-none';

  const labelClass = `block text-xs font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-3xl border shadow-2xl flex flex-col my-8 max-h-[90vh] overflow-hidden ${
        tintedGlass
          ? 'aptis-glass-modal border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                  tintedGlass ? 'text-indigo-300 bg-indigo-500/20 border border-indigo-500/35' : 'text-indigo-600 bg-indigo-50'
                }`}>
                  {formData.code}
                </span>
                <span className={`text-xs font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                  {investigation ? 'Editar Investigação' : 'Nova Investigação de Falha Humana'}
                </span>
              </div>
              <h2 className={`text-lg font-bold mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                {formData.title || 'Nova Análise de Causa Raiz'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tabs */}
        <div className={`grid grid-cols-4 border-b text-xs font-semibold ${
          tintedGlass ? 'border-white/10 bg-slate-950/40' : 'border-slate-200 bg-white'
        }`}>
          {[
            { num: 1, label: '1. Fato & Impacto' },
            { num: 2, label: '2. TWTTP (Gemba)' },
            { num: 3, label: '3. HERCA & 5 Porquês' },
            { num: 4, label: '4. Plano 5W2H & OPL' },
          ].map((tab) => (
            <button
              key={tab.num}
              onClick={() => setCurrentStep(tab.num as any)}
              className={`py-3 px-2 text-center transition flex items-center justify-center gap-2 border-b-2 cursor-pointer ${
                currentStep === tab.num
                  ? (tintedGlass ? 'border-indigo-400 text-indigo-300 bg-indigo-500/15' : 'border-indigo-600 text-indigo-600 bg-indigo-50/30')
                  : (tintedGlass ? 'border-transparent text-slate-400 hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800')
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                currentStep === tab.num
                  ? 'bg-indigo-600 text-white'
                  : (tintedGlass ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
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
                  <label className={labelClass}>
                    Título do Evento *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Troca Inadvertida de Válvula de CIP"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Status da Investigação
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as InvestigationStatus })}
                    className={inputClass}
                  >
                    <option value="draft" className="bg-slate-900 text-white">Rascunho</option>
                    <option value="under_investigation" className="bg-slate-900 text-white">Em Investigação</option>
                    <option value="actions_pending" className="bg-slate-900 text-white">Ações em Execução</option>
                    <option value="effective_validated" className="bg-slate-900 text-white">Eficácia Comprovada</option>
                    <option value="closed" className="bg-slate-900 text-white">Encerrada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    Data do Incidente
                  </label>
                  <input
                    type="date"
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Turno
                  </label>
                  <input
                    type="text"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    placeholder="Ex: 2º Turno (14h - 22h)"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Severidade
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as SeverityLevel })}
                    className={inputClass}
                  >
                    <option value="low" className="bg-slate-900 text-white">Baixa</option>
                    <option value="medium" className="bg-slate-900 text-white">Média</option>
                    <option value="high" className="bg-slate-900 text-white">Alta</option>
                    <option value="critical" className="bg-slate-900 text-white">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    Setor Industrial
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className={`${inputClass} font-medium`}
                  >
                    {plantSectors.map(s => (
                      <option key={s.id} value={s.name} className="bg-slate-900 text-white">{s.name}</option>
                    ))}
                    {formData.sector && !plantSectors.some(s => s.name === formData.sector) && (
                      <option value={formData.sector} className="bg-slate-900 text-white">{formData.sector}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Posto / Máquina
                  </label>
                  <input
                    type="text"
                    value={formData.station}
                    onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                    placeholder="Ex: Skid CIP Linha 03"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Perda Estimada (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedLossReais || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedLossReais: Number(e.target.value) })}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>
                    Operador Envolvido
                  </label>
                  <input
                    type="text"
                    value={formData.operatorName}
                    onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                    placeholder="Nome do operador"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Tempo no Posto (meses)
                  </label>
                  <input
                    type="number"
                    value={formData.operatorExperienceMonths}
                    onChange={(e) => setFormData({ ...formData, operatorExperienceMonths: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Líder Investigador (WCM)
                  </label>
                  <input
                    type="text"
                    value={formData.leadInvestigator}
                    onChange={(e) => setFormData({ ...formData, leadInvestigator: e.target.value })}
                    placeholder="Nome do líder/engenheiro"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Descrição Factual do Incidente (Gemba) *
                </label>
                <textarea
                  rows={3}
                  value={formData.incidentDescription}
                  onChange={(e) => setFormData({ ...formData, incidentDescription: e.target.value })}
                  placeholder="Descreva o que ocorreu de maneira objetiva, sem juízo de valor ou termos culpabilizantes..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Ação de Contenção Imediata
                </label>
                <textarea
                  rows={2}
                  value={formData.immediateContainment}
                  onChange={(e) => setFormData({ ...formData, immediateContainment: e.target.value })}
                  placeholder="Qual bloqueio imediato foi realizado para evitar que o lote ou a máquina seguisse em não conformidade?"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* STEP 2: DIAGNÓSTICO TWTTP */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className={`p-4 rounded-2xl border text-xs ${
                tintedGlass
                  ? 'bg-indigo-950/35 border-indigo-500/30 text-slate-300'
                  : 'bg-indigo-50 border-indigo-200 text-slate-600'
              }`}>
                <div className={`flex items-center gap-2 font-bold mb-1 ${tintedGlass ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  <GraduationCap className="w-4 h-4" />
                  Metodologia TWTTP (The Way To Teach People - O Jeito de Ensinar Pessoas)
                </div>
                <p className="leading-relaxed">
                  No WCM, a falha nunca é responsabilidade exclusiva do operador. Avalie as 4 perguntas no Gemba e classifique com honestidade o método que o líder utilizou ao capacitar este profissional.
                </p>
              </div>

              {/* 4 Gemba Questions */}
              <div className="space-y-4">
                {[
                  {
                    q: '1. Sabia o QUE fazer? (Conhecia o padrão ou procedimento estabelecido?)',
                    flag: formData.twttp.knewWhat,
                    setFlag: (v: boolean) => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhat: v } }),
                    val: formData.twttp.knewWhatDetails,
                    setVal: (v: string) => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhatDetails: v } }),
                    ph: 'Evidência no Gemba: qual documento ou rotina existia...',
                  },
                  {
                    q: '2. Sabia COMO fazer? (Possuía habilidade motora e prática comprovada na máquina?)',
                    flag: formData.twttp.knewHow,
                    setFlag: (v: boolean) => setFormData({ ...formData, twttp: { ...formData.twttp, knewHow: v } }),
                    val: formData.twttp.knewHowDetails,
                    setVal: (v: string) => setFormData({ ...formData, twttp: { ...formData.twttp, knewHowDetails: v } }),
                    ph: 'Evidência: fez prova prática ou apenas leu o documento?',
                  },
                  {
                    q: '3. Sabia o PORQUÊ fazer? (Entendia as consequências e o risco no processo?)',
                    flag: formData.twttp.knewWhy,
                    setFlag: (v: boolean) => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhy: v } }),
                    val: formData.twttp.knewWhyDetails,
                    setVal: (v: string) => setFormData({ ...formData, twttp: { ...formData.twttp, knewWhyDetails: v } }),
                    ph: 'Evidência: sabia qual perda de qualidade ou segurança decorre deste passo?',
                  },
                  {
                    q: '4. Tinha CONDIÇÕES físicas/ergonômicas no posto para não errar?',
                    flag: formData.twttp.hadConditions,
                    setFlag: (v: boolean) => setFormData({ ...formData, twttp: { ...formData.twttp, hadConditions: v } }),
                    val: formData.twttp.hadConditionsDetails,
                    setVal: (v: string) => setFormData({ ...formData, twttp: { ...formData.twttp, hadConditionsDetails: v } }),
                    ph: 'Evidência: havia iluminação, identificação clara, ausência de peças espelhadas...',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-2 ${
                      tintedGlass ? 'aptis-glass-subcard border-white/10' : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                        {item.q}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => item.setFlag(true)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            item.flag
                              ? 'bg-emerald-600 text-white'
                              : (tintedGlass ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                          }`}
                        >
                          SIM
                        </button>
                        <button
                          type="button"
                          onClick={() => item.setFlag(false)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            !item.flag
                              ? 'bg-rose-600 text-white'
                              : (tintedGlass ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600')
                          }`}
                        >
                          NÃO
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={item.val}
                      onChange={(e) => item.setVal(e.target.value)}
                      placeholder={item.ph}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              {/* Leader Instruction Method Scale (1 to 4) */}
              <div className={`p-4 rounded-2xl border space-y-3 ${
                tintedGlass ? 'bg-indigo-950/25 border-indigo-500/30' : 'border-indigo-200 bg-indigo-50/30'
              }`}>
                <label className={`block text-xs font-bold uppercase ${tintedGlass ? 'text-indigo-200' : 'text-slate-800'}`}>
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
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                        formData.twttp.leaderInstructionMethod === level.val
                          ? 'border-indigo-500 bg-indigo-600 text-white font-bold shadow-xs'
                          : (tintedGlass ? 'aptis-glass-subcard border-white/10 text-slate-200' : 'border-slate-200 bg-white text-slate-700')
                      }`}
                    >
                      <div className="font-bold text-[11px] mb-1">{level.title}</div>
                      <div className={`text-[10px] leading-tight ${
                        formData.twttp.leaderInstructionMethod === level.val
                          ? 'text-indigo-100'
                          : (tintedGlass ? 'text-slate-400' : 'text-slate-500')
                      }`}>
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
                    className={inputClass}
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
                <label className={`${labelClass} mb-2`}>
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
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        formData.hercaErrorType === err.key
                          ? (tintedGlass ? 'border-purple-400 bg-purple-500/25 text-white font-bold' : 'border-purple-600 bg-purple-50 text-purple-900 font-bold')
                          : (tintedGlass ? 'aptis-glass-subcard border-white/10 text-slate-200' : 'border-slate-200 bg-slate-50/50 text-slate-700')
                      }`}
                    >
                      <div className="text-xs font-bold">{err.label}</div>
                      <div className={`text-[10px] mt-0.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>{err.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Systemic Factors Tags */}
              <div>
                <label className={labelClass}>
                  Fatores Sistêmicos Contribuintes (Pressione Enter para adicionar)
                </label>
                <div className={`flex flex-wrap items-center gap-2 p-2 rounded-xl min-h-[44px] ${
                  tintedGlass ? 'aptis-glass-input' : 'bg-slate-50 border border-slate-200'
                }`}>
                  {formData.hercaSystemicFactors.map((factor) => (
                    <span
                      key={factor}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        tintedGlass ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/35' : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {factor}
                      <button
                        type="button"
                        onClick={() => handleRemoveFactor(factor)}
                        className="hover:text-rose-500 ml-0.5 cursor-pointer"
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
                    className={`flex-1 bg-transparent border-none text-xs outline-none min-w-[200px] ${
                      tintedGlass ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* 5 Whys Chain */}
              <div className={`space-y-3 p-5 rounded-2xl border ${
                tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50/60 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-bold uppercase flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-700'}`}>
                    <Layers className="w-4 h-4 text-purple-500" />
                    Cadeia dos 5 Porquês HERCA
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Categoria Ishikawa:</span>
                    <select
                      value={formData.fiveWhys.rootCauseCategory}
                      onChange={(e) => setFormData({
                        ...formData,
                        fiveWhys: { ...formData.fiveWhys, rootCauseCategory: e.target.value as any }
                      })}
                      className={`px-2 py-1 rounded-lg text-xs ${
                        tintedGlass ? 'aptis-glass-input text-white' : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="Metodo" className="bg-slate-900 text-white">Método</option>
                      <option value="Maquina" className="bg-slate-900 text-white">Máquina / Ferramenta</option>
                      <option value="MaoDeObra" className="bg-slate-900 text-white">Mão de Obra (Instrução)</option>
                      <option value="Material" className="bg-slate-900 text-white">Material</option>
                      <option value="GestaoEngenharia" className="bg-slate-900 text-white">Gestão & Engenharia</option>
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
                      className={inputClass}
                    />
                  </div>
                ))}

                <div className="pt-2">
                  <label className={`block text-xs font-bold uppercase mb-1 ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>
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
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PLANO 5W2H & GERAÇÃO DE OPL */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Top Banner with OPL Quick Generator */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                tintedGlass
                  ? 'bg-purple-950/35 border-purple-500/30'
                  : 'bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border-purple-200'
              }`}>
                <div className="space-y-1">
                  <div className={`flex items-center gap-2 font-bold text-xs ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>
                    <Sparkles className="w-4 h-4" />
                    Hierarquia de Contramedidas WCM & Lição de Ponto Único
                  </div>
                  <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                    Priorize ações físicas à prova de erro (Poka-Yoke) e gere uma OPL ilustrada para o posto de trabalho.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateOpl}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    {formData.opl ? 'Visualizar / Editar OPL' : 'Gerar OPL Automática'}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Ação
                  </button>
                </div>
              </div>

              {/* Actions List */}
              <div className="space-y-4">
                {formData.actions.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border border-dashed text-slate-400 ${
                    tintedGlass ? 'border-white/15' : 'border-slate-300'
                  }`}>
                    <Cpu className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-semibold">Nenhuma ação cadastrada para esta investigação.</p>
                    <p className="text-[11px] mt-0.5">Clique no botão &quot;Adicionar Ação&quot; para planejar contramedidas robustas.</p>
                  </div>
                ) : (
                  formData.actions.map((act, idx) => (
                    <div
                      key={act.id}
                      className={`p-4 rounded-2xl border space-y-3 ${
                        tintedGlass ? 'aptis-glass-subcard border-white/10' : 'border-slate-200 bg-white shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            tintedGlass ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={act.title}
                            onChange={(e) => handleUpdateAction(act.id, { title: e.target.value })}
                            placeholder="Título da Ação (ex: Trava Poka-Yoke no Skid 03)"
                            className={`font-bold text-xs bg-transparent border-none outline-none flex-1 ${
                              tintedGlass ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Hierarchy Selector */}
                          <select
                            value={act.hierarchy}
                            onChange={(e) => handleUpdateAction(act.id, { hierarchy: e.target.value as ActionHierarchy })}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                              tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <option value="poka_yoke" className="bg-slate-900 text-white">★ Poka-Yoke (Mecânico/Elétrico)</option>
                            <option value="engineering" className="bg-slate-900 text-white">Engenharia / Sensor</option>
                            <option value="visual_control" className="bg-slate-900 text-white">Gestão Visual</option>
                            <option value="procedure_opl" className="bg-slate-900 text-white">Procedimento / OPL</option>
                            <option value="training_twttp" className="bg-slate-900 text-white">Treinamento 4 Passos TWTTP</option>
                          </select>

                          {/* Status */}
                          <select
                            value={act.status}
                            onChange={(e) => handleUpdateAction(act.id, { status: e.target.value as any })}
                            className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${
                              tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <option value="pending" className="bg-slate-900 text-white">Pendente</option>
                            <option value="in_progress" className="bg-slate-900 text-white">Em Andamento</option>
                            <option value="completed" className="bg-slate-900 text-white">Concluída</option>
                            <option value="verified_effective" className="bg-slate-900 text-white">Eficácia Validada</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleRemoveAction(act.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 5W2H Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">O que (What)</label>
                          <input
                            type="text"
                            value={act.what}
                            onChange={(e) => handleUpdateAction(act.id, { what: e.target.value })}
                            placeholder="O que será feito..."
                            className={`mt-0.5 ${inputClass}`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Por que (Why)</label>
                          <input
                            type="text"
                            value={act.why}
                            onChange={(e) => handleUpdateAction(act.id, { why: e.target.value })}
                            placeholder="Motivo / benefício..."
                            className={`mt-0.5 ${inputClass}`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Quem (Who)</label>
                          <input
                            type="text"
                            value={act.who}
                            onChange={(e) => handleUpdateAction(act.id, { who: e.target.value })}
                            placeholder="Responsável..."
                            className={`mt-0.5 ${inputClass}`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Quando (When)</label>
                          <input
                            type="date"
                            value={act.whenDate}
                            onChange={(e) => handleUpdateAction(act.id, { whenDate: e.target.value })}
                            className={`mt-0.5 ${inputClass}`}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Como (How)</label>
                          <input
                            type="text"
                            value={act.how}
                            onChange={(e) => handleUpdateAction(act.id, { how: e.target.value })}
                            placeholder="Método de implementação técnica..."
                            className={`mt-0.5 ${inputClass}`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Custo Estimado (R$)</label>
                          <input
                            type="number"
                            value={act.howMuchCost || ''}
                            onChange={(e) => handleUpdateAction(act.id, { howMuchCost: Number(e.target.value) })}
                            placeholder="0"
                            className={`mt-0.5 ${inputClass}`}
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
        <div className={`p-4 border-t flex items-center justify-between ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  tintedGlass ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            )}

            {onOpenPdfReport && (
              <button
                type="button"
                onClick={() => onOpenPdfReport(formData)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  tintedGlass
                    ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/35'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                }`}
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                tintedGlass ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cancelar
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Próxima Etapa
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-600/20 cursor-pointer"
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

