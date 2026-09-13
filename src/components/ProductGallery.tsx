import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export default function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const hasImages = images.length > 0

  return (
    <div>
      <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-ink/5">
        {hasImages ? (
          <img src={images[active]} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <ImageOff size={40} className="text-stone/40" />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={'h-16 w-16 overflow-hidden rounded-md border-2 ' + (i === active ? 'border-ink' : 'border-transparent opacity-70')}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
