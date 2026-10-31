import React, { useState, useEffect, useRef, useTransition } from 'react';
import { motion } from 'framer-motion';
import {
  Upload, Trash2, Edit2, Check, X, Eye, EyeOff,
  Search, ArrowLeft, AlertCircle, Loader2,
  Image as ImageIcon, Calendar, MapPin,
  CheckCircle, XCircle, RefreshCw, Heart, Sparkles,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import { CloudMemory, SiteConfig, Memory } from '../../types';
import { memoriesService } from '../../services/memories';
import { storageService, validateImageFile } from '../../services/storage';
import { isApiConfigured } from '../../lib/api';
import { sounds } from '../../utils/sound';

interface MemoryAdminProps {
  onBack: () => void;
  config?: SiteConfig;
  onUpdateMemories?: (newMemories: Memory[]) => void;
}

interface UploadDraft {
  id: string;
  file: File;
  preview: string;
  title: string;
  description: string;
  date_taken: string;
  location: string;
  sticker: string;
}

export const MemoryAdmin: React.FC<MemoryAdminProps> = ({ onBack, config, onUpdateMemories }) => {
  const [memories, setMemories] = useState<CloudMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [drafts, setDrafts] = useState<UploadDraft[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CloudMemory>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  // Admin is authenticated via passcode in App.tsx
  // No additional auth needed here

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    setLoading(true);
    setError('');
    let cloudList: CloudMemory[] = [];
    if (isApiConfigured) {
      try {
        cloudList = await memoriesService.fetchAll();
      } catch (e: unknown) {
        console.warn('Could not fetch cloud memories:', e);
      }
    }

    const localAsCloud: CloudMemory[] = (config?.memories || []).map((m, idx) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      storage_path: '',
      image_url: m.image,
      date_taken: m.date,
      location: m.location,
      sticker: m.sticker,
      rotation: m.rotation,
      display_order: idx,
      published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const merged = [...cloudList];
    localAsCloud.forEach((loc) => {
      if (!merged.some((c) => c.id === loc.id || (c.title === loc.title && c.image_url === loc.image_url))) {
        merged.push(loc);
      }
    });

    setMemories(merged);
    setLoading(false);
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newDrafts: UploadDraft[] = [];
    Array.from(files).forEach((file) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        return;
      }
      const preview = URL.createObjectURL(file);
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim();

      newDrafts.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        preview,
        title: cleanName.length > 0 ? cleanName : 'Namma Special Moment',
        description: 'Andha naal semma special aaga irundhudhu! 🥹💗',
        date_taken: '',
        location: '',
        sticker: '❤️ Our Bound',
      });
    });
    setDrafts((prev) => [...prev, ...newDrafts]);
    sounds.playPop();
  }

  async function handleUploadAll() {
    if (drafts.length === 0) return;

    if (!isApiConfigured) {
      setUploading(false);
      setUploadStatus('error');
      setUploadError('Shared gallery backend is not configured. Add the Netlify Function environment variables and redeploy.');
      return;
    }

    setUploading(true);
    setUploadStatus('uploading');
    setUploadError('');
    let successCount = 0;

    for (let i = 0; i < drafts.length; i++) {
      const draft = drafts[i];

      try {
        setUploadProgress(Math.round((i / drafts.length) * 100));
        const { path, url } = await storageService.upload(draft.file, (pct) => {
          setUploadProgress(Math.round(((i + pct / 100) / drafts.length) * 100));
        });

        const maxOrder = memories.reduce((m, mem) => Math.max(m, mem.display_order), 0);
        await memoriesService.create({
          title: draft.title || 'Untitled Memory',
          description: draft.description || '',
          storage_path: path,
          image_url: url,
          date_taken: draft.date_taken || undefined,
          location: draft.location || undefined,
          sticker: draft.sticker || undefined,
          rotation: Math.floor(Math.random() * 6) - 3,
          display_order: maxOrder + i + 1,
          published: true,
        });

        successCount++;
      } catch (cloudErr) {
        console.error('[Our Bound] Cloud upload error:', cloudErr);
        setUploadStatus('error');
        setUploadError('Could not upload the photo to the shared gallery. Check the Netlify environment variables and Cloudinary/MongoDB configuration.');
        setUploading(false);
        setUploadProgress(0);
        return;
      }
    }

    setUploadProgress(100);
    setUploading(false);

    if (successCount > 0) {
      sounds.playCelebrationFanfare();
      setUploadStatus('success');
      drafts.forEach((d) => URL.revokeObjectURL(d.preview));
      setDrafts([]);
      await loadMemories();
    } else {
      setUploadStatus('error');
      setUploadError('Could not process photo upload. Please check file format and try again.');
    }
    setTimeout(() => setUploadStatus('idle'), 5000);
  }

  async function handleTogglePublish(memory: CloudMemory) {
    try {
      sounds.playPop();
      await memoriesService.togglePublish(memory.id, !memory.published);
      setMemories((prev) =>
        prev.map((m) => m.id === memory.id ? { ...m, published: !m.published } : m)
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      alert(`Action failed: ${msg}`);
    }
  }

  async function handleDelete(id: string) {
    const memory = memories.find((m) => m.id === id);
    if (!memory) return;
    try {
      sounds.playPop();
      if (memory.storage_path) {
        await storageService.delete(memory.storage_path);
      }
    } catch {}

    if (memory.storage_path) {
      try {
        await memoriesService.delete(id);
      } catch {}
    }

    if (config && onUpdateMemories) {
      const updatedLocal = config.memories.filter((m) => m.id !== id);
      onUpdateMemories(updatedLocal);
    }

    setMemories((prev) => prev.filter((m) => m.id !== id));
    setDeleteConfirmId(null);
  }

  async function handleSaveEdit(id: string) {
    try {
      sounds.playPop();
      const updated = await memoriesService.update(id, editForm);
      setMemories((prev) => prev.map((m) => m.id === id ? updated : m));
      setEditingId(null);
      setEditForm({});
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      alert(`Save failed: ${msg}`);
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= memories.length) return;

    sounds.playPop();
    const current = memories[index];
    const target = memories[targetIndex];

    const currentOrder = current.display_order;
    const targetOrder = target.display_order;

    // Swap orders locally
    const updated = [...memories];
    updated[index] = { ...target, display_order: currentOrder };
    updated[targetIndex] = { ...current, display_order: targetOrder };
    setMemories(updated);

    try {
      await Promise.all([
        memoriesService.updateOrder(current.id, targetOrder),
        memoriesService.updateOrder(target.id, currentOrder),
      ]);
    } catch {
      await loadMemories();
    }
  }

  const filtered = memories.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 z-10 max-w-5xl mx-auto">
      {/* Top Bar with Navigation & Brand */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => { sounds.playPop(); onBack(); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-midnight/80 border border-white/20 text-white/80 hover:text-white hover:border-hotpink/60 text-xs font-semibold transition-all backdrop-blur-md shadow-glass"
        >
          <ArrowLeft className="w-4 h-4 text-hotpink" />
          <span>Exit Admin</span>
        </button>

        {/* Wordmark */}
        <div className="text-center">
          <span className="text-sm font-serifDisplay tracking-wider bg-gradient-to-r from-hotpink via-rosepink to-lavender bg-clip-text text-transparent font-bold">
            Our Bound ♡
          </span>
          <p className="text-[10px] text-blushpink/60 hidden sm:block">Gallery Management Console</p>
        </div>
      </motion.div>

      {/* Main Page Title */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hotpink to-purple flex items-center justify-center shadow-neon-pink">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Manage Memories Gallery
            </h1>
            <p className="text-blushpink/75 text-xs sm:text-sm">
              Upload, edit, reorder, and publish photos permanently to cloud storage.
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-hotpink animate-spin ml-auto hidden sm:block" />
        </div>

        {!isApiConfigured && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-start gap-3 text-amber-200 text-sm shadow-glass">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-100">Cloud Storage is Not Configured</p>
              <p className="text-xs mt-1 text-amber-200/80 leading-relaxed">
                MongoDB Atlas and Cloudinary are not configured. Add environment variables to enable cloud features.
                The gallery is currently displaying local fallback memories.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Drag & Drop Upload Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragOver
              ? 'border-hotpink bg-hotpink/15 shadow-neon-pink scale-[1.01]'
              : 'border-white/20 hover:border-hotpink/60 hover:bg-white/5 bg-midnight/40 backdrop-blur-md'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-hotpink/30 to-purple/30 border border-hotpink/40 flex items-center justify-center shadow-glass group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-hotpink" />
            </div>
            <div>
              <p className="text-white font-bold text-base sm:text-lg">
                Drag and drop your photos here, or click to browse
              </p>
              <p className="text-blushpink/60 text-xs sm:text-sm mt-1">
                Supports multiple files • JPEG, PNG, WebP, GIF • Up to 15 MB each
              </p>
            </div>
          </div>
        </div>

        {/* Draft Previews & Editor Before Uploading */}
        {drafts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <span>{drafts.length} photo{drafts.length > 1 ? 's' : ''} ready to upload</span>
                <span className="w-2 h-2 rounded-full bg-hotpink animate-pulse" />
              </p>
              <button
                onClick={() => {
                  drafts.forEach((d) => URL.revokeObjectURL(d.preview));
                  setDrafts([]);
                }}
                className="text-white/50 hover:text-red-400 text-xs transition-colors"
              >
                Clear all drafts
              </button>
            </div>

            <div className="space-y-3">
              {drafts.map((draft, i) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 border border-hotpink/30 shadow-glass"
                >
                  <div className="relative w-full sm:w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-white/20 bg-slate-900">
                    <img src={draft.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2.5 min-w-0">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                        Memory Title
                      </label>
                      <input
                        type="text"
                        value={draft.title}
                        onChange={(e) => setDrafts((prev) => prev.map((d, j) => j === i ? { ...d, title: e.target.value } : d))}
                        placeholder="Memory title (e.g. Andha Naal Semma Special ❤️)"
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm placeholder-white/30 focus:border-hotpink outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">
                        Thanglish Memory Description
                      </label>
                      <textarea
                        value={draft.description}
                        onChange={(e) => setDrafts((prev) => prev.map((d, j) => j === i ? { ...d, description: e.target.value } : d))}
                        placeholder="Thanglish description (e.g. Indha photo-va paakkumbodhellam sirippu vandhudum...)"
                        rows={2}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white text-sm placeholder-white/30 focus:border-hotpink outline-none resize-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-hotpink" />
                          <span>Date (Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={draft.date_taken}
                          onChange={(e) => setDrafts((prev) => prev.map((d, j) => j === i ? { ...d, date_taken: e.target.value } : d))}
                          placeholder="e.g. June 2024 / Special Day ✨"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-white text-xs placeholder-white/30 focus:border-hotpink outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-white/70 uppercase tracking-wider flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-lavender" />
                          <span>Location (Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={draft.location}
                          onChange={(e) => setDrafts((prev) => prev.map((d, j) => j === i ? { ...d, location: e.target.value } : d))}
                          placeholder="e.g. Our Favourite Spot 📍"
                          className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-white text-xs placeholder-white/30 focus:border-hotpink outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      URL.revokeObjectURL(draft.preview);
                      setDrafts((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="self-end sm:self-start p-1.5 text-white/40 hover:text-red-400 transition-colors"
                    title="Remove this draft"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="p-4 rounded-2xl glass-panel border border-hotpink/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-hotpink" />
                    <span>Uploading photos to Supabase Storage and saving metadata...</span>
                  </span>
                  <span className="font-mono font-bold text-hotpink">{uploadProgress}%</span>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-hotpink via-rosepink to-purple rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-3 text-emerald-200 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Memories uploaded successfully to permanent cloud storage! They are now published.</span>
              </div>
            )}

            {uploadStatus === 'error' && uploadError && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center gap-3 text-red-200 text-sm">
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <motion.button
                onClick={handleUploadAll}
                disabled={uploading || !isApiConfigured}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-hotpink via-rosepink to-purple text-white font-extrabold text-sm shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>
                  {uploading ? 'Uploading to Cloud...' : `Upload & Save ${drafts.length} Memory${drafts.length > 1 ? 's' : ''}`}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Existing Cloud Memories List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Cloud Gallery Memories</span>
              <span className="px-2.5 py-0.5 rounded-full bg-hotpink/20 text-blushpink text-xs font-bold border border-hotpink/30">
                {memories.length}
              </span>
            </h2>
            <p className="text-xs text-white/50 mt-0.5">
              Live records fetched from Supabase PostgreSQL database
            </p>
          </div>

          <button
            onClick={loadMemories}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              const val = e.target.value;
              startTransition(() => setSearchQuery(val));
            }}
            placeholder="Search memories by title, description, or location..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 focus:border-hotpink text-white placeholder-white/30 text-sm outline-none transition-all shadow-inner"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-hotpink" />
            <p className="text-sm">Fetching memories from cloud database...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass-panel border border-red-500/30 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-300 font-semibold">{error}</p>
            <p className="text-xs text-white/50">
              Ensure Supabase is configured and the database migrations have been run.
            </p>
            <button
              onClick={loadMemories}
              className="px-4 py-2 rounded-xl bg-hotpink/20 text-blushpink text-xs font-semibold hover:bg-hotpink/30 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel border border-white/10 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-hotpink/10 border border-hotpink/30 flex items-center justify-center mx-auto">
              <ImageIcon className="w-8 h-8 text-hotpink/60" />
            </div>
            <p className="text-white/80 font-bold text-base">
              {searchQuery ? 'No memories match your search' : 'No memories uploaded yet'}
            </p>
            <p className="text-white/40 text-xs max-w-sm mx-auto">
              {searchQuery
                ? 'Try searching with another keyword.'
                : 'Upload your first photo above. New photos will appear permanently in the gallery!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((memory, index) => (
              <motion.div
                key={memory.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-hotpink/30 transition-all shadow-glass"
              >
                {editingId === memory.id ? (
                  /* Edit Mode */
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={memory.image_url}
                        alt={memory.title}
                        className="w-20 h-20 object-cover rounded-xl border border-hotpink/40 shrink-0"
                      />
                      <div className="flex-1 space-y-2 w-full">
                        <input
                          value={editForm.title ?? memory.title}
                          onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-white text-sm focus:border-hotpink outline-none"
                          placeholder="Memory Title"
                        />
                        <textarea
                          value={editForm.description ?? memory.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          className="w-full bg-white/5 border border-white/20 rounded-xl px-3.5 py-2 text-white text-sm focus:border-hotpink outline-none resize-none"
                          placeholder="Thanglish Description"
                          rows={2}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            value={editForm.date_taken ?? memory.date_taken ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, date_taken: e.target.value }))}
                            className="bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-white text-xs focus:border-hotpink outline-none"
                            placeholder="Date"
                          />
                          <input
                            value={editForm.location ?? memory.location ?? ''}
                            onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                            className="bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-white text-xs focus:border-hotpink outline-none"
                            placeholder="Location"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleSaveEdit(memory.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : deleteConfirmId === memory.id ? (
                  /* Delete Confirmation */
                  <div className="p-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                      <div>
                        <p className="text-white text-sm font-semibold">
                          Are you sure you want to delete this memory?
                        </p>
                        <p className="text-xs text-white/50">
                          "<span className="text-blushpink">{memory.title}</span>" will be permanently removed from cloud storage and database.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-bold transition-all"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Memory Card */
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Reorder Buttons */}
                    <div className="flex sm:flex-col items-center justify-center gap-1 shrink-0 text-white/40">
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                        className="p-1 rounded hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-mono text-white/40">{index + 1}</span>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === memories.length - 1}
                        title="Move Down"
                        className="p-1 rounded hover:bg-white/10 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <img
                      src={memory.image_url}
                      alt={memory.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-hotpink/30 shrink-0 bg-slate-900"
                      loading="lazy"
                    />

                    {/* Metadata Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm sm:text-base truncate">
                          {memory.title}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          memory.published
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/10 text-white/50'
                        }`}>
                          {memory.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-white/60 text-xs line-clamp-2 mt-1 leading-relaxed">
                        {memory.description || 'No description added.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-white/40">
                        {memory.date_taken && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-hotpink" />
                            <span>{memory.date_taken}</span>
                          </span>
                        )}
                        {memory.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-lavender" />
                            <span>{memory.location}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0">
                      <button
                        onClick={() => handleTogglePublish(memory)}
                        title={memory.published ? 'Click to Unpublish' : 'Click to Publish'}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          memory.published
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {memory.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{memory.published ? 'Live' : 'Draft'}</span>
                      </button>

                      <button
                        onClick={() => { setEditingId(memory.id); setEditForm({}); sounds.playPop(); }}
                        title="Edit Details"
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => { setDeleteConfirmId(memory.id); sounds.playPop(); }}
                        title="Delete Memory"
                        className="p-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
