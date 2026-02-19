/**
 * generate_bicycle.js
 *
 * Self-contained Node.js script (no dependencies) that generates a low-poly
 * isometric bicycle as a glTF 2.0 file with embedded base64 buffer.
 *
 * Run:  node generate_bicycle.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// 1. Geometry helpers
// ---------------------------------------------------------------------------

/** Create a box centred at the origin.  Returns {positions, normals, indices}. */
function createBox(w, h, d) {
  const hw = w / 2, hh = h / 2, hd = d / 2;

  // 24 vertices (4 per face, 6 faces) so normals are per-face
  const positions = [
    // +Z face
    -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh,  hd,  -hw,  hh,  hd,
    // -Z face
     hw, -hh, -hd,  -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,
    // +Y face
    -hw,  hh,  hd,   hw,  hh,  hd,   hw,  hh, -hd,  -hw,  hh, -hd,
    // -Y face
    -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
    // +X face
     hw, -hh,  hd,   hw, -hh, -hd,   hw,  hh, -hd,   hw,  hh,  hd,
    // -X face
    -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh,  hd,  -hw,  hh, -hd,
  ];

  const normals = [
     0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
     0, 0,-1,  0, 0,-1,  0, 0,-1,  0, 0,-1,
     0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
     0,-1, 0,  0,-1, 0,  0,-1, 0,  0,-1, 0,
     1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ];

  const indices = [];
  for (let f = 0; f < 6; f++) {
    const o = f * 4;
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
  }

  return { positions, normals, indices };
}

/**
 * Create a cylinder along the Y axis, centred at origin.
 * @param {number} rTop    - radius at top
 * @param {number} rBot    - radius at bottom
 * @param {number} height  - height
 * @param {number} seg     - number of radial segments
 */
function createCylinder(rTop, rBot, height, seg) {
  const positions = [];
  const normals   = [];
  const indices   = [];
  const hh = height / 2;

  // --- side ---
  const sideStart = 0;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const cs = Math.cos(a), sn = Math.sin(a);

    // slope normal
    const dr = rBot - rTop;
    const len = Math.sqrt(dr * dr + height * height);
    const ny = dr / len;
    const nr = height / len;

    // bottom vertex
    positions.push(rBot * cs, -hh, rBot * sn);
    normals.push(nr * cs, ny, nr * sn);

    // top vertex
    positions.push(rTop * cs,  hh, rTop * sn);
    normals.push(nr * cs, ny, nr * sn);
  }
  for (let i = 0; i < seg; i++) {
    const a = sideStart + i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b);
    indices.push(b, c, d);
  }

  // --- top cap ---
  const topCenterIdx = positions.length / 3;
  positions.push(0,  hh, 0);
  normals.push(0, 1, 0);
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    positions.push(rTop * Math.cos(a),  hh, rTop * Math.sin(a));
    normals.push(0, 1, 0);
  }
  for (let i = 0; i < seg; i++) {
    indices.push(topCenterIdx, topCenterIdx + 1 + i + 1, topCenterIdx + 1 + i);
  }

  // --- bottom cap ---
  const botCenterIdx = positions.length / 3;
  positions.push(0, -hh, 0);
  normals.push(0, -1, 0);
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    positions.push(rBot * Math.cos(a), -hh, rBot * Math.sin(a));
    normals.push(0, -1, 0);
  }
  for (let i = 0; i < seg; i++) {
    indices.push(botCenterIdx, botCenterIdx + 1 + i, botCenterIdx + 1 + i + 1);
  }

  return { positions, normals, indices };
}

// ---------------------------------------------------------------------------
// 2. 4x4 matrix helpers (column-major, like glTF / OpenGL)
// ---------------------------------------------------------------------------

function mat4Identity() {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

function mat4Translate(tx, ty, tz) {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, tx,ty,tz,1];
}

function mat4Scale(sx, sy, sz) {
  return [sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1];
}

function mat4RotX(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [1,0,0,0, 0,c,s,0, 0,-s,c,0, 0,0,0,1];
}

function mat4RotY(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1];
}

function mat4RotZ(angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [c,s,0,0, -s,c,0,0, 0,0,1,0, 0,0,0,1];
}

function mat4Mul(a, b) {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      for (let k = 0; k < 4; k++)
        r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
}

function mat4Chain(...mats) {
  return mats.reduce((a, b) => mat4Mul(a, b));
}

/** Transform positions array (flat, 3-per-vertex) by a 4x4 matrix. */
function transformPositions(positions, m) {
  const out = [];
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i], y = positions[i+1], z = positions[i+2];
    out.push(
      m[0]*x + m[4]*y + m[8]*z  + m[12],
      m[1]*x + m[5]*y + m[9]*z  + m[13],
      m[2]*x + m[6]*y + m[10]*z + m[14],
    );
  }
  return out;
}

/** Transform normals (rotation only – extract upper-left 3x3). */
function transformNormals(normals, m) {
  const out = [];
  for (let i = 0; i < normals.length; i += 3) {
    const x = normals[i], y = normals[i+1], z = normals[i+2];
    let nx = m[0]*x + m[4]*y + m[8]*z;
    let ny = m[1]*x + m[5]*y + m[9]*z;
    let nz = m[2]*x + m[6]*y + m[10]*z;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;
    out.push(nx/len, ny/len, nz/len);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Define bicycle parts
// ---------------------------------------------------------------------------

// The bicycle is ~2 units long (along Z), ~1.5 units tall, sitting on Y=0.
//
// Layout (side view, looking along +X):
//
//           seat
//            |
//       handlebar ---- seat tube ----+
//           |        /               |
//      head tube   top tube     seat stay
//           |    /                   |
//      fork   down tube         rear wheel
//           | /
//      front wheel
//
// Front wheel centre: Z = +0.6, Y = 0.35
// Rear  wheel centre: Z = -0.6, Y = 0.35

const WHEEL_RADIUS = 0.40;
const WHEEL_THICK  = 0.08; // thickness in X
const WHEEL_SEGS   = 16;

const parts = []; // { geometry, materialIndex }

// Material indices: 0=frame (dark grey), 1=wheels (black), 2=seat (brown), 3=handlebars (silver)

// ---- Wheels (material 1) ----
// Wheels are cylinders rotated so their axis is along X (rotated 90 deg around Z).
function addWheel(cx, cy, cz) {
  const geo = createCylinder(WHEEL_RADIUS, WHEEL_RADIUS, WHEEL_THICK, WHEEL_SEGS);
  const m = mat4Chain(mat4Translate(cx, cy, cz), mat4RotZ(Math.PI / 2));
  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  1,
  });
}

const FRONT_WHEEL_Z = 0.65;
const REAR_WHEEL_Z  = -0.65;
const WHEEL_Y       = WHEEL_RADIUS; // bottom of wheel at Y=0

addWheel(0, WHEEL_Y, FRONT_WHEEL_Z);
addWheel(0, WHEEL_Y, REAR_WHEEL_Z);

// ---- Hub cylinders (small cylinders in the wheel centre) (material 1) ----
function addHub(cx, cy, cz) {
  const geo = createCylinder(0.06, 0.06, 0.10, 8);
  const m = mat4Chain(mat4Translate(cx, cy, cz), mat4RotZ(Math.PI / 2));
  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  1,
  });
}
addHub(0, WHEEL_Y, FRONT_WHEEL_Z);
addHub(0, WHEEL_Y, REAR_WHEEL_Z);

// ---- Frame tubes (material 0) ----
// We approximate tubes as thin boxes.

function addFrameTube(x1, y1, z1, x2, y2, z2, thickness) {
  // Create a box of length = distance, then rotate it so it goes from p1 to p2.
  const dx = x2 - x1, dy = y2 - y1, dz = z2 - z1;
  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  if (len < 0.001) return;

  const t = thickness || 0.04;
  const geo = createBox(t, t, len); // box along Z

  // We need to rotate the box so its Z axis points along (dx,dy,dz).
  // Direction vector
  const dirX = dx/len, dirY = dy/len, dirZ = dz/len;
  // midpoint
  const mx = (x1+x2)/2, my = (y1+y2)/2, mz = (z1+z2)/2;

  // Rotation: align local +Z with direction vector.
  // Using the approach: rotate Z axis to target direction.
  // pitch = angle in YZ plane (rotation around X)
  // yaw   = angle in XZ plane (rotation around Y)
  const pitchAngle = -Math.asin(dirY);       // rotation around X to tilt up/down
  const yawAngle   = Math.atan2(dirX, dirZ); // rotation around Y to aim left/right

  const m = mat4Chain(
    mat4Translate(mx, my, mz),
    mat4RotY(yawAngle),
    mat4RotX(pitchAngle),
  );

  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  0,
  });
}

// Key frame points
const fwC  = [0, WHEEL_Y, FRONT_WHEEL_Z];                 // front wheel centre
const rwC  = [0, WHEEL_Y, REAR_WHEEL_Z];                   // rear wheel centre
const bbC  = [0, WHEEL_Y + 0.05, 0];                       // bottom bracket (pedals)
const stT  = [0, WHEEL_Y + WHEEL_RADIUS + 0.45, -0.20];   // seat tube top
const htT  = [0, WHEEL_Y + WHEEL_RADIUS + 0.35, FRONT_WHEEL_Z - 0.05]; // head tube top

// Down tube: head tube top -> bottom bracket
addFrameTube(htT[0], htT[1], htT[2], bbC[0], bbC[1], bbC[2], 0.05);

// Top tube: head tube top -> seat tube top
addFrameTube(htT[0], htT[1], htT[2], stT[0], stT[1], stT[2], 0.04);

// Seat tube: bottom bracket -> seat tube top
addFrameTube(bbC[0], bbC[1], bbC[2], stT[0], stT[1], stT[2], 0.05);

// Chain stay: bottom bracket -> rear wheel centre
addFrameTube(bbC[0], bbC[1], bbC[2], rwC[0], rwC[1], rwC[2], 0.04);

// Seat stay: seat tube top -> rear wheel centre
addFrameTube(stT[0], stT[1], stT[2], rwC[0], rwC[1], rwC[2], 0.035);

// Fork: head tube top -> front wheel centre
addFrameTube(htT[0], htT[1], htT[2], fwC[0], fwC[1], fwC[2], 0.04);

// Head tube (short vertical tube at front)
addFrameTube(htT[0], htT[1] - 0.15, htT[2], htT[0], htT[1] + 0.05, htT[2], 0.06);

// Seat post: seat tube top extended a bit upward
addFrameTube(stT[0], stT[1], stT[2], stT[0], stT[1] + 0.15, stT[2], 0.04);

// ---- Seat / Saddle (material 2) ----
{
  const geo = createBox(0.12, 0.04, 0.20);
  const m = mat4Translate(stT[0], stT[1] + 0.15 + 0.02, stT[2]);
  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  2,
  });
}

// ---- Handlebars (material 3) ----
// Horizontal bar
{
  const geo = createBox(0.45, 0.035, 0.035);
  const m = mat4Translate(0, htT[1] + 0.08, htT[2] + 0.06);
  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  3,
  });
}
// Handlebar stem (vertical bit)
{
  const geo = createBox(0.03, 0.12, 0.03);
  const m = mat4Translate(0, htT[1] + 0.03, htT[2] + 0.03);
  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  3,
  });
}

// ---- Pedal area / crank (material 0) ----
{
  const geo = createBox(0.25, 0.04, 0.06);
  const m = mat4Translate(bbC[0], bbC[1], bbC[2]);
  parts.push({
    positions: transformPositions(geo.positions, m),
    normals:   transformNormals(geo.normals, m),
    indices:   geo.indices,
    material:  0,
  });
}

// ---- Pedals themselves (material 0) ----
{
  // Left pedal
  const geo1 = createBox(0.06, 0.02, 0.10);
  const m1 = mat4Translate(-0.15, bbC[1] - 0.03, bbC[2]);
  parts.push({
    positions: transformPositions(geo1.positions, m1),
    normals:   transformNormals(geo1.normals, m1),
    indices:   geo1.indices,
    material:  0,
  });
  // Right pedal
  const m2 = mat4Translate(0.15, bbC[1] - 0.03, bbC[2]);
  parts.push({
    positions: transformPositions(geo1.positions, m2),
    normals:   transformNormals(geo1.normals, m2),
    indices:   geo1.indices,
    material:  0,
  });
}

// ---------------------------------------------------------------------------
// 4. Build glTF structure
// ---------------------------------------------------------------------------

// Group parts by material so we get one primitive per material
const primsByMat = {};
for (const p of parts) {
  if (!primsByMat[p.material]) primsByMat[p.material] = [];
  primsByMat[p.material].push(p);
}

// For each material group, merge the geometry into a single set of
// positions / normals / indices.
const mergedPrims = []; // { positions[], normals[], indices[], material }

for (const matIdx of Object.keys(primsByMat).sort((a,b) => a - b)) {
  const group = primsByMat[matIdx];
  const allPos = [], allNorm = [], allIdx = [];
  let vertexOffset = 0;
  for (const p of group) {
    for (let i = 0; i < p.positions.length; i++) allPos.push(p.positions[i]);
    for (let i = 0; i < p.normals.length; i++)   allNorm.push(p.normals[i]);
    for (let i = 0; i < p.indices.length; i++)    allIdx.push(p.indices[i] + vertexOffset);
    vertexOffset += p.positions.length / 3;
  }
  mergedPrims.push({ positions: allPos, normals: allNorm, indices: allIdx, material: parseInt(matIdx) });
}

// Now build the binary buffer.
// Layout per primitive:  [positions (float32)] [normals (float32)] [indices (uint16)]
// We'll create separate bufferViews for each section.

const bufferChunks = []; // { data: Buffer, target: int, byteStride?: int }
const accessorDescs = []; // { bufferView, componentType, count, type, min?, max? }
const primitiveDescs = []; // { mode, attributes:{POSITION,NORMAL}, indices, material }

let currentOffset = 0;

for (const prim of mergedPrims) {
  const vertexCount = prim.positions.length / 3;
  const indexCount  = prim.indices.length;

  // --- Positions ---
  const posBuf = Buffer.alloc(vertexCount * 3 * 4);
  let minP = [Infinity, Infinity, Infinity];
  let maxP = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < vertexCount; i++) {
    const x = prim.positions[i*3], y = prim.positions[i*3+1], z = prim.positions[i*3+2];
    posBuf.writeFloatLE(x, i*12);
    posBuf.writeFloatLE(y, i*12+4);
    posBuf.writeFloatLE(z, i*12+8);
    minP[0] = Math.min(minP[0], x); minP[1] = Math.min(minP[1], y); minP[2] = Math.min(minP[2], z);
    maxP[0] = Math.max(maxP[0], x); maxP[1] = Math.max(maxP[1], y); maxP[2] = Math.max(maxP[2], z);
  }

  const posViewIdx = bufferChunks.length;
  bufferChunks.push({ data: posBuf, target: 34962, byteStride: 12 });
  const posAccIdx = accessorDescs.length;
  accessorDescs.push({
    bufferView: posViewIdx,
    componentType: 5126, // FLOAT
    count: vertexCount,
    type: 'VEC3',
    min: minP,
    max: maxP,
  });

  // --- Normals ---
  const normBuf = Buffer.alloc(vertexCount * 3 * 4);
  for (let i = 0; i < vertexCount; i++) {
    normBuf.writeFloatLE(prim.normals[i*3],   i*12);
    normBuf.writeFloatLE(prim.normals[i*3+1], i*12+4);
    normBuf.writeFloatLE(prim.normals[i*3+2], i*12+8);
  }

  const normViewIdx = bufferChunks.length;
  bufferChunks.push({ data: normBuf, target: 34962, byteStride: 12 });
  const normAccIdx = accessorDescs.length;
  accessorDescs.push({
    bufferView: normViewIdx,
    componentType: 5126,
    count: vertexCount,
    type: 'VEC3',
    min: [-1, -1, -1],
    max: [1, 1, 1],
  });

  // --- Indices ---
  // Use Uint16 if possible (vertex count < 65536)
  const use32 = vertexCount > 65535;
  const idxBuf = use32
    ? Buffer.alloc(indexCount * 4)
    : Buffer.alloc(indexCount * 2);

  let maxIdx = 0;
  for (let i = 0; i < indexCount; i++) {
    if (use32) {
      idxBuf.writeUInt32LE(prim.indices[i], i * 4);
    } else {
      idxBuf.writeUInt16LE(prim.indices[i], i * 2);
    }
    maxIdx = Math.max(maxIdx, prim.indices[i]);
  }

  // Pad index buffer to 4-byte alignment
  const idxBufAligned = (idxBuf.length % 4 !== 0)
    ? Buffer.concat([idxBuf, Buffer.alloc(4 - (idxBuf.length % 4))])
    : idxBuf;

  const idxViewIdx = bufferChunks.length;
  bufferChunks.push({ data: idxBufAligned, target: 34963 });
  const idxAccIdx = accessorDescs.length;
  accessorDescs.push({
    bufferView: idxViewIdx,
    componentType: use32 ? 5125 : 5123, // UNSIGNED_INT or UNSIGNED_SHORT
    count: indexCount,
    type: 'SCALAR',
    max: [maxIdx],
    min: [0],
  });

  primitiveDescs.push({
    mode: 4, // TRIANGLES
    attributes: { POSITION: posAccIdx, NORMAL: normAccIdx },
    indices: idxAccIdx,
    material: prim.material,
  });
}

// Compute byte offsets for bufferViews
let totalByteLength = 0;
const bufferViews = [];
for (const chunk of bufferChunks) {
  const bv = {
    buffer: 0,
    byteOffset: totalByteLength,
    byteLength: chunk.data.length,
    target: chunk.target,
  };
  if (chunk.byteStride) bv.byteStride = chunk.byteStride;
  bufferViews.push(bv);
  totalByteLength += chunk.data.length;
}

// Concatenate all chunks into one buffer
const fullBuffer = Buffer.concat(bufferChunks.map(c => c.data));
const base64Data = fullBuffer.toString('base64');

// Materials
const materials = [
  {
    name: 'Frame',
    pbrMetallicRoughness: {
      baseColorFactor: [0.25, 0.25, 0.25, 1.0],
      metallicFactor: 0.5,
      roughnessFactor: 0.5,
    },
  },
  {
    name: 'Wheels',
    pbrMetallicRoughness: {
      baseColorFactor: [0.1, 0.1, 0.1, 1.0],
      metallicFactor: 0.5,
      roughnessFactor: 0.5,
    },
  },
  {
    name: 'Seat',
    pbrMetallicRoughness: {
      baseColorFactor: [0.4, 0.2, 0.1, 1.0],
      metallicFactor: 0.5,
      roughnessFactor: 0.5,
    },
  },
  {
    name: 'Handlebars',
    pbrMetallicRoughness: {
      baseColorFactor: [0.7, 0.7, 0.7, 1.0],
      metallicFactor: 0.5,
      roughnessFactor: 0.5,
    },
  },
];

// Assemble glTF JSON
const gltf = {
  asset: {
    version: '2.0',
    generator: 'generate_bicycle.js',
  },
  scene: 0,
  scenes: [
    {
      name: 'Scene',
      nodes: [0],
    },
  ],
  nodes: [
    {
      name: 'Bicycle',
      mesh: 0,
    },
  ],
  meshes: [
    {
      name: 'Bicycle_Mesh',
      primitives: primitiveDescs,
    },
  ],
  materials: materials,
  accessors: accessorDescs,
  bufferViews: bufferViews,
  buffers: [
    {
      byteLength: totalByteLength,
      uri: 'data:application/octet-stream;base64,' + base64Data,
    },
  ],
};

// ---------------------------------------------------------------------------
// 5. Write the file
// ---------------------------------------------------------------------------

const outPath = path.join(__dirname, 'gltf', 'bicycle.gltf');

// Ensure directory exists
const outDir = path.dirname(outPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outPath, JSON.stringify(gltf, null, 2), 'utf-8');

console.log('Bicycle glTF written to:', outPath);
console.log('  Total vertices across all primitives:',
  mergedPrims.reduce((s, p) => s + p.positions.length / 3, 0));
console.log('  Total triangles:',
  mergedPrims.reduce((s, p) => s + p.indices.length / 3, 0));
console.log('  Buffer size:', totalByteLength, 'bytes');
console.log('  Primitives:', primitiveDescs.length);
console.log('  Materials:', materials.length);

// Quick validation
try {
  const check = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
  console.log('  JSON validation: OK');
  console.log('  glTF version:', check.asset.version);
} catch (e) {
  console.error('  JSON validation FAILED:', e.message);
}
