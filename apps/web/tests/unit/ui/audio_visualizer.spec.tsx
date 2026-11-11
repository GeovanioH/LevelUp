// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { AudioVisualizerCanvas } from "../../../components/AudioVisualizerCanvas";

describe("AudioVisualizerCanvas Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders 64-bar frequency visualizer canvas container", () => {
    render(<AudioVisualizerCanvas isActive={false} barCount={64} />);

    expect(screen.getByTestId("audio-visualizer-container")).toBeDefined();
    expect(screen.getByTestId("audio-fft-canvas")).toBeDefined();
  });

  it("handles active state without crashing", () => {
    render(<AudioVisualizerCanvas isActive={true} barCount={64} />);

    const canvas = screen.getByTestId("audio-fft-canvas");
    expect(canvas).toBeDefined();
  });
});
