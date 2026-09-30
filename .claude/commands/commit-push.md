---
description: Commit the working-tree changes with a conventional message and push the branch
argument-hint: '[optional: a hint for the commit message, or a file/folder to limit to]'
---

Commit my current changes and push the branch. Running this command is my
explicit go-ahead for that commit and that push, and nothing beyond them.

Hint or scope from me, if any: **$ARGUMENTS** (otherwise commit everything that
is changed).

## 1. Look before staging

Run `git status --short`, `git branch --show-current`, and `git diff --stat`.

- **On `main`? Stop.** Tell me and ask which branch to use. Do not commit to
  `main` and do not create a branch on my behalf.
- **Nothing changed?** Say so and stop.
- If `$ARGUMENTS` names a path, stage only that path.

## 2. Stage deliberately, not with `git add -A`

Add files by name. Read the list of untracked files before adding them and
**leave out, and tell me about**:

- anything secret-looking: `.env`, `*.pem`, `*.key`, credentials, tokens
  (`apps/api/.env` is gitignored — if it shows up, something is wrong, stop)
- build output, logs, screenshots, scratch or throwaway files
- changes that clearly belong to a different piece of work than the rest — offer
  to split them into separate commits instead of mixing them

## 3. Write the message to this repo's rules

`commitlint.config.js` enforces `type(scope): subject`, and it **rejects the
commit** if any of these fail:

- **type** is one of `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **scope is required** — pick the area touched, e.g. `auth`, `web`, `api`,
  `settings`, `dashboard`, `postman`, `rules`
- subject is non-empty, imperative, lower-case start, no trailing full stop
- a blank line before any footer

Match the style of recent `git log` subjects. Describe _why_ in the body when it
is not obvious from the diff. End the message with the attribution line from the
system reminder, if one is present.

Pass the message through a heredoc so quoting cannot mangle it.

## 4. Commit — never bypass the hooks

Husky runs `lint-staged` on pre-commit and `commitlint` on commit-msg.

- **Never** use `--no-verify`, and never disable a hook.
- If a hook fails, read the error, fix the real cause, re-stage, and make a
  **new** commit. Do not `--amend` — a failed hook means the commit did not
  happen, so amending would rewrite the previous commit.
- lint-staged may rewrite files (Prettier). Re-check `git status` afterwards.

## 5. Push

```bash
git push            # branch already tracks a remote
git push -u origin <branch>   # first push of a new branch
```

- The **pre-push** hook runs `yarn lint:all`, `yarn format:check` and
  `yarn build:all`. It is slow — say so before starting, and do not interrupt it.
- **Never** `--force` or `--force-with-lease`. If the push is rejected because
  the remote moved, stop and tell me — do not rebase or merge on your own.
- If the pre-push hook fails, report which step failed and the relevant error.
  Do not retry with `--no-verify`.

## 6. Report

State: the branch, the commit hash and subject, the files included, anything you
deliberately left out and why, and whether the push succeeded (with the remote
branch). If the push failed or was skipped, say so plainly rather than implying
it went through.

Do **not** open a pull request — that is a separate request.
