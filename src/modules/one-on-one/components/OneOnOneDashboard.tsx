'use client';

import React, { useState } from 'react';
import { 
  TeamMember1on1, 
  OneOnOneMeeting 
} from '../types';
import { 
  Calendar, 
  Search, 
  Mic, 
  ChevronRight, 
  Users, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Printer,
  Filter,
  Sparkles
} from 'lucide-react';

interface OneOnOneDashboardProps {
  members: TeamMember1on1[];
  meetings: OneOnOneMeeting[];
  tintedGlass?: boolean;
  selectedSector?: string;
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
  tintedGlass = true,
  selectedSector = 'all',
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
    const matchesSector =
      selectedSector === 'all' ||
      m.department.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(m.department.toLowerCase());
    return matchesSearch && matchesStatus && matchesSector;
  });

  const filteredMeetings = meetings.filter(meet => {
    const matchesSearch =
      meet.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meet.employeeRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meet.employeeDepartment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector =
      selectedSector === 'all' ||
      meet.employeeDepartment.toLowerCase().includes(selectedSector.toLowerCase()) ||
      selectedSector.toLowerCase().includes(meet.employeeDepartment.toLowerCase());
    return matchesSearch && matchesSector;
  });

  const getCadenceBadge = (status: TeamMember1on1['status']) => {
    switch (status) {
      case 'up_to_date':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            🟢 Em Dia
          </span>
        );
      case 'attention':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            🟡 Atenção
          </span>
        );
      case 'overdue':
        return (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
              tintedGlass
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
                : 'bg-rose-100 text-rose-700 border-rose-200'
            }`}
          >
            🔴 Atrasada
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* =====================================================================
          BARRA DE BUSCA & FILTRO DE CADÊNCIA (Idêntica ao Aptis Routine)
         ===================================================================== */}
      <div
        className={`flex flex-col sm:flex-row gap-3 p-3.5 rounded-2xl items-stretch sm:items-center ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por liderado, cargo ou setor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-3 py-2 text-xs rounded-xl focus:outline-none border ${
              tintedGlass
                ? 'bg-white/[0.05] border-white/[0.1] text-white placeholder-slate-400 focus:border-cyan-400/50'
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
          />
        </div>

        <div
          className={`hidden md:flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-slate-300'
              : 'text-slate-500 bg-slate-50 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Clique em Iniciar 1:1 para abrir a Sala Executiva com Gravador de Voz</span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-slate-200'
              : 'bg-slate-50 border border-slate-200 text-slate-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium">Cadência:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className={`text-xs font-bold bg-transparent focus:outline-none cursor-pointer ${
              tintedGlass ? 'text-cyan-300' : 'text-slate-900'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">
              Todos os Status
            </option>
            <option value="up_to_date" className="bg-slate-900 text-white">
              Em Dia (&lt; 15 dias)
            </option>
            <option value="attention" className="bg-slate-900 text-white">
              Atenção (15 a 30 dias)
            </option>
            <option value="overdue" className="bg-slate-900 text-white">
              Atrasada (&gt; 30 dias)
            </option>
          </select>
        </div>
      </div>

      {/* =====================================================================
          QUADRO EM DUPLA CAMADA DE VIDRO (Idêntico ao Packing Board do Aptis Routine)
         ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* COLUNA 1 (7 cols): QUADRO DE LIDERADOS & CADÊNCIA 1:1 */}
        <div
          className={`lg:col-span-7 rounded-3xl p-4 min-h-[520px] flex flex-col transition-all duration-300 ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          {/* Cabeçalho da Coluna */}
          <div
            className={`flex items-center justify-between pb-3.5 mb-3.5 border-b ${
              tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_#60a5fa]" />
              <h3
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  tintedGlass ? 'text-white' : 'text-slate-800'
                }`}
              >
                Liderados & Cadência de Reuniões 1:1
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAddMember}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                  tintedGlass
                    ? 'bg-white/[0.07] hover:bg-white/[0.14] text-cyan-200 border-white/[0.14]'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                <UserPlus className="w-3 h-3 text-cyan-400" />
                + Liderado
              </button>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-white/[0.07] text-cyan-200 border-white/[0.14]'
                    : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                {filteredMembers.length}
              </span>
            </div>
          </div>

          {/* Lista de Cards de Liderados (2ª Camada de Vidro Aninhado com Hover Lift) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[660px] pr-1 pt-1">
            {filteredMembers.length === 0 ? (
              <div
                className={`col-span-2 text-center py-12 text-xs italic border border-dashed rounded-2xl ${
                  tintedGlass
                    ? 'text-slate-500 border-white/[0.08]'
                    : 'text-slate-400 border-slate-200'
                }`}
              >
                Nenhum liderado encontrado neste filtro.
              </div>
            ) : (
              filteredMembers.map(member => (
                <div
                  key={member.id}
                  className={`p-4 rounded-2xl flex flex-col justify-between gap-3 transition-all duration-300 group ${
                    tintedGlass
                      ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                      : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Topo do Card: Badges Setor + Cadência */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          tintedGlass
                            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {member.department}
                      </span>
                      {getCadenceBadge(member.status)}
                    </div>

                    {/* Nome e Cargo */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px -3px rgba(37, 99, 235, 0.45)'
                        }}
                      >
                        {member.name
                          .split(' ')
                          .map(n => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div className="min-w-0">
                        <h4
                          className={`text-xs font-bold leading-snug truncate ${
                            tintedGlass ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {member.name}
                        </h4>
                        <p
                          className={`text-[11px] truncate ${
                            tintedGlass ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Clima & Motivação Individual (Estilo Halvo) */}
                    <div
                      className={`p-2.5 rounded-xl ${
                        tintedGlass
                          ? 'bg-slate-950/45 border border-white/[0.06]'
                          : 'bg-slate-50 border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-semibold mb-1.5">
                        <span className={tintedGlass ? 'text-slate-300' : 'text-slate-600'}>
                          Clima Médio ({member.meetingsCount} sessões)
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                          }`}
                        >
                          {member.averageMood.toFixed(1)} / 5.0
                        </span>
                      </div>
                      <div
                        className={`w-full h-1.5 rounded-full overflow-hidden ${
                          tintedGlass ? 'bg-white/[0.08]' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(member.averageMood / 5) * 100}%`,
                            background: 'linear-gradient(90deg, #10b981 0%, #22d3ee 100%)',
                            boxShadow: '0 0 10px rgba(16, 185, 129, 0.7)'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rodapé do Card: Última 1:1 + Botões */}
                  <div
                    className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                      tintedGlass ? 'border-white/[0.07]' : 'border-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-mono">
                      <span className={tintedGlass ? 'text-slate-400 block' : 'text-slate-400 block'}>
                        Última: {member.lastMeetingDate || 'Nunca'}
                      </span>
                      <span
                        className={`font-bold ${
                          member.openActionItemsCount > 0
                            ? tintedGlass
                              ? 'text-amber-300'
                              : 'text-amber-700'
                            : tintedGlass
                            ? 'text-slate-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {member.openActionItemsCount > 0
                          ? `${member.openActionItemsCount} ação(ões) aberta(s)`
                          : 'Zero pendências'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditMember(member)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Editar liderado"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Excluir liderado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenMeetingModal(member)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                          border: '1px solid rgba(165, 243, 252, 0.45)',
                          boxShadow:
                            'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px -3px rgba(37, 99, 235, 0.45)'
                        }}
                      >
                        <Mic className="w-3 h-3" />
                        Iniciar 1:1
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUNA 2 (5 cols): HISTÓRICO DE REUNIÕES 1:1 & ATAS OFICIAIS */}
        <div
          className={`lg:col-span-5 rounded-3xl p-4 min-h-[520px] flex flex-col transition-all duration-300 ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          {/* Cabeçalho da Coluna */}
          <div
            className={`flex items-center justify-between pb-3.5 mb-3.5 border-b ${
              tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <h3
                className={`text-xs font-extrabold uppercase tracking-wider ${
                  tintedGlass ? 'text-white' : 'text-slate-800'
                }`}
              >
                Histórico de Reuniões & Atas Oficiais
              </h3>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                tintedGlass
                  ? 'bg-white/[0.07] text-cyan-200 border-white/[0.14]'
                  : 'bg-white text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              {filteredMeetings.length}
            </span>
          </div>

          {/* Lista de Cards de Atas (2ª Camada de Vidro Aninhado com Hover Lift) */}
          <div className="space-y-3 overflow-y-auto max-h-[660px] pr-1 pt-1">
            {filteredMeetings.length === 0 ? (
              <div
                className={`text-center py-12 text-xs italic border border-dashed rounded-2xl ${
                  tintedGlass
                    ? 'text-slate-500 border-white/[0.08]'
                    : 'text-slate-400 border-slate-200'
                }`}
              >
                Nenhuma reunião registrada neste filtro.
              </div>
            ) : (
              filteredMeetings.map(meet => (
                <div
                  key={meet.id}
                  className={`p-4 rounded-2xl transition-all duration-300 space-y-2.5 ${
                    tintedGlass
                      ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                      : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
                  }`}
                >
                  <div
                    className="space-y-1.5 cursor-pointer"
                    onClick={() => onViewMeetingDetail(meet)}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                        }`}
                      >
                        {meet.employeeDepartment}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                            tintedGlass
                              ? 'bg-white/[0.06] text-slate-300 border-white/[0.12]'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          📅 {meet.date}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            tintedGlass
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          Clima {meet.moodRating}/5
                        </span>
                      </div>
                    </div>

                    <h4
                      className={`text-xs font-bold leading-snug ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {meet.employeeName}{' '}
                      <span
                        className={`font-normal text-[11px] ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        — {meet.employeeRole}
                      </span>
                    </h4>

                    <p
                      className={`text-[11px] line-clamp-2 leading-relaxed ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {meet.notes || meet.moodNote || 'Sessão 1:1 registrada com pauta e plano de ação.'}
                    </p>
                  </div>

                  {/* Rodapé da Ata */}
                  <div
                    className={`pt-2.5 border-t flex items-center justify-between gap-2 ${
                      tintedGlass ? 'border-white/[0.07]' : 'border-slate-100'
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 text-[10px] ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <span>{meet.topics.length} pautas</span>
                      <span>•</span>
                      <span className={tintedGlass ? 'text-emerald-300 font-semibold' : 'text-emerald-700 font-semibold'}>
                        {meet.actionItems.length} ações
                      </span>
                      {meet.transcripts && meet.transcripts.length > 0 && (
                        <>
                          <span>•</span>
                          <span className={tintedGlass ? 'text-cyan-300 font-semibold' : 'text-blue-600 font-semibold'}>
                            🎙️ {meet.transcripts.length}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onPrintMeeting(meet)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer border ${
                          tintedGlass
                            ? 'bg-white/[0.06] hover:bg-white/[0.14] text-slate-200 border-white/[0.12]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                        title="Imprimir Ata em PDF"
                      >
                        <Printer className="w-3 h-3 text-cyan-400" />
                        PDF
                      </button>

                      <button
                        onClick={() => onEditMeeting(meet)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                            : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Editar reunião"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteMeeting(meet.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Excluir reunião"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onViewMeetingDetail(meet)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-colors cursor-pointer border ${
                          tintedGlass
                            ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-400/30'
                            : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        Ata <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
