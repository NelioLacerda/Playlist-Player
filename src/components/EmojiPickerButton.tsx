import { useEffect, useRef, useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface EmojiPickerButtonProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPickerButton({ value, onChange }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="emoji-picker-wrapper" ref={wrapperRef}>
      <button type="button" className="emoji-trigger" onClick={() => setOpen(o => !o)}>
        {value}
      </button>
      {open && (
        <div className="emoji-picker-popover">
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={(emojiData: EmojiClickData) => {
              onChange(emojiData.emoji);
              setOpen(false);
            }}
            width={280}
            height={360}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}
    </div>
  );
}