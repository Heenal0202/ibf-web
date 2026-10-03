import React, { useState, useEffect, useRef } from 'react';

export default function Toast() {
  const [toast, setToast] = useState({ visible: false, text: '' });
  const timerRef = useRef(null);

  useEffect(() => {
    window.showToast = (text) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ visible: true, text });
      timerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2600);
    };

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={`toast ${toast.visible ? 'toast--visible' : ''}`} role="status">
      {toast.text}
    </div>
  );
}
