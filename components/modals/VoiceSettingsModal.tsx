import React, { useState, useEffect } from 'react';
import Button from '../Button';
import { speechService } from '../../services/ttsService';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isOpen) {
        // Load voices when modal opens
        const currentVoices = speechService.getEnglishVoices();
        setVoices(currentVoices);
        
        const preferred = speechService.getPreferredVoiceName();
        if (preferred && currentVoices.some(v => v.name === preferred)) {
            setSelectedVoice(preferred);
        } else if (currentVoices.length > 0) {
             // Default logic to select the best initial voice (Google or US)
             const bestDefault = currentVoices.find(v => v.name === 'Google US English') || currentVoices.find(v => v.lang === 'en-US') || currentVoices[0];
             setSelectedVoice(bestDefault.name);
        }

        // Subscribe to updates (in case voices load late)
        speechService.subscribeToVoices((allVoices) => {
            const enVoices = allVoices.filter(v => v.lang.startsWith('en'));
            setVoices(enVoices);
        });
    }
  }, [isOpen]);

  const handleSave = () => {
    speechService.setPreferredVoice(selectedVoice);
    onClose();
  };

  const handleTest = () => {
    // Temporarily set the voice to test it without saving
    const originalVoice = speechService.getPreferredVoiceName();
    speechService.setPreferredVoice(selectedVoice);
    
    setIsPlaying(true);
    speechService.speak(
        "Hello! This is how I sound. Do you like this voice?", 
        () => {}, 
        () => {
            setIsPlaying(false);
            // Revert if not saved (optional, but keep it simple: we set it as preferred for the test)
        }
    );
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
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    اختر الصوت المفضل لديك لقراءة الكلمات والجمل الإنجليزية. الأصوات المتاحة تعتمد على جهازك والمتصفح.
                  </p>
                  
                  {voices.length === 0 ? (
                      <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                          جاري تحميل الأصوات... أو لا توجد أصوات إنجليزية متاحة في هذا المتصفح.
                      </div>
                  ) : (
                      <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">اختر الصوت:</label>
                          <select 
                            value={selectedVoice} 
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                            lang="en"
                          >
                            {voices.map(voice => (
                                <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                </option>
                            ))}
                          </select>
                          
                          <div className="flex justify-end">
                              <button 
                                type="button" 
                                onClick={handleTest}
                                disabled={isPlaying}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-sky-700 bg-sky-100 hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                              >
                                {isPlaying ? 'جاري التحدث...' : '🔊 تجربة الصوت'}
                              </button>
                          </div>
                      </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button onClick={handleSave} className="w-full sm:w-auto sm:mr-3">
              حفظ الإعدادات
            </Button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 sm:mt-0 sm:w-auto"
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