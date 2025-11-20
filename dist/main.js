"use strict";
const numberFormatter = new Intl.NumberFormat('ko-KR');
const ALUMINUM_YIELD = 0.1;
function readNumberInput(id) {
    const el = document.getElementById(id);
    if (!el)
        return 0;
    const raw = el.value.replace(/,/g, '');
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
}
function countDigits(text) {
    return text.replace(/[^\d]/g, '').length;
}
function calculateCaretPosition(formatted, digitsLeftOfCaret) {
    var _a;
    if (!Number.isFinite(digitsLeftOfCaret) || digitsLeftOfCaret <= 0) {
        return 0;
    }
    let digitsSeen = 0;
    for (let i = 0; i < formatted.length; i += 1) {
        const char = (_a = formatted[i]) !== null && _a !== void 0 ? _a : '';
        if (/\d/.test(char)) {
            digitsSeen += 1;
        }
        if (digitsSeen >= digitsLeftOfCaret) {
            return i + 1;
        }
    }
    return formatted.length;
}
function formatCurrencyInputElement(el) {
    var _a;
    const rawValue = el.value;
    const digitsOnly = rawValue.replace(/[^\d]/g, '');
    const digitsLeftOfCaret = countDigits(rawValue.slice(0, (_a = el.selectionStart) !== null && _a !== void 0 ? _a : rawValue.length));
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
function handleCurrencyInput(el) {
    formatCurrencyInputElement(el);
    recalculate();
}
function applyInputsToDom(values) {
    const setCurrency = (id, amount) => {
        const el = document.getElementById(id);
        if (!el)
            return;
        if (!Number.isFinite(amount)) {
            el.value = '';
            return;
        }
        el.value = numberFormatter.format(Math.round(amount));
    };
    const setNumber = (id, value) => {
        const el = document.getElementById(id);
        if (!el)
            return;
        el.value = Number.isFinite(value) ? String(value) : '';
    };
    setCurrency('monthlyInvestment', values.monthlyInvestment);
    setCurrency('motorPricePerKg', values.motorPricePerKg);
    setCurrency('copperPricePerKg', values.copperPricePerKg);
    setCurrency('ironPricePerKg', values.ironPricePerKg);
    setCurrency('aluminumPricePerKg', values.aluminumPricePerKg);
    setCurrency('monthlyLaborCost', values.monthlyLaborCost);
    setNumber('copperYieldPercent', values.copperYieldPercent);
    setNumber('aluminumRatioPercent', values.aluminumRatioPercent);
}
function calculateBreakEvenMotorPrice(inputs) {
    const { monthlyInvestment, monthlyLaborCost, copperPricePerKg, ironPricePerKg, aluminumPricePerKg, copperYieldPercent, aluminumRatioPercent, } = inputs;
    if (!Number.isFinite(monthlyInvestment) || monthlyInvestment <= 0) {
        return null;
    }
    let copperYield = copperYieldPercent / 100;
    let aluminumMotorRatio = aluminumRatioPercent / 100;
    if (!Number.isFinite(copperYield) || copperYield < 0)
        copperYield = 0;
    if (copperYield > 1)
        copperYield = 1;
    if (!Number.isFinite(aluminumMotorRatio) || aluminumMotorRatio < 0)
        aluminumMotorRatio = 0;
    if (aluminumMotorRatio > 1)
        aluminumMotorRatio = 1;
    const copperMotorRatio = 1 - aluminumMotorRatio;
    const copperWirePerKg = copperMotorRatio * copperYield;
    const aluminumWirePerKg = aluminumMotorRatio * ALUMINUM_YIELD;
    const ironPerKg = copperMotorRatio * (1 - copperYield) + aluminumMotorRatio * (1 - ALUMINUM_YIELD);
    const k = copperWirePerKg * copperPricePerKg +
        aluminumWirePerKg * aluminumPricePerKg +
        ironPerKg * ironPricePerKg;
    if (!Number.isFinite(k) || k <= 0) {
        return null;
    }
    const denominator = monthlyInvestment + monthlyLaborCost;
    if (!Number.isFinite(denominator) || denominator <= 0) {
        return null;
    }
    return (k * monthlyInvestment) / denominator;
}
function calculateBreakEvenAluminumMotorRatio(inputs) {
    const { monthlyInvestment, monthlyLaborCost, motorPricePerKg, copperPricePerKg, ironPricePerKg, aluminumPricePerKg, copperYieldPercent, } = inputs;
    if (!Number.isFinite(monthlyInvestment) ||
        monthlyInvestment <= 0 ||
        !Number.isFinite(motorPricePerKg) ||
        motorPricePerKg <= 0) {
        return null;
    }
    const M = monthlyInvestment / motorPricePerKg;
    const targetK = (monthlyInvestment + monthlyLaborCost) / M;
    let copperYield = copperYieldPercent / 100;
    if (!Number.isFinite(copperYield) || copperYield < 0)
        copperYield = 0;
    if (copperYield > 1)
        copperYield = 1;
    const c = copperYield;
    const Pc = copperPricePerKg;
    const Pa = aluminumPricePerKg;
    const Pi = ironPricePerKg;
    const k0 = c * Pc + (1 - c) * Pi;
    const k1 = c * (Pi - Pc) + ALUMINUM_YIELD * (Pa - Pi);
    if (!Number.isFinite(k1) || k1 === 0) {
        return null;
    }
    const r = (targetK - k0) / k1;
    if (!Number.isFinite(r) || r < 0 || r > 1) {
        return null;
    }
    return r;
}
function calculateBreakEvenCopperYield(inputs) {
    const { monthlyInvestment, monthlyLaborCost, motorPricePerKg, copperPricePerKg, ironPricePerKg, aluminumPricePerKg, aluminumRatioPercent, } = inputs;
    if (!Number.isFinite(monthlyInvestment) ||
        monthlyInvestment <= 0 ||
        !Number.isFinite(motorPricePerKg) ||
        motorPricePerKg <= 0) {
        return null;
    }
    const M = monthlyInvestment / motorPricePerKg;
    const targetK = (monthlyInvestment + monthlyLaborCost) / M;
    let aluminumMotorRatio = aluminumRatioPercent / 100;
    if (!Number.isFinite(aluminumMotorRatio) || aluminumMotorRatio < 0)
        aluminumMotorRatio = 0;
    if (aluminumMotorRatio > 1)
        aluminumMotorRatio = 1;
    const r = aluminumMotorRatio;
    const Pc = copperPricePerKg;
    const Pa = aluminumPricePerKg;
    const Pi = ironPricePerKg;
    const k0 = (1 - r * ALUMINUM_YIELD) * Pi + r * ALUMINUM_YIELD * Pa;
    const k1 = (1 - r) * (Pc - Pi);
    if (!Number.isFinite(k1) || k1 === 0) {
        return null;
    }
    const c = (targetK - k0) / k1;
    if (!Number.isFinite(c) || c < 0 || c > 1) {
        return null;
    }
    return c;
}
function calculateBreakEvenCopperPrice(inputs) {
    const { monthlyInvestment, monthlyLaborCost, motorPricePerKg, ironPricePerKg, aluminumPricePerKg, copperYieldPercent, aluminumRatioPercent, } = inputs;
    if (!Number.isFinite(monthlyInvestment) ||
        monthlyInvestment <= 0 ||
        !Number.isFinite(motorPricePerKg) ||
        motorPricePerKg <= 0) {
        return null;
    }
    const M = monthlyInvestment / motorPricePerKg;
    const targetK = (monthlyInvestment + monthlyLaborCost) / M;
    let copperYield = copperYieldPercent / 100;
    let aluminumMotorRatio = aluminumRatioPercent / 100;
    if (!Number.isFinite(copperYield) || copperYield < 0)
        copperYield = 0;
    if (copperYield > 1)
        copperYield = 1;
    if (!Number.isFinite(aluminumMotorRatio) || aluminumMotorRatio < 0)
        aluminumMotorRatio = 0;
    if (aluminumMotorRatio > 1)
        aluminumMotorRatio = 1;
    const r = aluminumMotorRatio;
    const c = copperYield;
    const Pa = aluminumPricePerKg;
    const Pi = ironPricePerKg;
    const copperMotorRatio = 1 - r;
    const copperWirePerKg = copperMotorRatio * c;
    const aluminumWirePerKg = r * ALUMINUM_YIELD;
    const ironPerKg = copperMotorRatio * (1 - c) + r * (1 - ALUMINUM_YIELD);
    if (!Number.isFinite(copperWirePerKg) || copperWirePerKg <= 0) {
        return null;
    }
    const kConst = aluminumWirePerKg * Pa + ironPerKg * Pi;
    const Pc = (targetK - kConst) / copperWirePerKg;
    if (!Number.isFinite(Pc) || Pc <= 0) {
        return null;
    }
    return Pc;
}
function computeSensitivities(inputs, baseResult) {
    const baseProfit = baseResult.monthlyNetProfit;
    const hasBaseProfit = Number.isFinite(baseProfit !== null && baseProfit !== void 0 ? baseProfit : NaN) && baseProfit !== 0;
    const entries = [];
    const pmBase = inputs.motorPricePerKg;
    let pmEntry = {
        variable: 'motorPricePerKg',
        label: '폐모터 매입 단가',
        deltaLabel: '+1%',
        deltaProfit: null,
        deltaProfitPercent: null,
    };
    if (Number.isFinite(pmBase) && pmBase > 0 && Number.isFinite(baseProfit !== null && baseProfit !== void 0 ? baseProfit : NaN)) {
        const pmNew = pmBase * 1.01;
        const newInputs = Object.assign(Object.assign({}, inputs), { motorPricePerKg: pmNew });
        const newResult = calculate(newInputs);
        const deltaProfit = newResult.monthlyNetProfit - baseResult.monthlyNetProfit;
        pmEntry.deltaProfit = deltaProfit;
        if (hasBaseProfit) {
            const deltaPct = (deltaProfit / baseProfit) * 100;
            pmEntry.deltaProfitPercent = deltaPct;
        }
    }
    entries.push(pmEntry);
    const alBase = inputs.aluminumRatioPercent;
    let alEntry = {
        variable: 'aluminumRatioPercent',
        label: '알루미늄 모터 비율',
        deltaLabel: '+1%p',
        deltaProfit: null,
        deltaProfitPercent: null,
    };
    if (Number.isFinite(alBase) && Number.isFinite(baseProfit !== null && baseProfit !== void 0 ? baseProfit : NaN)) {
        let alNew = alBase + 1;
        if (alNew > 100)
            alNew = 100;
        const newInputs = Object.assign(Object.assign({}, inputs), { aluminumRatioPercent: alNew });
        const newResult = calculate(newInputs);
        const deltaProfit = newResult.monthlyNetProfit - baseResult.monthlyNetProfit;
        alEntry.deltaProfit = deltaProfit;
        if (hasBaseProfit) {
            const deltaPct = (deltaProfit / baseProfit) * 100;
            alEntry.deltaProfitPercent = deltaPct;
        }
    }
    entries.push(alEntry);
    const cuYieldBase = inputs.copperYieldPercent;
    let cuYieldEntry = {
        variable: 'copperYieldPercent',
        label: '구리 수율',
        deltaLabel: '+1%p',
        deltaProfit: null,
        deltaProfitPercent: null,
    };
    if (Number.isFinite(cuYieldBase) && Number.isFinite(baseProfit !== null && baseProfit !== void 0 ? baseProfit : NaN)) {
        let cuNew = cuYieldBase + 1;
        if (cuNew > 100)
            cuNew = 100;
        const newInputs = Object.assign(Object.assign({}, inputs), { copperYieldPercent: cuNew });
        const newResult = calculate(newInputs);
        const deltaProfit = newResult.monthlyNetProfit - baseResult.monthlyNetProfit;
        cuYieldEntry.deltaProfit = deltaProfit;
        if (hasBaseProfit) {
            const deltaPct = (deltaProfit / baseProfit) * 100;
            cuYieldEntry.deltaProfitPercent = deltaPct;
        }
    }
    entries.push(cuYieldEntry);
    const cuPriceBase = inputs.copperPricePerKg;
    let cuPriceEntry = {
        variable: 'copperPricePerKg',
        label: '구리 판매 단가',
        deltaLabel: '+1%',
        deltaProfit: null,
        deltaProfitPercent: null,
    };
    if (Number.isFinite(cuPriceBase) && cuPriceBase > 0 && Number.isFinite(baseProfit !== null && baseProfit !== void 0 ? baseProfit : NaN)) {
        const cuNew = cuPriceBase * 1.01;
        const newInputs = Object.assign(Object.assign({}, inputs), { copperPricePerKg: cuNew });
        const newResult = calculate(newInputs);
        const deltaProfit = newResult.monthlyNetProfit - baseResult.monthlyNetProfit;
        cuPriceEntry.deltaProfit = deltaProfit;
        if (hasBaseProfit) {
            const deltaPct = (deltaProfit / baseProfit) * 100;
            cuPriceEntry.deltaProfitPercent = deltaPct;
        }
    }
    entries.push(cuPriceEntry);
    return entries;
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
            yearlyTotalWeightKg: 0,
            yearlyCopperWeightKg: 0,
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
            monthlyProfitMarginPercent: null,
            breakEvenMotorPricePerKg: null,
            breakEvenAluminumMotorRatioPercent: null,
            breakEvenCopperYieldPercent: null,
            breakEvenCopperPricePerKg: null,
            validationMessage: '폐모터 매입 단가는 0보다 커야 합니다.',
        };
    }
    const totalWeightKg = monthlyInvestment / motorPricePerKg;
    let copperYield = copperYieldPercent / 100;
    let aluminumMotorRatio = aluminumRatioPercent / 100;
    if (copperYield < 0 || copperYield > 1 || aluminumMotorRatio < 0 || aluminumMotorRatio > 1) {
        validationMessage = '구리 수율과 알루미늄 모터 비율은 0~100% 사이여야 합니다.';
    }
    if (!Number.isFinite(copperYield) || copperYield < 0)
        copperYield = 0;
    if (copperYield > 1)
        copperYield = 1;
    if (!Number.isFinite(aluminumMotorRatio) || aluminumMotorRatio < 0)
        aluminumMotorRatio = 0;
    if (aluminumMotorRatio > 1)
        aluminumMotorRatio = 1;
    const copperMotorRatio = 1 - aluminumMotorRatio;
    const copperMotorWeightKg = totalWeightKg * copperMotorRatio;
    const aluminumMotorWeightKg = totalWeightKg * aluminumMotorRatio;
    const copperWeightKg = copperMotorWeightKg * copperYield;
    const aluminumWeightKg = aluminumMotorWeightKg * ALUMINUM_YIELD;
    const ironFromCopperMotorsKg = copperMotorWeightKg - copperWeightKg;
    const ironFromAluminumMotorsKg = aluminumMotorWeightKg - aluminumWeightKg;
    const ironWeightRaw = ironFromCopperMotorsKg + ironFromAluminumMotorsKg;
    const ironWeightKg = ironWeightRaw > 0 ? ironWeightRaw : 0;
    const copperRevenue = copperWeightKg * copperPricePerKg;
    const aluminumRevenue = aluminumWeightKg * aluminumPricePerKg;
    const ironRevenue = ironWeightKg * ironPricePerKg;
    const monthlyRevenue = copperRevenue + aluminumRevenue + ironRevenue;
    const monthlyGrossProfit = monthlyRevenue - monthlyInvestment;
    const monthlyNetProfit = monthlyGrossProfit - monthlyLaborCost;
    const yearlyTotalWeightKg = totalWeightKg * 12;
    const yearlyCopperWeightKg = copperWeightKg * 12;
    const yearlyRevenue = monthlyRevenue * 12;
    const yearlyGrossProfit = monthlyGrossProfit * 12;
    const yearlyNetProfit = monthlyNetProfit * 12;
    const breakEvenMotorPricePerKg = calculateBreakEvenMotorPrice(inputs);
    const breakEvenAluminumMotorRatio = calculateBreakEvenAluminumMotorRatio(inputs);
    const breakEvenCopperYield = calculateBreakEvenCopperYield(inputs);
    const breakEvenCopperPricePerKg = calculateBreakEvenCopperPrice(inputs);
    const monthlyProfitMarginPercent = monthlyRevenue > 0 ? (monthlyNetProfit / monthlyRevenue) * 100 : null;
    return {
        totalWeightKg,
        copperWeightKg,
        yearlyTotalWeightKg,
        yearlyCopperWeightKg,
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
        monthlyProfitMarginPercent,
        breakEvenMotorPricePerKg,
        breakEvenAluminumMotorRatioPercent: Number.isFinite(breakEvenAluminumMotorRatio !== null && breakEvenAluminumMotorRatio !== void 0 ? breakEvenAluminumMotorRatio : NaN)
            ? breakEvenAluminumMotorRatio * 100
            : null,
        breakEvenCopperYieldPercent: Number.isFinite(breakEvenCopperYield !== null && breakEvenCopperYield !== void 0 ? breakEvenCopperYield : NaN)
            ? breakEvenCopperYield * 100
            : null,
        breakEvenCopperPricePerKg,
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
    var _a, _b, _c, _d, _e, _f;
    setText('monthlyRevenue', formatNumber(result.monthlyRevenue));
    setText('monthlyGrossProfit', formatNumber(result.monthlyGrossProfit));
    setText('monthlyNetProfit', formatNumber(result.monthlyNetProfit));
    const profitMarginText = Number.isFinite((_a = result.monthlyProfitMarginPercent) !== null && _a !== void 0 ? _a : NaN)
        ? `${result.monthlyProfitMarginPercent.toFixed(1)} %`
        : '계산 불가';
    setText('monthlyProfitMargin', profitMarginText);
    setText('monthlyTotalWeight', formatNumber(result.totalWeightKg));
    setText('monthlyCopperWeight', formatNumber(result.copperWeightKg));
    setText('yearlyRevenue', formatNumber(result.yearlyRevenue));
    setText('yearlyGrossProfit', formatNumber(result.yearlyGrossProfit));
    setText('yearlyNetProfit', formatNumber(result.yearlyNetProfit));
    setText('yearlyTotalWeight', formatNumber(result.yearlyTotalWeightKg));
    setText('yearlyCopperWeight', formatNumber(result.yearlyCopperWeightKg));
    const breakEvenText = Number.isFinite((_b = result.breakEvenMotorPricePerKg) !== null && _b !== void 0 ? _b : NaN)
        ? formatNumber(result.breakEvenMotorPricePerKg)
        : '계산 불가';
    setText('breakEvenMotorPrice', breakEvenText);
    const breakEvenAlRatioText = Number.isFinite((_c = result.breakEvenAluminumMotorRatioPercent) !== null && _c !== void 0 ? _c : NaN)
        ? `${result.breakEvenAluminumMotorRatioPercent.toFixed(1)} %`
        : '계산 불가';
    setText('breakEvenAluminumMotorRatio', breakEvenAlRatioText);
    const breakEvenCopperYieldText = Number.isFinite((_d = result.breakEvenCopperYieldPercent) !== null && _d !== void 0 ? _d : NaN)
        ? `${result.breakEvenCopperYieldPercent.toFixed(1)} %`
        : '계산 불가';
    setText('breakEvenCopperYield', breakEvenCopperYieldText);
    const breakEvenCopperPriceText = Number.isFinite((_e = result.breakEvenCopperPricePerKg) !== null && _e !== void 0 ? _e : NaN)
        ? formatNumber(result.breakEvenCopperPricePerKg)
        : '계산 불가';
    setText('breakEvenCopperPrice', breakEvenCopperPriceText);
    const sensitivities = (_f = result.sensitivities) !== null && _f !== void 0 ? _f : [];
    const motorPriceSens = sensitivities.find((s) => s.variable === 'motorPricePerKg');
    const alRatioSens = sensitivities.find((s) => s.variable === 'aluminumRatioPercent');
    const cuYieldSens = sensitivities.find((s) => s.variable === 'copperYieldPercent');
    const cuPriceSens = sensitivities.find((s) => s.variable === 'copperPricePerKg');
    const formatSigned = (value) => {
        if (!Number.isFinite(value !== null && value !== void 0 ? value : NaN))
            return '계산 불가';
        const v = Math.round(value);
        if (v === 0)
            return '0';
        const sign = v > 0 ? '+' : '-';
        const abs = Math.abs(v);
        return `${sign}${numberFormatter.format(abs)}`;
    };
    const formatSignedPercent = (value) => {
        if (!Number.isFinite(value !== null && value !== void 0 ? value : NaN))
            return '계산 불가';
        const v = value;
        if (Math.abs(v) < 0.05)
            return '0.0';
        const sign = v > 0 ? '+' : v < 0 ? '-' : '';
        const abs = Math.abs(v);
        return `${sign}${abs.toFixed(1)}`;
    };
    const setSensitivityRow = (prefix, entry) => {
        if (!entry) {
            setText(`sens${prefix}DeltaProfit`, '-');
            setText(`sens${prefix}DeltaProfitPercent`, '-');
            return;
        }
        setText(`sens${prefix}DeltaProfit`, formatSigned(entry.deltaProfit));
        setText(`sens${prefix}DeltaProfitPercent`, entry.deltaProfitPercent != null
            ? `${formatSignedPercent(entry.deltaProfitPercent)}`
            : '계산 불가');
    };
    setSensitivityRow('MotorPrice', motorPriceSens);
    setSensitivityRow('AlRatio', alRatioSens);
    setSensitivityRow('CuYield', cuYieldSens);
    setSensitivityRow('CuPrice', cuPriceSens);
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
    const baseResult = calculate(inputs);
    const sensitivities = computeSensitivities(inputs, baseResult);
    const resultWithSensitivities = Object.assign(Object.assign({}, baseResult), { sensitivities });
    updateView(resultWithSensitivities);
}
function setup() {
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
        const el = document.getElementById(id);
        if (!el)
            return;
        if (currencyIds.includes(id)) {
            const handler = () => handleCurrencyInput(el);
            ['input', 'change', 'blur', 'keyup'].forEach((eventName) => {
                el.addEventListener(eventName, handler);
            });
            formatCurrencyInputElement(el);
        }
        else {
            el.addEventListener('input', recalculate);
        }
    });
    const motorPriceSlider = document.getElementById('motorPriceSlider');
    const motorPriceSliderValue = document.getElementById('motorPriceSliderValue');
    const aluminumRatioSlider = document.getElementById('aluminumRatioSlider');
    const aluminumRatioSliderValue = document.getElementById('aluminumRatioSliderValue');
    const syncSlidersFromInputs = () => {
        const motorPrice = readNumberInput('motorPricePerKg');
        if (motorPriceSlider && motorPriceSliderValue) {
            const min = Number(motorPriceSlider.min) || 0;
            const max = Number(motorPriceSlider.max) || 0;
            let value = motorPrice;
            if (!Number.isFinite(value) || value <= 0) {
                value = min || 0;
            }
            if (max > min) {
                value = Math.min(max, Math.max(min, value));
            }
            motorPriceSlider.value = String(Math.round(value));
            motorPriceSliderValue.textContent = `${formatNumber(value)} 원/kg`;
        }
        const aluminumRatio = readNumberInput('aluminumRatioPercent');
        if (aluminumRatioSlider && aluminumRatioSliderValue) {
            const min = Number(aluminumRatioSlider.min) || 0;
            const max = Number(aluminumRatioSlider.max) || 100;
            let value = aluminumRatio;
            if (!Number.isFinite(value) || value < 0) {
                value = min;
            }
            if (max > min) {
                value = Math.min(max, Math.max(min, value));
            }
            aluminumRatioSlider.value = String(Math.round(value));
            aluminumRatioSliderValue.textContent = `${value.toFixed(1)} %`;
        }
    };
    if (motorPriceSlider) {
        motorPriceSlider.addEventListener('input', () => {
            const value = Number(motorPriceSlider.value);
            const input = document.getElementById('motorPricePerKg');
            if (input) {
                input.value = String(value);
                formatCurrencyInputElement(input);
            }
            if (motorPriceSliderValue) {
                motorPriceSliderValue.textContent = `${formatNumber(value)} 원/kg`;
            }
            recalculate();
        });
    }
    if (aluminumRatioSlider) {
        aluminumRatioSlider.addEventListener('input', () => {
            const value = Number(aluminumRatioSlider.value);
            const input = document.getElementById('aluminumRatioPercent');
            if (input) {
                input.value = value.toFixed(1);
            }
            if (aluminumRatioSliderValue) {
                aluminumRatioSliderValue.textContent = `${value.toFixed(1)} %`;
            }
            recalculate();
        });
    }
    const DEFAULT_INPUTS = {
        monthlyInvestment: 0,
        motorPricePerKg: 700,
        copperPricePerKg: 12000,
        ironPricePerKg: 400,
        aluminumPricePerKg: 2000,
        copperYieldPercent: 10,
        aluminumRatioPercent: 10,
        monthlyLaborCost: 0,
    };
    const DEFAULT_PRESET_NAME = '기본 시나리오';
    const PRESET_STORAGE_KEY = 'scrapCalculatorPresets';
    const loadPresets = () => {
        try {
            const raw = localStorage.getItem(PRESET_STORAGE_KEY);
            if (!raw)
                return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed))
                return [];
            return parsed;
        }
        catch (_a) {
            return [];
        }
    };
    const savePresets = (presets) => {
        try {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        }
        catch (_a) {
            // ignore
        }
    };
    const ensureDefaultPreset = (presets) => {
        const hasDefault = presets.some((p) => p.name === DEFAULT_PRESET_NAME);
        if (!hasDefault) {
            return [{ name: DEFAULT_PRESET_NAME, values: DEFAULT_INPUTS }, ...presets];
        }
        return presets;
    };
    const presetSelect = document.getElementById('presetSelect');
    const presetNameInput = document.getElementById('presetName');
    const presetSaveButton = document.getElementById('presetSaveButton');
    const presetDeleteButton = document.getElementById('presetDeleteButton');
    const resetDefaultsButton = document.getElementById('resetDefaultsButton');
    let presets = ensureDefaultPreset(loadPresets());
    let currentPresetName = DEFAULT_PRESET_NAME;
    const renderPresetOptions = () => {
        if (!presetSelect)
            return;
        presetSelect.innerHTML = '';
        presets.forEach((preset) => {
            const option = document.createElement('option');
            option.value = preset.name;
            option.textContent = preset.name;
            if (preset.name === currentPresetName) {
                option.selected = true;
            }
            presetSelect.appendChild(option);
        });
    };
    const updatePresetDeleteState = () => {
        if (!presetDeleteButton)
            return;
        presetDeleteButton.disabled = currentPresetName === DEFAULT_PRESET_NAME;
    };
    renderPresetOptions();
    updatePresetDeleteState();
    if (presetSelect) {
        presetSelect.addEventListener('change', () => {
            const selectedName = presetSelect.value;
            currentPresetName = selectedName;
            const preset = presets.find((p) => p.name === selectedName);
            if (preset) {
                applyInputsToDom(preset.values);
                syncSlidersFromInputs();
                recalculate();
            }
            updatePresetDeleteState();
        });
    }
    if (presetSaveButton) {
        presetSaveButton.addEventListener('click', () => {
            var _a;
            const name = (_a = ((presetNameInput === null || presetNameInput === void 0 ? void 0 : presetNameInput.value.trim()) || DEFAULT_PRESET_NAME)) !== null && _a !== void 0 ? _a : DEFAULT_PRESET_NAME;
            const values = readInputs();
            const existingIndex = presets.findIndex((p) => p.name === name);
            if (existingIndex >= 0) {
                presets[existingIndex] = { name, values };
            }
            else {
                presets.push({ name, values });
            }
            currentPresetName = name;
            presets = ensureDefaultPreset(presets);
            savePresets(presets);
            renderPresetOptions();
            updatePresetDeleteState();
        });
    }
    if (presetDeleteButton) {
        presetDeleteButton.addEventListener('click', () => {
            if (currentPresetName === DEFAULT_PRESET_NAME)
                return;
            presets = presets.filter((p) => p.name !== currentPresetName);
            presets = ensureDefaultPreset(presets);
            currentPresetName = DEFAULT_PRESET_NAME;
            savePresets(presets);
            renderPresetOptions();
            applyInputsToDom(DEFAULT_INPUTS);
            syncSlidersFromInputs();
            recalculate();
            updatePresetDeleteState();
        });
    }
    if (resetDefaultsButton) {
        resetDefaultsButton.addEventListener('click', () => {
            applyInputsToDom(DEFAULT_INPUTS);
            syncSlidersFromInputs();
            recalculate();
            currentPresetName = DEFAULT_PRESET_NAME;
            renderPresetOptions();
            updatePresetDeleteState();
        });
    }
    syncSlidersFromInputs();
    recalculate();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
}
else {
    setup();
}
//# sourceMappingURL=main.js.map