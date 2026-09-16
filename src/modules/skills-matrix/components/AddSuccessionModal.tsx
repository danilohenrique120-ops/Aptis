'use client';

import React, { useState } from 'react';
import { Sector, EmployeeSkillRecord, SuccessionPlan, SuccessionReadiness, VacancyRisk, PositionCategory } from '../types';
import { X, UserCheck, ShieldAlert, Sparkles, Award } from 'lucide-react';

interface AddSuccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  employees: EmployeeSkillRecord[];
  onAddSuccession: (plan: SuccessionPlan) => void;
}

export function AddSuccessionModal({
  isOpen,
  onClose,
  sector,
  employees,
  onAddSuccession
}: AddSuccessionModalProps) {
  const [keyPosition, setKeyPosition] = useState('');
  const [positionCategory, setPositionCategory] = useState<PositionCategory>('leadership');
  const [currentIncumbent, setCurrentIncumbent] = useState(sector.managerName);
  const [currentIncumbentRole, setCurrentIncumbentRole] = useState(sector.managerRole);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [customSuccessorName, setCustomSuccessorName] = useState('');
  const [readiness, setReadiness] = useState<SuccessionReadiness>('ready_medium');
  const [readinessScore, setReadinessScore] = useState(70);
  const [vacancyRisk, setVacancyRisk] = useState<VacancyRisk>('medium');
  const [developmentPlan, setDevelopmentPlan] = useState('');
  const [gapsInput, setGapsInput] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [mentorName, setMentorName] = useState(sector.managerName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyPosition.trim()) return;

    let finalSuccessorName = customSuccessorName;
    if (selectedEmployeeId) {
      const found = employees.find(e => e.employeeId === selectedEmployeeId);
      if (found) finalSuccessorName = found.employeeName;
    }

    if (!finalSuccessorName.trim() && readiness !== 'none') {
      alert('Por favor, indique um sucessor ou marque o status como "Sem Sucessor Mapeado"');
      return;
    }

    const gaps = gapsInput
      .split(',')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    const newPlan: SuccessionPlan = {
      id: `succ-${Date.now()}`,
      sectorId: sector.id,
      keyPosition: keyPosition.trim(),
      positionCategory,
      currentIncumbent: currentIncumbent.trim(),
      currentIncumbentRole: currentIncumbentRole.trim(),
      successorId: selectedEmployeeId || undefined,
      successorName: readiness === 'none' ? 'Nenhum Sucessor Mapeado' : finalSuccessorName.trim(),
      readiness,
      readinessScore: readiness === 'none' ? 0 : Number(readinessScore),
      vacancyRisk,
      developmentPlan: developmentPlan.trim() || 'Plano de desenvolvimento individual a ser estruturado.',
      competencyGaps: gaps.length > 0 ? gaps : ['Alinhamento de rotinas de liderança'],
      targetDate: targetDate || '2026-12-31',
      mentorName: mentorName.trim() || sector.managerName
    };

    onAddSuccession(newPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Mapear Sucessão & Plano de Desenvolvimento</h3>
              <p className="text-xs text-slate-300">Setor: {sector.name} ({sector.code})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Cargo / Posição Crítica */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cargo / Posição Chave *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Supervisor de Produção, Líder de Turno..."
                value={keyPosition}
                onChange={e => setKeyPosition(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Categoria da Posição
              </label>
              <select
                value={positionCategory}
                onChange={e => setPositionCategory(e.target.value as PositionCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="leadership">Liderança & Supervisão (Gestão)</option>
                <option value="technical_specialist">Especialista Técnico Chave</option>
                <option value="critical_operator">Operador de Posto Crítico</option>
              </select>
            </div>
          </div>

          {/* Ocupante Atual / Gestor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gestor / Titular Atual
              </label>
              <input
                type="text"
                value={currentIncumbent}
                onChange={e => setCurrentIncumbent(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Função Atual do Gestor
              </label>
              <input
                type="text"
                value={currentIncumbentRole}
                onChange={e => setCurrentIncumbentRole(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Sucessor Indicado */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-semibold text-slate-700">
                Sucessor Mapeado (Talento a Desenvolver)
              </label>
              <span className="text-[10px] text-indigo-600 font-medium">Selecione da equipe ou digite</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedEmployeeId}
                  onChange={e => {
                    setSelectedEmployeeId(e.target.value);
                    if (e.target.value) setCustomSuccessorName('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="">-- Selecionar Operador do Setor --</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} ({emp.role} - {emp.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Ou digite o nome do sucessor..."
                  value={customSuccessorName}
                  disabled={Boolean(selectedEmployeeId)}
                  onChange={e => setCustomSuccessorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Nível de Prontidão & Risco de Vacância */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nível de Prontidão
              </label>
              <select
                value={readiness}
                onChange={e => {
                  const val = e.target.value as SuccessionReadiness;
                  setReadiness(val);
                  if (val === 'ready_now') setReadinessScore(95);
                  else if (val === 'ready_medium') setReadinessScore(70);
                  else if (val === 'in_development') setReadinessScore(45);
                  else setReadinessScore(0);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer font-medium"
              >
                <option value="ready_now">🟢 Pronto Imediato (0-3 meses)</option>
                <option value="ready_medium">🟡 Médio Prazo (3-12 meses)</option>
                <option value="in_development">🔵 Em Formação (1-2 anos)</option>
                <option value="none">🔴 Sem Sucessor (Risco Alto)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Aptidão Atual: <strong className="text-indigo-600">{readinessScore}%</strong>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={readinessScore}
                disabled={readiness === 'none'}
                onChange={e => setReadinessScore(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer mt-2"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Risco de Vacância
              </label>
              <select
                value={vacancyRisk}
                onChange={e => setVacancyRisk(e.target.value as VacancyRisk)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white cursor-pointer font-medium"
              >
                <option value="low">Baixo (Célula estável com backup)</option>
                <option value="medium">Médio (Em preparação)</option>
                <option value="high">Alto (Impacto severo na produção)</option>
                <option value="critical">Crítico (Sem backup / Ponto único)</option>
              </select>
            </div>
          </div>

          {/* Plano de Desenvolvimento Individual (PDI) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Plano de Desenvolvimento Individual (PDI) / Ações de Capacitação
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Mentoria semanal com o coordenador, curso de liderança operacional Lean, rotação em postos críticos N4..."
              value={developmentPlan}
              onChange={e => setDevelopmentPlan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Gaps de Competências e Data Alvo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gaps de Competência (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Gestão de Pessoas, Leitura de Desenho, Kamishibai"
                value={gapsInput}
                onChange={e => setGapsInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Data Prevista de Prontidão Total
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Salvar Mapeamento de Sucessão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
