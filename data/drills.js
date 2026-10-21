/* IEB IT Paper 1 — practice drills (all written for this site; SQL in MS Access unless stated).
 * type: sql | java | mcq | predict. Every "predict" answer was checked by running the code.
 */
window.P1_DRILLS = [
/* ------------------------------ SQL ------------------------------ */
{
  id: "d1", topic: "sql-select-where", type: "sql",
  prompt: "tblClients(ClientID, ClientName, CellNo, Province, Loyalty). Show every field for clients on loyalty level 2 who live in KwaZulu Natal or Limpopo.",
  answer: `SELECT *
FROM tblClients
WHERE Loyalty = 2
  AND Province IN ('KwaZulu Natal', 'Limpopo');`,
  explain: "IN replaces two OR tests on the same field. If you use OR, bracket it: AND (Province = 'KwaZulu Natal' OR Province = 'Limpopo'). Loyalty is a number, so no quotes."
},
{
  id: "d2", topic: "sql-select-where", type: "mcq",
  prompt: "Which WHERE clause lists products whose name ends in 'Premium' or 'Deluxe' AND that cost more than 400?",
  options: [
    "WHERE ProdName LIKE '*Premium' OR ProdName LIKE '*Deluxe' AND Fee > 400",
    "WHERE (ProdName LIKE '*Premium' OR ProdName LIKE '*Deluxe') AND Fee > 400",
    "WHERE ProdName LIKE '*Premium' AND '*Deluxe' AND Fee > 400",
    "WHERE ProdName = '*Premium' OR ProdName = '*Deluxe' AND Fee > 400"
  ],
  answer: "WHERE (ProdName LIKE '*Premium' OR ProdName LIKE '*Deluxe') AND Fee > 400",
  explain: "AND is evaluated before OR, so without brackets every 'Premium' product appears regardless of its fee. = with a wildcard looks for a literal asterisk."
},
{
  id: "d3", topic: "sql-select-where", type: "sql",
  prompt: "tblTickets(TicketID, DomainID, AgentID, PriorityLevel, DateLogged, DateCompleted). List the TicketID and PriorityLevel of tickets that have NOT been completed yet.",
  answer: `SELECT TicketID, PriorityLevel
FROM tblTickets
WHERE DateCompleted IS NULL;`,
  explain: "An empty field is Null. '= NULL' never matches — you must use IS NULL (or IS NOT NULL for the opposite)."
},
{
  id: "d4", topic: "sql-like-wildcards", type: "mcq",
  prompt: "In MS Access, which pattern matches registrations whose THIRD character is a space and that end in GP (e.g. 'CH 23 BF GP')?",
  options: ["'?? *GP'", "'__ %GP'", "'** *GP'", "'*GP' AND LEN = 3"],
  answer: "'?? *GP'",
  explain: "In Access ? is exactly one character and * is any number of characters. '__ %GP' is the MySQL/JavaDB version of the same pattern."
},
{
  id: "d5", topic: "sql-like-wildcards", type: "sql",
  prompt: "MySQL this time: tblItems(ItemID, ItemName, Category). Show ItemName and Category of items with 'pack' anywhere in the name that are not in the 'Writing Supplies' category.",
  answer: `SELECT ItemName, Category
FROM tblItems
WHERE ItemName LIKE '%pack%'
  AND Category <> 'Writing Supplies';`,
  explain: "MySQL uses % for 'any characters'. Wildcards on both sides = 'contains'. LIKE is case-insensitive in Access and (by default) MySQL, so 'Pack' also matches."
},
{
  id: "d6", topic: "sql-order-by", type: "sql",
  prompt: "tblMovies(MovieID, Title, Genre, Duration). Show each Genre with the number of movies in it (call it NumMovies), most movies first; genres with the same count in alphabetical order. Access.",
  answer: `SELECT Genre, COUNT(*) AS NumMovies
FROM tblMovies
GROUP BY Genre
ORDER BY COUNT(*) DESC, Genre;`,
  explain: "Two sort keys separated by a comma. Access won't sort by the aggregate's alias, so repeat COUNT(*). ASC is the default for Genre."
},
{
  id: "d7", topic: "sql-order-by", type: "mcq",
  prompt: "In MySQL, how do you show only the 3 most expensive products?",
  options: [
    "SELECT TOP 3 * FROM tblProducts ORDER BY Fee DESC",
    "SELECT * FROM tblProducts ORDER BY Fee DESC LIMIT 3",
    "SELECT * FROM tblProducts LIMIT 3 ORDER BY Fee DESC",
    "SELECT * FROM tblProducts WHERE ROWNUM <= 3"
  ],
  answer: "SELECT * FROM tblProducts ORDER BY Fee DESC LIMIT 3",
  explain: "MySQL puts LIMIT at the very end. TOP n (straight after SELECT) is the Access version. JavaDB uses FETCH FIRST 3 ROWS ONLY."
},
{
  id: "d8", topic: "sql-aggregates", type: "sql",
  prompt: "tblSuppliers(SuppID, SuppName, NumOrders, Preferred). Show the total number of orders placed with all suppliers, in a column called TotalOrders.",
  answer: `SELECT SUM(NumOrders) AS TotalOrders
FROM tblSuppliers;`,
  explain: "The order count is already stored per supplier, so you ADD the values with SUM. COUNT(*) would only count the suppliers."
},
{
  id: "d9", topic: "sql-aggregates", type: "mcq",
  prompt: "Why does SELECT ProdName, MAX(Fee) FROM tblProducts; fail?",
  options: [
    "MAX only works on dates",
    "ProdName is neither aggregated nor in a GROUP BY",
    "MAX needs an alias",
    "You must write MAXIMUM in Access"
  ],
  answer: "ProdName is neither aggregated nor in a GROUP BY",
  explain: "With an aggregate, every other selected column must be grouped. To show the most expensive product use: WHERE Fee = (SELECT MAX(Fee) FROM tblProducts)."
},
{
  id: "d10", topic: "sql-group-by", type: "sql",
  prompt: "tblServiceAgents(AgentID, Firstname, Lastname, Experience, Department). Show each Department and its agents' average experience (AvgExperience), only for departments where that average is greater than 6.",
  answer: `SELECT Department, AVG(Experience) AS AvgExperience
FROM tblServiceAgents
GROUP BY Department
HAVING AVG(Experience) > 6;`,
  explain: "A condition on a group's aggregate goes in HAVING, after GROUP BY. In Access repeat AVG(Experience) — the alias isn't allowed in HAVING."
},
{
  id: "d11", topic: "sql-group-by", type: "mcq",
  prompt: "'Show loyalty members who have spent more than R600 in total.' Where do the two conditions go?",
  options: [
    "Both in WHERE",
    "Both in HAVING",
    "Loyalty = True in WHERE; SUM(...) > 600 in HAVING",
    "SUM(...) > 600 in WHERE; Loyalty = True in HAVING"
  ],
  answer: "Loyalty = True in WHERE; SUM(...) > 600 in HAVING",
  explain: "WHERE filters individual rows before grouping (loyalty is a property of each row). HAVING filters groups after grouping (the total only exists per group)."
},
{
  id: "d12", topic: "sql-group-by", type: "predict",
  prompt: `tblSales has these rows (Province, Amount):
Gauteng 500 | Limpopo 300 | Gauteng 700 | Limpopo 200 | Free State 900

What does this output?
SELECT Province, SUM(Amount) AS Total
FROM tblSales
GROUP BY Province
HAVING SUM(Amount) > 600
ORDER BY SUM(Amount) DESC;`,
  answer: `Province    Total
Gauteng     1200
Free State  900`,
  explain: "Groups: Gauteng 1200, Limpopo 500, Free State 900. HAVING removes Limpopo (500 is not > 600). Then sorted highest first."
},
{
  id: "d13", topic: "sql-joins", type: "sql",
  prompt: "tblClients(ClientID, ClientName, ...) and tblSales(ProdID, ClientID, License, SaleDate). For every sale show the client's name and the licence number.",
  answer: `SELECT ClientName, License
FROM tblClients, tblSales
WHERE tblClients.ClientID = tblSales.ClientID;

-- or: FROM tblClients INNER JOIN tblSales ON tblClients.ClientID = tblSales.ClientID`,
  explain: "Join the foreign key (tblSales.ClientID) to the primary key (tblClients.ClientID). Both join styles are accepted in the memos."
},
{
  id: "d14", topic: "sql-joins", type: "sql",
  prompt: "tblProducts(ProdID, ProdName, Fee), tblClients(ClientID, ClientName, Province), tblSales(ProdID, ClientID, License, SaleDate). Show each Province and the total fee of products sold there (ValueOfSales), only where that total exceeds 1000.",
  answer: `SELECT Province, SUM(Fee) AS ValueOfSales
FROM tblProducts, tblSales, tblClients
WHERE tblProducts.ProdID = tblSales.ProdID
  AND tblSales.ClientID = tblClients.ClientID
GROUP BY Province
HAVING SUM(Fee) > 1000;`,
  explain: "Three tables → two join conditions through the link table tblSales. Then group and filter the groups with HAVING."
},
{
  id: "d15", topic: "sql-joins", type: "mcq",
  prompt: "A query uses tblCustomers, tblBookings and tblMovies. How many join conditions does it need?",
  options: ["1", "2", "3", "None if you use WHERE"],
  answer: "2",
  explain: "n tables need n − 1 join conditions: Customers–Bookings and Movies–Bookings. Missing one gives a Cartesian product with far too many rows."
},
{
  id: "d16", topic: "sql-calculated", type: "sql",
  prompt: "tblFestivals(FestID, FestName, FestDate, Capacity, TicketCost). Show FestName, FestDate and the income (Capacity x TicketCost) in a column called Income.",
  answer: `SELECT FestName, FestDate, Capacity * TicketCost AS Income
FROM tblFestivals;`,
  explain: "A calculated column with AS. Spell the alias exactly as the question gives it."
},
{
  id: "d17", topic: "sql-calculated", type: "mcq",
  prompt: "A supplier will charge 10% LESS than the current ItemPrice. Which expression gives the new price?",
  options: ["ItemPrice * 0.1", "ItemPrice - 10", "ItemPrice * 0.9", "ItemPrice / 1.1"],
  answer: "ItemPrice * 0.9",
  explain: "10% less leaves 90% of the price. (+50% is * 1.5, +4.6% is * 1.046.)"
},
{
  id: "d18", topic: "sql-calculated", type: "predict",
  prompt: `MS Access. What does this column show for a movie with Duration = 128?
(Duration \\ 60) & 'h ' & (Duration MOD 60) & 'm'`,
  answer: "2h 8m",
  explain: "\\ is integer division in Access (128 \\ 60 = 2) and MOD gives the remainder (8). & joins everything into text. 128 / 60 would give 2.1333..."
},
{
  id: "d19", topic: "sql-string-functions", type: "sql",
  prompt: "tblDomains(DomainID, DomainName, ...). Change every domain ending in '.in' so that it ends in '.co.ind' instead (e.g. extraousco.in → extraousco.co.ind). Access.",
  answer: `UPDATE tblDomains
SET DomainName = LEFT(DomainName, LEN(DomainName) - 3) & '.co.ind'
WHERE DomainName LIKE '*.in';`,
  explain: "'.in' is 3 characters, so keep everything except the last 3 and append the new ending. MySQL: CONCAT(LEFT(DomainName, LENGTH(DomainName) - 3), '.co.ind') with LIKE '%.in'."
},
{
  id: "d20", topic: "sql-string-functions", type: "predict",
  prompt: "MS Access. What does MID('Volkswagen Golf', 11) return?",
  answer: "' Golf' (a space followed by Golf)",
  explain: "SQL positions start at 1. 'Volkswagen' fills positions 1–10, so position 11 is the space. That's why 'VW' & MID(Model, 11) gives 'VW Golf'."
},
{
  id: "d21", topic: "sql-string-functions", type: "sql",
  prompt: "tblCustomers(CustID, FullName, Email). Change every email ending in '@telkomsa.net' to end in '@telkom.co.za', keeping the part before the @. Access.",
  answer: `UPDATE tblCustomers
SET Email = LEFT(Email, LEN(Email) - 13) & '@telkom.co.za'
WHERE Email LIKE '*@telkomsa.net';`,
  explain: "'@telkomsa.net' has 13 characters (count the @ and the dot). MySQL also allows REPLACE(Email, '@telkomsa.net', '@telkom.co.za')."
},
{
  id: "d22", topic: "sql-date-functions", type: "sql",
  prompt: "tblCustomers(CustID, FullName, DOB). List FullName and DOB of customers who are under 18 TODAY, accurate to the day. Don't hard-code the date. Access.",
  answer: `SELECT FullName, DOB
FROM tblCustomers
WHERE DateAdd('yyyy', 18, DOB) > Date();

-- MySQL: WHERE TIMESTAMPDIFF(YEAR, DOB, CURDATE()) < 18`,
  explain: "Their 18th birthday (DOB + 18 years) is still in the future. YEAR(Date()) - YEAR(DOB) < 18 is wrong for people whose birthday hasn't happened yet this year."
},
{
  id: "d23", topic: "sql-date-functions", type: "mcq",
  prompt: "In MySQL, which gives the number of days from StartDate to EndDate (EndDate is later)?",
  options: [
    "DATEDIFF(StartDate, EndDate)",
    "DATEDIFF(EndDate, StartDate)",
    "DateDiff('d', EndDate, StartDate)",
    "DAYS(EndDate - StartDate)"
  ],
  answer: "DATEDIFF(EndDate, StartDate)",
  explain: "MySQL DATEDIFF(a, b) returns a − b in days, so the later date goes first. Access is the other way round: DateDiff('d', StartDate, EndDate)."
},
{
  id: "d24", topic: "sql-date-functions", type: "sql",
  prompt: "tblCaptains(CaptainID, Fullname, DateHired, CombatTraining). List all captains who will have been with the company for 10 years or more by the end of THIS year. Don't hard-code the year. Access.",
  answer: `SELECT *
FROM tblCaptains
WHERE YEAR(Date()) - YEAR(DateHired) >= 10;`,
  explain: "'This year' is a calendar-year rule, so compare years. MySQL: YEAR(CURDATE()); JavaDB: YEAR(CURRENT_DATE)."
},
{
  id: "d25", topic: "sql-insert", type: "sql",
  prompt: "tblFestivals(FestID AutoNumber, FestName, FestDate, Capacity, TicketCost). With ONE query, copy every 2024 festival with 'Fire' in its name into a new row: same name and capacity, date 1 January 2025, ticket R20 more. Access.",
  answer: `INSERT INTO tblFestivals (FestName, FestDate, Capacity, TicketCost)
SELECT FestName, #2025/01/01#, Capacity, TicketCost + 20
FROM tblFestivals
WHERE FestName LIKE '*Fire*' AND YEAR(FestDate) = 2024;`,
  explain: "INSERT INTO … SELECT makes one new row per selected row. No VALUES keyword, and leave the AutoNumber FestID out."
},
{
  id: "d26", topic: "sql-insert", type: "mcq",
  prompt: "Which of these INSERT statements is INVALID?",
  options: [
    "INSERT INTO tblSales (ProdID, ClientID) VALUES (14, 25)",
    "INSERT INTO tblSales (ProdID, ClientID) SELECT 14, ClientID FROM tblClients",
    "INSERT INTO tblSales (ProdID, ClientID) VALUES SELECT 14, ClientID FROM tblClients",
    "INSERT INTO tblSales (ProdID, ClientID) SELECT ProdID, 25 FROM tblProducts WHERE Fee > 500"
  ],
  answer: "INSERT INTO tblSales (ProdID, ClientID) VALUES SELECT 14, ClientID FROM tblClients",
  explain: "VALUES is only for a single literal row. When the new rows come from a SELECT, the SELECT follows the field list directly."
},
{
  id: "d27", topic: "sql-insert", type: "sql",
  prompt: "tblMissions(MissionID AutoNumber, CaptainID, SpaceshipID, MainObjective, DepartureDate, Distance, SolarSystem). For every captain in tblCaptains with NO mission, insert a mission: random ship 1–30, 'Exploration', 1 Jan 2030, distance 5, 'Alpha-Centauri'. Access.",
  answer: `INSERT INTO tblMissions (CaptainID, SpaceshipID, MainObjective, DepartureDate, Distance, SolarSystem)
SELECT CaptainID, INT(RND(CaptainID) * 30) + 1, 'Exploration', #2030/01/01#, 5, 'Alpha-Centauri'
FROM tblCaptains
WHERE CaptainID NOT IN (SELECT CaptainID FROM tblMissions);`,
  explain: "NOT IN finds captains without a mission. RND(CaptainID) — with a field argument — makes Access generate a new random number for every row."
},
{
  id: "d28", topic: "sql-update", type: "sql",
  prompt: "tblFestivals(FestID, FestName, FestDate, Capacity, TicketCost). All 'Coffee and Cake' festivals are now free. Set their ticket cost to 0.",
  answer: `UPDATE tblFestivals
SET TicketCost = 0
WHERE FestName = 'Coffee and Cake';`,
  explain: "UPDATE … SET … WHERE. Without the WHERE clause every festival becomes free."
},
{
  id: "d29", topic: "sql-update", type: "sql",
  prompt: "tblParkings(ParkingID, Address, DailyRate, DateAdded, PremiumParking). Remove all parking bays added before 2018. Access.",
  answer: `DELETE FROM tblParkings
WHERE DateAdded < #2018/01/01#;

-- or WHERE YEAR(DateAdded) < 2018`,
  explain: "DELETE FROM … WHERE. Access also accepts DELETE * FROM, but MySQL doesn't — DELETE FROM works everywhere."
},
{
  id: "d30", topic: "sql-subqueries", type: "sql",
  prompt: "tblProducts(ProdID, ProdName, Category, Fee). Show ProdName and Fee of products that cost more than the average fee.",
  answer: `SELECT ProdName, Fee
FROM tblProducts
WHERE Fee > (SELECT AVG(Fee) FROM tblProducts);`,
  explain: "Aggregates can't be used directly in WHERE, so compute the average in a sub-query. Never hard-code the number you worked out by hand."
},
{
  id: "d31", topic: "sql-subqueries", type: "sql",
  prompt: "tblMovies(MovieID, Title, ...) and tblBookings(BookingID, CustID, MovieID, ...). Show the titles of movies that have never been booked.",
  answer: `SELECT Title
FROM tblMovies
WHERE MovieID NOT IN (SELECT MovieID FROM tblBookings);

-- or: FROM tblMovies LEFT JOIN tblBookings ON tblMovies.MovieID = tblBookings.MovieID
--     WHERE tblBookings.MovieID IS NULL`,
  explain: "An INNER JOIN can only show movies that DO have bookings. NOT IN (or LEFT JOIN … IS NULL) finds the ones with no match."
},
{
  id: "d32", topic: "sql-subqueries", type: "mcq",
  prompt: "Two parking bays share the highest DailyRate (150). Which query lists BOTH in every DBMS?",
  options: [
    "SELECT * FROM tblParkings ORDER BY DailyRate DESC LIMIT 1",
    "SELECT *, MAX(DailyRate) FROM tblParkings",
    "SELECT * FROM tblParkings WHERE DailyRate = (SELECT MAX(DailyRate) FROM tblParkings)",
    "SELECT MAX(*) FROM tblParkings"
  ],
  answer: "SELECT * FROM tblParkings WHERE DailyRate = (SELECT MAX(DailyRate) FROM tblParkings)",
  explain: "The sub-query returns 150 and the outer query returns every row with that rate — ties included."
},
{
  id: "d33", topic: "sql-random", type: "mcq",
  prompt: "Access: which expression gives a random whole number from 1 to 30 inclusive?",
  options: ["RND() * 30", "INT(RND() * 30)", "INT(RND() * 30) + 1", "INT(RND() * 31)"],
  answer: "INT(RND() * 30) + 1",
  explain: "RND() is 0 ≤ x < 1. Times 30 → 0–29.99; INT → 0–29; + 1 → 1–30. General form: INT(RND() * (b − a + 1)) + a."
},
{
  id: "d34", topic: "sql-random", type: "sql",
  prompt: "MySQL: insert a sale into tblSales(ProdID, ClientID, License, SaleDate) for product 14, client 25, a random licence number from 1 000 000 to 2 000 000 and the date 25 March 2025.",
  answer: `INSERT INTO tblSales (ProdID, ClientID, License, SaleDate)
VALUES (14, 25, FLOOR(RAND() * 1000001) + 1000000, '2025-03-25');`,
  explain: "MySQL uses RAND() and FLOOR() and quoted 'yyyy-mm-dd' dates. Access: INT(RND() * 1000001) + 1000000 and #2025/03/25#."
},
{
  id: "d35", topic: "sql-dialects", type: "mcq",
  prompt: "Which operator joins two pieces of text in JavaDB?",
  options: ["&", "+", "||", "CONCAT only"],
  answer: "||",
  explain: "Access uses &, MySQL uses CONCAT(a, b), JavaDB (Derby) uses ||. JavaDB also has no LEFT/RIGHT or ROUND functions."
},
/* ------------------------------ OOP ------------------------------ */
{
  id: "d36", topic: "oop-class-anatomy", type: "java",
  prompt: "Class diagram: Song — artistName : string, title : string, likes : integer, dislikes : integer (all '-'). Write the class header and fields.",
  answer: `public class Song {
    private String artistName;
    private String title;
    private int likes;
    private int dislikes;
}`,
  explain: "'-' means private. string → String, integer → int. Names exactly as in the diagram."
},
{
  id: "d37", topic: "oop-class-anatomy", type: "mcq",
  prompt: "In an IEB class diagram, what does '+ HOURLYRATE = 24.5 : real' describe?",
  options: [
    "A private double variable",
    "A public constant: public static final double HOURLYRATE = 24.5;",
    "A method that returns 24.5",
    "A protected int field"
  ],
  answer: "A public constant: public static final double HOURLYRATE = 24.5;",
  explain: "'+' = public, real = double, capitals + a fixed value = a constant (static final)."
},
{
  id: "d38", topic: "oop-constructors", type: "java",
  prompt: "Write the constructor Free(inN : string, inE : string, inA : string) that assigns name and email, and converts inA (like '15 06 2025') into the LocalDate field actDate.",
  answer: `public Free(String inN, String inE, String inA) {
    name = inN;
    email = inE;
    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MM yyyy");
    actDate = LocalDate.parse(inA, fmt);
}`,
  explain: "The pattern must match the text exactly — including the spaces. MM = month (mm would be minutes). Needs imports java.time.LocalDate and java.time.format.DateTimeFormatter."
},
{
  id: "d39", topic: "oop-constructors", type: "mcq",
  prompt: "What is wrong with: public void Song(String t) { title = t; }",
  options: [
    "Nothing",
    "It is a method, not a constructor, because it has a return type (void)",
    "Constructors must be private",
    "Parameters can't be called t"
  ],
  answer: "It is a method, not a constructor, because it has a return type (void)",
  explain: "Constructors have NO return type. With void it compiles as an ordinary method, so new Song(\"x\") won't compile/work as intended."
},
{
  id: "d40", topic: "oop-constructors", type: "predict",
  prompt: `What is printed?
public class Pet {
    private String name;
    public Pet(String name) {
        name = name;
    }
    public String getName() { return name; }
}
// in main:
System.out.println(new Pet("Rex").getName());`,
  answer: "null",
  explain: "Inside the constructor 'name' refers to the parameter (shadowing), so the parameter is assigned to itself and the field stays null. Fix: this.name = name;"
},
{
  id: "d41", topic: "oop-accessors-mutators", type: "java",
  prompt: "Write an accessor for the String field name and a mutator for the boolean field discount (diagram: setDiscount(inD : boolean)).",
  answer: `public String getName() {
    return name;
}

public void setDiscount(boolean inD) {
    discount = inD;
}`,
  explain: "Getter: return type = field type, no parameters. Setter: void, one parameter of the field's type."
},
{
  id: "d42", topic: "oop-tostring", type: "java",
  prompt: "Premium extends Free. Free's toString returns 'name email actDate'. Write Premium's toString that adds licNo and qty, separated by single spaces.",
  answer: `@Override
public String toString() {
    return super.toString() + " " + licNo + " " + qty;
}`,
  explain: "super.toString() reuses the parent's output (that's a mark on its own) — the child can't reach the parent's private fields anyway."
},
{
  id: "d43", topic: "oop-tostring", type: "predict",
  prompt: `What is printed?
LocalDate d = LocalDate.of(2025, 7, 12);
String s = "Madelyyn" + "\\t" + d;
System.out.println(s);`,
  answer: "Madelyyn<TAB>2025-07-12   (a tab character between the two)",
  explain: "\\t is a tab. A LocalDate's default toString is yyyy-MM-dd — no formatter needed for that output."
},
{
  id: "d44", topic: "oop-static", type: "mcq",
  prompt: "Which line correctly declares a constant ACCESS = 0 that other classes can use?",
  options: [
    "private static final int ACCESS = 0;",
    "public final int access = 0;",
    "public static final int ACCESS = 0;",
    "public static int ACCESS = 0;"
  ],
  answer: "public static final int ACCESS = 0;",
  explain: "public (accessible outside), static (belongs to the class), final (can't change), ALL_CAPS name. Without final it's a variable, not a constant."
},
{
  id: "d45", topic: "oop-static", type: "predict",
  prompt: `What is printed?
public class Ticket {
    private static int count = 0;
    private int number;
    public Ticket() {
        count++;
        number = count;
    }
    public int getNumber() { return number; }
    public static int getCount() { return count; }
}
// in main:
Ticket a = new Ticket();
Ticket b = new Ticket();
Ticket c = new Ticket();
System.out.println(b.getNumber() + " " + Ticket.getCount());`,
  answer: "2 3",
  explain: "count is static — ONE copy shared by all objects — so it reaches 3. number is an instance field: b got the value 2 when it was created."
},
{
  id: "d46", topic: "oop-inheritance", type: "java",
  prompt: "LongTerm extends Daily. Daily's constructor is Daily(String inRN, LocalDateTime inEY, LocalDateTime inET). Write LongTerm's constructor that also takes String inPB for the private field parkingBay.",
  answer: `public LongTerm(String inRN, LocalDateTime inEY, LocalDateTime inET, String inPB) {
    super(inRN, inEY, inET);
    parkingBay = inPB;
}`,
  explain: "super(...) must be the very first statement and passes the parent's values in the parent's parameter order."
},
{
  id: "d47", topic: "oop-inheritance", type: "mcq",
  prompt: "Premium extends Free; actDate is private in Free. Inside Premium, 'actDate = LocalDate.now();' does not compile. What is the fix?",
  options: [
    "Make Premium's method static",
    "Call the parent's method that sets it, e.g. super.authorise();",
    "Declare another actDate field in Premium",
    "Cast this to Free"
  ],
  answer: "Call the parent's method that sets it, e.g. super.authorise();",
  explain: "Private fields are not visible in subclasses. Go through the parent's public methods (or a protected field, if the diagram makes it protected). A second field would hide the parent's one and the parent would never see the change."
},
{
  id: "d48", topic: "oop-inheritance", type: "predict",
  prompt: `What is printed?
class Account {
    public String describe() { return "basic"; }
    public String label() { return "Account: " + describe(); }
}
class Gold extends Account {
    @Override
    public String describe() { return "gold"; }
}
// in main:
Account a = new Gold();
System.out.println(a.label());`,
  answer: "Account: gold",
  explain: "Dynamic binding: the object is a Gold, so the call to describe() inside label() runs Gold's override, even though the variable type is Account."
},
{
  id: "d49", topic: "oop-polymorphism", type: "java",
  prompt: "pArr is a Daily[] holding Daily and LongTerm objects (size counter: size). Write a method that returns how many LongTerm objects there are and prints the parking bay of each (getParkingBay() exists only in LongTerm).",
  answer: `public int countLongTerm() {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (pArr[i] instanceof LongTerm) {
            LongTerm lt = (LongTerm) pArr[i];
            System.out.println(lt.getParkingBay());
            count++;
        }
    }
    return count;
}`,
  explain: "instanceof checks the real object type; the cast lets you call the child-only method."
},
{
  id: "d50", topic: "oop-polymorphism", type: "mcq",
  prompt: "arr is a CrewMember[] holding CrewMember and Officer (child) objects. Which test is ALWAYS true for every element and therefore useless?",
  options: [
    "arr[i] instanceof Officer",
    "arr[i] instanceof CrewMember",
    "arr[i].getCrewID() > 0",
    "arr[i] != null"
  ],
  answer: "arr[i] instanceof CrewMember",
  explain: "Every Officer IS-A CrewMember, so testing the parent type can't tell them apart. Test the child type."
},
{
  id: "d51", topic: "oop-polymorphism", type: "predict",
  prompt: `Free has toString() returning name. Premium extends Free and overrides toString() to return name + " (premium)".
What is printed?
Free[] arr = { new Free("Ann"), new Premium("Bo") };
for (int i = 0; i < arr.length; i++) {
    System.out.println(arr[i]);
}`,
  answer: `Ann
Bo (premium)`,
  explain: "println calls toString(); Java picks the override that belongs to the real object, even though the array type is Free."
},
{
  id: "d52", topic: "oop-helper-methods", type: "mcq",
  prompt: "Which header matches: 'a private helper method countSongs that accepts the name of a musician and returns the number of songs'?",
  options: [
    "public void countSongs(String name)",
    "private int countSongs(String name)",
    "private String countSongs(int name)",
    "public static countSongs(name)"
  ],
  answer: "private int countSongs(String name)",
  explain: "Helper → private. Returns a number → int. Accepts a name → String parameter. Headers carry marks on their own."
},
{
  id: "d53", topic: "oop-ui-class", type: "mcq",
  prompt: "processRequests() returns a String. Which UI line earns the mark?",
  options: [
    "rm.processRequests();",
    "System.out.println(rm.processRequests());",
    "processRequests(rm);",
    "String.print(rm.processRequests());"
  ],
  answer: "System.out.println(rm.processRequests());",
  explain: "A typed method's value must be used — here printed. Calling it on its own throws the result away. (Void methods like rm.sortByName(); are just called.)"
},
/* ------------------------- Files & Arrays ------------------------- */
{
  id: "d54", topic: "files-read-scanner", type: "java",
  prompt: "Write the CrewMemberManager constructor. crewmembers.txt lines are name#id#department (crew member) or name#id#department#rank#dd/MM/yyyy (officer). Fields: CrewMember[] cArr, int size. Constructors: CrewMember(String, int, String) and Officer(String, int, String, int, LocalDate).",
  answer: `public CrewMemberManager() {
    try {
        Scanner sc = new Scanner(new File("crewmembers.txt"));
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        while (sc.hasNextLine()) {
            String[] p = sc.nextLine().split("#");
            int id = Integer.parseInt(p[1]);
            if (p.length == 5) {
                cArr[size] = new Officer(p[0], id, p[2], Integer.parseInt(p[3]),
                                         LocalDate.parse(p[4], fmt));
            } else {
                cArr[size] = new CrewMember(p[0], id, p[2]);
            }
            size++;
        }
        sc.close();
    } catch (FileNotFoundException e) {
        System.out.println("crewmembers.txt not found");
    }
}`,
  explain: "Open in try/catch, loop with hasNextLine, split, convert types, choose the class by the number of parts, store at [size], then size++."
},
{
  id: "d55", topic: "files-read-scanner", type: "predict",
  prompt: `What is printed?
String[] p = "Thabisile Ndlovu;;1;2022 09 26".split(";");
System.out.println(p.length + " [" + p[1] + "] " + p[1].isEmpty());`,
  answer: "4 [] true",
  explain: "An empty field BETWEEN two delimiters is kept as an empty String, so there are still 4 parts. (Empty fields at the very END of a line are dropped by split.)"
},
{
  id: "d56", topic: "files-read-scanner", type: "mcq",
  prompt: "new Scanner(new File(\"Accounts.txt\")) won't compile on its own. Why?",
  options: [
    "Scanner can't read files",
    "It throws a checked FileNotFoundException that must be caught (try/catch) or declared",
    "File needs a full path",
    "You must use BufferedReader in exams"
  ],
  answer: "It throws a checked FileNotFoundException that must be caught (try/catch) or declared",
  explain: "Wrap it in try { ... } catch (FileNotFoundException e) { message }. The catch with a sensible message is usually a mark."
},
{
  id: "d57", topic: "files-write", type: "java",
  prompt: "Write a method saveList() that writes the name of every object in arr (getName(), counter size) to Names.txt, one per line, overwriting the file.",
  answer: `public void saveList() {
    try {
        PrintWriter pw = new PrintWriter(new FileWriter("Names.txt"));
        for (int i = 0; i < size; i++) {
            pw.println(arr[i].getName());
        }
        pw.close();
    } catch (IOException e) {
        System.out.println("Could not write Names.txt");
    }
}`,
  explain: "new FileWriter(name) overwrites; new FileWriter(name, true) appends. close() flushes the data to disk. FileWriter throws IOException."
},
{
  id: "d58", topic: "arrays-objects", type: "mcq",
  prompt: "accArr = new Free[40] holds 11 objects (accSize = 11). Which loop is correct?",
  options: [
    "for (int i = 0; i < accArr.length; i++)",
    "for (int i = 0; i <= accSize; i++)",
    "for (int i = 0; i < accSize; i++)",
    "for (int i = 1; i <= accArr.length; i++)"
  ],
  answer: "for (int i = 0; i < accSize; i++)",
  explain: "Only positions 0..accSize-1 hold objects; the rest are null and cause NullPointerExceptions."
},
{
  id: "d59", topic: "arrays-search", type: "java",
  prompt: "Write findCrewMember(int id) that returns the index of the object in cArr (counter size) with that crew ID, or -1. It must stop as soon as it finds it.",
  answer: `public int findCrewMember(int id) {
    for (int i = 0; i < size; i++) {
        if (cArr[i].getCrewID() == id) {
            return i;
        }
    }
    return -1;
}`,
  explain: "Returning inside the loop stops the search immediately. The 'not found' return goes AFTER the loop. A while (i < size && !found) loop is equally good."
},
{
  id: "d60", topic: "arrays-search", type: "predict",
  prompt: `What is printed?
String[] names = {"Ann", "Bo", "Cy"};
boolean result = find(names, "Bo");
System.out.println(result);

static boolean find(String[] a, String target) {
    for (int i = 0; i < a.length; i++) {
        if (a[i].equals(target)) {
            return true;
        } else {
            return false;
        }
    }
    return false;
}`,
  answer: "false",
  explain: "The else returns after checking only the first element ('Ann'). The 'return false' belongs after the loop, not inside it."
},
{
  id: "d61", topic: "arrays-counters-totals", type: "java",
  prompt: "cArr (counter size) holds Customer and BusinessCust objects; BusinessCust overrides getDiscount(). Write countDiscounts() returning how many get a discount.",
  answer: `public int countDiscounts() {
    int count = 0;
    for (int i = 0; i < size; i++) {
        if (cArr[i].getDiscount()) {
            count++;
        }
    }
    return count;
}`,
  explain: "No instanceof needed — getDiscount() automatically runs the right version for each object."
},
{
  id: "d62", topic: "arrays-counters-totals", type: "predict",
  prompt: `What is printed?
int total = 7;
int count = 2;
System.out.println(total / count);
System.out.println((double) total / count);`,
  answer: `3
3.5`,
  explain: "int / int is integer division (the decimal part is dropped). Casting one operand to double first gives a real result."
},
{
  id: "d63", topic: "arrays-insert-delete", type: "java",
  prompt: "Write removeAt(int pos) that deletes the element at pos from arr (counter size) keeping the order of the rest.",
  answer: `public void removeAt(int pos) {
    for (int j = pos; j < size - 1; j++) {
        arr[j] = arr[j + 1];
    }
    size--;
    arr[size] = null;
}`,
  explain: "Shift every later element one place left, then reduce the counter. Setting the freed last slot to null is tidy but optional."
},
{
  id: "d64", topic: "arrays-insert-delete", type: "predict",
  prompt: `What is printed? (The goal is to remove every 0.)
int[] a = {1, 0, 0, 2};
int size = 4;
for (int i = 0; i < size; i++) {
    if (a[i] == 0) {
        for (int j = i; j < size - 1; j++) {
            a[j] = a[j + 1];
        }
        size--;
    }
}
for (int i = 0; i < size; i++) System.out.print(a[i] + " ");`,
  answer: "1 0 2",
  explain: "After removing the 0 at index 1 the second 0 moves INTO index 1, but i++ moves on to index 2 and skips it. Fix: only increment i when nothing was removed (use a while loop)."
},
{
  id: "d65", topic: "arrays-parallel-2d", type: "predict",
  prompt: `What is printed?
String seat = "A10";
int row = seat.charAt(0) - 'A';
int col = Integer.parseInt(seat.substring(1)) - 1;
System.out.println(row + "," + col);`,
  answer: "0,9",
  explain: "'A' − 'A' = 0 (row A is index 0). substring(1) = \"10\" → 10 − 1 = 9 (arrays start at 0). charAt(1) would only have given '1'."
},
/* ---------------------------- Algorithms ---------------------------- */
{
  id: "d66", topic: "algo-sort", type: "java",
  prompt: "Sort accArr (type Free[], counter accSize) alphabetically by getName() using your own bubble sort.",
  answer: `public void sortByName() {
    for (int pass = 0; pass < accSize - 1; pass++) {
        for (int j = 0; j < accSize - 1 - pass; j++) {
            if (accArr[j].getName().compareTo(accArr[j + 1].getName()) > 0) {
                Free temp = accArr[j];
                accArr[j] = accArr[j + 1];
                accArr[j + 1] = temp;
            }
        }
    }
}`,
  explain: "Marks: loop limits, compareTo(...) > 0, temp of the array's type, 3-line swap of whole objects. Never Arrays.sort."
},
{
  id: "d67", topic: "algo-sort", type: "predict",
  prompt: `What is printed?
System.out.println("apple".compareTo("Banana"));
System.out.println("apple".compareToIgnoreCase("Banana") < 0);`,
  answer: `31
true`,
  explain: "compareTo works on Unicode codes: 'a' (97) − 'B' (66) = 31, so lowercase sorts AFTER all capitals. compareToIgnoreCase ignores case, so apple comes before Banana."
},
{
  id: "d68", topic: "algo-sort", type: "mcq",
  prompt: "Bubble sort of bookings into REVERSE date order (newest first). When should arr[j] and arr[j+1] be swapped?",
  options: [
    "arr[j].getShowDate().isAfter(arr[j + 1].getShowDate())",
    "arr[j].getShowDate().isBefore(arr[j + 1].getShowDate())",
    "arr[j].getShowDate() > arr[j + 1].getShowDate()",
    "arr[j].getShowDate().equals(arr[j + 1].getShowDate())"
  ],
  answer: "arr[j].getShowDate().isBefore(arr[j + 1].getShowDate())",
  explain: "For newest first, an older date in front must move back. Dates can't be compared with > — use isBefore/isAfter or compareTo."
},
{
  id: "d69", topic: "algo-validation", type: "java",
  prompt: "Write isValid() for Premium: sum the Unicode values of every character of getName(), take sum % 100, and return whether that equals the number formed by the last two characters of the String licNo.",
  answer: `public boolean isValid() {
    String n = getName();
    int sum = 0;
    for (int i = 0; i < n.length(); i++) {
        sum += n.charAt(i);
    }
    int lastTwo = Integer.parseInt(licNo.substring(licNo.length() - 2));
    return lastTwo == sum % 100;
}`,
  explain: "Adding a char to an int adds its Unicode code. Comparing as ints means '02' and 2 match; comparing Strings '02' vs '2' would fail."
},
{
  id: "d70", topic: "algo-validation", type: "predict",
  prompt: `What is printed?
System.out.println('R' + 'x');
System.out.println("" + 'R' + 'x');
System.out.println('7' - '0');`,
  answer: `202
Rx
7`,
  explain: "Two chars added are numbers: 82 + 120 = 202. Starting with \"\" makes it String concatenation. '7' − '0' converts a digit character to its value."
},
{
  id: "d71", topic: "algo-random-math", type: "mcq",
  prompt: "Which Java expression gives a random whole number from 1 to 6?",
  options: [
    "(int) Math.random() * 6 + 1",
    "(int) (Math.random() * 6) + 1",
    "Math.random(1, 6)",
    "(int) (Math.random() * 7)"
  ],
  answer: "(int) (Math.random() * 6) + 1",
  explain: "Math.random() is 0 ≤ x < 1. The brackets matter: (int) Math.random() is always 0. (int)(Math.random() * 7) gives 0–6."
},
/* -------------------------- Dates & Strings -------------------------- */
{
  id: "d72", topic: "str-methods", type: "predict",
  prompt: `What is printed?
String s = "Thandiwe Grace Mokoena";
System.out.println(s.substring(9, 14) + "|" + s.indexOf(' ') + "|" + s.lastIndexOf(' '));`,
  answer: "Grace|8|14",
  explain: "Indexes start at 0 and substring's end index is exclusive: characters 9–13 are 'Grace'. The spaces are at 8 and 14."
},
{
  id: "d73", topic: "str-methods", type: "predict",
  prompt: `What is printed?
String a = "Premium";
a.toUpperCase();
String b = a.substring(a.length() - 2);
System.out.println(a + " " + b + " " + a.equals("premium"));`,
  answer: "Premium um false",
  explain: "Strings are immutable: toUpperCase() returns a new String that was thrown away. The last 2 characters are 'um'. equals is case-sensitive."
},
{
  id: "d74", topic: "str-split-build", type: "java",
  prompt: "Write getShortName() for a String field custName like 'Thandiwe Grace Mokoena' → 'TG Mokoena' or 'Ryan Pillay' → 'R Pillay' (surname is always the last word).",
  answer: `public String getShortName() {
    String[] w = custName.split(" ");
    String initials = "";
    for (int i = 0; i < w.length - 1; i++) {
        initials += w[i].charAt(0);
    }
    return initials + " " + w[w.length - 1];
}`,
  explain: "Every word except the last contributes its first letter; the last element of the split array is the surname. Works for any number of names."
},
{
  id: "d75", topic: "str-format", type: "predict",
  prompt: `What is printed? (| marks the edges)
System.out.println(String.format("|%-6s|%5d|", "Ann", 42));`,
  answer: "|Ann   |   42|",
  explain: "%-6s pads the text to 6 characters on the RIGHT (left-aligned); %5d pads the number to 5 characters on the LEFT (right-aligned)."
},
{
  id: "d76", topic: "date-localdate", type: "predict",
  prompt: `What is printed?
LocalDate d = LocalDate.of(2025, 1, 31);
d.plusMonths(1);
System.out.println(d + " " + d.plusMonths(1));`,
  answer: "2025-01-31 2025-02-28",
  explain: "LocalDate is immutable — the first plusMonths result was thrown away. Adding a month to 31 January gives the last valid day of February."
},
{
  id: "d77", topic: "date-localdate", type: "predict",
  prompt: `What is printed?
LocalDate start = LocalDate.of(2012, 11, 27);
LocalDate today = LocalDate.of(2024, 11, 1);
Period p = Period.between(start, today);
System.out.println(p.getYears() + " " + p.getMonths() + " " + (today.getYear() - start.getYear()));`,
  answer: "11 11 12",
  explain: "Only 11 complete years have passed (the 12th anniversary is on 27 Nov). getMonths() is the LEFTOVER months (11), not the total. Simple year subtraction over-counts."
},
{
  id: "d78", topic: "date-localdate", type: "mcq",
  prompt: "An account is active if today is on or before the date six months after actDate. Which expression is correct?",
  options: [
    "LocalDate.now().isBefore(actDate.plusMonths(6))",
    "!LocalDate.now().isAfter(actDate.plusMonths(6))",
    "actDate.plusMonths(6) > LocalDate.now()",
    "Period.between(actDate, LocalDate.now()).getMonths() <= 6"
  ],
  answer: "!LocalDate.now().isAfter(actDate.plusMonths(6))",
  explain: "'On or before' = not after. isBefore misses the exact day; > doesn't work on objects; getMonths() ignores whole years."
},
{
  id: "d79", topic: "date-localdate", type: "predict",
  prompt: `What is printed?
LocalDateTime in  = LocalDateTime.of(2023, 9, 6, 6, 56);
LocalDateTime out = LocalDateTime.of(2023, 9, 7, 5, 6);
System.out.println(ChronoUnit.DAYS.between(in, out) + " "
    + ChronoUnit.DAYS.between(in.toLocalDate(), out.toLocalDate()) + " "
    + ChronoUnit.HOURS.between(in, out));`,
  answer: "0 1 22",
  explain: "Between date-times only COMPLETE 24-hour days count (22h10m → 0 days, 22 hours). Between the dates alone it is 1 calendar day — what the 2023 long-term parking fee needed."
},
{
  id: "d80", topic: "date-formatter", type: "mcq",
  prompt: "Which pattern parses the text '2023/09/01 10:51' into a LocalDateTime?",
  options: ["yyyy/MM/dd HH:mm", "yyyy/mm/dd hh:MM", "YYYY/MM/DD HH:mm", "dd/MM/yyyy HH:mm"],
  answer: "yyyy/MM/dd HH:mm",
  explain: "MM = month, mm = minutes, dd = day of month (DD = day of year), HH = 0–23 hours, yyyy = year (YYYY is week-based year)."
},
{
  id: "d81", topic: "date-formatter", type: "java",
  prompt: "Write one statement that turns the String text = \"29/12/2020\" into a LocalDate called promoted, and one that prints today's date-time as yyyy/MM/dd HH:mm:ss.",
  answer: `LocalDate promoted = LocalDate.parse(text, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
System.out.println(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss")));`,
  explain: "parse(text, formatter) reads text; date.format(formatter) writes text. The pattern must match the text exactly."
},
/* -------------------------- Exam technique -------------------------- */
{
  id: "d82", topic: "exam-time", type: "mcq",
  prompt: "About how long should Section A (SQL, 50 marks) take in the 3-hour paper?",
  options: ["15 minutes", "About 45 minutes", "90 minutes", "Do it last with whatever time is left"],
  answer: "About 45 minutes",
  explain: "180 minutes / 150 marks ≈ 1.2 min per mark. Banking SQL early in ~45 minutes leaves about 2 hours for the 100 OOP marks."
},
{
  id: "d83", topic: "exam-marks", type: "mcq",
  prompt: "With 10 minutes left, your 10-mark processRequests method has a compile error you can't find. What should you do?",
  options: [
    "Delete the method",
    "Leave it — the marker will fix it",
    "Comment out the broken lines (or the method), add a note explaining the problem, and make sure everything else runs",
    "Rewrite the whole manager class"
  ],
  answer: "Comment out the broken lines (or the method), add a note explaining the problem, and make sure everything else runs",
  explain: "Memo marks are ticks for correct pieces (header, loop, split, calls), so partial code still scores — but one compile error can stop ALL output from running."
},
{
  id: "d84", topic: "exam-marks", type: "mcq",
  prompt: "Musician has the constant TECHNO = 4. In the UI, which call earns full marks?",
  options: [
    "mm.adjustGenre(\"Samuel Ericson\", 4);",
    "mm.adjustGenre(\"Samuel Ericson\", Musician.TECHNO);",
    "mm.adjustGenre(Musician.TECHNO);",
    "mm.adjustGenre(\"Samuel Ericson\", \"Techno\");"
  ],
  answer: "mm.adjustGenre(\"Samuel Ericson\", Musician.TECHNO);",
  explain: "The 2024 memo said the constant MUST be used. Outside its class, refer to it through the class name."
}
];
