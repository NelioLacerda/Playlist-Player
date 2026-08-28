import { useState } from "react";
import VideoRow from "./VideoRow";

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
}

interface VideoListProps {
  videos: VideoFile[];
  archive: Archive;
  onPlay: (v: VideoFile) => void;
  onEdit: (v: VideoFile) => void;
  onReorder: (newOrder: string[]) => void;
}

export default function VideoList({ videos, archive, onPlay, onEdit, onReorder }: VideoListProps) {
  const [draggedName, setDraggedName] = useState<string | null>(null);
  const [dragOverName, setDragOverName] = useState<string | null>(null);

  function handleDrop(overName: string) {
    if (!draggedName || draggedName === overName) {
      setDraggedName(null);
      setDragOverName(null);
      return;
    }
    const order = videos.map(v => v.name);
    const fromIndex = order.indexOf(draggedName);
    const toIndex = order.indexOf(overName);
    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, draggedName);
    onReorder(order);
    setDraggedName(null);
    setDragOverName(null);
  }

  return (
    <ul className="video-list">
      {videos.map(v => {
        const meta = archive.videos[v.name];
        const videoPlaylists = Object.entries(archive.playlists)
          .filter(([, data]) => data.videos.includes(v.name))
          .map(([name, data]) => ({ name, icon: data.icon, color: data.color }));

        return (
          <div
            key={v.path}
            draggable
            onDragStart={() => setDraggedName(v.name)}
            onDragOver={e => {
              e.preventDefault();
              setDragOverName(v.name);
            }}
            onDragLeave={() => setDragOverName(prev => (prev === v.name ? null : prev))}
            onDrop={() => handleDrop(v.name)}
            onDragEnd={() => {
              setDraggedName(null);
              setDragOverName(null);
            }}
            className={dragOverName === v.name && draggedName !== v.name ? "drag-over" : ""}
          >
            <VideoRow
              video={v}
              description={meta?.description}
              playlists={videoPlaylists}
              onPlay={() => onPlay(v)}
              onEdit={() => onEdit(v)}
              dragging={draggedName === v.name}
            />
          </div>
        );
      })}
    </ul>
  );
}