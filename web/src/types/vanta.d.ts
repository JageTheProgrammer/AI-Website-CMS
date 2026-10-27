/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "vanta/dist/vanta.halo.min" {
  const HALO: (options: Record<string, any>) => {
    destroy: () => void;
  };

  export default HALO;
}