import { lifeCycleRegistry } from "./lifeCycle.js";

const noop = () => undefined;

export const withLifeCycle = ({ mounted, updated, unmounted } = {}, component) => {
  lifeCycleRegistry.set(component, {
    mounted(ctx) {
      return (typeof mounted === "function" ? mounted : noop)(ctx);
    },
    updated(prevCtx, nextCtx) {
      return (typeof updated === "function" ? updated : noop)(prevCtx, nextCtx);
    },
    unmounted(ctx) {
      return (typeof unmounted === "function" ? unmounted : noop)(ctx);
    },
  });
  return component;
};
