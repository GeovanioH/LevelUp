// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { WorkoutCameraViewer } from "../../../src/features/cv/WorkoutCameraViewer";

describe("WorkoutCameraViewer Component", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders the holographic MediaPipe Pose HUD and initial step", () => {
    render(<WorkoutCameraViewer />);

    expect(screen.getByTestId("workout-camera-viewer")).toBeDefined();
    expect(screen.getByText(/MediaPipe Pose WASM/i)).toBeDefined();
    expect(screen.getByText(/ÉTAPE 1 \/ 17/i)).toBeDefined();
    expect(screen.getByText("Jumping Jacks")).toBeDefined();
    expect(screen.getByTestId("elbow-angle-display")).toBeDefined();
    expect(screen.getByTestId("rep-count-display")).toBeDefined();
  });

  it("toggles camera button state on user click", async () => {
    render(<WorkoutCameraViewer />);

    const button = screen.getByRole("button", { name: /Activer Caméra/i });
    expect(button).toBeDefined();

    await fireEvent.click(button);
    expect(
      await screen.findByRole("button", { name: /Désactiver Caméra/i }),
    ).toBeDefined();
  });
});
