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
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { MMKV } from 'react-native-mmkv';
const { width } = Dimensions.get('window');
const GRADIENT = ['#6E63FF', '#FF3CBD'];
const MARKS = [1, 2, 3, 4, 5];
const INITIAL_SUBJECTS = ['History', 'Maths', 'English language', 'Physical Education'];
const REASONS = ['Oral response', 'Writing task', 'Homework'];
const COLORS = ['#FF3448', '#01BBEE', '#02EC50', '#FD8200'];

export default function AddMarks({ navigation, route }) {
    const storage = new MMKV({ id: 'app_marks' });
    const STORAGE_KEY = 'marks';
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(1);

  const [selectedMark, setSelectedMark] = useState(null);
  const [subject, setSubject] = useState('');
  const [subjectsList, setSubjectsList] = useState(INITIAL_SUBJECTS);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState(null);
  const [date, setDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [color, setColor] = useState(null);
  const canNext = () => {
    if (step === 1) return !!selectedMark;
    if (step === 2) return !!selectedSubject;
    if (step === 3) return !!selectedReason && !!date && !!color;
    return false;
  };
  const addSubject = () => {
    const trimmed = subject.trim();
    if (trimmed && !subjectsList.includes(trimmed)) {
      setSubjectsList([...subjectsList, trimmed]);
      setSelectedSubject(trimmed);
    }
  };

  const onSave = () => {
    const markPayload = {
      id: route.params?.existingMark?.id ?? Date.now().toString(),
      mark: selectedMark,
      subject: selectedSubject,
      reason: selectedReason,
      date,
      color,
    };
    const [dd, mm, yy] = date.split('.');
    markPayload.dateISO = `20${yy}-${mm}-${dd}`;
  
    navigation.navigate('Tabs', {
      screen: 'MarksTab',
      params: {
        // если редактируем, передаём updatedMark, иначе — newMark
        ...(route.params?.existingMark
          ? { updatedMark: markPayload }
          : { newMark: markPayload }
        )
      }
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>What mark did you get?</Text>
            <View style={styles.grid}>
              {MARKS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.box, selectedMark === m && { backgroundColor: COLORS[3] }]}
                  onPress={() => setSelectedMark(m)}
                >
                  <Text style={[styles.boxText, selectedMark === m && { color: '#fff' }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case 2: {
        const filtered = subjectsList.filter(s => s.toLowerCase().includes(subject.trim().toLowerCase()));
        return (
          <>
            <Text style={styles.title}>In what subject?</Text>
            <TextInput
              style={styles.input}
              placeholder="Type or select"
              placeholderTextColor="#AAA"
              value={subject}
              onChangeText={t => { setSubject(t); setSelectedSubject(null); }}
            />
            <View style={styles.tagRow}>
              {filtered.map(s => {
                const sel = selectedSubject === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.tag, sel && { backgroundColor: COLORS[3], borderColor: COLORS[3] }]}
                    onPress={() => { setSelectedSubject(s); setSubject(s); }}
                  >
                    <Text style={[styles.tagText, sel && { color: '#fff' }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
              {subject.trim() && !subjectsList.includes(subject.trim()) && (
                <TouchableOpacity style={[styles.tag, { borderStyle: 'dashed' }]} onPress={addSubject}>
                  <Text style={styles.tagText}>+ Add "{subject.trim()}"</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      }

      case 3:
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>For what did you have a mark?</Text>
            <TextInput
              style={styles.input}
              placeholder="Type or select"
              placeholderTextColor="#AAA"
              value={reason}
              onChangeText={t => { setReason(t); setSelectedReason(null); }}
            />
            <View style={styles.tagRow}>
              {REASONS.map(r => {
                const sel = selectedReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.tag, sel && { backgroundColor: COLORS[3], borderColor: COLORS[3] }]}
                    onPress={() => { setSelectedReason(r); setReason(r); }}
                  >
                    <Text style={[styles.tagText, sel && { color: '#fff' }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.title}>When did this happen?</Text>
            <TouchableOpacity
  style={styles.input}
  onPress={() => setShowCalendar(v => !v)}
  activeOpacity={0.8}
>
  <Image
    source={require('../assets/calendar.png')}
    style={styles.calendarIcon}
  />
  <Text style={[styles.inputText, !date && { color: '#AAA' }]}>
    {date || 'DD.MM.YY'}
  </Text>
</TouchableOpacity>
            {showCalendar && (
              <Calendar
                style={styles.calendar}
                theme={{ calendarBackground: '#FFF' }}
                onDayPress={d => {
                  const [y, m, day] = d.dateString.split('-');
                  setDate(`${day}.${m}.${y.slice(2)}`);
                  setShowCalendar(false);
                }}
              />
            )}

            <Text style={styles.title}>Choose color</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { borderColor: c, backgroundColor: color === c ? c : '#fff' }]}
                  onPress={() => setColor(prev => (prev === c ? null : c))}
                />
              ))}
            </View>
          </ScrollView>
        );

      case 4:
        return (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 24 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Confirm and edit if needed:</Text>

            <Text style={styles.sectionLabel}>Mark</Text>
            <View style={styles.grid}>
              {MARKS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.box, selectedMark === m && { backgroundColor: COLORS[3] }]}
                  onPress={() => setSelectedMark(m)}
                >
                  <Text style={[styles.boxText, selectedMark === m && { color: '#fff' }]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Type or select"
              placeholderTextColor="#AAA"
              value={subject}
              onChangeText={t => setSubject(t)}
            />
            <View style={styles.tagRow}>
              {subjectsList.filter(s => s.toLowerCase().includes(subject.trim().toLowerCase())).map(s => {
                const sel = selectedSubject === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.tag, sel && { backgroundColor: COLORS[3], borderColor: COLORS[3] }]}
                    onPress={() => { setSelectedSubject(s); setSubject(s); }}
                  >
                    <Text style={[styles.tagText, sel && { color: '#fff' }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
              {subject.trim() && !subjectsList.includes(subject.trim()) && (
                <TouchableOpacity style={[styles.tag, { borderStyle: 'dashed' }]} onPress={addSubject}>
                  <Text style={styles.tagText}>+ Add "{subject.trim()}"</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.sectionLabel}>Reason</Text>
            <TextInput
              style={styles.input}
              placeholder="Type or select"
              placeholderTextColor="#AAA"
              value={reason}
              onChangeText={t => setReason(t)}
            />
            <View style={styles.tagRow}>
              {REASONS.map(r => {
                const sel = selectedReason === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.tag, sel && { backgroundColor: COLORS[3], borderColor: COLORS[3] }]}
                    onPress={() => setSelectedReason(r)}
                  >
                    <Text style={[styles.tagText, sel && { color: '#fff' }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>Date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowCalendar(v => !v)}
              activeOpacity={0.8}
            >
              <Image source={require('../assets/calendar.png')} style={styles.calendarIcon} />
              <Text style={[styles.inputText, !date && { color: '#AAA' }]}>{date || 'DD.MM.YY'}</Text>
            </TouchableOpacity>
            {showCalendar && (
              <Calendar
                style={styles.calendar}
                theme={{ calendarBackground: '#FFF' }}
                onDayPress={d => {
                  const [y, m, day] = d.dateString.split('-');
                  setDate(`${day}.${m}.${y.slice(2)}`);
                  setShowCalendar(false);
                }}
              />
            )}

            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorDot, { borderColor: c, backgroundColor: color === c ? c : '#fff' }]}
                  onPress={() => setColor(prev => (prev === c ? null : c))}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, { marginTop: 32 }]} onPress={onSave}
              disabled={!selectedMark || !selectedSubject || !selectedReason || !date || !color}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.root}>
        <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.safe, { paddingTop: insets.top }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => { if (step > 1) setStep(step - 1); else navigation.goBack(); }}
          >
            <Image source={require('../assets/arrowBack.png')} style={styles.backIcon} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.content}>{renderStep()}</View>

          {step < 4 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, !canNext() && { opacity: 0.5 }]}
                disabled={!canNext()}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.buttonText}>{step < 3 ? 'Next step' : 'Finish review'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12 },
  backIcon: { width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain' },
  backText: { color: '#fff', fontSize: 16, marginLeft: 8 },

  content: { flex: 1, paddingHorizontal: 24 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 16 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  box: { width: (width - 48 - 16) / 3, aspectRatio: 1, backgroundColor: '#F0F0F5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  boxText: { fontSize: 24, fontWeight: '700', color: '#666' },

  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F0F5', borderRadius: 30, paddingHorizontal: 20, height: 50, marginTop: 12 },
  inputText: { flex: 1, fontSize: 16, color: '#333' },
  calendarIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#FF8200' },
  calendar: { marginTop: 8, alignSelf: 'center', width: width - 48, borderRadius: 8 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: { backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 12, marginBottom: 12 },
  tagText: { fontSize: 14, color: '#333' },

  sectionLabel: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24 },

  colorRow: { flexDirection: 'row', marginTop: 16 },
  colorDot: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, marginRight: 12 },

  footer: { padding: 24 },
  button: { height: 50, borderRadius: 25, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#6E63FF' },
}); 