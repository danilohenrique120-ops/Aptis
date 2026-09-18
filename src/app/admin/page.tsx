'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { getAllTools } from '@/config/tools-registry';
import { Tenant, TenantPlan } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { 
  Building2, 
  Key, 
  Plus, 
  Check, 
  X, 
  Users, 
  Layers, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function SuperAdminPage() {
  const { 
    tenants, 
    licenses, 
    leads, 
    toggleLicense, 
    addTenant, 
    updateLeadStatus,
    switchTenant
  } = useTenant();

  const allTools = getAllTools();

  // Modal / Form para nova empresa
  const [isNewTenantOpen, setIsNewTenantOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyDoc, setCompanyDoc] = useState('');
  const [companyPlan, setCompanyPlan] = useState<TenantPlan>('pro');
  const [companySegment, setCompanySegment] = useState('Indústria Automotiva');
  const [companyEmployees, setCompanyEmployees] = useState('200');
  const [companyEmail, setCompanyEmail] = useState('');

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyDoc.trim()) return;

    const newTenant = addTenant({
      name: companyName,
      document: companyDoc,
      plan: companyPlan,
      status: 'active',
      segment: companySegment,
      employeeCount: parseInt(companyEmployees) || 50,
      contactEmail: companyEmail || 'contato@empresa.com'
    });

    // Auto grant manager-tasks as starter
    toggleLicense(newTenant.id, 'manager-tasks', true);

    setIsNewTenantOpen(false);
    setCompanyName('');
    setCompanyDoc('');
  };

  const isToolActiveForTenant = (tenantId: string, toolId: string): boolean => {
    const lic = licenses.find(l => l.tenantId === tenantId && l.toolId === toolId);
    return !!lic && lic.isActive;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gestão de Empresas & Licenciamento Multi-Tenant
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cadastre novas organizações clientes e marque exatamente quais ferramentas (`tool_ids`) estão ativas para cada uma.
          </p>
        </div>

        <button
          onClick={() => setIsNewTenantOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Cadastrar Nova Empresa Cliente
        </button>
      </div>

      {/* KPI Cards SuperAdmin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Empresas Cadastradas</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{tenants.length}</p>
          <span className="text-[11px] text-slate-400">Tenants ativos na infraestrutura</span>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Licenças Concedidas</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {licenses.filter(l => l.isActive).length}
          </p>
          <span className="text-[11px] text-emerald-400">Módulos operando em produção</span>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Leads da Vitrine Pública</span>
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{leads.length}</p>
          <span className="text-[11px] text-slate-400">Solicitações de demonstração</span>
        </div>
      </div>

      {/* MATRIZ DE LICENCIAMENTO (O REQUISITO CENTRAL) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Matriz de Controle de Licenças por Ferramenta
            </h2>
            <p className="text-xs text-slate-400">
              Alterne os botões para conceder ou revogar o acesso imediato de cada empresa aos módulos.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                  <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider sticky left-0 bg-slate-900 z-10 min-w-[240px]">
                    Empresa Cliente (Tenant)
                  </th>
                  <th className="py-4 px-3 font-semibold text-xs uppercase tracking-wider text-center w-28">
                    Plano
                  </th>
                  {allTools.map(tool => (
                    <th key={tool.id} className="py-4 px-3 font-semibold text-xs text-center border-l border-slate-800 min-w-[150px]">
                      <div className="flex items-center justify-center gap-1.5 text-white">
                        <ToolIcon name={tool.iconName} className="w-4 h-4 text-blue-400" />
                        <span className="truncate max-w-[130px]" title={tool.name}>{tool.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">`{tool.id}`</span>
                    </th>
                  ))}
                  <th className="py-4 px-4 font-semibold text-xs uppercase tracking-wider text-right border-l border-slate-800 w-36">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tenants.map(tenant => {
                  return (
                    <tr key={tenant.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-4 px-4 sticky left-0 bg-slate-950 group-hover:bg-slate-900/60 z-10 border-r border-slate-800">
                        <div className="font-bold text-white text-sm">{tenant.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">CNPJ: {tenant.document}</div>
                        <div className="text-[11px] text-slate-500">{tenant.segment} • {tenant.employeeCount} colaboradores</div>
                      </td>

                      <td className="py-4 px-3 text-center">
                        <span className="px-2.5 py-0.5 rounded text-xs font-semibold capitalize font-mono bg-blue-950 text-blue-300 border border-blue-800">
                          {tenant.plan}
                        </span>
                      </td>

                      {allTools.map(tool => {
                        const active = isToolActiveForTenant(tenant.id, tool.id);
                        return (
                          <td key={tool.id} className="py-3 px-3 text-center border-l border-slate-800/80">
                            <button
                              onClick={() => toggleLicense(tenant.id, tool.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                                active
                                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
                              }`}
                              title={`Clique para ${active ? 'revogar' : 'liberar'} ${tool.name} para ${tenant.name}`}
                            >
                              {active ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  Liberado
                                </>
                              ) : (
                                <>
                                  <X className="w-3.5 h-3.5 text-slate-600" />
                                  Bloqueado
                                </>
                              )}
                            </button>
                          </td>
                        );
                      })}

                      <td className="py-4 px-4 text-right border-l border-slate-800">
                        <button
                          onClick={() => switchTenant(tenant.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Simular visualização como este tenant no Hub"
                        >
                          Entrar no Hub
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Caixa de Entrada de Leads Comerciais */}
      <section id="leads-section" className="space-y-4 pt-4 border-t border-slate-800 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-400" />
              Solicitações de Demonstração & Orçamento Recebidas
            </h2>
            <p className="text-xs text-slate-400">
              Notificações de indústrias interessadas na Suíte Aptis para contato comercial imediato.
            </p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
          {leads.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm italic">
              Nenhuma solicitação de demonstração recebida ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {leads.map(lead => (
                <div key={lead.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{lead.companyName}</span>
                      <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                        Interesse: {lead.toolName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">{formatDate(lead.createdAt)}</span>
                    </div>

                    <div className="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                      <span><strong>Contato:</strong> {lead.contactName}</span>
                      <span><strong>E-mail:</strong> {lead.email}</span>
                      <span><strong>Telefone:</strong> {lead.phone}</span>
                      <span><strong>Porte:</strong> {lead.teamSize}</span>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                        &quot;{lead.notes}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    {lead.phone && (
                      <a
                        href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Olá ${lead.contactName}, sou Danilo da Aptis Tecnologia. Recebi sua solicitação de demonstração da Suíte Aptis para a ${lead.companyName}. Como podemos agendar nossa conversa?`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold transition-colors"
                        title="Iniciar conversa no WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        Chamar no WhatsApp
                      </a>
                    )}

                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                      className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="pending">⏳ Pendente</option>
                      <option value="contacted">📞 Em Contato</option>
                      <option value="converted">✅ Convertido / Licenciado</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Cadastro de Nova Empresa */}
      {isNewTenantOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-white mb-1">Cadastrar Nova Empresa Cliente</h3>
            <p className="text-xs text-slate-400 mb-4">Criação de novo Tenant multi-tenant na base de dados.</p>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Razão Social / Nome Fantasia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Usina São Paulo S/A"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CNPJ *</label>
                  <input
                    type="text"
                    required
                    placeholder="00.000.000/0001-00"
                    value={companyDoc}
                    onChange={e => setCompanyDoc(e.target.value)}
                    className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Plano Inicial</label>
                  <select
                    value={companyPlan}
                    onChange={e => setCompanyPlan(e.target.value as TenantPlan)}
                    className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Segmento</label>
                  <input
                    type="text"
                    value={companySegment}
                    onChange={e => setCompanySegment(e.target.value)}
                    className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qtd Colaboradores</label>
                  <input
                    type="number"
                    value={companyEmployees}
                    onChange={e => setCompanyEmployees(e.target.value)}
                    className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">E-mail Corporativo de Contato</label>
                <input
                  type="email"
                  placeholder="admin@empresa.com.br"
                  value={companyEmail}
                  onChange={e => setCompanyEmail(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTenantOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                >
                  Salvar e Habilitar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
