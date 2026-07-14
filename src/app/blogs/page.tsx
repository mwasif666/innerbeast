"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import * as Icon from "@phosphor-icons/react/dist/ssr";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import api from "@/services/api";

type Post = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  imageUrl?: string;
  authorName?: string;
  publishedAt?: string;
};

const getPosts = () => api<{ success: boolean; data: Post[] }>("/articles");

const formatDate = (date?: string) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const BlogCard = ({ post, featured }: { post: Post; featured?: boolean }) => (
  <Link
    href={`/blogs/${post.slug}`}
    className={`group flex flex-col rounded-3xl border border-line overflow-hidden bg-white hover:shadow-xl duration-300 ${
      featured ? "sm:col-span-2 lg:col-span-3 sm:flex-row" : ""
    }`}
  >
    <div
      className={`relative overflow-hidden bg-[#f4f4f4] ${
        featured ? "sm:w-1/2 aspect-[16/10]" : "aspect-[16/11]"
      }`}
    >
      {post.imageUrl ? (
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 duration-500"
          style={{ backgroundImage: `url(${post.imageUrl})` }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-secondary">
          <Icon.ImageSquare size={40} />
        </div>
      )}
    </div>

    <div className={`flex flex-col p-6 ${featured ? "sm:w-1/2 sm:justify-center sm:p-10" : ""}`}>
      <div className="flex items-center gap-3 caption1 text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <Icon.CalendarBlank size={15} className="text-[#e57112]" />
          {formatDate(post.publishedAt) || "Inner Beast"}
        </span>
        {post.authorName && (
          <>
            <span className="w-1 h-1 rounded-full bg-line" />
            <span>{post.authorName}</span>
          </>
        )}
      </div>

      <h2 className={`mt-3 group-hover:text-[#e57112] duration-300 ${featured ? "heading4" : "heading6"}`}>
        {post.title}
      </h2>

      {post.summary && (
        <p className={`body1 text-secondary mt-3 ${featured ? "" : "line-clamp-3"}`}>
          {post.summary}
        </p>
      )}

      <span className="inline-flex items-center gap-2 mt-5 text-button text-[#e57112]">
        Read more
        <Icon.ArrowRight size={16} className="group-hover:translate-x-1 duration-300" />
      </span>
    </div>
  </Link>
);

export default function BlogsPage() {
  const query = useQuery({
    queryKey: ["articles"],
    queryFn: getPosts,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const posts = query.data?.data || [];
  const [featured, ...rest] = posts;

  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full">
        <MenuOne props="bg-transparent" />
        <Breadcrumb heading="Blogs" subHeading="Blogs" />
      </div>

      <main className="py-16 md:py-20 bg-white">
        <div className="container">
          {query.isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-line overflow-hidden">
                  <div className="aspect-[16/11] bg-[#f4f4f4] animate-pulse" />
                  <div className="p-6">
                    <div className="h-3 w-24 bg-[#f4f4f4] rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-[#f4f4f4] rounded mt-4 animate-pulse" />
                    <div className="h-3 w-full bg-[#f4f4f4] rounded mt-4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!query.isLoading && posts.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured && <BlogCard post={featured} featured />}
              {rest.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {!query.isLoading && posts.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-24">
              <div className="w-20 h-20 rounded-full bg-[#e57112]/10 flex items-center justify-center text-[#e57112]">
                <Icon.Article size={38} />
              </div>
              <div className="heading5 mt-6">No blogs published yet</div>
              <p className="body1 text-secondary mt-2 max-w-md">
                We&apos;re working on fresh stories. Check back soon for the latest from Inner Beast.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
