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

  const [errors, setErrors] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    ccv: "",
  });

  const validateName = (name: string) => {
    return name.trim().length > 0 && /^[a-zA-Z\s]+$/.test(name);
  };

  const validateCardNumber = (cardNumber: string) => {
    // Remove spaces and non-digit characters
    const digitsOnly = cardNumber.replace(/\D/g, "");
    return digitsOnly.length === 16;
  };

  const validateExpiry = (expiry: string) => {
    // Format should be MM/YY
    const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regex.test(expiry)) return false;

    const [month, year] = expiry.split("/");
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    const expiryYear = parseInt(year, 10);
    const expiryMonth = parseInt(month, 10);

    // Check if card is not expired
    return (
      expiryYear > currentYear ||
      (expiryYear === currentYear && expiryMonth >= currentMonth)
    );
  };

  const validateCCV = (ccv: string) => {
    // CCV must be 3 digits
    return /^\d{3}$/.test(ccv);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces after every 4 digits
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\D/g, "") // Remove non-digits
        .substring(0, 16) // Limit to 16 digits
        .replace(/(\d{4})(?=\d)/g, "$1 "); // Add space after every 4 digits
    }

    // Format expiry as MM/YY
    if (name === "expiry") {
      formattedValue = value
        .replace(/\D/g, "") // Remove non-digits
        .substring(0, 4) // Limit to 4 digits
        .replace(/^(\d{2})(\d{0,2})/, (_, p1, p2) => (p2 ? `${p1}/${p2}` : p1));
    }

    // Limit CCV to 3 digits
    if (name === "ccv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 3);
    }

    setFormData({
      ...formData,
      [name]: formattedValue,
    });

    // Clear error when typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name) ? "" : "Please enter a valid name",
      cardNumber: validateCardNumber(formData.cardNumber)
        ? ""
        : "Card number must be 16 digits",
      expiry: validateExpiry(formData.expiry)
        ? ""
        : "Please enter a valid expiry date (MM/YY)",
      ccv: validateCCV(formData.ccv) ? "" : "CCV must be 3 digits",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const determineCardType = (cardNumber: string) => {
    const firstDigit = cardNumber.replace(/\D/g, "").charAt(0);
    // Simple card type detection based on first digit
    if (firstDigit === "4") return "Visa";
    if (["2", "5"].includes(firstDigit)) return "Mastercard";
    return "Card"; // Default
  };

  const handleAddCard = () => {
    if (validateForm()) {
      // Get the card details to pass to the next page
      const cardDigits = formData.cardNumber.replace(/\D/g, "");
      const lastFour = cardDigits.slice(-4);
      const cardType = determineCardType(cardDigits);
      const holder = formData.name;

      // Save card to localStorage (in a real app, this would go to a database)
      const existingCards = localStorage.getItem("paymentCards");
      const cards = existingCards ? JSON.parse(existingCards) : [];

      const newCard = {
        id: Date.now(), // generate a unique ID
        type: cardType,
        lastFour,
        holder,
        logo: cardType === "Visa" ? "/visa-logo.png" : "/mastercard-logo.png",
      };

      localStorage.setItem("paymentCards", JSON.stringify([...cards, newCard]));

      // Navigate to payment page
      router.push("/user/payments/payment-cards");
    }
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
              className={`mt-1 w-full p-2 border rounded-md ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="John Smith"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card number:
            </label>
            <input
              name="cardNumber"
              type="text"
              className={`mt-1 w-full p-2 border rounded-md ${
                errors.cardNumber ? "border-red-500" : ""
              }`}
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleChange}
            />
            {errors.cardNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
            )}
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Expiry date:
              </label>
              <input
                name="expiry"
                type="text"
                className={`mt-1 w-full p-2 border rounded-md ${
                  errors.expiry ? "border-red-500" : ""
                }`}
                placeholder="MM/YY"
                value={formData.expiry}
                onChange={handleChange}
              />
              {errors.expiry && (
                <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                CCV:
              </label>
              <input
                name="ccv"
                type="text"
                className={`mt-1 w-full p-2 border rounded-md ${
                  errors.ccv ? "border-red-500" : ""
                }`}
                placeholder="123"
                value={formData.ccv}
                onChange={handleChange}
              />
              {errors.ccv && (
                <p className="text-red-500 text-xs mt-1">{errors.ccv}</p>
              )}
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
              Object.values(formData).every((field) => field)
                ? "bg-purple-700 hover:bg-purple-800"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={handleAddCard}
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
}
