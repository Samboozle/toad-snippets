import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import forage from 'localforage';

const pkgCache = forage.createInstance({
  name: "pkg-cache"
});

export const unpkgAid = () => {
  return {
    name: 'unpkgAid',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        console.log("onResolve", args);
        let url = `https://unpkg.com/${args.path}`;
        if (args.path === "index.js") {
          return {
            path: args.path,
            namespace: "a"
          }
        } else if (/\.+\//.test(args.path)) {
          url = new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href;
        }
        return {
          path: url,
          namespace: "a"
        }
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log("onLoad", args);

        
        switch (args.path) {
          case "index.js":
            return {
              loader: "jsx",
              contents: `
                const message = require('react');
                console.log(message);
              `
            }
          default:
            const cachedPkg = await pkgCache.getItem<esbuild.OnLoadResult>(args.path);
            if (cachedPkg) return cachedPkg;
            const { data, request: { responseURL } } = await axios.get(args.path);
            const pkg: esbuild.OnLoadResult = {
              loader: "jsx",
              contents: data,
              resolveDir: new URL('./', responseURL).pathname
            }
            pkgCache.setItem(args.path, pkg);
            return pkg;
        }
      });

    }
  }
}
