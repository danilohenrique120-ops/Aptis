'use client';

import React, { useState } from 'react';
import { Sector } from '../types';
import { X, Plus, Building2, User, FileText, Check, Shield } from 'lucide-react';

interface SectorManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectors: Sector[];
  onAddSector: (newSector: Sector) => void;
}

const COLOR_OPTIONS = [
  { label: 'Azul Industrial', value: 'from-blue-600 to-indigo-600', text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { label: 'Verde Esmeralda', value: 'from-emerald-600 to-teal-600', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { label: 'Âmbar / Laranja', value: 'from-amber-600 to-orange-600', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { label: 'Roxo Corporativo', value: 'from-purple-600 to-indigo-600', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  { label: 'Ciano Técnico', value: 'from-cyan-600 to-blue-600', text: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200' },
];

export function SectorManagerModal({
  isOpen,
  onClose,
  sectors,
  onAddSector
}: SectorManagerModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerRole, setManagerRole] = useState('Supervisor de Produção');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const sectorId = `sec-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    const newSector: Sector = {
      id: sectorId,
      code: code.toUpperCase().trim(),
      name: name.trim(),
      description: description.trim() || `Matriz de Habilidades do setor ${name}.`,
      managerName: managerName.trim() || 'Supervisor Responsável',
      managerRole: managerRole.trim(),
      authorizedRoles: ['superadmin', 'tenant_admin', `${sectorId}-supervisor`],
      color: selectedColor
    };

    onAddSector(newSector);
    setName('');
    setCode('');
    setDescription('');
    setManagerName('');
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
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              Configuração Multi-Setor
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight mt-0.5">
              Cadastrar Novo Setor / Célula Fabril
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-5">
          Cada setor cadastrado possuirá uma <strong>Matriz de Habilidades 100% isolada e independente</strong>, com seus próprios postos, operadores e restrição de acesso por área.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Setor / Linha *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Estamparia & Prensas"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sigla / Código *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: EST"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 uppercase font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição / Processos Principais
            </label>
            <input
              type="text"
              placeholder="Ex: Corte a laser, conformação em prensa e repuxo de chapas."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supervisor / Líder do Setor
              </label>
              <input
                type="text"
                placeholder="Ex: Roberto Gomes"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cargo do Líder
              </label>
              <input
                type="text"
                value={managerRole}
                onChange={e => setManagerRole(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Identidade Visual do Setor
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setSelectedColor(c.value)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedColor === c.value
                      ? `${c.bg} ${c.text} ${c.border} ring-2 ring-blue-500 shadow-xs`
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${c.value}`} />
                  {c.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Segurança por Área:</strong> Apenas os supervisores atribuídos a este setor ou gestores gerais terão permissão para visualizar e alterar as notas desta matriz.
            </span>
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
              Criar Setor & Iniciar Matriz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
