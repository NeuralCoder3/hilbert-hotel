import { TextField, Button, Grid, Select, InputLabel, NativeSelect } from '@material-ui/core';
import './App.css';
import React, { useEffect } from 'react';
import { guest_selection, guest_to_string } from './logic/constants';
import { Guest, GuestAssignment, GuestDomain, domain_to_string, get_parameter_code, get_parameter_text, get_sample } from './logic/interface';
import { EnumerationChecker } from './logic/enumeration_checker';
import hotel_image from './img/hotel.png';
import domain_issue_image from './img/invalid.png';
import empty_room_image from './img/empty.png';
import overbooked_image from './img/overbooked.png';
import { domainIssueText, emptyRoomText, overbookedText } from './logic/constants';

function App() {
  const get_domain = (name: string) => guest_selection.find((guest) => guest.name === name) as GuestDomain;

  const [guests, setGuests] = React.useState<GuestDomain>(get_domain("nat"));
  const [hotelGuestString, setHotelGuestString] = React.useState<string>('');
  // const [hotelGuestAssignment, setHotelGuestAssignment] = React.useState<((n: number) => number) | undefined>(undefined);
  const hotelGuestAssignment = React.useRef<((n: number) => number)>();
  const [hotelGuestAssignmentError, setHotelGuestAssignmentError] = React.useState<boolean>(true);

  const [busGuestString, setBusGuestString] = React.useState<string>('');
  // a state does not work due to iteration issues for multi parameter functions (and is not the right way to do it anyway)
  // const [busGuestAssignment, setBusGuestAssignment] = React.useState<((n: any) => number) | undefined>(undefined);
  const busGuestAssignment = React.useRef<((a: any) => number)>();
  const [busGuestAssignmentError, setBusGuestAssignmentError] = React.useState<boolean>(true);


  const checkFunction = function <T, U>(prefix: string, f_body: string, test_sample: T): ((n: T) => U) | null {
    const f_str = prefix + f_body;
    // console.log(f_str);
    if (f_str === undefined)
      return null;
    try {
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
    // if (hotelGuestString === '') {
    //   setHotelGuestAssignmentError(false);
    //   return;
    // }
    const assignment = checkFunction<number, number>("(n) => ", hotelGuestString, 0);
    setHotelGuestAssignmentError(assignment === null);
    if (assignment === null) {
      // setHotelGuestAssignment(undefined);
      hotelGuestAssignment.current = undefined;
      return;
    }
    // setHotelGuestAssignment(assignment);
    hotelGuestAssignment.current = assignment;
  }, [hotelGuestString, guests]);

  useEffect(() => {
    // if (busGuestString === '') {
    //   setBusGuestAssignmentError(false);
    //   return;
    // }
    const assignment = checkFunction<any, number>("(" + get_parameter_code(guests) + ") => ", busGuestString, get_sample(guests));
    setBusGuestAssignmentError(assignment === null);
    if (assignment === null) {
      busGuestAssignment.current = undefined;
      return;
    }
    // setBusGuestAssignment(assignment);
    busGuestAssignment.current = assignment;
  }, [busGuestString, guests]);

  // const [domainIssues, setDomainIssues] = React.useState<[string, number][]>([["ABC", 42]]);
  const [domainIssues, setDomainIssues] = React.useState<GuestAssignment[]>([]);
  const [emptyRooms, setEmptyRooms] = React.useState<number[]>([]);
  const [overbooking, setOverbooking] = React.useState<number[]>([]);
  const trimCount = 10;

  const checkAssignment = (
    hotelGuestAssignment: ((n: number) => number),
    busGuestAssignment: ((n: any) => number),
    guests: GuestDomain
  ) => {
    console.log("hotelGuestAssignment", hotelGuestAssignment);
    console.log("busGuestAssignment", busGuestAssignment);
    console.log("guests", guests);

    // setDomainIssues([]);
    // setEmptyRooms([]);
    // setOverbooking([]);

    const checker = new EnumerationChecker(guests, hotelGuestAssignment, busGuestAssignment, 1000);

    console.log("Check domain");
    const invalid_rooms = checker.checkCodomains();
    console.log("Domain check result: ", invalid_rooms);
    if (invalid_rooms !== "unknown" && invalid_rooms.length > 0) {
      console.log("Domain issues: ", invalid_rooms, typeof invalid_rooms, invalid_rooms.length);
      console.log("Element 0", invalid_rooms[0]);
      // const text_issues: [string, number][] = invalid_rooms.map(([issue, room]: [any, number]) => [domain_to_string(guests, issue), room]);
      // const text_issues: [string, number][] = invalid_rooms.map(([issue, room]: [any, number]) => [issue.toString(), room]);
      // const text_issues: [string, number][] = invalid_rooms.map((assignment: GuestAssignment) => ["A", 42]);
      // console.log("Text issues: ", text_issues, typeof text_issues, text_issues.length);
      // setDomainIssues(text_issues);
      setDomainIssues(invalid_rooms);
      // setDomainIssues((prev) => {
      //   console.log("set domain issues", prev, invalid_rooms);
      //   // return text_issues;
      //   return invalid_rooms;
      // });
      setEmptyRooms([]);
      setOverbooking([]);
      return;
    }

    console.log("Check empty rooms");
    const empty_rooms_check = checker.checkEmptyRooms();
    console.log("Empty rooms check result: ", empty_rooms_check);

    console.log("Check overbooking");
    const overbooking_check = checker.checkOverbooking();
    console.log("Overbooking check result: ", overbooking_check);
  };

  const clickAssign = () => {
    // console.log("hotelGuestAssignment", hotelGuestAssignment.current);
    // console.log("busGuestAssignment", busGuestAssignment.current);
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

  console.log("render");
  console.log("domainIssues:", domainIssues.length > 0, domainIssues);

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
      {/* domain image on the left, hotel image on the right */}
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <img src={guests.image} alt="domain" />
        </Grid>
        <Grid item xs={6}>
          <img src={hotel_image} alt="hotel" />
        </Grid>
      </Grid>
      {/* {domainIssues.join(", ") === "" && emptyRooms.join(", ")} */}
      {
        domainIssues.length > 0 &&
        <div>
          <h2 style={{
            fontFamily: "xkcd",
          }}
          >Assignment Issues</h2>
          {/* <img src={domain_issue_image} alt="domain issue" /> */}
          <div
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
              // left: "50 %",
              // transform: "translateX(-50 %)",
            }}>
              <div
                style={{
                }}
              >
                <img src={domain_issue_image} alt="domain issue" />
              </div>
              {
                domainIssueText.map((textposition, i) =>
                  <div key={i}
                    style={{
                      position: 'absolute',
                      top: textposition.y + "px",
                      left: textposition.x + "px",
                      color: 'black',
                      fontSize: textposition.fontSize + 'px',
                      transform: "translate(-50%, -50%)",
                      rotate: -textposition.angle + 'deg',
                      fontFamily: "xkcd"
                    }}>
                    {([domainIssues[0].room])[i]}
                  </div>
                )
              }
            </div>
          </div>
          <p>
            The following issues were found in the domains: &nbsp;
            <span style={{
              fontFamily: "xkcd",
            }}
            >
              {/* <ul>
                {
                  domainIssues.splice(0, trimCount).map(([issue, room], i) =>
                    <li key={i}>
                      {issue} {"->"} {room}
                    </li>
                  )
                }
                {domainIssues.length > trimCount && <li>...</li>}
              </ul> */}
              {domainIssues.splice(0, trimCount).map((assignment) => guest_to_string(guests, assignment.guest) + " -> " + assignment.room).join(", ")}
              {domainIssues.length > trimCount && ", ..."}
            </span>
          </p>
        </div>
      }
    </div >
  );
}

export default App;
