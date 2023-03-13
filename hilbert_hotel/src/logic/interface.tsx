
export interface GuestDomainMin {
  name: string;
  text: string;
  parameter: string;
  domain: string;
  constraint: string;
}

export interface GuestDomain extends GuestDomainMin {
  parameter_text: string;
  sample: any;
  enumerator: ((bound: number) => any[]);
}



// checker takes domain, the two assignments
// and provides functions to check the assignments

export abstract class Checker {
  constructor(public domain: GuestDomain,
    public hotelGuestAssignment: ((n: number) => number),
    public busGuestAssignment: ((a: any) => number)) { }

  abstract checkCodomains(): any | null;
  abstract checkEmptyRooms(many?: boolean): number[] | null;
  abstract checkOverbooking(many?: boolean): number[] | null;
}
