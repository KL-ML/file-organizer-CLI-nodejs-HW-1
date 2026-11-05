function parseDays(value) {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new InvalidArgumentError('Value must be a non-negative number of days.');
  }
  return parsed;
}

export default parseDays;