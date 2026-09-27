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
  X,
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
      <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Catálogo Mestre Centralizado
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Modelos Padrão & Herança de Inteligência Técnica
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cadastre os manuais, fichas técnicas, peças de reposição e planos preventivos uma única
            vez. Ao adicionar um novo equipamento para qualquer cliente, todos os dados técnicos e
            requisitos de normas (PMOC, NR-13) são herdados automaticamente.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center shrink-0">
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {catalog.length}
          </span>
          <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">
            Modelos Homologados
          </span>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {catalog.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              {/* Category & Deploy Count */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                  {item.category}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {item.activeDeploymentsCount} Máquinas Ativas
                </span>
              </div>

              {/* Title & Brand */}
              <h3 className="text-base font-bold text-slate-900">
                {item.brand} {item.model}
              </h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                Capacidade: {item.capacity}
              </p>

              {/* Legal Norm Pill */}
              {item.maintenancePlan.legalNorm && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  Atende a Norma Técnica {item.maintenancePlan.legalNorm}
                </div>
              )}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {item.specs.slice(0, 4).map((spec, sIdx) => (
                  <div key={sIdx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-medium block">{spec.label}</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Common Spare Parts */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Peças de Desgaste Periódico Homologadas:
                </span>
                <div className="space-y-1.5">
                  {item.commonSpareParts.map((part, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-slate-800">{part.description}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">
                        {part.suggestedReplacementInterval}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Deploy Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => handleOpenDeploy(item)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Implantar {selectedItem.brand} {selectedItem.model}
              </h3>
              <button onClick={() => setDeployModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              O equipamento herdará todos os parâmetros elétricos, mecânicos e o plano preventivo
              cadastrado no catálogo mestre.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Cliente de Destino</label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">TAG do Ativo</label>
                <input
                  type="text"
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value)}
                  placeholder="Ex: COMP-04"
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeployModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeploy}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
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
