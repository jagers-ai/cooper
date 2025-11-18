const numberFormatter = new Intl.NumberFormat('ko-KR');

interface Inputs {
  monthlyInvestment: number;
  motorPricePerKg: number;
  copperPricePerKg: number;
  ironPricePerKg: number;
  aluminumPricePerKg: number;
  copperYieldPercent: number;
  aluminumRatioPercent: number;
  monthlyLaborCost: number;
}

interface CalculationResult {
  totalWeightKg: number;
  copperWeightKg: number;
  aluminumWeightKg: number;
  ironWeightKg: number;
  copperRevenue: number;
  aluminumRevenue: number;
  ironRevenue: number;
  monthlyRevenue: number;
  monthlyGrossProfit: number;
  monthlyNetProfit: number;
  yearlyRevenue: number;
  yearlyGrossProfit: number;
  yearlyNetProfit: number;
  validationMessage: string;
}

function readNumberInput(id: string): number {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return 0;
  const raw = el.value.replace(/,/g, '');
  const value = parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

function countDigits(text: string): number {
  return text.replace(/[^\d]/g, '').length;
}

function calculateCaretPosition(formatted: string, digitsLeftOfCaret: number): number {
  if (!Number.isFinite(digitsLeftOfCaret) || digitsLeftOfCaret <= 0) {
    return 0;
  }
  let digitsSeen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    const char = formatted[i] ?? '';
    if (/\d/.test(char)) {
      digitsSeen += 1;
    }
    if (digitsSeen >= digitsLeftOfCaret) {
      return i + 1;
    }
  }
  return formatted.length;
}

function formatCurrencyInputElement(el: HTMLInputElement): void {
  const rawValue = el.value;
  const digitsOnly = rawValue.replace(/[^\d]/g, '');
  const digitsLeftOfCaret = countDigits(rawValue.slice(0, el.selectionStart ?? rawValue.length));

  if (digitsOnly === '') {
    el.value = '';
    return;
  }

  const numeric = Number(digitsOnly);
  if (!Number.isFinite(numeric)) {
    el.value = '';
    return;
  }

  const formatted = numberFormatter.format(numeric);
  el.value = formatted;

  if (document.activeElement === el) {
    const newCaretPosition = calculateCaretPosition(formatted, digitsLeftOfCaret);
    el.setSelectionRange(newCaretPosition, newCaretPosition);
  }
}

function handleCurrencyInput(el: HTMLInputElement): void {
  formatCurrencyInputElement(el);
  recalculate();
}

function readInputs(): Inputs {
  return {
    monthlyInvestment: readNumberInput('monthlyInvestment'),
    motorPricePerKg: readNumberInput('motorPricePerKg'),
    copperPricePerKg: readNumberInput('copperPricePerKg'),
    ironPricePerKg: readNumberInput('ironPricePerKg'),
    aluminumPricePerKg: readNumberInput('aluminumPricePerKg'),
    copperYieldPercent: readNumberInput('copperYieldPercent'),
    aluminumRatioPercent: readNumberInput('aluminumRatioPercent'),
    monthlyLaborCost: readNumberInput('monthlyLaborCost'),
  };
}

function calculate(inputs: Inputs): CalculationResult {
  const {
    monthlyInvestment,
    motorPricePerKg,
    copperPricePerKg,
    ironPricePerKg,
    aluminumPricePerKg,
    copperYieldPercent,
    aluminumRatioPercent,
    monthlyLaborCost,
  } = inputs;

  let validationMessage = '';

  if (motorPricePerKg <= 0 || !Number.isFinite(motorPricePerKg)) {
    return {
      totalWeightKg: 0,
      copperWeightKg: 0,
      aluminumWeightKg: 0,
      ironWeightKg: 0,
      copperRevenue: 0,
      aluminumRevenue: 0,
      ironRevenue: 0,
      monthlyRevenue: 0,
      monthlyGrossProfit: 0,
      monthlyNetProfit: 0,
      yearlyRevenue: 0,
      yearlyGrossProfit: 0,
      yearlyNetProfit: 0,
      validationMessage: '폐모터 매입 단가는 0보다 커야 합니다.',
    };
  }

  const totalWeightKg = monthlyInvestment / motorPricePerKg;

  const copperYield = copperYieldPercent / 100;
  const aluminumRatio = aluminumRatioPercent / 100;

  if (copperYield < 0 || aluminumRatio < 0) {
    validationMessage = '수율과 비율은 0 이상이어야 합니다.';
  }

  if (copperYield + aluminumRatio > 1) {
    validationMessage =
      '구리 수율과 알루미늄 모터 비율의 합이 100%를 초과했습니다. 값들을 다시 확인해주세요.';
  }

  const copperWeightKg = totalWeightKg * Math.max(copperYield, 0);
  const aluminumWeightKg = totalWeightKg * Math.max(aluminumRatio, 0);

  const ironWeightRaw = totalWeightKg - copperWeightKg - aluminumWeightKg;
  const ironWeightKg = ironWeightRaw > 0 ? ironWeightRaw : 0;

  const copperRevenue = copperWeightKg * copperPricePerKg;
  const aluminumRevenue = aluminumWeightKg * aluminumPricePerKg;
  const ironRevenue = ironWeightKg * ironPricePerKg;

  const monthlyRevenue = copperRevenue + aluminumRevenue + ironRevenue;
  const monthlyGrossProfit = monthlyRevenue - monthlyInvestment;
  const monthlyNetProfit = monthlyGrossProfit - monthlyLaborCost;

  const yearlyRevenue = monthlyRevenue * 12;
  const yearlyGrossProfit = monthlyGrossProfit * 12;
  const yearlyNetProfit = monthlyNetProfit * 12;

  return {
    totalWeightKg,
    copperWeightKg,
    aluminumWeightKg,
    ironWeightKg,
    copperRevenue,
    aluminumRevenue,
    ironRevenue,
    monthlyRevenue,
    monthlyGrossProfit,
    monthlyNetProfit,
    yearlyRevenue,
    yearlyGrossProfit,
    yearlyNetProfit,
    validationMessage,
  };
}

function setText(id: string, value: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  return numberFormatter.format(Math.round(value));
}

function updateView(result: CalculationResult): void {
  setText('monthlyRevenue', formatNumber(result.monthlyRevenue));
  setText('monthlyGrossProfit', formatNumber(result.monthlyGrossProfit));
  setText('monthlyNetProfit', formatNumber(result.monthlyNetProfit));

  setText('yearlyRevenue', formatNumber(result.yearlyRevenue));
  setText('yearlyGrossProfit', formatNumber(result.yearlyGrossProfit));
  setText('yearlyNetProfit', formatNumber(result.yearlyNetProfit));

  setText('totalWeight', formatNumber(result.totalWeightKg));
  setText('copperWeight', formatNumber(result.copperWeightKg));
  setText('aluminumWeight', formatNumber(result.aluminumWeightKg));
  setText('ironWeight', formatNumber(result.ironWeightKg));

  setText('copperRevenue', formatNumber(result.copperRevenue));
  setText('aluminumRevenue', formatNumber(result.aluminumRevenue));
  setText('ironRevenue', formatNumber(result.ironRevenue));

  const validationEl = document.getElementById('validationMessage');
  if (validationEl) {
    validationEl.textContent = result.validationMessage;
  }
}

function recalculate(): void {
  const inputs = readInputs();
  const result = calculate(inputs);
  updateView(result);
}

function setup(): void {
  const currencyIds = [
    'monthlyInvestment',
    'motorPricePerKg',
    'copperPricePerKg',
    'ironPricePerKg',
    'aluminumPricePerKg',
    'monthlyLaborCost',
  ];

  const inputIds = [
    'monthlyInvestment',
    'motorPricePerKg',
    'copperPricePerKg',
    'ironPricePerKg',
    'aluminumPricePerKg',
    'copperYieldPercent',
    'aluminumRatioPercent',
    'monthlyLaborCost',
  ];

  inputIds.forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    if (currencyIds.includes(id)) {
      const handler = () => handleCurrencyInput(el);
      ['input', 'change', 'blur', 'keyup'].forEach((eventName) => {
        el.addEventListener(eventName, handler);
      });
      formatCurrencyInputElement(el);
    } else {
      el.addEventListener('input', recalculate);
    }
  });

  recalculate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setup);
} else {
  setup();
}
