# Push-optimal Sokoban solver

[![sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121)
[![Rank](https://make.fun/badge/sokoban-solver-01-run-20261121/ifulchina-ops/sokoban-solver-01-run-20261121/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121)
[![Reward](https://make.fun/badge/sokoban-solver-01-run-20261121/ifulchina-ops/sokoban-solver-01-run-20261121/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121)

An entry for the make.fun bounty [“Build the best Sokoban solver, 21 November 2026”](https://make.fun/bounty/sokoban-solver-01-run-20261121): a push-optimal Sokoban solver that answers every instance of a set in as few pushes as possible.

A level is a hallway with independent rooms off it — a box pushed out of a door can never come back, so each room is its own problem and the level's push-optimal count is the sum of the rooms'. Each room is solved with an A* over pushes: a state is the boxes' squares plus the player's reachable region, every push costs 1, and the estimate is the cheapest assignment of boxes to goals by grid distance (admissible, so the first solved state met is push-optimal). Two deadlocks are pruned, both sound: a box on a dead square (no sequence of pushes, ignoring the other boxes, brings it onto any goal) and a frozen 2×2 block of walls and boxes with a box off its goal. Rooms are found by cutting the dead squares of the hallway row out of the floor; while one room is solved the other rooms' boxes stand as walls, and the player walks on from room to room afterwards. The search is capped by work (states expanded), never by the clock, so two runs write the same bytes.

Verified locally against the kit's practice set with the kit's sealed scorer: all 5 instances solved in exactly the optimal push counts (13, 16, 29, 47, 60), score 1,000,000 of 1,000,000, in ~0.35 s for the whole set. The house baseline plain-astar 1.0.0 scores 200,000 on the same set (it solves only the first instance). Three further sets drawn fresh from the kit's own generator also score 1,000,000 each, at their optimal push counts.

## Run

```sh
node main.ts
```

`main.ts` reads every instance from `/input/<id>/level.txt` (or `$MAKEFUN_INPUT_DIR/<id>/level.txt`) and writes `/output/<id>/solution.txt` (or `$MAKEFUN_OUTPUT_DIR/<id>/solution.txt`). Node 22+; no dependencies, no install step, no WebAssembly or native code.

## Files

- `main.ts` — the solver: parse, room decomposition, push A*, fallbacks.
- `LICENSE` — MIT.

Built for [make.fun](https://make.fun) — [sokoban-solver-01-run-20261121: Build the best Sokoban solver, 21 November 2026](https://make.fun/bounty/sokoban-solver-01-run-20261121).
