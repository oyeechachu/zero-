type GlassSurfaceProps = {
    children: React.ReactNode;
    variant?: "regular" | "clear";
    className?: string;
    interactive?: boolean;
    radius?: number;
};

export function GlassSurface({
    children,
    variant = "regular",
    className = "",
    interactive = false,
    radius = 28,
}: GlassSurfaceProps) {
    return (
        <div
            className={[
                "glass-surface",
                variant === "clear" ? "glass-surface-clear" : "glass-surface-regular",
                interactive ? "glass-surface-interactive" : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            style={{ borderRadius: radius }}
        >
            {children}
        </div>
    );
}
