import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, X, ChevronLeft, ChevronRight,
  Calendar, MapPin, Camera, Mail, ZoomIn, Loader2, AlertCircle, RefreshCw, Upload,
} from 'lucide-react';
import { SiteConfig, Memory, CloudMemory } from '../../types';
import { sounds } from '../../utils/sound';
import { memoriesService } from '../../services/memories';
import { isApiConfigured } from '../../lib/api';

interface MemoriesGalleryProps {
  config: SiteConfig;
  onProceedToLetter: () => void;
  onUpdateMemories?: (newMemories: Memory[]) => void;
}

// Map CloudMemory → local Memory shape for display
function cloudToMemory(c: CloudMemory): Memory {
  return {
    id: c.id,
    image: c.image_url,
    title: c.title,
    description: c.description,
    date: c.date_taken,
    location: c.location,
    sticker: c.sticker,
    rotation: c.rotation,
  };
}

export const MemoriesGallery: React.FC<MemoriesGalleryProps> = ({
  config,
  onProceedToLetter,
  onUpdateMemories,
}) => {
  const [cloudMemories, setCloudMemories] = useState<Memory[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Merge: combined list of cloud memories + config memories
  const displayMemories: Memory[] = (() => {
    if (cloudMemories.length === 0) return config.memories;
    const combined = [...cloudMemories];
    config.memories.forEach((cm) => {
      if (!combined.some((m) => m.id === cm.id || (m.title === cm.title && m.image === cm.image))) {
        combined.push(cm);
      }
    });
    return combined;
  })();
  const activePhoto = selectedPhotoIndex !== null ? displayMemories[selectedPhotoIndex] : null;

  const loadCloudMemories = useCallback(async () => {
    if (!isApiConfigured) return;
    setCloudLoading(true);
    setCloudError('');
    try {
      const data = await memoriesService.fetchPublished();
      setCloudMemories(data.map(cloudToMemory));
    } catch (e: any) {
      setCloudError(e.message || 'Could not load cloud memories');
    } finally {
      setCloudLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCloudMemories();
  }, [loadCloudMemories]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return;
      if (e.key === 'Escape') { setSelectedPhotoIndex(null); sounds.playPop(); }
      else if (e.key === 'ArrowRight') { sounds.playWhoosh(); setSelectedPhotoIndex((prev) => ((prev! + 1) % displayMemories.length)); }
      else if (e.key === 'ArrowLeft') { sounds.playWhoosh(); setSelectedPhotoIndex((prev) => (prev! === 0 ? displayMemories.length - 1 : prev! - 1)); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, displayMemories.length]);

  const openLightbox = (index: number) => { sounds.playPop(); sounds.playHeartChime(); setSelectedPhotoIndex(index); };
  const closeLightbox = () => { sounds.playPop(); setSelectedPhotoIndex(null); };
  const nextPhoto = (e: React.MouseEvent) => { e.stopPropagation(); sounds.playWhoosh(); setSelectedPhotoIndex((prev) => ((prev! + 1) % displayMemories.length)); };
  const prevPhoto = (e: React.MouseEvent) => { e.stopPropagation(); sounds.playWhoosh(); setSelectedPhotoIndex((prev) => (prev! === 0 ? displayMemories.length - 1 : prev! - 1)); };

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateMemories) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const updated = [...config.memories];
        updated[index] = { ...updated[index], image: base64 };
        onUpdateMemories(updated);
        sounds.playHeartChime();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 z-10 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 sm:mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotpink/15 border border-hotpink/30 text-blushpink text-xs sm:text-sm font-semibold mb-4 shadow-glass">
          <Camera className="w-4 h-4 text-hotpink" />
          <span>Our Scrapbook Journey</span>
          <Sparkles className="w-3.5 h-3.5 text-hotpink animate-spin" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
          {config.memoriesHeader.heading}
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-blushpink/80 leading-relaxed font-sans">
          {config.memoriesHeader.subtitle}
        </p>

        {/* Cloud status indicators */}
        {isApiConfigured && cloudLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-hotpink" />
            <span>Loading memories from cloud...</span>
          </div>
        )}
        {isApiConfigured && cloudError && (
          <div className="mt-4 flex items-center justify-center gap-2 text-amber-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{cloudError}</span>
            <button onClick={loadCloudMemories} className="underline hover:text-white flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />Retry
            </button>
          </div>
        )}
        {isApiConfigured && cloudMemories.length > 0 && !cloudLoading && (
          <div className="mt-3 text-[11px] text-white/30">
            {cloudMemories.length} memories from cloud ☁️
          </div>
        )}
      </motion.div>

      {/* Empty state */}
      {displayMemories.length === 0 && !cloudLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-hotpink/10 border border-hotpink/30 flex items-center justify-center">
            <Camera className="w-8 h-8 text-hotpink/60 animate-pulse" />
          </div>
          <p className="text-white/70 font-semibold">No memories yet — upload some via the admin panel! 🌸</p>
          <Heart className="w-5 h-5 text-hotpink animate-pulse" />
        </motion.div>
      )}

      {/* Scrapbook Grid of Polaroids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 pb-16">
        {displayMemories.map((memory, index) => {
          const rotationAngle = memory.rotation ?? (index % 2 === 0 ? -2 : 2.5);
          const isHovered = hoveredCard === memory.id;

          return (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredCard(memory.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              {/* Polaroid Frame */}
              <motion.div
                animate={{
                  rotate: isHovered ? 0 : rotationAngle,
                  scale: isHovered ? 1.04 : 1,
                  y: isHovered ? -8 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="relative rounded-2xl p-4 sm:p-5 scrapbook-card text-midnight border border-white/60 shadow-2xl flex flex-col"
              >
                {/* Washi Tape / Tape effect at top */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-7 washi-tape rotate-[-1deg] rounded-sm z-10 flex items-center justify-center opacity-85 shadow-sm border border-hotpink/20">
                  <span className="text-[10px] text-hotpink/80 font-handwriting tracking-widest font-bold">
                    MEMORIES ❤️
                  </span>
                </div>

                {/* Photo container */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/50 shadow-inner group/img">
                  <img
                    src={memory.image}
                    alt={memory.title}
                    className="w-full h-full object-center object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Hover Zoom Overlay */}
                  <div className="absolute inset-0 bg-hotpink/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="p-2.5 rounded-full bg-white/90 text-hotpink shadow-lg">
                      <ZoomIn className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Sticker badge */}
                  {memory.sticker && (
                    <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-midnight/80 backdrop-blur-md text-white text-[11px] font-bold border border-hotpink/40 shadow-sm flex items-center gap-1">
                      <span>{memory.sticker}</span>
                    </div>
                  )}

                  {/* Optional quick upload icon for developer (only for local/config memories) */}
                  {onUpdateMemories && cloudMemories.length === 0 && (
                    <label
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white text-midnight/80 hover:text-hotpink shadow-md cursor-pointer transition-colors"
                      title="Replace photo"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handlePhotoUpload(index, e)}
                      />
                    </label>
                  )}
                </div>

                {/* Handwritten notes & text underneath the photo */}
                <div className="pt-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-handwriting text-rosepink leading-tight">
                      {memory.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-700 font-sans line-clamp-3 leading-relaxed">
                      {memory.description}
                    </p>
                  </div>

                  {/* Date & Location tags */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    {memory.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-hotpink" />
                        <span>{memory.date}</span>
                      </span>
                    )}
                    {memory.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple" />
                        <span>{memory.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA to open Secret Letter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center pt-6 pb-12"
      >
        <motion.button
          onClick={() => {
            sounds.playHeartChime();
            sounds.playPop();
            onProceedToLetter();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-hotpink via-rosepink to-purple text-white font-bold text-base sm:text-lg shadow-neon-pink flex items-center gap-3 mx-auto cursor-pointer group"
        >
          <Mail className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
          <span>{config.memoriesHeader.ctaButtonText}</span>
          <Sparkles className="w-4 h-4 text-blushpink animate-spin" />
        </motion.button>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-midnight/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-3xl rounded-3xl bg-midnight border border-hotpink/40 shadow-neon-pink overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-midnight/80 hover:bg-hotpink text-white transition-colors shadow-lg border border-white/20"
                title="Close (ESC)"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Prev / Next Arrows */}
              <button
                onClick={prevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-midnight/80 hover:bg-hotpink text-white transition-colors shadow-lg border border-white/20"
                title="Previous photo (Left arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-midnight/80 hover:bg-hotpink text-white transition-colors shadow-lg border border-white/20"
                title="Next photo (Right arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Side */}
              <div className="md:w-3/5 bg-black/60 flex items-center justify-center overflow-hidden min-h-[260px] max-h-[50vh] md:max-h-full">
                <img
                  src={activePhoto.image}
                  alt={activePhoto.title}
                  className="w-full h-full object-contain object-center max-h-[80vh]"
                />
              </div>

              {/* Content Side */}
              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="inline-block px-3 py-1 rounded-full bg-hotpink/20 text-blushpink text-xs font-semibold mb-3 border border-hotpink/30">
                    Memory {selectedPhotoIndex + 1} of {displayMemories.length}
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold font-handwriting text-hotpink mb-3 leading-snug">
                    {activePhoto.title}
                  </h3>

                  <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans font-normal">
                    {activePhoto.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-xs text-white/60">
                  {activePhoto.date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-hotpink" />
                      <span>{activePhoto.date}</span>
                    </div>
                  )}
                  {activePhoto.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-lavender" />
                      <span>{activePhoto.location}</span>
                    </div>
                  )}
                  {activePhoto.sticker && (
                    <div className="flex items-center gap-2 text-blushpink font-medium">
                      <Heart className="w-4 h-4 text-hotpink fill-hotpink" />
                      <span>{activePhoto.sticker}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
