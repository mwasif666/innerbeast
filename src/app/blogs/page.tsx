"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import api from "@/services/api";

type Post = { _id: string; title: string; slug: string; summary?: string; imageUrl?: string; publishedAt?: string };

const getPosts = () => api<{ success: boolean; data: Post[] }>("/articles");

export default function BlogsPage() {
  const query = useQuery({ queryKey: ["articles"], queryFn: getPosts, staleTime: 0, refetchOnWindowFocus: true });
  const posts = query.data?.data || [];
  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full"><MenuOne props="bg-transparent" /><Breadcrumb heading="Blogs" subHeading="Blogs" /></div>
      <main className="py-16 bg-white"><div className="container"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => <Link key={post._id} href={`/blogs/${post.slug}`} className="rounded-3xl border border-line overflow-hidden bg-white"><div className="aspect-[16/10] bg-[#f7f7f7]" style={post.imageUrl ? { backgroundImage: `url(${post.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}} /><div className="p-6"><div className="caption1 text-secondary">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Inner Beast"}</div><h2 className="heading5 mt-2">{post.title}</h2><p className="body1 text-secondary mt-3">{post.summary}</p></div></Link>)}
      </div>{query.isLoading && <div className="text-center text-secondary py-20">Loading blogs...</div>}{!query.isLoading && posts.length === 0 && <div className="text-center text-secondary py-20">No blogs published yet.</div>}</div></main>
      <Footer />
    </>
  );
}
