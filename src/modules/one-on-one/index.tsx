'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '@/context/tenant-context';
import { useTenantStorage } from '@/hooks/use-tenant-storage';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
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
  Mic, 
  Award, 
  ListTodo, 
  FileSpreadsheet, 
  Edit3, 
  Trash2, 
  Printer, 
  FileText, 
  CheckSquare, 
  UserPlus,
  Smile,
  AlertCircle,
  MessageSquare,
  Building2
} from 'lucide-react';
import { SmartExcelImporterModal } from '@/components/common/SmartExcelImporterModal';
import { EXCEL_IMPORT_CONFIGS } from '@/config/excel-templates-config';

export default function OneOnOneModule() {
  const { currentUser, currentTenant } = useTenant();
  const { sectors: plantSectors } = usePlantSectors();
  const safePlantSectors = Array.isArray(plantSectors) ? plantSectors : [];

  const [tintedGlass, setTintedGlass] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setTintedGlass(customEvent.detail);
      }
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions' | 'actions'>('dashboard');
  const [members, setMembers] = useTenantStorage<TeamMember1on1[]>('one-on-one', 'members', INITIAL_TEAM_MEMBERS);
  const [meetings, setMeetings] = useTenantStorage<OneOnOneMeeting[]>('one-on-one', 'meetings', INITIAL_MEETINGS_HISTORY);
  const [questions, setQuestions] = useTenantStorage<PowerfulQuestionPrompt[]>('one-on-one', 'questions', POWERFUL_QUESTIONS);

  // Lista dinâmica de setores combinando setores da planta + setores dos liderados
  const memberDepartments = Array.from(new Set(members.map(m => m.department).filter(Boolean)));
  const allSectorNames = Array.from(
    new Set([...safePlantSectors.map(s => s.name), ...memberDepartments])
  );
  const sectorsList = [
    { id: 'all', label: 'Todos os Setores' },
    ...allSectorNames.map(name => ({ id: name, label: name }))
  ];

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

        <div style="margin-bottom: 20px;">
          <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
            2. Síntese Executiva, Feedbacks & Direcionamentos
          </h3>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; min-height: 60px; white-space: pre-wrap; color: #1e293b;">
            ${meeting.notes || 'Nenhuma síntese escrita adicional registrada.'}
          </div>
        </div>

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

  // Estatísticas para os 4 Sub-Cards do Header (Idêntico ao Aptis Routine)
  const totalMembersCount = members.length;
  const overdueMembersCount = members.filter(m => m.status === 'overdue').length;
  const totalMeetingsCount = meetings.length;
  const allMoods = meetings.map(m => m.moodRating);
  const averageTeamMood =
    allMoods.length > 0
      ? (allMoods.reduce((a, b) => a + b, 0) / allMoods.length).toFixed(1)
      : '4.5';
  const pendingActionsCount = allActionItemsWithMeeting.filter(a => a.status === 'pending').length;

  // Configuração da Barra de Abas Meniscus (Exatamente como no Aptis Routine)
  const oneOnOneTabs: Array<{
    id: 'dashboard' | 'actions' | 'questions';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    glowColor: string;
    beadGradient: string;
    badgeCount?: number;
  }> = [
    {
      id: 'dashboard',
      label: 'Painel da Equipe & Atas 1:1',
      icon: Users,
      glowColor: 'rgba(59, 130, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)'
    },
    {
      id: 'actions',
      label: 'Compromissos, Ações & Metas',
      icon: ListTodo,
      glowColor: 'rgba(16, 185, 129, 0.58)',
      beadGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
      badgeCount: pendingActionsCount
    },
    {
      id: 'questions',
      label: 'Metodologia & Banco de Perguntas',
      icon: Sparkles,
      glowColor: 'rgba(139, 92, 246, 0.58)',
      beadGradient: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)'
    }
  ];

  const activeMeniscusTab =
    oneOnOneTabs.find(t => t.id === activeTab) || oneOnOneTabs[0];

  return (
    <div className="space-y-6 w-full pb-12">
      {/* =====================================================================
          1. HEADER EXECUTIVO EM VIDRO ESPECULAR + 4 KPI SUB-CÁPSULAS (Idêntico ao Aptis Routine)
         ===================================================================== */}
      <div
        className={`rounded-3xl p-6 relative overflow-hidden transition-all duration-500 ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.65) 0%, rgba(6, 182, 212, 0.25) 60%, transparent 75%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-blue-500/20 text-blue-200 border-blue-400/35'
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}
              >
                Módulo de Liderança & Desenvolvimento
              </span>
              <span
                className={`text-xs ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Unidade: {currentTenant.name}
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Aptis 1:1 • Reuniões Individuais Estratégicas
            </h1>
            <p
              className={`text-xs sm:text-sm mt-1 ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Conduza reuniões 1:1 em tela ampla com pauta estruturada, gravação acústica por voz, gestão de metas/ações e emissão de Ata oficial em PDF.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsExcelImporterOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border-emerald-400/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}
              title="Importar liderados do Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Importar Excel
            </button>

            <button
              onClick={openAddMemberModal}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-subcard text-white hover:border-cyan-400/40'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-xs'
              }`}
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              + Liderado
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              <Plus className="w-4 h-4" />
              Nova Reunião 1:1
            </button>
          </div>
        </div>

        {/* 4 KPI Cards Rápidos em Sub-cápsulas de Vidro (Idênticos ao Aptis Routine) */}
        <div
          className={`relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-5 border-t ${
            tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
          }`}
        >
          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>Equipe Mapeada</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              {totalMembersCount}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-rose-300' : 'text-rose-600'
              }`}
            >
              <span>1:1 Atrasadas</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-rose-400' : 'text-rose-600'
              }`}
            >
              {overdueMembersCount}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-600'
              }`}
            >
              <span>Reuniões Realizadas</span>
              <MessageSquare className="w-4 h-4 text-cyan-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-cyan-300' : 'text-blue-600'
              }`}
            >
              {totalMeetingsCount}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-white/90 border border-slate-200 shadow-2xs'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-semibold ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              <span>Clima & Motivação</span>
              <Smile className="w-4 h-4 text-emerald-400" />
            </div>
            <p
              className={`text-2xl font-black font-mono mt-1.5 ${
                tintedGlass ? 'text-emerald-300' : 'text-emerald-600'
              }`}
            >
              {averageTeamMood} <span className="text-xs font-normal opacity-70">/ 5.0</span>
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================================
          2. BARRA DE ABAS MENISCUS LIQUID BEAD + FILTRO SETORIAL (Idêntica ao Aptis Routine)
         ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative inline-flex self-start">
          {/* Halo Cromático Meniscus projetado sob a cápsula */}
          <div
            className="absolute -inset-2 rounded-full blur-2xl opacity-45 pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${activeMeniscusTab.glowColor} 0%, transparent 70%)`
            }}
          />

          <div className="aptis-meniscus-track rounded-full p-1.5 flex flex-wrap items-center gap-1 relative z-10">
            {oneOnOneTabs.map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all duration-500 cursor-pointer ${
                    isSelected
                      ? 'text-white scale-[1.03]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  style={
                    isSelected
                      ? {
                          background: tab.beadGradient,
                          boxShadow: `0 0 22px ${tab.glowColor}, inset 0 1.5px 1px rgba(255,255,255,0.65)`
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
                    <span className="text-[10px] font-mono font-black px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtro Setorial em Cápsula de Vidro (Idêntico ao Aptis Routine) */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl ${
            tintedGlass
              ? 'aptis-glass-subcard text-white'
              : 'bg-white border border-slate-200 shadow-2xs text-slate-800'
          }`}
        >
          <label
            htmlFor="sector-1on1-select"
            className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Área / Setor:</span>
          </label>
          <select
            id="sector-1on1-select"
            value={selectedSector}
            onChange={e => setSelectedSector(e.target.value)}
            className={`text-xs font-bold bg-transparent outline-none cursor-pointer min-w-[180px] ${
              tintedGlass ? 'text-cyan-300' : 'text-slate-900'
            }`}
          >
            {sectorsList.map(sec => (
              <option key={sec.id} value={sec.id} className="bg-slate-900 text-white py-1">
                {sec.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================================
          3. CONTEÚDO DINÂMICO CONFORME A ABA ATIVA
         ===================================================================== */}
      {activeTab === 'dashboard' && (
        <OneOnOneDashboard
          members={members}
          meetings={meetings}
          tintedGlass={tintedGlass}
          selectedSector={selectedSector}
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

      {/* ABA DE COMPROMISSOS, AÇÕES E METAS */}
      {activeTab === 'actions' && (
        <div
          className={`rounded-3xl p-6 space-y-6 ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 ${
              tintedGlass ? 'border-white/[0.08]' : 'border-slate-200/80'
            }`}
          >
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-emerald-400" />
                Compromissos, Ações & Metas das Reuniões 1:1
              </h2>
              <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Cadastre novas metas, edite prazos e responsáveis ou exclua ações concluídas.
              </p>
            </div>
          </div>

          {/* Formulário Rápido para Criar Nova Ação / Meta Direto na Aba */}
          <form
            onSubmit={handleCreateQuickAction}
            className={`p-4 rounded-2xl space-y-3 ${
              tintedGlass ? 'aptis-glass-subcard' : 'bg-white border border-slate-200 shadow-2xs'
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wider block ${
                tintedGlass ? 'text-emerald-300' : 'text-slate-700'
              }`}
            >
              + Cadastrar Nova Ação / Meta Individual
            </span>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <input
                type="text"
                required
                placeholder="Descreva a meta ou compromisso acordado..."
                value={newQuickActionTitle}
                onChange={e => setNewQuickActionTitle(e.target.value)}
                className={`md:col-span-5 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                }`}
              />

              <select
                value={newQuickActionMemberId || (members[0]?.id ?? '')}
                onChange={e => setNewQuickActionMemberId(e.target.value)}
                className={`md:col-span-3 text-xs rounded-xl px-3 py-2.5 font-semibold cursor-pointer focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
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
                className={`md:col-span-2 text-xs rounded-xl px-3 py-2.5 font-semibold cursor-pointer focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              >
                <option value="employee">👤 Liderado</option>
                <option value="manager">👔 Gestor</option>
              </select>

              <div className="md:col-span-2 flex gap-2">
                <input
                  type="date"
                  value={newQuickActionDueDate}
                  onChange={e => setNewQuickActionDueDate(e.target.value)}
                  className={`flex-1 text-xs rounded-xl px-2.5 py-2 font-semibold cursor-pointer focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-800'
                  }`}
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 6px 14px -3px rgba(16, 185, 129, 0.45)'
                  }}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </form>

          {/* Lista de Ações e Metas com Hover Lift */}
          <div className="space-y-3">
            {allActionItemsWithMeeting.length === 0 ? (
              <div
                className={`p-8 text-center text-xs italic rounded-2xl border border-dashed ${
                  tintedGlass
                    ? 'aptis-glass-subcard border-white/[0.15] text-slate-400'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                Nenhum compromisso registrado ainda. Adicione acima ou realize uma reunião 1:1.
              </div>
            ) : (
              allActionItemsWithMeeting.map(item => {
                const actionKey = `${item.meetingId}:${item.id}`;
                const isEditing = editingActionKey === actionKey;

                return (
                  <div
                    key={actionKey}
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      item.status === 'completed'
                        ? tintedGlass
                          ? 'bg-emerald-500/15 border border-emerald-400/35 opacity-75'
                          : 'bg-slate-50 border border-slate-200 opacity-65'
                        : tintedGlass
                        ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                        : 'bg-white border border-slate-200 hover:border-blue-300 hover:-translate-y-1 shadow-xs hover:shadow-lg text-slate-900'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <input
                          type="text"
                          value={editActionTitle}
                          onChange={e => setEditActionTitle(e.target.value)}
                          className={`flex-1 w-full text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none ${
                            tintedGlass
                              ? 'aptis-glass-input'
                              : 'bg-slate-50 border border-slate-300 text-slate-900'
                          }`}
                          autoFocus
                        />
                        <select
                          value={editActionAssignee}
                          onChange={e => setEditActionAssignee(e.target.value as any)}
                          className={`text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none ${
                            tintedGlass
                              ? 'aptis-glass-input'
                              : 'bg-slate-50 border border-slate-300 text-slate-700'
                          }`}
                        >
                          <option value="employee">👤 Liderado ({item.employeeName})</option>
                          <option value="manager">👔 Gestor ({currentUser.name || 'Danilo Henrique'})</option>
                        </select>
                        <input
                          type="date"
                          value={editActionDueDate}
                          onChange={e => setEditActionDueDate(e.target.value)}
                          className={`text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none ${
                            tintedGlass
                              ? 'aptis-glass-input'
                              : 'bg-slate-50 border border-slate-300 text-slate-700'
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEditedActionItem(item.meetingId, item.id)}
                            className="px-3.5 py-2 bg-emerald-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer"
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingActionKey(null)}
                            className={`px-3 py-2 text-xs font-bold rounded-xl cursor-pointer ${
                              tintedGlass
                                ? 'bg-white/[0.1] text-slate-300'
                                : 'bg-slate-200 text-slate-700'
                            }`}
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
                                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                : tintedGlass
                                ? 'border border-white/30 bg-white/[0.06] hover:border-emerald-400'
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
                                  : tintedGlass
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {item.title}
                            </span>
                            <div
                              className={`flex flex-wrap items-center gap-3 text-[11px] mt-1 ${
                                tintedGlass ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              <span>
                                Liderado: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{item.employeeName}</strong>
                              </span>
                              <span>•</span>
                              <span
                                className={`font-semibold ${
                                  item.assignee === 'manager'
                                    ? tintedGlass
                                      ? 'text-cyan-300'
                                      : 'text-blue-700'
                                    : tintedGlass
                                    ? 'text-emerald-300'
                                    : 'text-emerald-700'
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
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                              item.status === 'completed'
                                ? tintedGlass
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                : tintedGlass
                                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                                : 'bg-amber-100 text-amber-800 border-amber-200'
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
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              tintedGlass
                                ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                            }`}
                            title="Editar este compromisso/meta"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteActionItem(item.meetingId, item.id)}
                            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                              tintedGlass
                                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
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

      {/* ABA DE METODOLOGIA E PERGUNTAS */}
      {activeTab === 'questions' && (
        <div className="space-y-5">
          <div
            className={`p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
              tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
            }`}
          >
            <div className="space-y-1.5 relative z-10">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 border ${
                  tintedGlass
                    ? 'bg-purple-500/20 text-purple-200 border-purple-400/35'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Metodologia dos Melhores Gestores
              </span>
              <h2 className="text-xl font-black">
                Banco de Perguntas Estratégicas para 1:1
              </h2>
              <p className={`text-xs max-w-2xl leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                Personalize seu repertório de perguntas para guiar conversas de alinhamento, desbloqueio operacional, feedback e carreira.
              </p>
            </div>

            <button
              onClick={openAddQuestionModal}
              className="shrink-0 px-4 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer relative z-10"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              <Plus className="w-4 h-4" />
              + Cadastrar Pergunta
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map(q => (
              <div
                key={q.id}
                className={`p-5 rounded-2xl space-y-3 flex flex-col justify-between group transition-all duration-300 ${
                  tintedGlass
                    ? 'aptis-glass-subcard aptis-glass-subcard-interactive text-white'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className={tintedGlass ? 'text-cyan-300' : 'text-blue-600'}>{q.category}</span>
                    <span className="text-slate-400">{q.source}</span>
                  </div>
                  <h3 className="text-sm font-black leading-snug">"{q.question}"</h3>
                  <p className={`text-xs leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                    {q.explanation}
                  </p>
                </div>

                <div
                  className={`pt-3 border-t text-[11px] flex items-center justify-between ${
                    tintedGlass
                      ? 'border-white/[0.08] text-slate-400'
                      : 'border-slate-100 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Disponível na Sala 1:1
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditQuestionModal(q)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-cyan-300 hover:bg-white/[0.08]'
                          : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                      }`}
                      title="Editar pergunta"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
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
          tintedGlass={tintedGlass}
          onClose={() => {
            setSelectedMemberForMeeting(null);
            setEditingMeeting(null);
          }}
          onSaveMeeting={handleSaveMeeting}
        />
      )}

      {/* MODAL EXECUTIVO AMPLO DE ATA DA REUNIÃO 1:1 (EM LIQUID GLASS) */}
      {selectedMeetingDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div
            className={`rounded-3xl max-w-5xl w-full overflow-hidden my-4 flex flex-col max-h-[92vh] relative ${
              tintedGlass
                ? 'aptis-glass-modal text-white'
                : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
            }`}
          >
            {tintedGlass && (
              <div
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
              />
            )}

            {/* Cabeçalho Executivo da Ata */}
            <div
              className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b shrink-0 relative z-10 ${
                tintedGlass
                  ? 'bg-white/[0.02] border-white/[0.08] text-white'
                  : 'bg-slate-950 text-white border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/20 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                    Ata Oficial de Reunião 1:1
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
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
                  className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.35)] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir / Salvar em PDF
                </button>

                <button
                  onClick={() => handleEditMeeting(selectedMeetingDetail)}
                  className="px-3.5 py-2.5 aptis-glass-subcard hover:bg-white/[0.12] text-slate-100 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-white/[0.15]"
                >
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                  Editar Reunião
                </button>

                <button
                  onClick={() => handleDeleteMeeting(selectedMeetingDetail.id)}
                  className="p-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl cursor-pointer border border-rose-400/30"
                  title="Excluir esta reunião"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedMeetingDetail(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corpo do Dossiê / Ata com Scroll Amplo */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 relative z-10">
              <div
                className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-3xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-white border border-slate-200 shadow-2xs'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Colaborador (Liderado)
                  </span>
                  <span className={`text-sm font-black block mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {selectedMeetingDetail.employeeName}
                  </span>
                  <span className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                    {selectedMeetingDetail.employeeRole} • {selectedMeetingDetail.employeeDepartment}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Líder / Gestor Responsável
                  </span>
                  <span className={`text-sm font-black block mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {selectedMeetingDetail.managerName}
                  </span>
                  <span className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                    Unidade: {currentTenant.name}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Termômetro de Energia & Clima
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1 ${
                        tintedGlass
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      <Smile className="w-3.5 h-3.5" /> Nota {selectedMeetingDetail.moodRating} / 5
                    </span>
                  </div>
                  {selectedMeetingDetail.moodNote && (
                    <p className={`text-xs mt-1.5 italic ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                      "{selectedMeetingDetail.moodNote}"
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  className={`p-5 rounded-3xl space-y-3 ${
                    tintedGlass ? 'aptis-glass-subcard' : 'bg-white border border-slate-200 shadow-2xs'
                  }`}
                >
                  <h4
                    className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b pb-2.5 ${
                      tintedGlass
                        ? 'text-cyan-300 border-white/[0.08]'
                        : 'text-slate-700 border-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    1. Pauta da Reunião ({selectedMeetingDetail.topics.length} tópicos)
                  </h4>
                  {selectedMeetingDetail.topics.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Nenhum tópico registrado na pauta.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMeetingDetail.topics.map(t => (
                        <div
                          key={t.id}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                            tintedGlass
                              ? 'bg-white/[0.04] border-white/[0.08] text-slate-200'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span className="font-semibold">{t.title}</span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                              t.isDiscussed
                                ? tintedGlass
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-emerald-100 text-emerald-800'
                                : tintedGlass
                                ? 'bg-white/[0.08] text-slate-400'
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

                <div
                  className={`p-5 rounded-3xl space-y-3 flex flex-col ${
                    tintedGlass ? 'aptis-glass-subcard' : 'bg-white border border-slate-200 shadow-2xs'
                  }`}
                >
                  <h4
                    className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b pb-2.5 ${
                      tintedGlass
                        ? 'text-cyan-300 border-white/[0.08]'
                        : 'text-slate-700 border-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    2. Síntese Executiva, Feedbacks & Acordos
                  </h4>
                  <div
                    className={`flex-1 p-4 rounded-2xl border text-xs leading-relaxed whitespace-pre-wrap ${
                      tintedGlass
                        ? 'bg-white/[0.03] border-white/[0.08] text-slate-200'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {selectedMeetingDetail.notes ||
                      'Nenhuma anotação complementar registrada pelo gestor nesta sessão.'}
                  </div>
                </div>
              </div>

              <div
                className={`p-5 rounded-3xl space-y-3 ${
                  tintedGlass ? 'aptis-glass-subcard' : 'bg-white border border-slate-200 shadow-2xs'
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b pb-2.5 ${
                    tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                  }`}
                >
                  <h4
                    className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                      tintedGlass ? 'text-emerald-300' : 'text-slate-700'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
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
                        className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs ${
                          tintedGlass
                            ? 'bg-white/[0.04] border-white/[0.08]'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleToggleActionStatus(selectedMeetingDetail.id, a.id)}
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 cursor-pointer ${
                              a.status === 'completed'
                                ? 'bg-emerald-500 text-slate-950'
                                : tintedGlass
                                ? 'bg-white/[0.06] border border-white/30 hover:border-emerald-400'
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
                                  : tintedGlass
                                  ? 'text-white'
                                  : 'text-slate-900'
                              }`}
                            >
                              {a.title}
                            </span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              Responsável: <strong>{a.assigneeName}</strong> • Prazo: {a.dueDate}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                            a.status === 'completed'
                              ? tintedGlass
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-emerald-100 text-emerald-800'
                              : tintedGlass
                              ? 'bg-amber-500/20 text-amber-300'
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

              {selectedMeetingDetail.transcripts && selectedMeetingDetail.transcripts.length > 0 && (
                <div
                  className={`p-5 rounded-3xl space-y-3 ${
                    tintedGlass ? 'aptis-glass-subcard' : 'bg-white border border-slate-200 shadow-2xs'
                  }`}
                >
                  <h4
                    className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 border-b pb-2.5 ${
                      tintedGlass
                        ? 'text-cyan-300 border-white/[0.08]'
                        : 'text-slate-700 border-slate-100'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-cyan-400" />
                    4. Transcrição Completa das Falas Gravadas ({selectedMeetingDetail.transcripts.length})
                  </h4>
                  <div
                    className={`p-4 rounded-2xl border space-y-2.5 max-h-72 overflow-y-auto text-xs ${
                      tintedGlass
                        ? 'bg-slate-950/60 border-white/[0.08]'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {selectedMeetingDetail.transcripts.map(t => (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          tintedGlass
                            ? 'bg-white/[0.04] border-white/[0.08]'
                            : 'bg-white border-slate-200/80'
                        }`}
                      >
                        <span
                          className={`font-bold shrink-0 ${
                            t.speaker === 'manager'
                              ? tintedGlass
                                ? 'text-blue-300'
                                : 'text-blue-700'
                              : tintedGlass
                              ? 'text-emerald-300'
                              : 'text-emerald-700'
                          }`}
                        >
                          {t.speaker === 'manager' ? '👔' : '👤'} {t.speakerName} ({t.timestamp}):
                        </span>
                        <span className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>
                          {t.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`px-6 py-4 border-t flex items-center justify-between shrink-0 relative z-10 ${
                tintedGlass
                  ? 'border-white/[0.08] bg-white/[0.02]'
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-xs text-slate-400">
                Documento gerado pelo módulo <strong>Aptis 1:1</strong> • Pronto para impressão A4 / PDF
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handlePrintMeetingPDF(selectedMeetingDetail)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir Ata em PDF
                </button>
                <button
                  onClick={() => setSelectedMeetingDetail(null)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl cursor-pointer ${
                    tintedGlass
                      ? 'text-slate-300 hover:bg-white/[0.08] border border-white/[0.15]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE LIDERADO (EM LIQUID GLASS) */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl max-w-md w-full p-6 space-y-5 relative overflow-hidden ${
              tintedGlass
                ? 'aptis-glass-modal text-white'
                : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
            }`}
          >
            {tintedGlass && (
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
              />
            )}

            <div
              className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
              }`}
            >
              <h3 className="text-lg font-black">
                {editingMember ? 'Editar Liderado' : 'Cadastrar Novo Liderado'}
              </h3>
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs relative z-10">
              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-cyan-300' : 'text-slate-700'
                  }`}
                >
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marcos Oliveira"
                  value={memberName}
                  onChange={e => setMemberName(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Cargo / Função *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Técnico de Manutenção Sênior"
                  value={memberRole}
                  onChange={e => setMemberRole(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Setor / Departamento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Manutenção Industrial / Usinagem"
                  value={memberDepartment}
                  onChange={e => setMemberDepartment(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Status da Cadência 1:1
                </label>
                <select
                  value={memberStatus}
                  onChange={e => setMemberStatus(e.target.value as any)}
                  className={`w-full rounded-xl px-3.5 py-2.5 font-semibold cursor-pointer focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="up_to_date">🟢 Em Dia (&lt; 15 dias)</option>
                  <option value="attention">🟡 Atenção (15 a 30 dias)</option>
                  <option value="overdue">🔴 Atrasada (&gt; 30 dias)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className={`px-4 py-2.5 font-bold rounded-xl cursor-pointer ${
                    tintedGlass
                      ? 'text-slate-300 hover:bg-white/[0.08] border border-white/[0.15]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white font-bold rounded-xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
                  }}
                >
                  Salvar Liderado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO DE PERGUNTA ESTRATÉGICA (EM LIQUID GLASS) */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`rounded-3xl max-w-md w-full p-6 space-y-5 relative overflow-hidden ${
              tintedGlass
                ? 'aptis-glass-modal text-white'
                : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
            }`}
          >
            {tintedGlass && (
              <div
                className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
                style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }}
              />
            )}

            <div
              className={`flex items-center justify-between border-b pb-3 relative z-10 ${
                tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
              }`}
            >
              <h3 className="text-lg font-black">
                {editingQuestion ? 'Editar Pergunta 1:1' : 'Nova Pergunta Estratégica'}
              </h3>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs relative z-10">
              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-purple-300' : 'text-slate-700'
                  }`}
                >
                  Categoria
                </label>
                <select
                  value={qCategory}
                  onChange={e => setQCategory(e.target.value as any)}
                  className={`w-full rounded-xl px-3.5 py-2.5 font-semibold cursor-pointer focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="Alinhamento & Prioridades">Alinhamento & Prioridades</option>
                  <option value="Desafios & Bloqueios">Desafios & Bloqueios</option>
                  <option value="Feedback Bidirecional">Feedback Bidirecional</option>
                  <option value="Carreira & PDI">Carreira & PDI</option>
                  <option value="Bem-Estar & Clima">Bem-Estar & Clima</option>
                </select>
              </div>

              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Pergunta *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ex: Qual é o principal gargalo que está travando sua produtividade nesta semana?"
                  value={qText}
                  onChange={e => setQText(e.target.value)}
                  className={`w-full rounded-xl p-3 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Referência / Metodologia
                </label>
                <input
                  type="text"
                  placeholder="Ex: High Output Management / Radical Candor"
                  value={qSource}
                  onChange={e => setQSource(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`font-bold uppercase tracking-wider text-[11px] block mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Objetivo da Pergunta
                </label>
                <textarea
                  rows={2}
                  placeholder="Por que fazer esta pergunta durante o 1:1?"
                  value={qExplanation}
                  onChange={e => setQExplanation(e.target.value)}
                  className={`w-full rounded-xl p-3 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className={`px-4 py-2.5 font-bold rounded-xl cursor-pointer ${
                    tintedGlass
                      ? 'text-slate-300 hover:bg-white/[0.08] border border-white/[0.15]'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white font-bold rounded-xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
                  }}
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
