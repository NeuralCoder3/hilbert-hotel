import { hotelGuestEnumerator, roomConstraint } from './constants';
import { Checker, Guest, GuestAssignment, GuestDomain, room_results } from './interface';

export class EnumerationChecker extends Checker {

  private hotelGuests: number[];
  private busGuests: any[];
  private bookedRooms: Set<number> | undefined;
  private overbookedRooms: Set<number> | undefined;

  constructor(domain: GuestDomain,
    hotelGuestAssignment: ((n: number) => number),
    busGuestAssignment: ((a: any) => number),
    private bound: number = 100,
    private assumeLinear: boolean = false
  ) {
    super(domain, hotelGuestAssignment, busGuestAssignment);

    // the constraints are enforced by the enumerator
    this.hotelGuests = hotelGuestEnumerator(bound);
    this.busGuests = domain.enumerator(bound);
  }

  checkCodomains(): GuestAssignment[] | "unknown" {
    for (const hotelGuest of this.hotelGuests) {
      const room = this.hotelGuestAssignment(hotelGuest);
      if (!roomConstraint(room)) {
        return [{ guest: { room: hotelGuest }, room }];
      }
    }
    for (const busGuest of this.busGuests) {
      const room = this.busGuestAssignment(busGuest);
      if (!roomConstraint(room)) {
        return [{ guest: { seat: busGuest }, room }];
      }
    }
    return [];
  }

  computeBookedRooms() {
    if (this.bookedRooms && this.overbookedRooms)
      return;
    this.bookedRooms = new Set<number>();
    this.overbookedRooms = new Set<number>();
    for (const hotelGuest of this.hotelGuests) {
      const room = this.hotelGuestAssignment(hotelGuest);
      if (this.bookedRooms.has(room)) {
        this.overbookedRooms.add(room);
      }
      this.bookedRooms.add(room);
    }
    for (const busGuest of this.busGuests) {
      const room = this.busGuestAssignment(busGuest);
      if (this.bookedRooms.has(room)) {
        this.overbookedRooms.add(room);
      }
      this.bookedRooms.add(room);
    }
  }

  checkEmptyRooms(many?: boolean | undefined): room_results {

    // can not check (order might be reversed) => 
    // TODO: under or over approximate?
    // under approximation: we can say nothing about empty rooms
    // return null;
    // over approximation: assume that the first bound/10 rooms are non-empty (requires bound to be large and assignment to be close to linear)
    // throw new Error('Method not implemented.');
    if (this.assumeLinear) {
      this.computeBookedRooms();
      const check_rooms = Array.from(Array(Math.floor(this.bound / 10)).keys());
      const empty_rooms = check_rooms.filter(room => !this.bookedRooms!.has(room));
      return {
        determination: "unsure", // needs uncertain assumptions
        rooms: empty_rooms
      };
    }
    return "unknown";
  }

  checkOverbooking(many?: boolean | undefined): room_results {
    this.computeBookedRooms();
    const overbooked = Array.from(this.overbookedRooms!);
    return {
      determination: "sure", // as sure as we can be
      rooms: overbooked
    };
  }

};
