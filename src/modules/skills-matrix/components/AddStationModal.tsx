'use client';

import React, { useState } from 'react';
import { Sector, SkillStation } from '../types';
import { X, PlusCircle, Award, Sliders, Shield } from 'lucide-react';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  onAddStation: (station: SkillStation) => void;
}

export function AddStationModal({
  isOpen,
  onClose,
  sector,
  onAddStation
}: AddStationModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Operação Principal');
  const [minRequired, setMinRequired] = useState(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStation: SkillStation = {
      id: `st-${Date.now().toString().slice(-6)}`,
      sectorId: sector.id,
      name: name.trim(),
      category: category.trim(),
      minOperatorsRequired: Number(minRequired) || 1,
      targetLevel: 3
    };

    onAddStation(newStation);
    setName('');
    setMinRequired(2);
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Setor: {sector.name}
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
              Cadastrar Novo Posto / Competência
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Posto / Máquina / Competência *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Torno CNC Cabeçote Móvel"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Família Tecnológica / Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mínimo de Operadores Autônomos Requeridos *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={minRequired}
                onChange={e => setMinRequired(parseInt(e.target.value) || 1)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Quantidade mínima de operadores com nota &ge; N3.
              </span>
            </div>
          </div>

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
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
            >
              Adicionar Posto à Matriz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
