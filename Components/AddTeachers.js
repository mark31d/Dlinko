// Components/AddTeachers.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';

/* ─── assets ─── */
const IconPlus = require('../assets/plus.png');
const Av1      = require('../assets/bunny1.png');
const Av2      = require('../assets/bunny2.png');
const Av3      = require('../assets/bunny3.png');

/* ─── constants ─── */
const { width } = Dimensions.get('window');
const GRADIENT = ['#6E63FF', '#FF3CBD'];
const COLORS   = ['#FF3448', '#01BBEE', '#FD8200', '#02EC50'];
const SUBJECTS = ['History', 'Maths', 'English language', 'Physical Education'];

const avatars = [
  { src: Av1, color: '#FF3448' },
  { src: Av2, color: '#01BBEE' },
  { src: Av3, color: '#8CD6FD' },
];

export default function AddTeachers({ navigation, route }) {
  const insets   = useSafeAreaInsets();
  const existing = route.params?.existingTeacher ?? null;

  /* текущий шаг мастера */
  const [step, setStep] = useState(existing ? 4 : 1);

  /* ────────── STEP-1 (фото / аватар) ────────── */
  const [photoUri, setPhotoUri] = useState(existing?.photo?.uri ?? null);
  const [avatar,   setAvatar  ] = useState(existing?.avatar ?? null);
  const pickPhoto = () =>
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.length) {
        setPhotoUri(res.assets[0].uri);
        setAvatar(null);
      }
    });

  /* ────────── STEP-2 (имя) ────────── */
  const [name, setName] = useState(existing?.name ?? '');

  /* ────────── STEP-3 (предмет + цвет) ────────── */
  const [subjectList] = useState(
    existing && !SUBJECTS.includes(existing?.subject)
      ? [...SUBJECTS, existing.subject]
      : SUBJECTS,
  );
  const [subject, setSubject] = useState(existing?.subject ?? '');
  const [color,   setColor  ] = useState(existing?.color ?? null);

  /* ─── helper для Next-кнопки ─── */
  const canNext = () => {
    if (step === 1) return !!(photoUri || avatar);
    if (step === 2) return !!name.trim();
    if (step === 3) return !!subject.trim() && !!color;
    return true;
  };

  /* ─── сохранить ─── */
  const saveTeacher = () => {
    const payload = {
      id     : existing?.id ?? Date.now().toString(),
      name   : name.trim(),
      subject: subject.trim(),
      color,
      avatar,
      photo  : photoUri ? { uri: photoUri } : null,
    };
    navigation.navigate('Tabs', {
      screen: 'TeachersTab',
      params: existing ? { updatedTeacher: payload } : { newTeacher: payload },
    });
  };

  /* ────────── рендер шагов ────────── */
  const renderStep = () => {
    /* ---------- STEP-1 ---------- */
    if (step === 1) {
      return (
        <>
          <Text style={styles.title}>Add photo or choose a character</Text>
          <View style={styles.row}>
            {/* кнопка + / выбранное фото */}
            <TouchableOpacity style={styles.avatarWrap} onPress={pickPhoto}>
              {photoUri || avatar ? (
                <Image
                  source={photoUri ? { uri: photoUri } : avatar}
                  style={styles.avatarImg}
                />
              ) : (
                <>
                  <LinearGradient
                    colors={['#FF3CBD', '#6E63FF']}
                    style={[StyleSheet.absoluteFill, { borderRadius: 50 }]}
                  />
                  <Image source={IconPlus} style={styles.plusIcon} />
                </>
              )}
            </TouchableOpacity>

            {/* готовые аватары-кролики */}
            {avatars.map(({ src, color }, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.avatarWrap,
                  { backgroundColor: color },
                  avatar === src && styles.avatarSelected,
                ]}
                onPress={() => {
                  setAvatar(src);
                  setPhotoUri(null);
                }}
              >
                <Image source={src} style={styles.avatarImg} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }

    /* ---------- STEP-2 ---------- */
    if (step === 2) {
      return (
        <>
          <Text style={styles.title}>Teacher's name and surname</Text>
          <TextInput
            style={styles.input}
            placeholder="Ivan Ivanov"
            placeholderTextColor="#AAA"
            value={name}
            onChangeText={setName}
          />
        </>
      );
    }

    /* ---------- STEP-3 ---------- */
    if (step === 3) {
      return (
        <>
          <Text style={styles.title}>What is the subject?</Text>
          <TextInput
            style={styles.input}
            placeholder="Subject name"
            placeholderTextColor="#AAA"
            value={subject}
            onChangeText={setSubject}
          />

          {/* теги-подсказки */}
          <View style={styles.tagRow}>
            {subjectList
              .filter(s => s.toLowerCase().includes(subject.trim().toLowerCase()))
              .map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.tag, subject === s && styles.tagSelected]}
                  onPress={() => setSubject(s)}
                >
                  <Text style={subject === s ? styles.tagSelTxt : styles.tagTxt}>{s}</Text>
                </TouchableOpacity>
              ))}
          </View>

          {/* выбор цвета */}
          <Text style={styles.subTitle}>Choose color</Text>
          <View style={styles.colorRow}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { borderColor: c, backgroundColor: color === c ? c : '#fff' },
                ]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
        </>
      );
    }

    /* ---------- STEP-4 (review & inline edit) ---------- */
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* фото / аватар */}
        <Text style={styles.title}>Photo / character</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={pickPhoto}>
            <Image
              source={photoUri ? { uri: photoUri } : avatar || Av1}
              style={styles.avatarImgLg}
            />
          </TouchableOpacity>
        </View>

        {/* имя (editable) */}
        <Text style={styles.title}>Teacher's name and surname</Text>
        <TextInput
          style={styles.input}
          placeholder="Ivan Ivanov"
          placeholderTextColor="#AAA"
          value={name}
          onChangeText={setName}
        />

        {/* предмет (editable) */}
        <Text style={styles.title}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Subject name"
          placeholderTextColor="#AAA"
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.subTitle}>Choose color</Text>
        <View style={styles.colorRow}>
          {COLORS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorDot,
                { borderColor: c, backgroundColor: color === c ? c : '#fff' },
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* сохранить */}
        <TouchableOpacity
          style={[
            styles.savePlain,
            !(photoUri || avatar) || !name.trim() || !subject.trim() || !color
              ? { opacity: 0.4 }
              : null,
          ]}
          disabled={
            !(photoUri || avatar) || !name.trim() || !subject.trim() || !color
          }
          onPress={saveTeacher}
        >
          <Text style={styles.saveTxtPurple}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  /* ────────── UI оболочка ────────── */
  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={GRADIENT} style={styles.root}>
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safe, { paddingTop: insets.top }]}>
          {/* back / step control */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
          >
            <Text style={styles.backTxt}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>{renderStep()}</View>

          {step < 4 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextBtn, !canNext() && { opacity: 0.4 }]}
                disabled={!canNext()}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.nextTxt}>{step === 3 ? 'Review' : 'Next step'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

/* ────────── styles ────────── */
const P = 24;
const R = 30;
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  backBtn: { paddingHorizontal: P, paddingVertical: 8 },
  backTxt: { color: '#fff', fontSize: 16 },

  content: { flex: 1, paddingHorizontal: P },

  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 16 },
  subTitle: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 24 },

  row: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },

  avatarWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarSelected: { borderWidth: 3, borderColor: '#fff' },

  plusIcon: { width: 32, height: 32, tintColor: '#fff' },

  avatarImg: { width: 74, height: 74, borderRadius: 37 },
  avatarImgLg: { width: 120, height: 120, borderRadius: 60, marginVertical: 16 },

  input: {
    backgroundColor: '#F0F0F5',
    borderRadius: R,
    height: 50,
    paddingHorizontal: 20,
    color: '#333',
    marginTop: 12,
  },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 12,
    marginBottom: 12,
  },
  tagSelected: { backgroundColor: '#6E63FF' },
  tagTxt: { color: '#333' },
  tagSelTxt: { color: '#fff' },

  colorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  colorDot: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, marginRight: 12 },

  footer: { padding: P },
  nextBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextTxt: { fontSize: 16, fontWeight: '600', color: '#6E63FF' },

  /* белая кнопка Save */
  savePlain: {
    marginTop: 32,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTxtPurple: { color: '#6E63FF', fontSize: 16, fontWeight: '600' },
});
