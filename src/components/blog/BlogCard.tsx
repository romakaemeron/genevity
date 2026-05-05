import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BlogPostCard } from "@/lib/db/queries/blog";
import { Clock } from "lucide-react";

interface Props {
  post: BlogPostCard;
  locale: string;
}

const readLabel: Record<string, string> = { ua: 'хв читання', ru: 'мин чтения', en: 'min read' };

export default function BlogCard({ post, locale }: Props) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col bg-champagne-dark rounded-[var(--radius-card)] overflow-hidden hover:bg-champagne-darker transition-colors duration-300">
      <div className="relative aspect-[16/9] bg-champagne-darker overflow-hidden">
        {post.coverImage ? (
          <Image src={post.coverImage} alt={post.title} title={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-black-20 body-s">GENEVITY</div>
        )}
        {post.categoryTitle && (
          <span className="absolute top-4 left-4 bg-main/90 text-champagne text-xs font-medium px-3 py-1 rounded-full">
            {post.categoryTitle}
          </span>
        )}
      </div>
      <div className="p-6 flex flex-col gap-3 flex-1">
        <h2 className="body-strong text-black group-hover:text-main transition-colors duration-200 line-clamp-2">{post.title}</h2>
        {post.excerpt && <p className="body-s text-black-60 leading-relaxed line-clamp-3">{post.excerpt}</p>}
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-black-10">
          {post.authorName && <span className="body-s text-main">{post.authorName}</span>}
          <span className="body-s text-black-40 ml-auto">{post.publishedAt}</span>
          <span className="body-s text-black-40 flex items-center gap-1">
            <Clock className="w-3 h-3" />{post.readTimeMinutes} {readLabel[locale] || readLabel.ua}
          </span>
        </div>
      </div>
    </Link>
  );
}
