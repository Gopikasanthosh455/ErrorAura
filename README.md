# ErrorAura — AI Debug Assistant

> Paste your broken code and error → get a plain English explanation, fixed code with comments, a lesson that sticks, and a tracker that remembers your repeated mistakes.

---


## What it does

| Panel | What you get |
|---|---|
| Why this happened | Plain English root cause explanation |
| What to remember | One concept to prevent the same mistake |
| Fixed code | Corrected code with a comment on every changed line |
| Mistake patterns | Bar chart of your most repeated errors (saved in browser) |
| Ask more | Follow-up chips to go deeper |

**Auto language detection** — reads your code and detects Python, JS, TypeScript, Java, Go, C++, PHP, Rust. No dropdown.

**Auto-resize textarea** — textarea grows as you paste more code so you always see everything.

**Session memory** — mistake patterns saved in localStorage. Still there when you come back tomorrow.

---

## Project files

```
erroraura/
├── index.html    — app page
├── style.css     — deep black + cyan/teal theme
├── api.js        — OpenAI API call + prompt design
├── tracker.js    — localStorage mistake tracker
├── app.js        — UI logic + language detection
└── README.md     — this file
```



## Tech stack

- Vanilla HTML / CSS / JavaScript
- OpenAI GPT-4o API
- Browser localStorage (no backend)
- Google Fonts: Inter + JetBrains Mono
