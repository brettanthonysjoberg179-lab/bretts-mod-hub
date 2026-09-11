# Brett's Mod Hub

**All-in-one Reddit moderation dashboard with queue, log, mail, flair, user history, and team coordination.**

Built on Reddit's Devvit platform — works natively on mobile, browser, and desktop.

---

## Features

### 📋 Queue Tab
- View all reported items (posts and comments)
- One-click approve/remove actions
- Queue count stats
- Auto-logged moderation actions

### 📜 Log Tab
- Complete moderation action history
- Track who modded what, when, and why
- Action type badges (remove, approve, ban)
- Real-time updates via onModAction trigger

### ✉️ Mail Tab
- View incoming mod mail
- Quick triage interface
- Message tracking

### 🏷️ Flair Tab
- View all flair templates
- Count per flair
- Ready for batch updates and auto-flair

### 👥 Users Tab
- **User history tracking** — see actions taken against each user
- Per-action counters (remove, approve, ban, mute)
- Quick ban button
- Last seen timestamp

### 🛡️ Team Tab
- **Mod team dashboard** — see who's online
- Per-mod action counts today
- Role display (Head Mod, Moderator)
- Real-time online status indicator

---

## Server-Side Architecture

### 10 Triggers
| Trigger | Purpose |
|---------|---------|
| `onAppInstall` | Initialize Redis config, welcome message |
| `onAppUninstall` | Cleanup with 30-day grace period |
| `onUpdate` | Queue stats refresh |
| `onCommentCreate` | Log + spam detection |
| `onCommentReport` | Add to report queue |
| `onPostCreate` | Log post creation |
| `onPostReport` | Add to report queue |
| `onModAction` | Log action + update user history |
| `onModMail` | Add to mail queue |
| `onWikiPageEdit` | Log wiki changes |

### Redis Data Structures
- `modhub:{subId}:config` — Hash for subreddit settings
- `modhub:{subId}:log` — List for moderation log
- `modhub:{subId}:report_queue` — List for reported items
- `modhub:{subId}:spam_queue` — List for auto-detected spam
- `modhub:{subId}:modmail_queue` — List for mod mail
- `modhub:{subId}:user:{name}:actions` — Hash for per-user action counts
- `modhub:{subId}:team` — Team coordination data

---

## Installation

1. Go to [Reddit's Developer Platform](https://developers.reddit.com/)
2. Create a new app
3. Upload this package
4. Install on your subreddit

## Development

```bash
npm install
npm run dev        # Local playtest
npm run build      # Build for production
npm run upload     # Upload to Reddit
npm run playtest   # Playtest on a subreddit
```

---

## Fills the Research Gap

Based on research from arxiv 2509.07314 (110 mods, 400+ subreddits):

| Mod Need | Mod Hub Solution |
|----------|------------------|
| Mobile support | Built on Devvit — works on all platforms |
| Context switching | User history tab, no need to leave queue |
| Team coordination | Real-time online status, action tracking |
| Pattern recognition | Per-user action counters |
| Integration gap | Queue + log + mail + flair in one app |
| Lightweight | Configurable subreddit settings |

---

## License

MIT

---

**Built by Brett Sjoberg** — Building in public for the Reddit mod community.
