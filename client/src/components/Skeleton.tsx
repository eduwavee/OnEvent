/** Bloques de carga con shimmer, para reemplazar los "Cargando..." de texto plano. */
export function SkeletonCard() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton-line skeleton-line-title" />
      <div className="skeleton-line skeleton-line-meta" />
      <div className="skeleton-line skeleton-line-body" />
      <div className="skeleton-line skeleton-line-tag" />
    </div>
  );
}

export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      <td colSpan={99}>
        <div className="skeleton-line skeleton-line-row" />
      </td>
    </tr>
  );
}

export function SkeletonBlock({ height = 120 }: { height?: number }) {
  return <div className="skeleton-block" style={{ height }} />;
}
