# Octee City

The parody town next to FIA, served at https://zengyixin0205.github.io/octee-city/

- `index.html`: the town (map, bank, jobs, games, Gazette, chat, poll, police report).
- `setup.html`: owner setup (buildings, jobs, terms, holidays). Owner or Control Tower admin only.
- `js/`: the City scripts, plus the shared pieces they need (`cloud.js`, `auth.js`, `store.js`, `published.js`, `crypto.js`, `config.js`, `dom.js`), copied from Octee-airline.

The backend is the Cloudflare Worker `octee-cloud-api`, which still lives in the Octee-airline repo (`cloud/`). Deploy it from there with `cd cloud && npx wrangler deploy`. Nothing in this repo needs a build step.

Accounts and login are the Octee Airlines ones. Both sites are on the same GitHub Pages origin, so a login on one applies to the other.

- `walk.html` and `js/walk.js`: walk around the town as a small icon (WASD or arrow keys, E to go in). The map is hand-placed and not symmetrical. The buildings are drawn in code, not images.
