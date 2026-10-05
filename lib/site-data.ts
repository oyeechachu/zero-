import type { MediaSource } from '@/lib/media';

export type Project = {
    slug: string;
    title: string;
    client: string;
    year: string;
    category: string;
    intro: string;
    image: string;
    videoSources?: MediaSource[];
    poster?: string;
    mobileImage?: string;
    objectPosition?: string;
    accent: string;
    color: string;
};

export const navItems = [
    { href: "/", label: "HOME" },
    { href: "/work", label: "WORK" },
    { href: "/about", label: "INFO" },
    { href: "/contact", label: "CONTACT" },
] as const;

export const projects: Project[] = [
    {
        slug: "noir-echo",
        title: "Noir Echo",
        client: "Aster House",
        year: "2025",
        category: "Fashion film",
        intro:
            "A sharp, tactile brand film for a luxury label turning raw silhouettes into a rhythm of movement, mood, and culture.",
        image:
            "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        objectPosition: "center center",
        accent: "#E00000",
        color: "#181818",
    },
    {
        slug: "afterglow-campaign",
        title: "Afterglow Campaign",
        client: "Northlight",
        year: "2024",
        category: "Advertising",
        intro:
            "A cinematic launch campaign balancing product detail, performance, and editorial storytelling across social and broadcast moments.",
        image:
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        objectPosition: "center center",
        accent: "#E00000",
        color: "#181818",
    },
    {
        slug: "studio-fall",
        title: "Studio Fall",
        client: "Morrow Studio",
        year: "2024",
        category: "Production",
        intro:
            "A tactile production story built around movement, wardrobe, and the sensation of light passing through a place before it becomes a brand.",
        image:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        objectPosition: "center top",
        accent: "#E00000",
        color: "#181818",
    },
    {
        slug: "signal-01",
        title: "Signal 01",
        client: "Method Labs",
        year: "2023",
        category: "Brand film",
        intro:
            "A precision-led visual system for a culture-driven product launch, built as an hour-long mood and pace in a 60-second edit.",
        image:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
        objectPosition: "center center",
        accent: "#E00000",
        color: "#181818",
    },
];

export function getProjectBySlug(slug: string) {
    return projects.find((project) => project.slug === slug);
}

export function getProjectIndex(slug: string) {
    return projects.findIndex((project) => project.slug === slug);
}
