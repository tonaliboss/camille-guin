'use client'

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Image as ImageIcon, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useFileUpload } from '@/hooks/useFileUpload';
import FileUploadProgress from '@/components/ui/FileUploadProgress';
import { FOLDERS } from '@/lib/supabase';
import { formatFileSize } from '@/utils/fileOptimization';
import photoBg from '@/assets/images/photo.png';
import { usePreviewMode } from '@/hooks/usePreviewMode';

const PhotoUpload = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { isPreview, executeIfNotPreview } = usePreviewMode()
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { uploadFiles, uploadProgress, isUploading, resetProgress } = useFileUpload(FOLDERS.GALERIE);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError('');

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (droppedFiles.length === 0) {
      setError('Aucun fichier image ou vidéo valide détecté');
      return;
    }
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccessMessage('');
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => 
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      if (validFiles.length === 0) {
        setError('Aucun fichier image ou vidéo valide sélectionné');
        return;
      }
      if (validFiles.length !== selectedFiles.length) {
        setError(`${selectedFiles.length - validFiles.length} fichier(s) ignoré(s) - format non supporté`);
      }
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (!files.length) return;
    setError('');
    setSuccessMessage('');
    resetProgress();

    try {
      const { success: successCount, failed: errorCount } = await uploadFiles(files);
      if (successCount > 0) {
        setSuccessMessage(
          `${successCount} fichier(s) envoyé(s) avec succès !${errorCount > 0 ? ` (${errorCount} échec(s))` : ''}`
        );
        setFiles([]);
        if (errorCount === 0) {
          setTimeout(() => router.back(), 3000);
        }
      } else {
        throw new Error('Aucun fichier n\'a pu être envoyé');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors de l'envoi: ${errorMessage}`);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden magical-background flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="text-brown hover:text-brown/80 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-lora text-2xl text-brown ml-4">Galerie des mariés</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8">
            <div className="relative text-center mb-8">
              <img 
                src={photoBg.src}
                alt="" 
                className="absolute -left-9 -top-7 w-20 h-20 object-cover opacity-80" 
              />
              <div className="relative z-10">
                <h2 className="font-lora text-2xl text-brown mb-2 font-bold">
                  Partagez vos souvenirs
                </h2>
                <p className="text-brown/70 mb-1">
                  Déposez vos photos et vidéos du mariage
                </p>
                <p className="text-[11px] text-brown/60">
                  (visible que par les mariés)
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm">{successMessage}</p>
                  {!error && (
                    <p className="text-green-600 text-xs mt-1">Redirection automatique dans 3 secondes...</p>
                  )}
                </div>
              </div>
            )}

            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-8 transition-colors
                ${dragActive ? 'border-sage bg-sage/5' : 'border-brown/20'}
                ${files.length > 0 ? 'border-solid' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="max-w-sm mx-auto flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-brown/40" />
                <p className="text-brown/70 mb-4">Glissez-déposez vos fichiers ici ou</p>
                <button
                  type="button"
                  onClick={() =>
                    executeIfNotPreview(() => {
                      inputRef.current?.click()
                    })
                  }
                  className="btn-primary inline-flex items-center justify-center px-6 py-3"
                >
                  <Upload size={20} />
                  Parcourir
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileInput}
                />
                <p className="text-xs text-brown/50 mt-2">
                  Formats supportés: Images (JPG, PNG, GIF) et Vidéos (MP4, MOV, AVI)
                </p>
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-lora text-lg text-brown mb-4 flex items-center gap-2">
                  Fichiers sélectionnés ({files.length})
                  <div className="bg-sage/20 rounded-full p-1.5 animate-bounce">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-sage">
                      <path d="M12 5v14m0 0l-7-7m7 7l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </h3>
                
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="btn-primary w-full px-6 py-3"
                >
                  <Upload size={20} />
                  {isUploading ? 'Envoi en cours...' : 'Envoyer les fichiers'}
                </button>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <ImageIcon size={20} className="text-brown/60" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-brown/80 truncate block text-sm">{file.name}</span>
                          <span className="text-xs text-brown/50">{file.type} • {formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      {!isUploading && (
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {Object.keys(uploadProgress).length > 0 && (
                  <FileUploadProgress progress={uploadProgress} />
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhotoUpload;