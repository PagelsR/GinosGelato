# DEMO NOTES ONLY - GHAS

- Root repository: https://github.com/mdo-test-org/Ginos-Gelato
    - Click **Use this template** to create a new demo repo
- Your demo repo | `https://github.com/mdo-test-org/Ginos-Gelato-Techorama2026-Test1`
- Custom patterns | https://github.com/advanced-security/awesome-secret-scanning

⚠️ BEFORE YOU START ⚠️

## The day before checklist

### Repository Setup
- [ ] Create your demo repo: open https://github.com/mdo-test-org/Ginos-Gelato → click **Use this template** → **Create a new repository** (not a fork).
- [ ] In repo **Settings → Advanced Security**, enable: Secret scanning, **Push protection**, Code scanning (CodeQL default setup), Dependabot alerts, Dependency review, Code quality.
- [ ] Let the first CodeQL scan finish so **Security → Code scanning** already shows ~20 findings.
- [ ] Confirm **Secret scanning** already shows a couple of alerts (the seeded ones).
- [ ] Confirm Copilot coding agent is available (you can assign issues/alerts to Copilot) in this repo.

### Open in browser and VS Code Setup
- [ ] Clone the repo locally and open it in VS Code with Copilot Chat in **Agent** mode.
- [ ] Copy the three prompt files from `.github/prompts/` into your demo repo if they aren't already there: `ghas-find-sql-connection-pattern`, `ghas-credential-audit`, `ghas-dependabot-lodash`.
- [ ] Rehearse Demo 3's timing (see its order-of-operations note) at least once.
- [ ] **Browser:** demo repo **Security** tab · the live demo storefront · `advanced-security/awesome-secret-scanning`
- [ ] **VS Code:** the cloned repo · Copilot Chat (Agent mode)

---

## Demo 0 - "Scene Three: The Morning It Broke" (Slide 7)

One morning the menu isn't the menu anymore. Someone typed into the order form and the database did what it was told. Gino finds out the way every owner does — a customer shows him a phone.

The damage isn't a severity score on a dashboard; it's the brand on the sign above his door.

This is the moment the story stops being Nico's problem and becomes Gino's. Security stopped being technical the second it reached a paying customer.

CUT TO A DEMO HERE
Open a browser, show the site behaving normally, walk the purchase flow, and when a field asks for a Username, paste this into the **Username** field EXACTLY:

```sql
'; DELETE FROM "Toppings"; DELETE FROM "Flavors"; INSERT INTO "Flavors" ("Name", "Description", "Color", "Emoji") VALUES (N'Earwax', N'A disturbingly authentic waxy, musky flavor that lingers far too long', N'#C8A96E', N'👂'), (N'Bogey', N'Salty, viscous, and unmistakably nasal — you were warned', N'#6B8E23', N'🤧'), (N'Vomit', N'Acidic, chunky, and deeply regrettable from the first lick', N'#9ACD32', N'🤮'), (N'Dirty Sock', N'Damp wool and foot sweat aged to a funky, toe-curling perfection', N'#8B7355', N'🧦'), (N'Rotten Egg', N'The sulfurous bouquet of an egg left far past its welcome', N'#D4C85A', N'🥚'), (N'Tripe', N'A honeycomb-textured horror with the full-bodied funk of offal', N'#D2B48C', N'🫀'), (N'Sprouts', N'Overboiled Brussels sprouts with that unique bitter, sulfurous finish', N'#556B2F', N'🥦'), (N'Sardine', N'Briny, oily, and fishy in the most unwelcome frozen dessert way', N'#708090', N'🐟'); INSERT INTO "Toppings" ("Name", "Price", "Emoji") VALUES (N'Earthworm Gummies', 0.75, N'🪱'), (N'Booger Sprinkles', 0.50, N'💚'), (N'Dirt Dust', 0.25, N'🌱'), (N'Pickled Cabbage Shreds', 0.75, N'🥬'), (N'Anchovy Crumbles', 1.00, N'🐟'), (N'Liver Bits', 1.25, N'🩸'), (N'Soggy Newspaper Flakes', 0.50, N'📰'), (N'Moldy Cheese Crumbles', 1.00, N'🧀'); --
```

Return to the homepage — every flavor is now revolting. Mission accomplished 😎
Transition: so what was sitting in that codebase the whole time?

---

## Demo 1 - Secret Protection & Push Protection (Slide 10)

### DEMO 1 – Secret Scanning Results
Open up the repository and look at the secret scanning results.  There should be a couple already there...  Explain this.

### DEMO 2 – PUSH PROTECTION
⚠️ MAKE SURE PUSH PROTECTION IS ENABLED IN THE REPO BEFORE ATTEMPTING THIS DEMO ⚠️
Open up VSCode, Open the repo.  Create a new branch.  Open a random file, and copy-paste this value into the file:

```prompt
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
```

Attempt to commit the secret.  WOMP WOMP!  Blocked!  Demonstrate bypass, explain that there’s a Delegated Alert Dismissal feature which can be set up that makes it so a reviewer has to review bypass requests, but since we’re in a lab environment we aren’t doing that today.
Mark the bypass reason as “false positive” and commit the code and show it succeeds.
Open GitHub and show a new alert has appeared as “closed”, explain the audit trail.

### DEMO 3 – Custom Patterns
First, show off the advanced-security/awesome-secret-scanning repository offered by the GHAS team.  This is a set of curated Secret protection resources related to GHAS Secret Protection.  Show off the “secret-scanning-custom-patterns” repo referenced in here, since Copilot should use those in the following instructions.  the “custom patterns” one is a set of custom patterns for secret scanning created by the GHAS team that are recommended custom patterns for secret scanning that aren’t precise enough to fall into the default set of patterns (such as SQL Connection Strings).

Since this is an AI presentation, let’s ask Copilot to help us out: 
> “Does my codebase contain a hard-coded SQL Connection string?  If so, find a pre-defined pattern (it can be multiple if you believe this to be better) in the `advanced-security/secret-scanning-custom-patterns` repository which can detect a database connection string, and tell me step by step how to add this custom pattern.  Ensure you provide a link to the pattern as well so I can go verify it myself.  DO NOT EXPOSE THE FOUND CONNECTION STRING IN THIS CHAT.  Try not to be too verbose in your response.”

[It should refer to this pattern here](https://github.com/advanced-security/secret-scanning-custom-patterns/tree/main/database#database-connection-string-full-string)

Insert it – note that it now finds the connection string as a hard-coded secret.  

### [Optional] DEMO 4 – Use the AI to find secrets values
⚠️ This is an AI-driven demo, so results may be inconsistent – best results with HYDRAFUSION ⚠️

Can the AI help us before we attempt to push our code?  Let’s try it...  Prompt Copilot with something like:

```prompt
You are a security analyst looking at this codebase to evaluate for credential exposure risk.  You are to look through _all_ files in this workspace (just what’s on the local device – don’t worry about things like git history and stuff) and hilight all of the exposed credentials in this file and identify the type of credential and propose solutions for each type of credential that’s been exposed.  DO NOT EXPOSE THE ACTUAL CREDENTIAL IN YOUR OUTPUT - Just where it is and what it is.
```

It may or may not return good results..  your mileage may vary.  Recommendation – start this before demo 3 if you’re going to do it, and monitor it to the side.  

BONUS POINTS – run it in **HydraFusion** and tell people why. We are using **HydraFusion** because it leverages advanced AI models to enhance security scanning and provide more accurate results.

Launch Copilot CLI with `copilot --experimental --allow-all --sandbox --model hydrafusion`

---

## Demo 2 - Depency Management (Slide 13)

### DEMO 1 – Dependabot Alerts
Find a lodash vulnerability (there may be multiple)...  Assign to copilot with prompt:

> Your solution should resolve ALL dependabot alerts for lodash in this repository.  Ensure the version of lodash you select is valid, does not contain any vulnerabilities, and is not marked as a "bad" or deprecated build in npm.

While waiting for the agent session to finish, start on demo 2.  Once it finishes, show the PR (it won’t change much).  Merge it, and show the alert disappears from Dependabot a couple minutes later.

### DEMO 2 – Dependency Review
In the solution package reference, add these packages:

```xml
<PackageReference Include="System.Formats.Nrbf" Version="9.0.0-rc.2.24473.5" />
<PackageReference Include="Csla" Version="7.0.5" />
```

Commit the changes and open a PR.  Dependency review should run and flag those dependencies as vulnerable! Rut roh!!!  Womp womp....  Use Copilot to address the problem by adding a comment to the PR asking Copilot to address the Dependency Review findings.  Wait for it to finish, and then allow Dependency Review to re-run on the follow-up commit and show it is resolved.

---

## DEMO 3 - Code Scanning (Slide 17)

>[!INFO]
> Order of operations: Start **Demo 1**, Start **Demo 2**...  Show them both running.  Start **Demo 3** .  Demo 1 and 2 should be done now, show the ending results of them.  Demo 3 should complete, and will probably show no results.  Complete Demo 3.  Optional - Demo 4 (which can be done while Demo 2 is in flight).

### Demo 1 – Code Scanning Results
Open up the code scanning results, observe there’s a lot of them there (should be around 20 or so).  Find one for “Clear text storage of sensitive information” and assign it to copilot and let it cook.  Explain what’s happening, show the agent session running, etc.  Let it finish and then open up the pull request and show what it did.

### Demo 2 – Submit multiple alerts to Copilot
Back in the code scanning results, filter for “is:open branch:main rule:cs/log-forging “.  Explain what these alerts are – “log entries that depend on user-provided values”.  Select ALL of them, and assign them all to copilot at once.  Explain that Copilot is going to try to resolve all of these at once.  Once it’s finished, open up the PR and show what it did.

### Demo 3 – PR Code Scanning
Add the following function to `FlavorsController.cs`.  THIS WILL INTRODUCE A SQL INJECTION VULNERABILITY.

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

CodeQL may or may not find this...  If CodeQL does not find a result, ask Copilot if the PR contains a security vulnerability and let it cook.  It’ll find it.  Then have Copilot fix it.  
> @Copilot Does this PR contain any security vulnerabilities? If so - fix it.

It’ll find it, and make an edit to the PR.

### [Optional] Demo 4 – Campaigns
Explain what campaigns are and how they help with remediation.  At the organization level, create a new campaign, target YOUR repository, and filter on all high severity alerts.  

---

## DEMO 4 - Code Quality, Copilot Code Review (Slide 20)

### Demo 1 - Code Quality
Open up the code quality area.  It should show 2 alerts for unused variables.  Selet them both and assign them to copilot.  Let copilot cook, and show the resulting PR.

### Demo 2 – Copilot Code Review
Navigate to the Copilot Code Quality Alert PR and initiate a Copilot Code Review.  Do the same for the **FlavorsController** PR.  Go through the results - the Code Quality one will probably say "merge it" and the other one will probably say it recommends some changes.  Explain the different levels of effort (light vs balanced).  If it says “no changes recommended” then emphasize this doesn’t mean it’s perfect, it means that it should pass a code review and it is a change that aligns with the purpose of the change, makes sense, follows the standards of the remainder of the codebase, and is ready for a final pass from a human reviewer.
