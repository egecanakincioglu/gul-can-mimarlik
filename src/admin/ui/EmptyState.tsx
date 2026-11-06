import Link from 'next/link';
import Button from './Button';

export default function EmptyState({
  message,
  description,
  actionLabel,
  onAction,
  href,
}: {
  message: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** With `actionLabel`, the action is a link instead of a button. */
  href?: string;
}) {
  return (
    <div className="adm-empty">
      <p>{message}</p>
      {description && <p className="caption">{description}</p>}
      {actionLabel && href ? (
        <Link href={href} className="adm-btn">
          {actionLabel}
        </Link>
      ) : (
        actionLabel &&
        onAction && (
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
