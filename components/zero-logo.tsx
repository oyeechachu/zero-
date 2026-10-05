'use client';

export function ZeroLogo() {
    return (
        <div className="zero-logo-shell" aria-label="Zero Degree logo">
            <div className="zero-logo-surface">
                {Array.from({ length: 12 }).map((_, index) => (
                    <span
                        key={index}
                        className="logo-shard"
                        style={{
                            left: `${(index * 7) % 100}%`,
                            top: `${(index * 13) % 100}%`,
                            ['--delay' as string]: `${index * 0.08}s`,
                        }}
                    />
                ))}
            </div>
            <div className="zero-logo-wordmark">
                ZERO
                <span>DEGREE</span>
            </div>
        </div>
    );
}
