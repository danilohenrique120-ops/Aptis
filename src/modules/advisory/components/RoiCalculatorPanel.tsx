'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Calendar,
  X,
  FileCheck,
  Calculator,
  ArrowUpRight,
} from 'lucide-react';
import { FinancialImpactGain, ConsultingClient } from '../types';

interface RoiCalculatorPanelProps {
  gains: FinancialImpactGain[];
  client: ConsultingClient | null;
  onSaveGain: (newGain: FinancialImpactGain) => void;
}

export const RoiCalculatorPanel: React.FC<RoiCalculatorPanelProps> = ({
  gains,
  client,
  onSaveGain,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FinancialImpactGain['category']>('cost_reduction');
  const [recurrence, setRecurrence] = useState<FinancialImpactGain['recurrence']>('annual');
  const [verifiedAmount, setVerifiedAmount] = useState<number>(50000);
  const [description, setDescription] = useState('');
  const [validatedByName, setValidatedByName] = useState(client?.sponsorName || 'Diretoria');

  const clientGains = gains.filter((g) => !client || g.clientId === client.id);

  // Total verified savings
  const totalVerifiedGains = clientGains.reduce((sum, g) => sum + g.verifiedAmount, 0);

  // Total fees paid (approximated by duration or total contract)
  const totalFeesInvested = client ? client.totalContractValue : 100000;

  // ROI multiplier
  const roiMultiplier =
    totalFeesInvested > 0 ? (totalVerifiedGains / totalFeesInvested).toFixed(1) : '1.0';

  const netGain = totalVerifiedGains - totalFeesInvested;

  const handleCreateGain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client) return;

    const newGain: FinancialImpactGain = {
      id: `gn-${Date.now()}`,
      clientId: client.id,
      title: title.trim(),
      category,
      recurrence,
      verifiedAmount,
      status: 'validated_by_client',
      validatedByName,
      validatedAt: new Date().toISOString().split('T')[0],
      description,
    };

    onSaveGain(newGain);
    setIsAddModalOpen(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Hero Financial Overview */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border border-emerald-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              Calculadora de Retorno Sobre Investimento (ROI)
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              Comprovação de Ganhos Financeiros da Consultoria
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Toda melhoria implantada é quantificada e validada pela liderança do cliente.
              Demonstre objetivamente para o conselho que a consultoria não é um custo, mas um
              investimento de alto retorno.
            </p>
          </div>

          {/* Big ROI Box */}
          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-md text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Multiplicador de ROI
            </span>
            <div className="text-4xl font-black text-emerald-600 mt-1 flex items-center justify-center gap-1">
              {roiMultiplier}x
              <ArrowUpRight className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              R$ {roiMultiplier} gerados para cada R$ 1 investido
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Ganhos Totais Validados
          </span>
          <div className="text-2xl font-black text-emerald-600 mt-1.5">
            {totalVerifiedGains.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Economias e receitas adicionais apuradas
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Honorários Investidos no Projeto
          </span>
          <div className="text-2xl font-black text-slate-900 mt-1.5">
            {totalFeesInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-slate-500 font-medium">Valor global do contrato</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Resultado Líquido para o Cliente
          </span>
          <div
            className={`text-2xl font-black mt-1.5 ${
              netGain >= 0 ? 'text-blue-700' : 'text-slate-700'
            }`}
          >
            {netGain.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Superávit líquido no caixa da empresa
          </span>
        </div>
      </div>

      {/* Gains Breakdown List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Discriminação de Oportunidades & Economias Confirmadas ({clientGains.length})
          </h3>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-md shadow-emerald-600/25 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Novo Ganho Financeiro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientGains.map((gain) => (
            <div
              key={gain.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {gain.category === 'cost_reduction'
                      ? 'Redução de Custos'
                      : gain.category === 'revenue_increase'
                      ? 'Receita Adicional'
                      : gain.category === 'time_saved'
                      ? 'Horas & Eficiência'
                      : 'Mitigação de Risco'}
                  </span>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {gain.recurrence === 'annual'
                      ? 'Anualizado'
                      : gain.recurrence === 'monthly'
                      ? 'Mensal'
                      : 'Pontual (One-Off)'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 mt-2">{gain.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{gain.description}</p>

                <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Validado por:
                    </span>
                    <strong className="text-slate-800 font-semibold">{gain.validatedByName}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">
                      Data da Validação:
                    </span>
                    <span className="font-mono text-slate-600">{gain.validatedAt}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Economia Apurada:</span>
                <span className="text-lg font-black text-emerald-600 font-mono">
                  {gain.verifiedAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Gain Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 my-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Registrar Ganho / Economia Financeira
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGain} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 mb-1 block">Título da Melhoria Financeira *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Eliminação de sucata por ajuste no dispositivo..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Categoria do Ganho</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none"
                  >
                    <option value="cost_reduction">Redução de Custos / Desperdício</option>
                    <option value="revenue_increase">Aumento de Receita / Vendas</option>
                    <option value="time_saved">Horas Extras Poupadas</option>
                    <option value="compliance_risk">Mitigação de Multas / Passivos</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Recorrência</label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-medium text-slate-800 outline-none"
                  >
                    <option value="annual">Anualizada (Impacto de 12 meses)</option>
                    <option value="monthly">Mensal Recorrente</option>
                    <option value="one_time">Pontual (One-Off)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Valor Validado (R$) *</label>
                  <input
                    type="number"
                    required
                    value={verifiedAmount}
                    onChange={(e) => setVerifiedAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 font-mono font-bold text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Aprovador no Cliente</label>
                  <input
                    type="text"
                    value={validatedByName}
                    onChange={(e) => setValidatedByName(e.target.value)}
                    placeholder="Nome do Gestor / Controller"
                    className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Memória de Cálculo & Justificativa</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique como o número foi calculado e a evidência comprovada..."
                  className="w-full text-xs bg-slate-50 border border-slate-300 focus:bg-white rounded-xl p-2.5 text-slate-800 resize-none outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/25"
                >
                  Confirmar & Adicionar ao ROI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
