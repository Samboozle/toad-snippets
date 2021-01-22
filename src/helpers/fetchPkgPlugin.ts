import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import forage from 'localforage';

const pkgCache = forage.createInstance({ name: "pkg-cache" });
const genOnLoadResult = (obj: { contents: any, resolveDir?: string }): esbuild.OnLoadResult =>
  ({ loader: "jsx", ...obj });
const minifyCSS = (css: string) => css.replace(/\n/g, '').replace(/"/g, '\\"').replace(/'/, "\\'");

export const fetchPkgPlugin = (userCode: string) => {
  return {
    name: "fetchPkgPlugin",
    setup: (build: esbuild.PluginBuild) => {
      build.onLoad({ filter: /^index\.js$/ }, () =>
        genOnLoadResult({ contents: userCode }));

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const cachedPkg = await pkgCache.getItem<esbuild.OnLoadResult>(args.path);
        if (cachedPkg) return cachedPkg;
        return null;
      })

      build.onLoad({ filter: /\.css$/ }, async (args: any) => {
        const { data, request: { responseURL } } = await axios.get(args.path);
        const contents = `
          const style = document.createElement('style');
          style.innerText = '${ minifyCSS(data) }';
          document.head.appendChild(style);
        `;
        const pkg: esbuild.OnLoadResult = genOnLoadResult({
          contents, resolveDir: new URL('./', responseURL).pathname
        });
        pkgCache.setItem(args.path, pkg);
        return pkg;
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request: { responseURL } } = await axios.get(args.path);
        const pkg: esbuild.OnLoadResult = genOnLoadResult({
          contents: data,
          resolveDir: new URL('./', responseURL).pathname
        });
        pkgCache.setItem(args.path, pkg);
        return pkg;
      });
    }
  }
}
