const CYR_TO_LAT: Record<string, string> = {
  'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K',
  'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P',
  'С': 'C', 'Т': 'T', 'У': 'Y', 'Х': 'X',
}

const ALLOWED = new Set('ABEKMHOPCTYX0123456789'.split(''))
const PLATE_REGEX = /^[ABEKMHOPCTYX]\d{3}[ABEKMHOPCTYX]{2}\d{2,3}$/

export function normalizePlate(input: string): string {
  return input
    .toUpperCase()
    .replace(/[\s\-_.,]/g, '')
    .split('')
    .map(ch => CYR_TO_LAT[ch] ?? ch)
    .filter(ch => ALLOWED.has(ch))
    .join('')
}

export function isValidPlate(normalized: string): boolean {
  return PLATE_REGEX.test(normalized)
}
