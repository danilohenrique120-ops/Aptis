'use client';

import React, { useState } from 'react';
import { 
  TeamMember1on1, 
  OneOnOneMeeting 
} from '../types';
import { 
  Calendar, 
  Clock, 
  Search, 
  Mic, 
  Smile, 
  ChevronRight, 
  MessageSquare, 
  ListTodo, 
  Users, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Printer
} from 'lucide-react';

interface OneOnOneDashboardProps {
  members: TeamMember1on1[];
  meetings: OneOnOneMeeting[];
  onOpenMeetingModal: (member: TeamMember1on1) => void;
  onViewMeetingDetail: (meeting: OneOnOneMeeting) => void;
  onEditMeeting: (meeting: OneOnOneMeeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onPrintMeeting: (meeting: OneOnOneMeeting) => void;
  onAddMember: () => void;
  onEditMember: (member: TeamMember1on1) => void;
  onDeleteMember: (memberId: string) => void;
}

export function OneOnOneDashboard({
  members,
  meetings,
  onOpenMeetingModal,
  onViewMeetingDetail,
  onEditMeeting,
  onDeleteMeeting,
  onPrintMeeting,
  onAddMember,
  onEditMember,
  onDeleteMember
}: OneOnOneDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'up_to_date' | 'attention' | 'overdue'>('all');

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalMeetings = meetings.length;
  const overdueMembersCount = members.filter(m => m.status === 'overdue').length;

  const allMoods = meetings.map(m => m.moodRating);
  const averageTeamMood =
    allMoods.length > 0
      ? (allMoods.reduce((a, b) => a + b, 0) / allMoods.length).toFixed(1)
      : '4.5';

  const allOpenActions = meetings.flatMap(m => m.actionItems.filter(a => a.status === 'pending'));

  return (
    <div className="space-y-8">
      {/* 4 CARDS DE GESTÃO DA LIDERANÇA (KPIs 1:1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Equipe Mapeada</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{members.length}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Liderados diretos cadastrados</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold">
              {members.filter(m => m.status === 'up_to_date').length} em dia
            </span>
            <span className="text-rose-600 font-bold">{overdueMembersCount} atrasados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Reuniões 1:1 Feitas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{totalMeetings}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Sessões registradas com ata</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Média de 30 min por conversa</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Clima & Motivação</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smile className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-800">{averageTeamMood}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
              style={{ width: `${(Number(averageTeamMood) / 5) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-emerald-800 font-bold block">Equipe engajada e receptiva</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
            <span>Ações em Aberto</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900">{allOpenActions.length}</span>
            <span className="text-xs text-slate-500 block mt-0.5">Compromissos acordados</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-blue-700 font-semibold">
              {allOpenActions.filter(a => a.assignee === 'manager').length} do Gestor
            </span>
            <span className="text-emerald-700 font-semibold">
              {allOpenActions.filter(a => a.assignee === 'employee').length} do Time
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: TABELA DE LIDERADOS & AGENDAMENTO DE 1:1 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-600" />
              Liderados & Cadência de Reuniões 1:1
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhe a data da última conversa individual, cadastre novos liderados ou edite seus dados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar liderado ou setor..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 w-48 sm:w-56"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 font-medium cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="up_to_date">✅ Em Dia (&lt; 15 dias)</option>
              <option value="attention">⚠️ Atenção (15 a 30 dias)</option>
              <option value="overdue">🚨 Atrasada (&gt; 30 dias)</option>
            </select>

            <button
              onClick={onAddMember}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-rose-400" />
              + Cadastrar Liderado
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <th className="py-3 px-5">Colaborador / Cargo</th>
                <th className="py-3 px-4">Setor / Linha</th>
                <th className="py-3 px-4 text-center">Última 1:1</th>
                <th className="py-3 px-4 text-center">Cadência</th>
                <th className="py-3 px-4 text-center">Clima Médio</th>
                <th className="py-3 px-4 text-center">Ações Abertas</th>
                <th className="py-3 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 italic">
                    Nenhum liderado encontrado. Clique em "+ Cadastrar Liderado" para adicionar.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-rose-950 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
                          {member.name
                            .split(' ')
                            .map(n => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{member.name}</span>
                          <span className="text-[11px] text-slate-500">{member.role}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-medium text-slate-600">{member.department}</td>

                    <td className="py-4 px-4 text-center font-mono text-slate-600">
                      {member.lastMeetingDate || 'Nunca realizada'}
                    </td>

                    <td className="py-4 px-4 text-center">
                      {member.status === 'up_to_date' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Em Dia
                        </span>
                      )}
                      {member.status === 'attention' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Atenção
                        </span>
                      )}
                      {member.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Atrasada
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-slate-800 text-xs">
                        {member.averageMood.toFixed(1)} / 5
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      {member.openActionItemsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {member.openActionItemsCount} pendente(s)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Zero pendências</span>
                      )}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditMember(member)}
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Editar dados do liderado"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteMember(member.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Excluir liderado"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenMeetingModal(member)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-rose-600/20 cursor-pointer"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          Iniciar 1:1
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* HISTÓRICO DE REUNIÕES RECENTES COM ATAS, IMPRESSÃO PDF, EDIÇÃO E EXCLUSÃO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-600" />
              Histórico de Reuniões 1:1 & Atas Oficiais
            </h3>
            <p className="text-xs text-slate-500">
              Visualize a Ata completa, imprima em PDF, edite informações ou exclua registros.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{meetings.length} registradas</span>
        </div>

        {meetings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Nenhuma reunião realizada ainda. Inicie sua primeira 1:1 na tabela acima!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {meetings.map(meet => (
              <div
                key={meet.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 p-3.5 rounded-xl transition-colors"
              >
                <div
                  className="space-y-1.5 flex-1 cursor-pointer"
                  onClick={() => onViewMeetingDetail(meet)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{meet.employeeName}</span>
                    <span className="text-[11px] text-slate-500">
                      ({meet.employeeRole} • {meet.employeeDepartment})
                    </span>
                    <span className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-mono font-semibold">
                      📅 {meet.date} • {meet.durationMinutes} min
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Clima: {meet.moodRating}/5
                    </span>
                    {meet.transcripts && meet.transcripts.length > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 flex items-center gap-1">
                        <Mic className="w-3 h-3 text-cyan-700" />
                        {meet.transcripts.length} falas gravadas
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">
                    {meet.notes || meet.moodNote || 'Sem anotações complementares registradas.'}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>{meet.topics.length} tópicos na pauta</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">
                      {meet.actionItems.length} ações/metas acordadas
                    </span>
                  </div>
                </div>

                {/* Botões de Ação na Reunião */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPrintMeeting(meet)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Imprimir ou Salvar Ata em PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    PDF
                  </button>

                  <button
                    onClick={() => onEditMeeting(meet)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Editar esta reunião 1:1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>

                  <button
                    onClick={() => onDeleteMeeting(meet.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir esta reunião 1:1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onViewMeetingDetail(meet)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Abrir Ata <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
