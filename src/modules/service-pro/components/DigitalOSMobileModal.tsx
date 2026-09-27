'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Wrench,
  PenTool,
  Clock,
  RotateCcw,
  Send,
  X,
  Plus,
  Trash2,
  Building2,
  Share2,
  Check,
  FileCheck,
} from 'lucide-react';
import { MaintenanceWorkOrder, ChecklistItemState, SparePartUsed } from '../types';

interface DigitalOSMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: MaintenanceWorkOrder | null;
  onSaveWorkOrder: (updatedOrder: MaintenanceWorkOrder) => void;
}

export const DigitalOSMobileModal: React.FC<DigitalOSMobileModalProps> = ({
  isOpen,
  onClose,
  workOrder,
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

  // Photos state
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);

  // Canvas ref for digital signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

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
    }
  }, [workOrder]);

  // Set up canvas when opened
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen || !workOrder) return null;

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

  const handleSave = (markCompleted: boolean = false) => {
    const signatureBase64 = canvasRef.current ? canvasRef.current.toDataURL() : undefined;

    const updated: MaintenanceWorkOrder = {
      ...workOrder,
      status: markCompleted ? 'completed' : status,
      completedDate: markCompleted ? new Date().toISOString().split('T')[0] : workOrder.completedDate,
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

    onSaveWorkOrder(updated);
    onClose();
  };

  const handleSendWhatsAppNotification = () => {
    const msg = encodeURIComponent(
      `*APTIS SERVICE PRO - RELATÓRIO DE MANUTENÇÃO*\n\nOlá, a Ordem de Serviço *${workOrder.orderNumber}* do equipamento *${workOrder.equipmentTag}* (${workOrder.equipmentName}) na unidade *${workOrder.branchName}* foi concluída com sucesso pelo técnico *${workOrder.technicianName}*.\n\nAssinada digitalmente por: ${signedByName || 'Responsável'}\nStatus: Concluída e Operacional.\nConsulte o laudo completo no Portal do Cliente.`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setWhatsappSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      {/* Mobile Device Container Frame */}
      <div className="bg-card border border-border w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Mobile Header Bar */}
        <div className="p-4 sm:p-5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">{workOrder.orderNumber}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {status === 'completed' ? 'CONCLUÍDA' : 'EM ANDAMENTO'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {workOrder.clientName} • {workOrder.branchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Machine Quick Pill */}
        <div className="bg-muted/40 px-5 py-3 border-b border-border flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-foreground">{workOrder.equipmentTag}</span>
            <span className="text-muted-foreground ml-1.5 font-normal">
              {workOrder.equipmentName} ({workOrder.equipmentModel})
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Técnico: <strong className="text-foreground">{workOrder.technicianName}</strong>
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                1. Checklist Técnico de Inspeção
              </h3>
              <span className="text-[10px] text-muted-foreground">
                {checklist.filter((c) => c.status === 'passed').length}/{checklist.length} Aprovados
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-border bg-card/60 space-y-2"
                >
                  <p className="font-medium text-foreground text-xs">{item.description}</p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'passed')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        item.status === 'passed'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      ✓ Conforme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'failed')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        item.status === 'failed'
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      ✕ Não Conforme
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'not_applicable')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                        item.status === 'not_applicable'
                          ? 'bg-zinc-600 text-white shadow-sm'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-primary" />
                2. Evidências Fotográficas (Antes & Depois)
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Before */}
              <div className="border border-border rounded-xl p-2.5 bg-muted/10 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Antes do Atendimento
                </span>
                {beforePhotos.length > 0 ? (
                  <div className="relative rounded-lg overflow-hidden h-28 bg-zinc-900 border border-border">
                    <img
                      src={beforePhotos[0]}
                      alt="Antes"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Evidência de Entrada
                    </span>
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                    <Camera className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px]">Tirar foto</span>
                  </div>
                )}
              </div>

              {/* After */}
              <div className="border border-border rounded-xl p-2.5 bg-muted/10 space-y-2">
                <span className="text-[10px] font-bold text-emerald-500 uppercase block">
                  Após Manutenção / Limpeza
                </span>
                {afterPhotos.length > 0 ? (
                  <div className="relative rounded-lg overflow-hidden h-28 bg-zinc-900 border border-border">
                    <img
                      src={afterPhotos[0]}
                      alt="Depois"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">
                      Higienizado & Reparado
                    </span>
                  </div>
                ) : (
                  <div className="h-28 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                    <Camera className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px]">Tirar foto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Parts & Consumables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-primary" />
                3. Peças & Insumos Utilizados
              </h3>
              <button
                type="button"
                onClick={handleAddPart}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Peça
              </button>
            </div>

            {spareParts.length === 0 ? (
              <p className="text-muted-foreground text-[11px] italic py-2">
                Nenhuma peça extra aplicada até o momento.
              </p>
            ) : (
              <div className="space-y-2">
                {spareParts.map((part, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card"
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
                        className="w-full text-xs bg-transparent border-none font-semibold text-foreground focus:outline-none"
                      />
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {part.partCode}
                      </span>
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
                        className="w-full text-center text-xs bg-muted p-1 rounded font-mono"
                      />
                    </div>

                    <div className="w-24 text-right">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {(part.quantity * part.unitPrice).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className="p-1 text-muted-foreground hover:text-red-500 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 text-xs font-semibold text-foreground px-2">
                  <span>Subtotal Peças:</span>
                  <span className="font-mono">
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
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                4. Parecer Técnico & Horas Trabalhadas
              </h3>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Causa Raiz Identificada:
                </label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Ex: Obstrução parcial da colmeia por poeira fibrosa"
                  className="w-full text-xs bg-background border border-border rounded-lg p-2 mt-1"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground">
                  Ações Corretivas / Preventivas Executadas:
                </label>
                <textarea
                  rows={2}
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="Descreva o procedimento realizado..."
                  className="w-full text-xs bg-background border border-border rounded-lg p-2 mt-1 resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Horas de Mão de Obra (Técnico):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value) || 1)}
                    className="w-full text-xs bg-background border border-border rounded-lg p-2 font-mono mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Custo Mão de Obra (R$ 120/h):
                  </label>
                  <div className="p-2 bg-muted/30 border border-border rounded-lg text-xs font-mono font-bold mt-1 text-foreground">
                    {laborTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Digital Signature Canvas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <PenTool className="w-4 h-4 text-primary" />
                5. Aceite & Assinatura Digital do Cliente
              </h3>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Nome do Responsável:</label>
                  <input
                    type="text"
                    value={signedByName}
                    onChange={(e) => setSignedByName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Cargo / Setor:</label>
                  <input
                    type="text"
                    defaultValue="Supervisor de Manutenção"
                    className="w-full text-xs bg-background border border-border rounded-lg p-2 mt-1"
                  />
                </div>
              </div>

              {/* HTML5 Touch/Mouse Canvas */}
              <div className="relative border-2 border-dashed border-border rounded-xl bg-background overflow-hidden">
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
                  className="w-full h-[130px] touch-none cursor-crosshair"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground/60 text-xs">
                    Desenhe ou assine com o dedo ou mouse aqui
                  </div>
                )}
                <div className="absolute bottom-1 right-2 text-[9px] text-muted-foreground pointer-events-none">
                  Autenticação Digital SHA-256
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Footer Action Bar */}
        <div className="p-4 border-t border-border bg-muted/30 flex flex-col gap-2">
          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleSendWhatsAppNotification}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            {whatsappSent
              ? 'Comprovante Enviado no WhatsApp!'
              : 'Enviar Laudo / Notificação por WhatsApp'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-card border border-border hover:bg-muted text-foreground transition"
            >
              Salvar Rascunho
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              Concluir & Baixar OS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
