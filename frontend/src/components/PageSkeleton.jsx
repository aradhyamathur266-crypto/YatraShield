import { Skeleton } from "./ui.jsx";

export function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-busy="true" aria-label="Loading page">
      <Skeleton height={14} width={120} />
      <Skeleton height={46} width="min(520px, 80%)" style={{ marginTop: 14 }} />
      <Skeleton height={16} width="min(380px, 60%)" style={{ marginTop: 14 }} />
      <div className="page-skeleton-grid">
        <Skeleton height={120} />
        <Skeleton height={120} />
        <Skeleton height={120} />
      </div>
      <Skeleton height={320} style={{ marginTop: 16 }} />
    </div>
  );
}
