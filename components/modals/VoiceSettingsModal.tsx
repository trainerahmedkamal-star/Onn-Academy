
import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { speechService, EnglishAccent } from '../../services/ttsService';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(0.9);
  const [pitch, setPitch] = useState<number>(1);
  const [accent, setAccent] = useState<EnglishAccent>('US');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Load voices when modal opens
        const currentVoices = speechService.getEnglishVoices();
        setVoices(currentVoices);
        
        // Load settings
        const preferred = speechService.getPreferredVoiceName();
        if (preferred && currentVoices.some(v => v.name === preferred)) {
            setSelectedVoice(preferred);
        } else if (currentVoices.length > 0) {
             // Default selection logic handled in service, but for UI we pick first match
             const bestDefault = currentVoices.find(v => v.lang.includes(accent === 'US' ? 'US' : 'GB')) || currentVoices[0];
             if (bestDefault) setSelectedVoice(bestDefault.name);
        }

        setRate(speechService.getRate());
        setPitch(speechService.getPitch());
        setAccent(speechService.getAccent());

        // Subscribe to updates (in case voices load late)
        speechService.subscribeToVoices((allVoices) => {
            const enVoices = allVoices.filter(v => v.lang.startsWith('en'));
            setVoices(enVoices);
        });
    }
  }, [isOpen]);

  const handleSave = () => {
    speechService.setAccent(accent); // Save accent first to affect voice selection logic if 'Default' logic is used
    if (selectedVoice) {
      speechService.setPreferredVoice(selectedVoice);
    }
    speechService.setRate(rate);
    speechService.setPitch(pitch);
    onClose();
  };

  const handleTest = () => {
    // Update service temporarily for the test
    speechService.setAccent(accent);
    speechService.setPreferredVoice(selectedVoice);
    speechService.setRate(rate);
    speechService.setPitch(pitch);
    
    setIsPlaying(true);
    const text = accent === 'US' ? "Hello! This is American English." : "Hello! This is British English.";
    speechService.speak(
        text, 
        () => {}, 
        () => {
            setIsPlaying(false);
        }
    );
  };

  const handleReset = () => {
      setRate(0.9);
      setPitch(1);
      setAccent('US');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:mr-4 sm:text-right w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  إعدادات الصوت
                </h3>
                <div className="mt-4 space-y-6">
                  <p className="text-sm text-gray-500">
                    قم بتخصيص تجربة الاستماع حسب مستواك واللهجة المفضلة.
                  </p>
                  
                  {voices.length === 0 ? (
                      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                          جاري تحميل الأصوات...
                      </div>
                  ) : (
                      <div className="space-y-5">
                          
                          {/* Accent Selection */}
                          <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">اللهجة (Accent):</label>
                             <div className="flex rounded-md shadow-sm" role="group">
                                <button
                                    type="button"
                                    onClick={() => setAccent('US')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-2 focus:ring-sky-500 ${
                                        accent === 'US' 
                                        ? 'bg-sky-500 text-white border-sky-500' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    🇺🇸 أمريكي
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAccent('UK')}
                                    className={`flex-1 px-4 py-2 text-sm font-medium border border-l-0 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-sky-500 ${
                                        accent === 'UK' 
                                        ? 'bg-sky-500 text-white border-sky-500' 
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    🇬🇧 بريطاني
                                </button>
                             </div>
                          </div>

                          {/* Speed Slider */}
                          <div>
                              <div className="flex justify-between items-center mb-1">
                                  <label className="block text-sm font-medium text-gray-700">سرعة القراءة</label>
                                  <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded">{rate}x</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.5" 
                                max="2" 
                                step="0.1" 
                                value={rate} 
                                onChange={(e) => setRate(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                              />
                              <div className="flex justify-between text-xs text-gray-400 mt-1">
                                  <span>بطيء</span>
                                  <span>عادي</span>
                                  <span>سريع</span>
                              </div>
                          </div>

                          {/* Pitch Slider */}
                          <div>
                              <div className="flex justify-between items-center mb-1">
                                  <label className="block text-sm font-medium text-gray-700">حدة الصوت</label>
                                  <span className="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded">{pitch}</span>
                              </div>
                              <input 
                                type="range" 
                                min="0.5" 
                                max="1.5" 
                                step="0.1" 
                                value={pitch} 
                                onChange={(e) => setPitch(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                              />
                          </div>

                           {/* Voice Selection (Detailed) */}
                           <div className="pt-2 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-1">صوت القارئ (متقدم):</label>
                            <select 
                                value={selectedVoice} 
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-xs"
                                lang="en"
                            >
                                {voices
                                  .sort((a, b) => (a.lang === (accent === 'US' ? 'en-US' : 'en-GB') ? -1 : 1))
                                  .map(voice => (
                                    <option key={voice.name} value={voice.name}>
                                        {voice.name} ({voice.lang})
                                    </option>
                                ))}
                            </select>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2">
                              <button 
                                type="button"
                                onClick={handleReset}
                                className="text-xs text-gray-500 underline hover:text-gray-700"
                              >
                                  استعادة الافتراضي
                              </button>

                              <button 
                                type="button" 
                                onClick={handleTest}
                                disabled={isPlaying}
                                className="inline-flex items-center px-4 py-2 border border-sky-300 text-sm font-medium rounded-full text-sky-700 bg-sky-50 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                              >
                                {isPlaying ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"></span>
                                        جاري التحدث...
                                    </span>
                                ) : (
                                    <>🔊 تجربة</>
                                )}
                              </button>
                          </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <Button onClick={handleSave} className="w-full sm:w-auto">
              حفظ
            </Button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-full border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsModal;
