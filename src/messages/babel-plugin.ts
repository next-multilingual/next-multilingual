import { readdirSync } from 'fs';
import { parse, resolve } from 'path';
import type { MulMessagesCollection } from '.';
import { parsePropertiesFile } from './properties';

import * as BabelTypes from '@babel/types';
import type { PluginObj, PluginPass, NodePath } from '@babel/core';
import template from '@babel/template';

export type Program = BabelTypes.Program;
export type Statement = BabelTypes.Statement;
export type ImportDeclaration = BabelTypes.ImportDeclaration;
export type ImportSpecifier = BabelTypes.ImportSpecifier;
export type ImportNamespaceSpecifier = BabelTypes.ImportNamespaceSpecifier;
export type ImportDefaultSpecifier = BabelTypes.ImportDefaultSpecifier;

export type Identifier = BabelTypes.Identifier;
const isImportNamespaceSpecifier = BabelTypes.isImportNamespaceSpecifier;
const isImportSpecifier = BabelTypes.isImportSpecifier;

/** Target module to "babelify". */
const TARGET_MODULE = 'next-multilingual/messages';
/** Target function (of the target module) to "babelify". */
const TARGET_FUNCTION = 'useMessages';

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

/**
 * Verify if an import declaration node matches the target module.
 *
 * @param nodePath A node path object.
 *
 * @returns True is the node matches, otherwise false.
 */
function isMatchingModule(nodePath: NodePath): boolean {
  if (!nodePath.isImportDeclaration()) return false;
  if (nodePath.node.source.value !== TARGET_MODULE) return false;
  return true;
}

/**
 * Verify if a specifier matches the target function.
 *
 * @param nodePath A node path object.
 *
 * @returns True is the specifier matches, otherwise false.
 */
function isMatchingModuleImportName(
  specifier: ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier
): boolean {
  return (
    isImportSpecifier(specifier) && (specifier.imported as Identifier).name === TARGET_FUNCTION
  );
}

/**
 * Verify if an import declaration node matches the target module and function.
 *
 * @param nodePath A node path object.
 *
 * @returns True is the node matches, otherwise false.
 */
function isMatchingNamedImport(nodePath: NodePath): boolean {
  return (
    isMatchingModule(nodePath) &&
    (nodePath.node as ImportDeclaration).specifiers.some((specifier) =>
      isMatchingModuleImportName(specifier)
    )
  );
}

/**
 * Verify if a namespace import declaration node matches the target module and function.
 *
 * @param nodePath A node path object.
 *
 * @returns True is the node matches, otherwise false.
 */
function isMatchingNamespaceImport(nodePath: NodePath): boolean {
  return (
    isMatchingModule(nodePath) &&
    isImportNamespaceSpecifier((nodePath.node as ImportDeclaration).specifiers[0])
  );
}
/**
 * Class used to inject babelified messages.
 */
class Messages {
  /** The program node path associated with the class. */
  private programNodePath: NodePath<Program>;
  /** The source file path associated with the class. */
  private sourceFilePath: string;
  /** The number of time the `getVariableName` was called. */
  private getVariableNameCount = 0;
  /** The unique variable name used relative to the program node path. */
  private variableName: string;

  /**
   * Constructor.
   *
   * @param programNodePath The program node path associated with the class.
   * @param pluginPass The `PluginPass` object associated with the class.
   */
  constructor(programNodePath: NodePath<Program>, pluginPass: PluginPass) {
    this.programNodePath = programNodePath;
    this.sourceFilePath = pluginPass.file.opts.filename;
    this.variableName = this.programNodePath.scope.generateUidIdentifier('messages').name;
  }

  /**
   * Get the unique variable name used relative to the program node path.
   */
  public getVariableName(): string {
    this.getVariableNameCount++;
    return this.variableName;
  }

  /**
   * Inject the babelified messages to the program node path, if the variables name was used.
   */
  public injectIfMatchesFound(): void {
    if (!this.getVariableNameCount) return;

    // Inject the messages at the beginning o the file.
    this.programNodePath.node.body.unshift(
      template.ast(
        `const ${this.variableName} = ${getBabelifiedMessages(this.sourceFilePath)};`
      ) as Statement
    );
  }
}

/**
 * Get a variable name to hijack either a named import or a namespace import.
 *
 * @param nodePath The node path from which to get the unique variable name.
 * @param suffix The suffix of the variable name.
 *
 * @returns A unique variable name in the node path's scope.
 */
function getVariableName(nodePath: NodePath, suffix: string): string {
  return nodePath.scope.generateUidIdentifier(`${TARGET_FUNCTION}${suffix}`).name;
}

/**
 * "Hijack" a namespace (`import * as messages from`) import.
 *
 * This will simply copy the namespace on another function (because namespaces are readonly), and then bind the
 * target function with the babelified messages. All bindings of the original namespace will be replaced by the
 * hijacked namespace.
 *
 * @param nodePath The node path being hijacked.
 * @param messages The object used to conditionally inject babelified messages.
 */
function hijackNamespaceImport(nodePath: NodePath<ImportDeclaration>, messages: Messages): void {
  const node = nodePath.node;
  const specifier = node.specifiers[0];
  const currentName = specifier.local.name;

  // This is the scope-unique variable name that will replace all matching namespace bindings.
  const hijackedNamespace = getVariableName(nodePath, 'Namespace');

  // Rename all bindings with the the new name (this excludes the import declaration).
  const binding = nodePath.scope.getBinding(currentName);

  binding.referencePaths.forEach((referencePath) => {
    referencePath.scope.rename(currentName, hijackedNamespace, referencePath.parent);
  });

  // Insert the new "hijacked" namespace variable, with the correct binding.
  nodePath.insertAfter(
    template.ast(
      `const ${hijackedNamespace} = ${currentName};` +
        `${hijackedNamespace}.${TARGET_FUNCTION}.bind(${messages.getVariableName()});`
    ) as Statement
  );
}

/**
 * "Hijack" a named (`import { useMessages } from`) import.
 *
 * This will simply bind the named import to the babelified messages, on a new function name. All bindings
 * of the original function will replaced by the hijacked function.
 *
 * @param nodePath The node path being hijacked.
 * @param messages The object used to conditionally inject babelified messages.
 */
function hijackNamedImport(nodePath: NodePath<ImportDeclaration>, messages: Messages): void {
  const node = nodePath.node;

  node.specifiers.forEach((specifier) => {
    if (isMatchingModuleImportName(specifier)) {
      // This is the scope-unique variable name that will replace all matching function bindings.
      const hijackedFunction = getVariableName(nodePath, 'Function');

      const currentName = specifier.local.name;

      // Rename all bindings with the the new name (this excludes the import declaration).
      const binding = nodePath.scope.getBinding(currentName);

      binding.referencePaths.forEach((referencePath) => {
        referencePath.scope.rename(currentName, hijackedFunction, referencePath.parent);
      });

      // Insert the new "hijacked" namespace variable, with the correct binding.
      nodePath.insertAfter(
        template.ast(
          `const ${hijackedFunction} = ${currentName}.bind(${messages.getVariableName()});`
        ) as Statement
      );
    }
  });
}

/**
 * This is the Babel plugin.
 *
 * This plugin will visit all files used by Next.js during the build time and inject the localized messages
 * to the `useMessages` hook.
 *
 * What is supported:
 *
 * - Named imports (`import { useMessages } from`): this is how `useMessages` is meant to be used.
 * - Namespace imports (`import * as messages from`): there is no reason for this but it's supported.
 *
 * What is not supported:
 *
 * - Dynamic `import()` statements.
 *
 * @returns A Babel plugin object.
 */
export default function plugin(): PluginObj {
  return {
    visitor: {
      Program(programNodePath: NodePath<Program>, pluginPass: PluginPass) {
        const messages = new Messages(programNodePath, pluginPass);

        (programNodePath.get('body') as NodePath[]).forEach((bodyNodePath) => {
          if (isMatchingNamespaceImport(bodyNodePath)) {
            hijackNamespaceImport(bodyNodePath as NodePath<ImportDeclaration>, messages);
          } else if (isMatchingNamedImport(bodyNodePath)) {
            hijackNamedImport(bodyNodePath as NodePath<ImportDeclaration>, messages);
          }
        });

        messages.injectIfMatchesFound();
      },
    },
  };
}
