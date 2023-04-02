import { init } from "z3-solver";
import { Checker, GuestAssignment, GuestDomain, room_results } from "./interface";
// const { z3_init } = require('z3-solver');
import { init as z3_init } from "z3-solver";

// z3 4.11 works, 4.12 does not

export class SMTChecker extends Checker {

  constructor(
    domain: GuestDomain,
    hotelGuestAssignment: ((n: number) => number),
    busGuestAssignment: ((a: any) => number),
    hotelGuestAssignmentString: string,
    busGuestAssignmentString: string
  ) {
    super(domain, hotelGuestAssignment, busGuestAssignment);
    this.hotelFormula = hotelGuestAssignmentString;
    this.busFormula = busGuestAssignmentString;
    // init();
  }

  private hotelFormula: string;
  private busFormula: string;
  private Z3: any;
  private Context: any;
  private context: any;
  // private Solver: any;
  // private Int: any;
  // private And: any;
  // private Not: any;

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

    const { Z3, Context } = await z3_init();
    console.log("HI");
    this.Context = Context;
    this.Z3 = Z3;

    this.context = new (Context as any)('main');
    console.log("initialized z3");
    console.log(this.context);

    // const x = Int.const('x');
    // const solver = new Solver();
    // // solver.add(x.ge(0));
    // solver.add(And(x.gt(5), x.le(9)));
    // console.log(await solver.check());
    // const model = solver.model();
    // console.log(model);
    // console.log(model.get(x));
    // console.log(model.get(x).value().toString());
  }

  async checkCodomains(): Promise<GuestAssignment[] | "unknown"> {
    // TODO: deduplicate

    const s = new this.context.Solver();
    // TODO: make hotel domain more modular
    const hotel_param = this.context.Int.const("n");
    s.add(hotel_param.ge(0));
    const hotel_formula = this.parseToSMT(this.hotelFormula, { "n": hotel_param });
    s.add(this.context.Not(hotel_formula.ge(0)));

    // TODO: await
    const check = await s.check();
    if (check === "unsat") {
      console.log("Hotel assignment is valid");
    } else if (check === "unknown") {
      console.log("Hotel assignment is unknown");
    } else { // "sat"
      console.log("Hotel assignment is invalid");
      const model = s.model();
      console.log(model);
      const n = model.get(hotel_param).value().toString();
      console.log(n);
      // return [{ "hotel": parseInt(n), "bus": 0 }];
    }

    throw new Error("Method not implemented.");
  }

  async checkEmptyRooms(many?: boolean | undefined): Promise<room_results> {
    throw new Error("Method not implemented.");
  }
  async checkOverbooking(many?: boolean | undefined): Promise<room_results> {
    throw new Error("Method not implemented.");
  }


  constructParams(suffix = ""): { [name: string]: any } {
    let params: { [name: string]: any } = {};
    for (let i = 0; i < this.domain.parameter.length; i++) {
      const [name, type] = this.domain.parameter[i];
      if (type === "number") {
        params[name] = this.context.Int.const(name
          + (suffix === "" ? "" : "_" + suffix));
      }
    }
    return params;
  }

  // TODO: use https://www.npmjs.com/package/math-expressions
  parseToSMT(f: string, params: { [name: string]: any }): any {
    if (params[f] !== undefined) {
      return params[f];
    }
    // number, possibly negative
    if (f.match(/^-?[0-9]+$/)) {
      // return this.context.Int.number(f);
      const v = parseInt(f);
      // console.log(this.context.Int);
      return this.context.Int.val(v);
    }
    throw new Error("Not implemented");
  }

}



