'use client';

import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  MapPin, 
  User, 
  Calendar, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { OnePointLesson, HercaInvestigation } from '../types';

interface OplModalProps {
  investigation: HercaInvestigation | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveOpl?: (investigationId: string, opl: OnePointLesson) => void;
  tintedGlass?: boolean;
}

export function OplModal({
  investigation,
  isOpen,
  onClose,
  tintedGlass = false,
}: OplModalProps) {
  if (!isOpen || !investigation || !investigation.opl) return null;

  const opl = investigation.opl;

  const handlePrint = () => {
    window.print();
  };

  const classificationLabels: Record<string, string> = {
    basic_knowledge: 'Conhecimento Básico',
    trouble_case: 'Caso de Problema (Prevenção de Recorrência)',
    improvement: 'Melhoria de Processo',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl flex flex-col my-8 max-h-[92vh] overflow-hidden ${
        tintedGlass
          ? 'aptis-glass-modal border-white/10 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Top Bar */}
        <div className={`p-4 border-b flex items-center justify-between print:hidden ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl ${
              tintedGlass ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-600'
            }`}>
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <span className={`text-[11px] font-mono font-bold ${tintedGlass ? 'text-indigo-300' : 'text-indigo-600'}`}>
                {opl.code}
              </span>
              <h3 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                Lição de Ponto Único (OPL / LPU)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                tintedGlass
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir para o Posto
            </button>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl transition cursor-pointer ${
                tintedGlass
                  ? 'text-slate-400 hover:text-white hover:bg-white/10'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable OPL Document Container */}
        <div className={`p-6 md:p-8 overflow-y-auto space-y-6 print:p-0 print:border-none ${
          tintedGlass ? 'text-slate-200' : 'bg-white text-slate-800'
        }`}>
          {/* OPL Standard Header */}
          <div className={`border-2 rounded-2xl p-5 relative overflow-hidden ${
            tintedGlass ? 'border-indigo-500/50 aptis-glass-subcard' : 'border-indigo-600'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${
              tintedGlass ? 'border-white/10' : 'border-indigo-100'
            }`}>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black uppercase tracking-wider">
                  OPL • WCM
                </span>
                <span className={`font-mono text-sm font-bold ${tintedGlass ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  {opl.code}
                </span>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                tintedGlass
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/35'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {classificationLabels[opl.classification] || opl.classification}
              </span>
            </div>

            <div className="mt-3">
              <h2 className={`text-xl font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                {opl.title}
              </h2>
              <div className={`mt-2 flex flex-wrap items-center gap-4 text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Área: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{opl.area}</strong>
                </span>
                <span>•</span>
                <span>Posto: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{opl.station}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {new Date(opl.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Problem Scenario vs Standard Practice (Side by Side Comparison) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Como NÃO Fazer (Problema) */}
            <div className={`p-4 rounded-2xl border-2 space-y-2 ${
              tintedGlass
                ? 'border-rose-500/40 bg-rose-950/30'
                : 'border-rose-200 bg-rose-50/30'
            }`}>
              <div className={`flex items-center gap-2 font-bold text-xs uppercase ${tintedGlass ? 'text-rose-300' : 'text-rose-700'}`}>
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                  ✕
                </div>
                <span>Cenário de Risco / Não Fazer</span>
              </div>
              <p className={`text-xs leading-relaxed font-medium ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                {opl.problemScenario}
              </p>
            </div>

            {/* Como Fazer (Padrão Correto) */}
            <div className={`p-4 rounded-2xl border-2 space-y-2 ${
              tintedGlass
                ? 'border-emerald-500/40 bg-emerald-950/30'
                : 'border-emerald-300 bg-emerald-50/40'
            }`}>
              <div className={`flex items-center gap-2 font-bold text-xs uppercase ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>Prática Padrão / Procedimento Correto</span>
              </div>
              <p className={`text-xs leading-relaxed font-medium whitespace-pre-line ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                {opl.standardPractice}
              </p>
            </div>
          </div>

          {/* Key Safety & Quality Point */}
          <div className={`p-4 rounded-2xl border-l-4 border-l-amber-500 border space-y-1 ${
            tintedGlass
              ? 'border-white/10 bg-amber-950/25'
              : 'border-slate-200 bg-amber-50/40'
          }`}>
            <div className={`flex items-center gap-2 font-bold text-xs uppercase ${tintedGlass ? 'text-amber-300' : 'text-amber-700'}`}>
              <AlertTriangle className="w-4 h-4" />
              <span>Ponto Crítico de Segurança & Qualidade (Key Point)</span>
            </div>
            <p className={`text-xs font-semibold leading-relaxed ${tintedGlass ? 'text-slate-200' : 'text-slate-800'}`}>
              {opl.keySafetyQualityPoint}
            </p>
          </div>

          {/* Why It Matters */}
          <div className={`p-4 rounded-2xl border space-y-1 ${
            tintedGlass
              ? 'border-indigo-500/30 bg-indigo-950/25'
              : 'border-indigo-100 bg-indigo-50/30'
          }`}>
            <div className={`flex items-center gap-2 font-bold text-xs uppercase ${tintedGlass ? 'text-indigo-300' : 'text-indigo-700'}`}>
              <Sparkles className="w-4 h-4" />
              <span>Por Que Este Padrão é Essencial? (Impacto Evitado)</span>
            </div>
            <p className={`text-xs leading-relaxed ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
              {opl.whyItMatters}
            </p>
          </div>

          {/* Shopfloor Sign-off and Leader Validation */}
          <div className={`pt-4 border-t-2 border-dashed grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs ${
            tintedGlass ? 'border-white/15' : 'border-slate-200'
          }`}>
            <div className={`p-3 rounded-xl border ${
              tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Elaborado por:</span>
              <p className={`font-bold mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>{opl.preparedBy}</p>
              <div className={`mt-3 pt-2 border-t text-[10px] text-slate-400 flex justify-between ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}>
                <span>Assinatura Digital</span>
                <span>Auditado Gemba</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${
              tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Aprovado por:</span>
              <p className={`font-bold mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>{opl.approvedBy}</p>
              <div className={`mt-3 pt-2 border-t text-[10px] text-slate-400 flex justify-between ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}>
                <span>Validação Gerencial</span>
                <span>Pilar Qualidade WCM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs print:hidden ${
          tintedGlass ? 'border-white/10 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <span className={tintedGlass ? 'text-slate-300' : 'text-slate-500'}>
            Documento gerado automaticamente pelo módulo <strong>Aptis TWTTP & HERCA</strong>.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
          >
            Fechar Visualizador
          </button>
        </div>
      </div>
    </div>
  );
}

