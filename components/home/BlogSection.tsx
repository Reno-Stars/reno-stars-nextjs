import { ChevronRight } from 'lucide-react';
import { Link } from '@/navigation';
import { GOLD, SURFACE, CARD, TEXT, TEXT_MID, neu } from '@/lib/theme';

interface BlogSectionProps {
  posts: { slug: string; title: string }[];
  translations: {
    title: string;
    subtitle: string;
  };
}

export default function BlogSection({ posts, translations: t }: BlogSectionProps) {
  return (
    <section id="blog" aria-labelledby="blog-title" className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: SURFACE }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 id="blog-title" className="text-2xl font-bold mb-1" style={{ color: TEXT }}>{t.title}</h2>
          <p className="text-base" style={{ color: TEXT_MID }}>{t.subtitle}</p>
        </div>
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="rounded-xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer block hover:translate-x-1"
              style={{ boxShadow: neu(4), backgroundColor: CARD }}
            >
              <span className="text-base font-semibold" style={{ color: TEXT }}>{post.title}</span>
              <ChevronRight className="w-4 h-4 shrink-0 ml-3" style={{ color: GOLD }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
