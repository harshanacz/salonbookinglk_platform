"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BanknoteIcon } from "lucide-react";

const FinancialSummary = () => {
  const [period, setPeriod] = useState("Monthly");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dummy data representing sales-dependent earnings and transactions
  const earnings = 25.37; // This value should be dynamically fetched
  const paymentThreshold = 10.0;
  const transactions = [
    { date: "17 Dec 2024", amount: 25.37 },
    { date: "30 Nov 2024", amount: 7.52 },
    { date: "31 Oct 2024", amount: 1.69 },
  ];

  return (
    <div className="p-6 md:p-10 bg-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Financial Summary</h1>
        <div className="relative">
          <Button
            className="bg-purple-700 text-white"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {period}
          </Button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  setPeriod("Monthly");
                  setDropdownOpen(false);
                }}
              >
                Monthly
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                onClick={() => {
                  setPeriod("Yearly");
                  setDropdownOpen(false);
                }}
              >
                Yearly
              </button>
            </div>
          )}
        </div>
      </div>

      <Card className="mt-4 p-4">
        <h2 className="text-lg font-semibold">Your earnings</h2>
        <p className="text-2xl font-bold">US${earnings.toFixed(2)}</p>
        <div className="bg-gray-200 h-2 rounded-full mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{
              width: `${Math.min((earnings / paymentThreshold) * 80, 100)}%`,
            }}
          ></div>
        </div>
        <p className="text-sm mt-2">
          {earnings >= paymentThreshold
            ? "You've reached 100% of your payment threshold"
            : `You're at ${
                (earnings / paymentThreshold) * 100
              }% of your payment threshold (US$${paymentThreshold.toFixed(2)})`}
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="p-4">
          <h2 className="text-xl font-bold">Payout Charges</h2>
          <p className="text-gray-500 mt-2">No Recent Activity</p>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-bold">Transactions</h2>
          <ul className="mt-2">
            {transactions.map((transaction, index) => (
              <li key={index} className="flex justify-between">
                {transaction.date}{" "}
                <span>US${transaction.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BanknoteIcon />
            <span className="text-lg font-semibold">Payout Methods</span>
          </div>
          <Button variant="link" className="text-purple-500">
            Manage
          </Button>
        </Card>

        <Card className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span className="text-lg font-semibold">Payout Schedule</span>
          </div>
          <Button variant="link" className="text-purple-500">
            Manage
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default FinancialSummary;
