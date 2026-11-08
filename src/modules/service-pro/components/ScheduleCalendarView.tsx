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
  tintedGlass?: boolean;
  workOrders: MaintenanceWorkOrder[];
  clients: ClientContractor[];
  equipments: Equipment[];
  notificationRules: NotificationRule[];
  onOpenOrder: (order: MaintenanceWorkOrder) => void;
  onNewOrder: () => void;
}

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  tintedGlass = true,
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
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            tintedGlass
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          Concluída
        </span>
      );
    }
    if (isPast) {
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
            tintedGlass
              ? 'bg-rose-500/20 text-rose-300 border-rose-400/35'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          <AlertTriangle className="w-3 h-3" /> Atrasada
        </span>
      );
    }
    if (isToday) {
      return (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
            tintedGlass
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/35'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          Hoje
        </span>
      );
    }
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          tintedGlass
            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/35'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}
      >
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
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 ${
            tintedGlass
              ? 'bg-emerald-500/20 border-emerald-400/35 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{activeNotificationToast}</span>
          </div>
          <button
            onClick={() => setActiveNotificationToast(null)}
            className="hover:opacity-80 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Filter Bar */}
      <div
        className={`flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl transition-all ${
          tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="aptis-meniscus-track flex items-center p-1 rounded-full gap-1">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'agenda' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
              style={
                viewMode === 'agenda'
                  ? {
                      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                      boxShadow:
                        '0 0 18px rgba(6, 182, 212, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                    }
                  : undefined
              }
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Agenda / Linha do Tempo
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'month' ? 'text-white' : 'text-slate-300 hover:text-white'
              }`}
              style={
                viewMode === 'month'
                  ? {
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      boxShadow:
                        '0 0 18px rgba(16, 185, 129, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.6)',
                    }
                  : undefined
              }
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Visão Mensal
            </button>
          </div>

          {/* Client Filter */}
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={`text-xs rounded-xl px-3 py-2 outline-none font-medium cursor-pointer transition ${
              tintedGlass
                ? 'aptis-glass-input text-white'
                : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">
              Todos os Clientes
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`text-xs rounded-xl px-3 py-2 outline-none font-medium cursor-pointer transition ${
              tintedGlass
                ? 'aptis-glass-input text-white'
                : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs'
            }`}
          >
            <option value="all" className="bg-slate-900 text-white">
              Todos os Status
            </option>
            <option value="scheduled" className="bg-slate-900 text-white">
              Agendadas
            </option>
            <option value="in_progress" className="bg-slate-900 text-white">
              Em Andamento
            </option>
            <option value="completed" className="bg-slate-900 text-white">
              Concluídas
            </option>
          </select>
        </div>

        <button
          onClick={onNewOrder}
          className="px-5 py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center justify-center gap-2 cursor-pointer border border-cyan-300/35 hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
            boxShadow:
              '0 0 18px rgba(6, 182, 212, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
          }}
        >
          <Plus className="w-4 h-4" />
          Agendar Nova Visita (OS)
        </button>
      </div>

      {/* Automated Rules Alert Pill */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs transition-all ${
          tintedGlass
            ? 'aptis-glass-subcard border-cyan-400/25 text-slate-200'
            : 'bg-blue-50/80 border-blue-200 text-blue-950 shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-2 font-medium">
          <MessageSquare
            className={`w-4 h-4 shrink-0 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`}
          />
          <span>
            <strong className={tintedGlass ? 'text-cyan-300 font-black' : 'text-blue-900 font-bold'}>
              Régua de Disparos Automáticos Ativa:
            </strong>{' '}
            Alertas programados para 30 dias, 7 dias e 1 dia antes da visita via WhatsApp e E-mail.
          </span>
        </div>
        <div
          className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
            tintedGlass
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/35'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          4 Regras Operacionais
        </div>
      </div>

      {/* Main View: Agenda List */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div
              className={`p-12 text-center rounded-3xl border border-dashed ${
                tintedGlass
                  ? 'aptis-glass-dark border-white/15 text-slate-300'
                  : 'border-slate-300 bg-white text-slate-600'
              }`}
            >
              <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                Nenhum atendimento encontrado para os filtros selecionados
              </p>
              <p className="text-xs mt-1 opacity-75">
                Tente selecionar outro cliente ou crie um novo agendamento.
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`p-4 rounded-2xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group ${
                  tintedGlass
                    ? 'aptis-glass-dark aptis-glass-subcard-interactive text-white'
                    : 'bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-300 text-slate-900'
                }`}
              >
                {/* Left Date / Time Badge */}
                <div className="flex items-center gap-3.5 shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-mono ${
                      tintedGlass
                        ? 'aptis-glass-subcard border-cyan-400/30 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold uppercase ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {new Date(order.scheduledDate).toLocaleDateString('pt-BR', {
                        month: 'short',
                      })}
                    </span>
                    <span
                      className={`text-xl font-black leading-tight ${
                        tintedGlass ? 'text-cyan-300' : 'text-blue-700'
                      }`}
                    >
                      {new Date(order.scheduledDate).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-mono font-black ${
                          tintedGlass ? 'text-cyan-400' : 'text-blue-600'
                        }`}
                      >
                        {order.orderNumber}
                      </span>
                      {getUrgencyBadge(order)}
                    </div>
                    <h4
                      className={`text-sm font-black mt-0.5 ${
                        tintedGlass ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {order.equipmentTag} • {order.equipmentName}
                    </h4>
                    <p
                      className={`text-xs flex items-center gap-1.5 mt-0.5 ${
                        tintedGlass ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <Building2
                        className={`w-3.5 h-3.5 ${
                          tintedGlass ? 'text-cyan-400' : 'text-slate-400'
                        }`}
                      />
                      {order.clientName} ({order.branchName})
                    </p>
                  </div>
                </div>

                {/* Middle Tech Info & Window */}
                <div
                  className={`flex-1 text-xs space-y-1 md:border-l md:pl-4 ${
                    tintedGlass
                      ? 'text-slate-300 md:border-white/10'
                      : 'text-slate-600 md:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        tintedGlass ? 'text-cyan-400' : 'text-slate-400'
                      }`}
                    />
                    <span>
                      Janela:{' '}
                      <strong className={tintedGlass ? 'text-white' : 'text-slate-800'}>
                        {order.scheduledTimeWindow || '08:00 - 12:00'}
                      </strong>
                    </span>
                  </div>
                  <div>
                    Responsável:{' '}
                    <strong className={tintedGlass ? 'text-white' : 'text-slate-800'}>
                      {order.technicianName}
                    </strong>
                  </div>
                  <p
                    className={`text-[11px] line-clamp-1 italic ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    &quot;{order.symptomsReported}&quot;
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div
                  className={`flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 ${
                    tintedGlass ? 'border-white/10' : 'border-slate-100'
                  }`}
                >
                  <button
                    onClick={() => handleSendWhatsAppNotification(order)}
                    title="Disparar aviso de visita via WhatsApp para o cliente"
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                      tintedGlass
                        ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-400/35'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-2xs'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onOpenOrder(order)}
                    className="px-4 py-2 text-xs font-bold rounded-xl text-white transition flex items-center gap-1.5 cursor-pointer border border-cyan-300/35 hover:brightness-110"
                    style={{
                      background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                      boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {order.status === 'completed' ? 'Ver Laudo' : 'Baixar / Laudo OS'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Month Grid View */}
      {viewMode === 'month' && (
        <div
          className={`p-6 rounded-3xl space-y-4 transition-all ${
            tintedGlass ? 'aptis-glass-dark text-white' : 'aptis-glass-light text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-black capitalize ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </h3>
            <span className={`text-xs font-medium ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
              {filteredOrders.length} visitas programadas no mês
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div
                key={day}
                className={`py-1 font-bold text-[11px] uppercase tracking-wider ${
                  tintedGlass ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
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
                      ? tintedGlass
                        ? 'aptis-glass-subcard border-cyan-400/40 hover:border-cyan-400'
                        : 'border-blue-300 bg-blue-50/40 hover:border-blue-500 shadow-2xs'
                      : tintedGlass
                      ? 'border-white/[0.06] bg-white/[0.02]'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold font-mono ${
                      tintedGlass ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayOrders.length > 0 && (
                    <div className="space-y-1">
                      {dayOrders.map((o) => (
                        <button
                          key={o.id}
                          onClick={() => onOpenOrder(o)}
                          className={`w-full text-left p-1 rounded-lg border text-[9px] font-bold truncate block transition cursor-pointer ${
                            tintedGlass
                              ? 'bg-cyan-500/20 border-cyan-400/35 text-cyan-200 hover:bg-cyan-500/35'
                              : 'bg-white border-blue-200 text-slate-800 hover:border-blue-500 shadow-2xs'
                          }`}
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
