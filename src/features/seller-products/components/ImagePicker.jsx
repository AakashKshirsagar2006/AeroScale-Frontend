import { ImagePlus, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { imageProblem } from '../model/schemas';

/**
 * Click or drop a photo. It only reports the chosen File; the form decides when to upload.
 * `previewUrl` = what to show now (the new file's temporary URL, or the saved photo).
 */
export function ImagePicker({ previewUrl, onPick, hasSaved = false }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  const [problem, setProblem] = useState(null);

  const take = (file) => {
    if (!file) return;
    const bad = imageProblem(file);
    setProblem(bad);
    if (!bad) onPick(file);
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-800">Product photo</span>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
        className={cn('group relative overflow-hidden rounded-2xl border-2 border-dashed transition', over ? 'scale-[1.01] border-brand bg-brand/5' : 'border-slate-300 bg-slate-50 hover:border-accent', previewUrl && 'border-solid border-slate-200')}
      >
        {previewUrl ? (
          <div className="relative aspect-4/3 w-full">
            <img src={previewUrl} alt="Product preview" className="size-full object-cover" />
            <button type="button" onClick={() => input.current?.click()} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-xl bg-white/95 px-3.5 py-2 text-sm font-semibold text-ink shadow-lg outline-none backdrop-blur transition hover:bg-white focus-visible:ring-4 focus-visible:ring-accent/40">
              <RefreshCw className="size-4" aria-hidden />Change photo
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex aspect-4/3 w-full flex-col items-center justify-center gap-3 px-6 text-center outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent/40">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand transition group-hover:scale-110"><ImagePlus className="size-7" aria-hidden /></span>
            <span className="text-sm font-semibold text-ink">Drop a photo here, or click to browse</span>
            <span className="text-xs text-slate-600">JPG, PNG or WebP, up to 5 MB</span>
          </button>
        )}
        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { take(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {problem && <p role="alert" className="mt-1.5 text-xs font-medium text-brand-700">{problem}</p>}
      {hasSaved && !problem && <p className="mt-1.5 text-xs text-slate-600">Pick a new photo to replace this one. Leave it as is to keep it.</p>}
    </div>
  );
}
