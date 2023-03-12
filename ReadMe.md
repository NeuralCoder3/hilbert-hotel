# Hilbert Hotel

The hilbert hotel is a puzzle that teaches about infinite spaces. 
In the puzzle, the player is a hotel manager of an infinite hotel.
The hotel has an infinite number of rooms but each room has only space for one guest.
The standard screnario is that the hotel is full and the player has to find a room new guests.

## Screnarios

- Finite Hotel 
- Infinite Hotel
  - one new guest
  - two new guests
  - n new guests
  - one bus with infinite many new guests
  - two buses with infinite many new guests
  - n buses with infinite many new guests
  - infinite many buses with infinite many new guests

## Concept

There are two types of guests:
- already residing guests (of type `N`)
- new guests (of type `I`)

The player provides two functions:
- `f: N -> N` which maps already residing guests to new rooms
- `g: I -> N` which maps new guests to rooms

The objectives are:
- every guest has a room (totality of `f` and `g`) -- by definition
- no guest is in two rooms (functionality of `f` and `g`) -- by definition
- no room is empty (surjectivity of `f` combined with `g`)
- no room is occupied by two guests (injectivity of `f` combined with `g`)

These properties can be combined into the statement that `h` is a Bijection with
`h: I + N -> N` 
`h (Left i) = g i`
`h (Right n) = f n`

## UI

The player is presented with the problem.
They can input two functions (for instance as programs):

## Encoding

We employ SMT solvers to inspect a solution proposal.

Although the combined formulation via `h` is formally simpler, the encoding of `h` is complex and 
needs additional effort to be destructed by the SMT solver.

Therefore, we encode the problem using `f` and `g` directly.
We use the common technique to encode the negation and either expect
* a satisfying example => counter example that shows that the solution is wrong
* unsatisfiable => the solution is correct (no contradicting example)

### No room is empty

`forall n. (exists i. g i = n) ∨ (exists m. f m = n)`

A counter example is an `n` such that the room `n` is empty.

High level: A `n` such that no guest from `g` or `f` is mapped to `n`.
```
const n
assert(forall i. g i != n)
assert(forall m. f m != n)
``` 


### No room is occupied by two guests

`forall n. 

Here, the direct approach causes to split the formula into three (overlap in f, overlap in g, overlap between f and g) formulas.
However, these formulas are simpler.

Overlap in `f` (same for `g`):
```
const n

const m1
const m2
assert(m1 != m2)
assert(f m1 = n)
assert(f m2 = n)
``` 

Overlap between `f` and `g`:
```
const n

const i
const m
assert(g i = n)
assert(f m = n)
```




