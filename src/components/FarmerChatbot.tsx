import React, { useState, useEffect, useRef } from 'react';
import { 
  ChatMessage, 
  CropAnalysisContext, 
  Language 
} from '../types';
import { apiService } from '../services/api';
import { teluguTTS } from '../services/tts';
import { voiceRecognition } from '../utils/speech';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

interface FarmerChatbotProps {
  context: CropAnalysisContext;
  language: Language;
}

export const FarmerChatbot: React.FC<FarmerChatbotProps> = ({
  context,
  language
}) => {
  const { settings } = useAccessibility();
  const isTelugu = language === 'te';

  // Initial greeting tailored to the active crop & disease
  const initialGreeting: ChatMessage = {
    id: 'msg-welcome',
    sender: 'assistant',
    text: isTelugu
      ? `నమస్కారం రైతు సోదరులారా! మీ ${context.crop === 'cotton' ? 'పత్తి' : context.crop === 'paddy' ? 'వరి' : context.crop === 'chilli' ? 'మిర్చి' : 'మొక్కజొన్న'} పంటలో ${context.diseaseNameTe} (${context.aiConfidence}% ఖచ్చితత్వం) గురించి మీకేమైనా సందేహాలు ఉంటే ఇక్కడ అడగండి. కింద మైక్ నొక్కి తెలుగులో మాట్లాడవచ్చు లేదా ప్రశ్నలను ఎంచుకోవచ్చు.`
      : `Namaskaram farmer! Do you have any questions about the ${context.diseaseNameEn} detected in your ${context.crop} crop (${context.aiConfidence}% confidence)? You can speak in Telugu/English or tap the questions below.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'transcribing' | 'thinking'>('idle');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick preset questions for 1-tap interaction
  const quickQuestions = isTelugu
    ? [
        'వర్షం పడితే ఏమి చేయాలి?',
        'ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?',
        'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?',
        'నీటి తడి ఎంత ఇవ్వాలి?',
        'రసాయన మందులు కొట్టవచ్చా?'
      ]
    : [
        'What to do if it rains?',
        'Will this spread to other plants?',
        'When should I scan again?',
        'How much irrigation to give?',
        'Can I spray chemicals now?'
      ];

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceStatus]);

  // Handle playing voice for a message
  const handlePlayAudio = (messageId: string, text: string) => {
    if (activePlayingId === messageId) {
      if (isAudioPaused) {
        teluguTTS.resume();
        setIsAudioPaused(false);
      } else {
        teluguTTS.pause();
        setIsAudioPaused(true);
      }
      return;
    }

    // Start playing new message
    teluguTTS.stop();
    setActivePlayingId(messageId);
    setIsAudioPaused(false);

    teluguTTS.speakText(text, {
      lang: settings.language,
      onStart: () => {
        setActivePlayingId(messageId);
        setIsAudioPaused(false);
      },
      onEnd: () => {
        setActivePlayingId(null);
        setIsAudioPaused(false);
      },
      onError: () => {
        setActivePlayingId(null);
        setIsAudioPaused(false);
      }
    });
  };

  const handleStopAudio = () => {
    teluguTTS.stop();
    setActivePlayingId(null);
    setIsAudioPaused(false);
  };

  // Submit a question to the context-aware chatbot
  const handleSendMessage = async (queryText: string) => {
    const textToSend = queryText.trim();
    if (!textToSend || isSubmitting) return;

    // Stop ongoing audio
    teluguTTS.stop();
    setActivePlayingId(null);

    const userMsg: ChatMessage = {
      id: `msg-farmer-${Date.now()}`,
      sender: 'farmer',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsSubmitting(true);
    setVoiceStatus('thinking');

    try {
      const response = await apiService.sendChatMessage({
        message: textToSend,
        context: context,
        history: messages.map(m => ({ sender: m.sender, text: m.text }))
      });

      const replyText = isTelugu ? response.replyTe : response.replyEn;
      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setVoiceStatus('idle');

      // If voice is enabled, proactively speak the response!
      if (settings.voiceEnabled) {
        handlePlayAudio(assistantMsg.id, replyText);
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: isTelugu
          ? 'క్షమించండి, సమాధానం పొందడంలో సమస్య ఎదురైంది. దయచేసి మరోసారి ప్రయత్నించండి.'
          : 'Sorry, could not fetch an answer right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setVoiceStatus('idle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Voice STT Input (Telugu Speech Recognition)
  const handleToggleVoiceInput = () => {
    if (isListening) {
      voiceRecognition.stop();
      setIsListening(false);
      setVoiceStatus('idle');
      return;
    }

    const started = voiceRecognition.start({
      lang: settings.language === 'te' ? 'te-IN' : 'en-IN',
      onResult: (transcript: string) => {
        setIsListening(false);
        setVoiceStatus('transcribing');
        if (transcript.trim()) {
          setInputText(transcript);
          // Automatically send the spoken question
          handleSendMessage(transcript);
        } else {
          setVoiceStatus('idle');
        }
      },
      onError: (err) => {
        console.warn('Voice input error:', err);
        setIsListening(false);
        setVoiceStatus('idle');
      },
      onEnd: () => {
        setIsListening(false);
        if (voiceStatus === 'listening') {
          setVoiceStatus('idle');
        }
      }
    });

    if (started) {
      setIsListening(true);
      setVoiceStatus('listening');
    } else {
      // If microphone not available in browser, alert softly
      setVoiceStatus('idle');
    }
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-krishi-200 shadow-card overflow-hidden transition-all">
      
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-krishi-800 to-krishi-700 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-krishi-200 shadow-inner">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg tracking-tight">
                {isTelugu ? '🌱 కృషి-నేత్ర AI సహాయకుడు' : '🌱 KRISHI-NETRA Assistant'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-krishi-600 border border-krishi-500 text-[10px] font-bold text-krishi-100 uppercase tracking-wider">
                {isTelugu ? 'లైవ్ సలహా' : 'Live Advisory'}
              </span>
            </div>
            <p className="text-xs text-krishi-100 font-medium">
              {isTelugu ? 'మీ పంట విశ్లేషణపై సందేహాలు అడగండి' : 'Ask questions about your crop diagnosis'}
            </p>
          </div>
        </div>

        {/* Active Context Pill */}
        <div className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-right text-xs">
          <p className="text-[10px] uppercase font-bold text-krishi-200">
            {isTelugu ? 'ప్రస్తుత పంట' : 'Active Context'}
          </p>
          <p className="font-black text-white">
            {context.crop === 'cotton' ? 'పత్తి' : context.crop === 'paddy' ? 'వరి' : context.crop === 'chilli' ? 'మిర్చి' : 'మొక్కజొన్న'} • {context.diseaseNameTe}
          </p>
        </div>
      </div>

      {/* Conversation Message List */}
      <div className="p-4 sm:p-5 space-y-4 max-h-96 overflow-y-auto bg-earth-50/50">
        {messages.map((msg) => {
          const isAssistant = msg.sender === 'assistant';
          const isPlayingThis = activePlayingId === msg.id;

          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-krishi-100 border border-krishi-300 flex items-center justify-center text-krishi-800 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div 
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-sm space-y-2 ${
                  isAssistant 
                    ? 'bg-white border border-earth-200 text-charcoal-900 rounded-tl-sm' 
                    : 'bg-krishi-800 text-white rounded-tr-sm'
                }`}
              >
                <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>

                <div className={`flex items-center justify-between gap-3 text-[10px] pt-1 ${
                  isAssistant ? 'text-charcoal-400 border-t border-earth-100' : 'text-krishi-200 border-t border-krishi-700/60'
                }`}>
                  <span>{msg.timestamp}</span>

                  {/* Audio Playback Controls for Assistant */}
                  {isAssistant && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePlayAudio(msg.id, msg.text)}
                        className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold transition-colors cursor-pointer ${
                          isPlayingThis
                            ? 'bg-krishi-800 text-white'
                            : 'bg-earth-100 hover:bg-earth-200 text-charcoal-700'
                        }`}
                        title={isPlayingThis ? (isAudioPaused ? 'Resume' : 'Pause') : 'Listen Voice'}
                      >
                        {isPlayingThis && !isAudioPaused ? (
                          <>
                            <Pause className="w-3 h-3 text-white" />
                            <span>{isTelugu ? 'ఆపండి' : 'Pause'}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-krishi-700" />
                            <span>{isTelugu ? 'వినండి' : 'Listen'}</span>
                          </>
                        )}
                      </button>

                      {isPlayingThis && (
                        <button
                          onClick={() => {
                            teluguTTS.replay();
                            setIsAudioPaused(false);
                          }}
                          className="p-1 rounded-lg bg-earth-100 hover:bg-earth-200 text-charcoal-700 cursor-pointer"
                          title="Replay"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-krishi-800 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Voice Status Indicator */}
        {voiceStatus !== 'idle' && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold animate-pulse">
            {voiceStatus === 'listening' && (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                <span>{isTelugu ? '👂 వింటున్నాం... మాట్లాడండి' : 'Listening... Please speak now'}</span>
              </>
            )}
            {voiceStatus === 'transcribing' && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                <span>{isTelugu ? '✍️ మాటలను గుర్తిస్తున్నాం...' : 'Transcribing spoken words...'}</span>
              </>
            )}
            {voiceStatus === 'thinking' && (
              <>
                <Sparkles className="w-3.5 h-3.5 text-krishi-700 animate-spin" />
                <span>{isTelugu ? '🤖 AI సమాధానం సిద్ధం చేస్తోంది...' : 'AI thinking of guidance...'}</span>
              </>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Question Chips */}
      <div className="px-4 py-2.5 bg-earth-100/70 border-t border-earth-200">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-charcoal-600 mb-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-krishi-700" />
          <span>{isTelugu ? 'తరచుగా అడిగే ప్రశ్నలు (1-క్లిక్):' : 'Suggested farmer questions:'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              disabled={isSubmitting}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-xl bg-white border border-earth-300 hover:border-krishi-600 hover:bg-krishi-50 text-charcoal-800 text-xs font-semibold transition-all shadow-2xs active:scale-95 disabled:opacity-50 cursor-pointer text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar (Voice STT + Text Input + Send Button) */}
      <div className="p-3 sm:p-4 bg-white border-t border-earth-200 flex items-center gap-2">
        {/* Voice Input Microphone Button */}
        <button
          onClick={handleToggleVoiceInput}
          disabled={isSubmitting}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
            isListening 
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105 animate-pulse' 
              : 'bg-krishi-800 hover:bg-krishi-900 text-white shadow-soft active:scale-95'
          }`}
          title={isListening ? 'Stop listening' : 'Speak in Telugu'}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 animate-bounce" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>

        {/* Text Input Field */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputText);
              }
            }}
            placeholder={
              isTelugu 
                ? 'మీ సందేహాన్ని ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి...' 
                : 'Type your question or tap mic to speak...'
            }
            className="w-full bg-earth-50 border border-earth-300 focus:border-krishi-700 focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 outline-none transition-all shadow-inner"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isSubmitting}
          className="w-12 h-12 rounded-2xl bg-krishi-800 hover:bg-krishi-900 disabled:bg-earth-200 disabled:text-charcoal-400 text-white flex items-center justify-center flex-shrink-0 shadow-soft transition-all active:scale-95 cursor-pointer"
          title="Send"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Safety & Agronomic Boundary Footer */}
      <div className="px-4 py-2 bg-earth-50 border-t border-earth-200 text-[11px] text-charcoal-500 font-medium flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
        <span>
          {isTelugu 
            ? 'KRISHI-NETRA సలహాలు అధికారిక వ్యవసాయ నిబంధనల ఆధారంగా ఇవ్వబడ్డాయి. అధిక మోతాదు మందుల వాడకం నివారించండి.' 
            : 'Advisories are grounded in verified agronomic protocols. Avoid excessive chemical mixtures.'}
        </span>
      </div>

    </div>
  );
};
