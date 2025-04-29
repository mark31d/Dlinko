// Components/Settings.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/* ─── icons ─── */
const ICON_BACK  = require('../assets/arrowBack.png');
const ICON_WEB   = require('../assets/globus.png');
const ICON_PRIV  = require('../assets/privacy.png');
const ICON_TERMS = require('../assets/terms.png');
const ICON_BELL  = require('../assets/not.png');
const ICON_CHEV  = require('../assets/arrowR.png');

/* ─── constants ─── */
const GRADIENT_SCREEN = ['#6E63FF', '#FF3CBD'];           // фон всего экрана
const BELL_GRADIENT   = ['#FF1DEC', '#A544FF'];           // фон маленького квадрата с колокольчиком
const { width } = Dimensions.get('window');

/* ─── вспомогательная строка (белая) ─── */
const SettingRow = ({ icon, title, onPress }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        <Image source={icon.src} style={styles.icon} resizeMode="contain" />
      </View>
      <Text style={styles.rowTxt}>{title}</Text>
      <Image source={ICON_CHEV} style={styles.chevron} resizeMode="contain" />
    </View>
  </TouchableOpacity>
);

export default function Settings({ navigation }) {
  const insets = useSafeAreaInsets();
  const [notify, setNotify] = useState(false);

  const soonAlert = () =>
    Alert.alert('Coming soon', 'This info will be added soon.', [{ text: 'OK' }]);

  /* ─────────── UI ─────────── */
  return (
    <LinearGradient colors={GRADIENT_SCREEN} style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
        {/* Back */}
        <TouchableOpacity
          style={[styles.backRow, { paddingTop: insets.top }]}
          onPress={() => navigation.goBack()}
        >
          <Image source={ICON_BACK} style={styles.backIcon} resizeMode="contain" />
          <Text style={styles.backTxt}>Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Settings</Text>

        {/* White links card */}
        <View style={styles.card}>
          <SettingRow
            icon={{ src: ICON_WEB, bg: '#02EC50' }}
            title="Developer website"
            onPress={soonAlert}
          />
          <View style={styles.divider} />
          <SettingRow
            icon={{ src: ICON_PRIV, bg: '#01BBEE' }}
            title="Privacy Policy"
            onPress={soonAlert}
          />
          <View style={styles.divider} />
          <SettingRow
            icon={{ src: ICON_TERMS, bg: '#FF3448' }}
            title="Terms of use"
            onPress={soonAlert}
          />
        </View>

        {/* Notifications card (карточка остаётся белой, а квадрат иконки — градиент) */}
        <View style={styles.cardSmall}>
          {/* квадрат-иконка с градиентом #FF1DEC → #A544FF */}
          <LinearGradient colors={BELL_GRADIENT} style={styles.iconWrap}>
            <Image source={ICON_BELL} style={styles.icon} resizeMode="contain" />
          </LinearGradient>

          {/* подпись */}
          <Text style={[styles.rowTxt, { flex: 1 }]}>Notifications</Text>

          {/* Switch */}
          <Switch
            trackColor={{ false: '#ccc', true: '#FFA54B' }}
            thumbColor="#fff"
            value={notify}
            onValueChange={v => {
              setNotify(v);
              Alert.alert(
                'Coming soon',
                'Notification settings will be available soon.',
                [{ text: 'OK' }],
              );
            }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ─── styles ─── */
const P = 24;
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  /* back row */
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
marginTop:20,
    paddingHorizontal: P,
    marginBottom: -12,
  },
  backIcon: { width: 20, height: 20, tintColor: '#fff' ,},
  backTxt: { color: '#fff', fontSize: 16, marginLeft: 6 },

  /* title */
  title: { fontSize: 32, fontWeight: '900', color: '#fff', margin: P },

  /* white card with links */
  card: {
    marginHorizontal: P,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },

  /* small card for notifications */
  cardSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: P,
    marginTop: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    height: 70,
  },

  /* generic row inside white card */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 16,
  },
  divider: { height: 1, backgroundColor: '#E8E8E8', marginLeft: 70 },

  /* square for icon (gradient for bell painted via LinearGradient wrapper) */
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: { width: 26, height: 26, tintColor: '#fff' },

  /* text and chevron */
  rowTxt: { fontSize: 18, color: '#333' },
  chevron: { width: 18, height: 18, tintColor: '#999', marginLeft: 'auto' },
});
