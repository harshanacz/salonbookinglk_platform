"use client";
import { useState, useEffect } from "react";
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
    {
      id: 2,
      type: "Visa",
      lastFour: "5678",
      holder: "Jane Smith",
      logo: "/visa-logo.png",
    },
  ]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const router = useRouter();

  // Load cards from localStorage on component mount
  useEffect(() => {
    const savedCards = localStorage.getItem("paymentCards");
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards);
      // Merge with default cards, avoiding duplicates
      setCards((prevCards) => {
        const existingIds = new Set(prevCards.map((card) => card.id));
        const newCards = parsedCards.filter(
          (card: Card) => !existingIds.has(card.id)
        );
        return [...prevCards, ...newCards];
      });
    }
  }, []);

  const handleSelectCard = (id: number) => {
    setSelectedCardId(id);
  };

  const handleUseCard = () => {
    if (selectedCardId) {
      const selectedCard = cards.find((card) => card.id === selectedCardId);
      // Pass card info via URL query params
      router.push(
        `/service/[id]/confirm?cardId=${selectedCardId}&cardType=${selectedCard?.type}&cardLastFour=${selectedCard?.lastFour}&cardHolder=${selectedCard?.holder}`
      );
    }
  };

  const handleEditCard = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    // In a real app, we would navigate to an edit page
    alert(`Edit card ${id}`);
  };

  const handleDeleteCard = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection

    // Remove from state
    setCards(cards.filter((card) => card.id !== id));

    // Remove from localStorage
    const savedCards = localStorage.getItem("paymentCards");
    if (savedCards) {
      const parsedCards = JSON.parse(savedCards);
      const updatedCards = parsedCards.filter((card: Card) => card.id !== id);
      localStorage.setItem("paymentCards", JSON.stringify(updatedCards));
    }

    // If the deleted card was selected, clear selection
    if (selectedCardId === id) {
      setSelectedCardId(null);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Select Payment Method</h1>
      <div className="w-full max-w-md space-y-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleSelectCard(card.id)}
            className={`cursor-pointer bg-white shadow-md rounded-lg p-4 border transition ${
              selectedCardId === card.id
                ? "border-purple-600"
                : "border-transparent"
            }`}
          >
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
              <button
                className="hover:underline"
                onClick={(e) => handleEditCard(card.id, e)}
              >
                Edit
              </button>
              <button
                className="hover:underline"
                onClick={(e) => handleDeleteCard(card.id, e)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        <div
          className="bg-white shadow-md rounded-lg p-8 w-full h-40 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg"
          onClick={() => router.push("/user/payments/add-card")}
        >
          <p className="text-2xl">+</p>
          <p className="text-lg font-medium">Add cards and accounts</p>
        </div>

        {/* Show confirm button if card is selected */}
        {selectedCardId && (
          <button
            className="w-full bg-gradient-to-r from-[#8E44AD] to-[#6B0EAD] text-white py-3 rounded-lg mt-4 hover:opacity-90"
            onClick={handleUseCard}
          >
            Use This Card
          </button>
        )}
      </div>
    </div>
  );
}
