'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SpeakerRole, TranscriptBlock } from '../types';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  User, 
  UserCheck, 
  Volume2, 
  Sparkles, 
  Check, 
  AlertCircle,
  Clock,
  Radio
} from 'lucide-react';

interface LiveMeetingRecorderProps {
  managerName: string;
  employeeName: string;
  transcripts: TranscriptBlock[];
  onAddTranscript: (block: TranscriptBlock) => void;
  onTranscriptionUpdate?: (fullText: string) => void;
}

export function LiveMeetingRecorder({
  managerName,
  employeeName,
  transcripts,
  onAddTranscript,
  onTranscriptionUpdate
}: LiveMeetingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [autoDiarization, setAutoDiarization] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerRole>('manager');
  const [interimText, setInterimText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSpeakerRef = useRef<SpeakerRole>('manager');
  const autoDiarizationRef = useRef<boolean>(true);
  const lastFinalTimestampRef = useRef<number>(Date.now());

  useEffect(() => {
    currentSpeakerRef.current = currentSpeaker;
  }, [currentSpeaker]);

  useEffect(() => {
    autoDiarizationRef.current = autoDiarization;
  }, [autoDiarization]);

  // Inicializa reconhecimento de fala via Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
    return () => {
      stopRecording();
    };
  }, []);

  // Timer de gravação
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    setHasPermissionError(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            const trimmed = transcriptPart.trim();
            if (trimmed) {
              const now = Date.now();
              const timeSinceLastFinal = now - lastFinalTimestampRef.current;
              lastFinalTimestampRef.current = now;

              // REGRAS DE DIARIZAÇÃO AUTOMÁTICA EM TEMPO REAL:
              // Se o modo automático estiver ativo:
              // 1. Se houve pausa na conversa maior que 1.8 segundos, ou
              // 2. Se a frase anterior terminou com tom de pergunta (interrogação ou palavras interrogativas),
              // alternamos automaticamente o orador!
              let assignedSpeaker = currentSpeakerRef.current;

              if (autoDiarizationRef.current) {
                const isQuestion = trimmed.endsWith('?') ||
                  /^(como|qual|quando|onde|por que|porque|você|voce|me conta|o que|conte-me)/i.test(trimmed);

                // Se passou mais de 1.8s de silêncio e o bloco anterior era longo, alterna o orador
                if (timeSinceLastFinal > 1800) {
                  assignedSpeaker = currentSpeakerRef.current === 'manager' ? 'employee' : 'manager';
                  currentSpeakerRef.current = assignedSpeaker;
                  setCurrentSpeaker(assignedSpeaker);
                }
              }

              const newBlock: TranscriptBlock = {
                id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                speaker: assignedSpeaker,
                speakerName: assignedSpeaker === 'manager' ? `${managerName} (Gestor)` : employeeName,
                timestamp: formatTimer(seconds),
                text: trimmed
              };
              onAddTranscript(newBlock);

              // Se a fala acabou de ser uma pergunta do gestor, a próxima fala esperada é automaticamente do liderado
              if (autoDiarizationRef.current && assignedSpeaker === 'manager' && (trimmed.endsWith('?') || /^(como|qual|o que|onde)/i.test(trimmed))) {
                currentSpeakerRef.current = 'employee';
                setCurrentSpeaker('employee');
              }
            }
          } else {
            interim += transcriptPart;
          }
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setHasPermissionError(true);
          stopRecording();
        }
      };

      recognition.onend = () => {
        // Se ainda estiver marcado como gravando, reinicia automaticamente para manter contínuo
        if (isRecording && recognitionRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // ignore
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    } catch (err) {
      console.error('Falha ao iniciar reconhecimento:', err);
      setHasPermissionError(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setInterimText('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSpeakerChange = (speaker: SpeakerRole) => {
    // Se havia texto intermediário antes de mudar, salva com o orador anterior
    if (interimText.trim()) {
      onAddTranscript({
        id: `tr-${Date.now()}`,
        speaker: currentSpeaker,
        speakerName: currentSpeaker === 'manager' ? `${managerName} (Gestor)` : employeeName,
        timestamp: formatTimer(seconds),
        text: interimText.trim()
      });
      setInterimText('');
    }
    setCurrentSpeaker(speaker);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
      {/* Topo do Gravador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all ${
            isRecording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'
          }`}>
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Transcrição & Gravação em Tempo Real</h4>
              {isRecording && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  Gravando ao Vivo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Captura as falas da reunião e separa automaticamente o que cada um falou.
            </p>
          </div>
        </div>

        {/* Botão Iniciar / Parar Gravação */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {formatTimer(seconds)}
          </span>

          <button
            type="button"
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20 font-black'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-4 h-4 fill-current" /> Pausar Gravação
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Iniciar Gravação
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas de Suporte ou Permissão */}
      {!isSupported && (
        <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Seu navegador não possui suporte nativo à Web Speech API (recomendamos Google Chrome ou Microsoft Edge no computador para usar a transcrição por voz). Você pode continuar fazendo anotações manuais normalmente.
          </span>
        </div>
      )}

      {hasPermissionError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>
            Permissão do microfone negada. Clique no ícone de cadeado na barra de endereço do navegador e permita o uso do microfone para transcrever a reunião.
          </span>
        </div>
      )}

      {/* CONTROLE DE DIARIZAÇÃO: IDENTIFICAÇÃO AUTOMÁTICA & MANUAL */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {autoDiarization && isRecording && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${autoDiarization ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Identificação Automática de Orador (Diarização)
            </span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              autoDiarization 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              {autoDiarization ? 'Ativada (Mãos Livres)' : 'Desativada (Manual)'}
            </span>
          </div>

          {/* Alternar modo Automático / Manual */}
          <button
            type="button"
            onClick={() => setAutoDiarization(!autoDiarization)}
            className={`text-xs px-3 py-1 rounded-lg font-medium transition-all border cursor-pointer ${
              autoDiarization
                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {autoDiarization ? 'Modo Mãos Livres Ativo' : 'Ativar Modo Mãos Livres'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-md">
            {autoDiarization 
              ? '✨ O sistema detecta perguntas e pausas naturais para alternar automaticamente quem está falando sem você precisar clicar.' 
              : 'Clique abaixo para alternar manualmente quem está com a palavra agora.'}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">Orador Atual:</span>
            <div className="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => handleSpeakerChange('manager')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentSpeaker === 'manager'
                    ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Clique para forçar Gestor como orador"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>👔 {managerName} (Gestor)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSpeakerChange('employee')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentSpeaker === 'employee'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Clique para forçar Colaborador como orador"
              >
                <User className="w-3.5 h-3.5" />
                <span>👤 {employeeName} (Colaborador)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE TRANSCRIÇÃO AO VIVO EM TEMPO REAL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Histórico de Falas Capturadas ({transcripts.length})</span>
          {isRecording && <span className="text-cyan-400 text-[11px] animate-pulse">Ouvindo pelo microfone...</span>}
        </div>

        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-60 overflow-y-auto space-y-3 font-sans text-xs">
          {transcripts.length === 0 && !interimText && (
            <p className="text-slate-500 italic text-center py-6">
              Nenhuma fala transcrita ainda. Clique em <strong>"Iniciar Gravação"</strong> e comece a conversar com o liderado.
            </p>
          )}

          {transcripts.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                item.speaker === 'manager'
                  ? 'bg-blue-950/20 border-blue-900/40 text-blue-100 ml-0 mr-6'
                  : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-100 ml-6 mr-0'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`font-bold text-[11px] flex items-center gap-1 ${
                  item.speaker === 'manager' ? 'text-blue-300' : 'text-emerald-300'
                }`}>
                  {item.speaker === 'manager' ? '👔' : '👤'} {item.speakerName}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
              </div>
              <p className="text-slate-200 leading-relaxed text-xs">{item.text}</p>
            </div>
          ))}

          {/* Texto sendo falado no exato instante (Interim) */}
          {interimText && (
            <div className={`p-3 rounded-xl border border-dashed animate-pulse ${
              currentSpeaker === 'manager'
                ? 'bg-blue-950/10 border-blue-500/50 text-blue-200 ml-0 mr-6'
                : 'bg-emerald-950/10 border-emerald-500/50 text-emerald-200 ml-6 mr-0'
            }`}>
              <span className="text-[10px] text-slate-400 block mb-0.5">
                Falando agora ({currentSpeaker === 'manager' ? managerName : employeeName}):
              </span>
              <p className="text-slate-300 italic">{interimText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
