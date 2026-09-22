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
}

const hierarchyConfig: Record<ActionHierarchy, { label: string; badge: string; icon: string }> = {
  poka_yoke: { label: 'Poka-Yoke Físico', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800', icon: '★' },
  engineering: { label: 'Engenharia / Sensor', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800', icon: '◆' },
  visual_control: { label: 'Controle Visual', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800', icon: '●' },
  procedure_opl: { label: 'Procedimento / OPL', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800', icon: '▲' },
  training_twttp: { label: 'Treinamento TWTTP', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700', icon: '■' },
};

export function ActionPlanPanel({
  investigations,
  onUpdateActionStatus,
  onSelectInvestigation,
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
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-500">Total de Contramedidas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{total}</span>
            <span className="text-xs text-slate-500">ações 5W2H mapeadas</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50 shadow-xs bg-purple-50/20">
          <span className="text-xs uppercase font-semibold text-purple-700 dark:text-purple-300">Poka-Yoke & Dispositivos Físicos</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-700 dark:text-purple-300">{pokaCount}</span>
            <span className="text-xs text-purple-600/80 font-medium">({total > 0 ? Math.round((pokaCount / total) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs bg-emerald-50/20">
          <span className="text-xs uppercase font-semibold text-emerald-700 dark:text-emerald-300">Eficácia Validada (Gemba Audit)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{verifiedCount}</span>
            <span className="text-xs text-emerald-600/80 font-medium">({total > 0 ? Math.round((verifiedCount / total) * 100) : 0}%)</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por ação, o que fazer, responsável ou código de investigação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={hierarchyFilter}
              onChange={(e) => setHierarchyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            >
              <option value="all">Todas as Hierarquias WCM</option>
              <option value="poka_yoke">★ Poka-Yoke Físico</option>
              <option value="engineering">◆ Engenharia / Sensor</option>
              <option value="visual_control">● Gestão Visual</option>
              <option value="procedure_opl">▲ Procedimento / OPL</option>
              <option value="training_twttp">■ Treinamento TWTTP</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em Andamento</option>
              <option value="completed">Concluída</option>
              <option value="verified_effective">Eficácia Validada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions Table / Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            <Cpu className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Nenhuma ação encontrada</h4>
            <p className="text-xs text-slate-500 mt-1">Ajuste os filtros de busca para visualizar o plano de contramedidas.</p>
          </div>
        ) : (
          filteredItems.map(({ action, investigation }) => {
            const hConfig = hierarchyConfig[action.hierarchy] || hierarchyConfig.training_twttp;

            return (
              <div
                key={action.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 transition space-y-3"
              >
                {/* Top Row: Tag, Investigation Link, Hierarchy & Status Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 ${hConfig.badge}`}>
                      <span>{hConfig.icon}</span>
                      <span>{hConfig.label}</span>
                    </span>

                    <button
                      onClick={() => onSelectInvestigation(investigation)}
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {investigation.code}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium line-clamp-1 max-w-[280px]">
                      {investigation.title}
                    </span>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Status:</span>
                    <select
                      value={action.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as HercaAction['status'];
                        onUpdateActionStatus(investigation.id, action.id, newStatus, newStatus === 'verified_effective');
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-hidden ${
                        action.status === 'verified_effective' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' :
                        action.status === 'completed' ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300' :
                        action.status === 'in_progress' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <option value="pending">Pendente</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluída</option>
                      <option value="verified_effective">✓ Eficácia Validada</option>
                    </select>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {action.title || action.what}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    <strong>Como:</strong> {action.how || action.what}
                  </p>
                </div>

                {/* 5W2H Info Badges */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Quem: <strong className="text-slate-700 dark:text-slate-300">{action.who}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Onde: <strong className="text-slate-700 dark:text-slate-300">{action.where}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prazo: <strong className="text-slate-700 dark:text-slate-300">{new Date(action.whenDate).toLocaleDateString('pt-BR')}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Custo: <strong className="text-slate-700 dark:text-slate-300">{action.howMuchCost ? `R$ ${action.howMuchCost.toLocaleString('pt-BR')}` : 'R$ 0'}</strong></span>
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

