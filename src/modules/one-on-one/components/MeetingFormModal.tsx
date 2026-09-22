'use client';

import React, { useState } from 'react';
import { 
  OneOnOneMeeting, 
  TeamMember1on1, 
  EnergyMood, 
  AgendaTopic, 
  ActionItem, 
  TranscriptBlock 
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
  Smile, 
  Meh, 
  Frown, 
  HelpCircle, 
  Sparkles, 
  Save, 
  FileText, 
  CheckSquare,
  User,
  ListTodo
} from 'lucide-react';

interface MeetingFormModalProps {
  member: TeamMember1on1;
  managerName: string;
  onClose: () => void;
  onSaveMeeting: (meeting: OneOnOneMeeting) => void;
}

export function MeetingFormModal({
  member,
  managerName,
  onClose,
  onSaveMeeting
}: MeetingFormModalProps) {
  const [activeTab, setActiveTab] = useState<'flow' | 'recorder' | 'actions'>('flow');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [moodRating, setMoodRating] = useState<EnergyMood>(4);
  const [moodNote, setMoodNote] = useState('');
  
  // Tópicos da Pauta
  const [topics, setTopics] = useState<AgendaTopic[]>([
    { id: '1', title: 'Prioridades e metas de produção da semana', addedBy: 'manager', isDiscussed: false },
    { id: '2', title: 'Dificuldades com ferramental, processo ou peças', addedBy: 'employee', isDiscussed: false },
    { id: '3', title: 'Evolução de habilidades técnicas e plano de carreira', addedBy: 'manager', isDiscussed: false }
  ]);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Plano de Ações
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState<'manager' | 'employee'>('employee');
  const [newActionDueDate, setNewActionDueDate] = useState('');

  // Transcrições capturadas ao vivo
  const [transcripts, setTranscripts] = useState<TranscriptBlock[]>([]);
  const [notes, setNotes] = useState('');

  // Adiciona tópico na pauta
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
    setTopics(prev => prev.map(t => t.id === id ? { ...t, isDiscussed: !t.isDiscussed } : t));
  };

  const removeTopic = (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
  };

  // Adiciona item de ação
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;
    setActionItems(prev => [
      ...prev,
      {
        id: `act-${Date.now()}`,
        title: newActionTitle.trim(),
        assignee: newActionAssignee,
        assigneeName: newActionAssignee === 'manager' ? managerName : member.name,
        dueDate: newActionDueDate || meetingDate,
        status: 'pending'
      }
    ]);
    setNewActionTitle('');
    setNewActionDueDate('');
  };

  const removeAction = (id: string) => {
    setActionItems(prev => prev.filter(a => a.id !== id));
  };

  // Adiciona pergunta sugerida à pauta com 1 clique
  const handleAddQuestionToAgenda = (question: string) => {
    setTopics(prev => [
      ...prev,
      {
        id: `top-${Date.now()}`,
        title: question,
        addedBy: 'manager',
        isDiscussed: false
      }
    ]);
  };

  const handleSave = () => {
    const newMeeting: OneOnOneMeeting = {
      id: `meet-${Date.now()}`,
      tenantId: 'tenant-dhp',
      employeeId: member.id,
      employeeName: member.name,
      employeeRole: member.role,
      employeeDepartment: member.department,
      managerName: managerName,
      date: meetingDate,
      durationMinutes,
      moodRating,
      moodNote,
      topics,
      actionItems,
      transcripts,
      notes,
      createdAt: new Date().toISOString()
    };

    onSaveMeeting(newMeeting);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Topo do Modal */}
        <div className="p-6 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-rose-600/30">
              {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/60 border border-rose-800 px-2.5 py-0.5 rounded-full">
                  Reunião 1:1 Individual
                </span>
                <span className="text-xs text-slate-400">{member.department}</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">{member.name}</h2>
              <p className="text-xs text-slate-300 font-medium">{member.role}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas de Navegação Interna */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('flow')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'flow'
                  ? 'border-rose-600 text-rose-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Pauta & Perguntas de Liderança
            </button>

            <button
              onClick={() => setActiveTab('recorder')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recorder'
                  ? 'border-rose-600 text-rose-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
              2. Gravador & Transcrição ao Vivo
              {transcripts.length > 0 && (
                <span className="bg-cyan-100 text-cyan-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {transcripts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('actions')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'actions'
                  ? 'border-rose-600 text-rose-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5 text-emerald-600" />
              3. Compromissos & Ações
              {actionItems.length > 0 && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold">
                  {actionItems.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pb-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              />
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </span>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-800">
          {/* ABA 1: PAUTA E PERGUNTAS */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              {/* Check-in de Humor / Energia */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Como está o nível de motivação e energia do liderado hoje?
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Metodologia High Output Management: o estado emocional impacta diretamente na segurança e foco.
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    {([1, 2, 3, 4, 5] as EnergyMood[]).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setMoodRating(val)}
                        className={`w-9 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          moodRating === val
                            ? val <= 2
                              ? 'bg-rose-500 text-white shadow-xs'
                              : val === 3
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
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
                  placeholder="Nota sobre o clima/motivação (opcional)... Ex: Sentindo cansaço pelo turno extra, mas empolgado com a nova máquina."
                  value={moodNote}
                  onChange={(e) => setMoodNote(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Pauta Colaborativa */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-600" />
                    Pauta da Conversa (Itens a Tratar)
                  </h3>
                  <span className="text-[11px] text-slate-400">Marque o que for discutido</span>
                </div>

                <div className="space-y-2">
                  {topics.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        t.isDiscussed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleTopicDiscussed(t.id)}
                        className="flex items-start gap-2.5 text-left flex-1 cursor-pointer"
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-[10px] ${
                          t.isDiscussed ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                        }`}>
                          {t.isDiscussed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${t.isDiscussed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                          {t.title}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeTopic(t.id)}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adicionar novo tópico */}
                <form onSubmit={handleAddTopic} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar novo tópico à pauta..."
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </form>
              </div>

              {/* Banco de Perguntas Poderosas dos Melhores Gestores */}
              <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-orange-50 p-4 rounded-2xl border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                    Perguntas dos Melhores Gestores do Mundo (Para Guiar a Conversa)
                  </h4>
                </div>
                <p className="text-[11px] text-rose-800">
                  Clique em qualquer pergunta para adicioná-la imediatamente à pauta do seu 1:1:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {POWERFUL_QUESTIONS.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleAddQuestionToAgenda(q.question)}
                      className="p-3 bg-white/90 hover:bg-white rounded-xl border border-rose-200 text-left hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group"
                    >
                      <span className="text-[9px] font-black uppercase text-rose-600 tracking-wider block mb-1">
                        {q.category} • {q.source}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-rose-900 transition-colors">
                        "{q.question}"
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas Gerais da Reunião */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Anotações Gerais & Síntese do Gestor:
                </label>
                <textarea
                  rows={3}
                  placeholder="Resuma os pontos-chave combinados, percepções sobre o operador ou direcionamentos futuros..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* ABA 2: GRAVADOR E TRANSCRIÇÃO */}
          {activeTab === 'recorder' && (
            <div className="space-y-4">
              <LiveMeetingRecorder
                managerName={managerName}
                employeeName={member.name}
                transcripts={transcripts}
                onAddTranscript={(block) => setTranscripts(prev => [...prev, block])}
              />
            </div>
          )}

          {/* ABA 3: COMPROMISSOS E AÇÕES */}
          {activeTab === 'actions' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  Plano de Ação & Compromissos Mútuos (Action Items)
                </h3>
                <p className="text-xs text-slate-500">
                  Reunião 1:1 sem compromisso vira conversa sem resultado. Registre o que cada um fará até o próximo encontro.
                </p>
              </div>

              {/* Lista de Ações */}
              <div className="space-y-2">
                {actionItems.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Nenhum compromisso registrado ainda. Adicione uma ação abaixo.
                  </div>
                )}

                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.assignee === 'manager'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {item.assignee === 'manager' ? `👔 Gestor: ${managerName}` : `👤 Liderado: ${member.name}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Prazo: {item.dueDate}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAction(item.id)}
                      className="text-slate-300 hover:text-rose-500 p-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Formulário de Nova Ação */}
              <form onSubmit={handleAddAction} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Novo Compromisso Acordado:</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Liberar troca de ferramental com compras ou Treinar operador reserva..."
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex-1 w-full sm:w-auto">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Responsável:</label>
                    <select
                      value={newActionAssignee}
                      onChange={(e) => setNewActionAssignee(e.target.value as any)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium text-slate-700 cursor-pointer"
                    >
                      <option value="employee">👤 {member.name} (Liderado)</option>
                      <option value="manager">👔 {managerName} (Gestor)</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-48">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Prazo de Entrega:</label>
                    <input
                      type="date"
                      value={newActionDueDate}
                      onChange={(e) => setNewActionDueDate(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl p-2 font-medium text-slate-700 cursor-pointer"
                    />
                  </div>

                  <div className="w-full sm:w-auto sm:self-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Salvar Ação
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Rodapé do Modal com Ação de Salvar Reunião */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {transcripts.length > 0 && <span className="font-semibold text-cyan-700 mr-2">🎙️ {transcripts.length} falas gravadas</span>}
            {actionItems.length > 0 && <span className="font-semibold text-emerald-700">📋 {actionItems.length} ações acordadas</span>}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Finalizar e Salvar Reunião 1:1
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
