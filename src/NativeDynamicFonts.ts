import {TurboModuleRegistry, type TurboModule} from 'react-native';

// NOTE: Do not move source types into a separate file. Due to codegen limitations on iOS,
// they must remain in the same file as the TurboModule spec.

/**
 * Supported dynamic font formats.
 */
export type DynamicFontFormat = 'ttf' | 'otf';

/**
 * The source information for a dynamic font loaded as string
 */
export interface DynamicFontSource {
  /**
   * The name to register the font under.
   */
  name: string;
  /**
   * Base64-encoded font data.
   *
   * This value **must** be a fully formed data URI with included MIME type, e.g.:
   *
   * ```text
   * data:font/ttf;base64,AAEAAAASAQAABAAg...
   * ```
   */
  data: string;
  /**
   * The font type (e.g., 'ttf', 'otf'). If not provided, the native module will attempt to infer it.
   */
  type?: DynamicFontFormat | undefined;
}

/**
 * The source information for a dynamic font loaded from a file.
 */
export interface DynamicFontFileSource {
  /**
   * The name to register the font under.
   */
  name: string;
  /**
   * The file path to load the font from.
   */
  filePath: string;
}

export interface Spec extends TurboModule {
  loadFont(
    options: DynamicFontSource,
    callback: (
      error: string | null | undefined,
      fontName: string | undefined,
    ) => void,
  ): void;
  loadFontFromFile(
    options: DynamicFontFileSource,
    callback: (
      error: string | null | undefined,
      fontName: string | undefined,
    ) => void,
  ): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('DynamicFonts');
