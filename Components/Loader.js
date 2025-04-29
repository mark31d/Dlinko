import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ─── CONSTANTS ───────────────────────────────────────── */
const { width, height } = Dimensions.get('window');
const GRADIENT = ['#6E63FF', '#FF3CBD']; // violet → magenta
const TITLE_FONT = 48;

const LOGO_SRC   = require('../assets/Logo.png');   // крупный логотип
const LOADER_SRC = require('../assets/loader.png');  // круг‑стрелка 32×32
/* ─────────────────────────────────────────────────────── */

export default function Loader({ onEnd }) {
  /* ─── ROTATING LOADER ──────────────────────────────── */
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  /* ─── AUTO‑HIDE AFTER 1.8s ─────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => {
      if (onEnd) onEnd();
    }, 1800);
    return () => clearTimeout(t);
  }, [onEnd]);
  /* ───────────────────────────────────────────────────── */

  return (
    <LinearGradient colors={GRADIENT} style={styles.container}>
      {Platform.OS === 'android' && (
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      )}

      <SafeAreaView style={styles.safe}>
        {/* Текстовый логотип */}
        <Text style={styles.title}>Dlinko</Text>

        {/* Крутящаяся иконка */}
        <Animated.Image
          source={LOADER_SRC}
          style={[styles.loader, { transform: [{ rotate: spin }] }]}
        />

        {/* Увеличенный графический логотип */}
        <Image source={LOGO_SRC} style={styles.logo} resizeMode="contain" />
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ─── STYLES ──────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    marginTop: 60,
    fontSize: TITLE_FONT,
    fontWeight: '900',
    color: '#fff',
  },
  loader: {
    width: 32,
    height: 32,
    marginVertical: 32,
    tintColor: '#fff',
  },
  logo: {
    position: 'absolute',
    bottom: 0,
    width: width * 1.1,   // шире экрана для «увеличения»
    height: height * 0.75, // выше, чем раньше
  },
});
/* ─────────────────────────────────────────────────────── */
