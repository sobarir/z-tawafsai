'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { ArticleCard } from '@/features/landing/components/article-card';
import {
  type Article,
  articlePool,
  initialArticles,
} from '@/features/landing/data/articles';

const PAGE_SIZE = 2;
const MAX_PAGES = Math.ceil(articlePool.length / PAGE_SIZE);

export function ArticlesFeed() {
  const t = useTranslations('landing.articles');
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = statusRef.current;
    if (!target || page >= MAX_PAGES) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoading(true);
          window.setTimeout(() => {
            setArticles((prev) => [
              ...prev,
              ...articlePool.slice(
                page * PAGE_SIZE,
                page * PAGE_SIZE + PAGE_SIZE,
              ),
            ]);
            setPage((p) => p + 1);
            setLoading(false);
          }, 600);
        }
      },
      { rootMargin: '350px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [page]);

  const allSeen = page >= MAX_PAGES;

  return (
    <section className="px-4 py-[34px] min-[600px]:px-[30px]" id="jelajah">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-1 block text-[.7rem] font-bold tracking-[.14em] text-brand-600 uppercase">
            {t('kicker')}
          </span>
          <h3 className="font-serif text-[clamp(1.5rem,2.6vw,2rem)] text-brand-900">
            {t('heading')}
          </h3>
        </div>
        <a
          href="#jelajah"
          className="text-[.86rem] font-semibold whitespace-nowrap text-brand-700 hover:text-gold"
        >
          {t('allArticles')}
        </a>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>

      <div
        ref={statusRef}
        className="py-6 text-center text-[.82rem] font-semibold text-landing-muted"
      >
        {loading && t('loadingMore')}
        {!loading && allSeen && t('allSeen')}
      </div>
    </section>
  );
}
