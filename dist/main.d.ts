declare const numberFormatter: Intl.NumberFormat;
declare const ALUMINUM_YIELD = 0.1;
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
    monthlyProfitMarginPercent: number | null;
    breakEvenMotorPricePerKg: number | null;
    breakEvenAluminumMotorRatioPercent: number | null;
    breakEvenCopperYieldPercent: number | null;
    breakEvenCopperPricePerKg: number | null;
    sensitivities?: SensitivityEntry[];
    validationMessage: string;
}
interface SensitivityEntry {
    variable: 'motorPricePerKg' | 'aluminumRatioPercent' | 'copperYieldPercent' | 'copperPricePerKg';
    label: string;
    deltaLabel: string;
    deltaProfit: number | null;
    deltaProfitPercent: number | null;
}
declare function readNumberInput(id: string): number;
declare function countDigits(text: string): number;
declare function calculateCaretPosition(formatted: string, digitsLeftOfCaret: number): number;
declare function formatCurrencyInputElement(el: HTMLInputElement): void;
declare function handleCurrencyInput(el: HTMLInputElement): void;
declare function applyInputsToDom(values: Inputs): void;
declare function calculateBreakEvenMotorPrice(inputs: Inputs): number | null;
declare function calculateBreakEvenAluminumMotorRatio(inputs: Inputs): number | null;
declare function calculateBreakEvenCopperYield(inputs: Inputs): number | null;
declare function calculateBreakEvenCopperPrice(inputs: Inputs): number | null;
declare function computeSensitivities(inputs: Inputs, baseResult: CalculationResult): SensitivityEntry[];
declare function readInputs(): Inputs;
declare function calculate(inputs: Inputs): CalculationResult;
declare function setText(id: string, value: string): void;
declare function formatNumber(value: number): string;
declare function updateView(result: CalculationResult): void;
declare function recalculate(): void;
declare function setup(): void;
//# sourceMappingURL=main.d.ts.map