'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SpeakerRole, TranscriptBlock } from '../types';
import { 
  Mic, 
  Square, 
  Play, 
  User, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ArrowLeftRight, 
  Plus, 
  ListTodo,
  Volume2
} from 'lucide-react';

interface LiveMeetingRecorderProps {
  managerName: string;
  employeeName: string;
  transcripts: TranscriptBlock[];
  onAddTranscript: (block: TranscriptBlock) => void;
  onUpdateTranscript?: (id: string, updated: Partial<TranscriptBlock>) => void;
  onDeleteTranscript?: (id: string) => void;
  onCreateActionFromTranscript?: (text: string, speaker: SpeakerRole) => void;
}

export function LiveMeetingRecorder({
  managerName,
  employeeName,
  transcripts,
  onAddTranscript,
  onUpdateTranscript,
  onDeleteTranscript,
  onCreateActionFromTranscript
}: LiveMeetingRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [autoDiarization, setAutoDiarization] = useState(true);
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerRole>('manager');
  const [interimText, setInterimText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionErrorMsg, setPermissionErrorMsg] = useState<string | null>(null);

  // Métricas acústicas em tempo real (Web Audio API)
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentPitchHz, setCurrentPitchHz] = useState<number | null>(null);
  const [voiceProfiles, setVoiceProfiles] = useState<{ managerHz: number | null; employeeHz: number | null }>({
    managerHz: null,
    employeeHz: null
  });

  // Edição inline de transcrições e adição manual
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [manualText, setManualText] = useState('');

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const secondsRef = useRef<number>(0);
  const currentSpeakerRef = useRef<SpeakerRole>('manager');
  const autoDiarizationRef = useRef<boolean>(true);
  const lastFinalTimestampRef = useRef<number>(Date.now());

  // Web Audio API refs para análise de timbre/frequência vocal (Diarização Acústica)
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const utterancePitchSamplesRef = useRef<number[]>([]);
  const voiceProfilesRef = useRef<{ managerHz: number | null; employeeHz: number | null }>({
    managerHz: null,
    employeeHz: null
  });

  useEffect(() => {
    currentSpeakerRef.current = currentSpeaker;
  }, [currentSpeaker]);

  useEffect(() => {
    autoDiarizationRef.current = autoDiarization;
  }, [autoDiarization]);

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
        setSeconds(prev => {
          const next = prev + 1;
          secondsRef.current = next;
          return next;
        });
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

  // Estimador de frequência fundamental da voz humana (Pitch F0 entre 75Hz e 340Hz via Autocorrelação)
  const estimateVoicePitchHz = (timeDomainBuffer: Float32Array, sampleRate: number): number | null => {
    let sumSquares = 0;
    for (let i = 0; i < timeDomainBuffer.length; i++) {
      sumSquares += timeDomainBuffer[i] * timeDomainBuffer[i];
    }
    const rms = Math.sqrt(sumSquares / timeDomainBuffer.length);
    if (rms < 0.018) return null; // Silêncio ou ruído de fundo baixo

    const minLag = Math.floor(sampleRate / 340); // ~340 Hz max
    const maxLag = Math.floor(sampleRate / 75);  // ~75 Hz min
    let bestCorrelation = 0;
    let bestLag = -1;

    for (let lag = minLag; lag <= maxLag && lag < timeDomainBuffer.length; lag++) {
      let correlation = 0;
      for (let i = 0; i < timeDomainBuffer.length - lag; i++) {
        correlation += timeDomainBuffer[i] * timeDomainBuffer[i + lag];
      }
      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestLag = lag;
      }
    }

    if (bestLag > 0 && bestCorrelation / sumSquares > 0.35) {
      return Math.round(sampleRate / bestLag);
    }
    return null;
  };

  // Inicia análise acústica do microfone para medir volume e frequência de voz de cada pessoa
  const startAcousticAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const buffer = new Float32Array(analyser.fftSize);

      const analyzeLoop = () => {
        if (!isRecordingRef.current || !analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buffer);

        // Calcula nível de áudio (0 a 100)
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sum / buffer.length);
        const level = Math.min(100, Math.round(rms * 320));
        setAudioLevel(level);

        // Estima frequência vocal quando alguém está falando
        const pitch = estimateVoicePitchHz(buffer, audioCtx.sampleRate);
        if (pitch) {
          setCurrentPitchHz(pitch);
          utterancePitchSamplesRef.current.push(pitch);
          // Mantém últimas 40 amostras da frase atual
          if (utterancePitchSamplesRef.current.length > 40) {
            utterancePitchSamplesRef.current.shift();
          }

          // Se já temos os dois perfis vocais calibrados, atualiza o indicador visual em tempo real
          if (autoDiarizationRef.current) {
            const { managerHz, employeeHz } = voiceProfilesRef.current;
            if (managerHz !== null && employeeHz !== null && Math.abs(managerHz - employeeHz) >= 15) {
              const distManager = Math.abs(pitch - managerHz);
              const distEmployee = Math.abs(pitch - employeeHz);
              const liveDetected: SpeakerRole = distManager <= distEmployee ? 'manager' : 'employee';
              if (liveDetected !== currentSpeakerRef.current) {
                currentSpeakerRef.current = liveDetected;
                setCurrentSpeaker(liveDetected);
              }
            }
          }
        }

        rafRef.current = requestAnimationFrame(analyzeLoop);
      };

      rafRef.current = requestAnimationFrame(analyzeLoop);
    } catch (e) {
      console.warn('Análise acústica complementar indisponível:', e);
    }
  };

  // Decide quem falou o trecho com base no timbre/frequência vocal medido + dinâmica de diálogo
  const resolveSpeakerByAcousticsAndTurn = (trimmedText: string, timeSinceLastFinal: number): SpeakerRole => {
    if (!autoDiarizationRef.current) {
      return currentSpeakerRef.current;
    }

    const samples = utterancePitchSamplesRef.current;
    utterancePitchSamplesRef.current = []; // Reseta para a próxima frase

    // Mediana da frequência fundamental (Hz) da fala que acabou de acontecer
    let phraseHz: number | null = null;
    if (samples.length >= 3) {
      const sorted = [...samples].sort((a, b) => a - b);
      phraseHz = sorted[Math.floor(sorted.length / 2)];
    }

    const profiles = voiceProfilesRef.current;
    let assigned: SpeakerRole = currentSpeakerRef.current;

    if (phraseHz !== null) {
      // 1. Primeira fala da reunião: calibra a voz do primeiro orador (geralmente o Gestor)
      if (profiles.managerHz === null && assigned === 'manager') {
        profiles.managerHz = phraseHz;
        setVoiceProfiles({ ...profiles });
      } else if (profiles.employeeHz === null && assigned === 'employee') {
        profiles.employeeHz = phraseHz;
        setVoiceProfiles({ ...profiles });
      } else if (profiles.managerHz !== null && profiles.employeeHz === null) {
        // Temos a voz do Gestor calibrada. Verifica se a nova voz tem diferença acústica (>= 16% ou >= 22 Hz)
        const diffHz = Math.abs(phraseHz - profiles.managerHz);
        const relDiff = diffHz / profiles.managerHz;
        if (diffHz >= 22 || relDiff >= 0.16 || timeSinceLastFinal > 1600) {
          // Nova voz detectada! Calibra como Colaborador
          assigned = 'employee';
          profiles.employeeHz = phraseHz;
          setVoiceProfiles({ ...profiles });
        } else {
          // Atualiza média móvel do Gestor
          profiles.managerHz = Math.round(profiles.managerHz * 0.75 + phraseHz * 0.25);
          setVoiceProfiles({ ...profiles });
        }
      } else if (profiles.managerHz !== null && profiles.employeeHz !== null) {
        // Ambos os timbres já estão mapeados: compara de qual perfil vocal esta frase está mais próxima
        const distManager = Math.abs(phraseHz - profiles.managerHz);
        const distEmployee = Math.abs(phraseHz - profiles.employeeHz);

        if (distManager + 6 < distEmployee) {
          assigned = 'manager';
          profiles.managerHz = Math.round(profiles.managerHz * 0.8 + phraseHz * 0.2);
        } else if (distEmployee + 6 < distManager) {
          assigned = 'employee';
          profiles.employeeHz = Math.round(profiles.employeeHz * 0.8 + phraseHz * 0.2);
        } else if (timeSinceLastFinal > 1500) {
          // Timbres muito próximos nesta frase: usa a pausa de turno de fala (> 1.5s)
          assigned = currentSpeakerRef.current === 'manager' ? 'employee' : 'manager';
        }
        setVoiceProfiles({ ...profiles });
      }
    } else {
      // Fallback caso a frase tenha sido muito curta para medir Hz: usa pausa de diálogo (> 1.6s)
      if (timeSinceLastFinal > 1600) {
        assigned = currentSpeakerRef.current === 'manager' ? 'employee' : 'manager';
      }
    }

    currentSpeakerRef.current = assigned;
    setCurrentSpeaker(assigned);
    return assigned;
  };

  const startRecording = async () => {
    setPermissionErrorMsg(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      // 1. Solicita explicitamente a permissão do microfone via getUserMedia (destrava o popup do navegador)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      // 2. Inicia o motor de reconhecimento de fala contínuo
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

              const assignedSpeaker = resolveSpeakerByAcousticsAndTurn(trimmed, timeSinceLastFinal);

              const newBlock: TranscriptBlock = {
                id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                speaker: assignedSpeaker,
                speakerName: assignedSpeaker === 'manager' ? `${managerName} (Gestor)` : employeeName,
                timestamp: formatTimer(secondsRef.current),
                text: trimmed
              };
              onAddTranscript(newBlock);

              // Se foi uma pergunta, já prepara o turno para a outra pessoa responder
              const isQuestion = trimmed.endsWith('?') ||
                /^(como|qual|quando|onde|por que|porque|você|voce|me conta|o que|conte-me)/i.test(trimmed);
              if (autoDiarizationRef.current && isQuestion) {
                const nextSpeaker: SpeakerRole = assignedSpeaker === 'manager' ? 'employee' : 'manager';
                currentSpeakerRef.current = nextSpeaker;
                setCurrentSpeaker(nextSpeaker);
              }
            }
          } else {
            interim += transcriptPart;
          }
        }
        setInterimText(interim);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return; // Silêncio temporário normal, o onend reiniciará
        }
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionErrorMsg(
            'O navegador bloqueou o acesso ao microfone. Clique no ícone de cadeado/configurações ao lado da URL do navegador, permita o "Microfone" e clique em Iniciar Gravação novamente.'
          );
          stopRecording();
        }
      };

      recognition.onend = () => {
        // Usa isRecordingRef.current para nunca perder a referência na closure!
        if (isRecordingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Ignora se já estiver iniciando
          }
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      setIsRecording(true);
      lastFinalTimestampRef.current = Date.now();

      // 3. Inicia análise acústica de timbre/frequência em paralelo
      startAcousticAnalysis(stream);
    } catch (err: any) {
      console.error('Falha ao acessar microfone:', err);
      setPermissionErrorMsg(
        'Não foi possível acessar o microfone. Verifique se o microfone está conectado e se a permissão está liberada no ícone ao lado da barra de endereço do navegador.'
      );
      stopRecording();
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterimText('');
    setAudioLevel(0);
    setCurrentPitchHz(null);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
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
    if (interimText.trim()) {
      onAddTranscript({
        id: `tr-${Date.now()}`,
        speaker: currentSpeaker,
        speakerName: currentSpeaker === 'manager' ? `${managerName} (Gestor)` : employeeName,
        timestamp: formatTimer(secondsRef.current),
        text: interimText.trim()
      });
      setInterimText('');
    }
    currentSpeakerRef.current = speaker;
    setCurrentSpeaker(speaker);
  };

  const handleSwapBlockSpeaker = (item: TranscriptBlock) => {
    if (!onUpdateTranscript) return;
    const newSpeaker: SpeakerRole = item.speaker === 'manager' ? 'employee' : 'manager';
    const newSpeakerName = newSpeaker === 'manager' ? `${managerName} (Gestor)` : employeeName;
    onUpdateTranscript(item.id, { speaker: newSpeaker, speakerName: newSpeakerName });
  };

  const handleSaveEdit = (id: string) => {
    if (!onUpdateTranscript || !editingText.trim()) return;
    onUpdateTranscript(id, { text: editingText.trim() });
    setEditingId(null);
    setEditingText('');
  };

  const handleAddManualTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) return;
    onAddTranscript({
      id: `tr-man-${Date.now()}`,
      speaker: currentSpeaker,
      speakerName: currentSpeaker === 'manager' ? `${managerName} (Gestor)` : employeeName,
      timestamp: formatTimer(secondsRef.current),
      text: manualText.trim()
    });
    setManualText('');
  };

  const resetVoiceCalibration = () => {
    voiceProfilesRef.current = { managerHz: null, employeeHz: null };
    setVoiceProfiles({ managerHz: null, employeeHz: null });
  };

  return (
    <div className="aptis-glass-dark rounded-3xl p-4 sm:p-5 space-y-4 flex flex-col h-full relative overflow-hidden text-white">
      {/* Orbes Acústicos Internos */}
      <div
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: isRecording
            ? 'radial-gradient(circle, #f43f5e 0%, transparent 70%)'
            : 'radial-gradient(circle, #38bdf8 0%, transparent 70%)'
        }}
      />

      {/* Topo do Gravador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all shrink-0 ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-400/50 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse'
                : 'aptis-glass-subcard text-cyan-400'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-black text-white">Gravador & Diarização Acústica ao Vivo</h4>
              {isRecording && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/25 text-rose-300 border border-rose-400/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  Capturando Voz
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300">
              Identifica automaticamente mudanças de timbre vocal (Hz) e pausas de diálogo.
            </p>
          </div>
        </div>

        {/* Cronômetro & Botão Gravar */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono font-bold text-slate-200 aptis-glass-subcard px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {formatTimer(seconds)}
          </span>

          <button
            type="button"
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.45)]'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.35)]'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Iniciar Gravação
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alertas de Suporte ou Permissão */}
      {!isSupported && (
        <div className="p-3 bg-amber-950/50 border border-amber-700/60 rounded-2xl text-xs text-amber-200 flex items-start gap-2 relative z-10">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Para transcrição automática por voz, utilize o <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>. Você também pode registrar falas manualmente no campo abaixo.
          </span>
        </div>
      )}

      {permissionErrorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-700 rounded-2xl text-xs text-rose-200 flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{permissionErrorMsg}</span>
          </div>
          <button
            type="button"
            onClick={startRecording}
            className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-[11px] cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* PAINEL DE DIARIZAÇÃO ACÚSTICA & TIMBRE VOCAL (Estilo Halvo Vídeo 4) */}
      <div className="aptis-glass-subcard p-3.5 rounded-2xl space-y-3 relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-white">Detector Dinâmico de Vozes (Timbre + Turno)</span>
            <button
              type="button"
              onClick={() => setAutoDiarization(!autoDiarization)}
              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold transition-all border cursor-pointer ${
                autoDiarization
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                  : 'bg-white/[0.06] text-slate-400 border-white/[0.12]'
              }`}
            >
              {autoDiarization ? 'Automático Ativo' : 'Modo Manual'}
            </button>
          </div>

          {/* Medidor Acústico ao Vivo com Brilho Neon */}
          <div className="flex items-center gap-3 text-[11px]">
            {isRecording && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <div className="w-24 h-2.5 bg-slate-950/80 border border-white/[0.08] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-75"
                    style={{
                      width: `${audioLevel}%`,
                      boxShadow: '0 0 10px rgba(34, 211, 238, 0.7)'
                    }}
                  />
                </div>
                {currentPitchHz && (
                  <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30">
                    {currentPitchHz} Hz
                  </span>
                )}
              </div>
            )}

            {(voiceProfiles.managerHz || voiceProfiles.employeeHz) && (
              <button
                type="button"
                onClick={resetVoiceCalibration}
                className="text-[10px] text-slate-400 hover:text-cyan-300 underline cursor-pointer"
                title="Recalibrar timbres de voz"
              >
                Recalibrar Vozes
              </button>
            )}
          </div>
        </div>

        {/* Seletores de Orador (Cenas Iluminadas Estilo Halvo Vídeo 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleSpeakerChange('manager')}
            className={`p-3 rounded-2xl text-left border transition-all duration-300 flex items-center justify-between cursor-pointer ${
              currentSpeaker === 'manager'
                ? 'bg-blue-500/20 border-blue-400/60 text-white shadow-[0_0_20px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentSpeaker === 'manager'
                    ? 'bg-blue-500 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold block truncate">👔 {managerName}</span>
                <span className="text-[10px] text-blue-300/90 block">
                  {voiceProfiles.managerHz ? `Timbre base: ~${voiceProfiles.managerHz} Hz` : 'Gestor (1ª voz a falar)'}
                </span>
              </div>
            </div>
            {currentSpeaker === 'manager' && (
              <span className="text-[10px] font-bold bg-blue-500 text-white px-2.5 py-0.5 rounded-full shrink-0">
                Com a palavra
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSpeakerChange('employee')}
            className={`p-3 rounded-2xl text-left border transition-all duration-300 flex items-center justify-between cursor-pointer ${
              currentSpeaker === 'employee'
                ? 'bg-emerald-500/20 border-emerald-400/60 text-white shadow-[0_0_20px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]'
                : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  currentSpeaker === 'employee'
                    ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                    : 'bg-white/[0.06] text-slate-400'
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold block truncate">👤 {employeeName}</span>
                <span className="text-[10px] text-emerald-300/90 block">
                  {voiceProfiles.employeeHz ? `Timbre base: ~${voiceProfiles.employeeHz} Hz` : 'Liderado (2ª voz a falar)'}
                </span>
              </div>
            </div>
            {currentSpeaker === 'employee' && (
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full shrink-0">
                Com a palavra
              </span>
            )}
          </button>
        </div>
      </div>

      {/* LISTA DE FALAS TRANSCRITAS COM EDIÇÃO, TROCA DE ORADOR E EXCLUSÃO */}
      <div className="flex-1 flex flex-col min-h-[220px] space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-300">
            Diálogo Transcrito ({transcripts.length})
          </span>
          <span className="text-[10px] text-slate-400">
            Dica: clique em ⇄ em qualquer balão para inverter quem falou
          </span>
        </div>

        <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-3.5 border border-white/[0.08] flex-1 max-h-[320px] overflow-y-auto space-y-2.5 text-xs">
          {transcripts.length === 0 && !interimText && (
            <div className="text-slate-400 text-center py-8 space-y-1">
              <p className="font-bold text-slate-300">Nenhuma fala registrada ainda.</p>
              <p className="text-[11px]">
                Clique em <strong>"Iniciar Gravação"</strong> para transcrever ao vivo ou adicione uma fala manualmente abaixo.
              </p>
            </div>
          )}

          {transcripts.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-all group ${
                item.speaker === 'manager'
                  ? 'bg-blue-500/15 border-blue-400/30 text-blue-100 mr-4'
                  : 'bg-emerald-500/15 border-emerald-400/30 text-emerald-100 ml-4'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-[11px] flex items-center gap-1 ${
                      item.speaker === 'manager' ? 'text-blue-300' : 'text-emerald-300'
                    }`}
                  >
                    {item.speaker === 'manager' ? '👔' : '👤'} {item.speakerName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{item.timestamp}</span>
                </div>

                {/* Ações rápidas no balão de fala */}
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {onUpdateTranscript && (
                    <button
                      type="button"
                      onClick={() => handleSwapBlockSpeaker(item)}
                      className="px-2 py-0.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white text-[10px] flex items-center gap-1 cursor-pointer border border-white/[0.1]"
                      title="Inverter quem falou (Gestor ↔ Colaborador)"
                    >
                      <ArrowLeftRight className="w-3 h-3" />
                      <span>Trocar Voz</span>
                    </button>
                  )}

                  {onCreateActionFromTranscript && (
                    <button
                      type="button"
                      onClick={() => onCreateActionFromTranscript(item.text, item.speaker)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-400/30 text-[10px] flex items-center gap-1 cursor-pointer"
                      title="Transformar esta fala em um Compromisso / Ação"
                    >
                      <ListTodo className="w-3 h-3" />
                      <span>+ Ação</span>
                    </button>
                  )}

                  {onUpdateTranscript && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingText(item.text);
                      }}
                      className="p-1 rounded-lg hover:bg-white/[0.1] text-slate-400 hover:text-cyan-300 cursor-pointer"
                      title="Editar texto da fala"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}

                  {onDeleteTranscript && (
                    <button
                      type="button"
                      onClick={() => onDeleteTranscript(item.id)}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Excluir esta fala"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {editingId === item.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 aptis-glass-input rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1.5 bg-white/[0.1] hover:bg-white/[0.18] text-slate-300 rounded-xl cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <p className="text-slate-100 leading-relaxed text-xs">{item.text}</p>
              )}
            </div>
          ))}

          {/* Texto sendo falado no instante (Interim) */}
          {interimText && (
            <div
              className={`p-3 rounded-2xl border border-dashed animate-pulse ${
                currentSpeaker === 'manager'
                  ? 'bg-blue-500/15 border-blue-400/50 text-blue-200 mr-4'
                  : 'bg-emerald-500/15 border-emerald-400/50 text-emerald-200 ml-4'
              }`}
            >
              <span className="text-[10px] text-slate-300 block mb-0.5">
                Ouvindo agora ({currentSpeaker === 'manager' ? managerName : employeeName}):
              </span>
              <p className="text-white italic">{interimText}</p>
            </div>
          )}
        </div>

        {/* Input rápido para registrar fala/trecho manualmente se desejar */}
        <form onSubmit={handleAddManualTranscript} className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder={`Digitar fala ou observação de ${currentSpeaker === 'manager' ? managerName : employeeName}...`}
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="flex-1 aptis-glass-input rounded-xl px-3.5 py-2 text-xs focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 aptis-glass-subcard hover:bg-white/[0.12] text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shrink-0 border border-white/[0.15]"
          >
            <Plus className="w-3.5 h-3.5" /> Registrar Fala
          </button>
        </form>
      </div>
    </div>
  );
}
