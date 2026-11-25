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
  UploadCloud,
  Paperclip,
  FileText,
  Download,
  ZoomIn,
} from 'lucide-react';
import {
  MaintenanceWorkOrder,
  ChecklistItemState,
  SparePartUsed,
  WorkOrderAttachment,
} from '../types';

export interface PreventiveCycleOptions {
  nextCycleMonths: number;
  nextPreventiveDate: string;
  autoCreateNextOS: boolean;
}

interface DigitalOSMobileModalProps {
  tintedGlass?: boolean;
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

function computeNextDate(months: number): string {
  if (months < 1) {
    const days = months === 0.25 ? 7 : 15;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  const dt = new Date();
  dt.setMonth(dt.getMonth() + months);
  return dt.toISOString().split('T')[0];
}

export const DigitalOSMobileModal: React.FC<DigitalOSMobileModalProps> = ({
  tintedGlass = false,
  isOpen,
  onClose,
  workOrder,
  defaultCycleMonths = 3,
  onSaveWorkOrder,
}) => {
  const initialMonths = defaultCycleMonths || 3;
  const [checklist, setChecklist] = useState<ChecklistItemState[]>(() =>
    workOrder && workOrder.checklist.length > 0
      ? [...workOrder.checklist]
      : [
          { id: 'c1', description: 'Inspeção visual de vazamentos e ruídos', status: 'passed' },
          { id: 'c2', description: 'Verificação de aperto elétrico e bornes', status: 'passed' },
          { id: 'c3', description: 'Medição de corrente e tensão em carga', status: 'passed' },
          { id: 'c4', description: 'Limpeza e troca de filtros de ar e óleo', status: 'passed' },
        ]
  );
  const [spareParts, setSpareParts] = useState<SparePartUsed[]>(() =>
    workOrder?.sparePartsUsed ? [...workOrder.sparePartsUsed] : []
  );
  const [rootCause, setRootCause] = useState<string>(() => workOrder?.rootCauseFound || '');
  const [actionsTaken, setActionsTaken] = useState<string>(() => workOrder?.actionsTaken || '');
  const [laborHours, setLaborHours] = useState<number>(() => workOrder?.laborHours || 2.5);
  const [laborHourlyRate] = useState<number>(120); // R$ 120/h
  const [signedByName, setSignedByName] = useState<string>(
    () => workOrder?.signedByName || 'Eng. Roberto Almeida'
  );
  const [hasSignature, setHasSignature] = useState<boolean>(
    () => !!workOrder?.clientSignatureBase64
  );
  const [status, setStatus] = useState<MaintenanceWorkOrder['status']>(
    () => workOrder?.status || 'in_progress'
  );
  const [whatsappSent, setWhatsappSent] = useState<boolean>(
    () => !!workOrder?.whatsappConfirmationSent
  );
  const [shareToWaze, setShareToWaze] = useState(true);

  // Preventive cycle scheduling state
  const [nextCycleMonths, setNextCycleMonths] = useState<number>(() => initialMonths);
  const [nextPreventiveDate, setNextPreventiveDate] = useState<string>(() =>
    computeNextDate(initialMonths)
  );
  const [autoCreateNextOS, setAutoCreateNextOS] = useState<boolean>(false);

  // Photos & Attachments state
  const [beforePhotos, setBeforePhotos] = useState<string[]>(() =>
    workOrder?.beforePhotos ? [...workOrder.beforePhotos] : []
  );
  const [afterPhotos, setAfterPhotos] = useState<string[]>(() =>
    workOrder?.afterPhotos ? [...workOrder.afterPhotos] : []
  );
  const [attachments, setAttachments] = useState<WorkOrderAttachment[]>(() =>
    workOrder?.attachments ? [...workOrder.attachments] : []
  );
  const [isUploadingMedia, setIsUploadingMedia] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActiveZone, setDragActiveZone] = useState<'before' | 'after' | 'attachments' | null>(
    null
  );
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; label: string } | null>(null);
  const [signatureModified, setSignatureModified] = useState<boolean>(false);

  // File input refs
  const beforeInputRef = useRef<HTMLInputElement | null>(null);
  const afterInputRef = useRef<HTMLInputElement | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);

  // Canvas ref for digital signature
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error(`Falha ao ler o arquivo ${file.name}`));
      reader.readAsDataURL(file);
    });

  const compressImageFile = async (file: File): Promise<string> => {
    const rawDataUrl = await readFileAsDataUrl(file);
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return rawDataUrl;
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1280;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width >= height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const offCanvas = document.createElement('canvas');
        offCanvas.width = Math.max(width, 1);
        offCanvas.height = Math.max(height, 1);
        const ctx = offCanvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);
        ctx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
        resolve(offCanvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    });
  };

  const handlePhotoFilesUpload = async (
    files: FileList | File[] | null,
    target: 'before' | 'after'
  ) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploadingMedia(true);
    try {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
        setUploadError(
          'Selecione arquivos de imagem (JPG, PNG, WEBP, HEIC) para as evidências fotográficas, ou use a área de Anexos abaixo para PDFs e documentos.'
        );
        return;
      }
      const compressedUrls = await Promise.all(validFiles.map((file) => compressImageFile(file)));
      if (target === 'before') {
        setBeforePhotos((prev) => [...prev, ...compressedUrls]);
      } else {
        setAfterPhotos((prev) => [...prev, ...compressedUrls]);
      }
    } catch {
      setUploadError('Não foi possível processar uma das imagens selecionadas.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAttachmentFilesUpload = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploadingMedia(true);
    const MAX_ATTACHMENT_BYTES = 4 * 1024 * 1024; // 4 MB por documento para persistência segura

    try {
      const nextAttachments: WorkOrderAttachment[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/') && file.size > MAX_ATTACHMENT_BYTES) {
          setUploadError(
            `O arquivo "${file.name}" (${formatFileSize(file.size)}) excede o limite de 4 MB por documento.`
          );
          continue;
        }
        const dataUrl = file.type.startsWith('image/')
          ? await compressImageFile(file)
          : await readFileAsDataUrl(file);

        nextAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          dataUrl,
          uploadedAt: new Date().toLocaleString('pt-BR'),
        });
      }
      if (nextAttachments.length > 0) {
        setAttachments((prev) => [...prev, ...nextAttachments]);
      }
    } catch {
      setUploadError('Não foi possível anexar o documento selecionado.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Set up canvas when opened (and restore saved signature if present)
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (workOrder?.clientSignatureBase64) {
          const sigImg = new Image();
          sigImg.onload = () => {
            ctx.drawImage(sigImg, 0, 0, canvas.width, canvas.height);
          };
          sigImg.src = workOrder.clientSignatureBase64;
        }
      }
    }
  }, [isOpen, workOrder]);

  if (!isOpen || !workOrder) return null;

  // Drawing event handlers (scaled accurately to canvas internal resolution)
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
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setHasSignature(true);
    setSignatureModified(true);
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
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

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
    setSignatureModified(true);
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
    const canvasBase64 = canvasRef.current ? canvasRef.current.toDataURL() : undefined;
    const finalSignature = !hasSignature
      ? undefined
      : signatureModified
      ? canvasBase64
      : workOrder.clientSignatureBase64 || canvasBase64;

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
      attachments,
      clientSignatureBase64: finalSignature,
      signedByName,
      signedAt: hasSignature
        ? signatureModified
          ? new Date().toLocaleTimeString('pt-BR')
          : workOrder.signedAt || new Date().toLocaleTimeString('pt-BR')
        : undefined,
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

  const inputClass = tintedGlass
    ? 'aptis-glass-input text-white placeholder:text-slate-500'
    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500';

  const sectionHeaderTitleClass = `font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
    tintedGlass ? 'text-cyan-300' : 'text-blue-700'
  }`;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div
        className={`w-[96vw] max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[93vh] animate-in fade-in zoom-in-95 duration-200 ${
          tintedGlass
            ? 'aptis-glass-modal text-white'
            : 'bg-white text-slate-900 border border-slate-200'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            tintedGlass ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
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
                <span
                  className={`text-sm font-black ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Ficha de Execução & Baixa • {workOrder.orderNumber}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'completed'
                      ? tintedGlass
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : tintedGlass
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {status === 'completed' ? 'CONCLUÍDA' : 'EM ABERTO'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                {workOrder.clientName} • {workOrder.branchName}
              </p>
            </div>
          </div>
          <button
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

        {/* Machine Quick Pill */}
        <div
          className={`px-5 py-3 border-b flex items-center justify-between text-xs ${
            tintedGlass ? 'bg-white/[0.03] border-white/10' : 'bg-slate-100/80 border-slate-200'
          }`}
        >
          <div>
            <span
              className={`font-bold font-mono ${
                tintedGlass ? 'text-cyan-400' : 'text-blue-600'
              }`}
            >
              [{workOrder.equipmentTag}]
            </span>
            <span
              className={`ml-1.5 font-semibold ${
                tintedGlass ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {workOrder.equipmentName} ({workOrder.equipmentModel})
            </span>
          </div>
          <span className={`text-[11px] font-mono ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
            Responsável Execução:{' '}
            <strong className={`font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {workOrder.technicianName}
            </strong>
          </span>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Checklist */}
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <h3 className={sectionHeaderTitleClass}>
                <CheckCircle2
                  className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`}
                />
                1. Checklist Técnico de Inspeção
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {checklist.filter((c) => c.status === 'passed').length}/{checklist.length} Aprovados
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl space-y-2 flex flex-col justify-between ${
                    tintedGlass ? 'aptis-glass-subcard' : 'bg-slate-50 border border-slate-200'
                  }`}
                >
                  <p className={`font-bold text-xs ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                    {item.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleChecklistStatusChange(item.id, 'passed')}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                        item.status === 'passed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : tintedGlass
                          ? 'bg-white/10 border border-white/15 text-slate-300 hover:bg-white/20'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
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
                          : tintedGlass
                          ? 'bg-white/10 border border-white/15 text-slate-300 hover:bg-white/20'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
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
                          : tintedGlass
                          ? 'bg-white/10 border border-white/15 text-slate-300 hover:bg-white/20'
                          : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      N/A
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Before & After Photos + Document Attachments */}
          <div className="space-y-4">
            <div
              className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <h3 className={sectionHeaderTitleClass}>
                <Camera className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                2. Evidências Fotográficas (Antes & Depois) e Anexos da OS
              </h3>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-cyan-500/15 text-cyan-200 border-cyan-400/30'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {beforePhotos.length + afterPhotos.length} foto(s) • {attachments.length} anexo(s)
              </span>
            </div>

            {/* Hidden Native File Inputs */}
            <input
              ref={beforeInputRef}
              type="file"
              accept="image/*"
              multiple
              data-testid="upload-before-photos"
              className="hidden"
              onChange={(e) => {
                handlePhotoFilesUpload(e.target.files, 'before');
                e.target.value = '';
              }}
            />
            <input
              ref={afterInputRef}
              type="file"
              accept="image/*"
              multiple
              data-testid="upload-after-photos"
              className="hidden"
              onChange={(e) => {
                handlePhotoFilesUpload(e.target.files, 'after');
                e.target.value = '';
              }}
            />
            <input
              ref={attachmentInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,image/*"
              multiple
              data-testid="upload-os-attachments"
              className="hidden"
              onChange={(e) => {
                handleAttachmentFilesUpload(e.target.files);
                e.target.value = '';
              }}
            />

            {uploadError && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                  tintedGlass
                    ? 'bg-rose-500/15 border-rose-400/35 text-rose-200'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="font-bold cursor-pointer hover:opacity-75"
                >
                  ✕
                </button>
              </div>
            )}

            {isUploadingMedia && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  tintedGlass
                    ? 'bg-cyan-500/15 border-cyan-400/30 text-cyan-200'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <Sparkles className="w-4 h-4 animate-spin" />
                Processando e anexando arquivo(s)...
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Photos Card */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActiveZone('before');
                }}
                onDragLeave={() => setDragActiveZone(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActiveZone(null);
                  handlePhotoFilesUpload(e.dataTransfer.files, 'before');
                }}
                className={`rounded-2xl p-3.5 space-y-3 transition border ${
                  dragActiveZone === 'before'
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : tintedGlass
                    ? 'aptis-glass-subcard border-white/10'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      tintedGlass ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Antes do Atendimento ({beforePhotos.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => beforeInputRef.current?.click()}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer transition ${
                      tintedGlass
                        ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/35'
                        : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Enviar Foto
                  </button>
                </div>

                {beforePhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {beforePhotos.map((photoUrl, idx) => (
                      <div
                        key={`before-${idx}`}
                        className="relative group rounded-xl overflow-hidden h-36 bg-slate-900 border border-white/15"
                      >
                        <img
                          src={photoUrl}
                          alt={`Antes ${idx + 1}`}
                          onClick={() =>
                            setPreviewPhoto({
                              url: photoUrl,
                              label: `Antes do Atendimento — Foto ${idx + 1}`,
                            })
                          }
                          className="w-full h-full object-cover cursor-zoom-in transition duration-200 group-hover:scale-105"
                        />
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/75 text-white px-2 py-0.5 rounded-md font-semibold">
                          Antes #{idx + 1}
                        </span>
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhoto({
                                url: photoUrl,
                                label: `Antes do Atendimento — Foto ${idx + 1}`,
                              })
                            }
                            title="Ampliar foto"
                            className="p-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-900 text-white border border-white/15 cursor-pointer transition"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setBeforePhotos((prev) => prev.filter((_, i) => i !== idx))
                            }
                            title="Remover foto"
                            className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white cursor-pointer transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => beforeInputRef.current?.click()}
                      className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition ${
                        tintedGlass
                          ? 'border-white/20 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-200 bg-white/[0.02] hover:bg-cyan-500/10'
                          : 'border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-600 bg-white hover:bg-blue-50/40'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Adicionar mais</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => beforeInputRef.current?.click()}
                    className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition ${
                      tintedGlass
                        ? 'border-cyan-400/35 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 bg-cyan-500/[0.04] hover:bg-cyan-500/10'
                        : 'border-slate-300 hover:border-blue-500 text-slate-500 hover:text-blue-700 bg-white hover:bg-blue-50/50'
                    }`}
                  >
                    <Camera className="w-7 h-7 opacity-75" />
                    <span className="text-xs font-bold">Clique ou arraste foto(s) do Antes</span>
                    <span className="text-[10px] opacity-75">JPG, PNG ou câmera do dispositivo</span>
                  </button>
                )}
              </div>

              {/* After Photos Card */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActiveZone('after');
                }}
                onDragLeave={() => setDragActiveZone(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActiveZone(null);
                  handlePhotoFilesUpload(e.dataTransfer.files, 'after');
                }}
                className={`rounded-2xl p-3.5 space-y-3 transition border ${
                  dragActiveZone === 'after'
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : tintedGlass
                    ? 'aptis-glass-subcard border-white/10'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                    }`}
                  >
                    Após Manutenção / Limpeza ({afterPhotos.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => afterInputRef.current?.click()}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border cursor-pointer transition ${
                      tintedGlass
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/35'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Enviar Foto
                  </button>
                </div>

                {afterPhotos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2.5">
                    {afterPhotos.map((photoUrl, idx) => (
                      <div
                        key={`after-${idx}`}
                        className="relative group rounded-xl overflow-hidden h-36 bg-slate-900 border border-white/15"
                      >
                        <img
                          src={photoUrl}
                          alt={`Depois ${idx + 1}`}
                          onClick={() =>
                            setPreviewPhoto({
                              url: photoUrl,
                              label: `Após Manutenção — Foto ${idx + 1}`,
                            })
                          }
                          className="w-full h-full object-cover cursor-zoom-in transition duration-200 group-hover:scale-105"
                        />
                        <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded-md font-semibold border border-emerald-500/40">
                          Depois #{idx + 1}
                        </span>
                        <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewPhoto({
                                url: photoUrl,
                                label: `Após Manutenção — Foto ${idx + 1}`,
                              })
                            }
                            title="Ampliar foto"
                            className="p-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-900 text-white border border-white/15 cursor-pointer transition"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setAfterPhotos((prev) => prev.filter((_, i) => i !== idx))
                            }
                            title="Remover foto"
                            className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white cursor-pointer transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => afterInputRef.current?.click()}
                      className={`h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition ${
                        tintedGlass
                          ? 'border-white/20 hover:border-emerald-400/60 text-slate-300 hover:text-emerald-200 bg-white/[0.02] hover:bg-emerald-500/10'
                          : 'border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-700 bg-white hover:bg-emerald-50/40'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-[11px] font-bold">Adicionar mais</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => afterInputRef.current?.click()}
                    className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5 cursor-pointer transition ${
                      tintedGlass
                        ? 'border-emerald-400/35 hover:border-emerald-400 text-slate-300 hover:text-emerald-200 bg-emerald-500/[0.04] hover:bg-emerald-500/10'
                        : 'border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-700 bg-white hover:bg-emerald-50/50'
                    }`}
                  >
                    <Camera className="w-7 h-7 opacity-75" />
                    <span className="text-xs font-bold">Clique ou arraste foto(s) do Depois</span>
                    <span className="text-[10px] opacity-75">JPG, PNG ou câmera do dispositivo</span>
                  </button>
                )}
              </div>
            </div>

            {/* General Document / File Attachments Section */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActiveZone('attachments');
              }}
              onDragLeave={() => setDragActiveZone(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActiveZone(null);
                handleAttachmentFilesUpload(e.dataTransfer.files);
              }}
              className={`rounded-2xl p-3.5 space-y-3 border transition ${
                dragActiveZone === 'attachments'
                  ? 'border-cyan-400 bg-cyan-500/10'
                  : tintedGlass
                  ? 'aptis-glass-subcard border-white/10'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Paperclip
                    className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`}
                  />
                  <div>
                    <span
                      className={`text-xs font-black block ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Anexos & Documentos Técnicos ({attachments.length})
                    </span>
                    <span
                      className={`text-[10px] ${
                        tintedGlass ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Anexe laudos PDF, certificados de calibração, notas fiscais de peças ou relatórios complementares (até 4 MB/arquivo)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border cursor-pointer transition ${
                    tintedGlass
                      ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border-cyan-400/35'
                      : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Anexar Arquivo / PDF
                </button>
              </div>

              {attachments.length === 0 ? (
                <button
                  type="button"
                  onClick={() => attachmentInputRef.current?.click()}
                  className={`w-full py-4 px-4 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition ${
                    tintedGlass
                      ? 'border-white/15 hover:border-cyan-400/50 text-slate-400 hover:text-cyan-200 bg-white/[0.01] hover:bg-cyan-500/[0.06]'
                      : 'border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-700 bg-white'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  Clique aqui ou arraste arquivos (PDF, DOCX, XLSX, Imagens) para vincular a esta OS
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                        tintedGlass
                          ? 'bg-slate-950/45 border-white/10'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            tintedGlass
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold truncate ${
                              tintedGlass ? 'text-white' : 'text-slate-900'
                            }`}
                            title={att.name}
                          >
                            {att.name}
                          </p>
                          <p
                            className={`text-[10px] font-mono ${
                              tintedGlass ? 'text-slate-400' : 'text-slate-500'
                            }`}
                          >
                            {formatFileSize(att.sizeBytes)} • {att.uploadedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <a
                          href={att.dataUrl}
                          download={att.name}
                          title="Baixar / Abrir anexo"
                          className={`p-1.5 rounded-lg border transition cursor-pointer ${
                            tintedGlass
                              ? 'bg-white/10 hover:bg-cyan-500/25 text-cyan-300 border-white/15'
                              : 'bg-slate-100 hover:bg-blue-50 text-blue-700 border-slate-200'
                          }`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) => prev.filter((item) => item.id !== att.id))
                          }
                          title="Remover anexo"
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            tintedGlass
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Parts & Consumables */}
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <h3 className={sectionHeaderTitleClass}>
                <Wrench className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                3. Peças & Insumos Utilizados
              </h3>
              <button
                type="button"
                onClick={handleAddPart}
                className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                  tintedGlass
                    ? 'text-cyan-400 hover:text-cyan-300'
                    : 'text-blue-600 hover:text-blue-700'
                }`}
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
                    className={`flex items-center gap-2 p-2.5 rounded-xl ${
                      tintedGlass ? 'aptis-glass-subcard' : 'bg-slate-50 border border-slate-200'
                    }`}
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
                        className={`w-full text-xs bg-transparent border-none font-bold focus:outline-none ${
                          tintedGlass ? 'text-white' : 'text-slate-900'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-mono ${
                          tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                        }`}
                      >
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
                        className={`w-full text-center text-xs p-1 rounded font-mono font-bold outline-none ${
                          tintedGlass
                            ? 'aptis-glass-input text-white'
                            : 'bg-white border border-slate-300 text-slate-900'
                        }`}
                      />
                    </div>

                    <div className="w-24 text-right">
                      <span
                        className={`text-xs font-mono font-bold ${
                          tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      >
                        {(part.quantity * part.unitPrice).toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePart(idx)}
                      className={`p-1 rounded transition cursor-pointer ${
                        tintedGlass
                          ? 'text-slate-400 hover:text-rose-400'
                          : 'text-slate-400 hover:text-red-600'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <div
                  className={`flex justify-between items-center pt-2 text-xs font-bold px-2 ${
                    tintedGlass ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  <span>Subtotal Peças:</span>
                  <span
                    className={`font-mono ${
                      tintedGlass ? 'text-cyan-300' : 'text-blue-600'
                    }`}
                  >
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
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <h3 className={sectionHeaderTitleClass}>
                <Clock className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                4. Parecer Técnico & Horas Trabalhadas
              </h3>
            </div>

            <div className="space-y-2.5">
              <div>
                <label
                  className={`text-[11px] font-bold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Causa Raiz Identificada:
                </label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="Ex: Obstrução parcial da colmeia por poeira fibrosa"
                  className={`w-full text-xs rounded-xl p-2 mt-1 outline-none transition ${inputClass}`}
                />
              </div>

              <div>
                <label
                  className={`text-[11px] font-bold ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Ações Corretivas / Preventivas Executadas:
                </label>
                <textarea
                  rows={2}
                  value={actionsTaken}
                  onChange={(e) => setActionsTaken(e.target.value)}
                  placeholder="Descreva o procedimento realizado..."
                  className={`w-full text-xs rounded-xl p-2 mt-1 resize-none outline-none transition ${inputClass}`}
                />
              </div>

              {/* Automatic Waze Knowledge Base Sync Checkbox */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer ${
                  tintedGlass
                    ? 'bg-cyan-500/10 border-cyan-400/30'
                    : 'bg-blue-50/70 border-blue-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={shareToWaze}
                  onChange={(e) => setShareToWaze(e.target.checked)}
                  className="mt-0.5 rounded accent-cyan-500"
                />
                <div className="text-[11px] leading-relaxed">
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      tintedGlass ? 'text-cyan-300' : 'text-blue-800'
                    }`}
                  >
                    <Sparkles
                      className={`w-3.5 h-3.5 ${
                        tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                      }`}
                    />
                    Compartilhar solução automaticamente no Waze da Manutenção
                  </span>
                  <span className={`block ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                    Ao salvar com a Causa Raiz preenchida, o sistema atualizará a base inteligente
                    do modelo{' '}
                    <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>
                      {workOrder.equipmentModel}
                    </strong>
                    .
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1">
                  <label
                    className={`text-[11px] font-bold ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Horas de Mão de Obra:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={laborHours}
                    onChange={(e) => setLaborHours(Number(e.target.value) || 1)}
                    className={`w-full text-xs rounded-xl p-2 font-mono font-bold mt-1 outline-none transition ${inputClass}`}
                  />
                </div>
                <div className="flex-1">
                  <label
                    className={`text-[11px] font-bold ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Custo Mão de Obra (R$ 120/h):
                  </label>
                  <div
                    className={`p-2 rounded-xl text-xs font-mono font-bold mt-1 ${
                      tintedGlass
                        ? 'aptis-glass-subcard text-emerald-400'
                        : 'bg-slate-50 border border-slate-200 text-emerald-600'
                    }`}
                  >
                    {laborTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Programação Automática da Próxima Preventiva */}
          <div
            className={`space-y-3 p-4 rounded-2xl border ${
              tintedGlass
                ? 'bg-emerald-500/10 border-emerald-400/30'
                : 'bg-emerald-50/70 border-emerald-200'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                tintedGlass ? 'border-emerald-400/20' : 'border-emerald-200'
              }`}
            >
              <h3
                className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                  tintedGlass ? 'text-emerald-300' : 'text-emerald-800'
                }`}
              >
                <Calendar
                  className={`w-4 h-4 ${
                    tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                  }`}
                />
                5. Cálculo Automático da Próxima Preventiva
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}
              >
                Ciclo Recorrente
              </span>
            </div>

            <p
              className={`text-[11px] leading-relaxed ${
                tintedGlass ? 'text-emerald-100' : 'text-emerald-900'
              }`}
            >
              Ao concluir esta OS hoje, o sistema atualizará automaticamente a{' '}
              <strong className={tintedGlass ? 'text-white' : 'text-emerald-950'}>
                Última Preventiva
              </strong>{' '}
              do equipamento{' '}
              <span
                className={`font-mono font-bold ${
                  tintedGlass ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                [{workOrder.equipmentTag}]
              </span>{' '}
              e já definirá a data do próximo vencimento:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Periodicidade / Ciclo da Máquina:
                </label>
                <select
                  value={nextCycleMonths}
                  onChange={(e) => handleCycleChange(Number(e.target.value))}
                  className={`w-full text-xs rounded-xl p-2 font-bold outline-none transition ${
                    tintedGlass
                      ? 'aptis-glass-input text-white'
                      : 'bg-white border border-emerald-300 text-slate-900 focus:border-emerald-500'
                  }`}
                >
                  <option value={0.25}>Semanal (daqui a 7 dias)</option>
                  <option value={0.5}>Quinzenal (daqui a 15 dias)</option>
                  <option value={1}>Mensal (daqui a 30 dias)</option>
                  <option value={2}>Bimestral (daqui a 2 meses)</option>
                  <option value={3}>Trimestral (daqui a 3 meses)</option>
                  <option value={6}>Semestral (daqui a 6 meses)</option>
                  <option value={12}>Anual (daqui a 12 meses)</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 ${
                    tintedGlass ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Data da Próxima Preventiva (Editável):
                </label>
                <input
                  type="date"
                  value={nextPreventiveDate}
                  onChange={(e) => setNextPreventiveDate(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2 font-mono font-bold outline-none transition ${
                    tintedGlass
                      ? 'aptis-glass-input text-emerald-300'
                      : 'bg-white border border-emerald-300 text-emerald-700 focus:border-emerald-500'
                  }`}
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
              <span
                className={`text-[11px] font-bold ${
                  tintedGlass ? 'text-emerald-200' : 'text-emerald-800'
                }`}
              >
                Já deixar a próxima Ordem de Serviço Preventiva agendada no calendário para{' '}
                <span
                  className={`underline font-mono ${
                    tintedGlass ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  {nextPreventiveDate}
                </span>
              </span>
            </label>
          </div>

          {/* Section 6: Digital Signature Canvas */}
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between border-b pb-2 ${
                tintedGlass ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <h3 className={sectionHeaderTitleClass}>
                <PenTool className={`w-4 h-4 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                6. Aceite & Assinatura de Conformidade
              </h3>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className={`text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    tintedGlass
                      ? 'text-slate-400 hover:text-rose-400'
                      : 'text-slate-500 hover:text-red-600'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" /> Limpar Assinatura
                </button>
              )}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    className={`text-[10px] font-bold ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Nome do Responsável:
                  </label>
                  <input
                    type="text"
                    value={signedByName}
                    onChange={(e) => setSignedByName(e.target.value)}
                    placeholder="Nome completo"
                    className={`w-full text-xs rounded-lg p-2 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>
                <div>
                  <label
                    className={`text-[10px] font-bold ${
                      tintedGlass ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Cargo / Setor:
                  </label>
                  <input
                    type="text"
                    defaultValue="Gestor / Supervisor de Manutenção"
                    className={`w-full text-xs rounded-lg p-2 mt-1 outline-none transition ${inputClass}`}
                  />
                </div>
              </div>

              {/* HTML5 Touch/Mouse Canvas on Crisp White Surface */}
              <div
                className={`relative border-2 border-dashed rounded-2xl bg-white overflow-hidden shadow-inner ${
                  tintedGlass ? 'border-cyan-400/40' : 'border-blue-300'
                }`}
              >
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
        <div
          className={`p-4 border-t flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 ${
            tintedGlass ? 'border-white/10 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          {/* Quick WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleSendWhatsAppNotification}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/35 hover:brightness-110"
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

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => handleSave(false)}
              className={`flex-1 md:flex-none py-2.5 px-5 rounded-xl text-xs font-bold transition cursor-pointer ${
                tintedGlass
                  ? 'text-slate-200 aptis-glass-subcard hover:text-white'
                  : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-100'
              }`}
            >
              Salvar Rascunho
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="flex-1 md:flex-none py-2.5 px-5 rounded-xl text-xs font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
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

      {/* Lightbox Modal for Full-Screen Photo Inspection */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-[95] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full space-y-3 flex flex-col items-center"
          >
            <div className="w-full flex items-center justify-between text-white px-2">
              <span className="text-sm font-bold">{previewPhoto.label}</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewPhoto.url}
                  download={`${previewPhoto.label.replace(/\s+/g, '_')}.jpg`}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar Imagem
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-500/40 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <img
              src={previewPhoto.url}
              alt={previewPhoto.label}
              className="max-h-[78vh] w-auto max-w-full rounded-2xl border border-white/20 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
