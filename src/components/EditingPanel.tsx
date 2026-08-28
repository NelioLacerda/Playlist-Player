import { useState } from "react";

interface VideoFile {
  name: string;
  path: string;
}

interface EditingPanelProps {
  video: VideoFile;
  currentDescription: string;
  allPlaylists: string[];
  currentPlaylists: string[];
  onSave: (description: string, playlists: string[], newName?: string) => void;
  onCancel: () => void;
}

export default function EditingPanel({
  video,
  currentDescription,
  allPlaylists,
  currentPlaylists,
  onSave,
  onCancel,
}: EditingPanelProps) {
  const [name, setName] = useState(video.name);
  const [description, setDescription] = useState(currentDescription);
  const [selected, setSelected] = useState<string[]>(currentPlaylists);

  function toggle(playlistName: string) {
    setSelected(prev =>
      prev.includes(playlistName) ? prev.filter(p => p !== playlistName) : [...prev, playlistName]
    );
  }

  return (
    <div className="panel-overlay" onClick={onCancel}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <h3>Edit video</h3>

        <label className="field-label">File name</label>
        <input className="input-field" value={name} onChange={e => setName(e.target.value)} />

        <label className="field-label">Description</label>
        <textarea
          className="textarea-field"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <label className="field-label">Playlists</label>
        {allPlaylists.length === 0 && <p style={{ color: "var(--text-dim)", fontSize: 13 }}>Create a playlist in the sidebar first.</p>}
        <div className="playlist-checkbox-list">
          {allPlaylists.map(playlistName => (
            <label key={playlistName} className="playlist-checkbox">
              <input
                type="checkbox"
                checked={selected.includes(playlistName)}
                onChange={() => toggle(playlistName)}
              />
              {playlistName}
            </label>
          ))}
        </div>

        <div className="panel-actions">
          <button className="btn btn-primary" onClick={() => onSave(description, selected, name)}>Save</button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}