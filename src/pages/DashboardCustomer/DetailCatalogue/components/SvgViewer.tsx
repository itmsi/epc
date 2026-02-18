import { useRef, useEffect, useCallback } from 'react';
import { MdZoomIn, MdZoomOut, MdCenterFocusStrong } from 'react-icons/md';
import { LoadingSpinner } from '@/components/common/Loading';
import { useSvgPanZoom } from '../hooks/useSvgPanZoom';

interface SvgViewerProps {
    svgContent: string | null;
    svgLoading: boolean;
    selected: string | null;
    onPartSelect: (targetId: string, source: 'table' | 'svg') => void;
}

export const SvgViewer = ({
    svgContent,
    svgLoading,
    selected,
    onPartSelect,
}: SvgViewerProps) => {
    const svgWrapperRef = useRef<HTMLDivElement>(null);
    const justFinishedDragRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Track timeout for cleanup

    const {
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
    } = useSvgPanZoom();

    // Bersihkan highlight
    const clearHighlights = useCallback(() => {
        const highlights = svgWrapperRef.current?.querySelectorAll('circle.highlight-circle');
        highlights?.forEach(circle => circle.remove());
    }, []);

    // Tambah highlight ke part yang dipilih
    const addHighlight = useCallback((targetId: string) => {
        const svgElement = svgWrapperRef.current?.querySelector('svg');
        const group = svgWrapperRef.current?.querySelector<SVGGElement>(`g#${targetId}`);
        if (!group || !svgElement) return;

        try {
            const bbox = group.getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;
            const r = Math.max(bbox.width, bbox.height) / 0.7;

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('class', 'highlight-circle');
            circle.setAttribute('cx', String(cx));
            circle.setAttribute('cy', String(cy));
            circle.setAttribute('r', String(r));
            circle.setAttribute('fill', 'rgba(255, 200, 0, 0.3)');
            circle.setAttribute('stroke', 'rgba(255, 200, 0, 0.9)');
            circle.setAttribute('stroke-width', '4');
            circle.style.pointerEvents = 'none';
            // Remove CSS properties that don't work in SVG
            
            // Append ke SVG root sebagai last child untuk layering yang tepat
            svgElement.appendChild(circle);
        } catch (error) {
            console.error('Error creating highlight:', error);
        }
    }, []);

    // Update highlight saat selection berubah
    useEffect(() => {
        clearHighlights();
        if (selected) {
            addHighlight(selected);
        }
    }, [selected, clearHighlights, addHighlight]);

    // Stable event handlers to prevent re-creation
    const stableHandleMouseEnter = useCallback((event: Event) => {
        if (isDragging || justFinishedDragRef.current) return;
        
        const group = event.currentTarget as SVGGElement;
        group.style.cursor = 'pointer';
        group.style.opacity = '0.8';
        group.style.filter = 'brightness(1.1)';

        const clickArea = group.querySelector('rect.click-area');
        if (clickArea) {
            clickArea.setAttribute('stroke', 'rgba(59, 130, 246, 0.7)');
            clickArea.setAttribute('stroke-width', '2');
            clickArea.setAttribute('stroke-dasharray', '4');
            clickArea.setAttribute('fill', 'rgba(59, 130, 246, 0.15)');
        }
    }, [isDragging]);

    const stableHandleMouseLeave = useCallback((event: Event) => {
        if (justFinishedDragRef.current) return;
        
        const group = event.currentTarget as SVGGElement;
        group.style.opacity = '1';
        group.style.filter = 'none';
        if (!isDragging) {
            group.style.cursor = 'pointer';
        }

        const clickArea = group.querySelector('rect.click-area');
        if (clickArea) {
            clickArea.setAttribute('stroke', 'none');
            clickArea.setAttribute('fill', 'transparent');
        }
    }, [isDragging]);

    // Setup SVG basic styles - separate from interaction setup
    useEffect(() => {
        if (!svgContent || !svgWrapperRef.current) return;

        const svgElement = svgWrapperRef.current.querySelector('svg');
        if (svgElement) {
            svgElement.classList.add('w-full', 'h-auto');
            svgElement.style.userSelect = 'none';
        }
    }, [svgContent]);

    // Setup clickable areas dan event listeners
    useEffect(() => {
        if (!svgContent || !svgWrapperRef.current) return;
        
        const groups = svgWrapperRef.current.querySelectorAll<SVGGElement>("g[id^='T']");

        groups.forEach((group) => {
            group.style.pointerEvents = 'all';
            group.querySelectorAll('*').forEach(child => {
                (child as SVGElement).style.pointerEvents = 'all';
            });

            // Buat clickable area
            try {
                const existing = group.querySelector('rect.click-area');
                if (existing) existing.remove();

                const bbox = group.getBBox();
                const padding = 15; // Kurangi dari 40 ke 25 untuk ukuran hover yang lebih wajar

                const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                clickArea.setAttribute('class', 'click-area');
                clickArea.setAttribute('x', String(bbox.x - padding));
                clickArea.setAttribute('y', String(bbox.y - padding));
                clickArea.setAttribute('width', String(bbox.width + padding * 2));
                clickArea.setAttribute('height', String(bbox.height + padding * 2));
                clickArea.setAttribute('fill', 'transparent');
                clickArea.setAttribute('stroke', 'none');
                clickArea.style.pointerEvents = 'all';
                clickArea.style.cursor = 'pointer';

                group.appendChild(clickArea);
            } catch (error) {
                // Ignore getBBox errors silently
            }

            group.addEventListener('mouseenter', stableHandleMouseEnter);
            group.addEventListener('mouseleave', stableHandleMouseLeave);
        });

        return () => {
            groups.forEach((group) => {
                const clickArea = group.querySelector('rect.click-area');
                if (clickArea) clickArea.remove();
                group.removeEventListener('mouseenter', stableHandleMouseEnter);
                group.removeEventListener('mouseleave', stableHandleMouseLeave);
            });
        };
    }, [svgContent, stableHandleMouseEnter, stableHandleMouseLeave]); // Fixed dependencies

    // Global mouse events untuk panning (seperti di Dashboard.tsx)
    useEffect(() => {
        const handleGlobalMouseMove = (event: MouseEvent) => {
            if (isDragging) {
                // Hanya set isDragOccurred jika mouse bergerak cukup jauh (minimum 3px)
                const dragDistance = Math.abs(event.clientX - dragStart.x) + Math.abs(event.clientY - dragStart.y);
                if (dragDistance > 3) {
                    setIsDragOccurred(true);
                }
                setPanX(event.clientX - dragStart.x);
                setPanY(event.clientY - dragStart.y);
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            justFinishedDragRef.current = true;
            
            setTimeout(() => {
                setIsDragOccurred(false);
            }, 10);
            
            // Clear previous timeout untuk mencegah race conditions
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            
            // Set new timeout dengan proper cleanup
            timeoutRef.current = setTimeout(() => {
                justFinishedDragRef.current = false;
                timeoutRef.current = null;
            }, 100);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Handle mouseup untuk detect click vs drag
    const handleSvgMouseUp = (e: React.MouseEvent) => {
        // Jika tidak ada drag, treat as click
        if (!isDragOccurred) {
            let target = e.target as Element;
            let partGroup: SVGGElement | null = null;

            // Cek apakah click pada T group
            while (target && target.tagName !== 'DIV') {
                if (target.tagName === 'g' && target.id && target.id.startsWith('T')) {
                    partGroup = target as SVGGElement;
                    break;
                }
                if (target.tagName !== 'svg') {
                    const parentGroup = target.closest("g[id^='T']");
                    if (parentGroup && parentGroup.id.startsWith('T')) {
                        partGroup = parentGroup as SVGGElement;
                        break;
                    }
                }
                target = target.parentElement as Element;
            }

            if (partGroup?.id) {
                onPartSelect(partGroup.id, 'svg');
            }
        }
        
        handleMouseUp();
    };

    return (
        <div className="bg-white md:col-span-4 relative overflow-hidden" style={{ height: '630px' }}>
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2 opacity-70 hover:opacity-100 transition duration-300">
                <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom In"
                >
                    <MdZoomIn size={20} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Zoom Out"
                >
                    <MdZoomOut size={20} />
                </button>
                <button
                    onClick={handleFitToView}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Fit to View"
                >
                    <MdCenterFocusStrong size={20} />
                </button>
                <div className="text-xs text-center text-gray-500 px-1">
                    {Math.round(zoom * 100)}%
                </div>
            </div>

            {/* SVG Container */}
            <div
                className={`w-full h-full flex items-center justify-center ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                    transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                }}
                onWheel={handleWheel}
                onMouseDown={(e) => {
                    handleMouseDown(e);
                }}
                onMouseUp={(e) => {
                    // Jangan handle jika mouseup dari SVG content
                    if (e.target === e.currentTarget) {
                        handleMouseUp();
                    }
                }}
                onMouseLeave={handleMouseUp}
            >
                {svgLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner size="md" color="text-gray-400" />
                    </div>
                ) : svgContent ? (
                    <div
                        ref={svgWrapperRef}
                        className="w-full h-full"
                        style={{ userSelect: 'none' }}
                        onMouseUp={handleSvgMouseUp}
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No diagram available</p>
                    </div>
                )}
            </div>
        </div>
    );
};
