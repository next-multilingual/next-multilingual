import { HijackTarget, KeyValueObject, messageModulePlugin } from 'messages-modules';
import { getProperties } from 'properties-file';

import { highlight, highlightFilePath, log } from '../';
import { keySegmentRegExp, keySegmentRegExpDescription } from './';

import type { PluginObj } from '@babel/core';

const isInNextJs = process?.env?.__NEXT_PROCESSED_ENV === 'true';
const applicationId = process?.env?.nextMultilingualApplicationId as string;

if (isInNextJs && (applicationId === undefined || !keySegmentRegExp.test(applicationId))) {
  throw new Error(`you must define your application identifier using \`next-multilingual/config\``);
}

/**
 * Targets to hijack.
 */
export const hijackTargets: HijackTarget[] = [
  {
    module: 'next-multilingual/messages',
    function: 'useMessages',
  },
  {
    module: 'next-multilingual/messages',
    function: 'getMessages',
  },
];

/**
 * Get messages from properties file.
 *
 * Since the key prefix is only used by the translation memory (TM) during the translation process, we
 * can remove it from the messages to compress their size while making them easier to access. We also need
 * to validate that the keys are following the expected format.
 *
 * @param propertiesFilePath - The path of the .properties file from which to read the messages.
 *
 * @returns A "key/value" object storing messages where the key only contains the identifier segment of the key.
 */
export function getMessages(propertiesFilePath: string): KeyValueObject {
  const properties = getProperties(propertiesFilePath);
  let context: string | undefined;
  const compactedKeyValueObject: KeyValueObject = {};

  for (const property of properties.collection) {
    const keySegments = property.key.split('.');

    // Verify the key's format.
    if (keySegments.length !== 3) {
      log.warn(
        `unable to use messages in ${highlightFilePath(
          propertiesFilePath
        )} because the key ${highlight(property.key)} is invalid. It must follow the ${highlight(
          '<applicationId>.<context>.<id>'
        )} format.`
      );
      return {};
    }
    const [applicationIdSegment, contextSegment, idSegment] = keySegments;

    // Verify the key's unique application identifier.
    if (applicationIdSegment !== applicationId) {
      log.warn(
        `unable to use messages in ${highlightFilePath(
          propertiesFilePath
        )} because the application identifier ${highlight(applicationIdSegment)} in key ${highlight(
          property.key
        )} is invalid. Expected value: ${highlight(applicationId)}.`
      );
      return {};
    }

    // Verify the key's context.
    if (context === undefined) {
      if (!keySegmentRegExp.test(contextSegment)) {
        log.warn(
          `unable to use messages in ${highlightFilePath(
            propertiesFilePath
          )} because the context ${highlight(contextSegment)} in key ${highlight(
            property.key
          )} is invalid. Key context ${keySegmentRegExpDescription}.`
        );
        return {};
      }
      context = contextSegment;
    } else if (contextSegment !== context) {
      log.warn(
        `unable to use messages in ${highlightFilePath(
          propertiesFilePath
        )} because the context ${highlight(contextSegment)} in key ${highlight(
          property.key
        )} is invalid. Only one key context is allowed per file. Expected value: ${highlight(
          context
        )}.`
      );
      return {};
    }

    // Verify the key's identifier.
    if (!keySegmentRegExp.test(idSegment)) {
      log.warn(
        `unable to use messages in ${highlightFilePath(
          propertiesFilePath
        )} because the identifier ${highlight(idSegment)} in key ${highlight(
          property.key
        )} is invalid. Key identifiers ${keySegmentRegExpDescription}.`
      );
      return {};
    }

    // If validation passes, keep only the identifier part of the key to reduce file sizes.
    compactedKeyValueObject[idSegment] = property.value;
  }

  // Verify key collisions.
  if (Object.entries(compactedKeyValueObject).length) {
    const keyPrefix = `${applicationId}.${context}.`;
    const keyCollisions = properties.getKeyCollisions();
    for (const keyCollision of keyCollisions) {
      if (keyCollision.key.startsWith(keyPrefix)) {
        log.warn(
          `unable to use messages in ${highlightFilePath(
            propertiesFilePath
          )} because the key ${highlight(
            keyCollision.key
          )} has been used multiple times (lines ${highlight(
            keyCollision.startingLineNumbers.join(', ')
          )}).`
        );

        return {};
      }
    }
  }

  return compactedKeyValueObject;
}

/**
 * This an example Babel plugin.
 *
 * This plugin will inject all the files that contains the targets to hijack with localized messages.
 *
 * @returns A Babel plugin object.
 */
export default function plugin(): PluginObj {
  return messageModulePlugin(hijackTargets, 'properties', getMessages);
}
