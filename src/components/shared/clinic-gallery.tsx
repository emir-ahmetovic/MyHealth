import React, { useState } from "react";

export function ClinicGallery({ images = [], onAdd, onDelete }: { images: string[]; onAdd?: (file: File) => void; onDelete?: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && onAdd) {
      onAdd(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleImageClick(idx: number) {
    setFullscreenIdx(idx);
  }

  function handleCloseFullscreen() {
    setFullscreenIdx(null);
  }

  function handlePrev() {
    if (fullscreenIdx !== null && images.length > 0) {
      setFullscreenIdx(fullscreenIdx > 0 ? fullscreenIdx - 1 : images.length - 1);
    }
  }
  function handleNext() {
    if (fullscreenIdx !== null && images.length > 0) {
      setFullscreenIdx(fullscreenIdx < images.length - 1 ? fullscreenIdx + 1 : 0);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Fotografije klinike</h2>
      <div className="flex gap-4 flex-wrap mb-4">
        {images.map((url, idx) => (
          <div key={idx} className="relative group">
            <img
              src={url}
              alt="Clinic"
              className="w-32 h-32 object-cover rounded shadow cursor-pointer"
              onClick={() => handleImageClick(idx)}
            />
            {onDelete && (
              <button
                className="absolute top-1 right-1 bg-white/80 text-red-600 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => { e.stopPropagation(); onDelete(url); }}
                title="Obriši fotografiju"
              >
                &times;
              </button>
            )}
          </div>
        ))}
        {preview && <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded border-2 border-teal-500" />}
      </div>
      {onAdd && (
        <label className="block mb-2">
          <span className="font-medium">Dodaj fotografiju:</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="block mt-2" />
        </label>
      )}

      {/* Fullscreen modal */}
      {fullscreenIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={handleCloseFullscreen}
        >
          <button
            className="absolute top-6 right-8 text-white text-3xl font-bold"
            onClick={e => { e.stopPropagation(); handleCloseFullscreen(); }}
            aria-label="Zatvori"
          >
            &times;
          </button>
          <button
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white text-4xl font-bold px-2 py-1 bg-black/40 rounded-full"
            onClick={e => { e.stopPropagation(); handlePrev(); }}
            aria-label="Prethodna"
          >
            &#8592;
          </button>
          <img
            src={images[fullscreenIdx]}
            alt="Clinic Fullscreen"
            className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white text-4xl font-bold px-2 py-1 bg-black/40 rounded-full"
            onClick={e => { e.stopPropagation(); handleNext(); }}
            aria-label="Sljedeća"
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}
