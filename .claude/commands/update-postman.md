---
description: Sync the Postman collection with the routes actually declared in the API controllers
argument-hint: "[optional: a domain to limit to, e.g. auth]"
---

Sync `postman/collections/Backend AI API.postman_collection.json` with the
routes that actually exist in `apps/api`. That file is tracked in the repo, so
this is a JSON edit, not a call to Postman's cloud.

Limit to this domain if given: **$ARGUMENTS** (otherwise do all of them).

## 1. Enumerate the real routes

Read every `apps/api/src/domains/*/controller/*.ts` and build the route list
from the decorators:

- Path = `@Controller('<prefix>')` + the `@Get`/`@Post`/`@Put`/`@Patch`/
  `@Delete` argument, under the global prefix `api/v1` (`main.ts`).
- A bare `@Controller()` adds no segment. **`HealthCheckController` and
  `ExampleController` both do this**, so their handlers collide on `/api/v1` —
  a known bug documented in CLAUDE.md. Record where routes *actually* resolve,
  and leave the collection's existing explanatory request names alone rather
  than silently "fixing" them.
- Note which routes carry `@Public()`; everything else needs a bearer token.

Read the matching `validator/*.ts` Joi schema too, so any example body you
write is one the API will actually accept.

## 2. Diff against the collection, and report before editing

- **Missing** — in code, not in the collection.
- **Drifted** — present but the method or path no longer matches.
- **Orphaned** — in the collection, gone from code. Report only; do not delete
  without my say-so, since some are deliberate (the Health folder documents
  both the actual and the intended route).

## 3. Match the existing structure exactly

Folders are by domain: `Auth`, `Students`, `Chat`, `Courses`, `Health`,
`Example`, `Docs`. Put each route in its domain's folder; create a folder only
for a genuinely new domain.

Copy this shape rather than inventing a variant:

```json
{
  "name": "Human Readable Name",
  "request": {
    "method": "POST",
    "header": [{ "key": "Content-Type", "value": "application/json" }],
    "body": { "mode": "raw", "raw": "{\n  \"field\": \"value\"\n}" },
    "url": {
      "raw": "{{baseUrl}}/api/v1/thing/sub",
      "host": ["{{baseUrl}}"],
      "path": ["api", "v1", "thing", "sub"]
    },
    "description": "What it does, what it needs, and anything surprising."
  },
  "response": []
}
```

- **Omit `header` and `body`** on GET/DELETE requests that take no body.
- **Never add an `Authorization` header** — the collection sets bearer auth at
  the root from `{{token}}` and every request inherits it.
- **Reuse the existing variables**: `baseUrl`, `token`, `exampleId`,
  `studentDbId`, `conversationId`, `courseId`. Add one only for a genuinely new
  kind of id, with a `description`.
- Split the path into segments, not just `raw`.
- Write a real `description` — the existing ones state preconditions and known
  quirks. Match that depth.

## 4. Apply without reformatting the file

`JSON.parse` → mutate → `JSON.stringify(obj, null, 2)`. Confirm the diff touches
only the intended entries; a whole-file reformat buries the real change.

## 5. Verify

- Re-parse the JSON to prove Postman can still import it.
- Re-run the step-2 diff — "missing" should be empty.
- If the API is running, curl each added route **without** a token: expect
  `401` on a guarded route. A `404` means the path is wrong or the server has
  not restarted.
- Report what was added, corrected, and deliberately left alone.

Never invent a route that is not in a controller, and never guess a request
body — read the DTO and the Joi schema.
