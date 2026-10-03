import React, { useState } from 'react';

export default function CopyChip({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const doCopy = () => {
      setCopied(true);
      if (window.showToast) window.showToast(`Copied to clipboard: ${text}`);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(doCopy).catch(doCopy);
    } else {
      doCopy();
    }
  };

  return (
    <span
      className="chip chip--copy"
      onClick={handleCopy}
      style={{
        color: 'var(--paper)',
        borderColor: copied ? 'var(--cyan)' : 'rgba(244, 240, 230, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.25s ease'
      }}
      title="Click to copy repository command"
    >
      {copied ? '✓ Copied!' : label}
    </span>
  );
}
