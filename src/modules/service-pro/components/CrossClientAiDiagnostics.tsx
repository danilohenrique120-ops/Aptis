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
  diagnostics: CrossClientDiagnostic[];
  equipments?: Equipment[];
  masterCatalog?: MasterCatalogItem[];
  onApplyDiagnosticToOrder: (diagnostic: CrossClientDiagnostic) => void;
  onSaveDiagnostic?: (diagnostic: CrossClientDiagnostic, editIndex?: number) => void;
  onDeleteDiagnostic?: (index: number) => void;
}

export const CrossClientAiDiagnostics: React.FC<CrossClientAiDiagnosticsProps> = ({
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
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white border border-blue-200 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Waze da Manutenção Industrial • Inteligência Compartilhada
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Copiloto de Diagnósticos Cruzados Entre Clientes
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toda vez que um técnico conclui uma Ordem de Serviço preenchendo a{' '}
              <strong>Causa Raiz</strong> e as <strong>Peças Utilizadas</strong>, ou quando o gestor
              cadastra um defeito recorrente abaixo, este painel aprende automaticamente e orienta
              quais peças levar na van no próximo chamado!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
            <div className="px-4 py-3 bg-white border border-blue-200 rounded-2xl text-center shadow-2xs">
              <span className="text-2xl font-black text-blue-600 block leading-none">
                {totalResolvedCases}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">
                Casos Aprendidos
              </span>
            </div>

            <div className="px-4 py-3 bg-white border border-emerald-200 rounded-2xl text-center shadow-2xs">
              <span className="text-2xl font-black text-emerald-600 block leading-none">94.8%</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">
                1ª Visita Certeira
              </span>
            </div>

            {onSaveDiagnostic && (
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Cadastrar Diagnóstico / Defeito
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Model Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sintoma, ruído, código de alarme ou peça (ex: superaquecimento, vibração, válvula)..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Modelo:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          >
            <option value="all">Todos os Modelos ({diagnostics.length})</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-slate-800">Nenhum diagnóstico correspondente</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente buscar por termos mais genéricos ou clique em &quot;Cadastrar Diagnóstico / Defeito&quot; para adicionar um novo conhecimento.
            </p>
          </div>
        ) : (
          filtered.map(({ diag, originalIndex }) => (
            <div
              key={originalIndex}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Model + Edit/Delete */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {diag.equipmentModel}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {diag.equipmentCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>~{diag.averageRepairTimeHours}h</span>
                    </div>

                    {onSaveDiagnostic && (
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(diag, originalIndex)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition cursor-pointer"
                        title="Editar diagnóstico"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteDiagnostic && (
                      <button
                        type="button"
                        onClick={() => onDeleteDiagnostic(originalIndex)}
                        className="p-1.5 rounded-lg border border-red-200 bg-red-50/60 hover:bg-red-100 text-red-600 transition cursor-pointer"
                        title="Excluir diagnóstico"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Symptom Title */}
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">{diag.symptomTitle}</h3>

                {/* Keyword Pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {diag.symptomKeywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono font-medium border border-slate-200"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Historical Root Causes (Top Matched) */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Causas Raízes Confirmadas na Base ({diag.causes.length}):
                  </span>

                  {diag.causes.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{c.cause}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                          {c.confidenceScore}% Probabilidade
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Resolução padrão:</strong> {c.resolution}
                      </p>

                      {/* Recommended Parts to pack in technician van */}
                      {c.recommendedParts && c.recommendedParts.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold text-blue-700 flex items-center gap-1 mb-1">
                            <Package className="w-3 h-3 text-blue-600" />
                            Peças recomendadas para levar na van:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {c.recommendedParts.map((part, pIdx) => (
                              <span
                                key={pIdx}
                                className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-300 text-slate-800 font-medium shadow-2xs"
                              >
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-500 pt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
                        <span>
                          Casos resolvidos: <strong>{c.casesResolvedCount}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <Building2 className="w-3 h-3 text-slate-400" />
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
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 mt-3 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl my-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">
                    {editingIndex !== null
                      ? 'Editar Diagnóstico do Copiloto (Waze)'
                      : 'Novo Diagnóstico / Defeito Conhecido no Waze'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Compartilhe a solução técnica e as peças de van para toda a equipe de campo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitModal} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    Modelo do Equipamento *
                  </label>
                  <input
                    type="text"
                    list="waze-suggested-models"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Ex: Schulz SRP 4030 E ou Bitzer 4NES-14Y"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <datalist id="waze-suggested-models">
                    {suggestedModels.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tempo Médio Reparo (h)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={formRepairHours}
                    onChange={(e) => setFormRepairHours(Number(e.target.value) || 2)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Categoria da Máquina
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ex: Compressores de Parafuso, HVAC, Bombas..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Palavras-Chave de Busca (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={formKeywords}
                    onChange={(e) => setFormKeywords(e.target.value)}
                    placeholder="Ex: superaquecimento, desarme, 105C, oleo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sintoma Relatado / Alarme na Máquina *
                </label>
                <input
                  type="text"
                  required
                  value={formSymptomTitle}
                  onChange={(e) => setFormSymptomTitle(e.target.value)}
                  placeholder="Ex: Desarme por Alta Temperatura de Descarga (> 105°C)"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Causes List */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Causas Raízes Conhecidas & Peças para Levar na Van
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCauseRow}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Outra Causa Possível
                  </button>
                </div>

                {formCauses.map((causeItem, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-blue-700 uppercase">
                        Causa Possível #{cIdx + 1}
                      </span>
                      {formCauses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCauseRow(cIdx)}
                          className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-emerald-700 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Procedimento / Resolução Padrão para o Técnico
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
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-blue-700 mb-1">
                        Peças Recomendadas para Levar na Van (separadas por vírgula)
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
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
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
