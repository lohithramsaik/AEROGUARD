import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import {
  Cpu,
  RotateCcw,
  Eye,
  Layers,
  Flame,
  Droplets,
  Zap,
  Activity,
  Radio,
  Sparkles,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Maximize2,
  Wrench,
  Wind,
} from 'lucide-react';
import { useEngine } from '../../context/EngineContext';
import { FaultSimulatorPanel } from '../simulator/FaultSimulatorPanel';

export type ComponentKey =
  | 'cylinders'
  | 'pistons'
  | 'connectingRods'
  | 'crankshaft'
  | 'sparkPlugs'
  | 'intakeSystem'
  | 'exhaustSystem'
  | 'coolingSystem'
  | 'lubricationSystem';

interface ComponentDetail {
  key: ComponentKey;
  name: string;
  category: string;
  healthPercent: number;
  temperature: string;
  vibration: string;
  status: 'NORMAL' | 'WARNING' | 'FAULT';
  relatedSensors: string[];
  lastUpdate: string;
  description: string;
  actionAdvice?: string;
}

export const DigitalTwinView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { telemetry, simulationMode, digitalTwinComponents } = useEngine();

  // Selected Component State (defaults to Cylinders)
  const [selectedKey, setSelectedKey] = useState<ComponentKey>('cylinders');
  const [renderMode, setRenderMode] = useState<'SHADED' | 'THERMAL' | 'WIREFRAME'>('THERMAL');
  const [isPaused, setIsPaused] = useState(false);
  const [isExploded, setIsExploded] = useState(false);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineGroupRef = useRef<THREE.Group | null>(null);
  const interactiveMeshesRef = useRef<{ mesh: THREE.Mesh; key: ComponentKey }[]>([]);
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Timestamp of last telemetry update
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('Just now');
  useEffect(() => {
    setLastUpdateTime(new Date().toTimeString().split(' ')[0] + ' UTC');
  }, [telemetry]);

  // Consume the centralized 3D Digital Twin components from the single EngineState pipeline
  const componentsMap = digitalTwinComponents;
  const activeComponent = componentsMap[selectedKey];

  // Build the complete Three.js 3D Model with all 9 identifiable components
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070c18);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 9, 20);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x00f0ff, 2.2);
    keyLight.position.set(12, 24, 18);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xb388ff, 1.2);
    rimLight.position.set(-15, -10, -12);
    scene.add(rimLight);

    // Floor Radar Grid
    const grid = new THREE.GridHelper(32, 32, 0x1e2f50, 0x101b30);
    grid.position.y = -5;
    scene.add(grid);

    // Master Engine Assembly
    const engineGroup = new THREE.Group();
    scene.add(engineGroup);
    engineGroupRef.current = engineGroup;

    // Storage for Raycasting
    const interactiveMeshes: { mesh: THREE.Mesh; key: ComponentKey }[] = [];

    // Helper to register mesh
    const registerMesh = (mesh: THREE.Mesh, key: ComponentKey) => {
      mesh.userData = { componentKey: key };
      interactiveMeshes.push({ mesh, key });
    };

    // 1. CRANKCASE & ENGINE HOUSING (Lubrication system & structure)
    const crankcaseGeo = new THREE.BoxGeometry(10.5, 3.8, 5.2);
    const crankcaseMat = new THREE.MeshStandardMaterial({
      color: 0x1e2c45,
      metalness: 0.8,
      roughness: 0.3,
    });
    const crankcase = new THREE.Mesh(crankcaseGeo, crankcaseMat);
    engineGroup.add(crankcase);
    registerMesh(crankcase, 'lubricationSystem');

    // 2. CRANKSHAFT
    const crankShaftGeo = new THREE.CylinderGeometry(0.7, 0.7, 12.8, 32);
    const crankShaftMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.95,
      roughness: 0.15,
    });
    const crankshaft = new THREE.Mesh(crankShaftGeo, crankShaftMat);
    crankshaft.rotation.z = Math.PI / 2;
    engineGroup.add(crankshaft);
    registerMesh(crankshaft, 'crankshaft');

    // Propeller Flange & Carbon Propeller
    const flangeGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.9, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x00f0ff, metalness: 0.8 });
    const flange = new THREE.Mesh(flangeGeo, flangeMat);
    flange.rotation.z = Math.PI / 2;
    flange.position.x = 6.6;
    engineGroup.add(flange);
    registerMesh(flange, 'crankshaft');

    const propBladeGeo = new THREE.BoxGeometry(0.3, 7.8, 0.9);
    const propBladeMat = new THREE.MeshStandardMaterial({ color: 0x151f33, metalness: 0.7 });
    const propBlade = new THREE.Mesh(propBladeGeo, propBladeMat);
    propBlade.position.x = 7.1;
    engineGroup.add(propBlade);

    // 3. 4 OPPOSED CYLINDERS, PISTONS, CONNECTING RODS, SPARK PLUGS
    const cylinderPositions = [
      { id: 1, x: -3.2, z: 2.8, rotZ: 0 },
      { id: 2, x: 1.6, z: 2.8, rotZ: 0 },
      { id: 3, x: -1.6, z: -2.8, rotZ: Math.PI },
      { id: 4, x: 3.2, z: -2.8, rotZ: Math.PI },
    ];

    const pistonMeshes: THREE.Mesh[] = [];
    const rodMeshes: THREE.Mesh[] = [];
    const cylinderHeadMeshes: { mesh: THREE.Mesh; id: number }[] = [];
    const sparkPlugMeshes: THREE.Mesh[] = [];

    cylinderPositions.forEach((pos) => {
      const cylGroup = new THREE.Group();
      cylGroup.position.set(pos.x, 0, 0);

      // Cylinder Barrel
      const barrelGeo = new THREE.CylinderGeometry(1.35, 1.35, 3.4, 24);
      const barrelMat = new THREE.MeshStandardMaterial({
        color: 0x22324e,
        metalness: 0.7,
        roughness: 0.4,
      });
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      barrel.position.z = pos.z > 0 ? 2.6 : -2.6;
      barrel.rotation.x = Math.PI / 2;
      cylGroup.add(barrel);
      registerMesh(barrel, 'cylinders');

      // Cooling Fins
      for (let f = -1.2; f <= 1.2; f += 0.6) {
        const finGeo = new THREE.CylinderGeometry(1.7, 1.7, 0.12, 24);
        const finMat = new THREE.MeshStandardMaterial({ color: 0x2e446a, metalness: 0.8 });
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.z = (pos.z > 0 ? 2.6 : -2.6) + f;
        fin.rotation.x = Math.PI / 2;
        cylGroup.add(fin);
        registerMesh(fin, 'cylinders');
      }

      // Cylinder Head Box
      const headGeo = new THREE.BoxGeometry(2.5, 2.5, 1.6);
      const headMat = new THREE.MeshStandardMaterial({
        color: 0x2b3d5e,
        metalness: 0.6,
        roughness: 0.3,
      });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.z = pos.z > 0 ? 4.4 : -4.4;
      cylGroup.add(head);
      registerMesh(head, 'cylinders');
      cylinderHeadMeshes.push({ mesh: head, id: pos.id });

      // Dual Spark Plugs on Head
      [-0.6, 0.6].forEach((xOff) => {
        const plugGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.9, 12);
        const plugMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.9,
          roughness: 0.1,
        });
        const plug = new THREE.Mesh(plugGeo, plugMat);
        plug.position.set(xOff, 1.3, pos.z > 0 ? 4.4 : -4.4);
        cylGroup.add(plug);
        registerMesh(plug, 'sparkPlugs');
        sparkPlugMeshes.push(plug);
      });

      // Piston
      const pistonGeo = new THREE.CylinderGeometry(1.18, 1.18, 1.1, 20);
      const pistonMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.9,
        roughness: 0.2,
      });
      const piston = new THREE.Mesh(pistonGeo, pistonMat);
      piston.position.z = pos.z > 0 ? 2.0 : -2.0;
      piston.rotation.x = Math.PI / 2;
      cylGroup.add(piston);
      registerMesh(piston, 'pistons');
      pistonMeshes.push(piston);

      // Connecting Rod
      const rodGeo = new THREE.BoxGeometry(0.35, 0.4, 2.4);
      const rodMat = new THREE.MeshStandardMaterial({
        color: 0xb0bec5,
        metalness: 0.85,
        roughness: 0.2,
      });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.z = pos.z > 0 ? 1.0 : -1.0;
      cylGroup.add(rod);
      registerMesh(rod, 'connectingRods');
      rodMeshes.push(rod);

      engineGroup.add(cylGroup);
    });

    // 4. INTAKE SYSTEM (Plenum, runners & throttle)
    const intakePlenumGeo = new THREE.CylinderGeometry(0.8, 0.8, 9.5, 24);
    const intakePlenumMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.75,
      roughness: 0.25,
    });
    const intakePlenum = new THREE.Mesh(intakePlenumGeo, intakePlenumMat);
    intakePlenum.rotation.z = Math.PI / 2;
    intakePlenum.position.set(0, 3.1, 0);
    engineGroup.add(intakePlenum);
    registerMesh(intakePlenum, 'intakeSystem');

    // Intake Throttle Body
    const throttleGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.4, 24);
    const throttleMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.8 });
    const throttle = new THREE.Mesh(throttleGeo, throttleMat);
    throttle.position.set(-5.1, 3.1, 0);
    throttle.rotation.z = Math.PI / 2;
    engineGroup.add(throttle);
    registerMesh(throttle, 'intakeSystem');

    // 5. EXHAUST SYSTEM (Runners & Turbocharger)
    const exhaustRunnerGeo = new THREE.CylinderGeometry(0.6, 0.6, 10.2, 24);
    const exhaustRunnerMat = new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      metalness: 0.85,
      roughness: 0.3,
    });
    const exhaustRunner = new THREE.Mesh(exhaustRunnerGeo, exhaustRunnerMat);
    exhaustRunner.rotation.z = Math.PI / 2;
    exhaustRunner.position.set(0, -3.0, 0);
    engineGroup.add(exhaustRunner);
    registerMesh(exhaustRunner, 'exhaustSystem');

    // Turbocharger housing (Aft)
    const turboGeo = new THREE.TorusGeometry(1.4, 0.6, 16, 32);
    const turboMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
    });
    const turbo = new THREE.Mesh(turboGeo, turboMat);
    turbo.position.set(-5.6, -3.0, 0);
    engineGroup.add(turbo);
    registerMesh(turbo, 'exhaustSystem');

    // 6. COOLING SYSTEM (Coolant transfer manifold & radiator core)
    const coolantPipeGeo = new THREE.CylinderGeometry(0.4, 0.4, 11, 20);
    const coolantPipeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.6,
      roughness: 0.3,
    });
    const coolantPipe = new THREE.Mesh(coolantPipeGeo, coolantPipeMat);
    coolantPipe.rotation.z = Math.PI / 2;
    coolantPipe.position.set(0, 2.2, 2.5);
    engineGroup.add(coolantPipe);
    registerMesh(coolantPipe, 'coolingSystem');

    // Front Heat Exchanger Core
    const radiatorGeo = new THREE.BoxGeometry(0.5, 4.2, 4.2);
    const radiatorMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      metalness: 0.8,
      roughness: 0.3,
    });
    const radiator = new THREE.Mesh(radiatorGeo, radiatorMat);
    radiator.position.set(6.2, 0, 0);
    engineGroup.add(radiator);
    registerMesh(radiator, 'coolingSystem');

    // 7. LUBRICATION SYSTEM (Oil Filter Canister & Scavenge Sump)
    const oilFilterGeo = new THREE.CylinderGeometry(0.8, 0.8, 2.0, 24);
    const oilFilterMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      metalness: 0.8,
      roughness: 0.2,
    });
    const oilFilter = new THREE.Mesh(oilFilterGeo, oilFilterMat);
    oilFilter.position.set(-4.5, -2.5, 2.5);
    engineGroup.add(oilFilter);
    registerMesh(oilFilter, 'lubricationSystem');

    interactiveMeshesRef.current = interactiveMeshes;

    // Raycaster for Mouse Clicks on 3D components
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        interactiveMeshes.map((m) => m.mesh)
      );

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const key = hit.userData?.componentKey as ComponentKey;
        if (key) {
          setSelectedKey(key);
        }
      }
    };

    // Drag Orbit Interaction
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !engineGroupRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      engineGroupRef.current.rotation.y += deltaX * 0.008;
      engineGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.z = Math.max(
        9,
        Math.min(32, cameraRef.current.position.z + e.deltaY * 0.02)
      );
      e.preventDefault();
    };

    container.addEventListener('click', handleCanvasClick);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel);

    // Animation Loop
    let animationId: number;
    let clock = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isPaused) {
        clock += 0.04;

        // Spin Propeller
        if (propBlade) {
          propBlade.rotation.x += 0.28;
        }

        // Reciprocate Pistons & Oscillate Rods
        pistonMeshes.forEach((p, idx) => {
          const offset = idx * Math.PI * 0.5;
          const motion = Math.sin(clock * 3 + offset) * 0.55;
          p.position.z = (cylinderPositions[idx].z > 0 ? 2.2 : -2.2) + motion;
          if (rodMeshes[idx]) {
            rodMeshes[idx].position.z = (cylinderPositions[idx].z > 0 ? 1.0 : -1.0) + motion * 0.7;
          }
        });

        // Gentle auto rotation when not dragging
        if (!isDraggingRef.current && engineGroupRef.current) {
          engineGroupRef.current.rotation.y += 0.0025;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 560;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleCanvasClick);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isPaused]);

  // Update Dynamic Visual Highlights based on Fault States & Selected Key
  useEffect(() => {
    if (!interactiveMeshesRef.current) return;

    interactiveMeshesRef.current.forEach(({ mesh, key }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (!mat) return;

      const comp = componentsMap[key];
      const isSelected = selectedKey === key;

      if (renderMode === 'WIREFRAME') {
        mat.wireframe = true;
        mat.color.setHex(isSelected ? 0x00f0ff : 0x334155);
        return;
      }

      mat.wireframe = false;

      // Status-based color styling:
      // NORMAL: normal CAD appearance
      // WARNING: yellow highlight
      // FAULT: red highlight / subtle pulse
      if (comp.status === 'FAULT') {
        mat.color.setHex(0xff1744);
        mat.emissive.setHex(0x880018);
      } else if (comp.status === 'WARNING') {
        mat.color.setHex(0xffab00);
        mat.emissive.setHex(0x553300);
      } else if (isSelected) {
        // Selected highlight aura
        mat.color.setHex(0x00f0ff);
        mat.emissive.setHex(0x003344);
      } else if (renderMode === 'THERMAL') {
        // Thermal gradient based on component baseline
        if (key === 'cylinders' || key === 'exhaustSystem') {
          mat.color.setHex(0x3b82f6);
          mat.emissive.setHex(0x0b1a38);
        } else if (key === 'lubricationSystem' || key === 'coolingSystem') {
          mat.color.setHex(0x06b6d4);
          mat.emissive.setHex(0x042430);
        } else {
          mat.color.setHex(0x334155);
          mat.emissive.setHex(0x000000);
        }
      } else {
        // Solid CAD mode
        mat.color.setHex(0x475569);
        mat.emissive.setHex(0x000000);
      }
    });
  }, [componentsMap, selectedKey, renderMode]);

  const resetCamera = () => {
    if (cameraRef.current && engineGroupRef.current) {
      cameraRef.current.position.set(0, 9, 20);
      cameraRef.current.lookAt(0, 0, 0);
      engineGroupRef.current.rotation.set(0.35, 0.4, 0);
    }
  };

  return (
    <div className="space-y-4">
      {/* 0. Interactive Fault Simulator */}
      <FaultSimulatorPanel />

      {/* Mandatory Certification Disclaimer */}
      <div className="bg-[#0b1324] border border-amber-500/40 rounded-xl p-3 flex items-center justify-between font-mono text-xs shadow-md">
        <div className="flex items-center space-x-2.5 text-amber-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>ENGINEERING NOTICE:</strong> VISUAL / MODEL REPRESENTATION — This digital twin is an engineering predictive visualization and telemetry digital twin. It is not a physical simulation certified for flight airworthiness certification.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold shrink-0">
          SIMULATION / MODEL
        </span>
      </div>

      {/* Main Digital Twin Interactive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left / Center 3D Three.js Viewport (8 Columns) */}
        <div className="lg:col-span-8 bg-[#0b1324] border border-[#1d2d4d] rounded-xl overflow-hidden shadow-2xl relative flex flex-col justify-between">
          {/* Top Control Bar */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none font-mono text-xs">
            {/* Title Badge */}
            <div className="bg-[#0a101ee6] backdrop-blur-md border border-[#1f2e4d] px-3 py-1.5 rounded-lg pointer-events-auto flex items-center space-x-2 text-slate-100">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="font-bold">3D AERO PISTON TWIN (ROTAX 916iSc)</span>
              <span className="text-[10px] text-slate-400">• Drag to rotate • Click parts</span>
            </div>

            {/* Mode Controls */}
            <div className="bg-[#0a101ee6] backdrop-blur-md border border-[#1f2e4d] p-1 rounded-lg pointer-events-auto flex items-center space-x-1">
              <button
                onClick={() => setRenderMode('THERMAL')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  renderMode === 'THERMAL'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thermal
              </button>
              <button
                onClick={() => setRenderMode('SHADED')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  renderMode === 'SHADED'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Solid CAD
              </button>
              <button
                onClick={() => setRenderMode('WIREFRAME')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                  renderMode === 'WIREFRAME'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Wireframe
              </button>

              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-2 py-1 rounded text-slate-400 hover:text-white border border-transparent hover:border-slate-700 transition ml-1"
                title={isPaused ? 'Resume reciprocating motion' : 'Pause animation'}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={resetCamera}
                className="p-1 rounded text-slate-400 hover:text-white transition ml-0.5"
                title="Reset Camera View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <div
            ref={containerRef}
            className="w-full h-[580px] cursor-grab active:cursor-grabbing"
          />

          {/* Bottom Floating Visual Indicator Key */}
          <div className="p-3 bg-[#080e1c] border-t border-[#1b2b48] flex flex-wrap items-center justify-between gap-2 font-mono text-[10px]">
            <div className="flex items-center space-x-3">
              <span className="text-slate-400">STATUS COLOR KEY:</span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                <span>Normal</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>Warning (Yellow)</span>
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <span>Fault (Red Highlight)</span>
              </span>
            </div>

            <span className="text-cyan-400">
              SELECTED: {activeComponent.name}
            </span>
          </div>
        </div>

        {/* Right: Component Explorer & Detailed Information Panel (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* SECTION 1: Component Information Panel */}
          <div
            className={`bg-[#0b1324] border rounded-xl p-4 shadow-xl flex flex-col justify-between font-mono text-xs transition-all ${
              activeComponent.status === 'FAULT'
                ? 'border-rose-500/70 shadow-[0_0_20px_rgba(255,23,68,0.2)]'
                : activeComponent.status === 'WARNING'
                ? 'border-amber-500/60'
                : 'border-[#1d2d4d]'
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-[#1b2b48] pb-2.5 mb-3">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">
                    {activeComponent.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-100">
                    {activeComponent.name}
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    activeComponent.status === 'FAULT'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : activeComponent.status === 'WARNING'
                      ? 'bg-amber-600 text-black'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {activeComponent.status}
                </span>
              </div>

              {/* Vitals Grid: Health, Temp, Vibration, Last Update */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
                  <span className="text-[9px] text-slate-400 uppercase block">Component Health</span>
                  <div className="flex items-baseline space-x-1 mt-0.5">
                    <span
                      className={`text-2xl font-black ${
                        activeComponent.healthPercent >= 80
                          ? 'text-emerald-400'
                          : activeComponent.healthPercent >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {activeComponent.healthPercent}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
                  <span className="text-[9px] text-slate-400 uppercase block">Temperature</span>
                  <span className="text-xl font-bold text-slate-100 mt-0.5 block">
                    {activeComponent.temperature}
                  </span>
                </div>

                <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
                  <span className="text-[9px] text-slate-400 uppercase block">Vibration</span>
                  <span className="text-xl font-bold text-slate-100 mt-0.5 block">
                    {activeComponent.vibration}
                  </span>
                </div>

                <div className="bg-[#0e172a] p-2.5 rounded-lg border border-[#1b2b48]">
                  <span className="text-[9px] text-slate-400 uppercase block">Last Update</span>
                  <span className="text-xs font-bold text-cyan-300 mt-1 block">
                    {activeComponent.lastUpdate}
                  </span>
                </div>
              </div>

              {/* Related Sensor Values */}
              <div className="bg-[#09101f] p-3 rounded-lg border border-[#172540] mb-3 space-y-1.5">
                <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold block">
                  Related Live Sensor Values
                </span>
                <div className="space-y-1 text-[11px] text-slate-300">
                  {activeComponent.relatedSensors.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-400">• {s.split(':')[0]}:</span>
                      <strong className="text-slate-100">{s.split(':')[1]}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Advice (if Fault/Warning) */}
              {activeComponent.actionAdvice && (
                <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-200 text-[11px] mb-3">
                  <strong className="block text-[10px] uppercase font-bold text-rose-400">
                    DIAGNOSTIC DIRECTIVE:
                  </strong>
                  {activeComponent.actionAdvice}
                </div>
              )}

              {/* Description */}
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                {activeComponent.description}
              </p>
            </div>
          </div>

          {/* SECTION 2: Complete 9-Component Status Explorer List */}
          <div className="bg-[#0b1324] border border-[#1d2d4d] rounded-xl p-3.5 shadow-lg font-mono text-xs flex-1 flex flex-col justify-between">
            <div className="border-b border-[#1b2b48] pb-2 mb-2 flex items-center justify-between">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                Identifiable Engine Components (9 Systems)
              </span>
              <span className="text-[10px] text-cyan-400">SELECT TO INSPECT</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[260px] pr-1">
              {(Object.keys(componentsMap) as ComponentKey[]).map((key) => {
                const item = componentsMap[key];
                const isSelected = selectedKey === key;
                const isFault = item.status === 'FAULT';
                const isWarn = item.status === 'WARNING';

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`w-full p-2 rounded-lg border text-left flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-[#152442] border-cyan-400 text-cyan-300 shadow-md'
                        : isFault
                        ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                        : isWarn
                        ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                        : 'bg-[#0e172a] border-[#182643] text-slate-300 hover:bg-[#121d33]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isFault
                            ? 'bg-rose-500 animate-ping'
                            : isWarn
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      ></span>
                      <span className="font-bold text-[11px]">{item.name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-slate-400">{item.healthPercent}%</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          isFault
                            ? 'bg-rose-600 text-white'
                            : isWarn
                            ? 'bg-amber-600 text-black'
                            : 'bg-emerald-950 text-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-[#182643] text-[10px] text-slate-500 flex items-center justify-between">
              <span>CAN-Bus Subsystem Synchronized</span>
              <span className="text-emerald-400">TELEMETRY LINK: 50 Hz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
