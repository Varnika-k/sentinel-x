import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as d3 from 'd3';
import { NetworkNode, NetworkLink, SectorType, SECTOR_NAMES, getNodeSector } from '../../types/network';
import { cn } from '../../lib/utils';
import { 
  ShieldAlert, ShieldCheck, ShieldOff, Activity, Compass, 
  Crosshair, Cpu, Clock, Layers, Shield, Sparkles, Terminal
} from 'lucide-react';
import { GraphNode } from './GraphNode';
import { GraphLink } from './GraphLink';
import { CyberGrid } from './CyberGrid';

interface D3Node extends NetworkNode, d3.SimulationNodeDatum {
  x: number;
  y: number;
}
interface D3Link extends Omit<NetworkLink, 'source' | 'target'>, d3.SimulationLinkDatum<D3Node> {
  source: D3Node;
  target: D3Node;
}

export const SECTOR_ANCHORS: Record<SectorType, { x: number; y: number }> = {
  PERIMETER: { x: -220, y: 160 },
  IDENTITY: { x: -50, y: 350 },
  CLOUD: { x: -20, y: -130 },
  PRODUCTION: { x: 190, y: -20 },
  DATA_CORE: { x: 390, y: -30 },
  OBSERVABILITY: { x: 160, y: -180 },
  DEV_LAB: { x: 260, y: 270 },
  ISOLATION_ZONE: { x: 620, y: 300 } // Physically separated containment ward
};

export interface VisualSettings {
  intensity: number;
  speed: number;
  glow: number;
  heatmapOpacity: number;
  pulseFrequency: number;
  collisionRadius?: number;
  graphForce?: number;
}

export function NetworkGraph({ 
  nodes, 
  links, 
  onNodeClick,
  selectedNodeId,
  highlightedNodeId,
  highlightedPaths,
  showHeatmap = false,
  showSegmentation = false,
  showCommunicationInstability = false,
  isReplay = false,
  visualSettings = {
    intensity: 1,
    speed: 1,
    glow: 1,
    heatmapOpacity: 0.15,
    pulseFrequency: 1,
    collisionRadius: 25,
    graphForce: -300
  },
  leftOffset = 0,
  rightOffset = 0,
  activeWorkspace = 'operations',
  threatLevel = 'low'
}: { 
  nodes: NetworkNode[], 
  links: NetworkLink[],
  onNodeClick: (node: NetworkNode | null) => void,
  selectedNodeId?: string,
  highlightedNodeId?: string | null,
  highlightedPaths?: string[][],
  showHeatmap?: boolean,
  showSegmentation?: boolean,
  showCommunicationInstability?: boolean,
  isReplay?: boolean,
  visualSettings?: VisualSettings,
  leftOffset?: number,
  rightOffset?: number,
  activeWorkspace?: string,
  threatLevel?: 'low' | 'medium' | 'high' | 'critical'
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [simulationNodes, setSimulationNodes] = useState<D3Node[]>([]);
  const [simulationLinks, setSimulationLinks] = useState<D3Link[]>([]);
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const [prevIdsKey, setPrevIdsKey] = useState<string>('');

  const resolveNodeAnchorPosition = useCallback((node: any) => {
    if (node.status === 'isolated' || node.status === 'quarantined') {
      return SECTOR_ANCHORS['ISOLATION_ZONE'] || { x: 620, y: 300 };
    }
    const sector = getNodeSector(node);
    return SECTOR_ANCHORS[sector] || { x: 0, y: 0 };
  }, []);

  const highlightedNodeIdsOnHover = useMemo(() => {
    if (!hoveredNode) return null;
    const ids = new Set<string>();
    ids.add(hoveredNode.id);
    links.forEach(l => {
      const srcId = typeof l.source === 'string' ? l.source : (l.source as any).id;
      const tgtId = typeof l.target === 'string' ? l.target : (l.target as any).id;
      if (srcId === hoveredNode.id) ids.add(tgtId);
      if (tgtId === hoveredNode.id) ids.add(srcId);
    });
    return ids;
  }, [hoveredNode, links]);

  const checkIsInViewport = useCallback((x?: number, y?: number) => {
    if (x === undefined || y === undefined) return true;
    const cx = x * transform.k + transform.x;
    const cy = y * transform.k + transform.y;
    const pad = 100; // boundary padding margin for safe rendering frame
    return cx >= -pad && cx <= viewportSize.width + pad && cy >= -pad && cy <= viewportSize.height + pad;
  }, [transform.k, transform.x, transform.y, viewportSize.width, viewportSize.height]);

  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);

  // Cluster Sector Label Positioning Helper
  const resolveNodeSector = useCallback((node: any): SectorType => {
    if (node.status === 'isolated' || node.status === 'quarantined') {
      return 'ISOLATION_ZONE';
    }
    return getNodeSector(node);
  }, []);

  const handleMouseEnter = useCallback((node: D3Node) => setHoveredNode(node), []);
  const handleMouseLeave = useCallback(() => setHoveredNode(null), []);

  const handleNodeClick = useCallback((clickedNode: any) => {
    onNodeClick(clickedNode);
  }, [onNodeClick]);

  const getVisibleProxyNode = useCallback((nodeId: string) => {
    return simulationNodes.find(n => n.id === nodeId);
  }, [simulationNodes]);

  const currentIdsKey = useMemo(() => {
    return nodes.map(n => n.id).sort().join(',');
  }, [nodes]);

  // Master reactive synchronization effect that handles initial mounting, node filtering, status updates, dimming, and replay transitions perfectly.
  useEffect(() => {
    const validNodes = nodes.filter(n => n && n.id);
    const currentSimNodes = simulationRef.current ? simulationRef.current.nodes() : [];
    
    const d3Nodes: D3Node[] = validNodes.map(n => {
      const existing = currentSimNodes.find(en => en.id === n.id);
      if (existing) {
        // Retain current position/velocity coordinates while merging active changes like status, dims, risk, and isDimmed
        return Object.assign(existing, n);
      }
      
      // Default fallback anchors depending on node structure
      const targetAnchor = resolveNodeAnchorPosition(n);
      return { 
        ...n, 
        x: targetAnchor.x + (Math.random() - 0.5) * 15, 
        y: targetAnchor.y + (Math.random() - 0.5) * 15 
      } as D3Node;
    });

    const d3Links: D3Link[] = links
      .map(l => {
        if (!l) return null;
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as any)?.id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as any)?.id;
        
        const sourceNode = d3Nodes.find(n => n.id === sourceId);
        const targetNode = d3Nodes.find(n => n.id === targetId);
        
        if (!sourceNode || !targetNode) return null;
        
        return {
          ...l,
          source: sourceNode,
          target: targetNode
        } as D3Link;
      })
      .filter((l): l is D3Link => l !== null);

    const isStructuralChange = currentIdsKey !== prevIdsKey;

    if (!simulationRef.current) {
      setPrevIdsKey(currentIdsKey);
      const simulation = d3.forceSimulation<D3Node>(d3Nodes)
        .force("link", d3.forceLink<D3Node, D3Link>(d3Links).id(d => d?.id || "").distance(110))
        .force("charge", d3.forceManyBody().strength(visualSettings.graphForce !== undefined ? visualSettings.graphForce - 200 : -450))
        .force("center", d3.forceCenter(130, 110))
        .force("x", d3.forceX<D3Node>().x(d => resolveNodeAnchorPosition(d).x).strength(0.28))
        .force("y", d3.forceY<D3Node>().y(d => resolveNodeAnchorPosition(d).y).strength(0.28))
        .force("collision", d3.forceCollide<D3Node>().radius(d => {
          const baseRadius = d.type === 'database' || d.type === 'hr-system' ? 38 : d.type === 'gateway' ? 34 : 24;
          return baseRadius * 1.5;
        }).iterations(10));

      // Warm-up/pre-stabilize simulation so replay doesn't drift or twitch chaotically
      for (let i = 0; i < 95; ++i) {
        simulation.tick();
      }

      simulation.on("tick", () => {
        setSimulationNodes([...simulation.nodes()]);
        const linkForce = simulation.force("link") as d3.ForceLink<D3Node, D3Link>;
        const currentLinks = linkForce ? (linkForce.links() || []) : [];
        setSimulationLinks([...currentLinks]);
      });

      simulationRef.current = simulation;
      setSimulationNodes([...d3Nodes]);
      setSimulationLinks([...d3Links]);
    } else {
      if (isStructuralChange) {
        setPrevIdsKey(currentIdsKey);
        simulationRef.current.nodes(d3Nodes);
        const linkForce = simulationRef.current.force("link") as d3.ForceLink<D3Node, D3Link>;
        if (linkForce) {
          linkForce.links(d3Links);
        }
        
        // Secure state alignment
        setSimulationNodes([...d3Nodes]);
        setSimulationLinks([...d3Links]);

        if (isReplay) {
          simulationRef.current.stop();
        } else {
          simulationRef.current.alpha(0.35).restart();
        }
      } else {
        // Safe, seamless attribute-only sync (e.g. status, threatScore, dimensions, latency, monitoringLevel etc.)
        const currentSimNodes = simulationRef.current.nodes();
        currentSimNodes.forEach(en => {
          const match = d3Nodes.find(dn => dn.id === en.id);
          if (match) {
            Object.assign(en, match);
          }
        });
        
        setSimulationNodes([...currentSimNodes]);
      }
    }
  }, [nodes, links, isReplay, resolveNodeAnchorPosition, currentIdsKey, prevIdsKey]);

  // Dynamic D3 Force Sync & Velocity Synchronization in real behavior
  useEffect(() => {
    if (!simulationRef.current || isReplay) return;

    const charge = simulationRef.current.force("charge") as d3.ForceManyBody<D3Node>;
    if (charge) {
      charge.strength(visualSettings.graphForce !== undefined ? visualSettings.graphForce - 200 : -450);
    }

    const collision = simulationRef.current.force("collision") as d3.ForceCollide<D3Node>;
    if (collision) {
      collision.radius(d => {
        return visualSettings.collisionRadius !== undefined ? visualSettings.collisionRadius * 1.5 : 32;
      });
    }

    const xForce = simulationRef.current.force("x") as d3.ForceX<D3Node>;
    if (xForce) {
      xForce.x(d => resolveNodeAnchorPosition(d).x).strength(0.28);
    }
    const yForce = simulationRef.current.force("y") as d3.ForceY<D3Node>;
    if (yForce) {
      yForce.y(d => resolveNodeAnchorPosition(d).y).strength(0.28);
    }

    const baseDecay = 0.0228;
    const speedFactor = visualSettings.speed !== undefined ? visualSettings.speed : 1;
    simulationRef.current.alphaDecay(baseDecay * speedFactor);
    simulationRef.current.alpha(0.35).restart();
  }, [
    visualSettings.collisionRadius,
    visualSettings.graphForce,
    visualSettings.speed,
    isReplay,
    resolveNodeAnchorPosition
  ]);

  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Zoom and Drag behavior
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => setTransform(event.transform));

    zoomBehaviorRef.current = zoomBehavior;
    svg.call(zoomBehavior);

    // Global click listener to safely deselect when clicking the empty canvas/background
    svg.on("click", (event) => {
      // D3 Zoom automatically sets state to reflect drag gestures.
      // If event.defaultPrevented is true, we know this click event was generated 
      // by a drag-to-pan / drag-to-zoom gesture and should be ignored!
      if (event.defaultPrevented) return;

      const target = event.target as SVGElement;
      if (
        target === svgRef.current || 
        target.classList.contains('bg-click-catcher') || 
        target.tagName === 'svg'
      ) {
        onNodeClick(null);
      }
    });

    // Responsive centering (measures size)
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const currentWidth = rect.width || 800;
      const currentHeight = rect.height || 600;
      setViewportSize({ width: currentWidth, height: currentHeight });
    };

    updateSize();
    
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      svg.on("click", null);
    };
  }, [onNodeClick]);

  // Elite Dynamic Centering & Adaptive Auto-Panning
  useEffect(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const currentWidth = viewportSize.width || 800;
    const currentHeight = viewportSize.height || 600;
    
    // Compute remaining visible tactical area width & horizontal center
    const openWidth = currentWidth - leftOffset - rightOffset;
    const centerX = leftOffset + openWidth / 2;
    const centerY = currentHeight / 2;
    
    // Default base scale
    let scale = 1.15;
    let targetX = 130;
    let targetY = 110;

    // Intelligent zoom density scaling & camera tracking
    const focusNode = simulationNodes.find(n => n.id === selectedNodeId) || 
                      simulationNodes.find(n => n.id === highlightedNodeId);

    if (focusNode && focusNode.x !== undefined && focusNode.y !== undefined) {
      // Zoom in closely on selected/threatened nodes for deep inspection
      scale = 1.55;
      targetX = focusNode.x;
      targetY = focusNode.y;
    } else if (simulationNodes.some(n => n.status === 'compromised')) {
      // Pull back to showcase spreading infection throughout subnets
      scale = 0.88;
      const compromisedNodes = simulationNodes.filter(n => n.status === 'compromised');
      const meanX = d3.mean(compromisedNodes, n => n.x ?? 130) ?? 130;
      const meanY = d3.mean(compromisedNodes, n => n.y ?? 110) ?? 110;
      targetX = meanX;
      targetY = meanY;
    } else if (activeWorkspace === 'defense') {
      // Defense workspace overview scale
      scale = 1.05;
    }

    const tx = centerX - targetX * scale;
    const ty = centerY - targetY * scale;
    
    // Run a smooth transition to center the graph in the unoccupied screen space
    svg.transition()
      .duration(900)
      .ease(d3.easeCubicInOut)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }, [leftOffset, rightOffset, selectedNodeId, highlightedNodeId, activeWorkspace, viewportSize.width, viewportSize.height, simulationNodes.length]);

  const nodeIdsHash = useMemo(() => {
    return simulationNodes.map(n => n.id).join(',');
  }, [simulationNodes]);

  // Drag on nodes
  useEffect(() => {
    if (!svgRef.current || simulationNodes.length === 0 || !simulationRef.current) return;
    const svg = d3.select(svgRef.current);
    const nodesSelection = svg.selectAll<SVGElement, D3Node>(".node-group")
      .data(simulationNodes.filter(n => n && n.id), (d: any) => d?.id || "");

    const dragBehavior = d3.drag<SVGElement, D3Node>()
      .on("start", (event, d) => {
        if (!d) return;
        if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on("drag", (event, d) => {
        if (!d) return;
        d.fx = event.x; d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!d) return;
        if (!event.active) simulationRef.current?.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodesSelection.call(dragBehavior);
  }, [nodeIdsHash]);

  // Viewport-aware tooltip positioning system
  const tooltipStyle = useMemo(() => {
    if (!hoveredNode || hoveredNode.x === undefined || hoveredNode.y === undefined || !containerRef.current) {
      return null;
    }

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    const posX = hoveredNode.x * transform.k + transform.x;
    const posY = hoveredNode.y * transform.k + transform.y;

    const tooltipWidth = 220; 
    const tooltipHeight = 160;

    let targetLeft = posX;
    let targetTop = posY - tooltipHeight;
    let isBelow = false;

    // Shift tooltip to are-below position if rendering too high (prevents clipping/offscreen overlaps)
    if (targetTop < 20) {
      targetTop = posY + 32; 
      isBelow = true;
    }

    // Shift sideways if clipping outside horizontal viewport boundaries (15px padding margin)
    const minLeft = tooltipWidth / 2 + 15;
    const maxLeft = width - (tooltipWidth / 2 + 15);
    if (targetLeft < minLeft) {
      targetLeft = minLeft;
    } else if (targetLeft > maxLeft) {
      targetLeft = maxLeft;
    }

    // Vertical clamping safeguard when forced below
    if (isBelow && targetTop + tooltipHeight > height - 15) {
      targetTop = Math.max(15, height - tooltipHeight - 15);
    }

    // Calculate Arrow's relative offset so it points directly at the relative node position
    const arrowOffset = posX - targetLeft;
    const maxArrowOffset = tooltipWidth / 2 - 20;
    const arrowLeft = `calc(50% + ${Math.max(-maxArrowOffset, Math.min(maxArrowOffset, arrowOffset))}px)`;

    return {
      left: targetLeft,
      top: targetTop,
      arrowLeft,
      arrowClass: isBelow 
        ? "top-[-6px] border-l border-t border-border-bright/30 rotate-45" 
        : "bottom-[-6px] border-r border-b border-border-bright/30 rotate-45"
    };
  }, [hoveredNode, transform, simulationNodes]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-void overflow-hidden">
      <CyberGrid activeWorkspace={activeWorkspace} threatLevel={threatLevel} />
      
      {/* Edge Vignette */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

      {/* Advanced Immersive Tactical HUD Overlays (Objective F) */}
      <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-6 select-none font-mono">
        <div className="w-full flex justify-between items-start">
          {/* Top Left: Precise Mode Core */}
          <motion.div 
            key={activeWorkspace}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-panel p-3 border-l-2 border-l-accent-cyan flex flex-col gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] max-w-[320px]"
          >
            <div className="flex items-center gap-2">
              {activeWorkspace === 'operations' && <Activity size={12} className="text-accent-cyan animate-pulse" />}
              {activeWorkspace === 'forensics' && <Clock size={12} className="text-amber-500" />}
              {activeWorkspace === 'defense' && <Shield size={12} className="text-emerald-500 animate-pulse" />}
              {activeWorkspace === 'twin' && <Cpu size={12} className="text-yellow-500" />}
              {activeWorkspace === 'ai' && <Terminal size={12} className="text-accent-blue animate-pulse" />}
              
              <span className={cn(
                "text-[10px] font-black tracking-widest uppercase",
                activeWorkspace === 'operations' && "text-white",
                activeWorkspace === 'forensics' && "text-amber-400",
                activeWorkspace === 'defense' && "text-emerald-400",
                activeWorkspace === 'twin' && "text-yellow-400",
                activeWorkspace === 'ai' && "text-accent-blue"
              )}>
                {activeWorkspace === 'operations' && "POSTURE: GRID_MONITOR"}
                {activeWorkspace === 'forensics' && "POSTURE: INCIDENT_FORENSICS"}
                {activeWorkspace === 'defense' && "POSTURE: ACTIVE_DEFENSE_OPS"}
                {activeWorkspace === 'twin' && "POSTURE: PREDICTIVE_LAB"}
                {activeWorkspace === 'ai' && "POSTURE: COGNITIVE_REASONING"}
              </span>
            </div>

            <p className="text-[7.5px] leading-relaxed text-text-secondary">
              {activeWorkspace === 'operations' && "Topological live map of enterprise network fabric and current cluster traffic density."}
              {activeWorkspace === 'forensics' && "Temporal freeze activated. Telemetry query channels configured for retro-causal tracing."}
              {activeWorkspace === 'defense' && "Containment boundary overlays rendered. Cyber quarantine firewalls primed."}
              {activeWorkspace === 'twin' && "Synthesizing prospective failure tipping points and lateral attack routes."}
              {activeWorkspace === 'ai' && "Co-processor assessing system blast radius and multi-stage MITRE ATT&CK lineages."}
            </p>

            <div className="flex items-center gap-3 border-t border-white/5 pt-1.5 mt-0.5 text-[7px] text-text-tertiary">
              <span className="flex items-center gap-1">
                <span className={cn(
                  "w-1 h-1 rounded-full",
                  activeWorkspace === 'operations' ? "bg-accent-cyan/95 animate-pulse" :
                  activeWorkspace === 'forensics' ? "bg-amber-400" :
                  activeWorkspace === 'defense' ? "bg-emerald-400 animate-pulse" :
                  activeWorkspace === 'twin' ? "bg-yellow-400" : "bg-accent-blue animate-pulse"
                )} />
                STATUS: {
                  activeWorkspace === 'operations' ? "SYNCHRONIZED" :
                  activeWorkspace === 'forensics' ? "STABILIZED" :
                  activeWorkspace === 'defense' ? "ARMED" :
                  activeWorkspace === 'twin' ? "MODELING" : "REASONING"
                }
              </span>
              <span>SENSORS: 18/18</span>
            </div>
          </motion.div>

          {/* Top Right: Systemic Integrity Monitor */}
          <div className="flex flex-col items-end gap-1.5 text-right font-mono p-3 bg-panel/30 border border-border/40 rounded-sm">
            <span className="text-[7px] tracking-widest text-text-tertiary font-bold uppercase">Blast Probability Engine</span>
            <span className={cn(
              "text-[10px] font-bold tracking-tight",
              threatLevel === 'critical' ? "text-state-danger animate-pulse" :
              threatLevel === 'high' ? "text-state-warning" : "text-state-safe"
            )}>
              {threatLevel === 'critical' ? "CRITICAL SYSTEMIC SPILLOVER" : 
               threatLevel === 'high' ? "LATERAL COLLAPSE IMMINENT" : 
               "PERIMETER PROTECTION RATED SECURE"}
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-[6.5px] text-text-secondary">
               <span>LATERAL_PROB: {(threatLevel === 'critical' ? 95 : threatLevel === 'high' ? 62 : 12)}%</span>
               <span className="text-white/20">|</span>
               <span>INTEGRITY_INDEX: {(threatLevel === 'critical' ? 'RED_PULSE' : threatLevel === 'high' ? 'DEGRADED_ORANGE' : 'STABLE_TEAL')}</span>
            </div>
          </div>
        </div>



        {/* Tactical Crosshair Marks for Military-Grade Immersiveness (Objective C) */}
        <div className="absolute top-4 left-4 w-4 h-4 border-l border-t border-accent-cyan/25 pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-r border-t border-accent-cyan/25 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-l border-b border-accent-cyan/25 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-r border-b border-accent-cyan/25 pointer-events-none" />
      </div>
      
      <svg 
        ref={svgRef} 
        className="w-full h-full cursor-move relative z-10"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <radialGradient id="heatGradient">
            <stop offset="0%" stopColor="var(--color-state-danger)" stopOpacity="0.5" />
            <stop offset="50%" stopColor="var(--color-state-danger)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="var(--color-state-danger)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          {/* Transparent click catcher spanning entire spatial area to make empty space clickable */}
          <rect 
            className="bg-click-catcher" 
            x="-15000" 
            y="-15000" 
            width="30000" 
            height="30000" 
            fill="none" 
            pointerEvents="all" 
          />
          <motion.g
            key={`breathing-layer-${threatLevel}`}
            animate={{ 
              scale: [1, threatLevel === 'critical' ? 1.018 : threatLevel === 'high' ? 1.01 : 1.004, 1] 
            }}
            transition={{
              duration: threatLevel === 'critical' ? 3.5 : threatLevel === 'high' ? 5.5 : 11,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: "130px 110px" }}
          >
            {/* Tactical High-Tech Secure Isolation Ward (Containment visualization container) */}
            <g className="pointer-events-none select-none opacity-95">
              {/* Glowy Quarantine border block enclosing ISOLATION_ZONE anchor { x: 620, y: 300 } */}
              <motion.rect
                x={620 - 150}
                y={300 - 140}
                width={300}
                height={280}
                rx={8}
                fill="rgba(244, 63, 94, 0.005)"
                stroke="rgba(244, 63, 94, 0.25)"
                strokeWidth={1.5}
                strokeDasharray="6 6"
                animate={{
                  strokeDashoffset: [0, -40],
                  backgroundColor: ["rgba(244, 63, 94, 0.005)", "rgba(244, 63, 94, 0.015)", "rgba(244, 63, 94, 0.005)"]
                }}
                transition={{
                  strokeDashoffset: { duration: 4, repeat: Infinity, ease: "linear" },
                  backgroundColor: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
              />
              {/* Double outer guard rings at the corners */}
              <path d={`M ${620 - 150} ${300 - 100} L ${620 - 150} ${300 - 140} L ${620 - 110} ${300 - 140}`} fill="none" stroke="#ef4444" strokeWidth={2} />
              <path d={`M ${620 + 150} ${300 - 100} L ${620 + 150} ${300 - 140} L ${620 + 110} ${300 - 140}`} fill="none" stroke="#ef4444" strokeWidth={2} />
              <path d={`M ${620 - 150} ${300 + 100} L ${620 - 150} ${300 + 140} L ${620 - 110} ${300 + 140}`} fill="none" stroke="#ef4444" strokeWidth={2} />
              <path d={`M ${620 + 150} ${300 + 100} L ${620 + 150} ${300 + 140} L ${620 + 110} ${300 + 140}`} fill="none" stroke="#ef4444" strokeWidth={2} />

              <circle cx={620 - 150} cy={300 - 140} r={3} fill="#ef4444" className="animate-pulse" />
              <circle cx={620 + 150} cy={300 - 140} r={3} fill="#ef4444" className="animate-pulse" />
              <circle cx={620 - 150} cy={300 + 140} r={3} fill="#ef4444" className="animate-pulse" />
              <circle cx={620 + 150} cy={300 + 140} r={3} fill="#ef4444" className="animate-pulse" />

              {/* Label for containment ward */}
              <text
                x={620}
                y={300 - 155}
                textAnchor="middle"
                className="fill-rose-400 font-mono text-[7.5px] font-black tracking-[0.25em] uppercase"
              >
                ⚠️ SECURE_QUARANTINE_WARD_ACTIVE
              </text>
              <text
                x={620}
                y={300 + 153}
                textAnchor="middle"
                className="fill-rose-500/35 font-mono text-[6px] tracking-[0.12em] uppercase"
              >
                Autonomous Host Airgapping Shield
              </text>
            </g>

            {/* Subtle Sector Background Labels & Intelligent Clustering Halos */}
            {Object.entries(SECTOR_NAMES).map(([secId, secLabel]) => {
              const secNodes = simulationNodes.filter(n => resolveNodeSector(n) === secId);
              if (secNodes.length === 0) return null;
              const avgX = d3.mean(secNodes, n => n.x ?? 0) ?? 0;
              const avgY = d3.mean(secNodes, n => n.y ?? 0) ?? 0;
              const maxDist = d3.max(secNodes, n => Math.sqrt(Math.pow((n.x ?? 0) - avgX, 2) + Math.pow((n.y ?? 0) - avgY, 2))) || 50;
              const radius = maxDist + 45;
              const getSectorColor = () => {
                if (secId === 'ISOLATION_ZONE') return 'rgba(239, 68, 68, 0.02)';
                if (secId === 'PERIMETER') return 'rgba(14, 165, 233, 0.015)';
                if (secId === 'DATA_CORE') return 'rgba(16, 185, 129, 0.015)';
                return 'rgba(59, 130, 246, 0.01)';
              };
              const getSectorStrokeColor = () => {
                if (secId === 'ISOLATION_ZONE') return 'rgba(239, 68, 68, 0.1)';
                if (secId === 'PERIMETER') return 'rgba(14, 165, 233, 0.06)';
                if (secId === 'DATA_CORE') return 'rgba(16, 185, 129, 0.06)';
                return 'rgba(0, 255, 209, 0.04)';
              };
              return (
                <g key={secId} className="pointer-events-none select-none">
                  {/* Glowing Cluster Halos boundary */}
                  <circle
                    cx={avgX}
                    cy={avgY}
                    r={radius}
                    fill={getSectorColor()}
                    stroke={getSectorStrokeColor()}
                    strokeWidth={0.75}
                    strokeDasharray="4 6"
                    className="transition-all duration-300"
                  />
                  <text
                    x={avgX}
                    y={avgY - 48}
                    textAnchor="middle"
                    className="fill-white/[0.024] stroke-none font-sans font-black tracking-[0.24em] text-[15px] uppercase"
                  >
                    {secLabel}
                  </text>
                  <text
                    x={avgX}
                    y={avgY - 36}
                    textAnchor="middle"
                    className="fill-accent-cyan/[0.04] stroke-none font-mono font-bold tracking-[0.18em] text-[6.5px] uppercase"
                  >
                    {secId === 'ISOLATION_ZONE' ? '⚠️ CONTAINMENT_SEGMENT_ACTIVE' : '🛰️ GRID_SEGMENT_ONLINE'}
                  </text>
                  <circle cx={avgX} cy={avgY - 42} r="1.5" className="fill-accent-cyan/[0.04]" />
                </g>
              );
            })}

            {/* Sensitive Data Zones (Underlay boundaries around high-sensitivity assets) */}
            {simulationNodes.filter(n => n.containsSecrets || n.sensitivityLevel === 'critical' || n.sensitivityLevel === 'high').map(node => (
              <g key={`data-zone-${node.id}`} className="pointer-events-none select-none opacity-85">
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={58}
                  fill="none"
                  stroke="rgba(245, 158, 11, 0.15)"
                  strokeWidth={0.75}
                  strokeDasharray="3 5"
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={52}
                  fill="rgba(245, 158, 11, 0.005)"
                  stroke="rgba(245, 158, 11, 0.05)"
                  strokeWidth={0.5}
                />
                <text
                  x={node.x}
                  y={node.y - 40}
                  textAnchor="middle"
                  className="fill-yellow-500/30 font-mono text-[5px] font-black tracking-widest uppercase"
                >
                  🔒 COMPLIANCE_SECURE_VAULT
                </text>
              </g>
            ))}

            {/* Governance Heatmap Overlays (gradient glow based on raw file risk classifications) */}
            <AnimatePresence>
              {showHeatmap && simulationNodes.filter(n => n.status === 'compromised').map(node => (
                <motion.circle
                  key={`cluster-${node.id}`}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ 
                    r: (40 + (node.threatScore / 100) * 40) * visualSettings.intensity, 
                    opacity: visualSettings.heatmapOpacity 
                  }}
                  exit={{ r: 0, opacity: 0 }}
                  cx={node.x}
                  cy={node.y}
                  className="fill-state-danger blur-2xl pointer-events-none"
                />
              ))}
              {showHeatmap && simulationNodes.filter(n => n.governanceRisk && n.governanceRisk > 40).map(node => (
                <motion.circle
                  key={`gov-cluster-${node.id}`}
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ 
                    r: (35 + ((node.governanceRisk || 50) / 100) * 45) * visualSettings.intensity, 
                    opacity: visualSettings.heatmapOpacity * 1.5
                  }}
                  exit={{ r: 0, opacity: 0 }}
                  cx={node.x}
                  cy={node.y}
                  className="fill-amber-500 blur-2xl pointer-events-none"
                />
              ))}
            </AnimatePresence>

            {/* Trust Route Boundary Highlights */}
            {simulationLinks.filter(link => (link.type as any) === 'TRUST_PATH' || (link.type as any) === 'auth' || link.type === 'trust').map(link => {
              const sx = link.source.x || 0;
              const sy = link.source.y || 0;
              const tx = link.target.x || 0;
              const ty = link.target.y || 0;
              const dx = tx - sx;
              const dy = ty - sy;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const curveOffset = (18 + dist * 0.08) * (((link.source.id || '') > (link.target.id || '')) ? -1 : 1);
              const qx = (sx + tx) / 2 + (-dy / dist) * curveOffset;
              const qy = (sy + ty) / 2 + (dx / dist) * curveOffset;
              const pathData = `M ${sx},${sy} Q ${qx},${qy} ${tx},${ty}`;
              return (
                <path
                  key={`trust-halo-${link.id}`}
                  d={pathData}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={1}
                  strokeDasharray="6 12"
                  className="opacity-25 pointer-events-none"
                />
              );
            })}

            {/* Data Governance Exposure Chains (Active lateral hazards targeting sensitive assets) */}
            {simulationLinks.filter(link => {
              const matchesGov = 
                (link.source.status === 'compromised' && (link.target.containsSecrets || link.target.sensitivityLevel === 'high' || link.target.sensitivityLevel === 'critical')) ||
                (link.target.status === 'compromised' && (link.source.containsSecrets || link.source.sensitivityLevel === 'high' || link.source.sensitivityLevel === 'critical'));
              return matchesGov;
            }).map(link => {
              const sx = link.source.x || 0;
              const sy = link.source.y || 0;
              const tx = link.target.x || 0;
              const ty = link.target.y || 0;
              const dx = tx - sx;
              const dy = ty - sy;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const curveOffset = (18 + dist * 0.08) * (((link.source.id || '') > (link.target.id || '')) ? -1 : 1);
              const qx = (sx + tx) / 2 + (-dy / dist) * curveOffset;
              const qy = (sy + ty) / 2 + (dx / dist) * curveOffset;
              const pathData = `M ${sx},${sy} Q ${qx},${qy} ${tx},${ty}`;
              return (
                <g key={`gov-exposure-chain-${link.id}`} className="pointer-events-none">
                  <path d={pathData} fill="none" stroke="#f59e0b" strokeWidth={5} className="opacity-15 filter blur-[4px]" />
                  <motion.path
                    d={pathData}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="filter drop-shadow-[0_0_4px_rgba(234,179,8,0.7)]"
                  />
                  {/* Floating hazard pulse node */}
                  <motion.circle
                    r={3}
                    className="fill-yellow-500"
                    animate={{
                      cx: [sx, tx],
                      cy: [sy, ty]
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </g>
              );
            })}

            {/* Links */}
            {simulationLinks.map(link => {
              const isVisible = checkIsInViewport(link.source.x, link.source.y) || checkIsInViewport(link.target.x, link.target.y);
              if (!isVisible) return null;
              const isLinkDimmed = highlightedNodeIdsOnHover
                ? link.source.id !== hoveredNode?.id && link.target.id !== hoveredNode?.id
                : false;
              return (
                <g 
                  key={link.id} 
                  className={cn(
                    "transition-all duration-300", 
                    isLinkDimmed ? "opacity-10 pointer-events-none filter blur-[0.5px]" : "opacity-100"
                  )}
                >
                  <GraphLink 
                    id={link.id}
                    source={link.source}
                    target={link.target}
                    sx={link.source.x || 0}
                    sy={link.source.y || 0}
                    tx={link.target.x || 0}
                    ty={link.target.y || 0}
                    traffic={link.traffic}
                    riskWeight={link.riskWeight}
                    showHeatmap={showHeatmap}
                    showCommunicationInstability={showCommunicationInstability}
                    visualSettings={visualSettings}
                    zoomScale={transform.k}
                    type={link.type}
                  />
                </g>
              );
            })}

            {/* Attack Path Overlays (Highly responsive smooth bezier curved paths matching links exactly) */}
            {highlightedPaths && highlightedPaths.map((path, pathIdx) => (
              <g key={`path-${pathIdx}`} className="pointer-events-none">
                {path.map((nodeId, nodeIdx) => {
                  if (nodeIdx === path.length - 1) return null;
                  const source = getVisibleProxyNode(nodeId);
                  const target = getVisibleProxyNode(path[nodeIdx + 1]);
                  if (!source || !target) return null;

                  const isVisible = checkIsInViewport(source.x, source.y) || checkIsInViewport(target.x, target.y);
                  if (!isVisible) return null;

                  // Compute identical curvature
                  const sx = source.x || 0;
                  const sy = source.y || 0;
                  const tx = target.x || 0;
                  const ty = target.y || 0;

                  const dx = tx - sx;
                  const dy = ty - sy;
                  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                  const isReversed = (source.id || '') > (target.id || '');
                  const curveDirection = isReversed ? -1 : 1;
                  const curveOffset = (18 + dist * 0.08) * curveDirection;

                  const mx = (sx + tx) / 2;
                  const my = (sy + ty) / 2;
                  const nx = -dy / dist;
                  const ny = dx / dist;
                  const qx = mx + nx * curveOffset;
                  const qy = my + ny * curveOffset;

                  const pathData = `M ${sx},${sy} Q ${qx},${qy} ${tx},${ty}`;

                  return (
                    <g key={`overlay-group-${nodeId}-${path[nodeIdx + 1]}`}>
                      {/* Deep backdrop glow for attack line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth={7}
                        className="opacity-20 filter blur-[5px]"
                      />
                      {/* Crisp moving overlay vector */}
                      <motion.path
                        d={pathData}
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ 
                          pathLength: 1, 
                          stroke: ["#ef4444", "#f59e0b", "#ef4444"]
                        }}
                        transition={{
                          stroke: { duration: 2, repeat: Infinity },
                          pathLength: { duration: 0.8, ease: "easeOut" }
                        }}
                        strokeWidth={4}
                        className="stroke-state-danger filter drop-shadow-[0_0_8px_rgba(239,68,68,0.85)]"
                      />
                    </g>
                  );
                })}
              </g>
            ))}

            {/* Nodes */}
            {simulationNodes.map(node => {
              const isVisible = checkIsInViewport(node.x, node.y) || selectedNodeId === node.id || highlightedNodeId === node.id;
              if (!isVisible) return null;

              const shouldHideLabel = transform.k < 1.35 && 
                node.type !== 'database' && 
                node.type !== 'gateway' && 
                node.type !== 'hr-system' &&
                node.status !== 'compromised' && 
                selectedNodeId !== node.id && 
                highlightedNodeId !== node.id;

              const isNodeDimmed = (node as any).isDimmed || (highlightedNodeIdsOnHover
                ? !highlightedNodeIdsOnHover.has(node.id)
                : (highlightedNodeId ? node.id !== highlightedNodeId && node.id !== selectedNodeId : false));

              return (
                <g 
                  key={node.id} 
                  className={cn(
                    "transition-all duration-300",
                    isNodeDimmed ? "opacity-15 filter blur-[0.5px] hover:opacity-80 transition-opacity" : "opacity-100"
                  )}
                >
                  <GraphNode 
                    node={node}
                    x={node.x || 0}
                    y={node.y || 0}
                    isSelected={selectedNodeId === node.id}
                    isHighlighted={highlightedNodeId === node.id}
                    onNodeClick={handleNodeClick}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    showSegmentation={showSegmentation}
                    visualSettings={visualSettings}
                    hideLabel={shouldHideLabel}
                    activeWorkspace={activeWorkspace}
                  />
                </g>
              );
            })}
          </motion.g>
        </g>
      </svg>

      {/* Node Tooltip */}
      <AnimatePresence>
        {hoveredNode && tooltipStyle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-50 pointer-events-none p-4 glass-panel min-w-[220px] shadow-2xl"
            style={{ 
              left: tooltipStyle.left,
              top: tooltipStyle.top,
              transform: 'translateX(-50%)' 
            }}
          >
            <div className="space-y-3 pb-1">
              <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                <div className="flex items-center gap-2">
                   {hoveredNode.status === 'safe' && <ShieldCheck size={12} className="text-state-safe" />}
                   {hoveredNode.status === 'compromised' && <ShieldAlert size={12} className="text-state-danger" />}
                   {hoveredNode.status === 'isolated' && <ShieldOff size={12} className="text-state-iso" />}
                   <span className="text-[12px] font-bold text-white uppercase tracking-tight">{hoveredNode.label}</span>
                </div>
                <span className={cn(
                  "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase",
                  hoveredNode.status === 'safe' ? "bg-state-safe/20 text-state-safe" : 
                  hoveredNode.status === 'compromised' ? "bg-state-danger/20 text-state-danger" : "bg-state-iso/20 text-state-iso"
                )}>
                  {hoveredNode.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-b border-border/30 pb-2 mb-2">
                 <div className="flex flex-col justify-center">
                    <span className="text-[8px] text-text-tertiary font-bold uppercase tracking-wider">Subsystem</span>
                    <span className="text-[10px] text-text-primary font-semibold uppercase">{hoveredNode.type}</span>
                 </div>
                 <div className="px-2 py-1 border border-border-bright/10 rounded-sm flex flex-col justify-center bg-void/55">
                    <span className="text-[8px] text-text-tertiary font-bold uppercase tracking-wider font-mono">Risk Index</span>
                    <span className={cn(
                      "text-[13px] font-mono font-bold leading-none mt-0.5",
                      (hoveredNode.threatScore || 0) > 70 ? "text-state-danger" : (hoveredNode.threatScore || 0) > 40 ? "text-state-warning" : "text-state-safe"
                    )}>
                      {(hoveredNode.threatScore || 0).toFixed(0)}
                    </span>
                 </div>
                 <div className="flex flex-col col-span-2">
                    <span className="text-[8px] text-text-tertiary font-bold uppercase tracking-wider font-mono">System Identifier</span>
                    <span className="text-[9px] text-text-secondary font-mono overflow-hidden text-ellipsis whitespace-nowrap">{hoveredNode.id}</span>
                 </div>
              </div>

              {/* Dynamic Tactical Indicators */}
              <div className="space-y-1.5 border-b border-border/30 pb-2 mb-2">
                 <div className="space-y-0.5">
                   <div className="flex items-center justify-between text-[8px] leading-none text-text-secondary font-mono">
                     <span>CRITICALITY</span>
                     <span className="font-mono text-accent-cyan font-semibold">{(hoveredNode.criticality * 100).toFixed(0)}%</span>
                   </div>
                   <div className="w-full h-1 bg-void/70 rounded-full overflow-hidden">
                     <div className="h-full bg-accent-cyan transition-all duration-300" style={{ width: `${hoveredNode.criticality * 100}%` }} />
                   </div>
                 </div>

                 <div className="space-y-0.5">
                   <div className="flex items-center justify-between text-[8px] leading-none text-text-secondary font-mono">
                     <span>SECURITY EXPOSURE</span>
                     <span className="font-mono text-state-warning font-semibold">{(hoveredNode.vulnerability * 100).toFixed(0)}%</span>
                   </div>
                   <div className="w-full h-1 bg-void/70 rounded-full overflow-hidden">
                     <div className="h-full bg-state-warning transition-all duration-300" style={{ width: `${hoveredNode.vulnerability * 100}%` }} />
                   </div>
                 </div>
              </div>

              {/* Deployment Position */}
              <div className="space-y-1 text-[9px] leading-none font-mono">
                 <div className="flex items-center justify-between text-text-secondary">
                   <span className="text-text-tertiary font-bold text-[8px]">GRID SECTOR</span>
                   <span className="text-white font-bold tracking-wider">{getNodeSector(hoveredNode)}</span>
                 </div>
                 <div className="flex items-center justify-between text-text-secondary mt-1">
                   <span className="text-text-tertiary font-bold text-[8px]">MONITOR FEED</span>
                   <span className="text-state-safe font-bold">{hoveredNode.monitoringLevel || 100}%</span>
                 </div>
                 <div className="flex items-center justify-between text-text-secondary mt-1">
                   <span className="text-text-tertiary font-bold text-[8px]">HEARTBEAT</span>
                   <span className="text-accent-cyan">{hoveredNode.latency || 5}ms</span>
                 </div>
              </div>
            </div>
            
            {/* Tooltip Arrow */}
            <div 
              className={cn("absolute w-3 h-3 bg-panel", tooltipStyle.arrowClass)}
              style={{ left: tooltipStyle.arrowLeft, transform: 'translateX(-50%) rotate(45deg)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control UI - Zoom indicators */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-1.5 z-30">
         <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-text-tertiary tracking-[0.2em] uppercase">Viewport Scale</span>
            <span className="text-[10px] font-mono text-accent-cyan">{(transform.k * 100).toFixed(0)}%</span>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-text-tertiary tracking-[0.2em] uppercase">Delta Pos</span>
            <span className="text-[10px] font-mono text-text-secondary">{transform.x.toFixed(0)}:{transform.y.toFixed(0)}</span>
         </div>
      </div>
      
      {/* Interaction Hints */}
      <div className="absolute top-24 left-6 flex flex-col gap-4 z-30 opacity-60 hover:opacity-100 transition-opacity">
         <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
               <div className="w-1 h-1 bg-accent-cyan group-hover:w-2 transition-all" />
               <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Scroll to Scale</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-1 h-1 bg-accent-cyan" />
               <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Drag to Pan</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-1 h-1 bg-accent-cyan" />
               <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em]">Select to Inspect</span>
            </div>
         </div>
      </div>
    </div>
  );
}
