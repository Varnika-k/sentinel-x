import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Server, Shield, Globe, Database, User, ShieldAlert, ShieldCheck, ShieldOff, Lock, Unlock, Key, Cpu, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NetworkNode } from '../../types/network';
import { VisualSettings } from './NetworkGraph';

const TYPE_ICONS = {
  gateway: Globe,
  firewall: Shield,
  server: Server,
  database: Database,
  workstation: User,
  'hr-system': ShieldAlert,
  // Modern Enterprise Relational node type icons
  K8S_SERVICE: Cpu,
  K8S_POD: Server,
  CLOUD_EC2: Server,
  CLOUD_LAMBDA: Cpu,
  CLOUD_S3: Database,
  API_ENDPOINT: Globe,
  USER_IDENTITY: User,
  DEPARTMENT: Users,
  SECRETS_VAULT: Lock,
  user: User,
  identity: User,
  department: Users,
  api: Globe,
  container: Server,
  cloud: Server,
  vault: Lock
};

interface GraphNodeProps {
  node: NetworkNode;
  x: number;
  y: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onNodeClick: (node: NetworkNode) => void;
  onMouseEnter: (node: any) => void;
  onMouseLeave: () => void;
  showSegmentation?: boolean;
  visualSettings?: VisualSettings;
  hideLabel?: boolean;
  activeWorkspace?: string;
}

export const GraphNode = React.memo(({ 
  node, 
  x,
  y,
  isSelected, 
  isHighlighted, 
  onNodeClick, 
  onMouseEnter, 
  onMouseLeave,
  showSegmentation = false,
  visualSettings = {
    intensity: 1,
    speed: 1,
    glow: 1,
    heatmapOpacity: 0.15,
    pulseFrequency: 1
  },
  hideLabel = false,
  activeWorkspace = 'operations'
}: GraphNodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = TYPE_ICONS[node.type as keyof typeof TYPE_ICONS] || Server;
  const isCompromised = node.status === 'compromised' || node.status === 'infected' || node.status === 'critical';
  const isIsolated = node.status === 'isolated';
  const isQuarantined = node.status === 'quarantined';
  const isDegraded = node.status === 'degraded';
  const isCriticalAsset = node.id === 'srv-2' || node.id === 'db-2' || node.id === 'db-1' || node.id === 'soc-metric-collector' || node.id === 'user-identity-vault';

  // Sizing Hierarchy (Objective 5)
  const nodeScale = useMemo(() => {
    if ((node as any).isCluster) return 1.75;
    if (isCriticalAsset) return 1.45; // Critical assets get a distinct maximum structural sizing scale!
    const typeStr = node.type as string;
    if (typeStr === 'database' || typeStr === 'hr-system' || typeStr === 'SECRETS_VAULT' || typeStr === 'vault') return 1.35; // DB & Sensitive Vaults are prominent
    if (typeStr === 'gateway' || typeStr === 'DEPARTMENT' || typeStr === 'department') return 1.30;                               // Border gateways & departments are strategically distinct
    if (typeStr === 'firewall' || typeStr === 'USER_IDENTITY' || typeStr === 'user') return 1.15;                       // Firewalls & users are distinct
    if (typeStr === 'workstation') return 0.90;                         // Lower tier endpoints are small
    return 1.05;                                                          // Servers are standard
  }, [node.type, (node as any).isCluster, isCriticalAsset]);

  const attackColors = {
    ransomware: 'stroke-[#FF0055]',
    ddos: 'stroke-[#FFDD00]',
    phishing: 'stroke-[#00D4FF]',
    insider: 'stroke-[#AA33FF]',
    apt: 'stroke-[#FF6600]',
    'zero-day': 'stroke-[#FFFFFF]',
  };

  const attackColor = node.lastAttackType ? attackColors[node.lastAttackType as keyof typeof attackColors] : 'stroke-state-danger';

  // State Styles Mapper - Restrained, Elite, and Unified
  const getStrokeClass = () => {
    if (isCompromised) return attackColor;
    if (isIsolated) return "stroke-state-iso text-state-iso";
    if (isQuarantined) return "stroke-amber-500 text-amber-500";
    if (isDegraded) return "stroke-rose-400 text-rose-400 stroke-dasharray-[2_2]";
    if (node.complianceStatus === 'non-compliant') return "stroke-rose-500 text-rose-500";
    if (node.complianceStatus === 'warning') return "stroke-amber-400 text-amber-400";
    if (isHighlighted) return "stroke-state-warning";
    return "stroke-border-bright text-accent-cyan";
  };

  // Get segmentation segment definitions
  const isDmz = node.type === 'gateway' || node.type === 'firewall';
  const isDatabaseVault = node.type === 'database' || node.type === 'hr-system';

  const getSegmentationColor = () => {
    if (isDmz) return "stroke-accent-blue/35 text-accent-blue";
    if (isDatabaseVault) return "stroke-state-warning/35 text-state-warning";
    return "stroke-emerald-500/35 text-emerald-500";
  };

  const getSegmentationLabel = () => {
    if (isDmz) return "DMZ_ALPHA";
    if (isDatabaseVault) return "DB_VAULT_SECURE";
    return "LAN_ZONE";
  };

  const radiusOuter = 14 * nodeScale;
  const radiusInner1 = 11 * nodeScale;
  const radiusInner2 = 9 * nodeScale;

  // Render clean unified status badge at the top (avoiding overlaps and visual clutter)
  const renderStatusBadge = () => {
    if (isCompromised) {
      return (
        <g transform={`translate(0, -${radiusOuter + 14})`} className="pointer-events-none">
          <rect x="-32" y="-5" width="64" height="10" rx="1.5" className="fill-[#020408]/90 stroke-state-danger stroke-[1px] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <text textAnchor="middle" y="2" className="fill-state-danger font-mono text-[5.5px] font-black tracking-widest animate-pulse">
            🚨 OUTBREAK
          </text>
        </g>
      );
    }
    if (isQuarantined) {
      return (
        <g transform={`translate(0, -${radiusOuter + 14})`} className="pointer-events-none">
          <rect x="-38" y="-5" width="76" height="10" rx="1.5" className="fill-[#020408]/90 stroke-amber-500 stroke-[1px] shadow-[0_0_6px_rgba(245,158,11,0.2)]" />
          <text textAnchor="middle" y="2" className="fill-amber-500 font-mono text-[5px] font-black tracking-widest">
            🛡️ QUARANTINED
          </text>
        </g>
      );
    }
    if (isIsolated) {
      return (
        <g transform={`translate(0, -${radiusOuter + 14})`} className="pointer-events-none">
          <rect x="-30" y="-5" width="60" height="10" rx="1.5" className="fill-[#020408]/90 stroke-state-iso stroke-[1px]" />
          <text textAnchor="middle" y="2" className="fill-state-iso font-mono text-[5px] font-black tracking-widest">
            💤 ISOLATED
          </text>
        </g>
      );
    }
    if (activeWorkspace === 'forensics' && (isHovered || isSelected)) {
      return (
        <g transform={`translate(0, -${radiusOuter + 14})`} className="pointer-events-none">
          <rect x="-38" y="-5" width="76" height="10" rx="1.5" className="fill-[#020408]/95 stroke-amber-500/40 stroke-[0.5px] shadow-[0_0_6px_rgba(245,158,11,0.2)]" />
          <text textAnchor="middle" y="2" className="fill-amber-400 font-mono text-[5px] font-black tracking-widest">
            🔒 REPLAY LOCK
          </text>
        </g>
      );
    }
    return null;
  };

  const nodeLabelText = useMemo(() => {
    if (node.latency && node.latency > 10 && !isCompromised) {
      return `${node.label} // ${node.latency}ms`;
    }
    return node.label;
  }, [node.label, node.latency, isCompromised]);

  return (
    <g 
      transform={`translate(${x || 0}, ${y || 0})`}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node);
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        onMouseEnter(node);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onMouseLeave();
      }}
      className="node-group cursor-pointer"
    >
      {/* Elevated Selected Node Pulsing Neon Glow */}
      {isSelected && (
        <g className="pointer-events-none">
          <motion.circle
            r={radiusOuter + 10}
            className="fill-accent-cyan/15 stroke-accent-cyan/35 stroke-[1.5px] filter blur-md"
            animate={{
              scale: [0.95, 1.15, 0.95],
              opacity: [0.75, 1, 0.75]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <circle
            r={radiusOuter + 4}
            className="fill-none stroke-accent-cyan/50 stroke-[1.5px] filter blur-[1px]"
          />
        </g>
      )}

      {/* Dynamic Heat Aura & Outbreak Expansion Rings */}
      {isCompromised && (
        <g className="pointer-events-none">
          {/* Outer glowing pulsing danger bubble */}
          <motion.circle
            r={radiusOuter * 2.8}
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.12, 0.45, 0.12]
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="fill-state-danger/10 blur-xl"
          />
          {/* Concentric expanding telemetry warning ripples */}
          <motion.circle
            r={radiusOuter}
            animate={{
              r: [radiusOuter, radiusOuter * 2.4],
              opacity: [0.6, 0]
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="fill-none stroke-state-danger stroke-[1.5px]"
          />
        </g>
      )}

      {/* Threat Aura (Background Glow) */}
      {(node.threatScore > 0 || isDegraded || isQuarantined) && !isCompromised && (
        <motion.circle
          r={(15 + (node.threatScore / 100) * 15) * nodeScale * visualSettings.intensity}
          animate={{
            opacity: [0.06, 0.18 * ((node.threatScore || 40) / 100) * visualSettings.glow, 0.06],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: (4 - ((node.threatScore || 40) / 100) * 2) / visualSettings.speed,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn(
            "pointer-events-none blur-md",
            node.threatScore > 75 ? "fill-state-danger/70" : 
            isQuarantined ? "fill-amber-500/25" :
            isDegraded ? "fill-rose-400/25" :
            node.threatScore > 40 ? "fill-state-warning/60" : "fill-accent-cyan/15"
          )}
        />
      )}

      {/* Warning / Latency overlays */}
      {renderStatusBadge()}

      {/* Sensitive Repository (Secret / PII lock badge on the node) */}
      {(node.containsSecrets || node.sensitivityLevel === 'high' || node.sensitivityLevel === 'critical') && (
        <g transform={`translate(${radiusOuter + 2}, -${radiusOuter + 2})`} className="pointer-events-none">
          {/* Subtle gold backing light */}
          <circle r="6" className="fill-[#020408] stroke-yellow-500/80 stroke-[1px] shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
          <foreignObject x="-3.5" y="-3.5" width="7" height="7">
            <div className="w-full h-full text-yellow-500 flex items-center justify-center">
              <Lock size={5} strokeWidth={2.5} />
            </div>
          </foreignObject>
        </g>
      )}

      {/* Abnormal Identity/Data Access Indicators */}
      {(node.abnormalAccessScore && node.abnormalAccessScore > 35) && (
        <g className="pointer-events-none">
          {/* Glowing dashed rotation tracker representing potential lateral movement threat */}
          <motion.circle
            r={radiusOuter + 5}
            fill="none"
            stroke="#f43f5e"
            strokeWidth={1}
            strokeDasharray="3 5"
            animate={{ rotate: 360 }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          />
          {/* Micro text flag for unauthorized access audits */}
          <text
            y={-radiusOuter - 18}
            textAnchor="middle"
            className="fill-rose-500 font-mono text-[4.5px] font-black tracking-widest uppercase animate-pulse"
          >
            ⚠️ DATA_LOCKOUT
          </text>
        </g>
      )}

      {/* Degradation Arc (visual pressure indicator around node) */}
      {node.degradation && node.degradation > 0 && (
        <circle
          r={radiusOuter + 4}
          className="fill-none stroke-rose-500/20 stroke-[1.5px] pointer-events-none"
          strokeDasharray="150"
          strokeDashoffset={150 - (150 * node.degradation) / 100}
        />
      )}

      {/* Critical Asset Emphasis Indicators */}
      {isCriticalAsset && (
        <g className="pointer-events-none">
          {/* Intense Outer Golden/Red Pulsing High-Severity Indicator ring */}
          <motion.circle
            r={radiusOuter + 5}
            className="fill-none stroke-amber-500/50 stroke-[1.8px] stroke-dasharray-[3_3]"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r={radiusOuter + 9}
            className="fill-none stroke-[#f59e0b]/20 stroke-[1px]"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Visual Crown or Special Star Icon overlay or Badge at top */}
          <g transform={`translate(${radiusOuter - 2}, -${radiusOuter - 2})`}>
            <circle r="4.5" className="fill-[#f59e0b] stroke-[#020408] stroke-[1px] shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            <text textAnchor="middle" y="2" className="fill-[#020408] font-bold text-[6px] font-mono leading-none">
              ★
            </text>
          </g>
        </g>
      )}

      {/* Operational Segmentation Boundary Halos */}
      {showSegmentation && (
        <circle
          r={radiusOuter + 6}
          className={cn("fill-none stroke-[1px] stroke-dasharray-[2_2] pointer-events-none", getSegmentationColor())}
        />
      )}

      {/* Isolation / Quarantine Ripple */}
      <AnimatePresence>
        {(isIsolated || isQuarantined) && (
          <motion.circle
            initial={{ r: radiusOuter, opacity: 0 }}
            animate={{ r: [radiusOuter, radiusOuter + 14, radiusOuter], opacity: [0, 0.35, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
            className={cn(
              "fill-none stroke-[1px] pointer-events-none",
              isQuarantined ? "stroke-amber-500" : "stroke-accent-cyan"
            )}
          />
        )}
      </AnimatePresence>

      {/* Highlight Glow */}
      <AnimatePresence>
        {(isHighlighted || isHovered) && (
          <motion.circle
            initial={{ r: radiusOuter, opacity: 0 }}
            animate={{ r: radiusOuter + 8, opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="fill-state-warning mix-blend-screen pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Active Defense / Forensics Tactical Boundaries (Objective 7) */}
      {activeWorkspace === 'defense' && (isIsolated || isQuarantined || isCompromised) && (
        <g>
          <motion.circle
            r={radiusOuter + 8}
            className={cn(
              "fill-none stroke-[1.2px] pointer-events-none stroke-dasharray-[4_3]",
              isCompromised ? "stroke-state-danger/60" : isQuarantined ? "stroke-amber-500/60" : "stroke-state-iso/60"
            )}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </g>
      )}

       {/* Label and Segment Markers (Objective 4: Offset, backdrop, collide-safe) */}
      {(!hideLabel || isHovered || isSelected || isCompromised) && (
        <g transform={`translate(0, ${radiusOuter + 14})`} className="pointer-events-none select-none">
           {/* High contrast Cartographic text background outline */}
           <text
             textAnchor="middle"
             stroke="#020408"
             strokeWidth="4"
             strokeLinejoin="round"
             className="text-[8px] font-semibold tracking-[0.15em] font-mono select-none uppercase fill-none"
           >
             {nodeLabelText}
           </text>
           <text
             textAnchor="middle"
             className={cn(
               "text-[8px] font-mono font-semibold tracking-[0.15em] uppercase select-none transition-all duration-300",
               isCompromised ? "fill-state-danger" : isSelected ? "fill-accent-cyan" : "fill-text-secondary"
             )}
           >
             {nodeLabelText}
           </text>
           {showSegmentation && (
             <text
               textAnchor="middle"
               y="8"
               className={cn("text-[5.5px] font-mono font-bold tracking-[0.08em] pointer-events-none", getSegmentationColor())}
             >
               {getSegmentationLabel()}
             </text>
           )}
           {isSelected && (
             <motion.rect
               layoutId="node-underline"
               x="-12"
               y="11"
               width="24"
               height="1.5"
               className="fill-accent-cyan"
             />
           )}
        </g>
      )}

      {/* Node Framing (Precision Corners/Crosshairs) */}
      <AnimatePresence>
        {(isSelected || isCompromised) && (
          <motion.g
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
          >
            <path d={`M-${radiusOuter + 2} -${radiusOuter + 2} L-${radiusOuter - 3} -${radiusOuter + 2} M-${radiusOuter + 2} -${radiusOuter + 2} L-${radiusOuter + 2} -${radiusOuter - 3}`} className="stroke-accent-cyan/60 stroke-[1px] fill-none" />
            <path d={`M${radiusOuter + 2} -${radiusOuter + 2} L${radiusOuter - 3} -${radiusOuter + 2} M${radiusOuter + 2} -${radiusOuter + 2} L${radiusOuter + 2} -${radiusOuter - 3}`} className="stroke-accent-cyan/60 stroke-[1px] fill-none" />
            <path d={`M-${radiusOuter + 2} ${radiusOuter + 2} L-${radiusOuter - 3} ${radiusOuter + 2} M-${radiusOuter + 2} ${radiusOuter + 2} L-${radiusOuter + 2} ${radiusOuter - 3}`} className="stroke-accent-cyan/60 stroke-[1px] fill-none" />
            <path d={`M${radiusOuter + 2} ${radiusOuter + 2} L${radiusOuter - 3} ${radiusOuter + 2} M${radiusOuter + 2} ${radiusOuter + 2} L${radiusOuter + 2} ${radiusOuter - 3}`} className="stroke-accent-cyan/60 stroke-[1px] fill-none" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Outer Ring */}
      <motion.circle
        r={radiusOuter}
        animate={{
          strokeOpacity: isCompromised ? [0.4, 0.9, 0.4] : (isSelected || isHighlighted || isHovered) ? 1 : 0.25
        }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          "fill-void stroke-[1.5px] transition-colors duration-500",
          getStrokeClass()
        )}
      />

      {/* Cluster Outer Atmospheric Rings */}
      {(node as any).isCluster && (
        <g className="pointer-events-none">
          <motion.circle
            r={radiusOuter + 6}
            fill="none"
            className={cn(
              "stroke-[1px]",
              isCompromised ? "stroke-state-danger/70" : "stroke-accent-cyan/60"
            )}
            strokeDasharray="5 5"
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r={radiusOuter + 10}
            fill="none"
            className={cn(
              "stroke-[0.75px] opacity-40",
              isCompromised ? "stroke-state-danger/50" : "stroke-accent-cyan/30"
            )}
            strokeDasharray="2 10"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          {/* Cluster node tag counter inside the ring background */}
          <g transform={`translate(0, -${radiusOuter + 16})`}>
            <rect
              x="-28"
              y="-5"
              width="56"
              height="10"
              rx="2"
              className={cn(
                "fill-void/90 stroke-[1px]  ",
                isCompromised ? "stroke-state-danger/30" : "stroke-white/10"
              )}
            />
            <text
              textAnchor="middle"
              y="2"
              className={cn(
                "font-mono text-[4.5px] font-extrabold uppercase tracking-widest",
                isCompromised ? "fill-state-danger animate-pulse" : "fill-accent-cyan"
              )}
            >
              {(node as any).childAssetsCount || 0} ASSETS
            </text>
          </g>
        </g>
      )}

      {/* Hexagonal Inner Frames */}
      <circle r={radiusInner1} className="fill-void stroke-white/5 stroke-[1px]" />
      <circle r={radiusInner2} className="fill-void stroke-white/10 stroke-[1px]" />

      {/* Selection pulses */}
      <AnimatePresence>
        {isSelected && (
          <motion.circle
            initial={{ r: radiusOuter, opacity: 1 }}
            animate={{ r: radiusOuter + 14, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            className="fill-none stroke-accent-cyan stroke-[0.5px] pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Icon Wrapper matching responsive scaling size */}
      <g className={cn(
        "transition-all duration-300",
        (isSelected || isHovered) ? "scale-105" : "scale-100"
      )}>
        <foreignObject x="-6" y="-6" width="12" height="12" className="pointer-events-none select-none">
          <div className={cn(
            "w-full h-full flex items-center justify-center transition-colors duration-500",
            isCompromised ? "text-state-danger" : 
            isIsolated ? "text-state-iso" : 
            isQuarantined ? "text-amber-500" :
            isDegraded ? "text-rose-400" :
            (isSelected || isHovered) ? "text-accent-cyan" : "text-white/35"
          )}>
            <Icon size={9} strokeWidth={(isSelected || isHovered) ? 2.5 : 2} />
          </div>
        </foreignObject>
      </g>

      {/* Micro Status Indicators (Data Trapping Nodes) */}
      {(isSelected || isHovered) && (
        <g className="pointer-events-none">
           <circle cx={radiusOuter} cy="0" r="1.2" className="fill-accent-cyan" />
           <circle cx={-radiusOuter} cy="0" r="1.2" className="fill-accent-cyan" />
        </g>
      )}
    </g>
  );
}, (prev, next) => {
  return (
    prev.x === next.x &&
    prev.y === next.y &&
    prev.node.status === next.node.status &&
    prev.node.threatScore === next.node.threatScore &&
    (prev.node as any).isCluster === (next.node as any).isCluster &&
    (prev.node as any).childAssetsCount === (next.node as any).childAssetsCount &&
    prev.isSelected === next.isSelected &&
    prev.isHighlighted === next.isHighlighted &&
    prev.showSegmentation === next.showSegmentation &&
    prev.hideLabel === next.hideLabel
  );
});
