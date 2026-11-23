declare module "subset-font" { export default function subsetFont(buf: Buffer, text: string, opts?: { targetFormat?: string }): Promise<Buffer>; }
