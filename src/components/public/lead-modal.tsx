'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/tenant-context';
import { ToolDefinition } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { getAllTools } from '@/config/tools-registry';
import { X, CheckCircle2, Send, Building, User, Mail, Phone, Users, Check, Sparkles, ShieldCheck } from 'lucide-react';

interface LeadModalProps {
  tool: ToolDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
}

export function LeadModal({ tool, isOpen, onClose, defaultPlan }: LeadModalProps) {
  const { submitLead } = useTenant();
  const allAvailableTools = getAllTools();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamSize, setTeamSize] = useState('50 a 150 colaboradores');
  const [notes, setNotes] = useState('');
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Inicializa com a ferramenta clicada ou todas se for pacote
  useEffect(() => {
    if (tool) {
      setSelectedToolIds([tool.id]);
    } else if (defaultPlan === 'suite_completa') {
      setSelectedToolIds(allAvailableTools.map(t => t.id));
    } else if (defaultPlan === 'suite_operacional') {
      setSelectedToolIds(['manager-tasks', 'skills-matrix', 'training-matrix']);
    } else {
      setSelectedToolIds(['manager-tasks', 'skills-matrix']);
    }
  }, [tool, defaultPlan]);

  if (!isOpen) return null;

  const toggleToolSelection = (id: string) => {
    setSelectedToolIds(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(t => t !== id) : prev) 
        : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      notes: `${notes ? `Obs: ${notes} | ` : ''}Plano de Interesse: ${defaultPlan || 'Personalizado'} | Módulos: ${toolNames}`
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
        notes: `Plano: ${defaultPlan || 'Personalizado'} | ${notes}`
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
                Registramos seu pedido para a <strong>{companyName}</strong>. Entraremos em contato com <strong>{contactName}</strong> via WhatsApp e E-mail em até 2 horas úteis.
              </p>
            </div>

            {/* Ação rápida de WhatsApp direto com o Danilo */}
            <div className="pt-2">
              <a
                href={`https://wa.me/5519991284152?text=${encodeURIComponent(
                  `Olá Danilo, acabei de solicitar uma demonstração da Suíte Aptis para a empresa *${companyName}*. Meu nome é ${contactName} e gostaria de agilizar nosso alinhamento.`
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
              }}
              className="text-xs text-slate-400 hover:text-slate-700 font-medium underline cursor-pointer pt-2"
            >
              Fechar janela
            </button>
          </div>
        ) : (
          <>
            {/* Header do Modal */}
            <div className="mb-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                Demonstração Guiada & Proposta Comercial
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {tool ? `Orçamento & Demonstração: ${tool.name}` : 'Solicitar Orçamento da Suíte Aptis'}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Preencha os dados da sua indústria para receber o orçamento detalhado de assinatura por planta e uma demonstração prática dos recursos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Seleção de Módulos Desejados */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Selecione as Ferramentas para o Orçamento:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {allAvailableTools.map(t => {
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
                        <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-cyan-400 text-slate-950 font-black' : 'border border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-semibold text-[11px] truncate">{t.name}</span>
                      </button>
                    );
                  })}
                </div>
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
                      onChange={e => setTeamSize(e.target.value)}
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
                  <span>Enviar Solicitação de Orçamento & Demonstração</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Seus dados são confidenciais. Sem spam. Contato direto de consultor técnico.</span>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
