/* IEB IT Paper 1 cram site: tonight's plan, exam-day checklist, mark stats, SQL dialects, resources.
   markStats are computed from data/papers.js (Nov 2021-2025 + May 2026 exam papers only; practice and prelim excluded).
   Marks for a question with several tags go to its first tag. The five rows add up to the 150-mark paper. */
window.P1_PLAN = {
  examNote: "Paper 1 is a 3-hour, 150-mark practical: Section A is SQL (50 marks) and Section B is Java OOP (100 marks), and both sections are compulsory. " +
    "At about 1.2 minutes per mark, give SQL roughly an hour (including reading the whole paper first) and OOP roughly two hours, keeping the last 10 minutes to add your exam number to every class, comment out anything that crashes and save. " +
    "If a piece of code will not compile or run, comment it out with a one-line note saying what it was meant to do, so the rest of your program still runs and the marker can still give part marks. " +
    "Searches and sorts must be coded by hand from first principles: no Arrays.sort, Collections.sort or any other built-in sort or search. " +
    "Back up the original data files before you start, and save often.",

  tonight: [
    { time: "19:30", task: "SQL rapid-fire (worth 50 marks every paper): Drills on Joins (2- and 3-table), GROUP BY & HAVING, Subqueries / NOT IN, and INSERT / UPDATE / DELETE. Say the answer, then check.", mins: 30 },
    { time: "20:00", task: "SQL dialect + functions: on the Cheat sheets page, learn the row for YOUR database: wildcards, date literal, today's date, LEFT/MID/LEN, joining text, INT(RND()*n)+1, TOP.", mins: 10 },
    { time: "20:10", task: "Break: stand up, water, no phone.", mins: 5 },
    { time: "20:15", task: "Object class from a blank file (~49 marks a paper): private fields, constructor that parses a date string, getters/setters, toString, then a child class with extends, super(...) and @Override.", mins: 30 },
    { time: "20:45", task: "Manager class pattern (~38 marks a paper): read a text file into an object array with Scanner + split and a size counter, then counters/totals, a linear search with a found flag, and a hand-coded bubble or selection sort by one field.", mins: 30 },
    { time: "21:15", task: "Break: snack and water.", mins: 5 },
    { time: "21:20", task: "Dates & string formatting: LocalDate.now / parse / plusDays / isBefore, DateTimeFormatter.ofPattern(\"dd MM yyyy\") (MM = month, mm = minutes), Period / ChronoUnit, String.format(\"%-15s%8.2f\"), \\t and \\n.", mins: 15 },
    { time: "21:35", task: "Timed mini-practice (exam pace): 2025 November Q2 (Free object class) + Q4.4 (read Accounts.txt into the array), about 27 marks. Timer on, no notes.", mins: 30 },
    { time: "22:05", task: "Self-mark it against the model answer on the Past Papers page. Write down your two biggest mistakes.", mins: 5 },
    { time: "22:10", task: "Final skim: Cheat sheets page (SQL dialects + Java OOP), then tick through the Exam-day checklist and pack your bag (ID, admission letter, water).", mins: 10 },
    { time: "22:20", task: "Screens off, wind down, lights out by 22:30. Sleep is worth more marks than another hour of cramming.", mins: 10 }
  ],

  checklist: [
    "Lights out by 22:30 tonight: a 3-hour practical needs a rested brain.",
    "Pack your ID document and admission letter (with your exam number).",
    "Water bottle (if your centre allows it) and a proper breakfast; arrive 30 minutes early.",
    "First thing: copy/back up the original data files (database + .txt files) before you change anything.",
    "Read the WHOLE paper (about 5-10 min) before coding: later questions often need an extra field, method or counter.",
    "Open each .txt data file: check the exact file name, the delimiter (# ; ,), field order, date format and any header or blank lines.",
    "Check the database opens in your app (Access, MySQL or JavaDB) and use that dialect's wildcards and date syntax throughout.",
    "Run every SQL query, compare it with the sample output (same columns, order, row count), then paste it into SQLAnswerSheet.rtf straight away.",
    "Name classes, methods, fields and parameters EXACTLY as the paper says, and use the given method headers, types and parameter order.",
    "Don't hard-code data: no sample values, array sizes or dates from the paper. Loop to your counter; use LocalDate.now() for today.",
    "Write every sort and search yourself: no Arrays.sort, Collections.sort or built-in search.",
    "Compile and run after every method, not after 50 lines.",
    "If something won't compile or crashes, comment it out with a short note on what it should do, and move on.",
    "Save regularly (Ctrl+S): after a power cut you only get the time that was left, not the work you didn't save.",
    "Check your output matches the example exactly: spacing, tabs, decimals, date format, headings and line breaks.",
    "Only answer what is asked: no extra validation or GUI unless the question wants it.",
    "Watch the clock: SQL done by about the 1-hour mark; keep the last 10 minutes for exam numbers in every class, comments and a final save.",
    "When printing: font size 12, indenting intact, nothing cut off, exam number on every page, and code for every question included."
  ],

  markStats: [
    { area: "SQL (Section A)", avg: 50 },
    { area: "OOP: object class & UI", avg: 48.8 },
    { area: "OOP: files & arrays", avg: 37.7 },
    { area: "OOP: strings & dates", avg: 11.7 },
    { area: "OOP: algorithms", avg: 1.8 }
  ],

  sqlDialects: [
    { feature: "Wildcard: any characters", access: "LIKE 'Vid*'", mysql: "LIKE 'Vid%'", javadb: "LIKE 'Vid%'" },
    { feature: "Wildcard: exactly one character", access: "LIKE 'B?ll'", mysql: "LIKE 'B_ll'", javadb: "LIKE 'B_ll'" },
    { feature: "Text literal", access: "'Gauteng' or \"Gauteng\"", mysql: "'Gauteng'", javadb: "'Gauteng' (\"x\" = a column name)" },
    { feature: "Date literal", access: "#2025/03/25#", mysql: "'2025-03-25'", javadb: "'2025-03-25' or DATE('2025-03-25')" },
    { feature: "Today's date", access: "Date()   (Now() adds the time)", mysql: "CURDATE()   (NOW() adds the time)", javadb: "CURRENT_DATE" },
    { feature: "Year / month / day of a date", access: "YEAR(d), MONTH(d), DAY(d)", mysql: "YEAR(d), MONTH(d), DAY(d)", javadb: "YEAR(d), MONTH(d), DAY(d)" },
    { feature: "Days between two dates", access: "EndDate - StartDate  or  DateDiff('d', StartDate, EndDate)", mysql: "DATEDIFF(EndDate, StartDate)", javadb: "{fn TIMESTAMPDIFF(SQL_TSI_DAY, StartDate, EndDate)}" },
    { feature: "Add days to a date", access: "DateAdd('d', 30, d)", mysql: "DATE_ADD(d, INTERVAL 30 DAY)", javadb: "{fn TIMESTAMPADD(SQL_TSI_DAY, 30, d)}" },
    { feature: "Join text", access: "First & ' ' & Last", mysql: "CONCAT(First, ' ', Last)", javadb: "First || ' ' || Last" },
    { feature: "Length of text", access: "LEN(s)", mysql: "LENGTH(s)", javadb: "LENGTH(s)" },
    { feature: "Part of text (start 3, 2 chars)", access: "MID(s, 3, 2)", mysql: "SUBSTRING(s, 3, 2)", javadb: "SUBSTR(s, 3, 2)" },
    { feature: "First / last 3 characters", access: "LEFT(s, 3) / RIGHT(s, 3)", mysql: "LEFT(s, 3) / RIGHT(s, 3)", javadb: "SUBSTR(s, 1, 3) / SUBSTR(s, LENGTH(s) - 2)" },
    { feature: "Upper / lower case", access: "UCASE(s) / LCASE(s)", mysql: "UPPER(s) / LOWER(s)", javadb: "UPPER(s) / LOWER(s)" },
    { feature: "Round / format to 2 decimals", access: "ROUND(x, 2)  or  FORMAT(x, '0.00')", mysql: "ROUND(x, 2)  or  FORMAT(x, 2)", javadb: "no ROUND: FLOOR(x * 100 + 0.5) / 100" },
    { feature: "Random whole number 1-6", access: "INT(RND() * 6) + 1", mysql: "FLOOR(RAND() * 6) + 1", javadb: "CAST(RANDOM() * 6 AS INT) + 1" },
    { feature: "Whole-number part", access: "INT(x)", mysql: "FLOOR(x)", javadb: "FLOOR(x)  or  CAST(x AS INT)" },
    { feature: "If / else in a column", access: "IIF(Fee > 400, 'High', 'Low')", mysql: "IF(Fee > 400, 'High', 'Low')", javadb: "CASE WHEN Fee > 400 THEN 'High' ELSE 'Low' END" },
    { feature: "Only the first 3 rows", access: "SELECT TOP 3 * FROM t ORDER BY Fee DESC", mysql: "SELECT * FROM t ORDER BY Fee DESC LIMIT 3", javadb: "SELECT * FROM t ORDER BY Fee DESC FETCH FIRST 3 ROWS ONLY" },
    { feature: "Yes/No (boolean) field", access: "WHERE Solo = True   (or just WHERE Solo)", mysql: "WHERE Solo = TRUE", javadb: "WHERE Solo = TRUE" },
    { feature: "Empty (NULL) field", access: "WHERE f IS NULL", mysql: "WHERE f IS NULL", javadb: "WHERE f IS NULL" }
  ],

  resources: [
    { title: "W3Schools SQL Tutorial", url: "https://www.w3schools.com/sql/default.asp", why: "Quick refresher on every SELECT, JOIN, GROUP BY and action query, with a try-it-yourself editor." },
    { title: "W3Schools MS Access Functions", url: "https://www.w3schools.com/sql/sql_ref_msaccess.asp", why: "One page of Access SQL functions (Left, Mid, Len, InStr, DateDiff, Format, Rnd, IIf) with examples." },
    { title: "Apache Derby (JavaDB) built-in functions", url: "https://db.apache.org/derby/docs/10.16/ref/rrefsqlj29026.html", why: "The official list of what JavaDB actually supports (SUBSTR, LENGTH, RANDOM, YEAR...), and what it doesn't (no ROUND, LEFT or IIF)." },
    { title: "Apache Derby JDBC escape functions", url: "https://db.apache.org/derby/docs/10.16/ref/rrefjdbc88908.html", why: "Exact syntax for {fn TIMESTAMPDIFF(SQL_TSI_DAY, d1, d2)} and TIMESTAMPADD for JavaDB date maths." },
    { title: "W3Schools Java Classes and Objects", url: "https://www.w3schools.com/java/java_classes.asp", why: "Short, learner-friendly recap of classes, objects, fields and methods before you write the object class." },
    { title: "W3Schools Java String Methods", url: "https://www.w3schools.com/java/java_ref_string.asp", why: "Every String method in one table: charAt, substring, indexOf, split, compareTo, equalsIgnoreCase." },
    { title: "Oracle Java docs: LocalDate", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/LocalDate.html", why: "Exact method names if you blank: now, parse, plusDays, isBefore, getYear, getDayOfWeek." },
    { title: "Oracle Java docs: DateTimeFormatter", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/time/format/DateTimeFormatter.html", why: "The pattern-letter table: dd, MM (month), MMM, yyyy, and mm (minutes, not months)." },
    { title: "Oracle Java docs: Formatter (String.format / printf)", url: "https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/Formatter.html", why: "Format-string rules behind %-15s, %8.2f and %n for lining up columns exactly." },
    { title: "IEB NSC past papers", url: "https://www.ieb.co.za/assessment/high-schools/national-senior-certificate/nsc-past-papers", why: "Official source for the last five years of IEB papers and marking guidelines." }
  ]
};
