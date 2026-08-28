import Thumbnail from "./Thumbnail";

interface VideoFile {
  name: string;
  path: string;
}

interface VideoRowProps {
  video: VideoFile;
  description?: string;
  playlists: { name: string; icon: string; color: string }[];
  onPlay: () => void;
  onEdit: () => void;
  dragging?: boolean;
}

export default function VideoRow({ video, description, playlists, onPlay, onEdit, dragging }: VideoRowProps) {
  return (
    <li className={`video-row ${dragging ? "dragging" : ""}`}>
      <div className="thumb-click" onClick={onPlay}>
        <Thumbnail path={video.path} />
      </div>

      <div className="video-info">
        <div className="video-name">{video.name}</div>
        {playlists.length > 0 && (
          <div className="video-tags">
            {playlists.map(p => (
              <span key={p.name} className="video-tag" style={{ color: p.color, background: `${p.color}26` }}>
                {p.icon} {p.name}
              </span>
            ))}
          </div>
        )}
        {description && <p className="video-description">{description}</p>}
      </div>

      <button className="btn btn-primary" onClick={onPlay}>Play</button>
      <button className="btn" onClick={onEdit}>Edit</button>
    </li>
  );
}