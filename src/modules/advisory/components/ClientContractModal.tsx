'use client';

import React, { useState } from 'react';
import {
  Building2,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { ConsultingClient } from '../types';

interface ClientContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClient: (client: ConsultingClient) => void;
  editingClient?: ConsultingClient | null;
}

export const ClientContractModal: React.FC<ClientContractModalProps> = ({
  isOpen,
  onClose,
  onSaveClient,
  editingClient,
}) => {
  const [name, setName] = useState(editingClient?.name || '');
  const [cnpj, setCnpj] = useState(editingClient?.cnpj || '');
  const [segment, setSegment] = useState(editingClient?.segment || 'Indústria & Manufatura');
  const [sponsorName, setSponsorName] = useState(editingClient?.sponsorName || '');
  const [sponsorRole, setSponsorRole] = useState(editingClient?.sponsorRole || 'CEO / Diretor Geral');
  const [sponsorEmail, setSponsorEmail] = useState(editingClient?.sponsorEmail || '');
  const [sponsorPhone, setSponsorPhone] = useState(editingClient?.sponsorPhone || '');
  const [contractValueMonthly, setContractValueMonthly] = useState(
    editingClient?.contractValueMonthly || 18000
  );
  const [monthsDuration, setMonthsDuration] = useState(6);
  const [projectGoal, setProjectGoal] = useState(
    editingClient?.projectGoal ||
      'Estruturação de governança operacional e aumento de produtividade.'
  );

  const [inScopeText, setInScopeText] = useState(
    editingClient?.inScopeSummary.join('\n') ||
      'Mapeamento de processos críticos\nImplantação de rituais de rotina diária\nTreinamento de liderança operacional'
  );

  const [outOfScopeText, setOutOfScopeText] = useState(
    editingClient?.outOfScopeSummary.join('\n') ||
      'Desenvolvimento de software customizado\nAssessoria contábil ou fiscal'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const inScope = inScopeText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const outScope = outOfScopeText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const client: ConsultingClient = {
      id: editingClient?.id || `cli-adv-${Date.now()}`,
      name: name.trim(),
      cnpj: cnpj.trim() || '00.000.000/0001-00',
      segment,
      sponsorName: sponsorName.trim() || 'Diretoria',
      sponsorRole: sponsorRole.trim(),
      sponsorEmail: sponsorEmail.trim(),
      sponsorPhone: sponsorPhone.trim(),
      consultantLead: 'Danilo Henrique',
      contractValueMonthly,
      totalContractValue: contractValueMonthly * monthsDuration,
      startDate: editingClient?.startDate || new Date().toISOString().split('T')[0],
      targetEndDate:
        editingClient?.targetEndDate ||
        new Date(Date.now() + monthsDuration * 30 * 86400000).toISOString().split('T')[0],
      status: editingClient?.status || 'active',
      projectGoal,
      inScopeSummary: inScope,
      outOfScopeSummary: outScope,
      clientTeam: editingClient?.clientTeam || [
        {
          name: sponsorName || 'Patrocinador',
          role: sponsorRole,
          email: sponsorEmail,
          phone: sponsorPhone,
        },
      ],
    };

    onSaveClient(client);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingClient ? 'Editar Contrato de Consultoria' : 'Novo Cliente de Consultoria'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cadastre a empresa cliente, o patrocinador (Board) e os limites de escopo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs bg-white max-h-[78vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Razão Social do Cliente *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Grupo Industrial Alpha S.A."
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono text-slate-800 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Segmento de Mercado</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none"
              >
                <option value="Indústria & Manufatura">Indústria & Manufatura</option>
                <option value="Saúde & Farmacêutica">Saúde & Farmacêutica</option>
                <option value="Logística & Supply Chain">Logística & Supply Chain</option>
                <option value="Varejo & Serviços">Varejo & Serviços</option>
                <option value="Tecnologia & SaaS">Tecnologia & SaaS</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Honorários Mensais (R$)</label>
              <input
                type="number"
                value={contractValueMonthly}
                onChange={(e) => setContractValueMonthly(parseFloat(e.target.value) || 0)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Duração (Meses)</label>
              <input
                type="number"
                value={monthsDuration}
                onChange={(e) => setMonthsDuration(parseInt(e.target.value) || 6)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Sponsor Details */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 text-xs block">
              Patrocinador Executivo no Cliente (Sponsor / Board):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                required
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="Nome do Diretor / CEO"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
              <input
                type="text"
                value={sponsorRole}
                onChange={(e) => setSponsorRole(e.target.value)}
                placeholder="Cargo (ex: CEO)"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
              <input
                type="text"
                value={sponsorPhone}
                onChange={(e) => setSponsorPhone(e.target.value)}
                placeholder="Telefone / WhatsApp"
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Project Goal */}
          <div>
            <label className="font-bold text-slate-700 mb-1 block">Objetivo Central do Projeto</label>
            <input
              type="text"
              value={projectGoal}
              onChange={(e) => setProjectGoal(e.target.value)}
              placeholder="Ex: Reestruturação operacional e redução de desperdício em 15%..."
              className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 outline-none"
            />
          </div>

          {/* In Scope vs Out of Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-emerald-800 mb-1 block">
                ✓ No Escopo Contratado (1 por linha):
              </label>
              <textarea
                rows={4}
                value={inScopeText}
                onChange={(e) => setInScopeText(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 resize-none outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 mb-1 block">
                ✕ Fora de Escopo (Aditivos):
              </label>
              <textarea
                rows={4}
                value={outOfScopeText}
                onChange={(e) => setOutOfScopeText(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 resize-none outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              Salvar Contrato de Consultoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
