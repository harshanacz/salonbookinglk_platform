"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Card {
  id: number;
  type: string;
  lastFour: string;
  holder: string;
  logo: string;
}

export default function Payments() {
  const [cards, setCards] = useState<Card[]>([
    {
      id: 1,
      type: "Mastercard",
      lastFour: "1234",
      holder: "John Deo",
      logo: "/mastercard-logo.png",
    },
  ]);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-pink-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Payments</h1>
      <div className="w-full max-w-md space-y-4">
        {cards.map((card) => (
          <div key={card.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600">
                  {card.type} ending in {card.lastFour}
                </p>
                <p className="text-sm text-gray-500">{card.holder}</p>
              </div>
              <Image src={card.logo} alt="Card Logo" width={40} height={40} />
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between text-purple-600 text-sm">
              <button className="hover:underline">Edit</button>
              <button className="hover:underline">Delete</button>
            </div>
          </div>
        ))}
        <div
          className="bg-white shadow-md rounded-lg p-8 w-full h-40 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg"
          onClick={() => router.push("/payments/addCard")}
        >
          <p className="text-2xl">+</p>
          <p className="text-lg font-medium">Add cards and accounts</p>
        </div>
      </div>
    </div>
  );
}
