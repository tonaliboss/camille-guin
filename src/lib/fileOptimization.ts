// Utilitaires d'optimisation des fichiers
export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
  videoBitrate?: number;
  videoQuality?: number;
}

export const compressImage = (file: File, options: CompressionOptions = {}): Promise<File> => {
  return new Promise((resolve) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85
    } = options;

    // Si le fichier est déjà petit, on le retourne tel quel
    if (file.size <= 1000 * 1024) { // 1MB
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en blob avec compression
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

export const compressVideo = (file: File, options: CompressionOptions = {}): Promise<File> => {
  return new Promise((resolve, _reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      videoBitrate = 2500 // 2.5 Mbps - excellent qualité
    } = options;

    // Si le fichier est déjà petit, on le retourne tel quel
    if (file.size <= 10 * 1024 * 1024) { // 10MB
      resolve(file);
      return;
    }

    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    video.onloadedmetadata = () => {
      // Calculer les nouvelles dimensions en gardant le ratio
      let { videoWidth: width, videoHeight: height } = video;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      // Utiliser MediaRecorder pour la compression
      const stream = canvas.captureStream(30); // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8', // VP8 pour meilleure compatibilité
        videoBitsPerSecond: videoBitrate * 1000 // Convertir en bps
      });

      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const compressedBlob = new Blob(chunks, { type: 'video/webm' });
        const compressedFile = new File([compressedBlob], 
          file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm',
          lastModified: Date.now()
        });
        resolve(compressedFile);
      };

      mediaRecorder.onerror = () => {
        // En cas d'erreur, retourner le fichier original
        resolve(file);
      };

      // Commencer l'enregistrement
      mediaRecorder.start();

      // Dessiner chaque frame de la vidéo
      const drawFrame = () => {
        if (video.ended || video.paused) {
          mediaRecorder.stop();
          return;
        }
        
        ctx.drawImage(video, 0, 0, width, height);
        requestAnimationFrame(drawFrame);
      };

      video.onplay = () => {
        drawFrame();
      };

      // Jouer la vidéo pour déclencher la compression
      video.play().catch(() => {
        // En cas d'erreur de lecture, retourner le fichier original
        resolve(file);
      });
    };

    video.onerror = () => {
      // En cas d'erreur, retourner le fichier original
      resolve(file);
    };

    video.src = URL.createObjectURL(file);
  });
};

export const shouldCompressVideo = (file: File): boolean => {
  // Compresser les vidéos > 10MB
  return file.type.startsWith('video/') && file.size > 10 * 1024 * 1024;
};

export const shouldCompressFile = (file: File): boolean => {
  // Compresser les images > 1MB ou les vidéos > 10MB
  return shouldCompressImage(file) || shouldCompressVideo(file);
};

export const shouldCompressImage = (file: File): boolean => {
  return file.type.startsWith('image/') && file.size > 1 * 1024 * 1024;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getOptimalChunkSize = (fileSize: number): number => {
  // Taille de chunk adaptative selon la taille du fichier
  if (fileSize < 5 * 1024 * 1024) return 1024 * 1024; // 1MB pour petits fichiers
  if (fileSize < 50 * 1024 * 1024) return 2 * 1024 * 1024; // 2MB pour fichiers moyens
  return 4 * 1024 * 1024; // 4MB pour gros fichiers
};

export const isHeic = (file: File): boolean => {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.(heic|heif)$/i.test(file.name)
}

export const convertHeicToJpeg = async (file: File): Promise<File> => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/convert-heic', { method: 'POST', body: formData })
  if (!res.ok) throw new Error('Conversion HEIC échouée')

  const blob = await res.blob()
  return new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}