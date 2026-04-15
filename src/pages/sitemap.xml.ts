import type { APIRoute } from 'astro'

const sitemapIndexURL = new URL('sitemap-index.xml', import.meta.env.SITE).href

const sitemapAliasXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${sitemapIndexURL}</loc>
  </sitemap>
</sitemapindex>
`

export const GET: APIRoute = () =>
  new Response(sitemapAliasXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  })
