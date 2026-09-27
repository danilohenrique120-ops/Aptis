'use client';

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  Eye,
  Search,
  X,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { ClientContractor } from '../types';

interface ClientManagerProps {
  clients: ClientContractor[];
  onAddClient: (newClient: ClientContractor) => void;
  onOpenPortalSimulation: (client: ClientContractor) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  clients,
  onAddClient,
  onOpenPortalSimulation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Client Form
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [segment, setSegment] = useState('Indústria Farmacêutica');
  const [slaHours, setSlaHours] = useState(4);
  const [contractValueMonthly, setContractValueMonthly] = useState(8500);
  const [branchName, setBranchName] = useState('Fábrica Principal');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('SP');
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Gerente de Planta');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm) ||
      c.segment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalMRR = clients.reduce((acc, c) => acc + c.contractValueMonthly, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: ClientContractor = {
      id: `cli-${Date.now()}`,
      name,
      tradeName: tradeName || name,
      cnpj: cnpj || '00.000.000/0001-00',
      segment,
      slaHours,
      contractValueMonthly,
      contractStartDate: new Date().toISOString().split('T')[0],
      contractStatus: 'active',
      branches: [
        {
          id: `br-${Date.now()}-1`,
          name: branchName || 'Matriz',
          address: branchAddress || 'Distrito Industrial',
          city: branchCity || 'São Paulo',
          state: branchState || 'SP',
          contactPerson: contactName,
          contactPhone,
        },
      ],
      contacts: [
        {
          id: `ct-${Date.now()}-1`,
          name: contactName || 'Responsável Técnico',
          role: contactRole,
          email: contactEmail,
          phone: contactPhone || '(11) 98765-4321',
          isPrimary: true,
        },
      ],
    };

    onAddClient(newClient);
    setIsAddModalOpen(false);

    // reset
    setName('');
    setTradeName('');
    setCnpj('');
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Faturamento Recorrente (MRR)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-slate-500 font-medium">Contratos mensais vigentes</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Clientes Contratantes</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{clients.length} Empresas</div>
          <span className="text-xs text-slate-500 font-medium">Com plantas fabris ativas</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>SLA Médio de Emergência</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">
            {(clients.reduce((acc, c) => acc + c.slaHours, 0) / (clients.length || 1)).toFixed(1)}h
          </div>
          <span className="text-xs text-slate-500 font-medium">Tempo de resposta contratual</span>
        </div>
      </div>

      {/* Search & Add Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razão social, CNPJ ou segmento..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente Contratante
        </button>
      </div>

      {/* Client List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition space-y-4 flex flex-col justify-between shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                    {client.segment}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{client.name}</h3>
                  <span className="text-[11px] font-mono text-slate-500 block">
                    CNPJ: {client.cnpj}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600 font-mono block">
                    {client.contractValueMonthly.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                    <span className="text-[10px] text-slate-500 font-normal">/mês</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-1">
                    Ativo
                  </span>
                </div>
              </div>

              {/* SLA & Plantas */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">SLA Emergencial:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" /> {client.slaHours} Horas
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 font-medium block">Unidades Fabris:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" /> {client.branches.length} Fábricas
                  </span>
                </div>
              </div>

              {/* Contacts */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Contato Operacional / Técnico:
                </span>
                {client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{contact.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{contact.role}</span>
                    </div>
                    <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                      <div className="flex items-center gap-1 justify-end font-mono font-medium">
                        <Phone className="w-3 h-3 text-blue-600" />
                        <span>{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end text-slate-500">
                        <Mail className="w-3 h-3" />
                        <span>{contact.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">
                Início: {new Date(client.contractStartDate).toLocaleDateString('pt-BR')}
              </span>

              <button
                onClick={() => onOpenPortalSimulation(client)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Simular Portal VIP do Cliente
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Novo Cliente Contratante</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cadastre a empresa tomadora de serviços, plantas fabris e contatos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Razão Social *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cerâmica Paulista S.A."
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">CNPJ *</label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono text-slate-900 outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Segmento</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none shadow-2xs"
                  >
                    <option value="Indústria Alimentícia">Indústria Alimentícia</option>
                    <option value="Indústria Farmacêutica">Indústria Farmacêutica</option>
                    <option value="Metalurgia & Usinagem">Metalurgia & Usinagem</option>
                    <option value="Logística & Armazenagem">Logística & Armazenagem</option>
                    <option value="Shopping Center / Predial">Shopping Center / Predial</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">SLA (Horas)</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value) || 4)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1.5 block">Mensalidade (R$)</label>
                  <input
                    type="number"
                    value={contractValueMonthly}
                    onChange={(e) => setContractValueMonthly(Number(e.target.value) || 5000)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">Unidade / Fábrica Inicial:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Nome da Planta (ex: Planta 01)"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                  <input
                    type="text"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="Cidade / Polo Industrial"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 text-xs block">Contato Principal do Cliente:</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nome do Gestor"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="gestor@empresa.com.br"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
