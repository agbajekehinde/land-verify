import { NextApiRequest, NextApiResponse } from "next";

const SITE_URL = "https://landverify.ng"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const staticPages = [
    "/",
    "/about",
    "/services",
    "/contact",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages
    .map(
      (url) => `
  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join("")}
</urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.send(sitemap);
}
