/**
 * Copyright (c) 2017-present, Wyatt Greenway. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root
 * directory of this source tree.
 */
import {useEffect, useMemo, useState} from 'react';
import RNDynamicFonts from './NativeDynamicFonts';
import type {
  DynamicFontSource,
  DynamicFontFileSource,
  DynamicFontFormat,
} from './NativeDynamicFonts';

const fontRegistry = new Map<string, Promise<string>>();

/**
 * Loads a dynamic font into the application.
 *
 * **Note**
 *  - On Android, the `name` parameter may be used to specify the `fontFamily` value.
 *  - On iOS, the `fontFamily` value may only be the font's internal PostScript name, which may differ from the registered name.
 *  - Due to this limitation, your app should use the font name returned by this function, or the `useDynamicFont()` hook with the registered name.
 *
 * @param name The name to register the font under.
 * @param data The base64-encoded font data.
 * @param type The font type (e.g., 'ttf', 'otf'). If not provided, the native module will attempt to infer it.
 * @param forceLoad If true, forces the font to be reloaded even if it was previously loaded.
 * @returns A promise that resolves to the registered font name.
 */
export function loadFont(
  name: string,
  data: string,
  type?: DynamicFontFormat | undefined,
  forceLoad: boolean = false,
): Promise<string> {
  if (!name) {
    throw new Error('Name is a required argument');
  }

  /* Check if this font was already loaded */
  const existingFont = fontRegistry.get(name);
  if (!forceLoad && existingFont) return existingFont;

  if (!data) {
    throw new Error('Data is a required argument');
  }

  /* Load font via native binary code */
  const loaderPromise = new Promise<string>((resolve, reject) => {
    RNDynamicFonts.loadFont(
      {
        name: name,
        data: data,
        type: type,
      },
      (err, givenName) => {
        if (err || !givenName) {
          fontRegistry.delete(name);
          reject(new Error(err || 'Unknown error loading font'));
          return;
        }

        resolve(givenName);
      },
    );
  });

  fontRegistry.set(name, loaderPromise);
  return loaderPromise;
}

/**
 * Loads a dynamic font from a file path into the application.
 *
 * **Note**
 *  - On Android, the `name` parameter may be used to specify the `fontFamily` value.
 *  - On iOS, the `fontFamily` value may only be the font's internal PostScript name, which may differ from the registered name.
 *  - Due to this limitation, your app should use the font name returned by this function, or the `useDynamicFont()` hook with the registered name.
 *
 * @param name The name to register the font under.
 * @param filePath The file path to the font file.
 * @param forceLoad If true, forces the font to be reloaded even if it was previously loaded.
 * @returns A promise that resolves to the loaded font name.
 */
export function loadFontFromFile(
  name: string,
  filePath: string,
  forceLoad: boolean = false,
): Promise<string> {
  if (!name) {
    throw new Error('name is a required argument');
  }

  /* Check if this font was already loaded */
  const existingFont = fontRegistry.get(name);
  if (!forceLoad && existingFont) return existingFont;

  if (!filePath) {
    throw new Error('filePath is a required argument');
  }

  const loaderPromise = new Promise<string>((resolve, reject) => {
    RNDynamicFonts.loadFontFromFile(
      {
        name,
        filePath,
      },
      (err, givenName) => {
        if (err || !givenName) {
          fontRegistry.delete(name);
          reject(new Error(err || 'Unknown error loading font from file'));
          return;
        }

        resolve(givenName);
      },
    );
  });

  fontRegistry.set(name, loaderPromise);
  return loaderPromise;
}

/**
 * Loads one or more dynamic fonts into the application.
 *
 * **Note**
 *  - On Android, the `name` property will be used to specify the `fontFamily` value.
 *  - On iOS, the `fontFamily` value may only be the font's internal PostScript name, which may differ from the registered name.
 *  - Due to this limitation, your app should use the font name returned by this function, or the `useDynamicFont()` hook with the registered name.
 *
 * @param fontList A single font source or an array of font sources to load.
 * @param forceLoad If true, forces the fonts to be reloaded even if they were previously loaded.
 * @returns A promise that resolves to an array of loaded font names, in the same order as the provided font sources.
 */
export function loadFonts(
  fonts:
    | DynamicFontSource
    | DynamicFontFileSource
    | (DynamicFontSource | DynamicFontFileSource)[],
  forceLoad: boolean = false,
): Promise<string[]> {
  if (!fonts) return Promise.resolve([]);

  const fontList = Array.isArray(fonts) ? fonts : [fonts];

  return Promise.all(
    (Array.isArray(fontList) ? fontList : [fontList])
      .filter(font => font)
      .map(font =>
        'filePath' in font
          ? loadFontFromFile(font.name, font.filePath, forceLoad)
          : loadFont(font.name, font.data, font.type, forceLoad),
      ),
  );
}

/**
 * Retrieves the loaded font name for a registered font.
 *
 * @param registeredName The name the font was registered with (using `DynamicFonts.loadFont()` or `DynamicFonts.loadFontFromFile()`).
 * @returns A promise that resolves to the loaded font name, or `undefined` if the font is not found or failed to load.
 */
export async function getFontName(
  registeredName: string,
): Promise<string | undefined> {
  return fontRegistry.get(registeredName)?.catch(() => undefined);
}

/**
 * Generates a font style object for a dynamic font.
 *
 * @param registeredName The name the font was registered with (using `DynamicFonts.loadFont()` or `DynamicFonts.loadFontFromFile()`).
 * @param fallbackFontFamily An optional `fontFamily` value to use while the dynamic font is loading.
 */
export function useDynamicFont(
  registeredName: string,
  fallbackFontFamily?: string,
): {fontFamily: string} | undefined {
  const [loadedFont, setLoadedFont] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async function load() {
      if (!fontRegistry.has(registeredName)) {
        console.error(
          `[useDynamicFont] Font '${registeredName}' was not registered before use. Dynamic fonts must be registered through 'DynamicFonts.loadFont()' or 'DynamicFonts.loadFontFromFile()' before using them in a component.`,
        );
        return;
      }

      try {
        setLoadedFont(await getFontName(registeredName));
      } catch (err) {
        console.error(
          `[useDynamicFont] Failed to load font '${registeredName}':`,
          err,
        );
      }
    })();
  }, [registeredName]);

  const fontFamily = loadedFont || fallbackFontFamily;

  return useMemo(() => (fontFamily ? {fontFamily} : undefined), [fontFamily]);
}

export const DynamicFonts = {
  getFontName,
  loadFont,
  loadFontFromFile,
  loadFonts,
} as const;
export default DynamicFonts;

// re-exports for convenience
export {type DynamicFontSource};
