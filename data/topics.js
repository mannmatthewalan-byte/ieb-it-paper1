/* IEB IT Paper 1 — examinable topics (SAGS 2025 Appendix G + what 2021–May 2026 papers actually asked).
 * years[] = IEB papers (Nov 2021–2025, May 2026 → 2026) in which the topic earned marks.
 * priority: 3 = in almost every paper, 2 = sometimes / recent, 1 = in the SAGS but rarely examined.
 * SQL examples are MS Access unless marked otherwise.
 */
window.P1_TOPICS = [
/* ============================== SQL ============================== */
{
  id: "sql-select-where", section: "SQL",
  title: "SELECT, WHERE & operators (AND/OR/NOT, BETWEEN, IN, IS NULL)",
  summary: "Pick columns with SELECT, filter rows with WHERE. Every paper opens with one or two of these worth 4–6 marks each.",
  points: [
    "Clause order is fixed: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY.",
    "SELECT * = every column. Only list the columns asked for, in the order shown in the sample output.",
    "Text and dates need delimiters ('Gauteng', #2025/03/25#); numbers and True/False do not.",
    "Not equal: <> (works everywhere). NOT Province = 'Gauteng' is also accepted.",
    "AND binds tighter than OR — bracket every OR that is combined with an AND.",
    "BETWEEN a AND b is inclusive of both ends. IN ('A', 'B') replaces A OR B tests on the same field.",
    "Yes/No (Boolean) fields: WHERE Solo = True (or just WHERE Solo); WHERE Loyalty = False (or NOT Loyalty).",
    "Empty values: IS NULL / IS NOT NULL. '= NULL' never matches anything.",
    "You can compare two fields of the same row: WHERE CurrQty < LowQty.",
    "'Parameter-style' questions give you a value (a province, a product ID): type that literal into the query. Only use an Access prompt like [Enter province] if the question asks for user input.",
    "Don't add an alias unless the question names the column — every paper prints that rule."
  ],
  code: [{ title: "Template", lang: "sql", code: `SELECT Field1, Field2
FROM tblTable
WHERE (FieldA = 'Text' OR FieldA = 'Other')
  AND FieldB BETWEEN 10 AND 20
  AND FieldC IN ('X', 'Y')
  AND FieldD IS NULL
  AND BoolField = True;` }, {
    title: "Real examples", lang: "sql", code: `SELECT * FROM tblClients
WHERE Loyalty = 3 AND Province <> 'Gauteng';

SELECT * FROM tblServiceAgents
WHERE Experience BETWEEN 2 AND 5
  AND Department IN ('Maintenance', 'Admin');` }],
  pitfalls: [
    "Quoting a number field ('3') or not quoting a text value.",
    "Mixing AND and OR without brackets.",
    "Writing Solo = 'Yes' for a Boolean field.",
    "Renaming columns when not asked."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-like-wildcards", section: "SQL",
  title: "LIKE & wildcards (per dialect)",
  summary: "Pattern matching on text. Access uses * and ?, MySQL/JavaDB use % and _. Examined in every paper.",
  points: [
    "Access: * = any number of characters, ? = exactly one character, # = one digit, [ABC] = one of A/B/C, [!A] = not A.",
    "MySQL / JavaDB: % = any number, _ = exactly one.",
    "Starts with: 'M*'.  Ends with: '*GP'.  Contains: '*pack*'.  Third character is a space: '?? *'.",
    "Access and MySQL LIKE are case-insensitive by default; JavaDB is case-sensitive (use LOWER(field) LIKE ...).",
    "NOT LIKE excludes matches. An alternative for 'ends with' is RIGHT(field, n) = '...'.",
    "Use the wildcard of the DBMS you actually ran the query in — the memo accepts either, but be consistent."
  ],
  code: [{ title: "Template (Access)", lang: "sql", code: `SELECT ProdName, Fee
FROM tblProducts
WHERE (ProdName LIKE '*Premium' OR ProdName LIKE '*Deluxe')
  AND Fee > 400;

-- MySQL / JavaDB: LIKE '%Premium'` }, {
    title: "Single-character wildcard", lang: "sql", code: `-- registration ending in GP whose 3rd character is a space
SELECT * FROM tblCars
WHERE CarRegistration LIKE '?? *GP';     -- MySQL: '__ %GP'` }],
  pitfalls: [
    "Using = instead of LIKE with a wildcard (= '*GP' looks for a literal asterisk).",
    "Forgetting the leading wildcard: 'Premium*' means STARTS with Premium.",
    "'*gmail.com' also matches '@googlemail.com' — include the @ when it matters."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-order-by", section: "SQL",
  title: "ORDER BY, DISTINCT, TOP / LIMIT",
  summary: "Sorting (ascending is the default), removing duplicate rows and limiting the number of rows.",
  points: [
    "ORDER BY Field ASC (default) or DESC. 'Most recent / highest first' = DESC.",
    "Several sort keys: ORDER BY AgentID, PriorityLevel — the first is the main sort, the second breaks ties.",
    "You may sort by a calculation: ORDER BY COUNT(*) DESC. Access will not sort by an alias of an aggregate; MySQL will.",
    "DISTINCT removes duplicate rows of the selected columns: SELECT DISTINCT Province FROM tblClients.",
    "Access: SELECT TOP 3 ... ORDER BY ... (TOP returns ties too). MySQL: ... ORDER BY ... LIMIT 3. JavaDB: FETCH FIRST 3 ROWS ONLY.",
    "For 'the highest/lowest value(s)' prefer a MAX/MIN sub-query — it returns all tied rows in every DBMS."
  ],
  code: [{ title: "Template", lang: "sql", code: `SELECT Genre, COUNT(*) AS NumMovies
FROM tblMovies
GROUP BY Genre
ORDER BY COUNT(*) DESC, Genre ASC;

SELECT TOP 3 UnivName, DateOpened
FROM tblUniversity
ORDER BY DateOpened;          -- three oldest` }],
  pitfalls: [
    "ORDER BY goes LAST (after GROUP BY/HAVING).",
    "Forgetting DESC when the question says 'from most to least'.",
    "Using TOP 1 / LIMIT 1 when two rows tie for the maximum."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-aggregates", section: "SQL",
  title: "Aggregate functions: COUNT, SUM, AVG, MAX, MIN",
  summary: "Collapse many rows into one value. Used alone (one-row answer) or with GROUP BY (one row per group).",
  points: [
    "COUNT(*) counts rows; COUNT(Field) counts non-empty values of that field.",
    "SUM adds a number field; to total 'orders placed' when the count is stored per row, SUM it — don't COUNT.",
    "AVG, MAX, MIN work on numbers and dates (MAX(date) = latest).",
    "Without GROUP BY you may not mix an aggregate with an ordinary column (SELECT Name, MAX(Fee) is an error).",
    "Aggregates can't go in WHERE — use a sub-query (WHERE Fee > (SELECT AVG(Fee) ...)) or HAVING.",
    "Name the result when asked: COUNT(*) AS NumSales.",
    "You can aggregate a calculation: SUM(NumTickets * TicketPrice)."
  ],
  code: [{ title: "Template", lang: "sql", code: `SELECT COUNT(*) AS NumSales FROM tblSales;

SELECT AVG(TicketCost) AS AveCost
FROM tblFestivals
WHERE Capacity < 10000;

SELECT ROUND(SUM(Enrolment) * 1.046, 1) AS Total2025
FROM tblUniversity;` }],
  pitfalls: [
    "Putting AVG/SUM inside WHERE.",
    "Selecting an un-grouped field next to an aggregate.",
    "COUNT(field) silently skips Nulls — use COUNT(*) to count rows."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-group-by", section: "SQL",
  title: "GROUP BY & HAVING",
  summary: "One summary row per group (per province, per festival, per department). HAVING filters the groups. A 5–8 mark question every year.",
  points: [
    "Every column in SELECT that is not aggregated must be in GROUP BY.",
    "WHERE filters rows BEFORE grouping; HAVING filters groups AFTER grouping.",
    "HAVING must repeat the aggregate in Access (HAVING SUM(Fee) > 1000), not the alias. MySQL accepts the alias.",
    "Group by a calculation when needed: GROUP BY YEAR(DepartureDate) (Access needs the expression, not the alias).",
    "If the same name repeats on different dates, group by BOTH (GROUP BY FestName, FestDate).",
    "GROUP BY + JOIN is the classic 7–8 mark question: join first, then group."
  ],
  code: [{ title: "Template", lang: "sql", code: `SELECT GroupField, AGG(Field) AS Alias
FROM tables
WHERE row_condition
GROUP BY GroupField
HAVING AGG(Field) > value
ORDER BY AGG(Field) DESC;` }, {
    title: "Real example (3 tables)", lang: "sql", code: `SELECT Province, SUM(Fee) AS ValueOfSales
FROM tblProducts, tblSales, tblClients
WHERE tblProducts.ProdID = tblSales.ProdID
  AND tblSales.ClientID = tblClients.ClientID
GROUP BY Province
HAVING SUM(Fee) > 1000;` }],
  pitfalls: [
    "Aggregate condition in WHERE (error) or row condition in HAVING (works only if the field is grouped — but loses the mark).",
    "Using the alias in HAVING in Access.",
    "Forgetting a selected field in GROUP BY."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-joins", section: "SQL",
  title: "Joins: 2- and 3-table (WHERE join, INNER JOIN, LEFT JOIN)",
  summary: "Combine tables by matching a foreign key to a primary key. Every paper has 2–3 join questions, usually 3 tables via the link table.",
  points: [
    "n tables need n − 1 join conditions. The middle (link) table — tblSales, tblBookings — joins to both others.",
    "WHERE-style join: FROM A, B WHERE A.ID = B.ID — simplest to type and accepted in every memo.",
    "INNER JOIN style: FROM A INNER JOIN B ON A.ID = B.ID. Access needs brackets for 3 tables: FROM A INNER JOIN (B INNER JOIN C ON B.x = C.x) ON A.y = B.y.",
    "A field that exists in two tables must be prefixed: tblCars.CarRegistration.",
    "LEFT JOIN keeps every row from the left table even with no match — then WHERE right.key IS NULL finds the unmatched ones.",
    "Read the table descriptions: they tell you which field is the foreign key to which table.",
    "Check the row count against the sample output — far too many rows means a missing join condition (Cartesian product)."
  ],
  code: [{ title: "3-table WHERE join", lang: "sql", code: `SELECT FullName, Title, ShowDate, NumTickets * TicketPrice AS TotalCost
FROM tblCustomers, tblMovies, tblBookings
WHERE tblCustomers.CustID = tblBookings.CustID
  AND tblMovies.MovieID = tblBookings.MovieID
  AND Cinema = 'Canal Walk';` }, {
    title: "3-table INNER JOIN (Access brackets)", lang: "sql", code: `SELECT FestName, FestDate, SUM(Fee) AS TotalFee
FROM tblMusicians INNER JOIN
     (tblFestivals INNER JOIN tblBookings
        ON tblFestivals.FestID = tblBookings.FestID)
  ON tblMusicians.MusID = tblBookings.MusID
GROUP BY FestName, FestDate
ORDER BY FestDate DESC;` }],
  pitfalls: [
    "Missing one join condition → every total is wrong.",
    "Ambiguous field name error — prefix with the table name.",
    "Using INNER JOIN to look for rows that have NO match (it can never find them)."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-calculated", section: "SQL",
  title: "Calculated fields, aliases, ROUND / INT / FORMAT, \\ and MOD",
  summary: "Build new columns from arithmetic or text, name them with AS, and control decimals.",
  points: [
    "Calculated column: Capacity * TicketPrice AS Income. Spell the alias exactly as given.",
    "Percent changes: +50% → * 1.5; 10% cheaper → * 0.9; +4.6% → * 1.046.",
    "ROUND(x, 2) rounds to 2 decimals (Access uses banker's rounding for exact .5). INT(x) drops decimals. FORMAT(x, '0.00') returns TEXT formatted to 2 decimals.",
    "Access integer division is the backslash: 128 \\ 60 = 2; remainder: 128 MOD 60 = 8. MySQL: DIV and MOD. JavaDB: / on integers and MOD(a, b).",
    "Ages / durations from dates belong to the date-function topic (DateDiff, DateAdd).",
    "Alias with spaces or a reserved word needs brackets in Access: AS [Password], AS [Total Cost].",
    "JavaDB has no ROUND: FLOOR(x * 100 + 0.5) / 100."
  ],
  code: [{ title: "Template", lang: "sql", code: `SELECT DomainName, Package, Cost * 1.5 AS BargainPrice
FROM tblDomains, tblPackages
WHERE tblDomains.PackageID = tblPackages.PackageID;

SELECT MissionID, ROUND(Distance / Speed, 2) AS TimeInYears
FROM tblMissions, tblSpaceShips
WHERE tblMissions.SpaceshipID = tblSpaceShips.SpaceshipID;

SELECT Title, (Duration \\ 60) & 'h ' & (Duration MOD 60) & 'm' AS Runtime
FROM tblMovies;` }],
  pitfalls: [
    "Using FORMAT when the question says round (it turns the number into text).",
    "Duration / 60 in Access gives decimals — use \\ or INT().",
    "Alias misspelt or missing → loses the alias mark."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-string-functions", section: "SQL",
  title: "String functions: LEFT, RIGHT, MID, LEN, InStr, UCASE, & / CONCAT",
  summary: "Cut and join text in queries — usually inside an UPDATE (rename part of a value) or a calculated column.",
  points: [
    "LEFT(s, n) first n chars; RIGHT(s, n) last n chars; MID(s, start, n) n chars from position start (1-based!). MID(s, start) = from start to the end.",
    "LEN(s) in Access; LENGTH(s) in MySQL/JavaDB.",
    "Concatenate: Access &, MySQL CONCAT(a, b, c), JavaDB a || b.",
    "Remove a known ending: LEFT(s, LEN(s) - k). Remove a known start: MID(s, k + 1) or RIGHT(s, LEN(s) - k).",
    "Position of a character: InStr(s, '@') in Access; LOCATE('@', s) or INSTR(s, '@') in MySQL; LOCATE('@', s) in JavaDB.",
    "UCASE/LCASE in Access (UPPER/LOWER also in MySQL/JavaDB). TRIM removes outer spaces.",
    "JavaDB has no LEFT/RIGHT — use SUBSTR(s, 1, n) and SUBSTR(s, LENGTH(s) - n + 1).",
    "Count characters carefully: 'Deluxe' = 6, 'Volkswagen' = 10, '@telkomsa.net' = 13, '.in' = 3."
  ],
  code: [{ title: "Rename an ending (Access / MySQL)", lang: "sql", code: `UPDATE tblProducts
SET ProdName = LEFT(ProdName, LEN(ProdName) - 6) & 'Premium'
WHERE ProdName LIKE '*Deluxe';

-- MySQL
UPDATE tblProducts
SET ProdName = CONCAT(LEFT(ProdName, LENGTH(ProdName) - 6), 'Premium')
WHERE ProdName LIKE '%Deluxe';` }, {
    title: "Replace a start / pieces", lang: "sql", code: `UPDATE tblCars
SET Model = 'VW' & MID(Model, 11)
WHERE Model LIKE 'Volkswagen*';

SELECT RIGHT(UnivName, 4) & MID(Province, 2, 2) AS Code
FROM tblUniversity;

SELECT LEFT(Email, InStr(Email, '@') - 1) AS UserName
FROM tblCustomers;` }],
  pitfalls: [
    "Off-by-one: SQL positions start at 1, Java's at 0.",
    "Using + to join text in MySQL (it adds numbers).",
    "Forgetting the space when gluing words: 'VW' & ' Golf'."
  ],
  years: [2021, 2022, 2023, 2024, 2025], priority: 3
},
{
  id: "sql-date-functions", section: "SQL",
  title: "Date functions: Date(), Now(), YEAR/MONTH/DAY, DateDiff, DateAdd",
  summary: "Every paper has at least one 'don't hard-code today' question. Know today's date per dialect and how to do accurate ages.",
  points: [
    "Today: Access Date() (or Now(), which includes the time); MySQL CURDATE() / NOW(); JavaDB CURRENT_DATE.",
    "Parts: YEAR(d), MONTH(d), DAY(d); HOUR(t), MINUTE(t) for times.",
    "Access date literal #2025/03/25# (yyyy/mm/dd is unambiguous). MySQL/JavaDB: '2025-03-25'.",
    "Days between: Access DateDiff('d', start, end) (or end - start); MySQL DATEDIFF(end, start) — reversed order!; JavaDB {fn TIMESTAMPDIFF(SQL_TSI_DAY, start, end)}.",
    "Calendar-year rules ('this year', 'until end of next year'): compare YEAR(Date()) - YEAR(d).",
    "Accurate age (to the day): Access DateAdd('yyyy', 18, DOB) > Date() means under 18. MySQL TIMESTAMPDIFF(YEAR, DOB, CURDATE()). DateDiff('yyyy', ...) only counts year boundaries — not accurate.",
    "A month in a specific year: BETWEEN #2025/12/01# AND #2025/12/31#, or YEAR(d) = 2025 AND MONTH(d) = 12.",
    "'Before today': FestDate < Date(). 'Not yet departed': DepartureDate > Date()."
  ],
  code: [{ title: "Common patterns (Access)", lang: "sql", code: `-- support until end of next calendar year
SELECT License, SaleDate FROM tblSales
WHERE YEAR(Date()) - YEAR(SaleDate) <= 1;

-- rental days x rate
SELECT DateDiff('d', StartDate, EndDate) * DailyRate AS RentAmount
FROM tblRentedParkings, tblParkings
WHERE tblRentedParkings.ParkingID = tblParkings.ParkingID;

-- under 18 today, accurate to the day
SELECT FullName, DOB FROM tblCustomers
WHERE DateAdd('yyyy', 18, DOB) > Date();

-- first six months of each year
SELECT YEAR(DepartureDate) AS YearOfMission, COUNT(*) AS NumberOfMissions
FROM tblMissions
WHERE MONTH(DepartureDate) <= 6
GROUP BY YEAR(DepartureDate);` }],
  pitfalls: [
    "Hard-coding the current year or date when the paper says 'current' — zero for that mark.",
    "Using DateDiff in days with 365 for a calendar-year rule.",
    "MySQL DATEDIFF argument order (later date first).",
    "Your output will differ from the paper's if you practise in a later year — expected."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-insert", section: "SQL",
  title: "INSERT INTO … VALUES and INSERT INTO … SELECT",
  summary: "Add rows. Recent papers prefer INSERT … SELECT (copy rows with changes, or one row per matching record) worth 7–9 marks.",
  points: [
    "Single row: INSERT INTO tbl (f1, f2, f3) VALUES (v1, v2, v3). Values in the same order as the field list.",
    "Never insert into an AutoNumber ID — leave it out of the field list.",
    "Many rows: INSERT INTO tbl (f1, f2, f3) SELECT x, 'literal', y + 20 FROM ... WHERE ... — no VALUES keyword.",
    "The SELECT can contain literals (5, 'Voucher', #2030/01/01#), calculations (TicketCost + 20, ItemPrice * 0.9), Date(), and random numbers.",
    "Typical filters in the SELECT: LIKE '*Fire*', YEAR(FestDate) = 2024, ID NOT IN (SELECT ID FROM other).",
    "Run an INSERT only once — running it twice doubles the new rows. Keep a backup of the database."
  ],
  code: [{ title: "Templates", lang: "sql", code: `INSERT INTO tblSales (ProdID, ClientID, License, SaleDate)
VALUES (14, 25, INT(RND() * 1000001) + 1000000, #2025/03/25#);

INSERT INTO tblFestivals (FestName, FestDate, Capacity, TicketCost)
SELECT FestName, #2025/01/01#, Capacity, TicketCost + 20
FROM tblFestivals
WHERE FestName LIKE '*Fire*' AND YEAR(FestDate) = 2024;

INSERT INTO tblMissions (CaptainID, SpaceshipID, MainObjective, DepartureDate, Distance, SolarSystem)
SELECT CaptainID, INT(RND(CaptainID) * 30) + 1, 'Exploration', #2030/01/01#, 5, 'Alpha-Centauri'
FROM tblCaptains
WHERE CaptainID NOT IN (SELECT CaptainID FROM tblMissions);` }],
  pitfalls: [
    "Writing VALUES in front of a SELECT.",
    "Field list and value list in different orders.",
    "Including the AutoNumber primary key."
  ],
  years: [2021, 2022, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-update", section: "SQL",
  title: "UPDATE … SET … WHERE and DELETE",
  summary: "Change or remove existing rows. The UPDATE usually combines string functions (rename part of a value); DELETE is a simple 4-marker.",
  points: [
    "UPDATE tbl SET Field = newValue WHERE condition. Without WHERE every row changes.",
    "Several fields: SET A = 1, B = 'x'.",
    "The new value can use the old one: SET TicketCost = TicketCost * 1.1, SET Name = Name & ' (VIP)'.",
    "DELETE FROM tbl WHERE condition (Access also accepts DELETE * FROM; MySQL does not).",
    "A sub-query can drive either: DELETE FROM tblItems WHERE ItemID NOT IN (SELECT ItemID FROM tblItemSuppliers).",
    "These are graded on the SQL text — but running them twice changes your data. Back up the database first."
  ],
  code: [{ title: "Templates", lang: "sql", code: `UPDATE tblFestivals
SET TicketCost = 0
WHERE FestName = 'Coffee and Cake';

UPDATE tblMissions
SET MainObjective = 'Scouting'
WHERE DepartureDate > Date()
  AND MainObjective = 'Military Exercise'
  AND RIGHT(SolarSystem, 1) NOT IN ('A', 'B', 'C');

DELETE FROM tblParkings
WHERE DateAdded < #2018/01/01#;` }],
  pitfalls: [
    "No WHERE clause.",
    "DELETE * FROM in MySQL (syntax error).",
    "Using SELECT-style 'UPDATE ... FROM' syntax — Access/MySQL don't need FROM in UPDATE."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-subqueries", section: "SQL",
  title: "Subqueries, NOT IN & finding records with no match",
  summary: "A query inside brackets supplies a value (AVG, MAX) or a list (IDs) to the outer query. Examined in 5 of the last 6 papers.",
  points: [
    "Compare with an aggregate: WHERE Fee > (SELECT AVG(Fee) FROM tblProducts).",
    "Highest/lowest including ties: WHERE DailyRate = (SELECT MAX(DailyRate) FROM tblParkings).",
    "Records with NO related records: WHERE ID NOT IN (SELECT ID FROM linkTable).",
    "Same with LEFT JOIN: FROM A LEFT JOIN B ON A.ID = B.ID WHERE B.ID IS NULL.",
    "Sub-queries can have their own WHERE: NOT IN (SELECT CustID FROM tblBookings WHERE YEAR(ShowDate) = YEAR(Date())).",
    "Used inside INSERT … SELECT and DELETE too."
  ],
  code: [{ title: "Templates", lang: "sql", code: `SELECT ProdName, Fee
FROM tblProducts
WHERE Fee > (SELECT AVG(Fee) FROM tblProducts);

SELECT LEFT(StageName, 3)
FROM tblMusicians
WHERE MusID NOT IN (SELECT MusID FROM tblBookings);

SELECT tblCars.CarRegistration, Model
FROM tblCars LEFT JOIN tblRentedParkings
  ON tblCars.CarRegistration = tblRentedParkings.CarRegistration
WHERE tblRentedParkings.CarRegistration IS NULL;` }],
  pitfalls: [
    "Hard-coding the average you calculated by hand.",
    "A sub-query used with = must return ONE value; use IN for a list.",
    "Using an INNER JOIN to find 'never booked' items."
  ],
  years: [2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "sql-random", section: "SQL",
  title: "Random numbers in SQL: RND / RAND with INT / FLOOR",
  summary: "Generate a random whole number in a range, usually inside an INSERT. 2021, 2022 and 2025 all used it.",
  points: [
    "Whole number from a to b inclusive: INT(RND() * (b - a + 1)) + a. Example 1–30: INT(RND() * 30) + 1.",
    "1 000 000 to 2 000 000: INT(RND() * 1000001) + 1000000.",
    "MySQL: FLOOR(RAND() * (b - a + 1)) + a. JavaDB: FLOOR(RANDOM() * (b - a + 1)) + a (RANDOM() and RAND(seed) both exist).",
    "Access gotcha: RND() without an argument is evaluated once per query, so every inserted row gets the same number. Pass a field — RND(CaptainID) — to get a new number per row.",
    "Random digit glued to text: (INT(RND(DomainID) * 5) + 1) & DomainName."
  ],
  code: [{ title: "Templates", lang: "sql", code: `-- Access
SELECT CaptainID, INT(RND(CaptainID) * 30) + 1 AS Ship FROM tblCaptains;

-- MySQL
SELECT CaptainID, FLOOR(RAND() * 30) + 1 AS Ship FROM tblCaptains;` }],
  pitfalls: [
    "RND() * 30 without INT gives decimals; INT(RND() * 30) gives 0–29 (forgot + 1).",
    "Same value on every row in Access (no field argument)."
  ],
  years: [2021, 2022, 2025], priority: 2
},
{
  id: "sql-dialects", section: "SQL",
  title: "Access vs MySQL vs JavaDB — what changes",
  summary: "The paper is set dialect-free and memos accept all three. Write the version for the DBMS you used, consistently. See the dialect table in the plan.",
  points: [
    "Wildcards: Access * ? — MySQL/JavaDB % _.",
    "Text join: Access & — MySQL CONCAT() — JavaDB ||.",
    "Length: LEN (Access) vs LENGTH. Part of a string: MID (Access, MySQL) vs SUBSTR (JavaDB, MySQL).",
    "Today: Date()/Now() vs CURDATE()/NOW() vs CURRENT_DATE.",
    "Date literals: #2025/03/25# vs '2025-03-25'.",
    "Random: RND() vs RAND() vs RANDOM(); whole numbers with INT vs FLOOR.",
    "Row limit: TOP n (after SELECT) vs LIMIT n (at the end) vs FETCH FIRST n ROWS ONLY.",
    "If-then in a query: Access IIf(cond, a, b); MySQL IF(cond, a, b); JavaDB CASE WHEN cond THEN a ELSE b END.",
    "Aliases in HAVING/ORDER BY: MySQL allows them, Access doesn't — repeating the expression works everywhere."
  ],
  code: [{ title: "Same query, three dialects", lang: "sql", code: `-- Access
SELECT FullName, Email FROM tblCustomers
WHERE Email LIKE '*@gmail.com' AND YEAR(DOB) < YEAR(Date()) - 18;

-- MySQL
SELECT FullName, Email FROM tblCustomers
WHERE Email LIKE '%@gmail.com' AND YEAR(DOB) < YEAR(CURDATE()) - 18;

-- JavaDB
SELECT FullName, Email FROM tblCustomers
WHERE Email LIKE '%@gmail.com' AND YEAR(DOB) < YEAR(CURRENT_DATE) - 18;` }],
  pitfalls: ["Mixing dialects inside one statement (e.g. * wildcard with CONCAT)."],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 2
},
/* ============================== OOP ============================== */
{
  id: "oop-class-anatomy", section: "OOP",
  title: "Class anatomy: header, private fields, imports, has-a fields",
  summary: "Q2/Q3 always start with 'create the class with these fields, not accessible outside the class' — 3–5 easy marks.",
  points: [
    "public class Name { ... } — file name must match the class name (Name.java).",
    "'Not accessible outside the class' = private. '-' in a class diagram = private, '+' = public.",
    "Types: string → String, integer → int, real → double, boolean → boolean, Date → LocalDate (LocalDateTime if there's a time), array → Type[].",
    "Field names exactly as in the diagram (case matters).",
    "A field can be an object of another class you wrote (Server has a Technician assignedTech) or an array (String[] macArr). It is null until you assign it.",
    "Imports go above the class: java.time.LocalDate, java.time.format.DateTimeFormatter, java.util.Scanner, java.io.File, java.io.FileNotFoundException.",
    "Put your exam number in a comment at the top of every class."
  ],
  code: [{ title: "Template", lang: "java", code: `// Exam number: 1234567
import java.time.LocalDate;

public class Song {
    private String artistName;
    private String title;
    private int likes;
    private LocalDate released;
    private String[] tags;          // array field
    private Musician artist;        // object field (has-a)
}` }],
  pitfalls: [
    "Leaving fields public or package-private (penalised once).",
    "Storing a date as a String.",
    "Re-declaring the parent's fields in a child class."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "oop-constructors", section: "OOP",
  title: "Constructors: parameterised, default, overloaded, parsing in the constructor",
  summary: "Assign parameters to fields, sometimes converting (parse a date, split seats, build an array). 3–6 marks each class.",
  points: [
    "No return type, same name as the class: public Free(String inN, String inE, String inA) { ... }.",
    "Parameter names, types AND order must match the class diagram exactly — that is often a mark on its own.",
    "If a parameter has the same name as a field use this.name = name; otherwise just name = inN.",
    "Convert inside when told: actDate = LocalDate.parse(inA, DateTimeFormatter.ofPattern(\"dd MM yyyy\")); seats = inSeats.split(\",\");.",
    "Create array fields in the constructor: macArr = new String[qty]; then fill with a loop.",
    "Default constructor = no parameters (sets default values). Overloading = several constructors with different parameter lists.",
    "Static counters are incremented in the constructor (bookingCount++)."
  ],
  code: [{ title: "Template", lang: "java", code: `public Premium(String inN, String inE, String inA, String inL, int inQ) {
    super(inN, inE, inA);            // child: parent constructor FIRST
    licNo = inL;
    qty = inQ;
    macArr = new String[qty];
    for (int i = 0; i < qty; i++) {
        macArr[i] = "Available";
    }
}

// overloaded constructors
public Song() {
    this("Unknown", "Untitled", 0, 0);   // calls the 4-parameter one
}
public Song(String inAN, String inTitle, int inL, int inD) {
    artistName = inAN; title = inTitle; likes = inL; dislikes = inD;
}` }],
  pitfalls: [
    "Adding void to a constructor turns it into an ordinary method.",
    "Shadowing: name = name; assigns the parameter to itself.",
    "Creating the array before qty has a value."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "oop-accessors-mutators", section: "OOP",
  title: "Accessors (getters) & mutators (setters)",
  summary: "1–2 marks each, all-or-nothing. Getters return a field; setters are void and take one parameter.",
  points: [
    "public Type getField() { return field; } — return type = field type.",
    "public void setField(Type inX) { field = inX; }",
    "boolean getters may be named isX or getX — use the diagram's name (getDiscount, getWellLiked).",
    "A 'getter' can return a calculated/formatted value (getFullName returning 'Surname I', getGenre returning text for an int code).",
    "Other classes must use getters/setters — private fields can't be reached directly, not even from a child class."
  ],
  code: [{ title: "Template", lang: "java", code: `public String getName() {
    return name;
}

public void setEmail(String inE) {
    email = inE;
}

public boolean getWellLiked() {
    return likes > dislikes;
}` }],
  pitfalls: ["Setter with a return type, or getter that prints instead of returns."],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "oop-tostring", section: "OOP",
  title: "toString methods & exact output formatting",
  summary: "Every class has one (2–6 marks each, ~11 marks per paper). The child reuses super.toString(); the manager joins all objects.",
  points: [
    "Header: public String toString() — add @Override.",
    "Match the sample output EXACTLY: literals, spaces, \\t tabs, \\n new lines, brackets.",
    "LocalDate prints as yyyy-MM-dd and LocalDateTime as yyyy-MM-ddTHH:mm automatically.",
    "Call methods inside toString for calculated values: getParkingFee(), getGenre(), getShortName() — then a child override is used automatically.",
    "Child: return super.toString() + \" \" + extraField; — the super call is a mark.",
    "Manager toString: loop to the counter, append each object + \"\\n\" (blank line between = \"\\n\\n\"), RETURN the string.",
    "System.out.println(obj) calls obj.toString() for you."
  ],
  code: [{ title: "Parent, child, manager", lang: "java", code: `// parent
@Override
public String toString() {
    return name + "\\t" + email + "\\t" + actDate;
}

// child
@Override
public String toString() {
    return super.toString() + "\\t" + licNo + "\\t" + qty;
}

// manager
@Override
public String toString() {
    String out = "Accounts\\n";
    for (int i = 0; i < size; i++) {
        out += arr[i] + "\\n";
    }
    return out;
}` }],
  pitfalls: [
    "Printing inside toString instead of returning.",
    "Looping to arr.length — prints 'null' lines or crashes.",
    "Rebuilding the parent's fields in the child (they're private) instead of calling super.toString()."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "oop-static", section: "OOP",
  title: "static vs instance: constants & class counters",
  summary: "Constants (public static final) appear in every paper, and must then be USED in later code; static counters (2022, practice) count across all objects.",
  points: [
    "Constant: public static final int ACCESS = 0; — ALL_CAPS, final = can't change.",
    "Constant array: public static final double[] COMBO_PRICES = {0.0, 45.0, 70.0, 110.0};",
    "Use constants by name inside the class (case ACCESS:) and via the class name outside (Musician.TECHNO). Using 0/1 instead loses marks.",
    "Static counter: public static int numPromoted = 0; (not final) — one shared copy, incremented in a constructor or method.",
    "Static method: public static int getBookingCount() — called as Booking.getBookingCount().",
    "Instance fields belong to each object; static fields belong to the class.",
    "A static method cannot use instance fields directly.",
    "switch case labels can be static final int/String constants."
  ],
  code: [{ title: "Template", lang: "java", code: `public class Booking {
    public static final double STANDARD_PRICE = 95.0;   // constant
    private static int bookingCount = 0;                 // shared counter

    public Booking(/* ... */) {
        bookingCount++;
    }

    public static int getBookingCount() {
        return bookingCount;
    }
}

// in the UI
System.out.println("Loaded: " + Booking.getBookingCount());
mm.adjustGenre("Samuel Ericson", Musician.TECHNO);` }],
  pitfalls: [
    "Missing final on a constant / adding final to a counter.",
    "Comparing with literals (== 1) where a constant exists.",
    "Printing a static counter before the method that updates it has run."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "oop-inheritance", section: "OOP",
  title: "Inheritance: extends, super(...), @Override, protected, abstract",
  summary: "Parent + child class pair in 2022, 2023, 2025 and May 2026 (Free/Premium, Daily/LongTerm, CrewMember/Officer, Customer/BusinessCust). ~15 marks when it appears.",
  points: [
    "public class Child extends Parent — the child inherits the parent's public methods.",
    "The child constructor's FIRST line is super(parentParams...).",
    "Private parent fields are NOT accessible in the child — use the parent's getters/setters or super.method().",
    "Override = same name, same parameters, same return type. Mark it @Override.",
    "Reuse parent behaviour: super.toString(), super.getDiscount(), super.authorise().",
    "Overloading ≠ overriding: authorise(String mac) in Premium is a NEW method next to the inherited authorise().",
    "protected fields/methods are visible to subclasses (SAGS lists it; IEB diagrams usually use private + getters).",
    "abstract class can't be instantiated; abstract methods have no body and must be overridden. In the SAGS but not examined 2021–2026.",
    "Child IS-A parent: a Premium can be stored in a Free[] array."
  ],
  code: [{ title: "Template", lang: "java", code: `public class LongTerm extends Daily {
    private String parkingBay;
    public static final double RATEPERDAY = 250.0;

    public LongTerm(String inRN, LocalDateTime inEY, LocalDateTime inET, String inPB) {
        super(inRN, inEY, inET);
        parkingBay = inPB;
    }

    @Override
    public double getParkingFee() {
        long days = ChronoUnit.DAYS.between(getEntryDateTime().toLocalDate(),
                                            getExitDateTime().toLocalDate());
        return days * RATEPERDAY;
    }

    @Override
    public String toString() {
        return super.toString() + "\\nParking Bay: " + parkingBay;
    }
}` }],
  pitfalls: [
    "super(...) not first → compile error.",
    "Accessing a private parent field in the child → compile error.",
    "Inside an override, calling the same method without super. → infinite recursion (StackOverflowError)."
  ],
  years: [2022, 2023, 2025, 2026], priority: 3
},
{
  id: "oop-polymorphism", section: "OOP",
  title: "Polymorphism: parent-type arrays, instanceof, casting, dynamic binding",
  summary: "One array holds both parent and child objects; Java runs the right override automatically; instanceof + cast reaches child-only methods.",
  points: [
    "Declare the array with the PARENT type: private Free[] accArr = new Free[40]; — it can hold Free and Premium.",
    "Dynamic binding: accArr[i].toString() / getDiscount() / calcCost() runs the child's version for a child object — no if needed.",
    "Child-only methods (getParkingBay, isValid, promote) need: if (arr[i] instanceof Child) { Child c = (Child) arr[i]; c.childMethod(); }.",
    "Test instanceof Child, not instanceof Parent (every child IS a parent, so that test is always true).",
    "You can't change an object's class: to 'promote' a CrewMember to Officer, create a new Officer and store it in the same array slot.",
    "Temp variable in a sort must be the parent type."
  ],
  code: [{ title: "Template", lang: "java", code: `for (int i = 0; i < size; i++) {
    total += pArr[i].getParkingFee();           // dynamic binding
    if (pArr[i] instanceof LongTerm) {
        LongTerm lt = (LongTerm) pArr[i];        // cast
        bay = lt.getParkingBay();                // child-only method
    }
}

// replace an object with a child object
cArr[pos] = new Officer(c.getFullName(), c.getCrewID(), c.getDepartment(), 1, LocalDate.now());` }],
  pitfalls: [
    "Calling a child-only method on a parent reference without a cast → compile error.",
    "Casting without checking instanceof → ClassCastException at run time."
  ],
  years: [2022, 2023, 2025, 2026], priority: 3
},
{
  id: "oop-helper-methods", section: "OOP",
  title: "Methods: headers, parameters, return types, private helpers",
  summary: "Marks are awarded for the method header itself: correct name, parameter types/order, return type, and private for 'helper' methods.",
  points: [
    "Header = access modifier + return type + name + (parameters): private String processFree(int action, Free account).",
    "'Helper method' → private, called by another method in the same class (countSongs used by listEasyListeners).",
    "Typed method returns a value (return ...; on every path). void method returns nothing.",
    "Return a String that the UI prints — don't print inside the manager unless asked.",
    "Methods can take/return objects and arrays: String[] getOrders(String fileName).",
    "Use the methods you built earlier (isValid, promote, findCrewMember) — the memo gives marks for calling them.",
    "Boolean methods: return the condition directly (return likes > dislikes;).",
    "Local variables live only inside their method/loop — declare counters inside the method so they reset each call."
  ],
  code: [{ title: "Template", lang: "java", code: `private int countSongs(String inName) {        // helper
    int count = 0;
    for (int i = 0; i < songSize; i++) {
        if (songArr[i].getArtistName().equals(inName)) {
            count++;
        }
    }
    return count;
}

public String getGenre() {                      // every path returns
    switch (genre) {
        case ROCK:   return "Rock";
        case TECHNO: return "Techno";
        default:     return "Uncategorised";
    }
}` }],
  pitfalls: [
    "Missing return on one path → 'missing return statement'.",
    "Wrong parameter order compared with the diagram.",
    "Re-coding logic instead of calling the method you wrote earlier."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "oop-ui-class", section: "OOP",
  title: "The text-based UI class (main)",
  summary: "Q5 + the last part of later questions: create the manager, call methods in the right order, print results. ~5 marks of near-free marks.",
  points: [
    "public class XxxUI { public static void main(String[] args) { ... } } — the class with main is a mark.",
    "Instantiate once: XxxManager m = new XxxManager(); (reading the file happens in its constructor).",
    "Typed methods go inside println: System.out.println(m.processRequests());. void methods are just called: m.sortByName();.",
    "System.out.println(m); prints the manager's toString.",
    "ORDER matters: sort before printing; update/promote before printing counters; remove invalid before reports.",
    "Pass constants, not literals: m.countServers(\"Temp\", Server.ROLETYPE_CUSTOM).",
    "Scanner(System.in) only if the question asks for keyboard input (rare in recent papers)."
  ],
  code: [{ title: "Template", lang: "java", code: `public class RequestUI {
    public static void main(String[] args) {
        RequestManager rm = new RequestManager();
        rm.sortByName();
        System.out.println(rm);
        System.out.println(rm.processRequests());
    }
}

// keyboard input if asked
Scanner kb = new Scanner(System.in);
System.out.print("Enter techID: ");
String id = kb.nextLine();` }],
  pitfalls: ["Calling a typed method without printing it — the result is lost."],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
/* ========================= Files & Arrays ========================= */
{
  id: "files-read-scanner", section: "Files & Arrays",
  title: "Reading a text file into an array of objects (Scanner + split)",
  summary: "The manager constructor reads the file line by line, splits on # or ;, converts types, chooses parent or child by field count and stores at [size]. 9–15 marks every year.",
  points: [
    "new Scanner(new File(\"Accounts.txt\")) inside try { } catch (FileNotFoundException e) { message }.",
    "Check existence first if asked: File f = new File(name); if (!f.exists()) { message } else { read }.",
    "while (sc.hasNextLine()) { String line = sc.nextLine(); String[] p = line.split(\"#\"); ... }",
    "Convert: Integer.parseInt(p[2]), Double.parseDouble(p[3]), Boolean.parseBoolean(p[2]), LocalDate.parse(p[1], fmt).",
    "Choose the class by p.length (5 parts = Premium, 3 = Free) or by a scanner's hasNext().",
    "Store then count: arr[size] = new Thing(...); size++;",
    "Fixed number of lines of one type first (2024: 7 musicians): for (int i = 0; i < 7; i++) then while for the rest.",
    "Two lines per record (2022 test results): read nextLine() twice per loop.",
    "split uses a regex: split(\"#\") and split(\";\") are fine; for | or . escape it: split(\"\\\\|\").",
    "trim() pieces if the file has stray spaces. Close the Scanner at the end.",
    "The file must be in the NetBeans project folder (next to src), not inside src."
  ],
  code: [{ title: "Template", lang: "java", code: `public RequestManager() {
    try {
        Scanner sc = new Scanner(new File("Accounts.txt"));
        while (sc.hasNextLine()) {
            String[] p = sc.nextLine().split("#");
            if (p.length == 5) {
                accArr[accSize] = new Premium(p[0], p[1], p[2], p[3], Integer.parseInt(p[4]));
            } else {
                accArr[accSize] = new Free(p[0], p[1], p[2]);
            }
            accSize++;
        }
        sc.close();
    } catch (FileNotFoundException e) {
        System.out.println("Accounts.txt not found");
    }
}` }, {
    title: "Alternative: Scanner with a delimiter", lang: "java", code: `Scanner line = new Scanner(sc.nextLine()).useDelimiter("#");
String name = line.next();
int qty = line.nextInt();
if (line.hasNext()) { /* extra field → child object */ }` }],
  pitfalls: [
    "No try/catch → 'unreported exception FileNotFoundException' compile error.",
    "size++ before storing, or never incrementing.",
    "Passing a String where the constructor wants an int/LocalDate.",
    "Mixing nextInt() and nextLine() on the same file Scanner (leftover newline) — read whole lines and parse."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "files-write", section: "Files & Arrays",
  title: "Writing text files: PrintWriter & FileWriter",
  summary: "Create or append to a text file (2021 server map; practice seat map; prelim update file). Fewer marks but SAGS-examinable.",
  points: [
    "Overwrite: PrintWriter pw = new PrintWriter(new FileWriter(\"Out.txt\"));",
    "Append: new FileWriter(\"Out.txt\", true).",
    "pw.println(line); / pw.print(text); then pw.close() — without close the file may be empty.",
    "FileWriter throws IOException — catch IOException (it also covers FileNotFoundException).",
    "File name from data: new FileWriter(techID + \".txt\").",
    "Usually the method also RETURNS the text it wrote so the UI can print it."
  ],
  code: [{ title: "Template", lang: "java", code: `try {
    PrintWriter pw = new PrintWriter(new FileWriter("SeatMap.txt"));   // add , true to append
    pw.print(map);
    pw.close();
} catch (IOException e) {
    System.out.println("Could not write SeatMap.txt");
}` }],
  pitfalls: ["Forgetting close().", "Catching only FileNotFoundException for FileWriter (compile error: IOException not caught)."],
  years: [2021], priority: 2
},
{
  id: "arrays-objects", section: "Files & Arrays",
  title: "Arrays of objects with a size counter",
  summary: "The manager keeps a fixed-size array (40/50/80/100) plus a counter of how many slots are used. Every paper.",
  points: [
    "private Song[] songArr = new Song[100]; private int songSize = 0; — both private.",
    "Valid elements are 0 .. size-1. Everything after is null.",
    "ALWAYS loop to the counter: for (int i = 0; i < size; i++) — never to arr.length.",
    "Call methods on elements: songArr[i].getTitle().",
    "Several arrays in one manager (musArr + songArr) each have their own counter.",
    "An array of exactly the right size: count first, then new String[count] (2026 getOrders).",
    "Dynamic arrays (ArrayList) are NOT examinable in the practical — use plain arrays."
  ],
  code: [{ title: "Template", lang: "java", code: `public class MusicManager {
    private Musician[] musArr = new Musician[100];
    private int musSize = 0;

    public void add(Musician m) {
        if (musSize < musArr.length) {
            musArr[musSize] = m;
            musSize++;
        }
    }
}` }],
  pitfalls: ["NullPointerException from looping to length.", "Forgetting new Type[n] (array is null)."],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "arrays-parallel-2d", section: "Files & Arrays",
  title: "Parallel arrays, lookup arrays & 2D arrays (grids/maps)",
  summary: "Lookup arrays replace long switches (titles by rank, combo prices); 2D arrays model grids like a server room or cinema seats.",
  points: [
    "Lookup: String[] titles = {\"\", \"Ensign\", \"Lieutenant\", ...}; return titles[rank]; (index 0 unused).",
    "Parallel arrays: names[i] and marks[i] describe the same thing — keep them in step when sorting (swap both).",
    "2D: char[][] grid = new char[10][12]; grid[row][col]. Fill with nested loops.",
    "Row from a letter: seat.charAt(0) - 'A' (A→0). Column from a number: Integer.parseInt(seat.substring(1)) - 1.",
    "Printing a row label: (char) ('A' + r).",
    "Rows: grid.length; columns: grid[0].length."
  ],
  code: [{ title: "Template", lang: "java", code: `char[][] grid = new char[10][12];
for (int r = 0; r < grid.length; r++) {
    for (int c = 0; c < grid[r].length; c++) {
        grid[r][c] = '.';
    }
}
String seat = "F7";
grid[seat.charAt(0) - 'A'][Integer.parseInt(seat.substring(1)) - 1] = 'S';

String out = "";
for (int r = 0; r < grid.length; r++) {
    out += (char) ('A' + r);
    for (int c = 0; c < grid[r].length; c++) {
        out += " " + grid[r][c];
    }
    out += "\\n";
}` }],
  pitfalls: [
    "charAt(1) for 'A10' only gets '1' — use substring(1).",
    "Swapping only one of two parallel arrays scrambles the data."
  ],
  years: [2021, 2022], priority: 2
},
{
  id: "arrays-counters-totals", section: "Files & Arrays",
  title: "Counters, totals, averages, max/min & per-group reports",
  summary: "Loop through objects counting, summing and finding the largest/smallest — often grouped per customer or per name.",
  points: [
    "Initialise inside the method: int count = 0; double total = 0;",
    "Average = total / count — guard count > 0, and cast if both are int: (double) total / count.",
    "Max: start with the first element (max = arr[0].getX()) and keep its index, not just the value.",
    "Per-group report: outer loop over unique names, RESET counters inside it, inner loop over all records.",
    "Unique list without duplicates: keep a '#name#' string of names done, or compare with the previous element after sorting.",
    "Conditional counts: if (s.getLikes() > 5000 && s.getWellLiked()) count++;"
  ],
  code: [{ title: "Template", lang: "java", code: `String done = "#";
String out = "";
for (int i = 0; i < size; i++) {
    String name = arr[i].getCustName();
    if (!done.contains("#" + name + "#")) {
        done += name + "#";
        int n = 0;
        double total = 0;
        for (int j = 0; j < size; j++) {
            if (arr[j].getCustName().equals(name)) {
                n++;
                total += arr[j].calcCost();
            }
        }
        out += name + ": " + n + " booking(s), R" + String.format("%.2f", total) + "\\n";
    }
}

// max with index
int maxPos = 0;
for (int i = 1; i < size; i++) {
    if (arr[i].getLikes() > arr[maxPos].getLikes()) maxPos = i;
}` }],
  pitfalls: [
    "Counters declared outside the outer loop → totals carry over between customers.",
    "Integer division: 7 / 2 = 3.",
    "Starting max at 0 fails for negative values — start at the first element."
  ],
  years: [2021, 2023, 2024, 2026], priority: 3
},
{
  id: "arrays-search", section: "Files & Arrays",
  title: "Searching: linear search with a flag, binary search",
  summary: "Find an object by name/ID — return its index, the object, or a boolean. In every paper (often as a helper).",
  points: [
    "Linear search returning an index: loop, return i on a match, return -1 after the loop.",
    "'Stop as soon as found' → while (i < size && !found) or return inside the loop (a full for loop loses that mark).",
    "Compare Strings with .equals (or .equalsIgnoreCase when told 'case insensitive'); ints with ==.",
    "The 'else return false' inside the loop bug stops after the first element.",
    "Binary search (SAGS): array must be SORTED; check the middle, discard half each time.",
    "First empty slot = search for a sentinel value ('Available', null)."
  ],
  code: [{ title: "Linear search", lang: "java", code: `public int findCrewMember(int id) {
    int i = 0;
    boolean found = false;
    while (i < size && !found) {
        if (cArr[i].getCrewID() == id) {
            found = true;
        } else {
            i++;
        }
    }
    if (found) return i;
    return -1;
}` }, {
    title: "Binary search (sorted by name)", lang: "java", code: `public int binarySearch(String target) {
    int low = 0, high = size - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        int cmp = arr[mid].getName().compareTo(target);
        if (cmp == 0) {
            return mid;
        } else if (cmp < 0) {
            low = mid + 1;      // target is in the right half
        } else {
            high = mid - 1;     // target is in the left half
        }
    }
    return -1;
}` }],
  pitfalls: [
    "== on Strings compares references, not text.",
    "Binary search on an unsorted array gives wrong answers.",
    "Using the -1 'not found' result as an index → ArrayIndexOutOfBoundsException."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "arrays-insert-delete", section: "Files & Arrays",
  title: "Insert, delete & replace elements in an object array",
  summary: "Delete by shifting later elements left and size--; insert by shifting right; replace by assigning a new object to the slot (2022 promotion).",
  points: [
    "Delete at i: for (j = i; j < size - 1; j++) arr[j] = arr[j + 1]; size--; arr[size] = null;",
    "When deleting in a loop, don't advance i after a deletion — the next element has moved into i.",
    "Insert at pos: shift right from the end: for (j = size; j > pos; j--) arr[j] = arr[j - 1]; arr[pos] = item; size++; (check size < length first).",
    "Replace: arr[pos] = new Officer(...); — the counter doesn't change.",
    "Setting arr[i] = null without shifting leaves a hole that crashes later loops."
  ],
  code: [{ title: "Delete all matching", lang: "java", code: `public String removeInvalid() {
    String out = "";
    int i = 0;
    while (i < size) {
        if (!bArr[i].isValidRef()) {
            out += "Removed " + bArr[i].getBookingRef() + "\\n";
            for (int j = i; j < size - 1; j++) {
                bArr[j] = bArr[j + 1];
            }
            size--;
            bArr[size] = null;
        } else {
            i++;
        }
    }
    return out;
}` }, {
    title: "Insert at a position", lang: "java", code: `public void insertAt(int pos, Booking b) {
    if (size < bArr.length) {
        for (int j = size; j > pos; j--) {
            bArr[j] = bArr[j - 1];
        }
        bArr[pos] = b;
        size++;
    }
}` }],
  pitfalls: ["for loop with i++ after shifting skips adjacent matches.", "Shifting left-to-right when inserting overwrites data."],
  years: [2022], priority: 2
},
/* ============================ Algorithms ============================ */
{
  id: "algo-sort", section: "Algorithms",
  title: "Sorting from first principles: bubble, selection, objects by a field",
  summary: "Built-in sorts earn nothing. Sort the OBJECT array by a field with compareTo / isAfter. 5–7 marks (2023, 2025, practice, prelim).",
  points: [
    "Marks: outer loop limits, inner loop limits, correct comparison, temp of the array's type, 3-line swap.",
    "Strings: a.compareTo(b) > 0 means a comes after b → swap for ascending. Use compareToIgnoreCase if case shouldn't matter.",
    "Numbers: >. Dates: a.isAfter(b).",
    "Descending: flip the comparison (< 0 / isBefore).",
    "Two keys (date then name): swap if date1 after date2 OR (dates equal AND name1 > name2).",
    "Bubble sort with a flag stops early when a pass makes no swaps. Selection sort finds the min of the rest and swaps once per pass.",
    "Loop to size, never length."
  ],
  code: [{ title: "Bubble sort with flag", lang: "java", code: `public void sortByName() {
    boolean swapped = true;
    int pass = 0;
    while (swapped) {
        swapped = false;
        for (int j = 0; j < size - 1 - pass; j++) {
            if (arr[j].getName().compareTo(arr[j + 1].getName()) > 0) {
                Free temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
            }
        }
        pass++;
    }
}` }, {
    title: "Selection sort", lang: "java", code: `public void sortByDate() {
    for (int i = 0; i < size - 1; i++) {
        int minPos = i;
        for (int j = i + 1; j < size; j++) {
            if (arr[j].getShowDate().isBefore(arr[minPos].getShowDate())) {
                minPos = j;
            }
        }
        Booking temp = arr[i];
        arr[i] = arr[minPos];
        arr[minPos] = temp;
    }
}` }],
  pitfalls: [
    "Comparing Strings with < or > (compile error).",
    "Swapping only the field values instead of whole objects.",
    "Arrays.sort / Collections.sort — zero marks."
  ],
  years: [2023, 2025], priority: 2
},
{
  id: "algo-validation", section: "Algorithms",
  title: "Validation & check digits",
  summary: "Check that data is valid: length/prefix/range checks and check-digit sums (2025 licence digits, practice booking refs, SA ID numbers).",
  points: [
    "SAGS validation types: presence, range, length, type, format, uniqueness, logical checks, check digits.",
    "Fail fast: if (ref.length() != 8 || !ref.startsWith(\"RT\")) return false;",
    "Digit character → number: ch - '0' (or Character.getNumericValue(ch), or Integer.parseInt(\"\" + ch)).",
    "Sum of Unicode values: sum += name.charAt(i); then sum % 100.",
    "Weighted check digit: multiply alternate digits by weights, sum, check = (10 - sum % 10) % 10.",
    "Compare numbers as numbers (02 vs 2) — parse the digits rather than comparing Strings.",
    "Type check with try { Integer.parseInt(s); } catch (NumberFormatException e) { invalid }.",
    "Case-insensitive match against allowed values: equalsIgnoreCase with a default value otherwise (2021 roles)."
  ],
  code: [{ title: "Weighted check digit", lang: "java", code: `public boolean isValidRef() {
    if (bookingRef.length() != 8 || !bookingRef.startsWith("RT")) {
        return false;
    }
    int sum = 0;
    for (int i = 2; i <= 6; i++) {
        int d = bookingRef.charAt(i) - '0';
        sum += ((i - 2) % 2 == 0) ? d : d * 3;
    }
    int check = (10 - sum % 10) % 10;
    return check == bookingRef.charAt(7) - '0';
}` }, {
    title: "Is a string all digits?", lang: "java", code: `public static boolean allDigits(String s) {
    if (s.length() == 0) return false;
    for (int i = 0; i < s.length(); i++) {
        if (!Character.isDigit(s.charAt(i))) return false;
    }
    return true;
}` }],
  pitfalls: ["(int) '5' is 53, not 5.", "Forgetting the outer % 10 (a sum ending in 0 would give check 10)."],
  years: [2021, 2025], priority: 2
},
{
  id: "algo-random-math", section: "Algorithms",
  title: "Random numbers & Math methods",
  summary: "SAGS-listed basics: random whole numbers, rounding, powers, roots, absolute values, integer division and remainder.",
  points: [
    "Random int a..b: (int) (Math.random() * (b - a + 1)) + a.",
    "Or: Random r = new Random(); r.nextInt(b - a + 1) + a; (import java.util.Random).",
    "Math.round(x) → nearest long; 2 decimals: Math.round(x * 100) / 100.0.",
    "Math.pow(a, b), Math.sqrt(x), Math.abs(x), Math.max(a, b), Math.min(a, b), Math.ceil, Math.floor.",
    "Integer division: 128 / 60 = 2 (both ints); remainder 128 % 60 = 8.",
    "Isolate digits of n: last digit n % 10, drop it n / 10.",
    "Casting: (int) 3.9 = 3 (truncates); (double) a / b for a real result."
  ],
  code: [{ title: "Examples", lang: "java", code: `int dice = (int) (Math.random() * 6) + 1;          // 1..6
double rounded = Math.round(1234.5678 * 100) / 100.0; // 1234.57
int hours = 128 / 60;    // 2
int mins  = 128 % 60;    // 8
double avg = (double) total / count;` }],
  pitfalls: ["(int) Math.random() * 6 casts first → always 0.", "Math.round(x * 100) / 100 (int division) loses the decimals."],
  years: [], priority: 1
},
/* ========================= Dates & Strings ========================= */
{
  id: "str-methods", section: "Dates & Strings",
  title: "String & char methods (charAt, substring, indexOf, equals, compareTo, char maths)",
  summary: "Isolate, compare and build text. Show up inside almost every manager method; char arithmetic in 2021 and 2025.",
  points: [
    "length(), charAt(i) (0-based), substring(start) and substring(start, endExclusive), indexOf(\"x\"), lastIndexOf, contains, startsWith, endsWith.",
    "equals / equalsIgnoreCase for text; compareTo for ordering (< 0 before, 0 same, > 0 after).",
    "toUpperCase(), toLowerCase(), trim(), replace(\"a\", \"b\"), isEmpty().",
    "Last 2 characters: s.substring(s.length() - 2).",
    "Strings are immutable — s.toUpperCase() returns a new String; assign it.",
    "char maths: a char is a number. sum += s.charAt(i) adds the Unicode code; ch - 'A' gives 0..25; (char) ('A' + 3) is 'D'.",
    "Character.isDigit, isLetter, isUpperCase, toUpperCase.",
    "SAGS string algorithms: count words, isolate words, remove vowels, encrypt (Caesar shift), 'Fred John Smith' → 'FJ Smith'."
  ],
  code: [{ title: "Examples", lang: "java", code: `String s = "Thandiwe Grace Mokoena";
String surname = s.substring(s.lastIndexOf(' ') + 1);   // Mokoena
String initials = "";
String[] w = s.split(" ");
for (int i = 0; i < w.length - 1; i++) initials += w[i].charAt(0);   // TG

// remove vowels
String noVowels = "";
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
    if ("aeiouAEIOU".indexOf(c) == -1) noVowels += c;
}

// Caesar shift of capitals by 3
String enc = "";
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
    if (c >= 'A' && c <= 'Z') c = (char) ('A' + (c - 'A' + 3) % 26);
    enc += c;
}` }],
  pitfalls: [
    "s1 == s2 compares references.",
    "substring end index is EXCLUSIVE.",
    "\"\" + ch + ch2 vs ch + ch2: two chars added together give a number."
  ],
  years: [2021, 2023, 2024, 2025], priority: 3
},
{
  id: "str-split-build", section: "Dates & Strings",
  title: "split, delimiters & building result strings",
  summary: "Split file lines and lists into parts; build multi-line results with += and \\n. Every paper.",
  points: [
    "String[] p = line.split(\"#\"); p.length tells you how many fields.",
    "Empty fields between delimiters are kept (\"a;;b\" → 3 parts) but trailing empty fields are dropped.",
    "Split a list inside a field: \"F7,F8\".split(\",\").",
    "Build output: String out = \"\"; out += line + \"\\n\"; return out; — start from \"\", never null.",
    "#-separated list of unique values: list += value + \"#\"; later list.split(\"#\").",
    "indexOf + substring is an accepted alternative to split.",
    "Scanner(line).useDelimiter(\"#\") with next()/nextInt() is also accepted."
  ],
  code: [{ title: "Examples", lang: "java", code: `String line = "Jenny Sampson;Rebel;4;2023 03 13";
String[] p = line.split(";");
String name = p[0];
int genre = Integer.parseInt(p[2]);

// without split
int hash = line.indexOf(';');
String first = line.substring(0, hash);
String rest = line.substring(hash + 1);` }],
  pitfalls: ["split(\".\") or split(\"|\") need escaping (\"\\\\.\", \"\\\\|\") because split uses a regex.", "Index past the last field → ArrayIndexOutOfBoundsException."],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "str-format", section: "Dates & Strings",
  title: "Formatting output: \\t, \\n, String.format / printf, decimals",
  summary: "Match the sample output exactly; show money with two decimals; line things up.",
  points: [
    "\\t tab, \\n new line. Blank line between items = \"\\n\\n\".",
    "String.format(\"%.2f\", 142.5) → \"142.50\". %d int, %s String, %-15s left-aligned in 15 chars, %8.2f right-aligned.",
    "System.out.printf(\"%-20s%8.2f%n\", name, cost); prints a formatted line.",
    "String.format uses the PC's regional settings: on a South African locale it may print 142,50. Use String.format(Locale.US, \"%.2f\", x) (import java.util.Locale) to force a point.",
    "DecimalFormat df = new DecimalFormat(\"0.00\"); df.format(x) — also locale-sensitive.",
    "A double prints as 850.0 by default; an int prints without decimals — the memos accept either unless decimals are specified."
  ],
  code: [{ title: "Examples", lang: "java", code: `String line = String.format("%-20s%5d%10.2f", "Ryan Pillay", 3, 142.5);
// "Ryan Pillay             3    142.50"

System.out.printf("%s owes R%.2f%n", name, total);

String money = String.format(java.util.Locale.US, "%.2f", 1270.0);   // "1270.00"` }],
  pitfalls: ["Forgetting the R or the spaces that the sample shows.", "Using \\t when the sample clearly uses a single space (or vice versa)."],
  years: [2022, 2023, 2024], priority: 2
},
{
  id: "date-localdate", section: "Dates & Strings",
  title: "LocalDate / LocalDateTime: now, plus, compare, Period, ChronoUnit",
  summary: "Dates appear in every recent paper: activation expiry (2025), contract years (2024), parking hours/days (2023), promotion dates (2022), due dates (2026).",
  points: [
    "Today: LocalDate.now(); now with time: LocalDateTime.now(). Build one: LocalDate.of(2025, 3, 25).",
    "Add/subtract (returns a NEW date): plusDays(30), plusMonths(6), plusYears(1), minusMonths(6).",
    "Compare: isBefore, isAfter, isEqual / equals. 'On or before' = !isAfter.",
    "Whole units between: ChronoUnit.DAYS.between(a, b), ChronoUnit.MONTHS.between(a, b), ChronoUnit.YEARS.between(a, b), ChronoUnit.HOURS.between(dt1, dt2) (import java.time.temporal.ChronoUnit).",
    "Period.between(a, b).getYears() = completed years; getMonths()/getDays() are only the LEFTOVER parts (use toTotalMonths() for all months).",
    "Parts: getYear(), getMonthValue(), getDayOfMonth(), getDayOfWeek() (== DayOfWeek.TUESDAY), getDayOfYear(), lengthOfMonth(), isLeapYear().",
    "Date part of a date-time: dt.toLocalDate(); time part: dt.toLocalTime().",
    "Days by calendar date (overnight = 1 day): ChronoUnit.DAYS.between(dt1.toLocalDate(), dt2.toLocalDate()).",
    "Default printing: 2025-07-12 and 2023-09-17T12:21."
  ],
  code: [{ title: "Examples", lang: "java", code: `LocalDate today = LocalDate.now();
boolean active = !today.isAfter(actDate.plusMonths(6));
int years = Period.between(start, today).getYears();
long days = ChronoUnit.DAYS.between(entry.toLocalDate(), exit.toLocalDate());
long hours = ChronoUnit.HOURS.between(entry, exit);
LocalDate due = today.plusDays(60);
boolean tuesday = showDate.getDayOfWeek() == DayOfWeek.TUESDAY;` }],
  pitfalls: [
    "Calling plusMonths without assigning the result (dates are immutable).",
    "Period.getMonths()/getDays() instead of total months/days.",
    "Year subtraction (2026 - 2019) over-counts if the anniversary hasn't happened yet."
  ],
  years: [2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "date-formatter", section: "Dates & Strings",
  title: "DateTimeFormatter patterns: parsing & formatting dates",
  summary: "Every file stores dates as text in some pattern (dd MM yyyy, yyyy/MM/dd, dd/MM/yyyy, yyyy/MM/dd HH:mm). Parse with a matching formatter.",
  points: [
    "DateTimeFormatter fmt = DateTimeFormatter.ofPattern(\"dd MM yyyy\"); LocalDate d = LocalDate.parse(text, fmt);",
    "With time: LocalDateTime.parse(\"2023/09/01 10:51\", DateTimeFormatter.ofPattern(\"yyyy/MM/dd HH:mm\"));",
    "Letters: yyyy year, MM month, dd day, HH hour 0–23, hh hour 1–12, mm minutes, ss seconds, MMM Jul, MMMM July, EEE Tue, EEEE Tuesday, a AM/PM.",
    "Separators in the pattern must match the text exactly (spaces, /, -).",
    "Format for output: d.format(DateTimeFormatter.ofPattern(\"dd/MM/yyyy\")).",
    "LocalDate.parse(text) with no formatter only accepts yyyy-MM-dd.",
    "Use yyyy, not YYYY (week-based year — wrong around New Year)."
  ],
  code: [{ title: "Examples", lang: "java", code: `DateTimeFormatter f1 = DateTimeFormatter.ofPattern("dd MM yyyy");
LocalDate act = LocalDate.parse("15 06 2025", f1);

DateTimeFormatter f2 = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm");
LocalDateTime in = LocalDateTime.parse("2023/09/01 10:51", f2);

String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss"));` }],
  pitfalls: [
    "mm (minutes) where MM (month) was meant.",
    "Pattern doesn't match the file → DateTimeParseException at run time.",
    "hh instead of HH for 24-hour times."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
/* ========================= Exam technique ========================= */
{
  id: "exam-time", section: "Exam technique",
  title: "Time plan, workflow & debugging under pressure",
  summary: "3 hours for 150 marks ≈ 1.2 minutes per mark. Bank SQL fast, then build Section B class by class, testing as you go.",
  points: [
    "0:00–0:10 Read the WHOLE paper; open every data file in Notepad (delimiters, field counts, date formats, blank fields). Back up the original folders.",
    "0:10–0:55 Section A (50 marks ≈ 45 min). Run each query, compare with the sample output, paste into SQLAnswerSheet as you go.",
    "0:55–1:45 Q2–Q5: object class, child class, manager constructor + toString + sort, UI. Run after each class.",
    "1:45–2:45 Q6–Q7: the big algorithm methods (search, count, reports, file processing).",
    "2:45–3:00 Exam number in every class, comment out anything that crashes, final run, save everything.",
    "Stuck for more than 5 minutes? Write the method header + comments of your plan, move on, come back.",
    "Printing happens AFTER the exam (half an hour) — check indentation, nothing truncated, every class printed.",
    "Compile and run after EVERY method; if something won't compile, comment it out with a note explaining the error (instruction 7 on every paper) — one broken class stops the whole project running.",
    "NullPointerException → looped past size or object/array never created. ArrayIndexOutOfBounds → split gave fewer parts than expected. NumberFormatException → trim() before parsing. DateTimeParseException → pattern doesn't match the text. FileNotFoundException → file not in the project root.",
    "Wrong output order → check when you call sort/update relative to printing."
  ],
  code: [{ title: "Comment out broken code", lang: "java", code: `/* Q7.3 - does not compile yet: cast error on line 12
public String processRequests() {
    ...
}
*/` }],
  pitfalls: [
    "Spending 40 minutes on one 6-mark SQL question.",
    "Running UPDATE/INSERT/DELETE several times and then comparing against the sample output.",
    "Not saving regularly — no extra time after a power cut."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
},
{
  id: "exam-marks", section: "Exam technique",
  title: "How the marks are awarded (from the memos)",
  summary: "Memo marks are ticks for specific pieces of code — you can score most of a method even if the output is wrong.",
  points: [
    "Headers score: correct name, parameters (types/names/order) and return type, private for helpers.",
    "Fields: private + correct types + names (missing private penalised only once).",
    "Constants: public static final, ALL_CAPS, AND used later instead of literals.",
    "super(...) first in the child constructor; super.toString() reused.",
    "File reading: open, loop, read, split, convert, create object, store at [size], size++, try/catch with a message — ~1 mark each.",
    "Sorting: loop limits, comparison, temp, swap — each a mark.",
    "Follow-through: later marks are given for consistent use of an earlier mistake, so never leave a method blank.",
    "Only answer what's asked: no validation marks unless validation is asked for.",
    "Built-in sort/search = no marks. Alternatives (Scanner vs BufferedReader, split vs indexOf, switch vs if) are all accepted."
  ],
  code: [],
  pitfalls: [
    "Printing in a method that should return a String.",
    "Using 0/1 where constants exist (lost a mark in 2024 and 2025).",
    "Renaming methods/fields to your own style."
  ],
  years: [2021, 2022, 2023, 2024, 2025, 2026], priority: 3
}
];
