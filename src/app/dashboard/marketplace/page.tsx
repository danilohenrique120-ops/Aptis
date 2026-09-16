'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { getAllTools, TOOL_CATEGORIES } from '@/config/tools-registry';
import { ToolCategory } from '@/types';
import { ToolIcon } from '@/components/ui/tool-icon';
import { 
  Store, 
  Search, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Check
} from 'lucide-react';

export default function MarketplacePage() {
  const { currentTenant, currentUser, hasLicense, toggleLicense } = useTenant();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activationFeedback, setActivationFeedback] = useState<string | null>(null);

  const allTools = getAllTools();

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
    setActivationFeedback(`${toolName} ${willActivate ? 'ativado com sucesso!' : 'desativado para o tenant.'}`);
    setTimeout(() => setActivationFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
              Catálogo Interno
            </span>
            <span className="text-xs text-slate-500">Organização: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Catálogo Modular de Ferramentas</h1>
          <p className="text-sm text-slate-600">
            Adicione novas soluções à medida que a maturidade da sua operação evolui.
          </p>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {activationFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600" />
          {activationFeedback}
        </div>
      )}

      {/* Busca e Categorias */}
      <div className="flex flex-col md:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar soluções por nome, função ou benefício..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Categorias Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Áreas
          </button>
          {TOOL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => {
          const isLicensed = hasLicense(tool.id);
          return (
            <div
              key={tool.id}
              className={`rounded-2xl border transition-all flex flex-col justify-between bg-white overflow-hidden shadow-xs hover:shadow-md ${
                isLicensed ? 'border-emerald-300 ring-1 ring-emerald-300/30' : 'border-slate-200'
              }`}
            >
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${tool.colorTheme.lightBg} border ${tool.colorTheme.border} flex items-center justify-center ${tool.colorTheme.text}`}>
                    <ToolIcon name={tool.iconName} className="w-6 h-6" />
                  </div>
                  {isLicensed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Licenciado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                      <Lock className="w-3.5 h-3.5" />
                      Disponível
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {tool.category}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                  {tool.shortDescription}
                </p>

                {/* Lista de Recursos */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 mb-2">
                  {tool.keyFeatures.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações do Card */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                {isLicensed ? (
                  <Link
                    href={tool.route}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    Abrir Módulo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={tool.route}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Detalhes
                    </Link>

                    {/* Botão de Toggle para Testes / Admins */}
                    {(currentUser.role === 'superadmin' || currentUser.role === 'tenant_admin') && (
                      <button
                        onClick={() => handleToggle(tool.id, tool.name)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Ativar licença de teste para esta empresa"
                      >
                        Ativar Licença
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
