'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Camera,
  Wrench,
  PenTool,
  Clock,
  RotateCcw,
  X,
  Plus,
  Trash2,
  Share2,
  Check,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { MaintenanceWorkOrder, ChecklistItemState, SparePartUsed } from '../types';

export interface PreventiveCycleOptions {
  nextCycleMonths: number;
  nextPreventiveDate: string;
  autoCreateNextOS: boolean;
}

interface DigitalOSMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: MaintenanceWorkOrder | null;
  defaultCycleMonths?: number;
  onSaveWorkOrder: (
    updatedOrder: MaintenanceWorkOrder,
    shareToWaze?: boolean,
    preventiveCycle?: PreventiveCycleOptions
  ) => void;
}

export const DigitalOSMobileModal: React.FC<DigitalOSMobileModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  defaultCycleMonths = 3,
  onSaveWorkOrder,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItemState[]>([]);
  const [spareParts, setSpareParts] = useState<SparePartUsed[]>([]);
  const [rootCause, setRootCause] = useState<string>('');
  const [actionsTaken, setActionsTaken] = useState<string>('');
  const [laborHours, setLaborHours] = useState<number>(2);
  const [laborHourlyRate] = useState<number>(120); // R$ 120/h
  const [signedByName, setSignedByName] = useState<string>('');
  const [hasSignature, setHasSignature] = useState(false);
  const [status, setStatus] = useState<MaintenanceWorkOrder['status']>('in_progress');
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [shareToWaze, setShareToWaze] = useState(true);

  // Preventive cycle scheduling state
  const [nextCycleMonths, setNextCycleMonths] = useState<number>(3);
  const [nextPreventiveDate, setNextPreventiveDate] = useState<string>('');
  const [autoCreateNextOS, setAutoCreateNextOS] = useState<boolean>(false);

  // Photos state
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  // Canvas ref for digital signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const computeNextDate = (months: number): string => {
    const dt = new Date();
    dt.setMonth(dt.getMonth() + months);
    return dt.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (workOrder) {
      setChecklist(
        workOrder.checklist.length > 0
          ? [...workOrder.checklist]
          : [
              { id: 'c1', description: 'Inspeção visual de vazamentos e ruídos', status: 'passed' },
              { id: 'c2', description: 'Verificação de aperto elétrico e bornes', status: 'passed' },
              { id: 'c3', description: 'Medição de corrente e tensão em carga', status: 'passed' },
              { id: 'c4', description: 'Limpeza e troca de filtros de ar e óleo', status: 'passed' },
            ]
      );
      setSpareParts(workOrder.sparePartsUsed ? [...workOrder.sparePartsUsed] : []);
      setRootCause(workOrder.rootCauseFound || '');
      setActionsTaken(workOrder.actionsTaken || '');
      setLaborHours(workOrder.laborHours || 2.5);
      setSignedByName(workOrder.signedByName || 'Eng. Roberto Almeida');
      setBeforePhotos(
        workOrder.beforePhotos.length > 0
          ? workOrder.beforePhotos
          : [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
            ]
      );
      setAfterPhotos(
        workOrder.afterPhotos.length > 0
          ? workOrder.afterPhotos
          : [
              'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=400&q=80',
            ]
      );
      setStatus(workOrder.status);
      setHasSignature(!!workOrder.clientSignatureBase64);
      setWhatsappSent(workOrder.whatsappConfirmationSent);

      const initialMonths = defaultCycleMonths || 3;
      setNextCycleMonths(initialMonths);
      setNextPreventiveDate(computeNextDate(initialMonths));
      setAutoCreateNextOS(false);
    }
  }, [workOrder, defaultCycleMonths]);

  // Set up canvas when opened
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen || !workOrder) return null;

  // Drawing event handlers
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    isDrawingRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleChecklistStatusChange = (
    id: string,
    newStatus: 'passed' | 'failed' | 'not_applicable'
  ) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleAddPart = () => {
    const newPart: SparePartUsed = {
      partCode: `PECA-${Math.floor(100 + Math.random() * 900)}`,
      description: 'Novo insumo / peça substituída',
      quantity: 1,
      unitPrice: 150,
    };
    setSpareParts([...spareParts, newPart]);
  };

  const handleRemovePart = (index: number) => {
    setSpareParts(spareParts.filter((_, i) => i !== index));
  };

  const partsTotal = spareParts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
  const laborTotal = laborHours * laborHourlyRate;
  const grandTotal = partsTotal + laborTotal;

  const handleCycleChange = (months: number) => {
    setNextCycleMonths(months);
    setNextPreventiveDate(computeNextDate(months));
  };

  const handleSave = (markCompleted: boolean = false) => {
    const signatureBase64 = canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    const updated: MaintenanceWorkOrder = {
      ...workOrder,
      status: markCompleted ? 'completed' : status,
      completedDate: markCompleted
        ? new Date().toISOString().split('T')[0]
        : workOrder.completedDate,
      checklist,
      sparePartsUsed: spareParts,
      rootCauseFound: rootCause,
      actionsTaken,
      laborHours,
      laborCost: laborTotal,
      totalCost: grandTotal,
      beforePhotos,
      afterPhotos,
      clientSignatureBase64: hasSignature ? signatureBase64 : workOrder.clientSignatureBase64,
      signedByName,
      signedAt: hasSignature ? new Date().toLocaleTimeString('pt-BR') : workOrder.signedAt,
      whatsappConfirmationSent: whatsappSent,
    };

    onSaveWorkOrder(
      updated,
      shareToWaze,
      markCompleted
        ? {
            nextCycleMonths,
            nextPreventiveDate,
            autoCreateNextOS,
          }
        : undefined
    );
    onClose();
  };

  const handleSendWhatsAppNotification = () => {
    const msg = encodeURIComponent(
      `*APTIS SERVICE PRO - LAUDO DE MANUTENÇÃO*\n\nOlá, a Ordem de Serviço *${workOrder.orderNumber}* do equipamento *${workOrder.equipmentTag}* (${workOrder.equipmentName}) na unidade *${workOrder.branchName}* foi concluída com sucesso.\n\n📅 *Próxima Preventiva Programada:* ${nextPreventiveDate}\n✍️ *Responsável:* ${signedByName || 'Responsável'}\nStatus: Concluída e Operacional.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setWhatsappSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="aptis-glass-modal w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh] text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl border border-white/25 text-white flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
              }}
            >
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">
                  Ficha de Execução & Baixa • {workOrder.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                  }`}
                >
                  {status === 'completed' ? 'CONCLUÍDA' : 'EM ABERTO'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {workOrder.clientName} • {workOrder.branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Quick Pill */}
        <div className="bg-white/[0.03] px-5 py-3 border-b border-white/10 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-cyan-400 font-mono">[{workOrder.equipmentTag}]</span>
            <span className="text-slate-200 ml-1.5 font-semibold">
              {workOrder.equipmentName} ({workOrder.equipmentModel})
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-300">
            Responsável Execução:{' '}
            <strong className="text-white font-bold">{workOrder.technicianName}</strong>
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                1. Checklist Técnico de Inspeção
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/35">
                {checklist.filter((c) => c.status === 'passed').length}/{checklist.length} Aprovados
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl aptis-glass-subcard space-y-2"
                >
                  <p className="font-bold text-white text-xs">{item.description}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'passed')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        item.status === 'passed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white/10 border border-white/15 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      ✓ Conforme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'failed')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        item.status === 'failed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white/10 border border-white/15 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      ✕ Não Conforme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'not_applicable')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        item.status === 'not_applicable'
                          ? 'bg-slate-600 text-white shadow-xs'
                          : 'bg-white/10 border border-white/15 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Before & After Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-cyan-400" />
                2. Evidências Fotográficas (Antes & Depois)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Before */}
              <div className="rounded-2xl p-2.5 aptis-glass-subcard space-y-2">
                <span className="text-[10px] font-bold text-slate-300 uppercase block">
                  Antes do Atendimento
                </span>
                {beforePhotos.length > 0 ? (
                  <div className="relative rounded-lg overflow-hidden h-28 bg-slate-900 border border-white/15">
                    <img
                      src={beforePhotos[0]}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/75 text-white px-1.5 py-0.5 rounded font-medium">
                      Evidência de Entrada
                    </span>
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-400 bg-white/5">
                    <Camera className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px]">Anexar foto</span>
                  </div>
                )}
              </div>

              {/* After */}
              <div className="rounded-2xl p-2.5 aptis-glass-subcard space-y-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase block">
                  Após Manutenção / Limpeza
                </span>
                {afterPhotos.length > 0 ? (
                  <div className="relative rounded-lg overflow-hidden h-28 bg-slate-900 border border-white/15">
                    <img
                      src={afterPhotos[0]}
                      alt="Depois"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-900/90 text-emerald-200 px-1.5 py-0.5 rounded font-medium border border-emerald-500/40">
                      Higienizado & Reparado
                    </span>
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-400 bg-white/5">
                    <Camera className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px]">Anexar foto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Parts & Consumables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-cyan-400" />
                3. Peças & Insumos Utilizados
              </h3>
              <button
                type="button"
                onClick={handleAddPart}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Peça
              </button>
            </div>

            {spareParts.length === 0 ? (
              <p className="text-slate-400 text-[11px] italic py-1">
                Nenhuma peça extra aplicada até o momento.
              </p>
            ) : (
              <div className="space-y-2">
                {spareParts.map((part, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl aptis-glass-subcard"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={part.description}
                        onChange={(e) => {
                          const updated = [...spareParts];
                          updated[idx].description = e.target.value;
                          setSpareParts(updated);
                        }}
                        className="w-full text-xs bg-transparent border-none font-bold text-white focus:outline-none"
                      />
                      <span className="text-[10px] text-cyan-300 font-mono">{part.partCode}</span>
                    </div>

                    <div className="w-16">
                      <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => {
                          const updated = [...spareParts];
                          updated[idx].quantity = Number(e.target.value) || 1;
                          setSpareParts(updated);
                        }}
                        className="aptis-glass-input w-full text-center text-xs p-1 rounded font-mono font-bold text-white"
                      />
                    </div>

                    <div className="w-24 text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {(part.quantity * part.unitPrice).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 text-xs font-bold text-white px-2">
                  <span>Subtotal Peças:</span>
                  <span className="font-mono text-cyan-300">
                    {partsTotal.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Technical Diagnosis & Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                4. Parecer Técnico & Horas Trabalhadas
              </h3>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Causa Raiz Identificada:
                </label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Ex: Obstrução parcial da colmeia por poeira fibrosa"
                  className="aptis-glass-input w-full text-xs rounded-xl p-2 mt-1 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300">
                  Ações Corretivas / Preventivas Executadas:
                </label>
                <textarea
                  rows={2}
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="Descreva o procedimento realizado..."
                  className="aptis-glass-input w-full text-xs rounded-xl p-2 mt-1 resize-none text-white placeholder:text-slate-500"
                />
              </div>

              {/* Automatic Waze Knowledge Base Sync Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareToWaze}
                  onChange={(e) => setShareToWaze(e.target.checked)}
                  className="mt-0.5 rounded accent-cyan-500"
                />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Compartilhar solução automaticamente no Waze da Manutenção
                  </span>
                  <span className="text-slate-300 block">
                    Ao salvar com a Causa Raiz preenchida, o sistema atualizará a base inteligente
                    do modelo <strong className="text-white">{workOrder.equipmentModel}</strong>.
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Horas de Mão de Obra:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value) || 1)}
                    className="aptis-glass-input w-full text-xs rounded-xl p-2 font-mono font-bold mt-1 text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-300">
                    Custo Mão de Obra (R$ 120/h):
                  </label>
                  <div className="p-2 aptis-glass-subcard rounded-xl text-xs font-mono font-bold mt-1 text-emerald-400">
                    {laborTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Programação Automática da Próxima Preventiva */}
          <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
            <div className="flex items-center justify-between border-b border-emerald-400/20 pb-2">
              <h3 className="font-bold text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                5. Cálculo Automático da Próxima Preventiva
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/35">
                Ciclo Recorrente
              </span>
            </div>

            <p className="text-[11px] text-emerald-100 leading-relaxed">
              Ao concluir esta OS hoje, o sistema atualizará automaticamente a{' '}
              <strong className="text-white">Última Preventiva</strong> do equipamento{' '}
              <span className="font-mono font-bold text-emerald-300">[{workOrder.equipmentTag}]</span>{' '}
              e já definirá a data do próximo vencimento:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Periodicidade / Ciclo da Máquina:
                </label>
                <select
                  value={nextCycleMonths}
                  onChange={(e) => handleCycleChange(Number(e.target.value))}
                  className="aptis-glass-input w-full text-xs rounded-xl p-2 font-bold text-white outline-none"
                >
                  <option value={1} className="bg-slate-900 text-white">
                    Mensal (daqui a 30 dias)
                  </option>
                  <option value={2} className="bg-slate-900 text-white">
                    Bimestral (daqui a 2 meses)
                  </option>
                  <option value={3} className="bg-slate-900 text-white">
                    Trimestral (daqui a 3 meses)
                  </option>
                  <option value={6} className="bg-slate-900 text-white">
                    Semestral (daqui a 6 meses)
                  </option>
                  <option value={12} className="bg-slate-900 text-white">
                    Anual (daqui a 12 meses)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Data da Próxima Preventiva (Editável):
                </label>
                <input
                  type="date"
                  value={nextPreventiveDate}
                  onChange={(e) => setNextPreventiveDate(e.target.value)}
                  className="aptis-glass-input w-full text-xs rounded-xl p-2 font-mono font-bold text-emerald-300 outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoCreateNextOS}
                onChange={(e) => setAutoCreateNextOS(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span className="text-[11px] font-bold text-emerald-200">
                Já deixar a próxima Ordem de Serviço Preventiva agendada no calendário para{' '}
                <span className="underline font-mono text-white">{nextPreventiveDate}</span>
              </span>
            </label>
          </div>

          {/* Section 6: Digital Signature Canvas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-cyan-400" />
                6. Aceite & Assinatura de Conformidade
              </h3>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar Assinatura
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-300">
                    Nome do Responsável:
                  </label>
                  <input
                    type="text"
                    value={signedByName}
                    onChange={(e) => setSignedByName(e.target.value)}
                    placeholder="Nome completo"
                    className="aptis-glass-input w-full text-xs rounded-lg p-2 mt-1 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300">Cargo / Setor:</label>
                  <input
                    type="text"
                    defaultValue="Gestor / Supervisor de Manutenção"
                    className="aptis-glass-input w-full text-xs rounded-lg p-2 mt-1 text-white"
                  />
                </div>
              </div>

              {/* HTML5 Touch/Mouse Canvas on Crisp White Surface */}
              <div className="relative border-2 border-dashed border-cyan-400/40 rounded-2xl bg-white overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={130}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[130px] touch-none cursor-crosshair bg-white"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 font-medium text-xs">
                    Assine com o mouse ou toque aqui para registrar a conformidade
                  </div>
                )}
                <div className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono pointer-events-none">
                  Autenticação Digital SHA-256
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex flex-col gap-2">
          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleSendWhatsAppNotification}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/35 hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              boxShadow: '0 0 18px rgba(16, 185, 129, 0.35)',
            }}
          >
            <Share2 className="w-4 h-4" />
            {whatsappSent
              ? 'Comprovante Enviado no WhatsApp!'
              : 'Enviar Laudo / Próxima Data por WhatsApp'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-200 aptis-glass-subcard hover:text-white transition cursor-pointer"
            >
              Salvar Rascunho
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow:
                  '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
              }}
            >
              <Check className="w-4 h-4" />
              Concluir OS & Atualizar Próxima Preventiva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
