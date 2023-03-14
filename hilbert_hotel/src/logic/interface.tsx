
export interface GuestDomainMin {
  name: string;
  text: string;
  parameter: [string, string][];
  constraint: string;
  image: string;
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


// checker takes domain, the two assignments
// and provides functions to check the assignments
export type room_result = number[] | "unknown" | ["unsure", number[]];

export abstract class Checker {
  constructor(public domain: GuestDomain,
    public hotelGuestAssignment: ((n: number) => number),
    public busGuestAssignment: ((a: any) => number)) { }

  abstract checkCodomains(): any[] | "unknown";
  abstract checkEmptyRooms(many?: boolean): room_result;
  abstract checkOverbooking(many?: boolean): room_result;
}
