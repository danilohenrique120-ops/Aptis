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
}

export const EmployeeDossierModal: React.FC<EmployeeDossierModalProps> = ({
  isOpen,
  onClose,
  employeeName,
  trainings,
  onRenewRecord
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {employeeName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{employeeName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  hasExpired
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : hasExpiring
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {hasExpired ? '🚨 BLOQUEIO POR NR/POP VENCIDO' : hasExpiring ? '⚠️ RECICLAGEM EM AGENDAMENTO' : '✅ 100% APTO & CONFORME'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {employeeRole} • Setor: <strong>{employeeDepartment}</strong> • Dossiê de Auditoria MTE & ISO
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Seção 1: Normas Regulamentadoras (NRs de SST) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Normas Regulamentadoras de Segurança (NRs)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {nrRecords.length} certificação(ões) registrada(s)
              </span>
            </div>

            <div className="space-y-2">
              {nrRecords.length === 0 ? (
                <div className="p-3 bg-slate-50 text-slate-400 text-xs italic rounded-lg border border-slate-200">
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
                      className="p-3.5 bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{nr.courseName}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                            {nr.certificateCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
                          <span>Conclusão: <strong>{formatDate(nr.completedDate)}</strong></span>
                          <span>Validade: <strong>{formatDate(nr.expiryDate)}</strong></span>
                          {nr.attachments?.length > 0 && (
                            <span className="text-blue-700 font-semibold flex items-center gap-0.5">
                              <Paperclip className="w-3 h-3" /> {nr.attachments.length} arquivo(s) anexado(s)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        {isExpired ? (
                          <span className="text-[10px] font-bold px-2 py-1 bg-rose-100 text-rose-800 rounded-md border border-rose-200 animate-pulse">
                            🔴 Vencido ({Math.abs(days)}d)
                          </span>
                        ) : isExpiring ? (
                          <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded-md border border-amber-200">
                            🟡 Vence em {days}d
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200">
                            🟢 Válido ({days}d)
                          </span>
                        )}

                        <button
                          onClick={() => onRenewRecord(nr.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-800 rounded-md border border-slate-200 transition-colors cursor-pointer"
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
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-amber-600" />
                Procedimentos Operacionais Padrão (POPs) & Qualidade
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {popRecords.length} POP(s) homologado(s)
              </span>
            </div>

            <div className="space-y-2">
              {popRecords.length === 0 ? (
                <div className="p-3 bg-slate-50 text-slate-400 text-xs italic rounded-lg border border-slate-200">
                  Nenhum POP registrado para este colaborador.
                </div>
              ) : (
                popRecords.map(pop => {
                  const days = getDaysUntil(pop.expiryDate);
                  const isExpired = days < 0;

                  return (
                    <div
                      key={pop.id}
                      className="p-3.5 bg-amber-50/30 hover:bg-white rounded-xl border border-amber-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{pop.courseName}</span>
                          {pop.version && (
                            <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded font-bold">
                              {pop.version}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                          <span>Treinado em: <strong>{formatDate(pop.completedDate)}</strong></span>
                          <span>Reciclagem: <strong>{formatDate(pop.expiryDate)}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 justify-end">
                        {isExpired ? (
                          <span className="text-[10px] font-bold px-2 py-1 bg-rose-100 text-rose-800 rounded-md">
                            🔴 Reciclagem Vencida
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md">
                            🟢 Habilitado
                          </span>
                        )}

                        <button
                          onClick={() => onRenewRecord(pop.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={handlePrint}
            type="button"
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir Dossiê Oficial (MTE / ISO)
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Fechar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
