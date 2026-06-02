import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { VisualSettings } from './NetworkGraph';

interface GraphLinkProps {
  id: string;
  source: { id: string, status: string, latency?: number };
  target: { id: string, status: string, latency?: number };
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  showHeatmap: boolean;
  showCommunicationInstability?: boolean;
  traffic?: number;
  riskWeight?: number;
  visualSettings?: VisualSettings;
  zoomScale?: number;
  type?: 'telemetry' | 'authentication' | 'database' | 'api' | 'cloud' | 'trust' | 'replication';
}

export const GraphLink = React.memo(({ 
  id, 
  source, 
  target, 
  sx,
  sy,
  tx,
  ty,
  showHeatmap, 
  showCommunicationInstability = false,
  traffic = 0.2,
  riskWeight = 0.1,
  visualSettings = {
    intensity: 1,
    speed: 1,
    glow: 1,
    heatmapOpacity: 0.15,
    pulseFrequency: 1
  },
  zoomScale = 1,
  type
}: GraphLinkProps) => {
  const isCompromised = source.status === 'compromised' || target.status === 'compromised';
  const bothCompromised = source.status === 'compromised' && target.status === 'compromised';
  const isIsolated = source.status === 'isolated' || target.status === 'isolated';
  const isQuarantined = source.status === 'quarantined' || target.status === 'quarantined';
  
  // Instability check
  const isUnstable = showCommunicationInstability && (traffic > 0.65 || (source.latency && source.latency > 50) || (target.latency && target.latency > 50));
  const isActiveRed = isCompromised || showHeatmap;
  const isRerouted = traffic !== undefined && traffic > 0.45 && source.status === 'safe' && target.status === 'safe';

  // Level of detail check
  const isSimplified = zoomScale < 0.65;

  // Consistent, deterministic curve offset based on stable ID hashing
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  // Determine standard bend direction based on alphabetical node IDs
  const isReversed = (source.id || '') > (target.id || '');
  const curveDirection = isReversed ? -1 : 1;
  
  // Longer connections get slightly wider curves; shorter ones remain delicate but strictly non-straight
  const curveOffset = (18 + dist * 0.08) * curveDirection;

  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  const qx = mx + nx * curveOffset;
  const qy = my + ny * curveOffset;

  // The central curved bezier path data
  const pathData = `M ${sx},${sy} Q ${qx},${qy} ${tx},${ty}`;

  // Reverse path for backward packet tracing
  const reversedPathData = `M ${tx},${ty} Q ${qx},${qy} ${sx},${sy}`;

  // Direct threat packet routing: if target is contaminated and source is not, lateral movement proceeds target -> source
  const isInfectionProceedingBackward = target.status === 'compromised' && source.status !== 'compromised';
  const flowPathData = isInfectionProceedingBackward ? reversedPathData : pathData;

  // Base styling properties
  const strokeWidth = bothCompromised 
    ? 2.2 * visualSettings.intensity 
    : isCompromised
    ? 1.8 * visualSettings.intensity
    : isUnstable 
    ? 1.5 * visualSettings.intensity
    : isRerouted
    ? 1.4 * visualSettings.intensity
    : isQuarantined
    ? 1.2
    : isIsolated 
    ? 0.6
    : 1.0;

  const getLineClassName = () => {
    if (isIsolated) return "stroke-state-iso/10";
    if (isCompromised) return "stroke-state-danger/55";
    if (isQuarantined) return "stroke-amber-500/45";
    if (isUnstable) return "stroke-state-warning/60 animate-pulse";
    if (isRerouted) return "stroke-accent-cyan/70";
    
    // Grid type functional branding
    if (type === 'authentication') return "stroke-purple-400/35";
    if (type === 'database') return "stroke-accent-cyan/45";
    if (type === 'api') return "stroke-emerald-400/40";
    if (type === 'cloud') return "stroke-indigo-400/35";
    if (type === 'trust') return "stroke-sky-400/35";
    if (type === 'replication') return "stroke-blue-400/45";
    return "stroke-white/15";
  };

  return (
    <g>
      {/* 1. Underlying Tactical Glow Aura (Objective B/D: Cinematic Visuals) */}
      {!isSimplified && (isCompromised || isQuarantined || isRerouted || isUnstable) && (
        <path
          d={pathData}
          fill="none"
          className={cn(
            "transition-all duration-500 stroke-[5px] filter blur-[4px] opacity-25 pointer-events-none",
            isCompromised 
              ? "stroke-state-danger" 
              : isQuarantined 
              ? "stroke-amber-500" 
              : isUnstable 
              ? "stroke-state-warning/60" 
              : "stroke-accent-cyan"
          )}
        />
      )}

      {/* 2. Main High-Contrast Structural Curve Wire */}
      <path
        d={pathData}
        fill="none"
        className={cn("transition-all duration-500", getLineClassName())}
        strokeWidth={strokeWidth}
        strokeDasharray={
          isIsolated 
            ? "1 6" 
            : isQuarantined 
            ? "3 3" 
            : isUnstable 
            ? "2 2" 
            : "none"
        }
      />

      {/* 3. Subtle Overlay Dash Flow (Creates a gentle flowing Tron texture on active links) */}
      {!isSimplified && !isIsolated && !isQuarantined && (
        <path
          d={flowPathData}
          fill="none"
          strokeWidth={strokeWidth}
          className={cn(
            "pointer-events-none opacity-20",
            isCompromised ? "stroke-state-danger" : "stroke-accent-cyan"
          )}
          strokeDasharray="8 12"
          style={{
            animation: isCompromised 
              ? `cyber-flow ${1.0 / visualSettings.speed}s linear infinite` 
              : `cyber-flow ${2.2 / visualSettings.speed}s linear infinite`
          }}
        />
      )}
      
      {/* 4. Directional Telemetry Pulse Packets & Arrowheads */}
      {!isSimplified && !isIsolated && (
        <g className="pointer-events-none">
          
          {/* Active INFECTION / ATTACK lateral movement comet trail */}
          {isCompromised && (
            <g className="text-state-danger-bright">
              {/* Tactical warning chevron leading the attack wave */}
              <path 
                d="M -5,-3 L 1.5,0 L -5,3 L -3.5,0 Z" 
                fill="#ef4444" 
                className="filter drop-shadow-[0_0_5px_#ef4444]"
              >
                <animateMotion
                  dur={`${1.6 / visualSettings.speed}s`}
                  repeatCount="indefinite"
                  path={flowPathData}
                  rotate="auto"
                />
              </path>
              
              {/* Staggered threat particles behind the chevron (staggered comet trail) */}
              {[0, 1, 2].map((i) => (
                <circle
                  key={`threat-trail-${id}-${i}`}
                  r={2.2 - i * 0.5}
                  className="fill-state-danger filter drop-shadow-[0_0_4px_#ef4444]"
                >
                  <animateMotion
                    dur={`${1.6 / visualSettings.speed}s`}
                    repeatCount="indefinite"
                    path={flowPathData}
                    begin={`${i * 0.14}s`}
                  />
                </circle>
              ))}
            </g>
          )}

          {/* QUARANTINE warning signal flow */}
          {isQuarantined && (
            <g className="text-amber-500">
              <path 
                d="M -4,-2 L 1.5,0 L -4,2 L -2.8,0 Z" 
                fill="#f59e0b" 
                className="filter drop-shadow-[0_0_4px_#f59e0b]"
              >
                <animateMotion
                  dur={`${2.2 / visualSettings.speed}s`}
                  repeatCount="indefinite"
                  path={flowPathData}
                  rotate="auto"
                />
              </path>
              <circle r={1.5} className="fill-amber-400">
                <animateMotion
                  dur={`${2.2 / visualSettings.speed}s`}
                  repeatCount="indefinite"
                  path={flowPathData}
                  begin="0.3s"
                />
              </circle>
            </g>
          )}

          {/* HEALTHY standard fiber data flow (Teal / Cyan soft packets) */}
          {!isCompromised && !isQuarantined && !isUnstable && (
            <g className="text-accent-cyan/85">
              {/* Small directional dart */}
              <path 
                d="M -4,-2 L 1,0 L -4,2 L -2.8,0 Z" 
                fill="#00f2ff" 
                className="opacity-55"
              >
                <animateMotion
                  dur={`${3.0 / (visualSettings.speed * (1 + traffic))}s`}
                  repeatCount="indefinite"
                  path={flowPathData}
                  rotate="auto"
                />
              </path>
              
              {/* Secondary tracking dot */}
              <circle
                r={1.2}
                className="fill-accent-cyan/50"
              >
                <animateMotion
                  dur={`${3.0 / (visualSettings.speed * (1 + traffic))}s`}
                  repeatCount="indefinite"
                  path={flowPathData}
                  begin="0.5s"
                />
              </circle>
            </g>
          )}

          {/* UNSTABLE packet jitter flow */}
          {isUnstable && (
            <g className="text-state-warning">
              <circle
                r={1.8}
                className="fill-state-warning filter drop-shadow-[0_0_3px_#f59e0b]"
              >
                <animateMotion
                  dur={`${1.2 / visualSettings.speed}s`}
                  repeatCount="indefinite"
                  path={flowPathData}
                />
              </circle>
            </g>
          )}

        </g>
      )}
    </g>
  );
}, (prev, next) => {
  return (
    prev.sx === next.sx &&
    prev.sy === next.sy &&
    prev.tx === next.tx &&
    prev.ty === next.ty &&
    prev.source.status === next.source.status &&
    prev.target.status === next.target.status &&
    prev.source.id === next.source.id &&
    prev.target.id === next.target.id &&
    prev.source.latency === next.source.latency &&
    prev.target.latency === next.target.latency &&
    prev.showHeatmap === next.showHeatmap &&
    prev.showCommunicationInstability === next.showCommunicationInstability &&
    prev.traffic === next.traffic &&
    prev.riskWeight === next.riskWeight &&
    prev.zoomScale === next.zoomScale
  );
});
