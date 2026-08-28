import { useEffect, useMemo, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { load } from "@tauri-apps/plugin-store";
import "./App.css";
import { exists, readDir, readTextFile, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import EditingPanel from "./components/EditingPanel";
import Sidebar from "./components/Sidebar";
import VideoRow from "./components/VideoRow";
import VideoPlayer from "./components/VideoPlayer";

interface VideoFile {
  name: string;
  path: string;
}

interface VideoMeta {
  description: string;
}

interface PlaylistData {
  icon: string;
  color: string;
  videos: string[];
}

interface Archive {
  videos: Record<string, VideoMeta>;
  playlists: Record<string, PlaylistData>;
  playlistOrder: string[]; 
}

const DEFAULT_ICON = "🎬";
const DEFAULT_COLOR = "#e0a458";

function migratePlaylists(raw: any): { playlists: Record<string, PlaylistData>; order: string[] } {
  const playlists: Record<string, PlaylistData> = {};
  for (const [name, value] of Object.entries(raw ?? {})) {
    if (Array.isArray(value)) {
      playlists[name] = { icon: DEFAULT_ICON, color: DEFAULT_COLOR, videos: value as string[] };
    } else {
      const v = value as PlaylistData;
      playlists[name] = {
        icon: v.icon ?? DEFAULT_ICON,
        color: v.color ?? DEFAULT_COLOR,
        videos: v.videos ?? [],
      };
    }
  }
  return { playlists, order: Object.keys(playlists) };
}

function App() {
  const [folder, setFolder] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [archive, setArchive] = useState<Archive>({ videos: {}, playlists: {}, playlistOrder: [] });
  const [editingFile, setEditingFile] = useState<VideoFile | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoFile | null>(null);
  const [selectedView, setSelectedView] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  const playlistNames = archive.playlistOrder;

  const filteredVideos = useMemo(() => {
    if (selectedView === "All") return videos;
    const namesInPlaylist = archive.playlists[selectedView]?.videos ?? [];
    return videos.filter(v => namesInPlaylist.includes(v.name));
  }, [selectedView, videos, archive]);

  async function loadFolder(directory: string) {
    setFolder(directory);

    const entries = await readDir(directory);
    const videoFiles = entries
      .filter(e => /\.(mp4|mkv|avi|mov|webm)$/i.test(e.name ?? ""))
      .map(e => ({ name: e.name!, path: `${directory}/${e.name}` }));
    setVideos(videoFiles);

    const jsonPath = `${directory}/archive.json`;
    const hasJSON = await exists(jsonPath);
    if (hasJSON) {
      const content = await readTextFile(jsonPath);
      const parsed = JSON.parse(content);
      const { playlists, order } = migratePlaylists(parsed.playlists);
      const savedOrder: string[] = parsed.playlistOrder ?? order;
      const finalOrder = [...savedOrder.filter(n => playlists[n]), ...Object.keys(playlists).filter(n => !savedOrder.includes(n))];
      setArchive({ videos: parsed.videos ?? {}, playlists, playlistOrder: finalOrder });
    } else {
      setArchive({ videos: {}, playlists: {}, playlistOrder: [] });
    }

    const store = await load("app-settings.json");
    await store.set("lastFolder", directory);
    await store.save();
  }

  async function chooseFolder() {
    const directory = await open({ directory: true });
    if (!directory || Array.isArray(directory)) return;
    await loadFolder(directory);
  }

  useEffect(() => {
    (async () => {
      try {
        const store = await load("app-settings.json");
        const lastFolder = await store.get<string>("lastFolder");

        if (lastFolder) {
          const stillExists = await exists(lastFolder);
          if (stillExists) {
            await loadFolder(lastFolder);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(newArchive: Archive) {
    if (!folder) return;
    setArchive(newArchive);
    await writeTextFile(`${folder}/archive.json`, JSON.stringify(newArchive, null, 2));
  }

  async function storeMeta(currentName: string, description: string, selectedPlaylists: string[], newName?: string) {
    if (!folder) return;
    let finalName = currentName;

    if (newName && newName !== currentName) {
      const oldPath = `${folder}/${currentName}`;
      const newPath = `${folder}/${newName}`;
      await rename(oldPath, newPath);
      finalName = newName;
      setVideos(prev => prev.map(v => (v.name === currentName ? { name: newName, path: newPath } : v)));
    }

    const newVideos = { ...archive.videos, [finalName]: { description } };
    if (finalName !== currentName) delete newVideos[currentName];

    const newPlaylists: Record<string, PlaylistData> = {};
    for (const [playlistName, data] of Object.entries(archive.playlists)) {
      const withoutThisVideo = data.videos.filter(n => n !== currentName);
      newPlaylists[playlistName] = {
        ...data,
        videos: selectedPlaylists.includes(playlistName) ? [...withoutThisVideo, finalName] : withoutThisVideo,
      };
    }

    await persist({ videos: newVideos, playlists: newPlaylists, playlistOrder: archive.playlistOrder });
    setEditingFile(null);
  }

  function createPlaylist(name: string, icon: string, color: string) {
    if (!name.trim() || archive.playlists[name]) return;
    persist({
      ...archive,
      playlists: { ...archive.playlists, [name]: { icon, color, videos: [] } },
      playlistOrder: [...archive.playlistOrder, name],
    });
  }

  function updatePlaylist(oldName: string, newName: string, icon: string, color: string) {
    const current = archive.playlists[oldName];
    if (!current) return;
    if (newName !== oldName && archive.playlists[newName]) return;

    const newPlaylists = { ...archive.playlists };
    if (newName !== oldName) delete newPlaylists[oldName];
    newPlaylists[newName] = { ...current, icon, color };

    const newOrder = archive.playlistOrder.map(n => (n === oldName ? newName : n));

    persist({ ...archive, playlists: newPlaylists, playlistOrder: newOrder });
    if (selectedView === oldName) setSelectedView(newName);
  }

  function deletePlaylist(name: string) {
    const { [name]: _, ...rest } = archive.playlists;
    persist({
      ...archive,
      playlists: rest,
      playlistOrder: archive.playlistOrder.filter(n => n !== name),
    });
    if (selectedView === name) setSelectedView("All");
  }

  function reorderPlaylists(newOrder: string[]) {
    persist({ ...archive, playlistOrder: newOrder });
  }

  return (
    <div className="app-shell">
      <Sidebar
        playlists={archive.playlists}
        playlistNames={playlistNames}
        selectedView={selectedView}
        totalVideos={videos.length}
        onSelectView={setSelectedView}
        onCreatePlaylist={createPlaylist}
        onUpdatePlaylist={updatePlaylist}
        onDeletePlaylist={deletePlaylist}
        onReorderPlaylists={reorderPlaylists}
      />

      <div className="main">
        <div className="main-header">
          <div>
            <button className="btn" onClick={chooseFolder}>Select folder</button>
            {folder && <p className="folder-path">{folder}</p>}
          </div>
        </div>

        <h2 className="view-title">
          {selectedView}
          <span className="count-badge">{filteredVideos.length} videos</span>
        </h2>

        {filteredVideos.length === 0 ? (
          <p className="empty-state">No videos here yet.</p>
        ) : (
          <ul className="video-list">
            {filteredVideos.map(v => {
              const meta = archive.videos[v.name];
              const videoPlaylists = Object.entries(archive.playlists)
                .filter(([, data]) => data.videos.includes(v.name))
                .map(([name, data]) => ({ name, icon: data.icon, color: data.color }));

              return (
                <VideoRow
                  key={v.path}
                  video={v}
                  description={meta?.description}
                  playlists={videoPlaylists}
                  onPlay={() => setPlayingVideo(v)}
                  onEdit={() => setEditingFile(v)}
                />
              );
            })}
          </ul>
        )}

        {editingFile && (
          <EditingPanel
            video={editingFile}
            currentDescription={archive.videos[editingFile.name]?.description ?? ""}
            allPlaylists={playlistNames}
            currentPlaylists={Object.entries(archive.playlists)
              .filter(([, data]) => data.videos.includes(editingFile.name))
              .map(([name]) => name)}
            onSave={(description, selectedPlaylists, newName) =>
              storeMeta(editingFile.name, description, selectedPlaylists, newName)
            }
            onCancel={() => setEditingFile(null)}
          />
        )}

        {playingVideo && (
          <VideoPlayer path={playingVideo.path} name={playingVideo.name} onClose={() => setPlayingVideo(null)} />
        )}
      </div>
    </div>
  );
}

export default App;