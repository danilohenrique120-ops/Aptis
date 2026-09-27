'use client';

import React, { useState } from 'react';
import {
  QrCode,
  Printer,
  Copy,
  Check,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
  Wrench,
  PhoneCall,
  Smartphone,
  Eye,
} from 'lucide-react';
import { Equipment } from '../types';

interface QRCodeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment | null;
  emergencyPhone?: string;
}

export const QRCodeManagerModal: React.FC<QRCodeManagerModalProps> = ({
  isOpen,
  onClose,
  equipment,
  emergencyPhone = '(11) 98765-4321',
}) => {
  const [activeTab, setActiveTab] = useState<'label' | 'client_flow' | 'tech_flow'>('label');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !equipment) return null;

  const directUrl = `https://aptis.app/service/qr/${equipment.qrCodeId || equipment.tag}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Etiqueta QR Code Inteligente • {equipment.tag}
                </h2>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 uppercase">
                  Ativo Rastreado
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Identificação física padrão industrial para carcaça ({equipment.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2">
          <button
            onClick={() => setActiveTab('label')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'label'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            Etiqueta Industrial Imprimível
          </button>
          <button
            onClick={() => setActiveTab('tech_flow')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'tech_flow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Fluxo do Técnico em Campo
          </button>
          <button
            onClick={() => setActiveTab('client_flow')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'client_flow'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Fluxo do Cliente / Operador
          </button>
        </div>

        {/* Body Content - Solid White */}
        <div className="p-6 space-y-6 bg-white">
          {activeTab === 'label' && (
            <div className="space-y-6">
              {/* The Physical Industrial Label Preview */}
              <div className="flex justify-center p-3 bg-slate-100/70 rounded-2xl border border-slate-200">
                <div
                  id="printable-industrial-label"
                  className="w-full max-w-md bg-white text-zinc-950 p-5 rounded-xl border-4 border-zinc-900 shadow-xl relative overflow-hidden"
                >
                  {/* High-visibility header bar */}
                  <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-400 border border-zinc-900 flex items-center justify-center font-black text-xs text-zinc-950">
                        SP
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider block leading-tight">
                          APTIS SERVICE PRO
                        </span>
                        <span className="text-[9px] text-zinc-600 block leading-none">
                          Gestão & Engenharia de Manutenção
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded">
                      PATRIMÔNIO ATIVO
                    </span>
                  </div>

                  {/* Main Grid: Info + Big QR Code */}
                  <div className="grid grid-cols-3 gap-3 items-center">
                    <div className="col-span-2 space-y-1.5">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase block">TAG DO ATIVO:</span>
                        <span className="text-xl font-black text-zinc-950 tracking-wider">
                          {equipment.tag}
                        </span>
                      </div>

                      <div>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase block">EQUIPAMENTO:</span>
                        <span className="text-xs font-bold text-zinc-900 leading-snug line-clamp-1">
                          {equipment.name}
                        </span>
                        <span className="text-[10px] text-zinc-600 block">
                          {equipment.brand} • {equipment.model}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 pt-1 border-t border-zinc-200">
                        <div>
                          <span className="text-[8px] font-medium text-zinc-500 block">SÉRIE:</span>
                          <span className="text-[10px] font-mono font-bold text-zinc-800 truncate block">
                            {equipment.serialNumber}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-medium text-zinc-500 block">CLIENTE:</span>
                          <span className="text-[10px] font-bold text-zinc-800 truncate block">
                            {equipment.clientName || 'Cliente'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Graphic (High precision SVG representation) */}
                    <div className="flex flex-col items-center justify-center bg-zinc-50 p-2 rounded-lg border border-zinc-300">
                      <svg
                        viewBox="0 0 100 100"
                        className="w-24 h-24 text-zinc-950"
                        fill="currentColor"
                      >
                        <rect x="5" y="5" width="28" height="28" fill="black" />
                        <rect x="9" y="9" width="20" height="20" fill="white" />
                        <rect x="13" y="13" width="12" height="12" fill="black" />

                        <rect x="67" y="5" width="28" height="28" fill="black" />
                        <rect x="71" y="9" width="20" height="20" fill="white" />
                        <rect x="75" y="13" width="12" height="12" fill="black" />

                        <rect x="5" y="67" width="28" height="28" fill="black" />
                        <rect x="9" y="71" width="20" height="20" fill="white" />
                        <rect x="13" y="75" width="12" height="12" fill="black" />

                        <rect x="40" y="8" width="6" height="6" fill="black" />
                        <rect x="52" y="8" width="6" height="6" fill="black" />
                        <rect x="40" y="20" width="6" height="6" fill="black" />
                        <rect x="52" y="20" width="6" height="6" fill="black" />

                        <rect x="8" y="40" width="6" height="6" fill="black" />
                        <rect x="20" y="40" width="6" height="6" fill="black" />
                        <rect x="8" y="52" width="6" height="6" fill="black" />
                        <rect x="20" y="52" width="6" height="6" fill="black" />

                        <rect x="44" y="44" width="12" height="12" fill="black" />
                        <rect x="46" y="46" width="8" height="8" fill="white" />
                        <rect x="48" y="48" width="4" height="4" fill="black" />

                        <rect x="36" y="60" width="8" height="6" fill="black" />
                        <rect x="60" y="40" width="6" height="12" fill="black" />
                        <rect x="70" y="45" width="18" height="6" fill="black" />
                        <rect x="65" y="65" width="8" height="8" fill="black" />
                        <rect x="80" y="65" width="8" height="8" fill="black" />
                        <rect x="65" y="80" width="16" height="8" fill="black" />
                      </svg>
                      <span className="text-[8px] font-mono font-bold text-zinc-600 mt-1">
                        {equipment.qrCodeId}
                      </span>
                    </div>
                  </div>

                  {/* High-visibility bottom call to action */}
                  <div className="mt-3 pt-2 border-t-2 border-zinc-900 flex items-center justify-between text-[9px] font-bold text-zinc-800">
                    <div className="flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-red-600" />
                      <span>SOS Plantão 24h: {emergencyPhone}</span>
                    </div>
                    <span className="text-zinc-500">Escaneie para OS ou Chamado</span>
                  </div>
                </div>
              </div>

              {/* Direct Link & Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex-1 w-full text-xs font-mono bg-white p-2 rounded-lg border border-slate-300 truncate text-slate-600 shadow-2xs">
                  {directUrl}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copiado!' : 'Copiar Link'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center gap-1.5 transition shadow-md shadow-blue-600/25 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Etiqueta
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech_flow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Experiência do Técnico ao Escanear em Campo
                </div>
                <p className="text-xs text-blue-700">
                  Quando o técnico da sua empresa de manutenção chega ao cliente e aponta a câmera
                  do celular para o QR Code fixado na carcaça:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Identificação Instantânea</h4>
                  <p className="text-[11px] text-slate-500">
                    Abre direto a ficha da máquina ({equipment.tag}), com histórico de atendimentos,
                    peças trocadas e manutenções anteriores.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Checklist Interativo</h4>
                  <p className="text-[11px] text-slate-500">
                    Carrega automaticamente o checklist preventivo configurado para o modelo{' '}
                    {equipment.model} (norma {equipment.maintenancePlan?.legalNorm || 'vigente'}).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">Assinatura Digital & Baixa</h4>
                  <p className="text-[11px] text-slate-500">
                    Tira fotos antes/depois, anota peças utilizadas e coleta a assinatura do
                    responsável da fábrica na tela do celular.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'client_flow' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  Experiência do Operador da Fábrica do Cliente
                </div>
                <p className="text-xs text-amber-700">
                  Se a máquina parar no meio do turno, qualquer operador ou líder do cliente pode
                  escanear o QR Code:
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-bold">Abertura de Chamado via WhatsApp com 1 Toque:</strong>
                    <p className="text-slate-500 mt-0.5">
                      O QR code já monta uma mensagem de socorro no WhatsApp da sua empresa com a TAG
                      exata ({equipment.tag}), modelo ({equipment.model}) e localização física,
                      eliminando erros de informação.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900 font-bold">Portal VIP de Transparência:</strong>
                    <p className="text-slate-500 mt-0.5">
                      O cliente pode conferir a validade do laudo PMOC, ver quando é a próxima visita
                      já agendada e comprovar que a máquina está sob contrato de manutenção ativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition shadow-2xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
