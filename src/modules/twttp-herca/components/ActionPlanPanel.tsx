'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Filter, 
  Search, 
  Cpu, 
  Layers, 
  Calendar, 
  User, 
  MapPin, 
  DollarSign, 
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { HercaInvestigation, HercaAction, ActionHierarchy } from '../types';

interface ActionPlanPanelProps {
  investigations: HercaInvestigation[];
  onUpdateActionStatus: (investigationId: string, actionId: string, status: HercaAction['status'], isEffective?: boolean) => void;
  onSelectInvestigation: (inv: HercaInvestigation) => void;
  tintedGlass?: boolean;
}

const hierarchyConfig: Record<ActionHierarchy, { label: string; light: string; dark: string; icon: string }> = {
  poka_yoke: { label: 'Poka-Yoke Físico', light: 'bg-purple-100 text-purple-800 border-purple-300', dark: 'bg-purple-500/20 text-purple-300 border-purple-500/35', icon: '★' },
  engineering: { label: 'Engenharia / Sensor', light: 'bg-blue-100 text-blue-800 border-blue-300', dark: 'bg-blue-500/20 text-blue-300 border-blue-500/35', icon: '◆' },
  visual_control: { label: 'Controle Visual', light: 'bg-amber-100 text-amber-800 border-amber-300', dark: 'bg-amber-500/20 text-amber-300 border-amber-500/35', icon: '●' },
  procedure_opl: { label: 'Procedimento / OPL', light: 'bg-emerald-100 text-emerald-800 border-emerald-300', dark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35', icon: '▲' },
  training_twttp: { label: 'Treinamento TWTTP', light: 'bg-slate-100 text-slate-700 border-slate-300', dark: 'bg-slate-800 text-slate-300 border-white/15', icon: '■' },
};

export function ActionPlanPanel({
  investigations,
  onUpdateActionStatus,
  onSelectInvestigation,
  tintedGlass = false,
}: ActionPlanPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [hierarchyFilter, setHierarchyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Flatten actions with their investigation context
  const actionItems: { action: HercaAction; investigation: HercaInvestigation }[] = [];
  investigations.forEach((inv) => {
    inv.actions.forEach((act) => {
      actionItems.push({ action: act, investigation: inv });
    });
  });

  const filteredItems = actionItems.filter(({ action, investigation }) => {
    const matchesSearch = 
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.what.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.who.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investigation.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investigation.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHierarchy = hierarchyFilter === 'all' || action.hierarchy === hierarchyFilter;
    const matchesStatus = statusFilter === 'all' || action.status === statusFilter;

    return matchesSearch && matchesHierarchy && matchesStatus;
  });

  // Summary Metrics
  const total = actionItems.length;
  const pokaCount = actionItems.filter(i => i.action.hierarchy === 'poka_yoke').length;
  const verifiedCount = actionItems.filter(i => i.action.status === 'verified_effective').length;

  return (
    <div className="space-y-6">
      {/* Top Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl ${
          tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-xs'
        }`}>
          <span className={`text-xs uppercase font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>Total de Contramedidas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>{total}</span>
            <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>ações 5W2H mapeadas</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${
          tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-purple-50/20 border border-purple-200 shadow-xs'
        }`}>
          <span className={`text-xs uppercase font-semibold ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>Poka-Yoke & Dispositivos Físicos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>{pokaCount}</span>
            <span className={`text-xs font-medium ${tintedGlass ? 'text-purple-400' : 'text-purple-600/80'}`}>({total > 0 ? Math.round((pokaCount / total) * 100) : 0}%)</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl ${
          tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-emerald-50/20 border border-emerald-200 shadow-xs'
        }`}>
          <span className={`text-xs uppercase font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>Eficácia Validada (Gemba Audit)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>{verifiedCount}</span>
            <span className={`text-xs font-medium ${tintedGlass ? 'text-emerald-300' : 'text-emerald-600/80'}`}>({total > 0 ? Math.round((verifiedCount / total) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`p-4 rounded-2xl space-y-3 ${
        tintedGlass ? 'aptis-glass-dark' : 'aptis-glass-light bg-white border border-slate-200 shadow-xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ação, o que fazer, responsável ou código de investigação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-xl focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder-slate-400'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={hierarchyFilter}
              onChange={(e) => setHierarchyFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              <option value="all" className="bg-slate-900 text-white">Todas as Hierarquias WCM</option>
              <option value="poka_yoke" className="bg-slate-900 text-white">★ Poka-Yoke Físico</option>
              <option value="engineering" className="bg-slate-900 text-white">◆ Engenharia / Sensor</option>
              <option value="visual_control" className="bg-slate-900 text-white">● Gestão Visual</option>
              <option value="procedure_opl" className="bg-slate-900 text-white">▲ Procedimento / OPL</option>
              <option value="training_twttp" className="bg-slate-900 text-white">■ Treinamento TWTTP</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-700'
              }`}
            >
              <option value="all" className="bg-slate-900 text-white">Todos os Status</option>
              <option value="pending" className="bg-slate-900 text-white">Pendente</option>
              <option value="in_progress" className="bg-slate-900 text-white">Em Andamento</option>
              <option value="completed" className="bg-slate-900 text-white">Concluída</option>
              <option value="verified_effective" className="bg-slate-900 text-white">Eficácia Validada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions Table / Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl ${
            tintedGlass ? 'aptis-glass-dark text-slate-400' : 'aptis-glass-light bg-white border border-slate-200 text-slate-400'
          }`}>
            <Cpu className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <h4 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-700'}`}>Nenhuma ação encontrada</h4>
            <p className={`text-xs mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Ajuste os filtros de busca para visualizar o plano de contramedidas.</p>
          </div>
        ) : (
          filteredItems.map(({ action, investigation }) => {
            const hConfig = hierarchyConfig[action.hierarchy] || hierarchyConfig.training_twttp;

            return (
              <div
                key={action.id}
                className={`p-5 rounded-2xl transition space-y-3 ${
                  tintedGlass
                    ? 'aptis-glass-dark hover:border-indigo-400/50'
                    : 'aptis-glass-light bg-white border border-slate-200 shadow-xs hover:border-indigo-300'
                }`}
              >
                {/* Top Row: Tag, Investigation Link, Hierarchy & Status Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                      tintedGlass ? hConfig.dark : hConfig.light
                    }`}>
                      <span>{hConfig.icon}</span>
                      <span>{hConfig.label}</span>
                    </span>

                    <button
                      onClick={() => onSelectInvestigation(investigation)}
                      className={`inline-flex items-center gap-1 text-xs font-mono font-bold hover:underline cursor-pointer ${
                        tintedGlass ? 'text-indigo-300' : 'text-indigo-600'
                      }`}
                    >
                      {investigation.code}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-slate-400">•</span>
                    <span className={`text-xs font-medium line-clamp-1 max-w-[280px] ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                      {investigation.title}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>Status:</span>
                    <select
                      value={action.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as HercaAction['status'];
                        onUpdateActionStatus(investigation.id, action.id, newStatus, newStatus === 'verified_effective');
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                        action.status === 'verified_effective'
                          ? (tintedGlass ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35' : 'bg-emerald-100 text-emerald-800 border-emerald-300')
                          : action.status === 'completed'
                          ? (tintedGlass ? 'bg-blue-500/20 text-blue-300 border-blue-500/35' : 'bg-blue-100 text-blue-800 border-blue-300')
                          : action.status === 'in_progress'
                          ? (tintedGlass ? 'bg-amber-500/20 text-amber-300 border-amber-500/35' : 'bg-amber-100 text-amber-800 border-amber-300')
                          : (tintedGlass ? 'bg-slate-800 text-slate-300 border-white/15' : 'bg-slate-100 text-slate-700 border-slate-300')
                      }`}
                    >
                      <option value="pending" className="bg-slate-900 text-white">Pendente</option>
                      <option value="in_progress" className="bg-slate-900 text-white">Em Andamento</option>
                      <option value="completed" className="bg-slate-900 text-white">Concluída</option>
                      <option value="verified_effective" className="bg-slate-900 text-white">✓ Eficácia Validada</option>
                    </select>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {action.title || action.what}
                  </h4>
                  <p className={`text-xs mt-1 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                    <strong>Como:</strong> {action.how || action.what}
                  </p>
                </div>

                {/* 5W2H Info Badges */}
                <div className={`pt-2 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
                  tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Quem: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{action.who}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Onde: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{action.where}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prazo: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{new Date(action.whenDate).toLocaleDateString('pt-BR')}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Custo: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{action.howMuchCost ? `R$ ${action.howMuchCost.toLocaleString('pt-BR')}` : 'R$ 0'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

