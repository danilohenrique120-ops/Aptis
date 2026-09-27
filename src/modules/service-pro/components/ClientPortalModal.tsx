'use client';

import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  FileText,
  AlertTriangle,
  X,
  ExternalLink,
  PhoneCall,
  Download,
  Calendar,
} from 'lucide-react';
import { ClientContractor, Equipment, MaintenanceWorkOrder } from '../types';

interface ClientPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientContractor | null;
  equipments: Equipment[];
  workOrders: MaintenanceWorkOrder[];
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* VIP Portal Header with Client Branding */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 font-black text-xl shadow-inner">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-blue-400 font-mono font-bold">
                  PORTAL DO CLIENTE VIP
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  CONTRATO ATIVO
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{client.name}</h2>
              <p className="text-xs text-slate-300">
                Transparência total em engenharia de manutenção, PMOC e chamados técnicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Nav */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Visão Geral de Conformidade
          </button>
          <button
            onClick={() => setActiveTab('equipments')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'equipments'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Parque de Equipamentos ({clientEquipments.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'reports'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Laudos & Relatórios Técnicos
          </button>
        </div>

        {/* Content Body - Solid White Background */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs bg-white">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Conformidade Legal PMOC / NR
                  </span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">100% Regular</div>
                  <span className="text-[11px] text-slate-500 font-medium">Laudos emitidos com ART</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    SLA Emergencial Contratado
                  </span>
                  <div className="text-2xl font-black text-blue-600 mt-1">{client.slaHours} Horas</div>
                  <span className="text-[11px] text-slate-500 font-medium">Tempo máx no local</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Disponibilidade das Máquinas
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">99.2%</div>
                  <span className="text-[11px] text-slate-500 font-medium">Uptime operacional no mês</span>
                </div>
              </div>

              {/* Compliance Certificate Banner */}
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Certificado de Gestão Preventiva & PMOC Ativo
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Válido até Dezembro de 2026. Auditoria técnica realizada sob responsabilidade
                      do Eng. Responsável.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Download do Certificado PMOC em PDF iniciado com sucesso!')}
                  className="px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold flex items-center gap-2 shrink-0 transition shadow-2xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-700" />
                  Baixar Certificado PMOC
                </button>
              </div>

              {/* SOS Emergency Hotline */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    Precisa de Atendimento Emergencial Imediato?
                  </span>
                  <span className="text-xs text-amber-700">
                    Plantão 24 horas dedicado ao cliente {client.name} (SLA {client.slaHours}h).
                  </span>
                </div>
                <a
                  href="https://wa.me/?text=SOS%20Chamado%20de%20Emergencia%20Aptis"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md shadow-red-600/25 transition cursor-pointer"
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
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-sm hover:border-blue-400 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">[{eq.tag}]</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Operacional
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{eq.name}</h4>
                    <p className="text-xs text-slate-500">
                      {eq.brand} {eq.model} • {eq.locationInPlant}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Próxima Preventiva:</span>
                    <span className="text-xs font-bold font-mono text-slate-900">
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
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-4 shadow-sm hover:border-blue-400 transition"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600">
                      {order.orderNumber}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Executado por {order.technicianName} em {order.scheduledDate}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      alert(`Relatório técnico da OS ${order.orderNumber} gerado em PDF com sucesso!`)
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1.5 border border-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    Baixar Relatório Assinado
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition shadow-2xs cursor-pointer"
          >
            Fechar Simulação
          </button>
        </div>
      </div>
    </div>
  );
};
