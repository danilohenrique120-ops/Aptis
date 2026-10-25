'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Wrench,
  Cpu,
  Package,
  FileCheck,
  Plus,
  Building2,
  ShieldCheck,
  X,
  Trash2,
  Edit3,
  Search,
  FileText,
  CheckSquare,
  CalendarPlus,
  Upload,
  CheckCircle2
} from 'lucide-react';
import {
  MasterCatalogItem,
  ClientContractor,
  Equipment,
  EquipmentSpec
} from '../types';

interface MasterCatalogPanelProps {
  catalog: MasterCatalogItem[];
  clients: ClientContractor[];
  equipments?: Equipment[];
  onDeployToClient: (model: MasterCatalogItem, clientId: string, tag: string) => void;
  onSaveCatalogItem?: (item: MasterCatalogItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onGenerateBatchWorkOrders?: (model: MasterCatalogItem) => number;
}

const DEFAULT_CATEGORIES = [
  'Compressor de Ar',
  'Climatização & Refrigeração',
  'Caldeiraria & Vapor',
  'Geração de Energia',
  'Bombas & Motores',
  'Usinagem & CNC',
  'Subestação & Elétrica'
];

export const MasterCatalogPanel: React.FC<MasterCatalogPanelProps> = ({
  catalog,
  clients,
  equipments = [],
  onDeployToClient,
  onSaveCatalogItem,
  onDeleteItem,
  onGenerateBatchWorkOrders,
}) => {
  // Busca e Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [normFilter, setNormFilter] = useState('all');
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Modal de Implantar Modelo em Cliente
  const [selectedItem, setSelectedItem] = useState<MasterCatalogItem | null>(null);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [targetClientId, setTargetClientId] = useState<string>(clients[0]?.id || '');
  const [targetTag, setTargetTag] = useState<string>('');

  // Modal de Cadastro / Edição de Modelo no Catálogo Mestre
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState('Compressor de Ar');
  const [formBrand, setFormBrand] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formCapacity, setFormCapacity] = useState('');
  const [formLegalNorm, setFormLegalNorm] = useState<'PMOC' | 'NR-10' | 'NR-12' | 'NR-13' | 'Outro'>('NR-13');
  const [formIntervalMonths, setFormIntervalMonths] = useState(3);
  const [formIntervalHours, setFormIntervalHours] = useState(1000);
  const [formManualPdfName, setFormManualPdfName] = useState('');
  const [formSpecs, setFormSpecs] = useState<EquipmentSpec[]>([
    { key: 'power', label: 'Potência Nominal', value: '30 HP (22 kW)' },
    { key: 'voltage', label: 'Tensão de Trabalho', value: '380V Trifásico' }
  ]);
  const [formChecklist, setFormChecklist] = useState<string[]>([
    'Inspeção de vazamentos, ruídos e vibração anormal',
    'Substituição de elementos filtrantes conforme horímetro',
    'Reaperto de conexões elétricas e leitura de amperagem'
  ]);
  const [formNewChecklistItem, setFormNewChecklistItem] = useState('');
  const [formSpareParts, setFormSpareParts] = useState<
    { code: string; description: string; suggestedReplacementInterval: string }[]
  >([
    {
      code: 'KIT-PREV-01',
      description: 'Elemento Filtro de Ar + Filtro de Óleo Original',
      suggestedReplacementInterval: 'A cada 1.000h ou 3 meses'
    }
  ]);

  // Abre modal para criar novo modelo padrão
  const handleOpenNewModel = () => {
    setEditingId(null);
    setFormCategory('Compressor de Ar');
    setFormBrand('');
    setFormModel('');
    setFormCapacity('');
    setFormLegalNorm('NR-13');
    setFormIntervalMonths(3);
    setFormIntervalHours(1000);
    setFormManualPdfName('');
    setFormSpecs([
      { key: 'power', label: 'Potência Nominal', value: '' },
      { key: 'voltage', label: 'Tensão Elétrica', value: '380V Trifásico' },
      { key: 'pressure', label: 'Pressão / Regime', value: '' }
    ]);
    setFormChecklist([
      'Inspeção geral de segurança e estanqueidade',
      'Limpeza e troca de filtros conforme plano',
      'Medição de corrente elétrica entre fases e reaperto de bornes'
    ]);
    setFormSpareParts([
      {
        code: 'PEC-001',
        description: '',
        suggestedReplacementInterval: 'A cada 3 meses / 1.000h'
      }
    ]);
    setIsEditorOpen(true);
  };

  // Abre modal para editar modelo existente
  const handleOpenEditModel = (item: MasterCatalogItem) => {
    setEditingId(item.id);
    setFormCategory(item.category);
    setFormBrand(item.brand);
    setFormModel(item.model);
    setFormCapacity(item.capacity);
    setFormLegalNorm(item.maintenancePlan.legalNorm || 'NR-13');
    setFormIntervalMonths(item.maintenancePlan.intervalMonths || 3);
    setFormIntervalHours(item.maintenancePlan.intervalHours || 1000);
    setFormManualPdfName(item.manualPdfName || '');
    setFormSpecs(item.specs.length > 0 ? [...item.specs] : [{ key: 'spec-1', label: 'Potência', value: item.capacity }]);
    setFormChecklist(
      item.maintenancePlan.checklistItems.length > 0
        ? [...item.maintenancePlan.checklistItems]
        : ['Inspeção técnica preventiva']
    );
    setFormSpareParts(
      item.commonSpareParts.length > 0
        ? [...item.commonSpareParts]
        : [{ code: 'PEC-01', description: 'Peça de reposição padrão', suggestedReplacementInterval: 'Trimestral' }]
    );
    setIsEditorOpen(true);
  };

  const handleSaveModelForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBrand.trim() || !formModel.trim()) return;

    const cleanSpecs = formSpecs.filter(s => s.label.trim() && s.value.trim());
    const cleanChecklist = formChecklist.map(c => c.trim()).filter(Boolean);
    const cleanParts = formSpareParts.filter(p => p.description.trim());

    const existingItem = catalog.find(c => c.id === editingId);

    const savedItem: MasterCatalogItem = {
      id: editingId || `cat-${Date.now()}`,
      category: formCategory.trim() || 'Industrial Geral',
      brand: formBrand.trim(),
      model: formModel.trim(),
      capacity: formCapacity.trim() || 'Padrão Industrial',
      manualPdfName:
        formManualPdfName.trim() ||
        `manual_${formBrand.toLowerCase().replace(/\s+/g, '_')}_${formModel.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      activeDeploymentsCount: existingItem?.activeDeploymentsCount || 0,
      specs:
        cleanSpecs.length > 0
          ? cleanSpecs
          : [{ key: 'cap', label: 'Capacidade', value: formCapacity.trim() || 'Padrão' }],
      maintenancePlan: {
        intervalMonths: Number(formIntervalMonths) || 3,
        intervalHours: Number(formIntervalHours) || 1000,
        legalNorm: formLegalNorm,
        checklistItems:
          cleanChecklist.length > 0
            ? cleanChecklist
            : ['Inspeção preventiva completa conforme manual do fabricante'],
        recommendedParts: cleanParts.map(p => `${p.description} (${p.code})`)
      },
      commonSpareParts:
        cleanParts.length > 0
          ? cleanParts
          : [
              {
                code: 'KIT-01',
                description: 'Kit Preventiva Padrão',
                suggestedReplacementInterval: `A cada ${formIntervalMonths} meses`
              }
            ]
    };

    if (onSaveCatalogItem) {
      onSaveCatalogItem(savedItem);
    }
    setIsEditorOpen(false);
  };

  const handleOpenDeploy = (item: MasterCatalogItem) => {
    setSelectedItem(item);
    setTargetTag(`${item.category.slice(0, 4).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`);
    setDeployModalOpen(true);
  };

  const handleConfirmDeploy = () => {
    if (!selectedItem || !targetClientId || !targetTag) return;
    onDeployToClient(selectedItem, targetClientId, targetTag);
    setDeployModalOpen(false);
  };

  const handleBatchOS = (item: MasterCatalogItem) => {
    if (!onGenerateBatchWorkOrders) return;
    const createdCount = onGenerateBatchWorkOrders(item);
    setBatchSuccessMessage(
      `${createdCount} Ordem(ns) de Serviço Preventiva gerada(s) automaticamente para o modelo ${item.brand} ${item.model}!`
    );
    setTimeout(() => setBatchSuccessMessage(null), 4500);
  };

  const categoriesList = useMemo(() => {
    const set = new Set<string>(DEFAULT_CATEGORIES);
    catalog.forEach(c => set.add(c.category));
    return Array.from(set);
  }, [catalog]);

  const filteredCatalog = useMemo(() => {
    return catalog.filter(item => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (normFilter !== 'all' && item.maintenancePlan.legalNorm !== normFilter) return false;
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.capacity.toLowerCase().includes(q) ||
        item.commonSpareParts.some(p => p.description.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
      );
    });
  }, [catalog, categoryFilter, normFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header + Botão Principal de Cadastro */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Layers className="w-3.5 h-3.5" />
            Catálogo Mestre Centralizado (Biblioteca de Engenharia)
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Modelos Padrão & Herança de Inteligência Técnica
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Cadastre os manuais, fichas técnicas, peças de reposição e planos preventivos uma única
            vez. Ao implantar o modelo em qualquer cliente ou setor, todos os dados técnicos,
            checklists e requisitos de normas (PMOC, NR-13, NR-12) são herdados em 1 clique.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
          <div className="px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {catalog.length}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-bold mt-1 block">
              Modelos Homologados
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenNewModel}
            className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Modelo Mestre
          </button>
        </div>
      </div>

      {/* Feedback de Geração de OS em Lote */}
      {batchSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{batchSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setBatchSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Busca e Filtros do Catálogo */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar modelo por marca, código, capacidade ou peça de reposição..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 focus:bg-white rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-medium outline-none"
          >
            <option value="all">Todas as Categorias</option>
            {categoriesList.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={normFilter}
            onChange={e => setNormFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 font-medium outline-none"
          >
            <option value="all">Todas as Normas (NR / PMOC)</option>
            <option value="NR-13">NR-13 (Vasos de Pressão / Caldeiras)</option>
            <option value="PMOC">PMOC (Climatização / HVAC)</option>
            <option value="NR-12">NR-12 (Segurança em Máquinas)</option>
            <option value="NR-10">NR-10 (Instalações Elétricas)</option>
          </select>
        </div>
      </div>

      {/* Grid de Modelos do Catálogo Mestre */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCatalog.map((item) => {
          // Conta quantas máquinas reais no Parque de Máquinas usam este modelo
          const realInstalledCount = equipments.filter(
            eq =>
              eq.model.toLowerCase() === item.model.toLowerCase() ||
              eq.brand.toLowerCase() === item.brand.toLowerCase()
          ).length;
          const totalDeployed = Math.max(realInstalledCount, item.activeDeploymentsCount || 0);

          return (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Topo: Categoria, Norma Legal & Ações Rápidas */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                      {item.category}
                    </span>
                    {item.maintenancePlan.legalNorm && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-amber-600" />
                        {item.maintenancePlan.legalNorm}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {totalDeployed} Máquinas Ativas
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModel(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                      title="Editar Ficha Técnica, Peças e Checklist deste Modelo"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Título, Marca, Capacidade e Manual */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {item.brand} • {item.model}
                    </h3>
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                      Capacidade Nominal: {item.capacity} • Preventiva a cada{' '}
                      {item.maintenancePlan.intervalMonths} meses
                      {item.maintenancePlan.intervalHours
                        ? ` (${item.maintenancePlan.intervalHours}h)`
                        : ''}
                    </p>
                  </div>

                  {item.manualPdfName && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold shrink-0"
                      title="Manual Técnico Homologado"
                    >
                      <FileText className="w-3 h-3 text-blue-600" />
                      {item.manualPdfName}
                    </span>
                  )}
                </div>

                {/* Especificações Técnicas */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {item.specs.map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs"
                    >
                      <span className="text-[10px] text-slate-500 font-medium block">
                        {spec.label}
                      </span>
                      <span className="text-xs font-bold text-slate-900 truncate block">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Checklist Preventivo Padrão (Herdado pelas OSs) */}
                {item.maintenancePlan.checklistItems?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Checklist Preventivo Padrão ({item.maintenancePlan.checklistItems.length}{' '}
                      tarefas):
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {item.maintenancePlan.checklistItems.slice(0, 4).map((chk, cIdx) => (
                        <div
                          key={cIdx}
                          className="text-[11px] text-slate-700 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/70 flex items-center gap-2"
                        >
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {cIdx + 1}
                          </span>
                          <span className="truncate">{chk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Peças de Desgaste Periódico Homologadas */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Peças de Reposição Homologadas (BOM):
                  </span>
                  <div className="space-y-1.5">
                    {item.commonSpareParts.map((part, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold shrink-0">
                            {part.code}
                          </span>
                          <span className="font-bold text-slate-800 truncate">
                            {part.description}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 font-medium shrink-0 ml-2">
                          {part.suggestedReplacementInterval}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Modelo */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenDeploy(item)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Implantar em Cliente
                </button>

                {onGenerateBatchWorkOrders && (
                  <button
                    type="button"
                    onClick={() => handleBatchOS(item)}
                    className="py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer"
                    title="Gerar Ordens de Serviço Preventivas para todas as máquinas deste modelo"
                  >
                    <CalendarPlus className="w-4 h-4 text-emerald-600" />
                    Gerar OS Preventiva
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenEditModel(item)}
                  className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                  title="Editar Modelo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {onDeleteItem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Deseja realmente remover o modelo "${item.brand} ${item.model}" do Catálogo Mestre?`
                        )
                      ) {
                        onDeleteItem(item.id);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition shadow-2xs cursor-pointer"
                    title="Excluir Modelo do Catálogo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ====================================================================
          MODAL COMPLETO DE CADASTRO / EDIÇÃO DE MODELO MESTRE
      ==================================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Engenharia de Manutenção • Padronização Técnica
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {editingId
                    ? 'Editar Modelo do Catálogo Mestre'
                    : 'Cadastrar Novo Modelo no Catálogo Mestre'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo do Formulário */}
            <form onSubmit={handleSaveModelForm} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* 1. Identificação do Modelo & Manual */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                  1. Identificação do Equipamento, Norma & Manual Técnico
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Categoria *</label>
                    <input
                      type="text"
                      list="catalog-categories"
                      required
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      placeholder="Ex: Compressor de Ar"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900"
                    />
                    <datalist id="catalog-categories">
                      {DEFAULT_CATEGORIES.map(c => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Fabricante / Marca *</label>
                    <input
                      type="text"
                      required
                      value={formBrand}
                      onChange={e => setFormBrand(e.target.value)}
                      placeholder="Ex: Atlas Copco, Schulz, WEG..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Modelo Comercial *</label>
                    <input
                      type="text"
                      required
                      value={formModel}
                      onChange={e => setFormModel(e.target.value)}
                      placeholder="Ex: GA 37 VSD+ / SRP 4030"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Capacidade Nominal *</label>
                    <input
                      type="text"
                      required
                      value={formCapacity}
                      onChange={e => setFormCapacity(e.target.value)}
                      placeholder="Ex: 50 HP / 210 PCM / 150 TR"
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Norma Legal Aplicável</label>
                    <select
                      value={formLegalNorm}
                      onChange={e => setFormLegalNorm(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900"
                    >
                      <option value="NR-13">NR-13 (Vasos de Pressão / Caldeiras)</option>
                      <option value="PMOC">PMOC (Climatização / Refrigeração)</option>
                      <option value="NR-12">NR-12 (Segurança de Máquinas)</option>
                      <option value="NR-10">NR-10 (Painéis e Subestações)</option>
                      <option value="Outro">Padrão Interno / ISO</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Manual Técnico (PDF / Doc)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={formManualPdfName}
                        onChange={e => setFormManualPdfName(e.target.value)}
                        placeholder="manual_equipamento.pdf"
                        className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-mono text-slate-800"
                      />
                      <label
                        className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 cursor-pointer shrink-0"
                        title="Selecionar arquivo PDF do computador"
                      >
                        <Upload className="w-4 h-4" />
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,image/*"
                          className="hidden"
                          onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) setFormManualPdfName(f.name);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Ficha Técnica (Especificações Elétricas e Mecânicas) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    2. Ficha Técnica Padrão (Herdada pelos Equipamentos)
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormSpecs(prev => [
                        ...prev,
                        { key: `spec-${Date.now()}`, label: '', value: '' }
                      ])
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Parâmetro
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {formSpecs.map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sp.label}
                        onChange={e =>
                          setFormSpecs(prev =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, label: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Parâmetro (ex: Tensão)"
                        className="w-2/5 p-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-700"
                      />
                      <input
                        type="text"
                        value={sp.value}
                        onChange={e =>
                          setFormSpecs(prev =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, value: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Valor (ex: 380V Trifásico)"
                        className="flex-1 p-2 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setFormSpecs(prev => prev.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Plano Preventivo & Checklist Padrão */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1.5">
                  3. Plano Preventivo & Checklist de Inspeção
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Periodicidade Preventiva (Meses)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formIntervalMonths}
                      onChange={e => setFormIntervalMonths(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Periodicidade por Horímetro (Horas)
                    </label>
                    <input
                      type="number"
                      min={50}
                      step={50}
                      value={formIntervalHours}
                      onChange={e => setFormIntervalHours(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">
                    Tarefas do Checklist Preventivo (serão inseridas automaticamente nas OSs):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formNewChecklistItem}
                      onChange={e => setFormNewChecklistItem(e.target.value)}
                      placeholder="Digite uma nova tarefa de inspeção e clique em + Adicionar..."
                      className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!formNewChecklistItem.trim()) return;
                        setFormChecklist(prev => [...prev, formNewChecklistItem.trim()]);
                        setFormNewChecklistItem('');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer shrink-0"
                    >
                      + Adicionar Tarefa
                    </button>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {formChecklist.map((task, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200"
                      >
                        <span className="font-medium text-slate-800">
                          {idx + 1}. {task}
                        </span>
                        <button
                          type="button"
                          onClick={() => setFormChecklist(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Peças de Reposição Homologadas (BOM) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    4. Peças de Desgaste & Reposição Homologadas
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setFormSpareParts(prev => [
                        ...prev,
                        {
                          code: `PEC-0${prev.length + 1}`,
                          description: '',
                          suggestedReplacementInterval: 'A cada 1.000h'
                        }
                      ])
                    }
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Peça
                  </button>
                </div>

                <div className="space-y-2">
                  {formSpareParts.map((part, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        value={part.code}
                        onChange={e =>
                          setFormSpareParts(prev =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, code: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Código (ex: FL-0402)"
                        className="sm:col-span-3 p-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        value={part.description}
                        onChange={e =>
                          setFormSpareParts(prev =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, description: e.target.value } : item
                            )
                          )
                        }
                        placeholder="Descrição da peça (ex: Elemento Separador de Ar/Óleo)"
                        className="sm:col-span-5 p-2 rounded-xl bg-slate-50 border border-slate-300 font-semibold text-slate-900"
                      />
                      <input
                        type="text"
                        value={part.suggestedReplacementInterval}
                        onChange={e =>
                          setFormSpareParts(prev =>
                            prev.map((item, i) =>
                              i === idx
                                ? { ...item, suggestedReplacementInterval: e.target.value }
                                : item
                            )
                          )
                        }
                        placeholder="Troca (ex: A cada 2.000h)"
                        className="sm:col-span-3 p-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormSpareParts(prev => prev.filter((_, i) => i !== idx))
                        }
                        className="sm:col-span-1 p-2 text-slate-400 hover:text-rose-600 flex justify-center cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões Finais do Modal */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20 cursor-pointer"
                >
                  {editingId ? 'Salvar Alterações no Catálogo' : 'Homologar Modelo no Catálogo Mestre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deploy to Client Modal */}
      {deployModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                Implantar {selectedItem.brand} {selectedItem.model}
              </h3>
              <button
                onClick={() => setDeployModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              O equipamento herdará todos os parâmetros elétricos, mecânicos, checklist e o plano
              preventivo cadastrado no Catálogo Mestre.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Cliente de Destino</label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">TAG do Ativo</label>
                <input
                  type="text"
                  value={targetTag}
                  onChange={(e) => setTargetTag(e.target.value)}
                  placeholder="Ex: COMP-04"
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeployModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeploy}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-blue-600/20 cursor-pointer"
              >
                Confirmar Implantação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
