import Image from 'next/image';
import type { Article } from '@/features/landing/data/articles';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <a
      href="#jelajah"
      className="overflow-hidden rounded-2xl border border-line bg-white transition-[transform,box-shadow] hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)]"
    >
      <div className="relative h-[150px] bg-brand-700">
        {article.image && (
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(min-width: 900px) 33vw, 100vw"
            className="object-cover"
          />
        )}
        <span className="absolute top-[11px] left-[11px] rounded-full bg-white px-2.5 py-1 text-[.62rem] font-bold tracking-[.05em] text-brand-700 uppercase">
          {article.chip}
        </span>
      </div>
      <div className="px-[17px] pt-[15px] pb-[17px]">
        <span className="text-[.72rem] font-semibold text-landing-muted">
          {article.date}
        </span>
        <h4 className="my-[5px] font-serif text-[1.05rem] leading-[1.25] text-landing-ink">
          {article.title}
        </h4>
        <p className="text-[.84rem] text-landing-muted">{article.excerpt}</p>
      </div>
    </a>
  );
}
