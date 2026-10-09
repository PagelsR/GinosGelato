# Gino's Gelato - GHAS Demo Runbook

**Mission Copilot Autofix: Securing the World's Code with AI and GitHub Advanced Security** · ~60 minutes

| | |
|---|---|
| Template repo | https://github.com/mdo-test-org/Ginos-Gelato → click **Use this template** to create a new demo repo |
| Your demo repo | `https://github.com/<you>/Ginos-Gelato` (fill in after you create it) |
| Verbatim payloads | `Ginos Vulnerable Gelato Demo Notes.md` (SQL-injection string + test PAT live here - single source of truth) |
| Custom patterns | https://github.com/advanced-security/awesome-secret-scanning |

## Demos at a Glance

| Demo | Slide | Min | The audience sees |
|---|---:|---:|---|
| 0 - Break the Menu | 7 | 3 | A SQL-injection string rewrites the live menu to garbage |
| 1 - Secret Protection & Push Protection | 11 | 10 | Existing alert → push protection blocks a secret → custom pattern catches the DB string |
| 2 - Dependency Management | 16 | 8 | Copilot fixes a lodash alert; dependency review blocks a bad PR |
| 3 - Code Scanning, Autofix & Campaigns | 21 | 12 | CodeQL + Copilot fix findings one, many, and at scale |
| 4 - Code Quality & Copilot Code Review | 25 | 6 | Copilot clears a quality alert and reviews two PRs |

Everything after **Timing** is reference, not needed on stage.

---

# Pre-Show Checklist

## The day before

- [ ] Create your demo repo: open https://github.com/mdo-test-org/Ginos-Gelato → click **Use this template** → **Create a new repository** (not a fork).
- [ ] In repo **Settings → Advanced Security**, enable: Secret scanning, **Push protection**, Code scanning (CodeQL default setup), Dependabot alerts, Dependency review, Code quality.
- [ ] Let the first CodeQL scan finish so **Security → Code scanning** already shows ~20 findings.
- [ ] Confirm **Secret scanning** already shows a couple of alerts (the seeded ones).
- [ ] Confirm Copilot coding agent is available (you can assign issues/alerts to Copilot) in this repo.
- [ ] Clone the repo locally and open it in VS Code with Copilot Chat in **Agent** mode.
- [ ] Copy the three prompt files from `.github/prompts/` into your demo repo if they aren't already there: `ghas-find-sql-connection-pattern`, `ghas-credential-audit`, `ghas-dependabot-lodash`.
- [ ] **Demo 0 reset:** know how to restore the menu (re-seed / redeploy the demo DB) and rehearse the reset once - the SQL injection is destructive.
- [ ] Rehearse Demo 3's timing (see its order-of-operations note) at least once.

## Open these

- **Browser:** demo repo **Security** tab · the live demo storefront · `advanced-security/awesome-secret-scanning`
- **VS Code:** the cloned repo · Copilot Chat (Agent mode)

---

# DEMO 0 - Break the Menu

**3 min · inline on slide 7 ("Scene Three: The Morning It Broke")**

1. On the live storefront, start a normal order so the room sees it working.
2. When a field asks for a **Username**, paste the SQL-injection string from
   `Ginos Vulnerable Gelato Demo Notes.md` → **Demo 0**, exactly.

``` sql
'; DELETE FROM "Toppings"; DELETE FROM "Flavors"; INSERT INTO "Flavors" ("Name", "Description", "Color", "Emoji") VALUES (N'Earwax', N'A disturbingly authentic waxy, musky flavor that lingers far too long', N'#C8A96E', N'👂'), (N'Bogey', N'Salty, viscous, and unmistakably nasal — you were warned', N'#6B8E23', N'🤧'), (N'Vomit', N'Acidic, chunky, and deeply regrettable from the first lick', N'#9ACD32', N'🤮'), (N'Dirty Sock', N'Damp wool and foot sweat aged to a funky, toe-curling perfection', N'#8B7355', N'🧦'), (N'Rotten Egg', N'The sulfurous bouquet of an egg left far past its welcome', N'#D4C85A', N'🥚'), (N'Tripe', N'A honeycomb-textured horror with the full-bodied funk of offal', N'#D2B48C', N'🫀'), (N'Sprouts', N'Overboiled Brussels sprouts with that unique bitter, sulfurous finish', N'#556B2F', N'🥦'), (N'Sardine', N'Briny, oily, and fishy in the most unwelcome frozen dessert way', N'#708090', N'🐟'); INSERT INTO "Toppings" ("Name", "Price", "Emoji") VALUES (N'Earthworm Gummies', 0.75, N'🪱'), (N'Booger Sprinkles', 0.50, N'💚'), (N'Dirt Dust', 0.25, N'🌱'), (N'Pickled Cabbage Shreds', 0.75, N'🥬'), (N'Anchovy Crumbles', 1.00, N'🐟'), (N'Liver Bits', 1.25, N'🩸'), (N'Soggy Newspaper Flakes', 0.50, N'📰'), (N'Moldy Cheese Crumbles', 1.00, N'🧀'); --
```
3. Submit form

3. Return to the homepage - every flavor is now revolting.

   **Say:** "Someone typed into the order form and the database did what it was told. The damage isn't a severity score - it's the brand on the sign above his door."

**After:** reset the menu (re-seed / redeploy the demo DB) before you move on, or the broken menu stays up for the rest of the talk.

**If it breaks:** input is sanitized / nothing changes → skip to the transition ("so what was sitting in that codebase the whole time?") and move to slide 8. Don't debug live.

---

# DEMO 1 - Secret Protection & Push Protection

**10 min · slide 10**

**1.1 Existing secret alerts (1 min)**

1. Repo → **Security → Secret scanning**. Point at the alerts already there.

   **Say:** "These were committed long ago. Secret scanning found them after the fact - that's detection, not prevention."

**1.2 Push protection blocks a new secret (3 min)**

> ⚠️ Push protection must be **on** (pre-show checklist).

2. In VS Code, create a branch. Open any file and paste the **test PAT** from
   `Ginos Vulnerable Gelato Demo Notes.md` → **Demo 1 / Push Protection**.
3. Commit → **blocked**.

```
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
```

   **Say:** "This one never makes it in. Prevention beats detection."
4. Demonstrate the bypass: mark the reason **false positive** and commit. Mention that **Delegated Alert Dismissal** can require a reviewer to approve bypasses (off in this lab).
5. Repo → **Security** → show the new alert as **closed** with its audit trail.

**1.3 Custom pattern for the DB connection string (3 min)**

6. Browser: show `advanced-security/awesome-secret-scanning`, then its
   `secret-scanning-custom-patterns` repo. One line: "GHAS-recommended patterns for secrets too format-specific for the default set - like SQL connection strings."
7. In Copilot Chat:

   ```text
   /ghas-find-sql-connection-pattern
   ```

   → Expect: it points to the **database connection string (full string)** pattern and gives step-by-step add instructions, without printing the connection string.
8. Add the pattern in **Settings → Advanced Security → Secret scanning → Custom patterns**. Scanning now flags the DB connection string as a secret.

**1.4 Optional - AI credential audit (if time)**

9. In Copilot Chat:

   ```text
   /ghas-credential-audit
   ```

   Results vary - best run beforehand and glance at it. It reports *where/what*, never the value.

   **Bonus - HydraFusion CLI.** Same prompt, run in the Copilot CLI sandbox for stronger results. Launch:

   ```text
   copilot --experimental --allow-all --sandbox --model hydrafusion
   ```

   Then paste the `ghas-credential-audit` prompt text. Say one line on *why*: the CLI agent sweeps the whole workspace in a sandbox, and HydraFusion is the stronger model for this reasoning. Start it before Demo 1.3 and glance at it on the side.

**If it breaks:** the custom-pattern finder wanders → add the pattern by hand from the linked repo. The credential audit is low-confidence → skip it; it's optional.

---

# DEMO 2 - Dependency Management

**8 min · slide 13**

**2.1 Dependabot + Copilot (start, then leave it)**

1. **Security → Dependabot** → open a **lodash** alert.
2. Assign it to Copilot with:

   ```text
   /ghas-dependabot-lodash
   ```

   Leave the agent running and go to 2.2.

**2.2 Dependency review blocks a bad PR (5 min)**

3. Add these to the solution's package references:

   ```xml
   <PackageReference Include="System.Formats.Nrbf" Version="9.0.0-rc.2.24473.5" />
   <PackageReference Include="Csla" Version="7.0.5" />
   ```

4. Commit → open a PR. **Dependency review** runs and flags both as vulnerable.

   **Say:** "Caught at the door, on the pull request - before it ever merges."
5. Comment on the PR asking Copilot to address the Dependency Review findings. Let it finish, let review re-run on the new commit → resolved.

**2.3 Back to 2.1**

6. The lodash agent should be done. Show the PR (small change), merge it, and note the alert clears from Dependabot a few minutes later.

**If it breaks:** the lodash agent stalls → just show its PR draft and narrate. Dependency review doesn't flag → confirm the versions match the block above.

---

# DEMO 3 - Code Scanning, Autofix & Campaigns

**12 min · slide 17**

> **Order of operations:** start 3.1, then start 3.2; while both run, do 3.3; return to 3.1/3.2 results; finish with 3.4 (optional). Demo 3.3 often ends with no results - that's the point.

**3.1 Fix one finding with Copilot (start, then leave it)**

1. **Security → Code scanning** (~20 findings). Open **Clear-text storage of sensitive information**.
2. Assign it to Copilot. Narrate the agent session, then move on.

**3.2 A PR introduces a new vuln (start, then leave it)**

3. Add this intentionally vulnerable endpoint to `FlavorsController.cs`:

   ```csharp
   // GET: api/flavors/search?name=...
   [HttpGet("search")]
   public async Task<ActionResult<IEnumerable<Flavor>>> SearchFlavors([FromQuery] string name)
   {
       var sql = $"SELECT * FROM Flavors WHERE Name LIKE '%{name}%'";
       var flavors = await _context.Flavors.FromSqlRaw(sql).ToListAsync();
       return Ok(flavors);
   }
   ```

4. Commit → open a PR. If CodeQL flags it, great. If not, comment:

   ```text
   @Copilot Does this PR contain any security vulnerabilities? If so - fix it.
   ```

   → It finds the SQL injection and edits the PR to parameterize the query.

**3.3 Fix many at once (while 3.1/3.2 run)**

5. In Code scanning, filter: `is:open branch:main rule:cs/log-forging`.

   **Say:** "Log entries built from user input."
6. Select **all** of them → assign to Copilot at once. Show the single PR it opens.

**3.4 Optional - Campaigns**

7. Org level → **new campaign** → target your repo → filter **high severity**. One line on how campaigns organize and track remediation (not another scanner).

**Wrap 3.1 / 3.2:** return to both, show the finished PRs and what changed.

**If it breaks:** an agent is slow → show the draft PR and keep moving. CodeQL silent on 3.2 → use the `@Copilot` comment, that's the scripted path.

---

# DEMO 4 - Code Quality & Copilot Code Review

**6 min · slide 25**

**4.1 Code quality (3 min)**

1. **Security → Code quality** → the 2 **unused variable** alerts.
2. Select both → assign to Copilot → show the resulting PR.

**4.2 Copilot Code Review (3 min)**

3. Open the **Code Quality** PR → request **Copilot Code Review**. Then do the same on the **FlavorsController** PR.
4. Contrast them: the quality PR likely says "merge it"; the controller PR likely recommends changes. Mention effort levels (light vs balanced).

   **Say:** "No changes recommended doesn't mean perfect - it means it passed an automated review and is ready for a human's final pass."

**If it breaks:** review returns nothing → use that: "silence isn't proof of correctness; a human still decides."

---

# Closing

1. Slide **Back to Serving Gelato, Safely** (26): the menu's restored; the real change is the workflow - checks run early, AI drafts repairs, Nico still owns the review.
2. Slide **Security Is a Team Sport** (27): "Security works best as part of everyday development, not a last-minute scramble."

---

# If Things Go Wrong

| Problem | Do this |
|---|---|
| Demo 0 doesn't break the menu | Skip to the transition line; move to slide 8. |
| Demo 0 left the menu broken | Reset the DB before Demo 1 (rehearsed in pre-show). |
| A Copilot agent stalls | Show the draft PR and narrate; don't wait on stage. |
| CodeQL doesn't flag the SQL injection | Use the `@Copilot ... fix it` PR comment. |
| Push protection doesn't block | It's disabled - enable it in Settings (pre-show). |
| Running long | Cut 1.4 → 3.4 (Campaigns) → 2.3 cleanup. Keep Demos 0, 1.2, 3.2. |

---

# Timing (estimate - deck doesn't state a total)

| Section | Slides | Min |
|---|---|---:|
| Story (Scene 1-2) | 1-6 | 8 |
| **Demo 0** | 7 | 3 |
| Risk & protection intro | 8-10 | 4 |
| **Demo 1** | 11 | 10 |
| Dependency intro | 14-15 | 3 |
| **Demo 2** | 16 | 8 |
| Code scanning / Autofix / Campaigns intro | 18-20 | 4 |
| **Demo 3** | 21 | 12 |
| Code quality / review intro | 23-24 | 3 |
| **Demo 4** | 25 | 6 |
| Closing | 26-28 | 4 |
| **Total** | | **~65** |

Runs slightly long - the first cuts are Demo 1.4, Demo 3.4 (Campaigns), then Demo 2.3 cleanup.

---

# Appendix - Verbatim assets

Two strings are **not** reproduced here on purpose - they live in one place so they can't drift:

- **Demo 0 SQL-injection payload** and **Demo 1.2 test PAT** → `Ginos Vulnerable Gelato Demo Notes.md`.

Everything else a demo needs (the two package references, the vulnerable `SearchFlavors` endpoint, the three Copilot prompts) is inline above or in `.github/prompts/`.

Prompt files (copy into the demo repo's `.github/prompts/`):

| Prompt file | Used in | Does |
|---|---|---|
| `ghas-find-sql-connection-pattern.prompt.md` | Demo 1.3 | Finds the DB connection string, points to the GHAS custom pattern |
| `ghas-credential-audit.prompt.md` | Demo 1.4 | Audits the workspace for exposed credentials (never prints values) |
| `ghas-dependabot-lodash.prompt.md` | Demo 2.1 | Resolves all lodash Dependabot alerts with a safe version |
