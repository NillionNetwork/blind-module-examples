export const pino = () => ({
  info: () => {},
  error: () => {},
  warn: () => {},
  debug: () => {},
  trace: () => {},
  fatal: () => {},
  child: () => pino(),
  level: 'info',
  levels: { values: {} },
});
export default pino;
export const prettyFactory = () => () => {};