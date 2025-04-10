"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function AddCard() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    ccv: "",
  });

  const isFormValid =
    formData.name &&
    formData.cardNumber &&
    formData.expiry &&
    formData.ccv;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCard = () => {
    if (!isFormValid) {
      alert("Please fill in all the fields.");
      return;
    }

    // You could add more validation here (e.g., card number format, expiry format)

    // Navigate to payment page
    router.push("/user/payments/payment-cards");
  };

  return (
    <div className="min-h-screen bg-purple-50 p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Payment Method</h1>
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg flex flex-col items-center">
        <div className="bg-gray-200 p-4 rounded-md mb-6 w-full flex justify-center">
          <Image
            src="/card-image.png"
            alt="Bank Card"
            width={250}
            height={150}
          />
        </div>
        <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name on card:
            </label>
            <input
              name="name"
              type="text"
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="Esther Howard"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card number:
            </label>
            <input
              name="cardNumber"
              type="text"
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="1234-5678-9012-3456"
              value={formData.cardNumber}
              onChange={handleChange}
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Expiry date:
              </label>
              <input
                name="expiry"
                type="text"
                className="mt-1 w-full p-2 border rounded-md"
                placeholder="MM / YY"
                value={formData.expiry}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                CCV:
              </label>
              <input
                name="ccv"
                type="text"
                className="mt-1 w-full p-2 border rounded-md"
                placeholder="•••"
                value={formData.ccv}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Image
              src="/visa-mastercard-logo.png"
              alt="Card Logos"
              width={80}
              height={40}
            />
          </div>
          <button
            type="button"
            className={`w-full text-white py-2 rounded-md mt-4 ${
              isFormValid
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleAddCard}
            disabled={!isFormValid}
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
}
