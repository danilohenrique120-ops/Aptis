'use client';

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  FileDown, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  BrainCircuit, 
  Calendar, 
  MapPin, 
  User, 
  Settings2, 
  Sliders, 
  Sparkles, 
  Layers, 
  Cpu, 
  DollarSign,
  FileText
} from 'lucide-react';
import { HercaInvestigation, HercaAction } from '../types';

interface InvestigationPdfReportModalProps {
  investigation: HercaInvestigation | null;
  isOpen: boolean;
  onClose: () => void;
  tenantName?: string;
}

export function InvestigationPdfReportModal({
  investigation,
  isOpen,
  onClose,
  tenantName = 'Planta Industrial',
}: InvestigationPdfReportModalProps) {
  // Report configurations
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [anonymizeOperator, setAnonymizeOperator] = useState(false);
  const [includeOplSummary, setIncludeOplSummary] = useState(true);
  const [showApprovalStamp, setShowApprovalStamp] = useState(true);
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen || !investigation) return null;

  const handlePrint = () => {
    window.print();
  };

  const statusLabels: Record<string, string> = {
    draft: 'Rascunho',
    under_investigation: 'Em Investigação Técnica',
    actions_pending: 'Plano de Ação em Execução',
    effective_validated: 'Eficácia Validada (Zero Reincidência)',
    closed: 'Encerrada',
  };

  const severityLabels: Record<string, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    critical: 'Crítica',
  };

  const errorTypeLabels: Record<string, string> = {
    slip: 'Deslize (Falha de Execução / Atenção)',
    lapse: 'Lapso (Falha de Memória / Omissão de Etapa)',
    mistake_rule: 'Engano de Regra (Aplicação Inadequada do Padrão)',
    mistake_knowledge: 'Engano de Conhecimento (Desconhecimento Técnico)',
    system_induced_violation: 'Violação Sistêmica (Desvio Induzido por Layout ou Pressão)',
    ergonomic_overload: 'Sobrecarga Ergonômica / Fadiga Física ou Cognitiva',
  };

  const hierarchyNames: Record<string, string> = {
    poka_yoke: '★ Poka-Yoke Físico (À Prova de Erro)',
    engineering: 'Engenharia / Sensor Automático',
    visual_control: 'Controle Visual / Sinalização',
    procedure_opl: 'Procedimento / OPL no Posto',
    training_twttp: 'Treinamento Ciclo TWTTP (4 Passos)',
  };

  const leaderLevelNames: Record<number, string> = {
    1: 'Nível 1 - Apenas leitura autônoma de documento',
    2: 'Nível 2 - Instrução verbal sem prática no Gemba',
    3: 'Nível 3 - Demonstração pelo líder no posto',
    4: 'Nível 4 - Ciclo completo TWTTP (Explicou, demonstrou, validou prática e auditou)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-4 max-h-[95vh] overflow-hidden">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded-md">
                  {investigation.code}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Relatório Oficial em PDF
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dossiê executivo de causa raiz estruturado segundo os padrões WCM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Salvar como PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar for Report Customization (Hidden on print) */}
        <div className="px-6 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300 print:hidden">
          <span className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-400">
            <Sliders className="w-3.5 h-3.5" />
            Opções do PDF:
          </span>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeFinancials}
              onChange={(e) => setIncludeFinancials(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Exibir Perdas Financeiras (R$)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={anonymizeOperator}
              onChange={(e) => setAnonymizeOperator(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Ocultar Nome do Operador (Privacidade / LGPD)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={includeOplSummary}
              onChange={(e) => setIncludeOplSummary(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Incluir Lição OPL Vinculada</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showApprovalStamp}
              onChange={(e) => setShowApprovalStamp(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <span>Exibir Selo de Eficácia WCM</span>
          </label>
        </div>

        {/* Printable PDF Document Body (A4 Styled Document) */}
        <div 
          id="herca-pdf-print-area" 
          className="p-8 sm:p-12 overflow-y-auto space-y-6 bg-white text-slate-900 text-xs print:p-0 print:overflow-visible print:text-black"
        >
          {/* Document Header with Logos & Meta */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-black text-sm tracking-wider uppercase">
                  <BrainCircuit className="w-5 h-5 text-purple-700" />
                  <span>Aptis Industrial Systems • WCM Excellence</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  Relatório Técnico de Investigação de Causa Raiz
                </h1>
                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                  Metodologia Integrada TWTTP & HERCA • Diagnóstico Humano e Barreiras Poka-Yoke
                </p>
              </div>

              {/* Status Stamp */}
              {showApprovalStamp && (
                <div className="text-right">
                  <div className={`inline-block border-2 px-3 py-1 rounded-lg text-center uppercase tracking-wider font-black text-[11px] ${
                    investigation.status === 'effective_validated'
                      ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                      : 'border-purple-600 text-purple-700 bg-purple-50'
                  }`}>
                    {statusLabels[investigation.status] || investigation.status}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">
                    Emitido: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metadata Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-200 text-[11px]">
              <div>
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Código do Caso</span>
                <span className="font-mono font-black text-purple-800 text-xs">{investigation.code}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Unidade / Planta</span>
                <span className="font-bold text-slate-800">{tenantName}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Data do Incidente</span>
                <span className="font-bold text-slate-800">{new Date(investigation.incidentDate).toLocaleDateString('pt-BR')} ({investigation.shift})</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase font-bold text-[9px] block">Setor / Posto</span>
                <span className="font-bold text-slate-800">{investigation.sector} - {investigation.station}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Event Description & Containment */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 border-l-4 border-purple-600 pl-2 text-xs">
              1. Caracterização Factual do Incidente & Contenção Imediata
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Título do Incidente</span>
                <strong className="text-slate-900 text-xs">{investigation.title}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Gravidade / Categoria</span>
                <span className="font-bold text-slate-800">
                  Severidade {severityLabels[investigation.severity]} • Impacto {investigation.impactCategory}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Colaborador / Investigador</span>
                <span className="font-medium text-slate-800">
                  Op: {anonymizeOperator ? 'Operador Sob Auditoria (Protegido)' : `${investigation.operatorName} (${investigation.operatorExperienceMonths}m exp.)`}
                  <br />
                  Lead: {investigation.leadInvestigator || 'Líder WCM'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div>
                <span className="font-bold text-slate-800 text-[11px] block">Descrição Factual no Gemba:</span>
                <p className="text-slate-700 leading-relaxed text-xs">{investigation.incidentDescription}</p>
              </div>
              {investigation.immediateContainment && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-amber-900 text-[11px] block">Ação Imediata de Bloqueio / Contenção:</span>
                  <p className="text-slate-700 leading-relaxed text-xs">{investigation.immediateContainment}</p>
                </div>
              )}
            </div>

            {includeFinancials && investigation.estimatedLossReais ? (
              <div className="flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold text-xs">
                <span>Impacto Financeiro Direto Mapeado (Perda / Refugo / Parada):</span>
                <span className="font-black text-sm">R$ {investigation.estimatedLossReais.toLocaleString('pt-BR')}</span>
              </div>
            ) : null}
          </div>

          {/* Section 2: TWTTP Diagnostic (The Way To Teach People) */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 pl-2 text-xs">
              2. Diagnóstico Pedagógico TWTTP (Gemba & Método do Líder)
            </h3>
            
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 w-1/3">Dimensão do Treinamento TWTTP</th>
                    <th className="py-2 px-3 w-20 text-center">Status</th>
                    <th className="py-2 px-3">Evidência Factual Observada no Posto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      1. Sabia o QUE fazer? (Padrão/POP)
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${investigation.twttp.knewWhat ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {investigation.twttp.knewWhat ? 'SIM' : 'NÃO'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {investigation.twttp.knewWhatDetails || 'Não registrado'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      2. Sabia COMO fazer? (Prática Gemba)
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${investigation.twttp.knewHow ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {investigation.twttp.knewHow ? 'SIM' : 'NÃO'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {investigation.twttp.knewHowDetails || 'Não registrado'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      3. Sabia o PORQUÊ fazer? (Risco/Impacto)
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${investigation.twttp.knewWhy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {investigation.twttp.knewWhy ? 'SIM' : 'NÃO'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {investigation.twttp.knewWhyDetails || 'Não registrado'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      4. Tinha CONDIÇÕES no posto? (Ergonomia/Layout)
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${investigation.twttp.hadConditions ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {investigation.twttp.hadConditions ? 'SIM' : 'NÃO'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {investigation.twttp.hadConditionsDetails || 'Não registrado'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
              <span className="font-bold text-indigo-900 text-[11px] block">
                Método de Ensino do Líder: {leaderLevelNames[investigation.twttp.leaderInstructionMethod] || `Nível ${investigation.twttp.leaderInstructionMethod}`}
              </span>
              <p className="text-slate-700 text-xs">
                {investigation.twttp.leaderNotes || 'Liderança orientada a aplicar o ciclo de 4 passos com validação em campo.'}
              </p>
            </div>
          </div>

          {/* Section 3: HERCA Classification & 5 Whys */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 border-l-4 border-purple-600 pl-2 text-xs">
              3. Análise HERCA & Desdobramento dos 5 Porquês
            </h3>

            <div className="p-3 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Classificação HERCA</span>
                  <strong className="text-purple-900 text-xs">{errorTypeLabels[investigation.hercaErrorType] || investigation.hercaErrorType}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Categoria Ishikawa</span>
                  <strong className="text-slate-800 text-xs">{investigation.fiveWhys.rootCauseCategory}</strong>
                </div>
              </div>

              {investigation.hercaSystemicFactors && investigation.hercaSystemicFactors.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fatores Sistêmicos Identificados</span>
                  <div className="flex flex-wrap gap-1.5">
                    {investigation.hercaSystemicFactors.map(factor => (
                      <span key={factor} className="px-2 py-0.5 rounded-md bg-white border border-purple-200 text-purple-800 text-[10px] font-medium">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 5 Whys Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-1.5 px-3 w-16 text-center">Nível</th>
                    <th className="py-1.5 px-3">Questionamento dos 5 Porquês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { num: '1º Por quê', text: investigation.fiveWhys.why1 },
                    { num: '2º Por quê', text: investigation.fiveWhys.why2 },
                    { num: '3º Por quê', text: investigation.fiveWhys.why3 },
                    { num: '4º Por quê', text: investigation.fiveWhys.why4 },
                    { num: '5º Por quê', text: investigation.fiveWhys.why5 },
                  ].map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 text-center font-bold text-slate-500 bg-slate-50/50">{item.num}</td>
                      <td className="py-1.5 px-3 text-slate-700">{item.text || 'Etapa não desdobrada'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-purple-100/70 border border-purple-300 rounded-xl">
              <span className="font-bold text-purple-950 uppercase text-[10px] block">Declaração da Causa Raiz Sistêmica (Conclusão HERCA):</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5 leading-relaxed">
                {investigation.fiveWhys.rootCauseStatement || 'Deficiência ergonômica ou de processo associada a instrução incompleta no Gemba.'}
              </p>
            </div>
          </div>

          {/* Section 4: 5W2H Action Plan */}
          <div className="space-y-2">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 border-l-4 border-emerald-600 pl-2 text-xs">
              4. Plano de Ação 5W2H & Hierarquia de Barreiras WCM
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[9px] border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-2">Hierarquia WCM</th>
                    <th className="py-2 px-2">O que (What) / Como (How)</th>
                    <th className="py-2 px-2">Quem (Who)</th>
                    <th className="py-2 px-2">Prazo</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {investigation.actions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-3 text-center text-slate-400">Nenhuma ação cadastrada.</td>
                    </tr>
                  ) : (
                    investigation.actions.map(act => (
                      <tr key={act.id}>
                        <td className="py-2 px-2 font-bold text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md inline-block ${
                            act.hierarchy === 'poka_yoke' ? 'bg-purple-100 text-purple-800' :
                            act.hierarchy === 'engineering' ? 'bg-blue-100 text-blue-800' :
                            act.hierarchy === 'visual_control' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {hierarchyNames[act.hierarchy] || act.hierarchy}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <strong className="text-slate-900 block">{act.title || act.what}</strong>
                          <span className="text-[10px] text-slate-600">{act.how}</span>
                        </td>
                        <td className="py-2 px-2 font-semibold text-slate-800 whitespace-nowrap">{act.who}</td>
                        <td className="py-2 px-2 text-slate-600 whitespace-nowrap">{new Date(act.whenDate).toLocaleDateString('pt-BR')}</td>
                        <td className="py-2 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            act.status === 'verified_effective' ? 'bg-emerald-100 text-emerald-800' :
                            act.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {act.status === 'verified_effective' ? '✓ Eficaz' : act.status === 'completed' ? 'Concluída' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: OPL Summary (Optional) */}
          {includeOplSummary && investigation.opl && (
            <div className="space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-slate-900 border-l-4 border-indigo-600 pl-2 text-xs">
                5. Lição de Ponto Único Vinculada ({investigation.opl.code})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                  <span className="font-bold text-rose-800 text-[10px] uppercase block">Cenário de Risco (Não Fazer):</span>
                  <p className="text-slate-700 text-xs mt-1 leading-relaxed">{investigation.opl.problemScenario}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="font-bold text-emerald-800 text-[10px] uppercase block">Procedimento Padrão (Prática Correta):</span>
                  <p className="text-slate-700 text-xs mt-1 leading-relaxed">{investigation.opl.standardPractice}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Official Sign-off and Signatures */}
          <div className="pt-4 border-t-2 border-slate-900 space-y-4">
            <div className="text-[10px] text-slate-500 italic text-center">
              Este dossiê técnico foi elaborado conforme as diretrizes do World Class Manufacturing para prevenção de recorrência de falha humana.
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <strong className="block text-slate-900">{investigation.leadInvestigator || 'Investigador WCM'}</strong>
                <span className="text-[10px] text-slate-500">Líder da Investigação / Especialista</span>
              </div>

              <div className="border-t border-slate-400 pt-2">
                <strong className="block text-slate-900">Gerência de Produção / Operações</strong>
                <span className="text-[10px] text-slate-500">Responsável pela Área</span>
              </div>

              <div className="border-t border-slate-400 pt-2">
                <strong className="block text-slate-900">Coordenação de Qualidade & EHS</strong>
                <span className="text-[10px] text-slate-500">Auditoria & Validação de Eficácia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info (Hidden on print) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>
            Dica: Ao imprimir, selecione <strong>&quot;Salvar como PDF&quot;</strong> na impressora do navegador e ative a opção <strong>&quot;Gráficos de segundo plano&quot;</strong> para preservar as cores e selos.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Fechar Visualizador
          </button>
        </div>
      </div>
    </div>
  );
}

