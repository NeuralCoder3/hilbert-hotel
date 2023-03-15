import { TextField, Button, Grid, InputLabel, NativeSelect } from '@material-ui/core';
import './App.css';
import React, { useEffect } from 'react';
import { guest_selection, guest_to_string } from './logic/constants';
import { GuestAssignment, GuestDomain, TextPosition, get_parameter_code, get_parameter_text, get_sample } from './logic/interface';
import { EnumerationChecker } from './logic/enumeration_checker';
import hotel_image from './img/hotel.png';
import domain_issue_image from './img/invalid.png';
import empty_room_image from './img/empty.png';
import overbooked_image from './img/overbooked.png';
import { domainIssueText, emptyRoomText, overbookedText } from './logic/constants';
import { SMTChecker } from './logic/smt_checker';
import { init } from 'z3-solver';

function App() {


  useEffect(() => {
    async function _aux() {
      const { Context } = await init();

      // console.log(Context);
      // console.log(Context("main"));

      const { Solver, Int, And, ToInt } = Context('main');

      const x = Int.const('x');

      console.log(Solver);
      console.log(And);
      console.log(x);
      console.log(Int.val(0));
      console.log(x.eq(0));
      // console.log(x.ge(Int.val(0)));
      const solver = new Solver();
      // solver.add(And(x.ge(0), x.le(9)));
      // console.log(await solver.check());
      // sat
    }
    _aux();
  }, []);

  const get_domain = (name: string) => guest_selection.find((guest) => guest.name === name) as GuestDomain;

  const [guests, setGuests] = React.useState<GuestDomain>(get_domain("nat"));
  const [hotelGuestString, setHotelGuestString] = React.useState<string>('');
  const hotelGuestAssignment = React.useRef<((n: number) => number)>();
  const [hotelGuestAssignmentError, setHotelGuestAssignmentError] = React.useState<boolean>(true);

  const [busGuestString, setBusGuestString] = React.useState<string>('');
  // a state does not work due to iteration issues for multi parameter functions (and is not the right way to do it anyway)
  const busGuestAssignment = React.useRef<((a: any) => number)>();
  const [busGuestAssignmentError, setBusGuestAssignmentError] = React.useState<boolean>(true);


  const checkFunction = function <T, U>(prefix: string, f_body: string, test_sample: T): ((n: T) => U) | null {
    const f_str = prefix + f_body;
    // console.log(f_str);
    if (f_str === undefined)
      return null;
    try {
      // eslint-disable-next-line
      const f = eval(f_str) as (n: T) => U;
      if (f === undefined)
        return null;
      // console.log("f", f);
      // console.log("test sample: ", test_sample);
      const test_result = f(test_sample);
      // console.log("result: " + test_result);
      // console.log("type: " + typeof test_result);
      // TODO: generalize to U (null, undef, ... do not work) (maybe use codom sample)
      if (typeof test_result === "number") {
        return f;
      }
      return null;
    } catch (e) {
      // console.log("Error: " + e);
      return null;
    }
  };

  useEffect(() => {
    const assignment = checkFunction<number, number>("(n) => ", hotelGuestString, 0);
    setHotelGuestAssignmentError(assignment === null);
    if (assignment === null) {
      hotelGuestAssignment.current = undefined;
      return;
    }
    hotelGuestAssignment.current = assignment;
  }, [hotelGuestString, guests]);

  useEffect(() => {
    const assignment = checkFunction<any, number>("(" + get_parameter_code(guests) + ") => ", busGuestString, get_sample(guests));
    setBusGuestAssignmentError(assignment === null);
    if (assignment === null) {
      busGuestAssignment.current = undefined;
      return;
    }
    busGuestAssignment.current = assignment;
  }, [busGuestString, guests]);

  const [domainIssues, setDomainIssues] = React.useState<GuestAssignment[]>([]);
  const [emptyRooms, setEmptyRooms] = React.useState<number[]>([]);
  const [overbookedRooms, setOverbookedRooms] = React.useState<number[]>([]);
  const trimCount = 10;

  const checkAssignment = (
    hotelGuestAssignment: ((n: number) => number),
    busGuestAssignment: ((n: any) => number),
    guests: GuestDomain
  ) => {
    console.log("hotelGuestAssignment", hotelGuestAssignment);
    console.log("busGuestAssignment", busGuestAssignment);
    console.log("guests", guests);

    const checker = new EnumerationChecker(guests, hotelGuestAssignment, busGuestAssignment, 1000, true);

    console.log("Check domain");
    const invalid_rooms = checker.checkCodomains();
    console.log("Domain check result: ", invalid_rooms);
    if (invalid_rooms !== "unknown" && invalid_rooms.length > 0) {
      // TODO: fix issue with strict mode not updating domain issue (and logging invalid_rooms as object of length 1 without content)
      console.log("Domain issues: ", invalid_rooms, typeof invalid_rooms, invalid_rooms.length);
      console.log("Element 0", invalid_rooms[0]);
      setDomainIssues(invalid_rooms);
      setEmptyRooms([]);
      setOverbookedRooms([]);
      return;
    }

    console.log("Check empty rooms");
    const empty_rooms_check = checker.checkEmptyRooms();
    if (empty_rooms_check !== "unknown") {
      setEmptyRooms(empty_rooms_check.rooms);
    }
    console.log("Empty rooms check result: ", empty_rooms_check);

    console.log("Check overbooking");
    const overbooking_check = checker.checkOverbooking();
    if (overbooking_check !== "unknown") {
      setOverbookedRooms(overbooking_check.rooms);
    }
    console.log("Overbooking check result: ", overbooking_check);
  };

  const clickAssign = () => {
    if (hotelGuestAssignment.current === undefined || hotelGuestAssignmentError) {
      alert("Please enter a valid assignment for the hotel guests.");
      return;
    }
    if (busGuestAssignment.current === undefined || busGuestAssignmentError) {
      alert("Please enter a valid assignment for the bus guests.");
      return;
    }
    checkAssignment(hotelGuestAssignment.current, busGuestAssignment.current, guests);
  };

  const renderImage = (image: string, textpositions: TextPosition[], text: string[]) => {
    return (<div
      style={{
        WebkitBoxAlign: 'center',
        WebkitBoxPack: 'center',
        display: '-webkit-box',
        width: '100%',
      }}
    >
      <div style={{
        position: 'relative',
        textAlign: 'center',
        justifyContent: 'center',
        width: 'fit-content',
      }}>
        <div
          style={{
          }}
        >
          <img src={image} alt="domain issue" />
        </div>
        {
          textpositions.map((textposition, i) =>
            <div key={i}
              style={{
                position: 'absolute',
                top: textposition.y + "px",
                left: textposition.x + "px",
                color: 'black',
                fontSize: textposition.fontSize + 'px',
                transform: "translate(-50%, -50%)",
                rotate: (-textposition.angle) + 'deg',
                fontFamily: "xkcd"
              }}>
              {text[i]}
            </div>
          )
        }
      </div>
    </div>);
  };

  const surrounding_rooms = (room: number, middleCount: number = 0) => {
    const rooms = [];
    if (room > 0) {
      rooms.push((room - 1).toString());
    } else {
      // rooms.push("Office");
      rooms.push("");
    }
    for (let i = 0; i < middleCount; i++) {
      rooms.push(room.toString());
    }
    rooms.push((room + 1).toString());
    return rooms;
  };


  return (
    <div className="App">
      <h1>Hilbert Hotel</h1>
      <p
        style={{
          margin: "auto",
          width: "80%",
          textAlign: "left",
        }}
      >
        You are the manager of the Hilbert In. <br />
        The hotel has an infinite number of rooms and frequently receives guests. <br />
        As nobody ever wants to leave, the hotel is always full. <br />
        Your task is to give every guest a new room and also assign incoming guests to rooms. <br />
        To do so, give a function f(n) that assigns the guest with room number n to a room f(n). <br />
        For the incoming guests, provide a function g(a) that assigns the guest a goes to room g(a). <br />
        <br />
        Due to space restrictions, the rooms are quite small. Each room can only hold one guest. <br />
        To ensure a good statistic, you want to assign the guests such that no room stays empty. <br />
      </p>
      <div style={{ marginTop: '20px' }}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <InputLabel variant='standard' htmlFor="guests_count">Guests</InputLabel>
            <NativeSelect
              value={guests.name}
              onChange={(e) => setGuests(get_domain(e.target.value))}
              style={{ width: '80%' }}
              inputProps={{
                name: 'guests',
                id: 'guests_count',
              }}
            >
              {
                guest_selection.map((guest) => (
                  <option key={guest.name} value={guest.name}>{guest.text}</option>
                ))
              }
            </NativeSelect>
          </Grid>
          <Grid item xs={12}>
            <TextField id="hotel_guests" label="Hotel guest assignment f(n) :=" variant="outlined"
              value={hotelGuestString}
              onChange={(e) => setHotelGuestString(e.target.value)}
              error={hotelGuestAssignmentError}
              style={{ width: '80%' }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField id="bus_guests" label={"Bus guest assignment g(" + get_parameter_text(guests) + ") :="} variant="outlined"
              value={busGuestString}
              onChange={(e) => setBusGuestString(e.target.value)}
              error={busGuestAssignmentError}
              style={{ width: '80%' }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary"
              onClick={clickAssign}
            >
              Assign Rooms
            </Button>
          </Grid>
        </Grid>
      </div >
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <img src={guests.image} alt="domain" />
        </Grid>
        <Grid item xs={6}>
          <img src={hotel_image} alt="hotel" />
        </Grid>
      </Grid>
      {
        domainIssues.length > 0 &&
        <div>
          <h2 style={{
            fontFamily: "xkcd",
          }}
          >Assignment Issues</h2>
          {renderImage(domain_issue_image, domainIssueText, [domainIssues[0].room.toString()])}
          <p>
            The following issues were found in the domains: &nbsp;
            <span style={{
              fontFamily: "xkcd",
            }}
            >
              {domainIssues.splice(0, trimCount).map((assignment) => guest_to_string(guests, assignment.guest) + " -> " + assignment.room).join(", ")}
              {domainIssues.length > trimCount && ", ..."}
            </span>
          </p>
        </div>
      }
      {
        emptyRooms.length > 0 ?
          (<div>
            <h2 style={{
              fontFamily: "xkcd",
            }}
            >Empty Rooms</h2>
            {renderImage(empty_room_image, emptyRoomText, surrounding_rooms(emptyRooms[0], 0))}
            <p>
              The following rooms are empty: &nbsp;
              <span style={{
                fontFamily: "xkcd",
              }}
              >
                {emptyRooms.splice(0, trimCount).join(", ")}
                {emptyRooms.length > trimCount && ", ..."}
              </span>
            </p>
          </div>)
          :
          (domainIssues.length === 0 && <div>You did a great job! All rooms are occupied.</div>)
      }
      {
        overbookedRooms.length > 0 ?
          (<div>
            <h2 style={{
              fontFamily: "xkcd",
            }}
            >Empty Rooms</h2>
            {renderImage(overbooked_image, overbookedText, surrounding_rooms(overbookedRooms[0], 3))}
            <p>
              The following rooms are overbooked: &nbsp;
              <span style={{
                fontFamily: "xkcd",
              }}
              >
                {overbookedRooms.splice(0, trimCount).join(", ")}
                {overbookedRooms.length > trimCount && ", ..."}
              </span>
            </p>
          </div>)
          :
          (domainIssues.length === 0 && <div>You did a great job! No room is overbooked.</div>)
      }

    </div >
  );
}

export default App;
