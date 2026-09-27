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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* VIP Portal Header with Client Branding */}
        <div className="p-6 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-black text-lg">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-primary font-mono font-bold">
                  PORTAL DO CLIENTE VIP
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  CONTRATO ATIVO
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">{client.name}</h2>
              <p className="text-xs text-zinc-400">
                Transparência total em engenharia de manutenção, PMOC e chamados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Nav */}
        <div className="flex border-b border-border bg-muted/20 px-6 pt-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Visão Geral de Conformidade
          </button>
          <button
            onClick={() => setActiveTab('equipments')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'equipments'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Parque de Equipamentos ({clientEquipments.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'reports'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
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
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Conformidade Legal PMOC / NR
                  </span>
                  <div className="text-2xl font-black text-emerald-500 mt-1">100% Regular</div>
                  <span className="text-[11px] text-muted-foreground">Laudos emitidos e com ART</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    SLA Emergencial Contratado
                  </span>
                  <div className="text-2xl font-black text-primary mt-1">{client.slaHours} Horas</div>
                  <span className="text-[11px] text-muted-foreground">Tempo máx para técnico no local</span>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Disponibilidade das Máquinas
                  </span>
                  <div className="text-2xl font-black text-foreground mt-1">99.2%</div>
                  <span className="text-[11px] text-muted-foreground">Uptime operacional no mês</span>
                </div>
              </div>

              {/* Compliance Certificate Banner */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Certificado de Gestão Preventiva & PMOC Ativo
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Válido até Dezembro de 2026. Auditoria técnica realizada sob responsabilidade
                      do Eng. Responsável.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => alert('Download do Certificado PMOC em PDF iniciado com sucesso!')}
                  className="px-4 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground font-semibold flex items-center gap-2 shrink-0 transition"
                >
                  <Download className="w-4 h-4 text-primary" />
                  Baixar Certificado PMOC
                </button>
              </div>

              {/* SOS Emergency Hotline */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Precisa de Atendimento Emergencial Imediato?
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Plantão 24 horas dedicado ao cliente {client.name} (SLA {client.slaHours}h).
                  </span>
                </div>
                <a
                  href="https://wa.me/?text=SOS%20Chamado%20de%20Emergencia%20Aptis"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-sm transition"
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
                  className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">{eq.tag}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        Operacional
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">{eq.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {eq.brand} {eq.model} • {eq.locationInPlant}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Próxima Preventiva:</span>
                    <span className="text-xs font-bold font-mono text-foreground">
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
                  className="p-4 rounded-2xl border border-border bg-card flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-mono font-bold text-primary">
                      {order.orderNumber}
                    </span>
                    <h4 className="text-xs font-bold text-foreground mt-0.5">
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Executado por {order.technicianName} em {order.scheduledDate}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      alert(`Relatório técnico da OS ${order.orderNumber} gerado em PDF com sucesso!`)
                    }
                    className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-semibold flex items-center gap-1.5 border border-border"
                  >
                    <Download className="w-3.5 h-3.5 text-primary" />
                    Baixar Relatório Assinado
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-end bg-muted/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 rounded-xl"
          >
            Fechar Simulação
          </button>
        </div>
      </div>
    </div>
  );
};
