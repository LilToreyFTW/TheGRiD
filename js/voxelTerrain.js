// ADDED - Voxel Terrain System with Greedy Meshing
import * as THREE from 'three';

// Block types
export const BlockType = {
    AIR: 0,
    GRASS: 1,
    DIRT: 2,
    WOOD: 3,
    LEAVES: 4,
    STONE: 5,
    SAND: 6
};

// Block colors
const BlockColors = {
    [BlockType.GRASS]: 0x7cb342,
    [BlockType.DIRT]: 0x5d4037,
    [BlockType.WOOD]: 0x8d6e63,
    [BlockType.LEAVES]: 0x4caf50,
    [BlockType.STONE]: 0x757575,
    [BlockType.SAND]: 0xfdd835
};

export class VoxelTerrain {
    constructor(scene, chunkSize = 16, chunkHeight = 64) {
        this.scene = scene;
        this.chunkSize = chunkSize;
        this.chunkHeight = chunkHeight;
        this.voxelData = new Map(); // chunkKey -> 3D array
        this.chunkMeshes = new Map(); // chunkKey -> mesh
        this.loadedChunks = new Set();
    }

    // Generate voxel data for a chunk
    generateChunkData(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.voxelData.has(chunkKey)) return;

        const data = new Array(this.chunkSize * this.chunkHeight * this.chunkSize).fill(BlockType.AIR);
        const seed = this.hashCode(chunkKey);
        const random = this.seededRandom(seed);

        // Generate terrain heightmap
        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                const worldX = chunkX * this.chunkSize + x;
                const worldZ = chunkZ * this.chunkSize + z;
                
                // Height calculation using noise
                const height = Math.floor(
                    Math.sin(worldX * 0.1) * 5 +
                    Math.cos(worldZ * 0.1) * 5 +
                    Math.sin(worldX * 0.05 + worldZ * 0.05) * 10 +
                    20
                );

                // Generate blocks from bottom to top
                for (let y = 0; y < height && y < this.chunkHeight; y++) {
                    const index = this.getIndex(x, y, z);
                    
                    if (y === height - 1) {
                        data[index] = BlockType.GRASS;
                    } else if (y >= height - 4) {
                        data[index] = BlockType.DIRT;
                    } else {
                        data[index] = BlockType.STONE;
                    }
                }

                // Generate trees occasionally
                if (random() > 0.95 && height > 15) {
                    const treeX = x;
                    const treeY = height;
                    const treeZ = z;
                    
                    // Tree trunk
                    for (let ty = 0; ty < 4 && treeY + ty < this.chunkHeight; ty++) {
                        const treeIndex = this.getIndex(treeX, treeY + ty, treeZ);
                        if (treeIndex >= 0 && treeIndex < data.length) {
                            data[treeIndex] = BlockType.WOOD;
                        }
                    }
                    
                    // Tree leaves
                    for (let lx = -2; lx <= 2; lx++) {
                        for (let lz = -2; lz <= 2; lz++) {
                            for (let ly = 4; ly < 7; ly++) {
                                const leafX = treeX + lx;
                                const leafY = treeY + ly;
                                const leafZ = treeZ + lz;
                                
                                if (leafX >= 0 && leafX < this.chunkSize &&
                                    leafZ >= 0 && leafZ < this.chunkSize &&
                                    leafY < this.chunkHeight &&
                                    (lx !== 0 || lz !== 0 || ly < 6)) {
                                    const leafIndex = this.getIndex(leafX, leafY, leafZ);
                                    if (leafIndex >= 0 && leafIndex < data.length && data[leafIndex] === BlockType.AIR) {
                                        data[leafIndex] = BlockType.LEAVES;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.voxelData.set(chunkKey, data);
        return data;
    }

    // Get voxel at position
    getVoxel(chunkX, chunkZ, x, y, z) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const data = this.voxelData.get(chunkKey);
        if (!data) return BlockType.AIR;

        if (x < 0 || x >= this.chunkSize || y < 0 || y >= this.chunkHeight || z < 0 || z >= this.chunkSize) {
            return BlockType.AIR;
        }

        const index = this.getIndex(x, y, z);
        return data[index] || BlockType.AIR;
    }

    // Check if face is exposed (neighbor is air)
    isFaceExposed(chunkX, chunkZ, x, y, z, face) {
        let nx = x, ny = y, nz = z;
        let nChunkX = chunkX, nChunkZ = chunkZ;

        switch(face) {
            case 0: nx++; break; // +X
            case 1: nx--; break; // -X
            case 2: ny++; break; // +Y
            case 3: ny--; break; // -Y
            case 4: nz++; break; // +Z
            case 5: nz--; break; // -Z
        }

        // Handle chunk boundaries
        if (nx < 0) { nChunkX--; nx = this.chunkSize - 1; }
        if (nx >= this.chunkSize) { nChunkX++; nx = 0; }
        if (nz < 0) { nChunkZ--; nz = this.chunkSize - 1; }
        if (nz >= this.chunkSize) { nChunkZ++; nz = 0; }

        const neighbor = this.getVoxel(nChunkX, nChunkZ, nx, ny, nz);
        return neighbor === BlockType.AIR;
    }

    // Greedy meshing - build optimized geometry
    buildChunkGeometry(chunkX, chunkZ) {
        const data = this.generateChunkData(chunkX, chunkZ);
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const normals = [];
        const colors = [];
        const indices = [];
        let vertexOffset = 0;

        // Face directions
        const faces = [
            { dir: [1, 0, 0], corners: [[0, 1, 1], [0, 0, 1], [0, 0, 0], [0, 1, 0]] }, // +X
            { dir: [-1, 0, 0], corners: [[1, 1, 0], [1, 0, 0], [1, 0, 1], [1, 1, 1]] }, // -X
            { dir: [0, 1, 0], corners: [[1, 1, 1], [0, 1, 1], [0, 1, 0], [1, 1, 0]] }, // +Y
            { dir: [0, -1, 0], corners: [[1, 0, 0], [0, 0, 0], [0, 0, 1], [1, 0, 1]] }, // -Y
            { dir: [0, 0, 1], corners: [[0, 1, 1], [1, 1, 1], [1, 0, 1], [0, 0, 1]] }, // +Z
            { dir: [0, 0, -1], corners: [[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0]] }  // -Z
        ];

        // Process each face direction
        for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
            const face = faces[faceIndex];
            const visited = new Set();

            // Greedy meshing: merge adjacent faces
            for (let y = 0; y < this.chunkHeight; y++) {
                for (let z = 0; z < this.chunkSize; z++) {
                    for (let x = 0; x < this.chunkSize; x++) {
                        const index = this.getIndex(x, y, z);
                        const blockType = data[index];

                        if (blockType === BlockType.AIR) continue;
                        if (visited.has(index)) continue;

                        // Check if face is exposed
                        if (!this.isFaceExposed(chunkX, chunkZ, x, y, z, faceIndex)) continue;

                        // Try to merge faces (greedy meshing)
                        let width = 1;
                        let height = 1;

                        // Extend width
                        while (x + width < this.chunkSize) {
                            const nextIndex = this.getIndex(x + width, y, z);
                            if (data[nextIndex] !== blockType ||
                                visited.has(nextIndex) ||
                                !this.isFaceExposed(chunkX, chunkZ, x + width, y, z, faceIndex)) {
                                break;
                            }
                            width++;
                        }

                        // Extend height
                        let canExtendHeight = true;
                        while (canExtendHeight) {
                            for (let w = 0; w < width; w++) {
                                let checkY = y, checkZ = z;
                                if (faceIndex === 2 || faceIndex === 3) {
                                    // Y faces - extend in Z
                                    checkZ = z + height;
                                } else {
                                    // X/Z faces - extend in Y
                                    checkY = y + height;
                                }

                                if (checkY >= this.chunkHeight || checkZ >= this.chunkSize) {
                                    canExtendHeight = false;
                                    break;
                                }

                                const checkIndex = this.getIndex(x + w, checkY, checkZ);
                                if (data[checkIndex] !== blockType ||
                                    visited.has(checkIndex) ||
                                    !this.isFaceExposed(chunkX, chunkZ, x + w, checkY, checkZ, faceIndex)) {
                                    canExtendHeight = false;
                                    break;
                                }
                            }
                            if (canExtendHeight) height++;
                        }

                        // Mark as visited
                        for (let w = 0; w < width; w++) {
                            for (let h = 0; h < height; h++) {
                                let vx = x + w, vy = y, vz = z;
                                if (faceIndex === 2 || faceIndex === 3) {
                                    vz = z + h;
                                } else {
                                    vy = y + h;
                                }
                                visited.add(this.getIndex(vx, vy, vz));
                            }
                        }

                        // Add quad
                        const color = BlockColors[blockType] || 0xffffff;
                        const worldX = chunkX * this.chunkSize + x;
                        const worldZ = chunkZ * this.chunkSize + z;

                        // Calculate quad vertices based on face direction
                        const corners = face.corners;
                        const normal = new THREE.Vector3(...face.dir);

                        for (let i = 0; i < 4; i++) {
                            const corner = corners[i];
                            let vx = worldX + corner[0] * width;
                            let vy = y + corner[1] * height;
                            let vz = worldZ + corner[2] * (faceIndex === 2 || faceIndex === 3 ? height : width);

                            if (faceIndex === 2 || faceIndex === 3) {
                                vx = worldX + corner[0] * width;
                                vz = worldZ + corner[2] * width;
                                vy = y + corner[1] * height;
                            }

                            positions.push(vx, vy, vz);
                            normals.push(normal.x, normal.y, normal.z);
                            
                            const r = ((color >> 16) & 0xff) / 255;
                            const g = ((color >> 8) & 0xff) / 255;
                            const b = (color & 0xff) / 255;
                            colors.push(r, g, b);
                        }

                        // Add indices for quad (two triangles)
                        const base = vertexOffset;
                        indices.push(base, base + 1, base + 2);
                        indices.push(base, base + 2, base + 3);
                        vertexOffset += 4;
                    }
                }
            }
        }

        // Set geometry attributes
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();

        return geometry;
    }

    // Load/generate chunk mesh
    loadChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.loadedChunks.has(chunkKey)) return;

        const geometry = this.buildChunkGeometry(chunkX, chunkZ);
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(chunkX * this.chunkSize, 0, chunkZ * this.chunkSize);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.chunkKey = chunkKey;

        this.scene.add(mesh);
        this.chunkMeshes.set(chunkKey, mesh);
        this.loadedChunks.add(chunkKey);
    }

    // Unload chunk
    unloadChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const mesh = this.chunkMeshes.get(chunkKey);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.chunkMeshes.delete(chunkKey);
            this.voxelData.delete(chunkKey);
            this.loadedChunks.delete(chunkKey);
        }
    }

    // Update chunks based on camera position
    updateChunks(cameraPosition, viewDistance = 3) {
        const chunkX = Math.floor(cameraPosition.x / this.chunkSize);
        const chunkZ = Math.floor(cameraPosition.z / this.chunkSize);

        const chunksToLoad = new Set();
        for (let x = -viewDistance; x <= viewDistance; x++) {
            for (let z = -viewDistance; z <= viewDistance; z++) {
                chunksToLoad.add(`${chunkX + x},${chunkZ + z}`);
            }
        }

        // Load new chunks
        chunksToLoad.forEach(key => {
            const [cx, cz] = key.split(',').map(Number);
            if (!this.loadedChunks.has(key)) {
                this.loadChunk(cx, cz);
            }
        });

        // Unload distant chunks
        const chunksToUnload = [];
        this.loadedChunks.forEach(key => {
            if (!chunksToLoad.has(key)) {
                const [cx, cz] = key.split(',').map(Number);
                chunksToUnload.push([cx, cz]);
            }
        });

        chunksToUnload.forEach(([cx, cz]) => {
            this.unloadChunk(cx, cz);
        });
    }

    // Utility functions
    getIndex(x, y, z) {
        return x + z * this.chunkSize + y * this.chunkSize * this.chunkSize;
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    seededRandom(seed) {
        let value = seed;
        return () => {
            value = (value * 9301 + 49297) % 233280;
            return value / 233280;
        };
    }
}

