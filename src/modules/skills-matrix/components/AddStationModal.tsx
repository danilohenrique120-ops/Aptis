'use client';

import React, { useMemo, useState } from 'react';
import { Sector, SkillStation, SkillType } from '../types';
import { PlantSkillCatalogEntry, getSkillTypeMeta, normalizeSkillName } from '../skill-helpers';
import { X, PlusCircle, Cpu, Wrench, HeartHandshake, Sparkles, ShieldAlert } from 'lucide-react';

interface AddStationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  plantSkillCatalog?: PlantSkillCatalogEntry[];
  onAddStation: (station: SkillStation) => void;
  tintedGlass?: boolean;
}

export function AddStationModal({
  isOpen,
  onClose,
  sector,
  plantSkillCatalog = [],
  onAddStation,
  tintedGlass = false
}: AddStationModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Operação Principal');
  const [skillType, setSkillType] = useState<SkillType>('hard_station');
  const [isCriticalForLineStop, setIsCriticalForLineStop] = useState<boolean>(true);
  const [minRequired, setMinRequired] = useState(2);
  const [showPlantSuggestions, setShowPlantSuggestions] = useState(false);

  const matchingSuggestions = useMemo(() => {
    if (!plantSkillCatalog.length) return [];
    const normInput = normalizeSkillName(name);
    if (!normInput) {
      return plantSkillCatalog.slice(0, 6);
    }
    return plantSkillCatalog
      .filter(entry => entry.normalizedName.includes(normInput) || normInput.includes(entry.normalizedName))
      .slice(0, 6);
  }, [plantSkillCatalog, name]);

  if (!isOpen) return null;

  const handleSelectSkillType = (nextType: SkillType) => {
    setSkillType(nextType);
    if (nextType === 'soft_skill') {
      setIsCriticalForLineStop(false);
      if (category === 'Operação Principal' || category === 'Técnica / Especialidade') {
        setCategory('Comportamental & Liderança');
      }
    } else if (nextType === 'hard_skill') {
      setIsCriticalForLineStop(true);
      if (category === 'Operação Principal' || category === 'Comportamental & Liderança') {
        setCategory('Técnica / Especialidade');
      }
    } else {
      setIsCriticalForLineStop(true);
      if (category === 'Comportamental & Liderança' || category === 'Técnica / Especialidade') {
        setCategory('Operação Principal');
      }
    }
  };

  const handleApplySuggestion = (entry: PlantSkillCatalogEntry) => {
    setName(entry.displayName);
    setCategory(entry.category);
    handleSelectSkillType(entry.skillType);
    setShowPlantSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStation: SkillStation = {
      id: `st-${Date.now().toString().slice(-6)}`,
      sectorId: sector.id,
      name: name.trim(),
      category: category.trim() || 'Geral',
      skillType,
      isCriticalForLineStop,
      minOperatorsRequired: Number(minRequired) || 1,
      targetLevel: 3
    };

    onAddStation(newStation);
    setName('');
    setMinRequired(2);
    setSkillType('hard_station');
    setIsCriticalForLineStop(true);
    setCategory('Operação Principal');
    setShowPlantSuggestions(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200 my-8 ${
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
              Setor: {sector.name} ({sector.code})
            </span>
            <h3 className={`text-lg font-bold leading-tight mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Cadastrar Posto ou Competência (Hard / Soft Skill)
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Competência */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
              Natureza da Habilidade / Posto *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSkillType('hard_station')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  skillType === 'hard_station'
                    ? tintedGlass
                      ? 'bg-blue-500/25 border-blue-400/50 text-white'
                      : 'bg-blue-50 border-blue-400 text-blue-950'
                    : tintedGlass
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  Posto / Máquina
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">Equipamento ou linha</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSkillType('hard_skill')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  skillType === 'hard_skill'
                    ? tintedGlass
                      ? 'bg-cyan-500/25 border-cyan-400/50 text-white'
                      : 'bg-cyan-50 border-cyan-400 text-cyan-950'
                    : tintedGlass
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  Hard Skill Técnica
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">Solda, LOTO, Excel, BPF</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSkillType('soft_skill')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  skillType === 'soft_skill'
                    ? tintedGlass
                      ? 'bg-purple-500/25 border-purple-400/50 text-white'
                      : 'bg-purple-50 border-purple-400 text-purple-950'
                    : tintedGlass
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <HeartHandshake className="w-3.5 h-3.5 text-purple-400" />
                  Soft Skill
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">Comunicação, TWI, Gestão</div>
              </button>
            </div>
          </div>

          {/* Nome com Sugestões Anti-Duplicidade da Planta */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={`block text-xs font-semibold ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Nome do Posto / Competência *
              </label>
              {plantSkillCatalog.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPlantSuggestions(prev => !prev)}
                  className={`text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    tintedGlass ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {showPlantSuggestions ? 'Ocultar catálogo da planta' : `Ver sugestões da fábrica (${plantSkillCatalog.length})`}
                </button>
              )}
            </div>
            <input
              type="text"
              required
              placeholder={
                skillType === 'soft_skill'
                  ? 'Ex: Comunicação Assertiva, Feedback 1:1, Mediação de Conflitos...'
                  : skillType === 'hard_skill'
                    ? 'Ex: Metrologia Dimensional, LOTO, Solda TIG, Power BI...'
                    : 'Ex: Torno CNC Cabeçote Móvel'
              }
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  setShowPlantSuggestions(true);
                }
              }}
              className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
              }`}
            />

            {showPlantSuggestions && matchingSuggestions.length > 0 && (
              <div className={`mt-2 p-2.5 rounded-xl border space-y-1.5 ${
                tintedGlass
                  ? 'bg-slate-900/70 border-cyan-500/25'
                  : 'bg-blue-50/70 border-blue-200'
              }`}>
                <div className={`text-[10px] font-bold flex items-center gap-1 ${
                  tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  Competências já cadastradas na fábrica (clique para padronizar e conectar treinadores N4):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSuggestions.map(entry => {
                    const meta = getSkillTypeMeta(entry.skillType);
                    return (
                      <button
                        key={entry.normalizedName}
                        type="button"
                        onClick={() => handleApplySuggestion(entry)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition cursor-pointer flex items-center gap-1.5 ${
                          tintedGlass
                            ? 'bg-white/5 hover:bg-cyan-500/20 border-white/15 text-slate-200'
                            : 'bg-white hover:bg-blue-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          tintedGlass ? meta.darkBadge : meta.lightBadge
                        }`}>
                          {meta.shortLabel}
                        </span>
                        <span>{entry.displayName}</span>
                        <span className="text-[10px] opacity-65">({entry.sectorCodes.join(', ')})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Categoria / Família
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
                Meta Mínima de Autônomos (N3+) *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={minRequired}
                onChange={e => setMinRequired(parseInt(e.target.value) || 1)}
                className={`w-full text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <label className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer ${
            tintedGlass
              ? 'bg-white/5 border-white/10 text-slate-200'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <input
              type="checkbox"
              checked={isCriticalForLineStop}
              onChange={e => setIsCriticalForLineStop(e.target.checked)}
              className="mt-0.5 rounded accent-blue-600 cursor-pointer"
            />
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className={`w-3.5 h-3.5 ${isCriticalForLineStop ? 'text-rose-400' : 'text-slate-400'}`} />
                Conta como Gargalo Crítico de Parada de Linha?
              </div>
              <div className="text-[11px] opacity-75 mt-0.5">
                Marque para Postos/Hard Skills cuja falta de N3+ trava a produção. Desmarque (ex: Soft Skills) para acompanhar evolução e buscar treinadores sem gerar falso alerta de parada.
              </div>
            </div>
          </label>

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
              Adicionar à Matriz do Setor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
