import React, { useState } from 'react';
import { Sliders, X, Sparkles, Image, Check, RefreshCw, KeyRound, Heart } from 'lucide-react';
import { AppStage, SiteConfig } from '../../types';
import { sounds } from '../../utils/sound';

interface DevCustomizerProps {
  currentStage: AppStage;
  setStage: (stage: AppStage) => void;
  config: SiteConfig;
  updateConfig: (newConfig: Partial<SiteConfig>) => void;
  resetDefault: () => void;
  onOpenAdmin?: () => void;
  isAuthenticated?: boolean;
}

export const DevCustomizer: React.FC<DevCustomizerProps> = ({
  currentStage,
  setStage,
  resetDefault,
  onOpenAdmin,
  isAuthenticated = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stages'>('stages');

  const handleStageSelect = (s: AppStage) => {
    sounds.playWhoosh();
    if (s === 'admin' && onOpenAdmin) {
      onOpenAdmin();
    } else {
      setStage(s);
    }
    setIsOpen(false);
  };


  return (
    <>
      {/* Floating Gear Trigger Button - Only show after authentication */}
      {isAuthenticated && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              sounds.playPop();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-midnight/90 border border-hotpink/40 hover:border-hotpink text-xs text-blushpink shadow-glass backdrop-blur-md transition-all hover:scale-105 group"
            title="Customizer & Stage Navigation"
          >
            <Sliders className="w-3.5 h-3.5 text-hotpink group-hover:rotate-45 transition-transform" />
            <span className="font-medium">Customize / Jump</span>
          </button>
        </div>
      )}

      {/* Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-midnight border border-hotpink/30 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-hotpink" />
                <h3 className="text-lg font-bold text-white">Our Bound Customizer</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 my-4 border-b border-white/10 pb-2">
              <button
                onClick={() => setActiveTab('stages')}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  activeTab === 'stages' ? 'bg-hotpink text-white' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                Jump to Stage
              </button>
            </div>

            {/* Stage Selector */}
            {activeTab === 'stages' && (
              <div className="space-y-4">
                <p className="text-xs text-white/70">
                  Quickly jump across any screen to inspect interactions, animations, and responsive layouts:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: 'login', name: '1. Login Screen', icon: KeyRound },
                      { id: 'questions', name: '2. Thanglish Questions', icon: Heart },
                      { id: 'transition', name: '3. Heart Transition', icon: Sparkles },
                      { id: 'memories', name: '4. Scrapbook Memories', icon: Image },
                      { id: 'letter', name: '5. Secret Letter', icon: Sparkles },
                      { id: 'celebration', name: '6. Birthday Finale', icon: Sparkles },
                      { id: 'jumpGame', name: '7. Jump Adventure Game', icon: Sparkles },
                      { id: 'gallery', name: '8. Photo Album', icon: Image },
                      { id: 'admin', name: '⚙ Manage Memories (Admin)', icon: Sparkles },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleStageSelect(item.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        currentStage === item.id
                          ? 'bg-hotpink/20 border-hotpink text-white shadow-neon-pink'
                          : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-hotpink/40'
                      }`}
                    >
                      <span>{item.name}</span>
                      {currentStage === item.id && <Check className="w-3.5 h-3.5 text-hotpink" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset / Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={resetDefault}
                className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
