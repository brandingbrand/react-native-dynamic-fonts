import DynamicFonts, {
  useDynamicFont,
} from '@brandingbrand/react-native-dynamic-fonts';
import {Platform, StyleSheet, Text, View} from 'react-native';
import {montserratFont} from './font';

DynamicFonts.loadFonts(montserratFont).catch(err => {
  console.error('Failed to load font:', err);
});

export default function App() {
  const fontStyle = useDynamicFont(montserratFont.name);
  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.text, fontStyle]}>
          {`This text should be in\nthe '${montserratFont.name}' font!`}
        </Text>
      </View>
      <View>
        <Text style={styles.text}>
          {`This text should be in\nthe '${platformMonoFont}' font.`}
        </Text>
      </View>
      <View style={styles.description}>
        <Text style={styles.textSmall}>
          {`If the first block of text is in ${montserratFont.name}, instead of '${platformMonoFont}' like the second block, the dynamic font loading worked!`}
        </Text>
      </View>
    </View>
  );
}

const platformMonoFont = Platform.select({
  ios: 'Menlo',
  default: 'monospace',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 64,
  },
  description: {
    paddingTop: 32,
  },
  text: {
    fontSize: 16,
    fontFamily: platformMonoFont,
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 12,
    textAlign: 'center',
  },
});
