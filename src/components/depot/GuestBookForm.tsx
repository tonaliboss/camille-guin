'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase, BUCKET_NAME, FOLDERS } from '@/lib/supabase';
import guestbookBg from '@/assets/images/guestbook.png';

function GuestbookForm() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [author, setAuthor] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !author.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setIsSending(true);

    try {
      const content = JSON.stringify({
        message: message.trim(),
        author: author.trim(),
        date: new Date().toISOString()
      });

      const fileName = `message-${Date.now()}.json`;
      const contentBlob = new Blob([content], { type: 'application/json' });
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(`${FOLDERS.ECRIT}/${fileName}`, contentBlob);

      if (error) throw error;

      alert('Votre message a été enregistré avec succès !');
      router.back();
    } catch (error) {
      console.error('Error saving message:', error);
      alert('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${guestbookBg.src})`,
          backgroundSize: '120% auto',
          backgroundPosition: 'left 25%',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="relative z-20">
        <header className="bg-white/80 shadow-sm sticky top-0">
          <div className="max-w-sm mx-auto px-3 py-2 flex items-center">
            <button 
              onClick={() => router.back()}
              className="text-brown hover:text-brown/80 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="font-lora text-base text-brown ml-2">Livre d'or</h1>
          </div>
        </header>

        <main className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 mt-8">
          <div className="w-full max-w-xs ml-12 bg-white/90 rounded shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label 
                  htmlFor="message" 
                  className="block text-brown/70 text-sm md:text-lg mb-1"
                >
                  Laissez un beau message aux mariés
                  <span className="text-[11px] text-brown/60 block mt-0.5">
                    (visible que par les mariés)
                  </span>
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-20 p-2 border border-beige/30 rounded focus:ring-1 focus:ring-sage focus:border-sage bg-white/95 text-brown text-sm resize-none"
                  placeholder="Écrivez votre message ici..."
                />
              </div>

              <div>
                <label 
                  htmlFor="author" 
                  className="block text-brown/70 text-sm md:text-lg mb-1"
                >
                  De la part de qui ?
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2 border border-beige/30 rounded focus:ring-1 focus:ring-sage focus:border-sage bg-white/95 text-brown text-sm"
                  placeholder="Votre nom"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="btn-primary w-full py-2 text-xs px-8"
              >
                <Send size={12} />
                {isSending ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default GuestbookForm;