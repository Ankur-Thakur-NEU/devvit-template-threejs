# BoundaryBash: A Cricket Batting Game for Reddit

## Overview

SixerStrike is an interactive cricket batting game built on Reddit's Developer Platform using Devvit Web and Three.js. Inspired by the popular Tez Shots game from Google Pay India, this app lets Redditors step up to the crease and time their swings to smash sixes. Perfect for the Reddit Hackathon's Daily Games category, it features fresh daily challenges, scoring based on sixers, boosters to extend your inning, and a community leaderboard to drive discussions and competition.

The game emphasizes timing and skill: face incoming deliveries, swing at the right moment, and rack up sixes to hit milestones. Share your high scores in post comments to engage the community—maybe even spark UGC like custom challenges or fan art!

## Features

- **Timing-Based Batting**: Realistic 3D cricket simulation where you tap or click to swing the bat. Perfect timing sends the ball flying for a six!
- **Scoring System**: Earn points primarily through sixes (6 runs each). Track your total runs, sixers count, and streak.
- **Boosters**: Collect boosters by hitting milestones (e.g., every 5 sixes). Use them to continue your inning after getting "out" (missing three deliveries).
- **Milestones**: Aim for epic goals like 6 sixes (unlock a reward animation) or 20 sixes (top-tier achievement with bonus points).
- **Daily Reset**: Scores and challenges refresh daily, encouraging recurring play and fresh content.
- **Leaderboard**: View top scores from the community, tied to Reddit usernames. High scorers can inspire threads and discussions.
- **Reddit Integration**: Embedded as an Interactive Post—play directly in a subreddit, then comment your score to join the conversation.
- **UGC Elements**: Users can submit ideas or images (e.g., custom bat designs) via comments, which could influence future updates.

## How to Play

1. **Start the Game**: Load the Interactive Post in your subreddit. Click "Play" to begin your inning.
2. **Face Deliveries**: Watch the bowler run up and deliver the ball. The ball follows a parabolic path toward the stumps.
3. **Swing the Bat**: Tap (on mobile) or click (on desktop) to swing at the perfect moment:
   - **Perfect Timing**: Smash a six! The ball flies out of the park with crowd cheers.
   - **Good Timing**: Hit a four or boundary.
   - **Poor Timing**: Score 1-3 runs or miss entirely.
   - Miss three times? You're out—unless you use a booster!
4. **Aim for Milestones**:
   - Hit 6 sixes: Unlock a special animation and bonus booster.
   - Hit 20 sixes: Achieve legend status, top the leaderboard, and earn bragging rights in comments.
5. **Use Boosters**: Earned boosters let you revive after an out, keeping the momentum going.
6. **End of Inning**: Game over when boosters run out or you choose to stop. Share your score via a comment prompt.
7. **Daily Challenge**: Come back each day for reset scores and new leaderboards—perfect for building habits and community buzz.

Pro Tip: Practice your timing! The game gets faster with higher scores to keep it challenging.

## Getting Started (For Developers)

This app is built from the `devvit-template-threejs` template. To run locally:

1. Clone the repo: `git clone <repo-url>`
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Upload to Reddit Developer Platform and test in a subreddit.

For full deployment, follow Reddit's [Devvit Quickstart](https://developers.reddit.com/docs/quickstart) and ensure compliance with Devvit Rules.

## Tech Stack

- **Devvit Web**: For Reddit integration and Interactive Posts.
- **Three.js**: 3D rendering of the cricket scene, animations, and physics.
- **React**: UI overlays for scores, menus, and leaderboards.
- **Node.js/Express**: Backend for score storage and Reddit API calls.

## Contributing

Ideas for UGC features or bug reports? Post in the comments or join the Devvit Discord! This app is hackathon-ready but open to community polish.

Built for the Reddit Virtual Hackathon (Aug 28 - Sep 17, 2025). Let's smash some sixes! 🏏