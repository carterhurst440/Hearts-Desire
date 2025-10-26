# Heart's Desire Simulator

A lightweight web simulator for the Heart's Desire table game concept. Open
`index.html` in any modern browser to experience the table, place wagers, and
watch the dealer run the shoe with a sleek, Bovada-inspired UI.

## Quick demo

Serve the project locally to test drive the experience:

```bash
npm run demo
```

The script launches a lightweight Node server on
[`http://localhost:3000`](http://localhost:3000); visit that address in your
browser to interact with the simulator.

## How to play

- Click chips to configure your wager, then choose **Start Hand**.
- The dealer reveals cards one at a time. Hearts climb the pay ladder.
- After each heart you may **Withdraw** to take the listed payout or **Press
  (Deal)** to continue.
- Clubs and diamonds are neutral. The hand ends in a loss once four neutrals
  have appeared.
- Any spade instantly loses the wager.
- Drawing the queen of hearts pays 2:1 immediately.
- Capturing five hearts awards the max 100:1 payout.

### Paytable

| Hearts drawn | Payout |
| ------------ | ------ |
| 1            | 1:1    |
| 2            | 3:1    |
| 3            | 10:1   |
| 4            | 25:1   |
| 5            | 100:1  |
