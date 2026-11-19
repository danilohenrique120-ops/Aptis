'use client';

import React, { useMemo, useState } from 'react';
import {
  EmployeeSkillRecord,
  Sector,
  SkillLevel,
  SkillStation,
  SkillType,
  TrainingAction
} from '../types';
import {
  PlantTrainerEntry,
  buildPlantTrainersIndex,
  getEffectiveSkillType,
  getSkillTypeMeta,
  normalizeSkillName
} from '../skill-helpers';
import { IluoCircle } from './IluoCircle';
import {
  Award,
  Building2,
  Clock,
  Globe,
  GraduationCap,
  HeartHandshake,
  Layers,
  Search,
  Sparkles,
  Users,
  Wrench,
  X,
  CheckCircle2
} from 'lucide-react';

const getFutureIsoDate = (daysAhead: number) =>
  new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

const createActionId = () => `act-${Date.now().toString().slice(-6)}`;
const createStationId = () => `st-${Date.now().toString().slice(-6)}`;

interface PlantTrainersDirectoryPanelProps {
  sectors: Sector[];
  activeSector: Sector;
  allStations: SkillStation[];
  allEmployees: EmployeeSkillRecord[];
  sectorStations: SkillStation[];
  sectorEmployees: EmployeeSkillRecord[];
  onAddTrainingAction: (action: TrainingAction) => void;
  onAddStation: (station: SkillStation) => void;
  tintedGlass?: boolean;
}

export function PlantTrainersDirectoryPanel({
  sectors,
  activeSector,
  allStations,
  allEmployees,
  sectorStations,
  sectorEmployees,
  onAddTrainingAction,
  onAddStation,
  tintedGlass = false
}: PlantTrainersDirectoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillTypeFilter, setSkillTypeFilter] = useState<'all' | SkillType>('all');
  const [originSectorFilter, setOriginSectorFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [minLevelFilter, setMinLevelFilter] = useState<3 | 4>(4);
  const [viewMode, setViewMode] = useState<'by_trainer' | 'by_skill'>('by_trainer');

  // Modal de Vínculo Livre de Treinador Cross-Setor
  const [selectedTrainerEntry, setSelectedTrainerEntry] = useState<PlantTrainerEntry | null>(null);
  const [targetOperatorId, setTargetOperatorId] = useState<string>('');
  const [targetStationMode, setTargetStationMode] = useState<'existing' | 'create_matching'>('existing');
  const [targetStationId, setTargetStationId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(() => getFutureIsoDate(30));
  const [notes, setNotes] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Índice público interno da planta (contém APENAS N4 / N3 — zero N1/N2 ou gaps de outros setores)
  const rawTrainerEntries = useMemo(() => {
    return buildPlantTrainersIndex(allStations, allEmployees, sectors, minLevelFilter);
  }, [allStations, allEmployees, sectors, minLevelFilter]);

  const n4OnlyEntries = useMemo(() => {
    return buildPlantTrainersIndex(allStations, allEmployees, sectors, 4);
  }, [allStations, allEmployees, sectors]);

  // Métricas globais seguras (vitrine da fábrica)
  const directoryStats = useMemo(() => {
    const uniqueN4Trainers = new Set(n4OnlyEntries.map(e => e.employeeId)).size;
    const uniqueN4Skills = new Set(n4OnlyEntries.map(e => e.normalizedSkillName)).size;
    const uniqueHardSkills = new Set(
      n4OnlyEntries
        .filter(e => e.skillType === 'hard_station' || e.skillType === 'hard_skill')
        .map(e => e.normalizedSkillName)
    ).size;
    const uniqueSoftSkills = new Set(
      n4OnlyEntries.filter(e => e.skillType === 'soft_skill').map(e => e.normalizedSkillName)
    ).size;

    return {
      uniqueN4Trainers,
      uniqueN4Skills,
      uniqueHardSkills,
      uniqueSoftSkills
    };
  }, [n4OnlyEntries]);

  // Aplicação dos filtros
  const filteredEntries = useMemo(() => {
    const term = normalizeSkillName(searchTerm);
    return rawTrainerEntries.filter(entry => {
      if (skillTypeFilter !== 'all' && entry.skillType !== skillTypeFilter) return false;
      if (originSectorFilter !== 'all' && entry.sectorId !== originSectorFilter) return false;
      if (shiftFilter !== 'all' && entry.shift !== shiftFilter) return false;

      if (term) {
        const matchesSkill = entry.normalizedSkillName.includes(term);
        const matchesName = normalizeSkillName(entry.employeeName).includes(term);
        const matchesRole = normalizeSkillName(entry.employeeRole).includes(term);
        const matchesSector =
          normalizeSkillName(entry.sectorName).includes(term) ||
          normalizeSkillName(entry.sectorCode).includes(term);
        const matchesCategory = normalizeSkillName(entry.category).includes(term);
        if (!matchesSkill && !matchesName && !matchesRole && !matchesSector && !matchesCategory) {
          return false;
        }
      }
      return true;
    });
  }, [rawTrainerEntries, skillTypeFilter, originSectorFilter, shiftFilter, searchTerm]);

  // Agrupamento 1: Por Treinador
  const trainersGrouped = useMemo(() => {
    const map = new Map<
      string,
      {
        employeeId: string;
        employeeName: string;
        employeeRole: string;
        shift: string;
        sectorId: string;
        sectorCode: string;
        sectorName: string;
        sectorColor: string;
        entries: PlantTrainerEntry[];
      }
    >();

    for (const entry of filteredEntries) {
      const existing = map.get(entry.employeeId);
      if (existing) {
        existing.entries.push(entry);
      } else {
        map.set(entry.employeeId, {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          employeeRole: entry.employeeRole,
          shift: entry.shift,
          sectorId: entry.sectorId,
          sectorCode: entry.sectorCode,
          sectorName: entry.sectorName,
          sectorColor: entry.sectorColor,
          entries: [entry]
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.entries.length - a.entries.length);
  }, [filteredEntries]);

  // Agrupamento 2: Por Competência / Habilidade da Planta
  const skillsGrouped = useMemo(() => {
    const map = new Map<
      string,
      {
        normalizedSkillName: string;
        displayName: string;
        skillType: SkillType;
        category: string;
        trainers: PlantTrainerEntry[];
      }
    >();

    for (const entry of filteredEntries) {
      const existing = map.get(entry.normalizedSkillName);
      if (existing) {
        existing.trainers.push(entry);
      } else {
        map.set(entry.normalizedSkillName, {
          normalizedSkillName: entry.normalizedSkillName,
          displayName: entry.stationName,
          skillType: entry.skillType,
          category: entry.category,
          trainers: [entry]
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }, [filteredEntries]);

  const handleOpenLinkModal = (entry: PlantTrainerEntry) => {
    setSelectedTrainerEntry(entry);
    const defaultOperator =
      sectorEmployees.find(e => (e.skills[entry.stationId] || 1) < 3) || sectorEmployees[0];
    setTargetOperatorId(defaultOperator?.employeeId || '');

    // Verifica se o setor ativo já possui uma habilidade equivalente cadastrada
    const matchingLocalStation = sectorStations.find(
      st => normalizeSkillName(st.name) === entry.normalizedSkillName
    );
    if (matchingLocalStation) {
      setTargetStationMode('existing');
      setTargetStationId(matchingLocalStation.id);
    } else if (sectorStations.length > 0) {
      setTargetStationMode('create_matching');
      setTargetStationId(sectorStations[0].id);
    } else {
      setTargetStationMode('create_matching');
      setTargetStationId('');
    }

    const defaultDate = getFutureIsoDate(30);
    setScheduledDate(defaultDate);
    setNotes(
      `Capacitação em ${entry.stationName} ministrada por ${entry.employeeName} (${entry.sectorCode} • N${entry.level}).`
    );
  };

  const handleConfirmLinkTrainer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrainerEntry) return;

    const operator = sectorEmployees.find(emp => emp.employeeId === targetOperatorId);
    if (!operator) return;

    let finalStationId = targetStationId;
    let finalStationName = selectedTrainerEntry.stationName;
    let finalSkillType: SkillType = selectedTrainerEntry.skillType;

    if (targetStationMode === 'create_matching') {
      const existingLocal = sectorStations.find(
        st => normalizeSkillName(st.name) === selectedTrainerEntry.normalizedSkillName
      );
      if (existingLocal) {
        finalStationId = existingLocal.id;
        finalStationName = existingLocal.name;
        finalSkillType = getEffectiveSkillType(existingLocal);
      } else {
        const newStation: SkillStation = {
          id: createStationId(),
          sectorId: activeSector.id,
          name: selectedTrainerEntry.stationName,
          category: selectedTrainerEntry.category,
          skillType: selectedTrainerEntry.skillType,
          isCriticalForLineStop: selectedTrainerEntry.skillType !== 'soft_skill',
          minOperatorsRequired: 1,
          targetLevel: 3
        };
        onAddStation(newStation);
        finalStationId = newStation.id;
        finalStationName = newStation.name;
      }
    } else {
      const chosenStation = sectorStations.find(st => st.id === targetStationId);
      if (!chosenStation) return;
      finalStationId = chosenStation.id;
      finalStationName = chosenStation.name;
      finalSkillType = getEffectiveSkillType(chosenStation);
    }

    const isCrossSector = selectedTrainerEntry.sectorId !== activeSector.id;
    const newAction: TrainingAction = {
      id: createActionId(),
      sectorId: activeSector.id,
      stationId: finalStationId,
      stationName: finalStationName,
      operatorId: operator.employeeId,
      operatorName: operator.employeeName,
      mentorId: selectedTrainerEntry.employeeId,
      mentorName: `${selectedTrainerEntry.employeeName} (${selectedTrainerEntry.sectorCode} • N${selectedTrainerEntry.level})`,
      mentorSectorId: selectedTrainerEntry.sectorId,
      mentorSectorName: `${selectedTrainerEntry.sectorName} (${selectedTrainerEntry.sectorCode})`,
      mentorOrigin: isCrossSector ? 'cross_sector' : 'internal',
      skillType: finalSkillType,
      currentLevel: (operator.skills[finalStationId] || 1) as SkillLevel,
      targetLevel: 3,
      status: 'pending',
      scheduledDate,
      notes
    };

    onAddTrainingAction(newAction);
    setFeedbackMessage(
      `Treinador ${selectedTrainerEntry.employeeName} (${selectedTrainerEntry.sectorCode}) vinculado para capacitar ${operator.employeeName} em ${finalStationName}!`
    );
    setSelectedTrainerEntry(null);
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER DA VITRINE GLOBAL DE MULTIPLICADORES */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 ${
          tintedGlass
            ? 'aptis-glass-dark text-white border-white/10'
            : 'aptis-glass-light text-slate-900 border-slate-200 shadow-sm'
        }`}
      >
        <div
          className="absolute -top-16 -right-12 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(6, 182, 212, 0.25) 65%, transparent 80%)'
          }}
        />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                  tintedGlass
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                <Globe className="w-3 h-3" />
                Visão Global da Fábrica • Somente Leitura
              </span>
              <span className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Privacidade Garantida: exibe apenas Habilidades e Multiplicadores N4/N3 para mentoria
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Banco de Multiplicadores &amp; Competências da Planta
            </h2>
            <p className={`text-xs sm:text-sm mt-1 max-w-3xl ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
              Encontre quem já domina Hard Skills, Postos Operacionais ou Soft Skills em nível Multiplicador (N4) em qualquer área da fábrica e vincule livremente para capacitar o time de{' '}
              <strong className={tintedGlass ? 'text-cyan-300' : 'text-blue-700'}>
                {activeSector.name} ({activeSector.code})
              </strong>.
            </p>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl text-xs shrink-0 self-start lg:self-auto ${
            tintedGlass ? 'aptis-meniscus-track' : 'bg-slate-100 border border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('by_trainer')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'by_trainer'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : tintedGlass
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Por Treinador
            </button>
            <button
              type="button"
              onClick={() => setViewMode('by_skill')}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'by_skill'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : tintedGlass
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Por Habilidade
            </button>
          </div>
        </div>

        {/* KPIs da Vitrine Global */}
        <div className={`relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 pt-5 border-t ${
          tintedGlass ? 'border-white/10' : 'border-slate-200/80'
        }`}>
          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-emerald-300' : 'text-emerald-700'}`}>
              <span>Multiplicadores N4</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {directoryStats.uniqueN4Trainers}
            </p>
            <span className="text-[10px] text-slate-400">pessoas aptas a treinar</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
              <span>Skills c/ Tutor N4</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-cyan-300' : 'text-blue-700'}`}>
              {directoryStats.uniqueN4Skills}
            </p>
            <span className="text-[10px] text-slate-400">competências mapeadas na planta</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-blue-300' : 'text-indigo-700'}`}>
              <span>Postos / Hard Skills</span>
              <Wrench className="w-4 h-4 text-blue-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {directoryStats.uniqueHardSkills}
            </p>
            <span className="text-[10px] text-slate-400">técnicas e operacionais</span>
          </div>

          <div className={`p-3.5 rounded-2xl ${tintedGlass ? 'aptis-glass-subcard' : 'bg-white/90 border border-slate-200'}`}>
            <div className={`flex items-center justify-between text-xs font-semibold ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>
              <span>Soft Skills c/ N4</span>
              <HeartHandshake className="w-4 h-4 text-purple-400" />
            </div>
            <p className={`text-2xl font-black font-mono mt-1 ${tintedGlass ? 'text-purple-300' : 'text-purple-700'}`}>
              {directoryStats.uniqueSoftSkills}
            </p>
            <span className="text-[10px] text-slate-400">liderança e comportamentais</span>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
          tintedGlass
            ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* 2. BARRA DE BUSCA & FILTROS DA PLANTA */}
      <div className={`rounded-2xl p-4 border space-y-3 ${
        tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          <div className="lg:col-span-2">
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Buscar Habilidade, Treinador ou Área
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: Solda, Comunicação, Metrologia, Marcos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Tipo de Habilidade
            </label>
            <select
              value={skillTypeFilter}
              onChange={e => setSkillTypeFilter(e.target.value as 'all' | SkillType)}
              className={`w-full px-2.5 py-2 rounded-xl font-semibold focus:outline-none cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Todas (Hard &amp; Soft)</option>
              <option value="hard_station">Postos / Máquinas</option>
              <option value="hard_skill">Hard Skills Técnicas</option>
              <option value="soft_skill">Soft Skills</option>
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Setor de Origem
            </label>
            <select
              value={originSectorFilter}
              onChange={e => setOriginSectorFilter(e.target.value)}
              className={`w-full px-2.5 py-2 rounded-xl font-semibold focus:outline-none cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Toda a Fábrica</option>
              {sectors.map(s => (
                <option key={s.id} value={s.id}>
                  {s.code} • {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-[10px] font-bold uppercase mb-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Nível de Proficiência
            </label>
            <select
              value={minLevelFilter}
              onChange={e => setMinLevelFilter(Number(e.target.value) as 3 | 4)}
              className={`w-full px-2.5 py-2 rounded-xl font-semibold focus:outline-none cursor-pointer ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value={4}>🏆 Apenas N4 (Multiplicadores)</option>
              <option value={3}>✅ N4 Multiplicadores + N3 Autônomos</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
          <div className="flex items-center gap-2">
            <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>Turno:</span>
            {['all', 'Turno A', 'Turno B', 'Turno C'].map(sh => (
              <button
                key={sh}
                type="button"
                onClick={() => setShiftFilter(sh)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  shiftFilter === sh
                    ? 'bg-emerald-600 text-white'
                    : tintedGlass
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sh === 'all' ? 'Todos' : sh}
              </button>
            ))}
          </div>
          <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
            Exibindo <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>{filteredEntries.length}</strong> registros qualificados
          </span>
        </div>
      </div>

      {/* 3. CONTEÚDO DO DIRETÓRIO */}
      {filteredEntries.length === 0 ? (
        <div className={`rounded-3xl border p-10 text-center ${
          tintedGlass ? 'aptis-glass-dark border-white/10 text-slate-300' : 'aptis-glass-light text-slate-600'
        }`}>
          <GraduationCap className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-75" />
          <h4 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
            Nenhum multiplicador encontrado com estes filtros
          </h4>
          <p className="text-xs mt-1 opacity-80">
            Experimente limpar a busca ou incluir profissionais N3 Autônomos no filtro de proficiência.
          </p>
        </div>
      ) : viewMode === 'by_trainer' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trainersGrouped.map(trainer => {
            const isFromAnotherSector = trainer.sectorId !== activeSector.id;
            return (
              <div
                key={trainer.employeeId}
                className={`rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all ${
                  tintedGlass
                    ? 'aptis-glass-dark hover:border-emerald-500/35 text-white'
                    : 'aptis-glass-light hover:border-emerald-300 text-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${trainer.sectorColor} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md`}>
                        {trainer.sectorCode}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                            {trainer.employeeName}
                          </h4>
                          {isFromAnotherSector && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              tintedGlass
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                              🌐 Outra Área
                            </span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          {trainer.employeeRole}
                        </p>
                        <div className={`flex flex-wrap items-center gap-2 text-[11px] mt-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-cyan-400" />
                            {trainer.sectorName}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {trainer.shift}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      Competências aptas a multiplicar ({trainer.entries.length}):
                    </div>
                    <div className="space-y-1.5">
                      {trainer.entries.map(entry => {
                        const typeMeta = getSkillTypeMeta(entry.skillType);
                        return (
                          <div
                            key={entry.key}
                            className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${
                              tintedGlass
                                ? 'aptis-glass-subcard border-white/10'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <IluoCircle level={entry.level} size={20} />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`font-bold truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                                    {entry.stationName}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                                    tintedGlass ? typeMeta.darkBadge : typeMeta.lightBadge
                                  }`}>
                                    {typeMeta.shortLabel}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 block">
                                  {entry.category} • {entry.level === 4 ? 'N4 Multiplicador' : 'N3 Autônomo'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenLinkModal(entry)}
                              disabled={sectorEmployees.length === 0}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                                sectorEmployees.length === 0
                                  ? 'opacity-40 cursor-not-allowed bg-slate-600 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                              }`}
                              title={
                                sectorEmployees.length === 0
                                  ? 'Cadastre operadores no seu setor para vincular um treinamento'
                                  : `Vincular ${trainer.employeeName} como treinador em ${activeSector.name}`
                              }
                            >
                              Vincular Tutor
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Visão Agrupada por Competência / Habilidade */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skillsGrouped.map(group => {
            const typeMeta = getSkillTypeMeta(group.skillType);
            return (
              <div
                key={group.normalizedSkillName}
                className={`rounded-2xl border p-5 space-y-3 ${
                  tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        tintedGlass ? typeMeta.darkBadge : typeMeta.lightBadge
                      }`}>
                        {typeMeta.label}
                      </span>
                      <span className="text-[11px] text-slate-400">{group.category}</span>
                    </div>
                    <h4 className={`text-base font-bold mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                      {group.displayName}
                    </h4>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${
                    tintedGlass
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {group.trainers.length} tutor(es)
                  </span>
                </div>

                <div className="space-y-2">
                  {group.trainers.map(trainer => (
                    <div
                      key={trainer.key}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-xs ${
                        tintedGlass ? 'aptis-glass-subcard border-white/10' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <IluoCircle level={trainer.level} size={22} />
                        <div className="min-w-0">
                          <div className={`font-bold truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                            {trainer.employeeName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {trainer.sectorCode} ({trainer.sectorName}) • {trainer.shift}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenLinkModal(trainer)}
                        disabled={sectorEmployees.length === 0}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        Vincular Tutor
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE VÍNCULO LIVRE DE TREINADOR DA PLANTA */}
      {selectedTrainerEntry && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className={`rounded-3xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200 my-8 ${
            tintedGlass ? 'aptis-glass-modal text-white' : 'bg-white text-slate-900 border border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedTrainerEntry(null)}
              className={`absolute right-4 top-4 p-1.5 rounded-xl cursor-pointer ${
                tintedGlass ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${
                tintedGlass
                  ? 'bg-emerald-500/20 border-emerald-500/35 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}>
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  tintedGlass ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  Vínculo Livre na Planta • Para {activeSector.code}
                </span>
                <h3 className={`text-base font-bold mt-0.5 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  Agendar Capacitação com {selectedTrainerEntry.employeeName}
                </h3>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs mb-4 ${
              tintedGlass ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <strong>Treinador Selecionado:</strong> {selectedTrainerEntry.employeeName} (N{selectedTrainerEntry.level}) •{' '}
              Setor de Origem: <strong>{selectedTrainerEntry.sectorName}</strong> • Habilidade:{' '}
              <strong>{selectedTrainerEntry.stationName}</strong>
            </div>

            <form onSubmit={handleConfirmLinkTrainer} className="space-y-3.5 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Colaborador de {activeSector.name} a ser capacitado *
                </label>
                <select
                  required
                  value={targetOperatorId}
                  onChange={e => setTargetOperatorId(e.target.value)}
                  className={`w-full rounded-xl p-2.5 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  {sectorEmployees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} ({emp.role} • {emp.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block font-semibold mb-1.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Destino na Matriz de {activeSector.code}
                </label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${
                    targetStationMode === 'create_matching'
                      ? tintedGlass ? 'bg-emerald-500/15 border-emerald-400/40' : 'bg-emerald-50 border-emerald-300'
                      : tintedGlass ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="stationMode"
                      checked={targetStationMode === 'create_matching'}
                      onChange={() => setTargetStationMode('create_matching')}
                      className="mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <div className="font-bold">
                        Aplicar habilidade &quot;{selectedTrainerEntry.stationName}&quot; em {activeSector.code}
                      </div>
                      <div className="text-[10px] opacity-75">
                        Usa a coluna correspondente se já existir no setor, ou cria automaticamente na matriz de {activeSector.name}.
                      </div>
                    </div>
                  </label>

                  {sectorStations.length > 0 && (
                    <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${
                      targetStationMode === 'existing'
                        ? tintedGlass ? 'bg-cyan-500/15 border-cyan-400/40' : 'bg-blue-50 border-blue-300'
                        : tintedGlass ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <input
                        type="radio"
                        name="stationMode"
                        checked={targetStationMode === 'existing'}
                        onChange={() => setTargetStationMode('existing')}
                        className="mt-0.5 accent-cyan-500"
                      />
                      <div className="flex-1 space-y-1.5">
                        <div className="font-bold">Vincular a um posto/competência já existente em {activeSector.code}:</div>
                        <select
                          value={targetStationId}
                          onChange={e => {
                            setTargetStationMode('existing');
                            setTargetStationId(e.target.value);
                          }}
                          className={`w-full rounded-lg p-2 text-xs font-medium cursor-pointer ${
                            tintedGlass ? 'aptis-glass-input text-white [&>option]:bg-slate-900' : 'bg-white border border-slate-300 text-slate-900'
                          }`}
                        >
                          {sectorStations.map(st => (
                            <option key={st.id} value={st.id}>
                              {st.name} ({st.category})
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Data Limite
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className={`w-full rounded-xl p-2.5 font-mono ${
                      tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Observações do Plano
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className={`w-full rounded-xl p-2.5 ${
                      tintedGlass ? 'aptis-glass-input text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-3 border-t ${tintedGlass ? 'border-white/10' : 'border-slate-100'}`}>
                <button
                  type="button"
                  onClick={() => setSelectedTrainerEntry(null)}
                  className={`px-3.5 py-2 rounded-xl font-semibold cursor-pointer ${
                    tintedGlass ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer shadow-sm"
                >
                  Confirmar &amp; Agendar Capacitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
