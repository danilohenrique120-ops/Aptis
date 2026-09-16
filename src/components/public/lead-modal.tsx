'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { ToolDefinition } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { X, CheckCircle2, Send, Building, User, Mail, Phone, Users } from 'lucide-react';

interface LeadModalProps {
  tool: ToolDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadModal({ tool, isOpen, onClose }: LeadModalProps) {
  const { submitLead } = useTenant();

  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [teamSize, setTeamSize] = useState('50 a 150 colaboradores');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !tool) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.trim()) return;

    submitLead({
      toolId: tool.id,
      toolName: tool.name,
      companyName,
      contactName,
      email,
      phone,
      teamSize,
      notes
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      setCompanyName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setNotes('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Solicitação Enviada com Sucesso!</h3>
            <p className="text-sm text-slate-600 max-w-xs mx-auto">
              Nossa equipe entrará em contato em até 2 horas úteis para agendar a demonstração guiada de <strong>{tool.name}</strong>.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-11 h-11 rounded-xl ${tool.colorTheme.lightBg} border ${tool.colorTheme.border} flex items-center justify-center ${tool.colorTheme.text} shrink-0`}>
                <ToolIcon name={tool.iconName} className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Demonstração / Licenciamento
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                  {tool.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              Preencha os dados abaixo para receber uma demonstração prática ou proposta corporativa personalizada para a sua empresa.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa / Organização *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Nome da sua empresa"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone / WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="(00) 90000-0000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail Corporativo *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="voce@empresa.com.br"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qtd Colaboradores</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={teamSize}
                      onChange={e => setTeamSize(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none cursor-pointer"
                    >
                      <option value="Até 50">Até 50 colaboradores</option>
                      <option value="50 a 150">50 a 150 colaboradores</option>
                      <option value="150 a 500">150 a 500 colaboradores</option>
                      <option value="Mais de 500">Mais de 500 colaboradores</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Algum desafio específico ou prazo?</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Auditoria prevista para o próximo trimestre..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Solicitar Demonstração Gratuita
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
