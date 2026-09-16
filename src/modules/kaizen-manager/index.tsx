'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { KaizenIdea, KaizenCategory, KaizenStage } from './types';
import { 
  TrendingUp, 
  Lightbulb, 
  DollarSign, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
  Trash2
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

const STAGES: { id: KaizenStage; label: string; bg: string; dot: string }[] = [
  { id: 'ideation', label: '1. Ideação & Submissão', bg: 'bg-purple-50/60', dot: 'bg-purple-500' },
  { id: 'analysis', label: '2. Análise de Viabilidade', bg: 'bg-blue-50/60', dot: 'bg-blue-500' },
  { id: 'implementation', label: '3. Em Implementação', bg: 'bg-amber-50/60', dot: 'bg-amber-500' },
  { id: 'standardized', label: '4. Concluído & Padronizado', bg: 'bg-emerald-50/60', dot: 'bg-emerald-500' }
];

const INITIAL_KAIZENS: KaizenIdea[] = [
  {
    id: 'kz-1',
    tenantId: 'tenant-1',
    title: 'Dispositivo Poka-Yoke na furação de chapas',
    problemDescription: 'Operadores ocasionalmente invertiam o lado do chanfro na prensa de conformação, gerando refugo.',
    proposedSolution: 'Instalação de pino guia mecânico que só permite o assentamento da peça no sentido correto.',
    authorName: 'Aline Ferreira',
    authorRole: 'Operadora de Usinagem',
    category: 'qualidade',
    stage: 'standardized',
    estimatedSavingsAnnual: 42000,
    hoursSavedMonthly: 18,
    createdAt: '2026-07-15'
  },
  {
    id: 'kz-2',
    tenantId: 'tenant-1',
    title: 'Bancada ergonômica pantográfica na expedição',
    problemDescription: 'Esforço lombar excessivo durante a transferência de caixas de 25kg para os pallets.',
    proposedSolution: 'Implementar mesa pantográfica acionada a pedal para manter altura constante na linha de cintura.',
    authorName: 'Marcos Vinicius',
    authorRole: 'Operador Especialista',
    category: 'ergonomia',
    stage: 'implementation',
    estimatedSavingsAnnual: 15000,
    hoursSavedMonthly: 24,
    createdAt: '2026-08-01'
  },
  {
    id: 'kz-3',
    tenantId: 'tenant-1',
    title: 'Recuperação de cavacos e fluido de corte',
    problemDescription: 'Perda de óleo refrigerante misturado com raspas de ferro descartadas prematuramente.',
    proposedSolution: 'Centrífuga decantadora compacta para reuso de 70% do óleo solúvel do torno CNC.',
    authorName: 'Carlos Silveira',
    authorRole: 'Gerência de Manutenção',
    category: 'custo',
    stage: 'analysis',
    estimatedSavingsAnnual: 78000,
    hoursSavedMonthly: 12,
    createdAt: '2026-08-20'
  },
  {
    id: 'kz-4',
    tenantId: 'tenant-1',
    title: 'Sinalização visual de travamento em painéis elétricos (LOTO)',
    problemDescription: 'Dificuldade de visualizar à distância se um disjuntor da célula está bloqueado com cadeado.',
    proposedSolution: 'Etiquetas refletivas coloridas magnéticas e quadro de travamento na entrada da célula.',
    authorName: 'Rodrigo Santoro',
    authorRole: 'Operador de Montagem',
    category: 'segurança',
    stage: 'ideation',
    estimatedSavingsAnnual: 0,
    hoursSavedMonthly: 8,
    createdAt: '2026-09-02'
  }
];

export default function KaizenManagerModule() {
  const { currentTenant } = useTenant();
  const [kaizens, setKaizens] = useState<KaizenIdea[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Load from localStorage on mount (clean default [])
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('aptis_kaizen_ideas');
      if (saved) {
        setKaizens(JSON.parse(saved));
      } else {
        setKaizens([]);
      }
    } catch (e) {
      console.error('Erro ao carregar ideias Kaizen:', e);
      setKaizens([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when kaizens change
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aptis_kaizen_ideas', JSON.stringify(kaizens));
    }
  }, [kaizens, isLoaded]);

  // New kaizen form
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState('Operador de Linha');
  const [newCategory, setNewCategory] = useState<KaizenCategory>('produtividade');
  const [newSavings, setNewSavings] = useState('12000');
  const [newHours, setNewHours] = useState('10');

  const filteredKaizens = kaizens.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.authorName.toLowerCase().includes(search.toLowerCase()) ||
                          item.problemDescription.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAdvanceStage = (id: string, currentStage: KaizenStage) => {
    const order: KaizenStage[] = ['ideation', 'analysis', 'implementation', 'standardized'];
    const currentIndex = order.indexOf(currentStage);
    if (currentIndex < order.length - 1) {
      const nextStage = order[currentIndex + 1];
      setKaizens(prev => prev.map(k => k.id === id ? { ...k, stage: nextStage } : k));
    }
  };

  const handleAddKaizen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProblem.trim() || !newSolution.trim()) return;

    const newIdea: KaizenIdea = {
      id: `kz-${Date.now()}`,
      tenantId: currentTenant.id,
      title: newTitle,
      problemDescription: newProblem,
      proposedSolution: newSolution,
      authorName: newAuthor || 'Operador da Linha',
      authorRole: newRole,
      category: newCategory,
      stage: 'ideation',
      estimatedSavingsAnnual: parseFloat(newSavings) || 0,
      hoursSavedMonthly: parseFloat(newHours) || 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setKaizens(prev => [newIdea, ...prev]);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewProblem('');
    setNewSolution('');
  };

  // KPIs
  const totalKaizens = kaizens.length;
  const standardizedCount = kaizens.filter(k => k.stage === 'standardized').length;
  const totalSavings = kaizens.reduce((acc, curr) => acc + (curr.estimatedSavingsAnnual || 0), 0);
  const totalHours = kaizens.reduce((acc, curr) => acc + (curr.hoursSavedMonthly || 0), 0);

  const getCategoryBadge = (cat: KaizenCategory) => {
    switch (cat) {
      case 'segurança':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">Segurança</span>;
      case 'qualidade':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">Qualidade</span>;
      case 'custo':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Custo (R$)</span>;
      case 'produtividade':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">Produtividade</span>;
      case 'ergonomia':
        return <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">Ergonomia</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header do Módulo Aptis Kaizen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-md">
              Aptis Kaizen • Pilar de Melhoria Contínua & Lean
            </span>
            <span className="text-xs text-slate-500">Unidade: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            Aptis Kaizen: Ideias de Chão de Fábrica & Projetos A3
          </h1>
          <p className="text-sm text-slate-600">
            Funil de melhorias contínuas com cálculo de economia financeira anual (R$) e horas recuperadas para a fábrica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {kaizens.length === 0 ? (
            <button
              onClick={() => setKaizens(INITIAL_KAIZENS)}
              title="Carregar ideias de exemplo para teste"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              Carregar Exemplos
            </button>
          ) : (
            <button
              onClick={() => {
                if (window.confirm('Tem certeza que deseja limpar todas as ideias Kaizen?')) {
                  setKaizens([]);
                }
              }}
              title="Limpar ideias cadastradas"
              className="inline-flex items-center gap-1 px-2.5 py-2 text-slate-400 hover:text-rose-600 text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar Ideias
            </button>
          )}

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Propor Nova Melhoria (Kaizen)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total de Propostas</span>
            <Lightbulb className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalKaizens}</p>
          <span className="text-[11px] text-slate-500">Ideias do time fabril</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Padronizadas & Concluídas</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">{standardizedCount}</p>
          <span className="text-[11px] text-slate-500">{Math.round((standardizedCount / (totalKaizens || 1)) * 100)}% de taxa de conclusão</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-medium">
            <span>Economia Anual Estimada</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            R$ {totalSavings.toLocaleString('pt-BR')}
          </p>
          <span className="text-[11px] text-emerald-600">Retorno direto acumulado</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 text-xs font-medium">
            <span>Horas Salvas / Mês</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{totalHours}h/mês</p>
          <span className="text-[11px] text-slate-500">Gargalos eliminados</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar proposta por título, autor ou problema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Categoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 bg-slate-50 rounded-md py-1.5 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="segurança">Segurança</option>
            <option value="qualidade">Qualidade</option>
            <option value="custo">Custo</option>
            <option value="produtividade">Produtividade</option>
            <option value="ergonomia">Ergonomia</option>
          </select>
        </div>
      </div>

      {kaizens.length === 0 && (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-slate-50 border border-indigo-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-slate-800">Funil de Melhoria Contínua Limpo</h4>
            <p className="text-xs text-slate-600">
              Incentive seus operadores e supervisores a submeterem ideias de redução de perdas, segurança e ergonomia.
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar 1ª Ideia Kaizen
          </button>
        </div>
      )}

      {/* Funil Visual Kaizen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {STAGES.map(stage => {
          const stageKaizens = filteredKaizens.filter(k => k.stage === stage.id);
          return (
            <div key={stage.id} className="bg-slate-100/60 rounded-xl p-3 border border-slate-200/80 min-h-[480px] flex flex-col">
              {/* Header do Estágio */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{stage.label}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                  {stageKaizens.length}
                </span>
              </div>

              {/* Lista de Cards de Kaizen */}
              <div className="space-y-3 flex-1">
                {stageKaizens.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    Nenhuma proposta nesta etapa
                  </div>
                ) : (
                  stageKaizens.map(item => (
                    <div 
                      key={item.id} 
                      className="bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {getCategoryBadge(item.category)}
                        <span className="text-[11px] text-slate-400 font-mono">{formatDate(item.createdAt)}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1.5">
                        {item.title}
                      </h4>

                      <div className="bg-slate-50 p-2 rounded text-xs space-y-1 mb-2.5 border border-slate-100">
                        <p className="text-slate-600">
                          <strong className="text-slate-800">Desvio:</strong> {item.problemDescription}
                        </p>
                        <p className="text-indigo-900">
                          <strong className="text-indigo-800">Solução:</strong> {item.proposedSolution}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-slate-100 mb-2">
                        <div>
                          <span className="text-slate-400 block">Ganho Estimado:</span>
                          <span className="font-bold text-emerald-700">
                            {item.estimatedSavingsAnnual > 0 ? `R$ ${item.estimatedSavingsAnnual.toLocaleString('pt-BR')}/ano` : 'Intangível'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Tempo Otimizado:</span>
                          <span className="font-bold text-slate-700">{item.hoursSavedMonthly}h / mês</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div>
                          <span className="font-semibold text-slate-800 block">{item.authorName}</span>
                          <span className="text-[10px] text-slate-400">{item.authorRole}</span>
                        </div>

                        {stage.id !== 'standardized' ? (
                          <button
                            onClick={() => handleAdvanceStage(item.id, item.stage)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold transition-colors cursor-pointer"
                            title="Avançar para o próximo estágio do funil"
                          >
                            Avançar
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Padronizado
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Nova Proposta Kaizen */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Submeter Proposta Kaizen</h3>
            <p className="text-xs text-slate-500 mb-4">Incentive o protagonismo da sua equipe em {currentTenant.name}.</p>

            <form onSubmit={handleAddKaizen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título da Ideia de Melhoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Instalação de gabarito para montagem de conectores"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria de Impacto</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as KaizenCategory)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="produtividade">Produtividade</option>
                    <option value="qualidade">Qualidade</option>
                    <option value="custo">Custo / Economia</option>
                    <option value="segurança">Segurança</option>
                    <option value="ergonomia">Ergonomia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Autor da Ideia</label>
                  <input
                    type="text"
                    placeholder="Ex: Marcos Vinicius"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qual é a dor ou problema atual? *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Descreva o desperdício, risco ou dificuldade atual..."
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qual a sua sugestão de solução prática? *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explique a melhoria sugerida e como ela resolve a causa raiz..."
                  value={newSolution}
                  onChange={e => setNewSolution(e.target.value)}
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Economia Anual Estimada (R$)</label>
                  <input
                    type="number"
                    value={newSavings}
                    onChange={e => setNewSavings(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horas Salvas / Mês</label>
                  <input
                    type="number"
                    value={newHours}
                    onChange={e => setNewHours(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Submeter ao Funil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
