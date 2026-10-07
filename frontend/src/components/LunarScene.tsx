import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three";

function Moon() {
  const mesh = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/moon.glb");
  const { size, camera } = useThree();

  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const diameter =
      size.width < 700
        ? Math.max(size.width * 1.7, 640)
        : Math.max(size.width * 1.03, 900);

    const zoom = diameter / 10;
    const top = size.height * (size.width < 700 ? 0.5 : 0.43);

    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = zoom;
      camera.position.set(
        0,
        (top + diameter / 2 - size.height / 2) / zoom,
        15
      );
      camera.lookAt(0, camera.position.y, 0);
      camera.updateProjectionMatrix();
    }
  }, [size, camera]);

  useFrame((_, delta) => {
    if (
      mesh.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      mesh.current.rotation.y += Math.min(delta, 0.05) * 0.2;
    }
  });

  return (
    <group
      ref={mesh}
      position={[0, -1.2, 0]}
      rotation={[0, 0.16, -0.09]}
    >
      <primitive object={scene} scale={5} />
    </group>
  );
}

useGLTF.preload("/models/moon.glb");

export function LunarScene() {
  return (
    <div className="lunar-canvas" aria-hidden="true">
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 15],
          zoom: 100,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={0.5} color="#77798d" />

        <directionalLight
          position={[-6, 5, -3]}
          intensity={5.2}
          color="#fff7ed"
        />

        <directionalLight
          position={[6, 4, -5]}
          intensity={2.7}
          color="#ffffff"
        />

        <Suspense fallback={null}>
          <Moon />
        </Suspense>
      </Canvas>
    </div>
  );
}
