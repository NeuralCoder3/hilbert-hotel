# idea:
from z3 import *

# f(n) = n * 2
# g(n) = If(n <= 3, 5*n, 2*n+1)
# Found overbooked rooms:  {0, 10, 15}
# Found empty rooms:  [1, 7, 3]

# f(n) = n*n
# g(n) = 7*n+1
# Found overbooked rooms:  {64, 1, 36, 169, 841, '...', 400}
# Found empty rooms:  [2, 3, 5, 6, 7, 10, 11, 12, 13, 14, 17, '...']


def f(n):
    # return n * 2
    # return 2 * n
    # return pow(2, n)
    return n*n


def g(n):
    # return 2 * n + 1

    # k = 2 * n + 1
    # return If(k > 10, k + 2, k)
    # return If(n <= 3, 5*n, 2*n+1)
    # return pow(3, n)
    return 7*n+1


def nat_constraint(n):
    return (n >= 0)


def i_constraint(n):
    return nat_constraint(n)
    # return (n >= 0)


i_domain = Int


def domain_check(space, verbose=False):
    fun, domain, constraint, text = space
    s = Solver()
    d = domain('d')
    s.add(constraint(d))
    s.add(Not(nat_constraint(fun(d))))

    if s.check() == sat:
        guest_sym = s.model()[d]
        # assert (type(guest_sym) == IntNumRef)
        # guest = guest_sym.as_long()
        guest = guest_sym
        if verbose:
            print(
                f"{text} assignment is invalid for guest {guest}. Assigned room is {fun(guest)}.")
        return guest
    else:
        return None


def empty_check(space1, space2, found_rooms=[], verbose=False):
    fun1, domain1, constraint1, _ = space1
    fun2, domain2, constraint2, _ = space2

    s = Solver()

    n = Int('n')
    a = domain1('a')
    b = domain2('b')

    s.add(nat_constraint(n))
    s.add(ForAll([a], Implies(constraint1(a), fun1(a) != n)))
    s.add(ForAll([b], Implies(constraint2(b), fun2(b) != n)))

    for room in found_rooms:
        s.add(n != room)

    if s.check() == sat:
        m = s.model()
        empty_room = m[n]
        assert (type(empty_room) == IntNumRef)
        empty_room = empty_room.as_long()
        if verbose:
            print("Found an empty room: ", empty_room)
        return empty_room
    else:
        if verbose:
            print("All rooms are occupied")
        return None


def check_overlap(space1, space2, found_rooms=[], verbose=False):
    fun1, domain1, constraint1, text1 = space1
    fun2, domain2, constraint2, text2 = space2

    s = Solver()
    n = Int('n')
    a = domain1('a')
    b = domain2('b')

    s.add(nat_constraint(n))
    s.add(constraint1(a))
    s.add(constraint2(b))
    if fun1 == fun2:
        s.add(a != b)
    s.add(fun1(a) == n)
    s.add(fun2(b) == n)

    for room in found_rooms:
        s.add(n != room)

    if s.check() == sat:
        model = s.model()
        guest1 = model[a]
        guest2 = model[b]
        room = model[n]
        assert (type(room) == IntNumRef)
        room = room.as_long()
        if verbose:
            print(
                f"{text1} {guest1} and {text2} {guest2} are assigned to room {room}")
        return (guest1, guest2, room)
    else:
        if verbose:
            print(f"No {text1} is assigned to the same room as a {text2}")
        return None


hotel = (f, Int, nat_constraint, "Hotel guest")
bus = (g, i_domain, i_constraint, "Incoming guest")

for space in [hotel, bus]:
    domain_check(space, verbose=True)

# for space1, space2 in [(hotel, hotel), (bus, bus), (hotel, bus)]:
#     check_overlap(space1, space2, verbose=True)

# empty_check(hotel, bus, verbose=True)

overbooked_rooms = set()
for space1, space2 in [(hotel, hotel), (bus, bus), (hotel, bus)]:
    while True:
        overlap = check_overlap(space1, space2, found_rooms=list(
            overbooked_rooms), verbose=False)
        if overlap is None:
            break
        guest1, guest2, room = overlap
        overbooked_rooms.add(room)
        if len(overbooked_rooms) > 5:
            overbooked_rooms.add("...")
            break

if len(overbooked_rooms) > 0:
    print("Found overbooked rooms: ", overbooked_rooms)
else:
    print("No overbooked rooms")


empty_rooms = []
while True:
    empty_room = empty_check(
        hotel, bus, found_rooms=empty_rooms, verbose=False)
    if empty_room is None:
        break
    empty_rooms.append(empty_room)
    if len(empty_rooms) > 10:
        empty_rooms.append("...")
        break

if len(empty_rooms) > 0:
    print("Found empty rooms: ", empty_rooms)
else:
    print("All rooms are occupied")
