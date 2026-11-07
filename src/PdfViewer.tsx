import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { GlobalWorkerOptions, getDocument, type PDFDocumentProxy, type RenderTask } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = workerUrl;

// Breathing room (px) around the page when fitting it below the sticky header and page controls.
const FIT_MARGIN = 36;

/** Shows one PDF page at a time, sized to fit the screen; buttons, arrow keys, or clicking the page's left/right half turn pages. */
export default function PdfViewer({ src, title }: { src: string; title: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(false);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageCount = pdf?.numPages ?? 0;

  useEffect(() => {
    setPdf(undefined);
    setPageNumber(1);
    setError(false);
    let cancelled = false;
    const task = getDocument(src);
    task.promise.then(
      (doc) => { if (!cancelled) setPdf(doc); },
      () => { if (!cancelled) setError(true); },
    );
    return () => {
      cancelled = true;
      void task.destroy();
    };
  }, [src]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const measure = () => {
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 0;
      const controls = controlsRef.current?.offsetHeight ?? 0;
      setBounds({
        width: Math.floor(viewer.clientWidth) - 2, // minus the stage border
        height: Math.max(Math.floor(window.innerHeight - header - controls - FIT_MARGIN), 320),
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(viewer);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!pdf || !canvas || bounds.width === 0) return;
    let renderTask: RenderTask | undefined;
    let cancelled = false;
    void pdf.getPage(pageNumber).then((page) => {
      if (cancelled) return;
      const natural = page.getViewport({ scale: 1 });
      const scale = Math.min(bounds.width / natural.width, bounds.height / natural.height);
      const ratio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * ratio });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${Math.floor(viewport.width / ratio)}px`;
      canvas.style.height = `${Math.floor(viewport.height / ratio)}px`;
      renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport });
      renderTask.promise.catch(() => undefined);
    });
    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [pdf, pageNumber, bounds]);

  const goTo = useCallback((next: number) => {
    if (!pageCount || next < 1 || next > pageCount) return;
    setPageNumber(next);
    viewerRef.current?.scrollIntoView({ block: 'nearest' });
  }, [pageCount]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select')) return;
      if (event.key === 'ArrowRight') goTo(pageNumber + 1);
      if (event.key === 'ArrowLeft') goTo(pageNumber - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, pageNumber]);

  const onPageClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const { left, width: canvasWidth } = event.currentTarget.getBoundingClientRect();
    goTo(event.clientX - left < canvasWidth / 2 ? pageNumber - 1 : pageNumber + 1);
  };

  return (
    <div className="pdf-viewer" ref={viewerRef}>
      <div className="pdf-controls" ref={controlsRef}>
        <button type="button" onClick={() => goTo(pageNumber - 1)} disabled={pageNumber <= 1} aria-label="Previous page">
          <span aria-hidden="true">←</span> Prev
        </button>
        <p aria-live="polite">{pageCount ? <>Page <strong>{pageNumber}</strong> of {pageCount}</> : 'Loading…'}</p>
        <button type="button" onClick={() => goTo(pageNumber + 1)} disabled={!pageCount || pageNumber >= pageCount} aria-label="Next page">
          Next <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="pdf-stage">
        {error ? (
          <p className="pdf-error">This PDF couldn&apos;t be displayed. Use the links above to open or download it.</p>
        ) : (
          <canvas ref={canvasRef} onClick={onPageClick} role="img" aria-label={`${title}, page ${pageNumber}${pageCount ? ` of ${pageCount}` : ''}`} />
        )}
      </div>
      {pageCount > 1 ? (
        <div className="pdf-progress" aria-hidden="true"><span style={{ width: `${(pageNumber / pageCount) * 100}%` }} /></div>
      ) : null}
    </div>
  );
}
