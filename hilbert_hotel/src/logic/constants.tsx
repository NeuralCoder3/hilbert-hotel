import { GuestDomain } from "./interface";

export const guest_selection: GuestDomain[] = [
  {
    name: "1",
    text: "1 (a single guest)",
    parameter: "n",
    domain: "number",
    parameter_text: "n",
    constraint: "0<=n && n<=0",
    sample: 0,
    enumerator: (_) => {
      return [0];
    }
  },
  {
    name: "2",
    text: "2 (two guests)",
    parameter: "n",
    domain: "number",
    parameter_text: "n",
    constraint: "0<=n && n<=1",
    sample: 0,
    enumerator: (bound) => {
      return [0, 1]
    }
  },
  {
    name: "nat",
    text: "ℕ (an infinite bus)",
    parameter: "n",
    domain: "number",
    parameter_text: "n",
    constraint: "0<=n",
    sample: 0,
    enumerator: (bound) => {
      return Array.from(Array(bound + 1).keys());
    }
  },
  {
    name: "two_nat",
    text: "2ℕ (two infinite buses)",
    parameter: "[b,n]",
    domain: "[number, number]",
    parameter_text: "b,n",
    constraint: "0<=b && b <= 1 && 0<=n",
    sample: [0, 0],
    enumerator: (bound) => {
      return Array.from(Array(bound + 1).keys()).flatMap((n) => [[0, n], [1, n]]);
    }
  },
  {
    name: "pair",
    text: "ℕ×ℕ (infinitely many infinite buses)",
    parameter: "[a,b]",
    domain: "[number, number]",
    parameter_text: "a,b",
    constraint: "0<=a && 0<=b",
    sample: [0, 0],
    enumerator: (bound) => {
      return Array.from(Array(bound + 1).keys()).flatMap((a) => Array.from(Array(bound + 1).keys()).map((b) => [a, b]));
    }
  },
];

export const hotelGuestEnumerator = (bound: number) => {
  return Array.from(Array(bound + 1).keys());
};

export const roomConstraint = (n: number) => {
  return 0 <= n;
};

export const hotelGuestConstraint = (n: number) => {
  return 0 <= n;
};
