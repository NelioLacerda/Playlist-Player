import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import { exists, readDir, readTextFile, rename, writeTextFile } from "@tauri-apps/plugin-fs";
import EditingPanel from "./components/EditingPanel";

interface VideoFile {
  name: string;
  path: string;
}

interface VideoMeta {
  category: string;
  description: string;
}

interface Archive {
  videos: Record<string, VideoMeta>;
}

function App() {
  const [folder, setFolder] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [archive, setArchive] = useState<Archive>({videos: {}});
  const [editingFile, setEditingFile] = useState<VideoFile | null>(null);

  async function choiceFolder() {
    const directory = await open({directory: true,})
    //não quero selecionar mais que uma directory
    if(!directory || Array.isArray(directory)) return;

    setFolder(directory);

    //iterar sobre as entries e mapear só as de video (.mp4 por agora)
    const entries = await readDir(directory);

    const videoFiles = entries
      .filter(e => /\.(mp4|mkv|avi|mov|webm)$/i.test(e.name ?? ''))
      .map(e => ({
        name: e.name!,
        path: `${directory}/${e.name}`
      }));
    
    setVideos(videoFiles);

    const pathJSON = `${directory}/archive.json`;
    const hasJSON = await exists(pathJSON);
    if (hasJSON) {
      const content = await readTextFile(pathJSON);
      setArchive(JSON.parse(content));
    } else {
      setArchive({videos: {}});
    }

  }

  async function storeMeta(currentName: string, meta: VideoMeta, newName?: string) {
    if (!folder) return;

    let finalName = currentName;

    if(newName && newName !== currentName) {
      const oldPath = `${folder}/${currentName}`;
      const newPath = `${folder}/${newName}`;
      await rename(oldPath, newPath);
      finalName = newName;

      setVideos(prev => 
        prev.map(v => (
          v.name === currentName ? {name: newName, path: newPath} : v
        ))
      );
    
    }

    const newArchive = {
      videos: {
        ...archive.videos,
        [finalName]: meta,
      },
    };

    if (finalName !== currentName) delete newArchive.videos[currentName];

    setArchive(newArchive);
    await writeTextFile(`${folder}/archive.json`, JSON.stringify(newArchive, null, 2));
    setEditingFile(null);
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={choiceFolder}>Select folder</button>
      {folder && <p>Folder: {folder}</p>}

      <ul>
        {videos.map(v => {
          const meta = archive.videos[v.name];
          return (
            <li key={v.path} style={{ marginBottom: 10 }}>
              <strong>{v.name}</strong>
              {meta?.category && <span> — [{meta.category}]</span>}
              {meta?.description && <p style={{ margin: '4px 0', color: '#888' }}>{meta.description}</p>}
              <button onClick={() => setEditingFile(v)}>Edit</button>
            </li>
          );
        })}
      </ul>

      {editingFile && (
        <EditingPanel
          video={editingFile}
          currentMeta={archive.videos[editingFile.name]}
          onSave={(meta, novoNome) => storeMeta(editingFile.name, meta, novoNome)}
          onCancell={() => setEditingFile(null)}
        />
      )}
    </div>
  );
}

export default App;
