import { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

const LID_COLORS = [
  new THREE.Color("#000000"),
  new THREE.Color("#ff73aa"),
  new THREE.Color("#000dff"),
  new THREE.Color("#caf47f"),
];

const LIQUID_COLORS = [
  new THREE.Color("#eae1da"),
  new THREE.Color("#efdce4"),
  new THREE.Color("#f4e8df"),
  new THREE.Color("#605954"),
];

const FRONT_TEXTURES = [
  "/media/makuly/3d/front-1.png",
  "/media/makuly/3d/front-1.png",
  "/media/makuly/3d/front-3.png",
  "/media/makuly/3d/front-4.png",
];
const BACK_TEXTURES = [
  "/media/makuly/3d/back-1.png",
  "/media/makuly/3d/back-1.png",
  "/media/makuly/3d/back-3.png",
  "/media/makuly/3d/back-4.png",
];
const INFO_TEXTURES = [
  "/media/makuly/3d/info-1.png",
  "/media/makuly/3d/info-1.png",
  "/media/makuly/3d/info-3.png",
  "/media/makuly/3d/info-4.png",
];
const SHOULDER_TEXTURES = [
  "/media/makuly/3d/shoulder-1.png",
  "/media/makuly/3d/shoulder-1.png",
  "/media/makuly/3d/shoulder-3.png",
  "/media/makuly/3d/shoulder-4.png",
];

const SVG_URLS = {
  front: "/media/makuly/3d/front-2.svg",
  back: "/media/makuly/3d/back-2.svg",
  info: "/media/makuly/3d/info-2.svg",
  shoulder: "/media/makuly/3d/shoulder-2.svg",
};

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

function BottleFrontLabel({ variantIndex }: { variantIndex: number }) {
  const textures = useLoader(THREE.TextureLoader, FRONT_TEXTURES);
  const svgTexture = useSvgTexture(SVG_URLS.front, 1424, 2600);
  const geometry = useMemo(() => {
    const radius = 0.313;
    const imgAspect = 712 / 1300;
    const scale = 1.25;
    const labelHeight = 0.65 * scale;
    const arcLength = labelHeight * imgAspect;
    const arcAngle = arcLength / radius;
    return new THREE.CylinderGeometry(radius, radius, labelHeight, 64, 1, true, Math.PI - arcAngle / 2, arcAngle);
  }, []);

  const map = variantIndex === 1 && svgTexture ? svgTexture : textures[variantIndex];
  return (
    <mesh geometry={geometry} position={[0, -0.32, 0]} renderOrder={1}>
      <meshStandardMaterial map={map} transparent depthWrite={false} side={THREE.FrontSide} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function BottleBackLabel({ variantIndex }: { variantIndex: number }) {
  const textures = useLoader(THREE.TextureLoader, BACK_TEXTURES);
  const svgTexture = useSvgTexture(SVG_URLS.back, 1802, 2244);
  const geometry = useMemo(() => {
    const radius = 0.313;
    const imgAspect = 901 / 1122;
    const scale = 1.25;
    const labelHeight = 0.65 * scale;
    const arcLength = labelHeight * imgAspect;
    const arcAngle = arcLength / radius;
    return new THREE.CylinderGeometry(radius, radius, labelHeight, 64, 1, true, -arcAngle / 2, arcAngle);
  }, []);

  const map = variantIndex === 1 && svgTexture ? svgTexture : textures[variantIndex];
  return (
    <mesh geometry={geometry} position={[0, -0.32, 0]} renderOrder={1}>
      <meshStandardMaterial map={map} transparent depthWrite={false} side={THREE.FrontSide} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function BottleInfoLabel({ variantIndex }: { variantIndex: number }) {
  const textures = useLoader(THREE.TextureLoader, INFO_TEXTURES);
  const svgTexture = useSvgTexture(SVG_URLS.info, 4228, 88);
  const geometry = useMemo(() => {
    const radius = 0.314;
    const scale = 0.8;
    const arcAngle = Math.PI * 2 * scale;
    const arcLength = radius * arcAngle;
    const imgAspect = 2114 / 44;
    const labelHeight = arcLength / imgAspect;
    return new THREE.CylinderGeometry(radius, radius, labelHeight, 64, 1, true, 0, arcAngle);
  }, []);

  const map = variantIndex === 1 && svgTexture ? svgTexture : textures[variantIndex];
  return (
    <mesh geometry={geometry} position={[0, -0.78, 0]} renderOrder={1}>
      <meshStandardMaterial map={map} transparent depthWrite={false} side={THREE.FrontSide} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function BottleShoulderLabel({ variantIndex }: { variantIndex: number }) {
  const textures = useLoader(THREE.TextureLoader, SHOULDER_TEXTURES);
  const svgTexture = useSvgTexture(SVG_URLS.shoulder, 426, 348);
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
    return new THREE.LatheGeometry(points, 48, Math.PI - arcAngle / 2, arcAngle);
  }, []);

  const map = variantIndex === 1 && svgTexture ? svgTexture : textures[variantIndex];
  return (
    <mesh geometry={geometry} renderOrder={1}>
      <meshStandardMaterial map={map} transparent depthWrite={false} side={THREE.FrontSide} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

function Bottle({ variantIndex, position }: { variantIndex: number; position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  const materials = useLoader(MTLLoader, "/media/makuly/MAKULY.mtl");
  const obj = useLoader(OBJLoader, "/media/makuly/MAKULY.obj", (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });

  const clonedObj = useMemo(() => obj.clone(true), [obj]);

  useEffect(() => {
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
      color: LIQUID_COLORS[variantIndex],
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

    const lidMaterial = new THREE.MeshStandardMaterial({
      color: LID_COLORS[variantIndex],
      roughness: 0.4,
      metalness: 0.1,
    });

    clonedObj.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      if (child.name === "glass" || child.parent?.name === "glass") {
        child.material = glassMaterial;
      } else if (child.name === "liquid" || child.parent?.name === "liquid") {
        child.material = milkMaterial;
      } else if (child.name === "lid" || child.parent?.name === "lid") {
        child.material = lidMaterial;
      }
    });

    const box = new THREE.Box3().setFromObject(clonedObj);
    const center = box.getCenter(new THREE.Vector3());
    clonedObj.position.sub(center);
  }, [clonedObj, variantIndex]);

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group position={position}>
      <group ref={ref}>
        <group scale={[1, 0.9, 1]}>
          <primitive object={clonedObj} />
        </group>
        <BottleFrontLabel variantIndex={variantIndex} />
        <BottleBackLabel variantIndex={variantIndex} />
        <BottleInfoLabel variantIndex={variantIndex} />
        <BottleShoulderLabel variantIndex={variantIndex} />
      </group>
    </group>
  );
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  useEffect(() => {
    if (isMobile) {
      camera.position.set(0, 0, 6.5);
    } else {
      camera.position.set(0, 0, 5.5);
    }
    camera.lookAt(0, 0, 0);
  }, [camera, isMobile]);

  const positions: [number, number, number][] = isMobile
    ? [
        [-0.55, 1.3, 0],
        [0.55, 1.3, 0],
        [-0.55, -0.9, 0],
        [0.55, -0.9, 0],
      ]
    : [
        [-1.65, 0, 0],
        [-0.55, 0, 0],
        [0.55, 0, 0],
        [1.65, 0, 0],
      ];

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />
      {positions.map((pos, i) => (
        <Bottle key={i} variantIndex={i} position={pos} />
      ))}
    </>
  );
}

export default function MakulyThumbnail() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div style={{ width: "100%", aspectRatio: isMobile ? "3/4" : "16/9", background: "#111" }}>
      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
}
