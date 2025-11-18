declare const numberFormatter: Intl.NumberFormat;
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
declare function readNumberInput(id: string): number;
declare function countDigits(text: string): number;
declare function calculateCaretPosition(formatted: string, digitsLeftOfCaret: number): number;
declare function formatCurrencyInputElement(el: HTMLInputElement): void;
declare function handleCurrencyInput(el: HTMLInputElement): void;
declare function readInputs(): Inputs;
declare function calculate(inputs: Inputs): CalculationResult;
declare function setText(id: string, value: string): void;
declare function formatNumber(value: number): string;
declare function updateView(result: CalculationResult): void;
declare function recalculate(): void;
declare function setup(): void;
//# sourceMappingURL=main.d.ts.map