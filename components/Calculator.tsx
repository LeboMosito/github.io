"use client";

import { DollarSign } from "lucide-react";
import { useMemo, useState } from "react";

function monthlyPayment(principal: number, annualRate: number, years: number) {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

function maxLoanForPayment(payment: number, annualRate: number, years: number) {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return payment * months;
  return payment * ((Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
}

export function Calculator() {
  const [income, setIncome] = useState(6200);
  const [debts, setDebts] = useState(475);
  const [rate, setRate] = useState(6.75);
  const [downPayment, setDownPayment] = useState(8000);

  const result = useMemo(() => {
    const housingCap = income * 0.28;
    const totalDebtCap = income * 0.43;
    const payment = Math.max(0, Math.min(housingCap, totalDebtCap - debts));
    const loan = maxLoanForPayment(payment, rate, 30);
    const homePrice = loan + downPayment;
    const dti = income > 0 ? ((payment + debts) / income) * 100 : 0;
    const plusAmortizing = Math.min(homePrice * 0.05, 15000);
    const plusDeferred = 6000;

    return {
      payment,
      homePrice,
      dti,
      plusAmortizing,
      plusDeferred,
      paymentAtHomePrice: monthlyPayment(Math.max(homePrice - downPayment, 0), rate, 30)
    };
  }, [income, debts, rate, downPayment]);

  const fields = [
    { label: "Gross monthly income", value: income, setter: setIncome, prefix: "$", step: 100 },
    { label: "Monthly debts", value: debts, setter: setDebts, prefix: "$", step: 25 },
    { label: "Interest rate", value: rate, setter: setRate, suffix: "%", step: 0.125 },
    { label: "Down payment amount", value: downPayment, setter: setDownPayment, prefix: "$", step: 500 }
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="rounded-md border border-navy/10 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-white/5">
        <h2 className="font-serif text-3xl">Estimate your range</h2>
        <p className="mb-5 text-sm text-navy/60 dark:text-white/60">Uses a 28% housing ratio and 30-year amortization estimate.</p>
        <div className="space-y-4">
          {fields.map((field) => (
            <label key={field.label} className="block">
              <span className="mb-2 block text-sm font-semibold">{field.label}</span>
              <div className="flex items-center rounded-md border border-navy/15 bg-white px-3 focus-within:border-gold dark:border-white/15 dark:bg-navy">
                {field.prefix && <span className="text-navy/45 dark:text-white/45">{field.prefix}</span>}
                <input
                  type="number"
                  value={field.value}
                  step={field.step}
                  onChange={(event) => field.setter(Number(event.target.value))}
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm outline-none"
                />
                {field.suffix && <span className="text-navy/45 dark:text-white/45">{field.suffix}</span>}
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-navy/10 bg-navy p-6 text-white shadow-soft dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-gold text-navy">
            <DollarSign className="h-7 w-7" />
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Estimated max home price</div>
            <div className="font-serif text-5xl">${Math.round(result.homePrice).toLocaleString()}</div>
          </div>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Metric label="Max monthly housing payment" value={`$${Math.round(result.payment).toLocaleString()}`} />
          <Metric label="Estimated DTI" value={`${result.dti.toFixed(1)}%`} />
          <Metric label="Payment at estimated price" value={`$${Math.round(result.paymentAtHomePrice).toLocaleString()}`} />
          <Metric label="Great Choice Plus potential" value={`$${Math.round(result.plusAmortizing).toLocaleString()}`} />
        </div>
        <div className="mt-6 rounded-md border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/80">
          Great Choice Plus assistance may increase practical purchase power by reducing upfront cash needed. Amortizing assistance could be up to 5% of the purchase price, capped at $15,000. Deferred assistance is a flat $6,000 with no monthly payment and forgiveness after 30 years.
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{label}</div>
      <div className="mt-2 font-serif text-3xl text-gold">{value}</div>
    </div>
  );
}
