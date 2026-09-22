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
}

export function OplModal({
  investigation,
  isOpen,
  onClose,
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
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col my-8 max-h-[92vh] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {opl.code}
              </span>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Lição de Ponto Único (OPL / LPU)
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir para o Posto
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable OPL Document Container */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 print:p-0 print:border-none">
          {/* OPL Standard Header */}
          <div className="border-2 border-indigo-600 dark:border-indigo-500 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-100 dark:border-indigo-900/60 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-xs font-black uppercase tracking-wider">
                  OPL • WCM
                </span>
                <span className="font-mono text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  {opl.code}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {classificationLabels[opl.classification] || opl.classification}
              </span>
            </div>

            <div className="mt-3">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {opl.title}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Área: <strong className="text-slate-700 dark:text-slate-300">{opl.area}</strong>
                </span>
                <span>•</span>
                <span>Posto: <strong className="text-slate-700 dark:text-slate-300">{opl.station}</strong></span>
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
            <div className="p-4 rounded-2xl border-2 border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase text-rose-700 dark:text-rose-400">
                <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                  ✕
                </div>
                <span>Cenário de Risco / Não Fazer</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {opl.problemScenario}
              </p>
            </div>

            {/* Como Fazer (Padrão Correto) */}
            <div className="p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase text-emerald-700 dark:text-emerald-400">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span>Prática Padrão / Procedimento Correto</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-line">
                {opl.standardPractice}
              </p>
            </div>
          </div>

          {/* Key Safety & Quality Point */}
          <div className="p-4 rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Ponto Crítico de Segurança & Qualidade (Key Point)</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {opl.keySafetyQualityPoint}
            </p>
          </div>

          {/* Why It Matters */}
          <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs uppercase text-indigo-700 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
              <span>Por Que Este Padrão é Essencial? (Impacto Evitado)</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {opl.whyItMatters}
            </p>
          </div>

          {/* Shopfloor Sign-off and Leader Validation */}
          <div className="pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Elaborado por:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{opl.preparedBy}</p>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 flex justify-between">
                <span>Assinatura Digital</span>
                <span>Auditado Gemba</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Aprovado por:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{opl.approvedBy}</p>
              <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 flex justify-between">
                <span>Validação Gerencial</span>
                <span>Pilar Qualidade WCM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs print:hidden">
          <span className="text-slate-500">
            Documento gerado automaticamente pelo módulo <strong>Aptis TWTTP & HERCA</strong>.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition shadow-xs"
          >
            Fechar Visualizador
          </button>
        </div>
      </div>
    </div>
  );
}

