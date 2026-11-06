import Image from 'next/image';
import type { Img } from '@/content/types';

type Props = {
  img: Img;
  sizes: string;
  priority?: boolean;
  quality?: 75 | 85;
};

/* Parent must be position: relative with a size / aspect-ratio. */
export default function Photo({ img, sizes, priority, quality }: Props) {
  return (
    <Image
      src={img.src}
      alt={img.alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={quality}
      className="object-cover"
      style={{ objectPosition: `${img.focalX}% ${img.focalY}%` }}
    />
  );
}
