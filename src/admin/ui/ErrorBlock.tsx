import Button from './Button';

export default function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="adm-error">
      <p className="label">Hata</p>
      <p>{message}</p>
      <Button onClick={onRetry}>Tekrar dene</Button>
    </div>
  );
}
