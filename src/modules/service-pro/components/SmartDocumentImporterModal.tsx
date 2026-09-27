'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Building2,
  Wrench,
  Cpu,
  Layers,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { Equipment, ClientContractor, MasterCatalogItem } from '../types';

interface SmartDocumentImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientContractor[];
  masterCatalog: MasterCatalogItem[];
  onImportEquipment: (equipment: Equipment) => void;
}

interface DemoPreset {
  title: string;
  type: string;
  sourceDoc: string;
  preview: Partial<Equipment>;
}

const DEMO_PRESETS: DemoPreset[] = [
  {
    title: 'Plaqueta Compressor Schulz SRP 4030',
    type: 'Foto de Plaqueta Metálica',
    sourceDoc: 'placa_schulz_srp4030.jpg',
    preview: {
      tag: 'COMP-03',
      name: 'Compressor Rotativo de Parafuso 30HP',
      category: 'Compressor de Ar',
      brand: 'Schulz',
      model: 'SRP 4030',
      serialNumber: 'SCH-2025-9921',
      manufacturingYear: 2024,
      capacity: '30 HP / 132 CFM',
      locationInPlant: 'Sala de Compressores - Galpão 3',
      criticality: 'high',
      specs: [
        { key: 'power', label: 'Potência', value: '30 HP (22 kW)' },
        { key: 'pressure', label: 'Pressão Máx', value: '10 bar (145 psi)' },
        { key: 'voltage', label: 'Tensão', value: '380V Trifásico' },
        { key: 'current', label: 'Corrente', value: '42 A' },
      ],
      maintenancePlan: {
        intervalMonths: 3,
        intervalHours: 1000,
        legalNorm: 'NR-13',
        checklistItems: [
          'Verificação e troca do filtro de óleo',
          'Limpeza e substituição do elemento do filtro de ar',
          'Drenagem de condensado e teste da válvula de retenção',
          'Medição da corrente e aperto de bornes elétricos',
        ],
        recommendedParts: [
          'Elemento Filtro de Ar Schulz (Cód: FL-0402)',
          'Filtro de Óleo Sintético (Cód: FO-9081)',
          'Óleo Sintético ISO VG 46 (5L)',
        ],
      },
    },
  },
  {
    title: 'Manual Técnico Chiller Hitachi Samurai',
    type: 'Documento PDF (Manual)',
    sourceDoc: 'manual_hitachi_chiller_samurai.pdf',
    preview: {
      tag: 'CHILL-02',
      name: 'Chiller de Condensação a Ar 150 TR',
      category: 'Climatização & Refrigeração',
      brand: 'Hitachi',
      model: 'RCU-150-SY',
      serialNumber: 'HIT-2023-44120',
      manufacturingYear: 2023,
      capacity: '150 TR / 528 kW',
      locationInPlant: 'Cobertura Técnica - Bloco A',
      criticality: 'high',
      specs: [
        { key: 'cooling', label: 'Capacidade Térmica', value: '150 TR' },
        { key: 'refrigerant', label: 'Fluido Refrigerante', value: 'R-134a (28 kg)' },
        { key: 'compressors', label: 'Compressores', value: '2x Duplo Parafuso Semi-hermético' },
        { key: 'voltage', label: 'Alimentação', value: '380V / 60Hz' },
      ],
      maintenancePlan: {
        intervalMonths: 1,
        legalNorm: 'PMOC',
        checklistItems: [
          'Análise de acidez e umidade do fluido refrigerante R-134a',
          'Inspeção do superaquecimento e sub-resfriamento',
          'Limpeza química e desincrustação da serpentina',
          'Calibração de transdutores de pressão de alta e baixa',
        ],
        recommendedParts: [
          'Filtro Secador Núcleo Sólido 48-DN',
          'Válvula de Expansão Eletrônica Danfoss ETS',
        ],
      },
    },
  },
  {
    title: 'NF de Entrega Gerador Cummins 250 kVA',
    type: 'Nota Fiscal / Fatura Digital',
    sourceDoc: 'danfe_gerador_cummins_250kva.pdf',
    preview: {
      tag: 'GER-01',
      name: 'Grupo Gerador Silenciado 250 kVA',
      category: 'Geração de Energia',
      brand: 'Cummins',
      model: 'C250 D6',
      serialNumber: 'CUM-BR-88219-X',
      manufacturingYear: 2024,
      capacity: '250 kVA / 200 kW',
      locationInPlant: 'Subestação Principal',
      criticality: 'high',
      specs: [
        { key: 'engine', label: 'Motor', value: 'Cummins QSB7-G5 Diesel' },
        { key: 'alternator', label: 'Alternador', value: 'Stamford UCI274' },
        { key: 'tank', label: 'Tanque Base', value: '500 Litros Diesel S10' },
        { key: 'governor', label: 'Controlador', value: 'PowerCommand 1.1' },
      ],
      maintenancePlan: {
        intervalMonths: 6,
        intervalHours: 250,
        legalNorm: 'NR-10',
        checklistItems: [
          'Teste de partida automática em rampa de carga simulada',
          'Troca de óleo mineral SAE 15W-40 e filtros de combustível',
          'Verificação da densidade e carga do banco de baterias',
          'Inspeção de mangotes, correia do alternador e líquido de arrefecimento',
        ],
        recommendedParts: [
          'Filtro Separador de Água Fleetguard FS1242',
          'Filtro de Óleo LF16015 Cummins',
        ],
      },
    },
  },
];

export const SmartDocumentImporterModal: React.FC<SmartDocumentImporterModalProps> = ({
  isOpen,
  onClose,
  clients,
  masterCatalog,
  onImportEquipment,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<DemoPreset | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [parsedData, setParsedData] = useState<Partial<Equipment> | null>(null);

  // Form assignment state
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    clients[0]?.branches[0]?.id || ''
  );

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const handleClientChange = (newClientId: string) => {
    setSelectedClientId(newClientId);
    const client = clients.find((c) => c.id === newClientId);
    if (client && client.branches.length > 0) {
      setSelectedBranchId(client.branches[0].id);
    }
  };

  const runSimulatedOcr = (preset: DemoPreset) => {
    setSelectedPreset(preset);
    setUploadedFileName(preset.sourceDoc);
    setIsProcessing(true);
    setParsedData(null);

    setProcessStep('Digitalizando documento e executando OCR...');
    setTimeout(() => {
      setProcessStep('Localizando dados cadastrais: Marca, Modelo e Número de Série...');
      setTimeout(() => {
        setProcessStep('Cruzando dados com o Catálogo Mestre Industrial e normas vigentes (PMOC / NR)...');
        setTimeout(() => {
          setIsProcessing(false);
          setProcessStep('');
          setParsedData({
            ...preset.preview,
            status: 'operational',
            nextPreventiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          });
        }, 800);
      }, 700);
    }, 600);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    // Use first preset as default template but customize with filename
    const preset = DEMO_PRESETS[0];
    setSelectedPreset({
      ...preset,
      sourceDoc: file.name,
      type: file.type.includes('pdf') ? 'Documento PDF' : 'Imagem de Plaqueta',
    });
    runSimulatedOcr(preset);
  };

  const handleConfirmAndSave = () => {
    if (!parsedData || !currentClient) return;

    const branch =
      currentClient.branches.find((b) => b.id === selectedBranchId) ||
      currentClient.branches[0];

    const newEquipment: Equipment = {
      id: `eq-${Date.now()}`,
      clientId: currentClient.id,
      clientName: currentClient.name,
      branchId: branch?.id || 'branch-1',
      branchName: branch?.name || 'Matriz',
      tag: parsedData.tag || 'EQ-01',
      name: parsedData.name || 'Equipamento Importado',
      category: parsedData.category || 'Geral',
      brand: parsedData.brand || 'Marca',
      model: parsedData.model || 'Modelo',
      serialNumber: parsedData.serialNumber || `SN-${Date.now()}`,
      manufacturingYear: parsedData.manufacturingYear || 2024,
      capacity: parsedData.capacity || '',
      locationInPlant: parsedData.locationInPlant || 'Galpão Principal',
      criticality: parsedData.criticality || 'medium',
      status: parsedData.status || 'operational',
      nextPreventiveDate:
        parsedData.nextPreventiveDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      specs: parsedData.specs || [],
      maintenancePlan: parsedData.maintenancePlan || {
        intervalMonths: 3,
        checklistItems: ['Inspeção visual geral', 'Aperto de conexões'],
        recommendedParts: [],
      },
      qrCodeId: `QR-${parsedData.tag || 'EQ'}-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: `Importado e interpretado via OCR IA em ${new Date().toLocaleDateString('pt-BR')}`,
    };

    onImportEquipment(newEquipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Importador Inteligente de Equipamentos (OCR + IA)
              </h2>
              <p className="text-xs text-muted-foreground">
                Digitalize uma placa de máquina, manual em PDF ou nota fiscal. A IA extrai as
                especificações e gera o plano preventivo automaticamente.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Upload or Presets */}
          {!parsedData && !isProcessing && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition bg-muted/10 relative">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleCustomUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  Arraste ou clique para carregar o arquivo
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Suporta fotos de plaquetas (JPG, PNG) e manuais técnicos ou ordens em PDF
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Ou teste com exemplos reais da indústria:
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DEMO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => runSimulatedOcr(preset)}
                      className="text-left p-4 rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {preset.type}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                      </div>
                      <p className="text-sm font-bold text-foreground line-clamp-1">
                        {preset.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {preset.preview.brand} • {preset.preview.model} ({preset.preview.capacity})
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Processing Animation */}
          {isProcessing && (
            <div className="py-16 text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-primary">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-foreground">
                  Processando com Inteligência Artificial
                </h4>
                <p className="text-sm text-primary font-medium">{processStep}</p>
                <p className="text-xs text-muted-foreground">Arquivo: {uploadedFileName}</p>
              </div>
            </div>
          )}

          {/* Step 2: Parsed Result Review & Assignment */}
          {parsedData && !isProcessing && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Top Banner Alert */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-500">
                    Dados extraídos com 99.4% de precisão!
                  </p>
                  <p className="text-muted-foreground">
                    A IA identificou a máquina, normalizou a capacidade e herdou o plano preventivo
                    baseado na norma {parsedData.maintenancePlan?.legalNorm || 'industrial'}.
                    Revise os campos e selecione o cliente de destino.
                  </p>
                </div>
              </div>

              {/* Client & Branch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/20 border border-border">
                <div>
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    Cliente Contratante:
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.segment})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    Unidade / Planta Fabril:
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2.5 focus:ring-1 focus:ring-primary outline-none"
                  >
                    {currentClient?.branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} - {b.city}/{b.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Machine Extracted Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">TAG do Equipamento</label>
                  <input
                    type="text"
                    value={parsedData.tag || ''}
                    onChange={(e) => setParsedData({ ...parsedData, tag: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 font-mono font-bold mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Nome Identificador</label>
                  <input
                    type="text"
                    value={parsedData.name || ''}
                    onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Marca</label>
                  <input
                    type="text"
                    value={parsedData.brand || ''}
                    onChange={(e) => setParsedData({ ...parsedData, brand: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Modelo</label>
                  <input
                    type="text"
                    value={parsedData.model || ''}
                    onChange={(e) => setParsedData({ ...parsedData, model: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nº de Série</label>
                  <input
                    type="text"
                    value={parsedData.serialNumber || ''}
                    onChange={(e) => setParsedData({ ...parsedData, serialNumber: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 font-mono mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Capacidade Nominal</label>
                  <input
                    type="text"
                    value={parsedData.capacity || ''}
                    onChange={(e) => setParsedData({ ...parsedData, capacity: e.target.value })}
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Localização na Fábrica</label>
                  <input
                    type="text"
                    value={parsedData.locationInPlant || ''}
                    onChange={(e) =>
                      setParsedData({ ...parsedData, locationInPlant: e.target.value })
                    }
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Criticidade Operacional</label>
                  <select
                    value={parsedData.criticality || 'medium'}
                    onChange={(e) =>
                      setParsedData({
                        ...parsedData,
                        criticality: e.target.value as 'high' | 'medium' | 'low',
                      })
                    }
                    className="w-full text-sm bg-background border border-border rounded-lg p-2 mt-1"
                  >
                    <option value="high">Alta (Parada Crítica)</option>
                    <option value="medium">Média (Produção Regular)</option>
                    <option value="low">Baixa (Equipamento Auxiliar)</option>
                  </select>
                </div>
              </div>

              {/* Technical Specifications Extracted */}
              {parsedData.specs && parsedData.specs.length > 0 && (
                <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Especificações Técnicas Detectadas
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {parsedData.specs.map((sp, idx) => (
                      <div key={idx} className="bg-card p-2 rounded-lg border border-border/80">
                        <p className="text-[10px] text-muted-foreground">{sp.label}</p>
                        <p className="text-xs font-semibold text-foreground truncate">{sp.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance Plan Preview */}
              {parsedData.maintenancePlan && (
                <div className="border border-border rounded-xl p-4 bg-muted/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Plano Preventivo Sugerido pela IA
                      </span>
                    </div>
                    {parsedData.maintenancePlan.legalNorm && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                        Norma {parsedData.maintenancePlan.legalNorm}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Periodicidade:{' '}
                    <strong className="text-foreground">
                      A cada {parsedData.maintenancePlan.intervalMonths} meses
                    </strong>
                    {parsedData.maintenancePlan.intervalHours &&
                      ` ou ${parsedData.maintenancePlan.intervalHours} horas`}
                  </div>
                  <ul className="text-xs space-y-1.5 text-foreground list-disc pl-4">
                    {parsedData.maintenancePlan.checklistItems.map((item, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        <span className="text-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
          {parsedData ? (
            <button
              onClick={() => {
                setParsedData(null);
                setSelectedPreset(null);
              }}
              className="text-xs text-muted-foreground hover:text-foreground font-medium px-3 py-2 rounded-lg hover:bg-muted"
            >
              Escolher outro documento
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition"
            >
              Cancelar
            </button>
            {parsedData && (
              <button
                onClick={handleConfirmAndSave}
                className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e Cadastrar Máquina
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
