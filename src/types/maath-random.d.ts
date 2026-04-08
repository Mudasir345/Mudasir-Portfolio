declare module "maath/random/dist/maath-random.esm" {
    interface SphereOptions {
        radius?: number;
        center?: { x: number; y: number; z: number };
    }

    export function inSphere(buffer: Float32Array, sphere?: SphereOptions): Float32Array;
}
