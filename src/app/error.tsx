'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Algo salió mal</h2>
      <button onClick={() => reset()}>Intentar de nuevo</button>
    </div>
  );
}
