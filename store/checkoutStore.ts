import { create } from "zustand";

type Service = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type CheckoutStore = {
  services: Service[];
  addService: (service: Service) => void;
  removeService: (serviceId: number) => void;
  clearServices: () => void;
};

export const useCheckoutStore = create<CheckoutStore>((set) => ({
  services: [],
  addService: (service) =>
    set((state) => ({ services: [...state.services, service] })),
  removeService: (serviceId) =>
    set((state) => ({
      services: state.services.filter((s) => s.id !== serviceId),
    })),
  clearServices: () => set({ services: [] }),
}));
