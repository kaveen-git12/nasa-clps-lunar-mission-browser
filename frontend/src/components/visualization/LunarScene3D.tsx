import { useRef, useEffect, useMemo, Suspense, forwardRef, useImperativeHandle, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useGLTF, Stars } from "@react-three/drei";
import * as THREE from "three";
import type {
  CelestialState,
  LunarLocation,
  VisualizationLayerState,
} from "@/lib/scientific/types";
import { selenographicToCartesian, getSurfaceNormal } from "@/lib/scientific/lunar-math";
import {
  createEarthTexture,
  createMoonTexture,
  createSunCoronaTexture,
} from "@/lib/scientific/procedural-textures";
import { calculateRouteToSouthPole } from "@/lib/scientific/route-optimization";
import { LUNAR_LANDING_SITES } from "@/lib/scientific/dem-terrain";

export interface LunarScene3DRef {
  resetView: () => void;
  focusOnSite: (site: LunarLocation) => void;
}

interface Props {
  celestialState: CelestialState;
  layers: VisualizationLayerState;
  selectedSite: LunarLocation | null;
  onSelectSite: (site: LunarLocation | null) => void;
  onSelectBody: (body: "moon" | "earth" | "sun" | null) => void;
}

// Visual radius for the Moon sphere in Three.js units (1.85 ensures the entire globe fits with ample padding)
const LUNAR_RADIUS = 1.85;

// ============================================================================
// MOON GLOBE (GLTF Model + Procedural Fallback with Realistic Lighting)
// ============================================================================
function MoonGlobe({ hasDEM }: { hasDEM: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const fallbackTexture = useMemo(() => createMoonTexture(), []);

  // Preload and retrieve GLTF model
  let gltfScene: THREE.Group | null = null;
  try {
    const gltf = useGLTF("/models/moon.glb");
    gltfScene = gltf.scene;
  } catch {
    gltfScene = null;
  }

  useEffect(() => {
    if (gltfScene) {
      gltfScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material.roughness = hasDEM ? 0.95 : 0.82;
            child.material.metalness = 0.04;
            // Subtle ambient emissive lift so the unilluminated side shows surface craters
            child.material.emissive = new THREE.Color("#181d28");
            child.material.emissiveIntensity = 0.35;
          }
        }
      });
    }
  }, [gltfScene, hasDEM]);

  // Scale 1.4545 maps the 1.2718 bounds in moon.glb precisely to radius 1.85
  if (gltfScene) {
    return (
      <group ref={meshRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <primitive object={gltfScene} scale={1.4545} />
      </group>
    );
  }

  return (
    <mesh ref={meshRef as unknown as React.RefObject<THREE.Mesh>} castShadow receiveShadow>
      <sphereGeometry args={[LUNAR_RADIUS, 64, 64]} />
      <meshStandardMaterial
        map={fallbackTexture}
        roughness={hasDEM ? 0.95 : 0.85}
        metalness={0.04}
        emissive="#181d28"
        emissiveIntensity={0.35}
      />
    </mesh>
  );
}

// ============================================================================
// EARTH COMPONENT & COMM BEAM
// ============================================================================
function Earth({
  direction,
  distanceKm,
  showBaseline,
  selectedSitePos,
  onClick,
}: {
  direction: [number, number, number];
  distanceKm: number;
  showBaseline: boolean;
  selectedSitePos: [number, number, number] | null;
  onClick: () => void;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const earthTexture = useMemo(() => createEarthTexture(), []);

  // Place Earth at distance 15.0 units along its direction vector
  const earthPos: [number, number, number] = useMemo(() => {
    const d = 15.0;
    return [direction[0] * d, direction[1] * d, direction[2] * d];
  }, [direction]);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group position={earthPos}>
      {/* Earth Sphere */}
      <mesh
        ref={earthRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.6}
          metalness={0.1}
          emissive="#001830"
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* Atmospheric Rim Glow */}
      <mesh scale={[1.08, 1.08, 1.08]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.24}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Earth Label Pill */}
      <Html position={[0, 0.95, 0]} center distanceFactor={18}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="glass px-2.5 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 transition-transform cursor-pointer"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
          <span>EARTH ({(distanceKm / 1000).toFixed(0)}k km)</span>
        </button>
      </Html>

      {/* Earth-Moon Baseline Vector Line */}
      {showBaseline && (
        <line>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(-earthPos[0], -earthPos[1], -earthPos[2]),
            ])}
          />
          <lineDashedMaterial
            color="#818cf8"
            dashSize={0.4}
            gapSize={0.2}
            transparent
            opacity={0.45}
          />
        </line>
      )}

      {/* Direct-To-Earth (DTE) Beam from selected landing site to Earth */}
      {showBaseline && selectedSitePos && (
        <line>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(
                selectedSitePos[0] - earthPos[0],
                selectedSitePos[1] - earthPos[1],
                selectedSitePos[2] - earthPos[2]
              ),
            ])}
          />
          <lineBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.65}
            linewidth={2}
          />
        </line>
      )}
    </group>
  );
}

// ============================================================================
// SUN & DIRECTIONAL SCIENTIFIC LIGHTING
// ============================================================================
function SunAndLighting({
  sunDir,
  earthDir,
  showSunVector,
  onClick,
}: {
  sunDir: [number, number, number];
  earthDir: [number, number, number];
  showSunVector: boolean;
  onClick: () => void;
}) {
  const coronaTexture = useMemo(() => createSunCoronaTexture(), []);
  const sunDistance = 22.0;
  const sunPos: [number, number, number] = useMemo(() => {
    return [sunDir[0] * sunDistance, sunDir[1] * sunDistance, sunDir[2] * sunDistance];
  }, [sunDir]);

  const earthPos: [number, number, number] = useMemo(() => {
    return [earthDir[0] * 15.0, earthDir[1] * 15.0, earthDir[2] * 15.0];
  }, [earthDir]);

  return (
    <>
      {/* 1. Primary Direct Sunlight with Shadows */}
      <directionalLight
        position={sunPos}
        intensity={4.8}
        color="#fffcf5"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
      />

      {/* 2. Earthshine: Secondary fill light reflecting off Earth onto Moon night side */}
      <directionalLight
        position={earthPos}
        intensity={0.85}
        color="#93c5fd"
      />

      {/* 3. Deep-Space Ambient & Hemisphere Fill so dark side is visibly textured */}
      <ambientLight intensity={0.8} color="#64748b" />
      <hemisphereLight args={["#94a3b8", "#1e293b", 0.5]} />

      {/* Visible Sun Sphere in Background */}
      <group position={sunPos}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <sphereGeometry args={[1.1, 32, 32]} />
          <meshBasicMaterial color="#fffbeb" />
        </mesh>

        {/* Corona Sprite Glow */}
        <sprite scale={[5.0, 5.0, 1.0]}>
          <spriteMaterial
            map={coronaTexture}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </sprite>

        {/* Sun Tag */}
        <Html position={[0, 1.5, 0]} center distanceFactor={22}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="glass px-2.5 py-0.5 rounded-full text-[10px] font-mono text-amber-300 border border-amber-400/40 flex items-center gap-1.5 whitespace-nowrap hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>SUN (1.0 AU)</span>
          </button>
        </Html>
      </group>

      {/* Sunlight Direction Vector Line */}
      {showSunVector && (
        <line>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(sunPos[0], sunPos[1], sunPos[2]),
              new THREE.Vector3(0, 0, 0),
            ])}
          />
          <lineDashedMaterial
            color="#f59e0b"
            dashSize={0.4}
            gapSize={0.2}
            transparent
            opacity={0.4}
          />
        </line>
      )}
    </>
  );
}

// ============================================================================
// POLAR INDICATORS (North Pointer & South Pole Grid)
// ============================================================================
function PolarIndicators({ visible }: { visible: boolean }) {
  const rings = useMemo(() => {
    const ringList: [number, number, number][][] = [];
    const latitudes = [-85, -88, -89.5];

    latitudes.forEach((lat) => {
      const pts: [number, number, number][] = [];
      const segments = 48;
      for (let i = 0; i <= segments; i++) {
        const lon = (i / segments) * 360 - 180;
        pts.push(selenographicToCartesian(lat, lon, LUNAR_RADIUS + 0.01));
      }
      ringList.push(pts);
    });

    return ringList;
  }, []);

  const southPolePos = useMemo(() => selenographicToCartesian(-90, 0, LUNAR_RADIUS + 0.02), []);

  if (!visible) return null;

  return (
    <group>
      {/* North Pole Pointer & Label (+Y Axis) */}
      <group position={[0, LUNAR_RADIUS + 0.3, 0]}>
        <Html center distanceFactor={8}>
          <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/70 border border-white/20 text-white font-mono text-[9px] font-bold shadow-lg">
              <span className="text-cyan-400 font-bold">↑</span>
              <span>N</span>
            </div>
          </div>
        </Html>
      </group>

      {/* South Pole Concentric Target Rings */}
      {rings.map((ringPoints, idx) => (
        <line key={idx}>
          <bufferGeometry
            attach="geometry"
            {...new THREE.BufferGeometry().setFromPoints(
              ringPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
            )}
          />
          <lineBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.4 - idx * 0.08}
            linewidth={1}
          />
        </line>
      ))}

      {/* South Pole Center Crosshair & Label */}
      <group position={southPolePos}>
        <Html center distanceFactor={6.5}>
          <div className="flex flex-col items-center pointer-events-none select-none">
            <div className="relative flex items-center justify-center">
              <div className="h-3 w-3 rounded-full border border-cyan-400 animate-ping absolute" />
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </div>
            <div className="mt-1 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-cyan-400/60 text-cyan-300 font-mono text-[9px] font-semibold tracking-wider whitespace-nowrap shadow-xl">
              South Pole (90.0° S)
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// ============================================================================
// CLPS MISSION MARKERS & LANDING SITES (with Occlusion Filtering)
// ============================================================================
function SingleMarker({
  site,
  isSelected,
  onSelect,
}: {
  site: LunarLocation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const markerGroupRef = useRef<THREE.Group>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const { camera } = useThree();

  // Surface contact point on the Moon
  const surfacePos = useMemo(() => {
    return selenographicToCartesian(site.latitudeDeg, site.longitudeDeg, LUNAR_RADIUS);
  }, [site]);

  // Normal vector at the site
  const normal = useMemo(() => {
    return getSurfaceNormal(site.latitudeDeg, site.longitudeDeg);
  }, [site]);

  // Badge elevated outward along the normal so it never clips into surface
  const badgePos: [number, number, number] = useMemo(() => {
    const offset = 0.12;
    return [
      surfacePos[0] + normal[0] * offset,
      surfacePos[1] + normal[1] * offset,
      surfacePos[2] + normal[2] * offset,
    ];
  }, [surfacePos, normal]);

  // Stem line from surface to floating badge
  const stemPoints = useMemo(() => {
    return [
      new THREE.Vector3(surfacePos[0], surfacePos[1], surfacePos[2]),
      new THREE.Vector3(badgePos[0], badgePos[1], badgePos[2]),
    ];
  }, [surfacePos, badgePos]);

  // Frame check: Hide badge if on the far/occluded hemisphere of the Moon relative to camera
  useFrame(() => {
    if (!badgeRef.current) return;
    const camPos = camera.position;
    const toCamX = camPos.x - surfacePos[0];
    const toCamY = camPos.y - surfacePos[1];
    const toCamZ = camPos.z - surfacePos[2];
    const dot = normal[0] * toCamX + normal[1] * toCamY + normal[2] * toCamZ;

    // If facing camera (dot > -0.05), show badge; if on back side of globe, hide it
    if (dot > -0.05) {
      badgeRef.current.style.opacity = "1";
      badgeRef.current.style.pointerEvents = "auto";
    } else {
      badgeRef.current.style.opacity = "0";
      badgeRef.current.style.pointerEvents = "none";
    }
  });

  // Color tone
  let toneBg = "bg-purple-600/95 border-purple-400 text-white";
  let dotColor = "bg-purple-300 shadow-[0_0_8px_#c084fc]";
  if (site.badgeTone === "blue" || site.id === "clps-2") {
    toneBg = "bg-sky-600/95 border-sky-400 text-white";
    dotColor = "bg-sky-300 shadow-[0_0_8px_#38bdf8]";
  } else if (site.badgeTone === "orange" || site.id === "clps-3") {
    toneBg = "bg-amber-600/95 border-amber-400 text-white";
    dotColor = "bg-amber-300 shadow-[0_0_8px_#fbbf24]";
  } else if (site.badgeTone === "green" || site.id === "clps-4") {
    toneBg = "bg-emerald-600/95 border-emerald-400 text-white";
    dotColor = "bg-emerald-300 shadow-[0_0_8px_#34d399]";
  } else if (site.badgeTone === "cyan") {
    toneBg = "bg-cyan-600/95 border-cyan-400 text-white";
    dotColor = "bg-cyan-300 shadow-[0_0_8px_#22d3ee]";
  }

  return (
    <group ref={markerGroupRef}>
      {/* Surface Contact Dot */}
      <mesh position={surfacePos}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial color={site.badgeTone === "purple" ? "#c084fc" : "#38bdf8"} />
      </mesh>

      {/* Elevation Stem Line */}
      <line>
        <bufferGeometry
          attach="geometry"
          {...new THREE.BufferGeometry().setFromPoints(stemPoints)}
        />
        <lineBasicMaterial color="#ffffff" transparent opacity={0.35} />
      </line>

      {/* Floating HTML Badge */}
      <Html position={badgePos} center distanceFactor={6.2}>
        <div ref={badgeRef} className="transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl ${toneBg} ${
              isSelected ? "scale-115 ring-2 ring-white ring-offset-1" : "hover:scale-110"
            }`}
          >
            {/* Lander SVG Icon */}
            <svg
              className="h-3 w-3 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4" />
              <path d="m8 6 8 0" />
              <path d="m6 10 12 0" />
              <path d="m6 10-3 10" />
              <path d="m18 10 3 10" />
              <path d="M9 16h6" />
            </svg>

            <div className="flex flex-col text-left leading-none">
              <span className="font-bold tracking-tight">{site.code}</span>
              {site.name.includes("(") && (
                <span className="text-[8px] opacity-90 font-mono">
                  {site.name.match(/\((.*?)\)/)?.[1] || ""}
                </span>
              )}
            </div>

            <span className={`h-1.5 w-1.5 rounded-full ml-0.5 ${dotColor}`} />
          </button>
        </div>
      </Html>
    </group>
  );
}

function MissionMarkers({
  sites,
  selectedSite,
  onSelectSite,
  showMissions,
  showSites,
}: {
  sites: LunarLocation[];
  selectedSite: LunarLocation | null;
  onSelectSite: (site: LunarLocation) => void;
  showMissions: boolean;
  showSites: boolean;
}) {
  return (
    <group>
      {sites.map((site) => {
        const isMission = site.type === "lander" || site.type === "rover";
        if (isMission && !showMissions) return null;
        if (!isMission && !showSites) return null;

        return (
          <SingleMarker
            key={site.id}
            site={site}
            isSelected={selectedSite?.id === site.id}
            onSelect={() => onSelectSite(site)}
          />
        );
      })}
    </group>
  );
}

// ============================================================================
// GEODESIC SURFACE TRAVERSE ROUTE
// ============================================================================
function TraverseRoutes({ sites }: { sites: LunarLocation[] }) {
  const routes = useMemo(() => {
    const clps2 = sites.find((s) => s.id === "clps-2");
    const clps3 = sites.find((s) => s.id === "clps-3");
    const clps1 = sites.find((s) => s.id === "clps-1");

    const calculatedRoutes = [];
    if (clps2) calculatedRoutes.push(calculateRouteToSouthPole(clps2, LUNAR_RADIUS));
    if (clps3) calculatedRoutes.push(calculateRouteToSouthPole(clps3, LUNAR_RADIUS));
    if (clps1) calculatedRoutes.push(calculateRouteToSouthPole(clps1, LUNAR_RADIUS));

    return calculatedRoutes;
  }, [sites]);

  return (
    <group>
      {routes.map((route, rIdx) => {
        const curve = new THREE.CatmullRomCurve3(
          route.threeJsArcPoints.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
        );
        const tubeGeom = new THREE.TubeGeometry(curve, 32, 0.007, 6, false);

        return (
          <group key={rIdx}>
            <mesh geometry={tubeGeom}>
              <meshBasicMaterial
                color={rIdx === 0 ? "#f97316" : "#38bdf8"}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ============================================================================
// CAMERA CONTROLLER & RESET MANAGER
// ============================================================================
function CameraHandler({
  sceneRef,
}: {
  sceneRef: React.ForwardedRef<LunarScene3DRef>;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  // Balanced camera framing: viewing from south-facing angle with Moon perfectly centered
  const defaultPos = useMemo(() => new THREE.Vector3(0, -2.4, 7.2), []);
  const defaultTarget = useMemo(() => new THREE.Vector3(0, -0.1, 0), []);

  useImperativeHandle(sceneRef, () => ({
    resetView: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
        camera.position.copy(defaultPos);
        controlsRef.current.target.copy(defaultTarget);
        camera.updateProjectionMatrix();
        controlsRef.current.update();
      }
    },
    focusOnSite: (site: LunarLocation) => {
      const sitePos = selenographicToCartesian(
        site.latitudeDeg,
        site.longitudeDeg,
        LUNAR_RADIUS
      );
      if (controlsRef.current) {
        const targetVec = new THREE.Vector3(sitePos[0], sitePos[1], sitePos[2]);
        const camPos = targetVec.clone().normalize().multiplyScalar(5.8);
        camera.position.copy(camPos);
        controlsRef.current.target.copy(targetVec);
        camera.updateProjectionMatrix();
        controlsRef.current.update();
      }
    },
  }));

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.7}
      zoomSpeed={0.9}
      panSpeed={0.6}
      minDistance={2.6}
      maxDistance={18.0}
      target={defaultTarget}
    />
  );
}

// ============================================================================
// MAIN 3D SCENE COMPONENT EXPORT
// ============================================================================
export const LunarScene3D = forwardRef<LunarScene3DRef, Props>(function LunarScene3D(
  { celestialState, layers, selectedSite, onSelectSite, onSelectBody },
  ref
) {
  // Selected site 3D position for direct communication beam to Earth
  const selectedSitePos: [number, number, number] | null = useMemo(() => {
    if (!selectedSite) return null;
    return selenographicToCartesian(
      selectedSite.latitudeDeg,
      selectedSite.longitudeDeg,
      LUNAR_RADIUS
    );
  }, [selectedSite]);

  return (
    <div className="relative w-full h-full min-h-[520px] bg-[#030712] overflow-hidden select-none">
      <Canvas
        shadows
        camera={{
          position: [0, -2.4, 7.2],
          fov: 38,
          near: 0.1,
          far: 500,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            onSelectSite(null);
            onSelectBody(null);
          }
        }}
      >
        {/* Background Starfield */}
        <Stars radius={120} depth={60} count={3500} factor={4} saturation={0} fade speed={0.4} />

        {/* Sun & Dynamic Directional Sunlight with Earthshine Fill */}
        <SunAndLighting
          sunDir={celestialState.sunDirectionNormalized}
          earthDir={celestialState.earthDirectionNormalized}
          showSunVector={layers.illuminationSun}
          onClick={() => onSelectBody("sun")}
        />

        {/* Earth in Distance with Optional Comm Beam */}
        <Earth
          direction={celestialState.earthDirectionNormalized}
          distanceKm={celestialState.earthMoonDistanceKm}
          showBaseline={layers.communication}
          selectedSitePos={selectedSitePos}
          onClick={() => onSelectBody("earth")}
        />

        {/* Realistic Moon Globe with Suspense */}
        <Suspense
          fallback={
            <mesh>
              <sphereGeometry args={[LUNAR_RADIUS, 32, 32]} />
              <meshStandardMaterial color="#64748b" wireframe />
            </mesh>
          }
        >
          <MoonGlobe hasDEM={layers.terrainDEM} />
        </Suspense>

        {/* Polar Indicators (North arrow & South Pole target grid) */}
        <PolarIndicators visible={layers.landingSites} />

        {/* Traverse Route Lines */}
        <TraverseRoutes sites={LUNAR_LANDING_SITES} />

        {/* CLPS Mission Markers & Landing Sites */}
        <MissionMarkers
          sites={LUNAR_LANDING_SITES}
          selectedSite={selectedSite}
          onSelectSite={(site) => {
            onSelectSite(site);
            onSelectBody(null);
          }}
          showMissions={layers.missionsAndLanders}
          showSites={layers.landingSites}
        />

        {/* Camera Controller & Reset Listener */}
        <CameraHandler sceneRef={ref} />
      </Canvas>
    </div>
  );
});
