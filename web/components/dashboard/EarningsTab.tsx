"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight, 
  Download, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Calendar,
  Lock
} from "lucide-react";

interface Transaction {
  id: string;
  blueprintTitle: string;
  buyerName: string;
  buyerLocation: string;
  tier: "Tier 1: Permit Set" | "Tier 2: Builder Set" | "Tier 3: 3D BIM + BOQ";
  grossAmount: number;
  feeAmount: number;
  netPayout: number;
  status: "disbursed" | "in_escrow";
  date: string;
  escrowReleaseDate?: string;
  daysRemaining?: number;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-2026-9481",
    blueprintTitle: "The Ridge House",
    buyerName: "Adv. K. Ramesh",
    buyerLocation: "Wayanad, Kerala",
    tier: "Tier 3: 3D BIM + BOQ",
    grossAmount: 85000,
    feeAmount: 8500,
    netPayout: 76500,
    status: "in_escrow",
    date: "2026-11-21",
    escrowReleaseDate: "2026-11-28",
    daysRemaining: 5,
  },
  {
    id: "TXN-2026-9412",
    blueprintTitle: "Kerala Courtyard",
    buyerName: "Dr. Mathew Thomas",
    buyerLocation: "Thrissur, Kerala",
    tier: "Tier 2: Builder Set",
    grossAmount: 62000,
    feeAmount: 6200,
    netPayout: 55800,
    status: "in_escrow",
    date: "2026-11-19",
    escrowReleaseDate: "2026-11-26",
    daysRemaining: 3,
  },
  {
    id: "TXN-2026-9204",
    blueprintTitle: "The Brick Pavilion",
    buyerName: "Anand R. Nair",
    buyerLocation: "Coimbatore, Tamil Nadu",
    tier: "Tier 1: Permit Set",
    grossAmount: 39500,
    feeAmount: 3950,
    netPayout: 35550,
    status: "disbursed",
    date: "2026-11-10",
  },
  {
    id: "TXN-2026-8910",
    blueprintTitle: "The Ridge House",
    buyerName: "Sanjay Menon",
    buyerLocation: "Ernakulam, Kerala",
    tier: "Tier 3: 3D BIM + BOQ",
    grossAmount: 85000,
    feeAmount: 8500,
    netPayout: 76500,
    status: "disbursed",
    date: "2026-11-04",
  },
  {
    id: "TXN-2026-8742",
    blueprintTitle: "The Green Nest",
    buyerName: "Pradeep Kumar",
    buyerLocation: "Calicut, Kerala",
    tier: "Tier 2: Builder Set",
    grossAmount: 58000,
    feeAmount: 5800,
    netPayout: 52200,
    status: "disbursed",
    date: "2026-10-27",
  },
];

export default function EarningsTab() {
  const [transactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [statusFilter, setStatusFilter] = useState<"all" | "in_escrow" | "disbursed">("all");
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (statusFilter === "all") return transactions;
    return transactions.filter((t) => t.status === statusFilter);
  }, [transactions, statusFilter]);

  const grossTotal = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.grossAmount, 0);
  }, [transactions]);

  const inEscrowTotal = useMemo(() => {
    return transactions
      .filter((t) => t.status === "in_escrow")
      .reduce((acc, t) => acc + t.netPayout, 0);
  }, [transactions]);

  const disbursedTotal = useMemo(() => {
    return transactions
      .filter((t) => t.status === "disbursed")
      .reduce((acc, t) => acc + t.netPayout, 0);
  }, [transactions]);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = ["Transaction ID,Blueprint,Buyer,Location,Tier,Gross (INR),Platform Fee (INR),Net (INR),Status,Date\n"];
      const rows = filteredTransactions.map((t) =>
        `"${t.id}","${t.blueprintTitle}","${t.buyerName}","${t.buyerLocation}","${t.tier}",${t.grossAmount},${t.feeAmount},${t.netPayout},"${t.status}","${t.date}"`
      );
      const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `s-arc-earnings-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsExporting(false);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
        <div>
          <h2 className="text-2xl font-serif font-normal text-charcoal">
            Earnings & Statutory Escrow Payouts
          </h2>
          <p className="text-xs text-secondaryText font-sans mt-0.5">
            Transparent licensing royalty ledger with 7-day buyer escrow clearance and automated NEFT settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isExporting}
          className="px-4 py-2 rounded-full border border-warm-border hover:border-charcoal text-xs font-sans font-medium text-charcoal flex items-center gap-1.5 transition-colors bg-white shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-copper" />
          <span>{isExporting ? "Exporting..." : "Export Statement (.CSV)"}</span>
        </button>
      </div>

      {/* Top 3 High-Signal Metric Cards (Gestalt Common Region) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Royalties */}
        <div className="p-6 bg-white border border-warm-border rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondaryText text-xs font-sans">
            <span>Gross Design Royalties</span>
            <span className="p-1.5 rounded-full bg-copper/10 text-copper">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-serif text-charcoal font-medium">
            ₹{grossTotal.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-sans text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-semibold">+18.4%</span>
            <span className="text-mutedText">vs last month</span>
          </div>
        </div>

        {/* In Escrow */}
        <div className="p-6 bg-white border border-warm-border rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondaryText text-xs font-sans">
            <span className="flex items-center gap-1.5">
              <span>In Escrow Protection</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </span>
            <span className="p-1.5 rounded-full bg-amber-100 text-amber-700">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-serif text-charcoal font-medium">
            ₹{inEscrowTotal.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-sans text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>2 purchases clearing within 5 days</span>
          </div>
        </div>

        {/* Disbursed to Bank */}
        <div className="p-6 bg-white border border-warm-border rounded-3xl shadow-sm space-y-2">
          <div className="flex items-center justify-between text-secondaryText text-xs font-sans">
            <span>Net Disbursed to Bank</span>
            <span className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-serif text-charcoal font-medium">
            ₹{disbursedTotal.toLocaleString("en-IN")}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-sans text-emerald-700">
            <Building2 className="w-3.5 h-3.5" />
            <span>Next batch settlement: Friday 4:00 PM</span>
          </div>
        </div>
      </div>

      {/* S-ARC 7-Day Escrow Mechanism Explanation Banner */}
      <div className="p-5 rounded-2xl bg-[#F7F5F0] border border-warm-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-copper/15 text-copper flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-copper" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-serif text-charcoal font-semibold uppercase tracking-wider">
              Statutory 7-Day Escrow Payout Protocol
            </h4>
            <p className="text-[12px] text-secondaryText font-sans leading-relaxed max-w-2xl">
              When a client purchases your architectural drawing set, funds are held in escrow for 7 days while the client inspects the CAD, DWG, and BOQ deliverables. S-ARC automatically releases 90% net royalties directly to your verified bank account upon expiry of the inspection window.
            </p>
          </div>
        </div>

        {/* Bank Badge */}
        <div className="px-4 py-2.5 rounded-xl bg-white border border-warm-border text-right shrink-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-mutedText">Settlement Account</div>
          <div className="text-xs font-mono text-charcoal font-medium">HDFC •••• 4892 (Kochi)</div>
        </div>
      </div>

      {/* Transaction Ledger & Filter Bar */}
      <div className="bg-white border border-warm-border rounded-3xl shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 border-b border-warm-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif text-charcoal font-medium">Royalty Ledger</span>
            <span className="text-xs text-mutedText font-mono">({filteredTransactions.length} records)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-warm-grey/60 p-1 rounded-full border border-warm-border text-xs font-sans">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full transition-colors ${
                statusFilter === "all" ? "bg-white text-charcoal shadow-xs font-medium" : "text-secondaryText hover:text-charcoal"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("in_escrow")}
              className={`px-3 py-1 rounded-full transition-colors ${
                statusFilter === "in_escrow" ? "bg-white text-charcoal shadow-xs font-medium" : "text-secondaryText hover:text-charcoal"
              }`}
            >
              In Escrow ({transactions.filter((t) => t.status === "in_escrow").length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("disbursed")}
              className={`px-3 py-1 rounded-full transition-colors ${
                statusFilter === "disbursed" ? "bg-white text-charcoal shadow-xs font-medium" : "text-secondaryText hover:text-charcoal"
              }`}
            >
              Disbursed ({transactions.filter((t) => t.status === "disbursed").length})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-warm-border bg-warm-grey/30 text-[11px] font-mono text-mutedText uppercase tracking-wider">
                <th className="py-3 px-5">Transaction & Plan</th>
                <th className="py-3 px-4">Homeowner / Parcel</th>
                <th className="py-3 px-4">Deliverable Tier</th>
                <th className="py-3 px-4 text-right">Gross Price</th>
                <th className="py-3 px-4 text-right">Net Royalty (90%)</th>
                <th className="py-3 px-5 text-right">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-border/60">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-warm-grey/20 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-serif text-sm text-charcoal font-medium">{t.blueprintTitle}</div>
                    <div className="font-mono text-[10px] text-mutedText mt-0.5">{t.id} • {t.date}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-charcoal font-medium">{t.buyerName}</div>
                    <div className="text-[11px] text-secondaryText">{t.buyerLocation}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[11px]">
                      {t.tier}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-secondaryText">
                    ₹{t.grossAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-charcoal">
                    ₹{t.netPayout.toLocaleString("en-IN")}
                  </td>
                  <td className="py-4 px-5 text-right">
                    {t.status === "in_escrow" ? (
                      <div className="inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px] font-medium">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>In Escrow</span>
                        </span>
                        <span className="text-[10px] text-amber-700 mt-1 font-mono">
                          Releases in {t.daysRemaining} days
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Disbursed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
