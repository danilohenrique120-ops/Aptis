'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { getAllTools, TOOL_CATEGORIES } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import { 
  Store, 
  Search, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Check,
  Layers,
  Crown,
  KeyRound
} from 'lucide-react';

export default function MarketplacePage() {
  const { currentTenant, currentUser, hasLicense, toggleLicense } = useTenant();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activationFeedback, setActivationFeedback] = useState<string | null>(null);
  const [tintedGlass, setTintedGlass] = useState(true);

  useEffect(() => {
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

  const allTools = getAllTools();
  const licensedCount = allTools.filter(t => hasLicense(t.id)).length;
  const availableCount = allTools.length - licensedCount;
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const filteredTools = allTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(search.toLowerCase()) ||
                          tool.shortDescription.toLowerCase().includes(search.toLowerCase()) ||
                          tool.keyFeatures.some(f => f.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleToggle = (toolId: string, toolName: string) => {
    const willActivate = !hasLicense(toolId);
    toggleLicense(currentTenant.id, toolId);
    setActivationFeedback(`${toolName} ${willActivate ? 'ativado com sucesso!' : 'desativado para a unidade.'}`);
    setTimeout(() => setActivationFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER EXECUTIVO PADRÃO APTIS ROUTINE (4 SUB-CÁPSULAS DE KPIS) */}
      <div
        className={`rounded-3xl p-6 transition-all duration-300 ${
          tintedGlass
            ? 'aptis-glass-dark text-white'
            : 'aptis-glass-light bg-white border border-slate-200/90 shadow-xs text-slate-900'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                  tintedGlass
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                GOVERNANÇA DA PLANTA & LICENCIAMENTO
              </span>
              <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Organização: {currentTenant.name}
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Suíte Aptis & Licenças • Catálogo Modular Industrial
            </h1>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              Gerencie os módulos ativos da planta e adicione novas soluções de gestão operacional conforme a maturidade da operação evolui.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all border ${
                tintedGlass
                  ? 'bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white border-white/15'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Visão Geral & Aptis Score
            </Link>
          </div>
        </div>

        {/* 4 SUB-CÁPSULAS DE KPIS (Padrão Aptis Routine) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Total na Suíte Aptis
              </span>
              <Layers className={`w-4 h-4 ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {allTools.length}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-600'}`}>
                Módulos Licenciados
              </span>
              <CheckCircle2 className={`w-4 h-4 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {licensedCount}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-cyan-300' : 'text-blue-600'}`}>
                Disponíveis p/ Expansão
              </span>
              <Store className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-500'}`} />
            </div>
            <div className={`text-2xl font-black font-mono mt-1.5 ${tintedGlass ? 'text-cyan-300' : 'text-blue-600'}`}>
              {availableCount}
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl transition-all ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${tintedGlass ? 'text-amber-300' : 'text-amber-600'}`}>
                Plano da Unidade
              </span>
              <Crown className={`w-4 h-4 ${tintedGlass ? 'text-amber-400' : 'text-amber-500'}`} />
            </div>
            <div className={`text-lg sm:text-xl font-black uppercase font-mono mt-1.5 truncate ${tintedGlass ? 'text-amber-300' : 'text-amber-600'}`}>
              {currentTenant.id === 'tenant-dhp' ? 'Master' : currentTenant.plan}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {activationFeedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          tintedGlass
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <Check className="w-4 h-4 text-emerald-500" />
          {activationFeedback}
        </div>
      )}

      {/* BARRA DE NAVEGAÇÃO ÓPTICA (APTIS-MENISCUS-TRACK) + CÁPSULA DE BUSCA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="aptis-meniscus-track inline-flex items-center gap-1 p-1.5 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`py-2 px-4 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'aptis-pill-active text-white font-bold'
                : 'text-slate-300 hover:text-white font-medium'
            }`}
          >
            Todas as Áreas ({allTools.length})
          </button>
          {TOOL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-2 px-4 rounded-xl text-xs transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'aptis-pill-active text-white font-bold'
                  : 'text-slate-300 hover:text-white font-medium'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cápsula de Busca */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar soluções por nome ou função..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl focus:outline-none ${
              tintedGlass
                ? 'aptis-glass-input text-white placeholder-slate-400'
                : 'bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 shadow-2xs focus:border-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map(tool => {
          const isLicensed = hasLicense(tool.id);
          return (
            <div
              key={tool.id}
              className={`rounded-3xl transition-all flex flex-col justify-between overflow-hidden ${
                tintedGlass
                  ? `aptis-glass-dark aptis-glass-dark-interactive ${isLicensed ? 'ring-1 ring-emerald-400/35' : ''}`
                  : `aptis-glass-light bg-white border shadow-xs hover:shadow-md ${isLicensed ? 'border-emerald-300 ring-1 ring-emerald-300/30' : 'border-slate-200'}`
              }`}
            >
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
                    tintedGlass
                      ? 'aptis-glass-subcard border-white/15 text-cyan-300'
                      : `${tool.colorTheme.lightBg} ${tool.colorTheme.border} ${tool.colorTheme.text}`
                  }`}>
                    <ToolIcon name={tool.iconName} className="w-6 h-6" />
                  </div>
                  {isLicensed ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                      tintedGlass
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Licenciado
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      tintedGlass
                        ? 'bg-slate-800/80 text-slate-300 border-white/10'
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}>
                      <Lock className="w-3.5 h-3.5" />
                      Disponível
                    </span>
                  )}
                </div>

                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                  tintedGlass ? 'text-cyan-300/80' : 'text-slate-400'
                }`}>
                  {tool.category}
                </div>
                <h3 className={`text-base font-bold mb-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  {tool.name}
                </h3>
                <p className={`text-xs mb-4 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                  {tool.shortDescription}
                </p>

                {/* Lista de Recursos */}
                <div className={`space-y-1.5 pt-3 border-t mb-2 ${
                  tintedGlass ? 'border-white/10' : 'border-slate-100'
                }`}>
                  {tool.keyFeatures.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className={`flex items-start gap-2 text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                      <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-500'}`} />
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações do Card */}
              <div className={`p-4 border-t flex items-center gap-2 ${
                tintedGlass ? 'border-white/10 bg-white/[0.02]' : 'bg-slate-50 border-slate-100'
              }`}>
                {isLicensed ? (
                  <Link
                    href={tool.route}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/20"
                  >
                    Abrir Módulo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    href={tool.route}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 border text-xs font-bold rounded-xl transition-colors ${
                      tintedGlass
                        ? 'bg-white/10 hover:bg-white/15 border-white/15 text-white'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-2xs'
                    }`}
                  >
                    Ver Detalhes
                  </Link>
                )}

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => handleToggle(tool.id, tool.name)}
                    title={isLicensed ? 'Desativar licença para esta unidade (SuperAdmin)' : 'Ativar licença para esta unidade (SuperAdmin)'}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
                      isLicensed
                        ? (tintedGlass ? 'bg-amber-500/15 hover:bg-rose-500/25 text-amber-300 border-amber-500/30' : 'bg-amber-50 hover:bg-rose-50 text-amber-700 border-amber-200')
                        : (tintedGlass ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/35' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200')
                    }`}
                  >
                    <KeyRound className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
