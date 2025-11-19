exports.generateFourWeekRanges = (dateStr, page = 1) => {
  const inputDate = new Date(dateStr);

  // Find Monday of that week
  const day = inputDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(inputDate);
  monday.setDate(monday.getDate() + diffToMonday);

  // Each "page" shifts by 4 weeks (28 days)
  const offsetDays = (page - 1) * 28;
  monday.setDate(monday.getDate() + offsetDays);

  const result = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Friday (Start + 4 days)

    const format = (d) => d.toISOString().split("T")[0];

    result.push({
      week: i + 1 + (page - 1) * 4, // Week numbering continues across pages
      startDate: format(weekStart),
      endDate: format(weekEnd),
    });
  }

  if (page < 1) {
    result.reverse();
  }

  return result;
};

exports.getNextDate = (dateString) => {
  const date = new Date(dateString);

  // Add 1 day
  date.setDate(date.getDate() + 1);

  // Format YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// exports.extractQueries = (htmlText) => {
//   if (!htmlText) return [];

//   // 1. Extract all <td> blocks that appear under "Query"
//   const queryBlocks = [
//     ...htmlText.matchAll(
//       /<strong>Query<\/strong><\/td><\/tr>\s*<tr><td>([\s\S]*?)<\/td>/gi
//     ),
//   ];

//   const extractedQueries = [];

//   for (const block of queryBlocks) {
//     const raw = block[1];

//     // 2. Remove HTML tags
//     let cleaned = raw.replace(/<[^>]+>/g, "");

//     // 3. Normalize spacing
//     cleaned = cleaned.replace(/\s+/g, " ").trim();

//     // 4. Split into individual SQL statements if needed
//     const statements = cleaned.split(/(?=SELECT)/gi); // split at the word SELECT

//     extractedQueries.push(...statements.map((s) => s.trim()));
//   }

//   return extractedQueries;
// };

exports.extractQueries = (htmlText) => {
  if (!htmlText) return [];

  const queryBlocks = [
    ...htmlText.matchAll(
      /<strong>Query<\/strong><\/td><\/tr>\s*<tr><td>([\s\S]*?)<\/td>/gi
    ),
  ];

  const extractedQueries = [];

  for (const block of queryBlocks) {
    let cleaned = block[1];

    // Remove HTML tags
    cleaned = cleaned.replace(/<[^>]+>/g, "");

    // Decode common HTML entities
    cleaned = cleaned
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");

    // CRITICAL: Remove ALL backslashes FIRST and aggressively
    cleaned = cleaned.replace(/\\/g, "");

    // Fix common escaped quotes that become broken after backslash removal
    // e.g. "module" -> module", then fix to "module"
    cleaned = cleaned.replace(/"(\s*[\w]+)"(\s*[=,)])/g, '"$1"$2'); // shouldn't be needed if \ is gone
    // But more importantly, sometimes you get: "module" -> module" after \ removal
    // So let's fix broken quotes around identifiers:
    cleaned = cleaned.replace(/="\s*;/g, ' = "'); // fix "; to "
    cleaned = cleaned.replace(/;"(\s*[\w\."]+)/g, ' "$1'); // fix leading ";
    cleaned = cleaned.replace(/(\w)"\s*([=)])/g, '$1" $2'); // fix missing " after word

    // Alternative strong fix: re-quote identifiers that clearly should be quoted
    // This handles the specific broken pattern: = ";module" -> = "module"
    cleaned = cleaned.replace(/=\s*";/g, ' = "');
    cleaned = cleaned.replace(/;"/g, ' "');

    // Remove extra spaces and normalize
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    // Split into individual SQL statements starting with SELECT
    const sqlStatements = cleaned.split(/(?=SELECT)/gi);

    for (let stmt of sqlStatements) {
      stmt = stmt.trim();
      if (stmt) {
        extractedQueries.push(stmt);
      }
    }
  }

  return extractedQueries;
};

exports.cleanSQL = (sql) => {
  if (!sql) return "";

  return sql
    .replace(/&nbsp;/g, " ")
    .replace(/;\"module/g, '"module')
    .replace(/\";\"module/g, '"module')
    .replace(/LEFT OUTER JOIN/g, " LEFT OUTER JOIN ")
    .replace(/FROM/g, " FROM ")
    .replace(/\s+/g, " ")
    .trim();
};
