/* IEB IT Paper 1 — past-paper walkthroughs.
 * Everything here is written in our own words with our own model solutions.
 * Question wording and memo code are IEB copyright and are NOT reproduced.
 * SQL is given in MS Access syntax by default (the IEB memos list Access first);
 * MySQL / JavaDB differences are noted in the pitfalls.
 */
window.P1_PAPERS = [
/* ===================================================================== */
{
  id: "2025-nov", year: 2025, session: "November",
  scenario: "CGISoft: a software shop's products/clients/sales database (SQL) and a licence system with Free and Premium (child) accounts, device MAC authorisation and a request processor (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 5,
      tags: ["sql-select-where"],
      asked: "Show every column for clients on loyalty level 3 who do not live in Gauteng.",
      approach: "SELECT * from the clients table; two conditions joined with AND; 'not from' means <> (or NOT Province = ...).",
      solution: { lang: "sql", code: `SELECT *
FROM tblClients
WHERE Loyalty = 3 AND Province <> 'Gauteng';` },
      pitfalls: [
        "Loyalty is a number field: write 3, not '3'.",
        "Do not add aliases or rename columns when the question does not ask for it.",
        "NOT Province = 'Gauteng' is also accepted; != works in MySQL but use <> to be safe in every dialect."
      ]
    }, {
      num: "1.2", marks: 6,
      tags: ["sql-like-wildcards", "sql-select-where"],
      asked: "List product name and fee for products whose names end with 'Premium' or 'Deluxe' AND cost more than 400.",
      approach: "Two LIKE patterns with a leading wildcard, OR-ed together inside brackets, then AND the fee condition.",
      solution: { lang: "sql", code: `SELECT ProdName, Fee
FROM tblProducts
WHERE (ProdName LIKE '*Premium' OR ProdName LIKE '*Deluxe')
  AND Fee > 400;` },
      pitfalls: [
        "Without the brackets AND binds tighter than OR, so cheap 'Premium' products would slip through.",
        "Access wildcard is * (and ? for one character); MySQL/JavaDB use % (and _). Either is accepted if consistent with your DBMS.",
        "'*Premium*' would also match names with Premium in the middle — the question said 'ending in'."
      ]
    }, {
      num: "1.3", marks: 3,
      tags: ["sql-aggregates", "sql-calculated"],
      asked: "Count how many sales have been made in total; call the column NumSales.",
      approach: "COUNT(*) over the sales table with an alias.",
      solution: { lang: "sql", code: `SELECT COUNT(*) AS NumSales
FROM tblSales;` },
      pitfalls: [
        "Spell the alias exactly as given (NumSales).",
        "Count rows in tblSales, not tblProducts or tblClients."
      ]
    }, {
      num: "1.4", marks: 5,
      tags: ["sql-date-functions", "sql-order-by"],
      asked: "Support runs from purchase to the end of the following calendar year. List licence and sale date of every sale still supported today, sorted by licence. No hard-coded year.",
      approach: "'End of next calendar year' is about YEARS, not days: the sale is covered if this year minus the sale year is at most 1. Use the DBMS's 'today' function.",
      solution: { lang: "sql", code: `SELECT License, SaleDate
FROM tblSales
WHERE YEAR(Date()) - YEAR(SaleDate) <= 1
ORDER BY License;` },
      pitfalls: [
        "Hard-coding 2024 or 2025 scores zero for the condition.",
        "Using DateDiff in days (e.g. <= 365) gives the wrong rows — the rule is calendar years.",
        "MySQL: YEAR(CURDATE()) (or NOW()); JavaDB: YEAR(CURRENT_DATE). Access accepts Date() or Now().",
        "Your output will differ from the paper if you practise in a later year — that is expected."
      ]
    }, {
      num: "1.5", marks: 4,
      tags: ["sql-joins"],
      asked: "For every sale, show the client's name next to the licence number.",
      approach: "ClientName lives in tblClients, License in tblSales — join them on ClientID.",
      solution: { lang: "sql", code: `SELECT ClientName, License
FROM tblClients INNER JOIN tblSales
  ON tblClients.ClientID = tblSales.ClientID;` },
      pitfalls: [
        "The WHERE-style join (FROM tblClients, tblSales WHERE tblClients.ClientID = tblSales.ClientID) is equally acceptable.",
        "Forgetting the join condition produces a Cartesian product (every client x every sale)."
      ]
    }, {
      num: "1.6", marks: 5,
      tags: ["sql-subqueries", "sql-aggregates"],
      asked: "List name and fee of the products that cost more than the average product fee.",
      approach: "You cannot put AVG directly in WHERE — compute it in a sub-query and compare against it.",
      solution: { lang: "sql", code: `SELECT ProdName, Fee
FROM tblProducts
WHERE Fee > (SELECT AVG(Fee) FROM tblProducts);` },
      pitfalls: [
        "WHERE Fee > AVG(Fee) is an error (aggregate not allowed in WHERE).",
        "Hard-coding the average you worked out by hand loses the marks — it must work for any data."
      ]
    }, {
      num: "1.7", marks: 7,
      tags: ["sql-joins", "sql-group-by", "sql-aggregates"],
      asked: "Per province, total the fees of all products sold (call it ValueOfSales), only showing provinces whose total exceeds 1000.",
      approach: "Province is in tblClients, Fee in tblProducts, and tblSales links them — a 3-table join. GROUP BY Province, SUM(Fee), filter groups with HAVING.",
      solution: { lang: "sql", code: `SELECT Province, SUM(Fee) AS ValueOfSales
FROM tblProducts, tblSales, tblClients
WHERE tblProducts.ProdID = tblSales.ProdID
  AND tblSales.ClientID = tblClients.ClientID
GROUP BY Province
HAVING SUM(Fee) > 1000;` },
      pitfalls: [
        "A group filter goes in HAVING, not WHERE.",
        "Access will not let you use the alias in HAVING (HAVING ValueOfSales > 1000 fails) — repeat SUM(Fee).",
        "Both join conditions are needed; missing one inflates every total.",
        "Access INNER JOIN syntax for 3 tables needs brackets: FROM tblProducts INNER JOIN (tblSales INNER JOIN tblClients ON ...) ON ..."
      ]
    }, {
      num: "1.8", marks: 8,
      tags: ["sql-update", "sql-string-functions", "sql-like-wildcards"],
      asked: "In one query, rename every product ending in 'Deluxe' so that it ends in 'Premium' instead.",
      approach: "UPDATE ... SET ProdName = (name with the last 6 characters chopped off) joined to 'Premium'. LEN gives the length; LEFT keeps the front part. Restrict with LIKE '*Deluxe'.",
      solution: { lang: "sql", code: `UPDATE tblProducts
SET ProdName = LEFT(ProdName, LEN(ProdName) - 6) & 'Premium'
WHERE ProdName LIKE '*Deluxe';

-- MySQL version:
-- UPDATE tblProducts
-- SET ProdName = CONCAT(LEFT(ProdName, LENGTH(ProdName) - 6), 'Premium')
-- WHERE ProdName LIKE '%Deluxe';` },
      pitfalls: [
        "'Deluxe' has 6 letters. Chop 6 and append 'Premium', or chop 7 (incl. the space) and append ' Premium' — both are fine, mixing them is not.",
        "Forgetting the WHERE clause renames every product.",
        "Access joins strings with &; MySQL uses CONCAT(); JavaDB uses || with SUBSTR instead of LEFT, LENGTH instead of LEN.",
        "WHERE RIGHT(ProdName, 6) = 'Deluxe' is an accepted alternative to LIKE."
      ]
    }, {
      num: "1.9", marks: 7,
      tags: ["sql-insert", "sql-random"],
      asked: "Insert one new sale: product 14, client 25, a random licence number between 1 000 000 and 2 000 000, sale date 25 March 2025.",
      approach: "INSERT INTO ... VALUES in field order. Random whole number in [a, b] = INT(RND() * (b - a + 1)) + a. Access date literal uses #...#.",
      solution: { lang: "sql", code: `INSERT INTO tblSales (ProdID, ClientID, License, SaleDate)
VALUES (14, 25, INT(RND() * 1000001) + 1000000, #2025/03/25#);

-- MySQL version:
-- INSERT INTO tblSales (ProdID, ClientID, License, SaleDate)
-- VALUES (14, 25, FLOOR(RAND() * 1000001) + 1000000, '2025-03-25');` },
      pitfalls: [
        "RND()*1000000 + 1000000 without INT gives decimals; INT(RND()*1000000)+1000000 can never reach 2 000 000 (minor, but * 1000001 is exact).",
        "Values must be in the same order as the field list (or the table's column order if you leave the list out).",
        "Access date literal: #2025/03/25#. MySQL/JavaDB: '2025-03-25' in quotes. '2025/03/25' in quotes was also accepted.",
        "MySQL uses RAND() and FLOOR(); JavaDB uses RANDOM() and CAST/FLOOR."
      ]
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1", marks: 3,
      tags: ["oop-class-anatomy"],
      asked: "Start a Free class with private fields name, email (strings) and actDate (a date).",
      approach: "Class header, three private fields, actDate typed as LocalDate. Add the imports you will need.",
      solution: { lang: "java", code: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Free {
    private String name;
    private String email;
    private LocalDate actDate;` },
      pitfalls: [
        "All fields must be private — 'not accessible outside the class'.",
        "Use LocalDate, not String, for a 'Date' field."
      ]
    }, {
      num: "2.2", marks: 4,
      tags: ["oop-constructors", "date-formatter", "date-localdate"],
      asked: "Parameterised constructor (inN, inE, inA). inA is text like '15 06 2025' and must be turned into a date.",
      approach: "Assign the strings directly; build a DateTimeFormatter with pattern \"dd MM yyyy\" and parse inA.",
      solution: { lang: "java", code: `    public Free(String inN, String inE, String inA) {
        name = inN;
        email = inE;
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MM yyyy");
        actDate = LocalDate.parse(inA, fmt);
    }` },
      pitfalls: [
        "Parameter order and types must match the class diagram exactly.",
        "MM = month, mm = minutes. Pattern must match the file exactly, including the spaces.",
        "LocalDate.parse(inA) with no formatter only works for yyyy-MM-dd."
      ]
    }, {
      num: "2.3 & 2.4", marks: 2,
      tags: ["oop-accessors-mutators"],
      asked: "Accessor for name and mutator for email.",
      approach: "One-liners; get returns the field, set is void and assigns the parameter.",
      solution: { lang: "java", code: `    public String getName() {
        return name;
    }

    public void setEmail(String inE) {
        email = inE;
    }` },
      pitfalls: ["A mutator must be void and take a parameter of the field's type; each is all-or-nothing (1 mark)."]
    }, {
      num: "2.5", marks: 3,
      tags: ["date-localdate", "oop-helper-methods"],
      asked: "isActive: true if today is on or before the date six months after the last activation.",
      approach: "Add 6 months to actDate with plusMonths(6). 'On or before' = NOT after.",
      solution: { lang: "java", code: `    public boolean isActive() {
        LocalDate expiry = actDate.plusMonths(6);
        return !LocalDate.now().isAfter(expiry);
    }` },
      pitfalls: [
        "isBefore alone misses the 'equal to' day — use !isAfter or (isBefore || isEqual).",
        "plusMonths returns a NEW date; it does not change actDate (LocalDate is immutable).",
        "Period.between(actDate, now).getMonths() ignores whole years — an activation 1 year 2 months ago would look active. Prefer plusMonths."
      ]
    }, {
      num: "2.6", marks: 2,
      tags: ["date-localdate", "oop-helper-methods"],
      asked: "authorise(): set the activation date to today and return true.",
      approach: "Two statements.",
      solution: { lang: "java", code: `    public boolean authorise() {
        actDate = LocalDate.now();
        return true;
    }` },
      pitfalls: ["Return type is boolean, not void."]
    }, {
      num: "2.7", marks: 2,
      tags: ["oop-tostring"],
      asked: "toString returning name, email and actDate separated by single spaces (date shown as yyyy-MM-dd).",
      approach: "LocalDate's own toString already prints yyyy-MM-dd, so just concatenate.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return name + " " + email + " " + actDate;
    }
}` },
      pitfalls: ["Check spacing exactly against the sample output; don't add labels like 'Name:'."]
    }, {
      num: "3.1", marks: 3,
      tags: ["oop-inheritance", "oop-class-anatomy"],
      asked: "Premium class that inherits from Free, with private licNo (String), qty (int) and macArr (String array).",
      approach: "extends Free; declare the array reference only (size comes from qty in the constructor).",
      solution: { lang: "java", code: `public class Premium extends Free {
    private String licNo;
    private int qty;
    private String[] macArr;` },
      pitfalls: ["Don't redeclare name/email/actDate in the child — they are inherited (and private to Free)."]
    }, {
      num: "3.2", marks: 6,
      tags: ["oop-constructors", "oop-inheritance", "arrays-objects"],
      asked: "Constructor taking the three Free values plus licence and quantity; create macArr with qty slots, each holding the text 'Available'.",
      approach: "super(...) must be the first statement. Then assign own fields, create the array of size qty and fill it in a loop.",
      solution: { lang: "java", code: `    public Premium(String inN, String inE, String inA, String inL, int inQ) {
        super(inN, inE, inA);
        licNo = inL;
        qty = inQ;
        macArr = new String[qty];
        for (int i = 0; i < macArr.length; i++) {
            macArr[i] = "Available";
        }
    }` },
      pitfalls: [
        "super(...) anywhere but the first line is a compile error.",
        "new String[qty] creates null slots — you must loop to fill them, otherwise .equals later throws NullPointerException.",
        "Create the array AFTER qty has been assigned (or use inQ)."
      ]
    }, {
      num: "3.3", marks: 3,
      tags: ["oop-tostring", "oop-inheritance"],
      asked: "Override toString to add licNo and qty after the parent's output, space-separated.",
      approach: "Reuse super.toString() — that is what the marks are for.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return super.toString() + " " + licNo + " " + qty;
    }` },
      pitfalls: ["Rebuilding name/email/date yourself fails: they are private in Free and the mark is for calling super.toString()."]
    }, {
      num: "4.1–4.2", marks: 4,
      tags: ["arrays-objects", "oop-class-anatomy"],
      asked: "RequestManager class with a private array for up to 40 Free/Premium objects and a private counter accSize.",
      approach: "Declare the array with the PARENT type so it can hold both kinds of object (polymorphism).",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.util.Scanner;

public class RequestManager {
    private Free[] accArr = new Free[40];
    private int accSize = 0;` },
      pitfalls: ["Typing the array as Premium[] would not let you store Free objects."]
    }, {
      num: "4.3", marks: 2,
      tags: ["oop-static"],
      asked: "Two public static constants ACCESS = 0 and AUTHORISE = 1.",
      approach: "public static final, names in capitals.",
      solution: { lang: "java", code: `    public static final int ACCESS = 0;
    public static final int AUTHORISE = 1;` },
      pitfalls: ["Missing 'final' means it is not a constant; missing 'public' means it is not accessible outside."]
    }, {
      num: "4.4", marks: 11,
      tags: ["files-read-scanner", "str-split-build", "arrays-objects", "oop-polymorphism"],
      asked: "Constructor that reads Accounts.txt; each line becomes a Free object (3 fields) or a Premium object (5 fields), stored in the next slot of the array, counting as you go.",
      approach: "Scanner over the file inside try/catch. For each line split on '#'. If there are 5 parts it is Premium (parse qty as int), otherwise Free. Store at accArr[accSize] then accSize++.",
      solution: { lang: "java", code: `    public RequestManager() {
        try {
            Scanner fileSc = new Scanner(new File("Accounts.txt"));
            while (fileSc.hasNextLine()) {
                String line = fileSc.nextLine();
                String[] parts = line.split("#");
                if (parts.length == 5) {
                    int qty = Integer.parseInt(parts[4]);
                    accArr[accSize] = new Premium(parts[0], parts[1], parts[2], parts[3], qty);
                } else {
                    accArr[accSize] = new Free(parts[0], parts[1], parts[2]);
                }
                accSize++;
            }
            fileSc.close();
        } catch (FileNotFoundException e) {
            System.out.println("Accounts.txt not found");
        }
    }` },
      pitfalls: [
        "Increment accSize AFTER storing (or store at accSize then ++) — off-by-one loses marks.",
        "qty must be converted with Integer.parseInt; the constructor wants an int.",
        "new Scanner(new File(...)) needs try/catch for FileNotFoundException or the code won't compile.",
        "The file name must match exactly and the file must be in the NetBeans project folder (not src)."
      ]
    }, {
      num: "4.5", marks: 5,
      tags: ["algo-sort", "arrays-objects", "str-methods"],
      asked: "sortByName: sort the account array alphabetically by name, coded by hand.",
      approach: "Selection-style or bubble sort over 0..accSize-1 comparing getName() with compareTo; swap whole objects using a temp of type Free.",
      solution: { lang: "java", code: `    public void sortByName() {
        for (int i = 0; i < accSize - 1; i++) {
            for (int j = i + 1; j < accSize; j++) {
                if (accArr[i].getName().compareTo(accArr[j].getName()) > 0) {
                    Free temp = accArr[i];
                    accArr[i] = accArr[j];
                    accArr[j] = temp;
                }
            }
        }
    }` },
      pitfalls: [
        "Loop to accSize, not accArr.length (40) — the empty slots are null and will crash compareTo.",
        "Compare Strings with compareTo, never with < or >.",
        "Swap the objects, not just the names.",
        "Arrays.sort / Collections.sort earns no marks."
      ]
    }, {
      num: "4.6", marks: 4,
      tags: ["oop-tostring", "arrays-objects", "oop-polymorphism"],
      asked: "toString for the manager: every account's toString on its own line.",
      approach: "Loop to accSize, append each object (its own toString is called automatically — Premium's override runs for Premium objects) plus a newline.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "";
        for (int i = 0; i < accSize; i++) {
            out += accArr[i].toString() + "\\n";
        }
        return out;
    }` },
      pitfalls: ["Printing inside toString instead of returning a String loses the return mark."]
    }, {
      num: "5.1–5.4", marks: 4,
      tags: ["oop-ui-class"],
      asked: "Text-based RequestUI class with main: create the manager, sort by name, print the accounts.",
      approach: "One mark each: class with main, instantiate, call sortByName, print the object.",
      solution: { lang: "java", code: `public class RequestUI {
    public static void main(String[] args) {
        RequestManager rm = new RequestManager();
        rm.sortByName();
        System.out.println(rm);
        // Q7.4 is added here later:
        System.out.println(rm.processRequests());
    }
}` },
      pitfalls: ["Call sortByName BEFORE printing."]
    }, {
      num: "6.1", marks: 4,
      tags: ["arrays-search"],
      asked: "Premium.isAuthorised(mac): linear search of macArr; true if the MAC is there.",
      approach: "Loop over macArr; return true on a match; return false only after the loop.",
      solution: { lang: "java", code: `    public boolean isAuthorised(String mac) {
        for (int i = 0; i < qty; i++) {
            if (macArr[i].equals(mac)) {
                return true;
            }
        }
        return false;
    }` },
      pitfalls: [
        "Putting 'else return false' inside the loop stops after the first element.",
        "Use .equals for Strings, not ==."
      ]
    }, {
      num: "6.2", marks: 4,
      tags: ["arrays-search", "oop-inheritance", "date-localdate"],
      asked: "Premium.authorise(mac): put the MAC in the first 'Available' slot, refresh the activation date, return true; return false if no slot is free.",
      approach: "Search for the first 'Available'. actDate is private in Free, so refresh it by calling the inherited no-arg authorise().",
      solution: { lang: "java", code: `    public boolean authorise(String mac) {
        for (int i = 0; i < qty; i++) {
            if (macArr[i].equals("Available")) {
                macArr[i] = mac;
                super.authorise();   // sets actDate to today in the parent
                return true;
            }
        }
        return false;
    }` },
      pitfalls: [
        "actDate = LocalDate.now() in Premium will not compile — the field is private in Free.",
        "Without stopping (return/flag) after the first free slot you fill EVERY free slot.",
        "This is an overload (different parameters), not an override of Free.authorise()."
      ]
    }, {
      num: "6.3", marks: 4,
      tags: ["str-methods", "algo-validation"],
      asked: "isValid: sum the Unicode values of the characters in the name, take the remainder after dividing by 100, and check it equals the last two digits of the licence.",
      approach: "Adding a char to an int adds its Unicode code. Compare as numbers so '02' and 2 match.",
      solution: { lang: "java", code: `    public boolean isValid() {
        String n = getName();
        int sum = 0;
        for (int i = 0; i < n.length(); i++) {
            sum += n.charAt(i);          // char promotes to its Unicode value
        }
        int check = sum % 100;
        int lastTwo = Integer.parseInt(licNo.substring(licNo.length() - 2));
        return lastTwo == check;
    }` },
      pitfalls: [
        "Comparing the String '02' with String.valueOf(2) = '2' fails — compare ints, or format check with String.format(\"%02d\", check).",
        "name is private in Free: use getName().",
        "Include spaces in the sum — they are characters too."
      ]
    }, {
      num: "7.1", marks: 9,
      tags: ["oop-helper-methods", "oop-static"],
      asked: "Private helper processFree(action, account): for ACCESS say whether the free account is active or expired; for AUTHORISE authorise it and say so.",
      approach: "if/else or switch on action using the constants (not 0/1). Return just the message — the caller puts the name in front.",
      solution: { lang: "java", code: `    private String processFree(int action, Free account) {
        String msg = "";
        if (action == ACCESS) {
            if (account.isActive()) {
                msg = " has access to the free version.";
            } else {
                msg = " has an expired account.";
            }
        } else if (action == AUTHORISE) {
            account.authorise();
            msg = " has been authorised for the free version.";
        }
        return msg;
    }` },
      pitfalls: [
        "Using 0 and 1 instead of ACCESS/AUTHORISE was penalised.",
        "Header must be private with (int, Free) parameters returning String."
      ]
    }, {
      num: "7.2", marks: 10,
      tags: ["oop-helper-methods", "oop-static"],
      asked: "Private helper processPremium(action, account, mac): invalid licence first; then ACCESS needs active AND authorised; AUTHORISE tries to add the device.",
      approach: "Check isValid() first. Messages start with the MAC address (with a leading space so the caller can write name + result).",
      solution: { lang: "java", code: `    private String processPremium(int action, Premium account, String mac) {
        if (!account.isValid()) {
            return " has an invalid license.";
        }
        String msg = "";
        if (action == ACCESS) {
            if (account.isActive() && account.isAuthorised(mac)) {
                msg = " " + mac + " has access to the premium version.";
            } else {
                msg = " " + mac + " does not have access to the premium version.";
            }
        } else if (action == AUTHORISE) {
            if (account.authorise(mac)) {
                msg = " " + mac + " has been authorised for the premium version.";
            } else {
                msg = " " + mac + " is not authorised. Purchase another license.";
            }
        }
        return msg;
    }` },
      pitfalls: [
        "Check validity BEFORE the action — an invalid licence must never be authorised.",
        "ACCESS needs both isActive() and isAuthorised(mac) (&&)."
      ]
    }, {
      num: "7.3", marks: 10,
      tags: ["files-read-scanner", "arrays-search", "oop-polymorphism", "str-split-build"],
      asked: "processRequests: read Requests.txt (action#name or action#name#mac), find each account by name, send it to the right helper, and return all the feedback lines.",
      approach: "Split each line; parse the action. Linear search for the name. Use instanceof to tell Premium from Free; cast to Premium to call processPremium; only premium lines have a MAC.",
      solution: { lang: "java", code: `    public String processRequests() {
        String out = "";
        try {
            Scanner fileSc = new Scanner(new File("Requests.txt"));
            while (fileSc.hasNextLine()) {
                String[] parts = fileSc.nextLine().split("#");
                int action = Integer.parseInt(parts[0]);
                String name = parts[1];

                int pos = -1;
                for (int i = 0; i < accSize && pos == -1; i++) {
                    if (accArr[i].getName().equals(name)) {
                        pos = i;
                    }
                }

                if (pos != -1) {
                    if (accArr[pos] instanceof Premium) {
                        String mac = parts[2];
                        out += name + processPremium(action, (Premium) accArr[pos], mac) + "\\n";
                    } else {
                        out += name + processFree(action, accArr[pos]) + "\\n";
                    }
                }
            }
            fileSc.close();
        } catch (FileNotFoundException e) {
            System.out.println("Requests.txt not found");
        }
        return out;
    }` },
      pitfalls: [
        "You must cast: (Premium) accArr[pos] — a Free reference cannot call processPremium.",
        "Reading parts[2] for a free-account line throws ArrayIndexOutOfBoundsException — only read the MAC inside the Premium branch.",
        "Use the helper methods; re-coding their logic here loses marks."
      ]
    }, {
      num: "7.4", marks: 1,
      tags: ["oop-ui-class"],
      asked: "In the UI, call processRequests and print the result.",
      approach: "One line in main (shown in 5.1–5.4).",
      solution: { lang: "java", code: `System.out.println(rm.processRequests());` },
      pitfalls: ["Calling the method without printing the returned String earns nothing."]
    }]
  }]
},
/* ===================================================================== */
{
  id: "2024-nov", year: 2024, session: "November",
  scenario: "South African Records: musicians, festivals and bookings (SQL); Musician and Song classes read from one mixed text file, long-term contracts, genre constants and an 'easy listening' report (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 4,
      tags: ["sql-select-where"],
      asked: "Show all details of solo musicians who are from Gauteng.",
      approach: "Solo is a Yes/No (Boolean) field, so test it as True; AND the province.",
      solution: { lang: "sql", code: `SELECT *
FROM tblMusicians
WHERE Solo = True AND Province = 'Gauteng';` },
      pitfalls: [
        "Don't write Solo = 'Yes' — in Access a Yes/No field is True/False (Yes/No without quotes also works). MySQL stores booleans as 1/0 (TRUE works).",
        "WHERE Solo AND Province = 'Gauteng' is also valid."
      ]
    }, {
      num: "1.2", marks: 4,
      tags: ["sql-calculated"],
      asked: "List every festival's name, date and income, where income = capacity x ticket cost, in a column called Income.",
      approach: "Calculated field with an alias; no WHERE needed.",
      solution: { lang: "sql", code: `SELECT FestName, FestDate, Capacity * TicketCost AS Income
FROM tblFestivals;` },
      pitfalls: ["Alias spelled exactly; do not add extra columns."]
    }, {
      num: "1.3", marks: 3,
      tags: ["sql-aggregates", "sql-select-where"],
      asked: "Average ticket cost of festivals with capacity under 10 000 (output column shown as AveCost).",
      approach: "AVG with a WHERE filter; give it the alias that appears in the sample output.",
      solution: { lang: "sql", code: `SELECT AVG(TicketCost) AS AveCost
FROM tblFestivals
WHERE Capacity < 10000;` },
      pitfalls: ["The filter is on individual rows, so WHERE (not HAVING)."]
    }, {
      num: "1.4", marks: 7,
      tags: ["sql-group-by", "sql-aggregates", "sql-date-functions", "sql-order-by"],
      asked: "For festivals that have already happened, show each festival name and how many times it has run — only names that ran more than once — sorted by name.",
      approach: "WHERE removes future rows first (FestDate < today), GROUP BY FestName, COUNT(*), HAVING COUNT(*) > 1, ORDER BY FestName.",
      solution: { lang: "sql", code: `SELECT FestName, COUNT(*) AS NumFests
FROM tblFestivals
WHERE FestDate < Date()
GROUP BY FestName
HAVING COUNT(*) > 1
ORDER BY FestName;` },
      pitfalls: [
        "Order of clauses: WHERE → GROUP BY → HAVING → ORDER BY.",
        "The date condition is per row (WHERE); the 'more than once' condition is per group (HAVING).",
        "MySQL: CURDATE(); JavaDB: CURRENT_DATE. Never hard-code today's date."
      ]
    }, {
      num: "1.5", marks: 6,
      tags: ["sql-subqueries", "sql-string-functions", "sql-select-where"],
      asked: "Show the first three letters of the stage name of every musician who has no bookings at all.",
      approach: "'Not booked' = MusID does not appear in tblBookings → NOT IN (sub-query). LEFT(StageName, 3) for the first 3 characters.",
      solution: { lang: "sql", code: `SELECT LEFT(StageName, 3) AS StageName
FROM tblMusicians
WHERE MusID NOT IN (SELECT MusID FROM tblBookings);

-- Alternative: outer join and look for the missing match
-- SELECT LEFT(StageName, 3)
-- FROM tblMusicians LEFT JOIN tblBookings
--   ON tblMusicians.MusID = tblBookings.MusID
-- WHERE tblBookings.MusID IS NULL;` },
      pitfalls: [
        "An INNER JOIN can never find rows with NO match — use NOT IN or LEFT JOIN ... IS NULL.",
        "Access: LEFT or MID(StageName, 1, 3); JavaDB: SUBSTR(StageName, 1, 3).",
        "The memo did not require the alias; the sample heading shows StageName, so aliasing is harmless."
      ]
    }, {
      num: "1.6", marks: 6,
      tags: ["sql-joins", "sql-string-functions", "sql-calculated"],
      asked: "For each booking show the festival name and one combined column with the festival date, a space, then the set time.",
      approach: "Join festivals and bookings on FestID; concatenate date & ' ' & time.",
      solution: { lang: "sql", code: `SELECT FestName, FestDate & ' ' & SetTime AS SetDateAndTime
FROM tblFestivals INNER JOIN tblBookings
  ON tblFestivals.FestID = tblBookings.FestID;

-- MySQL:  CONCAT(FestDate, ' ', SetTime)
-- JavaDB: FestDate || ' ' || SetTime` },
      pitfalls: [
        "Access uses & (+ also works for text but returns Null if anything is Null); MySQL needs CONCAT — + in MySQL adds numbers.",
        "Remember the space between date and time."
      ]
    }, {
      num: "1.7", marks: 8,
      tags: ["sql-joins", "sql-group-by", "sql-aggregates", "sql-order-by"],
      asked: "For every festival (name and date) total the fees of the musicians booked; newest festival first.",
      approach: "3-table join (musicians-bookings-festivals). Group by BOTH FestName and FestDate because the same name repeats on different dates. SUM(Fee). ORDER BY FestDate DESC.",
      solution: { lang: "sql", code: `SELECT FestName, FestDate, SUM(Fee) AS TotalFee
FROM tblMusicians, tblBookings, tblFestivals
WHERE tblMusicians.MusID = tblBookings.MusID
  AND tblFestivals.FestID = tblBookings.FestID
GROUP BY FestName, FestDate
ORDER BY FestDate DESC;` },
      pitfalls: [
        "Every non-aggregated column in SELECT must appear in GROUP BY.",
        "Grouping only by FestName merges different years of the same festival.",
        "DESC for most recent first (ASC is the default)."
      ]
    }, {
      num: "1.8", marks: 4,
      tags: ["sql-update"],
      asked: "Make every 'Coffee and Cake' festival free (ticket cost 0).",
      approach: "Simple UPDATE with WHERE on the name.",
      solution: { lang: "sql", code: `UPDATE tblFestivals
SET TicketCost = 0
WHERE FestName = 'Coffee and Cake';` },
      pitfalls: ["No WHERE = every festival becomes free."]
    }, {
      num: "1.9", marks: 8,
      tags: ["sql-insert", "sql-like-wildcards", "sql-date-functions", "sql-subqueries"],
      asked: "With ONE query, copy every 2024 festival with 'Fire' anywhere in its name into new 2025 rows: same name and capacity, date 1 Jan 2025, ticket R20 dearer.",
      approach: "INSERT INTO ... SELECT: the SELECT produces the new rows (a literal date, TicketCost + 20) from the 2024 Fire rows. Leave FestID out — it is AutoNumber.",
      solution: { lang: "sql", code: `INSERT INTO tblFestivals (FestName, FestDate, Capacity, TicketCost)
SELECT FestName, #2025/01/01#, Capacity, TicketCost + 20
FROM tblFestivals
WHERE FestName LIKE '*Fire*' AND YEAR(FestDate) = 2024;` },
      pitfalls: [
        "INSERT ... SELECT has NO 'VALUES' keyword.",
        "Don't insert into the AutoNumber FestID.",
        "Without the YEAR = 2024 filter you copy the 2022/2023 Fire festivals too.",
        "MySQL/JavaDB: '2025-01-01' and LIKE '%Fire%'."
      ]
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1", marks: 3,
      tags: ["oop-class-anatomy"],
      asked: "Song class with private artistName, title (String), likes, dislikes (int).",
      approach: "Class header plus four private fields.",
      solution: { lang: "java", code: `public class Song {
    private String artistName;
    private String title;
    private int likes;
    private int dislikes;` },
      pitfalls: ["Private, correctly typed, names exactly as in the diagram."]
    }, {
      num: "2.2", marks: 3,
      tags: ["oop-constructors"],
      asked: "Parameterised constructor for all four fields.",
      approach: "Parameters in diagram order; assign each to its field.",
      solution: { lang: "java", code: `    public Song(String inAN, String inTitle, int inL, int inD) {
        artistName = inAN;
        title = inTitle;
        likes = inL;
        dislikes = inD;
    }` },
      pitfalls: ["No return type on a constructor (not even void)."]
    }, {
      num: "2.3", marks: 2,
      tags: ["oop-accessors-mutators"],
      asked: "Accessors for artistName, title and likes.",
      approach: "Three getters; return types match the fields.",
      solution: { lang: "java", code: `    public String getArtistName() { return artistName; }
    public String getTitle()      { return title; }
    public int getLikes()         { return likes; }` },
      pitfalls: ["One wrong/missing accessor drops you to 1 of 2."]
    }, {
      num: "2.4", marks: 3,
      tags: ["oop-helper-methods"],
      asked: "getWellLiked: true when the song has more likes than dislikes.",
      approach: "Return the boolean expression directly.",
      solution: { lang: "java", code: `    public boolean getWellLiked() {
        return likes > dislikes;
    }` },
      pitfalls: ["Return type boolean; >= is wrong (must be MORE likes)."]
    }, {
      num: "2.5", marks: 2,
      tags: ["oop-tostring", "str-format"],
      asked: "toString: title, likes, dislikes separated by tab characters.",
      approach: "Join with \"\\t\".",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return title + "\\t" + likes + "\\t" + dislikes;
    }
}` },
      pitfalls: ["A tab is \\t, not several spaces."]
    }, {
      num: "3.1–3.2", marks: 5,
      tags: ["oop-class-anatomy", "oop-static"],
      asked: "Musician class with private name, stageName (String), genre (int), start (date) and public class constants ROCK=1, GQOM=2, AMAPIANO=3, TECHNO=4.",
      approach: "Private fields; constants are public static final int.",
      solution: { lang: "java", code: `import java.time.LocalDate;

public class Musician {
    private String name;
    private String stageName;
    private int genre;
    private LocalDate start;

    public static final int ROCK = 1;
    public static final int GQOM = 2;
    public static final int AMAPIANO = 3;
    public static final int TECHNO = 4;` },
      pitfalls: ["Constants need static AND final, in capitals; '+' in the diagram means public."]
    }, {
      num: "3.3", marks: 5,
      tags: ["oop-constructors", "str-methods"],
      asked: "Constructor (inName, inStage, inGenre, inStart as a date). If the stage name is blank, use the real name as the stage name.",
      approach: "Assign name, genre, start; then if/else on inStage.isEmpty() (or .equals(\"\")).",
      solution: { lang: "java", code: `    public Musician(String inName, String inStage, int inGenre, LocalDate inStart) {
        name = inName;
        genre = inGenre;
        start = inStart;
        if (inStage.isEmpty()) {
            stageName = inName;
        } else {
            stageName = inStage;
        }
    }` },
      pitfalls: [
        "inStage == \"\" compares references — use .equals(\"\") or .isEmpty().",
        "The last parameter is already a LocalDate here (the manager parses it)."
      ]
    }, {
      num: "3.4", marks: 2,
      tags: ["oop-accessors-mutators"],
      asked: "Accessors for name and start.",
      approach: "getStart returns LocalDate.",
      solution: { lang: "java", code: `    public String getName()     { return name; }
    public LocalDate getStart() { return start; }` },
      pitfalls: []
    }, {
      num: "3.5", marks: 4,
      tags: ["oop-helper-methods", "oop-static"],
      asked: "getGenre returns the genre as a word using the constants, or 'Uncategorised' for any other number.",
      approach: "switch on genre with the constants as case labels and a default.",
      solution: { lang: "java", code: `    public String getGenre() {
        switch (genre) {
            case ROCK:     return "Rock";
            case GQOM:     return "Gqom";
            case AMAPIANO: return "Amapiano";
            case TECHNO:   return "Techno";
            default:       return "Uncategorised";
        }
    }` },
      pitfalls: [
        "Use the constants (ROCK etc.), not 1–4, in the comparisons.",
        "Every path must return something — the default/else is required."
      ]
    }, {
      num: "3.6", marks: 2,
      tags: ["oop-accessors-mutators"],
      asked: "setGenre mutator.",
      approach: "void, int parameter.",
      solution: { lang: "java", code: `    public void setGenre(int inGenre) {
        genre = inGenre;
    }` },
      pitfalls: []
    }, {
      num: "3.7", marks: 2,
      tags: ["oop-tostring"],
      asked: "toString: stage name, genre as text, start date — tab-separated.",
      approach: "Call getGenre() so the word, not the number, is shown.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return stageName + "\\t" + getGenre() + "\\t" + start;
    }
}` },
      pitfalls: ["Using the int field genre prints 4 instead of Techno."]
    }, {
      num: "4.1–4.2", marks: 4,
      tags: ["arrays-objects"],
      asked: "MusicManager with private arrays musArr and songArr (100 each) and counters musSize and songSize.",
      approach: "Two arrays of objects plus two int counters.",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class MusicManager {
    private Musician[] musArr = new Musician[100];
    private int musSize = 0;
    private Song[] songArr = new Song[100];
    private int songSize = 0;` },
      pitfalls: []
    }, {
      num: "4.3", marks: 15,
      tags: ["files-read-scanner", "str-split-build", "date-formatter", "arrays-objects"],
      asked: "Constructor reading MusicData.txt: the first 7 lines are musicians (name;stage;genre;yyyy MM dd), every line after that is a song (artist;title;likes;dislikes). Handle a missing file with a message.",
      approach: "Counted for-loop for exactly 7 musician lines, then a while(hasNextLine) loop for songs. split(\";\"). Parse the date with pattern \"yyyy MM dd\". Note the blank stage name gives an empty string between ;; — split keeps it.",
      solution: { lang: "java", code: `    public MusicManager() {
        File f = new File("MusicData.txt");
        if (!f.exists()) {
            System.out.println("MusicData.txt could not be found");
            return;
        }
        try {
            Scanner sc = new Scanner(f);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy MM dd");

            for (int i = 0; i < 7; i++) {
                String[] p = sc.nextLine().split(";");
                int genre = Integer.parseInt(p[2]);
                LocalDate start = LocalDate.parse(p[3], fmt);
                musArr[musSize] = new Musician(p[0], p[1], genre, start);
                musSize++;
            }

            while (sc.hasNextLine()) {
                String[] p = sc.nextLine().split(";");
                int likes = Integer.parseInt(p[2]);
                int dislikes = Integer.parseInt(p[3]);
                songArr[songSize] = new Song(p[0], p[1], likes, dislikes);
                songSize++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("Error reading MusicData.txt");
        }
    }` },
      pitfalls: [
        "If you use a Scanner with useDelimiter(\";\") the empty stage name is still returned as \"\" by next() — fine. But a trailing empty field at the END of a line would be dropped by split (not an issue here).",
        "Parse numbers before passing them to the constructor (int parameters).",
        "Pattern must be \"yyyy MM dd\" (with spaces) — not \"yyyy/MM/dd\".",
        "Using one while loop and an if (count < 7) also works."
      ]
    }, {
      num: "4.4", marks: 6,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "Manager toString: heading 'Musicians', every musician on its own line, a blank line, heading 'Songs', every song on its own line.",
      approach: "Start the string with the heading and newline; loop each array to its counter; extra \\n for the blank line.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "Musicians\\n";
        for (int i = 0; i < musSize; i++) {
            out += musArr[i] + "\\n";
        }
        out += "\\nSongs\\n";
        for (int i = 0; i < songSize; i++) {
            out += songArr[i] + "\\n";
        }
        return out;
    }` },
      pitfalls: ["Loop to the counters, not to 100 (nulls would print as 'null')."]
    }, {
      num: "4.5", marks: 6,
      tags: ["date-localdate", "arrays-counters-totals"],
      asked: "getLongTermMusicians: for musicians whose contract began more than 5 years ago, return 'name N years.' lines (N = completed years, today not hard-coded).",
      approach: "Period.between(start, LocalDate.now()).getYears() gives completed years. Keep those > 5.",
      solution: { lang: "java", code: `    public String getLongTermMusicians() {
        String out = "";
        LocalDate today = LocalDate.now();
        for (int i = 0; i < musSize; i++) {
            int years = Period.between(musArr[i].getStart(), today).getYears();
            if (years > 5) {
                out += musArr[i].getName() + " " + years + " years.\\n";
            }
        }
        return out;
    }` },
      pitfalls: [
        "today.getYear() - start.getYear() over-counts if the anniversary hasn't happened yet this year.",
        "ChronoUnit.YEARS.between(start, today) is an accepted alternative.",
        "Period.between(later, earlier) gives a negative period — order is (start, today)."
      ]
    }, {
      num: "5.1–5.4", marks: 4,
      tags: ["oop-ui-class"],
      asked: "MusicUI with main: create the manager, print it, print the long-term musicians.",
      approach: "1 mark each.",
      solution: { lang: "java", code: `public class MusicUI {
    public static void main(String[] args) {
        MusicManager mm = new MusicManager();
        System.out.println(mm);
        System.out.println(mm.getLongTermMusicians());
        // 6.2
        mm.adjustGenre("Samuel Ericson", Musician.TECHNO);
        // 7.2
        System.out.println(mm.listEasyListeners());
    }
}` },
      pitfalls: []
    }, {
      num: "6.1", marks: 6,
      tags: ["arrays-search", "oop-accessors-mutators"],
      asked: "adjustGenre(name, genre): find the musician by name and set their genre. Returns nothing.",
      approach: "Linear search with a found flag; call the mutator on the match.",
      solution: { lang: "java", code: `    public void adjustGenre(String inName, int inGenre) {
        boolean found = false;
        int i = 0;
        while (i < musSize && !found) {
            if (musArr[i].getName().equals(inName)) {
                musArr[i].setGenre(inGenre);
                found = true;
            }
            i++;
        }
    }` },
      pitfalls: ["Must call setGenre — you cannot reach the private field from the manager."]
    }, {
      num: "6.2", marks: 2,
      tags: ["oop-static", "oop-ui-class"],
      asked: "From the UI, change Samuel Ericson's genre to TECHNO.",
      approach: "Reference the constant through the class name.",
      solution: { lang: "java", code: `mm.adjustGenre("Samuel Ericson", Musician.TECHNO);` },
      pitfalls: ["Passing 4 instead of Musician.TECHNO lost a mark."]
    }, {
      num: "6.3", marks: 6,
      tags: ["arrays-counters-totals", "oop-helper-methods"],
      asked: "Private helper countSongs(name): how many songs belong to that artist.",
      approach: "Counter, loop to songSize, compare getArtistName() with the parameter.",
      solution: { lang: "java", code: `    private int countSongs(String inName) {
        int count = 0;
        for (int i = 0; i < songSize; i++) {
            if (songArr[i].getArtistName().equals(inName)) {
                count++;
            }
        }
        return count;
    }` },
      pitfalls: ["'Helper' implies private.", "Initialise count to 0 INSIDE the method."]
    }, {
      num: "7.1", marks: 17,
      tags: ["arrays-search", "arrays-counters-totals", "oop-helper-methods", "str-split-build"],
      asked: "listEasyListeners: for every musician, a heading line then their 'easy listening' songs (>5000 likes and well liked); 'No suitable songs' if they have songs but none qualify; 'No songs recorded' if they have none; blank line between musicians.",
      approach: "Nested loops: outer over musicians, inner over songs. Use countSongs to decide 'no songs' first. Use a boolean flag to detect 'none qualified'.",
      solution: { lang: "java", code: `    public String listEasyListeners() {
        String out = "";
        for (int i = 0; i < musSize; i++) {
            String name = musArr[i].getName();
            out += name + " Easy Listeners\\n";

            if (countSongs(name) == 0) {
                out += "No songs recorded\\n";
            } else {
                boolean any = false;
                for (int j = 0; j < songSize; j++) {
                    Song s = songArr[j];
                    if (s.getArtistName().equals(name)
                            && s.getLikes() > 5000 && s.getWellLiked()) {
                        out += s.getTitle() + "\\n";
                        any = true;
                    }
                }
                if (!any) {
                    out += "No suitable songs\\n";
                }
            }
            out += "\\n";
        }
        return out;
    }` },
      pitfalls: [
        "Reset the flag for EVERY musician (declare it inside the outer loop).",
        "Check 'no songs' before 'no suitable songs', or you'll print the wrong message for Roger Hatfield.",
        "Use the countSongs helper — that is what it was built for."
      ]
    }, {
      num: "7.2", marks: 1,
      tags: ["oop-ui-class"],
      asked: "Display the easy-listening report from the UI.",
      approach: "Print the returned string (after the genre change).",
      solution: { lang: "java", code: `System.out.println(mm.listEasyListeners());` },
      pitfalls: []
    }]
  }]
},
/* ===================================================================== */
{
  id: "2023-nov", year: 2023, session: "November",
  scenario: "RentMyParking: cars, parking bays and rentals (SQL); RFID garage entries with a Daily parent class and LongTerm child class using LocalDateTime, fees, sorting and monthly invoices (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 4,
      tags: ["sql-select-where", "sql-order-by"],
      asked: "All fields of the premium bays, cheapest daily rate first.",
      approach: "Boolean test on PremiumParking, ORDER BY DailyRate (ascending is the default).",
      solution: { lang: "sql", code: `SELECT *
FROM tblParkings
WHERE PremiumParking = True
ORDER BY DailyRate ASC;` },
      pitfalls: ["PremiumParking is Yes/No — compare with True, not the text 'Yes'."]
    }, {
      num: "1.2", marks: 5,
      tags: ["sql-like-wildcards", "sql-string-functions"],
      asked: "Cars with the newer Gauteng registrations: the registration ends in 'GP' and its 3rd character is a space.",
      approach: "LIKE for the ending; MID(field, 3, 1) = ' ' for the third character (or a ?? pattern).",
      solution: { lang: "sql", code: `SELECT *
FROM tblCars
WHERE CarRegistration LIKE '*GP'
  AND MID(CarRegistration, 3, 1) = ' ';

-- One-pattern alternative in Access: LIKE '?? *GP'
-- MySQL: LIKE '%GP' AND SUBSTRING(CarRegistration, 3, 1) = ' '   (or LIKE '__ %GP')` },
      pitfalls: [
        "MID is 1-based: MID(x, 3, 1) is the third character.",
        "Access single-character wildcard is ?, MySQL's is _."
      ]
    }, {
      num: "1.3", marks: 6,
      tags: ["sql-select-where", "sql-date-functions"],
      asked: "Address, rate, date added and premium flag for bays that are premium OR (charge more than R135 AND were added in 2022).",
      approach: "OR between the premium test and a bracketed AND group; YEAR() for the 2022 test.",
      solution: { lang: "sql", code: `SELECT Address, DailyRate, DateAdded, PremiumParking
FROM tblParkings
WHERE PremiumParking = True
   OR (DailyRate > 135 AND YEAR(DateAdded) = 2022);` },
      pitfalls: [
        "Brackets matter: the 2022 condition belongs only with the price condition.",
        "BETWEEN #2022/01/01# AND #2022/12/31# is an alternative to YEAR()."
      ]
    }, {
      num: "1.4", marks: 5,
      tags: ["sql-subqueries", "sql-aggregates"],
      asked: "All details of the bay(s) with the highest daily rate (there is a tie).",
      approach: "Compare DailyRate with a sub-query that returns MAX(DailyRate) — this returns every tied row.",
      solution: { lang: "sql", code: `SELECT *
FROM tblParkings
WHERE DailyRate = (SELECT MAX(DailyRate) FROM tblParkings);` },
      pitfalls: [
        "SELECT TOP 1 ... ORDER BY DailyRate DESC returns only one row — wrong when there is a tie (Access TOP actually returns ties, MySQL LIMIT 1 doesn't). The sub-query is safest.",
        "SELECT *, MAX(DailyRate) without GROUP BY is an error."
      ]
    }, {
      num: "1.5", marks: 4,
      tags: ["sql-subqueries", "sql-select-where", "sql-joins"],
      asked: "Registration and model of cars that have never been rented.",
      approach: "NOT IN a sub-query of rented registrations (or LEFT JOIN and test the right side IS NULL).",
      solution: { lang: "sql", code: `SELECT CarRegistration, Model
FROM tblCars
WHERE CarRegistration NOT IN (SELECT CarRegistration FROM tblRentedParkings);` },
      pitfalls: [
        "In a LEFT JOIN version you must qualify tblCars.CarRegistration in SELECT (ambiguous field otherwise).",
        "= NULL never works — use IS NULL."
      ]
    }, {
      num: "1.6", marks: 7,
      tags: ["sql-joins", "sql-group-by", "sql-aggregates"],
      asked: "For each bay rented 3 or more times, show its address and how many times it was rented (TimesRented).",
      approach: "Join bays to rentals, GROUP BY Address, COUNT(*), HAVING COUNT(*) >= 3.",
      solution: { lang: "sql", code: `SELECT Address, COUNT(*) AS TimesRented
FROM tblParkings INNER JOIN tblRentedParkings
  ON tblParkings.ParkingID = tblRentedParkings.ParkingID
GROUP BY Address
HAVING COUNT(*) >= 3;` },
      pitfalls: [
        "'3 or more' is >= 3 (or > 2).",
        "HAVING TimesRented >= 3 works in MySQL only, not Access."
      ]
    }, {
      num: "1.7", marks: 9,
      tags: ["sql-joins", "sql-date-functions", "sql-calculated"],
      asked: "For every rental: registration, owner, daily rate, start, end, and RentAmount = days between start and end x daily rate.",
      approach: "3-table join (cars-rentals-bays). Days between two dates: DateDiff('d', start, end) in Access (or simply EndDate - StartDate).",
      solution: { lang: "sql", code: `SELECT tblCars.CarRegistration, Owner, DailyRate, StartDate, EndDate,
       DateDiff('d', StartDate, EndDate) * DailyRate AS RentAmount
FROM tblCars, tblRentedParkings, tblParkings
WHERE tblCars.CarRegistration = tblRentedParkings.CarRegistration
  AND tblParkings.ParkingID = tblRentedParkings.ParkingID;

-- MySQL:  DATEDIFF(EndDate, StartDate) * DailyRate   (note: END first, no unit)
-- JavaDB: {fn TIMESTAMPDIFF(SQL_TSI_DAY, StartDate, EndDate)} * DailyRate` },
      pitfalls: [
        "CarRegistration exists in two tables — prefix it with the table name in SELECT.",
        "Access DateDiff('d', earlier, later); MySQL DATEDIFF(later, earlier) — the argument orders are opposite!",
        "Access needs the interval in quotes: 'd' (days), 'm' (months), 'yyyy' (years)."
      ]
    }, {
      num: "1.8", marks: 6,
      tags: ["sql-update", "sql-string-functions", "sql-like-wildcards"],
      asked: "Replace the word 'Volkswagen' at the start of every model with 'VW' (e.g. Volkswagen Golf → VW Golf).",
      approach: "'Volkswagen' is 10 characters. Keep everything after it with RIGHT(Model, LEN(Model) - 10) (or MID(Model, 11)) and put 'VW' in front.",
      solution: { lang: "sql", code: `UPDATE tblCars
SET Model = 'VW' & MID(Model, 11)
WHERE Model LIKE 'Volkswagen*';

-- equivalent: 'VW' & RIGHT(Model, LEN(Model) - 10)
-- MySQL: SET Model = CONCAT('VW', SUBSTRING(Model, 11)) ... LIKE 'Volkswagen%'` },
      pitfalls: [
        "Count characters carefully: V-o-l-k-s-w-a-g-e-n = 10, so the rest starts at position 11 (which includes the space).",
        "Hard-coding SET Model = 'VW Golf' only fixes one car."
      ]
    }, {
      num: "1.9", marks: 4,
      tags: ["sql-update", "sql-date-functions"],
      asked: "Delete all bays that were added before 2018.",
      approach: "DELETE FROM with a date condition.",
      solution: { lang: "sql", code: `DELETE FROM tblParkings
WHERE DateAdded < #2018/01/01#;

-- or: WHERE YEAR(DateAdded) < 2018
-- MySQL: WHERE DateAdded < '2018-01-01'` },
      pitfalls: [
        "Access accepts DELETE * FROM; MySQL does not — DELETE FROM works in both.",
        "<= #2017/12/31# misses times on 31 Dec in Date/Time fields; < #2018/01/01# is safer."
      ]
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1–2.2", marks: 6,
      tags: ["oop-class-anatomy", "oop-static", "date-localdate"],
      asked: "Daily class: private registrationNumber (String) and entry/exit date-times, plus public constants HOURLYRATE = 24.5 and FINEAMOUNT = 850.0.",
      approach: "Use LocalDateTime because both date and time matter.",
      solution: { lang: "java", code: `import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class Daily {
    private String registrationNumber;
    private LocalDateTime entryDateTime;
    private LocalDateTime exitDateTime;

    public static final double HOURLYRATE = 24.5;
    public static final double FINEAMOUNT = 850.0;` },
      pitfalls: ["LocalDate would lose the time; String would make the maths impossible."]
    }, {
      num: "2.3–2.4", marks: 5,
      tags: ["oop-constructors", "oop-accessors-mutators"],
      asked: "Constructor (inRN, inEY, inET) where the two date-times are already LocalDateTime objects; getters for all three fields.",
      approach: "Straight assignments; getters return LocalDateTime.",
      solution: { lang: "java", code: `    public Daily(String inRN, LocalDateTime inEY, LocalDateTime inET) {
        registrationNumber = inRN;
        entryDateTime = inEY;
        exitDateTime = inET;
    }

    public String getRegistrationNumber()  { return registrationNumber; }
    public LocalDateTime getEntryDateTime() { return entryDateTime; }
    public LocalDateTime getExitDateTime()  { return exitDateTime; }` },
      pitfalls: []
    }, {
      num: "2.5", marks: 8,
      tags: ["date-localdate", "oop-helper-methods"],
      asked: "getParkingFee: if the car left on the same day, charge completed hours x HOURLYRATE; if it left on a later day, charge the FINEAMOUNT.",
      approach: "Compare the date parts with toLocalDate(). Completed hours between two date-times: ChronoUnit.HOURS.between (it truncates, which matches the expected output e.g. 5h42m → 5 hours → R122.5).",
      solution: { lang: "java", code: `    public double getParkingFee() {
        if (!entryDateTime.toLocalDate().equals(exitDateTime.toLocalDate())) {
            return FINEAMOUNT;
        }
        long hours = ChronoUnit.HOURS.between(entryDateTime, exitDateTime);
        return hours * HOURLYRATE;
    }` },
      pitfalls: [
        "The paper's worked example said 15 hours for 06:29→21:03, but the expected output and memo use completed hours (14 → R343.0). Follow the output.",
        "Comparing getDayOfMonth() alone breaks if entry and exit are in different months — compare whole dates.",
        "Duration.between(a, b).toHours() is an equivalent way to get hours."
      ]
    }, {
      num: "2.6", marks: 4,
      tags: ["oop-tostring", "str-format"],
      asked: "toString: 'Registration: <reg><tab>Fee: R<fee>' then on a new line 'Entry: <entry> Exit: <exit>'.",
      approach: "Call getParkingFee() inside toString (there is no fee field). LocalDateTime prints as 2023-09-17T12:21 by default.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return "Registration: " + registrationNumber + "\\tFee: R" + getParkingFee()
             + "\\nEntry: " + entryDateTime + " Exit: " + exitDateTime;
    }
}` },
      pitfalls: ["Because getParkingFee() is called (not a field), the LongTerm override is used automatically for LongTerm objects — polymorphism."]
    }, {
      num: "3.1–3.5", marks: 9,
      tags: ["oop-inheritance", "oop-constructors", "oop-static", "oop-accessors-mutators"],
      asked: "LongTerm extends Daily: private parkingBay, constant RATEPERDAY = 250.0, constructor calling the parent's constructor, getter for parkingBay.",
      approach: "super(inRN, inEY, inET) first, then assign parkingBay.",
      solution: { lang: "java", code: `import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

public class LongTerm extends Daily {
    private String parkingBay;
    public static final double RATEPERDAY = 250.0;

    public LongTerm(String inRN, LocalDateTime inEY, LocalDateTime inET, String inPB) {
        super(inRN, inEY, inET);
        parkingBay = inPB;
    }

    public String getParkingBay() {
        return parkingBay;
    }` },
      pitfalls: ["super(...) must be the first statement in the constructor."]
    }, {
      num: "3.6", marks: 5,
      tags: ["oop-inheritance", "date-localdate"],
      asked: "Override getParkingFee: number of calendar days between entry and exit dates x RATEPERDAY (same day = 0).",
      approach: "Use the parent's getters (fields are private). Convert to LocalDate first so that 06:56 one day to 05:06 the next counts as 1 day.",
      solution: { lang: "java", code: `    @Override
    public double getParkingFee() {
        long days = ChronoUnit.DAYS.between(getEntryDateTime().toLocalDate(),
                                            getExitDateTime().toLocalDate());
        return days * RATEPERDAY;
    }` },
      pitfalls: [
        "ChronoUnit.DAYS.between on the LocalDateTimes counts full 24-hour periods (06:56 → 05:06 next day = 0) — the expected output counts it as 1, so use toLocalDate().",
        "Period.between(...).getDays() only gives the 'days' part — it resets every month. ChronoUnit.DAYS.between is safer for long stays.",
        "Must be public double with the same name and no parameters to override."
      ]
    }, {
      num: "3.7", marks: 3,
      tags: ["oop-tostring", "oop-inheritance"],
      asked: "Override toString: parent's output plus a new line 'Parking Bay: <bay>'.",
      approach: "super.toString() + \"\\nParking Bay: \" + parkingBay.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return super.toString() + "\\nParking Bay: " + parkingBay;
    }
}` },
      pitfalls: []
    }, {
      num: "4.1–4.2", marks: 5,
      tags: ["arrays-objects", "oop-polymorphism"],
      asked: "ParkingManager with a private array of 50 Daily/LongTerm objects and a private size counter.",
      approach: "Type the array as the parent class Daily.",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class ParkingManager {
    private Daily[] pArr = new Daily[50];
    private int size = 0;` },
      pitfalls: []
    }, {
      num: "4.3", marks: 11,
      tags: ["files-read-scanner", "str-split-build", "date-formatter", "oop-polymorphism"],
      asked: "Constructor that reads parkings.txt (reg;entry;exit or reg;entry;exit;bay) and stores a Daily or LongTerm object for each line.",
      approach: "split(\";\"); parse both date-times with pattern \"yyyy/MM/dd HH:mm\"; 4 parts → LongTerm, 3 parts → Daily.",
      solution: { lang: "java", code: `    public ParkingManager() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm");
        try {
            Scanner sc = new Scanner(new File("parkings.txt"));
            while (sc.hasNextLine()) {
                String[] p = sc.nextLine().trim().split(";");
                LocalDateTime in  = LocalDateTime.parse(p[1], fmt);
                LocalDateTime out = LocalDateTime.parse(p[2], fmt);
                if (p.length == 4) {
                    pArr[size] = new LongTerm(p[0], in, out, p[3]);
                } else {
                    pArr[size] = new Daily(p[0], in, out);
                }
                size++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("parkings.txt not found");
        }
    }` },
      pitfalls: [
        "HH is 24-hour time; hh is 12-hour and fails on 13:00+.",
        "The sample lines start with a space — trim() before splitting keeps the registration clean.",
        "Use LocalDateTime.parse, not LocalDate.parse, when the text contains a time."
      ]
    }, {
      num: "4.4", marks: 4,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "Manager toString: every object's toString, separated by a blank line.",
      approach: "Append each object followed by two newlines.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "";
        for (int i = 0; i < size; i++) {
            out += pArr[i] + "\\n\\n";
        }
        return out;
    }` },
      pitfalls: []
    }, {
      num: "4.5", marks: 6,
      tags: ["algo-sort", "arrays-objects"],
      asked: "sortByRegistration: sort the array alphabetically by registration number (own algorithm).",
      approach: "Bubble sort with a 'swapped' flag, comparing getRegistrationNumber() with compareTo; swap with a Daily temp.",
      solution: { lang: "java", code: `    public void sortByRegistration() {
        boolean swapped = true;
        int pass = 0;
        while (swapped) {
            swapped = false;
            for (int j = 0; j < size - 1 - pass; j++) {
                if (pArr[j].getRegistrationNumber()
                        .compareTo(pArr[j + 1].getRegistrationNumber()) > 0) {
                    Daily temp = pArr[j];
                    pArr[j] = pArr[j + 1];
                    pArr[j + 1] = temp;
                    swapped = true;
                }
            }
            pass++;
        }
    }` },
      pitfalls: [
        "temp must be type Daily (the array type), not LongTerm.",
        "j + 1 must stay inside size — inner loop runs to size - 1."
      ]
    }, {
      num: "5.1–5.3", marks: 5,
      tags: ["oop-ui-class"],
      asked: "ParkingUI: instantiate pm, sort, display.",
      approach: "main → new ParkingManager → sortByRegistration → println.",
      solution: { lang: "java", code: `public class ParkingUI {
    public static void main(String[] args) {
        ParkingManager pm = new ParkingManager();
        pm.sortByRegistration();
        System.out.println(pm);
        System.out.println(pm.generateBilling());   // 6.3
    }
}` },
      pitfalls: []
    }, {
      num: "6.1", marks: 6,
      tags: ["str-methods", "str-split-build", "arrays-search"],
      asked: "getRegistrationList: one #-separated string of the registration numbers in the (sorted) array, with no duplicates.",
      approach: "Loop through the array; only append a registration if it is not already in the list. Wrapping with # avoids false partial matches.",
      solution: { lang: "java", code: `    public String getRegistrationList() {
        String list = "";
        for (int i = 0; i < size; i++) {
            String reg = pArr[i].getRegistrationNumber();
            if (!("#" + list).contains("#" + reg + "#")) {
                list += reg + "#";
            }
        }
        return list;
    }` },
      pitfalls: [
        "It is only alphabetical if the array was sorted first (the UI sorts before calling this).",
        "Plain list.contains(reg) could be fooled if one registration is part of another — the # wrapping prevents that."
      ]
    }, {
      num: "6.2", marks: 21,
      tags: ["str-split-build", "arrays-search", "arrays-counters-totals", "oop-polymorphism"],
      asked: "generateBilling: for each unique registration list each stay (entry, exit, fee), the total due, the long-term bay number if it has one, and a 'Consider renting long-term parking' tip for daily users over R1500.",
      approach: "cars = getRegistrationList(); split on #. For each reg: total = 0, isLong = false; loop the array, for matches append the line and add the fee (polymorphic getParkingFee); if instanceof LongTerm, cast and remember the bay. After the inner loop add total and the bay line or the tip.",
      solution: { lang: "java", code: `    public String generateBilling() {
        String cars = getRegistrationList();
        String[] regs = cars.split("#");
        String out = "";
        for (int r = 0; r < regs.length; r++) {
            double total = 0;
            String bay = "";
            out += regs[r] + "\\n";
            for (int i = 0; i < size; i++) {
                if (pArr[i].getRegistrationNumber().equals(regs[r])) {
                    double fee = pArr[i].getParkingFee();
                    total += fee;
                    out += pArr[i].getEntryDateTime() + " " + pArr[i].getExitDateTime()
                         + " " + fee + "\\n";
                    if (pArr[i] instanceof LongTerm) {
                        bay = ((LongTerm) pArr[i]).getParkingBay();
                    }
                }
            }
            out += "Total parking fees due: R" + total + "\\n";
            if (!bay.equals("")) {
                out += "Long-term bay number: " + bay + "\\n";
            } else if (total > 1500) {
                out += "Consider renting long-term parking\\n";
            }
            out += "\\n";
        }
        return out;
    }` },
      pitfalls: [
        "Reset total (and bay) for EACH registration — inside the outer loop.",
        "getParkingBay() only exists in LongTerm: check instanceof, then cast.",
        "split(\"#\") on a string ending in # simply drops the trailing empty piece — no empty registration."
      ]
    }, {
      num: "6.3", marks: 2,
      tags: ["oop-ui-class"],
      asked: "Display the billing from the UI.",
      approach: "println the returned string (see 5.1–5.3).",
      solution: { lang: "java", code: `System.out.println(pm.generateBilling());` },
      pitfalls: []
    }]
  }]
},
/* ===================================================================== */
{
  id: "2022-nov", year: 2022, session: "November",
  scenario: "XSpaceSystems: captains, spaceships and missions (SQL); CrewMember parent and Officer child classes, static promotion counters, and processing test results that promote officers or turn crew members into officers (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 4,
      tags: ["sql-select-where", "sql-order-by"],
      asked: "All details of captains with combat training, most recently hired first.",
      approach: "Boolean test plus ORDER BY DateHired DESC.",
      solution: { lang: "sql", code: `SELECT *
FROM tblCaptains
WHERE CombatTraining = True
ORDER BY DateHired DESC;` },
      pitfalls: ["'Most recent first' = DESC on the date."]
    }, {
      num: "1.2", marks: 4,
      tags: ["sql-like-wildcards"],
      asked: "All spaceship details where the model starts with M or T and fuel consumption is under 500.",
      approach: "Two LIKE patterns OR-ed in brackets, AND the fuel test.",
      solution: { lang: "sql", code: `SELECT *
FROM tblSpaceShips
WHERE (Model LIKE 'M*' OR Model LIKE 'T*')
  AND FuelConsumption < 500;

-- Access-only shortcut: Model LIKE '[MT]*'
-- MySQL: LIKE 'M%' OR LIKE 'T%'` },
      pitfalls: ["Brackets around the OR — otherwise every M model is listed regardless of fuel."]
    }, {
      num: "1.3", marks: 5,
      tags: ["sql-date-functions"],
      asked: "Captains who reach 10 or more years of service this year (long-service awards).",
      approach: "Compare calendar years: current year - hire year >= 10. Never hard-code the year.",
      solution: { lang: "sql", code: `SELECT *
FROM tblCaptains
WHERE YEAR(Date()) - YEAR(DateHired) >= 10;

-- MySQL: YEAR(CURDATE())   JavaDB: YEAR(CURRENT_DATE)` },
      pitfalls: [
        "'This year' means by the end of the year — compare years, not exact days.",
        "WHERE YEAR(DateHired) <= 2012 is hard-coding."
      ]
    }, {
      num: "1.4", marks: 5,
      tags: ["sql-subqueries", "sql-aggregates", "sql-order-by"],
      asked: "Model and speed of ships faster than the average speed, fastest first.",
      approach: "Sub-query for AVG(Speed); ORDER BY Speed DESC.",
      solution: { lang: "sql", code: `SELECT Model, Speed
FROM tblSpaceShips
WHERE Speed > (SELECT AVG(Speed) FROM tblSpaceShips)
ORDER BY Speed DESC;` },
      pitfalls: ["Aggregate in WHERE without a sub-query is an error."]
    }, {
      num: "1.5", marks: 7,
      tags: ["sql-group-by", "sql-date-functions", "sql-aggregates", "sql-calculated"],
      asked: "Per year, count the missions departing in the first six months: columns YearOfMission and NumberOfMissions.",
      approach: "WHERE MONTH(DepartureDate) <= 6; GROUP BY the calculated YEAR(DepartureDate); COUNT(*).",
      solution: { lang: "sql", code: `SELECT YEAR(DepartureDate) AS YearOfMission, COUNT(*) AS NumberOfMissions
FROM tblMissions
WHERE MONTH(DepartureDate) <= 6
GROUP BY YEAR(DepartureDate);` },
      pitfalls: [
        "In Access you must GROUP BY the expression YEAR(DepartureDate), not the alias (MySQL allows the alias).",
        "Months 1–6 means <= 6, not < 6."
      ]
    }, {
      num: "1.6", marks: 9,
      tags: ["sql-joins", "sql-calculated"],
      asked: "Mission ID, captain name, ship model and speed, solar system, distance, and TimeInYears = distance / speed rounded to 2 decimals.",
      approach: "3-table join through tblMissions; ROUND(Distance / Speed, 2) AS TimeInYears.",
      solution: { lang: "sql", code: `SELECT MissionID, Fullname, Model, Speed, SolarSystem, Distance,
       ROUND(Distance / Speed, 2) AS TimeInYears
FROM tblMissions, tblCaptains, tblSpaceShips
WHERE tblMissions.CaptainID = tblCaptains.CaptainID
  AND tblMissions.SpaceshipID = tblSpaceShips.SpaceshipID;

-- JavaDB has no ROUND: FLOOR(Distance / Speed * 100 + 0.5) / 100` },
      pitfalls: [
        "Two join conditions for three tables.",
        "FORMAT(x, '0.00') returns text — ROUND is the right tool when the question says 'round'.",
        "If a field name exists in two tables (e.g. CaptainID), prefix it with the table name."
      ]
    }, {
      num: "1.7", marks: 7,
      tags: ["sql-update", "sql-string-functions", "sql-select-where", "sql-date-functions"],
      asked: "Change the objective to 'Scouting' for missions that haven't departed yet, are 'Military Exercise', and whose solar-system code does not end in A, B or C.",
      approach: "Three AND-ed conditions: DepartureDate > today, objective test, RIGHT(SolarSystem, 1) NOT IN ('A','B','C').",
      solution: { lang: "sql", code: `UPDATE tblMissions
SET MainObjective = 'Scouting'
WHERE DepartureDate > Date()
  AND MainObjective = 'Military Exercise'
  AND RIGHT(SolarSystem, 1) NOT IN ('A', 'B', 'C');

-- Access alternative: AND SolarSystem NOT LIKE '*[ABC]'` },
      pitfalls: [
        "'Not yet departed' depends on today — use Date()/NOW(), not a fixed date.",
        "JavaDB has no RIGHT: SUBSTR(SolarSystem, LENGTH(SolarSystem), 1)."
      ]
    }, {
      num: "1.8", marks: 9,
      tags: ["sql-insert", "sql-subqueries", "sql-random"],
      asked: "For every captain who has no mission, insert a new mission: random ship 1–30, objective 'Exploration', departure 1 Jan 2030, system 'Alpha-Centauri', distance 5.",
      approach: "INSERT INTO ... SELECT from tblCaptains WHERE CaptainID NOT IN (SELECT CaptainID FROM tblMissions). Random 1–30: INT(RND(CaptainID) * 30) + 1.",
      solution: { lang: "sql", code: `INSERT INTO tblMissions (CaptainID, SpaceshipID, MainObjective,
                         DepartureDate, Distance, SolarSystem)
SELECT CaptainID, INT(RND(CaptainID) * 30) + 1, 'Exploration',
       #2030/01/01#, 5, 'Alpha-Centauri'
FROM tblCaptains
WHERE CaptainID NOT IN (SELECT CaptainID FROM tblMissions);

-- MySQL: FLOOR(RAND() * 30) + 1  and  '2030-01-01'` },
      pitfalls: [
        "In Access, RND() with no field argument is evaluated once per query, so every new row gets the same ship. Passing a field (RND(CaptainID)) forces a new value per row.",
        "Leave out MissionID (AutoNumber).",
        "INT(RND()*30)+1 gives 1..30; INT(RND()*30) alone gives 0..29."
      ]
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1–2.2", marks: 6,
      tags: ["oop-class-anatomy", "oop-static"],
      asked: "CrewMember class: private fullname, crewID (int), department, and a public static int numPromotedCrew starting at 0.",
      approach: "The counter is static (shared by all objects) but NOT final — it changes.",
      solution: { lang: "java", code: `public class CrewMember {
    private String fullname;
    private int crewID;
    private String department;

    public static int numPromotedCrew = 0;` },
      pitfalls: ["Making the counter final stops you incrementing it; making it non-static gives each object its own copy."]
    }, {
      num: "2.3–2.4", marks: 6,
      tags: ["oop-constructors", "oop-accessors-mutators"],
      asked: "Constructor (inFN, inCID, inDT) and getters for all three fields.",
      approach: "Standard constructor plus three getters.",
      solution: { lang: "java", code: `    public CrewMember(String inFN, int inCID, String inDT) {
        fullname = inFN;
        crewID = inCID;
        department = inDT;
    }

    public String getFullName()   { return fullname; }
    public int getCrewID()        { return crewID; }
    public String getDepartment() { return department; }` },
      pitfalls: []
    }, {
      num: "2.5", marks: 5,
      tags: ["oop-tostring", "str-format"],
      asked: "toString: name, tab, 'Crew ID: ' + id, tab, department in square brackets.",
      approach: "Concatenate with \\t and literal brackets.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return fullname + "\\tCrew ID: " + crewID + "\\t[" + department + "]";
    }
}` },
      pitfalls: ["Every literal (space after the colon, the brackets) is checked against the sample."]
    }, {
      num: "3.1–3.5", marks: 11,
      tags: ["oop-inheritance", "oop-static", "oop-constructors", "date-localdate"],
      asked: "Officer extends CrewMember: private rank (int) and datePromoted (date), public static numPromotedOfficers = 0, a 5-parameter constructor using super, and getRank().",
      approach: "datePromoted as LocalDate (the manager parses dd/MM/yyyy). super(...) first.",
      solution: { lang: "java", code: `import java.time.LocalDate;

public class Officer extends CrewMember {
    private int rank;
    private LocalDate datePromoted;

    public static int numPromotedOfficers = 0;

    public Officer(String inFN, int inCID, String inDT, int inRK, LocalDate inDP) {
        super(inFN, inCID, inDT);
        rank = inRK;
        datePromoted = inDP;
    }

    public int getRank() {
        return rank;
    }` },
      pitfalls: ["Store the date as LocalDate, not String."]
    }, {
      num: "3.6", marks: 5,
      tags: ["oop-helper-methods", "arrays-parallel-2d"],
      asked: "getTitle: map rank 1–5 to Ensign, Lieutenant, Lt Commander, Commander, Captain.",
      approach: "A lookup array indexed by rank is neat (index 0 unused); a switch also works.",
      solution: { lang: "java", code: `    public String getTitle() {
        String[] titles = {"", "Ensign", "Lieutenant", "Lt Commander", "Commander", "Captain"};
        if (rank >= 1 && rank <= 5) {
            return titles[rank];
        }
        return "";
    }` },
      pitfalls: ["Spelling of titles must match the output exactly ('Lt Commander')."]
    }, {
      num: "3.7", marks: 4,
      tags: ["oop-tostring", "oop-inheritance"],
      asked: "Override toString: the parent's string, a space, then the title.",
      approach: "super.toString() + \" \" + getTitle().",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return super.toString() + " " + getTitle();
    }` },
      pitfalls: []
    }, {
      num: "3.8", marks: 5,
      tags: ["oop-static", "date-localdate"],
      asked: "promote(): if rank is 4 or less, add 1 to rank, set the promotion date to today, and add 1 to the static officer-promotion counter.",
      approach: "Everything inside the if.",
      solution: { lang: "java", code: `    public void promote() {
        if (rank <= 4) {
            rank++;
            datePromoted = LocalDate.now();
            numPromotedOfficers++;
        }
    }
}` },
      pitfalls: ["Incrementing the counter outside the if counts captains who weren't promoted."]
    }, {
      num: "4.1–4.2", marks: 5,
      tags: ["arrays-objects", "oop-polymorphism"],
      asked: "CrewMemberManager with private array cArr (80 CrewMember/Officer objects) and private size.",
      approach: "Array typed as the parent class.",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class CrewMemberManager {
    private CrewMember[] cArr = new CrewMember[80];
    private int size = 0;` },
      pitfalls: []
    }, {
      num: "4.3", marks: 11,
      tags: ["files-read-scanner", "str-split-build", "date-formatter", "oop-polymorphism"],
      asked: "Constructor that reads crewmembers.txt: 3 fields → CrewMember, 5 fields (adds rank and dd/MM/yyyy date) → Officer.",
      approach: "split(\"#\"); parse crewID; if length == 5 parse rank and date and create an Officer.",
      solution: { lang: "java", code: `    public CrewMemberManager() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        try {
            Scanner sc = new Scanner(new File("crewmembers.txt"));
            while (sc.hasNextLine()) {
                String[] t = sc.nextLine().split("#");
                int id = Integer.parseInt(t[1]);
                if (t.length == 5) {
                    int rank = Integer.parseInt(t[3]);
                    LocalDate promoted = LocalDate.parse(t[4], fmt);
                    cArr[size] = new Officer(t[0], id, t[2], rank, promoted);
                } else {
                    cArr[size] = new CrewMember(t[0], id, t[2]);
                }
                size++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("crewmembers.txt not found");
        }
    }` },
      pitfalls: ["dd/MM/yyyy — capital MM for month."]
    }, {
      num: "4.4", marks: 5,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "Manager toString: each person's toString on a separate line.",
      approach: "Loop to size appending + \"\\n\".",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "";
        for (int i = 0; i < size; i++) {
            out += cArr[i] + "\\n";
        }
        return out;
    }` },
      pitfalls: []
    }, {
      num: "5.1–5.3", marks: 5,
      tags: ["oop-ui-class", "oop-static"],
      asked: "CrewMemberUI: create the manager and print all crew. (6.3 and 6.4 are added here too.)",
      approach: "Static counters are read through the CLASS name.",
      solution: { lang: "java", code: `public class CrewMemberUI {
    public static void main(String[] args) {
        CrewMemberManager cm = new CrewMemberManager();
        System.out.println(cm);
        // 6.3
        System.out.println(cm.processTestResults());
        // 6.4
        System.out.println("Number of promoted crew members: " + CrewMember.numPromotedCrew);
        System.out.println("Number of promoted officers: " + Officer.numPromotedOfficers);
    }
}` },
      pitfalls: ["Print the counters AFTER processTestResults has run, otherwise they are still 0."]
    }, {
      num: "6.1", marks: 4,
      tags: ["arrays-search"],
      asked: "findCrewMember(id): return the array position of the person with that crew ID (-1 if absent).",
      approach: "Linear search returning the index.",
      solution: { lang: "java", code: `    public int findCrewMember(int id) {
        for (int i = 0; i < size; i++) {
            if (cArr[i].getCrewID() == id) {
                return i;
            }
        }
        return -1;
    }` },
      pitfalls: ["ints compare with ==; Strings need .equals."]
    }, {
      num: "6.2", marks: 25,
      tags: ["files-read-scanner", "oop-polymorphism", "oop-static", "arrays-search", "arrays-insert-delete"],
      asked: "processTestResults: read pairs of lines (crew ID, score) from testResults.txt. Officers who meet the score for their rank are promoted (captains can't be); crew members scoring 75+ become rank-1 Officers (replace the object in the array, add to numPromotedCrew). Return a report line per person.",
      approach: "Read two lines per person. pos = findCrewMember(id). If instanceof Officer: cast, work out the required score from the rank, call promote(). Else: if score >= 75 create a new Officer from the crew member's getters, store it at cArr[pos], increment the static counter.",
      solution: { lang: "java", code: `    public String processTestResults() {
        String out = "";
        try {
            Scanner sc = new Scanner(new File("testResults.txt"));
            while (sc.hasNextLine()) {
                int id = Integer.parseInt(sc.nextLine().trim());
                int score = Integer.parseInt(sc.nextLine().trim());
                int pos = findCrewMember(id);
                if (pos == -1) {
                    continue;
                }

                if (cArr[pos] instanceof Officer) {
                    Officer off = (Officer) cArr[pos];
                    out += "Officer " + off.getFullName();
                    int rank = off.getRank();
                    int needed;
                    if (rank == 1) {
                        needed = 75;
                    } else if (rank == 2) {
                        needed = 80;
                    } else if (rank == 3) {
                        needed = 85;
                    } else {
                        needed = 90;          // rank 4 (captains handled below)
                    }

                    if (rank == 5) {
                        out += " participated in the test\\n";
                    } else if (score >= needed) {
                        off.promote();
                        out += " has passed and is promoted to " + off.getTitle()
                             + " Rank " + off.getRank() + "\\n";
                    } else {
                        out += " has failed\\n";
                    }
                } else {
                    CrewMember cm = cArr[pos];
                    out += "Crew Member " + cm.getFullName();
                    if (score >= 75) {
                        Officer newOff = new Officer(cm.getFullName(), cm.getCrewID(),
                                cm.getDepartment(), 1, LocalDate.now());
                        cArr[pos] = newOff;
                        CrewMember.numPromotedCrew++;
                        out += " has passed and is promoted to " + newOff.getTitle()
                             + " Rank " + newOff.getRank() + "\\n";
                    } else {
                        out += " has failed\\n";
                    }
                }
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("testResults.txt not found");
        }
        return out;
    }` },
      pitfalls: [
        "Check instanceof Officer, not CrewMember — every Officer IS-A CrewMember, so that test is always true.",
        "Cast before calling getRank()/promote(): they don't exist on a CrewMember reference.",
        "A crew member is promoted by REPLACING the array element with a new Officer object — you can't change an object's class.",
        "Captains (rank 5) must get 'participated in the test' even with a high score.",
        "The marks reward using promote() and findCrewMember() — don't duplicate their code."
      ]
    }, {
      num: "6.3–6.4", marks: 3,
      tags: ["oop-ui-class", "oop-static"],
      asked: "In the UI, print the test report, then the two static promotion counters with labels.",
      approach: "Call processTestResults first; read the counters via CrewMember.numPromotedCrew and Officer.numPromotedOfficers (see 5.1–5.3).",
      solution: { lang: "java", code: `System.out.println(cm.processTestResults());
System.out.println("Number of promoted crew members: " + CrewMember.numPromotedCrew);
System.out.println("Number of promoted officers: " + Officer.numPromotedOfficers);` },
      pitfalls: ["Accessing a static field through the class name is what the marks look for."]
    }]
  }]
},
/* ===================================================================== */
{
  id: "2021-nov", year: 2021, session: "November",
  scenario: "Digital Nimbus web hosting: domains, packages, service agents and tickets (SQL); Technician and Server classes (aggregation — a Server HAS-A Technician), assigning technicians and writing a server-room map to a text file (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 4,
      tags: ["sql-select-where", "sql-order-by"],
      asked: "All details of the domains hosted on a VPN, alphabetical by domain name.",
      approach: "Boolean test; ORDER BY DomainName.",
      solution: { lang: "sql", code: `SELECT *
FROM tblDomains
WHERE VPN = True
ORDER BY DomainName;` },
      pitfalls: []
    }, {
      num: "1.2", marks: 5,
      tags: ["sql-select-where"],
      asked: "Agents with 2 to 5 years' experience (inclusive) in either the Maintenance or Admin department.",
      approach: "BETWEEN is inclusive; IN replaces two OR-ed equality tests.",
      solution: { lang: "sql", code: `SELECT *
FROM tblServiceAgents
WHERE Experience BETWEEN 2 AND 5
  AND Department IN ('Maintenance', 'Admin');` },
      pitfalls: [
        "If you use OR instead of IN, bracket it: AND (Department = 'Maintenance' OR Department = 'Admin').",
        "BETWEEN includes both end values."
      ]
    }, {
      num: "1.3", marks: 4,
      tags: ["sql-aggregates", "sql-like-wildcards"],
      asked: "Count the domains ending in '.co.za' as RSACompanies.",
      approach: "COUNT(*) with a LIKE ending pattern.",
      solution: { lang: "sql", code: `SELECT COUNT(*) AS RSACompanies
FROM tblDomains
WHERE DomainName LIKE '*.co.za';` },
      pitfalls: ["MySQL: '%.co.za'. In LIKE the dot is a normal character, not a wildcard."]
    }, {
      num: "1.4", marks: 7,
      tags: ["sql-joins", "sql-date-functions", "sql-calculated"],
      asked: "Domains that subscribed in the current month and are not on platinum: domain name, package and the current cost plus 50% (BargainPrice).",
      approach: "Join domains to packages; MONTH(DateSubscribed) = MONTH(Date()); Package <> 'platinum'; Cost * 1.5.",
      solution: { lang: "sql", code: `SELECT DomainName, Package, Cost * 1.5 AS BargainPrice
FROM tblDomains INNER JOIN tblPackages
  ON tblDomains.PackageID = tblPackages.PackageID
WHERE MONTH(DateSubscribed) = MONTH(Date())
  AND Package <> 'platinum';` },
      pitfalls: [
        "A 50% increase is * 1.5 (or Cost + Cost * 0.5), not * 0.5.",
        "'Current month' must come from the system date — never hard-code 10."
      ]
    }, {
      num: "1.5", marks: 7,
      tags: ["sql-group-by", "sql-aggregates"],
      asked: "Each department and its agents' average experience (AvgExperience), only where that average is above 6.",
      approach: "GROUP BY Department, AVG(Experience), HAVING AVG(Experience) > 6.",
      solution: { lang: "sql", code: `SELECT Department, AVG(Experience) AS AvgExperience
FROM tblServiceAgents
GROUP BY Department
HAVING AVG(Experience) > 6;` },
      pitfalls: ["WHERE AVG(...) is illegal; the filter on an aggregate must be HAVING."]
    }, {
      num: "1.6", marks: 6,
      tags: ["sql-update", "sql-string-functions"],
      asked: "Change every domain ending in '.in' so that it ends in '.co.ind' instead.",
      approach: "Drop the last 3 characters ('.in') with LEFT(..., LEN - 3) and append '.co.ind'.",
      solution: { lang: "sql", code: `UPDATE tblDomains
SET DomainName = LEFT(DomainName, LEN(DomainName) - 3) & '.co.ind'
WHERE DomainName LIKE '*.in';` },
      pitfalls: [
        "'.in' is 3 characters including the dot.",
        "Keep the dot in the pattern: '*in' would also match a domain such as 'mycabin' that doesn't end in '.in'."
      ]
    }, {
      num: "1.7", marks: 8,
      tags: ["sql-joins", "sql-select-where", "sql-order-by"],
      asked: "Incomplete tickets: domain name, agent first and last name, agent ID, priority and date logged — sorted by agent ID then priority.",
      approach: "3-table join; incomplete = DateCompleted IS NULL; two sort keys.",
      solution: { lang: "sql", code: `SELECT DomainName, Firstname, Lastname, tblTickets.AgentID, PriorityLevel, DateLogged
FROM tblDomains, tblServiceAgents, tblTickets
WHERE tblDomains.DomainID = tblTickets.DomainID
  AND tblServiceAgents.AgentID = tblTickets.AgentID
  AND DateCompleted IS NULL
ORDER BY tblTickets.AgentID, PriorityLevel;` },
      pitfalls: [
        "= NULL never matches; use IS NULL.",
        "AgentID is in two tables — prefix it in SELECT and ORDER BY.",
        "Multiple sort keys are separated by commas; the first one is the main sort."
      ]
    }, {
      num: "1.8", marks: 9,
      tags: ["sql-insert", "sql-random", "sql-string-functions", "sql-date-functions"],
      asked: "For every '.ru' domain insert a backup copy: name = random digit 1–5 in front of the original name, on VPN, subscribed today, same package.",
      approach: "INSERT INTO ... SELECT from tblDomains WHERE DomainName LIKE '*.ru'. Build the name with INT(RND(DomainID) * 5) + 1 & DomainName.",
      solution: { lang: "sql", code: `INSERT INTO tblDomains (DomainName, VPN, DateSubscribed, PackageID)
SELECT (INT(RND(DomainID) * 5) + 1) & DomainName, True, Date(), PackageID
FROM tblDomains
WHERE DomainName LIKE '*.ru';

-- MySQL: CONCAT(FLOOR(RAND() * 5) + 1, DomainName), TRUE, CURDATE(), PackageID ... LIKE '%.ru'` },
      pitfalls: [
        "The SELECT list must be in the same order as the INSERT field list.",
        "Without a field inside RND, Access gives every row the same random digit.",
        "'.ru' ending: '*.co.ru' would miss plain '.ru' domains — use '*.ru'."
      ]
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1–2.3", marks: 9,
      tags: ["oop-class-anatomy", "oop-constructors", "oop-accessors-mutators"],
      asked: "Technician class: private techID, name, experience (int), roleSpeciality; parameterised constructor; four getters.",
      approach: "Standard class skeleton.",
      solution: { lang: "java", code: `public class Technician {
    private String techID;
    private String name;
    private int experience;
    private String roleSpeciality;

    public Technician(String inTID, String inN, int inE, String inR) {
        techID = inTID;
        name = inN;
        experience = inE;
        roleSpeciality = inR;
    }

    public String getTechID()         { return techID; }
    public String getName()           { return name; }
    public int getExperience()        { return experience; }
    public String getRoleSpeciality() { return roleSpeciality; }` },
      pitfalls: []
    }, {
      num: "2.4", marks: 4,
      tags: ["oop-tostring"],
      asked: "toString like 'Lindani Kolisi, T-A1, 1 year(s) [File]'.",
      approach: "Copy the punctuation exactly.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return name + ", " + techID + ", " + experience + " year(s) [" + roleSpeciality + "]";
    }
}` },
      pitfalls: []
    }, {
      num: "3.1–3.2", marks: 9,
      tags: ["oop-class-anatomy", "oop-static"],
      asked: "Server class: private serverID, location, role, fault (Strings) and assignedTech of type Technician; public String constants for the four role types.",
      approach: "A field whose type is another class you wrote (aggregation). Constants: public static final String.",
      solution: { lang: "java", code: `public class Server {
    private String serverID;
    private String location;
    private String role;
    private String fault;
    private Technician assignedTech;     // null until assigned

    public static final String ROLETYPE_EMAIL  = "Email";
    public static final String ROLETYPE_FILE   = "File";
    public static final String ROLETYPE_PRINT  = "Print";
    public static final String ROLETYPE_CUSTOM = "Custom";` },
      pitfalls: ["assignedTech is a Technician object, not a String name."]
    }, {
      num: "3.3", marks: 6,
      tags: ["oop-constructors", "str-methods", "algo-validation"],
      asked: "Constructor (inSID, inLo, inRo, inFa). The role must match one of the constants ignoring case; otherwise store Custom.",
      approach: "equalsIgnoreCase against each constant; default to ROLETYPE_CUSTOM.",
      solution: { lang: "java", code: `    public Server(String inSID, String inLo, String inRo, String inFa) {
        serverID = inSID;
        location = inLo;
        fault = inFa;
        if (inRo.equalsIgnoreCase(ROLETYPE_EMAIL)) {
            role = ROLETYPE_EMAIL;
        } else if (inRo.equalsIgnoreCase(ROLETYPE_FILE)) {
            role = ROLETYPE_FILE;
        } else if (inRo.equalsIgnoreCase(ROLETYPE_PRINT)) {
            role = ROLETYPE_PRINT;
        } else {
            role = ROLETYPE_CUSTOM;
        }
    }` },
      pitfalls: [
        "equals is case-sensitive — the question demanded case-insensitive.",
        "Watch the parameter ORDER: role comes before fault in the constructor, but after it in the file."
      ]
    }, {
      num: "3.4–3.5", marks: 4,
      tags: ["oop-accessors-mutators"],
      asked: "Getters for serverID, location, role, fault; getter and setter for assignedTech.",
      approach: "The setter takes a Technician parameter.",
      solution: { lang: "java", code: `    public String getServerID() { return serverID; }
    public String getLocation() { return location; }
    public String getRole()     { return role; }
    public String getFault()    { return fault; }

    public Technician getAssignedTech() { return assignedTech; }
    public void setAssignedTech(Technician inTech) { assignedTech = inTech; }` },
      pitfalls: []
    }, {
      num: "3.6", marks: 6,
      tags: ["oop-tostring", "oop-class-anatomy"],
      asked: "Three-line toString: 'Server: id(Role: role)', 'Fault: fault @ location', 'Assigned to: ' + the technician's toString or 'none assigned'.",
      approach: "Test assignedTech != null before calling its toString.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String s = "Server: " + serverID + "(Role: " + role + ")\\n"
                 + "Fault: " + fault + " @ " + location + "\\n"
                 + "Assigned to: ";
        if (assignedTech != null) {
            s += assignedTech.toString();
        } else {
            s += "none assigned";
        }
        return s;
    }
}` },
      pitfalls: ["Calling assignedTech.toString() when it is null throws NullPointerException."]
    }, {
      num: "4.1–4.3", marks: 14,
      tags: ["files-read-scanner", "str-split-build", "arrays-objects"],
      asked: "ServerManager: private array sArr (50 Servers) and size; constructor that checks servers.txt exists (message if not) and loads one Server per line (id#location#fault#role).",
      approach: "File.exists() check, Scanner, split(\"#\"). Pass the parts in the CONSTRUCTOR's order (role before fault).",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class ServerManager {
    private Server[] sArr = new Server[50];
    private int size = 0;

    public ServerManager() {
        File f = new File("servers.txt");
        if (!f.exists()) {
            System.out.println("servers.txt does not exist");
        } else {
            try {
                Scanner sc = new Scanner(f);
                while (sc.hasNextLine()) {
                    String[] p = sc.nextLine().trim().split("#");
                    // file: id # location # fault # role
                    sArr[size] = new Server(p[0], p[1], p[3], p[2]);
                    size++;
                }
                sc.close();
            } catch (FileNotFoundException e) {
                System.out.println("Could not open servers.txt");
            }
        }
    }` },
      pitfalls: [
        "Mixing up fault and role silently breaks Q4.5 and Q6 — check the order against the class diagram.",
        "Even with an exists() check, new Scanner(File) still needs try/catch to compile."
      ]
    }, {
      num: "4.4", marks: 5,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "allServers(): all server strings separated by blank lines.",
      approach: "Loop to size; append + \"\\n\\n\".",
      solution: { lang: "java", code: `    public String allServers() {
        String out = "";
        for (int i = 0; i < size; i++) {
            out += sArr[i] + "\\n\\n";
        }
        return out;
    }` },
      pitfalls: []
    }, {
      num: "4.5", marks: 5,
      tags: ["arrays-counters-totals", "str-methods"],
      asked: "countServers(fault, role): how many servers match both, case-insensitively.",
      approach: "Counter with two equalsIgnoreCase tests joined by &&.",
      solution: { lang: "java", code: `    public int countServers(String inFault, String inRole) {
        int count = 0;
        for (int i = 0; i < size; i++) {
            if (sArr[i].getFault().equalsIgnoreCase(inFault)
                    && sArr[i].getRole().equalsIgnoreCase(inRole)) {
                count++;
            }
        }
        return count;
    }` },
      pitfalls: []
    }, {
      num: "5.1–5.4", marks: 6,
      tags: ["oop-ui-class", "oop-static"],
      asked: "ServerUI: create the manager, show all servers, show how many have a Temp fault with Custom role using the constant.",
      approach: "Pass Server.ROLETYPE_CUSTOM, not the literal \"Custom\".",
      solution: { lang: "java", code: `public class ServerUI {
    public static void main(String[] args) {
        ServerManager sm = new ServerManager();
        System.out.println(sm.allServers());
        System.out.println("Number of servers with a Temp fault and Custom Role: "
                + sm.countServers("Temp", Server.ROLETYPE_CUSTOM));
        // 6.2
        sm.assignTechnicians();
        System.out.println(sm.allServers());
        // 7.2
        System.out.println(sm.printMap("T-D1"));
    }
}` },
      pitfalls: ["Using \"Custom\" instead of the constant loses the constant mark."]
    }, {
      num: "6.1", marks: 11,
      tags: ["files-read-scanner", "arrays-search", "arrays-counters-totals"],
      asked: "assignTechnicians(): read technicians.txt; give each technician up to 4 unassigned servers whose role matches their speciality, in file order.",
      approach: "For each technician line, create the object, then walk the servers with a counter; stop when the counter hits 4. Only take servers with no technician yet.",
      solution: { lang: "java", code: `    public void assignTechnicians() {
        try {
            Scanner sc = new Scanner(new File("technicians.txt"));
            while (sc.hasNextLine()) {
                String[] p = sc.nextLine().trim().split("#");
                Technician t = new Technician(p[0], p[1], Integer.parseInt(p[2]), p[3]);
                int assigned = 0;
                for (int i = 0; i < size && assigned < 4; i++) {
                    if (sArr[i].getAssignedTech() == null
                            && sArr[i].getRole().equalsIgnoreCase(t.getRoleSpeciality())) {
                        sArr[i].setAssignedTech(t);
                        assigned++;
                    }
                }
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("technicians.txt not found");
        }
    }` },
      pitfalls: [
        "Without the null test, the second Print technician steals the first one's servers.",
        "The limit (4) must be checked in the loop condition (or with break) — not after the loop.",
        "Reset the assigned counter for each technician."
      ]
    }, {
      num: "6.2", marks: 2,
      tags: ["oop-ui-class"],
      asked: "Call assignTechnicians and re-display all servers.",
      approach: "See the UI code in 5.1–5.4.",
      solution: { lang: "java", code: `sm.assignTechnicians();
System.out.println(sm.allServers());` },
      pitfalls: []
    }, {
      num: "7.1", marks: 17,
      tags: ["arrays-parallel-2d", "files-write", "date-formatter", "str-methods", "oop-helper-methods"],
      asked: "printMap(techID): build a 10 x 15 grid (rows A–J, columns 1–15) with X where that technician has a server and * elsewhere; first line is the current date-time as yyyy/MM/dd HH:mm:ss; save to <techID>.txt and return the text.",
      approach: "Helper that checks whether the technician has a server at a given location string. Header row of numbers; nested loops: char row from 'A' to 'J', int col 1..15, location = row + \"\" + col. Write with PrintWriter inside try/catch.",
      solution: { lang: "java", code: `    private boolean hasServerAt(String loc, String techID) {
        for (int i = 0; i < size; i++) {
            Technician t = sArr[i].getAssignedTech();
            if (t != null && t.getTechID().equals(techID)
                    && sArr[i].getLocation().equals(loc)) {
                return true;
            }
        }
        return false;
    }

    public String printMap(String techID) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm:ss");
        String map = LocalDateTime.now().format(fmt) + "\\n";

        for (int col = 1; col <= 15; col++) {
            map += "\\t" + col;
        }
        map += "\\n";

        for (char row = 'A'; row <= 'J'; row++) {
            map += row;
            for (int col = 1; col <= 15; col++) {
                String loc = row + "" + col;          // e.g. "C10"
                if (hasServerAt(loc, techID)) {
                    map += "\\tX";
                } else {
                    map += "\\t*";
                }
            }
            map += "\\n";
        }

        try {
            PrintWriter pw = new PrintWriter(new FileWriter(techID + ".txt"));
            pw.print(map);
            pw.close();
        } catch (IOException e) {
            System.out.println("Could not write " + techID + ".txt");
        }
        return map;
    }` },
      pitfalls: [
        "Use yyyy (calendar year), not YYYY (week-based year — wrong around New Year).",
        "row + col with a char and an int adds numbers! Use row + \"\" + col to make a String.",
        "Forgetting pw.close() can leave the file empty.",
        "FileWriter throws IOException (not just FileNotFoundException) — catch IOException."
      ]
    }, {
      num: "7.2", marks: 2,
      tags: ["oop-ui-class"],
      asked: "Print the map for technician T-D1.",
      approach: "See the UI code in 5.1–5.4.",
      solution: { lang: "java", code: `System.out.println(sm.printMap("T-D1"));` },
      pitfalls: []
    }]
  }]
},
/* ===================================================================== */
{
  id: "2026-may", year: 2026, session: "May",
  scenario: "Stationery SA (May 2026 supplementary-style paper, no memo available — all answers are our own): items, suppliers and item-supplier prices (SQL); Customer parent and BusinessCust child with payment-term constants, discounts, reading a file into an exactly-sized array and due dates with plusDays (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 6,
      tags: ["sql-select-where", "sql-date-functions"],
      asked: "All details of items with more than 50 in stock that were last ordered during 2024.",
      approach: "Two conditions with AND; YEAR() on the date (or a BETWEEN date range).",
      solution: { lang: "sql", code: `SELECT *
FROM tblItems
WHERE CurrQty > 50 AND YEAR(LastOrder) = 2024;

-- alternative: LastOrder BETWEEN #2024/01/01# AND #2024/12/31#` },
      pitfalls: ["Do not use LIKE '*2024*' on a date field."]
    }, {
      num: "1.2", marks: 5,
      tags: ["sql-like-wildcards", "sql-select-where"],
      asked: "Name and category of items with 'pack' anywhere in the name that are not Writing Supplies.",
      approach: "LIKE with wildcards on both sides; <> for the category.",
      solution: { lang: "sql", code: `SELECT ItemName, Category
FROM tblItems
WHERE ItemName LIKE '*pack*'
  AND Category <> 'Writing Supplies';` },
      pitfalls: [
        "Access and (default) MySQL LIKE ignore case, so 'Pack' and 'pack' both match. JavaDB is case-sensitive: use LOWER(ItemName) LIKE '%pack%'.",
        "'pack*' would only match names STARTING with pack."
      ]
    }, {
      num: "1.3", marks: 3,
      tags: ["sql-aggregates"],
      asked: "Total of all orders placed with all suppliers (TotalOrders).",
      approach: "The number of orders is stored per supplier, so SUM it (not COUNT).",
      solution: { lang: "sql", code: `SELECT SUM(NumOrders) AS TotalOrders
FROM tblSuppliers;` },
      pitfalls: ["COUNT(*) would just count suppliers (5), not orders."]
    }, {
      num: "1.4", marks: 5,
      tags: ["sql-group-by", "sql-aggregates", "sql-order-by"],
      asked: "Number of items per category (NumTypes) with the category, most items first.",
      approach: "GROUP BY Category; COUNT(*); ORDER BY the count DESC. Columns in the order shown: count first.",
      solution: { lang: "sql", code: `SELECT COUNT(*) AS NumTypes, Category
FROM tblItems
GROUP BY Category
ORDER BY COUNT(*) DESC;` },
      pitfalls: ["Access can't ORDER BY the alias of an aggregate reliably — repeat COUNT(*). (MySQL accepts ORDER BY NumTypes.)"]
    }, {
      num: "1.5", marks: 6,
      tags: ["sql-joins"],
      asked: "Item name and price for every item-supplier link with a lead time under 6 days.",
      approach: "ItemName is in tblItems, price and lead time in tblItemSuppliers → join on ItemID.",
      solution: { lang: "sql", code: `SELECT ItemName, ItemPrice
FROM tblItems INNER JOIN tblItemSuppliers
  ON tblItems.ItemID = tblItemSuppliers.ItemID
WHERE LeadTime < 6;` },
      pitfalls: ["'Less than 6' is < 6, not <= 6."]
    }, {
      num: "1.6", marks: 5,
      tags: ["sql-subqueries", "sql-aggregates"],
      asked: "Name and current quantity of items stocked above the average quantity.",
      approach: "Sub-query for AVG(CurrQty).",
      solution: { lang: "sql", code: `SELECT ItemName, CurrQty
FROM tblItems
WHERE CurrQty > (SELECT AVG(CurrQty) FROM tblItems);` },
      pitfalls: []
    }, {
      num: "1.7", marks: 5,
      tags: ["sql-joins", "sql-select-where"],
      asked: "Item name, supplier name and contact for items below their low-stock level, but only from preferred suppliers.",
      approach: "3-table join through tblItemSuppliers; compare two columns (CurrQty < LowQty); Preferred = True.",
      solution: { lang: "sql", code: `SELECT ItemName, SuppName, Contact
FROM tblItems, tblItemSuppliers, tblSuppliers
WHERE tblItems.ItemID = tblItemSuppliers.ItemID
  AND tblSuppliers.SuppID = tblItemSuppliers.SuppID
  AND CurrQty < LowQty
  AND Preferred = True;` },
      pitfalls: ["You can compare two fields of the same row directly: CurrQty < LowQty."]
    }, {
      num: "1.8", marks: 4,
      tags: ["sql-subqueries", "sql-select-where"],
      asked: "Names of items that have no supplier linked to them.",
      approach: "NOT IN the list of ItemIDs in tblItemSuppliers.",
      solution: { lang: "sql", code: `SELECT ItemName
FROM tblItems
WHERE ItemID NOT IN (SELECT ItemID FROM tblItemSuppliers);` },
      pitfalls: ["An inner join can't show items that have NO match."]
    }, {
      num: "1.9", marks: 7,
      tags: ["sql-insert", "sql-joins", "sql-calculated"],
      asked: "Supplier 5 now supplies adhesives: insert a link row for each adhesive item, price 10% below the existing price, lead time 6.",
      approach: "INSERT INTO ... SELECT. The existing price comes from tblItemSuppliers, the category from tblItems → join them. 10% cheaper = price * 0.9.",
      solution: { lang: "sql", code: `INSERT INTO tblItemSuppliers (ItemID, SuppID, ItemPrice, LeadTime)
SELECT tblItems.ItemID, 5, ItemPrice * 0.9, 6
FROM tblItems, tblItemSuppliers
WHERE tblItems.ItemID = tblItemSuppliers.ItemID
  AND Category = 'Adhesives';` },
      pitfalls: [
        "No VALUES keyword with INSERT ... SELECT.",
        "ItemID is in both tables — qualify it (tblItems.ItemID).",
        "If an adhesive item already has two suppliers this inserts two rows for it. If the marker wants exactly one per item, use SELECT tblItems.ItemID, 5, MIN(ItemPrice) * 0.9, 6 ... GROUP BY tblItems.ItemID.",
        "10% cheaper is * 0.9, not * 0.1 or - 10."
      ]
    }, {
      num: "1.10", marks: 4,
      tags: ["sql-update"],
      asked: "Rename the category 'Cutting Tools' to 'Slicers'.",
      approach: "UPDATE ... SET ... WHERE.",
      solution: { lang: "sql", code: `UPDATE tblItems
SET Category = 'Slicers'
WHERE Category = 'Cutting Tools';` },
      pitfalls: []
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1–2.4", marks: 10,
      tags: ["oop-class-anatomy", "oop-constructors", "oop-accessors-mutators"],
      asked: "Customer class: private name, regDate (date), discount (boolean); constructor (inN, inRD as a date, inD); getters for regDate, discount, name; setter for discount.",
      approach: "The constructor receives an already-parsed LocalDate.",
      solution: { lang: "java", code: `import java.time.LocalDate;

public class Customer {
    private String name;
    private LocalDate regDate;
    private boolean discount;

    public Customer(String inN, LocalDate inRD, boolean inD) {
        name = inN;
        regDate = inRD;
        discount = inD;
    }

    public LocalDate getRegDate() { return regDate; }
    public boolean getDiscount()  { return discount; }
    public String getName()       { return name; }

    public void setDiscount(boolean inD) {
        discount = inD;
    }` },
      pitfalls: ["A boolean getter named exactly getDiscount (the diagram's name), even though isDiscount is the usual Java style."]
    }, {
      num: "2.5", marks: 2,
      tags: ["oop-tostring"],
      asked: "toString: name, regDate, discount separated by tabs.",
      approach: "LocalDate prints as yyyy-MM-dd automatically.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return name + "\\t" + regDate + "\\t" + discount;
    }
}` },
      pitfalls: []
    }, {
      num: "3.1–3.4", marks: 10,
      tags: ["oop-inheritance", "oop-static", "oop-constructors"],
      asked: "BusinessCust extends Customer: private int terms; public constants DAYS30 = 0, DAYS60 = 1, DAYS90 = 2; constructor using super; getTerms().",
      approach: "super(inN, inRD, inD) first, then terms.",
      solution: { lang: "java", code: `import java.time.LocalDate;

public class BusinessCust extends Customer {
    private int terms;

    public static final int DAYS30 = 0;
    public static final int DAYS60 = 1;
    public static final int DAYS90 = 2;

    public BusinessCust(String inN, LocalDate inRD, boolean inD, int inT) {
        super(inN, inRD, inD);
        terms = inT;
    }

    public int getTerms() {
        return terms;
    }` },
      pitfalls: []
    }, {
      num: "3.5", marks: 5,
      tags: ["oop-helper-methods", "oop-static"],
      asked: "getTermsString: '30 days', '60 days', '90 days' for the three constants, otherwise 'Immediate repayment'.",
      approach: "switch on terms using the constants, with a default.",
      solution: { lang: "java", code: `    public String getTermsString() {
        switch (terms) {
            case DAYS30: return "30 days";
            case DAYS60: return "60 days";
            case DAYS90: return "90 days";
            default:     return "Immediate repayment";
        }
    }` },
      pitfalls: ["Compare with the constants, not 0/1/2."]
    }, {
      num: "3.6", marks: 4,
      tags: ["oop-inheritance", "oop-polymorphism"],
      asked: "Override getDiscount: a 30-day-terms business always gets a discount; otherwise return the stored discount.",
      approach: "The field is private in Customer, so return super.getDiscount() for the 'original value'.",
      solution: { lang: "java", code: `    @Override
    public boolean getDiscount() {
        if (terms == DAYS30) {
            return true;
        }
        return super.getDiscount();
    }` },
      pitfalls: ["Calling getDiscount() (without super.) inside the override calls itself forever → StackOverflowError."]
    }, {
      num: "3.7", marks: 3,
      tags: ["oop-tostring", "oop-inheritance"],
      asked: "Override toString: parent's string, a tab, then getTermsString().",
      approach: "super.toString() + \"\\t\" + getTermsString().",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return super.toString() + "\\t" + getTermsString();
    }
}` },
      pitfalls: []
    }, {
      num: "4.1–4.2", marks: 4,
      tags: ["arrays-objects"],
      asked: "CustomerManager with private array cArr (40 Customer/BusinessCust objects) and private size.",
      approach: "Array of the parent type.",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class CustomerManager {
    private Customer[] cArr = new Customer[40];
    private int size = 0;` },
      pitfalls: []
    }, {
      num: "4.3", marks: 13,
      tags: ["files-read-scanner", "str-split-build", "date-formatter", "oop-polymorphism"],
      asked: "Constructor reading customers.txt: name#dd MM yyyy#true/false, with a 4th field (payment term) for business customers.",
      approach: "split(\"#\"); parse the date with \"dd MM yyyy\"; Boolean.parseBoolean for the discount; 4 parts → BusinessCust.",
      solution: { lang: "java", code: `    public CustomerManager() {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MM yyyy");
        try {
            Scanner sc = new Scanner(new File("customers.txt"));
            while (sc.hasNextLine()) {
                String[] p = sc.nextLine().split("#");
                String name = p[0].trim();
                LocalDate reg = LocalDate.parse(p[1].trim(), fmt);
                boolean disc = Boolean.parseBoolean(p[2].trim());
                if (p.length == 4) {
                    int terms = Integer.parseInt(p[3].trim());
                    cArr[size] = new BusinessCust(name, reg, disc, terms);
                } else {
                    cArr[size] = new Customer(name, reg, disc);
                }
                size++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("customers.txt not found");
        }
    }` },
      pitfalls: [
        "trim() protects you from stray spaces (the paper's example even shows '# 13 08 2021').",
        "Boolean.parseBoolean(\"true\") → true; anything else → false. Comparing the String with == \"true\" is a bug."
      ]
    }, {
      num: "4.4", marks: 4,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "Manager toString: heading 'Customer List' then each object on its own line.",
      approach: "Start with the heading and a newline.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "Customer List\\n";
        for (int i = 0; i < size; i++) {
            out += cArr[i] + "\\n";
        }
        return out;
    }` },
      pitfalls: []
    }, {
      num: "4.5", marks: 5,
      tags: ["arrays-counters-totals", "oop-polymorphism"],
      asked: "countDiscounts: how many customers (of both kinds) receive a discount.",
      approach: "Call getDiscount() on each element — Java automatically runs the BusinessCust override for business objects.",
      solution: { lang: "java", code: `    public int countDiscounts() {
        int count = 0;
        for (int i = 0; i < size; i++) {
            if (cArr[i].getDiscount()) {
                count++;
            }
        }
        return count;
    }` },
      pitfalls: ["No instanceof or cast needed here — that's the point of overriding."]
    }, {
      num: "4.6", marks: 5,
      tags: ["arrays-search", "oop-accessors-mutators"],
      asked: "updateDiscount(name, value): set that customer's discount, using a loop that stops once found.",
      approach: "while loop with a found flag (a for loop that runs to the end loses the 'stops as soon as found' mark).",
      solution: { lang: "java", code: `    public void updateDiscount(String inName, boolean inD) {
        int i = 0;
        boolean found = false;
        while (i < size && !found) {
            if (cArr[i].getName().equals(inName)) {
                cArr[i].setDiscount(inD);
                found = true;
            }
            i++;
        }
    }` },
      pitfalls: []
    }, {
      num: "5.1–5.4", marks: 4,
      tags: ["oop-ui-class"],
      asked: "CustomerUI: create the manager, print it, print the discount count, set Busisiwe Dube's discount to false.",
      approach: "One mark per line of main.",
      solution: { lang: "java", code: `public class CustomerUI {
    public static void main(String[] args) {
        CustomerManager cm = new CustomerManager();
        System.out.println(cm);
        System.out.println("Customers eligible for discounts: " + cm.countDiscounts());
        cm.updateDiscount("Busisiwe Dube", false);
        // 6.4
        System.out.println(cm.generateTotals("orders.txt"));
    }
}` },
      pitfalls: []
    }, {
      num: "6.1", marks: 5,
      tags: ["files-read-scanner", "arrays-counters-totals"],
      asked: "countOrdersInFile(filename): count the lines in the file.",
      approach: "Open the file named by the parameter, nextLine() in a loop, count.",
      solution: { lang: "java", code: `    public int countOrdersInFile(String fileName) {
        int count = 0;
        try {
            Scanner sc = new Scanner(new File(fileName));
            while (sc.hasNextLine()) {
                sc.nextLine();
                count++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println(fileName + " not found");
        }
        return count;
    }` },
      pitfalls: ["Use the parameter, not a hard-coded \"orders.txt\".", "You must actually call nextLine() or the loop never ends."]
    }, {
      num: "6.2", marks: 5,
      tags: ["files-read-scanner", "arrays-objects"],
      asked: "getOrders(filename): return a String array exactly as long as the file, one line per element, without hard-coding the size.",
      approach: "Use countOrdersInFile to size the array, then read the file a second time to fill it.",
      solution: { lang: "java", code: `    public String[] getOrders(String fileName) {
        String[] lines = new String[countOrdersInFile(fileName)];
        try {
            Scanner sc = new Scanner(new File(fileName));
            int i = 0;
            while (sc.hasNextLine() && i < lines.length) {
                lines[i] = sc.nextLine();
                i++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println(fileName + " not found");
        }
        return lines;
    }` },
      pitfalls: ["Return type is String[] — the method header is part of the marks."]
    }, {
      num: "6.3", marks: 20,
      tags: ["str-split-build", "arrays-counters-totals", "oop-polymorphism", "date-localdate"],
      asked: "generateTotals(filename): for every business customer total their purchases from the orders file (R200 off each purchase over R1000 if they get a discount) and say when it's due: today + 30/60/90 days by payment term, else 'to be paid today'.",
      approach: "orders = getOrders(file). Outer loop over cArr; skip non-business customers (instanceof). Inner loop over orders: split on #, match the name, apply the discount, add. Then a switch on terms for plusDays.",
      solution: { lang: "java", code: `    public String generateTotals(String fileName) {
        String[] orders = getOrders(fileName);
        String out = "";
        LocalDate today = LocalDate.now();

        for (int i = 0; i < size; i++) {
            if (cArr[i] instanceof BusinessCust) {
                BusinessCust bc = (BusinessCust) cArr[i];
                int total = 0;
                for (int j = 0; j < orders.length; j++) {
                    String[] p = orders[j].split("#");
                    if (p[0].equals(bc.getName())) {
                        int cost = Integer.parseInt(p[1].trim());
                        if (bc.getDiscount() && cost > 1000) {
                            cost -= 200;
                        }
                        total += cost;
                    }
                }

                String due;
                switch (bc.getTerms()) {
                    case BusinessCust.DAYS30: due = "to be paid by " + today.plusDays(30); break;
                    case BusinessCust.DAYS60: due = "to be paid by " + today.plusDays(60); break;
                    case BusinessCust.DAYS90: due = "to be paid by " + today.plusDays(90); break;
                    default: due = "to be paid today";
                }
                out += bc.getName() + " owes " + total + " " + due + "\\n";
            }
        }
        return out;
    }` },
      pitfalls: [
        "Our reading: the R200 comes off EACH purchase over R1000 (each line is a purchase). Write a comment stating your interpretation — markers reward a clearly reasoned approach.",
        "Use getDiscount() (overridden) so 30-day businesses automatically qualify.",
        "Reset total for every customer.",
        "30 days is plusDays(30), not plusMonths(1)."
      ]
    }, {
      num: "6.4", marks: 1,
      tags: ["oop-ui-class"],
      asked: "Print generateTotals(\"orders.txt\") from the UI.",
      approach: "See 5.1–5.4.",
      solution: { lang: "java", code: `System.out.println(cm.generateTotals("orders.txt"));` },
      pitfalls: []
    }]
  }]
},
/* ===================================================================== */
{
  id: "practice-reeltime", year: 2026, session: "Practice",
  scenario: "ReelTime Cinemas practice paper (not an IEB paper — modelled on 2021–2025): movies, customers and bookings (SQL); Booking parent and VIPBooking child with seat arrays, Tuesday discount, check-digit validation, deleting from an object array, a per-customer report and a 2D seat map written to a file (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 4,
      tags: ["sql-select-where", "sql-order-by"],
      asked: "All details of movies rated A or PG that are shorter than 100 minutes, sorted by title.",
      approach: "IN for the two ratings (or bracketed OR), AND the duration, ORDER BY Title.",
      solution: { lang: "sql", code: `SELECT *
FROM tblMovies
WHERE AgeRating IN ('A', 'PG') AND Duration < 100
ORDER BY Title;` },
      pitfalls: ["Without brackets, AgeRating = 'A' OR AgeRating = 'PG' AND Duration < 100 lets long A-rated movies through."]
    }, {
      num: "1.2", marks: 4,
      tags: ["sql-like-wildcards", "sql-order-by"],
      asked: "Name and email of non-loyalty customers with a '@gmail.com' address, reverse alphabetical by name.",
      approach: "LIKE '*@gmail.com', Loyalty = False, ORDER BY FullName DESC.",
      solution: { lang: "sql", code: `SELECT FullName, Email
FROM tblCustomers
WHERE Email LIKE '*@gmail.com' AND Loyalty = False
ORDER BY FullName DESC;` },
      pitfalls: ["Include the @ — '*gmail.com' also matches '@googlemail.com'."]
    }, {
      num: "1.3", marks: 5,
      tags: ["sql-calculated", "sql-string-functions", "sql-date-functions"],
      asked: "Title and running time as 'Xh Ym' (field Runtime) for movies released in 2025, using integer division and MOD.",
      approach: "Access integer division is the backslash \\; MOD gives the remainder; glue with &.",
      solution: { lang: "sql", code: `SELECT Title, (Duration \\ 60) & 'h ' & (Duration MOD 60) & 'm' AS Runtime
FROM tblMovies
WHERE YEAR(ReleaseDate) = 2025;

-- MySQL: CONCAT(Duration DIV 60, 'h ', Duration MOD 60, 'm')` },
      pitfalls: [
        "Duration / 60 in Access gives 2.1333 — use \\ or INT(Duration / 60).",
        "JavaDB needs numbers converted to text (CHAR/CAST) before ||."
      ]
    }, {
      num: "1.4", marks: 3,
      tags: ["sql-group-by", "sql-order-by", "sql-aggregates"],
      asked: "Each genre with its number of movies (NumMovies), most first, ties alphabetical.",
      approach: "GROUP BY Genre; ORDER BY COUNT(*) DESC, Genre.",
      solution: { lang: "sql", code: `SELECT Genre, COUNT(*) AS NumMovies
FROM tblMovies
GROUP BY Genre
ORDER BY COUNT(*) DESC, Genre;` },
      pitfalls: ["Access won't sort by the alias NumMovies — repeat COUNT(*)."]
    }, {
      num: "1.5", marks: 4,
      tags: ["sql-date-functions"],
      asked: "Name and date of birth of customers who are under 18 today, accurate to the day.",
      approach: "Add 18 years to the birth date; if that is still after today they are under 18.",
      solution: { lang: "sql", code: `SELECT FullName, DOB
FROM tblCustomers
WHERE DateAdd('yyyy', 18, DOB) > Date();

-- MySQL: WHERE TIMESTAMPDIFF(YEAR, DOB, CURDATE()) < 18` },
      pitfalls: [
        "YEAR(Date()) - YEAR(DOB) < 18 is not accurate to the day (fails for someone whose birthday is later this year).",
        "DateDiff('yyyy', DOB, Date()) has the same problem — it only counts year boundaries."
      ]
    }, {
      num: "1.6", marks: 4,
      tags: ["sql-subqueries", "sql-aggregates"],
      asked: "Title and duration of the longest movie(s) (there is a tie).",
      approach: "WHERE Duration = (SELECT MAX(Duration) ...).",
      solution: { lang: "sql", code: `SELECT Title, Duration
FROM tblMovies
WHERE Duration = (SELECT MAX(Duration) FROM tblMovies);` },
      pitfalls: ["LIMIT 1 shows only one of the tied movies."]
    }, {
      num: "1.7", marks: 6,
      tags: ["sql-joins", "sql-calculated", "sql-date-functions", "sql-order-by"],
      asked: "Customer name, movie title, show date, tickets and TotalCost (tickets x price) for Canal Walk bookings in December 2025, by show date.",
      approach: "3-table join; Cinema test; date range for December 2025.",
      solution: { lang: "sql", code: `SELECT FullName, Title, ShowDate, NumTickets, NumTickets * TicketPrice AS TotalCost
FROM tblCustomers, tblMovies, tblBookings
WHERE tblCustomers.CustID = tblBookings.CustID
  AND tblMovies.MovieID = tblBookings.MovieID
  AND Cinema = 'Canal Walk'
  AND ShowDate BETWEEN #2025/12/01# AND #2025/12/31#
ORDER BY ShowDate;` },
      pitfalls: ["MONTH(ShowDate) = 12 alone would include December of other years — add YEAR = 2025."]
    }, {
      num: "1.8", marks: 6,
      tags: ["sql-joins", "sql-group-by", "sql-aggregates", "sql-order-by"],
      asked: "Each loyalty member's total spend (TotalSpent), only those above R600, highest first.",
      approach: "WHERE Loyalty (row filter), GROUP BY FullName, SUM(NumTickets * TicketPrice), HAVING > 600, ORDER BY SUM DESC.",
      solution: { lang: "sql", code: `SELECT FullName, SUM(NumTickets * TicketPrice) AS TotalSpent
FROM tblCustomers, tblMovies, tblBookings
WHERE tblCustomers.CustID = tblBookings.CustID
  AND tblMovies.MovieID = tblBookings.MovieID
  AND Loyalty = True
GROUP BY FullName
HAVING SUM(NumTickets * TicketPrice) > 600
ORDER BY SUM(NumTickets * TicketPrice) DESC;` },
      pitfalls: ["Loyalty is a row condition (WHERE); the R600 total is a group condition (HAVING)."]
    }, {
      num: "1.9", marks: 3,
      tags: ["sql-subqueries", "sql-select-where"],
      asked: "Titles of movies that have never been booked.",
      approach: "NOT IN sub-query.",
      solution: { lang: "sql", code: `SELECT Title
FROM tblMovies
WHERE MovieID NOT IN (SELECT MovieID FROM tblBookings);` },
      pitfalls: []
    }, {
      num: "1.10", marks: 5,
      tags: ["sql-update", "sql-string-functions"],
      asked: "Change every '@telkomsa.net' email to end in '@telkom.co.za', keeping the part before the @.",
      approach: "'@telkomsa.net' is 13 characters: keep LEFT(Email, LEN(Email) - 13) and add the new domain.",
      solution: { lang: "sql", code: `UPDATE tblCustomers
SET Email = LEFT(Email, LEN(Email) - 13) & '@telkom.co.za'
WHERE Email LIKE '*@telkomsa.net';

-- MySQL also allows: SET Email = REPLACE(Email, '@telkomsa.net', '@telkom.co.za')` },
      pitfalls: ["Count characters carefully, including the @ and the dot."]
    }, {
      num: "1.11", marks: 6,
      tags: ["sql-insert", "sql-subqueries", "sql-date-functions"],
      asked: "Insert a free booking (movie 7, 2026/12/16, 2 tickets, cinema 'Voucher') for every loyalty member with no booking in the current year.",
      approach: "INSERT INTO ... SELECT from tblCustomers WHERE Loyalty AND CustID NOT IN (bookings whose YEAR(ShowDate) = YEAR(Date())).",
      solution: { lang: "sql", code: `INSERT INTO tblBookings (CustID, MovieID, ShowDate, NumTickets, Cinema)
SELECT CustID, 7, #2026/12/16#, 2, 'Voucher'
FROM tblCustomers
WHERE Loyalty = True
  AND CustID NOT IN (SELECT CustID FROM tblBookings
                     WHERE YEAR(ShowDate) = YEAR(Date()));` },
      pitfalls: ["Don't hard-code 2026 in the sub-query.", "No BookingID (AutoNumber) and no VALUES keyword."]
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1–2.2", marks: 5,
      tags: ["oop-class-anatomy", "oop-static"],
      asked: "Booking class: private bookingRef, custName, showDate (date), seats (String array); public constant STANDARD_PRICE = 95.0; private static bookingCount = 0.",
      approach: "A static counter shared by all objects of Booking and its subclasses.",
      solution: { lang: "java", code: `import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public class Booking {
    private String bookingRef;
    private String custName;
    private LocalDate showDate;
    private String[] seats;

    public static final double STANDARD_PRICE = 95.0;
    private static int bookingCount = 0;` },
      pitfalls: []
    }, {
      num: "2.3", marks: 5,
      tags: ["oop-constructors", "date-formatter", "str-split-build", "oop-static"],
      asked: "Constructor (inRef, inName, inDate as yyyy/MM/dd text, inSeats like 'F7,F8'): parse the date, split the seats into the array, add 1 to bookingCount.",
      approach: "split(\",\") returns a ready-made array of exactly the right size.",
      solution: { lang: "java", code: `    public Booking(String inRef, String inName, String inDate, String inSeats) {
        bookingRef = inRef;
        custName = inName;
        showDate = LocalDate.parse(inDate, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        seats = inSeats.split(",");
        bookingCount++;
    }` },
      pitfalls: ["Because VIPBooking calls super(...), VIP bookings are counted too — no extra code needed."]
    }, {
      num: "2.4", marks: 2,
      tags: ["oop-accessors-mutators", "oop-static"],
      asked: "Getters for the four fields, getNumSeats(), and a static getBookingCount().",
      approach: "seats.length gives the number of seats.",
      solution: { lang: "java", code: `    public String getBookingRef()   { return bookingRef; }
    public String getCustName()     { return custName; }
    public LocalDate getShowDate()  { return showDate; }
    public String[] getSeats()      { return seats; }
    public int getNumSeats()        { return seats.length; }

    public static int getBookingCount() { return bookingCount; }` },
      pitfalls: ["length (no brackets) for arrays; length() for Strings."]
    }, {
      num: "2.5", marks: 4,
      tags: ["str-split-build", "str-methods"],
      asked: "getShortName: initials of every name except the surname, a space, then the surname ('Thandiwe Grace Mokoena' → 'TG Mokoena').",
      approach: "split(\" \"); loop to length - 1 taking charAt(0); the last element is the surname.",
      solution: { lang: "java", code: `    public String getShortName() {
        String[] words = custName.split(" ");
        String initials = "";
        for (int i = 0; i < words.length - 1; i++) {
            initials += words[i].charAt(0);
        }
        return initials + " " + words[words.length - 1];
    }` },
      pitfalls: ["Don't assume exactly two names."]
    }, {
      num: "2.6", marks: 3,
      tags: ["date-localdate", "oop-helper-methods"],
      asked: "calcCost: seats x R95, halved if the show is on a Tuesday.",
      approach: "getDayOfWeek() == DayOfWeek.TUESDAY.",
      solution: { lang: "java", code: `    public double calcCost() {
        double cost = getNumSeats() * STANDARD_PRICE;
        if (showDate.getDayOfWeek() == DayOfWeek.TUESDAY) {
            cost = cost / 2;
        }
        return cost;
    }` },
      pitfalls: ["getDayOfWeek() returns an enum — compare with DayOfWeek.TUESDAY, not the String \"Tuesday\"."]
    }, {
      num: "2.7", marks: 3,
      tags: ["oop-tostring", "str-format"],
      asked: "toString: ref, short name, date, 'n seat(s)', 'R' + cost to 2 decimals — tab-separated.",
      approach: "String.format(\"%.2f\", calcCost()) for two decimals.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return bookingRef + "\\t" + getShortName() + "\\t" + showDate + "\\t"
             + getNumSeats() + " seat(s)\\tR" + String.format("%.2f", calcCost());
    }` },
      pitfalls: ["Calling calcCost() (not storing a cost field) means a VIPBooking automatically shows its VIP price — polymorphism.", "On a PC set to South African regional settings String.format(\"%.2f\", x) prints a decimal COMMA (142,50). If the output must show a point use String.format(Locale.US, \"%.2f\", x) with import java.util.Locale."]
    }, {
      num: "3.1–3.3", marks: 7,
      tags: ["oop-inheritance", "oop-static", "oop-constructors", "arrays-parallel-2d"],
      asked: "VIPBooking extends Booking: private combo; constants VIP_PRICE = 180.0 and COMBO_PRICES = {0, 45, 70, 110}; constructor using super.",
      approach: "A constant array indexed by combo number replaces a switch.",
      solution: { lang: "java", code: `public class VIPBooking extends Booking {
    private int combo;

    public static final double VIP_PRICE = 180.0;
    public static final double[] COMBO_PRICES = {0.0, 45.0, 70.0, 110.0};

    public VIPBooking(String inRef, String inName, String inDate, String inSeats, int inCombo) {
        super(inRef, inName, inDate, inSeats);
        combo = inCombo;
    }` },
      pitfalls: []
    }, {
      num: "3.4–3.5", marks: 4,
      tags: ["oop-inheritance", "oop-tostring"],
      asked: "Override calcCost (seats x (180 + combo price), no Tuesday discount) and toString (parent's string + tab + 'VIP combo n').",
      approach: "Look up COMBO_PRICES[combo]; reuse super.toString().",
      solution: { lang: "java", code: `    @Override
    public double calcCost() {
        return getNumSeats() * (VIP_PRICE + COMBO_PRICES[combo]);
    }

    @Override
    public String toString() {
        return super.toString() + "\\tVIP combo " + combo;
    }
}` },
      pitfalls: ["Calling super.calcCost() here would wrongly apply the standard price and Tuesday discount."]
    }, {
      num: "4.1–4.3", marks: 14,
      tags: ["files-read-scanner", "str-split-build", "arrays-objects", "oop-polymorphism"],
      asked: "BookingManager: private bArr (50) and size; constructor checks Bookings.txt exists, then creates a Booking (4 fields) or VIPBooking (5 fields) per line.",
      approach: "exists() check, Scanner loop, split(\"#\"), test parts.length.",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class BookingManager {
    private Booking[] bArr = new Booking[50];
    private int size = 0;

    public BookingManager() {
        File f = new File("Bookings.txt");
        if (!f.exists()) {
            System.out.println("Bookings.txt is missing");
            return;
        }
        try {
            Scanner sc = new Scanner(f);
            while (sc.hasNextLine()) {
                String[] p = sc.nextLine().split("#");
                if (p.length == 5) {
                    bArr[size] = new VIPBooking(p[0], p[1], p[2], p[3], Integer.parseInt(p[4]));
                } else {
                    bArr[size] = new Booking(p[0], p[1], p[2], p[3]);
                }
                size++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("Could not read Bookings.txt");
        }
    }` },
      pitfalls: []
    }, {
      num: "4.4", marks: 3,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "Manager toString: one booking per line.",
      approach: "Loop to size.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "";
        for (int i = 0; i < size; i++) {
            out += bArr[i] + "\\n";
        }
        return out;
    }` },
      pitfalls: []
    }, {
      num: "4.5", marks: 5,
      tags: ["algo-sort", "date-localdate", "str-methods"],
      asked: "sortByDate: chronological by show date; same date → alphabetical by customer name.",
      approach: "Two-key comparison: swap if date is later, OR if dates are equal and the name is later.",
      solution: { lang: "java", code: `    public void sortByDate() {
        for (int i = 0; i < size - 1; i++) {
            for (int j = i + 1; j < size; j++) {
                LocalDate di = bArr[i].getShowDate();
                LocalDate dj = bArr[j].getShowDate();
                boolean swap = di.isAfter(dj)
                        || (di.equals(dj) && bArr[i].getCustName().compareTo(bArr[j].getCustName()) > 0);
                if (swap) {
                    Booking temp = bArr[i];
                    bArr[i] = bArr[j];
                    bArr[j] = temp;
                }
            }
        }
    }` },
      pitfalls: ["LocalDate supports isAfter/isBefore/equals and compareTo — don't compare dates as Strings unless they're yyyy-MM-dd."]
    }, {
      num: "5.1–5.4", marks: 5,
      tags: ["oop-ui-class", "oop-static"],
      asked: "BookingUI: create the manager, sort, display, then show the static booking count.",
      approach: "Static method called on the class name.",
      solution: { lang: "java", code: `public class BookingUI {
    public static void main(String[] args) {
        BookingManager bm = new BookingManager();
        bm.sortByDate();
        System.out.println(bm);
        System.out.println("Total bookings loaded: " + Booking.getBookingCount());
        System.out.println(bm.removeInvalid());        // 6.3
        System.out.println(bm.getCustomerReport());    // 7.2
        System.out.println(bm.getSeatMap("2026/10/17")); // 7.4
    }
}` },
      pitfalls: []
    }, {
      num: "6.1", marks: 6,
      tags: ["algo-validation", "str-methods"],
      asked: "isValidRef: 8 characters, starts with 'RT', and the last digit equals the weighted check digit of the 5 digits (weights 1,3,1,3,1; check = (10 - sum % 10) % 10).",
      approach: "Reject on length/prefix first. Digits are at string indexes 2–6; weight 1 for even offsets, 3 for odd.",
      solution: { lang: "java", code: `    public boolean isValidRef() {
        if (bookingRef.length() != 8 || !bookingRef.startsWith("RT")) {
            return false;
        }
        int sum = 0;
        for (int i = 2; i <= 6; i++) {
            int digit = bookingRef.charAt(i) - '0';
            if ((i - 2) % 2 == 0) {
                sum += digit;          // 1st, 3rd, 5th digit
            } else {
                sum += digit * 3;      // 2nd, 4th digit
            }
        }
        int check = (10 - sum % 10) % 10;
        int last = bookingRef.charAt(7) - '0';
        return check == last;
    }` },
      pitfalls: [
        "charAt(i) - '0' converts a digit character to its number; (int) charAt(i) gives the Unicode code (e.g. 53 for '5').",
        "The outer % 10 makes a sum ending in 0 give 0, not 10."
      ]
    }, {
      num: "6.2", marks: 7,
      tags: ["arrays-insert-delete", "arrays-objects"],
      asked: "removeInvalid: delete every booking with a bad reference by shifting later objects up and reducing size; return 'Removed ref (name)' lines.",
      approach: "while loop: if invalid, record it, shift elements i+1..size-1 left by one, size--, and DON'T advance i (the next item is now at i).",
      solution: { lang: "java", code: `    public String removeInvalid() {
        String out = "";
        int i = 0;
        while (i < size) {
            if (!bArr[i].isValidRef()) {
                out += "Removed " + bArr[i].getBookingRef() + " (" + bArr[i].getCustName() + ")\\n";
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
    }` },
      pitfalls: ["A for loop with i++ after a deletion skips the element that just moved into position i — two adjacent invalid bookings expose this."]
    }, {
      num: "7.1", marks: 13,
      tags: ["arrays-counters-totals", "arrays-search", "str-format", "oop-polymorphism"],
      asked: "getCustomerReport: one line per customer (first-appearance order) with number of bookings, number of VIP bookings, total seats, total spent (2 decimals) and GOLD if > R900 else STANDARD.",
      approach: "Keep a '#name#' string of customers already done. For each new name, reset counters and loop the whole array summing calcCost(), getNumSeats(), and instanceof VIPBooking.",
      solution: { lang: "java", code: `    public String getCustomerReport() {
        String out = "";
        String done = "#";
        for (int i = 0; i < size; i++) {
            String name = bArr[i].getCustName();
            if (!done.contains("#" + name + "#")) {
                done += name + "#";
                int bookings = 0, vip = 0, seats = 0;
                double total = 0;
                for (int j = i; j < size; j++) {
                    if (bArr[j].getCustName().equals(name)) {
                        bookings++;
                        seats += bArr[j].getNumSeats();
                        total += bArr[j].calcCost();
                        if (bArr[j] instanceof VIPBooking) {
                            vip++;
                        }
                    }
                }
                String status = (total > 900) ? "GOLD" : "STANDARD";
                out += name + ": " + bookings + " booking(s), " + vip + " VIP, "
                     + seats + " seat(s), R" + String.format("%.2f", total) + " " + status + "\\n";
            }
        }
        return out;
    }` },
      pitfalls: ["Without the 'done' check each customer is listed once per booking."]
    }, {
      num: "7.3", marks: 11,
      tags: ["arrays-parallel-2d", "files-write", "str-methods", "date-formatter"],
      asked: "getSeatMap(date): 10 x 12 grid of '.', marking each booked seat on that date 'S' (standard) or 'V' (VIP); heading line; rows labelled A–J; write to SeatMap.txt and return it.",
      approach: "char[10][12]; row index = seat.charAt(0) - 'A'; column = parseInt(seat.substring(1)) - 1.",
      solution: { lang: "java", code: `    public String getSeatMap(String dateText) {
        LocalDate d = LocalDate.parse(dateText, DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        char[][] grid = new char[10][12];
        for (int r = 0; r < 10; r++) {
            for (int c = 0; c < 12; c++) {
                grid[r][c] = '.';
            }
        }
        for (int i = 0; i < size; i++) {
            if (bArr[i].getShowDate().equals(d)) {
                char mark = (bArr[i] instanceof VIPBooking) ? 'V' : 'S';
                String[] s = bArr[i].getSeats();
                for (int k = 0; k < s.length; k++) {
                    int row = s[k].charAt(0) - 'A';
                    int col = Integer.parseInt(s[k].substring(1)) - 1;
                    grid[row][col] = mark;
                }
            }
        }
        String map = "Seat map for " + d + "\\n";
        for (int r = 0; r < 10; r++) {
            map += (char) ('A' + r);
            for (int c = 0; c < 12; c++) {
                map += " " + grid[r][c];
            }
            map += "\\n";
        }
        try {
            PrintWriter pw = new PrintWriter("SeatMap.txt");
            pw.print(map);
            pw.close();
        } catch (IOException e) {
            System.out.println("Could not write SeatMap.txt");
        }
        return map;
    }` },
      pitfalls: [
        "Seat 'A10' has a two-digit number: use substring(1), not charAt(1).",
        "'A' + r is an int — cast to (char) before appending.",
        "Arrays are 0-based: seat 1 is column index 0."
      ]
    }, {
      num: "6.3, 7.2, 7.4", marks: 3,
      tags: ["oop-ui-class"],
      asked: "From the UI: show removed bookings, the customer report, and the seat map for 2026/10/17 (in that order, after sorting).",
      approach: "See the UI in 5.1–5.4.",
      solution: { lang: "java", code: `System.out.println(bm.removeInvalid());
System.out.println(bm.getCustomerReport());
System.out.println(bm.getSeatMap("2026/10/17"));` },
      pitfalls: ["Call order matters: invalid bookings must be removed before the report and map."]
    }]
  }]
},
/* ===================================================================== */
{
  id: "2024-prelim", year: 2024, session: "Prelim",
  scenario: "July 2024 school prelim (reconstructed from its memo only — the question paper and table layouts were not available, and that memo contains several bugs, so these are corrected answers; its SQL marks add up to 49): university residences database (SQL); Student parent and ResStudent child, discounts by payment method, sorting, deleting and writing a file (Java).",
  total: 150,
  sections: [{
    name: "SQL",
    questions: [{
      num: "1.1", marks: 4,
      tags: ["sql-order-by"],
      asked: "All residence records, most expensive annual fee first.",
      approach: "SELECT * with ORDER BY Annual DESC.",
      solution: { lang: "sql", code: `SELECT *
FROM tblFees
ORDER BY Annual DESC;` },
      pitfalls: []
    }, {
      num: "1.2", marks: 3,
      tags: ["sql-like-wildcards"],
      asked: "All residences with 'hall' anywhere in the name.",
      approach: "LIKE '*hall*'.",
      solution: { lang: "sql", code: `SELECT *
FROM tblFees
WHERE ResName LIKE '*hall*';` },
      pitfalls: []
    }, {
      num: "1.3", marks: 5,
      tags: ["sql-string-functions", "sql-random", "sql-calculated"],
      asked: "Build a Password per university: last 4 letters of the university name + 2nd and 3rd letters of the province + a random number 1–20.",
      approach: "RIGHT(name, 4) & MID(province, 2, 2) & (INT(RND(field) * 20) + 1). Password is a reserved word in Access, so bracket it.",
      solution: { lang: "sql", code: `SELECT UnivName, Province,
       RIGHT(UnivName, 4) & MID(Province, 2, 2) & (INT(RND(VarsityCode) * 20) + 1) AS [Password]
FROM tblUniversity;` },
      pitfalls: [
        "MID(Province, 2, 2) = start at position 2, take 2 characters.",
        "RND needs a field argument in Access to give a different number on each row."
      ]
    }, {
      num: "1.4", marks: 6,
      tags: ["sql-aggregates", "sql-calculated"],
      asked: "Total enrolment across all universities increased by 4.6% for 2025, rounded to 1 decimal (Total2025).",
      approach: "SUM, multiply by 1.046, ROUND(..., 1).",
      solution: { lang: "sql", code: `SELECT ROUND(SUM(Enrolment) * 1.046, 1) AS Total2025
FROM tblUniversity;` },
      pitfalls: ["An increase of 4.6% is * 1.046 (not * 0.046 — that's only the increase itself)."]
    }, {
      num: "1.5", marks: 5,
      tags: ["sql-subqueries", "sql-aggregates"],
      asked: "Name and annual fee of residences cheaper than the average annual fee.",
      approach: "Sub-query AVG(Annual).",
      solution: { lang: "sql", code: `SELECT ResName, Annual
FROM tblFees
WHERE Annual < (SELECT AVG(Annual) FROM tblFees);` },
      pitfalls: []
    }, {
      num: "1.6", marks: 7,
      tags: ["sql-joins", "sql-select-where", "sql-order-by"],
      asked: "Residence and university names for Gauteng residences that are mixed ('O') or female-only ('F').",
      approach: "Join fees to universities on VarsityCode; Province = 'Gauteng' AND Category IN ('O', 'F'). DISTINCT removes repeats if a campus table is also joined.",
      solution: { lang: "sql", code: `SELECT DISTINCT ResName, UnivName
FROM tblFees INNER JOIN tblUniversity
  ON tblFees.VarsityCode = tblUniversity.VarsityCode
WHERE Province = 'Gauteng'
  AND Category IN ('O', 'F');` },
      pitfalls: ["Bracket an OR version: AND (Category = 'O' OR Category = 'F')."]
    }, {
      num: "1.7", marks: 6,
      tags: ["sql-update", "sql-string-functions"],
      asked: "Append ' (Gender-Inclusive)' to the names of residences open to all genders (Category 'O').",
      approach: "SET ResName = ResName & ' (Gender-Inclusive)'.",
      solution: { lang: "sql", code: `UPDATE tblFees
SET ResName = ResName & ' (Gender-Inclusive)'
WHERE Category = 'O';` },
      pitfalls: ["Running an append-UPDATE twice appends twice — test on a backup."]
    }, {
      num: "1.8", marks: 7,
      tags: ["sql-date-functions", "sql-order-by", "sql-calculated"],
      asked: "Age of each university on 31 December 2024 (field Age) — show only the three oldest with their names.",
      approach: "On 31 Dec every anniversary in 2024 has passed, so Age = 2024 - YEAR(DateOpened). Sort oldest first and take the top 3.",
      solution: { lang: "sql", code: `SELECT TOP 3 2024 - YEAR(DateOpened) AS Age, UnivName
FROM tblUniversity
ORDER BY DateOpened ASC;

-- MySQL: ... ORDER BY DateOpened LIMIT 3` },
      pitfalls: [
        "TOP n is Access/SQL Server; MySQL uses LIMIT n at the end; JavaDB uses FETCH FIRST 3 ROWS ONLY.",
        "Here the date is fixed by the question (31 Dec 2024), so 2024 is not 'hard-coding today'."
      ]
    }, {
      num: "1.9", marks: 6,
      tags: ["sql-joins", "sql-group-by", "sql-aggregates"],
      asked: "Each university name with the average annual residence price.",
      approach: "Join; GROUP BY UnivName; AVG(Annual).",
      solution: { lang: "sql", code: `SELECT UnivName, AVG(Annual) AS Average
FROM tblFees, tblUniversity
WHERE tblFees.VarsityCode = tblUniversity.VarsityCode
GROUP BY UnivName;` },
      pitfalls: []
    }]
  }, {
    name: "OOP",
    questions: [{
      num: "2.1–2.3", marks: 9,
      tags: ["oop-class-anatomy", "oop-static", "oop-constructors"],
      asked: "Student class: private fullName ('Surname Firstname'), degree, email, paymentOption; constant MIN_FEE_PAYMENT = 10000; constructor for the four fields.",
      approach: "Java constants use underscores (a '-' can't be in an identifier).",
      solution: { lang: "java", code: `public class Student {
    private String fullName;
    private String degree;
    private String email;
    private String paymentOption;

    public static final int MIN_FEE_PAYMENT = 10000;

    public Student(String inFN, String inD, String inE, String inPO) {
        fullName = inFN;
        degree = inD;
        email = inE;
        paymentOption = inPO;
    }` },
      pitfalls: ["If you name parameters the same as fields you must use this.field = field."]
    }, {
      num: "2.4–2.5", marks: 5,
      tags: ["oop-accessors-mutators", "str-split-build", "str-methods"],
      asked: "getFullName returns 'Surname I' (surname + first initial); a setter that stores the name in that form; getters for degree, email, paymentOption.",
      approach: "split(\" \"): index 0 is the surname, charAt(0) of index 1 is the initial.",
      solution: { lang: "java", code: `    public String getFullName() {
        String[] p = fullName.split(" ");
        return p[0] + " " + p[1].charAt(0);
    }

    public void setFullName(String inFN) {
        String[] p = inFN.split(" ");
        fullName = p[0] + " " + p[1].charAt(0);
    }

    public String getDegree()        { return degree; }
    public String getEmail()         { return email; }
    public String getPaymentOption() { return paymentOption; }` },
      pitfalls: ["If the setter's parameter is called fullName, 'fullName = result' changes the PARAMETER, not the field (shadowing). Use a different name or this.fullName."]
    }, {
      num: "2.6", marks: 5,
      tags: ["oop-helper-methods"],
      asked: "getDiscount: the discount rate for the student's payment method (VisaCard/MasterCard 10%, EFT 15%, Bursary 5%, NSFAS 0%).",
      approach: "switch on the paymentOption String (allowed since Java 7).",
      solution: { lang: "java", code: `    public double getDiscount() {
        switch (paymentOption) {
            case "VisaCard":
            case "MasterCard": return 0.10;
            case "EFT":        return 0.15;
            case "Bursary":    return 0.05;
            default:           return 0.0;     // NSFAS / unknown
        }
    }` },
      pitfalls: ["The class diagram has no parameter — use the field rather than adding a parameter."]
    }, {
      num: "2.7", marks: 4,
      tags: ["oop-tostring"],
      asked: "toString: short name, degree, email and [payment] separated by tabs.",
      approach: "Use getFullName() for the 'Surname I' form; add the square brackets.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return getFullName() + "\\t" + degree + "\\t" + email + "\\t[" + paymentOption + "]";
    }
}` },
      pitfalls: []
    }, {
      num: "3.1–3.3", marks: 8,
      tags: ["oop-inheritance", "oop-constructors", "oop-static"],
      asked: "ResStudent extends Student: private dateEnrolled (date), constant RES_FEE = 20000, constructor (inDE first, then the four Student values).",
      approach: "Follow the diagram's parameter order exactly — the date comes FIRST.",
      solution: { lang: "java", code: `import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class ResStudent extends Student {
    private LocalDate dateEnrolled;
    public static final int RES_FEE = 20000;

    public ResStudent(LocalDate inDE, String inFN, String inD, String inE, String inPO) {
        super(inFN, inD, inE, inPO);
        dateEnrolled = inDE;
    }

    public LocalDate getDate() {
        return dateEnrolled;
    }` },
      pitfalls: ["The manager must then call new ResStudent(date, name, degree, email, payment) — same order."]
    }, {
      num: "3.4", marks: 6,
      tags: ["date-localdate"],
      asked: "calcMonth: whole months between the enrolment date and today.",
      approach: "ChronoUnit.MONTHS.between(start, today) gives TOTAL months.",
      solution: { lang: "java", code: `    public int calcMonth() {
        return (int) ChronoUnit.MONTHS.between(dateEnrolled, LocalDate.now());
    }` },
      pitfalls: ["Period.between(...).getMonths() only returns the leftover months (0–11) after whole years — use toTotalMonths() or ChronoUnit."]
    }, {
      num: "3.5", marks: 5,
      tags: ["oop-tostring", "oop-inheritance"],
      asked: "Override toString: parent's line, then a line 'Surname I has been a member of the residence for n months'.",
      approach: "super.toString() + \"\\n\" + getFullName() + ...",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        return super.toString() + "\\n" + getFullName()
             + " has been a member of the residence for " + calcMonth() + " months";
    }
}` },
      pitfalls: ["Mind the spaces around the inserted text."]
    }, {
      num: "4.1–4.3", marks: 18,
      tags: ["files-read-scanner", "str-split-build", "date-formatter", "arrays-objects"],
      asked: "StudentManager with private arrStudents (40) and size; constructor checks Students.txt exists, reads each line, 4 fields → Student, 5 fields (adds yyyy/MM/dd date) → ResStudent.",
      approach: "Stop if the file is missing; otherwise split(\"#\") and use length to choose the class.",
      solution: { lang: "java", code: `import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class StudentManager {
    private Student[] arrStudents = new Student[40];
    private int size = 0;

    public StudentManager() {
        File f = new File("Students.txt");
        if (!f.exists()) {
            System.out.println("Students.txt does not exist");
            return;
        }
        try {
            Scanner sc = new Scanner(f);
            while (sc.hasNextLine()) {
                String[] t = sc.nextLine().split("#");
                if (t.length == 5) {
                    LocalDate d = LocalDate.parse(t[4], DateTimeFormatter.ofPattern("yyyy/MM/dd"));
                    arrStudents[size] = new ResStudent(d, t[0], t[1], t[2], t[3]);
                } else {
                    arrStudents[size] = new Student(t[0], t[1], t[2], t[3]);
                }
                size++;
            }
            sc.close();
        } catch (FileNotFoundException e) {
            System.out.println("Could not open Students.txt");
        }
    }` },
      pitfalls: ["Printing 'file exists' and then carrying on regardless isn't handling the error."]
    }, {
      num: "4.4", marks: 5,
      tags: ["oop-tostring", "arrays-objects"],
      asked: "toString listing every student on its own line (later extended in 6.1 to add the final payment).",
      approach: "Start from \"\" (not null), loop to size, call each element's toString.",
      solution: { lang: "java", code: `    @Override
    public String toString() {
        String out = "";
        for (int i = 0; i < size; i++) {
            out += arrStudents[i] + "\\t" + finalPayment(arrStudents[i]) + "\\n";
        }
        return out;
    }` },
      pitfalls: [
        "Starting with String s = null gives 'null...' at the front.",
        "Loop to size, not arrStudents.length — the rest are null."
      ]
    }, {
      num: "4.5", marks: 7,
      tags: ["algo-sort", "arrays-objects"],
      asked: "sortStudents: sort alphabetically by 'Surname I' and return the sorted array.",
      approach: "Bubble sort on getFullName() (the space sorts before letters, so 'Surname I' strings compare correctly). Return a copy of exactly size elements so callers never meet nulls.",
      solution: { lang: "java", code: `    public Student[] sortStudents() {
        for (int pass = 0; pass < size - 1; pass++) {
            for (int j = 0; j < size - 1 - pass; j++) {
                if (arrStudents[j].getFullName().compareTo(arrStudents[j + 1].getFullName()) > 0) {
                    Student temp = arrStudents[j];
                    arrStudents[j] = arrStudents[j + 1];
                    arrStudents[j + 1] = temp;
                }
            }
        }
        Student[] sorted = new Student[size];
        for (int i = 0; i < size; i++) {
            sorted[i] = arrStudents[i];
        }
        return sorted;
    }` },
      pitfalls: ["Sorting to arrStudents.length (40) calls getFullName() on null → NullPointerException."]
    }, {
      num: "4.6", marks: 5,
      tags: ["arrays-insert-delete"],
      asked: "deleteStudent: remove every student who pays with NSFAS.",
      approach: "Shift-left deletion with size-- (setting elements to null leaves holes that crash later loops).",
      solution: { lang: "java", code: `    public void deleteStudent(String method) {
        int i = 0;
        while (i < size) {
            if (arrStudents[i].getPaymentOption().equalsIgnoreCase(method)) {
                for (int j = i; j < size - 1; j++) {
                    arrStudents[j] = arrStudents[j + 1];
                }
                size--;
                arrStudents[size] = null;
            } else {
                i++;
            }
        }
    }` },
      pitfalls: ["Don't i++ after removing — the next student has moved into position i."]
    }, {
      num: "5.1–5.3", marks: 5,
      tags: ["oop-ui-class"],
      asked: "StudentUI: create the manager, sort, and display all students.",
      approach: "main method; loop through the returned (exact-size) array.",
      solution: { lang: "java", code: `public class StudentUI {
    public static void main(String[] args) {
        StudentManager sm = new StudentManager();
        Student[] list = sm.sortStudents();
        for (int i = 0; i < list.length; i++) {
            System.out.println(list[i]);
        }
        // 6.1 / 6.2
        System.out.println(sm);
        sm.update();
    }
}` },
      pitfalls: []
    }, {
      num: "6.1", marks: 11,
      tags: ["oop-polymorphism", "arrays-counters-totals", "oop-helper-methods"],
      asked: "Final amount owed: R10 000 tuition (+R20 000 if in residence), less the payment-method discount; show it at the end of each toString line.",
      approach: "Base fee depends on instanceof ResStudent; fee x (1 - discount).",
      solution: { lang: "java", code: `    private double finalPayment(Student s) {
        double fee = Student.MIN_FEE_PAYMENT;
        if (s instanceof ResStudent) {
            fee += ResStudent.RES_FEE;
        }
        return fee * (1 - s.getDiscount());
    }` },
      pitfalls: ["A day student's discount is on R10 000 only — 10000 - 30000 x discount is wrong (the prelim memo had this bug)."]
    }, {
      num: "6.2", marks: 7,
      tags: ["files-write", "arrays-insert-delete"],
      asked: "update(): remove NSFAS students, then write the remaining students to Update.txt.",
      approach: "Call deleteStudent(\"NSFAS\"); PrintWriter + FileWriter in try/catch; one line per student, #-separated.",
      solution: { lang: "java", code: `    public void update() {
        deleteStudent("NSFAS");
        try {
            PrintWriter pw = new PrintWriter(new FileWriter("Update.txt"));
            for (int i = 0; i < size; i++) {
                Student s = arrStudents[i];
                pw.println(s.getFullName() + "#" + s.getDegree() + "#"
                         + s.getEmail() + "#" + s.getPaymentOption());
            }
            pw.close();
        } catch (IOException e) {
            System.out.println("Could not write Update.txt");
        }
    }
}` },
      pitfalls: ["new FileWriter(name, true) appends; without true it overwrites — know which one the question wants."]
    }]
  }]
}
];
