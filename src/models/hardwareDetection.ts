import type { HardwareCapabilities, ExecutionMode } from '../types';

export function detectHardware(): HardwareCapabilities {
  // Device API might not be supported in all browsers
  // @ts-ignore
  const memory = navigator.deviceMemory || 'unknown';
  const threads = navigator.hardwareConcurrency || 4;
  
  // Checking for WebGPU support in modern browsers
  const supportsWebGPU = 'gpu' in navigator;

  let recommendedMode: ExecutionMode = 'Lightweight';

  if (supportsWebGPU) {
    if (memory !== 'unknown' && memory >= 8) {
      recommendedMode = 'Advanced';
    } else {
      recommendedMode = 'Balanced';
    }
  } else if (threads >= 8 && memory !== 'unknown' && memory >= 8) {
    recommendedMode = 'Balanced';
  }

  return {
    supportsWebGPU,
    cpuThreads: threads,
    deviceMemory: memory,
    recommendedMode
  };
}
