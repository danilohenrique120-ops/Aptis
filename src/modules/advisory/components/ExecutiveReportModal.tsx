'use client';

import React from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Building2,
  Award,
} from 'lucide-react';
import {
  ConsultingClient,
  ProjectDeliverable,
  FinancialImpactGain,
  MaturityPillar,
} from '../types';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ConsultingClient;
  deliverables: ProjectDeliverable[];
  gains: FinancialImpactGain[];
  pillars: MaturityPillar[];
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  client,
  deliverables,
  gains,
  pillars,
}) => {
  if (!isOpen) return null;

  const clientDeliverables = deliverables.filter((d) => d.clientId === client.id);
  const clientGains = gains.filter((g) => g.clientId === client.id);

  const completedCount = clientDeliverables.filter((d) => d.status === 'completed').length;
  const blockedCount = clientDeliverables.filter((d) => d.status === 'blocked_by_client').length;
  const totalCount = clientDeliverables.length || 1;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const totalGains = clientGains.reduce((sum, g) => sum + g.verifiedAmount, 0);
  const roi = (totalGains / (client.totalContractValue || 1)).toFixed(1);

  const initialAvg = pillars.reduce((a, b) => a + b.initialScore, 0) / (pillars.length || 1);
  const currentAvg = pillars.reduce((a, b) => a + b.currentScore, 0) / (pillars.length || 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Relatório Executivo Mensal • Apresentação de Diretoria</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shadow-blue-600/20 hover:from-blue-500 hover:to-indigo-500 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Salvar PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable One-Page Summary Document Container */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 bg-white text-slate-800" id="printable-executive-report">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-slate-900 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black tracking-widest uppercase text-blue-700">
                <span>APTIS ADVISORY</span>
                <span>•</span>
                <span>GOVERNANÇA & RESULTADOS</span>
              </div>
              <h1 className="text-2xl font-black text-slate-950 mt-1">
                Relatório de Prestação de Contas Executiva
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Cliente: <strong className="text-slate-900 font-bold">{client.name}</strong> • CNPJ: {client.cnpj}
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Competência:</span>
              <span className="font-bold text-slate-900 text-sm">
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <span className="text-[11px] text-slate-500 block">Sponsor: {client.sponsorName}</span>
            </div>
          </div>

          {/* Top 3 Strategic Metric Boxes */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/70">
              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                Progresso Físico
              </span>
              <div className="text-2xl font-black text-slate-900 mt-0.5">{progressPercent}%</div>
              <span className="text-[10px] text-slate-500">
                {completedCount} de {totalCount} entregas concluídas
              </span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/60">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                ROI Financeiro Comprovado
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">{roi}x</div>
              <span className="text-[10px] text-emerald-800 font-medium">
                {totalGains.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em economias
              </span>
            </div>

            <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/60">
              <span className="text-[10px] font-bold uppercase text-blue-800 block">
                Maturidade de Gestão
              </span>
              <div className="text-2xl font-black text-blue-700 mt-0.5">
                {initialAvg.toFixed(1)} ➔ {currentAvg.toFixed(1)}
              </div>
              <span className="text-[10px] text-blue-800 font-medium">
                Escala de 1 a 5 pontos
              </span>
            </div>
          </div>

          {/* Section 1: Entregas Realizadas no Mês */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              1. Entregas & Marcos Realizados
            </h3>

            <div className="space-y-1.5 text-xs">
              {clientDeliverables
                .filter((d) => d.status === 'completed')
                .map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3"
                  >
                    <div>
                      <strong className="text-slate-900 block font-bold">{d.title}</strong>
                      <p className="text-[11px] text-slate-600 mt-0.5">{d.deliverableSummary}</p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold shrink-0 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Concluído em {d.completionDate || d.dueDate}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 2: Pontos de Atenção & Semáforo de Bloqueios */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              2. Pontos de Atenção & Dependências no Cliente
            </h3>

            {blockedCount === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 rounded-lg border border-slate-200 bg-slate-50">
                Nenhum entregável bloqueado ou pendente de aprovação pela equipe do cliente no momento.
              </p>
            ) : (
              <div className="space-y-1.5 text-xs">
                {clientDeliverables
                  .filter((d) => d.status === 'blocked_by_client')
                  .map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-lg border border-amber-300 bg-amber-50/70 flex items-start justify-between gap-3 text-amber-950"
                    >
                      <div>
                        <strong className="block font-bold">{d.title}</strong>
                        <p className="text-[11px] mt-0.5 text-amber-900">
                          <strong>Gargalo:</strong> {d.blockReason}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300 shrink-0">
                        Pendente: {d.responsibleClientPeer}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Section 3: Ganhos Financeiros Validados */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              3. Resultados Financeiros & Eficiência Apurada
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {clientGains.map((g) => (
                <div key={g.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-900 text-xs">{g.title}</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {g.verifiedAmount.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Validado por: {g.validatedByName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Signoff */}
          <div className="pt-8 border-t-2 border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">
                {client.consultantLead}
              </div>
              <span className="text-[11px] text-slate-500">Consultoria Responsável • Aptis Advisory</span>
            </div>

            <div>
              <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">
                {client.sponsorName}
              </div>
              <span className="text-[11px] text-slate-500">
                {client.sponsorRole} • {client.name}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
