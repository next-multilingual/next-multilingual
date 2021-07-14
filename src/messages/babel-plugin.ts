import type { NodePath, Visitor } from '@babel/traverse';
import type * as Types from '@babel/types';
import { parse as parseProperties } from 'dot-properties';
import { readdirSync, readFileSync } from 'fs';
import { parse, resolve } from 'path';

function readMessageFiles(filename: string) {
  if (!filename) return {};
  const path = parse(filename);

  // TODO: parameterise, allow other file formats & name patterns
  const re = new RegExp(`^${path.name}\.([\\w-]+)\.properties$`);
  const res: Record<string, Record<string, string>> = {};
  for (const fn of readdirSync(path.dir)) {
    const match = fn.match(re);
    if (match) {
      const src = readFileSync(resolve(path.dir, fn), 'utf8');
      res[match[1].toLowerCase()] = parseProperties(src) as Record<string, string>;
    }
  }

  return res;
}

function createObjectExpression(
  t: typeof Types,
  path: NodePath,
  object: Record<string, any>
): Types.ObjectExpression {
  const props: Types.ObjectProperty[] = [];
  for (const [key, value] of Object.entries(object)) {
    let pv: Types.StringLiteral | Types.ObjectExpression;
    if (typeof value === 'string') {
      pv = t.stringLiteral(value);
    } else if (value && typeof value === 'object') {
      pv = createObjectExpression(t, path, value);
    } else
      throw path.buildCodeFrameError(
        `Expected a string or object value, but found ${value && typeof value}`
      );
    props.push(t.objectProperty(t.stringLiteral(key), pv));
  }
  return t.objectExpression(props);
}

export default function messagePlugin({ types: t }: { types: typeof Types }): {
  visitor: Visitor<{ file: any }>;
} {
  return {
    visitor: {
      ImportDeclaration(path, state) {
        const { source, specifiers } = path.node;
        if (source.value !== 'next-multilingual/messages') return;
        for (const spec of specifiers) {
          switch (spec.type) {
            case 'ImportNamespaceSpecifier':
              throw path.buildCodeFrameError(
                'Namespace imports ("* as foo") are not supported for message functions'
              );
            case 'ImportSpecifier':
              if (spec.imported.name === 'useMessages') {
                const binding = path.scope.getBinding(spec.local.name);
                // TODO: Assign this to a variable in the root scope, rather than recreating in each call expression
                const messages = readMessageFiles(state.file.opts.filename);
                for (const path of binding.referencePaths) {
                  if (path.parent.type === 'CallExpression') {
                    path.parent.arguments.push(createObjectExpression(t, path, messages));
                  }
                }
              }
              break;
          }
        }
      },
    },
  };
}
