'use client';

import React, { useState } from 'react';
import { TrainingRecord } from '../types';
import { 
  X, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';

interface TrainingBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainings: TrainingRecord[];
  onBatchScheduled?: (course: string, employeeNames: string[]) => void;
}

const COURSES_AVAILABLE = [
  { code: 'NR-10', name: 'NR-10 Segurança em Instalações Elétricas', hours: '40h / Reciclagem 16h' },
  { code: 'NR-35', name: 'NR-35 Trabalho em Altura', hours: '8h' },
  { code: 'NR-12', name: 'NR-12 Segurança em Máquinas e Equipamentos', hours: '16h' },
  { code: 'NR-11', name: 'NR-11 Operação Segura de Empilhadeiras', hours: '16h' },
  { code: 'NR-33', name: 'NR-33 Espaços Confinados', hours: '16h' },
  { code: 'POP-001', name: 'POP-001 Setup e Troca de Ferramenta CNC', hours: '4h' },
  { code: 'POP-012', name: 'POP-012 Soldagem MIG/MAG e Gabaritos', hours: '6h' },
  { code: 'POP-025', name: 'POP-025 Bloqueio e Etiquetagem LOTO', hours: '4h' }
];

export const TrainingBatchModal: React.FC<TrainingBatchModalProps> = ({
  isOpen,
  onClose,
  trainings,
  onBatchScheduled
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState('NR-35');
  const [batchDate, setBatchDate] = useState('2026-09-25');
  const [batchTime, setBatchTime] = useState('08:00 - 17:00');
  const [instructor, setInstructor] = useState('Eng. Marcelo Dias (SST / SESI)');
  const [location, setLocation] = useState('Sala de Treinamento Técnico 02 - Bloco Fabril');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const currentCourse = COURSES_AVAILABLE.find(c => c.code === selectedCourseCode) || COURSES_AVAILABLE[0];

  // Eligible employees: records with this course expired or expiring soon, or operators without it
  const relevantRecords = trainings.filter(t => t.code === selectedCourseCode || t.courseName.includes(selectedCourseCode));
  
  // Set default selection if empty
  const pendingEmployees = relevantRecords.filter(r => getDaysUntil(r.expiryDate) <= 60);

  const toggleEmployee = (name: string) => {
    setSelectedEmployees(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleSelectAllPending = () => {
    setSelectedEmployees(pendingEmployees.map(p => p.employeeName));
  };

  const generateConvocacaoText = () => {
    const list = selectedEmployees.length > 0 
      ? selectedEmployees.map(n => `  👤 ${n}`).join('\n')
      : '  (Nenhum colaborador selecionado)';

    return `📢 *CONVOCAÇÃO OFICIAL DE TREINAMENTO / RECICLAGEM*
🎓 *Curso / Norma:* ${currentCourse.name}
⏱️ *Carga Horária:* ${currentCourse.hours}
📅 *Data:* ${formatDate(batchDate)} (${batchTime})
📍 *Local:* ${location}
👨‍🏫 *Instrutor:* ${instructor}

👥 *COLABORADORES CONVOCADOS (${selectedEmployees.length}):*
${list}

⚠️ *Atenção:* A presença é obrigatória para manutenção da aptidão operacional conforme normas do MTE e procedimentos internos da fábrica. Favor alinhar folga/substituição de posto com o supervisor de turno.`;
  };

  const handleCopy = async () => {
    const text = generateConvocacaoText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  const handleConfirm = () => {
    setConfirmed(true);
    if (onBatchScheduled) {
      onBatchScheduled(currentCourse.name, selectedEmployees);
    }
    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Montar Turma de Treinamento / Reciclagem</h2>
              <p className="text-xs text-slate-500">
                Agrupamento automático de colaboradores e geração de convocação oficial em 1 clique.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Seleção de Curso */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione a NR ou POP da Turma</label>
            <select
              value={selectedCourseCode}
              onChange={e => {
                setSelectedCourseCode(e.target.value);
                setSelectedEmployees([]);
              }}
              className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            >
              {COURSES_AVAILABLE.map(c => (
                <option key={c.code} value={c.code}>
                  [{c.code}] {c.name} ({c.hours})
                </option>
              ))}
            </select>
          </div>

          {/* Dados do Agendamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Data do Treinamento
              </label>
              <input
                type="date"
                value={batchDate}
                onChange={e => setBatchDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Horário Previsto
              </label>
              <input
                type="text"
                value={batchTime}
                onChange={e => setBatchTime(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instrutor / Entidade Habilitada</label>
              <input
                type="text"
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Local / Sala
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Seleção de Colaboradores */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Colaboradores Elegíveis / A Vencer ({pendingEmployees.length})
              </span>
              <button
                type="button"
                onClick={handleSelectAllPending}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                Selecionar Todos a Vencer
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {relevantRecords.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Nenhum colaborador com pendência para esta norma no momento.
                </p>
              ) : (
                relevantRecords.map(r => {
                  const days = getDaysUntil(r.expiryDate);
                  const isSelected = selectedEmployees.includes(r.employeeName);
                  const isExpired = days < 0;
                  const isExpiring = days >= 0 && days <= 60;

                  return (
                    <label
                      key={r.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-blue-50/80 border-blue-300 font-medium text-blue-900' 
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleEmployee(r.employeeName)}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{r.employeeName}</span>
                        <span className="text-[10px] text-slate-400">({r.department})</span>
                      </div>

                      <div className="text-[10px] font-bold">
                        {isExpired ? (
                          <span className="text-rose-600 font-bold">🔴 Vencido ({Math.abs(days)}d)</span>
                        ) : isExpiring ? (
                          <span className="text-amber-700 font-bold">🟡 Vence em {days}d</span>
                        ) : (
                          <span className="text-emerald-700">🟢 Válido</span>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={handleCopy}
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Convocação Copiada com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>Copiar Convocação (WhatsApp / Teams)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirmed || selectedEmployees.length === 0}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {confirmed ? (
                <>
                  <Check className="w-4 h-4" />
                  Turma Agendada!
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  Confirmar Turma ({selectedEmployees.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
