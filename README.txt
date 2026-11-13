FAMILY FEUD — TWO PAGE GAME

FILES
- index.html: Game Display page for the audience and players. It shows team scores, question, revealed answers, round bank, and all three strike indicators. It has no host controls.
- host.html: Host Control Desk. Start a game, set or edit team names, reveal answers, record strikes, switch teams, start a new game, and move to the next question.
- styles.css: Responsive layout for phones, tablets, laptops, and large screens.
- script.js: Shared game logic and live synchronization.

HOW TO RUN
1. Keep all four files in the same folder.
2. Open the folder using a local web server (recommended), for example VS Code Live Server, or run: python -m http.server 8000
3. Open http://localhost:8000/index.html for the Game Display.
4. Open http://localhost:8000/host.html in another tab, window, or screen for the Host Control Desk.
5. On the Host Control Desk, enter team names and click START GAME.

GAME FLOW
- The host clicks a covered answer to reveal it.
- The host clicks WRONG ANSWER / STRIKE for an incorrect response.
- After three strikes, the opposing team gets one steal chance. Reveal any remaining answer to award the round bank to the stealing team. If the steal is wrong, the original team keeps the revealed bank.
- When all answers are revealed, the active team automatically receives the round points.
- Points are awarded once, and NEXT QUESTION becomes available. The game does not move forward automatically; the host must click NEXT QUESTION.
- SWITCH TEAM changes the active team and clears the strikes/steal state for the current question.
- NEW GAME returns the host to setup and resets scores, round, answers, and strikes.

SYNC
The two pages share game state using browser local storage and BroadcastChannel. Open both pages in the same browser and same origin (for example, both on localhost). Opening the files directly with file:// may prevent reliable cross-page synchronization in some browsers, so use a local web server.
