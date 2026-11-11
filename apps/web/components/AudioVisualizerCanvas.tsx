/**
 * LevelUp Audio FFT Visualizer Canvas
 * 64-Bar Real-Time Frequency Spectrum Visualizer in Solo Leveling Neon Palette
 * Reference: docs/08-IMPLEMENTATION_PLAN.md Tâche 3.3 & Gate 3
 */

import React, { useRef, useEffect } from "react";

export interface AudioVisualizerCanvasProps {
  analyser?: AnalyserNode | null;
  isActive?: boolean;
  barCount?: number;
  width?: number;
  height?: number;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  analyser,
  isActive = false,
  barCount = 64,
  width = 640,
  height = 120,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(barCount);

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      if (isActive && analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else if (isActive) {
        // Synthetic animation if no hardware analyser
        const time = Date.now() / 150;
        for (let i = 0; i < barCount; i++) {
          dataArray[i] = Math.max(
            10,
            Math.floor(Math.sin(time + i * 0.2) * 60 + 80),
          );
        }
      } else {
        // Flat baseline when inactive
        for (let i = 0; i < barCount; i++) {
          dataArray[i] = 4;
        }
      }

      const barWidth = (width / barCount) * 0.75;
      const barSpacing = (width / barCount) * 0.25;

      for (let i = 0; i < barCount; i++) {
        const barHeight = (dataArray[i] / 255) * height;
        const x = i * (barWidth + barSpacing);
        const y = height - barHeight;

        // Gradient: cyan to monarch purple
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#00F0FF");
        gradient.addColorStop(1, "#8A2BE2");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Top glow cap
        if (dataArray[i] > 20) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(x, y, barWidth, 2);
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isActive, barCount, width, height]);

  return (
    <div
      data-testid="audio-visualizer-container"
      className="rounded-lg overflow-hidden bg-[#0A0A10] border border-[#00F0FF]/30 p-2 shadow-inner"
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        data-testid="audio-fft-canvas"
        className="w-full h-auto block"
      />
    </div>
  );
};
