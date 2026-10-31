import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Images, X, ChevronLeft, ChevronRight, Heart, Sparkles,
  ArrowLeft, Upload, Loader2, Trash2, CheckCircle,
  Plus, Camera,
} from 'lucide-react';
import { SiteConfig, GalleryPhoto } from '../../types';
import { sounds } from '../../utils/sound';
import { albumService, validateImageFile } from '../../services/album';

interface PhotoGalleryProps {
  config: SiteConfig;
  onBack: () => void;
  onUpdatePhotos?: (photos: GalleryPhoto[]) => void;
}

interface UploadDraft {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ config, onBack, onUpdatePhotos }) => {
  const [cloudPhotos, setCloudPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Upload UI state
  const [drafts, setDrafts] = useState<UploadDraft[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Combined list: Cloud photos + local config photos (deduped by id/src)
  const allPhotos: GalleryPhoto[] = (() => {
    const combined = [...cloudPhotos];
    config.galleryPhotos.forEach((gp) => {
      if (!combined.some((p) => p.src === gp.src || p.id === gp.id)) {
        combined.push(gp);
      }
    });
    return combined;
  })();

  const activePhoto = lightboxIndex !== null ? allPhotos[lightboxIndex] : null;

  // Load cloud photos on mount
  const loadCloudPhotos = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await albumService.fetchAll();
      if (data && data.length > 0) {
        setCloudPhotos(data);
      }
    } catch (e) {
      console.warn('Could not load album photos from cloud:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCloudPhotos();
  }, [loadCloudPhotos]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') {
        setLightboxIndex(null);
        sounds.playPop();
      } else if (e.key === 'ArrowRight') {
        sounds.playWhoosh();
        setLightboxIndex((prev) => ((prev! + 1) % allPhotos.length));
      } else if (e.key === 'ArrowLeft') {
        sounds.playWhoosh();
        setLightboxIndex((prev) => (prev! === 0 ? allPhotos.length - 1 : prev! - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, allPhotos.length]);

  const openLightbox = (i: number) => {
    sounds.playPop();
    sounds.playHeartChime();
    setLightboxIndex(i);
  };

  const closeLightbox = () => {
    sounds.playPop();
    setLightboxIndex(null);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playWhoosh();
    setLightboxIndex((prev) => ((prev! + 1) % allPhotos.length));
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playWhoosh();
    setLightboxIndex((prev) => (prev! === 0 ? allPhotos.length - 1 : prev! - 1));
  };

  // Handle selected files
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newDrafts: UploadDraft[] = [];

    Array.from(files).forEach((file) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        return;
      }
      const preview = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      newDrafts.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview,
        caption: cleanName.length > 0 ? cleanName : 'Namma Special Memory 💗',
      });
    });

    if (newDrafts.length > 0) {
      setDrafts((prev) => [...prev, ...newDrafts]);
      setShowUploadModal(true);
      sounds.playPop();
    }
  };

  // Upload and persist all drafts
  const handleUploadAll = async () => {
    if (drafts.length === 0) return;
    setIsUploading(true);
    setUploadProgress(0);

    const uploadedResults: GalleryPhoto[] = [];

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];
      try {
        setUploadProgress(Math.round((i / drafts.length) * 100));
        const savedPhoto = await albumService.uploadPhoto(
          draft.file,
          draft.caption,
          (pct) => setUploadProgress(Math.round(((i + pct / 100) / drafts.length) * 100))
        );
        uploadedResults.push(savedPhoto);
      } catch (err) {
        console.error('Failed to upload photo:', err);
      }
    }

    setUploadProgress(100);
    setIsUploading(false);

    if (uploadedResults.length > 0) {
      // Fire confetti burst!
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF4F9A', '#FFE4EF', '#B8A4FF', '#E91E63'],
      });
      sounds.playCelebrationFanfare();

      // Revoke preview object URLs
      drafts.forEach((d) => URL.revokeObjectURL(d.preview));
      setDrafts([]);
      setShowUploadModal(false);

      // Update state
      const updatedList = [...uploadedResults, ...allPhotos];
      setCloudPhotos(updatedList);
      if (onUpdatePhotos) {
        onUpdatePhotos(updatedList);
      }
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id: string, storage_path?: string) => {
    sounds.playPop();
    try {
      await albumService.deletePhoto(id, storage_path);
      const updated = allPhotos.filter((p) => p.id !== id);
      setCloudPhotos(updated);
      if (onUpdatePhotos) {
        onUpdatePhotos(updated);
      }
      setDeleteConfirmId(null);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragOver(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className="relative min-h-screen py-10 px-4 sm:px-6 z-10 max-w-6xl mx-auto"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Top Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8 sm:mb-12"
      >
        {/* Back button */}
        <button
          onClick={() => { sounds.playPop(); onBack(); }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-midnight/80 border border-white/20 text-white/80 hover:text-white hover:border-hotpink/60 text-xs font-semibold transition-all backdrop-blur-md shadow-glass cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-hotpink" />
          <span>Back</span>
        </button>

        {/* Center Title */}
        <div className="text-center flex-1 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-hotpink/15 border border-hotpink/30 text-blushpink text-xs font-semibold mb-2 shadow-glass">
            <Images className="w-3.5 h-3.5 text-hotpink" />
            <span>Our Photo Album</span>
            <Sparkles className="w-3 h-3 text-hotpink animate-spin" />
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Namma Moments 📸💗
          </h1>
          <p className="max-w-md mx-auto text-xs sm:text-sm text-blushpink/80 mt-1 leading-relaxed hidden sm:block">
            Ovvoru photo-vum oru story. Ovvoru smile-um oru memory. 🫂
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => {
            sounds.playPop();
            fileInputRef.current?.click();
          }}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-hotpink via-rosepink to-purple hover:scale-105 text-white text-xs font-bold transition-all shadow-neon-pink cursor-pointer shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Upload Photos</span>
          <span className="sm:hidden">Upload</span>
        </button>
      </motion.div>

      {/* Global Drag-and-Drop Active Overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-hotpink p-6"
          >
            <div className="w-24 h-24 rounded-full bg-hotpink/20 flex items-center justify-center shadow-neon-pink mb-4 animate-bounce">
              <Upload className="w-12 h-12 text-hotpink" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Drop Your Photos Here! 🌸
            </h2>
            <p className="text-blushpink/80 text-sm mt-1">
              Release to add them directly to our album
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty State with Active Upload Card ── */}
      {allPhotos.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto"
        >
          {/* Animated Upload Box */}
          <div
            onClick={() => {
              sounds.playPop();
              fileInputRef.current?.click();
            }}
            className="w-full rounded-3xl p-8 sm:p-10 glass-panel border-2 border-dashed border-hotpink/40 hover:border-hotpink/80 bg-midnight/40 hover:bg-hotpink/10 transition-all duration-300 shadow-neon-pink cursor-pointer group flex flex-col items-center gap-4"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-hotpink/30 to-purple/30 border border-hotpink/40 flex items-center justify-center shadow-glass group-hover:scale-110 transition-transform">
              <Camera className="w-9 h-9 text-hotpink animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Upload Our Photos 📸💗
              </h3>
              <p className="text-blushpink/75 text-xs sm:text-sm mt-1.5 max-w-xs mx-auto leading-relaxed">
                Save our moments, trips, selfies, and future memories together right here!
              </p>
            </div>

            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-hotpink to-purple text-white font-bold text-xs shadow-neon-pink group-hover:scale-105 transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Choose Photos / Drag & Drop</span>
            </div>

            <p className="text-[11px] text-white/40">
              JPEG, PNG, WebP, GIF, HEIC • Select multiple photos at once
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-hotpink">
            <Heart className="w-5 h-5 fill-hotpink animate-pulse" />
            <span className="text-xs text-white/50 italic">
              "Namma memories, namma bond, forever."
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Masonry-style Photo Grid ── */}
      {allPhotos.length > 0 && (
        <div className="space-y-6 pb-20">
          {/* Action Row */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs sm:text-sm text-blushpink/70 font-medium">
              {allPhotos.length} photo{allPhotos.length > 1 ? 's' : ''} saved in album 🌸
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-hotpink hover:text-white transition-colors cursor-pointer font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add more photos</span>
            </button>
          </div>

          {/* Grid */}
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {allPhotos.map((photo, index) => (
              <motion.div
                key={photo.id || index}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
                className="break-inside-avoid group cursor-pointer relative rounded-2xl overflow-hidden shadow-lg border border-white/10 hover:border-hotpink/60 transition-all duration-300 bg-midnight/50"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={photo.src}
                  alt={photo.caption ?? `Photo ${index + 1}`}
                  className="w-full h-auto object-center object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Caption overlay on hover */}
                {photo.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-midnight/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                      {photo.caption}
                    </p>
                  </div>
                )}

                {/* Hover badges */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmId(photo.id);
                    }}
                    title="Delete photo"
                    className="p-1.5 rounded-full bg-midnight/80 hover:bg-red-500/80 text-white shadow-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  {/* Heart badge */}
                  <div className="p-1.5 rounded-full bg-hotpink/80 shadow-md">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upload Previews & Caption Modal ── */}
      <AnimatePresence>
        {showUploadModal && drafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-md"
            onClick={() => !isUploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl glass-panel border border-hotpink/40 shadow-neon-pink p-6 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-hotpink/20 flex items-center justify-center text-hotpink">
                    <Camera className="w-4 h-4" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Save Photos to Album ({drafts.length})
                  </h3>
                </div>
                {!isUploading && (
                  <button
                    onClick={() => {
                      drafts.forEach((d) => URL.revokeObjectURL(d.preview));
                      setDrafts([]);
                      setShowUploadModal(false);
                    }}
                    className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Draft List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
                {drafts.map((draft, idx) => (
                  <div
                    key={draft.id}
                    className="flex gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 items-center"
                  >
                    <img
                      src={draft.preview}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded-xl border border-hotpink/30 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={draft.caption}
                        onChange={(e) =>
                          setDrafts((prev) =>
                            prev.map((d, j) => (j === idx ? { ...d, caption: e.target.value } : d))
                          )
                        }
                        placeholder="Add a cute caption (optional)..."
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white text-xs sm:text-sm focus:border-hotpink outline-none placeholder-white/30"
                      />
                    </div>
                    {!isUploading && (
                      <button
                        onClick={() => {
                          URL.revokeObjectURL(draft.preview);
                          setDrafts((prev) => prev.filter((_, j) => j !== idx));
                        }}
                        className="text-white/40 hover:text-red-400 p-1"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="py-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-hotpink" />
                      <span>Saving your photos...</span>
                    </span>
                    <span className="font-mono text-hotpink font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-hotpink to-purple rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                {!isUploading && (
                  <button
                    onClick={() => {
                      drafts.forEach((d) => URL.revokeObjectURL(d.preview));
                      setDrafts([]);
                      setShowUploadModal(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleUploadAll}
                  disabled={isUploading || drafts.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-hotpink to-purple text-white font-bold text-xs sm:text-sm shadow-neon-pink hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Save {drafts.length} Photo{drafts.length > 1 ? 's' : ''} 💗</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirmation Dialog ── */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-md"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl glass-panel border border-red-500/40 p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Delete Photo?</h4>
                <p className="text-xs text-white/60 mt-1">
                  This photo will be permanently removed from the album.
                </p>
              </div>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => {
                    const target = allPhotos.find((p) => p.id === deleteConfirmId);
                    handleDeletePhoto(deleteConfirmId, target?.storage_path);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox Modal ── */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/95 backdrop-blur-lg"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-midnight/80 hover:bg-hotpink text-white transition-colors border border-white/20 cursor-pointer shadow-lg"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Prev */}
            {allPhotos.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-midnight/80 hover:bg-hotpink text-white transition-colors border border-white/20 cursor-pointer shadow-lg"
                title="Previous (Left arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Next */}
            {allPhotos.length > 1 && (
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-midnight/80 hover:bg-hotpink text-white transition-colors border border-white/20 cursor-pointer shadow-lg"
                title="Next (Right arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Image & Caption */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-3 max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activePhoto.src}
                alt={activePhoto.caption ?? ''}
                className="max-h-[78vh] w-auto max-w-full rounded-2xl shadow-2xl border border-hotpink/30 object-contain object-center"
              />
              {activePhoto.caption && (
                <p className="text-blushpink text-sm sm:text-base font-medium text-center px-4 font-sans">
                  {activePhoto.caption}
                </p>
              )}
              <p className="text-white/40 text-xs">
                {lightboxIndex + 1} / {allPhotos.length}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
