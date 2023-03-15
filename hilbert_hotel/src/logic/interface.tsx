
export interface GuestDomainMin {
  name: string;
  text: string;
  parameter: [string, string][];
  constraint: string;
  image: string;
}

export interface TextPosition {
  x: number;
  y: number;
  angle: number;
  fontSize: number;
}

export interface GuestDomain extends GuestDomainMin {
  enumerator: ((bound: number) => any[]);
}

export function get_parameter_text(domain: GuestDomain): string {
  return domain.parameter.map(([name, type]) => name).join(", ");
}

export function get_parameter_code(domain: GuestDomain): string {
  return "[" + get_parameter_text(domain) + "]";
}

export function domain_to_string(domain: GuestDomain, element: any): string {
  if (domain.parameter.length === 0) {
    return "";
  } else if (domain.parameter.length === 1) {
    return element.toString();
  } else {
    return "(" + element.join(", ") + ")";
  }
}

export function get_sample(domain: GuestDomain): any[] {
  return domain.parameter.map(([name, type]) => {
    if (type === "number") {
      return 0;
    } else if (type === "boolean") {
      return true;
    } else {
      return [];
    }
  });
}


export interface HotelGuest {
  room: number
};
export interface BusGuest {
  seat: number,
};

export type Guest = HotelGuest | BusGuest;

export interface GuestAssignment {
  guest: Guest;
  room: number;
};


// checker takes domain, the two assignments
// and provides functions to check the assignments
export interface _room_results {
  determination: "unsure" | "sure" | "certain";
  rooms: number[];
}
export type room_results = "unknown" | _room_results;

export abstract class Checker {
  constructor(public domain: GuestDomain,
    public hotelGuestAssignment: ((n: number) => number),
    public busGuestAssignment: ((a: any) => number)) { }

  abstract checkCodomains(): GuestAssignment[] | "unknown";
  abstract checkEmptyRooms(many?: boolean): room_results;
  abstract checkOverbooking(many?: boolean): room_results;
}
