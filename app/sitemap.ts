import type { MetadataRoute } from 'next';
import { projects } from '@/lib/site-data';
import { siteOrigin } from '@/lib/site-meta';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = ['', '/work', '/about', '/services', '/contact'].map((path) => ({
    url: new URL(path, siteOrigin).toString(),
    lastModified,
    changeFrequency: path === '' ? 'monthly' as const : 'yearly' as const,
    priority: path === '' ? 1 : 0.7,
  }));
  const projectRoutes = projects.map((project) => ({
    url: new URL(`/work/${project.slug}`, siteOrigin).toString(),
    lastModified,
    changeFrequency: 'yearly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
