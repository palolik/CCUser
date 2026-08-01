import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navber from "../navBer/navber";
import Footer from "../footer/footer";
import SeoHead from "../../Seohead";
import { base_url } from "../../config/config";
import BlogJsxRenderer from "./BlogJsxRenderer";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    fetch(`${base_url}/blogdetails/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success === false) {
          setNotFound(true);
        } else {
          setBlog(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching blog:", error);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <SeoHead title="Article Not Found" noIndex />
        <Navber />
        <div className="flex-1 flex items-center justify-center text-gray-400 font-light">
          Article not found.
        </div>
        <Footer />
      </div>
    );
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.shortDescription,
    image: blog.coverImage ? [blog.coverImage] : undefined,
    author: { "@type": "Organization", name: blog.author || "Cloud Company" },
    publisher: { "@type": "Organization", name: "Cloud Company" },
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SeoHead
        title={blog.title}
        description={blog.shortDescription}
        canonical={`/blog/${blog.slug}`}
        ogImage={blog.coverImage}
        ogType="article"
        jsonLd={articleJsonLd}
      />
      <Navber />

      <section className="px-6 py-16"
        style={{ background: "linear-gradient(150deg,#050d1f 0%,#0d1b3e 55%,#091528 100%)" }}>
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate("/blog")}
            className="inline-flex items-center gap-2 text-blue-300/80 hover:text-blue-300 text-sm font-light mb-8 transition-colors">
            ← Back to Blog
          </button>

          <h1 className="font-serif text-3xl md:text-5xl font-semibold text-blue-50 leading-tight mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}>
            {blog.title}
          </h1>

          <p className="text-blue-200/80 text-base font-light leading-relaxed mb-5 max-w-2xl">
            {blog.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-blue-300/70">
            <span>{blog.author || "Cloud Company"}</span>
            <span>•</span>
            <span>{formatDate(blog.createdAt)}</span>
            <span>•</span>
            <span>{blog.views || 0} views</span>
          </div>

          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {blog.tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-500/10 border border-blue-500/25 text-blue-300 px-3 py-1 rounded-full capitalize">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex-1">
        <BlogJsxRenderer blog={blog} />
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetail;
