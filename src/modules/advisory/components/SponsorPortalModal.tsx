'use client';

import React from 'react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  X,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import { ConsultingClient, ProjectDeliverable, FinancialImpactGain } from '../types';

interface SponsorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ConsultingClient | null;
  deliverables: ProjectDeliverable[];
  gains: FinancialImpactGain[];
}

export const SponsorPortalModal: React.FC<SponsorPortalModalProps> = ({
  isOpen,
  onClose,
  client,
  deliverables,
  gains,
}) => {
  if (!isOpen || !client) return null;

  const clientDeliverables = deliverables.filter((d) => d.clientId === client.id);
  const clientGains = gains.filter((g) => g.clientId === client.id);

  const completed = clientDeliverables.filter((d) => d.status === 'completed').length;
  const blocked = clientDeliverables.filter((d) => d.status === 'blocked_by_client');
  const total = clientDeliverables.length || 1;
  const progressPercent = Math.round((completed / total) * 100);

  const totalGains = clientGains.reduce((sum, g) => sum + g.verifiedAmount, 0);
  const roi = (totalGains / (client.totalContractValue || 1)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* VIP Sponsor Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-black text-xl shadow-inner">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono font-bold">
                  PORTAL DO PATROCINADOR EXECUTIVO
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  DIRETORIA
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{client.sponsorName}</h2>
              <p className="text-xs text-slate-300">
                {client.sponsorRole} • {client.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - Solid White */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-white">
          {/* Top 3 High-Impact Cards for the CEO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Progresso Global
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">{progressPercent}%</div>
              <span className="text-[11px] text-slate-500">
                {completed} de {total} marcos entregues
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
                Retorno do Investimento
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{roi}x ROI</div>
              <span className="text-[11px] text-emerald-800 font-medium">
                {totalGains.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} validados
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Consultor Líder
              </span>
              <div className="text-sm font-bold text-blue-700 mt-1">{client.consultantLead}</div>
              <span className="text-[11px] text-slate-500">Contato direto com a diretoria</span>
            </div>
          </div>

          {/* Attention Required: Blockers pending Board Action */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Decisões & Desbloqueios que Precisam da sua Intervenção ({blocked.length})
              </h3>
            </div>

            {blocked.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Excelente! Todas as equipes estão respondendo no prazo e sem nenhum gargalo.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold block">{b.title}</strong>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        <strong>Motivo do bloqueio:</strong> {b.blockReason}
                      </p>
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Responsável interno cobrado: <strong>{b.responsibleClientPeer}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => alert(`Aviso de prioridade enviado para ${b.responsibleClientPeer}!`)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] whitespace-nowrap transition cursor-pointer shadow-xs"
                    >
                      Cobrar Equipe Interna
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scope Boundaries - No Scope Creep! */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-900 block">
              Alinhamento de Escopo do Contrato
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div>
                <span className="font-bold text-emerald-700 block mb-1">✓ No Escopo Contratado:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                  {client.inScopeSummary.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="font-bold text-slate-500 block mb-1">✕ Fora de Escopo (Aditivos):</span>
                <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                  {client.outOfScopeSummary.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition cursor-pointer shadow-2xs"
          >
            Fechar Simulação
          </button>
        </div>
      </div>
    </div>
  );
};
