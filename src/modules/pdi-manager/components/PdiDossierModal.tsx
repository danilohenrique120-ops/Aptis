'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { EmployeePdi } from '../types';
import {
  X,
  Printer,
  FileCheck2,
  Award,
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Calendar,
  BookOpen,
  Users,
  Briefcase
} from 'lucide-react';

interface PdiDossierModalProps {
  pdi: EmployeePdi | null;
  isOpen: boolean;
  onClose: () => void;
}

type ReportPurpose = 'homologation' | 'collaborator_guide' | 'full_audit';

export function PdiDossierModal({ pdi, isOpen, onClose }: PdiDossierModalProps) {
  const [reportPurpose, setReportPurpose] = useState<ReportPurpose>('full_audit');
  const [showStrengthsAndGaps, setShowStrengthsAndGaps] = useState(true);
  const [showSmartAnalytics, setShowSmartAnalytics] = useState(true);
  const [showCheckInHistory, setShowCheckInHistory] = useState(true);
  const [showSignatures, setShowSignatures] = useState(true);
  const [customManagerOpinion, setCustomManagerOpinion] = useState('');

  // Analytics inteligentes calculados automaticamente a partir dos dados do PDI
  const analytics = useMemo(() => {
    if (!pdi) return null;

    const totalActions = pdi.actions.length;
    const doneActions = pdi.actions.filter(a => a.status === 'done');
    const doingActions = pdi.actions.filter(a => a.status === 'doing');
    const todoActions = pdi.actions.filter(a => a.status === 'todo' || a.status === 'blocked');

    const p70 = pdi.actions.filter(a => a.pillar === '70_practice');
    const p70Done = p70.filter(a => a.status === 'done');

    const p20 = pdi.actions.filter(a => a.pillar === '20_mentoring');
    const p20Done = p20.filter(a => a.status === 'done');

    const p10 = pdi.actions.filter(a => a.pillar === '10_courses');
    const p10Done = p10.filter(a => a.status === 'done');

    const pct70 = p70.length > 0 ? Math.round((p70Done.length / p70.length) * 100) : 0;
    const pct20 = p20.length > 0 ? Math.round((p20Done.length / p20.length) * 100) : 0;
    const pct10 = p10.length > 0 ? Math.round((p10Done.length / p10.length) * 100) : 0;

    const share70 = totalActions > 0 ? Math.round((p70.length / totalActions) * 100) : 0;
    const share20 = totalActions > 0 ? Math.round((p20.length / totalActions) * 100) : 0;
    const share10 = totalActions > 0 ? Math.round((p10.length / totalActions) * 100) : 0;

    // Índice Inteligente de Prontidão (Readiness Score 0-100)
    // Pondera progresso geral (50%), entrega prática 70% (30%) e cadência de check-ins (20%)
    const checkInScore = Math.min(100, pdi.checkIns.length * 35);
    const readinessScore = Math.round(
      pdi.progressPercent * 0.5 + pct70 * 0.3 + checkInScore * 0.2
    );

    let readinessLabel = 'Em Construção Inicial';
    let readinessColor = 'text-amber-700 bg-amber-50 border-amber-200';
    if (readinessScore >= 80 || pdi.progressPercent >= 85) {
      readinessLabel = 'Alta Prontidão (Apto para Homologação)';
      readinessColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    } else if (readinessScore >= 50 || pdi.progressPercent >= 50) {
      readinessLabel = 'Evolução Consistente (No Ritmo)';
      readinessColor = 'text-purple-700 bg-purple-50 border-purple-200';
    }

    // Parecer executivo sugerido automaticamente
    const defaultOpinion =
      pdi.progressPercent >= 80
        ? `O(a) colaborador(a) ${pdi.employeeName} apresenta excelente maturidade técnica e comportamental no ciclo ${pdi.cycleYear}, atingindo ${pdi.progressPercent}% de evolução global rumo à posição de ${pdi.targetRole} (${pdi.targetLevel}). As entregas práticas de chão de fábrica e evidências registradas demonstram prontidão para validação e homologação junto à liderança e RH.`
        : pdi.progressPercent >= 45
        ? `O(a) colaborador(a) ${pdi.employeeName} mantém evolução consistente (${pdi.progressPercent}% concluído) no plano de transição de ${pdi.employeeRole} para ${pdi.targetRole}. Recomenda-se manter a cadência de check-ins e priorizar a conclusão das entregas práticas (Pilar 70%) até ${pdi.targetEndDate}.`
        : `PDI estruturado para transição de ${pdi.employeeRole} (${pdi.currentLevel}) ao cargo alvo de ${pdi.targetRole} (${pdi.targetLevel}). O foco imediato deve ser o destravamento das metas práticas on-the-job com acompanhamento próximo do tutor/gestor responsável.`;

    const verificationCode = `APTIS-PDI-${pdi.id.slice(-5).toUpperCase()}-${pdi.cycleYear}`;

    return {
      totalActions,
      doneCount: doneActions.length,
      doingCount: doingActions.length,
      todoCount: todoActions.length,
      p70Count: p70.length,
      p70DoneCount: p70Done.length,
      pct70,
      p20Count: p20.length,
      p20DoneCount: p20Done.length,
      pct20,
      p10Count: p10.length,
      p10DoneCount: p10Done.length,
      pct10,
      share70,
      share20,
      share10,
      readinessScore,
      readinessLabel,
      readinessColor,
      defaultOpinion,
      verificationCode
    };
  }, [pdi]);

  useEffect(() => {
    if (analytics?.defaultOpinion) {
      setCustomManagerOpinion(analytics.defaultOpinion);
    }
  }, [analytics?.defaultOpinion]);

  if (!isOpen || !pdi || !analytics) return null;

  const handleSelectPurpose = (purpose: ReportPurpose) => {
    setReportPurpose(purpose);
    if (purpose === 'homologation') {
      setShowStrengthsAndGaps(true);
      setShowSmartAnalytics(true);
      setShowCheckInHistory(false);
      setShowSignatures(true);
    } else if (purpose === 'collaborator_guide') {
      setShowStrengthsAndGaps(true);
      setShowSmartAnalytics(false);
      setShowCheckInHistory(false);
      setShowSignatures(true);
    } else {
      setShowStrengthsAndGaps(true);
      setShowSmartAnalytics(true);
      setShowCheckInHistory(true);
      setShowSignatures(true);
    }
  };

  const purposeTitle =
    reportPurpose === 'homologation'
      ? 'DOSSIÊ EXECUTIVO DE HOMOLOGAÇÃO & PRONTIDÃO DE CARREIRA'
      : reportPurpose === 'collaborator_guide'
      ? 'GUIA INDIVIDUAL DE DESENVOLVIMENTO & METAS 70-20-10'
      : 'RELATÓRIO INTEGRAL DE EVIDÊNCIAS E AUDITORIA DE PDI';

  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank', 'width=1050,height=900');
    if (!printWindow) {
      alert('Permita pop-ups no navegador para gerar o PDF do PDI.');
      return;
    }

    const actionsHtml = pdi.actions
      .map((act, idx) => {
        const pillarLabel =
          act.pillar === '70_practice'
            ? '70% Prática On-the-Job'
            : act.pillar === '20_mentoring'
            ? '20% Mentoria & Shadowing'
            : '10% Formação & Cursos';

        const pillarBg =
          act.pillar === '70_practice'
            ? '#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe;'
            : act.pillar === '20_mentoring'
            ? '#eef2ff; color:#4338ca; border:1px solid #c7d2fe;'
            : '#ecfdf5; color:#047857; border:1px solid #a7f3d0;';

        const statusBadge =
          act.status === 'done'
            ? `<span style="background:#dcfce7; color:#15803d; border:1px solid #86efac; padding:2px 8px; border-radius:999px; font-weight:800; font-size:9px; text-transform:uppercase;">✓ Concluída ${
                act.completedAt ? `(${act.completedAt})` : ''
              }</span>`
            : act.status === 'doing'
            ? `<span style="background:#f3e8ff; color:#6d28d9; border:1px solid #d8b4fe; padding:2px 8px; border-radius:999px; font-weight:800; font-size:9px; text-transform:uppercase;">⟳ Em Execução</span>`
            : `<span style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:2px 8px; border-radius:999px; font-weight:700; font-size:9px; text-transform:uppercase;">○ Planejada</span>`;

        return `
          <tr>
            <td style="padding:9px 10px; border-bottom:1px solid #e2e8f0; font-weight:700; color:#334155; font-size:10px; width:28px; text-align:center;">
              #${idx + 1}
            </td>
            <td style="padding:9px 10px; border-bottom:1px solid #e2e8f0;">
              <div style="font-weight:700; color:#0f172a; font-size:11px; margin-bottom:3px;">${act.title}</div>
              <div style="font-size:10px; color:#475569;">
                <strong>Evidência Exigida:</strong> <em>${act.evidenceCriteria}</em>
              </div>
            </td>
            <td style="padding:9px 10px; border-bottom:1px solid #e2e8f0; width:135px;">
              <span style="display:inline-block; padding:2px 7px; border-radius:6px; font-size:9px; font-weight:700; background:${pillarBg}">
                ${pillarLabel}
              </span>
              <div style="font-size:9px; color:#64748b; margin-top:3px; font-weight:600;">${act.skillCategory}</div>
            </td>
            <td style="padding:9px 10px; border-bottom:1px solid #e2e8f0; font-size:10px; color:#334155; width:125px;">
              <div><strong>Tutor:</strong> ${act.mentorOrSupport}</div>
              <div style="color:#64748b; margin-top:2px;"><strong>Prazo:</strong> ${act.deadline}</div>
            </td>
            <td style="padding:9px 10px; border-bottom:1px solid #e2e8f0; text-align:right; width:115px;">
              ${statusBadge}
            </td>
          </tr>
        `;
      })
      .join('');

    const checkInsHtml =
      pdi.checkIns.length === 0
        ? `<div style="padding:12px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; font-size:10px; color:#64748b; text-align:center;">Nenhum check-in formal registrado até a emissão deste documento.</div>`
        : pdi.checkIns
            .map(
              (chk, i) => `
          <div style="padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; margin-bottom:8px; page-break-inside:avoid;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:800; font-size:10.5px; color:#0f172a;">
                #${pdi.checkIns.length - i} • Reunião de Check-in em ${chk.date} — Avaliador: ${chk.reviewerName}
              </span>
              <span style="background:#f3e8ff; color:#6d28d9; border:1px solid #d8b4fe; padding:1px 8px; border-radius:999px; font-size:9.5px; font-weight:800;">
                Evolução: ${chk.evolutionPercent}%
              </span>
            </div>
            <p style="margin:4px 0; font-size:10px; color:#334155; line-height:1.45;">${chk.summary}</p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:6px; font-size:9.5px;">
              ${
                chk.strengthsNoticed
                  ? `<div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:5px 8px; border-radius:6px; color:#065f46;"><strong>✓ Evidências/Avanços:</strong> ${chk.strengthsNoticed}</div>`
                  : ''
              }
              ${
                chk.blockersAndAdjustments
                  ? `<div style="background:#fffbeb; border:1px solid #fde68a; padding:5px 8px; border-radius:6px; color:#92400e;"><strong>⚠️ Ajustes de Rota:</strong> ${chk.blockersAndAdjustments}</div>`
                  : ''
              }
            </div>
          </div>
        `
            )
            .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Dossiê PDI - ${pdi.employeeName} (${pdi.cycleYear})</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 11mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            line-height: 1.4;
          }
          .header-banner {
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 65%, #3b0764 100%);
            color: #ffffff;
            padding: 18px 22px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
          }
          .badge-top {
            display: inline-block;
            background: rgba(168, 85, 247, 0.25);
            border: 1px solid rgba(216, 180, 254, 0.4);
            color: #e9d5ff;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 3px 9px;
            border-radius: 999px;
            margin-bottom: 6px;
          }
          .section-box {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 12px 14px;
            margin-bottom: 12px;
            background: #ffffff;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 10.5px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #4c1d95;
            margin: 0 0 8px 0;
            padding-bottom: 5px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            background: #f8fafc;
            color: #475569;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 7px 10px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <!-- CABEÇALHO CORPORATIVO DO DOSSIÊ -->
        <div class="header-banner">
          <div>
            <div class="badge-top">APTIS PDI • GESTÃO DE CARREIRA E EVIDÊNCIAS 70-20-10</div>
            <h1 style="margin:0; font-size:18px; font-weight:900; letter-spacing:-0.02em;">${pdi.employeeName}</h1>
            <p style="margin:3px 0 0 0; font-size:11px; color:#cbd5e1;">
              Cargo Atual: <strong style="color:#fff;">${pdi.employeeRole} (${pdi.currentLevel})</strong> • Setor: <strong style="color:#fff;">${pdi.department}</strong> • ${pdi.shift}
            </p>
            <div style="margin-top:6px; font-size:9.5px; color:#e9d5ff; font-weight:700;">
              FINALIDADE: ${purposeTitle}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); padding:8px 14px; border-radius:10px; display:inline-block;">
              <div style="font-size:9px; text-transform:uppercase; color:#cbd5e1; font-weight:700;">Evolução Consolidada</div>
              <div style="font-size:22px; font-weight:900; color:#a855f7; color:#e9d5ff; line-height:1.1;">${pdi.progressPercent}%</div>
              <div style="font-size:9px; color:#cbd5e1;">${analytics.doneCount} de ${analytics.totalActions} metas entregues</div>
            </div>
            <div style="font-size:8.5px; color:#94a3b8; margin-top:5px; font-family:monospace;">
              DOC ID: ${analytics.verificationCode} • Emissão: ${new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        <!-- QUADRO DE TRANSIÇÃO DE CARREIRA & CICLO -->
        <div style="display:grid; grid-template-columns: 1.2fr 1.2fr 1fr; gap:10px; margin-bottom:12px;">
          <div style="border:1px solid #e9d5ff; background:#faf5ff; border-radius:10px; padding:10px 12px;">
            <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#6b21a8;">Trajetória de Sucessão / Alvo</div>
            <div style="font-size:13px; font-weight:900; color:#0f172a; margin-top:2px;">${pdi.targetRole}</div>
            <div style="font-size:10px; color:#581c87; font-weight:600;">Nível Almejado: ${pdi.targetLevel}</div>
          </div>
          <div style="border:1px solid #e2e8f0; background:#f8fafc; border-radius:10px; padding:10px 12px;">
            <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#475569;">Objetivo Estratégico do Ciclo</div>
            <div style="font-size:10.5px; font-weight:600; color:#1e293b; margin-top:3px;">${pdi.careerGoal}</div>
          </div>
          <div style="border:1px solid #e2e8f0; background:#f8fafc; border-radius:10px; padding:10px 12px;">
            <div style="font-size:9px; font-weight:800; text-transform:uppercase; color:#475569;">Vigência & Homologação</div>
            <div style="font-size:11px; font-weight:800; color:#0f172a; margin-top:2px;">Ciclo ${pdi.cycleYear}</div>
            <div style="font-size:9.5px; color:#64748b;">Início: ${pdi.startDate} • Meta: <strong>${pdi.targetEndDate}</strong></div>
          </div>
        </div>

        ${
          showSmartAnalytics
            ? `
        <!-- DIAGNÓSTICO INTELIGENTE DE PRONTIDÃO & DISTRIBUIÇÃO 70-20-10 -->
        <div class="section-box" style="background:#fcfaff; border-color:#e9d5ff;">
          <div class="section-title">
            <span>⚡ Diagnóstico Inteligente de Prontidão & Metodologia 70-20-10</span>
            <span style="font-size:9.5px; background:#f3e8ff; color:#6b21a8; padding:2px 8px; border-radius:999px;">
              Índice de Prontidão: ${analytics.readinessScore}/100 (${analytics.readinessLabel})
            </span>
          </div>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:10px;">
            <div style="background:#ffffff; border:1px solid #dbeafe; border-radius:8px; padding:8px 10px;">
              <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#1d4ed8;">
                <span>70% PRÁTICA ON-THE-JOB</span>
                <span>${analytics.p70DoneCount}/${analytics.p70Count} (${analytics.pct70}%)</span>
              </div>
              <div style="width:100%; height:6px; background:#eff6ff; border-radius:999px; overflow:hidden; margin-top:5px;">
                <div style="width:${analytics.pct70}%; height:100%; background:#2563eb;"></div>
              </div>
            </div>
            <div style="background:#ffffff; border:1px solid #e0e7ff; border-radius:8px; padding:8px 10px;">
              <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#4338ca;">
                <span>20% MENTORIA & TROCA</span>
                <span>${analytics.p20DoneCount}/${analytics.p20Count} (${analytics.pct20}%)</span>
              </div>
              <div style="width:100%; height:6px; background:#eef2ff; border-radius:999px; overflow:hidden; margin-top:5px;">
                <div style="width:${analytics.pct20}%; height:100%; background:#4f46e5;"></div>
              </div>
            </div>
            <div style="background:#ffffff; border:1px solid #d1fae5; border-radius:8px; padding:8px 10px;">
              <div style="display:flex; justify-content:space-between; font-size:9.5px; font-weight:800; color:#047857;">
                <span>10% CURSOS & TEORIA</span>
                <span>${analytics.p10DoneCount}/${analytics.p10Count} (${analytics.pct10}%)</span>
              </div>
              <div style="width:100%; height:6px; background:#ecfdf5; border-radius:999px; overflow:hidden; margin-top:5px;">
                <div style="width:${analytics.pct10}%; height:100%; background:#059669;"></div>
              </div>
            </div>
          </div>
          <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:4px solid #7e22ce; border-radius:6px; padding:8px 11px; font-size:10px; color:#334155;">
            <strong style="color:#0f172a; display:block; margin-bottom:2px;">Parecer Técnico de Evolução e Prontidão:</strong>
            ${customManagerOpinion}
          </div>
        </div>
        `
            : ''
        }

        ${
          showStrengthsAndGaps
            ? `
        <!-- MAPA DE COMPETÊNCIAS: FORÇAS VS GAPS -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px; page-break-inside:avoid;">
          <div style="border:1px solid #a7f3d0; background:#f0fdf4; border-radius:10px; padding:10px 12px;">
            <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; color:#065f46; margin-bottom:6px;">
              ✓ Pontos Fortes Consolidados (Alavancas)
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:5px;">
              ${pdi.strengths
                .map(
                  s =>
                    `<span style="background:#ffffff; border:1px solid #6ee7b7; color:#065f46; padding:3px 8px; border-radius:6px; font-size:9.5px; font-weight:600;">✓ ${s}</span>`
                )
                .join('')}
            </div>
          </div>
          <div style="border:1px solid #fde68a; background:#fffbeb; border-radius:10px; padding:10px 12px;">
            <div style="font-size:9.5px; font-weight:800; text-transform:uppercase; color:#92400e; margin-bottom:6px;">
              🎯 Gaps Críticos Trabalhados no Ciclo
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:5px;">
              ${pdi.growthGaps
                .map(
                  g =>
                    `<span style="background:#ffffff; border:1px solid #fcd34d; color:#92400e; padding:3px 8px; border-radius:6px; font-size:9.5px; font-weight:600;">🎯 ${g}</span>`
                )
                .join('')}
            </div>
          </div>
        </div>
        `
            : ''
        }

        <!-- QUADRO DE METAS E EVIDÊNCIAS 70-20-10 -->
        <div class="section-box">
          <div class="section-title">
            <span>📋 Plano de Ação 70-20-10 & Critérios Objetivos de Evidência</span>
            <span style="font-size:9px; color:#64748b;">${analytics.doneCount} concluídas de ${analytics.totalActions} metas</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ação de Desenvolvimento & Evidência Comprobatória</th>
                <th>Pilar & Competência</th>
                <th>Tutor & Prazo</th>
                <th style="text-align:right;">Status / Validação</th>
              </tr>
            </thead>
            <tbody>
              ${actionsHtml}
            </tbody>
          </table>
        </div>

        ${
          showCheckInHistory
            ? `
        <!-- HISTÓRICO DE CHECK-INS E EVIDÊNCIAS REGISTRADAS -->
        <div class="section-box">
          <div class="section-title">
            <span>🗓️ Linha do Tempo de Check-ins & Evidências de Acompanhamento</span>
            <span style="font-size:9px; color:#64748b;">${pdi.checkIns.length} registros formais</span>
          </div>
          ${checkInsHtml}
        </div>
        `
            : ''
        }

        ${
          showSignatures
            ? `
        <!-- BLOCO DE ASSINATURAS E HOMOLOGAÇÃO FORMAL -->
        <div class="section-box" style="margin-top:16px; background:#f8fafc;">
          <div class="section-title">
            <span>✍️ Termo de Ciência, Compromisso e Homologação de Evidências</span>
            <span style="font-size:8.5px; color:#64748b;">Validade para Auditoria Interna / RH / Promoção</span>
          </div>
          <p style="font-size:9.5px; color:#475569; margin:0 0 24px 0;">
            Declaramos que as metas práticas (70%), mentorias (20%), treinamentos (10%) e respectivas evidências descritas neste Plano de Desenvolvimento Individual foram revisadas em conjunto entre liderança e colaborador(a).
          </p>
          <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:22px; text-align:center; padding-top:10px;">
            <div>
              <div style="border-top:1px solid #334155; padding-top:5px; font-size:10px; font-weight:800; color:#0f172a;">
                ${pdi.employeeName}
              </div>
              <div style="font-size:9px; color:#64748b;">Colaborador(a) • ${pdi.employeeRole}</div>
              <div style="font-size:8.5px; color:#94a3b8; margin-top:2px;">Data: ____/____/______</div>
            </div>
            <div>
              <div style="border-top:1px solid #334155; padding-top:5px; font-size:10px; font-weight:800; color:#0f172a;">
                Líder / Gestor Direto
              </div>
              <div style="font-size:9px; color:#64748b;">Responsável pelo Acompanhamento (${pdi.department})</div>
              <div style="font-size:8.5px; color:#94a3b8; margin-top:2px;">Data: ____/____/______</div>
            </div>
            <div>
              <div style="border-top:1px solid #334155; padding-top:5px; font-size:10px; font-weight:800; color:#0f172a;">
                Recursos Humanos / DHO
              </div>
              <div style="font-size:9px; color:#64748b;">Homologação de Carreira & Evidências</div>
              <div style="font-size:8.5px; color:#94a3b8; margin-top:2px;">Data: ____/____/______</div>
            </div>
          </div>
        </div>
        `
            : ''
        }
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="aptis-glass-modal rounded-3xl w-[96vw] max-w-[1440px] h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* TOP BAR EXECUTIVA DO GERADOR DE DOSSIÊ */}
        <div className="bg-slate-950/60 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/35">
                  Dossiê Inteligente & Exportação de Evidências
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {analytics.verificationCode}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
                Relatório Executivo de PDI • {pdi.employeeName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrintPdf}
              className="px-5 py-2.5 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-105 cursor-pointer border border-white/25"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 22px rgba(6, 182, 212, 0.45)'
              }}
            >
              <Printer className="w-4 h-4" />
              Baixar / Imprimir Dossiê em PDF (A4)
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CORPO DIVIDIDO: BARRA LATERAL DE PERSONALIZAÇÃO INTELIGENTE + PREVIEW INTERATIVO DA FOLHA A4 */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* COLUNA ESQUERDA (4 COLUNAS): CONFIGURAÇÃO INTELIGENTE DO DOCUMENTO */}
          <div className="lg:col-span-4 bg-slate-950/60 border-r border-white/10 p-5 overflow-y-auto space-y-5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                1. Escolha a Finalidade do Documento
              </h3>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectPurpose('full_audit')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    reportPurpose === 'full_audit'
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'aptis-glass-subcard hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Dossiê Completo de Evidências & Auditoria
                    </span>
                    {reportPurpose === 'full_audit' && (
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/35 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ideal para comprovação em auditorias (ISO/IATF), arquivo de RH e histórico completo com check-ins.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPurpose('homologation')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    reportPurpose === 'homologation'
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'aptis-glass-subcard hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Parecer Executivo para Promoção / Mérito
                    </span>
                    {reportPurpose === 'homologation' && (
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/35 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enxuto e direto para diretoria/comitê de gente avaliar prontidão e aprovar mudança de cargo.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPurpose('collaborator_guide')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    reportPurpose === 'collaborator_guide'
                      ? 'bg-cyan-500/15 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'aptis-glass-subcard hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-400" />
                      Guia Prático para Entregar ao Colaborador
                    </span>
                    {reportPurpose === 'collaborator_guide' && (
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 border border-cyan-400/35 px-2 py-0.5 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Focado nas metas 70-20-10, tutores, prazos e assinatura de compromisso no chão de fábrica.
                  </p>
                </button>
              </div>
            </div>

            {/* SEÇÕES INCLUÍDAS NO PDF */}
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3">
                2. Seções Visíveis no PDF
              </h3>
              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl aptis-glass-subcard cursor-pointer">
                  <span className="font-semibold text-slate-200">
                    Diagnóstico Inteligente & Índice de Prontidão
                  </span>
                  <input
                    type="checkbox"
                    checked={showSmartAnalytics}
                    onChange={e => setShowSmartAnalytics(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl aptis-glass-subcard cursor-pointer">
                  <span className="font-semibold text-slate-200">
                    Mapa de Pontos Fortes & Gaps Críticos
                  </span>
                  <input
                    type="checkbox"
                    checked={showStrengthsAndGaps}
                    onChange={e => setShowStrengthsAndGaps(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl aptis-glass-subcard cursor-pointer">
                  <span className="font-semibold text-slate-200">
                    Linha do Tempo de Check-ins ({pdi.checkIns.length})
                  </span>
                  <input
                    type="checkbox"
                    checked={showCheckInHistory}
                    onChange={e => setShowCheckInHistory(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl aptis-glass-subcard cursor-pointer">
                  <span className="font-semibold text-slate-200">
                    Termo de Homologação e Assinaturas (3 vias)
                  </span>
                  <input
                    type="checkbox"
                    checked={showSignatures}
                    onChange={e => setShowSignatures(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* PARECER EXECUTIVO EDITÁVEL */}
            {showSmartAnalytics && (
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    3. Parecer Técnico no Documento
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCustomManagerOpinion(analytics.defaultOpinion)}
                    className="text-[11px] text-cyan-300 hover:underline font-semibold cursor-pointer"
                  >
                    Restaurar texto automático
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={customManagerOpinion}
                  onChange={e => setCustomManagerOpinion(e.target.value)}
                  className="w-full text-xs aptis-glass-input rounded-xl p-3 focus:outline-none leading-relaxed"
                  placeholder="Escreva ou ajuste o parecer final do gestor para sair no PDF..."
                />
              </div>
            )}
          </div>

          {/* COLUNA DIREITA (8 COLUNAS): PREVIEW FIEL E INTERATIVO DO DOCUMENTO A4 */}
          <div className="lg:col-span-8 bg-slate-900/75 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-[850px] mx-auto bg-white rounded-2xl shadow-xl border border-slate-300 p-6 sm:p-9 space-y-6 text-slate-900">
              {/* BANNER EXECUTIVO DO DOCUMENTO */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-400/30">
                    APTIS PDI • GESTÃO DE CARREIRA E EVIDÊNCIAS 70-20-10
                  </span>
                  <h1 className="text-2xl font-black tracking-tight">{pdi.employeeName}</h1>
                  <p className="text-xs text-slate-300">
                    Cargo Atual:{' '}
                    <strong className="text-white">
                      {pdi.employeeRole} ({pdi.currentLevel})
                    </strong>{' '}
                    • Setor: <strong className="text-white">{pdi.department}</strong> • {pdi.shift}
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-purple-300 uppercase tracking-wide">
                    {purposeTitle}
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 inline-block">
                    <div className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                      Evolução Consolidada
                    </div>
                    <div className="text-3xl font-black text-purple-200 font-mono leading-tight">
                      {pdi.progressPercent}%
                    </div>
                    <div className="text-[11px] text-slate-300">
                      {analytics.doneCount} de {analytics.totalActions} metas entregues
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1.5">
                    ID: {analytics.verificationCode}
                  </div>
                </div>
              </div>

              {/* RESUMO DE CARREIRA & TRANSIÇÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200">
                  <span className="text-[10px] font-extrabold uppercase text-purple-800 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> Cargo Alvo da Sucessão
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">{pdi.targetRole}</div>
                  <div className="text-[11px] text-purple-700 font-semibold">
                    Nível Almejado: {pdi.targetLevel}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-600" /> Objetivo do Ciclo
                  </span>
                  <div className="text-xs font-semibold text-slate-800 mt-1 line-clamp-2">
                    {pdi.careerGoal}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" /> Vigência & Prazo
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">Ciclo {pdi.cycleYear}</div>
                  <div className="text-[11px] text-slate-600">
                    Início: {pdi.startDate} • Meta: <strong>{pdi.targetEndDate}</strong>
                  </div>
                </div>
              </div>

              {/* DIAGNÓSTICO INTELIGENTE 70-20-10 & ÍNDICE DE PRONTIDÃO */}
              {showSmartAnalytics && (
                <div className="p-4 rounded-2xl bg-purple-50/30 border border-purple-200 space-y-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Diagnóstico Inteligente de Prontidão & Trilha 70-20-10
                    </h3>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${analytics.readinessColor}`}
                    >
                      Índice de Prontidão: {analytics.readinessScore}/100 • {analytics.readinessLabel}
                    </span>
                  </div>

                  {/* Barras de Progresso por Pilar 70-20-10 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between font-bold text-blue-800 text-[11px]">
                        <span>70% Prática On-the-Job</span>
                        <span>
                          {analytics.p70DoneCount}/{analytics.p70Count} ({analytics.pct70}%)
                        </span>
                      </div>
                      <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${analytics.pct70}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between font-bold text-indigo-800 text-[11px]">
                        <span>20% Mentoria & Troca</span>
                        <span>
                          {analytics.p20DoneCount}/{analytics.p20Count} ({analytics.pct20}%)
                        </span>
                      </div>
                      <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${analytics.pct20}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-emerald-200">
                      <div className="flex items-center justify-between font-bold text-emerald-800 text-[11px]">
                        <span>10% Cursos & Teoria</span>
                        <span>
                          {analytics.p10DoneCount}/{analytics.p10Count} ({analytics.pct10}%)
                        </span>
                      </div>
                      <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${analytics.pct10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Parecer Técnico */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-l-4 border-l-purple-600 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 block mb-1">
                      Parecer Técnico de Evolução e Prontidão:
                    </strong>
                    {customManagerOpinion}
                  </div>
                </div>
              )}

              {/* FORÇAS E GAPS */}
              {showStrengthsAndGaps && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <h4 className="text-[11px] font-extrabold uppercase text-emerald-800 mb-2">
                      ✓ Pontos Fortes Consolidados (Alavancas)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {pdi.strengths.map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-semibold"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200">
                    <h4 className="text-[11px] font-extrabold uppercase text-amber-800 mb-2">
                      🎯 Gaps Críticos Trabalhados no Ciclo
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {pdi.growthGaps.map((g, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg text-[11px] font-semibold"
                        >
                          🎯 {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TABELA DE METAS E EVIDÊNCIAS 70-20-10 */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    Plano de Ação 70-20-10 & Critérios de Evidência
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {analytics.doneCount} concluídas de {analytics.totalActions} metas
                  </span>
                </div>

                <div className="divide-y divide-slate-200 text-xs">
                  {pdi.actions.map((act, index) => {
                    const isDone = act.status === 'done';
                    const isDoing = act.status === 'doing';
                    const pillarInfo =
                      act.pillar === '70_practice'
                        ? {
                            label: '70% Prática On-the-Job',
                            cls: 'bg-blue-50 text-blue-700 border-blue-200'
                          }
                        : act.pillar === '20_mentoring'
                        ? {
                            label: '20% Mentoria & Troca',
                            cls: 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          }
                        : {
                            label: '10% Cursos & Teoria',
                            cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          };

                    return (
                      <div
                        key={act.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-slate-400">
                              #{index + 1}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${pillarInfo.cls}`}
                            >
                              {pillarInfo.label}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {act.skillCategory}
                            </span>
                          </div>
                          <div className="font-bold text-slate-900">{act.title}</div>
                          <div className="text-[11px] text-slate-600">
                            <strong>Evidência Exigida:</strong> <em>{act.evidenceCriteria}</em> •{' '}
                            <strong>Tutor:</strong> {act.mentorOrSupport} •{' '}
                            <strong>Prazo:</strong> {act.deadline}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-extrabold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Concluída{' '}
                              {act.completedAt ? `(${act.completedAt})` : ''}
                            </span>
                          ) : isDoing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-[11px] font-extrabold">
                              <TrendingUp className="w-3.5 h-3.5" /> Em Execução
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-300 text-[11px] font-bold">
                              <Clock className="w-3.5 h-3.5" /> Planejada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HISTÓRICO DE CHECK-INS */}
              {showCheckInHistory && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-purple-600" />
                      Histórico de Check-ins e Validações de Evolução
                    </h3>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {pdi.checkIns.length} encontros registrados
                    </span>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {pdi.checkIns.length === 0 ? (
                      <div className="text-xs text-slate-500 italic text-center py-4">
                        Nenhum check-in registrado até o momento.
                      </div>
                    ) : (
                      pdi.checkIns.map((chk, idx) => (
                        <div
                          key={chk.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              #{pdi.checkIns.length - idx} • Check-in em {chk.date} — Avaliador:{' '}
                              {chk.reviewerName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-bold text-[11px]">
                              Evolução: {chk.evolutionPercent}%
                            </span>
                          </div>
                          <p className="text-slate-700">{chk.summary}</p>
                          {(chk.strengthsNoticed || chk.blockersAndAdjustments) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                              {chk.strengthsNoticed && (
                                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                                  <strong>✓ Avanços Validados:</strong> {chk.strengthsNoticed}
                                </div>
                              )}
                              {chk.blockersAndAdjustments && (
                                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                                  <strong>⚠️ Ajustes de Rota:</strong> {chk.blockersAndAdjustments}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TERMO DE ASSINATURAS E HOMOLOGAÇÃO */}
              {showSignatures && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      ✍️ Termo de Ciência, Compromisso e Homologação de Evidências
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Declaramos que as metas práticas (70%), mentorias (20%), treinamentos (10%) e respectivas evidências descritas neste Plano de Desenvolvimento Individual foram revisadas em conjunto.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-center text-xs">
                    <div className="border-t border-slate-400 pt-2">
                      <div className="font-bold text-slate-900">{pdi.employeeName}</div>
                      <div className="text-[11px] text-slate-500">
                        Colaborador(a) • {pdi.employeeRole}
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-2">
                      <div className="font-bold text-slate-900">Líder / Gestor Direto</div>
                      <div className="text-[11px] text-slate-500">
                        Responsável ({pdi.department})
                      </div>
                    </div>
                    <div className="border-t border-slate-400 pt-2">
                      <div className="font-bold text-slate-900">Recursos Humanos / DHO</div>
                      <div className="text-[11px] text-slate-500">Homologação & Evidências</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
