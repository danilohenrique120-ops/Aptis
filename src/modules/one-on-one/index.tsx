'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
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
  Plus, 
  X, 
  Check, 
  Clock, 
  Mic, 
  Award, 
  ListTodo, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Printer, 
  FileText, 
  CheckSquare, 
  Calendar, 
  UserPlus,
  Smile
} from 'lucide-react';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

export default function OneOnOneModule() {
  const { currentUser, currentTenant } = useTenant();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'actions'>('dashboard');
  const [members, setMembers] = useTenantStorage<TeamMember1on1[]>('one-on-one', 'members', INITIAL_TEAM_MEMBERS);
  const [meetings, setMeetings] = useTenantStorage<OneOnOneMeeting[]>('one-on-one', 'meetings', INITIAL_MEETINGS_HISTORY);
  const [questions, setQuestions] = useTenantStorage<PowerfulQuestionPrompt[]>('one-on-one', 'questions', POWERFUL_QUESTIONS);

  // Modais de Reunião e Ata
  const [selectedMemberForMeeting, setSelectedMemberForMeeting] = useState<TeamMember1on1 | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<OneOnOneMeeting | null>(null);
  const [selectedMeetingDetail, setSelectedMeetingDetail] = useState<OneOnOneMeeting | null>(null);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);

  // Modal de Cadastro / Edição de Liderado
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember1on1 | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [memberDepartment, setMemberDepartment] = useState('');
  const [memberStatus, setMemberStatus] = useState<'up_to_date' | 'attention' | 'overdue'>('up_to_date');

  // Edição e Criação de Compromissos / Metas na Aba de Compromissos
  const [newQuickActionTitle, setNewQuickActionTitle] = useState('');
  const [newQuickActionMemberId, setNewQuickActionMemberId] = useState('');
  const [newQuickActionAssignee, setNewQuickActionAssignee] = useState<'manager' | 'employee'>('employee');
  const [newQuickActionDueDate, setNewQuickActionDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingActionKey, setEditingActionKey] = useState<string | null>(null);
  const [editActionTitle, setEditActionTitle] = useState('');
  const [editActionAssignee, setEditActionAssignee] = useState<'manager' | 'employee'>('employee');
  const [editActionDueDate, setEditActionDueDate] = useState('');

  // Modal de Cadastro / Edição de Perguntas Poderosas
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<PowerfulQuestionPrompt | null>(null);
  const [qCategory, setQCategory] = useState<PowerfulQuestionPrompt['category']>('Alinhamento & Prioridades');
  const [qText, setQText] = useState('');
  const [qSource, setQSource] = useState('Gestão Aptis');
  const [qExplanation, setQExplanation] = useState('');

  // Recalcula estatísticas de cada liderado a partir da lista atualizada de reuniões
  const syncMembersStats = (currentMembers: TeamMember1on1[], currentMeetings: OneOnOneMeeting[]) => {
    const updated = currentMembers.map(member => {
      const memberMeetings = currentMeetings.filter(
        m => m.employeeId === member.id || m.employeeName === member.name
      );
      if (memberMeetings.length === 0) {
        return {
          ...member,
          meetingsCount: 0,
          openActionItemsCount: 0
        };
      }
      const sorted = [...memberMeetings].sort((a, b) => b.date.localeCompare(a.date));
      const avgMood = Number(
        (memberMeetings.reduce((acc, cur) => acc + cur.moodRating, 0) / memberMeetings.length).toFixed(1)
      );
      const openActions = memberMeetings.reduce(
        (acc, cur) => acc + cur.actionItems.filter(a => a.status === 'pending').length,
        0
      );
      return {
        ...member,
        lastMeetingDate: sorted[0].date,
        meetingsCount: memberMeetings.length,
        averageMood: avgMood,
        openActionItemsCount: openActions
      };
    });
    setMembers(updated);
  };

  const handleImportOneOnOneExcel = (rows: Record<string, any>[]) => {
    const newMembers: TeamMember1on1[] = rows.map((row, idx) => ({
      id: `mem-imp-${Date.now()}-${idx}`,
      name: (row.employeeName || 'Liderado').trim(),
      role: (row.role || 'Operador').trim(),
      department: (row.sector || 'Produção').trim(),
      lastMeetingDate: undefined,
      meetingsCount: 0,
      averageMood: 4.0,
      openActionItemsCount: 0,
      status: 'up_to_date'
    }));

    setMembers([...newMembers, ...members]);

    return {
      successCount: newMembers.length,
      message: `${newMembers.length} liderados importados para a agenda de 1:1!`
    };
  };

  // CRUD de Liderados
  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberRole('');
    setMemberDepartment('');
    setMemberStatus('up_to_date');
    setIsMemberModalOpen(true);
  };

  const openEditMemberModal = (member: TeamMember1on1) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberRole(member.role);
    setMemberDepartment(member.department);
    setMemberStatus(member.status);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberRole.trim()) return;

    if (editingMember) {
      const updatedMembers = members.map(m =>
        m.id === editingMember.id
          ? {
              ...m,
              name: memberName.trim(),
              role: memberRole.trim(),
              department: memberDepartment.trim() || 'Operações',
              status: memberStatus
            }
          : m
      );
      setMembers(updatedMembers);
    } else {
      const newMember: TeamMember1on1 = {
        id: `mem-${Date.now()}`,
        name: memberName.trim(),
        role: memberRole.trim(),
        department: memberDepartment.trim() || 'Operações',
        meetingsCount: 0,
        averageMood: 4.0,
        openActionItemsCount: 0,
        status: memberStatus
      };
      setMembers([newMember, ...members]);
    }

    setIsMemberModalOpen(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId: string) => {
    const target = members.find(m => m.id === memberId);
    if (!target) return;
    if (!window.confirm(`Deseja realmente excluir o liderado "${target.name}"?`)) return;
    setMembers(members.filter(m => m.id !== memberId));
  };

  // CRUD de Reuniões 1:1
  const handleSaveMeeting = (savedMeeting: OneOnOneMeeting) => {
    const exists = meetings.some(m => m.id === savedMeeting.id);
    const updatedMeetings = exists
      ? meetings.map(m => (m.id === savedMeeting.id ? savedMeeting : m))
      : [savedMeeting, ...meetings];

    setMeetings(updatedMeetings);

    // Atualiza dados do liderado correspondente
    const updatedMembers = members.map(m =>
      m.id === savedMeeting.employeeId ? { ...m, status: 'up_to_date' as const } : m
    );
    syncMembersStats(updatedMembers, updatedMeetings);

    // Se a Ata dessa reunião estava aberta, atualiza também
    if (selectedMeetingDetail && selectedMeetingDetail.id === savedMeeting.id) {
      setSelectedMeetingDetail(savedMeeting);
    }

    setSelectedMemberForMeeting(null);
    setEditingMeeting(null);
  };

  const handleEditMeeting = (meeting: OneOnOneMeeting) => {
    const member =
      members.find(m => m.id === meeting.employeeId || m.name === meeting.employeeName) || {
        id: meeting.employeeId,
        name: meeting.employeeName,
        role: meeting.employeeRole,
        department: meeting.employeeDepartment,
        meetingsCount: 1,
        averageMood: meeting.moodRating,
        openActionItemsCount: meeting.actionItems.filter(a => a.status === 'pending').length,
        status: 'up_to_date'
      };
    setSelectedMeetingDetail(null);
    setEditingMeeting(meeting);
    setSelectedMemberForMeeting(member);
  };

  const handleDeleteMeeting = (meetingId: string) => {
    const target = meetings.find(m => m.id === meetingId);
    if (!target) return;
    if (
      !window.confirm(
        `Deseja realmente excluir a reunião 1:1 de "${target.employeeName}" (${target.date}) e sua respectiva Ata?`
      )
    ) {
      return;
    }
    const updatedMeetings = meetings.filter(m => m.id !== meetingId);
    setMeetings(updatedMeetings);
    syncMembersStats(members, updatedMeetings);
    if (selectedMeetingDetail?.id === meetingId) {
      setSelectedMeetingDetail(null);
    }
  };

  // CRUD de Compromissos & Ações Mútuas
  const handleToggleActionStatus = (meetingId: string, actionId: string) => {
    const updatedMeetings = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: m.actionItems.map(a =>
            a.id === actionId
              ? { ...a, status: (a.status === 'pending' ? 'completed' : 'pending') as 'pending' | 'completed' }
              : a
          )
        };
      }
      return m;
    });
    setMeetings(updatedMeetings);
    syncMembersStats(members, updatedMeetings);
    if (selectedMeetingDetail && selectedMeetingDetail.id === meetingId) {
      const updatedDetail = updatedMeetings.find(m => m.id === meetingId) || null;
      setSelectedMeetingDetail(updatedDetail);
    }
  };

  const handleDeleteActionItem = (meetingId: string, actionId: string) => {
    if (!window.confirm('Deseja excluir este compromisso/meta?')) return;
    const updatedMeetings = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: m.actionItems.filter(a => a.id !== actionId)
        };
      }
      return m;
    });
    setMeetings(updatedMeetings);
    syncMembersStats(members, updatedMeetings);
    if (selectedMeetingDetail && selectedMeetingDetail.id === meetingId) {
      const updatedDetail = updatedMeetings.find(m => m.id === meetingId) || null;
      setSelectedMeetingDetail(updatedDetail);
    }
  };

  const handleSaveEditedActionItem = (meetingId: string, actionId: string) => {
    if (!editActionTitle.trim()) return;
    const managerDisplayName = currentUser.name || 'Danilo Henrique';
    const updatedMeetings = meetings.map(m => {
      if (m.id === meetingId) {
        return {
          ...m,
          actionItems: m.actionItems.map(a =>
            a.id === actionId
              ? {
                  ...a,
                  title: editActionTitle.trim(),
                  assignee: editActionAssignee,
                  assigneeName: editActionAssignee === 'manager' ? managerDisplayName : m.employeeName,
                  dueDate: editActionDueDate || m.date
                }
              : a
          )
        };
      }
      return m;
    });
    setMeetings(updatedMeetings);
    syncMembersStats(members, updatedMeetings);
    setEditingActionKey(null);
  };

  const handleCreateQuickAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickActionTitle.trim()) return;

    const targetMember =
      members.find(m => m.id === newQuickActionMemberId) || members[0];
    if (!targetMember) return;

    const managerDisplayName = currentUser.name || 'Danilo Henrique';
    const newAction: ActionItem = {
      id: `act-${Date.now()}`,
      title: newQuickActionTitle.trim(),
      assignee: newQuickActionAssignee,
      assigneeName: newQuickActionAssignee === 'manager' ? managerDisplayName : targetMember.name,
      dueDate: newQuickActionDueDate || new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    // Procura reunião mais recente desse liderado ou cria um registro de acompanhamento
    const existingMeeting = meetings.find(
      m => m.employeeId === targetMember.id || m.employeeName === targetMember.name
    );

    let updatedMeetings: OneOnOneMeeting[];
    if (existingMeeting) {
      updatedMeetings = meetings.map(m =>
        m.id === existingMeeting.id
          ? { ...m, actionItems: [...m.actionItems, newAction] }
          : m
      );
    } else {
      const standaloneMeeting: OneOnOneMeeting = {
        id: `meet-${Date.now()}`,
        tenantId: currentTenant.id,
        employeeId: targetMember.id,
        employeeName: targetMember.name,
        employeeRole: targetMember.role,
        employeeDepartment: targetMember.department,
        managerName: managerDisplayName,
        date: new Date().toISOString().split('T')[0],
        durationMinutes: 30,
        moodRating: 4,
        topics: [],
        actionItems: [newAction],
        transcripts: [],
        notes: 'Compromisso/meta adicionado diretamente pelo painel de ações.',
        createdAt: new Date().toISOString()
      };
      updatedMeetings = [standaloneMeeting, ...meetings];
    }

    setMeetings(updatedMeetings);
    syncMembersStats(members, updatedMeetings);
    setNewQuickActionTitle('');
  };

  // CRUD de Perguntas do Banco de Metodologia
  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQCategory('Alinhamento & Prioridades');
    setQText('');
    setQSource('Metodologia Aptis');
    setQExplanation('');
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: PowerfulQuestionPrompt) => {
    setEditingQuestion(q);
    setQCategory(q.category);
    setQText(q.question);
    setQSource(q.source);
    setQExplanation(q.explanation);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    if (editingQuestion) {
      setQuestions(
        questions.map(q =>
          q.id === editingQuestion.id
            ? {
                ...q,
                category: qCategory,
                question: qText.trim(),
                source: qSource.trim() || 'Gestão Aptis',
                explanation: qExplanation.trim()
              }
            : q
        )
      );
    } else {
      const newQ: PowerfulQuestionPrompt = {
        id: `pq-${Date.now()}`,
        category: qCategory,
        question: qText.trim(),
        source: qSource.trim() || 'Gestão Aptis',
        explanation: qExplanation.trim() || 'Pergunta estratégica para condução de reunião 1:1.'
      };
      setQuestions([newQ, ...questions]);
    }

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (id: string) => {
    if (!window.confirm('Deseja excluir esta pergunta do banco de metodologia?')) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  // IMPRESSÃO EXECUTIVA / EXPORTAÇÃO DA ATA EM PDF (Padrão A4 Corporativo)
  const handlePrintMeetingPDF = (meeting: OneOnOneMeeting) => {
    const printWindow = window.open('', '_blank', 'width=980,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    const moodLabels: Record<number, string> = {
      1: '1/5 - Crítico / Desmotivado',
      2: '2/5 - Desgastado / Atenção',
      3: '3/5 - Neutro / Estável',
      4: '4/5 - Engajado / Positivo',
      5: '5/5 - Alta Energia / Motivado'
    };

    const topicsHtml =
      meeting.topics && meeting.topics.length > 0
        ? meeting.topics
            .map(
              t => `
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">
                  ${t.title}
                </td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; width: 130px;">
                  <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; ${
                    t.isDiscussed
                      ? 'background: #d1fae5; color: #065f46;'
                      : 'background: #f1f5f9; color: #475569;'
                  }">
                    ${t.isDiscussed ? '✓ Abordado' : 'Pendente'}
                  </span>
                </td>
              </tr>`
            )
            .join('')
        : `<tr><td colspan="2" style="padding: 12px; color: #64748b; font-style: italic;">Nenhum tópico listado na pauta.</td></tr>`;

    const actionsHtml =
      meeting.actionItems && meeting.actionItems.length > 0
        ? meeting.actionItems
            .map(
              a => `
              <tr>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">
                  ${a.title}
                </td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; width: 180px; color: #334155;">
                  ${a.assignee === 'manager' ? 'Gestor: ' : 'Liderado: '}<strong>${a.assigneeName}</strong>
                </td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; width: 100px; text-align: center; font-family: monospace;">
                  ${a.dueDate}
                </td>
                <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; width: 100px; text-align: center;">
                  <span style="display: inline-block; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; ${
                    a.status === 'completed'
                      ? 'background: #d1fae5; color: #065f46;'
                      : 'background: #fef3c7; color: #92400e;'
                  }">
                    ${a.status === 'completed' ? 'Concluído' : 'Pendente'}
                  </span>
                </td>
              </tr>`
            )
            .join('')
        : `<tr><td colspan="4" style="padding: 12px; color: #64748b; font-style: italic;">Nenhum compromisso ou meta registrado nesta sessão.</td></tr>`;

    const transcriptsHtml =
      meeting.transcripts && meeting.transcripts.length > 0
        ? `
          <div style="margin-top: 22px;">
            <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">
              4. Registro de Diálogo & Falas Transcritas
            </h3>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
              ${meeting.transcripts
                .map(
                  t => `
                  <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; font-size: 11px;">
                    <strong style="color: ${t.speaker === 'manager' ? '#1d4ed8' : '#047857'};">
                      ${t.speakerName} [${t.timestamp}]:
                    </strong>
                    <span style="color: #1e293b; margin-left: 4px;">${t.text}</span>
                  </div>`
                )
                .join('')}
            </div>
          </div>`
        : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Ata de Reunião 1:1 - ${meeting.employeeName} (${meeting.date})</title>
        <style>
          @page { size: A4; margin: 16mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            line-height: 1.45;
            font-size: 12px;
            margin: 0;
            padding: 0;
          }
          table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
          th {
            background: #f1f5f9;
            color: #475569;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            padding: 8px 10px;
            text-align: left;
            border-bottom: 2px solid #cbd5e1;
          }
        </style>
      </head>
      <body>
        <!-- Cabeçalho Oficial -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f172a; padding-bottom: 14px; margin-bottom: 18px;">
          <div>
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: #e11d48;">
              APTIS 1:1 • GOVERNANÇA DE LIDERANÇA & DESENVOLVIMENTO
            </div>
            <h1 style="font-size: 20px; font-weight: 900; margin: 4px 0 2px 0; color: #0f172a;">
              ATA OFICIAL DE REUNIÃO INDIVIDUAL (1:1)
            </h1>
            <div style="font-size: 11px; color: #475569;">
              Unidade / Empresa: <strong>${currentTenant.name}</strong>
            </div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #334155;">
            <div><strong>Data:</strong> ${meeting.date}</div>
            <div><strong>Duração:</strong> ${meeting.durationMinutes} minutos</div>
            <div><strong>ID:</strong> ${meeting.id}</div>
          </div>
        </div>

        <!-- Quadro de Identificação dos Participantes -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">Colaborador (Liderado)</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${meeting.employeeName}</div>
            <div style="font-size: 11px; color: #475569;">${meeting.employeeRole} • Setor: ${meeting.employeeDepartment}</div>
          </div>
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700;">Líder / Gestor Responsável</div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a;">${meeting.managerName}</div>
            <div style="font-size: 11px; color: #475569;">
              Termômetro de Energia/Clima: <strong>${moodLabels[meeting.moodRating] || `${meeting.moodRating}/5`}</strong>
            </div>
          </div>
          ${
            meeting.moodNote
              ? `<div style="grid-column: span 2; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 11px; color: #334155;">
                  <strong>Observação de Clima / Motivação:</strong> ${meeting.moodNote}
                 </div>`
              : ''
          }
        </div>

        <!-- 1. Pauta da Reunião -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            1. Pauta da Reunião & Tópicos Tratados
          </h3>
          <table>
            <thead>
              <tr>
                <th>Tópico da Pauta</th>
                <th style="text-align: center; width: 130px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${topicsHtml}
            </tbody>
          </table>
        </div>

        <!-- 2. Síntese Executiva e Feedbacks -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            2. Síntese Executiva, Feedbacks & Direcionamentos
          </h3>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; min-height: 60px; white-space: pre-wrap; color: #1e293b;">
            ${meeting.notes || 'Nenhuma síntese escrita adicional registrada.'}
          </div>
        </div>

        <!-- 3. Plano de Ação e Compromissos -->
        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            3. Plano de Ação, Compromissos & Metas Acordadas
          </h3>
          <table>
            <thead>
              <tr>
                <th>Compromisso / Ação / Meta</th>
                <th style="width: 180px;">Responsável</th>
                <th style="width: 100px; text-align: center;">Prazo</th>
                <th style="width: 100px; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${actionsHtml}
            </tbody>
          </table>
        </div>

        ${transcriptsHtml}

        <!-- Assinaturas -->
        <div style="margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; page-break-inside: avoid;">
          <div style="text-align: center;">
            <div style="border-top: 1px solid #334155; padding-top: 8px; font-weight: 700; color: #0f172a;">
              ${meeting.managerName}
            </div>
            <div style="font-size: 10px; color: #64748b;">Assinatura do Gestor / Líder</div>
          </div>
          <div style="text-align: center;">
            <div style="border-top: 1px solid #334155; padding-top: 8px; font-weight: 700; color: #0f172a;">
              ${meeting.employeeName}
            </div>
            <div style="font-size: 10px; color: #64748b;">Assinatura do Colaborador (${meeting.employeeRole})</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
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
    <div className="space-y-6 w-full pb-12">
      {/* HEADER DO MÓDULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Gestão de Pessoas & Liderança
            </span>
            <span className="text-xs text-slate-500 font-medium">Unidade: {currentTenant.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Aptis 1:1 • Reuniões Individuais Estratégicas
          </h1>
          <p className="text-sm text-slate-600 max-w-3xl mt-1">
            Conduza reuniões 1:1 em tela ampla com pauta estruturada, gravação acústica por voz, gestão de metas/ações e emissão de Ata oficial em PDF.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={openAddMemberModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-rose-600" />
            + Liderado
          </button>

          <button
            onClick={() => setIsExcelImporterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs cursor-pointer"
            title="Importar liderados do Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Importar Excel
          </button>

          <button
            onClick={() => {
              setEditingMeeting(null);
              if (members.length > 0) {
                setSelectedMemberForMeeting(members[0]);
              } else {
                openAddMemberModal();
              }
            }}
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
          Painel da Equipe & Atas 1:1
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
          Compromissos, Ações & Metas
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

      {/* CONTEÚDO DA ABA DASHBOARD */}
      {activeTab === 'dashboard' && (
        <OneOnOneDashboard
          members={members}
          meetings={meetings}
          onOpenMeetingModal={member => {
            setEditingMeeting(null);
            setSelectedMemberForMeeting(member);
          }}
          onViewMeetingDetail={meeting => setSelectedMeetingDetail(meeting)}
          onEditMeeting={handleEditMeeting}
          onDeleteMeeting={handleDeleteMeeting}
          onPrintMeeting={handlePrintMeetingPDF}
          onAddMember={openAddMemberModal}
          onEditMember={openEditMemberModal}
          onDeleteMember={handleDeleteMember}
        />
      )}

      {/* ABA DE COMPROMISSOS, AÇÕES E METAS (COM CRIAR, EDITAR E EXCLUIR) */}
      {activeTab === 'actions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-emerald-600" />
                Compromissos, Ações & Metas das Reuniões 1:1
              </h2>
              <p className="text-xs text-slate-500">
                Cadastre novas metas, edite prazos e responsáveis ou exclua ações concluídas.
              </p>
            </div>
          </div>

          {/* Formulário Rápido para Criar Nova Ação / Meta Direto na Aba */}
          <form
            onSubmit={handleCreateQuickAction}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              + Cadastrar Nova Ação / Meta Individual
            </span>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                required
                placeholder="Descreva a meta ou compromisso acordado..."
                value={newQuickActionTitle}
                onChange={e => setNewQuickActionTitle(e.target.value)}
                className="md:col-span-5 text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <select
                value={newQuickActionMemberId || (members[0]?.id ?? '')}
                onChange={e => setNewQuickActionMemberId(e.target.value)}
                className="md:col-span-3 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 cursor-pointer"
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    Liderado: {m.name}
                  </option>
                ))}
              </select>

              <select
                value={newQuickActionAssignee}
                onChange={e => setNewQuickActionAssignee(e.target.value as any)}
                className="md:col-span-2 text-xs bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 cursor-pointer"
              >
                <option value="employee">👤 Liderado</option>
                <option value="manager">👔 Gestor</option>
              </select>

              <div className="md:col-span-2 flex gap-2">
                <input
                  type="date"
                  value={newQuickActionDueDate}
                  onChange={e => setNewQuickActionDueDate(e.target.value)}
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-2 font-semibold text-slate-700 cursor-pointer"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </form>

          {/* Lista de Ações e Metas */}
          <div className="space-y-3">
            {allActionItemsWithMeeting.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                Nenhum compromisso registrado ainda. Adicione acima ou realize uma reunião 1:1.
              </div>
            ) : (
              allActionItemsWithMeeting.map(item => {
                const actionKey = `${item.meetingId}:${item.id}`;
                const isEditing = editingActionKey === actionKey;

                return (
                  <div
                    key={actionKey}
                    className={`p-4 rounded-xl border transition-all ${
                      item.status === 'completed'
                        ? 'bg-slate-50 border-slate-200 opacity-65'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="text"
                          value={editActionTitle}
                          onChange={e => setEditActionTitle(e.target.value)}
                          className="flex-1 w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold"
                          autoFocus
                        />
                        <select
                          value={editActionAssignee}
                          onChange={e => setEditActionAssignee(e.target.value as any)}
                          className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-700"
                        >
                          <option value="employee">👤 Liderado ({item.employeeName})</option>
                          <option value="manager">👔 Gestor ({currentUser.name || 'Danilo Henrique'})</option>
                        </select>
                        <input
                          type="date"
                          value={editActionDueDate}
                          onChange={e => setEditActionDueDate(e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-700"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEditedActionItem(item.meetingId, item.id)}
                            className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingActionKey(null)}
                            className="px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleActionStatus(item.meetingId, item.id)}
                            className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              item.status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'border border-slate-300 hover:border-emerald-500'
                            }`}
                          >
                            {item.status === 'completed' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <div>
                            <span
                              className={`text-xs font-bold block ${
                                item.status === 'completed'
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </span>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>
                                Liderado: <strong>{item.employeeName}</strong>
                              </span>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  item.assignee === 'manager' ? 'text-blue-700' : 'text-emerald-700'
                                }`}
                              >
                                Responsável: {item.assigneeName}
                              </span>
                              <span>•</span>
                              <span className="font-mono">Prazo: {item.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              item.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status === 'completed' ? 'Concluído' : 'Pendente'}
                          </span>

                          <button
                            onClick={() => {
                              setEditingActionKey(actionKey);
                              setEditActionTitle(item.title);
                              setEditActionAssignee(item.assignee);
                              setEditActionDueDate(item.dueDate);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar este compromisso/meta"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteActionItem(item.meetingId, item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir este compromisso/meta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA DE METODOLOGIA E PERGUNTAS (COM CRIAR, EDITAR E EXCLUIR) */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 sm:p-8 rounded-2xl text-white border border-rose-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Metodologia dos Melhores Gestores
              </span>
              <h2 className="text-2xl font-black text-white">
                Banco de Perguntas Estratégicas para 1:1
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Personalize seu repertório de perguntas para guiar conversas de alinhamento, desbloqueio operacional, feedback e carreira.
              </p>
            </div>

            <button
              onClick={openAddQuestionModal}
              className="shrink-0 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              + Cadastrar Pergunta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {questions.map(q => (
              <div
                key={q.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    <span>{q.category}</span>
                    <span className="text-slate-400">{q.source}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">"{q.question}"</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{q.explanation}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Disponível na Sala 1:1
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditQuestionModal(q)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Editar pergunta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Excluir pergunta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL WIDESCREEN DE CONDUÇÃO / EDIÇÃO DE REUNIÃO 1:1 */}
      {selectedMemberForMeeting && (
        <MeetingFormModal
          member={selectedMemberForMeeting}
          allMembers={members}
          managerName={currentUser.name || 'Danilo Henrique'}
          tenantId={currentTenant.id}
          editingMeeting={editingMeeting}
          customQuestions={questions}
          onClose={() => {
            setSelectedMemberForMeeting(null);
            setEditingMeeting(null);
          }}
          onSaveMeeting={handleSaveMeeting}
        />
      )}

      {/* MODAL EXECUTIVO AMPLO DE ATA DA REUNIÃO 1:1 (COM IMPRESSÃO PDF, EDIÇÃO E EXCLUSÃO) */}
      {selectedMeetingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho Executivo da Ata */}
            <div className="px-6 py-5 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 border border-rose-800 px-2.5 py-0.5 rounded-full">
                    Ata Oficial de Reunião 1:1
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    📅 {selectedMeetingDetail.date} • ⏱️ {selectedMeetingDetail.durationMinutes} min
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {selectedMeetingDetail.employeeName}{' '}
                  <span className="text-sm font-medium text-slate-400">
                    — {selectedMeetingDetail.employeeRole} ({selectedMeetingDetail.employeeDepartment})
                  </span>
                </h2>
              </div>

              {/* Botões de Ação no Topo da Ata */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handlePrintMeetingPDF(selectedMeetingDetail)}
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Salvar em PDF
                </button>

                <button
                  onClick={() => handleEditMeeting(selectedMeetingDetail)}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  Editar Reunião
                </button>

                <button
                  onClick={() => handleDeleteMeeting(selectedMeetingDetail.id)}
                  className="p-2.5 bg-rose-950/70 hover:bg-rose-900 text-rose-300 rounded-xl cursor-pointer border border-rose-800/60"
                  title="Excluir esta reunião"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedMeetingDetail(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corpo do Dossiê / Ata com Scroll Amplo */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 bg-slate-50/60">
              {/* Resumo de Participantes e Clima */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Colaborador (Liderado)
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {selectedMeetingDetail.employeeName}
                  </span>
                  <span className="text-xs text-slate-500">
                    {selectedMeetingDetail.employeeRole} • {selectedMeetingDetail.employeeDepartment}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Líder / Gestor Responsável
                  </span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">
                    {selectedMeetingDetail.managerName}
                  </span>
                  <span className="text-xs text-slate-500">Unidade: {currentTenant.name}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Termômetro de Energia & Clima
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5" /> Nota {selectedMeetingDetail.moodRating} / 5
                    </span>
                  </div>
                  {selectedMeetingDetail.moodNote && (
                    <p className="text-xs text-slate-600 mt-1.5 italic">
                      "{selectedMeetingDetail.moodNote}"
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Pauta e Tópicos Tratados */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <FileText className="w-4 h-4 text-rose-600" />
                    1. Pauta da Reunião ({selectedMeetingDetail.topics.length} tópicos)
                  </h4>
                  {selectedMeetingDetail.topics.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum tópico registrado na pauta.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMeetingDetail.topics.map(t => (
                        <div
                          key={t.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="font-semibold text-slate-800">{t.title}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                              t.isDiscussed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {t.isDiscussed ? 'Abordado' : 'Pendente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Síntese Executiva & Direcionamentos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 flex flex-col">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    2. Síntese Executiva, Feedbacks & Acordos
                  </h4>
                  <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMeetingDetail.notes ||
                      'Nenhuma anotação complementar registrada pelo gestor nesta sessão.'}
                  </div>
                </div>
              </div>

              {/* 3. Plano de Ação & Compromissos Acordados */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    3. Plano de Ação, Compromissos & Metas ({selectedMeetingDetail.actionItems.length})
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Clique no check para marcar como concluído
                  </span>
                </div>

                {selectedMeetingDetail.actionItems.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Nenhuma ação ou meta registrada para esta reunião.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMeetingDetail.actionItems.map(a => (
                      <div
                        key={a.id}
                        className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleToggleActionStatus(selectedMeetingDetail.id, a.id)}
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 cursor-pointer ${
                              a.status === 'completed'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 hover:border-emerald-500'
                            }`}
                          >
                            {a.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                          <div>
                            <span
                              className={`font-bold block ${
                                a.status === 'completed'
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {a.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              Responsável: <strong>{a.assigneeName}</strong> • Prazo: {a.dueDate}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            a.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {a.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Transcrições de Voz */}
              {selectedMeetingDetail.transcripts && selectedMeetingDetail.transcripts.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Mic className="w-4 h-4 text-cyan-600" />
                    4. Transcrição Completa das Falas Gravadas ({selectedMeetingDetail.transcripts.length})
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 max-h-72 overflow-y-auto text-xs">
                    {selectedMeetingDetail.transcripts.map(t => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-start gap-2"
                      >
                        <span
                          className={`font-bold shrink-0 ${
                            t.speaker === 'manager' ? 'text-blue-700' : 'text-emerald-700'
                          }`}
                        >
                          {t.speaker === 'manager' ? '👔' : '👤'} {t.speakerName} ({t.timestamp}):
                        </span>
                        <span className="text-slate-700">{t.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rodapé da Ata */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Documento gerado pelo módulo <strong>Aptis 1:1</strong> • Pronto para impressão A4 / PDF
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handlePrintMeetingPDF(selectedMeetingDetail)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  Imprimir Ata em PDF
                </button>
                <button
                  onClick={() => setSelectedMeetingDetail(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE LIDERADO */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingMember ? 'Editar Liderado' : 'Cadastrar Novo Liderado'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcos Oliveira"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cargo / Função *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Técnico de Manutenção Sênior"
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Setor / Departamento</label>
                <input
                  type="text"
                  placeholder="Ex: Manutenção Industrial / Usinagem"
                  value={memberDepartment}
                  onChange={e => setMemberDepartment(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Status da Cadência 1:1</label>
                <select
                  value={memberStatus}
                  onChange={e => setMemberStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="up_to_date">✅ Em Dia (&lt; 15 dias)</option>
                  <option value="attention">⚠️ Atenção (15 a 30 dias)</option>
                  <option value="overdue">🚨 Atrasada (&gt; 30 dias)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Liderado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE PERGUNTA ESTRATÉGICA */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingQuestion ? 'Editar Pergunta 1:1' : 'Nova Pergunta Estratégica'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoria</label>
                <select
                  value={qCategory}
                  onChange={e => setQCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 font-semibold cursor-pointer"
                >
                  <option value="Alinhamento & Prioridades">Alinhamento & Prioridades</option>
                  <option value="Desafios & Bloqueios">Desafios & Bloqueios</option>
                  <option value="Feedback Bidirecional">Feedback Bidirecional</option>
                  <option value="Carreira & PDI">Carreira & PDI</option>
                  <option value="Bem-Estar & Clima">Bem-Estar & Clima</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Pergunta *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Qual é o principal gargalo que está travando sua produtividade nesta semana?"
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Referência / Metodologia</label>
                <input
                  type="text"
                  placeholder="Ex: High Output Management / Radical Candor"
                  value={qSource}
                  onChange={e => setQSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Objetivo da Pergunta</label>
                <textarea
                  rows={2}
                  placeholder="Por que fazer esta pergunta durante o 1:1?"
                  value={qExplanation}
                  onChange={e => setQExplanation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Salvar Pergunta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Importação de Excel Inteligente */}
      <SmartExcelImporterModal
        isOpen={isExcelImporterOpen}
        onClose={() => setIsExcelImporterOpen(false)}
        toolTitle={EXCEL_IMPORT_CONFIGS['one-on-one'].toolTitle}
        subtitle={EXCEL_IMPORT_CONFIGS['one-on-one'].subtitle}
        templateFilename={EXCEL_IMPORT_CONFIGS['one-on-one'].templateFilename}
        columns={EXCEL_IMPORT_CONFIGS['one-on-one'].columns}
        sampleRows={EXCEL_IMPORT_CONFIGS['one-on-one'].sampleRows}
        onImport={handleImportOneOnOneExcel}
      />
    </div>
  );
}
