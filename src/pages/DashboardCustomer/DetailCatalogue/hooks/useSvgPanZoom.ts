import { useState, useCallback } from 'react';

interface UseSvgPanZoomReturn {
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    isDragOccurred: boolean;
    dragStart: { x: number; y: number };
    setIsDragOccurred: (value: boolean) => void;
    setPanX: (value: number) => void;
    setPanY: (value: number) => void;
    setIsDragging: (value: boolean) => void;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleFitToView: () => void;
    handleWheel: (event: React.WheelEvent) => void;
    handleMouseDown: (event: React.MouseEvent) => void;
    handleMouseUp: () => void;
}

interface UseSvgPanZoomOptions {
    minZoom?: number;
    maxZoom?: number;
    zoomStep?: number;
}

/**
 * Hook untuk mengelola zoom dan pan pada SVG viewer
 */
export const useSvgPanZoom = (options: UseSvgPanZoomOptions = {}): UseSvgPanZoomReturn => {
    const { minZoom = 0.1, maxZoom = 5, zoomStep = 1.2 } = options;

    const [zoom, setZoom] = useState<number>(1);
    const [panX, setPanX] = useState<number>(0);
    const [panY, setPanY] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragOccurred, setIsDragOccurred] = useState<boolean>(false);

    // Zoom in
    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev * zoomStep, maxZoom));
    }, [zoomStep, maxZoom]);

    // Zoom out
    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev / zoomStep, minZoom));
    }, [zoomStep, minZoom]);

    // Reset ke posisi awal
    const handleFitToView = useCallback(() => {
        setZoom(1);
        setPanX(0);
        setPanY(0);
    }, []);

    // Zoom dengan scroll wheel
    const handleWheel = useCallback((event: React.WheelEvent) => {
        // Remove preventDefault untuk menghindari passive listener warning
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.min(Math.max(prev * delta, minZoom), maxZoom));
    }, [minZoom, maxZoom]);

    // Mulai drag
    const handleMouseDown = useCallback((event: React.MouseEvent) => {
        if (event.button === 0) {
            event.preventDefault();
            setIsDragging(true);
            setIsDragOccurred(false);
            setDragStart({ x: event.clientX - panX, y: event.clientY - panY });
        }
    }, [panX, panY, isDragging]);

    // Akhiri drag
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setTimeout(() => setIsDragOccurred(false), 100);
    }, []);

    return {
        zoom,
        panX,
        panY,
        isDragging,
        isDragOccurred,
        dragStart,
        setIsDragOccurred,
        setPanX,
        setPanY,
        setIsDragging,
        handleZoomIn,
        handleZoomOut,
        handleFitToView,
        handleWheel,
        handleMouseDown,
        handleMouseUp,
    };
};
