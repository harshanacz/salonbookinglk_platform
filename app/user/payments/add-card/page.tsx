"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AddCard() {
  const router = useRouter();

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
        <form className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name on card:
            </label>
            <input
              type="text"
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="Esther Howard"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card number:
            </label>
            <input
              type="text"
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="1234-5678-9012-3456"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Expiry date:
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded-md"
                placeholder="MM / YY"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                CCV:
              </label>
              <input
                type="text"
                className="mt-1 w-full p-2 border rounded-md"
                placeholder="•••"
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
            className="w-full bg-purple-700 text-white py-2 rounded-md mt-4 hover:bg-purple-700"
            onClick={() => router.push("/payments")}
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
}
