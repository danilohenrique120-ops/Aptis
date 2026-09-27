'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Wrench,
  Cpu,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Package,
  Activity,
  Zap,
} from 'lucide-react';
import { CrossClientDiagnostic } from '../types';

interface CrossClientAiDiagnosticsProps {
  diagnostics: CrossClientDiagnostic[];
  onApplyDiagnosticToOrder: (diagnostic: CrossClientDiagnostic) => void;
}

export const CrossClientAiDiagnostics: React.FC<CrossClientAiDiagnosticsProps> = ({
  diagnostics,
  onApplyDiagnosticToOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  const models = Array.from(new Set(diagnostics.map((d) => d.equipmentModel)));

  const filtered = diagnostics.filter((diag) => {
    if (selectedModel !== 'all' && diag.equipmentModel !== selectedModel) return false;
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();
    const matchesTitle = diag.symptomTitle.toLowerCase().includes(term);
    const matchesModel = diag.equipmentModel.toLowerCase().includes(term);
    const matchesKeywords = diag.symptomKeywords.some((k) => k.toLowerCase().includes(term));
    const matchesCauses = diag.causes.some(
      (c) =>
        c.cause.toLowerCase().includes(term) ||
        c.resolution.toLowerCase().includes(term) ||
        c.recommendedParts.some((p) => p.toLowerCase().includes(term))
    );

    return matchesTitle || matchesModel || matchesKeywords || matchesCauses;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner explaining Waze da Manutenção */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-muted/40 border border-primary/20 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
              <Sparkles className="w-3.5 h-3.5" />
              Waze da Manutenção Industrial • Inteligência Compartilhada
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Copiloto de Diagnósticos Cruzados Entre Clientes
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quando um técnico resolve uma falha complexa em um compressor Schulz no Cliente A, a
              solução e as peças recomendadas ficam disponíveis instantaneamente para orientar o
              técnico que atende o mesmo modelo no Cliente B. Evite viagens desnecessárias e acerte o
              diagnóstico na primeira tentativa.
            </p>
          </div>

          <div className="p-3 bg-card border border-border rounded-xl text-center shrink-0">
            <span className="text-2xl font-black text-primary block leading-none">94.8%</span>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Taxa de Primeira Correção
            </span>
          </div>
        </div>
      </div>

      {/* Search & Model Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-card border border-border rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sintoma, ruído, código de alarme ou peça (ex: superaquecimento, vibração, filtro)..."
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Modelo:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-xs bg-background border border-border rounded-xl px-3 py-2.5 text-foreground outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">Todos os Modelos</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center rounded-2xl border border-dashed border-border bg-card">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-foreground">Nenhum diagnóstico correspondente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tente buscar por termos mais genéricos como &quot;óleo&quot;, &quot;pressão&quot; ou selecione outro modelo.
            </p>
          </div>
        ) : (
          filtered.map((diag, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-border bg-card hover:border-primary/50 transition shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Model */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {diag.equipmentModel}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Média Reparo: ~{diag.averageRepairTimeHours}h</span>
                  </div>
                </div>

                {/* Symptom Title */}
                <h3 className="text-sm font-bold text-foreground mb-1">{diag.symptomTitle}</h3>

                {/* Keyword Pills */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {diag.symptomKeywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>

                {/* Historical Root Causes (Top Matched) */}
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Causas Raízes Históricas Confirmadas na Base de Clientes:
                  </span>

                  {diag.causes.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 rounded-xl bg-muted/20 border border-border/80 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-foreground">{c.cause}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                          {c.confidenceScore}% Probabilidade
                        </span>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Resolução padrão:</strong> {c.resolution}
                      </p>

                      {/* Recommended Parts to pack in technician van */}
                      <div className="pt-1">
                        <span className="text-[10px] font-semibold text-primary flex items-center gap-1 mb-1">
                          <Package className="w-3 h-3" />
                          Peças recomendadas para levar na van:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {c.recommendedParts.map((part, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[10px] bg-background px-2 py-0.5 rounded border border-border text-foreground font-medium"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground pt-1 flex items-center justify-between border-t border-border/40">
                        <span>Casos resolvidos com sucesso: <strong>{c.casesResolvedCount}</strong></span>
                        <span>Clientes da base testados: <strong>{c.clientsAffected.length}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onApplyDiagnosticToOrder(diag)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-sm mt-3"
              >
                <Zap className="w-4 h-4" />
                Criar Ordem de Serviço com Este Diagnóstico
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
