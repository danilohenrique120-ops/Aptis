'use client';

import React, { useState } from 'react';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { PlantSector } from '@/types/sectors';
import { 
  X, 
  Plus, 
  Building2, 
  Trash2, 
  Edit2, 
  Check, 
  AlertTriangle, 
  Cloud, 
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PlantSectorsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName?: string;
}

const COLOR_OPTIONS = [
  { label: 'Azul Industrial', value: 'from-blue-600 to-indigo-600', dot: 'bg-blue-600' },
  { label: 'Verde Esmeralda', value: 'from-emerald-600 to-teal-600', dot: 'bg-emerald-600' },
  { label: 'Âmbar / Laranja', value: 'from-amber-600 to-orange-600', dot: 'bg-amber-600' },
  { label: 'Ciano Técnico', value: 'from-cyan-600 to-blue-600', dot: 'bg-cyan-600' },
  { label: 'Roxo Corporativo', value: 'from-purple-600 to-indigo-600', dot: 'bg-purple-600' },
  { label: 'Grafite Sólido', value: 'from-slate-600 to-slate-800', dot: 'bg-slate-700' }
];

export function PlantSectorsManagerModal({
  isOpen,
  onClose,
  tenantName = 'Planta Principal'
}: PlantSectorsManagerModalProps) {
  const { sectors, addSector, updateSector, deleteSector, isSynced } = usePlantSectors();

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<PlantSector | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerRole, setManagerRole] = useState('Supervisor de Operações');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (sector: PlantSector) => {
    setEditingSectorId(sector.id);
    setName(sector.name);
    setCode(sector.code);
    setDescription(sector.description || '');
    setManagerName(sector.managerName || '');
    setManagerRole(sector.managerRole || 'Supervisor de Operações');
    setSelectedColor(sector.color || COLOR_OPTIONS[0].value);
    setActiveTab('add');
  };

  const handleCancelForm = () => {
    setEditingSectorId(null);
    setName('');
    setCode('');
    setDescription('');
    setManagerName('');
    setActiveTab('list');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingSectorId) {
      updateSector(editingSectorId, {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description.trim(),
        managerName: managerName.trim() || 'Supervisor Responsável',
        managerRole: managerRole.trim(),
        color: selectedColor
      });
      setSuccessMessage(`Setor "${name}" atualizado com sucesso!`);
    } else {
      addSector({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description.trim() || `Área operacional de ${name}.`,
        managerName: managerName.trim() || 'Supervisor Responsável',
        managerRole: managerRole.trim(),
        color: selectedColor
      });
      setSuccessMessage(`Novo setor "${name}" cadastrado com sucesso!`);
    }

    handleCancelForm();
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleConfirmDelete = () => {
    if (!sectorToDelete) return;
    deleteSector(sectorToDelete.id);
    setSuccessMessage(`Setor "${sectorToDelete.name}" excluído de todas as ferramentas.`);
    setSectorToDelete(null);
    setDeleteConfirmationText('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-8">
        
        {/* Header Modal */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  Estrutura Organizacional da Planta
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <Cloud className="w-3 h-3" />
                  Sincronizado
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Central de Áreas & Setores Fabris
              </h2>
              <p className="text-xs text-slate-300">
                Planta: <strong className="text-white">{tenantName}</strong> • Alterações refletem automaticamente em todas as ferramentas.
              </p>
            </div>
          </div>

          {/* Abas Superiores */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => { setActiveTab('list'); setEditingSectorId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Setores Cadastrados ({sectors.length})
            </button>
            <button
              onClick={() => { setActiveTab('add'); setEditingSectorId(null); setName(''); setCode(''); setDescription(''); setManagerName(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'add' && !editingSectorId
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Novo Setor
            </button>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="p-6">
          {activeTab === 'list' ? (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sectors.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-sm font-semibold text-slate-500">Nenhum setor cadastrado.</p>
                </div>
              ) : (
                sectors.map(sec => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sec.color || 'from-blue-600 to-indigo-600'} text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-md`}>
                        {sec.code}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {sec.name}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {sec.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {sec.description || 'Área de operações fabris'}
                        </p>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                          <span>👤 Líder: <strong>{sec.managerName || 'Não atribuído'}</strong></span>
                          <span>•</span>
                          <span>{sec.managerRole || 'Supervisor'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(sec)}
                        className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                        title="Editar Informações do Setor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSectorToDelete(sec)}
                        disabled={sectors.length <= 1}
                        className={`p-2 rounded-xl transition-colors ${
                          sectors.length <= 1
                            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                        }`}
                        title={sectors.length <= 1 ? "A planta deve possuir pelo menos 1 setor cadastrado" : "Excluir Setor"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Formulário de Adicionar / Editar */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nome Oficial do Setor / Linha *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Envase Asséptico Linha 02"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sigla / Código *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: ENV"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição / Processos Fabris da Área
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pasteurização, envase rotativo e rotulagem de frascos."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supervisor / Líder do Setor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Eduardo Silveira"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cargo do Líder
                  </label>
                  <input
                    type="text"
                    value={managerRole}
                    onChange={e => setManagerRole(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Identidade Visual / Cor do Setor
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition ${
                        selectedColor === c.value
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${c.value}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Propagação Automática:</strong> Ao salvar, este setor ficará disponível imediatamente para filtros, dashboards e cadastros em todas as ferramentas da plataforma.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-md shadow-blue-500/20"
                >
                  {editingSectorId ? 'Salvar Alterações' : 'Criar Setor & Sincronizar'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal de Confirmação de Exclusão de Setor */}
        {sectorToDelete && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-rose-200 dark:border-rose-900 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Excluir o setor &quot;{sectorToDelete.name}&quot;?
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Ao excluir este setor, ele será removido das opções de seleção em <strong>todas as ferramentas</strong> (Matriz de Habilidades, Kaizen, HERCA, Treinamentos e Rotina).
              </p>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
                ⚠️ Registros já existentes (como tarefas passadas ou investigações arquivadas) permanecerão no histórico, mas novos registros não poderão usar esta área.
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setSectorToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-600/20"
                >
                  Sim, Excluir Setor
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
