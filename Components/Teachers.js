// Components/Teachers.js
import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
  } from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Image,
  } from 'react-native';
  import LinearGradient from 'react-native-linear-gradient';
  import { SafeAreaView } from 'react-native-safe-area-context';
  import { useFocusEffect } from '@react-navigation/native';
  import { MMKV } from 'react-native-mmkv';
  
  /* ─── assets ─── */
  const ICON_GEAR  = require('../assets/gear.png');
  const ICON_MORE  = require('../assets/dots.png');
  const BUNNY_SRC  = require('../assets/studybunny.png');
  const PLACEHOLDER = require('../assets/default.png');
  
  /* ─── constants ─── */
  const { width, height } = Dimensions.get('window');
  const BACK_GRADIENT = ['#A544FF', '#FF1DEC'];
  const FILTER_COLORS = ['#FF3448', '#01BBEE', '#FD8200', '#02EC50'];
  const STORAGE_KEY   = 'teachers';
  const storage       = new MMKV({ id: 'app_teachers' });
  
  /* ───────────────────────────────────────────── */
  export default function Teachers({ navigation, route }) {
    const [allTeachers, setAllTeachers] = useState([]);
    const [color, setColor]             = useState(null);
  
    /* load/save */
    const load = useCallback(() => {
      const json = storage.getString(STORAGE_KEY);
      setAllTeachers(json ? JSON.parse(json) : []);
    }, []);
    useEffect(load, [load]);
    useFocusEffect(load);
  
    useEffect(() => {
      storage.set(STORAGE_KEY, JSON.stringify(allTeachers));
    }, [allTeachers]);
  
    /* accept params from AddTeachers */
    useEffect(() => {
      const { newTeacher, updatedTeacher } = route.params || {};
  
      if (newTeacher?.id) {
        setAllTeachers(prev => [...prev, newTeacher]);
        navigation.setParams({ newTeacher: undefined });
      }
  
      if (updatedTeacher?.id) {
        setAllTeachers(prev => prev.map(t => (t.id === updatedTeacher.id ? updatedTeacher : t)));
        navigation.setParams({ updatedTeacher: undefined });
      }
    }, [route.params, navigation]);
  
    /* filtering */
    const data = useMemo(
      () => (color ? allTeachers.filter(t => t.color === color) : allTeachers),
      [allTeachers, color],
    );
  
    /* header */
    const ListHeader = () => (
      <>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Teachers</Text>
          <TouchableOpacity
            style={styles.gearBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Image source={ICON_GEAR} style={styles.gearIcon} />
          </TouchableOpacity>
        </View>
  
        <View style={styles.filterRow}>
          {FILTER_COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.filterCircle,
                { borderColor: c, backgroundColor: color === c ? c : '#fff' },
              ]}
              onPress={() => setColor(prev => (prev === c ? null : c))}
            />
          ))}
        </View>
  
        {data.length === 0 && (
          <View style={styles.emptyWrap}>
            <Image source={BUNNY_SRC} style={styles.bunny} resizeMode="contain" />
            <Text style={styles.emptyTxt}>No teachers yet</Text>
          </View>
        )}
      </>
    );
  
    /* ───────── render ───────── */
    return (
      <LinearGradient colors={BACK_GRADIENT} style={styles.root}>
        <SafeAreaView edges={['top']} style={styles.safe}>
          <FlatList
            data={data}
            keyExtractor={item => item.id}
            ListHeaderComponent={ListHeader}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.card, { backgroundColor: item.color }]}>
                <Image
                  source={item.photo ?? item.avatar ?? PLACEHOLDER}
                  style={styles.avatar}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.subject}>{item.subject}</Text>
                </View>
  
                {/* 3-точия → открываем AddTeachers на шаге 4 */}
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={() =>
                    navigation
                      .getParent()             // к корневому стеку
                      .navigate('AddTeachers', { existingTeacher: item })
                  }
                >
                  <Image source={ICON_MORE} style={styles.moreIcon} />
                </TouchableOpacity>
              </View>
            )}
          />
        </SafeAreaView>
      </LinearGradient>
    );
  }
  
  /* ───────── styles ───────── */
  const P = 24;
  const styles = StyleSheet.create({
    root: { flex: 1 },
    safe: { flex: 1 },
    listContent: { paddingHorizontal: P, paddingBottom: 120, paddingTop: 20 },
  
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    headerTitle: { fontSize: 34, fontWeight: '900', color: '#fff' },
    gearBtn: {
      marginLeft: 'auto',
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    gearIcon: { width: 22, height: 22, tintColor: FILTER_COLORS[2] },
  
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    filterCircle: {
      flex: 1,
      height: 48,
      marginHorizontal: 4,
      borderRadius: 24,
      borderWidth: 3,
    },
  
    emptyWrap: { alignItems: 'center', marginTop: 40 },
    bunny: { width: width * 0.75, height: height * 0.45 },
    emptyTxt: { fontSize: 20, color: '#fff', opacity: 0.8, marginTop: 12 },
  
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 28,
      padding: 20,
      marginBottom: 20,
    },
    avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 20 },
    cardContent: { flex: 1 },
    name: { color: '#fff', fontSize: 20, fontWeight: '700' },
    subject: { color: '#fff', fontSize: 14, marginTop: 4 },
  
    moreBtn: { padding: 8 },
    moreIcon: { width: 24, height: 24, tintColor: '#fff' },
  });
  