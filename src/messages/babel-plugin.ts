import type * as babel from '@babel/core';
import { PluginObj, PluginPass } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import type * as Types from '@babel/types';
import { ImportDeclaration } from '@babel/types';
import { parse as parseProperties } from 'dot-properties';
import { readdirSync, readFileSync } from 'fs';
import { parse, resolve } from 'path';
import { MulMessages, MulMessagesAllLocales } from '.';

function readMessageFiles(filename: string): MulMessagesAllLocales {
  if (!filename) return {};
  const path = parse(filename);

  // TODO: parameterise, allow other file formats & name patterns
  const fileRegexp = new RegExp(`^${path.name}\.([\\w-]+)\.properties$`);
  const mulMessagesAllLocales: MulMessagesAllLocales = {};
  for (const filename of readdirSync(path.dir)) {
    const match = filename.match(fileRegexp);
    if (match) {
      const src = readFileSync(resolve(path.dir, filename), 'utf8');
      mulMessagesAllLocales[match[1].toLowerCase()] = parseProperties(src) as MulMessages;
    }
  }

  return mulMessagesAllLocales;
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

export default function messagePlugin({ types: t }: typeof babel): PluginObj {
  return {
    name: 'next-multilingual messages',
    visitor: {
      ImportDeclaration(nodePath: NodePath<ImportDeclaration>, pluginPass: PluginPass) {
        const { source, specifiers } = nodePath.node;
        if (source.value !== 'next-multilingual/messages') return;
        for (const specifier of specifiers) {
          switch (specifier.type) {
            case 'ImportNamespaceSpecifier':
              throw nodePath.buildCodeFrameError(
                'Namespace imports ("* as foo") are not supported for message functions'
              );
            case 'ImportSpecifier':
              if (specifier.imported.name === 'useMessages') {
                const binding = nodePath.scope.getBinding(specifier.local.name);
                // TODO: Assign this to a variable in the root scope, rather than recreating in each call expression
                const messages = readMessageFiles(pluginPass.file.opts.filename);
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
