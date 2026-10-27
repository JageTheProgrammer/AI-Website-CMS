/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import HALO from "vanta/dist/vanta.halo.min";

export default function VantaHalo() {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let effect: { destroy: () => void } | null = null;
    let cancelled = false;

    const initVanta = async () => {
      if (!backgroundRef.current) return;

      try {
        // Vanta requires Three.js to be available globally.
        (window as any).THREE = THREE;

        const VANTA = (await import("vanta/dist/vanta.halo.min"))
          .default;

        if (cancelled || !backgroundRef.current) return;

        effect = VANTA({
          el: backgroundRef.current,
          THREE,
          mouseControls: false,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          baseColor: 0x687fc8,
          backgroundColor: 0x000000,
          amplitudeFactor: 1.5,
          size: 1.2,
        });
      } catch (error) {
        console.error("Failed to initialize Vanta HALO:", error);
      }
    };

    initVanta();

    return () => {
      cancelled = true;
      effect?.destroy();
    };
  }, []);

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden"
    />
  );
}
