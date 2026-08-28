import { useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { fetchFromUrl } from "music-metadata-browser";

interface ThumbnailProps {
  path: string;
}

export default function Thumbnail({ path }: ThumbnailProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDataUrl(null);
    setFailed(false);

    async function tryEmbeddedCover() {
      try {
        const metadata = await fetchFromUrl(convertFileSrc(path));
        const picture = metadata.common.picture?.[0];
        if (picture && !cancelled) {
          const blob = new Blob([picture.data], { type: picture.format });
          setDataUrl(URL.createObjectURL(blob));
          return true;
        }
      } catch {
      }
      return false;
    }

    async function captureFrameFallback() {
      const video = document.createElement("video");
      video.src = convertFileSrc(path);
      video.crossOrigin = "anonymous"; 
      video.muted = true;
      video.preload = "metadata";

      function onLoadedData() {
        video.currentTime = Math.min(2, (video.duration || 4) / 4);
      }
      function onSeeked() {
        const canvas = document.createElement("canvas");
        canvas.width = 176;
        canvas.height = Math.round((176 * video.videoHeight) / video.videoWidth) || 99;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (!cancelled) setDataUrl(canvas.toDataURL("image/jpeg", 0.72));
      }
      function onError() {
        if (!cancelled) setFailed(true);
      }

      video.addEventListener("loadeddata", onLoadedData);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);
      video.load();
    }

    (async () => {
      const gotCover = await tryEmbeddedCover();
      if (!gotCover && !cancelled) await captureFrameFallback();
    })();

    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div className="thumb-wrapper">
      {dataUrl ? (
        <img src={dataUrl} alt="" className="thumb-image" />
      ) : (
        <div className="thumb-placeholder">{failed && <span className="thumb-fallback-icon">🎬</span>}</div>
      )}
    </div>
  );
}