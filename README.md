# **BATTLESHIP**

<br/>

> Dominate the seas, one battle at a time <br /> Sink your enemies before they sink you!

<br/>

- [x] 2 Player online game: Create your own game rooms and invite your friends
- [x] Choose your strategy: randomize your ship placement or carefully position your fleet manually!
- [x] Compete for glory: track your performance and rise through the ranks on the leaderboard!

<br/>

![Main Page of BattleShip](https://github.com/user-attachments/assets/148cd638-0392-45d3-aa22-1e47aef3fd96)

![Gameplay screenshot](https://github.com/user-attachments/assets/a6ca17ad-3f78-4fce-ac68-478c815a65da)

### Tech stack

---

- Next.js
- Socket.io
- Java Spring Boot
- Java netty-socket-io
- Firebase

### Battleship Backend

---

Find the backend system code serving Battleship at <a href="https://github.com/Mano-08/server.battleship">server.battleship</a>.

### Local Setup

---

1. Clone Battleship backend

```typescript
git clone https://github.com/Mano-08/server.battleship.git
```

2. Clone Battleship frontend (branch socket-v2)

```typescript
git clone -b https://github.com/Mano-08/battleship.git
```

3. Install packages for Battleship frontend using

```typescript
pnpm install
```

4. Run backend using

```typescript
./gradlew bootRun
```

5. Run frontend using

```typescript
pnpm run dev
```

### Bot&apos;s Coordinate Guesser Logic

---

An intelligent coordinate guesser algorithm has been designed for the robot to predict coordinates that leverages on the previous HIT
coordinates along with predicted direction of ship alignment (vertical or horizontal) where the ship was HIT but not WRECKED.
<br/>
<br/>
Data Structure of the HIT Stack:
<br/>

```
{
 row: number;
 col: number;
 shipId: string;
 direction: "vertical" | "horizontal" | null;
}[]
```

<br/>
The Algorithm is designed based on the following ideology:
<br/>
<br/>
            <ul className="list-disc px-5">
              <li>Choose the cell that is farthest (by Manhattan distance) from any previously bombed cell.
This targets the largest unexplored region of the board, systematically shrinking the search space and increasing the probability of locating ships.</li>
              <li>If it is a HIT, then push it into HIT Stack with direction set to null.</li>
              <li>
                If there is data on HIT Stack, the next guess is around the most recent hit, i.e. the top element of stack.
              </li>
              <li>
                While dropping torpedo around valid coordinates of most recent HIT, if 
                we miss the guess then we would swap predicted direction from vertical to horizontal or vice versa.
              </li>
              <li>
                In case if there are no valid coordinates around the most recent HIT, there again are 2 cases:
                <ol className="list-item">
                  <li>
                    <strong>Case 1:</strong> If there are successive hits on my
                    HIT Stack, then the next guess is along the direction of
                    Successive hits, this way we reach the other end of the
                    ship.
                  </li>
                  <li>
                    <strong>Case 2:</strong> Else we just swap our predicted
                    direction from horizontal to vertical or vertical to
                    horizontal.
                  </li>
                </ol>
              </li>
              <li>
                When a ship is wrecked completely, remove it&apos;s coordinates
                from the HIT Stack.
              </li>
              <li>
                If a ship is wrecked and no more coordinates are present inside
                HIT Stack, go back to step 1.
              </li>
            </ul>
            <br />
            You can find the code of the Coordinate guesser&nbsp;
            <a
              className="underline"
              href="https://github.com/Mano-08/battleship/blob/main/src/helper/guesser.ts"
            >
              here
            </a>
            .
            <br />
            Learn more about this project on&nbsp;<a
              className="underline"
              href="https://github.com/Mano-08/battleship"
            >
              github
            </a>&nbsp;and find me on&nbsp;<a className="underline" href="https://x.com/mano__08">
              twitter
            </a>
            .
