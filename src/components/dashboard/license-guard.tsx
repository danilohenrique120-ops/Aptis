'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { getToolById } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import { 
  Lock, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  HelpCircle,
  KeyRound
} from 'lucide-react';

interface LicenseGuardProps {
  toolId: string;
  children: React.ReactNode;
}

export function LicenseGuard({ toolId, children }: LicenseGuardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { currentTenant, currentUser, hasLicense, toggleLicense, submitLead } = useTenant();
  const [requestedActivation, setRequestedActivation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tintedGlass, setTintedGlass] = useState(true);
  const tool = getToolById(toolId);

  React.useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setTintedGlass(customEvent.detail);
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  const handleRequestLicense = async () => {
    setIsSubmitting(true);
    try {
      await submitLead({
        companyName: currentTenant.name,
        contactName: currentUser.name,
        email: currentUser.email,
        phone: '(WhatsApp Corporativo)',
        teamSize: `${currentTenant.employeeCount || 50} colaboradores`,
        toolId: tool?.id || toolId,
        toolName: tool?.name || 'Módulo Aptis',
        notes: `Solicitação direta de desbloqueio do módulo realizada pelo usuário ${currentUser.name} (${currentUser.role}) no tenant ${currentTenant.name}.`
      });
    } catch (e) {
      console.warn('Erro ao registrar lead:', e);
    } finally {
      setIsSubmitting(false);
      setRequestedActivation(true);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Danilo! Sou ${currentUser.name} da empresa *${currentTenant.name}* e gostaria de solicitar a liberação do módulo *${tool?.name || toolId}* na plataforma Aptis.`
  );
  // Número comercial de atendimento da Aptis Tecnologia (alterável conforme necessidade)
  const whatsappUrl = `https://wa.me/5511987654321?text=${whatsappMessage}`;

  if (!isMounted) {
    return (
      <div className={`w-full min-h-[400px] flex items-center justify-center rounded-3xl p-12 ${
        tintedGlass ? 'aptis-glass-dark text-white' : 'bg-white/50 border border-slate-200/80'
      }`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-xs font-semibold font-mono tracking-wider ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
            Sincronizando {tool?.name || 'módulo'}...
          </p>
        </div>
      </div>
    );
  }

  const isLicensed = hasLicense(toolId);

  if (isLicensed) {
    return <>{children}</>;
  }

  // Not licensed view
  const handleQuickActivate = () => {
    toggleLicense(currentTenant.id, toolId, true);
  };

  return (
    <div className={`max-w-4xl mx-auto my-6 p-6 sm:p-10 rounded-3xl transition-all ${
      tintedGlass
        ? 'aptis-glass-dark text-white'
        : 'aptis-glass-light bg-white border border-slate-200 shadow-sm text-slate-900'
    }`}>
      <div className="flex flex-col items-center text-center">
        {/* Ícone de bloqueio estilizado */}
        <div className="relative mb-6">
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center shadow-xs ${
            tintedGlass
              ? 'bg-amber-500/20 border-amber-500/35 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            {tool ? <ToolIcon name={tool.iconName} className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white/20 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Informação do Bloqueio */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${
          tintedGlass
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
            : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          <Lock className="w-3.5 h-3.5" />
          Acesso Restrito: Licença Inativa
        </div>

        <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
          {tool?.name || 'Ferramenta Não Contratada'}
        </h1>

        <p className={`text-sm sm:text-base max-w-xl mb-6 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
          A empresa <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>{currentTenant.name}</strong> ainda não possui a licença ativa deste módulo em seu plano atual.
        </p>

        {/* Card explicativo com recursos da ferramenta */}
        {tool && (
          <div className={`w-full border rounded-2xl p-6 text-left mb-8 ${
            tintedGlass
              ? 'aptis-glass-subcard border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                O que este módulo entrega para a sua operação:
              </h3>
            </div>
            <p className={`text-sm mb-4 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>{tool.fullDescription}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tool.keyFeatures.map((feat, idx) => (
                <div key={idx} className={`flex items-start gap-2 text-xs ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`}>
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          {requestedActivation ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold ${
                tintedGlass
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Solicitação registrada no sistema!
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Falar no WhatsApp Comercial
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <button
              onClick={handleRequestLicense}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-60 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? 'Registrando...' : 'Solicitar Liberação de Licença'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/dashboard/marketplace"
            className={`w-full sm:w-auto px-6 py-3 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 border ${
              tintedGlass
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
            }`}
          >
            Explorar Catálogo Interno
          </Link>
        </div>

        {/* Opção restrita exclusivamente ao SuperAdmin da plataforma Aptis */}
        {currentUser.role === 'superadmin' && (
          <div className={`mt-8 pt-6 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs p-4 rounded-2xl border ${
            tintedGlass
              ? 'aptis-glass-subcard border-white/10 text-slate-300'
              : 'bg-slate-50/70 border-slate-200/80 text-slate-600'
          }`}>
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Console SuperAdmin:</strong> Liberação manual de teste para a unidade {currentTenant.name}.
              </span>
            </div>
            <button
              onClick={handleQuickActivate}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Liberar Licença Imediata (Admin)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
