import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

function useSvgTexture(url: string, width: number, height: number) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    };
    img.src = url;
  }, [url, width, height]);
  return texture;
}

const LID_COLORS = [
  new THREE.Color("#000000"),
  new THREE.Color("#ff73aa"),
  new THREE.Color("#000dff"),
  new THREE.Color("#caf47f"),
];
const LID_CYCLE_DURATION = 3;

const LIQUID_COLORS = [
  new THREE.Color("#eae1da"),
  new THREE.Color("#efdce4"),
  new THREE.Color("#f4e8df"),
  new THREE.Color("#605954"),
];
const LIQUID_CYCLE_DURATION = 3;

const FRONT_LABEL_IMAGES = [
  "/media/makuly/3d/front-1.png",
  "/media/makuly/3d/front-1.png",
  "/media/makuly/3d/front-3.png",
  "/media/makuly/3d/front-4.png",
];
const BACK_LABEL_IMAGES = [
  "/media/makuly/3d/back-1.png",
  "/media/makuly/3d/back-1.png",
  "/media/makuly/3d/back-3.png",
  "/media/makuly/3d/back-4.png",
];
const INFO_LABEL_IMAGES = [
  "/media/makuly/3d/info-1.png",
  "/media/makuly/3d/info-1.png",
  "/media/makuly/3d/info-3.png",
  "/media/makuly/3d/info-4.png",
];
const SHOULDER_LABEL_IMAGES = [
  "/media/makuly/3d/shoulder-1.png",
  "/media/makuly/3d/shoulder-1.png",
  "/media/makuly/3d/shoulder-3.png",
  "/media/makuly/3d/shoulder-4.png",
];
const LABEL_CYCLE_DURATION = 3;

function FrontLabel() {
  const textures = useLoader(THREE.TextureLoader, FRONT_LABEL_IMAGES);
  const svgTexture = useSvgTexture("/media/makuly/3d/front-2.svg", 1424, 2600);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const geometry = useMemo(() => {
    const radius = 0.313;
    const imgAspect = 712 / 1300;
    const scale = 1.25;
    const labelHeight = 0.65 * scale;
    const arcLength = labelHeight * imgAspect;
    const arcAngle = arcLength / radius;
    const geo = new THREE.CylinderGeometry(
      radius, radius, labelHeight,
      64, 1, true,
      Math.PI - arcAngle / 2, arcAngle
    );
    return geo;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const index = Math.floor(elapsed / LABEL_CYCLE_DURATION) % FRONT_LABEL_IMAGES.length;
      if (index === 1 && svgTexture) {
        materialRef.current.map = svgTexture;
      } else {
        materialRef.current.map = textures[index];
      }
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh geometry={geometry} position={[0, -0.32, 0]} renderOrder={1}>
      <meshStandardMaterial
        ref={materialRef}
        map={textures[0]}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

function BackLabel() {
  const textures = useLoader(THREE.TextureLoader, BACK_LABEL_IMAGES);
  const svgTexture = useSvgTexture("/media/makuly/3d/back-2.svg", 1802, 2244);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const geometry = useMemo(() => {
    const radius = 0.313;
    const imgAspect = 901 / 1122;
    const scale = 1.25;
    const labelHeight = 0.65 * scale;
    const arcLength = labelHeight * imgAspect;
    const arcAngle = arcLength / radius;
    const geo = new THREE.CylinderGeometry(
      radius, radius, labelHeight,
      64, 1, true,
      -arcAngle / 2, arcAngle
    );
    return geo;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const index = Math.floor(elapsed / LABEL_CYCLE_DURATION) % BACK_LABEL_IMAGES.length;
      if (index === 1 && svgTexture) {
        materialRef.current.map = svgTexture;
      } else {
        materialRef.current.map = textures[index];
      }
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh geometry={geometry} position={[0, -0.32, 0]} renderOrder={1}>
      <meshStandardMaterial
        ref={materialRef}
        map={textures[0]}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

function InfoLabel() {
  const textures = useLoader(THREE.TextureLoader, INFO_LABEL_IMAGES);
  const svgTexture = useSvgTexture("/media/makuly/3d/info-2.svg", 4228, 88);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const geometry = useMemo(() => {
    const radius = 0.314;
    const scale = 0.8;
    const arcAngle = Math.PI * 2 * scale;
    const arcLength = radius * arcAngle;
    const imgAspect = 2114 / 44;
    const labelHeight = arcLength / imgAspect;
    const geo = new THREE.CylinderGeometry(
      radius, radius, labelHeight,
      64, 1, true,
      0, arcAngle
    );
    return geo;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const index = Math.floor(elapsed / LABEL_CYCLE_DURATION) % INFO_LABEL_IMAGES.length;
      if (index === 1 && svgTexture) {
        materialRef.current.map = svgTexture;
      } else {
        materialRef.current.map = textures[index];
      }
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh geometry={geometry} position={[0, -0.78, 0]} renderOrder={1}>
      <meshStandardMaterial
        ref={materialRef}
        map={textures[0]}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

function ShoulderLabel() {
  const textures = useLoader(THREE.TextureLoader, SHOULDER_LABEL_IMAGES);
  const svgTexture = useSvgTexture("/media/makuly/3d/shoulder-2.svg", 426, 348);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
  const geometry = useMemo(() => {
    const offset = 0.002;
    const profile: [number, number][] = [
      [0.265 + offset, 0.200],
      [0.241 + offset, 0.239],
      [0.210 + offset, 0.275],
      [0.185 + offset, 0.305],
    ];
    const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
    const arcAngle = Math.PI * 0.28;
    const geo = new THREE.LatheGeometry(
      points,
      48,
      Math.PI - arcAngle / 2,
      arcAngle
    );
    return geo;
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      const elapsed = state.clock.getElapsedTime();
      const index = Math.floor(elapsed / LABEL_CYCLE_DURATION) % SHOULDER_LABEL_IMAGES.length;
      if (index === 1 && svgTexture) {
        materialRef.current.map = svgTexture;
      } else {
        materialRef.current.map = textures[index];
      }
      materialRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshStandardMaterial
        ref={materialRef}
        map={textures[0]}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

function Model() {
  const ref = useRef<THREE.Group>(null!);
  const lidMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const liquidMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const { camera } = useThree();
  const materials = useLoader(MTLLoader, "/media/makuly/MAKULY.mtl");
  const obj = useLoader(OBJLoader, "/media/makuly/MAKULY.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  useEffect(() => {
    if (!obj) return;

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
      roughness: 0.05,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.5,
      envMapIntensity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const milkMaterial = new THREE.MeshPhysicalMaterial({
      color: LIQUID_COLORS[0],
      roughness: 0.6,
      metalness: 0.0,
      transparent: true,
      opacity: 0.92,
      transmission: 0.08,
      thickness: 1.5,
      ior: 1.35,
      sheen: 0.3,
      sheenColor: new THREE.Color(0xfff8f0),
      side: THREE.DoubleSide,
    });
    liquidMaterialRef.current = milkMaterial;

    const lidMaterial = new THREE.MeshStandardMaterial({
      color: LID_COLORS[0],
      roughness: 0.4,
      metalness: 0.1,
    });
    lidMaterialRef.current = lidMaterial;

    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (child.name === "glass" || child.parent?.name === "glass") {
        child.material = glassMaterial;
      } else if (child.name === "liquid" || child.parent?.name === "liquid") {
        child.material = milkMaterial;
      } else if (child.name === "lid" || child.parent?.name === "lid") {
        child.material = lidMaterial;
      }
    });

    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    obj.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = maxDim / (2 * Math.tan(fov / 2));
    camera.position.set(0, 0, dist * 1.4);
    camera.lookAt(0, 0, 0);
  }, [obj, camera]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
    }

    const elapsed = state.clock.getElapsedTime();

    if (lidMaterialRef.current) {
      const index = Math.floor(elapsed / LID_CYCLE_DURATION) % LID_COLORS.length;
      lidMaterialRef.current.color.copy(LID_COLORS[index]);
    }

    if (liquidMaterialRef.current) {
      const index = Math.floor(elapsed / LIQUID_CYCLE_DURATION) % LIQUID_COLORS.length;
      liquidMaterialRef.current.color.copy(LIQUID_COLORS[index]);
    }
  });

  return (
    <group ref={ref}>
      <group scale={[1, 0.9, 1]}>
        <primitive object={obj} />
      </group>
      <FrontLabel />
      <BackLabel />
      <InfoLabel />
      <ShoulderLabel />
    </group>
  );
}

export default function MakulyModel() {
  return (
    <div style={{ width: "100%", aspectRatio: "4/3", background: "#111" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-3, -2, -4]} intensity={0.3} />
        <Model />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
