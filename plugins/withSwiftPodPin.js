// Config plugin: withSwiftPodPin
//
// Reapplies the two native tweaks that a source-built RN release needs, so `expo prebuild --clean`
// and EAS Build regenerate a working `ios/` instead of wiping them (they otherwise live only as
// manual edits in the generated, git-ignored `ios/`). See CLAUDE.md "Apple on-device narrator".
//
//   1. Pin every Pod target to Swift 5 language mode + minimal strict concurrency. Building the whole
//      tree from source (RCT_USE_PREBUILT_RNCORE=0) compiles Expo modules under Xcode 26 / Swift 6,
//      whose region-based isolation turns "sending risks data races" into HARD errors
//      (e.g. ExpoModulesCore EventEmitter.swift). Swift 5 mode compiles them as the prebuilt path does.
//   2. Keep EXPO_USE_PRECOMPILED_MODULES=false so the precompiled ExpoModulesCore.xcframework is not
//      pulled back in (belt-and-suspenders with expo-build-properties buildReactNativeFromSource).
//
// NOT reproduced here: the AppDelegate `#if DEBUG` LAN-IP hack (dev-only, hardcodes a wifi IP that
// changes; Release uses the embedded main.jsbundle and never needs it).

const { withDangerousMod, withPodfileProperties } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const BEGIN = '# >>> withSwiftPodPin (generated) — do not edit by hand';
const END = '# <<< withSwiftPodPin';
const ANCHOR = 'post_install do |installer|';

const SNIPPET = `
    ${BEGIN}
    # Pin source-built pods to Swift 5 / minimal concurrency (Xcode 26 + Swift 6 strict concurrency
    # breaks building Expo modules from source). Keep in sync with CLAUDE.md.
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
        config.build_settings['SWIFT_VERSION'] = '5.0'
      end
    end
    ${END}
`;

/** Inject the Swift pin into the Podfile's existing post_install block. Idempotent + fails loud if
 *  the anchor moves (better a build-time error than a silently unpinned, broken archive). */
function withSwiftPin(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (contents.includes(BEGIN)) return cfg; // already applied
      if (!contents.includes(ANCHOR)) {
        throw new Error(
          `withSwiftPodPin: "${ANCHOR}" not found in Podfile — the RN template changed; update the plugin.`
        );
      }
      contents = contents.replace(ANCHOR, `${ANCHOR}\n${SNIPPET}`);
      fs.writeFileSync(podfile, contents, 'utf8');
      return cfg;
    },
  ]);
}

module.exports = function withSwiftPodPin(config) {
  config = withPodfileProperties(config, (cfg) => {
    cfg.modResults.EXPO_USE_PRECOMPILED_MODULES = 'false';
    return cfg;
  });
  config = withSwiftPin(config);
  return config;
};
