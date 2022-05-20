import path from "path";
import { build as esbuild, BuildOptions, analyzeMetafile } from "esbuild";

const baseConfig: BuildOptions = {
  platform: "node" as const,
  target: "es2016" as const,
  format: "cjs" as const,
  nodePaths: [path.join(__dirname, "../src")],
  sourcemap: true,
  external: [],
  bundle: true,
  minify: true,
  mangleProps: /_$/,
  treeShaking: true,
};

async function main() {
  await esbuild({
    ...baseConfig,
    outdir: path.join(__dirname, "../build/cjs"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
  });

  const esmResult = await esbuild({
    ...baseConfig,
    format: "esm",
    outdir: path.join(__dirname, "../build/esm"),
    entryPoints: [path.join(__dirname, "../src/index.ts")],
    metafile: true,
  });
  let esmAnalysis = await analyzeMetafile(esmResult.metafile);
  console.log(esmAnalysis);
}

if (require.main === module) {
  main();
}
