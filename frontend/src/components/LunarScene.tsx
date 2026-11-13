import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Html, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface LunarSite {
  id: string;
  name: string;
  latitude_deg: number;
  longitude_deg: number;
  source_note?: string;
}

// Convert Lat/Lon to 3D Cartesian coordinates. 
// Tweaked radius to 5.1 so markers sit cleanly above the 3D terrain
function getCartesian(lat: number, lon: number, radius = 5.1): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180); 
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

function SiteMarker({ site }: { site: LunarSite }) {
  const pos = getCartesian(site.latitude_deg, site.longitude_deg);
  const [hovered, setHover] = useState(false);

  return (
    <group position={pos}>
      <mesh 
        onPointerOver={() => setHover(true)} 
        onPointerOut={() => setHover(false)}
      >
        {/* Increased sphere size slightly so they are easier to click */}
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color={hovered ? "#ff3333" : "#33ccff"} />
      </mesh>
      {hovered && (
        <Html distanceFactor={15}>
          <div className="bg-black/90 text-white p-2 rounded text-xs whitespace-nowrap border border-cyan-500 shadow-lg pointer-events-none">
            <strong>{site.name}</strong><br/>
            Lat: {site.latitude_deg.toFixed(2)}°, Lon: {site.longitude_deg.toFixed(2)}°
          </div>
        </Html>
      )}
    </group>
  );
}

function Moon() {
  const mesh = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/moon.glb");
  const [sites, setSites] = useState<LunarSite[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/sites')
      .then(res => res.json())
      .then(payload => {
        if(payload && Array.isArray(payload.data)) {
          setSites(payload.data);
        }
      })
      .catch(err => console.error("Failed to load lunar sites:", err));
  }, []);

  useFrame((_, delta) => {
    if (
      mesh.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      mesh.current.rotation.y += Math.min(delta, 0.05) * 0.05; 
    }
  });

  return (
    <group
      ref={mesh}
      position={[0, 0, 0]} 
      // Tilted the moon up slightly by default so the south pole is easier to see
      rotation={[-0.3, 0.16, -0.09]}
    >
      <primitive object={scene} scale={5} />
      {sites.map(site => (
        <SiteMarker key={site.id} site={site} />
      ))}
    </group>
  );
}

useGLTF.preload("/models/moon.glb");

export function LunarScene() {
  return (
    <div className="lunar-canvas cursor-move" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} color="#77798d" />
        <directionalLight position={[-6, 5, -3]} intensity={5.2} color="#fff7ed" />
        <directionalLight position={[6, 4, -5]} intensity={2.7} color="#ffffff" />
        
        <Suspense fallback={null}>
          <Moon />
        </Suspense>
        
        {/* This allows you to click, drag, and zoom the 3D scene! */}
        <OrbitControls enablePan={false} minDistance={6} maxDistance={25} />
      </Canvas>
    </div>
  );
}
