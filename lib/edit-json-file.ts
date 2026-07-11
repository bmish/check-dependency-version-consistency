import { readFileSync, writeFileSync } from 'node:fs';

/** Detect JSON indent from file contents. Returns spaces/tabs string, or 0 for compact JSON. */
export function detectJsonIndent(contents: string): string | number {
  const match = /\n([ \t]+)"/.exec(contents);
  return match?.[1] ?? 0;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

type EditJsonFileOptions = {
  /** Keep a trailing newline when the original file had one. Defaults to detecting from the file. */
  endsWithNewline?: boolean;
};

/**
 * Minimal local replacement for the `edit-json-file` package.
 * Preserves detected indent and trailing newline.
 *
 * @example
 * ```ts
 * editJsonFile('package.json').set(['dependencies', '@types/node'], '^22.0.0');
 * ```
 */
export function editJsonFile(
  path: string,
  options: EditJsonFileOptions = {},
): {
  set: (keys: readonly string[], value: unknown) => void;
} {
  return {
    set(keys: readonly string[], value: unknown) {
      const lastKey = keys.at(-1);
      if (lastKey === undefined) {
        throw new Error('editJsonFile().set() requires at least one key.');
      }

      const contents = readFileSync(path, 'utf8');
      const data: unknown = JSON.parse(contents);
      if (!isPlainObject(data)) {
        throw new TypeError(`Expected ${path} to contain a JSON object.`);
      }

      let cursor = data;
      for (const key of keys.slice(0, -1)) {
        const next = cursor[key];
        if (!isPlainObject(next)) {
          cursor[key] = {};
        }
        cursor = cursor[key] as Record<string, unknown>;
      }
      cursor[lastKey] = value;

      const endsWithNewline =
        options.endsWithNewline ?? contents.endsWith('\n');
      let output = JSON.stringify(data, undefined, detectJsonIndent(contents));
      if (endsWithNewline) {
        output += '\n';
      }
      writeFileSync(path, output);
    },
  };
}
