'use client';

import React, { useState } from 'react';
import { Sector, SkillStation } from '../types';
import { X, PlusCircle, Award, Sliders, Shield } from 'lucide-react';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  onAddStation: (station: SkillStation) => void;
  tintedGlass?: boolean;
}

export function AddStationModal({
  isOpen,
  onClose,
  sector,
  onAddStation,
  tintedGlass = false
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
              ? 'bg-blue-500/20 border-blue-500/30 text-cyan-400'
              : 'bg-blue-50 border-blue-200 text-blue-600'
          }`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
              tintedGlass
                ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
                : 'text-blue-600 bg-blue-50 border-blue-200'
            }`}>
              Setor: {sector.name}
            </span>
            <h3 className={`text-lg font-bold leading-tight mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Cadastrar Novo Posto / Competência
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Nome do Posto / Máquina / Competência *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Torno CNC Cabeçote Móvel"
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Família Tecnológica / Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Mínimo de Operadores Autônomos Requeridos *
              </label>
              <input
                type="number"
                min={1}
                max={10}
                required
                value={minRequired}
                onChange={e => setMinRequired(parseInt(e.target.value) || 1)}
                className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input text-white'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                }`}
              />
              <span className={`text-[10px] block mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-400'}`}>
                Quantidade mínima de operadores com nota &ge; N3.
              </span>
            </div>
          </div>

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
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              Adicionar Posto à Matriz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
