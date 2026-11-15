'use client';

import React from 'react';
import { TrainingRecord } from '../types';
import { 
  X, 
  User, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  FileCheck, 
  Download, 
  Printer, 
  Paperclip, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Clock
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';

interface EmployeeDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string | null;
  trainings: TrainingRecord[];
  onRenewRecord: (recordId: string) => void;
  tintedGlass?: boolean;
}

export const EmployeeDossierModal: React.FC<EmployeeDossierModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  trainings,
  onRenewRecord,
  tintedGlass = false
}) => {
  if (!isOpen || !employeeName) return null;

  const records = trainings.filter(t => t.employeeName === employeeName);
  const employeeDepartment = records[0]?.department || 'Operações Fabris';
  const employeeRole = records[0]?.employeeRole || 'Operador Especialista';

  const hasExpired = records.some(r => getDaysUntil(r.expiryDate) < 0);
  const hasExpiring = records.some(r => {
    const days = getDaysUntil(r.expiryDate);
    return days >= 0 && days <= 60;
  });

  const nrRecords = records.filter(r => r.type === 'NR' || r.courseName.includes('NR'));
  const popRecords = records.filter(r => r.type === 'POP' || r.courseName.includes('POP'));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-3xl shadow-2xl max-w-3xl w-full p-6 border my-8 transition-all ${
          tintedGlass
            ? 'aptis-glass-modal text-white border-white/10'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base shadow-sm ${
              tintedGlass ? 'bg-blue-600/30 border border-blue-400/40 text-cyan-300' : 'bg-slate-900 text-white'
            }`}>
              {employeeName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{employeeName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasExpired
                    ? tintedGlass ? 'bg-rose-500/20 text-rose-300 border-rose-500/35' : 'bg-rose-100 text-rose-800 border-rose-200'
                    : hasExpiring
                    ? tintedGlass ? 'bg-amber-500/20 text-amber-300 border-amber-500/35' : 'bg-amber-100 text-amber-800 border-amber-200'
                    : tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {hasExpired ? '🚨 BLOQUEIO POR NR/POP VENCIDO' : hasExpiring ? '⚠️ RECICLAGEM EM AGENDAMENTO' : '✅ 100% APTO & CONFORME'}
                </span>
              </div>
              <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                {employeeRole} • Setor: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{employeeDepartment}</strong> • Dossiê de Auditoria MTE & ISO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Seção 1: Normas Regulamentadoras (NRs de SST) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}>
                <ShieldCheck className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                Normas Regulamentadoras de Segurança (NRs)
              </h3>
              <span className={`text-[11px] font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                {nrRecords.length} certificação(ões) registrada(s)
              </span>
            </div>

            <div className="space-y-2">
              {nrRecords.length === 0 ? (
                <div className={`p-3 text-slate-400 text-xs italic rounded-lg border ${
                  tintedGlass ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  Nenhuma NR cadastrada para este colaborador.
                </div>
              ) : (
                nrRecords.map(nr => {
                  const days = getDaysUntil(nr.expiryDate);
                  const isExpired = days < 0;
                  const isExpiring = days >= 0 && days <= 60;

                  return (
                    <div
                      key={nr.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        tintedGlass
                          ? 'aptis-glass-subcard border-white/10 hover:border-white/20'
                          : 'bg-slate-50/70 hover:bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                            {nr.courseName}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            tintedGlass
                              ? 'text-slate-300 bg-white/10 border-white/15'
                              : 'text-slate-400 bg-white border-slate-200'
                          }`}>
                            {nr.certificateCode}
                          </span>
                        </div>
                        <div className={`text-[11px] mt-1 flex items-center gap-3 flex-wrap ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>Conclusão: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{formatDate(nr.completedDate)}</strong></span>
                          <span>Validade: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{formatDate(nr.expiryDate)}</strong></span>
                          {nr.attachments?.length > 0 && (
                            <span className={`font-semibold flex items-center gap-0.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-700'}`}>
                              <Paperclip className="w-3 h-3" /> {nr.attachments.length} arquivo(s) anexado(s)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        {isExpired ? (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border animate-pulse ${
                            tintedGlass ? 'bg-rose-500/20 text-rose-300 border-rose-500/35' : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            🔴 Vencido ({Math.abs(days)}d)
                          </span>
                        ) : isExpiring ? (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                            tintedGlass ? 'bg-amber-500/20 text-amber-300 border-amber-500/35' : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}>
                            🟡 Vence em {days}d
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                            tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            🟢 Válido ({days}d)
                          </span>
                        )}

                        <button
                          onClick={() => onRenewRecord(nr.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                            tintedGlass
                              ? 'text-slate-200 bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border-white/15'
                              : 'text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-800 border-slate-200'
                          }`}
                        >
                          Renovar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Seção 2: Procedimentos Operacionais Padrão (POPs) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}>
                <FileCheck className={`w-4 h-4 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`} />
                Procedimentos Operacionais Padrão (POPs) & Qualidade
              </h3>
              <span className={`text-[11px] font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                {popRecords.length} POP(s) homologado(s)
              </span>
            </div>

            <div className="space-y-2">
              {popRecords.length === 0 ? (
                <div className={`p-3 text-slate-400 text-xs italic rounded-lg border ${
                  tintedGlass ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  Nenhum POP registrado para este colaborador.
                </div>
              ) : (
                popRecords.map(pop => {
                  const days = getDaysUntil(pop.expiryDate);
                  const isExpired = days < 0;

                  return (
                    <div
                      key={pop.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                        tintedGlass
                          ? 'aptis-glass-subcard border-amber-500/25 hover:border-amber-500/40'
                          : 'bg-amber-50/30 hover:bg-white border-amber-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                            {pop.courseName}
                          </span>
                          {pop.version && (
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              tintedGlass ? 'text-amber-300 bg-amber-500/20' : 'text-amber-800 bg-amber-100'
                            }`}>
                              {pop.version}
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] mt-1 flex items-center gap-3 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>Treinado em: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{formatDate(pop.completedDate)}</strong></span>
                          <span>Reciclagem: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{formatDate(pop.expiryDate)}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        {isExpired ? (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                            tintedGlass ? 'bg-rose-500/20 text-rose-300 border-rose-500/35' : 'bg-rose-100 text-rose-800 border-rose-200'
                          }`}>
                            🔴 Reciclagem Vencida
                          </span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                            tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          }`}>
                            🟢 Habilitado
                          </span>
                        )}

                        <button
                          onClick={() => onRenewRecord(pop.id)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                            tintedGlass
                              ? 'text-slate-200 bg-white/10 hover:bg-white/20 border-white/15'
                              : 'text-slate-700 bg-white hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          Revalidar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`flex items-center justify-between pt-4 border-t ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={handlePrint}
            type="button"
            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              tintedGlass
                ? 'aptis-glass-subcard text-slate-200 hover:text-white border-white/15'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            <Printer className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-slate-600'}`} />
            Imprimir Dossiê Oficial (MTE / ISO)
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer"
          >
            Fechar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
