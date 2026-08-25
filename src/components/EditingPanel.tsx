import { useState } from "react";

interface VideoFile {
  name: string;
  path: string;
}

interface VideoMeta {
  category: string;
  description: string;
}

function EditingPanel({video, currentMeta, onSave, onCancell,}:{
    video: VideoFile;
    currentMeta?: VideoMeta;
    onSave: (meta: VideoMeta, newName?: string) => void;
    onCancell: () => void;
}) {
    const [name, setName] = useState(video.name);
    const [category, setCategory] = useState(currentMeta?.category ?? '');
    const [description, setDescription] = useState(currentMeta?.description ?? '');

    return (
    <div style={{ border: '1px solid #ccc', padding: 16, marginTop: 16 }}>
      <h3>Edit video</h3>
      <label>File Name</label>
      <input value={name} onChange={e => setName(e.target.value)} style={{ display: 'block', width: '100%' }} />

      <label>Category</label>
      <input value={category} onChange={e => setCategory(e.target.value)} style={{ display: 'block', width: '100%' }} />

      <label>Description</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} style={{ display: 'block', width: '100%' }} />

      <button onClick={() => onSave({ category, description }, name)}>Save</button>
      <button onClick={onCancell}>Cancell</button>
    </div>
  );
}

export default EditingPanel;