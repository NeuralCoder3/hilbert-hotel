import { hotelGuestEnumerator, roomConstraint } from './constants';
import { Checker, GuestDomain } from './interface';

export class EnumerationChecker extends Checker {

  private hotelGuests: number[];
  private busGuests: any[];

  constructor(domain: GuestDomain,
    hotelGuestAssignment: ((n: number) => number),
    busGuestAssignment: ((a: any) => number),
    public bound: number = 100
  ) {
    super(domain, hotelGuestAssignment, busGuestAssignment);

    // the constraints are enforced by the enumerator
    this.hotelGuests = hotelGuestEnumerator(bound);
    this.busGuests = domain.enumerator(bound);
  }

  checkCodomains(): any {
    for (const hotelGuest of this.hotelGuests) {
      if (!roomConstraint(this.hotelGuestAssignment(hotelGuest))) {
        return hotelGuest;
      }
    }
    for (const busGuest of this.busGuests) {
      if (!roomConstraint(this.busGuestAssignment(busGuest))) {
        return busGuest;
      }
    }
    return null;
  }

  checkEmptyRooms(many?: boolean | undefined): number[] | null {

    // can not check (order might be reversed) => 
    // TODO: under or over approximate?
    // under approximation: we can say nothing about empty rooms
    return null;
    // over approximation: assume that the first bound/10 rooms are non-empty (requires bound to be large and assignment to be close to linear)
    // throw new Error('Method not implemented.');
  }

  checkOverbooking(many?: boolean | undefined): number[] | null {
    let bookedRooms = new Set<number>();
    let overbookedRooms = new Set<number>();
    for (const hotelGuest of this.hotelGuests) {
      const room = this.hotelGuestAssignment(hotelGuest);
      if (bookedRooms.has(room)) {
        overbookedRooms.add(room);
      }
      bookedRooms.add(room);
    }
    for (const busGuest of this.busGuests) {
      const room = this.busGuestAssignment(busGuest);
      if (bookedRooms.has(room)) {
        overbookedRooms.add(room);
      }
      bookedRooms.add(room);
    }
    const overbooked = Array.from(overbookedRooms);
    if (overbooked.length === 0) {
      return null;
    }
    return overbooked;
  }

};
