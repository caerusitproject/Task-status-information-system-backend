exports.getStartAndEndOfMonth = (year, month) => {
  // month is 1-indexed (1 = January)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const format = (d) => d.toISOString().split("T")[0];

  return {
    startDate: format(startDate),
    endDate: format(endDate),
  };
};

exports.generateFourWeekRanges = (dateStr) => {
  const inputDate = new Date(dateStr);

  // Find Monday of the week (0=Sunday, 1=Monday...)
  const day = inputDate.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(inputDate);
  monday.setDate(monday.getDate() + diffToMonday);

  const result = [];

  for (let i = 0; i < 4; i++) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() + i * 7);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // Friday

    const format = (d) => d.toISOString().split("T")[0];

    result.push({
      week: i + 1,
      startDate: format(weekStart),
      endDate: format(weekEnd),
    });
  }

  return result;
};
