# Gino's Gelato - GHAS Demo Runbook

**Mission Copilot Autofix: Securing the World's Code with AI and GitHub Advanced Security** · ~60 minutes

| | |
|---|---|
| Storefront | https://proud-desert-0f16d6910.7.azurestaticapps.net/ |
| Template repo | https://github.com/mdo-test-org/Ginos-Gelato → click **Use this template** to create a new demo repo |
| Your demo repo | https://github.com/mdo-test-org/GinoAtTechorama2026 (fill in after you create it) |
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
- [ ] If you rehearsed in this repo, confirm `main` doesn't already have the Demo 2.2 packages (`System.Formats.Nrbf`, `Csla`) or the Demo 3.2 `SearchFlavors` endpoint. If it does, dependency review and CodeQL have nothing new to flag on the PR.
- [ ] Confirm Copilot coding agent is available (you can assign issues/alerts to Copilot) in this repo.
- [ ] Clone the repo locally and open it in VS Code with Copilot Chat in **Agent** mode.
- [ ] Copy the three prompt files from `.github/prompts/` into your demo repo if they aren't already there: `ghas-find-sql-connection-pattern`, `ghas-credential-audit`, `ghas-dependabot-lodash`.
- [ ] **Demo 0 reset:** know how to restore the menu (re-seed / redeploy the demo DB) and rehearse the reset once - the SQL injection is destructive.
- [ ] Rehearse Demo 3's timing (see its order-of-operations note) at least once.

## Open these

- **Browser:** demo repo **Security** tab · the live demo storefront · `advanced-security/awesome-secret-scanning`
- **VS Code:** the cloned repo · Copilot Chat (Agent mode)

## Manually Reset Database (use injection string)

Use this after Demo 0 to put the real menu back.

1. **Storefront (browser):** Start an order.
2. At checkout, paste this restore string into the **Username** field exactly, then submit:

``` sql
'; DELETE FROM "Toppings"; DELETE FROM "Flavors"; INSERT INTO "Flavors" ("Name", "Description", "Color", "Emoji") VALUES (N'Vanilla', N'Classic creamy vanilla with Madagascar vanilla bean', N'#F3E5AB', N'🤍'), (N'Chocolate', N'Rich dark chocolate gelato', N'#3D1C02', N'🤎'), (N'Strawberry', N'Fresh strawberry with real fruit pieces', N'#FC5A8D', N'🍓'), (N'Pistachio', N'Traditional Italian pistachio gelato', N'#93C572', N'🥜'), (N'Lemon Sorbet', N'Refreshing tart lemon sorbet', N'#FFF44F', N'🍋'), (N'Hazelnut', N'Creamy hazelnut with a nutty finish', N'#7B3F00', N'🌰'), (N'Mango Sorbet', N'Tropical mango sorbet made with real Alphonso mangoes', N'#FF8C00', N'🥭'), (N'Tiramisu', N'Italian coffee-mascarpone gelato with a hint of espresso', N'#C4A882', N'☕'); INSERT INTO "Toppings" ("Name", "Price", "Emoji") VALUES (N'Rainbow Sprinkles', 0.50, N'🌈'), (N'Chocolate Sauce', 0.75, N'🍫'), (N'Crushed Nuts', 0.75, N'🥜'), (N'Whipped Cream', 0.50, N'🥛'), (N'Cherries', 0.50, N'🍒'), (N'Caramel Drizzle', 0.75, N'🧈'), (N'Crushed Oreos', 1.00, N'🍪'), (N'Fresh Strawberries', 1.25, N'🍓'); --
```

3. Refresh the homepage - the original menu is back.

---

# DEMO 0 - Break the Menu

**3 min · inline on slide 7 ("Scene Three: The Morning It Broke") · Storefront (browser)**

1. Open the live storefront and start a normal order so the room sees it working.
2. At checkout, paste this string into the **Username** field exactly:

``` sql
'; DELETE FROM "Toppings"; DELETE FROM "Flavors"; INSERT INTO "Flavors" ("Name", "Description", "Color", "Emoji") VALUES (N'Earwax', N'A disturbingly authentic waxy, musky flavor that lingers far too long', N'#C8A96E', N'👂'), (N'Bogey', N'Salty, viscous, and unmistakably nasal — you were warned', N'#6B8E23', N'🤧'), (N'Vomit', N'Acidic, chunky, and deeply regrettable from the first lick', N'#9ACD32', N'🤮'), (N'Dirty Sock', N'Damp wool and foot sweat aged to a funky, toe-curling perfection', N'#8B7355', N'🧦'), (N'Rotten Egg', N'The sulfurous bouquet of an egg left far past its welcome', N'#D4C85A', N'🥚'), (N'Tripe', N'A honeycomb-textured horror with the full-bodied funk of offal', N'#D2B48C', N'🫀'), (N'Sprouts', N'Overboiled Brussels sprouts with that unique bitter, sulfurous finish', N'#556B2F', N'🥦'), (N'Sardine', N'Briny, oily, and fishy in the most unwelcome frozen dessert way', N'#708090', N'🐟'); INSERT INTO "Toppings" ("Name", "Price", "Emoji") VALUES (N'Earthworm Gummies', 0.75, N'🪱'), (N'Booger Sprinkles', 0.50, N'💚'), (N'Dirt Dust', 0.25, N'🌱'), (N'Pickled Cabbage Shreds', 0.75, N'🥬'), (N'Anchovy Crumbles', 1.00, N'🐟'), (N'Liver Bits', 1.25, N'🩸'), (N'Soggy Newspaper Flakes', 0.50, N'📰'), (N'Moldy Cheese Crumbles', 1.00, N'🧀'); --
```

3. Submit the order.
4. Return to the homepage - every flavor is now revolting.

   **Say:** "Someone typed into the order form and the database did what it was told. The damage isn't a severity score - it's the brand on the sign above his door."

**After:** reset the menu with [Manually Reset Database](#manually-reset-database-use-injection-string) (or re-seed / redeploy the demo DB) before you move on, or the broken menu stays up for the rest of the talk.

**If it breaks:** input is sanitized / nothing changes → skip to the transition ("so what was sitting in that codebase the whole time?") and move to slide 8. Don't debug live.

---

# DEMO 1 - Secret Protection & Push Protection

**10 min · slide 10 · GitHub.com + VS Code**

**1.1 Existing secret alerts (1 min)**

1. **GitHub.com:** In your demo repo, open **Security → Secret scanning**. Point at the alerts already there.

   **Say:** "These were committed long ago. Secret scanning found them after the fact - that's detection, not prevention."

**1.2 Push protection blocks a new secret (3 min)**

> ⚠️ Push protection must be **on** (pre-show checklist).

2. **VS Code:** Switch to `main` and create a new branch. Open any file and paste this test PAT:

```
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
```

3. Save, commit, then click **Publish Branch**. GitHub **blocks the push**. Open **Output → Git** to show the message: secret type, file, and unblock link.

   **Say:** "This one never makes it in. Prevention beats detection."
4. **GitHub.com:** Open the unblock link from that message. Choose **It's a false positive**, then click **Allow me to push this secret**. Mention that **Delegated Alert Dismissal** can require a reviewer to approve bypasses (off in this lab).
5. **VS Code:** Click **Publish Branch** again. This time the push succeeds.
6. **GitHub.com:** Open **Security → Secret scanning** and click **Closed**. Show the new alert and its audit trail.

**1.3 Custom pattern for the DB connection string (3 min)**

7. **GitHub.com:** Show `advanced-security/awesome-secret-scanning`, then its
   `secret-scanning-custom-patterns` repo. One line: "GHAS-recommended patterns for secrets too format-specific for the default set - like SQL connection strings."
8. **VS Code:** In Copilot Chat (Agent mode), run:

   ```text
   /ghas-find-sql-connection-pattern
   ```

   → Expect: it points to the **database connection string (full string)** pattern and gives step-by-step add instructions, without printing the connection string.
9. **GitHub.com:** In your demo repo, open **Settings → Advanced Security**. Next to **Custom patterns**, click **New pattern**. Name it, then paste this regex into **Secret format**:

   ```
   (?i)\b(?:Server|Data Source)\s*=\s*[^;]+;(?:[^;\r\n]*;\s*)*\s*(?:Initial Catalog|Database)\s*=\s*[^;\r\n;]+
   ```

10. Paste the sample below into the test string box to show the match. Click **Save and dry run** to show matches in the repo, then click **Publish pattern**.

   ```
   Server=tcp:example.database.windows.net,1433;Initial Catalog=ExampleDb;User Id=test_user;Password=NOT_A_REAL_PASSWORD;Encrypt=True;
   ```

**1.4 Optional - AI credential audit (if time)**

11. **VS Code:** In Copilot Chat (Agent mode), run:

   ```text
   /ghas-credential-audit
   ```

   Results vary - best run beforehand and glance at it. It reports *where/what*, never the value.

   **Bonus - HydraFusion CLI.** Same prompt, run in the Copilot CLI sandbox for stronger results. In the VS Code terminal at the repo root, launch:

   ```text
   copilot --experimental --allow-all --sandbox --model hydrafusion
   ```

   Then paste the prompt text from `.github/prompts/ghas-credential-audit.prompt.md` (below the `---` header). Say one line on *why*: the CLI agent sweeps the whole workspace in a sandbox, and HydraFusion is the stronger model for this reasoning. Start it before Demo 1.3 and glance at it on the side.

**If it breaks:** the custom-pattern finder wanders → add the pattern by hand from the linked repo. The credential audit is low-confidence → skip it; it's optional.

---

# DEMO 2 - Dependency Management

**8 min · slide 13 · all on GitHub.com**

**2.1 Assign the lodash alerts to Copilot**

1. Open **Security → Dependabot** and filter: `is:open package:lodash`. Open one lodash alert.
2. In the right panel, click **Assign to Agent** → **Copilot**. Paste this prompt, assign it, and leave it running:

   ```text
   Your solution should resolve ALL Dependabot alerts for lodash in this repository. Ensure the version of lodash you select is valid, does not contain any vulnerabilities, and is not marked as a "bad" or deprecated build in npm.
   ```

**2.2 Dependency review catches a bad PR**

> ⚠️ `main` must **not** already have these two packages (for example, from a rehearsal). Dependency review only checks what the PR adds.

3. Open `ginos-gelato/server/GinosGelato.csproj` and click **Edit** (pencil icon). Add these lines with the other `PackageReference` lines:

   ```xml
   <PackageReference Include="System.Formats.Nrbf" Version="9.0.0-rc.2.24473.5" />
   <PackageReference Include="Csla" Version="7.0.5" />
   ```

4. Click **Commit changes...** and select **Create a new branch for this commit and start a pull request**. The default commits straight to `main` and skips the PR. Click **Propose changes** → **Create pull request**.
5. Wait for the **Dependency review** check to fail. Show the failed check and the summary comment listing the vulnerable packages (both have **critical** advisories).

   **Say:** "Caught at the door, on the pull request - before it ever merges."
6. Comment on the PR, then leave Copilot working:

   ```text
   @copilot Fix the vulnerable packages that Dependency Review flagged in this PR.
   ```

**2.3 Merge the lodash fix**

7. In **Pull requests**, open Copilot's lodash PR and show **Files changed** (a small version bump). Click **Ready for review**, then merge it.

**Wrap up**

8. Back on the bad PR, once Copilot's commit appears, click **Approve and run workflows** if GitHub asks. Show that **Dependency review** passes.
9. Refresh **Security → Dependabot** and show the lodash alerts are closed.

**If it breaks:** an agent is still running → show its session or draft PR and move on. Dependency review doesn't run → confirm the PR targets `main`. Dependency review passes with "No vulnerabilities" → the packages are already on `main`, so the PR adds nothing new. Pivot to **Security → Dependabot**, where those packages already have alerts.

---

# DEMO 3 - Code Scanning, Autofix & Campaigns

**12 min · slide 17 · all on GitHub.com**

> **Order:** Start 3.1, then 3.2, and leave both running. Start 3.3; while it works, show the results for 3.1 and 3.2. Finish by showing the PR from 3.3. Campaigns are optional and can run while Copilot works.

**3.1 Fix one finding**

1. Open **Security → Code scanning** (about 20 findings). Open the **Clear-text storage of sensitive information** alert and click **Assign to Copilot**.
2. Show the agent session in the repo's **Agents** tab, then leave it running.

**3.2 Scan a PR for a new vulnerability**

3. Open `ginos-gelato/server/Controllers/FlavorsController.cs` and click **Edit** (pencil icon). Paste this intentionally vulnerable endpoint right after the `GetFlavors()` method:

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

4. Click **Commit changes...** and select **Create a new branch for this commit and start a pull request**. The default commits straight to `main` and skips the PR. Click **Propose changes** → **Create pull request**.
5. Right away, comment on the PR (don't wait for CodeQL):

   ```text
   @Copilot Does this PR contain any security vulnerabilities? If so - fix it.
   ```

   Copilot should find the SQL injection and push a fix to the PR. Leave it working. When you come back, show whether CodeQL flagged it, then show Copilot's fix.

**3.3 Submit multiple alerts to Copilot**

6. Back in **Security → Code scanning**, filter: `is:open branch:main rule:cs/log-forging`.

   **Say:** "These are log entries that depend on user-provided values."
7. Select all matching alerts, then click **Assign to Copilot** above the list. Copilot fixes them together in one PR. While it works, return to 3.1 and 3.2. When it finishes, show the PR and its changes.

**3.4 Optional - Campaigns**

8. Open your organization's **Security** tab → **Campaigns** → **Create campaign** → **From code scanning filters**. Filter: `is:open repo:<your-repo> severity:high`. Click **Save as** → **Publish campaign**, fill in the details, and click **Publish campaign**. Explain that campaigns organize and track remediation; they aren't another scanner.

**If either Copilot task is still running:** show its draft PR and keep moving.

**If CodeQL doesn't flag the SQL injection:** no problem - the `@Copilot` comment still finds and fixes it.

---

# DEMO 4 - Code Quality & Copilot Code Review

**6 min · slide 25 · all on GitHub.com**

**4.1 Code quality (3 min)**

1. Open **Security → Code quality → Standard findings** and find the 2 **unused variable** findings.
2. Select both, then click **Assign to Copilot**. Show the draft PR Copilot opens.

**4.2 Copilot Code Review (3 min)**

3. Open Copilot's Code Quality PR. In the right sidebar under **Reviewers**, pick an effort level (**Lite** or **Balanced**), then click **Request** next to **Copilot**. Do the same on the **FlavorsController** PR from 3.2.
4. Contrast them: the quality PR likely says "merge it"; the controller PR likely recommends changes. Explain the effort levels: **Lite** for quick checks, **Balanced** for deeper analysis.

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
