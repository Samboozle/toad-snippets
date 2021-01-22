import * as esbuild from 'esbuild-wasm';

const genResolveObj = (namespace: string) => (path: string) => ({ namespace, path });
const namespaceA = genResolveObj("a");

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkgPathPlugin',
    setup: (build: esbuild.PluginBuild) => {
      // handle entry file
      build.onResolve({ filter: /^index\.js$/ }, () => namespaceA("index.js"));

      // handle relative/dependent paths of requested packages/modules
      build.onResolve({ filter: /^\.+\// }, (args: any) =>
        namespaceA(new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href));

      // handle root path of requested package/module
      build.onResolve({ filter: /.*/ }, async (args: any) =>
        namespaceA(`https://unpkg.com/${args.path}`));
    }
  }
}
