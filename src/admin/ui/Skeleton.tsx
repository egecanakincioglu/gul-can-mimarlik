/** Flat placeholder rectangle; no shimmer. */
export default function Skeleton({
  width = '100%',
  height = 16,
}: {
  width?: number | string;
  height?: number | string;
}) {
  return <span aria-hidden="true" className="adm-skel" style={{ width, height }} />;
}
