/* eslint-env node */
// Post-build SEO / AEO / GEO generator. Runs automatically after `npm run build`.
//
// The site is a client-rendered React app, so crawlers that don't run JavaScript
// (GPTBot, ClaudeBot, PerplexityBot, most link previews) used to see an empty page.
// This script pulls live content from the API and writes, into dist/:
//
//   • <route>.html for every public page, package and blog post: correct <title>,
//     meta description, canonical, Open Graph, JSON-LD, and the page's real text inside
//     #root. React replaces that text on load, so visitors see the normal app.
//   • sitemap.xml — every public URL on cloudcompany.cc.
//   • llms.txt    — plain-language summary of the company for AI assistants.
//
// .htaccess serves /some/path from some/path.html when that file exists.
// API base: SEO_API_URL env var, default https://api.cloudcompany.cc. If the API is
// unreachable the build still succeeds with static pages only.

import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve(process.env.SEO_DIST_DIR || "dist");
const SITE = "https://cloudcompany.cc";
const API = (process.env.SEO_API_URL || "https://api.cloudcompany.cc").replace(/\/+$/, "");
const DEFAULT_OG = `${SITE}/assets/og-image.png`;

const CONTACT = {
  email: "support@cloudcompany.cc",
  phone: "+8801841911105",
  phoneDisplay: "+880 1841-911105",
  city: "Dhaka",
  country: "Bangladesh",
};

const DEFAULT_DESCRIPTION =
  "Cloud Company helps businesses grow online with custom web development, app development, graphic design, social media marketing, and product design. Reliable tech since 2019.";

// ── helpers ──────────────────────────────────────────────────────────────────

const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const decodeEntities = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

// HTML → plain text, keeping block boundaries as line breaks.
const htmlToText = (html = "") =>
  decodeEntities(
    String(html)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
      .replace(/<\/(p|h[1-6]|li|div)>|<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);

const plain = (html) => htmlToText(html).join(" ");

const truncate = (s = "", n = 160) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const taka = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? `৳${n.toLocaleString("en-US")}` : null;
};

const ymd = (d) => {
  const t = d ? new Date(d) : new Date();
  return Number.isNaN(t.getTime()) ? new Date().toISOString().slice(0, 10) : t.toISOString().slice(0, 10);
};

const packagePath = (pkg) => `/packdetails/${pkg.slug || pkg._id}`;

// Old uploads were saved with http:// API URLs; the API also serves them over https.
const secure = (u) =>
  typeof u === "string" ? u.replace(/^http:\/\/api\.cloudcompany\.cc/i, "https://api.cloudcompany.cc") : u;

async function getText(p) {
  try {
    const res = await fetch(`${API}${p}`, { signal: AbortSignal.timeout(15000) });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

// Blog posts are JSX files rendered in an iframe, which crawlers index poorly. Turn the
// static markup inside the component's return (...) into plain, safe HTML for the static page.
const ARTICLE_TAGS = new Set(["h2", "h3", "h4", "p", "ul", "ol", "li", "table", "thead", "tbody", "tr", "th", "td", "a", "strong", "em", "blockquote", "br"]);
const jsxToHtml = (code) => {
  if (!code) return "";
  const start = code.indexOf("return (");
  const end = code.lastIndexOf(");");
  if (start === -1 || end <= start) return "";
  let m = code.slice(start + "return (".length, end);
  m = m
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/\{\s*["'`]\s*["'`]\s*\}/g, " ")
    .replace(/\{\s*["'`]([^"'`{}]*)["'`]\s*\}/g, "$1")
    .replace(/\{[^{}]*\}/g, "");
  m = m.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g, (tag, name, attrs) => {
    const n = name.toLowerCase();
    if (!ARTICLE_TAGS.has(n)) return " ";
    if (tag.startsWith("</")) return `</${n}>`;
    if (n === "a") {
      const href = (attrs.match(/href="(https?:\/\/[^"]+)"/) || [])[1];
      return href ? `<a href="${esc(href)}">` : "<a>";
    }
    return `<${n}>`;
  });
  return m.replace(/\s+/g, " ").replace(/> </g, "><").trim();
};

// Q&A pairs (<h3>question</h3><p>answer</p>) from an article's "Frequently asked questions" section.
const articleFaqs = (html = "") => {
  const section = html.split(/<h2>\s*Frequently asked questions\s*<\/h2>/i)[1];
  if (!section) return [];
  const body = section.split(/<h2>/i)[0];
  const strip = (x) => decodeEntities(x.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  return [...body.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)]
    .map((m) => ({ q: strip(m[1]), a: strip(m[2]) }))
    .filter((f) => f.q && f.a);
};

async function getJson(p) {
  try {
    const res = await fetch(`${API}${p}`, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[seo] ${p} unavailable (${err.message}) — continuing without it`);
    return null;
  }
}

// ── data ─────────────────────────────────────────────────────────────────────

const [secondary, critical, blogsRaw, portfolioRaw] = await Promise.all([
  getJson("/home/secondary"),
  getJson("/home/critical"),
  getJson("/publicblogs"),
  getJson("/getportfolio"),
]);

const packages = (secondary?.packages || []).filter((p) => p.status === "approved" && p.packageName);
const services = (secondary?.services || []).filter((s) => s.serviceTitle);
const faqs = (secondary?.faqs || [])
  .map((f) => ({ q: plain(f.faqquestion), a: plain(f.faqanswer) }))
  .filter((f) => f.q && f.a);
const blogs = (Array.isArray(blogsRaw) ? blogsRaw : blogsRaw?.blogs || [])
  .filter((b) => b.slug && b.title && (!b.status || b.status === "published"))
  .map((b) => ({ ...b, coverImage: secure(b.coverImage) }));
const articleHtml = Object.fromEntries(
  await Promise.all(
    blogs.map(async (b) => [b.slug, b.jsxFile ? jsxToHtml(await getText(`/blogjsx/${b.slug}`)) : ""])
  )
);
const portfolio = (Array.isArray(portfolioRaw) ? portfolioRaw : portfolioRaw?.data || []).filter(
  (p) => p.status === "visible"
);
const sameAs = (critical?.social || [])
  .map((s) => s.link)
  .filter((l) => /^https?:\/\//.test(l || "") && !/wa\.me|whatsapp/i.test(l));

const categories = [...new Set(packages.map((p) => p.category || "Other"))];

// ── page shell ───────────────────────────────────────────────────────────────

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) {
  throw new Error('[seo] dist/index.html has no empty <div id="root"></div>');
}

const nav = `<header><nav aria-label="Main">
<a href="/"><strong>Cloud Company</strong></a> ·
<a href="/buypackage">Packages</a> ·
<a href="/portfolio">Portfolio</a> ·
<a href="/blog">Blog</a> ·
<a href="/aboutus">About us</a> ·
<a href="/ourteam">Team</a> ·
<a href="/career">Careers</a>
</nav></header>`;

const footer = `<footer>
<h2>Contact Cloud Company</h2>
<p>Cloud Company is a software development and digital agency based in ${CONTACT.city}, ${CONTACT.country}, working with clients worldwide since 2019.</p>
<ul>
<li>Email: <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
<li>WhatsApp: <a href="https://wa.me/${CONTACT.phone.replace("+", "")}">${CONTACT.phoneDisplay}</a></li>
${sameAs.map((l) => `<li><a href="${esc(l)}" rel="me">${esc(l.replace(/^https?:\/\/(www\.)?/, ""))}</a></li>`).join("\n")}
</ul>
<p><a href="/privacypolicy">Privacy policy</a> · <a href="/termsandcondition">Terms and conditions</a></p>
</footer>`;

// Covers the static text until React mounts (React replaces everything inside #root).
// Without JavaScript the cover is hidden and the text is shown.
const bootCover = `<div data-boot-cover style="position:fixed;inset:0;z-index:9999;background:#fff;display:flex;align-items:center;justify-content:center"><img src="/assets/febicon.svg" width="56" height="56" alt="" style="animation:ccboot 0.9s ease-in-out infinite alternate"></div><style>@keyframes ccboot{from{opacity:.35}to{opacity:1}}</style><noscript><style>[data-boot-cover]{display:none!important}</style></noscript>`;

const prerenderStyle = `<style>#prerender{max-width:960px;margin:0 auto;padding:24px 16px;font-family:Poppins,system-ui,sans-serif;color:#0f172a;line-height:1.6}#prerender a{color:#1d4ed8}#prerender h1{font-size:2rem;line-height:1.2}#prerender section{margin:2rem 0}</style>`;

const PAGE_TAGS = [
  /<title>[\s\S]*?<\/title>\s*/i,
  /<meta\s+name="(title|description|keywords|robots)"[^>]*>\s*/gi,
  /<link\s+rel="canonical"[^>]*>\s*/gi,
  /<meta\s+property="og:[^"]*"[^>]*>\s*/gi,
  /<meta\s+name="twitter:[^"]*"[^>]*>\s*/gi,
];

const written = [];

function writePage({ route, title, description, ogImage = DEFAULT_OG, ogType = "website", jsonLd = [], body }) {
  const fullTitle = title ? `${title} | Cloud Company` : "Cloud Company";
  const url = route === "/" ? `${SITE}/` : `${SITE}${route}`;
  const desc = truncate(description || DEFAULT_DESCRIPTION, 300);

  // data-prerender tags are removed in main.jsx before React mounts; react-helmet-async
  // then writes the same tags, so the rendered page never has duplicates.
  const head = [
    `<title>${esc(fullTitle)}</title>`,
    `<meta data-prerender name="description" content="${esc(desc)}" />`,
    `<meta data-prerender name="robots" content="index, follow, max-image-preview:large" />`,
    `<link data-prerender rel="canonical" href="${esc(url)}" />`,
    `<meta data-prerender property="og:type" content="${esc(ogType)}" />`,
    `<meta data-prerender property="og:url" content="${esc(url)}" />`,
    `<meta data-prerender property="og:title" content="${esc(fullTitle)}" />`,
    `<meta data-prerender property="og:description" content="${esc(desc)}" />`,
    `<meta data-prerender property="og:image" content="${esc(ogImage)}" />`,
    `<meta data-prerender property="og:site_name" content="Cloud Company" />`,
    `<meta data-prerender property="og:locale" content="en_US" />`,
    `<meta data-prerender name="twitter:card" content="summary_large_image" />`,
    `<meta data-prerender name="twitter:title" content="${esc(fullTitle)}" />`,
    `<meta data-prerender name="twitter:description" content="${esc(desc)}" />`,
    `<meta data-prerender name="twitter:image" content="${esc(ogImage)}" />`,
    ...jsonLd.map(
      (s) =>
        `<script data-prerender type="application/ld+json">${JSON.stringify(s).replace(/</g, "\\u003c")}</script>`
    ),
  ].join("\n    ");

  let html = template;
  for (const re of PAGE_TAGS) html = html.replace(re, "");
  html = html.replace("</head>", `    ${head}\n  </head>`);
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${bootCover}${prerenderStyle}<div id="prerender">${nav}<main>${body}</main>${footer}</div></div>`
  );

  const file = route === "/" ? "index.html" : `${route.replace(/^\//, "")}.html`;
  const out = path.join(DIST, file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  written.push(route);
}

// ── structured data ──────────────────────────────────────────────────────────

const breadcrumb = (...items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", url: SITE }, ...items].map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    item: it.url,
  })),
});

const faqPage = (list) =>
  list.length
    ? [
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: list.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
      ]
    : [];

const packageSummary = (p) =>
  p.metaDescription || truncate(plain(p.packageDetails), 200) || `${p.packageName} by Cloud Company.`;

const packageLi = (p) => {
  const price = taka(p.packagePrice);
  const days = p.deliveryTime ? `${p.deliveryTime} days delivery` : "";
  const meta = [price, days].filter(Boolean).join(" · ");
  return `<li><a href="${esc(packagePath(p))}">${esc(p.packageName)}</a>${meta ? ` — ${esc(meta)}` : ""}<br>${esc(packageSummary(p))}</li>`;
};

const packagesByCategory = () =>
  categories
    .map(
      (c) =>
        `<h3>${esc(c)}</h3><ul>${packages
          .filter((p) => (p.category || "Other") === c)
          .map(packageLi)
          .join("")}</ul>`
    )
    .join("");

const faqHtml = (list) =>
  list.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("");

// ── pages ────────────────────────────────────────────────────────────────────

// Home
writePage({
  route: "/",
  title: "Web, App, Design & Digital Marketing Agency in Bangladesh",
  description: DEFAULT_DESCRIPTION,
  jsonLd: faqPage(faqs),
  body: `
<h1>Cloud Company — web development, app development, design and digital marketing</h1>
<p>${esc(DEFAULT_DESCRIPTION)} We are based in ${CONTACT.city}, ${CONTACT.country}, and work with businesses worldwide.</p>
${services.length ? `<section><h2>Our services</h2>${services
    .map((s) => `<h3>${esc(s.serviceTitle)}</h3><p>${esc(plain(s.serviceDescription))}</p>`)
    .join("")}</section>` : ""}
${packages.length ? `<section><h2>Packages and pricing</h2><p>Fixed-price packages, priced in Bangladeshi taka (BDT). <a href="/buypackage">See all packages</a>.</p>${packagesByCategory()}</section>` : ""}
${faqs.length ? `<section><h2>Frequently asked questions</h2>${faqHtml(faqs)}</section>` : ""}`,
});

// Package list
writePage({
  route: "/buypackage",
  title: "Buy a Package",
  description:
    "Browse and purchase Cloud Company's web development, app development, and design packages.",
  jsonLd: [
    breadcrumb({ name: "Packages", url: `${SITE}/buypackage` }),
    ...(packages.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Cloud Company packages",
            itemListElement: packages.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE}${packagePath(p)}`,
              name: p.packageName,
            })),
          },
        ]
      : []),
  ],
  body: `<h1>Packages and pricing</h1>
<p>Fixed-price web, app, design and marketing packages from Cloud Company. Prices are in Bangladeshi taka (BDT).</p>
${packagesByCategory()}`,
});

// Package details
for (const p of packages) {
  const route = packagePath(p);
  const url = `${SITE}${route}`;
  const description = packageSummary(p);
  const price = taka(p.packagePrice);
  const express = taka(p.expressDeliveryPrice);
  const contents = String(p.packageContents || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const pkgFaqs = (p.faqs || []).filter((f) => f?.q && f?.a).map((f) => ({ q: f.q, a: f.a }));
  const details = htmlToText(p.packageDetails);

  writePage({
    route,
    title: p.metaTitle || p.packageName,
    description,
    ogImage: secure(p.packageCover) || DEFAULT_OG,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: p.packageName,
        description,
        serviceType: p.category,
        url,
        ...(p.packageCover && { image: secure(p.packageCover) }),
        areaServed: { "@type": "Country", name: "Bangladesh" },
        provider: { "@type": "Organization", name: "Cloud Company", url: SITE },
        offers: {
          "@type": "Offer",
          price: String(Number(p.packagePrice) || 0),
          priceCurrency: "BDT",
          availability: "https://schema.org/InStock",
          url,
        },
      },
      breadcrumb({ name: "Packages", url: `${SITE}/buypackage` }, { name: p.packageName, url }),
      ...faqPage(pkgFaqs),
    ],
    body: `<p><a href="/buypackage">Packages</a> › ${esc(p.category || "")}</p>
<h1>${esc(p.packageName)}</h1>
<p>${esc(description)}</p>
<ul>
${price ? `<li>Price: ${esc(price)} (BDT)</li>` : ""}
${p.deliveryTime ? `<li>Delivery: ${esc(p.deliveryTime)} days</li>` : ""}
${express && p.expressDeliveryTime ? `<li>Express delivery: ${esc(p.expressDeliveryTime)} days for ${esc(express)} extra</li>` : ""}
</ul>
${contents.length ? `<section><h2>What's included</h2><ul>${contents.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></section>` : ""}
${details.length ? `<section><h2>Details</h2>${details.map((d) => `<p>${esc(d)}</p>`).join("")}</section>` : ""}
${pkgFaqs.length ? `<section><h2>Questions about ${esc(p.packageName)}</h2>${faqHtml(pkgFaqs)}</section>` : ""}
<p><a href="${esc(route)}">Order ${esc(p.packageName)}</a></p>`,
  });
}

// Blog
writePage({
  route: "/blog",
  title: "Blog",
  description:
    "Read Cloud Company's latest articles, guides, and insights on web development, app development, design, and digital marketing.",
  jsonLd: [breadcrumb({ name: "Blog", url: `${SITE}/blog` })],
  body: `<h1>Cloud Company blog</h1>
<p>Articles, guides and insights on web development, app development, design and digital marketing.</p>
<ul>${blogs
    .map(
      (b) =>
        `<li><a href="/blog/${esc(b.slug)}">${esc(b.title)}</a> — ${esc(ymd(b.createdAt))}<br>${esc(b.shortDescription || "")}</li>`
    )
    .join("")}</ul>`,
});

for (const b of blogs) {
  const url = `${SITE}/blog/${b.slug}`;
  writePage({
    route: `/blog/${b.slug}`,
    title: b.title,
    description: b.shortDescription,
    ogImage: b.coverImage || DEFAULT_OG,
    ogType: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: b.title,
        description: b.shortDescription,
        ...(b.coverImage && { image: [b.coverImage] }),
        author: { "@type": "Organization", name: b.author || "Cloud Company" },
        publisher: {
          "@type": "Organization",
          name: "Cloud Company",
          logo: { "@type": "ImageObject", url: `${SITE}/assets/logo.png` },
        },
        datePublished: b.createdAt,
        dateModified: b.updatedAt || b.createdAt,
        mainEntityOfPage: url,
        ...(Array.isArray(b.tags) && b.tags.length && { keywords: b.tags.join(", ") }),
      },
      breadcrumb({ name: "Blog", url: `${SITE}/blog` }, { name: b.title, url }),
      ...faqPage(articleFaqs(articleHtml[b.slug])),
    ],
    body: `<p><a href="/blog">Blog</a></p>
<article>
<h1>${esc(b.title)}</h1>
<p>By ${esc(b.author || "Cloud Company")} · ${esc(ymd(b.createdAt))}</p>
<p>${esc(b.shortDescription || "")}</p>
${Array.isArray(b.tags) && b.tags.length ? `<p>Topics: ${b.tags.map(esc).join(", ")}</p>` : ""}
${articleHtml[b.slug] || ""}
</article>`,
  });
}

// Simple pages
const simplePages = [
  {
    route: "/aboutus",
    title: "About Us",
    description:
      "Learn about Cloud Company — a leading software development firm delivering custom web, app, and digital solutions since 2019.",
    body: `<h1>About Cloud Company</h1>
<p>Cloud Company is a full-service software and digital agency founded in 2019 in ${CONTACT.city}, ${CONTACT.country}. We build custom websites, mobile apps, graphic design and brand identities, and run social media marketing for businesses in Bangladesh and abroad.</p>
<p>We work on fixed-price packages with clear timelines, and stay on as a long-term technology partner after launch.</p>`,
  },
  {
    route: "/ourteam",
    title: "Our Team",
    description:
      "Meet the people behind Cloud Company — the leadership, developers, designers, and marketers building software and digital solutions since 2019.",
    body: `<h1>The Cloud Company team</h1><p>Leadership, developers, designers and marketers building software and digital solutions since 2019.</p>`,
  },
  {
    route: "/career",
    title: "Careers",
    description:
      "Join Cloud Company — explore open roles in web development, design, and digital marketing, or join our talent pool.",
    body: `<h1>Careers at Cloud Company</h1><p>Explore open roles in web development, design and digital marketing, or join our talent pool.</p>`,
  },
  {
    route: "/portfolio",
    title: "Portfolio",
    description:
      "Explore Cloud Company's portfolio of web development, app development, graphic design, and digital marketing projects.",
    body: `<h1>Cloud Company portfolio</h1><p>Web development, app development, graphic design and digital marketing projects.</p>
<ul>${portfolio
      .map((p) => `<li><a href="/portfolio/${esc(p._id)}">${esc(p.title || p.name || "Project")}</a></li>`)
      .join("")}</ul>`,
  },
  {
    route: "/privacypolicy",
    title: "Privacy Policy",
    description: "Learn how Cloud Company collects, uses, and protects your personal information.",
    body: `<h1>Privacy policy</h1><p>How Cloud Company collects, uses and protects your personal information.</p>`,
  },
  {
    route: "/termsandcondition",
    title: "Terms and Conditions",
    description: "Read Cloud Company's terms and conditions for using our website and services.",
    body: `<h1>Terms and conditions</h1><p>The terms for using the Cloud Company website and services.</p>`,
  },
];
for (const p of simplePages) {
  writePage({ ...p, jsonLd: [breadcrumb({ name: p.title, url: `${SITE}${p.route}` })] });
}

// ── sitemap.xml ──────────────────────────────────────────────────────────────

const today = ymd();
const sitemapEntries = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/buypackage", priority: "0.9", changefreq: "weekly" },
  { loc: "/aboutus", priority: "0.8", changefreq: "monthly" },
  { loc: "/portfolio", priority: "0.8", changefreq: "weekly" },
  { loc: "/blog", priority: "0.7", changefreq: "weekly" },
  { loc: "/ourteam", priority: "0.6", changefreq: "monthly" },
  { loc: "/career", priority: "0.6", changefreq: "weekly" },
  { loc: "/privacypolicy", priority: "0.3", changefreq: "yearly" },
  { loc: "/termsandcondition", priority: "0.3", changefreq: "yearly" },
  ...packages.map((p) => ({ loc: packagePath(p), priority: "0.8", changefreq: "weekly", lastmod: p.updatedAt || p.createdAt })),
  ...blogs.map((b) => ({ loc: `/blog/${b.slug}`, priority: "0.6", changefreq: "monthly", lastmod: b.updatedAt || b.createdAt })),
  ...portfolio.map((p) => ({ loc: `/portfolio/${p._id}`, priority: "0.5", changefreq: "monthly", lastmod: p.updatedAt })),
];

fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries
    .map(
      (e) => `  <url>
    <loc>${esc(SITE + (e.loc === "/" ? "/" : e.loc))}</loc>
    <lastmod>${e.lastmod ? ymd(e.lastmod) : today}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n")}
</urlset>
`
);

// ── llms.txt ─────────────────────────────────────────────────────────────────

const md = (s) => String(s || "").replace(/\s+/g, " ").trim();
const llms = `# Cloud Company

> Cloud Company is a software development and digital agency based in ${CONTACT.city}, ${CONTACT.country}, founded in 2019. It builds custom websites and web apps, mobile apps, graphic design and brand identity, and runs social media marketing for businesses in Bangladesh and worldwide. Work is sold as fixed-price packages priced in Bangladeshi taka (BDT).

- Website: ${SITE}
- Email: ${CONTACT.email}
- WhatsApp: ${CONTACT.phoneDisplay}
${sameAs.map((l) => `- ${l}`).join("\n")}

${services.length ? `## Services

${services.map((s) => `- **${md(s.serviceTitle)}**: ${md(truncate(plain(s.serviceDescription), 220))}`).join("\n")}
` : ""}
${packages.length ? `## Packages and prices

${categories
    .map(
      (c) => `### ${c}

${packages
        .filter((p) => (p.category || "Other") === c)
        .map((p) => {
          const bits = [taka(p.packagePrice), p.deliveryTime && `${p.deliveryTime} days`].filter(Boolean).join(", ");
          return `- [${md(p.packageName)}](${SITE}${packagePath(p)})${bits ? ` (${bits})` : ""}: ${md(packageSummary(p))}`;
        })
        .join("\n")}`
    )
    .join("\n\n")}
` : ""}
${faqs.length ? `## Frequently asked questions

${faqs.map((f) => `- **${md(f.q)}** ${md(f.a)}`).join("\n")}
` : ""}
${blogs.length ? `## Articles

${blogs.map((b) => `- [${md(b.title)}](${SITE}/blog/${b.slug}): ${md(b.shortDescription)}`).join("\n")}
` : ""}
## Key pages

- [All packages](${SITE}/buypackage)
- [About us](${SITE}/aboutus)
- [Portfolio](${SITE}/portfolio)
- [Blog](${SITE}/blog)
- [Careers](${SITE}/career)
`;
fs.writeFileSync(path.join(DIST, "llms.txt"), llms.replace(/\n{3,}/g, "\n\n"));

console.log(
  `[seo] wrote ${written.length} pages (${packages.length} packages, ${blogs.length} blog posts), sitemap.xml (${sitemapEntries.length} URLs), llms.txt`
);
