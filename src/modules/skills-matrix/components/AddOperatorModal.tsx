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
}

export function AddOperatorModal({
  isOpen,
  onClose,
  sector,
  stations,
  onAddOperator
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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Setor: {sector.name}
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
              Cadastrar Colaborador na Matriz
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Função / Cargo
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Turno de Trabalho
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={shift}
                  onChange={e => setShift(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none cursor-pointer"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nível Inicial por Posto (Opcional - Padrão N1)
              </label>
              <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                {stations.map(st => (
                  <div key={st.id} className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-100">
                    <span className="font-medium text-slate-700 truncate max-w-[200px]" title={st.name}>
                      {st.name}
                    </span>
                    <select
                      value={initialLevels[st.id] || 1}
                      onChange={e => handleLevelChange(st.id, parseInt(e.target.value) as SkillLevel)}
                      className="text-xs border border-slate-200 rounded px-2 py-0.5 bg-slate-50"
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

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
            >
              Adicionar Colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
