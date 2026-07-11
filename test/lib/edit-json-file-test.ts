import { readFileSync } from 'node:fs';
import mockFs from 'mock-fs';
import { detectJsonIndent, editJsonFile } from '../../lib/edit-json-file.js';

describe('Utils | edit-json-file', function () {
  describe('#detectJsonIndent', function () {
    it('detects two-space indent', function () {
      expect(detectJsonIndent('{\n  "name": "foo"\n}\n')).toBe('  ');
    });

    it('detects tab indent', function () {
      expect(detectJsonIndent('{\n\t"name": "foo"\n}\n')).toBe('\t');
    });

    it('returns 0 for compact JSON', function () {
      expect(detectJsonIndent('{"name":"foo"}')).toBe(0);
    });
  });

  describe('#editJsonFile', function () {
    afterEach(function () {
      mockFs.restore();
    });

    it('sets a nested key and preserves two-space indent and trailing newline', function () {
      mockFs({
        'package.json': `${JSON.stringify(
          {
            dependencies: { foo: '^1.0.0' },
          },
          undefined,
          2,
        )}\n`,
      });

      editJsonFile('package.json').set(['dependencies', 'foo'], '^2.0.0');

      expect(readFileSync('package.json', 'utf8')).toBe(
        `${JSON.stringify(
          {
            dependencies: { foo: '^2.0.0' },
          },
          undefined,
          2,
        )}\n`,
      );
    });

    it('sets dotted / scoped dependency names without treating dots as path separators', function () {
      mockFs({
        'package.json': JSON.stringify({
          devDependencies: { '@types/node': '1.0.0', 'a.b.c': '1.0.0' },
        }),
      });

      editJsonFile('package.json', { endsWithNewline: false }).set(
        ['devDependencies', '@types/node'],
        '2.0.0',
      );
      editJsonFile('package.json', { endsWithNewline: false }).set(
        ['devDependencies', 'a.b.c'],
        '2.0.0',
      );

      expect(JSON.parse(readFileSync('package.json', 'utf8'))).toStrictEqual({
        devDependencies: { '@types/node': '2.0.0', 'a.b.c': '2.0.0' },
      });
    });

    it('creates intermediate objects when missing', function () {
      mockFs({
        'package.json': '{}',
      });

      editJsonFile('package.json', { endsWithNewline: false }).set(
        ['dependencies', 'foo'],
        '^1.0.0',
      );

      expect(readFileSync('package.json', 'utf8')).toBe(
        JSON.stringify({ dependencies: { foo: '^1.0.0' } }),
      );
    });

    it('throws when no keys are provided', function () {
      mockFs({
        'package.json': '{}',
      });

      expect(() => {
        editJsonFile('package.json').set([], 'value');
      }).toThrow('editJsonFile().set() requires at least one key.');
    });

    it('throws when the file is not a JSON object', function () {
      mockFs({
        'package.json': '[]',
      });

      expect(() => {
        editJsonFile('package.json').set(['foo'], 'bar');
      }).toThrowErrorMatchingInlineSnapshot(
        '[TypeError: Expected package.json to contain a JSON object.]',
      );
    });
  });
});
