import { readdirSync } from 'fs';
import { parse, resolve } from 'path';
import type { MulMessagesCollection } from '.';
import { parsePropertiesFile } from './properties';

import * as BabelCoreNamespace from '@babel/core';
import * as BabelTypesNamespace from '@babel/types';
import { cloneNode } from '@babel/types';
import type { PluginObj, PluginPass, NodePath } from '@babel/core';
import { parse as babelParse } from '@babel/parser';

export type Babel = typeof BabelCoreNamespace;
export type BabelTypes = typeof BabelTypesNamespace;
export type ImportDeclaration = BabelTypesNamespace.ImportDeclaration;
export type ImportSpecifier = BabelTypesNamespace.ImportSpecifier;
export type ImportNamespaceSpecifier = BabelTypesNamespace.ImportNamespaceSpecifier;
export type Identifier = BabelTypesNamespace.Identifier;
const isImportNamespaceSpecifier = BabelTypesNamespace.isImportNamespaceSpecifier;
const isImportSpecifier = BabelTypesNamespace.isImportSpecifier;
const importDeclaration = BabelTypesNamespace.importDeclaration;

// TODO: re-inject messages before imports (top of program)
// TODO: re-inject variables right after first import
// TODO: check if we can support dynamic `import()`

/**
 * Class used to inject localized messages using Babel (a.k.a "babelified" messages).
 */
export class BabelifiedMessages {
  readonly babelified = true;
  messages: MulMessagesCollection = {};
}

/**
 * Get the "babelified" multilingual message collection associated with a source file invoking `useMessages`.
 *
 * @param sourceFilePath - The path of the source file that is invoking `useMessages`.
 *
 * @returns The "babelified" multilingual messages collection in string format.
 */
function getBabelifiedMessages(sourceFilePath: string): string {
  const parsedSourceFile = parse(sourceFilePath);
  const sourceFileDirectoryPath = parsedSourceFile.dir;
  const sourceFilename = parsedSourceFile.name;
  const babelifiedMessages = new BabelifiedMessages();

  const fileRegExp = new RegExp(`^${sourceFilename}.(?<locale>[\\w-]+).properties$`);

  readdirSync(sourceFileDirectoryPath, { withFileTypes: true }).forEach((directoryEntry) => {
    if (directoryEntry.isFile()) {
      const directoryEntryFilename = directoryEntry.name;
      const regExpMatch = directoryEntryFilename.match(fileRegExp);
      if (regExpMatch) {
        const locale = regExpMatch.groups.locale;
        const propertiesFilePath = resolve(sourceFileDirectoryPath, directoryEntryFilename);
        babelifiedMessages.messages[locale.toLowerCase()] = parsePropertiesFile(propertiesFilePath);
      }
    }
  });

  return JSON.stringify(babelifiedMessages);
}

// Name of the target module to "babelify".
const MODULE_NAME = 'next-multilingual/messages';
// Import name of the target module to "babelify".
const MODULE_IMPORT_NAME = 'useMessages';
// Name of the injected variable that will contain the messages.
const INJECTED_VARIABLE_NAME = 'messages';

/**
 * Babel plugin to inject multilingual messages into Next.js pages or components.
 *
 * @returns A plugin object to be used by Babel.
 */
export default function plugin(): PluginObj {
  return {
    visitor: {
      Program(nodePath: NodePath, pluginPass: PluginPass) {
        // Name of the variables referencing matching namespace imports (e.g. "import * as messages").
        const namespaceImports: string[] = [];
        // Name of the variables referencing matching named imports (e.g. "import { useMessage }").
        const namedImports: string[] = [];

        // Get all import declarations.
        const importDeclarationNodePaths = (nodePath.get('body') as NodePath[]).filter((node) =>
          node.isImportDeclaration()
        ) as NodePath<ImportDeclaration>[];

        // Make a copy of the node so we can restore it later after we rename all matching variables.
        const originalImportDeclarationNodes = importDeclarationNodePaths.map((nodePath) => {
          return cloneNode(nodePath.node, true);
        }) as ImportDeclaration[];

        // Check for all matching namespace an name imports and track them.
        importDeclarationNodePaths.forEach((importDeclarationNodePath) => {
          const importDeclarationNode = importDeclarationNodePath.node;
          const specifiers = importDeclarationNode.specifiers as ImportSpecifier[];
          const importedModuleName = importDeclarationNode.source.value;
          if (importedModuleName !== MODULE_NAME) return;

          specifiers.forEach((specifier) => {
            if (isImportNamespaceSpecifier(specifier)) {
              // Add the alias (variable name) of all matching namespace imports.
              namespaceImports.push((specifier as ImportNamespaceSpecifier).local.name);
            } else if (isImportSpecifier(specifier)) {
              const importName = (specifier.imported as Identifier).name;
              const importNameAlias = specifier.local.name;
              if (importName === MODULE_IMPORT_NAME) {
                // Add the alias (variable name) of all matching named imports.
                namedImports.push(importNameAlias);
              }
            }
          });
        });

        // Stop if no matching imports.
        if (!namespaceImports.length && !namedImports.length) {
          return;
        }

        // This is the scope-unique variable name that will contain all messages.
        const messagesVariable = nodePath.scope.generateUidIdentifier(INJECTED_VARIABLE_NAME);

        // Create the code to inject, starting with the localized messages.
        let codeToInject = `const ${messagesVariable.name} = ${getBabelifiedMessages(
          pluginPass.file.opts.filename
        )};`;

        // If there are matching namespace imports, hijack the namespace variable.
        if (namespaceImports.length) {
          // This is the scope-unique variable name that will replace all matching namespace bindings.
          const hijackedNamespace = nodePath.scope.generateUidIdentifier(
            `${MODULE_IMPORT_NAME}Namespace`
          );

          // Copy the namespace to another variable first since its readonly.
          codeToInject += `const ${hijackedNamespace.name} = ${namespaceImports[0]};`;
          // Overwrite the function with the correct binding.
          codeToInject += `${hijackedNamespace.name}.${MODULE_IMPORT_NAME} = ${namespaceImports[0]}.${MODULE_IMPORT_NAME}.bind(${messagesVariable.name});`;

          // Rename all matching namespace imports variables reference in the global scope with the new hijacked namespace.
          namespaceImports.forEach((namespaceImport) => {
            // This will also rename the import declarations, so we will have to restore their original value.
            nodePath.scope.rename(namespaceImport, hijackedNamespace.name);
          });
        }

        // If there are matching named imports, hijack the named variable.
        if (namedImports.length) {
          // This is the scope-unique variable name that will replace all matching function bindings.
          const hijackedFunction = nodePath.scope.generateUidIdentifier(
            `${MODULE_IMPORT_NAME}Function`
          );

          // Hijack named imports with a copy of the function with the correct binding.
          codeToInject += `const ${hijackedFunction.name} = ${namedImports[0]}.bind(${messagesVariable.name});`;

          // Rename all matching named imports variables reference in the global scope with the new hijacked function.
          namedImports.forEach((namedImport) => {
            // This will also rename the import declarations, so we will have to restore their original value.
            nodePath.scope.rename(namedImport, hijackedFunction.name);
          });
        }

        // Because of the global scope rename, we need to set back original import declarations.
        for (const importPosition in importDeclarationNodePaths) {
          const hijackedImportDeclarationNodePath = importDeclarationNodePaths[importPosition];
          const originalImportDeclarationNode = originalImportDeclarationNodes[importPosition];

          // Replace the specifiers of the hijacked import declaration with its original value.
          hijackedImportDeclarationNodePath.replaceWith(
            importDeclaration(
              originalImportDeclarationNode.specifiers,
              hijackedImportDeclarationNodePath.node.source
            )
          );
        }

        // Inject the code directly after the last import.
        importDeclarationNodePaths.pop().insertAfter(babelParse(codeToInject));
      },
    },
  };
}
