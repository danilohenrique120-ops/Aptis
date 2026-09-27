'use client';

import React, { useState } from 'react';
import {
  Layers,
  Wrench,
  Cpu,
  Package,
  FileCheck,
  Plus,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { MasterCatalogItem, ClientContractor, Equipment } from '../types';

interface MasterCatalogPanelProps {
  catalog: MasterCatalogItem[];
  clients: ClientContractor[];
  onDeployToClient: (model: MasterCatalogItem, clientId: string, tag: string) => void;
}

export const MasterCatalogPanel: React.FC<MasterCatalogPanelProps> = ({
  catalog,
  clients,
  onDeployToClient,
}) => {
  const [selectedItem, setSelectedItem] = useState<MasterCatalogItem | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [targetClientId, setTargetClientId] = useState<string>(clients[0]?.id || '');
  const [targetTag, setTargetTag] = useState<string>('');

  const handleOpenDeploy = (item: MasterCatalogItem) => {
    setSelectedItem(item);
    setTargetTag(`${item.category.slice(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`);
    setDeployModalOpen(true);
  };

  const handleConfirmDeploy = () => {
    if (!selectedItem || !targetClientId || !targetTag) return;
    onDeployToClient(selectedItem, targetClientId, targetTag);
    setDeployModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Catálogo Mestre Centralizado
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Modelos Padrão & Herança de Inteligência Técnica
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            Cadastre os manuais, fichas técnicas, peças de reposição e planos preventivos uma única
            vez. Ao adicionar um novo equipamento para qualquer cliente, todos os dados técnicos e
            requisitos de normas (PMOC, NR-13) são herdados automaticamente.
          </p>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border text-center shrink-0">
          <span className="text-2xl font-black text-foreground block leading-none">
            {catalog.length}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
            Modelos Homologados
          </span>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {catalog.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Category & Deploy Count */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                  {item.category}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {item.activeDeploymentsCount} Máquinas Ativas na Base
                </span>
              </div>

              {/* Title & Brand */}
              <h3 className="text-base font-bold text-foreground">
                {item.brand} {item.model}
              </h3>
              <p className="text-xs font-medium text-primary mt-0.5">
                Capacidade: {item.capacity}
              </p>

              {/* Legal Norm Pill */}
              {item.maintenancePlan.legalNorm && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3" />
                  Atende a Norma Técnica {item.maintenancePlan.legalNorm}
                </div>
              )}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {item.specs.slice(0, 4).map((spec, sIdx) => (
                  <div key={sIdx} className="p-2 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-[10px] text-muted-foreground block">{spec.label}</span>
                    <span className="text-xs font-semibold text-foreground truncate block">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Common Spare Parts */}
              <div className="mt-4 pt-3 border-t border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                  Peças de Desgaste Periódico Homologadas:
                </span>
                <div className="space-y-1.5">
                  {item.commonSpareParts.map((part, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-card border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{part.description}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {part.suggestedReplacementInterval}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Deploy Button */}
            <div className="pt-3 border-t border-border">
              <button
                onClick={() => handleOpenDeploy(item)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Implantar Modelo em um Cliente
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deploy to Client Modal */}
      {deployModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Implantar {selectedItem.brand} {selectedItem.model}
            </h3>
            <p className="text-xs text-muted-foreground">
              O equipamento herdará todos os parâmetros elétricos, mecânicos e o plano de manutenção
              preventiva cadastrado no catálogo.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-foreground mb-1 block">Cliente de Destino</label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-foreground mb-1 block">TAG do Ativo</label>
                <input
                  type="text"
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value)}
                  placeholder="Ex: COMP-04"
                  className="w-full text-xs bg-background border border-border rounded-lg p-2.5 font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeployModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeploy}
                className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm"
              >
                Confirmar Implantação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
