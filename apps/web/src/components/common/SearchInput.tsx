import type { InputHTMLAttributes, JSX } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Classes for the outer wrapper (e.g. width) — `className` targets the input itself. */
  containerClassName?: string;
}

export function SearchInput({
  className,
  containerClassName,
  ...props
}: SearchInputProps): JSX.Element {
  return (
    <div className={cn('relative', containerClassName)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn('h-10 pl-9', className)} {...props} />
    </div>
  );
}
