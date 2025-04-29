// Components/Marks.js
import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
  } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Image,
    Animated,
  } from 'react-native';
  import LinearGradient from 'react-native-linear-gradient';
  import { Calendar } from 'react-native-calendars';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useFocusEffect } from '@react-navigation/native';
  import { MMKV } from 'react-native-mmkv';
  
  /* ─── assets ─── */
  const ICON_CHEVRON = require('../assets/arrowDown.png');
  const ICON_GEAR    = require('../assets/gear.png');
  const ICON_MORE    = require('../assets/dots.png');
  const BUNNY_SRC    = require('../assets/studybunny.png');
  
  /* ─── constants ─── */
  const { width, height } = Dimensions.get('window');
  const GRADIENT      = ['#A544FF', '#FF1DEC'];
  const FILTER_COLORS = ['#FF3448', '#01BBEE', '#FD8200', '#02EC50'];
  const STORAGE_KEY   = 'marks';
  const storage       = new MMKV({ id: 'app_marks' });
  
  /* ─── helpers ─── */
  const toHeader = iso => {
    const [y, m, d] = iso.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  
  /* ───────────────────────────────────────────── */
  export default function Marks({ navigation, route }) {
    const [allMarks, setAllMarks] = useState([]);
    const [selected, setSelected] = useState(new Date().toISOString().slice(0, 10));
    const [color, setColor]       = useState(null);
    const [showCal, setShowCal]   = useState(false);
  
    /* ─── load / save ─── */
    const loadMarks = useCallback(() => {
      const json = storage.getString(STORAGE_KEY);
      setAllMarks(json ? JSON.parse(json) : []);
    }, []);
    useEffect(loadMarks, [loadMarks]);
    useFocusEffect(loadMarks);
  
    useEffect(() => {
      storage.set(STORAGE_KEY, JSON.stringify(allMarks));
    }, [allMarks]);
  
    /* ─── accept params ─── */
    useEffect(() => {
      const { newMark, updatedMark } = route.params || {};
      if (newMark?.id) {
        setAllMarks(prev => [...prev, newMark]);
        setSelected(newMark.dateISO);
        navigation.setParams({ newMark: undefined });
      }
      if (updatedMark?.id) {
        setAllMarks(prev => prev.map(m => (m.id === updatedMark.id ? updatedMark : m)));
        setSelected(updatedMark.dateISO);
        navigation.setParams({ updatedMark: undefined });
      }
    }, [route.params, navigation]);
  
    /* ─── filter today’s marks ─── */
    const dayMarks = useMemo(() => {
      const byDate = allMarks.filter(m => m.dateISO === selected);
      return color ? byDate.filter(m => m.color === color) : byDate;
    }, [allMarks, selected, color]);
  
    /* ─── calendar arrow anim ─── */
    const rot = useRef(new Animated.Value(0)).current;
    const toggleCal = () => {
      Animated.timing(rot, {
        toValue: showCal ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      setShowCal(v => !v);
    };
    const arrowDeg = rot.interpolate({
      inputRange: [0, 1],
      outputRange: ['90deg', '-90deg'],
    });
  
    /* ─── header / filters / calendar (for ListHeaderComponent) ─── */
    const Header = () => (
      <>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.dateRow} onPress={toggleCal}>
            <Text style={styles.headerDate}>{toHeader(selected)}</Text>
            <Animated.Image
              source={ICON_CHEVRON}
              style={[styles.chevron, { transform: [{ rotate: arrowDeg }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image source={ICON_GEAR} style={styles.gearIcon} />
          </TouchableOpacity>
        </View>
  
        {/* CALENDAR */}
        {showCal && (
          <Calendar
            style={styles.calendar}
            theme={{ calendarBackground: '#FFF' }}
            onDayPress={d => {
              setSelected(d.dateString);
              toggleCal();
            }}
            markedDates={{
              [selected]: {
                selected: true,
                selectedColor: FILTER_COLORS[0],
                selectedTextColor: '#fff',
              },
            }}
          />
        )}
  
        {/* FILTER ROW */}
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Marks</Text>
          <View style={styles.filterRow}>
            {FILTER_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.dot,
                  {
                    borderColor: c,
                    backgroundColor: color === c ? c : '#fff',
                    opacity: color && color !== c ? 0.25 : 1,
                  },
                ]}
                onPress={() => setColor(prev => (prev === c ? null : c))}
              />
            ))}
          </View>
        </View>
      </>
    );
  
    /* ─────────── render ─────────── */
    return (
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.safe}>
          <FlatList
            data={dayMarks}
            keyExtractor={item => item.id}
            ListHeaderComponent={Header}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Image source={BUNNY_SRC} style={styles.bunny} resizeMode="contain" />
                <Text style={styles.emptyText}>There aren’t any{'\n'}marks yet</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: item.color }]}>
                <View>
                  <Text style={styles.subject}>{item.subject}</Text>
                  <Text style={styles.reason}>{item.reason}</Text>
                </View>
                <View style={styles.rightRow}>
                  <Text style={styles.value}>{item.mark}</Text>
                  <TouchableOpacity
                    style={styles.moreBtn}
                    onPress={() => navigation.navigate('AddMarks', { existingMark: item })}
                  >
                    <Image source={ICON_MORE} style={styles.moreIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }
  
  /* ─── styles ─── */
  const P = 24;
  const styles = StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
  
    /* общий паддинг вместо ScrollView */
    listContent: { paddingHorizontal: P, paddingTop: 20, paddingBottom: 120 },
  
    /* header */
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    dateRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    headerDate: { fontSize: 34, fontWeight: '900', color: '#fff' },
    chevron: { width: 20, height: 20, marginLeft: 4, tintColor: '#fff', resizeMode: 'contain' },
    gearBtn: {
      position: 'absolute',
      top: 0,
      right: P - 29,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    gearIcon: { width: 22, height: 22, tintColor: FILTER_COLORS[2] },
  
    calendar: {
      marginTop: 18,
      alignSelf: 'center',
      width: width - P * 2,
      borderRadius: 20,
      backgroundColor: '#fff',
      padding: 12,
    },
  
    filterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 26,
      marginBottom: 20,
    },
    sectionTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
    filterRow: { flexDirection: 'row' },
    dot: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, marginLeft: 12 },
  
    /* empty */
    emptyWrap: { alignItems: 'center', marginTop: 40 },
    bunny: { width: width * 0.75, height: height * 0.5, marginTop: -70 },
    emptyText: {
      textAlign: 'center',
      fontSize: 20,
      color: '#fff',
      marginTop: -10,
      lineHeight: 26,
    },
  
    /* card */
    card: {
      borderRadius: 45,
      paddingVertical: 18,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    subject: { color: '#fff', fontSize: 18, fontWeight: '700' },
    reason: { color: '#fff', fontSize: 12, opacity: 0.85, marginTop: 3 },
  
    rightRow: { flexDirection: 'row', alignItems: 'center' },
    value: { color: '#fff', fontSize: 24, fontWeight: '900' },
    moreBtn: { marginLeft: 12, padding: 8 },
    moreIcon: { width: 20, height: 20, tintColor: '#fff' },
  });
  