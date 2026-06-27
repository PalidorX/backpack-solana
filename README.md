# Affix Brawlers (working title)

A spatial auto-battler in the spirit of **Backpack Battles**, fused with **Diablo-style
random affix rolls**, designed to grow into a **Solana** blockchain game. This repo starts
as a **mobile-first PWA** prototype — *game-first, chain-later*.

## Play it
- **On your phone:** open the deployed URL, then use the browser menu → **Add to Home Screen**.
  It installs as a standalone app (its own icon, no browser chrome) and works offline.
- **On desktop:** just open `index.html` in a browser. No build step, no dependencies.

### Mobile interaction
- **Drag** an item (finger or mouse) from the shop onto the grid to buy + place it.
- **Drag** a placed item to move it, or onto the **🗑️ salvage** zone to sell it for 1💰.
- **Tap** any item for an info sheet (stats, affixes, seed).

The whole thing is built on **Pointer Events**, so the same code path drives touch and mouse.
It's a PWA: `manifest.webmanifest` + a service worker (`sw.js`) cache the shell for offline use.

## The pitch

> A spatial auto-battler where every item is a **base type + a randomly-rolled set of
> affixes**. The meta-game is hunting, rolling, and combining loot into a synergistic bag.
> Because each rolled item is unique, items map naturally onto **on-chain NFTs** whose
> affixes are verifiable attributes.

### Why these two genres combine well
- **Backpack Battles** gives the *spatial puzzle* (Tetris-shaped items on a grid, adjacency
  synergies) and the *async auto-battler* loop (assemble a bag, fight a snapshot of another
  player's bag).
- **Diablo** gives the *loot chase*: the same base item rolls different affixes at different
  tiers, so "did I roll a god item?" becomes the dopamine engine.

### Why Solana
- Cheap + fast transactions make per-item mints and frequent trades viable (Ethereum gas
  would kill this loop).
- **Compressed NFTs** (Metaplex Bubblegum) let you mint millions of loot items for fractions
  of a cent — essential when every drop is an NFT.
- The one hard part is **provably-fair randomness**: affix rolls must use a VRF
  (Switchboard) or commit-reveal, or players will assume the house cheats.

## Game structure (current build)
Two PvE modes selected from a home screen; gold and your item collection persist (localStorage).

**Three zones + economy**
- **Shop** (slide-up sheet): items have a **Buy** button → purchases go to your **Inventory**.
  Every shop/inventory item shows a mini **shape preview** of the cells it occupies.
- **Inventory**: owned-but-unequipped items. **Drag** one onto the **field** to equip.
- **Equipped field**: your battle grid. Drag items to reposition, or back to inventory to unequip.
- **Sell dock**: drag any item (from inventory *or* field) onto it to sell for `ceil(cost / 2)`.

**Modes**
- **⛰️ Endless Tower** — infinite escalating floors; shop/sell/re-equip between fights; tracks best
  floor; one loss ends the climb but gold/loot persist. No blessings (pure build optimization).
- **🗝️ Daily Dungeon** — the roguelike mode. 10 floors, boss on floor 10, depth-scaled rewards.
  - **Shared daily seed**: the whole dungeon is generated from today's date — same run for everyone,
    leaderboard-ready, and a direct stand-in for an on-chain VRF daily seed.
  - **Blessings**: after each cleared floor, pick **1 of 3** run-only relics (Berserk, Fleet,
    Vampiric, Midas, …) that stack over the run and vanish when it ends.
  - **Permadeath + banked rewards**: one life; rewards scale with the floor reached; the boss is
    the jackpot.
  - **Slay-the-Spire map**: the dungeon is a branching node map (seeded). Node types — ⚔️ Battle,
    ☠️ Elite (tougher, drops a gem + Blessing), 🛒 Shop, 💎 Treasure, ❓ Event (a choice dilemma),
    🔥 Campfire (pick a Blessing), 👑 Boss. You choose your route, trading risk for reward.

## Combat depth — solving the matchup (PvE)
Decisions in the prep phase are meant to *be* the gameplay. Two layers:
- **Damage types vs defenses (granular, always on):** weapons deal **physical** 🗡️ or **magic** 🪄
  (the "flame" affix adds magic on top). **Armor** 🛡️ mitigates physical; **resistance** 🔮 mitigates
  magic; the **pierce** affix ignores a % of armor. So you build to exploit what the enemy is weak to.
- **Archetype triangle (soft, ±15%):** every bag is auto-classified **Tank / Burst / DPS** from its
  stats. **Tank beats Burst beats DPS beats Tank.** Countering the foe's archetype gives a moderate
  combat swing — readable, not coin-flippy.
- **Scouting (PvE):** the upcoming opponent's full bag, archetype, damage split, and defenses are shown
  in the prep screen *before* you commit, with a hint on what to bring. The Daily Dungeon's shared seed
  makes this a solvable, competitive puzzle. (Scouting is PvE-only by design — it can't apply to PvP.)

## Sockets, gems & directional buffs
- **Sockets:** items roll 0–N sockets, max tied to rarity (common 0 → epic 3). Socket count is part
  of the deterministic `(base, seed)` roll.
- **Gems** drop from battles and appear in the shop. **Standard gems** are flat stat mods (Ruby +dmg,
  Amethyst +crit, Emerald +lifesteal, Citrine −cd, Garnet +armor, Sapphire +resist, Diamond +HP).
  **Rare gems** are special effects:
  - 🩸 **Bloodgem** — +20% lifesteal; once per battle, survive a lethal blow at 25% HP.
  - ⚡ **Stormgem** — every hit arcs for +35% bonus magic damage.
  - 💀 **Executioner's Onyx** — +60% damage to foes >75% HP; executes foes <12% HP.
  - 🌈 **Prism Crystal** — mitigated by the *lower* of the foe's armor/resist (anti-counter).
  - ⏳ **Chrono Shard** — every 3rd strike is instant.
- **Blacksmith** (home screen): socket a gem into an open slot, destroy a socketed gem to free the
  slot, or **reroll an affix** — gamble gold for a fresh random affix + tier (cost rises with each
  reroll on that item). Operates on your permanent collection (not mid-run).
- **Directional buffers:** Whetstone (+30% dmg) and Talisman (−18% cd) buff the item their **arrow**
  points at — tap on the field to rotate the aim. Position and orientation matter, not just adjacency.

## Core gameplay loop
1. **Acquire** — spend currency/mats to roll an item: base type chosen, then N affixes roll
   from a weighted, tiered pool. → (later) mints a loot NFT.
2. **Build** — drag items into the grid backpack. Solve the spatial puzzle; exploit adjacency
   synergies; commit to an archetype.
3. **Battle** — auto-resolve vs. another player's saved bag. Deterministic given both bags +
   a seed, so the result is verifiable.
4. **Reward** — win → currency + crafting mats + ladder points, which feed back into step 1.
5. **Sink & churn** — re-roll affixes, salvage junk into mats, or trade on a marketplace.

## What the prototype currently demonstrates
- Seeded **affix-roll generator** (`rollItem`) — base type + weighted/tiered affixes. The
  seed is shown on each item and is the swap point for an on-chain VRF.
- **Grid backpack** with drag-and-drop, item shapes, fit-checking, and salvage-on-drop-out.
- **Adjacency synergies** (Whetstone buffs adjacent weapons; Mana Gem cuts adjacent cooldowns).
- **Deterministic auto-battle** resolver with cooldowns, crits, lifesteal, block, thorns, heals.
- **Round economy**: shop, rerolls, income, win/loss rewards.

## Roadmap to chain
- **Phase 1 (now):** prove the loop is fun, fully client-side. ✅ prototype in `index.html`.
- **Phase 2:** persistence + async PvP vs. saved bags; mock wallet/inventory abstraction so the
  Solana swap is clean.
- **Phase 3:** Solana integration — Switchboard VRF for rolls, Metaplex compressed-NFT mints
  for items, on-chain bag snapshots for verifiable battles, and a marketplace.

## Design notes for the data model
An item is fully described by `{ base, rarity, affixes:[{id,tier,value}], seed }`. Combat
stats are *derived* from that tuple at battle time, so the canonical on-chain record stays
tiny (base id + seed is enough to reproduce the full item deterministically).
