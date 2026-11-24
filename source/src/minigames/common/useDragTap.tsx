import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

/**
 * Przeciągnij i upuść ORAZ alternatywa: kliknij element, potem kliknij cel.
 * Działa z myszą, dotykiem i klawiaturą (Enter/Spacja wybiera, Enter na celu upuszcza).
 */
export function useDragTap(onDrop: (itemId: string, targetId: string) => void) {
  const [selected, setSelected] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const start = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const dropRef = useRef(onDrop);
  dropRef.current = onDrop;

  const itemProps = (id: string) => ({
    'data-item': id,
    'aria-pressed': selected === id,
    onPointerDown: (e: PointerEvent) => {
      if (e.button !== 0) return;
      start.current = { id, x: e.clientX, y: e.clientY, moved: false };
      try { (e.currentTarget as Element).setPointerCapture(e.pointerId); } catch { /* ignore */ }
    },
    onPointerMove: (e: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      if (!s.moved && Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) s.moved = true;
      if (s.moved) setDrag({ id: s.id, x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e: PointerEvent) => {
      const s = start.current;
      start.current = null;
      setDrag(null);
      if (!s) return;
      if (s.moved) {
        const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-drop]');
        if (el) {
          setSelected(null);
          dropRef.current(s.id, el.getAttribute('data-drop')!);
        }
      } else {
        setSelected((sel) => (sel === id ? null : id));
      }
    },
    onPointerCancel: () => {
      start.current = null;
      setDrag(null);
    },
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelected((sel) => (sel === id ? null : id));
      }
    },
  });

  const targetProps = (targetId: string) => ({
    'data-drop': targetId,
    onClick: () => {
      if (selected) {
        const s = selected;
        setSelected(null);
        dropRef.current(s, targetId);
      }
    },
  });

  const ghost = (render: (id: string) => ReactNode) =>
    drag ? (
      <div className="drag-ghost" style={{ left: drag.x, top: drag.y }}>
        {render(drag.id)}
      </div>
    ) : null;

  return { selected, setSelected, dragging: drag?.id ?? null, itemProps, targetProps, ghost };
}
