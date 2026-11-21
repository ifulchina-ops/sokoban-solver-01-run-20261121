# Push-optimal Sokoban solver

[![sokoban-solver-01-run-20261121](https://make.fun/badge/sokoban-solver-01-run-20261121.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121)
[![Rank](https://make.fun/badge/sokoban-solver-01-run-20261121/ifulchina-ops/sokoban-solver-01-run-20261121/rank.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121)
[![Reward](https://make.fun/badge/sokoban-solver-01-run-20261121/ifulchina-ops/sokoban-solver-01-run-20261121/reward.svg)](https://make.fun/bounty/sokoban-solver-01-run-20261121)

An entry for the make.fun bounty [“Build the best Sokoban solver, 21 November 2026”](https://make.fun/bounty/sokoban-solver-01-run-20261121): a push-optimal Sokoban solver. Each level is a hallway with independent rooms off it, so each room is solved on its own with an A* over pushes (admissible box-to-goal assignment heuristic, dead-square and frozen-2×2 pruning). Practice set: optimal push counts on all 5 instances, score 1,000,000. Run with `node main.ts` (Node 22+, no dependencies).
