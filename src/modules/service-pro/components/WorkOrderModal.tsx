'use client';

import React, { useState } from 'react';
import {
  X,
  Wrench,
  Calendar,
  Building2,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  MaintenanceWorkOrder,
  ClientContractor,
  Equipment,
  WorkOrderType,
  WorkOrderStatus,
} from '../types';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientContractor[];
  equipments: Equipment[];
  onSave: (order: MaintenanceWorkOrder) => void;
  editingOrder?: MaintenanceWorkOrder | null;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
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
    editingOrder?.symptomsReported || 'Manutenção preventiva periódica programada (Plano PMOC / NR-13).'
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingOrder ? `Editar ${editingOrder.orderNumber}` : 'Nova Ordem de Serviço (OS)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Agende uma visita preventiva, corretiva ou emergencial para sua equipe técnica
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

        {/* Form Body - Solid White Background */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs bg-white">
          {/* Client & Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Cliente Contratante *</label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Equipamento / TAG *</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
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
              <label className="font-bold text-slate-700 mb-1.5 block">Tipo de Intervenção</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WorkOrderType)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
              >
                <option value="preventive">Preventiva (Contratual / PMOC)</option>
                <option value="corrective">Corretiva (Falha ou Quebra)</option>
                <option value="predictive">Preditiva (Termografia / Vibração)</option>
                <option value="installation">Instalação / Retrofit</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Nível de Prioridade</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenanceWorkOrder['priority'])
                }
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
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
              <label className="font-bold text-slate-700 mb-1.5 block">Data Agendada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none shadow-xs"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Janela de Horário</label>
              <input
                type="text"
                value={scheduledTimeWindow}
                onChange={(e) => setScheduledTimeWindow(e.target.value)}
                placeholder="Ex: 08:00 - 12:00"
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none shadow-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1.5 block">Técnico Responsável</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
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
            <label className="font-bold text-slate-700 mb-1.5 block">
              Escopo do Atendimento / Sintomas Informados
            </label>
            <textarea
              rows={3}
              value={symptomsReported}
              onChange={(e) => setSymptomsReported(e.target.value)}
              placeholder="Descreva o que será realizado ou o problema reportado pelo cliente..."
              className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 resize-none outline-none shadow-xs"
              required
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center gap-1.5 cursor-pointer"
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
