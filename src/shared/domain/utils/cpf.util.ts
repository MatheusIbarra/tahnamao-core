export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (!/^\d{11}$/.test(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const firstCheckDigit = calculateCheckDigit(cpf.slice(0, 9), 10);
  const secondCheckDigit = calculateCheckDigit(cpf.slice(0, 10), 11);

  return cpf[9] === String(firstCheckDigit) && cpf[10] === String(secondCheckDigit);
}

function calculateCheckDigit(baseDigits: string, factor: number): number {
  const sum = baseDigits
    .split('')
    .reduce((acc, digit) => acc + Number(digit) * factor--, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
