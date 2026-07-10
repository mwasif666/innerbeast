import TopNavOne from "@/components/Header/TopNav/TopNavOne";
import MenuOne from "@/components/Header/Menu/MenuOne";
import Breadcrumb from "@/components/Breadcrumb/Breadcrumb";
import Footer from "@/components/Footer/Footer";
import { getApiUrl } from "@/config/site";

type Post = { title: string; body: string; summary?: string; imageUrl?: string; authorName?: string; publishedAt?: string };

const getPost = async (slug: string): Promise<Post | null> => {
  try {
    const response = await fetch(`${getApiUrl()}/articles/${slug}`, { cache: "no-store" });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data || null;
  } catch { return null; }
};

export default async function Page({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  return <><TopNavOne props="style-one bg-black" slogan="New customers save 10% with the code GET10" /><div id="header" className="relative w-full"><MenuOne props="bg-transparent" /><Breadcrumb heading={post?.title || "Blog"} subHeading="Blog" /></div><main className="py-16 bg-white"><div className="container max-w-4xl">{!post ? <div className="text-center text-secondary py-20">Blog not found.</div> : <article>{post.imageUrl && <div className="rounded-3xl aspect-[16/8] bg-cover bg-center mb-8" style={{ backgroundImage: `url(${post.imageUrl})` }} />}<div className="caption1 text-secondary">{post.authorName || "Inner Beast"}</div><h1 className="heading2 mt-3">{post.title}</h1>{post.summary && <p className="body1 text-secondary mt-4">{post.summary}</p>}<div className="body1 mt-8 leading-8 blog-content" dangerouslySetInnerHTML={{ __html: post.body }} /></article>}</div></main><Footer /></>;
}
