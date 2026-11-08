'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Wrench,
  FileText,
  X,
  PhoneCall,
  Download,
} from 'lucide-react';
import { ClientContractor, Equipment, MaintenanceWorkOrder } from '../types';

interface ClientPortalModalProps {
  tintedGlass?: boolean;
  isOpen: boolean;
  onClose: () => void;
  client: ClientContractor | null;
  equipments: Equipment[];
  workOrders: MaintenanceWorkOrder[];
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  tintedGlass = false,
  isOpen,
  onClose,
  client,
  equipments,
  workOrders,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'equipments' | 'reports'>('overview');

  if (!isOpen || !client) return null;

  const clientEquipments = equipments.filter((e) => e.clientId === client.id);
  const clientOrders = workOrders.filter((o) => o.clientId === client.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 ${
          tintedGlass
            ? 'aptis-glass-modal text-white'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        {/* VIP Portal Header with Client Branding */}
        <div
          className={`p-6 border-b flex items-center justify-between ${
            tintedGlass ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-2xl border border-cyan-400/35 flex items-center justify-center text-white font-black text-xl shadow-inner"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.35)',
              }}
            >
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase tracking-widest font-mono font-bold ${
                    tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                  }`}
                >
                  PORTAL DO CLIENTE VIP
                </span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    tintedGlass
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  CONTRATO ATIVO
                </span>
              </div>
              <h2
                className={`text-xl font-black mt-0.5 ${
                  tintedGlass ? 'text-white' : 'text-slate-900'
                }`}
              >
                {client.name}
              </h2>
              <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Transparência total em engenharia de manutenção, PMOC e chamados técnicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Nav */}
        <div
          className={`flex border-b px-6 pt-2 ${
            tintedGlass ? 'border-white/10 bg-white/[0.01]' : 'border-slate-200 bg-slate-50/40'
          }`}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? tintedGlass
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-blue-600 text-blue-600'
                : tintedGlass
                ? 'border-transparent text-slate-400 hover:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Visão Geral de Conformidade
          </button>
          <button
            onClick={() => setActiveTab('equipments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'equipments'
                ? tintedGlass
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-blue-600 text-blue-600'
                : tintedGlass
                ? 'border-transparent text-slate-400 hover:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Parque de Equipamentos ({clientEquipments.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'reports'
                ? tintedGlass
                  ? 'border-cyan-400 text-cyan-300'
                  : 'border-blue-600 text-blue-600'
                : tintedGlass
                ? 'border-transparent text-slate-400 hover:text-white'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Laudos & Relatórios Técnicos
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div
                  className={`p-4 rounded-2xl ${
                    tintedGlass
                      ? 'aptis-glass-subcard'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Conformidade Legal PMOC / NR
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  >
                    100% Regular
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Laudos emitidos com ART
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl ${
                    tintedGlass
                      ? 'aptis-glass-subcard'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    SLA Emergencial Contratado
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                    }`}
                  >
                    {client.slaHours} Horas
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Tempo máx no local
                  </span>
                </div>

                <div
                  className={`p-4 rounded-2xl ${
                    tintedGlass
                      ? 'aptis-glass-subcard'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider block ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Disponibilidade das Máquinas
                  </span>
                  <div
                    className={`text-2xl font-black mt-1 ${
                      tintedGlass ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    99.2%
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Uptime operacional no mês
                  </span>
                </div>
              </div>

              {/* Compliance Certificate Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  tintedGlass
                    ? 'bg-emerald-500/15 border-emerald-400/35'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                      tintedGlass
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4
                      className={`text-sm font-bold ${
                        tintedGlass ? 'text-white' : 'text-emerald-950'
                      }`}
                    >
                      Certificado de Gestão Preventiva & PMOC Ativo
                    </h4>
                    <p
                      className={`text-xs mt-0.5 ${
                        tintedGlass ? 'text-emerald-200' : 'text-emerald-800'
                      }`}
                    >
                      Válido até Dezembro de 2026. Auditoria técnica realizada sob responsabilidade
                      do Eng. Responsável.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert('Download do Certificado PMOC em PDF iniciado com sucesso!')
                  }
                  className={`px-4 py-2 rounded-xl border font-bold flex items-center gap-2 shrink-0 transition cursor-pointer ${
                    tintedGlass
                      ? 'bg-emerald-500/25 border-emerald-400/40 hover:bg-emerald-500/35 text-emerald-100'
                      : 'bg-emerald-600 border-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  Baixar Certificado PMOC
                </button>
              </div>

              {/* SOS Emergency Hotline */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  tintedGlass
                    ? 'bg-amber-500/15 border-amber-400/35'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div>
                  <span
                    className={`text-xs font-bold block ${
                      tintedGlass ? 'text-white' : 'text-amber-950'
                    }`}
                  >
                    Precisa de Atendimento Emergencial Imediato?
                  </span>
                  <span className={`text-xs ${tintedGlass ? 'text-amber-200' : 'text-amber-800'}`}>
                    Plantão 24 horas dedicado ao cliente {client.name} (SLA {client.slaHours}h).
                  </span>
                </div>
                <a
                  href="https://wa.me/?text=SOS%20Chamado%20de%20Emergencia%20Aptis"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-2 shadow-md shadow-rose-600/25 transition cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  Abrir Chamado 24h
                </a>
              </div>
            </div>
          )}

          {activeTab === 'equipments' && (
            <div className="space-y-3">
              {clientEquipments.map((eq) => (
                <div
                  key={eq.id}
                  className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition ${
                    tintedGlass
                      ? 'aptis-glass-subcard hover:border-cyan-400/40'
                      : 'bg-slate-50 border border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold ${
                          tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                        }`}
                      >
                        [{eq.tag}]
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          tintedGlass
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        Operacional
                      </span>
                    </div>
                    <h4
                      className={`text-sm font-bold mt-0.5 ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {eq.name}
                    </h4>
                    <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                      {eq.brand} {eq.model} • {eq.locationInPlant}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] block ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Próxima Preventiva:
                    </span>
                    <span
                      className={`text-xs font-bold font-mono ${
                        tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                      }`}
                    >
                      {new Date(eq.nextPreventiveDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              {clientOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition ${
                    tintedGlass
                      ? 'aptis-glass-subcard hover:border-cyan-400/40'
                      : 'bg-slate-50 border border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    >
                      {order.orderNumber}
                    </span>
                    <h4
                      className={`text-xs font-bold mt-0.5 ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p
                      className={`text-[11px] ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      Executado por {order.technicianName} em {order.scheduledDate}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      alert(
                        `Relatório técnico da OS ${order.orderNumber} gerado em PDF com sucesso!`
                      )
                    }
                    className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                      tintedGlass
                        ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-400/35'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar Relatório Assinado
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-end ${
            tintedGlass ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-5 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              tintedGlass
                ? 'text-slate-300 hover:text-white hover:bg-white/10'
                : 'text-slate-600 hover:text-slate-900 bg-slate-200/70 hover:bg-slate-200'
            }`}
          >
            Fechar Simulação
          </button>
        </div>
      </div>
    </div>
  );
};
