// Components/Homework.js
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
    ScrollView,
  } from 'react-native';
  import LinearGradient from 'react-native-linear-gradient';
  import { Calendar } from 'react-native-calendars';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useFocusEffect } from '@react-navigation/native';
  import { MMKV } from 'react-native-mmkv';
  
  /* ─── assets ─── */
  const ICON_CHEVRON  = require('../assets/arrowDown.png');
  const ICON_GEAR     = require('../assets/gear.png');
  const ICON_MORE     = require('../assets/dots.png');
  const ICON_BACK     = require('../assets/arrowBack.png');
  const BUNNY_SRC     = require('../assets/studybunny.png');
  const DEFAULT_PHOTO = require('../assets/default.png');
  
  /* ─── constants ─── */
  const { width, height } = Dimensions.get('window');
  const GRADIENT      = ['#A544FF', '#FF1DEC'];
  const FILTER_COLORS = ['#FF3448', '#01BBEE', '#FD8200', '#02EC50'];
  const STORAGE_KEY   = 'homework';
  const storage       = new MMKV({ id: 'app_homework' });
  
  /* ─── helpers ─── */
  const toHeader = iso => {
    const [y, m, d] = iso.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  const to12h = hhmm => {
    if (!hhmm) return '12:00 PM';
    const [h, m] = hhmm.split(':').map(Number);
    const ampm   = h >= 12 ? 'PM' : 'AM';
    const h12    = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  const formatDue = (iso, time = '') => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y} ${to12h(time)}`;
  };
  
  /* ─── gradient chip (used only in detail overlay) ─── */
  const DueBox = ({ children, done }) =>
    done ? (
      <Text style={[styles.due, styles.textDone]}>{children}</Text>
    ) : (
      <LinearGradient
        colors={['#A544FF', '#8CD6FD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.dueBox}
      >
        <Text style={styles.due}>{children}</Text>
      </LinearGradient>
    );
  
  /* ───────────────────────────────────────────── */
  export default function Homework({ navigation, route }) {
    /* state */
    const [allTasks, setAllTasks] = useState([]);
    const [selected, setSelected] = useState(new Date().toISOString().slice(0, 10));
    const [color, setColor]       = useState(null);
    const [showCal, setShowCal]   = useState(false);
  
    /* detail overlay */
    const [detailVisible, setDetailVisible] = useState(false);
    const [current, setCurrent]             = useState(null);
    const [localDone, setLocalDone]         = useState([]);
  
    /* load / save */
    const load = useCallback(() => {
      const json = storage.getString(STORAGE_KEY);
      const arr  = json ? JSON.parse(json) : [];
      setAllTasks(arr.map(t => ({ ...t, completed: t.completed ?? false })));
    }, []);
    useEffect(load, [load]);
    useFocusEffect(load);
  
    useEffect(() => {
      storage.set(STORAGE_KEY, JSON.stringify(allTasks));
    }, [allTasks]);
  
    /* accept params */
    useEffect(() => {
      const { newHomework, updatedHomework } = route.params || {};
      if (newHomework?.id) {
        const hw = { ...newHomework, completed: false };
        setAllTasks(prev => [...prev, hw]);
        setSelected(hw.dateISO);
        navigation.setParams({ newHomework: undefined });
      }
      if (updatedHomework?.id) {
        setAllTasks(prev =>
          prev.map(t => (t.id === updatedHomework.id ? { ...updatedHomework, completed: t.completed ?? false } : t)),
        );
        setSelected(updatedHomework.dateISO);
        navigation.setParams({ updatedHomework: undefined });
      }
    }, [route.params, navigation]);
  
    /* calendar arrow */
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
  
    /* filtering */
    const dayTasks = useMemo(() => {
      const byDate = allTasks.filter(t => t.dateISO === selected);
      return color ? byDate.filter(t => t.color === color) : byDate;
    }, [allTasks, selected, color]);
  
    /* toggle complete */
    const handleToggle = id =>
      setAllTasks(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  
    /* open detail */
    const openDetail = hw => {
      setCurrent(hw);
      setLocalDone(hw.tasks.map(() => false));
      setDetailVisible(true);
    };
  
    /* ─── header + filters ─── */
    const Header = () => (
      <>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.dateRow} onPress={toggleCal}>
            <Text style={styles.headerDate}>{toHeader(selected)}</Text>
            <Animated.Image
              source={ICON_CHEVRON}
              style={[styles.chevron, { transform: [{ rotate: arrowDeg }] }]}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.gearBtn} onPress={() => navigation.navigate('Settings')}>
            <Image source={ICON_GEAR} style={styles.gearIcon} />
          </TouchableOpacity>
        </View>
  
        {showCal && (
          <Calendar
            style={styles.calendar}
            theme={{ calendarBackground: '#FFF' }}
            onDayPress={d => {
              setSelected(d.dateString);
              toggleCal();
            }}
            markedDates={{
              [selected]: { selected: true, selectedColor: FILTER_COLORS[0], selectedTextColor: '#fff' },
            }}
          />
        )}
  
        <View style={styles.filterContainer}>
          <Text style={styles.sectionTitle}>Homework</Text>
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
  
    /* ─── render ─── */
    return (
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.safe}>
          <FlatList
            data={dayTasks}
            keyExtractor={item => item.id}
            ListHeaderComponent={Header}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Image source={BUNNY_SRC} style={styles.bunny} resizeMode="contain" />
                <Text style={styles.emptyText}>No homework for this date</Text>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const done = item.completed;
              return (
                <View style={[styles.card, { backgroundColor: item.color }]}>
                  <Image source={item.photo || DEFAULT_PHOTO} style={styles.homeworkImg} />
                  <View style={styles.cardContent}>
                    <Text style={[styles.subject, done && styles.subjectDone]}>{item.subject}</Text>
                    <Text style={[styles.reason, done && styles.textDone]}>{item.reason}</Text>
                    {item.tasks?.length > 1 && (
                      <Text style={[styles.other, done && styles.textDone]}>
                        +{item.tasks.length - 1} other tasks
                      </Text>
                    )}
                    <Text style={[styles.due, done && styles.textDone]}>
                      {`Until ${formatDue(item.dateISO, item.deadlineTime)}`}
                    </Text>
                  </View>
  
                  <View style={styles.rightRow}>
                    <TouchableOpacity
                      style={[styles.circle, done && styles.circleDone]}
                      onPress={() => handleToggle(item.id)}
                    />
                    <TouchableOpacity style={styles.moreBtn} onPress={() => openDetail(item)}>
                      <Image source={ICON_MORE} style={styles.moreIcon} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        </SafeAreaView>
  
        {/* DETAIL OVERLAY (оставляем ScrollView внутри модалки) */}
        {detailVisible && current && (
          <View style={styles.detailWrap}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.detailRoot}>
              <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.detailScroll} showsVerticalScrollIndicator={false}>
                  {/* HEADER */}
                  <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={() => setDetailVisible(false)} style={styles.backRow}>
                      <Image source={ICON_BACK} style={styles.backIcon} />
                      <Text style={styles.back}>Back</Text>
                    </TouchableOpacity>
  
                    <Text style={styles.detailTitle}>{current.subject}</Text>
  
                    <TouchableOpacity onPress={() => setLocalDone(arr => arr.map(() => !arr.every(Boolean)))}>
                      <View style={[styles.circle, localDone.every(Boolean) && styles.circleDone]} />
                    </TouchableOpacity>
  
                    <TouchableOpacity
                      onPress={() => {
                        setDetailVisible(false);
                        navigation.getParent().navigate('AddHomeWork', { existingHomework: current });
                      }}
                    >
                      <Text style={styles.edit}>Edit</Text>
                    </TouchableOpacity>
                  </View>
  
                  {/* PHOTO */}
                  <Image source={current.photo || DEFAULT_PHOTO} style={styles.detailImg} resizeMode="contain" />
  
                  {/* TASKS */}
                  {current.tasks.map((t, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.taskRowDetail}
                      onPress={() => setLocalDone(arr => arr.map((v, idx) => (idx === i ? !v : v)))}
                    >
                      <View style={[styles.circle, localDone[i] && styles.circleDone, { marginRight: 12 }]} />
                      <Text style={[styles.taskTextDetail, localDone[i] && styles.textDone]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
  
                  {/* DUE CHIP */}
                  <View style={styles.chip}>
                    <DueBox>{`Until ${formatDue(current.dateISO, current.deadlineTime)}`}</DueBox>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>
    );
  }
  
  /* ────────────── Styles ────────────── */
  const P = 24;
  const styles = StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
  
    /* вместо scroll */
    listContent: { paddingHorizontal: P, paddingTop: 20, paddingBottom: 120 },
  
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
  
    emptyWrap: { alignItems: 'center', marginTop: 40 },
    bunny: { width: width * 0.75, height: height * 0.5, marginTop: -70 },
    emptyText: { fontSize: 20, color: '#fff', opacity: 0.8, marginTop: 12 },
  
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 22,
      padding: 16,
      marginBottom: 14,
    },
    homeworkImg: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    cardContent: { flex: 1 },
    subject: { color: '#fff', fontSize: 18, fontWeight: '700' },
    reason: { color: '#fff', fontSize: 12, opacity: 0.85, marginTop: 3 },
    other: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 3 },
    dueBox: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    due: { color: '#fff', fontSize: 12, marginTop: 3 },
  
    rightRow: { flexDirection: 'row', alignItems: 'center' },
    circle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#fff',
      marginRight: 12,
    },
    circleDone: { backgroundColor: '#fff', borderColor: '#fff' },
    moreBtn: { padding: 8 },
    moreIcon: { width: 20, height: 20, tintColor: '#fff' },
  
    textDone: { textDecorationLine: 'line-through', opacity: 0.6 },
    subjectDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  
    /* detail overlay */
    detailWrap: { ...StyleSheet.absoluteFillObject },
    detailRoot: { flex: 1 },
    detailScroll: { padding: P, paddingBottom: 40 },
  
    detailHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 20 },
    backRow: { flexDirection: 'row', alignItems: 'center' },
    backIcon: { width: 24, height: 24, tintColor: '#fff', marginRight: 6, resizeMode: 'contain' },
    back: { color: '#fff', fontSize: 16 },
    detailTitle: { flex: 1, color: '#fff', fontSize: 24, fontWeight: '700', marginLeft: 12 },
    edit: { color: '#fff', fontSize: 16, marginLeft: 12 },
  
    detailImg: {
      width: '100%',
      height: 180,
      borderRadius: 16,
      marginBottom: 24,
      backgroundColor: '#eee',
    },
  
    taskRowDetail: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    taskTextDetail: { flex: 1, color: '#fff', fontSize: 16 },
  
    chip: { alignSelf: 'center', marginTop: 24 },
  });
  