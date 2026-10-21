# IEB IT Paper 1 Cram Site — build contract

Static site, no build step, deployed on Vercel. Audience: one IEB Grade 12 learner writing
**IT Paper 1 (practical, 3 h, 150 marks) tomorrow**, in **Java** (NetBeans) with **SQL**.

## Paper format (2021 onwards)
- Section A — SQL (~ 40–50 marks): SELECT/WHERE/LIKE/BETWEEN/IN, ORDER BY, aggregates,
  GROUP BY/HAVING, joins across 2–3 tables, calculated fields, date functions, string functions,
  INSERT/UPDATE/DELETE, subqueries, RND, ROUND/FORMAT. Answers accepted in Access, MySQL or JavaDB.
- Section B — OOP (~100 marks): object class (fields, constructor, accessors/mutators, toString,
  calculation methods, dates with LocalDate/DateTimeFormatter), inheritance (extends, super, @Override),
  manager class (read text file into array of objects, Scanner/split, search, sort, counters, totals),
  UI class (menu / output formatting), algorithms from first principles (no built-in sort/search).

## Copyright rule (important)
Past papers and memos are **IEB copyright**. Do NOT copy PDFs into this repo and do NOT paste question
text or memo code verbatim. Write everything in your own words: summarise what each question asked,
describe the technique, and write your **own** model solution code. Short identifiers (table/field
names like `tblProducts`) are fine.

## Files
```
index.html        frontend agent — shell, nav, all views
styles.css        frontend agent
app.js            frontend agent — hash router, rendering, search, quiz, progress (localStorage, try/catch)
data/papers.js    backend agent
data/topics.js    backend agent
data/drills.js    backend agent
data/plan.js      backend agent
vercel.json       backend agent (cleanUrls, headers)
```
Data files are plain scripts that assign globals (loaded with `<script src>` before app.js).

### data/papers.js
```js
window.P1_PAPERS = [{
  id: "2025-nov", year: 2025, session: "November", // or "May", "Prelim", "Practice"
  scenario: "One-line description of the paper's theme, own words",
  total: 150,
  sections: [{
    name: "SQL",            // or "OOP"
    questions: [{
      num: "1.3", marks: 4,
      tags: ["GROUP BY", "COUNT"],          // must use ids/names from P1_TOPICS where possible
      asked: "Own-words summary of what the question wanted",
      approach: "How to think about it / steps",
      solution: { lang: "sql", code: "SELECT ..." },   // own model answer; lang: sql | java
      pitfalls: ["common mark-loss"]
    }]
  }]
}];
```

### data/topics.js
```js
window.P1_TOPICS = [{
  id: "sql-group-by", section: "SQL",   // SQL | OOP | Files & Arrays | Algorithms | Dates & Strings | Exam technique
  title: "GROUP BY & HAVING",
  summary: "1–2 sentences",
  points: ["key fact", "..."],
  code: [{ title: "Template", lang: "sql", code: "..." }],
  pitfalls: ["..."],
  years: [2021, 2023, 2025],            // which past papers examined it
  priority: 3                          // 1–3, 3 = examined almost every year
}];
```

### data/drills.js
```js
window.P1_DRILLS = [{
  id: "d1", topic: "sql-group-by", type: "sql",    // sql | java | mcq | predict (predict the output)
  prompt: "Task text", options: ["..."],              // options only for mcq
  answer: "model answer (code or option text)",
  explain: "why"
}];
```

### data/plan.js
```js
window.P1_PLAN = {
  examNote: "...",
  tonight: [{ time: "18:00", task: "...", mins: 45 }],
  checklist: ["exam-day item"],
  markStats: [{ area: "SQL", avg: 45 }],      // derived from the papers
  sqlDialects: [{ feature: "today's date", access: "Date()", mysql: "CURDATE()", javadb: "CURRENT_DATE" }],
  resources: [{ title: "...", url: "https://...", why: "..." }]
};
```

## Views (frontend)
Home (countdown to exam, “tonight plan”, top-priority topics), Topics (filter by section, priority),
Past Papers (pick a year → questions, reveal approach/solution), Drills (flashcard / self-mark),
SQL & Java cheat sheets (printable), Exam-day checklist. Global search across topics/questions.
