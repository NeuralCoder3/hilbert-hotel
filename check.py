# idea:
from z3 import *
import os
import time

# TODO: reuse solver for different solutions
# TODO: test 2d i_domain
# TODO: sympy equivalence
# TODO: quick check < 1000

# we use unsat and else
# instead of sat
# as for instance pow results in unknown but provides a model


# f(n) = n * 2
# g(n) = If(n <= 3, 5*n, 2*n+1)
# Found overbooked rooms:  {0, 10, 15}
# Found empty rooms:  [1, 7, 3]

# f(n) = n*n
# g(n) = 7*n+1
# Found overbooked rooms:  {64, 1, 36, 169, 841, '...', 400}
# Found empty rooms:  [2, 3, 5, 6, 7, 10, 11, 12, 13, 14, 17, '...']

# IntPair: Type
# mkIntPair (a,b) : IntPair
# fst (p : IntPair) : Int
# snd (p : IntPair) : Int
IntPair, mkIntPair, (fst, snd) = TupleSort('IntPair', (IntSort(), IntSort()))
TwoNat, mkTwoNat, (fst2, snd2) = TupleSort('TwoNat', (BoolSort(), IntSort()))

tuple_sorts = [(IntPair, mkIntPair, (fst, snd)),
               (TwoNat, mkTwoNat, (fst2, snd2))]

# tuple = Datatype('tuple')
# tuple.declare('tuple',('1', IntSort()), ('2', IntSort()), ('3', IntSort()), ('4', IntSort()))
# tuple = tuple.create()


def get_from_model(model, v):

    if v.sort() == IntSort():
        return model[v].as_long()

    for t, mk, (f, s) in tuple_sorts:
        if v.sort() == t:
            p1 = simplify(f(v))
            p2 = simplify(s(v))
            e1 = get_from_model(model, p1)
            e2 = get_from_model(model, p2)
            return (e1, e2)

    return model[v]


def get_vars(v):
    for t, mk, (f, s) in tuple_sorts:
        if v.sort() == t:
            p1 = simplify(f(v))
            p2 = simplify(s(v))
            return get_vars(p1) + get_vars(p2)
    return [v]


def i_domain(name):
    # i_domain = IntPair
    p1 = Int(name + '_1')
    p2 = Int(name + '_2')
    return mkIntPair(p1, p2)
    # return Int(name)


def nat_constraint(n):
    return (n >= 0)


def i_constraint(n):
    # return nat_constraint(n)
    return And(nat_constraint(fst(n)), nat_constraint(snd(n)))


def f(n):
    return n * 2
    # return 2 * n
    # return pow(2, n)
    # return 2**n
    # return n*n


def g(n):
    # return 2 * n + 1

    # k = 2 * n + 1
    # return If(k > 10, k + 2, k)
    # return If(n <= 3, 5*n, 2*n+1)
    # return pow(3, n)
    # return 3**n
    # return 7*n+1

    # for pair
    # return fst(n) * 2 + 1
    # cantor pairing
    i = fst(n)
    j = snd(n)
    # return (i + j) * (i + j + 1) / 2 + j
    # return (i*i+i+2*i*j+3*j+j*j)/2
    return (i + j) * (i + j + 1) + 2*j + 1
    # hopcroft ullman
    # return (i + j - 2)*(i + j - 1)/2 + i


hotel = (f, Int, nat_constraint, "Hotel guest")
bus = (g, i_domain, i_constraint, "Incoming guest")


def check_sat(s):
    out_dir = "queries"
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)
    # write to out_dir/YYYY_MM_DD_HH_MM_SS_i.smt2 for the smallest i such that the file does not exist
    prefix = time.strftime("%Y_%m_%d_%H_%M_%S_")
    i = 0
    while True:
        filename = os.path.join(out_dir, prefix + str(i) + ".smt2")
        if not os.path.exists(filename):
            break
        i += 1
    with open(filename, "w") as f:
        f.write(s.to_smt2())
    return s.check()


def domain_check(space, verbose=False):
    fun, domain, constraint, text = space
    s = Solver()
    d = domain('d')
    s.add(constraint(d))
    s.add(Not(nat_constraint(fun(d))))

    c = check_sat(s)

    if c == unsat:
        return None
    else:
        guest_sym = s.model()[d]
        # assert (type(guest_sym) == IntNumRef)
        # guest = guest_sym.as_long()
        guest = guest_sym
        if verbose:
            print(
                f"{text} assignment is invalid for guest {guest}. Assigned room is {fun(guest)}.")
        return guest


def empty_check(space1, space2, found_rooms=[], verbose=False):
    fun1, domain1, constraint1, _ = space1
    fun2, domain2, constraint2, _ = space2

    s = Solver()

    n = Int('n')
    a = domain1('a')
    b = domain2('b')

    s.add(nat_constraint(n))
    s.add(ForAll(get_vars(a), Implies(constraint1(a), fun1(a) != n)))
    s.add(ForAll(get_vars(b), Implies(constraint2(b), fun2(b) != n)))

    for room in found_rooms:
        s.add(n != room)

    c = check_sat(s)

    if c == unsat:
        if verbose:
            print("All rooms are occupied")
        return None
    else:
        m = s.model()
        empty_room = m[n]
        assert (type(empty_room) == IntNumRef)
        empty_room = empty_room.as_long()
        if verbose:
            print("Found an empty room: ", empty_room)
        return empty_room


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

    c = check_sat(s)

    if c == unsat:
        if verbose:
            print(f"No {text1} is assigned to the same room as a {text2}")
        return None
    else:
        model = s.model()
        room = model[n]
        assert (type(room) == IntNumRef)
        room = room.as_long()
        # return (None, None, room)
        # guest1 = model[a]
        # guest2 = model[b]
        guest1 = get_from_model(model, a)
        guest2 = get_from_model(model, b)
        if verbose:
            print(
                f"{text1} {guest1} and {text2} {guest2} are assigned to room {room}")
        return (guest1, guest2, room)


print("Checking domains")
for space in [hotel, bus]:
    domain_check(space, verbose=True)

print("Checking overlaps")
for space1, space2 in [(hotel, hotel), (bus, bus), (hotel, bus)]:
    check_overlap(space1, space2, verbose=True)

print("Checking emptiness")
empty_check(hotel, bus, verbose=True)

# overbooked_rooms = set()
# for space1, space2 in [(hotel, hotel), (bus, bus), (hotel, bus)]:
#     while True:
#         overlap = check_overlap(space1, space2, found_rooms=list(
#             overbooked_rooms), verbose=False)
#         if overlap is None:
#             break
#         guest1, guest2, room = overlap
#         overbooked_rooms.add(room)
#         if len(overbooked_rooms) > 5:
#             overbooked_rooms.add("...")
#             break


# def list_ints(xs):
#     continues = False
#     if "..." in xs:
#         continues = True
#         xs = [x for x in xs if x != "..."]
#     xs = map(str, sorted(xs))
#     return ", ".join(xs) + ("..." if continues else "")


# if len(overbooked_rooms) > 0:
#     print("Found overbooked rooms: ", list_ints(overbooked_rooms))
# else:
#     print("No overbooked rooms")


# empty_rooms = []
# while True:
#     empty_room = empty_check(
#         hotel, bus, found_rooms=empty_rooms, verbose=False)
#     if empty_room is None:
#         break
#     empty_rooms.append(empty_room)
#     if len(empty_rooms) > 10:
#         empty_rooms.append("...")
#         break

# if len(empty_rooms) > 0:
#     print("Found empty rooms: ", list_ints(empty_rooms))
# else:
#     print("All rooms are occupied")
