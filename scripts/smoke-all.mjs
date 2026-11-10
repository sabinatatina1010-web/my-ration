import { spawnSync } from "node:child_process";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

const steps = [
  "unit:nutrition",
  "unit:assistant",
  "smoke:auth",
  "smoke:profile",
  "smoke:dashboard",
  "smoke:diary",
  "smoke:food-estimate",
  "smoke:weight-water",
  "smoke:assistant",
];

let failed = 0;

for (const step of steps) {
  console.log(`\n=== ${step} ===`);
  const result = spawnSync(npmBin, ["run", step], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    failed += 1;
    console.error(`${step} FAILED`);
  }
}

if (failed > 0) {
  console.error(`\nSMOKE_ALL_FAIL (${failed}/${steps.length})`);
  process.exitCode = 1;
  process.exit(1);
}

console.log(`\nSMOKE_ALL_OK (${steps.length}/${steps.length})`);
