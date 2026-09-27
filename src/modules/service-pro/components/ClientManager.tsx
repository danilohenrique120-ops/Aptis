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
        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Faturamento Mensal Recorrente (MRR)
          </span>
          <div className="text-2xl font-black text-emerald-500 mt-1">
            {totalMRR.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-muted-foreground">Contratos de manutenção vigentes</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Clientes Contratantes
          </span>
          <div className="text-2xl font-black text-foreground mt-1">{clients.length} Empresas</div>
          <span className="text-xs text-muted-foreground">Com plantas industriais ativas</span>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            SLA Médio de Emergência
          </span>
          <div className="text-2xl font-black text-primary mt-1">
            {(clients.reduce((acc, c) => acc + c.slaHours, 0) / (clients.length || 1)).toFixed(1)}h
          </div>
          <span className="text-xs text-muted-foreground">Tempo de resposta em contrato</span>
        </div>
      </div>

      {/* Search & Add Action */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-card border border-border rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por razão social, CNPJ ou segmento..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Cliente Contratante
        </button>
      </div>

      {/* Client List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 uppercase">
                    {client.segment}
                  </span>
                  <h3 className="text-base font-bold text-foreground mt-1.5">{client.name}</h3>
                  <span className="text-[11px] font-mono text-muted-foreground block">
                    CNPJ: {client.cnpj}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-500 font-mono block">
                    {client.contractValueMonthly.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                    <span className="text-[10px] text-muted-foreground font-normal">/mês</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block mt-1">
                    Ativo
                  </span>
                </div>
              </div>

              {/* SLA & Plantas */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border text-xs">
                <div className="p-2 rounded-lg bg-muted/20 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">SLA Emergencial:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" /> {client.slaHours} Horas
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-muted/20 border border-border/60">
                  <span className="text-[10px] text-muted-foreground block">Unidades / Plantas:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-primary" /> {client.branches.length} Fábricas
                  </span>
                </div>
              </div>

              {/* Contacts */}
              <div className="mt-3 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Contato Operacional / Técnico:
                </span>
                {client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-2 rounded-lg bg-card border border-border text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">{contact.name}</span>
                      <span className="text-[10px] text-muted-foreground">{contact.role}</span>
                    </div>
                    <div className="text-right text-[11px] text-muted-foreground space-y-0.5">
                      <div className="flex items-center gap-1 justify-end font-mono">
                        <Phone className="w-3 h-3 text-primary" />
                        <span>{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span>{contact.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Início: {new Date(client.contractStartDate).toLocaleDateString('pt-BR')}
              </span>

              <button
                onClick={() => onOpenPortalSimulation(client)}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 text-foreground transition flex items-center gap-1.5 border border-border"
              >
                <Eye className="w-3.5 h-3.5 text-primary" />
                Simular Portal VIP do Cliente
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Novo Cliente Contratante</h2>
                  <p className="text-xs text-muted-foreground">
                    Cadastre a empresa tomadora de serviços, plantas fabris e contatos
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Razão Social</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cerâmica Paulista S.A."
                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">CNPJ</label>
                  <input
                    type="text"
                    required
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Segmento</label>
                  <select
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5"
                  >
                    <option value="Indústria Alimentícia">Indústria Alimentícia</option>
                    <option value="Indústria Farmacêutica">Indústria Farmacêutica</option>
                    <option value="Metalurgia & Usinagem">Metalurgia & Usinagem</option>
                    <option value="Logística & Armazenagem">Logística & Armazenagem</option>
                    <option value="Shopping Center / Predial">Shopping Center / Predial</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">SLA Emergencial (Horas)</label>
                  <input
                    type="number"
                    value={slaHours}
                    onChange={(e) => setSlaHours(Number(e.target.value) || 4)}
                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-foreground mb-1 block">Mensalidade Contratual (R$)</label>
                  <input
                    type="number"
                    value={contractValueMonthly}
                    onChange={(e) => setContractValueMonthly(Number(e.target.value) || 5000)}
                    className="w-full text-xs bg-background border border-border rounded-lg p-2.5 font-mono"
                  />
                </div>
              </div>

              {/* Branch */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
                <span className="font-bold text-foreground text-xs block">Unidade / Fábrica Inicial:</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Nome da Planta (ex: Planta 01)"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="Cidade / Polo Industrial"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-2">
                <span className="font-bold text-foreground text-xs block">Contato Principal do Cliente:</span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Nome do Gestor"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2"
                  />
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2 font-mono"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="gestor@empresa.com.br"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md"
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
