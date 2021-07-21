import * as BabelNamespace from '@babel/core';
import type { PluginObj, PluginPass, NodePath } from '@babel/core';
import { readdirSync } from 'fs';
import { parse, resolve } from 'path';
import type { MulMessages, MulMessagesCollection } from '.';
import { parsePropertiesFile } from './properties';

export type Babel = typeof BabelNamespace;
export type BabelTypes = typeof BabelNamespace.types;

type ImportDeclaration = BabelNamespace.types.ImportDeclaration;
type ObjectProperty = BabelNamespace.types.ObjectProperty;
type ObjectExpression = BabelNamespace.types.ObjectExpression;
type StringLiteral = BabelNamespace.types.StringLiteral;

/**
 * Get the multilingual message collection associated with a source file invoking `useMessages`.
 *
 * @param sourceFilePath - The path of the source file that is invoking `useMessages`.
 *
 * @returns The multilingual messages collection in all locales available for the associated source file.
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

/**
 * Create a Babel `ObjectExpression` object.
 *
 * @param babelTypes - A Babel Types object.
 * @param nodePath - A Babel `NodePath` object from which to create.
 * @param mulMessagesCollection - A multilingual messages collection.
 *
 * @returns A Babel `ObjectExpression` object.
 */
function createObjectExpression(
  babelTypes: BabelTypes,
  nodePath: NodePath,
  mulMessagesCollection: MulMessagesCollection | MulMessages
): ObjectExpression {
  const props: ObjectProperty[] = [];
  for (const [key, value] of Object.entries(mulMessagesCollection)) {
    let pv: StringLiteral | ObjectExpression;
    if (typeof value === 'string') {
      pv = babelTypes.stringLiteral(value);
    } else if (value && typeof value === 'object') {
      pv = createObjectExpression(babelTypes, nodePath, value);
    } else
      throw nodePath.buildCodeFrameError(
        `Expected a string or object value, but found ${value && typeof value}`
      );
    props.push(babelTypes.objectProperty(babelTypes.stringLiteral(key), pv));
  }

  return babelTypes.objectExpression(props);
}

/**
 * Todo: Add proper description...
 *
 * @param babel - Todo: Add proper description...
 *
 * @returns A plugin object to be used by Babel.
 */
export default function plugin(babel: Babel): PluginObj {
  return {
    name: 'next-multilingual/messages',
    visitor: {
      ImportDeclaration(nodePath: NodePath<ImportDeclaration>, pluginPass: PluginPass) {
        const moduleName = nodePath.node.source.value;
        const specifiers = nodePath.node.specifiers;

        // Skip if the module name does not match.
        if (moduleName !== 'next-multilingual/messages') return;

        // If the module name matches, but it's using a namespace import, throw an error (there is no reason to do this).
        specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            throw nodePath.buildCodeFrameError(
              'Namespace imports ("* as foo") are not supported by `next-multilingual/messages`'
            );
          }
        });

        // Try to find at least one named import of `useMessages`.
        const specifier = specifiers.find(
          (specifier) =>
            specifier.type === 'ImportSpecifier' && specifier.imported.name === 'useMessages'
        );

        // If found, then inject the multilingual messages collection.
        if (specifier) {
          const binding = nodePath.scope.getBinding(specifier.local.name); // Also works when renaming imports!
          const mulMessagesCollection = getMulMessagesCollection(pluginPass.file.opts.filename);

          // if (
          //   pluginPass.file.opts.filename ===
          //   'C:\\Projects\\next-multilingual\\example\\pages\\contact-us\\index.tsx'
          // ) {
          //   console.dir(binding.referencePaths, { depth: null });
          // }

          for (const referencePath of binding.referencePaths) {
            if (referencePath.parent.type === 'CallExpression') {
              referencePath.parent.arguments.push(
                createObjectExpression(babel.types, referencePath, mulMessagesCollection)
              );
              break;
            }
          }
        }
      },
    },
  };
}
