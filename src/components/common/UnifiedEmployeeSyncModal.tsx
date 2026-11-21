'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Users,
  RefreshCw,
  CheckCircle2,
  Check,
  Search,
  Building2,
  Briefcase,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import {
  EmployeeModuleSource,
  UnifiedPlantEmployee,
  MODULE_SOURCE_LABELS
} from '@/lib/unified-employee-directory';

export interface ComplianceImportConfig {
  trainingName: string;
  trainingType: 'NR' | 'POP' | 'ISO' | 'Interno';
  validityMonths: number;
}

interface UnifiedEmployeeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetModule: EmployeeModuleSource;
  directory: UnifiedPlantEmployee[];
  missingEmployees: UnifiedPlantEmployee[];
  onImportEmployees: (
    selected: UnifiedPlantEmployee[],
    complianceConfig?: ComplianceImportConfig
  ) => void;
  tintedGlass?: boolean;
}

const DEFAULT_COMPLIANCE_PRESETS: Array<{
  label: string;
  trainingName: string;
  trainingType: 'NR' | 'POP' | 'ISO' | 'Interno';
  validityMonths: number;
}> = [
  {
    label: 'NR-12 • Segurança no Trabalho em Máquinas e Equipamentos',
    trainingName: 'NR-12 Segurança em Máquinas e Equipamentos',
    trainingType: 'NR',
    validityMonths: 24
  },
  {
    label: 'NR-10 • Segurança em Instalações e Serviços em Eletricidade',
    trainingName: 'NR-10 Segurança em Eletricidade',
    trainingType: 'NR',
    validityMonths: 24
  },
  {
    label: 'NR-35 • Trabalho em Altura',
    trainingName: 'NR-35 Trabalho em Altura',
    trainingType: 'NR',
    validityMonths: 24
  },
  {
    label: 'POP-001 • Procedimento Operacional Padrão de Segurança e Qualidade',
    trainingName: 'POP-001 Procedimento Operacional Padrão',
    trainingType: 'POP',
    validityMonths: 12
  }
];

export function UnifiedEmployeeSyncModal({
  isOpen,
  onClose,
  targetModule,
  directory,
  missingEmployees,
  onImportEmployees,
  tintedGlass = true
}: UnifiedEmployeeSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'directory'>('import');
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [excludedKeys, setExcludedKeys] = useState<string[]>([]);
  const [compliancePresetIdx, setCompliancePresetIdx] = useState(0);
  const [customTrainingName, setCustomTrainingName] = useState('');
  const [importedCountFeedback, setImportedCountFeedback] = useState<number | null>(null);

  const availableDepartments = useMemo(() => {
    const set = new Set<string>();
    for (const emp of directory) {
      if (emp.department) set.add(emp.department);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [directory]);

  const filteredMissing = useMemo(() => {
    return missingEmployees.filter(emp => {
      const matchesSector = sectorFilter === 'all' || emp.department === sectorFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });
  }, [missingEmployees, sectorFilter, searchTerm]);

  const filteredDirectory = useMemo(() => {
    return directory.filter(emp => {
      const matchesSector = sectorFilter === 'all' || emp.department === sectorFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q);
      return matchesSector && matchesSearch;
    });
  }, [directory, sectorFilter, searchTerm]);

  if (!isOpen) return null;

  const selectedEmployees = filteredMissing.filter(emp => !excludedKeys.includes(emp.key));

  const toggleEmployeeKey = (key: string) => {
    setExcludedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAllFiltered = () => {
    setExcludedKeys([]);
  };

  const clearAllFiltered = () => {
    setExcludedKeys(filteredMissing.map(e => e.key));
  };

  const handleConfirmImport = () => {
    if (selectedEmployees.length === 0) return;

    const preset =
      DEFAULT_COMPLIANCE_PRESETS[compliancePresetIdx] || DEFAULT_COMPLIANCE_PRESETS[0];

    const complianceConfig: ComplianceImportConfig = {
      trainingName: customTrainingName.trim() || preset.trainingName,
      trainingType: preset.trainingType,
      validityMonths: preset.validityMonths
    };

    onImportEmployees(selectedEmployees, complianceConfig);
    setImportedCountFeedback(selectedEmployees.length);
  };

  const targetMeta = MODULE_SOURCE_LABELS[targetModule];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`max-w-3xl w-full rounded-3xl border shadow-2xl overflow-hidden transition-all my-6 ${
          tintedGlass
            ? 'bg-slate-900/95 border-cyan-500/30 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 sm:p-6 border-b flex items-start justify-between gap-4 ${
            tintedGlass
              ? 'bg-gradient-to-r from-slate-950 via-cyan-950/35 to-slate-950 border-white/10'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Base Unificada de Colaboradores da Planta
            </div>
            <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              Sincronizar Colaboradores • {targetMeta.full}
            </h3>
            <p
              className={`text-xs ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Importe colaboradores já cadastrados em outros módulos da Suíte Aptis (Skills, Compliance, 1:1 e PDI) sem precisar redigitar dados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setImportedCountFeedback(null);
              onClose();
            }}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/70'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback de Sucesso pós-sincronização */}
        {importedCountFeedback !== null ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black">
                {importedCountFeedback}{' '}
                {importedCountFeedback === 1
                  ? 'colaborador sincronizado'
                  : 'colaboradores sincronizados'}{' '}
                com sucesso!
              </h4>
              <p
                className={`text-xs max-w-md mx-auto ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Os registros já foram integrados ao módulo <strong>{targetMeta.full}</strong> mantendo cargo, área/setor e turno alinhados com a planta.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setImportedCountFeedback(null);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg cursor-pointer"
              >
                Concluir e Voltar ao Módulo
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-4">
            {/* Abas + Filtros */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div
                className={`inline-flex p-1 rounded-2xl border ${
                  tintedGlass
                    ? 'bg-slate-950/80 border-white/10'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'import'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : tintedGlass
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Disponíveis p/ Importar ({missingEmployees.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'directory'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : tintedGlass
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Catálogo da Planta ({directory.length})
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar nome ou cargo..."
                    className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none ${
                      tintedGlass
                        ? 'bg-slate-950/80 border-white/15 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <select
                  value={sectorFilter}
                  onChange={e => setSectorFilter(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs border focus:outline-none cursor-pointer ${
                    tintedGlass
                      ? 'bg-slate-950/80 border-white/15 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">Todas as Áreas ({availableDepartments.length})</option>
                  {availableDepartments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'import' ? (
              <>
                {/* Se for Aptis Compliance, permite escolher a NR/POP padrão para vincular na importação */}
                {targetModule === 'training-matrix' && filteredMissing.length > 0 && (
                  <div
                    className={`p-3.5 rounded-2xl border space-y-2.5 ${
                      tintedGlass
                        ? 'bg-amber-500/10 border-amber-400/30'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Norma / Treinamento Inicial para os Colaboradores Importados:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <select
                        value={compliancePresetIdx}
                        onChange={e => setCompliancePresetIdx(Number(e.target.value))}
                        className={`px-3 py-2 rounded-xl text-xs border font-semibold ${
                          tintedGlass
                            ? 'bg-slate-950 border-white/15 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      >
                        {DEFAULT_COMPLIANCE_PRESETS.map((preset, idx) => (
                          <option key={preset.trainingName} value={idx}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={customTrainingName}
                        onChange={e => setCustomTrainingName(e.target.value)}
                        placeholder="Ou digite um treinamento específico (opcional)..."
                        className={`px-3 py-2 rounded-xl text-xs border ${
                          tintedGlass
                            ? 'bg-slate-950 border-white/15 text-white placeholder:text-slate-500'
                            : 'bg-white border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {filteredMissing.length === 0 ? (
                  <div
                    className={`p-8 rounded-2xl border text-center space-y-2 ${
                      tintedGlass
                        ? 'bg-slate-950/60 border-white/10 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-sm font-bold">
                      Todos os colaboradores da base da planta já estão sincronizados neste módulo!
                    </p>
                    <p className="text-xs opacity-75">
                      Você pode visualizar a matriz completa de presença na aba &quot;Catálogo da Planta&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs px-1">
                      <span className={tintedGlass ? 'text-slate-400' : 'text-slate-500'}>
                        Selecione os colaboradores que deseja importar para{' '}
                        <strong>{targetMeta.short}</strong>:
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={selectAllFiltered}
                          className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                        >
                          Marcar Todos
                        </button>
                        <button
                          type="button"
                          onClick={clearAllFiltered}
                          className="text-slate-400 hover:underline cursor-pointer"
                        >
                          Desmarcar
                        </button>
                      </div>
                    </div>

                    <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                      {filteredMissing.map(emp => {
                        const isSelected = !excludedKeys.includes(emp.key);
                        return (
                          <div
                            key={emp.key}
                            onClick={() => toggleEmployeeKey(emp.key)}
                            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? tintedGlass
                                  ? 'bg-cyan-950/35 border-cyan-500/45'
                                  : 'bg-cyan-50/70 border-cyan-300'
                                : tintedGlass
                                ? 'bg-slate-950/50 border-white/10 opacity-70'
                                : 'bg-white border-slate-200 opacity-75'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'bg-cyan-400 text-slate-950 font-black'
                                    : 'border border-slate-500'
                                }`}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold truncate">{emp.name}</div>
                                <div
                                  className={`flex flex-wrap items-center gap-2 text-[11px] mt-0.5 ${
                                    tintedGlass ? 'text-slate-400' : 'text-slate-500'
                                  }`}
                                >
                                  <span className="inline-flex items-center gap-1">
                                    <Briefcase className="w-3 h-3 text-cyan-400" />
                                    {emp.role}
                                  </span>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Building2 className="w-3 h-3 text-emerald-400" />
                                    {emp.department}
                                  </span>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    {emp.shift}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
                              {emp.sources.map(src => (
                                <span
                                  key={src}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-800/90 text-slate-200 border-slate-700"
                                >
                                  {MODULE_SOURCE_LABELS[src].short}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Aba 2: Catálogo Completo da Planta com Matriz de Presença nos 4 Módulos */
              <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                {filteredDirectory.map(emp => (
                  <div
                    key={emp.key}
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      tintedGlass
                        ? 'bg-slate-950/60 border-white/10'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{emp.name}</div>
                      <div
                        className={`text-[11px] ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {emp.role} • {emp.department} • {emp.shift}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          'skills-matrix',
                          'training-matrix',
                          'one-on-one',
                          'pdi-manager'
                        ] as EmployeeModuleSource[]
                      ).map(mod => {
                        const isPresent = emp.sources.includes(mod);
                        return (
                          <span
                            key={mod}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                              isPresent
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : tintedGlass
                                ? 'bg-white/5 text-slate-500 border-white/10'
                                : 'bg-slate-200/70 text-slate-400 border-slate-300'
                            }`}
                          >
                            {isPresent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            {MODULE_SOURCE_LABELS[mod].short}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rodapé do Modal */}
            <div
              className={`pt-4 border-t flex items-center justify-between gap-3 ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <span
                className={`text-[11px] ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Base unificada:{' '}
                <strong className="font-mono">{directory.length} colaboradores</strong> mapeados na planta
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    tintedGlass
                      ? 'border-white/15 text-slate-300 hover:bg-white/10'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Fechar
                </button>

                {activeTab === 'import' && filteredMissing.length > 0 && (
                  <button
                    type="button"
                    disabled={selectedEmployees.length === 0}
                    onClick={handleConfirmImport}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-lg disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Importar Selecionados ({selectedEmployees.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
