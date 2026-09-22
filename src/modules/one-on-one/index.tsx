'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/tenant-context';
import { 
  TeamMember1on1, 
  OneOnOneMeeting, 
  PowerfulQuestionPrompt,
  ActionItem
} from './types';
import { 
  INITIAL_TEAM_MEMBERS, 
  INITIAL_MEETINGS_HISTORY, 
  POWERFUL_QUESTIONS 
} from './mock-data';
import { OneOnOneDashboard } from './components/OneOnOneDashboard';
import { MeetingFormModal } from './components/MeetingFormModal';
import { 
  Users, 
  Sparkles, 
  HelpCircle, 
  CheckSquare, 
  Calendar, 
  Plus, 
  X, 
  Check, 
  Clock, 
  Mic, 
  UserCheck, 
  User, 
  Award,
  ArrowRight,
  ChevronRight,
  ListTodo
} from 'lucide-react';

export default function OneOnOneModule() {
  const { currentUser, currentTenant } = useTenant();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'actions'>('dashboard');
  const [members, setMembers] = useState<TeamMember1on1[]>(INITIAL_TEAM_MEMBERS);
  const [meetings, setMeetings] = useState<OneOnOneMeeting[]>(INITIAL_MEETINGS_HISTORY);
  
  // Modais
  const [selectedMemberForMeeting, setSelectedMemberForMeeting] = useState<TeamMember1on1 | null>(null);
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<OneOnOneMeeting | null>(null);

  // Carrega e persiste no localStorage
  useEffect(() => {
    try {
      const savedMembers = localStorage.getItem('aptis_1on1_members');
      const savedMeetings = localStorage.getItem('aptis_1on1_meetings');

      if (savedMembers) setMembers(JSON.parse(savedMembers));
      if (savedMeetings) setMeetings(JSON.parse(savedMeetings));
    } catch (e) {
      console.warn('Erro ao carregar reuniões 1:1 do localStorage:', e);
    }
  }, []);

  const saveMembersToStorage = (newMembers: TeamMember1on1[]) => {
    setMembers(newMembers);
    try {
      localStorage.setItem('aptis_1on1_members', JSON.stringify(newMembers));
    } catch (e) {
      console.warn(e);
    }
  };

  const saveMeetingsToStorage = (newMeetings: OneOnOneMeeting[]) => {
    setMeetings(newMeetings);
    try {
      localStorage.setItem('aptis_1on1_meetings', JSON.stringify(newMeetings));
    } catch (e) {
      console.warn(e);
    }
  };

  // Salvar nova reunião realizada
  const handleSaveMeeting = (newMeeting: OneOnOneMeeting) => {
    const updatedMeetings = [newMeeting, ...meetings];
    saveMeetingsToStorage(updatedMeetings);

    // Atualiza status do liderado
    const updatedMembers = members.map(m => {
      if (m.id === newMeeting.employeeId) {
        return {
          ...m,
          lastMeetingDate: newMeeting.date,
          meetingsCount: m.meetingsCount + 1,
          averageMood: Number(((m.averageMood * m.meetingsCount + newMeeting.moodRating) / (m.meetingsCount + 1)).toFixed(1)),
          openActionItemsCount: m.openActionItemsCount + newMeeting.actionItems.filter(a => a.status === 'pending').length,
          status: 'up_to_date' as const
        };
      }
      return m;
    });
    saveMembersToStorage(updatedMembers);

    setSelectedMemberForMeeting(null);
  };

  // Concluir ação
  const handleToggleActionStatus = (meetingId: string, actionId: string) => {
    const updatedMeetings = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: m.actionItems.map(a => {
            if (a.id === actionId) {
              return { ...a, status: (a.status === 'pending' ? 'completed' : 'pending') as any };
            }
            return a;
          })
        };
      }
      return m;
    });
    saveMeetingsToStorage(updatedMeetings);
  };

  // Todas as ações de reuniões para aba de compromissos
  const allActionItemsWithMeeting = meetings.flatMap(m => 
    m.actionItems.map(a => ({
      ...a,
      meetingId: m.id,
      meetingDate: m.date,
      employeeName: m.employeeName
    }))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER DO MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Gestão de Pessoas & Liderança
            </span>
            <span className="text-xs text-slate-500 font-medium">Planta: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Aptis 1:1 • Reuniões Individuais Estratégicas
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1">
            Prática consagrada dos melhores líderes mundiais: conversas individuais focadas em destravar a rotina do operador, feedbacks honestos, desenvolvimento e planos de ação.
          </p>
        </div>

        {/* Botão de Iniciar 1:1 Rápido */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedMemberForMeeting(members[0])}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Reunião 1:1
          </button>
        </div>
      </div>

      {/* ABAS DO MÓDULO */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Painel da Equipe & Cadência
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'actions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <ListTodo className="w-4 h-4 text-emerald-500" />
          Compromissos & Ações Mútuas
          {allActionItemsWithMeeting.filter(a => a.status === 'pending').length > 0 && (
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
              {allActionItemsWithMeeting.filter(a => a.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-500" />
          Metodologia & Banco de Perguntas
        </button>
      </div>

      {/* CONTEÚDO DA ABA SELECIONADA */}
      {activeTab === 'dashboard' && (
        <OneOnOneDashboard
          members={members}
          meetings={meetings}
          onOpenMeetingModal={(member) => setSelectedMemberForMeeting(member)}
          onViewMeetingDetail={(meeting) => setSelectedMeetingDetail(meeting)}
        />
      )}

      {/* ABA DE COMPROMISSOS */}
      {activeTab === 'actions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-emerald-600" />
              Compromissos & Entregas das Reuniões 1:1
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de todas as promessas feitas entre o gestor e os liderados.
            </p>
          </div>

          <div className="space-y-3">
            {allActionItemsWithMeeting.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum compromisso registrado ainda. Realize reuniões 1:1 para pactuar ações.
              </div>
            ) : (
              allActionItemsWithMeeting.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    item.status === 'completed'
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleActionStatus(item.meetingId, item.id)}
                      className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-all cursor-pointer ${
                        item.status === 'completed' ? 'bg-emerald-600 text-white' : 'border border-slate-300 hover:border-emerald-500'
                      }`}
                    >
                      {item.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <span className={`text-xs font-bold block ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.title}
                      </span>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span>Liderado: <strong>{item.employeeName}</strong></span>
                        <span>•</span>
                        <span className={`font-semibold ${item.assignee === 'manager' ? 'text-blue-700' : 'text-emerald-700'}`}>
                          Responsável: {item.assigneeName}
                        </span>
                        <span>•</span>
                        <span className="font-mono">Prazo: {item.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA DE METODOLOGIA E PERGUNTAS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white border border-rose-900/40 shadow-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Metodologia dos Melhores Gestores
            </span>
            <h2 className="text-2xl font-black text-white">Como conduzir uma Reunião 1:1 de Alto Impacto</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Segundo Andy Grove (*High Output Management*), a reunião 1:1 não é uma prestação de contas burocrática, mas sim a ferramenta que gera a maior alavancagem de liderança que existe. Em 30 minutos, você previne meses de retrabalho, perda de operadores e acidentes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {POWERFUL_QUESTIONS.map((q) => (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    <span>{q.category}</span>
                    <span className="text-slate-400">{q.source}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    "{q.question}"
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Pronta para uso no 1:1</span>
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE CONDUÇÃO DE REUNIÃO 1:1 */}
      {selectedMemberForMeeting && (
        <MeetingFormModal
          member={selectedMemberForMeeting}
          managerName={currentUser.name || 'Danilo Henrique'}
          onClose={() => setSelectedMemberForMeeting(null)}
          onSaveMeeting={handleSaveMeeting}
        />
      )}

      {/* MODAL DE DETALHES / ATA DA REUNIÃO PASSADA */}
      {selectedMeetingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  Ata da Reunião 1:1
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedMeetingDetail.employeeName}</h3>
                <span className="text-xs text-slate-500">{selectedMeetingDetail.date} • {selectedMeetingDetail.durationMinutes} minutos</span>
              </div>
              <button
                onClick={() => setSelectedMeetingDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Transcrições de Voz */}
            {selectedMeetingDetail.transcripts && selectedMeetingDetail.transcripts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-cyan-600" />
                  Transcrição das Falas Gravadas:
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 max-h-56 overflow-y-auto text-xs">
                  {selectedMeetingDetail.transcripts.map((t) => (
                    <div key={t.id} className="text-xs">
                      <span className={`font-bold ${t.speaker === 'manager' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {t.speakerName} ({t.timestamp}):
                      </span>{' '}
                      <span className="text-slate-700">{t.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações Acordadas */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Compromissos Acordados:
              </h4>
              <div className="space-y-1.5 text-xs">
                {selectedMeetingDetail.actionItems.map((a) => (
                  <div key={a.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <span>{a.title}</span>
                    <span className="font-semibold text-[11px] text-slate-500">{a.assigneeName} • Prazo: {a.dueDate}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedMeetingDetail(null)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Fechar Ata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
