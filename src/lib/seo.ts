/**
 * Centralny helper do budowy meta tagów (head) per trasa.
 * Tytuł i opis są nadpisywane w każdej child route, og:* dziedziczą się
 * tylko gdy nie ustawione — więc zawsze dostarczamy komplet.
 */
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/site";

export { SITE_URL, SITE_NAME };

type SeoMeta = Array<Record<string, string>>;
type SeoLinks = Array<Record<string, string>>;

export function buildSeo(opts: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): SeoMeta {
  const fullTitle = opts.title.endsWith(SITE_NAME) ? opts.title : `${opts.title} · ${SITE_NAME}`;
  const url = opts.path ? `${SITE_URL}${opts.path}` : SITE_URL;
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const meta: SeoMeta = [
    { title: fullTitle },
    { name: "description", content: opts.description },
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
  ];
  return meta;
}

/** Self-referencing canonical for a given route path. Use in `links` of each leaf route. */
export function jsonLd(payload: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    innerHTML: JSON.stringify(payload),
  };
}
/** CollectionPage JSON-LD — bezpieczny szablon dla list (alerty, setupy, siła itd.). */
export function collectionJsonLd(opts: { name: string; description: string; path: string }) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: `${SITE_URL}${opts.path}`,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  });
}
