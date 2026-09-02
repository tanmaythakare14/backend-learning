import type { JSX } from 'react';
import { Toaster as SonnerToaster, type ToasterProps } from 'sonner';

export function Toaster(props: ToasterProps): JSX.Element {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      toastOptions={{
        classNames: {
          toast: 'font-sans',
        },
      }}
      {...props}
    />
  );
}
