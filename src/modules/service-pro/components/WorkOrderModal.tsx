'use client';

import React, { useState } from 'react';
import {
  X,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import {
  MaintenanceWorkOrder,
  ClientContractor,
  Equipment,
  WorkOrderType,
} from '../types';

interface WorkOrderModalProps {
  tintedGlass?: boolean;
  isOpen: boolean;
  onClose: () => void;
  clients: ClientContractor[];
  equipments: Equipment[];
  onSave: (order: MaintenanceWorkOrder) => void;
  editingOrder?: MaintenanceWorkOrder | null;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  tintedGlass = false,
  isOpen,
  onClose,
  clients,
  equipments,
  onSave,
  editingOrder,
}) => {
  const [clientId, setClientId] = useState<string>(
    editingOrder?.clientId || clients[0]?.id || ''
  );

  const availableEquipments = equipments.filter((eq) => eq.clientId === clientId);

  const [equipmentId, setEquipmentId] = useState<string>(
    editingOrder?.equipmentId || availableEquipments[0]?.id || ''
  );
  const [type, setType] = useState<WorkOrderType>(editingOrder?.type || 'preventive');
  const [priority, setPriority] = useState<MaintenanceWorkOrder['priority']>(
    editingOrder?.priority || 'normal'
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    editingOrder?.scheduledDate || new Date().toISOString().split('T')[0]
  );
  const [scheduledTimeWindow, setScheduledTimeWindow] = useState<string>(
    editingOrder?.scheduledTimeWindow || '08:00 - 12:00'
  );
  const [technicianName, setTechnicianName] = useState<string>(
    editingOrder?.technicianName || 'Carlos Silveira'
  );
  const [symptomsReported, setSymptomsReported] = useState<string>(
    editingOrder?.symptomsReported ||
      'Manutenção preventiva periódica programada (Plano PMOC / NR-13).'
  );

  if (!isOpen) return null;

  const currentClient = clients.find((c) => c.id === clientId) || clients[0];
  const currentEquipment = equipments.find((e) => e.id === equipmentId) || availableEquipments[0];

  const handleClientChange = (newClientId: string) => {
    setClientId(newClientId);
    const clientEquips = equipments.filter((e) => e.clientId === newClientId);
    if (clientEquips.length > 0) {
      setEquipmentId(clientEquips[0].id);
    } else {
      setEquipmentId('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentClient || !currentEquipment) return;

    const checklistItems =
      currentEquipment.maintenancePlan?.checklistItems.map((desc, i) => ({
        id: `chk-${Date.now()}-${i}`,
        description: desc,
        status: 'passed' as const,
      })) || [
        { id: 'chk-1', description: 'Inspeção mecânica geral', status: 'passed' as const },
        { id: 'chk-2', description: 'Inspeção de conexões elétricas', status: 'passed' as const },
      ];

    const order: MaintenanceWorkOrder = {
      id: editingOrder?.id || `wo-${Date.now()}`,
      orderNumber:
        editingOrder?.orderNumber || `OS-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: currentClient.id,
      clientName: currentClient.name,
      branchId: currentEquipment.branchId || currentClient.branches[0]?.id || 'branch-1',
      branchName: currentEquipment.branchName || currentClient.branches[0]?.name || 'Matriz',
      equipmentId: currentEquipment.id,
      equipmentTag: currentEquipment.tag,
      equipmentName: currentEquipment.name,
      equipmentModel: `${currentEquipment.brand} ${currentEquipment.model}`,
      type,
      status: editingOrder?.status || 'scheduled',
      priority,
      scheduledDate,
      scheduledTimeWindow,
      technicianName,
      technicianPhone: '(11) 98765-1122',
      symptomsReported,
      checklist: editingOrder?.checklist || checklistItems,
      sparePartsUsed: editingOrder?.sparePartsUsed || [],
      laborHours: editingOrder?.laborHours || 2.5,
      laborCost: editingOrder?.laborCost || 300,
      totalCost: editingOrder?.totalCost || 450,
      beforePhotos: editingOrder?.beforePhotos || [],
      afterPhotos: editingOrder?.afterPhotos || [],
      whatsappConfirmationSent: editingOrder?.whatsappConfirmationSent || false,
    };

    onSave(order);
    onClose();
  };

  const inputClass = tintedGlass
    ? 'aptis-glass-input text-white placeholder:text-slate-500'
    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500';

  const labelClass = `font-bold mb-1.5 block ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto">
      <div
        className={`w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 ${
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
              className="w-10 h-10 rounded-xl border border-white/25 flex items-center justify-center text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow: '0 0 18px rgba(6, 182, 212, 0.35)',
              }}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-black ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                {editingOrder ? `Editar ${editingOrder.orderNumber}` : 'Nova Ordem de Serviço (OS)'}
              </h2>
              <p className={`text-xs mt-0.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Agende uma visita preventiva, corretiva ou emergencial para sua equipe técnica
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Client & Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cliente Contratante *</label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Equipamento / TAG *</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
                disabled={availableEquipments.length === 0}
              >
                {availableEquipments.length === 0 ? (
                  <option value="">Nenhum equipamento cadastrado</option>
                ) : (
                  availableEquipments.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.tag}] {eq.name} ({eq.model})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de Intervenção</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WorkOrderType)}
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
              >
                <option value="preventive">Preventiva (Contratual / PMOC)</option>
                <option value="corrective">Corretiva (Falha ou Quebra)</option>
                <option value="predictive">Preditiva (Termografia / Vibração)</option>
                <option value="installation">Instalação / Retrofit</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Nível de Prioridade</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenanceWorkOrder['priority'])
                }
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
              >
                <option value="urgent">🚨 Urgente (SLA 4 Horas - Parada)</option>
                <option value="high">Alta (Linha de Produção Afetada)</option>
                <option value="normal">Normal (Rotina Agendada)</option>
                <option value="low">Baixa (Pode reprogramar)</option>
              </select>
            </div>
          </div>

          {/* Date & Time & Technician */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Data Agendada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Janela de Horário</label>
              <input
                type="text"
                value={scheduledTimeWindow}
                onChange={(e) => setScheduledTimeWindow(e.target.value)}
                placeholder="Ex: 08:00 - 12:00"
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
              />
            </div>

            <div>
              <label className={labelClass}>Responsável pela Execução</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 font-medium outline-none transition ${inputClass}`}
              >
                <option value="Carlos Silveira">Carlos Silveira (Mecânica)</option>
                <option value="Marcos Vinicius">Marcos Vinicius (Refrigeração)</option>
                <option value="Rodrigo Mendes">Rodrigo Mendes (Eletrotécnica)</option>
                <option value="Lucas Prado">Lucas Prado (Automação)</option>
              </select>
            </div>
          </div>

          {/* Scope / Symptoms */}
          <div>
            <label className={labelClass}>
              Escopo do Atendimento / Sintomas Informados
            </label>
            <textarea
              rows={3}
              value={symptomsReported}
              onChange={(e) => setSymptomsReported(e.target.value)}
              placeholder="Descreva o que será realizado ou o problema reportado pelo cliente..."
              className={`w-full text-xs rounded-xl p-2.5 resize-none outline-none transition ${inputClass}`}
              required
            />
          </div>

          {/* Footer buttons */}
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
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                boxShadow:
                  '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              {editingOrder ? 'Salvar Alterações' : 'Criar Ordem de Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
