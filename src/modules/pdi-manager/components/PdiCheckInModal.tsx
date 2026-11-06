'use client';

import React, { useState, useEffect } from 'react';
import { EmployeePdi, PdiCheckIn } from '../types';
import { 
  X, 
  Calendar, 
  UserCheck, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Award 
} from 'lucide-react';

interface PdiCheckInModalProps {
  pdi: EmployeePdi;
  isOpen: boolean;
  onClose: () => void;
  onSaveCheckIn: (checkIn: PdiCheckIn, newProgress: number) => void;
  existingCheckIn?: PdiCheckIn | null;
}

export function PdiCheckInModal({
  pdi,
  isOpen,
  onClose,
  onSaveCheckIn,
  existingCheckIn
}: PdiCheckInModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reviewerName, setReviewerName] = useState('Danilo Henrique (Gestor)');
  const [evolutionPercent, setEvolutionPercent] = useState(pdi.progressPercent);
  const [summary, setSummary] = useState('');
  const [strengthsNoticed, setStrengthsNoticed] = useState('');
  const [blockersAndAdjustments, setBlockersAndAdjustments] = useState('');
  const [nextCheckInDate, setNextCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (!isOpen) return;
    if (existingCheckIn) {
      setDate(existingCheckIn.date);
      setReviewerName(existingCheckIn.reviewerName);
      setEvolutionPercent(existingCheckIn.evolutionPercent);
      setSummary(existingCheckIn.summary || '');
      setStrengthsNoticed(existingCheckIn.strengthsNoticed || '');
      setBlockersAndAdjustments(existingCheckIn.blockersAndAdjustments || '');
      setNextCheckInDate(existingCheckIn.nextCheckInDate || new Date().toISOString().split('T')[0]);
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setReviewerName('Danilo Henrique (Gestor)');
      setEvolutionPercent(pdi.progressPercent);
      setSummary('');
      setStrengthsNoticed('');
      setBlockersAndAdjustments('');
      const d = new Date();
      d.setDate(d.getDate() + 30);
      setNextCheckInDate(d.toISOString().split('T')[0]);
    }
  }, [isOpen, existingCheckIn, pdi.progressPercent]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    const savedCheckIn: PdiCheckIn = {
      id: existingCheckIn?.id || `chk-${Date.now()}`,
      pdiId: pdi.id,
      date,
      reviewerName: reviewerName.trim() || 'Gestor',
      evolutionPercent: Number(evolutionPercent),
      summary: summary.trim(),
      strengthsNoticed: strengthsNoticed.trim(),
      blockersAndAdjustments: blockersAndAdjustments.trim(),
      nextCheckInDate
    };

    onSaveCheckIn(savedCheckIn, Number(evolutionPercent));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="aptis-glass-modal rounded-3xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {existingCheckIn
                  ? 'Editar Check-in de Evolução do PDI'
                  : 'Registrar Check-in de Evolução do PDI'}
              </h3>
              <p className="text-xs text-slate-400">
                Colaborador: <span className="text-cyan-300 font-semibold">{pdi.employeeName}</span> ({pdi.employeeRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Data da Reunião de Acompanhamento</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Avaliador / Gestor</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Slider de Evolução Percentual */}
          <div className="p-4 aptis-glass-subcard rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                Nível de Evolução e Conclusão do PDI
              </span>
              <span className="text-base font-black font-mono text-cyan-300">
                {evolutionPercent}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={evolutionPercent}
              onChange={e => setEvolutionPercent(Number(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0% (Início)</span>
              <span>25% (Capacitação)</span>
              <span>50% (Prática em Andamento)</span>
              <span>75% (Autonomia Observada)</span>
              <span>100% (Pronto p/ Promoção)</span>
            </div>
          </div>

          {/* Resumo do Encontro */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Resumo do Encontro & Alinhamentos Chave <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Descreva os principais pontos conversados sobre o progresso das metas..."
              className="w-full aptis-glass-input rounded-xl p-3 focus:outline-none"
              required
            />
          </div>

          {/* Pontos Fortes Notados no Período */}
          <div>
            <label className="block text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Evoluções & Conquistas Notadas no Período
            </label>
            <textarea
              rows={2}
              value={strengthsNoticed}
              onChange={e => setStrengthsNoticed(e.target.value)}
              placeholder="Quais habilidades o colaborador colocou em prática com sucesso? Elogios e evidências..."
              className="w-full aptis-glass-input rounded-xl p-3 focus:outline-none"
            />
          </div>

          {/* Bloqueios e Ajustes de Rota */}
          <div>
            <label className="block text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Dificuldades, Bloqueios ou Ajustes de Rota
            </label>
            <textarea
              rows={2}
              value={blockersAndAdjustments}
              onChange={e => setBlockersAndAdjustments(e.target.value)}
              placeholder="O que travou a execução? Algum prazo precisa ser renegociado? Como o gestor apoiará?"
              className="w-full aptis-glass-input rounded-xl p-3 focus:outline-none"
            />
          </div>

          {/* Próximo Check-in */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Data Agendada para o Próximo Check-in</label>
            <div className="relative max-w-xs">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={nextCheckInDate}
                onChange={e => setNextCheckInDate(e.target.value)}
                className="w-full aptis-glass-input rounded-xl pl-9 pr-3 py-2 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Ações do Modal */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 border border-white/25 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)'
              }}
            >
              <Sparkles className="w-4 h-4" />
              {existingCheckIn ? 'Salvar Alterações do Check-in' : 'Salvar Check-in & Atualizar Evolução'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
