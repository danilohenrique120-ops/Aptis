'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Wrench,
  Clock,
  Package,
  Activity,
  Zap,
  Plus,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  Building2,
  Cpu,
} from 'lucide-react';
import { CrossClientDiagnostic, HistoricalCauseOccurrence, Equipment, MasterCatalogItem } from '../types';

interface CrossClientAiDiagnosticsProps {
  tintedGlass?: boolean;
  diagnostics: CrossClientDiagnostic[];
  equipments?: Equipment[];
  masterCatalog?: MasterCatalogItem[];
  onApplyDiagnosticToOrder: (diagnostic: CrossClientDiagnostic) => void;
  onSaveDiagnostic?: (diagnostic: CrossClientDiagnostic, editIndex?: number) => void;
  onDeleteDiagnostic?: (index: number) => void;
}

export const CrossClientAiDiagnostics: React.FC<CrossClientAiDiagnosticsProps> = ({
  tintedGlass = true,
  diagnostics,
  equipments = [],
  masterCatalog = [],
  onApplyDiagnosticToOrder,
  onSaveDiagnostic,
  onDeleteDiagnostic,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  // Modal state for creating / editing a diagnostic
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [formModel, setFormModel] = useState('');
  const [formCategory, setFormCategory] = useState('Compressores de Parafuso');
  const [formSymptomTitle, setFormSymptomTitle] = useState('');
  const [formKeywords, setFormKeywords] = useState('');
  const [formRepairHours, setFormRepairHours] = useState<number>(2);
  const [formCauses, setFormCauses] = useState<HistoricalCauseOccurrence[]>([
    {
      cause: '',
      resolution: '',
      recommendedParts: [''],
      confidenceScore: 85,
      casesResolvedCount: 1,
      clientsAffected: ['Base Interna'],
    },
  ]);

  const models = Array.from(new Set(diagnostics.map((d) => d.equipmentModel)));

  // Suggested models from equipments + masterCatalog for quick selection in modal
  const suggestedModels = Array.from(
    new Set([
      ...masterCatalog.map((m) => `${m.brand} ${m.model}`.trim()),
      ...equipments.map((e) => `${e.brand} ${e.model}`.trim()),
      ...models,
    ])
  ).filter(Boolean);

  // Filter diagnostics while keeping original index for edit/delete
  const indexedDiagnostics = diagnostics.map((diag, originalIndex) => ({ diag, originalIndex }));

  const filtered = indexedDiagnostics.filter(({ diag }) => {
    if (selectedModel !== 'all' && diag.equipmentModel !== selectedModel) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const matchesTitle = diag.symptomTitle.toLowerCase().includes(term);
    const matchesModel = diag.equipmentModel.toLowerCase().includes(term);
    const matchesKeywords = diag.symptomKeywords.some((k) => k.toLowerCase().includes(term));
    const matchesCauses = diag.causes.some(
      (c) =>
        c.cause.toLowerCase().includes(term) ||
        c.resolution.toLowerCase().includes(term) ||
        c.recommendedParts.some((p) => p.toLowerCase().includes(term))
    );

    return matchesTitle || matchesModel || matchesKeywords || matchesCauses;
  });

  const handleOpenCreateModal = () => {
    setEditingIndex(null);
    setFormModel(suggestedModels[0] || 'Schulz SRP 4030 E');
    setFormCategory('Compressores de Parafuso');
    setFormSymptomTitle('');
    setFormKeywords('');
    setFormRepairHours(2);
    setFormCauses([
      {
        cause: '',
        resolution: '',
        recommendedParts: [''],
        confidenceScore: 90,
        casesResolvedCount: 1,
        clientsAffected: ['Histórico Interno'],
      },
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (diag: CrossClientDiagnostic, index: number) => {
    setEditingIndex(index);
    setFormModel(diag.equipmentModel);
    setFormCategory(diag.equipmentCategory || 'Industrial');
    setFormSymptomTitle(diag.symptomTitle);
    setFormKeywords(diag.symptomKeywords.join(', '));
    setFormRepairHours(diag.averageRepairTimeHours || 2);
    setFormCauses(
      diag.causes.length > 0
        ? diag.causes.map((c) => ({
            ...c,
            recommendedParts: c.recommendedParts.length > 0 ? [...c.recommendedParts] : [''],
          }))
        : [
            {
              cause: '',
              resolution: '',
              recommendedParts: [''],
              confidenceScore: 85,
              casesResolvedCount: 1,
              clientsAffected: ['Histórico Interno'],
            },
          ]
    );
    setIsModalOpen(true);
  };

  const handleAddCauseRow = () => {
    setFormCauses((prev) => [
      ...prev,
      {
        cause: '',
        resolution: '',
        recommendedParts: [''],
        confidenceScore: 70,
        casesResolvedCount: 1,
        clientsAffected: ['Histórico Interno'],
      },
    ]);
  };

  const handleRemoveCauseRow = (cIdx: number) => {
    if (formCauses.length <= 1) return;
    setFormCauses((prev) => prev.filter((_, i) => i !== cIdx));
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formModel.trim() || !formSymptomTitle.trim()) return;

    const cleanedKeywords = formKeywords
      .split(',')
      .map((k) => k.trim().replace(/^#/, ''))
      .filter(Boolean);

    const cleanedCauses: HistoricalCauseOccurrence[] = formCauses
      .filter((c) => c.cause.trim() !== '')
      .map((c) => ({
        cause: c.cause.trim(),
        resolution: c.resolution.trim() || 'Inspeção e substituição conforme procedimento padrão.',
        recommendedParts: c.recommendedParts.map((p) => p.trim()).filter(Boolean),
        confidenceScore: Math.min(100, Math.max(1, Number(c.confidenceScore) || 85)),
        casesResolvedCount: Math.max(1, Number(c.casesResolvedCount) || 1),
        clientsAffected: c.clientsAffected?.length ? c.clientsAffected : ['Base de Clientes'],
      }));

    if (cleanedCauses.length === 0) {
      alert('Informe pelo menos uma Causa Raiz para este diagnóstico.');
      return;
    }

    const savedDiag: CrossClientDiagnostic = {
      equipmentModel: formModel.trim(),
      equipmentCategory: formCategory.trim() || 'Industrial',
      symptomTitle: formSymptomTitle.trim(),
      symptomKeywords:
        cleanedKeywords.length > 0
          ? cleanedKeywords
          : formSymptomTitle
              .toLowerCase()
              .split(' ')
              .filter((w) => w.length > 3)
              .slice(0, 4),
      causes: cleanedCauses,
      averageRepairTimeHours: Number(formRepairHours) || 2,
    };

    if (onSaveDiagnostic) {
      onSaveDiagnostic(savedDiag, editingIndex !== null ? editingIndex : undefined);
    }
    setIsModalOpen(false);
  };

  const totalResolvedCases = diagnostics.reduce(
    (acc, d) => acc + d.causes.reduce((sum, c) => sum + (c.casesResolvedCount || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Hero Banner explaining Waze da Manutenção */}
      <div
        className={`p-6 rounded-3xl relative overflow-hidden transition-all ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20 pointer-events-none blur-[80px]"
          style={{
            background:
              'radial-gradient(circle, rgba(245, 158, 11, 0.75) 0%, rgba(37, 99, 235, 0.35) 60%, transparent 75%)',
          }}
        />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${
                tintedGlass
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                  : 'bg-blue-100 text-blue-800 border-blue-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Waze da Manutenção Industrial • Inteligência Compartilhada
            </div>
            <h2
              className={`text-xl font-black ${
                tintedGlass ? 'text-white' : 'text-slate-900'
              }`}
            >
              Copiloto de Diagnósticos Cruzados Entre Clientes
            </h2>
            <p
              className={`text-xs leading-relaxed ${
                tintedGlass ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Toda vez que você conclui uma Ordem de Serviço preenchendo a{' '}
              <strong className={tintedGlass ? 'text-cyan-300' : 'text-slate-900'}>
                Causa Raiz
              </strong>{' '}
              e as{' '}
              <strong className={tintedGlass ? 'text-cyan-300' : 'text-slate-900'}>
                Peças Utilizadas
              </strong>
              , ou quando cadastra um defeito recorrente abaixo, este painel aprende
              automaticamente e orienta quais peças separar no almoxarifado antes do próximo
              atendimento!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div
              className={`px-4 py-3 rounded-2xl text-center border ${
                tintedGlass
                  ? 'aptis-glass-subcard border-cyan-400/30'
                  : 'bg-white border-blue-200 shadow-2xs'
              }`}
            >
              <span
                className={`text-2xl font-black block leading-none ${
                  tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                }`}
              >
                {totalResolvedCases}
              </span>
              <span
                className={`text-[10px] uppercase font-bold mt-1 block ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Casos Aprendidos
              </span>
            </div>

            <div
              className={`px-4 py-3 rounded-2xl text-center border ${
                tintedGlass
                  ? 'aptis-glass-subcard border-emerald-400/30'
                  : 'bg-white border-emerald-200 shadow-2xs'
              }`}
            >
              <span
                className={`text-2xl font-black block leading-none ${
                  tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                94.8%
              </span>
              <span
                className={`text-[10px] uppercase font-bold mt-1 block ${
                  tintedGlass ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                1ª Visita Certeira
              </span>
            </div>

            {onSaveDiagnostic && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-3 rounded-xl text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer border border-amber-300/35 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                  boxShadow:
                    '0 0 18px rgba(245, 158, 11, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                }}
              >
                <Plus className="w-4 h-4" />
                Cadastrar Diagnóstico / Defeito
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Model Filter Bar */}
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl transition-all ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="relative flex-1">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              tintedGlass ? 'text-slate-400' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sintoma, ruído, código de alarme ou peça (ex: superaquecimento, vibração, válvula)..."
            className={`w-full text-xs pl-10 pr-4 py-2.5 rounded-xl outline-none font-medium transition ${
              tintedGlass
                ? 'aptis-glass-input text-white placeholder:text-slate-400'
                : 'bg-white border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-2xs'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold shrink-0 ${
              tintedGlass ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Modelo:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className={`text-xs rounded-xl px-3 py-2.5 outline-none font-medium cursor-pointer transition ${
              tintedGlass
                ? 'aptis-glass-input text-white'
                : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">
              Todos os Modelos ({diagnostics.length})
            </option>
            {models.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-white">
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div
            className={`col-span-2 p-12 text-center rounded-3xl border border-dashed ${
              tintedGlass
                ? 'aptis-glass-dark border-white/15 text-slate-300'
                : 'border-slate-300 bg-white text-slate-600'
            }`}
          >
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
              Nenhum diagnóstico correspondente
            </p>
            <p className="text-xs mt-1 opacity-75">
              Tente buscar por termos mais genéricos ou clique em &quot;Cadastrar Diagnóstico / Defeito&quot; para adicionar um novo conhecimento.
            </p>
          </div>
        ) : (
          filtered.map(({ diag, originalIndex }) => (
            <div
              key={originalIndex}
              className={`p-5 rounded-3xl transition-all duration-300 space-y-4 flex flex-col justify-between ${
                tintedGlass
                  ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                  : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 text-slate-900'
              }`}
            >
              <div>
                {/* Header Tag & Model + Edit/Delete */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        tintedGlass
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {diag.equipmentModel}
                    </span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        tintedGlass
                          ? 'bg-white/10 text-slate-300 border-white/15'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {diag.equipmentCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center gap-1 text-[11px] font-mono font-medium ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <Clock
                        className={`w-3.5 h-3.5 ${
                          tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                        }`}
                      />
                      <span>~{diag.averageRepairTimeHours}h</span>
                    </div>

                    {onSaveDiagnostic && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(diag, originalIndex)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          tintedGlass
                            ? 'aptis-glass-subcard border-white/15 text-slate-300 hover:text-cyan-300'
                            : 'border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600'
                        }`}
                        title="Editar diagnóstico"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteDiagnostic && (
                      <button
                        type="button"
                        onClick={() => onDeleteDiagnostic(originalIndex)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          tintedGlass
                            ? 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-400/30'
                            : 'border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600'
                        }`}
                        title="Excluir diagnóstico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Symptom Title */}
                <h3
                  className={`text-sm font-black mb-1.5 ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {diag.symptomTitle}
                </h3>

                {/* Keyword Pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {diag.symptomKeywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium border ${
                        tintedGlass
                          ? 'bg-white/10 text-cyan-200 border-white/15'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Historical Root Causes (Top Matched) */}
                <div
                  className={`space-y-2.5 pt-2 border-t ${
                    tintedGlass ? 'border-white/[0.08]' : 'border-slate-100'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider block ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Causas Raízes Confirmadas na Base ({diag.causes.length}):
                  </span>

                  {diag.causes.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className={`p-3.5 rounded-2xl border space-y-2 ${
                        tintedGlass
                          ? 'aptis-glass-subcard border-white/10 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-700 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-xs font-bold ${
                            tintedGlass ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {c.cause}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                            tintedGlass
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {c.confidenceScore}% Probabilidade
                        </span>
                      </div>

                      <p
                        className={`text-[11px] leading-relaxed ${
                          tintedGlass ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        <strong className={tintedGlass ? 'text-white' : 'text-slate-800'}>
                          Resolução padrão:
                        </strong>{' '}
                        {c.resolution}
                      </p>

                      {/* Recommended Parts to pack in technician van */}
                      {c.recommendedParts && c.recommendedParts.length > 0 && (
                        <div className="pt-1">
                          <span
                            className={`text-[10px] font-bold flex items-center gap-1 mb-1 ${
                              tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                            }`}
                          >
                            <Package className="w-3 h-3" />
                            Peças recomendadas para separar antes do reparo:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {c.recommendedParts.map((part, pIdx) => (
                              <span
                                key={pIdx}
                                className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                                  tintedGlass
                                    ? 'bg-white/10 border-white/15 text-white'
                                    : 'bg-white border-slate-300 text-slate-800 shadow-2xs'
                                }`}
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        className={`text-[10px] pt-1.5 flex flex-wrap items-center justify-between gap-2 border-t ${
                          tintedGlass
                            ? 'text-slate-400 border-white/10'
                            : 'text-slate-500 border-slate-200'
                        }`}
                      >
                        <span>
                          Casos resolvidos:{' '}
                          <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>
                            {c.casesResolvedCount}
                          </strong>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 ${
                            tintedGlass ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          <Building2 className="w-3 h-3" />
                          Clientes: <strong>{c.clientsAffected.join(', ')}</strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onApplyDiagnosticToOrder(diag)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 mt-3 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  boxShadow:
                    '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                }}
              >
                <Zap className="w-4 h-4" />
                Criar Ordem de Serviço com Este Diagnóstico
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal: Cadastrar / Editar Diagnóstico no Waze */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="aptis-glass-modal rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-6 text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border border-amber-400/35 flex items-center justify-center text-white"
                  style={{
                    background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                    boxShadow: '0 0 18px rgba(245, 158, 11, 0.35)',
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingIndex !== null
                      ? 'Editar Diagnóstico do Copiloto (Waze)'
                      : 'Novo Diagnóstico / Defeito Conhecido no Waze'}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Registre a causa raiz, o procedimento de solução e as peças recomendadas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitModal}
              className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">
                    Modelo do Equipamento *
                  </label>
                  <input
                    type="text"
                    list="waze-suggested-models"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Ex: Schulz SRP 4030 E ou Bitzer 4NES-14Y"
                    className="aptis-glass-input w-full px-3 py-2 rounded-xl text-white font-semibold outline-none placeholder:text-slate-500"
                  />
                  <datalist id="waze-suggested-models">
                    {suggestedModels.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Tempo Médio Reparo (h)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formRepairHours}
                    onChange={(e) => setFormRepairHours(Number(e.target.value) || 2)}
                    className="aptis-glass-input w-full px-3 py-2 rounded-xl text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Categoria da Máquina
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ex: Compressores de Parafuso, HVAC, Bombas..."
                    className="aptis-glass-input w-full px-3 py-2 rounded-xl text-white outline-none placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Palavras-Chave de Busca (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    placeholder="Ex: superaquecimento, desarme, 105C, oleo"
                    className="aptis-glass-input w-full px-3 py-2 rounded-xl text-white font-mono outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Sintoma Relatado / Alarme na Máquina *
                </label>
                <input
                  type="text"
                  required
                  value={formSymptomTitle}
                  onChange={(e) => setFormSymptomTitle(e.target.value)}
                  placeholder="Ex: Desarme por Alta Temperatura de Descarga (> 105°C)"
                  className="aptis-glass-input w-full px-3 py-2.5 rounded-xl text-white font-bold outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Causes List */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 uppercase tracking-wider text-[11px]">
                    Causas Raízes Conhecidas & Peças Recomendadas
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCauseRow}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Outra Causa Possível
                  </button>
                </div>

                {formCauses.map((causeItem, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-2xl aptis-glass-subcard space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-300 uppercase">
                        Causa Possível #{cIdx + 1}
                      </span>
                      {formCauses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCauseRow(cIdx)}
                          className="text-rose-400 hover:text-rose-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Causa Raiz Confirmada *
                        </label>
                        <input
                          type="text"
                          required
                          value={causeItem.cause}
                          onChange={(e) => {
                            const updated = [...formCauses];
                            updated[cIdx].cause = e.target.value;
                            setFormCauses(updated);
                          }}
                          placeholder="Ex: Válvula Termostática Travada Fechada"
                          className="aptis-glass-input w-full px-3 py-2 rounded-lg text-white font-semibold placeholder:text-slate-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Probabilidade (%)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={causeItem.confidenceScore}
                          onChange={(e) => {
                            const updated = [...formCauses];
                            updated[cIdx].confidenceScore = Number(e.target.value) || 80;
                            setFormCauses(updated);
                          }}
                          className="aptis-glass-input w-full px-3 py-2 rounded-lg text-emerald-400 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">
                        Procedimento / Resolução Padrão
                      </label>
                      <textarea
                        rows={2}
                        value={causeItem.resolution}
                        onChange={(e) => {
                          const updated = [...formCauses];
                          updated[cIdx].resolution = e.target.value;
                          setFormCauses(updated);
                        }}
                        placeholder="Ex: Substituição do elemento termostático 85°C e troca de óleo sintético."
                        className="aptis-glass-input w-full px-3 py-2 rounded-lg text-white resize-none placeholder:text-slate-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-cyan-300 mb-1">
                        Peças Recomendadas para o Reparo (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={causeItem.recommendedParts.join(', ')}
                        onChange={(e) => {
                          const updated = [...formCauses];
                          updated[cIdx].recommendedParts = e.target.value.split(',');
                          setFormCauses(updated);
                        }}
                        placeholder="Ex: Kit Reparo Válvula Termostática (021.0044), Óleo Lubrificante 20L"
                        className="aptis-glass-input w-full px-3 py-2 rounded-lg text-white font-medium placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-white font-bold transition flex items-center gap-2 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                    boxShadow:
                      '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {editingIndex !== null ? 'Salvar Alterações no Waze' : 'Publicar no Waze da Equipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
