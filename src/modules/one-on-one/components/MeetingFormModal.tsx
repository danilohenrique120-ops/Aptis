'use client';

import React, { useState } from 'react';
import { 
  OneOnOneMeeting, 
  TeamMember1on1, 
  EnergyMood, 
  AgendaTopic, 
  ActionItem, 
  TranscriptBlock,
  PowerfulQuestionPrompt,
  SpeakerRole
} from '../types';
import { POWERFUL_QUESTIONS } from '../mock-data';
import { LiveMeetingRecorder } from './LiveMeetingRecorder';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Calendar, 
  Clock, 
  Sparkles, 
  Save, 
  FileText, 
  CheckSquare, 
  ListTodo,
  Edit3,
  ChevronDown,
  ChevronUp,
  Users,
  Mic,
  ArrowRight
} from 'lucide-react';

interface MeetingFormModalProps {
  member: TeamMember1on1;
  allMembers?: TeamMember1on1[];
  managerName: string;
  tenantId?: string;
  editingMeeting?: OneOnOneMeeting | null;
  customQuestions?: PowerfulQuestionPrompt[];
  onClose: () => void;
  onSaveMeeting: (meeting: OneOnOneMeeting) => void;
}

export function MeetingFormModal({
  member: initialMember,
  allMembers = [],
  managerName,
  tenantId = 'tenant-dhp',
  editingMeeting = null,
  customQuestions,
  onClose,
  onSaveMeeting
}: MeetingFormModalProps) {
  const questionsList = customQuestions && customQuestions.length > 0 ? customQuestions : POWERFUL_QUESTIONS;

  const [activeTab, setActiveTab] = useState<'conducao' | 'fechamento'>('conducao');
  const [selectedMember, setSelectedMember] = useState<TeamMember1on1>(initialMember);
  const [meetingDate, setMeetingDate] = useState(
    editingMeeting?.date || new Date().toISOString().split('T')[0]
  );
  const [durationMinutes, setDurationMinutes] = useState(editingMeeting?.durationMinutes || 30);
  const [moodRating, setMoodRating] = useState<EnergyMood>(editingMeeting?.moodRating || 4);
  const [moodNote, setMoodNote] = useState(editingMeeting?.moodNote || '');

  // Tópicos da Pauta
  const [topics, setTopics] = useState<AgendaTopic[]>(
    editingMeeting?.topics || [
      { id: '1', title: 'Prioridades, metas e entregas da semana', addedBy: 'manager', isDiscussed: false },
      { id: '2', title: 'Bloqueios operacionais, ferramental ou dificuldades na rotina', addedBy: 'employee', isDiscussed: false },
      { id: '3', title: 'Feedback mútuo, desenvolvimento técnico e próximos passos', addedBy: 'manager', isDiscussed: false }
    ]
  );
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicTitle, setEditingTopicTitle] = useState('');

  // Banco de Perguntas Guia
  const [showQuestionsDrawer, setShowQuestionsDrawer] = useState(true);
  const [questionCategoryFilter, setQuestionCategoryFilter] = useState<string>('ALL');

  // Plano de Ações & Metas
  const [actionItems, setActionItems] = useState<ActionItem[]>(editingMeeting?.actionItems || []);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState<'manager' | 'employee'>('employee');
  const [newActionDueDate, setNewActionDueDate] = useState(
    editingMeeting?.date || new Date().toISOString().split('T')[0]
  );
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editingActionTitle, setEditingActionTitle] = useState('');
  const [editingActionAssignee, setEditingActionAssignee] = useState<'manager' | 'employee'>('employee');
  const [editingActionDueDate, setEditingActionDueDate] = useState('');

  // Transcrições e Notas
  const [transcripts, setTranscripts] = useState<TranscriptBlock[]>(editingMeeting?.transcripts || []);
  const [notes, setNotes] = useState(editingMeeting?.notes || '');

  // Handlers de Tópicos da Pauta
  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;
    setTopics(prev => [
      ...prev,
      {
        id: `top-${Date.now()}`,
        title: newTopicTitle.trim(),
        addedBy: 'manager',
        isDiscussed: false
      }
    ]);
    setNewTopicTitle('');
  };

  const toggleTopicDiscussed = (id: string) => {
    setTopics(prev => prev.map(t => (t.id === id ? { ...t, isDiscussed: !t.isDiscussed } : t)));
  };

  const handleSaveTopicEdit = (id: string) => {
    if (!editingTopicTitle.trim()) return;
    setTopics(prev => prev.map(t => (t.id === id ? { ...t, title: editingTopicTitle.trim() } : t)));
    setEditingTopicId(null);
    setEditingTopicTitle('');
  };

  const removeTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  const handleAddQuestionToAgenda = (question: string) => {
    setTopics(prev => [
      ...prev,
      {
        id: `top-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: question,
        addedBy: 'manager',
        isDiscussed: false
      }
    ]);
  };

  // Handlers de Ações & Metas
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    setActionItems(prev => [
      ...prev,
      {
        id: `act-${Date.now()}`,
        title: newActionTitle.trim(),
        assignee: newActionAssignee,
        assigneeName: newActionAssignee === 'manager' ? managerName : selectedMember.name,
        dueDate: newActionDueDate || meetingDate,
        status: 'pending'
      }
    ]);
    setNewActionTitle('');
  };

  const handleCreateActionFromTranscript = (text: string, speaker: SpeakerRole) => {
    setActionItems(prev => [
      ...prev,
      {
        id: `act-tr-${Date.now()}`,
        title: text,
        assignee: speaker,
        assigneeName: speaker === 'manager' ? managerName : selectedMember.name,
        dueDate: meetingDate,
        status: 'pending'
      }
    ]);
  };

  const toggleActionStatus = (id: string) => {
    setActionItems(prev =>
      prev.map(a =>
        a.id === id ? { ...a, status: a.status === 'pending' ? 'completed' : 'pending' } : a
      )
    );
  };

  const startEditAction = (item: ActionItem) => {
    setEditingActionId(item.id);
    setEditingActionTitle(item.title);
    setEditingActionAssignee(item.assignee);
    setEditingActionDueDate(item.dueDate);
  };

  const saveEditAction = (id: string) => {
    if (!editingActionTitle.trim()) return;
    setActionItems(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              title: editingActionTitle.trim(),
              assignee: editingActionAssignee,
              assigneeName: editingActionAssignee === 'manager' ? managerName : selectedMember.name,
              dueDate: editingActionDueDate || meetingDate
            }
          : a
      )
    );
    setEditingActionId(null);
  };

  const removeAction = (id: string) => {
    setActionItems(prev => prev.filter(a => a.id !== id));
  };

  // Handlers de Transcrição
  const handleUpdateTranscript = (id: string, updated: Partial<TranscriptBlock>) => {
    setTranscripts(prev => prev.map(t => (t.id === id ? { ...t, ...updated } : t)));
  };

  const handleDeleteTranscript = (id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
  };

  const handleSave = () => {
    const meetingToSave: OneOnOneMeeting = {
      id: editingMeeting ? editingMeeting.id : `meet-${Date.now()}`,
      tenantId: editingMeeting?.tenantId || tenantId,
      employeeId: selectedMember.id,
      employeeName: selectedMember.name,
      employeeRole: selectedMember.role,
      employeeDepartment: selectedMember.department,
      managerName,
      date: meetingDate,
      durationMinutes,
      moodRating,
      moodNote,
      topics,
      actionItems,
      transcripts,
      notes,
      createdAt: editingMeeting?.createdAt || new Date().toISOString()
    };

    onSaveMeeting(meetingToSave);
  };

  const categories = Array.from(new Set(questionsList.map(q => q.category)));
  const filteredQuestions =
    questionCategoryFilter === 'ALL'
      ? questionsList
      : questionsList.filter(q => q.category === questionCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-3xl shadow-2xl max-w-[96vw] 2xl:max-w-[1460px] w-full border border-slate-300 overflow-hidden flex flex-col h-[94vh] animate-in fade-in zoom-in-95 duration-200">
        {/* TOPO EXECUTIVO WIDESCREEN */}
        <div className="px-6 py-4 bg-slate-950 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-600/30 shrink-0">
              {selectedMember.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-2.5 py-0.5 rounded-full">
                  {editingMeeting ? 'Editando Reunião 1:1' : 'Sala Executiva de Reunião 1:1'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Setor: <strong className="text-slate-200">{selectedMember.department}</strong>
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  Gestor: <strong className="text-slate-200">{managerName}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1">
                {!editingMeeting && allMembers.length > 1 ? (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-400" />
                    <select
                      value={selectedMember.id}
                      onChange={e => {
                        const found = allMembers.find(m => m.id === e.target.value);
                        if (found) setSelectedMember(found);
                      }}
                      className="bg-slate-900 border border-slate-700 text-white font-black text-base sm:text-lg rounded-xl px-3 py-1 focus:outline-none focus:border-rose-500 cursor-pointer"
                    >
                      {allMembers.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} — {m.role} ({m.department})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    {selectedMember.name}{' '}
                    <span className="text-sm font-medium text-slate-400">— {selectedMember.role}</span>
                  </h2>
                )}
              </div>
            </div>
          </div>

          {/* Controles Rápidos no Topo: Data e Duração */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <input
                type="date"
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              />
              <span className="text-slate-600">|</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                className="bg-slate-900 font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
              </select>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* BARRA DE NAVEGAÇÃO EM 2 ABAS AMPLAS */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('conducao')}
              className={`px-5 py-3 text-xs sm:text-sm font-black rounded-t-2xl border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'conducao'
                  ? 'border-rose-600 text-rose-700 bg-rose-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mic className="w-4 h-4 text-rose-600" />
              <span>1. Clima, Pauta & Gravador ao Vivo</span>
              <span className="bg-slate-200 text-slate-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {topics.filter(t => t.isDiscussed).length}/{topics.length} pauta • {transcripts.length} falas
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fechamento')}
              className={`px-5 py-3 text-xs sm:text-sm font-black rounded-t-2xl border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'fechamento'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ListTodo className="w-4 h-4 text-emerald-600" />
              <span>2. Síntese Executiva & Plano de Ação</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                {actionItems.length} {actionItems.length === 1 ? 'ação' : 'ações'}
              </span>
            </button>
          </div>

          <div className="pb-2 hidden md:flex items-center gap-2 text-xs text-slate-500">
            {activeTab === 'conducao' ? (
              <button
                type="button"
                onClick={() => setActiveTab('fechamento')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                Ir para Síntese & Plano de Ação <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('conducao')}
                className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                ← Voltar para Pauta & Gravador
              </button>
            )}
          </div>
        </div>

        {/* CONTEÚDO DAS 2 ABAS (MANTENDO O GRAVADOR MONTADO EM BACKGROUND PARA NÃO INTERROMPER A GRAVAÇÃO) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* ABA 1: CLIMA, PAUTA & GRAVADOR AO VIVO */}
          <div className={activeTab === 'conducao' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'hidden'}>
            {/* Coluna Esquerda da Aba 1: Clima + Pauta + Perguntas */}
            <div className="lg:col-span-6 space-y-5">
              {/* Termômetro de Clima / Energia + Observação */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-slate-800 block">
                      Termômetro de Clima & Motivação do Liderado
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Avalie o nível de energia e estado emocional do colaborador nesta conversa.
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                    {([1, 2, 3, 4, 5] as EnergyMood[]).map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMoodRating(val)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          moodRating === val
                            ? val <= 2
                              ? 'bg-rose-600 text-white shadow-xs'
                              : val === 3
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white'
                        }`}
                      >
                        {val === 1 && '😫 1'}
                        {val === 2 && '😕 2'}
                        {val === 3 && '😐 3'}
                        {val === 4 && '🙂 4'}
                        {val === 5 && '🚀 5'}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Observação sobre o clima/motivação (ex: Motivado com as novas metas, mas relatou cansaço no fechamento)..."
                  value={moodNote}
                  onChange={e => setMoodNote(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              {/* Pauta da Reunião & Tópicos a Discutir */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-rose-600" />
                      Pauta da Reunião & Tópicos a Discutir
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Marque os tópicos abordados, edite ou adicione novos pontos à conversa.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {topics.filter(t => t.isDiscussed).length}/{topics.length} abordados
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {topics.map(t => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        t.isDiscussed
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {editingTopicId === t.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingTopicTitle}
                            onChange={e => setEditingTopicTitle(e.target.value)}
                            className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveTopicEdit(t.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTopicId(null)}
                            className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleTopicDiscussed(t.id)}
                            className="flex items-start gap-2.5 text-left flex-1 cursor-pointer"
                          >
                            <div
                              className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                t.isDiscussed ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300'
                              }`}
                            >
                              {t.isDiscussed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span
                              className={`text-xs leading-relaxed ${
                                t.isDiscussed ? 'line-through text-slate-400' : 'text-slate-800 font-semibold'
                              }`}
                            >
                              {t.title}
                            </span>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTopicId(t.id);
                                setEditingTopicTitle(t.title);
                              }}
                              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                              title="Editar tópico"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeTopic(t.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                              title="Excluir tópico"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddTopic} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar novo ponto à pauta desta reunião..."
                    value={newTopicTitle}
                    onChange={e => setNewTopicTitle(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Incluir
                  </button>
                </form>
              </div>

              {/* Banco de Perguntas Poderosas para Injetar na Pauta */}
              <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/70 to-amber-50/70 p-5 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-rose-950">
                      Perguntas Estratégicas Sugeridas (Clique para incluir na Pauta)
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuestionsDrawer(!showQuestionsDrawer)}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
                  >
                    {showQuestionsDrawer ? (
                      <>
                        Recolher <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Expandir ({questionsList.length}) <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {showQuestionsDrawer && (
                  <>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setQuestionCategoryFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer ${
                          questionCategoryFilter === 'ALL'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white/80 text-rose-900 border border-rose-200'
                        }`}
                      >
                        Todas
                      </button>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setQuestionCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer ${
                            questionCategoryFilter === cat
                              ? 'bg-rose-600 text-white'
                              : 'bg-white/80 text-rose-900 border border-rose-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                      {filteredQuestions.map(q => (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => handleAddQuestionToAgenda(q.question)}
                          className="p-2.5 bg-white/95 hover:bg-white rounded-xl border border-rose-200 text-left hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
                        >
                          <span className="text-[9px] font-black uppercase text-rose-600 tracking-wider block mb-0.5">
                            {q.category} • {q.source}
                          </span>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-rose-900 leading-snug">
                            "{q.question}"
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Coluna Direita da Aba 1: Gravador & Transcrição Acústica ao Vivo */}
            <div className="lg:col-span-6">
              <LiveMeetingRecorder
                managerName={managerName}
                employeeName={selectedMember.name}
                transcripts={transcripts}
                onAddTranscript={block => setTranscripts(prev => [...prev, block])}
                onUpdateTranscript={handleUpdateTranscript}
                onDeleteTranscript={handleDeleteTranscript}
                onCreateActionFromTranscript={(text, speaker) => {
                  handleCreateActionFromTranscript(text, speaker);
                }}
              />
            </div>
          </div>

          {/* ABA 2: SÍNTESE EXECUTIVA & PLANO DE AÇÃO */}
          <div className={activeTab === 'fechamento' ? 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start' : 'hidden'}>
            {/* Coluna Esquerda da Aba 2: Síntese Executiva & Feedbacks */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Síntese Executiva, Feedbacks & Acordos da Reunião
                  </label>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    Constará na Ata Oficial
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Registre o resumo executivo da conversa, pontos fortes reconhecidos, orientações de desenvolvimento e alinhamentos feitos com o liderado.
                </p>
                <textarea
                  rows={12}
                  placeholder="Digite aqui as anotações principais da reunião 1:1, feedbacks trocados, percepções de carreira e combinados..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                />
              </div>

              {/* Resumo Rápido dos Tópicos Abordados na Pauta */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resumo da Pauta ({topics.filter(t => t.isDiscussed).length} de {topics.length} abordados)
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {topics.map(t => (
                    <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                      <span className={t.isDiscussed ? 'text-slate-700 font-medium' : 'text-slate-400'}>
                        {t.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.isDiscussed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {t.isDiscussed ? '✓ Abordado' : 'Pendente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna Direita da Aba 2: Plano de Ação, Compromissos & Metas */}
            <div className="lg:col-span-6 space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                      Plano de Ação, Compromissos & Metas Acordadas
                    </h3>
                    <p className="text-xs text-slate-500">
                      Defina o que o Gestor e o Liderado farão até o próximo encontro 1:1.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {actionItems.length} {actionItems.length === 1 ? 'ação' : 'ações'}
                  </span>
                </div>

                {/* Formulário de Nova Ação / Meta */}
                <form onSubmit={handleAddAction} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    + Adicionar Novo Compromisso ou Meta:
                  </span>
                  <input
                    type="text"
                    placeholder="Descreva a nova ação, meta ou entrega combinada..."
                    value={newActionTitle}
                    onChange={e => setNewActionTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <select
                      value={newActionAssignee}
                      onChange={e => setNewActionAssignee(e.target.value as any)}
                      className="w-full sm:flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="employee">👤 Responsável: {selectedMember.name} (Liderado)</option>
                      <option value="manager">👔 Responsável: {managerName} (Gestor)</option>
                    </select>

                    <input
                      type="date"
                      value={newActionDueDate}
                      onChange={e => setNewActionDueDate(e.target.value)}
                      className="w-full sm:w-40 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 cursor-pointer"
                    />

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Ação
                    </button>
                  </div>
                </form>

                {/* Lista de Ações com Editar / Excluir / Concluir */}
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {actionItems.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      Nenhuma meta ou compromisso registrado ainda. Adicione no formulário acima ou clique em "+ Ação" em qualquer fala gravada na Aba 1.
                    </div>
                  ) : (
                    actionItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          item.status === 'completed'
                            ? 'bg-slate-50 border-slate-200 opacity-70'
                            : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        {editingActionId === item.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingActionTitle}
                              onChange={e => setEditingActionTitle(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold"
                              autoFocus
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <select
                                  value={editingActionAssignee}
                                  onChange={e => setEditingActionAssignee(e.target.value as any)}
                                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                                >
                                  <option value="employee">👤 {selectedMember.name}</option>
                                  <option value="manager">👔 {managerName}</option>
                                </select>
                                <input
                                  type="date"
                                  value={editingActionDueDate}
                                  onChange={e => setEditingActionDueDate(e.target.value)}
                                  className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-800"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => saveEditAction(item.id)}
                                  className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                                >
                                  Salvar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingActionId(null)}
                                  className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleActionStatus(item.id)}
                                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 cursor-pointer ${
                                  item.status === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : 'border border-slate-300 hover:border-emerald-500'
                                }`}
                                title="Alternar status Concluído / Pendente"
                              >
                                {item.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>
                              <div className="space-y-1">
                                <p
                                  className={`text-xs font-bold ${
                                    item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'
                                  }`}
                                >
                                  {item.title}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      item.assignee === 'manager'
                                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    {item.assignee === 'manager'
                                      ? `👔 Gestor: ${managerName}`
                                      : `👤 Liderado: ${selectedMember.name}`}
                                  </span>
                                  <span className="text-[11px] text-slate-500 font-mono">
                                    Prazo: {item.dueDate}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditAction(item)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                                title="Editar compromisso"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeAction(item.id)}
                                className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Excluir compromisso"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ EXECUTIVO */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              📌 {topics.filter(t => t.isDiscussed).length}/{topics.length} tópicos discutidos
            </span>
            <span className="font-semibold text-cyan-700">
              🎙️ {transcripts.length} falas transcritas
            </span>
            <span className="font-semibold text-emerald-700">
              📋 {actionItems.length} ações/metas acordadas
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-7 py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {editingMeeting ? 'Salvar Alterações na Reunião 1:1' : 'Finalizar & Gerar Ata da Reunião 1:1'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
