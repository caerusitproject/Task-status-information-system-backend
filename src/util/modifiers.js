exports.getStartAndEndOfMonth=(year, month) =>{
  // month is 1-indexed (1 = January)
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const format = (d) => d.toISOString().split("T")[0];

  return {
    startDate: format(startDate),
    endDate: format(endDate),
  };
}