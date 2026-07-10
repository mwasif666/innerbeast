import Link from "next/link";
import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { getApiUrl } from "@/config/site";

type Post = { _id: string; title: string; slug: string; summary?: string; imageUrl?: string; publishedAt?: string };

const getPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${getApiUrl()}/articles`, { cache: "no-store" });
    if (!response.ok) return [];
    const json = await response.json();
    return json.data || [];
  } catch {
    return [];
  }
};

export default async function BlogsPage() {
  const posts = await getPosts();
  return (
    <>
      <TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" />
      <div id="header" className="relative w-full"><MenuOne props="bg-transparent" /><Breadcrumb heading="Blogs" subHeading="Blogs" /></div>
      <main className="py-16 bg-white"><div className="container"><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => <Link key={post._id} href={`/blogs/${post.slug}`} className="rounded-3xl border border-line overflow-hidden bg-white"><div className="aspect-[16/10] bg-[#f7f7f7]" style={post.imageUrl ? { backgroundImage: `url(${post.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}} /><div className="p-6"><div className="caption1 text-secondary">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Inner Beast"}</div><h2 className="heading5 mt-2">{post.title}</h2><p className="body1 text-secondary mt-3">{post.summary}</p></div></Link>)}
      </div>{posts.length === 0 && <div className="text-center text-secondary py-20">No blogs published yet.</div>}</div></main>
      <Footer />
    </>
  );
}
