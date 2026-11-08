'use client';

import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  Sparkles,
  CheckCircle2,
  X,
  Building2,
  Cpu,
  Layers,
  Calendar,
  Plus,
  Trash2,
  FileText,
  Edit3,
  Wrench,
  RefreshCw,
} from 'lucide-react';
import {
  Equipment,
  ClientContractor,
  MasterCatalogItem,
  EquipmentSpec,
  EquipmentServiceItem,
  ServiceItemStatus,
} from '../types';
import { MAQUINA_01_SERVICE_ITEMS } from '../mock-data';

interface SmartDocumentImporterModalProps {
  tintedGlass?: boolean;
  isOpen: boolean;
  onClose: () => void;
  clients: ClientContractor[];
  masterCatalog: MasterCatalogItem[];
  onImportEquipment: (equipment: Equipment) => void;
  onSaveCatalogItem?: (item: MasterCatalogItem) => void;
  editingEquipment?: Equipment | null;
}

export const SmartDocumentImporterModal: React.FC<SmartDocumentImporterModalProps> = ({
  tintedGlass = false,
  isOpen,
  onClose,
  clients,
  masterCatalog,
  onImportEquipment,
  onSaveCatalogItem,
  editingEquipment,
}) => {
  const [entryMode, setEntryMode] = useState<'manual' | 'ocr'>('manual');
  const [selectedCatalogModelId, setSelectedCatalogModelId] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [saveToMasterCatalog, setSaveToMasterCatalog] = useState<boolean>(false);

  // Client & Branch
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    clients[0]?.branches[0]?.id || ''
  );

  // Form fields
  const [tag, setTag] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Compressor de Ar');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [manufacturingYear, setManufacturingYear] = useState<number>(new Date().getFullYear());
  const [capacity, setCapacity] = useState<string>('');
  const [locationInPlant, setLocationInPlant] = useState<string>('');
  const [criticality, setCriticality] = useState<'high' | 'medium' | 'low'>('medium');
  const [intervalMonths, setIntervalMonths] = useState<number>(3);
  const [legalNorm, setLegalNorm] = useState<'PMOC' | 'NR-10' | 'NR-12' | 'NR-13' | 'Outro'>(
    'NR-12'
  );
  const [lastServiceDate, setLastServiceDate] = useState<string>('N/A');
  const [nextPreventiveDate, setNextPreventiveDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [serviceItems, setServiceItems] = useState<EquipmentServiceItem[]>([]);

  const [specs, setSpecs] = useState<EquipmentSpec[]>([
    { key: 'power', label: 'Potência / Capacidade', value: '' },
    { key: 'voltage', label: 'Tensão Elétrica', value: '380V Trifásico' },
  ]);

  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Inspeção visual geral, ruídos e vibrações',
    'Verificação de conexões elétricas e reapertos',
    'Limpeza e verificação de filtros/lubrificação',
  ]);

  const [recommendedParts, setRecommendedParts] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editingEquipment) {
        setEntryMode('manual');
        setSelectedClientId(editingEquipment.clientId);
        setSelectedBranchId(editingEquipment.branchId);
        setTag(editingEquipment.tag);
        setName(editingEquipment.name);
        setCategory(editingEquipment.category);
        setBrand(editingEquipment.brand);
        setModel(editingEquipment.model);
        setSerialNumber(editingEquipment.serialNumber);
        setManufacturingYear(editingEquipment.manufacturingYear || new Date().getFullYear());
        setCapacity(editingEquipment.capacity || '');
        setLocationInPlant(editingEquipment.locationInPlant);
        setCriticality(editingEquipment.criticality);
        setLastServiceDate(editingEquipment.lastServiceDate || 'N/A');
        setNextPreventiveDate(editingEquipment.nextPreventiveDate || 'N/A');
        setIntervalMonths(
          editingEquipment.maintenancePlan?.intervalMonths !== undefined
            ? editingEquipment.maintenancePlan.intervalMonths
            : 3
        );
        setLegalNorm(editingEquipment.maintenancePlan?.legalNorm || 'NR-12');
        setServiceItems(
          editingEquipment.serviceItems && editingEquipment.serviceItems.length > 0
            ? editingEquipment.serviceItems.map((si) => ({ ...si }))
            : []
        );
        setSpecs(
          editingEquipment.specs && editingEquipment.specs.length > 0
            ? [...editingEquipment.specs]
            : [{ key: 'power', label: 'Potência', value: '' }]
        );
        setChecklistItems(
          editingEquipment.maintenancePlan?.checklistItems?.length
            ? [...editingEquipment.maintenancePlan.checklistItems]
            : ['Inspeção geral de segurança e funcionamento']
        );
        setRecommendedParts(
          editingEquipment.maintenancePlan?.recommendedParts
            ? [...editingEquipment.maintenancePlan.recommendedParts]
            : []
        );
        setSaveToMasterCatalog(false);
      } else {
        setEntryMode('manual');
        setSelectedCatalogModelId('');
        setUploadedFileName('');
        const defaultClient = clients[0];
        setSelectedClientId(defaultClient?.id || '');
        setSelectedBranchId(defaultClient?.branches[0]?.id || '');
        setTag(`MAQ-${Math.floor(10 + Math.random() * 89)}`);
        setName('');
        setCategory('Envase & Embalagem Industrial');
        setBrand('');
        setModel('');
        setSerialNumber('');
        setManufacturingYear(new Date().getFullYear());
        setCapacity('');
        setLocationInPlant('Galpão Principal');
        setCriticality('medium');
        setIntervalMonths(0.5);
        setLegalNorm('NR-12');
        setLastServiceDate('N/A');
        setNextPreventiveDate(
          new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        );
        setServiceItems([
          {
            id: `si-init-1`,
            serviceOrPartName: 'Preventiva a cada 15 dias',
            lastRevisionDate: 'N/A',
            nextRevisionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
            status: 'Agendada',
            intervalDays: 15,
          },
        ]);
        setSpecs([
          { key: 'power', label: 'Potência / Capacidade', value: '' },
          { key: 'voltage', label: 'Tensão Elétrica', value: '380V Trifásico' },
        ]);
        setChecklistItems([
          'Inspeção visual geral, ruídos e vibrações',
          'Verificação de conexões elétricas e reapertos',
          'Limpeza e verificação de filtros/lubrificação',
        ]);
        setRecommendedParts([]);
        setSaveToMasterCatalog(false);
      }
    }
  }, [isOpen, editingEquipment, clients]);

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleClientChange = (newClientId: string) => {
    setSelectedClientId(newClientId);
    const client = clients.find((c) => c.id === newClientId);
    if (client && client.branches.length > 0) {
      setSelectedBranchId(client.branches[0].id);
    }
  };

  const handleApplyCatalogTemplate = (catalogId: string) => {
    setSelectedCatalogModelId(catalogId);
    const item = masterCatalog.find((m) => m.id === catalogId);
    if (!item) return;

    setCategory(item.category);
    setBrand(item.brand);
    setModel(item.model);
    setCapacity(item.capacity);
    if (!name.trim()) {
      setName(`${item.category} ${item.brand} ${item.model}`);
    }
    setSpecs(item.specs.length > 0 ? [...item.specs] : []);
    if (item.serviceItems && item.serviceItems.length > 0) {
      setServiceItems(item.serviceItems.map((si, idx) => ({ ...si, id: `si-cat-${Date.now()}-${idx}` })));
    }
    const months = item.maintenancePlan.intervalMonths !== undefined ? item.maintenancePlan.intervalMonths : 3;
    setIntervalMonths(months);
    if (item.maintenancePlan.legalNorm) {
      setLegalNorm(item.maintenancePlan.legalNorm);
    }
    setChecklistItems(
      item.maintenancePlan.checklistItems.length > 0
        ? [...item.maintenancePlan.checklistItems]
        : ['Inspeção geral preventiva']
    );
    setRecommendedParts(
      item.commonSpareParts?.map((p) => `${p.description} (${p.code})`) ||
        item.maintenancePlan.recommendedParts ||
        []
    );

    if (months === 0) {
      setNextPreventiveDate('N/A');
    } else if (months < 1) {
      const days = Math.round(months * 30);
      const nextDt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      setNextPreventiveDate(nextDt.toISOString().split('T')[0]);
    } else {
      const nextDt = new Date();
      nextDt.setMonth(nextDt.getMonth() + months);
      setNextPreventiveDate(nextDt.toISOString().split('T')[0]);
    }
  };

  const handleIntervalMonthsChange = (months: number) => {
    setIntervalMonths(months);
    if (months === 0) {
      setNextPreventiveDate('N/A');
      return;
    }
    if (months < 1) {
      const days = months === 0.25 ? 7 : 15;
      const nextDt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      setNextPreventiveDate(nextDt.toISOString().split('T')[0]);
      return;
    }
    const nextDt = new Date();
    nextDt.setMonth(nextDt.getMonth() + months);
    setNextPreventiveDate(nextDt.toISOString().split('T')[0]);
  };

  const handleAddServiceItem = () => {
    setServiceItems((prev) => [
      ...prev,
      {
        id: `si-${Date.now()}-${prev.length + 1}`,
        serviceOrPartName: '',
        lastRevisionDate: 'N/A',
        nextRevisionDate: 'N/A',
        status: 'Em operação',
      },
    ]);
  };

  const handleRemoveServiceItem = (idx: number) => {
    setServiceItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateServiceItem = (
    idx: number,
    field: keyof EquipmentServiceItem,
    value: string | number
  ) => {
    setServiceItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleLoadMaquina01Example = () => {
    if (!name.trim()) setName('Máquina 01 (Linha de Envase)');
    if (!tag.trim() || tag.startsWith('TAG-')) setTag('MAQ-01');
    if (!brand.trim()) setBrand('InoxPack');
    if (!model.trim()) setModel('Envasadora Rotativa M-01');
    setCategory('Envase & Embalagem Industrial');
    setIntervalMonths(0.5);
    setLastServiceDate('2026-08-05');
    setNextPreventiveDate('2026-08-10');
    const cloned = MAQUINA_01_SERVICE_ITEMS.map((item, idx) => ({
      ...item,
      id: `si-m01-${Date.now()}-${idx}`,
    }));
    setServiceItems(cloned);
    setChecklistItems(cloned.map((c) => c.serviceOrPartName));
  };

  const handleSyncDatesFromServiceItems = () => {
    const validNextDates = serviceItems
      .map((s) => s.nextRevisionDate)
      .filter((d) => d && d !== 'N/A' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort();
    const validLastDates = serviceItems
      .map((s) => s.lastRevisionDate)
      .filter((d) => d && d !== 'N/A' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort();

    if (validNextDates.length > 0) {
      setNextPreventiveDate(validNextDates[0]);
    } else {
      setNextPreventiveDate('N/A');
    }
    if (validLastDates.length > 0) {
      setLastServiceDate(validLastDates[validLastDates.length - 1]);
    }
    const itemNames = serviceItems.map((s) => s.serviceOrPartName.trim()).filter(Boolean);
    if (itemNames.length > 0) {
      setChecklistItems(itemNames);
    }
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setIsProcessing(true);

    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const lowerName = baseName.toLowerCase();

    setProcessStep('Lendo arquivo enviado e identificando parâmetros técnicos...');
    setTimeout(() => {
      setProcessStep('Preenchendo formulário cadastral para conferência...');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessStep('');

        const matchedCatalog = masterCatalog.find(
          (m) =>
            lowerName.includes(m.brand.toLowerCase()) ||
            lowerName.includes(m.model.toLowerCase())
        );

        if (matchedCatalog) {
          handleApplyCatalogTemplate(matchedCatalog.id);
        } else {
          if (!name.trim()) setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
          if (lowerName.includes('chiller') || lowerName.includes('ar')) {
            setCategory('Climatização & Refrigeração');
            setLegalNorm('PMOC');
          } else if (lowerName.includes('compressor') || lowerName.includes('vaso')) {
            setCategory('Compressor de Ar');
            setLegalNorm('NR-13');
          } else if (lowerName.includes('gerador') || lowerName.includes('painel')) {
            setCategory('Geração de Energia');
            setLegalNorm('NR-10');
          }
        }

        setEntryMode('manual');
      }, 650);
    }, 500);
  };

  const handleAddSpec = () => {
    setSpecs([...specs, { key: `spec-${Date.now()}`, label: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const handleRemoveChecklistItem = (idx: number) => {
    if (checklistItems.length <= 1) return;
    setChecklistItems(checklistItems.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !tag.trim() || !name.trim()) return;

    const branch =
      currentClient.branches.find((b) => b.id === selectedBranchId) ||
      currentClient.branches[0];

    const cleanedSpecs = specs.filter((s) => s.label.trim() !== '' || s.value.trim() !== '');
    const cleanedServiceItems = serviceItems
      .filter((s) => s.serviceOrPartName.trim() !== '')
      .map((s) => ({
        ...s,
        serviceOrPartName: s.serviceOrPartName.trim(),
        lastRevisionDate: s.lastRevisionDate || 'N/A',
        nextRevisionDate: s.nextRevisionDate || 'N/A',
      }));

    const cleanedChecklist =
      checklistItems.map((c) => c.trim()).filter(Boolean).length > 0
        ? checklistItems.map((c) => c.trim()).filter(Boolean)
        : cleanedServiceItems.map((s) => s.serviceOrPartName);

    // Se houver itens na matriz com data válida e a data geral estiver N/A ou vazia, ou para manter sincronizado:
    const validItemNextDates = cleanedServiceItems
      .map((s) => s.nextRevisionDate)
      .filter((d) => d && d !== 'N/A' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort();

    const finalNextDate =
      nextPreventiveDate && nextPreventiveDate !== 'N/A'
        ? nextPreventiveDate
        : validItemNextDates[0] || 'N/A';

    const newEquipment: Equipment = {
      id: editingEquipment?.id || `eq-${Date.now()}`,
      clientId: currentClient.id,
      clientName: currentClient.name,
      branchId: branch?.id || 'branch-1',
      branchName: branch?.name || 'Matriz',
      tag: tag.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim() || 'Industrial',
      brand: brand.trim() || 'Industrial',
      model: model.trim() || 'Padrão',
      serialNumber: serialNumber.trim() || `SN-${Date.now().toString().slice(-6)}`,
      manufacturingYear: Number(manufacturingYear) || new Date().getFullYear(),
      capacity: capacity.trim(),
      locationInPlant: locationInPlant.trim() || 'Planta Principal',
      criticality,
      status: editingEquipment?.status || 'operational',
      lastServiceDate: lastServiceDate && lastServiceDate !== 'N/A' ? lastServiceDate : 'N/A',
      nextPreventiveDate: finalNextDate,
      specs: cleanedSpecs,
      serviceItems: cleanedServiceItems,
      maintenancePlan: {
        intervalMonths: Number(intervalMonths),
        intervalDays:
          intervalMonths === 0.25
            ? 7
            : intervalMonths === 0.5
            ? 15
            : Math.round(Number(intervalMonths) * 30),
        legalNorm,
        checklistItems:
          cleanedChecklist.length > 0 ? cleanedChecklist : ['Inspeção preventiva periódica'],
        recommendedParts: recommendedParts.filter(Boolean),
      },
      qrCodeId:
        editingEquipment?.qrCodeId ||
        `QR-${tag.trim().toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: uploadedFileName
        ? `Documento anexado: ${uploadedFileName}`
        : editingEquipment?.notes || `Cadastrado em ${new Date().toLocaleDateString('pt-BR')}`,
    };

    onImportEquipment(newEquipment);

    if (saveToMasterCatalog && onSaveCatalogItem && brand.trim() && model.trim()) {
      const catalogItem: MasterCatalogItem = {
        id: `cat-imp-${Date.now()}`,
        category: newEquipment.category,
        brand: newEquipment.brand,
        model: newEquipment.model,
        capacity: newEquipment.capacity || 'Padrão Industrial',
        manualPdfName: uploadedFileName || undefined,
        activeDeploymentsCount: 1,
        specs: newEquipment.specs,
        serviceItems: newEquipment.serviceItems,
        maintenancePlan: newEquipment.maintenancePlan,
        commonSpareParts: newEquipment.maintenancePlan.recommendedParts.map((p, idx) => ({
          code: `PEC-0${idx + 1}`,
          description: p,
          suggestedReplacementInterval:
            newEquipment.maintenancePlan.intervalMonths === 0.5
              ? 'A cada 15 dias'
              : newEquipment.maintenancePlan.intervalMonths === 0.25
              ? 'A cada 7 dias'
              : `A cada ${newEquipment.maintenancePlan.intervalMonths} meses`,
        })),
      };
      onSaveCatalogItem(catalogItem);
    }

    onClose();
  };

  const inputClass = tintedGlass
    ? 'aptis-glass-input text-white placeholder:text-slate-500'
    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500';

  const labelClass = `text-xs font-bold ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 ${
          tintedGlass
            ? 'aptis-glass-modal text-white'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex items-center justify-between ${
            tintedGlass ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center border border-white/25"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                {editingEquipment
                  ? `Editar Equipamento • [${editingEquipment.tag}]`
                  : 'Cadastrar Nova Máquina no Parque'}
              </h2>
              <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Preencha os dados diretamente, puxe um modelo do Catálogo Mestre ou anexe um documento/foto opcional
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/70'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Bar */}
        {!editingEquipment && (
          <div
            className={`px-6 py-3 border-b flex flex-wrap items-center justify-between gap-3 ${
              tintedGlass ? 'bg-white/[0.01] border-white/10' : 'bg-slate-50/60 border-slate-200'
            }`}
          >
            <div className="aptis-meniscus-track flex items-center p-1 rounded-full gap-1">
              <button
                type="button"
                onClick={() => setEntryMode('manual')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  entryMode === 'manual' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
                style={
                  entryMode === 'manual'
                    ? {
                        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                        boxShadow: '0 0 16px rgba(6, 182, 212, 0.45)',
                      }
                    : undefined
                }
              >
                <Edit3 className="w-3.5 h-3.5" />
                1. Cadastro Direto (Formulário)
              </button>
              <button
                type="button"
                onClick={() => setEntryMode('ocr')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  entryMode === 'ocr' ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
                style={
                  entryMode === 'ocr'
                    ? {
                        background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                        boxShadow: '0 0 16px rgba(6, 182, 212, 0.45)',
                      }
                    : undefined
                }
              >
                <UploadCloud className="w-3.5 h-3.5" />
                2. Anexar Plaqueta / PDF (Opcional)
              </button>
            </div>

            {/* Puxar do Catálogo Mestre */}
            {masterCatalog.length > 0 && (
              <div className="flex items-center gap-2">
                <Layers
                  className={`w-3.5 h-3.5 shrink-0 ${
                    tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                  }`}
                />
                <span
                  className={`text-[11px] font-bold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Puxar do Catálogo Mestre:
                </span>
                <select
                  value={selectedCatalogModelId}
                  onChange={(e) => handleApplyCatalogTemplate(e.target.value)}
                  className={`text-xs rounded-xl px-3 py-1.5 font-bold outline-none transition ${
                    tintedGlass
                      ? 'aptis-glass-input text-cyan-300'
                      : 'bg-white border border-slate-300 text-blue-700 focus:border-blue-500'
                  }`}
                >
                  <option value="">-- Preencher manualmente --</option>
                  {masterCatalog.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.brand} {m.model} ({m.capacity})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {entryMode === 'ocr' && (
            <div className="space-y-4">
              {isProcessing ? (
                <div
                  className={`py-14 text-center space-y-4 rounded-2xl ${
                    tintedGlass
                      ? 'aptis-glass-subcard'
                      : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <div className="relative mx-auto w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-cyan-500">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4
                      className={`text-sm font-bold ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Lendo Documento...
                    </h4>
                    <p
                      className={`text-xs font-semibold ${
                        tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                      }`}
                    >
                      {processStep}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-2xl p-10 text-center transition relative cursor-pointer group ${
                    tintedGlass
                      ? 'border-cyan-400/40 hover:border-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10'
                      : 'border-blue-300 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/80'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleCustomUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className={`mx-auto w-14 h-14 rounded-2xl group-hover:scale-105 border flex items-center justify-center mb-3 transition ${
                      tintedGlass
                        ? 'bg-cyan-500/20 border-cyan-400/35 text-cyan-300'
                        : 'bg-blue-100 border-blue-200 text-blue-600'
                    }`}
                  >
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h4
                    className={`text-sm font-bold ${
                      tintedGlass ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Clique ou arraste a foto da plaqueta, manual PDF ou nota fiscal
                  </h4>
                  <p
                    className={`text-xs mt-1 ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    Após selecionar o arquivo, você será levado automaticamente ao formulário para revisar e complementar os dados.
                  </p>
                </div>
              )}
            </div>
          )}

          {entryMode === 'manual' && (
            <div className="space-y-5">
              {uploadedFileName && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    tintedGlass
                      ? 'bg-cyan-500/15 border-cyan-400/35 text-cyan-200'
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    <FileText
                      className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`}
                    />
                    <span>
                      Arquivo vinculado: <strong>{uploadedFileName}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFileName('')}
                    className={`text-[11px] font-bold cursor-pointer ${
                      tintedGlass
                        ? 'text-slate-300 hover:text-rose-400'
                        : 'text-slate-600 hover:text-red-600'
                    }`}
                  >
                    Remover anexo
                  </button>
                </div>
              )}

              {/* 1. Cliente e Planta */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div>
                  <label className={`${labelClass} flex items-center gap-1.5 mb-1.5`}>
                    <Building2
                      className={`w-3.5 h-3.5 ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    />
                    Cliente Proprietário / Contratante *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 font-semibold outline-none transition ${inputClass}`}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.segment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`${labelClass} flex items-center gap-1.5 mb-1.5`}>
                    <Building2
                      className={`w-3.5 h-3.5 ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    />
                    Unidade / Planta Fabril *
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 font-semibold outline-none transition ${inputClass}`}
                  >
                    {currentClient?.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} - {b.city}/{b.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Identificação do Equipamento */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                <div>
                  <label className={labelClass}>TAG do Ativo *</label>
                  <input
                    type="text"
                    required
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="Ex: COMP-01"
                    className={`w-full text-xs rounded-xl p-2.5 font-mono font-bold mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Nome / Descrição do Equipamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Compressor de Parafuso 40HP ou Chiller Central"
                    className={`w-full text-xs rounded-xl p-2.5 font-semibold mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ex: Compressor, Chiller, Bomba..."
                    className={`w-full text-xs rounded-xl p-2.5 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Marca / Fabricante *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ex: Schulz, Atlas Copco, WEG..."
                    className={`w-full text-xs rounded-xl p-2.5 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Modelo *</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="Ex: SRP 4030 E"
                    className={`w-full text-xs rounded-xl p-2.5 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Nº de Série</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="Ex: SN-2025-8841"
                    className={`w-full text-xs rounded-xl p-2.5 font-mono mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div>
                  <label className={labelClass}>Capacidade Nominal</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="Ex: 40 HP / 150 TR / 250 kVA"
                    className={`w-full text-xs rounded-xl p-2.5 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Localização Física na Planta *
                  </label>
                  <input
                    type="text"
                    required
                    value={locationInPlant}
                    onChange={(e) => setLocationInPlant(e.target.value)}
                    placeholder="Ex: Galpão 02 - Sala de Utilidades"
                    className={`w-full text-xs rounded-xl p-2.5 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Criticidade Operacional
                  </label>
                  <select
                    value={criticality}
                    onChange={(e) =>
                      setCriticality(e.target.value as 'high' | 'medium' | 'low')
                    }
                    className={`w-full text-xs rounded-xl p-2.5 font-semibold mt-1 outline-none transition ${inputClass}`}
                  >
                    <option value="high">🚨 Alta (Parada Severa de Linha)</option>
                    <option value="medium">Média (Produção Regular)</option>
                    <option value="low">Baixa (Equipamento Auxiliar / Reserva)</option>
                  </select>
                </div>
              </div>

              {/* 3. Ciclo Preventivo, Matriz de Serviços/Peças e Próximo Vencimento */}
              <div
                className={`p-4 rounded-2xl border space-y-4 ${
                  tintedGlass
                    ? 'bg-emerald-500/10 border-emerald-400/30'
                    : 'bg-emerald-50/70 border-emerald-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`w-4 h-4 ${
                        tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        tintedGlass ? 'text-emerald-300' : 'text-emerald-800'
                      }`}
                    >
                      Plano Preventivo & Matriz de Serviços / Peças
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadMaquina01Example}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        tintedGlass
                          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/40'
                          : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-2xs'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Carregar Exemplo Máquina 01 (9 itens)
                    </button>
                    {serviceItems.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSyncDatesFromServiceItems}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border transition cursor-pointer ${
                          tintedGlass
                            ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/40'
                            : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                        title="Define a Última e Próxima Preventiva geral da máquina a partir das datas da tabela abaixo"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Sincronizar Vencimento pela Tabela
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label
                      className={`block text-[11px] font-bold mb-1 ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Periodicidade Padrão
                    </label>
                    <select
                      value={intervalMonths}
                      onChange={(e) => handleIntervalMonthsChange(Number(e.target.value))}
                      className={`w-full text-xs rounded-xl p-2 font-bold outline-none transition ${
                        tintedGlass
                          ? 'aptis-glass-input text-white'
                          : 'bg-white border border-emerald-300 text-slate-900 focus:border-emerald-500'
                      }`}
                    >
                      <option value={0.25}>Semanal (a cada 7 dias)</option>
                      <option value={0.5}>Quinzenal (a cada 15 dias)</option>
                      <option value={1}>Mensal (a cada 30 dias)</option>
                      <option value={2}>Bimestral (a cada 2 meses)</option>
                      <option value={3}>Trimestral (a cada 3 meses)</option>
                      <option value={6}>Semestral (a cada 6 meses)</option>
                      <option value={12}>Anual (a cada 12 meses)</option>
                      <option value={0}>Sob Demanda (N/A)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className={`text-[11px] font-bold ${
                          tintedGlass ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Última Revisão Geral
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setLastServiceDate(
                            lastServiceDate === 'N/A'
                              ? new Date().toISOString().split('T')[0]
                              : 'N/A'
                          )
                        }
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer border ${
                          lastServiceDate === 'N/A'
                            ? tintedGlass
                              ? 'bg-amber-500/25 text-amber-300 border-amber-400/40'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                            : tintedGlass
                            ? 'bg-white/10 text-slate-300 border-white/15'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {lastServiceDate === 'N/A' ? 'Definir Data' : 'Marcar N/A'}
                      </button>
                    </div>
                    {lastServiceDate === 'N/A' ? (
                      <div
                        className={`w-full text-xs rounded-xl p-2 font-mono font-bold text-center border ${
                          tintedGlass
                            ? 'bg-white/[0.04] border-white/15 text-slate-400'
                            : 'bg-white border-emerald-200 text-slate-500'
                        }`}
                      >
                        N/A (Sem registro anterior)
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={lastServiceDate}
                        onChange={(e) => setLastServiceDate(e.target.value || 'N/A')}
                        className={`w-full text-xs rounded-xl p-2 font-mono font-bold outline-none transition ${
                          tintedGlass
                            ? 'aptis-glass-input text-white'
                            : 'bg-white border border-emerald-300 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        className={`text-[11px] font-bold ${
                          tintedGlass ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Próxima Revisão Geral *
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setNextPreventiveDate(
                            nextPreventiveDate === 'N/A'
                              ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                                  .toISOString()
                                  .split('T')[0]
                              : 'N/A'
                          )
                        }
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded cursor-pointer border ${
                          nextPreventiveDate === 'N/A'
                            ? tintedGlass
                              ? 'bg-amber-500/25 text-amber-300 border-amber-400/40'
                              : 'bg-amber-100 text-amber-800 border-amber-300'
                            : tintedGlass
                            ? 'bg-white/10 text-slate-300 border-white/15'
                            : 'bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        {nextPreventiveDate === 'N/A' ? 'Definir Data' : 'Marcar N/A'}
                      </button>
                    </div>
                    {nextPreventiveDate === 'N/A' ? (
                      <div
                        className={`w-full text-xs rounded-xl p-2 font-mono font-bold text-center border ${
                          tintedGlass
                            ? 'bg-white/[0.04] border-white/15 text-slate-400'
                            : 'bg-white border-emerald-200 text-slate-500'
                        }`}
                      >
                        N/A (Sob Demanda)
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={nextPreventiveDate}
                        onChange={(e) => setNextPreventiveDate(e.target.value || 'N/A')}
                        className={`w-full text-xs rounded-xl p-2 font-mono font-bold outline-none transition ${
                          tintedGlass
                            ? 'aptis-glass-input text-emerald-300'
                            : 'bg-white border border-emerald-300 text-emerald-700 focus:border-emerald-500'
                        }`}
                      />
                    )}
                  </div>

                  <div>
                    <label
                      className={`block text-[11px] font-bold mb-1 ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Norma Técnica Aplicável
                    </label>
                    <select
                      value={legalNorm}
                      onChange={(e) => setLegalNorm(e.target.value as any)}
                      className={`w-full text-xs rounded-xl p-2 font-bold outline-none transition ${
                        tintedGlass
                          ? 'aptis-glass-input text-white'
                          : 'bg-white border border-emerald-300 text-slate-900 focus:border-emerald-500'
                      }`}
                    >
                      <option value="PMOC">PMOC (Climatização)</option>
                      <option value="NR-13">NR-13 (Vasos de Pressão / Caldeiras)</option>
                      <option value="NR-12">NR-12 (Segurança em Máquinas)</option>
                      <option value="NR-10">NR-10 (Instalações Elétricas / Geradores)</option>
                      <option value="Outro">Padrão Interno / Fabricante</option>
                    </select>
                  </div>
                </div>

                {/* MATRIZ INDIVIDUAL DE SERVIÇOS / PEÇAS (ESTILO PLANILHA MÁQUINA 01) */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-2.5 ${
                    tintedGlass
                      ? 'bg-slate-950/45 border-white/10'
                      : 'bg-white border-emerald-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span
                        className={`text-xs font-black flex items-center gap-1.5 ${
                          tintedGlass ? 'text-cyan-300' : 'text-slate-900'
                        }`}
                      >
                        <Wrench
                          className={`w-3.5 h-3.5 ${
                            tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                          }`}
                        />
                        Tabela de Serviços / Peças Monitoradas na Máquina ({serviceItems.length})
                      </span>
                      <p
                        className={`text-[11px] ${
                          tintedGlass ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Controle individualmente cada peça ou serviço (Ex: Diafragma do bico, Garra, Válvula do manifold, Preventiva 15 dias) com datas próprias ou N/A.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddServiceItem}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 cursor-pointer transition border ${
                        tintedGlass
                          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/35'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Serviço / Peça
                    </button>
                  </div>

                  {serviceItems.length === 0 ? (
                    <div
                      className={`text-center py-5 rounded-xl border border-dashed text-xs ${
                        tintedGlass
                          ? 'border-white/15 text-slate-400'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      Nenhum serviço/peça individual cadastrado. Clique em{' '}
                      <strong>&ldquo;+ Adicionar Serviço / Peça&rdquo;</strong> ou{' '}
                      <strong>&ldquo;Carregar Exemplo Máquina 01&rdquo;</strong>.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr
                            className={`border-b text-[10px] font-black uppercase tracking-wider ${
                              tintedGlass
                                ? 'border-white/10 text-slate-300 bg-white/[0.03]'
                                : 'border-slate-200 text-slate-700 bg-sky-50/80'
                            }`}
                          >
                            <th className="py-2 px-2.5 rounded-tl-lg">Serviços / Peças</th>
                            <th className="py-2 px-2.5 w-44">Última revisão</th>
                            <th className="py-2 px-2.5 w-44">Próxima revisão</th>
                            <th className="py-2 px-2.5 w-40">Status</th>
                            <th className="py-2 px-2 w-10 text-center rounded-tr-lg">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/40">
                          {serviceItems.map((row, idx) => (
                            <tr
                              key={row.id || idx}
                              className={
                                tintedGlass
                                  ? 'hover:bg-white/[0.03]'
                                  : idx % 2 === 0
                                  ? 'bg-white'
                                  : 'bg-sky-50/30'
                              }
                            >
                              {/* Col 1: Serviço / Peça */}
                              <td className="py-1.5 px-2">
                                <input
                                  type="text"
                                  value={row.serviceOrPartName}
                                  onChange={(e) =>
                                    handleUpdateServiceItem(
                                      idx,
                                      'serviceOrPartName',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Ex: Diafragma do bico, Garra..."
                                  className={`w-full text-xs rounded-lg px-2.5 py-1.5 font-semibold outline-none transition ${
                                    tintedGlass
                                      ? 'aptis-glass-input text-white placeholder:text-slate-500'
                                      : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                                  }`}
                                />
                              </td>

                              {/* Col 2: Última revisão (Date or N/A) */}
                              <td className="py-1.5 px-2">
                                <div className="flex items-center gap-1">
                                  {row.lastRevisionDate === 'N/A' ? (
                                    <span
                                      className={`flex-1 text-center py-1.5 px-2 rounded-lg font-mono font-bold text-xs border ${
                                        tintedGlass
                                          ? 'bg-white/[0.04] border-white/10 text-slate-400'
                                          : 'bg-slate-100 border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      N/A
                                    </span>
                                  ) : (
                                    <input
                                      type="date"
                                      value={row.lastRevisionDate}
                                      onChange={(e) =>
                                        handleUpdateServiceItem(
                                          idx,
                                          'lastRevisionDate',
                                          e.target.value || 'N/A'
                                        )
                                      }
                                      className={`flex-1 text-xs rounded-lg px-2 py-1 font-mono font-bold outline-none ${
                                        tintedGlass
                                          ? 'aptis-glass-input text-white'
                                          : 'bg-white border border-slate-300 text-slate-900'
                                      }`}
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateServiceItem(
                                        idx,
                                        'lastRevisionDate',
                                        row.lastRevisionDate === 'N/A'
                                          ? new Date().toISOString().split('T')[0]
                                          : 'N/A'
                                      )
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 transition ${
                                      row.lastRevisionDate === 'N/A'
                                        ? tintedGlass
                                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                        : tintedGlass
                                        ? 'bg-white/10 text-slate-300 border-white/15'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}
                                    title="Alternar entre Data e N/A"
                                  >
                                    {row.lastRevisionDate === 'N/A' ? 'Data' : 'N/A'}
                                  </button>
                                </div>
                              </td>

                              {/* Col 3: Próxima revisão (Date or N/A) */}
                              <td className="py-1.5 px-2">
                                <div className="flex items-center gap-1">
                                  {row.nextRevisionDate === 'N/A' ? (
                                    <span
                                      className={`flex-1 text-center py-1.5 px-2 rounded-lg font-mono font-bold text-xs border ${
                                        tintedGlass
                                          ? 'bg-white/[0.04] border-white/10 text-slate-400'
                                          : 'bg-slate-100 border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      N/A
                                    </span>
                                  ) : (
                                    <input
                                      type="date"
                                      value={row.nextRevisionDate}
                                      onChange={(e) =>
                                        handleUpdateServiceItem(
                                          idx,
                                          'nextRevisionDate',
                                          e.target.value || 'N/A'
                                        )
                                      }
                                      className={`flex-1 text-xs rounded-lg px-2 py-1 font-mono font-bold outline-none ${
                                        tintedGlass
                                          ? 'aptis-glass-input text-emerald-300'
                                          : 'bg-white border border-emerald-300 text-emerald-800'
                                      }`}
                                    />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateServiceItem(
                                        idx,
                                        'nextRevisionDate',
                                        row.nextRevisionDate === 'N/A'
                                          ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                                              .toISOString()
                                              .split('T')[0]
                                          : 'N/A'
                                      )
                                    }
                                    className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 transition ${
                                      row.nextRevisionDate === 'N/A'
                                        ? tintedGlass
                                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                        : tintedGlass
                                        ? 'bg-white/10 text-slate-300 border-white/15'
                                        : 'bg-slate-100 text-slate-600 border-slate-300'
                                    }`}
                                    title="Alternar entre Data e N/A"
                                  >
                                    {row.nextRevisionDate === 'N/A' ? 'Data' : 'N/A'}
                                  </button>
                                </div>
                              </td>

                              {/* Col 4: Status */}
                              <td className="py-1.5 px-2">
                                <select
                                  value={row.status}
                                  onChange={(e) =>
                                    handleUpdateServiceItem(
                                      idx,
                                      'status',
                                      e.target.value as ServiceItemStatus
                                    )
                                  }
                                  className={`w-full text-xs rounded-lg px-2 py-1.5 font-bold outline-none transition ${
                                    row.status === 'Em operação'
                                      ? tintedGlass
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35'
                                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                      : row.status === 'Agendada'
                                      ? tintedGlass
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/35'
                                        : 'bg-blue-50 text-blue-800 border border-blue-300'
                                      : row.status === 'Em manutenção'
                                      ? tintedGlass
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-400/35'
                                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                                      : tintedGlass
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-400/35'
                                      : 'bg-rose-50 text-rose-800 border border-rose-300'
                                  }`}
                                >
                                  <option value="Em operação" className="bg-slate-900 text-white">
                                    Em operação
                                  </option>
                                  <option value="Agendada" className="bg-slate-900 text-white">
                                    Agendada
                                  </option>
                                  <option value="Em manutenção" className="bg-slate-900 text-white">
                                    Em manutenção
                                  </option>
                                  <option value="Vencida" className="bg-slate-900 text-white">
                                    Vencida
                                  </option>
                                </select>
                              </td>

                              {/* Remove button */}
                              <td className="py-1.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveServiceItem(idx)}
                                  className={`p-1 rounded-lg cursor-pointer transition ${
                                    tintedGlass
                                      ? 'text-slate-400 hover:text-rose-400 hover:bg-white/10'
                                      : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                  title="Remover item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Checklist Items */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[11px] font-bold ${
                        tintedGlass ? 'text-emerald-200' : 'text-emerald-800'
                      }`}
                    >
                      Itens do Checklist da Ordem de Serviço (OS):
                    </span>
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                        tintedGlass
                          ? 'text-emerald-400 hover:text-emerald-300'
                          : 'text-emerald-700 hover:text-emerald-800'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Adicionar Item
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {checklistItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...checklistItems];
                            updated[idx] = e.target.value;
                            setChecklistItems(updated);
                          }}
                          placeholder="Ex: Verificar pressão de trabalho e vazamentos..."
                          className={`flex-1 text-xs rounded-lg px-3 py-1.5 outline-none transition ${
                            tintedGlass
                              ? 'aptis-glass-input text-white placeholder:text-slate-500'
                              : 'bg-white border border-emerald-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'
                          }`}
                        />
                        {checklistItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(idx)}
                            className={`p-1 cursor-pointer ${
                              tintedGlass
                                ? 'text-slate-400 hover:text-rose-400'
                                : 'text-slate-400 hover:text-red-600'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Especificações Técnicas */}
              <div
                className={`rounded-2xl p-4 space-y-2.5 ${
                  tintedGlass
                    ? 'aptis-glass-subcard'
                    : 'bg-slate-50 border border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu
                      className={`w-4 h-4 ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    />
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                      }`}
                    >
                      Especificações Técnicas (Opcional)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                      tintedGlass
                        ? 'text-cyan-400 hover:text-cyan-300'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Parâmetro
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {specs.map((sp, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sp.label}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].label = e.target.value;
                          setSpecs(updated);
                        }}
                        placeholder="Parâmetro (ex: Pressão Máx)"
                        className={`w-2/5 text-xs rounded-lg px-2.5 py-1.5 font-semibold outline-none transition ${
                          tintedGlass
                            ? 'aptis-glass-input text-slate-200 placeholder:text-slate-500'
                            : 'bg-white border border-slate-300 text-slate-700 placeholder:text-slate-400 focus:border-blue-500'
                        }`}
                      />
                      <input
                        type="text"
                        value={sp.value}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[idx].value = e.target.value;
                          setSpecs(updated);
                        }}
                        placeholder="Valor (ex: 10 bar)"
                        className={`flex-1 text-xs rounded-lg px-2.5 py-1.5 font-bold outline-none transition ${
                          tintedGlass
                            ? 'aptis-glass-input text-white placeholder:text-slate-500'
                            : 'bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className={`p-1 cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-rose-400'
                            : 'text-slate-400 hover:text-red-600'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opção de Homologação no Catálogo Mestre */}
              {!editingEquipment && (
                <label
                  className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition ${
                    tintedGlass
                      ? 'bg-cyan-500/10 border-cyan-400/30 hover:bg-cyan-500/15'
                      : 'bg-blue-50/70 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={saveToMasterCatalog}
                    onChange={(e) => setSaveToMasterCatalog(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                  <div className="text-xs">
                    <span
                      className={`font-bold flex items-center gap-1.5 ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      <Layers
                        className={`w-3.5 h-3.5 ${
                          tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                        }`}
                      />
                      Salvar também este modelo no Catálogo Mestre
                    </span>
                    <span
                      className={`block mt-0.5 ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      Guarda a ficha técnica e o checklist deste modelo ({brand || 'Marca'}{' '}
                      {model || 'Modelo'}) no Catálogo Mestre para reaproveitar em outros clientes.
                    </span>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className={`pt-4 border-t flex items-center justify-end gap-3 ${
              tintedGlass ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                tintedGlass
                  ? 'text-slate-300 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Cancelar
            </button>
            {entryMode === 'manual' && (
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center gap-2 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  boxShadow:
                    '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {editingEquipment ? 'Salvar Alterações da Máquina' : 'Cadastrar Máquina no Parque'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
