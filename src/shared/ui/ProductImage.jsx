import { useState } from 'react';
import { Camera, Gamepad2, Headphones, Laptop, Package, Smartphone, Speaker, Tv, Watch } from 'lucide-react';
import { cn } from '../lib/cn';

// Until sellers upload photos, show a tinted tile with an icon guessed from the name. Real images replace it automatically.
const ICONS = [
  [/headphone|airpods|earbuds|buds|wh-\d|xm\d/i, Headphones],
  [/\b(i?phone|galaxy|pixel|oneplus|redmi|nord)\b/i, Smartphone],
  [/laptop|macbook|notebook|rog|thinkpad/i, Laptop],
  [/watch|band|fit/i, Watch],
  [/tv|monitor|display/i, Tv],
  [/camera|gopro|lens/i, Camera],
  [/speaker|soundbar|echo|homepod/i, Speaker],
  [/console|playstation|xbox|controller|gaming/i, Gamepad2],
];
const iconFor = (name = '') => ICONS.find(([re]) => re.test(name))?.[1] ?? Package;
const hueOf = (name = '') => [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

export function ProductImage({ src, name, alt = '', className, iconClassName = 'size-1/3' }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt={alt} loading="lazy" decoding="async" onError={() => setFailed(true)} className={cn('size-full object-cover', className)} />;
  }
  const hue = hueOf(name);
  const Icon = iconFor(name);
  return (
    <div
      aria-hidden
      className={cn('grid size-full place-items-center', className)}
      style={{ background: `linear-gradient(145deg, hsl(${hue} 85% 97%), hsl(${(hue + 35) % 360} 80% 91%))` }}
    >
      <Icon className={iconClassName} style={{ color: `hsl(${hue} 50% 42%)` }} strokeWidth={1.4} />
    </div>
  );
}
