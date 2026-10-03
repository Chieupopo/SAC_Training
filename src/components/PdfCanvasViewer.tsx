import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  ExternalLink,
  Presentation,
  CheckCircle2,
  FileText,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

// Configure worker using official CDN matching installed version
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PdfCanvasViewerProps {
  pdfUrl: string;
  fileName?: string;
  onPageChange?: (page: number, total: number) => void;
  className?: string;
}

export const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  pdfUrl,
  fileName = 'Giao_Trinh.pdf',
  onPageChange,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPowerPoint =
    fileName.toLowerCase().endsWith('.pptx') ||
    fileName.toLowerCase().endsWith('.ppt');

  useEffect(() => {
    if (!pdfUrl) {
      setLoading(false);
      return;
    }

    if (isPowerPoint) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: pdfUrl } as any);
        const doc = await loadingTask.promise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        setCurrentPage(1);
        setLoading(false);
        if (onPageChange) {
          onPageChange(1, doc.numPages);
        }
      } catch (err) {
        console.warn('PDF.js render notice:', err);
        if (isMounted) {
          setErrorMsg('Không thể mở file PDF này. Bạn có thể mở ở tab mới hoặc tải về máy.');
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isMounted = false;
    };
  }, [pdfUrl, isPowerPoint]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext as any);
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Page render notice:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const next = currentPage - 1;
      setCurrentPage(next);
      if (onPageChange && totalPages) onPageChange(next, totalPages);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const next = currentPage + 1;
      setCurrentPage(next);
      if (onPageChange && totalPages) onPageChange(next, totalPages);
    }
  };

  // If PowerPoint file
  if (isPowerPoint) {
    return (
      <div className={`p-8 bg-amber-50/50 border border-amber-200 rounded-2xl text-center flex flex-col items-center justify-center space-y-4 ${className}`}>
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
          <Presentation className="w-8 h-8" />
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Tệp Trình Chiếu PowerPoint ({fileName})
          </h4>
          <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
            Tệp PowerPoint đã được đính kèm vào khóa học. Để hiển thị trực tiếp từng slide thiết kế trên web, bạn có thể xuất PowerPoint sang file PDF (chọn File &gt; Save As &gt; PDF) rồi tải lên.
          </p>
        </div>
        {pdfUrl && (
          <a
            href={pdfUrl}
            download={fileName}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Tải file PowerPoint về máy ({fileName})</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-slate-100 rounded-xl overflow-hidden border border-slate-300 ${className}`}>
      {/* Top Controls Bar */}
      <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
          <span className="font-semibold truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
        </div>

        <div className="flex items-center gap-2">
          {totalPages > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 transition-colors"
                title="Trang trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono tabular-nums text-slate-200 text-xs px-1">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 transition-colors"
                title="Trang sau"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-1 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
              className="p-1 rounded hover:bg-slate-700 text-slate-300"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-slate-400 px-1">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.0, s + 0.15))}
              className="p-1 rounded hover:bg-slate-700 text-slate-300"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {pdfUrl && (
            <a
              href={pdfUrl}
              download={fileName}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Tải file về máy"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Canvas Container */}
      <div className="grow overflow-auto p-4 flex items-center justify-center min-h-[380px] bg-slate-800/90 relative">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-slate-300 text-xs py-12">
            <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải và hiển thị trang tài liệu PDF...</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-6 bg-slate-900 border border-slate-700 rounded-xl text-center max-w-md text-slate-300 text-xs space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
            <div>{errorMsg}</div>
            <div className="flex justify-center gap-2">
              <a
                href={pdfUrl}
                download={fileName}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
              >
                Tải file về máy
              </a>
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={`shadow-2xl rounded-sm max-w-full bg-white transition-opacity duration-200 ${
            loading || errorMsg ? 'hidden' : 'block'
          }`}
        />
      </div>
    </div>
  );
};
