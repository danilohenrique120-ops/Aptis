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
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Concluída
        </span>
      );
    }
    if (isPast) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-red-600" /> Atrasada
        </span>
      );
    }
    if (isToday) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          Hoje
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        Agendada
      </span>
    );
  };

  const handleSendWhatsAppNotification = (order: MaintenanceWorkOrder) => {
    const client = clients.find((c) => c.id === order.clientId);
    const contact = client?.contacts[0];

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
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{activeNotificationToast}</span>
          </div>
          <button
            onClick={() => setActiveNotificationToast(null)}
            className="text-emerald-700 hover:opacity-80 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'agenda'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Agenda / Linha do Tempo
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
            className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
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
            className="text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs font-medium"
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendadas</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Concluídas</option>
          </select>
        </div>

        <button
          onClick={onNewOrder}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Agendar Nova Visita (OS)
        </button>
      </div>

      {/* Automated Rules Alert Pill */}
      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-blue-950 font-medium">
          <MessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong className="text-blue-900 font-bold">Régua de Disparos Automáticos Ativa:</strong> Alertas programados para 30 dias,
            7 dias e 1 dia antes da visita via WhatsApp e E-mail.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          4 Regras Operacionais
        </div>
      </div>

      {/* Main View: Agenda List */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 bg-white">
              <CalendarDays className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-bold text-slate-800">
                Nenhum atendimento encontrado para os filtros selecionados
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Tente selecionar outro cliente ou crie um novo agendamento.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group shadow-sm"
              >
                {/* Left Date / Time Badge */}
                <div className="flex items-center gap-3.5 shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-800 font-mono shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      {new Date(order.scheduledDate).toLocaleDateString('pt-BR', {
                        month: 'short',
                      })}
                    </span>
                    <span className="text-xl font-black text-blue-700 leading-tight">
                      {new Date(order.scheduledDate).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600">
                        {order.orderNumber}
                      </span>
                      {getUrgencyBadge(order)}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {order.clientName} ({order.branchName})
                    </p>
                  </div>
                </div>

                {/* Middle Tech Info & Window */}
                <div className="flex-1 text-xs space-y-1 text-slate-600 md:border-l md:border-slate-200 md:pl-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Janela: <strong className="text-slate-800">{order.scheduledTimeWindow || '08:00 - 12:00'}</strong></span>
                  </div>
                  <div>
                    Técnico: <strong className="text-slate-800">{order.technicianName}</strong>
                  </div>
                  <p className="text-[11px] line-clamp-1 italic text-slate-500">
                    &quot;{order.symptomsReported}&quot;
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleSendWhatsAppNotification(order)}
                    title="Disparar aviso de visita via WhatsApp para o cliente"
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onOpenOrder(order)}
                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
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
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {filteredOrders.length} visitas programadas no mês
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="py-1 font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                {day}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => i + 1).map((dayNum) => {
              const dayOrders = filteredOrders.filter((o) =>
                o.scheduledDate.endsWith(`-${dayNum.toString().padStart(2, '0')}`)
              );

              return (
                <div
                  key={dayNum}
                  className={`min-h-[76px] p-2 rounded-xl border text-left flex flex-col justify-between transition ${
                    dayOrders.length > 0
                      ? 'border-blue-300 bg-blue-50/40 hover:border-blue-500 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <span className="text-[10px] font-bold font-mono text-slate-500">
                    {dayNum}
                  </span>
                  {dayOrders.length > 0 && (
                    <div className="space-y-1">
                      {dayOrders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => onOpenOrder(o)}
                          className="w-full text-left p-1 rounded-lg bg-white border border-blue-200 text-[9px] font-bold text-slate-800 truncate block hover:border-blue-500 shadow-2xs cursor-pointer"
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
