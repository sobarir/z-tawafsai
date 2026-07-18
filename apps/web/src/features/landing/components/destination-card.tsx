import Image from 'next/image';
import type { Destination } from '@/features/landing/data/destinations';
import { cn } from '@/libs/utils';

export function DestinationCard({
  destination,
  className,
  minHeightClassName = 'min-h-[210px]',
}: {
  destination: Destination;
  className?: string;
  minHeightClassName?: string;
}) {
  return (
    <a
      href="#jelajah"
      className={cn(
        'group relative isolate flex items-end overflow-hidden rounded-2xl p-[18px] text-white',
        minHeightClassName,
        className,
      )}
    >
      {destination.image ? (
        <Image
          src={destination.image}
          alt=""
          fill
          sizes="(min-width: 900px) 400px, 100vw"
          style={
            destination.imagePosition
              ? { objectPosition: destination.imagePosition }
              : undefined
          }
          className="-z-20 object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-20 transition-transform duration-500 group-hover:scale-[1.06]"
          style={{ background: destination.gradient }}
        />
      )}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(38,43,29,.9)] to-[rgba(38,43,29,.08)] to-70%"
      />
      <div>
        <span className="text-[.66rem] font-bold tracking-[.1em] text-gold-soft uppercase">
          {destination.location}
        </span>
        <h4 className="my-0.5 font-serif text-[1.25rem] text-white">
          {destination.name}
        </h4>
        <p className="text-[.82rem] text-white/85">{destination.description}</p>
      </div>
    </a>
  );
}
