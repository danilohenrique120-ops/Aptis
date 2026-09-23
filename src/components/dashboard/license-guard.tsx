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
  const { currentTenant, currentUser, hasLicense, toggleLicense } = useTenant();
  const [requestedActivation, setRequestedActivation] = useState(false);
  const tool = getToolById(toolId);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full min-h-[400px] flex items-center justify-center bg-white/50 rounded-2xl border border-slate-200/80 p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 font-mono tracking-wider">
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
    <div className="max-w-4xl mx-auto my-6 p-6 sm:p-10 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Ícone de bloqueio estilizado */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            {tool ? <ToolIcon name={tool.iconName} className="w-10 h-10" /> : <Lock className="w-10 h-10" />}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        {/* Informação do Bloqueio */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
          <Lock className="w-3.5 h-3.5" />
          Acesso Restrito: Licença Inativa
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {tool?.name || 'Ferramenta Não Contratada'}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mb-6">
          A empresa <strong className="text-slate-900">{currentTenant.name}</strong> ainda não possui a licença ativa deste módulo em seu plano atual.
        </p>

        {/* Card explicativo com recursos da ferramenta */}
        {tool && (
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-6 text-left mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                O que este módulo entrega para a sua operação:
              </h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">{tool.fullDescription}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tool.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
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
            <div className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Solicitação enviada ao time comercial! Entraremos em contato em breve.
            </div>
          ) : (
            <button
              onClick={() => setRequestedActivation(true)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Solicitar Liberação de Licença
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <Link
            href="/dashboard/marketplace"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            Explorar Catálogo Interno
          </Link>
        </div>

        {/* Opção de Teste Rápido para Administradores */}
        {(currentUser.role === 'superadmin' || currentUser.role === 'tenant_admin') && (
          <div className="mt-8 pt-6 border-t border-slate-200 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-600">
              <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Modo Administrador ({currentUser.role}):</strong> Você pode liberar a licença para {currentTenant.name} agora para validar o módulo.
              </span>
            </div>
            <button
              onClick={handleQuickActivate}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Liberar Licença Imediata
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
