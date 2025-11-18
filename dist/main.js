const numberFormatter = new Intl.NumberFormat('ko-KR');
function readNumberInput(id) {
    const el = document.getElementById(id);
    if (!el)
        return 0;
    const value = parseFloat(el.value.replace(/,/g, ''));
    return Number.isFinite(value) ? value : 0;
}
function readInputs() {
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
function calculate(inputs) {
    const { monthlyInvestment, motorPricePerKg, copperPricePerKg, ironPricePerKg, aluminumPricePerKg, copperYieldPercent, aluminumRatioPercent, monthlyLaborCost, } = inputs;
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
function setText(id, value) {
    const el = document.getElementById(id);
    if (!el)
        return;
    el.textContent = value;
}
function formatNumber(value) {
    if (!Number.isFinite(value))
        return '0';
    return numberFormatter.format(Math.round(value));
}
function updateView(result) {
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
function recalculate() {
    const inputs = readInputs();
    const result = calculate(inputs);
    updateView(result);
}
function setup() {
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
        const el = document.getElementById(id);
        if (!el)
            return;
        el.addEventListener('input', recalculate);
    });
    recalculate();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
}
else {
    setup();
}
export {};
//# sourceMappingURL=main.js.map