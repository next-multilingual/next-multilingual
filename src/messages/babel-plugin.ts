import type * as babel from '@babel/core';
import type { PluginObj, PluginPass } from '@babel/core';
import type { NodePath } from '@babel/traverse';
import type * as Types from '@babel/types';
import { ImportDeclaration } from '@babel/types';
import { readdirSync } from 'fs';
import { parse, resolve } from 'path';
import { MulMessages, MulMessagesCollection } from '.';
import { parsePropertiesFile } from './properties';

/**
 * Get the multilingual message collection associated with a source file invoking `useMessages`.
 *
 * @param sourceFilePath The path of the source file that is invoking `useMessages`.
 *
 * @returns The multilingual collection in all locales available for the associated source file.
 */
function getMulMessagesCollection(sourceFilePath: string): MulMessagesCollection {
  if (!sourceFilePath) return {};
  const parsedSourceFile = parse(sourceFilePath);
  const sourceFileDirectoryPath = parsedSourceFile.dir;
  const sourceFilename = parsedSourceFile.name;

  const fileRegExp = new RegExp(`^${sourceFilename}.(?<locale>[\\w-]+).properties$`);
  const mulMessagesCollection: MulMessagesCollection = {};

  readdirSync(sourceFileDirectoryPath, { withFileTypes: true }).forEach((directoryEntry) => {
    if (directoryEntry.isFile()) {
      const directoryEntryFilename = directoryEntry.name;
      const regExpMatch = directoryEntryFilename.match(fileRegExp);
      if (regExpMatch) {
        const locale = regExpMatch.groups.locale;
        const propertiesFilePath = resolve(sourceFileDirectoryPath, directoryEntryFilename);
        mulMessagesCollection[locale.toLowerCase()] = parsePropertiesFile(propertiesFilePath);
      }
    }
  });

  return mulMessagesCollection;
}

function createObjectExpression(
  t: typeof Types,
  path: NodePath,
  mulMessagesCollection: MulMessagesCollection | MulMessages
): Types.ObjectExpression {
  const props: Types.ObjectProperty[] = [];
  for (const [key, value] of Object.entries(mulMessagesCollection)) {
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
                const mulMessagesCollection = getMulMessagesCollection(
                  pluginPass.file.opts.filename
                );
                console.dir(binding);
                for (const referencePath of binding.referencePaths) {
                  if (referencePath.parent.type === 'CallExpression') {
                    referencePath.parent.arguments.push(
                      createObjectExpression(t, referencePath, mulMessagesCollection)
                    );
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
