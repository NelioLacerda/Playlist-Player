# Playlist Player

A lightweight Windows desktop app to organize large video files into custom playlists, with a built-in player — no need for cloud services or heavy media servers.

![Playlist Player](docs/screenshot.png)

## Features

- 📁 Point it at any local folder and it lists your video files
- 🎨 Create playlists with custom icons and colors
- 🖱️ Drag-and-drop to reorder playlists and videos
- 🖼️ Auto-generated thumbnails (or embedded cover art when available)
- ▶️ Built-in player with custom controls: seek, volume, playback speed, fullscreen, keyboard shortcuts
- ⏭️ Auto-advance to the next video in the playlist when one ends
- ✏️ Rename files and add descriptions directly from the app
- 💾 All metadata stored locally in a plain `archive.json` next to your videos — no account, no cloud
- 🔄 Auto-updates via GitHub Releases

## Install

Download the latest installer from the [Releases page](https://github.com/NelioLacerda/Playlist-Player/releases/latest).

> **Note:** Windows SmartScreen may show a warning ("Windows protected your PC") since this app isn't code-signed with a paid certificate. Click **More info → Run anyway** to proceed. The installer is safe — you can inspect the full source code in this repository.

The app checks for updates automatically from within the app (top bar → "Check for updates").

## How it works

1. Click **Select folder** and choose the folder containing your videos
2. The app scans for video files (`.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`)
3. Create playlists from the sidebar and assign videos to one or more of them
4. Click a video's thumbnail or **Play** to open the built-in player

All metadata (playlists, descriptions, ordering) is saved in an `archive.json` file created inside the selected folder — so it travels with your videos if you move or copy the folder.

## Tech stack

- [Tauri](https://tauri.app/) — Rust-based desktop app shell
- [React](https://react.dev/) + TypeScript
- Local filesystem access via `@tauri-apps/plugin-fs`
- Auto-updates via `@tauri-apps/plugin-updater`

## Building from source

```bash
git clone https://github.com/TEU_USER/playlist-player.git
cd playlist-player
pnpm install
pnpm tauri dev      # development
pnpm tauri build    # production build
```

Requires [Rust](https://www.rust-lang.org/tools/install) and [pnpm](https://pnpm.io/installation) installed. See [Tauri's prerequisites](https://tauri.app/start/prerequisites/) for platform-specific setup.

## License

[MIT](LICENSE)