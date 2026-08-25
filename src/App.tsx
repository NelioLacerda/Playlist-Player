import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import "./App.css";
import { readDir } from "@tauri-apps/plugin-fs";

interface VideoFile {
  name: string;
  path: string;
}

function App() {
  const [folder, setFolder] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);

  async function choiceFolder() {
    const directory = await open({directory: true,})
    //não quero selecionar mais que uma directory
    if(!directory || Array.isArray(directory)) return;

    setFolder(directory)

    //iterar sobre as entries e mapear só as de video (.mp4 por agora)
    const entries = await readDir(directory);

    const videoFiles = entries
      .filter(e => /\.(mp4|mkv|avi|mov|webm)$/i.test(e.name ?? ''))
      .map(e => ({
        name: e.name!,
        path: `${directory}/${e.name}`
      }));
    
    setVideos(videoFiles)

  }

  return (
    <div>
      <button onClick={choiceFolder}>Select Folder</button>
      {folder && <p>Folder: {folder}</p>}
      <ul>
        {videos.map(v => (
          <li key={v.path}>{v.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
