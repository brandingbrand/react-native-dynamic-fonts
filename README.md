
# React Native Dynamic Font Loader, brought to you by [BrandingBrand](http://www.brandingbrand.com) [![npm version](https://badge.fury.io/js/@brandingbrand%2Freact-native-dynamic-fonts.svg)](https://badge.fury.io/js/@brandingbrand%2Freact-native-dynamic-fonts) [![npm](https://img.shields.io/npm/dt/@brandingbrand%2Freact-native-dynamic-fonts.svg)](https://www.npmjs.org/package/@brandingbrand%2Freact-native-dynamic-fonts) ![MIT](https://img.shields.io/dub/l/vibe-d.svg) ![Platform - Android and iOS](https://img.shields.io/badge/platform-Android%20%7C%20iOS-yellow.svg)

A React Native module that allows you to load fonts dynamically at runtime via base64 encoded TTF or OTF

This repo is a fork of [react-native-dynamic-fonts](https://www.npmjs.com/package/react-native-dynamic-fonts/). Previously maintained by [eVisit](https://github.com/eVisit).

## Table of contents

- [Install](#install)
- [Usage](#usage)
- [Options](#options)

## Install

`npm install @brandingbrand/react-native-dynamic-fonts@latest --save`

### Automatic Installation

If you've created your project either with `react-native init` or `create-react-native-app` you can link DynamicFonts automatically:

```bash
react native link
```

### Alternative Installation

#### iOS

##### Cocoapods

```podspec
pod 'DynamicFonts', :path => 'node_modules/@brandingbrand/react-native-dynamic-fonts'
```

##### Manually

1. In the XCode's "Project navigator", right click on your project's Libraries folder ➜ `Add Files to <...>`
2. Go to `node_modules` ➜ `@brandingbrand` ➜ `react-native-dynamic-fonts` ➜ `ios` ➜ select `RCTDynamicFonts.xcodeproj`
3. Add `libRCTDynamicFonts.a` to `Build Phases -> Link Binary With Libraries`
4. Compile and have fun

#### Android

1. Add the following lines to `android/settings.gradle`:

    ```gradle
    include ':react-native-dynamic-fonts'
    project(':react-native-dynamic-fonts').projectDir = new File(rootProject.projectDir, '../node_modules/@brandingbrand/react-native-dynamic-fonts/android')
    ```

2. Add the compile line to the dependencies in `android/app/build.gradle`:

    ```gradle
    dependencies {
        compile project(':react-native-dynamic-fonts')
    }
    ```

3. Add the import and link the package in `MainApplication.kt`:

    `>=0.74 <0.82`

    ```kotlin
    import org.th317erd.react.DynamicFontsPackage // <-- add this import

    class MainApplication : Application(), ReactApplication {
        override val reactNativeHost: ReactNativeHost =
            object : DefaultReactNativeHost(this) {
              override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                  add(DynamicFontsPackage()) // <-- add this line
                }

              override fun getJSMainModuleName(): String = "index"

              override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

              override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
              override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
            }


    }
    ```

    `>= 0.82`

    ```kotlin
    import org.th317erd.react.DynamicFontsPackage // <-- add this import

    class MainApplication : Application(), ReactApplication {

        override val reactHost: ReactHost by lazy {
          getDefaultReactHost(
            context = applicationContext,
            packageList =
              PackageList(this).packages.apply {
                add(DynamicFontsPackage()) // <-- add this line
              },
          )
        }
    }
    ```

## Usage

> On iOS, it is not possible to specify the font name used for `fontFamily`. For this reason **BOTH** Android and iOS return the **ACTUAL** registered font name. For Android this is whatever name you provide. For iOS this will be the font's PostScript name.
>
> For this reason, it is recommended to always register the font as the PostScript name embedded in the font to avoid issues. If this is not an easy option, consider using the `useDynamicFont()` hook to avoid needing the resolved `fontFamily` name.

### Font Loading via Base64 Data

To load a font dynamically, you must first have a base64 encoded string or Data URI of your font file (TTF or OTF):

```javascript
import DynamicFonts, { loadFont } from '@brandingbrand/react-native-dynamic-fonts';

const base64FontString = 'data:font/ttf;base64,AAEAAAALAIAAAwAwR1NVQr...'; // truncated for brevity

...xw

/* Load a single font */
DynamicFonts.loadFont('nameOfFont', base64FontString, 'ttf').then((name) => {
 console.log('Loaded font successfully. Font name is: ', name);
});

...

/* Load a list of fonts */
DynamicFonts.loadFonts([{name: 'nameOfFont', data: base64FontString, type: 'ttf'}]).then((names) => {
 console.log('Loaded all fonts successfully. Font names are: ', names);
});

...

/* individual function imports are also available */
loadFont('nameOfFont', base64FontString, 'ttf')
```

### Font loading via file path

You can download font file to file system and then load it to app without sending the base64 directly.

```javascript
import {loadFontFromFile} from '@brandingbrand/react-native-dynamic-fonts';
import RNFetchBlob from 'rn-fetch-blob'

const fontFilePath = RNFetchBlob.fs.dirs.DocumentDir + "fonts/roboto.ttf";

loadFontFromFile("Roboto",  fontFilePath)
   .then((name) => {
        console.log('Loaded font successfully. Font name is: ', name);
   });

```

#### Use in StyleSheets

##### Static StyleSheet

Due to the limitations with font naming on iOS mentioned above, If you must reference the font statically in a stylesheet, it is recommended to always register the font as the PostScript name embedded in the font to avoid issues.

```javascript
import { StyleSheet, Text, View } from 'react-native';
import DynamicFonts from '@brandingbrand/react-native-dynamic-fonts';

const DYNAMIC_FONT_NAME = 'FontPostScriptName';
DynamicFonts.loadFont(DYNAMIC_FONT_NAME, base64FontString, 'ttf');

const styles = StyleSheet.create({
  dynamicFontText: {
    fontFamily: DYNAMIC_FONT_NAME,
    fontSize: 16,
  },
});
```

##### Dynamic StyleSheet

If you cannot register the font as the PostScript name, or unable to know the name ahead of time, you can create your stylesheet dynamically with help of the `useDynamicFont()` hook to get the resolved font name.

```javascript
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import DynamicFonts, { useDynamicFont } from '@brandingbrand/react-native-dynamic-fonts';

const DYNAMIC_FONT_NAME = 'nameOfFont';
DynamicFonts.loadFont(DYNAMIC_FONT_NAME, base64FontString, 'ttf');

export function useTextStyles() {
  const fontStyle = useDynamicFont(DYNAMIC_FONT_NAME);

  return useMemo({
    dynamicFontText: {
      ...fontStyle,
      fontSize: 16,
    },
  }, [fontStyle]);
}

```

#### Use in components

<sup>✨ New in `v1.0.0`!</sup>

A react hook is available to make using dynamically loaded fonts easier.

This font accepts the registered font name and returns a style object containing the final `fontFamily` that can be passed into your text component's style.

> **Important**: The font **MUST** be registered before the hook is mounted. You can ensure this by calling `DynamicFonts.loadFont()` before rendering your component, or during a parent component's mounting phase.
>
> Waiting for the returned promise to resolve is **not** necessary, as long as `DynamicFonts.loadFont()` is called before `useDynamicFont()`. Font registration is a synchronous operation which occurs before the font is available for use.

```javascript
import DynamicFonts, { useDynamicFont } from '@brandingbrand/react-native-dynamic-fonts';

const DYNAMIC_FONT_NAME = 'nameOfFont';
// The font **MUST** be loaded or loading before the hook is mounted.
DynamicFonts.loadFont(DYNAMIC_FONT_NAME, base64FontString, 'ttf');

function MyComponent() {
  const fontStyle = useDynamicFont(DYNAMIC_FONT_NAME);

  return <Text style={fontStyle}>This text uses the dynamic font!</Text>;
}
```

##### Without hooks

### Types

#### DynamicFontSource

An object containing the font registration information. This object is used in the `loadFonts()` method.

Property | Type  | Info
------ | ---- | ----
name | `string` | Specify registered font name
data | `string` | This can be a data URI or raw base64... if it is raw base64 type must be specified, but defaults to TTF (data URI mime: font/ttf or font/otf)
type | `'ttf' \| 'otf'` | (optional) Specify the type of font in the encoded data (ttf or otf). If omitted, the type will be inferred from the data URI mime type. Defaults to 'ttf' if inference fails.

#### The Response

The **ACTUAL** name the font was registered with. Use this for your fontFamily.
