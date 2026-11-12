'use client';

import React, { useState } from 'react';
import { Sector, SkillStation, EmployeeSkillRecord, SkillLevel } from '../types';
import { X, UserPlus, User, Briefcase, Clock, Check } from 'lucide-react';

interface AddOperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  stations: SkillStation[];
  onAddOperator: (operator: EmployeeSkillRecord) => void;
  tintedGlass?: boolean;
}

export function AddOperatorModal({
  isOpen,
  onClose,
  sector,
  stations,
  onAddOperator,
  tintedGlass = false
}: AddOperatorModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Operador de Produção');
  const [shift, setShift] = useState('Turno A');
  const [initialLevels, setInitialLevels] = useState<Record<string, SkillLevel>>({});

  if (!isOpen) return null;

  const handleLevelChange = (stationId: string, level: SkillLevel) => {
    setInitialLevels(prev => ({ ...prev, [stationId]: level }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Fill defaults for stations
    const skillsMap: Record<string, SkillLevel> = {};
    stations.forEach(st => {
      skillsMap[st.id] = initialLevels[st.id] || 1;
    });

    const newOperator: EmployeeSkillRecord = {
      employeeId: `emp-${Date.now().toString().slice(-6)}`,
      sectorId: sector.id,
      employeeName: name.trim(),
      role: role.trim(),
      shift,
      skills: skillsMap
    };

    onAddOperator(newOperator);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200 ${
        tintedGlass
          ? 'aptis-glass-modal text-white'
          : 'bg-white text-slate-900 border border-slate-200'
      }`}>
        <button
          onClick={onClose}
          className={`absolute right-4 top-4 p-1.5 rounded-xl transition-colors cursor-pointer ${
            tintedGlass
              ? 'text-slate-400 hover:text-white hover:bg-white/10'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            tintedGlass
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600'
          }`}>
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              tintedGlass
                ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              Setor: {sector.name}
            </span>
            <h3 className={`text-lg font-bold leading-tight mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Cadastrar Colaborador na Matriz
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Nome Completo do Colaborador *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Ex: Gabriel Moreira"
                value={name}
                onChange={e => setName(e.target.value)}
                className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Função / Cargo
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Turno de Trabalho
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer ${
                    tintedGlass
                      ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                >
                  <option value="Turno A">Turno A (Manhã)</option>
                  <option value="Turno B">Turno B (Tarde/Noite)</option>
                  <option value="Turno C">Turno C (Madrugada)</option>
                  <option value="Turno Comercial">Comercial / Administrativo</option>
                </select>
              </div>
            </div>
          </div>

          {stations.length > 0 && (
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Nível Inicial por Posto (Opcional - Padrão N1)
              </label>
              <div className={`max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-xl border text-xs ${
                tintedGlass
                  ? 'bg-slate-900/60 border-white/10'
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {stations.map(st => (
                  <div key={st.id} className={`flex items-center justify-between p-1.5 rounded-lg border ${
                    tintedGlass
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white border-slate-100'
                  }`}>
                    <span className={`font-medium truncate max-w-[200px] ${tintedGlass ? 'text-slate-200' : 'text-slate-700'}`} title={st.name}>
                      {st.name}
                    </span>
                    <select
                      value={initialLevels[st.id] || 1}
                      onChange={e => handleLevelChange(st.id, parseInt(e.target.value) as SkillLevel)}
                      className={`text-xs border rounded-lg px-2 py-0.5 cursor-pointer ${
                        tintedGlass
                          ? 'bg-slate-800 border-white/15 text-white [&>option]:bg-slate-900'
                          : 'border-slate-200 bg-slate-50 text-slate-800'
                      }`}
                    >
                      <option value={1}>N1 - Aprendiz</option>
                      <option value={2}>N2 - Praticante</option>
                      <option value={3}>N3 - Autônomo</option>
                      <option value={4}>N4 - Multiplicador</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`flex items-center justify-end gap-2 pt-2 border-t ${
            tintedGlass ? 'border-white/10' : 'border-slate-100'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                tintedGlass
                  ? 'text-slate-300 hover:bg-white/10'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Adicionar Colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
