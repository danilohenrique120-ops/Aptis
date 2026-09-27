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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {editingOrder ? `Editar ${editingOrder.orderNumber}` : 'Nova Ordem de Serviço (OS)'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Agende uma visita preventiva, corretiva ou emergencial para sua equipe técnica
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* Client & Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-foreground mb-1 block">Cliente Contratante</label>
              <select
                value={clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Equipamento / TAG</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
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
              <label className="font-semibold text-foreground mb-1 block">Tipo de Intervenção</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as WorkOrderType)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="preventive">Preventiva (Contratual / PMOC)</option>
                <option value="corrective">Corretiva (Falha ou Quebra)</option>
                <option value="predictive">Preditiva (Termografia / Vibração)</option>
                <option value="installation">Instalação / Retrofit</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Nível de Prioridade</label>
              <select
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as MaintenanceWorkOrder['priority'])
                }
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
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
              <label className="font-semibold text-foreground mb-1 block">Data Agendada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5"
                required
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Janela de Horário</label>
              <input
                type="text"
                value={scheduledTimeWindow}
                onChange={(e) => setScheduledTimeWindow(e.target.value)}
                placeholder="Ex: 08:00 - 12:00"
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1 block">Técnico Responsável</label>
              <select
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-primary"
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
            <label className="font-semibold text-foreground mb-1 block">
              Escopo do Atendimento / Sintomas Informados
            </label>
            <textarea
              rows={3}
              value={symptomsReported}
              onChange={(e) => setSymptomsReported(e.target.value)}
              placeholder="Descreva o que será realizado ou o problema reportado pelo cliente..."
              className="w-full text-xs bg-background border border-border rounded-lg p-2.5 resize-none"
              required
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition flex items-center gap-1.5"
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
