import { Checker, GuestAssignment, GuestDomain, room_results } from "./interface";
const { z3_init } = require('z3-solver');

export class SMTChecker extends Checker {

  constructor(
    domain: GuestDomain,
    hotelGuestAssignment: ((n: number) => number),
    busGuestAssignment: ((a: any) => number)
  ) {
    super(domain, hotelGuestAssignment, busGuestAssignment);
  }

  private Z3: any;
  private Context: any;

  async init() {
    // const {
    //   _Z3, // Low-level C-like API
    //   _Context, // High-level Z3Py-like API
    // } = await z3_init();
    // this.Context = _Context;
    // this.Z3 = _Z3;


    // const { Solver, Int, And } = new Context('main');

    // const x = Int.const('x');

    // const solver = new Solver();
    // solver.add(And(x.ge(0), x.le(9)));
    // console.log(await solver.check());
    // sat
  }

  checkCodomains(): GuestAssignment[] | "unknown" {
    throw new Error("Method not implemented.");
  }
  checkEmptyRooms(many?: boolean | undefined): room_results {
    throw new Error("Method not implemented.");
  }
  checkOverbooking(many?: boolean | undefined): room_results {
    throw new Error("Method not implemented.");
  }

}
