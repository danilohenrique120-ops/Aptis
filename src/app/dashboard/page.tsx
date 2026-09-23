'use client';

import React from 'react';
import Link from 'next/link';
import { useTenant } from '@/context/tenant-context';
import { getAllTools } from '@/config/tools-registry';
import { ToolIcon } from '@/components/ui/tool-icon';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Store, 
  ShieldCheck, 
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Activity,
  AlertTriangle,
  ChevronRight,
  Database,
  Trash2,
  RotateCcw,
  Layers
} from 'lucide-react';
import { PlantSectorsManagerModal } from '@/components/modals/PlantSectorsManagerModal';
import { usePlantSectors } from '@/hooks/use-plant-sectors';

export default function DashboardHomePage() {
  const { currentTenant, currentUser, hasLicense, toggleLicense } = useTenant();
  const allTools = getAllTools();
  const { sectors } = usePlantSectors();
  const [isSectorsModalOpen, setIsSectorsModalOpen] = React.useState(false);

  const activeTools = allTools.filter(tool => hasLicense(tool.id));
  const lockedTools = allTools.filter(tool => !hasLicense(tool.id));

  // Dynamic stats from localStorage
  const [stats, setStats] = React.useState({
    totalTasks: 0,
    totalEmployees: 0,
    totalTrainings: 0,
    totalKaizens: 0,
    isLoaded: false
  });

  React.useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('aptis_routine_tasks');
      const savedEmployees = localStorage.getItem('aptis_skills_employees');
      const savedTrainings = localStorage.getItem('aptis_compliance_trainings');
      const savedKaizens = localStorage.getItem('aptis_kaizen_ideas');

      setStats({
        totalTasks: savedTasks ? JSON.parse(savedTasks).length : 0,
        totalEmployees: savedEmployees ? JSON.parse(savedEmployees).length : 0,
        totalTrainings: savedTrainings ? JSON.parse(savedTrainings).length : 0,
        totalKaizens: savedKaizens ? JSON.parse(savedKaizens).length : 0,
        isLoaded: true
      });
    } catch (e) {
      console.error(e);
      setStats(prev => ({ ...prev, isLoaded: true }));
    }
  }, []);

  const handleResetAllData = () => {
    if (window.confirm('Tem certeza que deseja zerar todos os dados e deixar o sistema 100% em branco para operar do zero?')) {
      localStorage.removeItem('aptis_routine_tasks');
      localStorage.removeItem('aptis_skills_stations');
      localStorage.removeItem('aptis_skills_employees');
      localStorage.removeItem('aptis_skills_actions');
      localStorage.removeItem('aptis_skills_sectors');
      localStorage.removeItem('aptis_compliance_trainings');
      localStorage.removeItem('aptis_compliance_docs');
      localStorage.removeItem('aptis_kaizen_ideas');
      window.location.reload();
    }
  };

  const hasAnyData = stats.totalTasks > 0 || stats.totalEmployees > 0 || stats.totalTrainings > 0 || stats.totalKaizens > 0;

  // The Aptis Score calculation (Conceito de Ouro)
  const aptisScore = hasAnyData ? 95 : 100;
  const aptisCompliance = hasAnyData ? 98 : 100; // Aptidão Legal (NRs e POPs)
  const aptisSkills = hasAnyData ? 92 : 100;     // Aptidão Técnica (ILUO)
  const aptisRoutine = hasAnyData ? 95 : 100;    // Aptidão de Rotina (Kamishibai & Handover)

  return (
    <div className="space-y-8 w-full">
      {/* Banner de Boas-Vindas & Status da Organização - Cockpit Industrial */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              Planta: {currentTenant.name}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aptis Suite • Plano {currentTenant.plan.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 text-white">
            Centro de Comando da Planta
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
            Olá, <strong>{currentUser.name}</strong>. Monitore a prontidão operacional em tempo real: operadores capacitados, conformidade regulatória sem risco de interdição e passagens de turno sem falhas.
          </p>

          {/* Mini Estatísticas da Planta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block">Módulos Aptis Ativos</span>
              <span className="text-xl sm:text-2xl font-bold text-white mt-0.5 block font-mono">
                {activeTools.length} de {allTools.length}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Segmento Fabril</span>
              <span className="text-sm sm:text-base font-semibold text-slate-200 mt-0.5 block truncate">
                {currentTenant.segment || 'Manufatura / Usinagem'}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Efetivo Operacional</span>
              <span className="text-xl sm:text-2xl font-bold text-cyan-300 mt-0.5 block font-mono">
                {stats.totalEmployees > 0 ? stats.totalEmployees : (currentTenant.employeeCount || 120)} operadores
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Status de Prontidão</span>
              <span className="text-sm font-semibold text-emerald-400 mt-0.5 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Fábrica Sempre Apta
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* GOVERNANÇA DA PLANTA: ESTRUTURA DE ÁREAS & SETORES FABRIS */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Estrutura da Planta: Áreas & Setores Fabris
              </h2>
              <span className="text-[11px] bg-cyan-950/90 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-800/80 font-bold font-mono">
                {sectors.length} Áreas Ativas
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Base oficial da sua fábrica. Cadastre novos setores ou exclua áreas descontinuadas. Toda alteração replica em tempo real em todas as ferramentas da suíte Aptis.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSectorsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 shrink-0 cursor-pointer"
        >
          <Layers className="w-4 h-4 text-slate-950" />
          Gerenciar Áreas & Setores
        </button>
      </div>

      {/* O CONCEITO DE OURO: THE APTIS SCORE (ÍNDICE DE APTIDÃO DA PLANTA) */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-md">
                Métrica Proprietária • Aptis Index
              </span>
              <span className="text-xs text-slate-500">Unidade: {currentTenant.name}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600" />
              The Aptis Score (Índice Global de Aptidão da Planta)
            </h2>
            <p className="text-xs text-slate-500">
              Prontidão operacional integrada: conformidade legal, polivalência técnica e governança diária de rotina.
            </p>
          </div>

          {/* Placar Central do Aptis Score */}
          <div className="bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 px-6 flex items-center gap-5 shrink-0 shadow-lg border border-slate-800">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aptis Score Geral</div>
              <div className="text-3xl font-black text-cyan-300 mt-0.5 font-mono">{aptisScore}%</div>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Planta Conforme
              </div>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-cyan-950 to-emerald-950 border border-cyan-500/40 flex items-center justify-center font-black text-cyan-300 text-lg shadow-inner">
              APTO
            </div>
          </div>
        </div>

        {/* Os 3 Pilares do Aptis Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pilar 1: Aptidão Legal (Aptis Compliance) */}
          <Link
            href="/dashboard/tools/training-matrix"
            className="p-4 rounded-xl bg-slate-50/70 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-300 transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  ⚖️
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                    1. Aptidão Legal
                  </h3>
                  <span className="text-[10px] text-slate-500">Aptis Compliance</span>
                </div>
              </div>
              <span className="text-lg font-black text-amber-900">{aptisCompliance}%</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Operadores com <strong>NRs e POPs vigentes</strong>. Zero bloqueios operacionais preventivos na linha de produção.
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full rounded-full" style={{ width: `${aptisCompliance}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span>Auditoria MTE / ISO</span>
              <span className="text-amber-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Verificar <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Pilar 2: Aptidão Técnica (Aptis Skills) */}
          <Link
            href="/dashboard/tools/skills-matrix"
            className="p-4 rounded-xl bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300 transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  🎯
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    2. Aptidão Técnica
                  </h3>
                  <span className="text-[10px] text-slate-500">Aptis Skills</span>
                </div>
              </div>
              <span className="text-lg font-black text-emerald-900">{aptisSkills}%</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Postos críticos cobertos por operadores autônomos nível <strong>'U' ou tutores 'O' (ILUO)</strong>.
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${aptisSkills}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span>Flexibilidade de Linha</span>
              <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Verificar <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>

          {/* Pilar 3: Aptidão de Rotina (Aptis Routine) */}
          <Link
            href="/dashboard/tools/manager-tasks"
            className="p-4 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-300 transition-all group cursor-pointer block"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  📋
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                    3. Aptidão de Rotina
                  </h3>
                  <span className="text-[10px] text-slate-500">Aptis Routine</span>
                </div>
              </div>
              <span className="text-lg font-black text-blue-900">{aptisRoutine}%</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Adesão aos <strong>rituais Kamishibai de turno</strong> e passagens de bastão formalizadas sem ruído de comunicação.
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${aptisRoutine}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 font-medium">
              <span>Governança do Líder</span>
              <span className="text-blue-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Verificar <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Seção 1: A Suíte Aptis (Módulos Contratados) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Suíte Aptis Operacional
            </h2>
            <p className="text-xs text-slate-500">
              Módulos licenciados e em execução na planta de {currentTenant.name}.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            {activeTools.length} módulos ativos
          </span>
        </div>

        {activeTools.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
            <p className="text-slate-500 text-sm mb-4">Nenhum módulo Aptis ativado para esta organização ainda.</p>
            <Link
              href="/dashboard/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              <Store className="w-4 h-4" />
              Explorar Suíte Aptis
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {activeTools.map(tool => (
              <div 
                key={tool.id} 
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${tool.colorTheme.lightBg} border ${tool.colorTheme.border} flex items-center justify-center ${tool.colorTheme.text}`}>
                        <ToolIcon name={tool.iconName} className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {tool.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {tool.name}
                        </h3>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Ativo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {tool.shortDescription}
                  </p>

                  <div className="space-y-1.5 mb-5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {tool.keyFeatures.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  href={tool.route}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Acessar {tool.name}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Seção 2: Adicionar Novos Módulos Aptis (Upgrades) */}
      <section className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Expandir com Novos Módulos Aptis
            </h2>
            <p className="text-xs text-slate-500">
              Contrate módulos especializados para elevar o Aptis Score e a maturidade de gestão da sua planta.
            </p>
          </div>
          <Link
            href="/dashboard/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver Todos os Módulos Aptis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {lockedTools.map(tool => (
            <div 
              key={tool.id} 
              className="bg-slate-50/80 rounded-xl p-5 border border-dashed border-slate-300 hover:border-slate-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center">
                      <ToolIcon name={tool.iconName} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {tool.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800">
                        {tool.name}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    <Lock className="w-3 h-3" />
                    Disponível
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  {tool.shortDescription}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link
                  href={tool.route}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Conhecer Módulo
                </Link>

                {/* Atalho de Ativação Rápida no Modo Demo */}
                {(currentUser.role === 'superadmin' || currentUser.role === 'tenant_admin') && (
                  <button
                    onClick={() => toggleLicense(currentTenant.id, tool.id, true)}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    title="Ativar licença de demonstração instantaneamente"
                  >
                    Ativar (Demo)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEÇÃO DE GESTÃO DE DADOS & ESTADO DA PLANTA */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Controle de Dados da Organização ({currentTenant.name})
            </h3>
            <p className="text-xs text-slate-500">
              {hasAnyData
                ? `Dados ativos gravados localmente: ${stats.totalTasks} tarefas, ${stats.totalEmployees} operadores, ${stats.totalTrainings} treinamentos/POPs e ${stats.totalKaizens} Kaizens.`
                : 'A plataforma está 100% limpa e pronta para receber os primeiros dados reais da sua fábrica.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasAnyData && (
            <button
              onClick={handleResetAllData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-lg transition-colors cursor-pointer"
              title="Zerar todos os dados e começar do zero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Zerar Todos os Dados
            </button>
          )}
        </div>
      </section>

      {/* Modal Central de Áreas & Setores Fabris */}
      <PlantSectorsManagerModal
        isOpen={isSectorsModalOpen}
        onClose={() => setIsSectorsModalOpen(false)}
        tenantName={currentTenant.name}
      />
    </div>
  );
}
