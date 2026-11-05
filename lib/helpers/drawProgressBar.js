function drawProgressBar(current, total, width = 20) {
  if (total <= 0) {
    return `${'█'.repeat(width)} 0/0`;
  }
  const percentage = Math.min(1, Math.max(0, current / total));
  const filled = Math.round(percentage * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `${bar} ${current}/${total}`;
}

export default drawProgressBar;