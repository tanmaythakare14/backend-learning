---
description: Stop the dev servers and free their ports, then verify they are actually free
argument-hint: "[ports, e.g. 4000 — omit for all dev ports]"
---

Free the dev-server ports on this Windows machine and verify they are actually
free afterwards.

Ports to target: **$ARGUMENTS**

If that is empty, use the full dev range:

- **3000** — `apps/web` (Vite)
- **4000** — `apps/api` (NestJS via nodemon)
- **3001-3010** — strays. Vite silently walks up the range when 3000 is taken,
  so abandoned instances accumulate over a long session. Six were once live at
  once in this repo, with the newest quietly bound to 3005 while the browser
  pointed at 3000.

## 1. Find what is listening, and its parent

```powershell
foreach ($p in 3000..3010 + 4000) {
  $c = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
  if ($c) {
    $procId = $c[0].OwningProcess
    $proc   = Get-CimInstance Win32_Process -Filter "ProcessId=$procId" -ErrorAction SilentlyContinue
    '{0,-6} pid={1,-8} {2,-12} parent={3}' -f $p, $procId, $proc.Name, $proc.ParentProcessId
  }
}
```

The parent matters. `nx serve` / `yarn dev` run the real server as a child —
kill only the child and the wrapper starts another, so the port never frees.

## 2. Check the parent before killing it

Only kill parents that are `node.exe`. If a parent is `powershell.exe`,
`WindowsTerminal.exe`, `Code.exe` or similar, kill the child **only** — that
parent is my terminal or editor, and killing it loses my work.

## 3. Kill child and parent together

```powershell
Stop-Process -Id <pid1>,<parent1>,<pid2>,<parent2> -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
```

## 4. Verify — do not skip this

A kill command reporting success does not mean the port is free. Re-query every
port and report each one as free or still up. If one survives, repeat once; if
it survives twice, say so plainly rather than claiming success.

## 5. Report

State each port and its final state. Mention any stray instance you found above
3000 and which port it held.

If a background-task notification fires afterwards reporting a failed command
with exit code 127, that is the killed server reporting its own death — say so,
so it does not read as a new error.

Do **not** restart anything. "Free the ports" means free them.
