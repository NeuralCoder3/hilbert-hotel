import { Guest, GuestDomain, TextPosition, domain_to_string } from "./interface";

import one from "../img/one.png";
import two from "../img/two.png";
import bus from "../img/bus.png";
import two_bus from "../img/two_bus.png";
import inf_bus from "../img/inf_bus.png";

export const guest_selection: GuestDomain[] = [
  {
    name: "1",
    text: "1 (a single guest)",
    parameter: [["n", "number"]],
    constraint: "0<=n && n<=0",
    enumerator: (_) => {
      return [[0]];
    },
    image: one
  },
  {
    name: "2",
    text: "2 (two guests)",
    parameter: [["n", "number"]],
    constraint: "0<=n && n<=1",
    enumerator: (bound) => {
      return [[0], [1]]
    },
    image: two
  },
  {
    name: "nat",
    text: "ℕ (an infinite bus)",
    parameter: [["n", "number"]],
    constraint: "0<=n",
    enumerator: (bound) => {
      return Array.from(Array(bound + 1).keys()).map((n) => [n]);
    },
    image: bus
  },
  {
    name: "two_nat",
    text: "2ℕ (two infinite buses)",
    parameter: [["b", "number"], ["n", "number"]],
    constraint: "0<=b && b <= 1 && 0<=n",
    enumerator: (bound) => {
      return Array.from(Array(bound + 1).keys()).flatMap((n) => [[0, n], [1, n]]);
    },
    image: two_bus
  },
  {
    name: "pair",
    text: "ℕ×ℕ (infinitely many infinite buses)",
    parameter: [["a", "number"], ["b", "number"]],
    constraint: "0<=a && 0<=b",
    enumerator: (bound) => {
      return Array.from(Array(bound + 1).keys()).flatMap((a) => Array.from(Array(bound + 1).keys()).map((b) => [a, b]));
    },
    image: inf_bus
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

export const guest_to_string = (domain: GuestDomain, guest: Guest) => {
  if ("room" in guest) {
    return "Hotelguest " + guest.room.toString();
  } else {
    return "Busguest " + domain_to_string(domain, guest.seat);
  }
};



// image positions and angles

export const domainIssueText: TextPosition[] = [
  {
    x: 340,
    y: 220,
    angle: 0,
    fontSize: 40
  }
];

export const emptyRoomText: TextPosition[] = [
  {
    x: 128,
    y: 500,
    angle: 30,
    fontSize: 25
  },
  {
    x: 830,
    y: 200,
    angle: 25,
    fontSize: 20
  }
];

export const overbookedText: TextPosition[] = [
  {
    x: 120,
    y: 500,
    angle: 30,
    fontSize: 25
  },
  {
    x: 515,
    y: 320,
    angle: 30,
    fontSize: 20
  },
  {
    x: 825,
    y: 200,
    angle: 25,
    fontSize: 15
  },
];
