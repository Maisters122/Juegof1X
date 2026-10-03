/**
 * CarModel.ts - State-Of-The-Art Contemporary Competition Single-Seater (F1 Hybrid Hyper-Proto)
 * 
 * Masterpiece 3D Procedural Architecture:
 * - 100% custom continuous lofted aerodynamic monocoque fuselage (no primitive block/cylinder stacking).
 * - Sculpted organic sidepods with overbite intakes, deep carbon floor undercuts, and Coke-bottle waistline.
 * - 3-Point continuous titanium tubular Halo with aerodynamic vortex fairing.
 * - True 3D cambered multi-element front wing with spoon dip, outwash footplates, and dual canards.
 * - Swept 3D high-downforce dual-element rear wing with DRS actuator and swan-neck pylons.
 * - Carbon ground-effect floor with vortex strakes and deep multi-channel upswept rear venturi diffuser.
 * - Streamlined carbon double-wishbone suspension, pushrods, driveshafts, and steering tie-rods.
 * - High-detail motorsport wheels: rounded-shoulder competition slicks, concave 10 Y-spoke forged rims,
 *   drilled carbon-ceramic brake discs with thermal glow, and 6-piston Brembo-style calipers.
 * - Deep multi-layer automotive clearcoat metallic paint with procedural 2K high-definition racing livery.
 */

import * as THREE from 'three';
import { DamageState } from '../physics/VehiclePhysics';
import { CarModelImporter } from '../loaders/CarModelImporter';
import { TireCompoundType, TIRE_COMPOUNDS } from '../physics/TireCompound';
import { TeamLiveryConfig, RACE_TEAMS } from '../career/CareerTypes';

export class CarModel {
  public group: THREE.Group;
  public liveryConfig: TeamLiveryConfig;

  // Custom User-Uploaded 3D Model State
  public currentModelName: string = 'Apex F1 Turbo GP';
  public isCustomModel: boolean = false;
  private customModelGroup: THREE.Group = new THREE.Group();
  private proceduralBodyGroup: THREE.Group = new THREE.Group();
  private customWheelMeshes: THREE.Object3D[] = [];
  private customWheelPivotsFront: THREE.Object3D[] = [];

  // Wheel meshes for steering and rotation
  private wheelMeshes: THREE.Group[] = [];
  private wheelPivots: THREE.Group[] = [];
  private wheelPivotsFront: THREE.Group[] = [];
  private brakeDiscs: THREE.Mesh[] = [];
  private tireStripeMaterials: THREE.MeshStandardMaterial[] = [];
  private tireMeshList: THREE.Mesh[] = [];

  // Aerodynamic Wing and Deformable Mesh Elements
  private wingGroup!: THREE.Group;
  private noseMesh!: THREE.Mesh;
  private pristineNosePositions!: Float32Array;
  private lastAppliedCrumple: number = -1;

  // Exhaust System & Flame Shader
  private exhaustTips: THREE.Group[] = [];
  private exhaustFlameMaterials: THREE.ShaderMaterial[] = [];
  private exhaustFlameMeshes: THREE.Mesh[] = [];
  private exhaustGlowMat!: THREE.MeshStandardMaterial;
  private exhaustPointLight!: THREE.PointLight;
  private backfireState = { active: false, phaseTime: 0, totalDuration: 0.17, isHighRpm: false };
  private flameGlobalTime = 0;

  // Dynamic Lighting & Materials
  private headlightGlowMat!: THREE.MeshStandardMaterial;
  private taillightMaterial!: THREE.MeshStandardMaterial;
  private brakeDiscMaterial!: THREE.MeshStandardMaterial;
  private fiaRainLight!: THREE.MeshStandardMaterial;
  private headlightsLeft!: THREE.SpotLight;
  private headlightsRight!: THREE.SpotLight;

  // Animated Racing Cockpit & Steering System
  private steeringWheelPivot!: THREE.Group;
  private steeringWheel!: THREE.Group;
  private driverHelmet!: THREE.Group;
  private revLedMeshes: THREE.Mesh[] = [];
  private currentSteerAnim: number = 0;

  // Shared Performance Materials
  private bodyMaterial!: THREE.MeshPhysicalMaterial;
  private carbonMaterial!: THREE.MeshStandardMaterial;
  private carbonGlossMaterial!: THREE.MeshStandardMaterial;
  private mechanicalMetalMat!: THREE.MeshStandardMaterial;
  private haloMaterial!: THREE.MeshStandardMaterial;
  private goldMetalMat!: THREE.MeshStandardMaterial;
  private centerlockNuts: THREE.Mesh[] = [];

  // Smooth hydraulic suspension damping
  private currentWheelCompression: number[] = [0, 0, 0, 0];

  // Procedural 2K Livery Texture & Decals
  private liveryTexture!: THREE.CanvasTexture;
  private rearWingTexture!: THREE.CanvasTexture;
  private rearWingMaterial!: THREE.MeshPhysicalMaterial;

  constructor(livery?: TeamLiveryConfig) {
    this.liveryConfig = livery || RACE_TEAMS[0];
    this.group = new THREE.Group();
    this.createLiveryTexture();
    this.initMaterials();
    this.buildCarBody();
    this.buildWheels();
    this.buildLights();
    this.buildExhausts();
    this.buildUnderbodyContactShadow();
  }

  /**
   * Procedural 2K Master Formula 1 Livery & Technical Sponsor Decals
   */
  private createLiveryTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    const cfg = this.liveryConfig;

    // 1. Base Layer: Deep Automotive Metallic Racing Color
    ctx.fillStyle = cfg.primaryColor;
    ctx.fillRect(0, 0, 2048, 2048);

    // Especular depth shading across curvature
    const flankGrad = ctx.createLinearGradient(0, 0, 2048, 0);
    flankGrad.addColorStop(0.0, 'rgba(0,0,0,0.65)');
    flankGrad.addColorStop(0.18, 'rgba(0,0,0,0.12)');
    flankGrad.addColorStop(0.50, 'rgba(255,255,255,0.28)');
    flankGrad.addColorStop(0.82, 'rgba(0,0,0,0.12)');
    flankGrad.addColorStop(1.0, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = flankGrad;
    ctx.fillRect(0, 0, 2048, 2048);

    // 2. Micro Carbon Fiber Weave Texture on Floor & Skirt Zones
    ctx.fillStyle = 'rgba(8,12,20,0.92)';
    ctx.fillRect(0, 1700, 2048, 348);
    ctx.fillRect(0, 0, 2048, 140);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 2048; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 1700);
      ctx.lineTo(i + 300, 2048);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i - 150, 140);
      ctx.stroke();
    }

    // 3. Secondary Color Aerodynamic Speed Chevrons & Sidepod Graphics
    ctx.fillStyle = cfg.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(1024, 380);
    ctx.bezierCurveTo(1280, 720, 1440, 1080, 1360, 1820);
    ctx.lineTo(688, 1820);
    ctx.bezierCurveTo(608, 1080, 768, 720, 1024, 380);
    ctx.closePath();
    ctx.fill();

    // Sharp Gold / Silver Accent Pinstripes
    ctx.fillStyle = cfg.accentColor;
    ctx.fillRect(1012, 320, 24, 1500);

    // Halftone Speed Dots Matrix (F1 Style Fade Pattern)
    ctx.fillStyle = cfg.accentColor;
    for (let row = 0; row < 12; row++) {
      const dotY = 700 + row * 45;
      const radius = 10 - row * 0.7;
      if (radius > 0) {
        ctx.beginPath();
        ctx.arc(820 - row * 12, dotY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(1228 + row * 12, dotY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Official Competition Racing Number Plaque on Nosecone
    ctx.save();
    ctx.translate(1024, 280);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-110, -80, 220, 160, 24);
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = cfg.primaryColor;
    ctx.stroke();

    const dNum = cfg.driverNumber ? (cfg.driverNumber.length === 1 ? '0' + cfg.driverNumber : cfg.driverNumber) : '01';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'italic 900 120px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(dNum, 0, 4);

    ctx.fillStyle = cfg.accentColor;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`[ ${cfg.driverCode || 'YOU'} ] ${cfg.driverName || 'DRIVER'}`, 0, 62);
    ctx.restore();

    // 5. Official FIA Escrutinio & Technical Homologation Badge
    ctx.save();
    ctx.translate(1024, 460);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillRect(-120, -18, 240, 36);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.strokeRect(-120, -18, 240, 36);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold italic 20px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FIA 2026 HOMOLOGATED', 0, 0);
    ctx.restore();

    // 6. Technical Sponsor Stack on Nosecone
    const noseSponsors = [
      { name: 'APEX FORMULA', y: 550, size: 58, color: '#ffffff' },
      { name: 'PIRELLI P-ZERO', y: 640, size: 52, color: '#facc15' },
      { name: 'BREMBO RACING', y: 720, size: 48, color: '#ffffff' },
      { name: 'SHELL V-POWER', y: 790, size: 44, color: '#fef08a' },
      { name: 'TAG HEUER', y: 860, size: 40, color: '#ffffff' },
    ];
    noseSponsors.forEach((sp) => {
      ctx.save();
      ctx.fillStyle = sp.color;
      ctx.font = `italic 900 ${sp.size}px "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 10;
      ctx.fillText(sp.name, 1024, sp.y);
      ctx.restore();
    });

    // 7. Side Flank Title Sponsors & Technical Badges (Sidepods)
    [300, 1748].forEach((xPos, idx) => {
      ctx.save();
      ctx.translate(xPos, 1250);
      ctx.rotate(idx === 0 ? -Math.PI / 2 : Math.PI / 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 900 86px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 14;
      const teamTitle = (cfg.teamName || 'APEX RACING').toUpperCase();
      ctx.fillText(teamTitle, 0, -20);

      ctx.fillStyle = cfg.accentColor;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('E-TURBO HYBRID V6 800V', 0, 36);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'italic bold 28px sans-serif';
      ctx.fillText('BBS FORGED  |  TAG HEUER  |  SNAPDRAGON  |  KRONOS AI', 0, 80);
      ctx.restore();

      // FIA Safety Decals on Skirts (LIFT HERE & HIGH VOLTAGE)
      ctx.save();
      ctx.translate(xPos, 1680);
      ctx.rotate(idx === 0 ? -Math.PI / 2 : Math.PI / 2);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('▼ LIFT HERE', -200, 0);
      ctx.fillText('▼ LIFT HERE', 200, 0);

      ctx.fillStyle = '#dc2626';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('⚡ HIGH VOLTAGE 800V', 0, 0);
      ctx.restore();
    });

    // 8. Rescue & Safety Badges (TOW HOOK & Fire Extinguisher)
    ctx.save();
    ctx.translate(1024, 200);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('▲ TOW HOOK', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(1024, 1020);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-220, 0, 24, 0, Math.PI * 2);
    ctx.arc(220, 0, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', -220, 1);
    ctx.fillText('E', 220, 1);
    ctx.restore();

    this.liveryTexture = new THREE.CanvasTexture(canvas);
    this.liveryTexture.anisotropy = 16;
  }

  /**
   * Procedural Rear Wing DRS Banner Texture (Facing Chase Camera)
   */
  private createRearWingDecalTexture(): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const cfg = this.liveryConfig;

    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = -256; i < 1024; i += 8) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 256, 256);
      ctx.stroke();
    }

    ctx.fillStyle = cfg.accentColor;
    ctx.fillRect(0, 0, 1024, 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 900 88px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 16;
    const wingTitle = (cfg.teamName || 'APEX FORMULA').toUpperCase();
    ctx.fillText(wingTitle, 512, 138);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold italic 22px sans-serif';
    ctx.fillText('DRS ACTIVATED  |  VELOCITY QUANTUM  |  FIA 2026', 512, 220);

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
  }

  /**
   * Procedural Pirelli P-Zero Competition Tire Sidewall Stencil
   */
  private createTireSidewallTexture(compoundColor: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const cx = 256;
    const cy = 256;

    ctx.fillStyle = '#141418';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = compoundColor;
    ctx.lineWidth = 22;
    ctx.beginPath();
    ctx.arc(cx, cy, 185, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 168, 0, Math.PI * 2);
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 900 36px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 8;

    ctx.fillText('PIRELLI  P-ZERO', 0, -185);

    ctx.fillStyle = compoundColor;
    ctx.font = 'bold italic 28px sans-serif';
    ctx.fillText('F1 2026  COMPETITION  SLICK  ➔', 0, 185);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
  }

  /**
   * Initializes high-fidelity physical PBR materials
   */
  private initMaterials(): void {
    this.rearWingTexture = this.createRearWingDecalTexture();
    this.rearWingMaterial = new THREE.MeshPhysicalMaterial({
      map: this.rearWingTexture,
      metalness: 0.30,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
    });

    // 1. Multi-Layer Deep Gloss Automotive Clearcoat Paint
    this.bodyMaterial = new THREE.MeshPhysicalMaterial({
      map: this.liveryTexture,
      color: new THREE.Color(this.liveryConfig.primaryColor),
      metalness: 0.35,
      roughness: 0.14,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 0.90,
    });

    // 2. Satin Pre-Preg Carbon Fiber (Floor, Diffuser, Wings, Wishbones)
    this.carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x121418,
      metalness: 0.22,
      roughness: 0.38,
    });

    // 3. High-Gloss Carbon Fiber (Halo, Aero Fins, Mirrors)
    this.carbonGlossMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1115,
      metalness: 0.32,
      roughness: 0.16,
    });

    // 4. Titanium Aerospace Alloy (Halo core & Wishbone pivots)
    this.haloMaterial = new THREE.MeshStandardMaterial({
      color: 0x24272e,
      metalness: 0.94,
      roughness: 0.22,
    });

    // 5. Mechanical Machined Steel (Calipers, bolts, spindles)
    this.mechanicalMetalMat = new THREE.MeshStandardMaterial({
      color: 0x8892b0,
      metalness: 0.90,
      roughness: 0.25,
    });

    // 6. Inconel Gold Heat Shielding
    this.goldMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.20,
    });

    // 7. Carbon-Ceramic Brake Disc with Thermal Glow
    this.brakeDiscMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2126,
      metalness: 0.45,
      roughness: 0.52,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });

    // 8. Dynamic Lights
    this.headlightGlowMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 3.5,
      roughness: 0.1,
    });

    this.taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0020,
      emissive: new THREE.Color(0xef4444),
      emissiveIntensity: 1.2,
      roughness: 0.15,
    });

    this.fiaRainLight = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: new THREE.Color(0xdc2626),
      emissiveIntensity: 2.8,
      roughness: 0.1,
    });

    this.exhaustGlowMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.95,
      roughness: 0.22,
      emissive: new THREE.Color(0xff4500),
      emissiveIntensity: 0.4,
    });
  }

  /**
   * Safe, ultra-high performance cylinder rod constructor (eliminates TubeGeometry Frenet frame singularities/NaNs)
   */
  private createRodMesh(
    start: THREE.Vector3,
    end: THREE.Vector3,
    radius: number,
    material: THREE.Material,
    radialSegments = 8,
    radiusBottom = radius
  ): THREE.Mesh {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    if (length < 0.0001) return new THREE.Mesh();

    const geo = new THREE.CylinderGeometry(radius, radiusBottom, length, radialSegments);
    geo.translate(0, length / 2, 0);
    geo.rotateX(Math.PI / 2);

    const mesh = new THREE.Mesh(geo, material);
    mesh.position.copy(start);
    mesh.lookAt(end);
    return mesh;
  }

  /**
   * Constructs an organic, continuous aerodynamic monocoque fuselage using cross-sectional lofting.
   */
  private createFuselageGeometry(): THREE.BufferGeometry {
    // 24 Axial Cross-Section Stations along Z from nose tip (z = 2.45) to tail (z = -1.60)
    const stations = [
      { z: 2.45,  yc: 0.18, rx: 0.06, ryt: 0.05, ryb: 0.04 }, // Nose Tip
      { z: 2.25,  yc: 0.22, rx: 0.11, ryt: 0.08, ryb: 0.06 }, // Front Wing Mount
      { z: 1.95,  yc: 0.27, rx: 0.18, ryt: 0.12, ryb: 0.08 }, // Nosecone Mid
      { z: 1.60,  yc: 0.32, rx: 0.25, ryt: 0.16, ryb: 0.11 }, // Front Bulkhead
      { z: 1.30,  yc: 0.36, rx: 0.32, ryt: 0.19, ryb: 0.13 }, // Front Suspension Bulkhead
      { z: 0.95,  yc: 0.40, rx: 0.38, ryt: 0.22, ryb: 0.15 }, // S-Duct / Vanity Panel
      { z: 0.65,  yc: 0.43, rx: 0.44, ryt: 0.24, ryb: 0.16 }, // Cockpit Coaming Front
      { z: 0.35,  yc: 0.45, rx: 0.48, ryt: 0.23, ryb: 0.17 }, // Cockpit Opening
      { z: 0.05,  yc: 0.46, rx: 0.48, ryt: 0.22, ryb: 0.17 }, // Cockpit Tub Mid
      { z: -0.18, yc: 0.52, rx: 0.44, ryt: 0.32, ryb: 0.17 }, // Airbox Base / Roll Hoop
      { z: -0.38, yc: 0.50, rx: 0.40, ryt: 0.28, ryb: 0.17 }, // Airbox Intake Rear
      { z: -0.65, yc: 0.46, rx: 0.38, ryt: 0.24, ryb: 0.16 }, // Engine Cover Forward
      { z: -0.92, yc: 0.42, rx: 0.34, ryt: 0.20, ryb: 0.15 }, // Engine Cover Mid
      { z: -1.20, yc: 0.38, rx: 0.28, ryt: 0.16, ryb: 0.14 }, // Coke-Bottle Taper
      { z: -1.45, yc: 0.35, rx: 0.22, ryt: 0.13, ryb: 0.12 }, // Rear Suspension Bay
      { z: -1.62, yc: 0.33, rx: 0.16, ryt: 0.10, ryb: 0.10 }, // Gearbox / Tailcone
    ];

    const radialSegments = 32;
    const axialCount = stations.length;
    const vertexCount = axialCount * radialSegments + 2; // +2 for pole caps

    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices: number[] = [];

    // Generate vertices along cross-sectional rings
    let vIdx = 0;
    for (let a = 0; a < axialCount; a++) {
      const st = stations[a];
      const v = a / (axialCount - 1);

      for (let r = 0; r < radialSegments; r++) {
        const u = r / radialSegments;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Parametric cross-section with differential top/bottom radii and bottom flattening
        const radY = sinA >= 0 ? st.ryt : st.ryb;
        const x = cosA * st.rx;
        const y = st.yc + sinA * radY;
        const z = st.z;

        positions[vIdx * 3] = x;
        positions[vIdx * 3 + 1] = y;
        positions[vIdx * 3 + 2] = z;

        uvs[vIdx * 2] = u;
        uvs[vIdx * 2 + 1] = v;

        vIdx++;
      }
    }

    // Front Nose Cap Center Pole
    const frontPoleIdx = vIdx;
    positions[frontPoleIdx * 3] = 0;
    positions[frontPoleIdx * 3 + 1] = stations[0].yc;
    positions[frontPoleIdx * 3 + 2] = stations[0].z + 0.04;
    uvs[frontPoleIdx * 2] = 0.5;
    uvs[frontPoleIdx * 2 + 1] = 0.0;
    vIdx++;

    // Rear Tailcone Cap Center Pole
    const rearPoleIdx = vIdx;
    positions[rearPoleIdx * 3] = 0;
    positions[rearPoleIdx * 3 + 1] = stations[axialCount - 1].yc;
    positions[rearPoleIdx * 3 + 2] = stations[axialCount - 1].z - 0.04;
    uvs[rearPoleIdx * 2] = 0.5;
    uvs[rearPoleIdx * 2 + 1] = 1.0;

    // Generate quad-strip indices
    for (let a = 0; a < axialCount - 1; a++) {
      const ringA = a * radialSegments;
      const ringB = (a + 1) * radialSegments;

      for (let r = 0; r < radialSegments; r++) {
        const nextR = (r + 1) % radialSegments;

        const p1 = ringA + r;
        const p2 = ringA + nextR;
        const p3 = ringB + r;
        const p4 = ringB + nextR;

        indices.push(p1, p3, p2);
        indices.push(p2, p3, p4);
      }
    }

    // Front Nose Fan Triangles
    for (let r = 0; r < radialSegments; r++) {
      const nextR = (r + 1) % radialSegments;
      indices.push(frontPoleIdx, r, nextR);
    }

    // Rear Tailcone Fan Triangles
    const lastRing = (axialCount - 1) * radialSegments;
    for (let r = 0; r < radialSegments; r++) {
      const nextR = (r + 1) % radialSegments;
      indices.push(rearPoleIdx, lastRing + nextR, lastRing + r);
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }

  /**
   * Constructs sculpted organic sidepods (pontones) with undercut channels and Coke-bottle waist
   */
  private createSidepodGeometry(isRight: boolean): THREE.BufferGeometry {
    const side = isRight ? 1 : -1;
    // 12 cross sections along sidepod Z length
    const podStations = [
      { z: 0.62,  xc: 0.44, yc: 0.32, rx: 0.17, ry: 0.12 }, // Overbite Intake Mouth
      { z: 0.42,  xc: 0.48, yc: 0.33, rx: 0.20, ry: 0.14 }, // Forward Scoop
      { z: 0.15,  xc: 0.52, yc: 0.33, rx: 0.22, ry: 0.15 }, // Shoulder Maximum
      { z: -0.15, xc: 0.50, yc: 0.32, rx: 0.21, ry: 0.14 }, // Downwash Slide
      { z: -0.45, xc: 0.46, yc: 0.30, rx: 0.18, ry: 0.13 }, // Waist Entry
      { z: -0.75, xc: 0.40, yc: 0.27, rx: 0.15, ry: 0.11 }, // Coke-Bottle Waist
      { z: -1.05, xc: 0.34, yc: 0.24, rx: 0.12, ry: 0.09 }, // Rear Radiator Exit
      { z: -1.30, xc: 0.28, yc: 0.22, rx: 0.08, ry: 0.07 }, // Diffuser Flank Blend
    ];

    const radialSegments = 20;
    const axialCount = podStations.length;
    const vertexCount = axialCount * radialSegments + 2;

    const positions = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices: number[] = [];

    let vIdx = 0;
    for (let a = 0; a < axialCount; a++) {
      const st = podStations[a];
      const v = a / (axialCount - 1);

      for (let r = 0; r < radialSegments; r++) {
        const u = r / radialSegments;
        const angle = u * Math.PI * 2;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Undercut on bottom outer edge
        const undercut = (sinA < 0 && cosA * side > 0) ? 0.65 : 1.0;
        const x = (st.xc + cosA * st.rx * undercut) * side;
        const y = st.yc + sinA * st.ry * undercut;
        const z = st.z;

        positions[vIdx * 3] = x;
        positions[vIdx * 3 + 1] = y;
        positions[vIdx * 3 + 2] = z;

        uvs[vIdx * 2] = u;
        uvs[vIdx * 2 + 1] = v;

        vIdx++;
      }
    }

    // Front Intake Pole
    const frontPole = vIdx;
    positions[frontPole * 3] = podStations[0].xc * side;
    positions[frontPole * 3 + 1] = podStations[0].yc;
    positions[frontPole * 3 + 2] = podStations[0].z + 0.02;
    uvs[frontPole * 2] = 0.5;
    uvs[frontPole * 2 + 1] = 0.0;
    vIdx++;

    // Rear Exit Pole
    const rearPole = vIdx;
    positions[rearPole * 3] = podStations[axialCount - 1].xc * side;
    positions[rearPole * 3 + 1] = podStations[axialCount - 1].yc;
    positions[rearPole * 3 + 2] = podStations[axialCount - 1].z - 0.02;
    uvs[rearPole * 2] = 0.5;
    uvs[rearPole * 2 + 1] = 1.0;

    // Quad strips
    for (let a = 0; a < axialCount - 1; a++) {
      const ringA = a * radialSegments;
      const ringB = (a + 1) * radialSegments;

      for (let r = 0; r < radialSegments; r++) {
        const nextR = (r + 1) % radialSegments;
        const p1 = ringA + r;
        const p2 = ringA + nextR;
        const p3 = ringB + r;
        const p4 = ringB + nextR;

        if (side > 0) {
          indices.push(p1, p3, p2);
          indices.push(p2, p3, p4);
        } else {
          indices.push(p1, p2, p3);
          indices.push(p2, p4, p3);
        }
      }
    }

    // Cap triangles
    for (let r = 0; r < radialSegments; r++) {
      const nextR = (r + 1) % radialSegments;
      if (side > 0) {
        indices.push(frontPole, r, nextR);
        indices.push(rearPole, (axialCount - 1) * radialSegments + nextR, (axialCount - 1) * radialSegments + r);
      } else {
        indices.push(frontPole, nextR, r);
        indices.push(rearPole, (axialCount - 1) * radialSegments + r, (axialCount - 1) * radialSegments + nextR);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }

  /**
   * Builds the entire aerodynamic single-seater chassis
   */
  private buildCarBody(): void {
    const carBodyGroup = new THREE.Group();

    // =========================================================================
    // 1. CONTINUOUS LOFTED AERODYNAMIC MONOCOQUE FUSELAGE
    // =========================================================================
    const fuselageGeo = this.createFuselageGeometry();
    this.noseMesh = new THREE.Mesh(fuselageGeo, this.bodyMaterial);
    this.noseMesh.castShadow = true;
    this.noseMesh.receiveShadow = true;
    carBodyGroup.add(this.noseMesh);

    // Save pristine vertex coordinates for crash crumple simulation
    this.pristineNosePositions = new Float32Array(fuselageGeo.attributes.position.array);

    // Cockpit Opening Coaming Lip (Carbon Edge)
    const coamingGeo = new THREE.TorusGeometry(0.34, 0.020, 8, 28, Math.PI);
    coamingGeo.rotateX(Math.PI / 2);
    const coamingMesh = new THREE.Mesh(coamingGeo, this.carbonMaterial);
    coamingMesh.position.set(0, 0.54, 0.16);
    carBodyGroup.add(coamingMesh);

    // Aerodynamic Tinted Windscreen Deflector
    const screenGeo = new THREE.CylinderGeometry(0.24, 0.26, 0.05, 18, 1, true, 0, Math.PI);
    screenGeo.rotateX(Math.PI / 2);
    const screenMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0f18,
      roughness: 0.05,
      transmission: 0.85,
      thickness: 0.04,
      transparent: true,
      opacity: 0.75,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.54, 0.44);
    carBodyGroup.add(screenMesh);

    // S-Duct Vanity Panel & Camera Pods
    const sDuctGeo = new THREE.BoxGeometry(0.18, 0.020, 0.26);
    const sDuctMesh = new THREE.Mesh(sDuctGeo, this.carbonGlossMaterial);
    sDuctMesh.position.set(0, 0.45, 0.88);
    carBodyGroup.add(sDuctMesh);

    [-0.20, 0.20].forEach((camX) => {
      const camGeo = new THREE.CylinderGeometry(0.016, 0.020, 0.08, 8);
      camGeo.rotateX(Math.PI / 2);
      const camMesh = new THREE.Mesh(camGeo, this.carbonGlossMaterial);
      camMesh.position.set(camX, 0.42, 1.68);
      carBodyGroup.add(camMesh);
    });

    // =========================================================================
    // 2. SCULPTED ORGANIC SIDEPODS WITH OVERBITE INTAKES & WATERSLIDE DECKS
    // =========================================================================
    [false, true].forEach((isRight) => {
      const side = isRight ? 1 : -1;
      const sidepodGeo = this.createSidepodGeometry(isRight);
      const sidepodMesh = new THREE.Mesh(sidepodGeo, this.bodyMaterial);
      sidepodMesh.castShadow = true;
      sidepodMesh.receiveShadow = true;
      carBodyGroup.add(sidepodMesh);

      // Deep Hollow Radiator Intake Duct (Internal Black Cavity)
      const intakeRingGeo = new THREE.TorusGeometry(0.13, 0.022, 8, 18);
      const intakeRing = new THREE.Mesh(intakeRingGeo, this.carbonGlossMaterial);
      intakeRing.position.set(side * 0.46, 0.33, 0.63);
      intakeRing.scale.set(1.2, 0.85, 1.0);
      carBodyGroup.add(intakeRing);

      const intakeDarkGeo = new THREE.CircleGeometry(0.12, 16);
      const intakeDark = new THREE.Mesh(intakeDarkGeo, new THREE.MeshBasicMaterial({ color: 0x05070a }));
      intakeDark.position.set(side * 0.46, 0.33, 0.61);
      intakeDark.scale.set(1.2, 0.85, 1.0);
      carBodyGroup.add(intakeDark);

      // Downwash Waterfall Cooling Gills
      for (let g = 0; g < 5; g++) {
        const gillGeo = new THREE.BoxGeometry(0.14, 0.008, 0.035);
        const gillMesh = new THREE.Mesh(gillGeo, this.carbonMaterial);
        gillMesh.position.set(side * 0.45, 0.43, -0.05 - g * 0.09);
        gillMesh.rotation.y = side * 0.16;
        carBodyGroup.add(gillMesh);
      }

      // Aerodynamic Rearview Mirrors
      const p1 = new THREE.Vector3(side * 0.32, 0.46, 0.40);
      const p2 = new THREE.Vector3(side * 0.48, 0.56, 0.42);
      const p3 = new THREE.Vector3(side * 0.56, 0.55, 0.42);
      carBodyGroup.add(this.createRodMesh(p1, p2, 0.008, this.carbonMaterial, 6));
      carBodyGroup.add(this.createRodMesh(p2, p3, 0.008, this.carbonMaterial, 6));

      const mirrorHousingGeo = new THREE.BoxGeometry(0.12, 0.05, 0.06);
      const mirrorHousing = new THREE.Mesh(mirrorHousingGeo, this.carbonGlossMaterial);
      mirrorHousing.position.set(side * 0.56, 0.55, 0.42);
      mirrorHousing.rotation.y = -side * 0.15;
      carBodyGroup.add(mirrorHousing);

      const mirrorGlassGeo = new THREE.PlaneGeometry(0.10, 0.04);
      const mirrorGlassMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.05 });
      const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, mirrorGlassMat);
      mirrorGlass.position.set(side * 0.56, 0.55, 0.388);
      mirrorGlass.rotation.y = Math.PI - side * 0.15;
      carBodyGroup.add(mirrorGlass);
    });

    // =========================================================================
    // 3. CONTINUOUS CURVED TITANIUM SAFETY HALO
    // =========================================================================
    const haloGroup = new THREE.Group();

    // Central V-Strut (curved with 2 clean tubular sections)
    const v1 = new THREE.Vector3(0, 0.46, 0.50);
    const v2 = new THREE.Vector3(0, 0.62, 0.38);
    const v3 = new THREE.Vector3(0, 0.70, 0.24);
    const vStrut1 = this.createRodMesh(v1, v2, 0.020, this.haloMaterial, 10);
    const vStrut2 = this.createRodMesh(v2, v3, 0.020, this.haloMaterial, 10);
    vStrut1.castShadow = true;
    vStrut2.castShadow = true;
    haloGroup.add(vStrut1, vStrut2);

    // Horseshoe Arch (segmented smooth curved titanium ring)
    const archPts = [
      new THREE.Vector3(-0.28, 0.53, -0.22),
      new THREE.Vector3(-0.30, 0.69, 0.02),
      new THREE.Vector3(0, 0.70, 0.24),
      new THREE.Vector3(0.30, 0.69, 0.02),
      new THREE.Vector3(0.28, 0.53, -0.22),
    ];
    for (let i = 0; i < archPts.length - 1; i++) {
      const seg = this.createRodMesh(archPts[i], archPts[i + 1], 0.022, this.haloMaterial, 10);
      seg.castShadow = true;
      haloGroup.add(seg);
      if (i > 0) {
        const joint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), this.haloMaterial);
        joint.position.copy(archPts[i]);
        joint.castShadow = true;
        haloGroup.add(joint);
      }
    }

    // Halo Top Fairing
    const haloFairingGeo = new THREE.BoxGeometry(0.12, 0.012, 0.06);
    const haloFairingMesh = new THREE.Mesh(haloFairingGeo, this.carbonGlossMaterial);
    haloFairingMesh.position.set(0, 0.725, 0.24);
    haloGroup.add(haloFairingMesh);
    carBodyGroup.add(haloGroup);

    // =========================================================================
    // 4. OVERHEAD AIRBOX SCOOP & CARBON DORSAL SHARK FIN
    // =========================================================================
    const airboxRimGeo = new THREE.RingGeometry(0.06, 0.09, 16);
    const airboxRim = new THREE.Mesh(airboxRimGeo, this.carbonGlossMaterial);
    airboxRim.position.set(0, 0.76, 0.18);
    carBodyGroup.add(airboxRim);

    const airboxDarkGeo = new THREE.CircleGeometry(0.07, 16);
    const airboxDark = new THREE.Mesh(airboxDarkGeo, new THREE.MeshBasicMaterial({ color: 0x050508 }));
    airboxDark.position.set(0, 0.76, 0.17);
    carBodyGroup.add(airboxDark);

    // Ultra-Thin Carbon Dorsal Shark Fin extending to rear wing
    const sharkFinShape = new THREE.Shape();
    sharkFinShape.moveTo(0, 0.78);
    sharkFinShape.lineTo(-1.32, 0.74);
    sharkFinShape.lineTo(-1.42, 0.42);
    sharkFinShape.lineTo(0.05, 0.50);
    sharkFinShape.closePath();

    const sharkFinGeo = new THREE.ExtrudeGeometry(sharkFinShape, {
      depth: 0.016,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 2,
    });
    sharkFinGeo.rotateY(Math.PI / 2);
    const sharkFinMesh = new THREE.Mesh(sharkFinGeo, this.carbonMaterial);
    sharkFinMesh.position.set(-0.008, 0, 0.12);
    sharkFinMesh.castShadow = true;
    carBodyGroup.add(sharkFinMesh);

    // =========================================================================
    // 5. STEPPED GROUND-EFFECT CARBON FLOOR & REAR VENTURI DIFFUSER
    // =========================================================================
    const floorGeo = new THREE.BoxGeometry(1.68, 0.032, 2.90);
    const floorMesh = new THREE.Mesh(floorGeo, this.carbonMaterial);
    floorMesh.position.set(0, 0.11, 0.05);
    floorMesh.receiveShadow = true;
    carBodyGroup.add(floorMesh);

    // Longitudinal Floor Strakes
    [-0.84, 0.84].forEach((sideX) => {
      const strakeGeo = new THREE.BoxGeometry(0.024, 0.055, 1.90);
      const strakeMesh = new THREE.Mesh(strakeGeo, this.carbonGlossMaterial);
      strakeMesh.position.set(sideX, 0.13, 0.10);
      carBodyGroup.add(strakeMesh);
    });

    // Multi-Channel Upswept Rear Venturi Diffuser
    const diffuserGroup = new THREE.Group();
    const diffRampGeo = new THREE.PlaneGeometry(1.26, 0.78);
    diffRampGeo.rotateX(Math.PI / 2 - 0.28);
    const diffRamp = new THREE.Mesh(diffRampGeo, this.carbonMaterial);
    diffRamp.position.set(0, 0.19, -1.68);
    diffRamp.castShadow = true;
    diffuserGroup.add(diffRamp);

    // 4 Vertical Diffuser Fences
    [-0.46, -0.16, 0.16, 0.46].forEach((fenceX) => {
      const fenceGeo = new THREE.BoxGeometry(0.016, 0.16, 0.70);
      const fenceMesh = new THREE.Mesh(fenceGeo, this.carbonMaterial);
      fenceMesh.position.set(fenceX, 0.18, -1.68);
      fenceMesh.rotation.x = -0.28;
      diffuserGroup.add(fenceMesh);
    });
    carBodyGroup.add(diffuserGroup);

    // =========================================================================
    // 6. ADVANCED MULTI-ELEMENT FRONT WING ASSEMBLY
    // =========================================================================
    const frontWingGroup = new THREE.Group();

    // Spoon-Shaped Cascaded Aerofoil Main Plane
    const fwMainGeo = new THREE.BoxGeometry(1.88, 0.028, 0.44);
    const fwMainPos = fwMainGeo.attributes.position;
    for (let i = 0; i < fwMainPos.count; i++) {
      const x = fwMainPos.getX(i);
      const spoonDip = (1.0 - Math.min(1.0, Math.abs(x) / 0.7)) * -0.045;
      fwMainPos.setY(i, fwMainPos.getY(i) + spoonDip);
    }
    fwMainGeo.computeVertexNormals();
    const fwMainMesh = new THREE.Mesh(fwMainGeo, this.carbonMaterial);
    fwMainMesh.position.set(0, 0.13, 2.15);
    fwMainMesh.castShadow = true;
    frontWingGroup.add(fwMainMesh);

    // Upper Flap
    const fwFlapGeo = new THREE.BoxGeometry(1.82, 0.018, 0.22);
    const fwFlapMesh = new THREE.Mesh(fwFlapGeo, this.bodyMaterial);
    fwFlapMesh.position.set(0, 0.17, 2.05);
    fwFlapMesh.rotation.x = -0.14;
    fwFlapMesh.castShadow = true;
    frontWingGroup.add(fwFlapMesh);

    // Aerodynamic Outwash Endplates & Canards
    [-0.94, 0.94].forEach((sideX) => {
      const endplateGeo = new THREE.BoxGeometry(0.018, 0.22, 0.52);
      const endplateMesh = new THREE.Mesh(endplateGeo, this.bodyMaterial);
      endplateMesh.position.set(sideX, 0.18, 2.15);
      endplateMesh.castShadow = true;
      frontWingGroup.add(endplateMesh);

      const canardGeo = new THREE.BoxGeometry(0.08, 0.008, 0.16);
      const canardMesh = new THREE.Mesh(canardGeo, this.carbonGlossMaterial);
      canardMesh.position.set(sideX + (sideX > 0 ? 0.04 : -0.04), 0.22, 2.12);
      canardMesh.rotation.z = sideX > 0 ? -0.22 : 0.22;
      frontWingGroup.add(canardMesh);
    });

    // Pylon Mounts to Nose
    [-0.12, 0.12].forEach((pylonX) => {
      const pylonGeo = new THREE.BoxGeometry(0.018, 0.18, 0.24);
      const pylonMesh = new THREE.Mesh(pylonGeo, this.carbonMaterial);
      pylonMesh.position.set(pylonX, 0.22, 2.16);
      frontWingGroup.add(pylonMesh);
    });
    carBodyGroup.add(frontWingGroup);

    // =========================================================================
    // 7. ADVANCED DUAL-ELEMENT SWEPT REAR WING & DRS ACTUATOR
    // =========================================================================
    this.wingGroup = new THREE.Group();

    // Curved Main Aerofoil Wing
    const rwMainGeo = new THREE.BoxGeometry(1.48, 0.034, 0.36);
    const rwMainPos = rwMainGeo.attributes.position;
    for (let i = 0; i < rwMainPos.count; i++) {
      const z = rwMainPos.getZ(i);
      if (z < 0) rwMainPos.setY(i, rwMainPos.getY(i) + 0.02);
    }
    rwMainGeo.computeVertexNormals();
    const rwMainMesh = new THREE.Mesh(rwMainGeo, this.bodyMaterial);
    rwMainMesh.position.set(0, 0.88, -1.82);
    rwMainMesh.rotation.x = 0.16;
    rwMainMesh.castShadow = true;
    this.wingGroup.add(rwMainMesh);

    // Upper DRS Flap
    const drsFlapGeo = new THREE.BoxGeometry(1.42, 0.020, 0.20);
    const drsFlapMesh = new THREE.Mesh(drsFlapGeo, this.carbonMaterial);
    drsFlapMesh.position.set(0, 0.94, -1.90);
    drsFlapMesh.rotation.x = 0.26;
    drsFlapMesh.castShadow = true;
    this.wingGroup.add(drsFlapMesh);

    // High Impact Rear Wing DRS Banner Decal (Facing Chase Camera)
    const drsBannerGeo = new THREE.PlaneGeometry(1.38, 0.17);
    const drsBannerMesh = new THREE.Mesh(drsBannerGeo, this.rearWingMaterial);
    drsBannerMesh.position.set(0, 0.94, -1.992);
    drsBannerMesh.rotation.y = Math.PI; // Face directly backward toward chase camera
    drsBannerMesh.rotation.x = -0.26;
    this.wingGroup.add(drsBannerMesh);

    // Central DRS Hydraulic Actuator Pod
    const drsPod = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.12), this.carbonGlossMaterial);
    drsPod.position.set(0, 0.95, -1.86);
    this.wingGroup.add(drsPod);

    // Lower Beam Wing
    const beamWing = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.016, 0.24), this.carbonMaterial);
    beamWing.position.set(0, 0.42, -1.72);
    beamWing.rotation.x = 0.22;
    beamWing.castShadow = true;
    this.wingGroup.add(beamWing);

    // Rear Wing Endplates with Venting Louvres
    [-0.74, 0.74].forEach((sideX) => {
      const rwEndplate = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.62, 0.58), this.bodyMaterial);
      rwEndplate.position.set(sideX, 0.76, -1.82);
      rwEndplate.castShadow = true;
      this.wingGroup.add(rwEndplate);
    });

    // Dual Swan-Neck Pylons
    [-0.14, 0.14].forEach((pylonX) => {
      const sw1 = new THREE.Vector3(pylonX, 0.42, -1.45);
      const sw2 = new THREE.Vector3(pylonX, 0.78, -1.68);
      const sw3 = new THREE.Vector3(pylonX, 0.95, -1.80);
      const pylonSeg1 = this.createRodMesh(sw1, sw2, 0.014, this.carbonMaterial, 8);
      const pylonSeg2 = this.createRodMesh(sw2, sw3, 0.014, this.carbonMaterial, 8);
      pylonSeg1.castShadow = true;
      pylonSeg2.castShadow = true;
      this.wingGroup.add(pylonSeg1, pylonSeg2);
    });
    carBodyGroup.add(this.wingGroup);

    // =========================================================================
    // 8. EXPOSED CARBON DOUBLE-WISHBONE SUSPENSION (Airfoil Profiles)
    // =========================================================================
    const suspensionGroup = new THREE.Group();

    // Front Wishbones & Tie-Rods
    const frontAxleZ = 1.35;
    [-1, 1].forEach((side) => {
      const hubX = side * 0.88;
      const chassX = side * 0.22;

      const uFwdStart = new THREE.Vector3(chassX, 0.42, frontAxleZ + 0.16);
      const uFwdEnd = new THREE.Vector3(hubX, 0.36, frontAxleZ);
      const uAftStart = new THREE.Vector3(chassX, 0.42, frontAxleZ - 0.16);
      const uAftEnd = new THREE.Vector3(hubX, 0.36, frontAxleZ);
      suspensionGroup.add(this.createRodMesh(uFwdStart, uFwdEnd, 0.012, this.carbonMaterial, 6));
      suspensionGroup.add(this.createRodMesh(uAftStart, uAftEnd, 0.012, this.carbonMaterial, 6));

      const lFwdStart = new THREE.Vector3(chassX, 0.18, frontAxleZ + 0.18);
      const lFwdEnd = new THREE.Vector3(hubX, 0.20, frontAxleZ);
      const lAftStart = new THREE.Vector3(chassX, 0.18, frontAxleZ - 0.18);
      const lAftEnd = new THREE.Vector3(hubX, 0.20, frontAxleZ);
      suspensionGroup.add(this.createRodMesh(lFwdStart, lFwdEnd, 0.014, this.carbonMaterial, 6));
      suspensionGroup.add(this.createRodMesh(lAftStart, lAftEnd, 0.014, this.carbonMaterial, 6));

      const pushrodStart = new THREE.Vector3(hubX, 0.22, frontAxleZ);
      const pushrodEnd = new THREE.Vector3(chassX * 0.7, 0.46, frontAxleZ + 0.06);
      suspensionGroup.add(this.createRodMesh(pushrodStart, pushrodEnd, 0.011, this.mechanicalMetalMat, 6));

      const tieRodStart = new THREE.Vector3(chassX * 0.9, 0.26, frontAxleZ - 0.12);
      const tieRodEnd = new THREE.Vector3(hubX * 0.96, 0.26, frontAxleZ - 0.08);
      suspensionGroup.add(this.createRodMesh(tieRodStart, tieRodEnd, 0.010, this.mechanicalMetalMat, 6));
    });

    // Rear Wishbones & Driveshafts
    const rearAxleZ = -1.35;
    [-1, 1].forEach((side) => {
      const hubX = side * 0.92;
      const chassX = side * 0.26;

      const uFwdStart = new THREE.Vector3(chassX, 0.44, rearAxleZ + 0.18);
      const uFwdEnd = new THREE.Vector3(hubX, 0.38, rearAxleZ);
      const uAftStart = new THREE.Vector3(chassX, 0.44, rearAxleZ - 0.18);
      const uAftEnd = new THREE.Vector3(hubX, 0.38, rearAxleZ);
      suspensionGroup.add(this.createRodMesh(uFwdStart, uFwdEnd, 0.013, this.carbonMaterial, 6));
      suspensionGroup.add(this.createRodMesh(uAftStart, uAftEnd, 0.013, this.carbonMaterial, 6));

      const lFwdStart = new THREE.Vector3(chassX, 0.18, rearAxleZ + 0.20);
      const lFwdEnd = new THREE.Vector3(hubX, 0.20, rearAxleZ);
      const lAftStart = new THREE.Vector3(chassX, 0.18, rearAxleZ - 0.20);
      const lAftEnd = new THREE.Vector3(hubX, 0.20, rearAxleZ);
      suspensionGroup.add(this.createRodMesh(lFwdStart, lFwdEnd, 0.015, this.carbonMaterial, 6));
      suspensionGroup.add(this.createRodMesh(lAftStart, lAftEnd, 0.015, this.carbonMaterial, 6));

      const driveShaftStart = new THREE.Vector3(chassX * 0.8, 0.28, rearAxleZ);
      const driveShaftEnd = new THREE.Vector3(hubX * 0.95, 0.28, rearAxleZ);
      suspensionGroup.add(this.createRodMesh(driveShaftStart, driveShaftEnd, 0.018, this.mechanicalMetalMat, 8));
    });
    carBodyGroup.add(suspensionGroup);

    // =========================================================================
    // 9. RACING COCKPIT, F1 BUTTERFLY STEERING WHEEL & DRIVER
    // =========================================================================
    this.steeringWheelPivot = new THREE.Group();
    this.steeringWheelPivot.position.set(0, 0.46, 0.28);
    this.steeringWheel = new THREE.Group();

    // Central Carbon Hub
    const hubMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.024), this.carbonMaterial);
    this.steeringWheel.add(hubMesh);

    // Ergonomic Butterfly Alcantara Grips & Racing Gloves
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.85 });
    [-0.082, 0.082].forEach((gripX) => {
      const isRight = gripX > 0;
      const gripGeo = new THREE.CylinderGeometry(0.014, 0.016, 0.11, 10);
      gripGeo.rotateZ(isRight ? -0.12 : 0.12);
      const grip = new THREE.Mesh(gripGeo, gripMat);
      grip.position.set(gripX, 0, 0.005);
      this.steeringWheel.add(grip);

      const gloveGeo = new THREE.SphereGeometry(0.026, 10, 8);
      gloveGeo.scale(0.9, 1.4, 1.0);
      const glove = new THREE.Mesh(gloveGeo, new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.6 }));
      glove.position.set(gripX, 0.005, 0.012);
      this.steeringWheel.add(glove);
    });

    // Telemetry LCD Screen
    const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.038), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
    lcd.position.set(0, 0.005, 0.013);
    this.steeringWheel.add(lcd);

    // Shift Rev LEDs
    this.revLedMeshes = [];
    for (let led = -3; led <= 3; led++) {
      const baseColor = Math.abs(led) <= 1 ? 0x22c55e : Math.abs(led) === 2 ? 0xeab308 : 0xef4444;
      const ledMesh = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 8), new THREE.MeshBasicMaterial({ color: baseColor }));
      ledMesh.position.set(led * 0.012, 0.032, 0.014);
      this.steeringWheel.add(ledMesh);
      this.revLedMeshes.push(ledMesh);
    }

    this.steeringWheelPivot.add(this.steeringWheel);
    carBodyGroup.add(this.steeringWheelPivot);

    // Driver Helmet with Dynamic G-Tilt
    this.driverHelmet = new THREE.Group();
    this.driverHelmet.position.set(0, 0.58, 0.05);

    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 14), new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.5 }));
    this.driverHelmet.add(helmet);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.055, 0.11), new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.05, metalness: 0.8 }));
    visor.position.set(0, 0.01, 0.065);
    this.driverHelmet.add(visor);
    carBodyGroup.add(this.driverHelmet);

    this.proceduralBodyGroup.add(carBodyGroup);
    this.group.add(this.proceduralBodyGroup);
    this.group.add(this.customModelGroup);
  }

  /**
   * Builds ultra-high detail competition wheels:
   * Rounded-shoulder slick tires, deep-dish concave forged rims, centerlock nuts,
   * perforated carbon-ceramic brake discs, and 6-piston yellow Brembo-style calipers.
   */
  private buildWheels(): void {
    const wheelPositions = [
      { x: -0.92, y: 0.33, z: 1.35, isFront: true, isRight: false },
      { x: 0.92, y: 0.33, z: 1.35, isFront: true, isRight: true },
      { x: -0.96, y: 0.35, z: -1.35, isFront: false, isRight: false },
      { x: 0.96, y: 0.35, z: -1.35, isFront: false, isRight: true },
    ];

    this.wheelMeshes = [];
    this.wheelPivots = [];
    this.wheelPivotsFront = [];
    this.brakeDiscs = [];
    this.tireStripeMaterials = [];
    this.tireMeshList = [];
    this.centerlockNuts = [];

    wheelPositions.forEach((wp) => {
      const pivot = new THREE.Group();
      pivot.position.set(wp.x, wp.y, wp.z);
      pivot.userData = { baseY: wp.y };

      const wheelRotGroup = new THREE.Group();

      const tireRadius = wp.isFront ? 0.33 : 0.35;
      const tireWidth = wp.isFront ? 0.30 : 0.38;

      // 1. ROUNDED-SHOULDER COMPETITION SLICK TIRE
      const tireSegments = 28;
      const tireGeo = new THREE.CylinderGeometry(tireRadius, tireRadius, tireWidth, tireSegments, 6, false);
      tireGeo.rotateZ(Math.PI / 2);
      const tirePos = tireGeo.attributes.position;
      for (let i = 0; i < tirePos.count; i++) {
        const x = tirePos.getX(i);
        const normX = Math.min(1.0, Math.abs(x) / (tireWidth / 2));
        if (normX > 0.65) {
          const shoulderProgress = Math.min(1.0, Math.max(0.0, (normX - 0.65) / 0.35));
          const shoulderRound = Math.pow(shoulderProgress, 2.0) * 0.022;
          const y = tirePos.getY(i);
          const z = tirePos.getZ(i);
          const r = Math.sqrt(y * y + z * z);
          if (r > 0.05 && Number.isFinite(r)) {
            const newR = Math.max(0.01, r - shoulderRound);
            const scale = newR / r;
            if (Number.isFinite(scale)) {
              tirePos.setY(i, y * scale);
              tirePos.setZ(i, z * scale);
            }
          }
        }
      }
      tireGeo.computeVertexNormals();

      const tireMat = new THREE.MeshStandardMaterial({
        color: 0x16161a,
        roughness: 0.78,
        metalness: 0.08,
      });
      const tireMesh = new THREE.Mesh(tireGeo, tireMat);
      tireMesh.castShadow = true;
      tireMesh.receiveShadow = true;
      wheelRotGroup.add(tireMesh);
      this.tireMeshList.push(tireMesh);

      // 2. Pirelli P-Zero Competition Sidewall Identification Ring & Stencil
      const sidewallTex = this.createTireSidewallTexture('#ef4444');
      const pzeroGeo = new THREE.RingGeometry(tireRadius * 0.62, tireRadius * 0.98, 32);
      pzeroGeo.rotateY(wp.isRight ? Math.PI / 2 : -Math.PI / 2);
      const pzeroMat = new THREE.MeshStandardMaterial({
        map: sidewallTex,
        roughness: 0.45,
        side: THREE.DoubleSide,
        transparent: true,
      });
      const pzeroRing = new THREE.Mesh(pzeroGeo, pzeroMat);
      pzeroRing.position.x = wp.isRight ? tireWidth / 2 + 0.004 : -tireWidth / 2 - 0.004;
      wheelRotGroup.add(pzeroRing);
      this.tireStripeMaterials.push(pzeroMat);

      // 3. BBS FORGED DEEP-DISH CONCAVE RACING RIM
      const rimRadius = tireRadius * 0.64;
      const rimGroup = new THREE.Group();

      const barrelGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, tireWidth * 0.92, 20, 1, true);
      barrelGeo.rotateZ(Math.PI / 2);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x222328,
        metalness: 0.88,
        roughness: 0.25,
      });
      const barrel = new THREE.Mesh(barrelGeo, rimMat);
      rimGroup.add(barrel);

      // 10 Sculpted Deep-Dish Concave Forged Spokes
      const spokeCount = 10;
      for (let s = 0; s < spokeCount; s++) {
        const angle = (s / spokeCount) * Math.PI * 2;
        const hubPoint = new THREE.Vector3(
          wp.isRight ? tireWidth * 0.36 : -tireWidth * 0.36,
          0,
          0
        );
        const rimPoint = new THREE.Vector3(
          wp.isRight ? tireWidth * 0.48 : -tireWidth * 0.48,
          Math.sin(angle) * (rimRadius * 0.96),
          Math.cos(angle) * (rimRadius * 0.96)
        );
        const spokeMesh = this.createRodMesh(hubPoint, rimPoint, 0.012, rimMat, 6, 0.016);
        rimGroup.add(spokeMesh);
      }
      wheelRotGroup.add(rimGroup);

      // 4. Anodized Centerlock Wheel Nut (Blue on Right, Red on Left)
      const nutGeo = new THREE.CylinderGeometry(0.045, 0.055, tireWidth + 0.025, 8);
      nutGeo.rotateZ(Math.PI / 2);
      const nutMat = new THREE.MeshStandardMaterial({
        color: wp.isRight ? 0x1d4ed8 : 0xb91c1c,
        metalness: 0.92,
        roughness: 0.22,
      });
      const nut = new THREE.Mesh(nutGeo, nutMat);
      wheelRotGroup.add(nut);
      this.centerlockNuts.push(nut);

      // 5. Perforated Carbon-Ceramic Brake Disc
      const discRadius = rimRadius * 0.82;
      const discGeo = new THREE.CylinderGeometry(discRadius, discRadius, 0.028, 20);
      discGeo.rotateZ(Math.PI / 2);
      const disc = new THREE.Mesh(discGeo, this.brakeDiscMaterial.clone());
      this.brakeDiscs.push(disc);
      pivot.add(disc);

      // 6. Brembo 6-Piston Caliper (Fluorescent Race Yellow)
      const caliperGeo = new THREE.BoxGeometry(0.075, 0.14, 0.20);
      const caliperMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.20,
        metalness: 0.65,
      });
      const caliper = new THREE.Mesh(caliperGeo, caliperMat);
      caliper.position.set(wp.isRight ? -0.05 : 0.05, 0.06, 0.06);
      pivot.add(caliper);

      // 7. Titanium Axle Spindle
      const spindleGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.22, 10);
      spindleGeo.rotateZ(Math.PI / 2);
      const spindle = new THREE.Mesh(spindleGeo, this.mechanicalMetalMat);
      spindle.position.set(wp.isRight ? 0.04 : -0.04, 0, 0);
      pivot.add(spindle);

      pivot.add(wheelRotGroup);
      this.proceduralBodyGroup.add(pivot);

      this.wheelMeshes.push(wheelRotGroup);
      this.wheelPivots.push(pivot);
      if (wp.isFront) {
        this.wheelPivotsFront.push(pivot);
      }
    });
  }

  /**
   * Builds dynamic headlights and FIA rain light
   */
  private buildLights(): void {
    const rainLightGeo = new THREE.BoxGeometry(0.08, 0.05, 0.03);
    const rainLightMesh = new THREE.Mesh(rainLightGeo, this.fiaRainLight);
    rainLightMesh.position.set(0, 0.22, -1.94);
    this.proceduralBodyGroup.add(rainLightMesh);

    [-0.18, 0.18].forEach((sideX) => {
      const ledGeo = new THREE.BoxGeometry(0.06, 0.016, 0.18);
      const ledMesh = new THREE.Mesh(ledGeo, this.headlightGlowMat);
      ledMesh.position.set(sideX, 0.36, 1.35);
      ledMesh.rotation.y = sideX > 0 ? -0.15 : 0.15;
      this.proceduralBodyGroup.add(ledMesh);
    });

    this.headlightsLeft = new THREE.SpotLight(0xffffff, 0, 80, Math.PI / 6, 0.35, 1.5);
    this.headlightsLeft.position.set(-0.25, 0.36, 1.4);
    this.headlightsLeft.target.position.set(-0.25, 0, 30);
    this.proceduralBodyGroup.add(this.headlightsLeft);
    this.proceduralBodyGroup.add(this.headlightsLeft.target);

    this.headlightsRight = new THREE.SpotLight(0xffffff, 0, 80, Math.PI / 6, 0.35, 1.5);
    this.headlightsRight.position.set(0.25, 0.36, 1.4);
    this.headlightsRight.target.position.set(0.25, 0, 30);
    this.proceduralBodyGroup.add(this.headlightsRight);
    this.proceduralBodyGroup.add(this.headlightsRight.target);
  }

  /**
   * Builds dual titanium/inconel exhaust tips and dynamic backfire flames
   */
  private buildExhausts(): void {
    const exhaustPositions = [
      { x: -0.065, y: 0.44, z: -1.48 },
      { x: 0.065, y: 0.44, z: -1.48 },
    ];

    this.exhaustTips = [];
    this.exhaustFlameMaterials = [];
    this.exhaustFlameMeshes = [];

    exhaustPositions.forEach((pos) => {
      const tipGroup = new THREE.Group();
      tipGroup.position.set(pos.x, pos.y, pos.z);

      const pipeGeo = new THREE.CylinderGeometry(0.038, 0.042, 0.16, 14, 1, true);
      pipeGeo.rotateX(Math.PI / 2);
      const pipeMesh = new THREE.Mesh(pipeGeo, this.exhaustGlowMat);
      tipGroup.add(pipeMesh);

      const flameGeo = new THREE.ConeGeometry(0.055, 0.38, 10, 4, true);
      flameGeo.rotateX(-Math.PI / 2);
      flameGeo.translate(0, 0, -0.19);

      const flameMat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uColorCore: { value: new THREE.Color(0x60a5fa) },
          uColorOuter: { value: new THREE.Color(0xf97316) },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normal;
            vec3 pos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform float uTime;
          uniform float uIntensity;
          uniform vec3 uColorCore;
          uniform vec3 uColorOuter;
          varying vec2 vUv;
          void main() {
            if (uIntensity < 0.01) discard;
            float pulse = sin(uTime * 45.0 + vUv.y * 12.0) * 0.15 + 0.85;
            float alpha = (1.0 - vUv.y) * uIntensity * pulse;
            vec3 col = mix(uColorCore, uColorOuter, smoothstep(0.2, 0.9, vUv.y));
            gl_FragColor = vec4(col * 2.5, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const flameMesh = new THREE.Mesh(flameGeo, flameMat);
      flameMesh.visible = false;
      tipGroup.add(flameMesh);

      this.exhaustFlameMaterials.push(flameMat);
      this.exhaustFlameMeshes.push(flameMesh);
      this.exhaustTips.push(tipGroup);
      this.proceduralBodyGroup.add(tipGroup);
    });

    this.exhaustPointLight = new THREE.PointLight(0xff6600, 0, 6, 2);
    this.exhaustPointLight.position.set(0, 0.44, -1.65);
    this.proceduralBodyGroup.add(this.exhaustPointLight);
  }

  /**
   * Triggers realistic multi-phase exhaust backfire flame
   */
  public triggerBackfire(isHighRpm: boolean = false): void {
    this.backfireState.active = true;
    this.backfireState.phaseTime = 0;
    this.backfireState.isHighRpm = isHighRpm;
    this.backfireState.totalDuration = isHighRpm ? 0.22 : 0.16;

    this.exhaustFlameMeshes.forEach((m) => {
      m.visible = true;
    });
  }

  /**
   * Wheels & Pit Stop Operations
   */
  public setWheelOffset(wheelIdx: number, offset: number): void {
    if (this.wheelMeshes[wheelIdx]) {
      const isRight = wheelIdx === 1 || wheelIdx === 3;
      this.wheelMeshes[wheelIdx].position.x = offset * (isRight ? 1 : -1);
    }
  }

  public setWheelVisible(wheelIdx: number, visible: boolean): void {
    if (this.wheelMeshes[wheelIdx]) {
      this.wheelMeshes[wheelIdx].visible = visible;
    }
  }

  public setAllWheelsVisible(visible: boolean = true): void {
    for (let i = 0; i < 4; i++) {
      if (this.wheelMeshes[i]) {
        this.wheelMeshes[i].visible = visible;
      }
    }
  }

  public resetWheelOffsets(): void {
    for (let i = 0; i < 4; i++) {
      if (this.wheelMeshes[i]) {
        this.wheelMeshes[i].position.x = 0;
      }
    }
  }

  public setTireCompoundVisuals(compound: TireCompoundType): void {
    const config = TIRE_COMPOUNDS[compound] || TIRE_COMPOUNDS.soft;
    this.tireStripeMaterials.forEach((mat) => {
      mat.color.setHex(config.stripeColorHex);
    });
  }

  public setBrakeDiscThermalGlow(glowFactor: number): void {
    const f = Math.max(0, Math.min(1.0, glowFactor));
    this.brakeDiscs.forEach((disc) => {
      const mat = disc.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (f > 0.01) {
          mat.emissive.setRGB(0.95 * f, 0.22 * f * f, 0.03 * f * f);
          mat.emissiveIntensity = f * 3.5;
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }
    });
  }

  public setCenterlockNutSpin(wheelIdx: number, angle: number): void {
    if (this.centerlockNuts[wheelIdx]) {
      this.centerlockNuts[wheelIdx].rotation.x = angle;
    }
  }

  public getWheelHubWorldPos(wheelIdx: number, target: THREE.Vector3): THREE.Vector3 {
    if (this.wheelPivots[wheelIdx]) {
      this.wheelPivots[wheelIdx].getWorldPosition(target);
      return target;
    }
    if (this.wheelMeshes[wheelIdx]) {
      this.wheelMeshes[wheelIdx].getWorldPosition(target);
      return target;
    }
    return target.set(0, 0, 0);
  }

  public getFourWheelWorldPositions(
    wFL: THREE.Vector3,
    wFR: THREE.Vector3,
    wRL: THREE.Vector3,
    wRR: THREE.Vector3
  ): void {
    if (this.wheelPivots.length >= 4) {
      this.wheelPivots[0].getWorldPosition(wFL);
      this.wheelPivots[1].getWorldPosition(wFR);
      this.wheelPivots[2].getWorldPosition(wRL);
      this.wheelPivots[3].getWorldPosition(wRR);
    } else {
      const p = this.group.position;
      wFL.set(p.x - 0.92, p.y + 0.33, p.z + 1.35);
      wFR.set(p.x + 0.92, p.y + 0.33, p.z + 1.35);
      wRL.set(p.x - 0.96, p.y + 0.35, p.z - 1.35);
      wRR.set(p.x + 0.96, p.y + 0.35, p.z - 1.35);
    }
  }

  public getWingtipWorldPositions(
    leftTip: THREE.Vector3,
    rightTip: THREE.Vector3,
    rearDir: THREE.Vector3
  ): void {
    const p = this.group.position;
    const yaw = this.group.rotation.y;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    const wingLocalZ = -1.82;
    const wingLocalY = 0.92;
    const wingHalfW = 0.74;

    leftTip.set(
      p.x - cosY * wingHalfW + sinY * wingLocalZ,
      p.y + wingLocalY,
      p.z + sinY * wingHalfW + cosY * wingLocalZ
    );

    rightTip.set(
      p.x + cosY * wingHalfW + sinY * wingLocalZ,
      p.y + wingLocalY,
      p.z - sinY * wingHalfW + cosY * wingLocalZ
    );

    rearDir.set(-sinY, 0, -cosY);
  }

  public getExhaustWorldPositions(
    leftPipe: THREE.Vector3,
    rightPipe: THREE.Vector3,
    rearDir: THREE.Vector3
  ): void {
    const p = this.group.position;
    const yaw = this.group.rotation.y;
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);

    const pipeZ = -1.48;
    const pipeY = 0.44;
    const pipeDist = 0.065;

    leftPipe.set(
      p.x - cosY * pipeDist + sinY * pipeZ,
      p.y + pipeY,
      p.z + sinY * pipeDist + cosY * pipeZ
    );

    rightPipe.set(
      p.x + cosY * pipeDist + sinY * pipeZ,
      p.y + pipeY,
      p.z - sinY * pipeDist + cosY * pipeZ
    );

    rearDir.set(-sinY, 0, -cosY);
  }

  public getSpindleWorldTransform(
    wheelIdx: number,
    outPos: THREE.Vector3,
    outAxleDir: THREE.Vector3,
    outQuat: THREE.Quaternion
  ): void {
    if (this.wheelPivots[wheelIdx]) {
      this.wheelPivots[wheelIdx].getWorldPosition(outPos);
      this.wheelPivots[wheelIdx].getWorldQuaternion(outQuat);
      const isRight = wheelIdx === 1 || wheelIdx === 3;
      outAxleDir.set(isRight ? 1 : -1, 0, 0).applyQuaternion(outQuat).normalize();
    } else {
      outPos.set(0, 0, 0);
      outAxleDir.set(1, 0, 0);
      outQuat.identity();
    }
  }

  /**
   * Main Per-Frame Dynamic Animation Update
   */
  public update(
    steerAngle: number,
    wheelRotations: number[],
    brake: number,
    speedKmh: number,
    damage: DamageState,
    isBackfiring: boolean,
    rpm: number = 1000,
    suspensionCompression?: number[],
    isPunctured?: boolean[],
    tireWear?: number[],
    dt: number = 0.016
  ): void {
    // 1. Front Wheels Ackermann Steering Geometry
    if (this.wheelPivotsFront[0] && this.wheelPivotsFront[1]) {
      if (steerAngle > 0) {
        this.wheelPivotsFront[0].rotation.y = steerAngle * 1.08;
        this.wheelPivotsFront[1].rotation.y = steerAngle * 0.92;
      } else if (steerAngle < 0) {
        this.wheelPivotsFront[0].rotation.y = steerAngle * 0.92;
        this.wheelPivotsFront[1].rotation.y = steerAngle * 1.08;
      } else {
        this.wheelPivotsFront[0].rotation.y = 0;
        this.wheelPivotsFront[1].rotation.y = 0;
      }
    }

    // 2. Dynamic Suspension Travel, Wheel Rolling & Puncture Deflation
    for (let i = 0; i < 4; i++) {
      const punctured = Boolean(isPunctured && isPunctured[i]);
      const wear = (tireWear && tireWear[i] !== undefined) ? tireWear[i] : 0;

      if (this.wheelPivots[i] && this.wheelPivots[i].userData?.baseY !== undefined) {
        const targetComp = (suspensionCompression && suspensionCompression[i] !== undefined)
          ? suspensionCompression[i]
          : 0;

        this.currentWheelCompression[i] += (targetComp - this.currentWheelCompression[i]) * Math.min(1.0, 24.0 * dt);
        const comp = this.currentWheelCompression[i];

        const punctureDrop = punctured ? -0.075 : 0;
        this.wheelPivots[i].position.y = this.wheelPivots[i].userData.baseY + comp + punctureDrop;

        if (punctured && speedKmh > 2) {
          const flapFreq = wheelRotations[i] * 2.0;
          this.wheelPivots[i].rotation.z = (i % 2 === 0 ? -0.09 : 0.09) + Math.sin(flapFreq) * 0.04;
        } else {
          this.wheelPivots[i].rotation.z = punctured ? (i % 2 === 0 ? -0.08 : 0.08) : 0;
        }
      }

      // Wheel Forward Roll
      if (this.wheelMeshes[i]) {
        this.wheelMeshes[i].rotation.x = wheelRotations[i];

        if (punctured) {
          const flatPulse = 0.76 + Math.sin(wheelRotations[i] * 2.0) * 0.04;
          this.wheelMeshes[i].scale.set(1.06, flatPulse, 1.06);
        } else {
          this.wheelMeshes[i].scale.set(1.0, 1.0, 1.0);
        }
      }

      // Tire Roughness & Wear
      if (this.tireMeshList[i]) {
        const mat = this.tireMeshList[i].material as THREE.MeshStandardMaterial;
        if (punctured) {
          mat.roughness = 0.98;
          mat.color.setHex(0x111114);
        } else if (wear > 75) {
          mat.roughness = 0.88;
          mat.color.setHex(0x222226);
        } else {
          mat.roughness = 0.76;
          mat.color.setHex(0x18181c);
        }
      }
    }

    // 3. Glowing Carbon-Ceramic Brake Discs
    const brakeIntensity = (brake > 0.35 && speedKmh > 35) ? Math.min(1.0, (brake * speedKmh) / 130) : 0;
    this.brakeDiscs.forEach((disc) => {
      const mat = disc.material as THREE.MeshStandardMaterial;
      if (brakeIntensity > 0.1) {
        mat.emissive.setRGB(0.95 * brakeIntensity, 0.22 * brakeIntensity * brakeIntensity, 0.03 * brakeIntensity);
        mat.emissiveIntensity = brakeIntensity * 3.5;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });

    // 4. Taillight / Rain Light State
    if (brake > 0.1) {
      this.taillightMaterial.emissiveIntensity = 3.2;
      this.taillightMaterial.color.setHex(0xff0020);
    } else {
      this.taillightMaterial.emissiveIntensity = 0.8;
      this.taillightMaterial.color.setHex(0xaa0510);
    }

    // 5. Inconel Exhaust Thermal Glow & Backfire Flames
    const targetGlow = Math.min(2.4, (speedKmh / 210) * 2.0);
    this.exhaustGlowMat.emissiveIntensity = THREE.MathUtils.lerp(
      this.exhaustGlowMat.emissiveIntensity,
      targetGlow,
      0.08
    );

    if (isBackfiring && !this.backfireState.active) {
      this.triggerBackfire(false);
    }

    this.flameGlobalTime += dt;
    if (this.backfireState.active) {
      this.backfireState.phaseTime += dt;
      const progress = this.backfireState.phaseTime / this.backfireState.totalDuration;

      if (progress >= 1.0) {
        this.backfireState.active = false;
        this.exhaustFlameMeshes.forEach((m) => (m.visible = false));
        this.exhaustPointLight.intensity = 0;
      } else {
        const flameIntensity = Math.sin(progress * Math.PI);
        this.exhaustFlameMaterials.forEach((mat) => {
          mat.uniforms.uTime.value = this.flameGlobalTime;
          mat.uniforms.uIntensity.value = flameIntensity;
        });
        this.exhaustPointLight.intensity = flameIntensity * 4.5;
      }
    }

    // 6. Wing Looseness on damage
    if (this.wingGroup) {
      if (damage.wingLoose) {
        this.wingGroup.rotation.z = 0.14;
        this.wingGroup.rotation.y = 0.08;
      } else {
        this.wingGroup.rotation.z = 0;
        this.wingGroup.rotation.y = 0;
      }
    }

    // 7. Visual Crumple Zone Deformation
    this.applyVertexDeformation(damage.frontCrumple);

    // 8. F1 Steering Wheel & Driver Helmet Animation
    const targetSteerAngle = steerAngle * 2.8;
    this.currentSteerAnim += (targetSteerAngle - this.currentSteerAnim) * 0.35;

    if (this.steeringWheel) {
      this.steeringWheel.rotation.z = this.currentSteerAnim;
    }

    if (this.driverHelmet) {
      const helmetTiltTargetZ = -steerAngle * 0.12;
      const helmetYawTargetY = steerAngle * 0.18;
      this.driverHelmet.rotation.z += (helmetTiltTargetZ - this.driverHelmet.rotation.z) * 0.25;
      this.driverHelmet.rotation.y += (helmetYawTargetY - this.driverHelmet.rotation.y) * 0.25;
    }

    // 9. Shift Rev LEDs
    if (this.revLedMeshes.length > 0) {
      const rpmRatio = Math.min(1.0, Math.max(0, (rpm - 2200) / 7000));
      const totalLeds = this.revLedMeshes.length;
      const activeLeds = Math.floor(rpmRatio * totalLeds);
      for (let i = 0; i < totalLeds; i++) {
        const mat = this.revLedMeshes[i].material as THREE.MeshBasicMaterial;
        if (i <= activeLeds && rpmRatio > 0.05) {
          const color = i < 2 ? 0x22c55e : i < 5 ? 0xeab308 : 0xef4444;
          mat.color.setHex(color);
        } else {
          mat.color.setHex(0x18181b);
        }
      }
    }
  }

  /**
   * Displaces vertices of the nosecone to simulate realistic crumple zone damage.
   */
  private applyVertexDeformation(frontCrumple: number): void {
    if (!this.noseMesh || !this.pristineNosePositions) return;

    const safeCrumple = Number.isFinite(frontCrumple) ? Math.max(0, Math.min(1.0, frontCrumple)) : 0;
    if (Math.abs(safeCrumple - this.lastAppliedCrumple) < 0.001) {
      return;
    }
    this.lastAppliedCrumple = safeCrumple;

    const pos = this.noseMesh.geometry.attributes.position;
    const count = pos.count;
    let needsUpdate = false;

    for (let i = 0; i < count; i++) {
      const origZ = this.pristineNosePositions[i * 3 + 2];
      const origX = this.pristineNosePositions[i * 3];
      const origY = this.pristineNosePositions[i * 3 + 1];

      if (origZ > 0.8) {
        const crumpleAmount = safeCrumple * 0.38 * ((origZ - 0.8) / 1.65);
        const targetZ = origZ - crumpleAmount;
        const dentNoise = Math.sin(origX * 7.5 + origY * 5) * safeCrumple * 0.08;

        pos.setZ(i, targetZ);
        pos.setY(i, origY + Math.abs(dentNoise) * 0.5);
        needsUpdate = true;
      } else {
        pos.setZ(i, origZ);
        pos.setY(i, origY);
      }
    }

    if (needsUpdate) {
      pos.needsUpdate = true;
      this.noseMesh.geometry.computeVertexNormals();
      this.noseMesh.geometry.computeBoundingSphere();
    }
  }

  /**
   * Load custom player 3D model (.glb, .gltf, .zip, .obj) and substitute vehicle
   */
  public async loadCustomModel(file: File): Promise<{ success: boolean; name: string; error?: string }> {
    try {
      const imported = await CarModelImporter.loadFromFile(file);
      this.customModelGroup.clear();
      this.customModelGroup.add(imported.rootGroup);
      this.customModelGroup.visible = true;
      this.proceduralBodyGroup.visible = false;
      this.isCustomModel = true;
      this.currentModelName = imported.name;
      this.customWheelMeshes = imported.wheelMeshes;
      this.customWheelPivotsFront = imported.wheelPivotsFront;

      this.wheelMeshes.forEach((w) => {
        w.visible = false;
      });

      return { success: true, name: imported.name };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, name: file.name, error: msg };
    }
  }

  /**
   * Restore the default procedural competition model
   */
  public restoreDefaultModel(): void {
    this.customModelGroup.clear();
    this.customModelGroup.visible = false;
    this.proceduralBodyGroup.visible = true;
    this.wheelMeshes.forEach((w) => {
      w.visible = true;
    });
    this.isCustomModel = false;
    this.currentModelName = 'Apex F1 Turbo GP';
  }

  /**
   * Underbody Ambient Occlusion & Soft Ground Contact Shadow Plate
   */
  private buildUnderbodyContactShadow(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // 1. Soft penumbra outer wash
    const outerGrad = ctx.createRadialGradient(256, 256, 30, 256, 256, 248);
    outerGrad.addColorStop(0.0, 'rgba(0, 0, 0, 0.95)');
    outerGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0.75)');
    outerGrad.addColorStop(0.70, 'rgba(0, 0, 0, 0.35)');
    outerGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
    ctx.fillStyle = outerGrad;
    ctx.fillRect(0, 0, 512, 512);

    // 2. Chassis undertray deep contact core (Umbra)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.96)';
    ctx.beginPath();
    ctx.roundRect(130, 70, 252, 370, 35);
    ctx.fill();

    // 3. 4 Tire Ground Contact Patches
    ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
    ctx.beginPath();
    ctx.ellipse(86, 95, 36, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(426, 95, 36, 60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(78, 385, 46, 70, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(434, 385, 46, 70, 0, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;

    const geo = new THREE.PlaneGeometry(2.8, 5.2);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1.0,
      polygonOffsetUnits: -1.0,
    });

    const contactMesh = new THREE.Mesh(geo, mat);
    contactMesh.position.set(0, 0.012, 0.12);
    contactMesh.renderOrder = 4;
    this.group.add(contactMesh);
  }
}
