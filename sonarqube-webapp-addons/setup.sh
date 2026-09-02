#!/usr/bin/env bash

set -Eeuo pipefail

CURRENT_DIR=$(pwd)

function override_vite_config() {
    if [[ -f ./vite.config.src.ts ]]; then
        echo "vite.config.src.ts exists, skipping override"
        return
    fi
    echo "Overriding config vite.config.base.ts"
    mv ./vite.config.base.ts ./vite.config.src.ts
    cat <<'EOF' >vite.config.base.ts
import { resolve } from 'node:path';
import { baseViteConfig as config } from './vite.config.src';

export * from './vite.config.src';

// vite-tsconfig-paths discovers tsconfig.json files asynchronously (tsconfck.findAll), and
// resolveId calls for our symlinked sq-server-addons files can race ahead of that discovery
// finishing - even with projectDiscovery: 'lazy' - intermittently failing to resolve
// ~sq-server-commons/* imports. apps/sq-server/vite.config.ts already works around the same
// class of problem for ~adapters, ~shared and ~design-system by aliasing them natively
// instead of relying on tsconfig-paths; add ~sq-server-commons to that same native alias
// object here so it's just as reliable, following the identical convention.
export const baseViteConfig = {
  ...config,
  resolve: {
    preserveSymlinks: true,
    alias: {
      ...config.resolve?.alias,
      '~sq-server-commons': resolve(__dirname, 'libs/sq-server-commons/src'),
    },
  },
};
EOF
}

function main() {
    cd ./sonarqube-webapp
    echo "Creating symlink for sonarqube-webapp/libs/sq-server-addons"
    rm -rf ./libs/sq-server-addons
    ln -s "${CURRENT_DIR}/sonarqube-webapp-addons" ./libs/sq-server-addons
    override_vite_config
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
