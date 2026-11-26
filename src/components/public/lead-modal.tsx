'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { ToolDefinition } from '@/types';
import { getAllTools } from '@/config/tools-registry';
import { X, CheckCircle2, Send, Building, User, Mail, Phone, Users, Check, Sparkles, ShieldCheck, Lightbulb, Layers } from 'lucide-react';

interface LeadModalProps {
  tool: ToolDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
}

type PlanScopeType = 'modular' | 'suite_360' | 'enterprise' | 'custom';

const CORE_PLANT_SUITE_TOOL_IDS = [
  'skills-matrix',
  'manager-tasks',
  'training-matrix',
  'kaizen-manager',
  'pdi-manager',
  'one-on-one',
  'twttp-herca',
  'service-pro',
];

const SPECIALIST_NICHE_LABELS: Record<string, string> = {
  'bacterial-gantt': 'PCP Biológico',
  advisory: 'Consultorias B2B',
};

function detectPlanScope(plan?: string, tool?: ToolDefinition | null): PlanScopeType {
  const normalized = (plan || '').toLowerCase();
  if (normalized.includes('escopo 03') || normalized.includes('enterprise') || normalized.includes('multi-planta')) {
    return 'enterprise';
  }
  if (normalized.includes('escopo 02') || normalized.includes('360') || normalized.includes('suite_completa')) {
    return 'suite_360';
  }
  if (normalized.includes('escopo 01') || normalized.includes('modular') || tool) {
    return 'modular';
  }
  return 'custom';
}

function getInitialToolIdsForScope(
  scope: PlanScopeType,
  tool: ToolDefinition | null,
  defaultPlan: string | undefined,
  allTools: ToolDefinition[]
): string[] {
  if (tool) {
    return [tool.id];
  }
  if (scope === 'suite_360' || scope === 'enterprise') {
    return allTools
      .filter(t => CORE_PLANT_SUITE_TOOL_IDS.includes(t.id))
      .map(t => t.id);
  }
  if (defaultPlan === 'suite_operacional') {
    return ['manager-tasks', 'skills-matrix', 'training-matrix'];
  }
  // Escopo 01 (Modular) e CTAs gerais de Diagnóstico iniciam com 0 pré-selecionados para escolha livre do cliente
  return [];
}

export function LeadModal({ tool, isOpen, onClose, defaultPlan }: LeadModalProps) {
  const { submitLead } = useTenant();
  const allAvailableTools = getAllTools().filter(t => t.id !== 'performance-pro');
  const corePlantTools = allAvailableTools.filter(t => CORE_PLANT_SUITE_TOOL_IDS.includes(t.id));
  const specialistTools = allAvailableTools.filter(t => !CORE_PLANT_SUITE_TOOL_IDS.includes(t.id));

  const contextKey = `${tool?.id || 'none'}::${defaultPlan || 'default'}`;

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customTeamSize, setCustomTeamSize] = useState<{ key: string; value: string } | null>(null);
  const [notes, setNotes] = useState('');
  const [customSelection, setCustomSelection] = useState<{
    key: string;
    toolIds: string[];
    planOverride?: string;
  } | null>(null);
  const [selectionErrorKey, setSelectionErrorKey] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const activePlanLabel =
    customSelection?.key === contextKey && customSelection.planOverride
      ? customSelection.planOverride
      : defaultPlan;

  const planScope = detectPlanScope(activePlanLabel, tool);

  const selectedToolIds =
    customSelection?.key === contextKey
      ? customSelection.toolIds
      : getInitialToolIdsForScope(planScope, tool, activePlanLabel, allAvailableTools);

  const showSelectionError = selectionErrorKey === contextKey && selectedToolIds.length === 0;

  const defaultTeamSizeForScope = planScope === 'enterprise' ? 'Mais de 500' : '50 a 150';
  const teamSize =
    customTeamSize?.key === contextKey ? customTeamSize.value : defaultTeamSizeForScope;

  const toggleToolSelection = (id: string) => {
    const nextIds = selectedToolIds.includes(id)
      ? selectedToolIds.filter(t => t !== id)
      : [...selectedToolIds, id];

    if (nextIds.length > 0 && selectionErrorKey === contextKey) {
      setSelectionErrorKey(null);
    }

    setCustomSelection({
      key: contextKey,
      toolIds: nextIds,
      planOverride: activePlanLabel
    });
  };

  const handleUpgradeToSuite360 = () => {
    const mergedCoreIds = Array.from(
      new Set([...corePlantTools.map(t => t.id), ...selectedToolIds])
    );
    setSelectionErrorKey(null);
    setCustomSelection({
      key: contextKey,
      toolIds: mergedCoreIds,
      planOverride: 'Escopo 02: Suíte Aptis 360º'
    });
  };

  const showModularUpsellTip =
    (planScope === 'modular' || planScope === 'custom') && selectedToolIds.length >= 4;

  const resolvedPlanName =
    planScope === 'suite_360'
      ? 'Escopo 02: Suíte Aptis 360º'
      : planScope === 'enterprise'
      ? 'Escopo 03: Enterprise & Multi-Plantas'
      : planScope === 'modular'
      ? 'Escopo 01: Licença Modular Direcionada'
      : activePlanLabel || 'Diagnóstico Operacional & Proposta Sob Medida';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedToolIds.length === 0) {
      setSelectionErrorKey(contextKey);
      return;
    }
    if (!companyName.trim() || !contactName.trim() || !email.trim() || !phone.trim()) return;

    const toolNames = allAvailableTools
      .filter(t => selectedToolIds.includes(t.id))
      .map(t => t.name)
      .join(', ');

    submitLead({
      toolId: selectedToolIds.join(','),
      toolName: toolNames || (tool ? tool.name : 'Suíte Aptis'),
      companyName,
      contactName,
      email,
      phone,
      teamSize,
      notes: `${notes ? `Obs: ${notes} | ` : ''}Plano de Interesse: ${resolvedPlanName} | Módulos: ${toolNames}`
    });

    // Dispara notificação via API interna
    fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyName,
        contactName,
        email,
        phone,
        teamSize,
        toolName: toolNames || (tool ? tool.name : 'Suíte Aptis'),
        notes: `Plano: ${resolvedPlanName} | ${notes}`
      })
    }).catch(err => console.warn('Notificação de lead disparada em background:', err));

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200 my-8">
        <button
          onClick={() => { setIsSubmitted(false); onClose(); }}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900">Solicitação Enviada!</h3>
              <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Registramos seu pedido de <strong>{resolvedPlanName}</strong> para a <strong>{companyName}</strong>. Entraremos em contato com <strong>{contactName}</strong> via WhatsApp e E-mail em até 2 horas úteis.
              </p>
            </div>

            {/* Ação rápida de WhatsApp direto com o Danilo */}
            <div className="pt-2">
              <a
                href={`https://wa.me/5519991284152?text=${encodeURIComponent(
                  `Olá Danilo, acabei de solicitar uma demonstração (${resolvedPlanName}) da Suíte Aptis para a empresa *${companyName}*. Meu nome é ${contactName} e gostaria de agilizar nosso alinhamento.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
              >
                <Phone className="w-4 h-4" />
                Falar Agora no WhatsApp do Diretor de Contas
              </a>
              <span className="text-[11px] text-slate-400 block mt-2">
                Atendimento direto: (19) 99128-4152 • Danilo Henrique
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                onClose();
                setCompanyName('');
                setContactName('');
                setEmail('');
                setPhone('');
                setNotes('');
                setCustomSelection(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium underline cursor-pointer pt-2"
            >
              Fechar janela
            </button>
          </div>
        ) : (
          <>
            {/* Header do Modal diferenciado visualmente por Plano */}
            <div className="mb-5">
              <div
                className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2 border ${
                  planScope === 'enterprise'
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : planScope === 'suite_360'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-cyan-50 border-cyan-200 text-cyan-800'
                }`}
              >
                <Sparkles
                  className={`w-3.5 h-3.5 ${
                    planScope === 'enterprise'
                      ? 'text-amber-600'
                      : planScope === 'suite_360'
                      ? 'text-emerald-600'
                      : 'text-cyan-600'
                  }`}
                />
                {planScope === 'enterprise'
                  ? 'Escopo 03 • Corporativo & Multi-Plantas'
                  : planScope === 'suite_360'
                  ? 'Escopo 02 • Planta Integrada (Suíte Completa ⭐)'
                  : planScope === 'modular'
                  ? 'Escopo 01 • Licença Modular Direcionada'
                  : 'Diagnóstico Operacional & Proposta Sob Medida'}
              </div>

              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {tool
                  ? `Demonstração Executiva: ${tool.name}`
                  : planScope === 'suite_360'
                  ? 'Escopo 02: Suíte Aptis 360º'
                  : planScope === 'enterprise'
                  ? 'Escopo 03: Enterprise & Multi-Plantas'
                  : planScope === 'modular'
                  ? 'Escopo 01: Licença Modular Direcionada'
                  : 'Agendar Diagnóstico & Proposta Aptis'}
              </h3>

              <p className="text-xs text-slate-600 mt-1">
                {tool
                  ? `O módulo ${tool.name} já está marcado abaixo. Você pode adicionar outras soluções se desejar avaliar em conjunto.`
                  : planScope === 'suite_360'
                  ? `Os ${corePlantTools.length} módulos operacionais da planta já estão pré-selecionados para governança integrada 360º.`
                  : planScope === 'enterprise'
                  ? `Governança corporativa para múltiplas unidades + implantação consultiva, com os ${corePlantTools.length} módulos operacionais já habilitados.`
                  : planScope === 'modular'
                  ? 'Clique abaixo nos módulos prioritários (de 1 a 3) que deseja implantar primeiro na sua operação.'
                  : 'Selecione abaixo o(s) módulo(s) que mais fazem sentido para o momento atual da sua operação.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Seleção de Módulos Desejados */}
              <div
                className={`p-3 rounded-2xl border space-y-2.5 transition-colors ${
                  showSelectionError
                    ? 'bg-rose-50/70 border-rose-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Módulos Operacionais da Planta:
                  </label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      selectedToolIds.length === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {selectedToolIds.length} selecionado(s)
                  </span>
                </div>

                {showSelectionError && (
                  <p className="text-[11px] font-bold text-rose-700 bg-white px-2.5 py-1.5 rounded-lg border border-rose-200">
                    Selecione pelo menos 1 módulo acima ou abaixo para enviarmos sua proposta sob medida.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  {corePlantTools.map(t => {
                    const isChecked = selectedToolIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => toggleToolSelection(t.id)}
                        className={`px-2.5 py-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                          isChecked ? 'bg-cyan-400 text-slate-950 font-black' : 'border border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-[11px] truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Módulos Especialistas de Segmento (Opcionais) */}
                {specialistTools.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/90 space-y-1.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Módulos Especialistas por Segmento (Opcionais):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {specialistTools.map(t => {
                        const isChecked = selectedToolIds.includes(t.id);
                        const nicheTag = SPECIALIST_NICHE_LABELS[t.id];
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => toggleToolSelection(t.id)}
                            className={`px-2.5 py-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center text-[10px] shrink-0 ${
                                isChecked
                                  ? 'bg-cyan-400 text-slate-950 font-black'
                                  : 'border border-slate-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[11px] truncate block">
                                {t.name}
                              </span>
                              {nicheTag && (
                                <span
                                  className={`text-[9px] font-mono block truncate ${
                                    isChecked ? 'text-cyan-300' : 'text-slate-400'
                                  }`}
                                >
                                  {nicheTag}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Dica Automática de Upsell no Escopo 01 (Modular) quando 4+ módulos são marcados */}
                {showModularUpsellTip && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col gap-2 animate-in fade-in duration-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-semibold leading-snug">
                        💡 Dica: Para 4 ou mais módulos, a <strong>Suíte Aptis 360º</strong> oferece melhor custo-benefício!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleUpgradeToSuite360}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Ativar Escopo 02: Suíte Aptis 360º ({corePlantTools.length} Módulos Operacionais)
                    </button>
                  </div>
                )}

                {planScope === 'suite_360' && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Suíte Operacional 360º pré-selecionada ({corePlantTools.length} módulos de planta)
                    </span>
                  </div>
                )}

                {planScope === 'enterprise' && (
                  <div className="px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      Base corporativa multi-plantas pré-selecionada + implantação consultiva dedicada
                    </span>
                  </div>
                )}
              </div>

              {/* Dados da Empresa */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Empresa / Razão Social *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nome da sua indústria ou grupo"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Contato & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Seu Nome / Cargo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos (Gerente de Planta)"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Telefone Direto *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="(00) 90000-0000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* E-mail Corporativo e Porte da Planta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Corporativo *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="seu.nome@empresa.com.br"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tamanho da Equipe Fabril</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={teamSize}
                      onChange={e => setCustomTeamSize({ key: contextKey, value: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none cursor-pointer font-medium"
                    >
                      <option value="Até 50">Até 50 operadores</option>
                      <option value="50 a 150">50 a 150 operadores</option>
                      <option value="150 a 500">150 a 500 operadores</option>
                      <option value="Mais de 500">Mais de 500 colaboradores (Multi-Planta)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Desafio Operacional */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Necessidade prioritária (opcional):</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Precisamos organizar a passagem de turno e preparar auditoria de NRs..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-cyan-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Botão de Envio */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-cyan-950 hover:to-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <Send className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>Solicitar Diagnóstico & Proposta Personalizada</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Atendimento consultivo e confidencial direto com especialista Aptis.</span>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
