import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * Drop-in replacement for Recharts' ResponsiveContainer.
 * Avoids the width(-1)/height(-1) bug by using ResizeObserver
 * to measure the container and passing explicit pixel dimensions
 * to the chart via a render-prop.
 *
 * Usage:
 *   <ChartContainer height={300}>
 *     {(width, height) => (
 *       <LineChart width={width} height={height} data={data}> ... </LineChart>
 *     )}
 *   </ChartContainer>
 */
export function ChartContainer({
  children,
  height = 300,
  className = '',
}: {
  children: (width: number, height: number) => React.ReactNode;
  height?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0) {
        setWidth(Math.floor(rect.width));
      }
    }
  }, []);

  useEffect(() => {
    // Initial measurement after mount (give layout a tick to settle)
    const raf = requestAnimationFrame(measure);

    const ro = new ResizeObserver(() => {
      measure();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [measure]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height, minHeight: height, position: 'relative' }}
    >
      {width > 0 && children(width, height)}
    </div>
  );
}
