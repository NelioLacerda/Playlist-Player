import { useState } from "react";
import EmojiPickerButton from "./EmojiPickerButton";

interface PlaylistData {
  icon: string;
  color: string;
  videos: string[];
}

interface SidebarProps {
  playlists: Record<string, PlaylistData>;
  playlistNames: string[];
  selectedView: string;
  totalVideos: number;
  onSelectView: (name: string) => void;
  onCreatePlaylist: (name: string, icon: string, color: string) => void;
  onUpdatePlaylist: (oldName: string, newName: string, icon: string, color: string) => void;
  onDeletePlaylist: (name: string) => void;
  onReorderPlaylists: (newOrder: string[]) => void;
}

const DEFAULT_ICON = "🎬";
const DEFAULT_COLOR = "#7744e4";

export default function Sidebar({
  playlists,
  playlistNames,
  selectedView,
  totalVideos,
  onSelectView,
  onCreatePlaylist,
  onUpdatePlaylist,
  onDeletePlaylist,
  onReorderPlaylists,
}: SidebarProps) {
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(DEFAULT_ICON);
  const [newColor, setNewColor] = useState(DEFAULT_COLOR);

  const [editingName, setEditingName] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState(DEFAULT_ICON);
  const [editColor, setEditColor] = useState(DEFAULT_COLOR);

  const [draggedName, setDraggedName] = useState<string | null>(null);
  const [dragOverName, setDragOverName] = useState<string | null>(null);

  function submitCreate() {
    if (!newName.trim()) return;
    onCreatePlaylist(newName.trim(), newIcon, newColor);
    setNewName("");
    setNewIcon(DEFAULT_ICON);
    setNewColor(DEFAULT_COLOR);
  }

  function startEditing(name: string) {
    const data = playlists[name];
    setEditingName(name);
    setEditName(name);
    setEditIcon(data.icon);
    setEditColor(data.color);
  }

  function submitEdit() {
    if (!editingName || !editName.trim()) return;
    onUpdatePlaylist(editingName, editName.trim(), editIcon, editColor);
    setEditingName(null);
  }

  function handleDrop(overName: string) {
    if (!draggedName || draggedName === overName) {
      setDraggedName(null);
      setDragOverName(null);
      return;
    }
    const order = [...playlistNames];
    const fromIndex = order.indexOf(draggedName);
    const toIndex = order.indexOf(overName);
    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, draggedName);
    onReorderPlaylists(order);
    setDraggedName(null);
    setDragOverName(null);
  }

  return (
    <div className="sidebar">
      <div
        className={`sidebar-item ${selectedView === "All" ? "active" : ""}`}
        onClick={() => onSelectView("All")}
      >
        <span>All videos</span>
        <span className="count-badge">{totalVideos}</span>
      </div>

      <div className="sidebar-section-label">Playlists</div>

      {playlistNames.map(name => {
        const data = playlists[name];
        const isEditing = editingName === name;
        const isActive = selectedView === name;

        return (
          <div
            key={name}
            draggable
            onDragStart={() => setDraggedName(name)}
            onDragOver={e => {
              e.preventDefault();
              setDragOverName(name);
            }}
            onDragLeave={() => setDragOverName(prev => (prev === name ? null : prev))}
            onDrop={() => handleDrop(name)}
            onDragEnd={() => {
              setDraggedName(null);
              setDragOverName(null);
            }}
            className={dragOverName === name && draggedName !== name ? "drag-over" : ""}
          >
            <div
              className={`sidebar-item playlist-item ${draggedName === name ? "dragging" : ""}`}
              style={{
                background: `${data.color}1f`,
                color: isActive ? data.color : "var(--text)",
              }}
            >
              <span className="playlist-icon" style={{ color: data.color }}>
                {data.icon}
              </span>
              <span onClick={() => onSelectView(name)} style={{ flex: 1, fontWeight: isActive ? 600 : 400 }}>
                {name}
              </span>
              <button
                className="icon-action-btn"
                onClick={() => (isEditing ? setEditingName(null) : startEditing(name))}
                title="Edit playlist"
              >
                ✎
              </button>
              <button className="delete-btn" onClick={() => onDeletePlaylist(name)} title="Delete playlist">
                ×
              </button>
            </div>

            {isEditing && (
              <div className="style-popover">
                <input
                  className="input-field"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitEdit()}
                />
                <div className="style-row">
                  <EmojiPickerButton value={editIcon} onChange={setEditIcon} />
                  <input
                    type="color"
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                    className="color-input"
                  />
                </div>
                <div className="panel-actions">
                  <button className="btn btn-primary" onClick={submitEdit}>Save</button>
                  <button className="btn" onClick={() => setEditingName(null)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="new-playlist-block">
        <input
          className="input-field"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New playlist"
          onKeyDown={e => e.key === "Enter" && submitCreate()}
        />
        <div className="style-row">
          <EmojiPickerButton value={newIcon} onChange={setNewIcon} />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="color-input" />
        </div>
        <button className="btn btn-primary btn-full" onClick={submitCreate}>Create</button>
      </div>
    </div>
  );
}