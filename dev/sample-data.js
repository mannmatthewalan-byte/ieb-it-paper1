/* SAMPLE data for frontend development only. The real site loads data/*.js.
   Follows the schemas in CONTRACT.md. All text is placeholder, own words. */

window.P1_TOPICS = [
  {
    id: "sql-group-by", section: "SQL", title: "GROUP BY & HAVING",
    summary: "Group rows that share a value and run aggregates per group. HAVING filters groups after aggregation; WHERE filters rows before.",
    points: [
      "Every non-aggregated column in SELECT must appear in GROUP BY.",
      "WHERE runs before grouping, HAVING runs after.",
      "Alias aggregates with AS so the output column has a sensible name."
    ],
    code: [
      { title: "Count per category", lang: "sql", code: "SELECT Category, COUNT(*) AS NumItems\nFROM tblProducts\nGROUP BY Category\nHAVING COUNT(*) > 3\nORDER BY NumItems DESC;" }
    ],
    pitfalls: ["Using WHERE COUNT(*) > 3 instead of HAVING.", "Forgetting a column in GROUP BY."],
    years: [2021, 2022, 2023, 2024, 2025], priority: 3
  },
  {
    id: "sql-joins", section: "SQL", title: "Joining tables",
    summary: "Combine rows from two or three tables using the foreign key relationship.",
    points: ["Match PK to FK in the join condition.", "Prefix ambiguous fields with the table name."],
    code: [
      { title: "Two-table join (WHERE style)", lang: "sql", code: "SELECT c.FirstName, o.OrderDate\nFROM tblCustomers c, tblOrders o\nWHERE c.CustomerID = o.CustomerID;" },
      { title: "INNER JOIN style", lang: "sql", code: "SELECT c.FirstName, o.OrderDate\nFROM tblCustomers c INNER JOIN tblOrders o\n  ON c.CustomerID = o.CustomerID;" }
    ],
    pitfalls: ["Leaving out the join condition gives a Cartesian product."],
    years: [2021, 2023, 2025], priority: 3
  },
  {
    id: "sql-dates", section: "SQL", title: "Date functions",
    summary: "Extract parts of dates and calculate differences. Syntax differs between Access, MySQL and JavaDB.",
    points: ["YEAR(), MONTH(), DAY() work in Access and MySQL.", "Access uses #2025/01/31# date literals."],
    code: [{ title: "Orders this year", lang: "sql", code: "SELECT *\nFROM tblOrders\nWHERE YEAR(OrderDate) = YEAR(CURDATE());" }],
    pitfalls: ["Mixing Access # delimiters with MySQL quotes."],
    years: [2022, 2024], priority: 2
  },
  {
    id: "oop-object-class", section: "OOP", title: "Writing an object class",
    summary: "Private fields, a parameterised constructor, accessors, a toString and calculation methods.",
    points: ["Fields are private.", "Constructor parameters assign to this.field.", "toString returns a String, it does not print."],
    code: [
      { title: "Class skeleton", lang: "java", code: "public class Swimmer {\n    private String name;\n    private double bestTime;\n\n    public Swimmer(String name, double bestTime) {\n        this.name = name;\n        this.bestTime = bestTime;\n    }\n\n    public String getName() { return name; }\n\n    @Override\n    public String toString() {\n        return name + \" (\" + String.format(\"%.2f\", bestTime) + \"s)\";\n    }\n}" }
    ],
    pitfalls: ["Printing inside toString instead of returning.", "Public fields lose marks."],
    years: [2021, 2022, 2023, 2024, 2025], priority: 3
  },
  {
    id: "files-read-array", section: "Files & Arrays", title: "Reading a text file into an array of objects",
    summary: "Use Scanner on a File, split each line, build objects, and keep a counter.",
    points: ["Wrap in try/catch for FileNotFoundException.", "Use a counter as the next free index."],
    code: [
      { title: "Read loop", lang: "java", code: "try {\n    Scanner sc = new Scanner(new File(\"data.txt\"));\n    while (sc.hasNextLine()) {\n        String[] parts = sc.nextLine().split(\"#\");\n        arr[count] = new Swimmer(parts[0], Double.parseDouble(parts[1]));\n        count++;\n    }\n    sc.close();\n} catch (FileNotFoundException e) {\n    System.out.println(\"File not found\");\n}" }
    ],
    pitfalls: ["split uses regex: escape | as \\\\|."],
    years: [2021, 2022, 2023, 2024, 2025], priority: 3
  },
  {
    id: "algo-bubble-sort", section: "Algorithms", title: "Sorting an array of objects",
    summary: "Write a bubble or selection sort by hand comparing a field via accessor.",
    points: ["Swap whole objects, not just fields.", "Use compareTo for Strings."],
    code: [
      { title: "Bubble sort by time", lang: "java", code: "for (int i = 0; i < count - 1; i++) {\n    for (int j = 0; j < count - 1 - i; j++) {\n        if (arr[j].getBestTime() > arr[j + 1].getBestTime()) {\n            Swimmer temp = arr[j];\n            arr[j] = arr[j + 1];\n            arr[j + 1] = temp;\n        }\n    }\n}" }
    ],
    pitfalls: ["Looping to arr.length when the array is only partly full (null pointer)."],
    years: [2022, 2024, 2025], priority: 2
  },
  {
    id: "dates-localdate", section: "Dates & Strings", title: "LocalDate & formatting",
    summary: "Parse dates from strings, compare them and format output.",
    points: ["LocalDate.parse expects yyyy-MM-dd by default.", "ChronoUnit.DAYS.between(a, b) for differences."],
    code: [{ title: "Parse and format", lang: "java", code: "DateTimeFormatter f = DateTimeFormatter.ofPattern(\"dd/MM/yyyy\");\nLocalDate d = LocalDate.parse(\"21/10/2026\", f);\nlong days = ChronoUnit.DAYS.between(d, LocalDate.now());" }],
    pitfalls: ["MM is month, mm is minutes."],
    years: [2023, 2025], priority: 1
  },
  {
    id: "exam-technique", section: "Exam technique", title: "Managing the 3 hours",
    summary: "Bank the SQL marks first, then build the OOP classes in order.",
    points: ["Roughly 1 mark per minute.", "Get it compiling before polishing."],
    code: [], pitfalls: ["Spending 40 minutes on one 3-mark query."],
    years: [], priority: 2
  }
];

window.P1_PAPERS = [
  {
    id: "2025-nov", year: 2025, session: "November",
    scenario: "A swimming club tracks members, galas and race results.",
    total: 150,
    sections: [
      {
        name: "SQL",
        questions: [
          {
            num: "1.1", marks: 3, tags: ["sql-dates", "WHERE"],
            asked: "List members born after a given year, sorted by surname.",
            approach: "Filter with YEAR() on the date field, then ORDER BY surname.",
            solution: { lang: "sql", code: "SELECT FirstName, Surname, DOB\nFROM tblMembers\nWHERE YEAR(DOB) > 2008\nORDER BY Surname;" },
            pitfalls: ["Forgetting ORDER BY loses a mark."]
          },
          {
            num: "1.2", marks: 4, tags: ["sql-group-by", "COUNT"],
            asked: "Count the number of races per stroke, only showing strokes with more than five races.",
            approach: "GROUP BY Stroke with COUNT(*), then HAVING to filter the groups.",
            solution: { lang: "sql", code: "SELECT Stroke, COUNT(*) AS NumRaces\nFROM tblRaces\nGROUP BY Stroke\nHAVING COUNT(*) > 5;" },
            pitfalls: ["Using WHERE instead of HAVING."]
          },
          {
            num: "1.3", marks: 5, tags: ["sql-joins", "sql-group-by"],
            asked: "Show each member's name with their fastest time across all races.",
            approach: "Join members to results on MemberID; MIN(Time) grouped by member.",
            solution: { lang: "sql", code: "SELECT m.FirstName, m.Surname, MIN(r.Time) AS Fastest\nFROM tblMembers m, tblResults r\nWHERE m.MemberID = r.MemberID\nGROUP BY m.FirstName, m.Surname;" },
            pitfalls: []
          }
        ]
      },
      {
        name: "OOP",
        questions: [
          {
            num: "2.1", marks: 8, tags: ["oop-object-class"],
            asked: "Write a Swimmer class with fields, a constructor and a toString.",
            approach: "Private fields, parameterised constructor, accessors, toString returning a formatted line.",
            solution: { lang: "java", code: "public class Swimmer {\n    private String name;\n    private double bestTime;\n\n    public Swimmer(String name, double bestTime) {\n        this.name = name;\n        this.bestTime = bestTime;\n    }\n\n    public String toString() {\n        return name + \"\\t\" + bestTime;\n    }\n}" },
            pitfalls: ["Fields not private."]
          },
          {
            num: "2.2", marks: 10, tags: ["files-read-array"],
            asked: "Read swimmers from a text file into an array in a manager class.",
            approach: "Scanner over the file, split on the delimiter, construct objects, increment count.",
            solution: { lang: "java", code: "public SwimmerManager() {\n    try {\n        Scanner sc = new Scanner(new File(\"swimmers.txt\"));\n        while (sc.hasNextLine()) {\n            String[] p = sc.nextLine().split(\";\");\n            list[size++] = new Swimmer(p[0], Double.parseDouble(p[1]));\n        }\n    } catch (FileNotFoundException e) {\n        System.out.println(e);\n    }\n}" },
            pitfalls: ["Not handling the exception."]
          },
          {
            num: "2.3", marks: 6, tags: ["algo-bubble-sort"],
            asked: "Sort swimmers from fastest to slowest.",
            approach: "Bubble sort comparing getBestTime(); swap objects.",
            solution: { lang: "java", code: "for (int i = 0; i < size - 1; i++)\n    for (int j = 0; j < size - 1 - i; j++)\n        if (list[j].getBestTime() > list[j+1].getBestTime()) {\n            Swimmer t = list[j]; list[j] = list[j+1]; list[j+1] = t;\n        }" },
            pitfalls: ["Using Arrays.sort is not allowed."]
          }
        ]
      }
    ]
  },
  {
    id: "2024-nov", year: 2024, session: "November",
    scenario: "An online bookshop manages books, authors and orders.",
    total: 150,
    sections: [
      {
        name: "SQL",
        questions: [
          {
            num: "1.1", marks: 4, tags: ["sql-group-by", "AVG"],
            asked: "Average price of books per genre, rounded to two decimals.",
            approach: "ROUND(AVG(Price),2) grouped by Genre.",
            solution: { lang: "sql", code: "SELECT Genre, ROUND(AVG(Price), 2) AS AvgPrice\nFROM tblBooks\nGROUP BY Genre;" },
            pitfalls: ["Rounding the wrong value."]
          },
          {
            num: "1.2", marks: 3, tags: ["sql-dates"],
            asked: "Orders placed in March of any year.",
            approach: "MONTH(OrderDate) = 3.",
            solution: { lang: "sql", code: "SELECT *\nFROM tblOrders\nWHERE MONTH(OrderDate) = 3;" },
            pitfalls: []
          }
        ]
      },
      {
        name: "OOP",
        questions: [
          {
            num: "2.1", marks: 12, tags: ["oop-object-class", "dates-localdate"],
            asked: "Book class with a method that works out how many days since it was published.",
            approach: "Store a LocalDate; use ChronoUnit.DAYS.between.",
            solution: { lang: "java", code: "public long daysSincePublished() {\n    return ChronoUnit.DAYS.between(published, LocalDate.now());\n}" },
            pitfalls: ["Storing the date as a String and comparing text."]
          },
          {
            num: "2.2", marks: 7, tags: ["algo-bubble-sort"],
            asked: "Sort books alphabetically by title.",
            approach: "Selection or bubble sort using compareTo.",
            solution: { lang: "java", code: "if (books[j].getTitle().compareTo(books[j+1].getTitle()) > 0) {\n    Book t = books[j]; books[j] = books[j+1]; books[j+1] = t;\n}" },
            pitfalls: []
          }
        ]
      }
    ]
  }
];

window.P1_DRILLS = [
  { id: "d1", topic: "sql-group-by", type: "mcq", prompt: "Which clause filters groups AFTER aggregation?", options: ["WHERE", "HAVING", "ORDER BY", "GROUP BY"], answer: "HAVING", explain: "WHERE filters rows before grouping; HAVING filters the grouped result." },
  { id: "d2", topic: "sql-group-by", type: "sql", prompt: "Count products per Category in tblProducts, show only categories with more than 3 products.", answer: "SELECT Category, COUNT(*) AS Num\nFROM tblProducts\nGROUP BY Category\nHAVING COUNT(*) > 3;", explain: "Aggregate per group then filter with HAVING." },
  { id: "d3", topic: "sql-joins", type: "sql", prompt: "List each order's date with the customer's surname (tblCustomers, tblOrders, linked by CustomerID).", answer: "SELECT c.Surname, o.OrderDate\nFROM tblCustomers c, tblOrders o\nWHERE c.CustomerID = o.CustomerID;", explain: "Join condition matches PK to FK." },
  { id: "d4", topic: "oop-object-class", type: "mcq", prompt: "What should toString() do?", options: ["Print the object", "Return a String describing the object", "Return void", "Read from a file"], answer: "Return a String describing the object", explain: "toString returns; the caller decides whether to print." },
  { id: "d5", topic: "oop-object-class", type: "java", prompt: "Write an accessor for a private double field called price.", answer: "public double getPrice() {\n    return price;\n}", explain: "Accessors are public and return the field type." },
  { id: "d6", topic: "files-read-array", type: "predict", prompt: "What does this print?\n\nString[] p = \"Ann#12.5#Free\".split(\"#\");\nSystem.out.println(p.length + \" \" + p[2]);", answer: "3 Free", explain: "Three parts; index 2 is the third part." },
  { id: "d7", topic: "dates-localdate", type: "mcq", prompt: "In a DateTimeFormatter pattern, what does mm mean?", options: ["Month", "Minutes", "Milliseconds", "Nothing"], answer: "Minutes", explain: "MM is month, mm is minutes." },
  { id: "d8", topic: "algo-bubble-sort", type: "predict", prompt: "After one full pass of an ascending bubble sort on [5, 1, 4, 2], what is the array?", answer: "[1, 4, 2, 5]", explain: "The largest value bubbles to the end in the first pass." }
];

window.P1_PLAN = {
  examNote: "IEB IT Paper 1: 3 hours, 150 marks. Section A SQL, Section B Java OOP. Save often and keep your files in the folder the invigilator gives you.",
  tonight: [
    { time: "18:00", task: "SQL warm-up: GROUP BY, HAVING and joins drills", mins: 45 },
    { time: "18:50", task: "Redo 2025 SQL section from memory, then check model answers", mins: 40 },
    { time: "19:40", task: "Supper break, no screens", mins: 30 },
    { time: "20:10", task: "Write a full object class + manager class from scratch", mins: 60 },
    { time: "21:15", task: "Skim cheat sheets and pitfalls, pack bag", mins: 30 },
    { time: "21:45", task: "Lights out", mins: 0 }
  ],
  checklist: ["Student number and ID", "Two pens", "Water bottle", "Arrive 30 min early", "Know where the exam folder is"],
  markStats: [
    { area: "SQL", avg: 45 },
    { area: "Object class", avg: 35 },
    { area: "Manager class", avg: 45 },
    { area: "UI / output", avg: 25 }
  ],
  sqlDialects: [
    { feature: "Today's date", access: "Date()", mysql: "CURDATE()", javadb: "CURRENT_DATE" },
    { feature: "Date literal", access: "#2025/03/01#", mysql: "'2025-03-01'", javadb: "'2025-03-01'" },
    { feature: "Wildcard (many chars)", access: "*", mysql: "%", javadb: "%" },
    { feature: "Round", access: "ROUND(x, 2)", mysql: "ROUND(x, 2)", javadb: "ROUND(x, 2)" },
    { feature: "Random", access: "RND()", mysql: "RAND()", javadb: "RANDOM()" }
  ],
  resources: [
    { title: "IEB past papers", url: "https://www.ieb.co.za/", why: "Official source for past papers and memos." },
    { title: "Java LocalDate docs", url: "https://docs.oracle.com/javase/8/docs/api/java/time/LocalDate.html", why: "Method names if you blank." }
  ]
};
