export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        value += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      current.push(value);
      value = "";
      continue;
    }

    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") i++;
      current.push(value);
      value = "";
      if (current.some((cell) => cell.length > 0)) rows.push(current);
      current = [];
      continue;
    }

    value += char;
  }

  if (value.length > 0 || current.length > 0) {
    current.push(value);
    if (current.some((cell) => cell.length > 0)) rows.push(current);
  }

  return rows;
}
