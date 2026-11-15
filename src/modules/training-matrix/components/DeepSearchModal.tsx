'use client';

import React, { useState, useMemo } from 'react';
import { DocumentAttachment, SearchMatchResult } from '../types';
import { 
  X, 
  Search, 
  Sparkles, 
  FileText, 
  FileCode, 
  File, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  Download,
  BookOpen,
  Filter
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DeepSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentAttachment[];
  tintedGlass?: boolean;
}

export const DeepSearchModal: React.FC<DeepSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  tintedGlass = false
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewingDoc, setViewingDoc] = useState<DocumentAttachment | null>(null);

  if (!isOpen) return null;

  // Extraction of snippet with highlighted match
  const searchResults: SearchMatchResult[] = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];

    const lowerQuery = query.toLowerCase();
    const results: SearchMatchResult[] = [];

    documents.forEach(doc => {
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) return;

      const lowerContent = doc.content.toLowerCase();
      const lowerFileName = doc.fileName.toLowerCase();
      const lowerAssociated = (doc.associatedName || '').toLowerCase();

      const inContent = lowerContent.includes(lowerQuery);
      const inTitle = lowerFileName.includes(lowerQuery);
      const inAssociated = lowerAssociated.includes(lowerQuery);

      if (inContent || inTitle || inAssociated) {
        // Count occurrences
        let count = 0;
        let pos = lowerContent.indexOf(lowerQuery);
        let firstPos = pos;
        while (pos !== -1) {
          count++;
          pos = lowerContent.indexOf(lowerQuery, pos + 1);
        }

        if (count === 0 && (inTitle || inAssociated)) count = 1;

        // Extract snippet around first occurrence
        let snippet = '';
        if (firstPos !== -1) {
          const start = Math.max(0, firstPos - 60);
          const end = Math.min(doc.content.length, firstPos + query.length + 80);
          snippet = (start > 0 ? '...' : '') + doc.content.substring(start, end) + (end < doc.content.length ? '...' : '');
        } else {
          snippet = doc.content.substring(0, 140) + '...';
        }

        results.push({
          document: doc,
          snippet,
          matchCount: count
        });
      }
    });

    // Sort by match count descending
    return results.sort((a, b) => b.matchCount - a.matchCount);
  }, [query, documents, selectedCategory]);

  const highlightMatch = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={index} className="bg-amber-200 text-amber-950 font-bold px-1 rounded shadow-2xs">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-rose-500" />;
      case 'docx':
      case 'doc': return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'txt': return <File className="w-5 h-5 text-slate-500" />;
      default: return <FileText className="w-5 h-5 text-amber-500" />;
    }
  };

  const QUICK_TERMS = [
    '1000V',
    'trava-quedas',
    'LOTO',
    'óleo hidráulico',
    'EPI classe 2',
    'NR-35',
    'solda MIG',
    'reciclagem'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-3xl shadow-2xl max-w-3xl w-full p-6 border my-8 transition-all ${
          tintedGlass
            ? 'aptis-glass-modal text-white border-white/10'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                  Busca Inteligente no Conteúdo (Deep Search)
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${
                  tintedGlass
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-amber-100 text-amber-900 border-amber-200'
                }`}>
                  Full-Text OCR
                </span>
              </div>
              <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Pesquise qualquer palavra-chave, cláusula de NR, número de norma ou instrução de POP dentro dos arquivos anexados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
            <input
              type="text"
              autoFocus
              placeholder="Digite o que deseja encontrar (ex: '1000V', 'trava-quedas', 'inspeção visual', 'LOTO')..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className={`w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none font-medium transition-all shadow-xs ${
                tintedGlass
                  ? 'aptis-glass-input text-white placeholder-slate-400 border-amber-500/40 focus:border-amber-400'
                  : 'bg-amber-50/40 border-2 border-amber-300 focus:border-amber-500 focus:bg-white text-slate-900 placeholder-slate-400'
              }`}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs p-1 ${
                  tintedGlass ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold shrink-0">Sugestões rápidas:</span>
            {QUICK_TERMS.map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors shrink-0 cursor-pointer border ${
                  tintedGlass
                    ? 'bg-white/10 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border-white/15'
                    : 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border-slate-200'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Category Filter */}
        <div className={`flex items-center justify-between py-2 border-y text-xs ${
          tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-100 text-slate-500'
        }`}>
          <span>
            {query.trim().length >= 2 ? (
              <>
                Encontrados <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>{searchResults.length}</strong> documento(s) com correspondência
              </>
            ) : (
              'Digite pelo menos 2 caracteres para iniciar a varredura profunda'
            )}
          </span>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className={`text-xs rounded-md py-1 px-2 focus:outline-none ${
                tintedGlass
                  ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <option value="all">Todas as Categorias</option>
              <option value="certificate">Certificados</option>
              <option value="procedure_pop">POPs</option>
              <option value="attendance_sheet">Listas de Presença</option>
              <option value="norm_reference">Normas</option>
            </select>
          </div>
        </div>

        {/* Search Results List */}
        <div className="max-h-[50vh] overflow-y-auto py-3 space-y-3 pr-1">
          {query.trim().length >= 2 && searchResults.length === 0 ? (
            <div className={`py-12 text-center text-xs text-slate-400 italic rounded-xl border border-dashed ${
              tintedGlass ? 'bg-white/5 border-white/15' : 'bg-slate-50 border-slate-200'
            }`}>
              Nenhuma ocorrência de <strong>"{query}"</strong> encontrada no texto dos documentos anexados.
            </div>
          ) : (
            searchResults.map((res) => (
              <div
                key={res.document.id}
                className={`rounded-xl p-3.5 border transition-all space-y-2 ${
                  tintedGlass
                    ? 'aptis-glass-subcard border-white/10 hover:border-amber-400/40'
                    : 'bg-white hover:bg-amber-50/20 border-slate-200 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${tintedGlass ? 'bg-white/10' : 'bg-slate-100'}`}>
                      {getFileIcon(res.document.fileType)}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate flex items-center gap-2 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                        {highlightMatch(res.document.fileName, query)}
                      </h4>
                      <div className={`text-[11px] mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                        Vinculado: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{res.document.associatedName}</strong> • {formatDate(res.document.uploadDate)}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                    tintedGlass
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-amber-100 text-amber-900 border-amber-200'
                  }`}>
                    {res.matchCount} ocorrência{res.matchCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Highlighted Snippet */}
                <div className={`p-2.5 rounded-lg border text-xs font-mono leading-relaxed ${
                  tintedGlass
                    ? 'bg-slate-950/60 border-white/10 text-slate-300'
                    : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  "{highlightMatch(res.snippet, query)}"
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setViewingDoc(res.document)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      tintedGlass
                        ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                        : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Abrir Documento
                  </button>
                  <button
                    onClick={() => alert(`Baixando cópia oficial de ${res.document.fileName}...`)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      tintedGlass
                        ? 'bg-white/10 text-slate-200 hover:bg-white/20'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Baixar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Visualizador Interno de Documento com Highlight */}
        {viewingDoc && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`rounded-3xl shadow-2xl max-w-2xl w-full p-6 border flex flex-col max-h-[85vh] ${
                tintedGlass
                  ? 'aptis-glass-modal text-white border-white/10'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2.5">
                  {getFileIcon(viewingDoc.fileType)}
                  <div>
                    <h3 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                      {viewingDoc.fileName}
                    </h3>
                    <span className={`text-[10px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      Vinculado a: {viewingDoc.associatedName}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className={`p-1 rounded-lg cursor-pointer ${tintedGlass ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <div className="p-3 bg-slate-950/80 border border-white/10 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {highlightMatch(viewingDoc.content, query)}
                </div>
              </div>

              <div className={`pt-3 border-t flex items-center justify-end ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer"
                >
                  Fechar Visualizador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
