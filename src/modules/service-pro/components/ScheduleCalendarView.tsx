'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  Wrench,
  Building2,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Plus,
} from 'lucide-react';
import {
  MaintenanceWorkOrder,
  ClientContractor,
  Equipment,
  NotificationRule,
} from '../types';

interface ScheduleCalendarViewProps {
  workOrders: MaintenanceWorkOrder[];
  clients: ClientContractor[];
  equipments: Equipment[];
  notificationRules: NotificationRule[];
  onOpenOrder: (order: MaintenanceWorkOrder) => void;
  onNewOrder: () => void;
}

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  workOrders,
  clients,
  equipments,
  notificationRules,
  onOpenOrder,
  onNewOrder,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('agenda');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeNotificationToast, setActiveNotificationToast] = useState<string | null>(null);

  // Filtered orders
  const filteredOrders = workOrders.filter((order) => {
    if (selectedClientId !== 'all' && order.clientId !== selectedClientId) return false;
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false;
    return true;
  });

  const getUrgencyBadge = (order: MaintenanceWorkOrder) => {
    const today = new Date().toISOString().split('T')[0];
    const isPast = order.scheduledDate < today;
    const isToday = order.scheduledDate === today;

    if (order.status === 'completed') {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          Concluída
        </span>
      );
    }
    if (isPast) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> Atrasada
        </span>
      );
    }
    if (isToday) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
          Hoje
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
        Agendada
      </span>
    );
  };

  const handleSendWhatsAppNotification = (order: MaintenanceWorkOrder) => {
    const client = clients.find((c) => c.id === order.clientId);
    const contact = client?.contacts[0];
    const phone = contact?.phone || '5511999999999';

    const message = encodeURIComponent(
      `*LEMBRETE DE VISITA TÉCNICA - APTIS SERVICE PRO*\n\n` +
        `Prezado(a) ${contact?.name || 'Cliente'},\n\n` +
        `Informamos que a visita de manutenção para o equipamento *${order.equipmentTag}* (${order.equipmentName}) na unidade *${order.branchName}* está agendada para:\n\n` +
        `📅 *Data:* ${order.scheduledDate}\n` +
        `⏰ *Horário previsto:* ${order.scheduledTimeWindow || '08:00 - 12:00'}\n` +
        `👨‍🔧 *Técnico responsável:* ${order.technicianName}\n\n` +
        `Em caso de dúvidas ou necessidade de reagendamento, favor responder a esta mensagem.`
    );

    const waUrl = `https://wa.me/?text=${message}`;
    window.open(waUrl, '_blank');

    setActiveNotificationToast(
      `Alerta de visita gerado para o cliente ${order.clientName} (Técnico: ${order.technicianName})`
    );
    setTimeout(() => setActiveNotificationToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {activeNotificationToast && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{activeNotificationToast}</span>
          </div>
          <button
            onClick={() => setActiveNotificationToast(null)}
            className="text-emerald-500 hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'agenda'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Agenda / Linha do Tempo
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === 'month'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Visão Mensal
            </button>
          </div>

          {/* Client Filter */}
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2 text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendadas</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluídas</option>
          </select>
        </div>

        <button
          onClick={onNewOrder}
          className="px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Agendar Nova Visita (OS)
        </button>
      </div>

      {/* Automated Rules Alert Pill */}
      <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-primary font-medium">
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>
            <strong>Régua de Disparos Automáticos Ativa:</strong> Alertas programados para 30 dias,
            7 dias e 1 dia antes da visita via WhatsApp e E-mail.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          4 Regras Operacionais
        </div>
      </div>

      {/* Main View: Agenda List */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
              <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-foreground">
                Nenhum atendimento encontrado para os filtros selecionados
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tente selecionar outro cliente ou crie um novo agendamento.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-border bg-card hover:border-primary/50 transition shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                {/* Left Date / Time Badge */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border flex flex-col items-center justify-center text-foreground font-mono">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {new Date(order.scheduledDate).toLocaleDateString('pt-BR', {
                        month: 'short',
                      })}
                    </span>
                    <span className="text-lg font-black leading-tight">
                      {new Date(order.scheduledDate).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary">
                        {order.orderNumber}
                      </span>
                      {getUrgencyBadge(order)}
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-0.5">
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3 h-3 text-muted-foreground" />
                      {order.clientName} ({order.branchName})
                    </p>
                  </div>
                </div>

                {/* Middle Tech Info & Window */}
                <div className="flex-1 text-xs space-y-1 text-muted-foreground md:border-l md:border-border md:pl-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Janela: {order.scheduledTimeWindow || '08:00 - 12:00'}</span>
                  </div>
                  <div>
                    Técnico: <strong className="text-foreground">{order.technicianName}</strong>
                  </div>
                  <p className="text-[11px] line-clamp-1 italic text-muted-foreground">
                    &quot;{order.symptomsReported}&quot;
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <button
                    onClick={() => handleSendWhatsAppNotification(order)}
                    title="Disparar aviso de visita via WhatsApp para o cliente"
                    className="p-2 text-xs font-medium rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 transition flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onOpenOrder(order)}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver OS / Digital
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Month Grid View */}
      {viewMode === 'month' && (
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <span className="text-xs text-muted-foreground">
              {filteredOrders.length} visitas programadas no mês
            </span>
          </div>

          {/* Simple grid representation */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="py-1 font-bold text-muted-foreground text-[11px]">
                {day}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
              const dateStr = `2026-10-${dayNum.toString().padStart(2, '0')}`;
              const dayOrders = filteredOrders.filter((o) => o.scheduledDate.endsWith(`-${dayNum.toString().padStart(2, '0')}`));

              return (
                <div
                  key={dayNum}
                  className={`min-h-[70px] p-1.5 rounded-xl border text-left flex flex-col justify-between transition ${
                    dayOrders.length > 0
                      ? 'border-primary/40 bg-primary/5 hover:border-primary'
                      : 'border-border/60 bg-muted/10'
                  }`}
                >
                  <span className="text-[10px] font-bold font-mono text-muted-foreground">
                    {dayNum}
                  </span>
                  {dayOrders.length > 0 && (
                    <div className="space-y-1">
                      {dayOrders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => onOpenOrder(o)}
                          className="w-full text-left p-1 rounded bg-card border border-border text-[9px] font-semibold text-foreground truncate block hover:border-primary"
                        >
                          {o.equipmentTag} ({o.technicianName.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
