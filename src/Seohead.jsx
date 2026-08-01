// src/components/seo/SeoHead.jsx
// Usage: import SeoHead from '../seo/SeoHead'
// Then place <SeoHead title="..." description="..." /> at the top of any page component.
// Requires: npm install react-helmet-async
// And wrap your app's root in <HelmetProvider> — see main.jsx instructions below.

import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = 'Cloud Company';
const DEFAULT_DESCRIPTION =
  'Cloud Company helps businesses grow online with custom web development, app development, graphic design, social media marketing, and product design. Reliable tech since 2019.';
const SITE_URL = 'https://cloudcompany.cc';
const OG_IMAGE = 'https://cloudcompany.cc/assets/og-image.png';

const SeoHead = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogImage = OG_IMAGE,
  ogType = 'website',
  noIndex = false,
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | Cloud Company` : DEFAULT_TITLE;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const jsonLdList = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Cloud Company" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured data (Product, JobPosting, etc. — page-specific) */}
      {jsonLdList.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SeoHead;