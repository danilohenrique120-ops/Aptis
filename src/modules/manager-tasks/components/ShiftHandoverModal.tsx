'use client';

import React, { useState, useEffect } from 'react';
import { ManagerTask, ShiftHandoverData } from '../types';
import {
  X,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ShiftHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: ManagerTask[];
  selectedSector: string;
}

export const ShiftHandoverModal: React.FC<ShiftHandoverModalProps> = ({
  isOpen,
  onClose,
  tasks,
  selectedSector
}) => {
  const [formData, setFormData] = useState<ShiftHandoverData>({
    fromShift: 'Turno A (06:00 - 14:00)',
    toShift: 'Turno B (14:00 - 22:00)',
    supervisorOut: 'Carlos Silveira',
    supervisorIn: 'Mariana Souza',
    date: new Date().toISOString().split('T')[0],
    sector: selectedSector === 'all' ? 'Todas as Áreas / Geral' : selectedSector,
    generalNotes:
      'Produção rodou dentro da meta de OEE (87%). Nenhuma quebra crítica nas células principais.',
    criticalIssues:
      'Célula 03 requer monitoramento de aquecimento do motor da esteira principal.'
  });

  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [tintedGlass, setTintedGlass] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setTintedGlass(customEvent.detail);
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  if (!isOpen) return null;

  // Filter tasks relevant for the sector (or all)
  const sectorTasks =
    selectedSector === 'all'
      ? tasks
      : tasks.filter(
          t =>
            t.sector.toLowerCase().includes(selectedSector.toLowerCase()) ||
            selectedSector.toLowerCase().includes(t.sector.toLowerCase())
        );

  const doneTasks = sectorTasks.filter(t => t.status === 'done');
  const inProgressTasks = sectorTasks.filter(
    t => t.status === 'in_progress' || t.status === 'review'
  );
  const criticalTasks = sectorTasks.filter(
    t => (t.priority === 'critical' || t.priority === 'high') && t.status !== 'done'
  );

  const generateReportText = () => {
    return `📋 *RELATÓRIO DE PASSAGEM DE TURNO - APTIS ROUTINE*
📅 Data: ${formatDate(formData.date)}
🏭 Setor: ${formData.sector}
🔄 Transição: ${formData.fromShift} ➡️ ${formData.toShift}
👤 Supervisor Saindo: ${formData.supervisorOut}
👤 Supervisor Entrando: ${formData.supervisorIn}

----------------------------------------
✅ *TAREFAS CONCLUÍDAS NO TURNO (${doneTasks.length}):*
${
  doneTasks.length > 0
    ? doneTasks.map(t => `  • [${t.sector}] ${t.title} (Resp: ${t.assignee})`).join('\n')
    : '  • Nenhuma tarefa finalizada neste período'
}

⏳ *TAREFAS EM ANDAMENTO / REPASSADAS (${inProgressTasks.length}):*
${
  inProgressTasks.length > 0
    ? inProgressTasks
        .map(
          t =>
            `  • [${t.sector}] ${t.title} - Prazo: ${formatDate(t.dueDate)} (Resp: ${t.assignee})`
        )
        .join('\n')
    : '  • Nenhuma demanda em andamento'
}

⚠️ *ALERTAS CRÍTICOS & IMPEDITIVOS:*
${
  criticalTasks.length > 0
    ? criticalTasks
        .map(t => `  🚨 [CRÍTICO] ${t.title} - ${t.description || 'Sem detalhes'}`)
        .join('\n')
    : '  • Sem pendências críticas'
}
${formData.criticalIssues ? `  📝 Nota de Risco: ${formData.criticalIssues}` : ''}

📝 *NOTAS GERAIS:*
${formData.generalNotes || 'Sem observações adicionais.'}
----------------------------------------
Relatório emitido via Aptis Routine | Aptis: A fábrica sempre apta.`;
  };

  const handleCopyReport = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  const handleConfirmHandover = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  const inputClass = tintedGlass
    ? 'aptis-glass-input rounded-xl'
    : 'bg-white text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-3xl max-w-3xl w-full p-6 my-8 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
          tintedGlass
            ? 'aptis-glass-modal text-white'
            : 'bg-white text-slate-900 shadow-2xl border border-slate-200'
        }`}
      >
        {tintedGlass && (
          <div
            className="absolute -top-20 -right-16 w-72 h-72 rounded-full opacity-35 blur-3xl pointer-events-none"
            style={{
              background:
                'radial-gradient(circle, rgba(37, 99, 235, 0.75) 0%, rgba(6, 182, 212, 0.3) 60%, transparent 75%)'
            }}
          />
        )}

        {/* Header */}
        <div
          className={`relative z-10 flex items-center justify-between pb-4 border-b ${
            tintedGlass ? 'border-white/[0.1]' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                tintedGlass
                  ? 'aptis-glass-subcard text-cyan-300'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">Passagem de Turno Industrial</h2>
              <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Alinhamento e consolidação de pendências operacionais entre turnos de produção.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/[0.08]'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="relative z-10 space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Turnos e Supervisores */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl ${
              tintedGlass
                ? 'aptis-glass-subcard'
                : 'bg-slate-50 border border-slate-200'
            }`}
          >
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Turno Saindo
              </label>
              <select
                value={formData.fromShift}
                onChange={e => setFormData({ ...formData, fromShift: e.target.value })}
                className={`w-full text-xs p-2.5 cursor-pointer ${inputClass}`}
              >
                <option value="Turno A (06:00 - 14:00)">Turno A (06:00 - 14:00)</option>
                <option value="Turno B (14:00 - 22:00)">Turno B (14:00 - 22:00)</option>
                <option value="Turno C (22:00 - 06:00)">Turno C (22:00 - 06:00)</option>
                <option value="Turno Administrativo (08:00 - 17:30)">
                  Turno Administrativo (08:00 - 17:30)
                </option>
              </select>
            </div>
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Turno Entrando
              </label>
              <select
                value={formData.toShift}
                onChange={e => setFormData({ ...formData, toShift: e.target.value })}
                className={`w-full text-xs p-2.5 cursor-pointer ${inputClass}`}
              >
                <option value="Turno B (14:00 - 22:00)">Turno B (14:00 - 22:00)</option>
                <option value="Turno C (22:00 - 06:00)">Turno C (22:00 - 06:00)</option>
                <option value="Turno A (06:00 - 14:00)">Turno A (06:00 - 14:00)</option>
                <option value="Turno Administrativo (08:00 - 17:30)">
                  Turno Administrativo (08:00 - 17:30)
                </option>
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Supervisor (Saindo)
              </label>
              <input
                type="text"
                value={formData.supervisorOut}
                onChange={e => setFormData({ ...formData, supervisorOut: e.target.value })}
                className={`w-full text-xs p-2.5 ${inputClass}`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Supervisor (Assumindo)
              </label>
              <input
                type="text"
                value={formData.supervisorIn}
                onChange={e => setFormData({ ...formData, supervisorIn: e.target.value })}
                className={`w-full text-xs p-2.5 ${inputClass}`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className={`w-full text-xs p-2.5 ${inputClass}`}
              />
            </div>
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Área / Escopo
              </label>
              <input
                type="text"
                value={formData.sector}
                onChange={e => setFormData({ ...formData, sector: e.target.value })}
                className={`w-full text-xs p-2.5 ${inputClass}`}
              />
            </div>
          </div>

          {/* Resumo Automático de Entregas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className={`p-3.5 rounded-2xl border ${
                tintedGlass
                  ? 'bg-emerald-500/15 border-emerald-400/30'
                  : 'bg-emerald-50/60 border-emerald-200'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-emerald-300' : 'text-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Concluídas no Turno: {doneTasks.length}</span>
              </div>
              <ul
                className={`text-[11px] space-y-1 max-h-24 overflow-y-auto ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {doneTasks.length === 0 ? (
                  <li className="italic opacity-60">Nenhuma concluída</li>
                ) : (
                  doneTasks.map(t => (
                    <li key={t.id} className="truncate">
                      • {t.title}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                tintedGlass
                  ? 'bg-cyan-500/15 border-cyan-400/30'
                  : 'bg-blue-50/60 border-blue-200'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-cyan-300' : 'text-blue-800'
                }`}
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Em Andamento: {inProgressTasks.length}</span>
              </div>
              <ul
                className={`text-[11px] space-y-1 max-h-24 overflow-y-auto ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {inProgressTasks.length === 0 ? (
                  <li className="italic opacity-60">Nenhuma demanda ativa</li>
                ) : (
                  inProgressTasks.map(t => (
                    <li key={t.id} className="truncate">
                      • {t.title}
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div
              className={`p-3.5 rounded-2xl border ${
                tintedGlass
                  ? 'bg-rose-500/15 border-rose-400/30'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-xs font-bold mb-1 ${
                  tintedGlass ? 'text-rose-300' : 'text-rose-800'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Impeditivos Críticos: {criticalTasks.length}</span>
              </div>
              <ul
                className={`text-[11px] space-y-1 max-h-24 overflow-y-auto ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {criticalTasks.length === 0 ? (
                  <li className="italic text-emerald-400">Sem impeditivos críticos ✅</li>
                ) : (
                  criticalTasks.map(t => (
                    <li key={t.id} className="truncate font-medium text-rose-300">
                      • {t.title}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>

          {/* Notas de Alerta Crítico */}
          <div>
            <label
              className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                tintedGlass ? 'text-rose-300' : 'text-rose-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Alertas e Risco de Parada de Máquina para o Próximo Turno
            </label>
            <textarea
              rows={2}
              value={formData.criticalIssues}
              onChange={e => setFormData({ ...formData, criticalIssues: e.target.value })}
              placeholder="Ex: Prensagem 02 aguardando ferramentaria às 15:30. Atenção para ajuste fino."
              className={`w-full text-xs p-2.5 ${inputClass}`}
            />
          </div>

          {/* Observações Gerais */}
          <div>
            <label
              className={`block text-xs font-bold mb-1.5 ${
                tintedGlass ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              Observações Gerais & Recados
            </label>
            <textarea
              rows={3}
              value={formData.generalNotes}
              onChange={e => setFormData({ ...formData, generalNotes: e.target.value })}
              placeholder="Ex: Equipe operou com 1 faltante, rebalanceado com apoio da linha 02..."
              className={`w-full text-xs p-2.5 ${inputClass}`}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t ${
            tintedGlass ? 'border-white/[0.1]' : 'border-slate-200'
          }`}
        >
          <button
            onClick={handleCopyReport}
            type="button"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
              tintedGlass
                ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copiado para Área de Transferência!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copiar Resumo Formatado (WhatsApp/Teams)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              type="button"
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                tintedGlass
                  ? 'text-slate-300 hover:text-white hover:bg-white/[0.08]'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Fechar
            </button>
            <button
              onClick={handleConfirmHandover}
              disabled={confirmed}
              type="button"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl transition-all cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                border: '1px solid rgba(165, 243, 252, 0.45)',
                boxShadow:
                  'inset 0 1px 0 rgba(255,255,255,0.35), 0 8px 20px -4px rgba(37, 99, 235, 0.5)'
              }}
            >
              {confirmed ? (
                <>
                  <Check className="w-4 h-4" />
                  Passagem Registrada!
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Assinar e Finalizar Passagem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
