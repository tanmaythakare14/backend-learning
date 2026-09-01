# Dialog Component Notes (`@base-ui/react/dialog`)

This project uses `@base-ui/react/dialog` — **not** Radix UI. Key differences:

| Feature                     | Radix UI               | base-ui                                     |
| --------------------------- | ---------------------- | ------------------------------------------- |
| Hide close button           | `hideCloseButton`      | `showCloseButton={false}`                   |
| Prevent dismiss on backdrop | `onPointerDownOutside` | Not supported via prop — omit `dismissible` |
| Prevent dismiss on Escape   | `onEscapeKeyDown`      | Not supported via prop                      |

The `DialogContent` component in this project accepts a custom `showCloseButton?: boolean` prop (default `true`). Do not pass `dismissible`, `onPointerDownOutside`, or `onEscapeKeyDown` — they will cause TypeScript errors.
