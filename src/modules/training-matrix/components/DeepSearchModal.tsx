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
}

export const DeepSearchModal: React.FC<DeepSearchModalProps> = ({
  isOpen,
  onClose,
  documents
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Busca Inteligente no Conteúdo (Deep Search)</h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded uppercase tracking-wider">
                  Full-Text OCR
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pesquise qualquer palavra-chave, cláusula de NR, número de norma ou instrução de POP dentro dos arquivos anexados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-600" />
            <input
              type="text"
              autoFocus
              placeholder="Digite o que deseja encontrar (ex: '1000V', 'trava-quedas', 'inspeção visual', 'LOTO')..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-amber-50/40 border-2 border-amber-300 focus:border-amber-500 rounded-xl focus:outline-none focus:bg-white text-slate-900 font-medium placeholder-slate-400 transition-all shadow-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs p-1"
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
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 text-xs transition-colors shrink-0 cursor-pointer border border-slate-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Category Filter */}
        <div className="flex items-center justify-between py-2 border-y border-slate-100 text-xs text-slate-500">
          <span>
            {query.trim().length >= 2 ? (
              <>
                Encontrados <strong className="text-slate-900">{searchResults.length}</strong> documento(s) com correspondência
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
              className="text-xs bg-slate-50 border border-slate-200 rounded-md py-1 px-2 focus:outline-none"
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
            <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
              Nenhuma ocorrência de <strong>"{query}"</strong> encontrada no texto dos documentos anexados.
            </div>
          ) : (
            searchResults.map((res, index) => (
              <div
                key={res.document.id}
                className="bg-white hover:bg-amber-50/20 rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 bg-slate-100 rounded-lg shrink-0">
                      {getFileIcon(res.document.fileType)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-2">
                        {highlightMatch(res.document.fileName, query)}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Vinculado: <strong className="text-slate-700">{res.document.associatedName}</strong> • {formatDate(res.document.uploadDate)}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                    {res.matchCount} ocorrência{res.matchCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Highlighted Snippet */}
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs font-mono text-slate-700 leading-relaxed">
                  "{highlightMatch(res.snippet, query)}"
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setViewingDoc(res.document)}
                    className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Abrir Documento
                  </button>
                  <button
                    onClick={() => alert(`Baixando cópia oficial de ${res.document.fileName}...`)}
                    className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
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
          <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  {getFileIcon(viewingDoc.fileType)}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{viewingDoc.fileName}</h3>
                    <span className="text-[10px] text-slate-500">Vinculado a: {viewingDoc.associatedName}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {highlightMatch(viewingDoc.content, query)}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer"
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
