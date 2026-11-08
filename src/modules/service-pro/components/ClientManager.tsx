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
  Trash2,
} from 'lucide-react';
import { ClientContractor } from '../types';

interface ClientManagerProps {
  tintedGlass?: boolean;
  clients: ClientContractor[];
  onAddClient: (newClient: ClientContractor) => void;
  onOpenPortalSimulation: (client: ClientContractor) => void;
  onDeleteClient?: (clientId: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  tintedGlass = true,
  clients,
  onAddClient,
  onOpenPortalSimulation,
  onDeleteClient,
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
        <div
          className={`p-5 rounded-3xl transition-all ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
              tintedGlass ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            <span>Faturamento Recorrente (MRR)</span>
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold ${
                tintedGlass
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                  : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}
            >
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              tintedGlass
                ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'text-emerald-600'
            }`}
          >
            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            Contratos mensais vigentes
          </span>
        </div>

        <div
          className={`p-5 rounded-3xl transition-all ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
              tintedGlass ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            <span>Clientes Contratantes</span>
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold ${
                tintedGlass
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                  : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-2xl font-black mt-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
            {clients.length} Empresas
          </div>
          <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            Com plantas fabris ativas
          </span>
        </div>

        <div
          className={`p-5 rounded-3xl transition-all ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div
            className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${
              tintedGlass ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            <span>SLA Médio de Emergência</span>
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold ${
                tintedGlass
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                  : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-black mt-2 ${
              tintedGlass
                ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'text-amber-600'
            }`}
          >
            {(clients.reduce((acc, c) => acc + c.slaHours, 0) / (clients.length || 1)).toFixed(1)}h
          </div>
          <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
            Tempo de resposta contratual
          </span>
        </div>
      </div>

      {/* Search & Add Action */}
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl transition-all ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="relative flex-1">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              tintedGlass ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razão social, CNPJ ou segmento..."
            className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none font-medium transition ${
              tintedGlass
                ? 'aptis-glass-input text-white placeholder:text-slate-400'
                : 'bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-2xs'
            }`}
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-cyan-300/35 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            boxShadow:
              '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
          }}
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
            className={`p-5 rounded-3xl transition-all duration-300 space-y-4 flex flex-col justify-between ${
              tintedGlass
                ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                      tintedGlass
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {client.segment}
                  </span>
                  <h3
                    className={`text-base font-black mt-1.5 ${
                      tintedGlass ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {client.name}
                  </h3>
                  <span
                    className={`text-[11px] font-mono block ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    CNPJ: {client.cnpj}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black font-mono block ${
                      tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                    }`}
                  >
                    {client.contractValueMonthly.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                    <span
                      className={`text-[10px] font-normal ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      /mês
                    </span>
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${
                      tintedGlass
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Ativo
                  </span>
                </div>
              </div>

              {/* SLA & Plantas */}
              <div
                className={`grid grid-cols-2 gap-2 mt-3 pt-3 border-t text-xs ${
                  tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border ${
                    tintedGlass
                      ? 'aptis-glass-subcard border-white/10'
                      : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium block ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    SLA Emergencial:
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 mt-0.5 ${
                      tintedGlass ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    />{' '}
                    {client.slaHours} Horas
                  </span>
                </div>
                <div
                  className={`p-2.5 rounded-xl border ${
                    tintedGlass
                      ? 'aptis-glass-subcard border-white/10'
                      : 'bg-slate-50 border-slate-200 shadow-2xs'
                  }`}
                >
                  <span
                    className={`text-[10px] font-medium block ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Unidades Fabris:
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 mt-0.5 ${
                      tintedGlass ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    <Building2
                      className={`w-3.5 h-3.5 ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    />{' '}
                    {client.branches.length} Fábricas
                  </span>
                </div>
              </div>

              {/* Contacts */}
              <div className="mt-3 space-y-1.5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider block ${
                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Contato Operacional / Técnico:
                </span>
                {client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      tintedGlass
                        ? 'aptis-glass-subcard border-white/10 text-slate-200'
                        : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <span
                        className={`font-bold block ${
                          tintedGlass ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {contact.name}
                      </span>
                      <span
                        className={`text-[10px] font-medium ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {contact.role}
                      </span>
                    </div>
                    <div
                      className={`text-right text-[11px] space-y-0.5 ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-1 justify-end font-mono font-medium">
                        <Phone
                          className={`w-3 h-3 ${
                            tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                          }`}
                        />
                        <span>{contact.phone}</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 justify-end ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        <Mail className="w-3 h-3" />
                        <span>{contact.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div
              className={`pt-3 border-t flex items-center justify-between gap-2 ${
                tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
              }`}
            >
              <span
                className={`text-[10px] font-medium ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Início: {new Date(client.contractStartDate).toLocaleDateString('pt-BR')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenPortalSimulation(client)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                    tintedGlass
                      ? 'aptis-glass-subcard text-slate-200 hover:text-white hover:border-cyan-400/40'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs'
                  }`}
                >
                  <Eye
                    className={`w-3.5 h-3.5 ${
                      tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                    }`}
                  />
                  Simular Portal VIP
                </button>

                {onDeleteClient && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação removerá os dados do contrato.`
                        )
                      ) {
                        onDeleteClient(client.id);
                      }
                    }}
                    className={`p-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                      tintedGlass
                        ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30'
                        : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-2xs'
                    }`}
                    title="Excluir Cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal in Dual-Mode Liquid Glass */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
          <div
            className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 ${
              tintedGlass
                ? 'aptis-glass-modal text-white'
                : 'bg-white text-slate-900 border border-slate-200'
            }`}
          >
            <div
              className={`p-5 border-b flex items-center justify-between ${
                tintedGlass
                  ? 'border-white/10 bg-white/[0.02]'
                  : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/25"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
                  }}
                >
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    className={`text-lg font-black ${
                      tintedGlass ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Novo Cliente Contratante
                  </h2>
                  <p
                    className={`text-xs mt-0.5 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Cadastre a empresa tomadora de serviços, plantas fabris e contatos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`p-1.5 rounded-xl transition cursor-pointer ${
                  tintedGlass
                    ? 'text-slate-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`font-bold mb-1.5 block ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cerâmica Paulista S.A."
                    className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`font-bold mb-1.5 block ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className={`w-full text-xs rounded-xl p-2.5 font-mono outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label
                    className={`font-bold mb-1.5 block ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Segmento
                  </label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  >
                    <option value="Indústria Alimentícia">Indústria Alimentícia</option>
                    <option value="Indústria Farmacêutica">Indústria Farmacêutica</option>
                    <option value="Metalurgia & Usinagem">Metalurgia & Usinagem</option>
                    <option value="Logística & Armazenagem">Logística & Armazenagem</option>
                    <option value="Shopping Center / Predial">Shopping Center / Predial</option>
                  </select>
                </div>
                <div>
                  <label
                    className={`font-bold mb-1.5 block ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    SLA (Horas)
                  </label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value) || 4)}
                    className={`w-full text-xs rounded-xl p-2.5 font-mono font-bold outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label
                    className={`font-bold mb-1.5 block ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Mensalidade (R$)
                  </label>
                  <input
                    type="number"
                    value={contractValueMonthly}
                    onChange={(e) => setContractValueMonthly(Number(e.target.value) || 5000)}
                    className={`w-full text-xs rounded-xl p-2.5 font-mono font-bold outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white'
                        : 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Branch */}
              <div
                className={`p-3.5 rounded-2xl space-y-2 ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <span
                  className={`font-bold text-xs block ${
                    tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                  }`}
                >
                  Unidade / Fábrica Inicial:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Nome da Planta (ex: Planta 01)"
                    className={`w-full text-xs rounded-lg p-2 outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="Cidade / Polo Industrial"
                    className={`w-full text-xs rounded-lg p-2 outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {/* Contact */}
              <div
                className={`p-3.5 rounded-2xl space-y-2 ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <span
                  className={`font-bold text-xs block ${
                    tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                  }`}
                >
                  Contato Principal do Cliente:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nome do Gestor"
                    className={`w-full text-xs rounded-lg p-2 outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                    }`}
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className={`w-full text-xs rounded-lg p-2 font-mono outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                    }`}
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="gestor@empresa.com.br"
                    className={`w-full text-xs rounded-lg p-2 outline-none transition ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              <div
                className={`pt-4 border-t flex items-center justify-end gap-3 ${
                  tintedGlass ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    tintedGlass
                      ? 'text-slate-300 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition cursor-pointer border border-cyan-300/35 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    boxShadow:
                      '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                  }}
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
