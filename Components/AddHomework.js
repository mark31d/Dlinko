// Components/AddHomeWork.js
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
import { launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';
const isValidTime = str => /^([01]\d|2[0-3]):([0-5]\d)$/.test(str);

const TIME_HINT = 'Enter time as HH:mm, e.g. 09:30';
const { width } = Dimensions.get('window');
const SUBJECT_HIGHLIGHT = '#FD8200';
const GRADIENT         = ['#6E63FF', '#FF3CBD'];
const INITIAL_SUBJECTS = ['History', 'Maths', 'English language', 'Physical Education'];
const COLORS           = ['#FF3448', '#01BBEE', '#02EC50', '#FD8200'];

const IconCalendar = require('../assets/calendar.png');
const IconPlus     = require('../assets/plus.png');
const DefaultPhoto = require('../assets/default.png');

export default function AddHomeWork({ navigation, route }) {
  /* ───── данные, пришедшие при редактировании ───── */
  const existing = route.params?.existingHomework ?? null;

  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(existing ? 5 : 1);

  /* ────────────── Шаг 1: Subject ────────────── */
  const [subject, setSubject]           = useState(existing?.subject ?? '');
  const [subjectsList, setSubjectsList] = useState(
    existing && !INITIAL_SUBJECTS.includes(existing.subject)
      ? [...INITIAL_SUBJECTS, existing.subject]
      : INITIAL_SUBJECTS
  );
  const [selectedSubject, setSelectedSubject] = useState(existing?.subject ?? null);
  const addSubject = () => {
    const t = subject.trim();
    if (t && !subjectsList.includes(t)) {
      setSubjectsList(prev => [...prev, t]);
      setSelectedSubject(t);
    }
  };

  /* ────────────── Шаг 2: Tasks ────────────── */
  const [tasks, setTasks]       = useState(existing?.tasks ?? []);
  const [newTask, setNewTask]   = useState('');
  const addTask    = () => {
    const t = newTask.trim();
    if (t) {
      setTasks(prev => [...prev, t]);
      setNewTask('');
    }
  };
  const removeTask = idx => setTasks(prev => prev.filter((_, i) => i !== idx));

  /* ────────────── Шаг 3: Deadline & Color ────────────── */
  const [deadlineDate, setDeadlineDate]   = useState(existing?.deadlineDate ?? '');
  const [showDateCal, setShowDateCal]     = useState(false);
  const [deadlineTime, setDeadlineTime]   = useState(existing?.deadlineTime ?? '');
  const [selectedColor, setSelectedColor] = useState(existing?.color ?? null);
  const isReviewValid = () =>
    !!selectedSubject &&
    tasks.length > 0 &&
    !!deadlineDate &&
    isValidTime(deadlineTime) &&        // ← тепер перевіряємо формат
    !!selectedColor;
  const clearDeadlines = () => {
    setDeadlineDate('');
    setDeadlineTime('');
    setSelectedColor(null);
  };

  /* ────────────── Шаг 4: Photo ────────────── */
  const [photoUri, setPhotoUri] = useState(existing?.photo?.uri ?? null);
  const pickPhoto = () =>
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, res => {
      if (!res.didCancel && res.assets?.length) setPhotoUri(res.assets[0].uri);
    });
    const finish = () => {
  
      if (!selectedSubject)         { Alert.alert('Missing subject');      return; }
      if (!tasks.length)            { Alert.alert('Add at least one task');return; }
      if (!deadlineDate)            { Alert.alert('Pick a due date');      return; }
      if (!isValidTime(deadlineTime)){ Alert.alert(
          'Wrong time format',
          'Please enter time in HH:mm (e.g. 09:30 or 18:05)'
        ); return;
      }
      if (!selectedColor)           { Alert.alert('Pick a colour');        return; }
    
      /* 2️⃣  формуємо ISO-дату (YYYY-MM-DD) */
      const [dd, mm, yy] = deadlineDate.split('.');          // DD.MM.YY
      const dateISO      = `20${yy}-${mm}-${dd}`;            // 2025-04-30
    
      /* 3️⃣  складаємо payload */
      const payload = {
        id     : existing?.id ?? Date.now().toString(),
        subject: selectedSubject,
        tasks,
        deadlineDate,
        deadlineTime,                                         // гарантовано валідно
        photo  : photoUri ? { uri: photoUri } : DefaultPhoto,
        color  : selectedColor,
        dateISO,
        reason : tasks[0] || '',
      };
    
      /* 4️⃣  повертаємось на HomeTab */
      navigation.navigate('Tabs', {
        screen: 'HomeTab',
        params: existing
          ? { updatedHomework: payload }
          : { newHomework: payload },
      });
    };
  /* ────────────── Next-button доступность ────────────── */
  const canNext = () => {
    switch (step) {
      case 1: return !!selectedSubject;
      case 2: return tasks.length > 0;
      case 3: return !!deadlineDate &&
              isValidTime(deadlineTime) &&
               !!selectedColor;
      case 4: return true;
      default: return false;
    }
  };

  /* ────────────── Отрисовка шагов ────────────── */
  const renderStep = () => {
    switch (step) {
      /* ---------- Step 1 ---------- */
      case 1: {
        const filtered = subjectsList.filter(s =>
          s.toLowerCase().includes(subject.trim().toLowerCase())
        );
        return (
          <>
            <Text style={styles.title}>Name of homework</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject"
              placeholderTextColor="#AAA"
              value={subject}
              onChangeText={t => {
                setSubject(t);
                setSelectedSubject(null);
              }}
            />
            <View style={styles.tagRow}>
              {filtered.map(s => {
                const sel = selectedSubject === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.tag, sel && styles.tagSelected]}
                    onPress={() => {
                      setSelectedSubject(s);
                      setSubject(s);
                    }}
                  >
                    <Text style={sel ? styles.tagTextSel : styles.tagText}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
              {subject.trim() && !subjectsList.includes(subject.trim()) && (
                <TouchableOpacity style={styles.tagDashed} onPress={addSubject}>
                  <Text style={styles.tagText}>+ Add "{subject.trim()}"</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        );
      }

      /* ---------- Step 2 ---------- */
      case 2:
        return (
          <>
            <Text style={styles.title}>What tasks do you need to do?</Text>
            {tasks.map((t, i) => (
              <View key={i} style={styles.taskRow}>
                <Text style={styles.taskText}>{t}</Text>
                <TouchableOpacity onPress={() => removeTask(i)}>
                  <Text style={styles.clearX}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.input}
              placeholder="Text"
              placeholderTextColor="#AAA"
              value={newTask}
              onChangeText={setNewTask}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity
              style={[styles.addBtn, !newTask.trim() && { opacity: 0.5 }]}
              disabled={!newTask.trim()}
              onPress={addTask}
            >
              <Image source={IconPlus} style={styles.plusIcon} />
            </TouchableOpacity>
          </>
        );

      /* ---------- Step 3 ---------- */
      case 3:
        return (
          <>
            <Text style={styles.title}>When is it due?</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDateCal(v => !v)}
            >
              <Image source={IconCalendar} style={styles.inlineIcon} />
              <Text style={deadlineDate ? styles.inputText : styles.placeholder}>
                {deadlineDate || 'DD.MM.YY'}
              </Text>
            </TouchableOpacity>
            {showDateCal && (
              <Calendar
                style={styles.calendar}
                onDayPress={d => {
                  const [y, m, d1] = d.dateString.split('-');
                  setDeadlineDate(`${d1}.${m}.${y.slice(2)}`);
                  setShowDateCal(false);
                }}
              />
            )}
            <TextInput
  style={[
    styles.input,
    { marginTop: 12 },
    !!deadlineTime && !isValidTime(deadlineTime) && { borderColor: '#FF3448', borderWidth: 2 },
  ]}
  placeholder={TIME_HINT}
  placeholderTextColor="#AAA"
  keyboardType="number-pad"
  maxLength={5}
  value={deadlineTime}
  onChangeText={setDeadlineTime}
/>
            <Text style={styles.sectionLabel}>Choose color</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { borderColor: c, backgroundColor: selectedColor === c ? c : '#fff' },
                  ]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.linkBtn} onPress={clearDeadlines}>
              <Text style={styles.link}>It does not matter</Text>
            </TouchableOpacity>
          </>
        );

      /* ---------- Step 4 ---------- */
      case 4:
        return (
          <>
            <Text style={styles.title}>Add photo, if you need</Text>
            <TouchableOpacity style={styles.photoBox} onPress={pickPhoto}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <Image source={IconPlus} style={styles.plusIconLarge} />
              )}
            </TouchableOpacity>
          </>
        );

      /* ---------- Step 5 (Review & Edit) ---------- */
      case 5:
        return (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingVertical: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Confirm and edit if needed:</Text>

            {/* Subject */}
            <Text style={styles.sectionLabel}>Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Type or select"
              placeholderTextColor="#AAA"
              value={subject}
              onChangeText={setSubject}
            />
            <View style={styles.tagRow}>
              {subjectsList
                .filter(s =>
                  s.toLowerCase().includes(subject.trim().toLowerCase())
                )
                .map(s => {
                  const sel = selectedSubject === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.tag, sel && styles.tagSelected]}
                      onPress={() => {
                        setSelectedSubject(s);
                        setSubject(s);
                      }}
                    >
                      <Text style={sel ? styles.tagTextSel : styles.tagText}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              {subject.trim() && !subjectsList.includes(subject.trim()) && (
                <TouchableOpacity style={styles.tagDashed} onPress={addSubject}>
                  <Text style={styles.tagText}>+ Add "{subject.trim()}"</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tasks */}
            <Text style={styles.sectionLabel}>Tasks</Text>
            {tasks.map((t, i) => (
              <View key={i} style={styles.taskRow}>
                <Text style={styles.taskText}>{t}</Text>
                <TouchableOpacity onPress={() => removeTask(i)}>
                  <Text style={styles.clearX}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Add new task"
                placeholderTextColor="#AAA"
                value={newTask}
                onChangeText={setNewTask}
                onSubmitEditing={addTask}
              />
              <TouchableOpacity
                style={[
                  styles.addBtn1,
                  { marginLeft: 8 },
                  !newTask.trim() && { opacity: 0.5 },
                ]}
                disabled={!newTask.trim()}
                onPress={addTask}
              >
                <Image source={IconPlus} style={styles.plusIcon2} />
              </TouchableOpacity>
            </View>

            {/* Date & time */}
            <Text style={styles.sectionLabel}>Due date & time</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDateCal(v => !v)}
              activeOpacity={0.8}
            >
              <Image source={IconCalendar} style={styles.inlineIcon} />
              <Text style={deadlineDate ? styles.inputText : styles.placeholder}>
                {deadlineDate || 'DD.MM.YY'}
              </Text>
            </TouchableOpacity>
            {showDateCal && (
              <Calendar
                style={styles.calendar}
                onDayPress={d => {
                  const [y, m, d1] = d.dateString.split('-');
                  setDeadlineDate(`${d1}.${m}.${y.slice(2)}`);
                  setShowDateCal(false);
                }}
              />
            )}
         <TextInput
  style={[
    styles.input,
    { marginTop: 12 },
    !!deadlineTime && !isValidTime(deadlineTime) && { borderColor: '#FF3448', borderWidth: 2 }
  ]}
  placeholder={TIME_HINT}
  placeholderTextColor="#AAA"
  keyboardType="number-pad"
  maxLength={5}
  value={deadlineTime}
  onChangeText={setDeadlineTime}
/>

            {/* Color */}
            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    {
                      borderColor: c,
                      backgroundColor: selectedColor === c ? c : '#fff',
                    },
                  ]}
                  onPress={() =>
                    setSelectedColor(prev => (prev === c ? null : c))
                  }
                />
              ))}
            </View>

            {/* Photo */}
            <Text style={styles.sectionLabel}>Photo</Text>
            <TouchableOpacity
              style={[styles.photoBox, { marginTop: 8 }]}
              onPress={pickPhoto}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photo} />
              ) : (
                <Image source={DefaultPhoto} style={styles.photo} />
              )}
            </TouchableOpacity>

          

<TouchableOpacity
  style={[
    styles.nextBtn,
    { marginTop: 32, opacity: isReviewValid() ? 1 : 0.5 }  // ← 1-рядкова логіка
  ]}
  disabled={!isReviewValid()}                               // ← тепер дійсно блокує
  onPress={finish}
>
  <Text style={styles.nextText}>Save</Text>
</TouchableOpacity>

          </ScrollView>
        );

      default:
        return null;
    }
  };

  /* ────────────── UI ────────────── */
  return (
    <>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <LinearGradient colors={GRADIENT} style={styles.root}>
        <SafeAreaView
          edges={['left', 'right', 'bottom']}
          style={[styles.safe, { paddingTop: insets.top }]}
        >
          {/* BACK */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          {/* CONTENT */}
          <View style={styles.content}>{renderStep()}</View>

          {/* FOOTER (кроме последнего шага) */}
          {step < 5 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.nextBtn, !canNext() && { opacity: 0.5 }]}
                disabled={!canNext()}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.nextText}>
                  {step === 1
                    ? 'Next step'
                    : step < 4
                    ? 'Next'
                    : 'Review'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

/* ────────────── Styles ────────────── */
const P = 24,
  R = 30;
const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  backBtn: { paddingHorizontal: P, paddingVertical: 8 },
  backText: { color: '#fff', fontSize: 16 },

  content: { flex: 1, paddingHorizontal: P },

  title: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 16 },
  sectionLabel: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 24 },
  linkBtn: { marginTop: 12 },
  link: { color: '#fff', fontSize: 16, opacity: 0.8, textAlign: 'center' },

  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F5',
    borderRadius: R,
    paddingHorizontal: 20,
    height: 50,
    marginTop: 12,
  },
  inputText: { flex: 1, fontSize: 16, color: '#333' },
  placeholder: { flex: 1, fontSize: 16, color: '#AAA' },
  inlineIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#FF8200' },
  calendar: { marginTop: 8, alignSelf: 'center', width: width - P * 2, borderRadius: 8 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  tag: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  tagSelected: {
    backgroundColor: SUBJECT_HIGHLIGHT,
    borderColor: SUBJECT_HIGHLIGHT,
  },
  tagText: { color: '#333' },
  tagTextSel: { color: '#fff' },
  tagDashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: R,
    paddingHorizontal: 20,
    height: 50,
    marginTop: 12,
    justifyContent: 'space-between',
  },
  taskText: { fontSize: 16, color: '#333' },
  clearX: { fontSize: 18, color: '#AAA' },

  addBtn: {
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: R,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn1: {
    padding: 15,
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: { width: 24, height: 24, tintColor: '#fff' },
  plusIcon2: { width: 20, height: 20, tintColor: '#fff' },
  plusIconLarge: { width: 40, height: 40, tintColor: '#6E63FF' },

  colorRow: { flexDirection: 'row', marginTop: 16 },
  colorDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    marginRight: 12,
  },

  photoBox: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: 120, height: 120, borderRadius: 20 },

  footer: { padding: 24 },
  nextBtn: {
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { fontSize: 16, fontWeight: '600', color: '#6E63FF' },
});
