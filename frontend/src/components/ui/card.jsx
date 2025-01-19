import { clsx } from 'clsx';

export function Card({ className, ...props }) {
  return (
    <div
      className={clsx('rounded-lg border bg-white text-gray-950 shadow-sm', className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={clsx('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={clsx('text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={clsx('text-sm text-gray-500', className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={clsx('p-6 pt-0', className)} {...props} />;
}
