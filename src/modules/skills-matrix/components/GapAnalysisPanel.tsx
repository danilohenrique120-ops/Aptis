'use client';

import React, { useState } from 'react';
import { Sector, SkillStation, EmployeeSkillRecord, TrainingAction, SkillLevel } from '../types';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  UserCheck, 
  Clock, 
  Plus, 
  ShieldAlert,
  GraduationCap,
  Trash2,
  Settings2,
  X,
  Check
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface GapAnalysisPanelProps {
  sector: Sector;
  stations: SkillStation[];
  employees: EmployeeSkillRecord[];
  trainingActions: TrainingAction[];
  onAddTrainingAction: (action: TrainingAction) => void;
  onUpdateActionStatus: (actionId: string, status: TrainingAction['status']) => void;
  onDeleteTrainingAction: (actionId: string) => void;
  onCycleLevel: (empId: string, stationId: string) => void;
}

export function GapAnalysisPanel({
  sector,
  stations,
  employees,
  trainingActions,
  onAddTrainingAction,
  onUpdateActionStatus,
  onDeleteTrainingAction,
  onCycleLevel
}: GapAnalysisPanelProps) {
  // Parâmetros customizados por card: stationId -> { operatorId, mentorId, scheduledDate, isCustomized }
  const [cardConfigs, setCardConfigs] = useState<Record<string, {
    operatorId: string;
    mentorId: string;
    scheduledDate: string;
    isCustomized?: boolean;
  }>>({});

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modal de ajuste de parâmetros para um gap específico
  const [activeConfigStation, setActiveConfigStation] = useState<SkillStation | null>(null);
  const [modalOperatorId, setModalOperatorId] = useState<string>('');
  const [modalMentorId, setModalMentorId] = useState<string>('');
  const [modalScheduledDate, setModalScheduledDate] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');

  // Análise de postos críticos
  const criticalStations = stations.map(station => {
    const autonomous = employees.filter(emp => (emp.skills[station.id] || 0) >= 3);
    const deficit = Math.max(0, station.minOperatorsRequired - autonomous.length);
    const candidatesN2 = employees.filter(emp => (emp.skills[station.id] || 0) === 2);
    const candidatesN1 = employees.filter(emp => (emp.skills[station.id] || 0) === 1);
    const otherCandidates = employees.filter(emp => (emp.skills[station.id] || 0) < 3);
    const mentors = employees.filter(emp => (emp.skills[station.id] || 0) === 4);

    return {
      station,
      autonomousCount: autonomous.length,
      deficit,
      isCritical: deficit > 0,
      candidatesN2,
      candidatesN1,
      otherCandidates,
      mentors
    };
  });

  const criticalOnly = criticalStations.filter(cs => cs.isCritical);

  // Obter configuração ativa do card (com defaults inteligentes)
  const getCardConfig = (
    stationId: string, 
    defaultCandidate?: EmployeeSkillRecord, 
    defaultMentor?: EmployeeSkillRecord
  ) => {
    if (cardConfigs[stationId]) {
      return cardConfigs[stationId];
    }
    const defaultDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      operatorId: defaultCandidate?.employeeId || (employees[0]?.employeeId || ''),
      mentorId: defaultMentor?.employeeId || 'supervisor',
      scheduledDate: defaultDate,
      isCustomized: false
    };
  };

  // Abrir modal de configuração para um gap específico
  const handleOpenConfigModal = (
    station: SkillStation, 
    defaultCandidate?: EmployeeSkillRecord, 
    defaultMentor?: EmployeeSkillRecord
  ) => {
    const config = getCardConfig(station.id, defaultCandidate, defaultMentor);
    setActiveConfigStation(station);
    setModalOperatorId(config.operatorId);
    setModalMentorId(config.mentorId);
    setModalScheduledDate(config.scheduledDate);
    setModalNotes(`Capacitação focada no posto ${station.name}.`);
  };

  // Salvar alterações de pré-determinação no card
  const handleSaveModalConfig = (andScheduleImmediately: boolean = false) => {
    if (!activeConfigStation) return;

    const stationId = activeConfigStation.id;
    const updatedConfig = {
      operatorId: modalOperatorId,
      mentorId: modalMentorId,
      scheduledDate: modalScheduledDate,
      isCustomized: true
    };

    setCardConfigs(prev => ({
      ...prev,
      [stationId]: updatedConfig
    }));

    if (andScheduleImmediately) {
      const operator = employees.find(e => e.employeeId === modalOperatorId);
      const mentor = employees.find(e => e.employeeId === modalMentorId);

      const newAction: TrainingAction = {
        id: `act-${Date.now().toString().slice(-6)}`,
        sectorId: sector.id,
        stationId: activeConfigStation.id,
        stationName: activeConfigStation.name,
        operatorId: operator?.employeeId || modalOperatorId,
        operatorName: operator?.employeeName || 'Operador',
        mentorId: mentor?.employeeId || 'supervisor',
        mentorName: mentor?.employeeName || `Supervisor (${sector.managerName})`,
        currentLevel: operator?.skills[activeConfigStation.id] || 1,
        targetLevel: 3,
        status: 'pending',
        scheduledDate: modalScheduledDate,
        notes: modalNotes
      };

      onAddTrainingAction(newAction);
      setFeedbackMessage(`Ação agendada com sucesso para ${operator?.employeeName || 'operador'}!`);
    } else {
      setFeedbackMessage(`Pré-determinações de ${activeConfigStation.name} atualizadas!`);
    }

    setTimeout(() => setFeedbackMessage(null), 3000);
    setActiveConfigStation(null);
  };

  // Agendamento direto com os parâmetros do card
  const handleScheduleFromCard = (
    station: SkillStation, 
    defaultCandidate?: EmployeeSkillRecord, 
    defaultMentor?: EmployeeSkillRecord
  ) => {
    const config = getCardConfig(station.id, defaultCandidate, defaultMentor);
    const operator = employees.find(e => e.employeeId === config.operatorId) || defaultCandidate;
    const mentor = employees.find(e => e.employeeId === config.mentorId);

    if (!operator) return;

    const newAction: TrainingAction = {
      id: `act-${Date.now().toString().slice(-6)}`,
      sectorId: sector.id,
      stationId: station.id,
      stationName: station.name,
      operatorId: operator.employeeId,
      operatorName: operator.employeeName,
      mentorId: mentor?.employeeId || 'supervisor',
      mentorName: mentor?.employeeName || `Supervisor (${sector.managerName})`,
      currentLevel: operator.skills[station.id] || 1,
      targetLevel: 3,
      status: 'pending',
      scheduledDate: config.scheduledDate,
      notes: `Capacitação para atingir autonomia (N3) no posto ${station.name}.`
    };

    onAddTrainingAction(newAction);
    setFeedbackMessage(`Ação de treinamento agendada para ${operator.employeeName}!`);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const sectorActions = trainingActions.filter(a => a.sectorId === sector.id);

  return (
    <div className="space-y-8">
      {/* Header do Diagnóstico */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded">
              Diagnóstico Automático
            </span>
            <span className="text-xs text-slate-400">Setor: {sector.name}</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Análise de Gaps & Motor de Recomendações de Treinamento
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Cards otimizados e compactos. Agende a capacitação recomendada diretamente com 1 clique ou clique em <strong>Ajustar</strong> para alterar o tutor ou o prazo previsto.
          </p>
        </div>

        <button
          onClick={() => {
            if (stations.length > 0) {
              handleOpenConfigModal(stations[0], employees[0]);
            }
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agendar Ação Manual
        </button>
      </div>

      {/* Alerta de Feedback */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {feedbackMessage}
        </div>
      )}

      {/* 1. Diagnóstico de Gargalos Críticos (CARDS MENORES E OTIMIZADOS) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Postos com Déficit de Cobertura
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
            {criticalOnly.length} de {stations.length} postos em alerta
          </span>
        </div>

        {criticalOnly.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-emerald-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-bold text-sm">Cobertura 100% em Dia!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">
              Todos os postos do setor {sector.name} possuem a quantidade mínima de operadores autônomos (N3/N4) garantida.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {criticalOnly.map(({ station, autonomousCount, deficit, candidatesN2, candidatesN1, otherCandidates, mentors }) => {
              const primaryCandidate = candidatesN2[0] || candidatesN1[0] || otherCandidates[0];
              const primaryMentor = mentors[0];
              const config = getCardConfig(station.id, primaryCandidate, primaryMentor);

              // Operador e tutor atualmente selecionados
              const currentCandidate = employees.find(e => e.employeeId === config.operatorId) || primaryCandidate;
              const currentMentor = employees.find(e => e.employeeId === config.mentorId);
              const currentMentorName = currentMentor 
                ? `${currentMentor.employeeName} (${currentMentor.skills[station.id] === 4 ? 'Especialista N4' : currentMentor.role})`
                : `Supervisor da Célula (${sector.managerName})`;

              return (
                <div 
                  key={station.id} 
                  className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div>
                    {/* Topo do Card: Identificação do Posto e Déficit */}
                    <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Déficit de {deficit} operador(es)
                        </span>
                        <h4 className="text-base font-bold text-slate-900 mt-1">
                          {station.name}
                        </h4>
                        <span className="text-xs text-slate-500">Família: {station.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-rose-600">
                          {autonomousCount}
                        </span>
                        <span className="text-xs text-slate-400 block font-medium">
                          / {station.minOperatorsRequired} req.
                        </span>
                      </div>
                    </div>

                    {/* Recomendação Inteligente (Compacta & Atualizada) */}
                    {currentCandidate && (
                      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-slate-700 mt-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            Sugestão do Algoritmo Lean:
                          </div>
                          {config.isCustomized && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded border border-blue-200">
                              Personalizado
                            </span>
                          )}
                        </div>
                        <p className="leading-relaxed text-[11px]">
                          Promover <strong>{currentCandidate.employeeName}</strong> (Nível {currentCandidate.skills[station.id] || 1} ➔ N3) sob tutoria de <strong>{currentMentorName}</strong>.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Rodapé do Card Otimizado: Atalho de Ajuste + Botão de Agendamento */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenConfigModal(station, primaryCandidate, primaryMentor)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                      title="Clique para mudar o tutor, o operador ou o prazo deste gap"
                    >
                      <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ajustar ({formatDate(config.scheduledDate)})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleScheduleFromCard(station, primaryCandidate, primaryMentor)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                    >
                      Agendar Capacitação
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Tabela de Ações em Andamento com Lixeira */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Plano de Ação de Capacitações em Andamento ({sectorActions.length})
          </h3>
          <span className="text-xs text-slate-500">
            Ações ativas para {sector.name}
          </span>
        </div>

        {sectorActions.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs italic">
            Nenhuma ação de treinamento cadastrada para este setor até o momento.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Posto de Trabalho</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Operador em Treinamento</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">Tutor / Instrutor</th>
                    <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider text-center">Meta Nível</th>
                    <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider text-center">Data Limite</th>
                    <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {sectorActions.map(action => (
                    <tr key={action.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {action.stationName}
                        {action.notes && (
                          <span className="block text-[10px] text-slate-400 font-normal truncate max-w-xs" title={action.notes}>
                            {action.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {action.operatorName}
                        <span className="block text-[10px] text-slate-400 font-normal">Nível de entrada: N{action.currentLevel}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {action.mentorName}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                          N{action.targetLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 font-mono font-medium">
                        {formatDate(action.scheduledDate)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {action.status === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Concluído
                          </span>
                        ) : action.status === 'in_progress' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Em Andamento
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {action.status !== 'completed' ? (
                            <button
                              onClick={() => {
                                onUpdateActionStatus(action.id, 'completed');
                                onCycleLevel(action.operatorId, action.stationId);
                                setFeedbackMessage(`Operador ${action.operatorName} promovido a N3 na Matriz!`);
                                setTimeout(() => setFeedbackMessage(null), 3000);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                              title="Concluir capacitação e promover operador para N3 na matriz"
                            >
                              Aprovar N3
                            </button>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 pr-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aprovado
                            </span>
                          )}

                          {/* BOTÃO DA LIXEIRINHA PARA EXCLUSÃO */}
                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a ação de treinamento de ${action.operatorName}?`)) {
                                onDeleteTrainingAction(action.id);
                                setFeedbackMessage(`Ação de treinamento excluída.`);
                                setTimeout(() => setFeedbackMessage(null), 2500);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir este plano de ação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA AJUSTAR PRÉ-DETERMINAÇÕES (TUTOR, OPERADOR E PRAZO) */}
      {activeConfigStation && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveConfigStation(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  Ajustar Pré-determinações
                </span>
                <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
                  {activeConfigStation.name}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Personalize o operador que receberá o treinamento, o instrutor/tutor responsável e a data limite estimada.
            </p>

            <div className="space-y-3.5">
              {/* Operador */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operador a Capacitar:
                </label>
                <select
                  value={modalOperatorId}
                  onChange={e => setModalOperatorId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 cursor-pointer"
                >
                  {employees.map(emp => {
                    const lvl = emp.skills[activeConfigStation.id] || 1;
                    return (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeName} (Nível {lvl} - {emp.role})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Tutor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tutor / Instrutor Responsável:
                </label>
                <select
                  value={modalMentorId}
                  onChange={e => setModalMentorId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 cursor-pointer"
                >
                  <option value="supervisor">👔 Supervisor da Célula ({sector.managerName})</option>
                  {employees.map(emp => {
                    const lvl = emp.skills[activeConfigStation.id] || 1;
                    const isExpert = lvl === 4;
                    return (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.employeeName} {isExpert ? '🏆 N4 Especialista' : `(Nível ${lvl})`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Prazo com Atalhos */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Data Limite Estimada:</span>
                  <span className="text-[10px] text-slate-400 font-normal">Atalhos rápidos:</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={modalScheduledDate}
                    onChange={e => setModalScheduledDate(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setModalScheduledDate(d);
                      }}
                      className="px-2.5 py-2 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      +15d
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setModalScheduledDate(d);
                      }}
                      className="px-2.5 py-2 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      +30d
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        setModalScheduledDate(d);
                      }}
                      className="px-2.5 py-2 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 transition-colors"
                    >
                      +60d
                    </button>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruções / Observações (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="Ex: Treinamento em setup rápido e controle de qualidade..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveConfigStation(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveModalConfig(false)}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-300"
                    title="Apenas atualiza as escolhas no card sem agendar agora"
                  >
                    Salvar no Card
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveModalConfig(true)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Salvar & Agendar Agora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
