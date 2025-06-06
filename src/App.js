import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

// --- 기본 설정 ---
const APP_NAME = "마을벙";
const VIVA_MAGENTA = '#BB2649';

// --- Firebase 설정 ---
const firebaseConfig = {
  apiKey: "AIzaSyAd7ns6wCL72P7X5_qZxX23sBxdkMhWAeg",
  authDomain: "maeulbung.firebaseapp.com",
  projectId: "maeulbung",
  storageBucket: "maeulbung.appspot.com",
  messagingSenderId: "463888320744",
  appId: "1:463888320744:web:0f773fed3428d36895a15d",
  measurementId: "G-WNRFBZX0HE"
};

const appId = firebaseConfig.appId;

// Firebase 앱 및 서비스 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 데이터 구조 (마을별 비밀번호 적용)
const buanTowns = [
    { eupMyeon: "부안읍", villages: [ { name: "월신마을", initialPw: "1111", adminPw: "1112" }, { name: "수내마을", initialPw: "1121", adminPw: "1122" }, { name: "봉학마을", initialPw: "1131", adminPw: "1132" }, { name: "봉서마을", initialPw: "1141", adminPw: "1142" } ] },
    { eupMyeon: "주산면", villages: [ { name: "신천마을", initialPw: "1211", adminPw: "1212" }, { name: "학동마을", initialPw: "1221", adminPw: "1222" }, { name: "소주마을", initialPw: "1231", adminPw: "1232" } ] },
    { eupMyeon: "동진면", villages: [ { name: "구지마을", initialPw: "1311", adminPw: "1312" }, { name: "청운마을", initialPw: "1321", adminPw: "1322" }, { name: "오중마을", initialPw: "1331", adminPw: "1332" }, { name: "상리마을", initialPw: "1341", adminPw: "1342" } ] },
    { eupMyeon: "행안면", villages: [ { name: "종산마을", initialPw: "1411", adminPw: "1412" }, { name: "서옥마을", initialPw: "1421", adminPw: "1422" }, { name: "삼산마을", initialPw: "1431", adminPw: "1432" } ] },
    { eupMyeon: "계화면", villages: [ { name: "동돈마을", initialPw: "1511", adminPw: "1512" }, { name: "계하마을", initialPw: "1521", adminPw: "1522" }, { name: "창북1마을", initialPw: "1531", adminPw: "1532" } ] },
    { eupMyeon: "보안면", villages: [ { name: "신복마을", initialPw: "1611", adminPw: "1612" }, { name: "신안촌마을", initialPw: "1621", adminPw: "1622" }, { name: "남포마을", initialPw: "1631", adminPw: "1632" }, { name: "원천마을", initialPw: "1641", adminPw: "1642" } ] },
    { eupMyeon: "변산면", villages: [ { name: "노을빛마을", initialPw: "1711", adminPw: "1712" }, { name: "산기마을", initialPw: "1721", adminPw: "1722" }, { name: "유동마을", initialPw: "1731", adminPw: "1732" }, { name: "언포마을", initialPw: "1741", adminPw: "1742" }, { name: "도청마을", initialPw: "1751", adminPw: "1752" } ] },
    { eupMyeon: "진서면", villages: [ { name: "관선마을", initialPw: "1811", adminPw: "1812" }, { name: "진서마을", initialPw: "1821", adminPw: "1822" }, { name: "곰소5마을", initialPw: "1831", adminPw: "1832" } ] },
    { eupMyeon: "백산면", villages: [ { name: "평교마을", initialPw: "1911", adminPw: "1912" }, { name: "오곡마을", initialPw: "1921", adminPw: "1922" }, { name: "임방마을", initialPw: "1931", adminPw: "1932" }, { name: "계동마을", initialPw: "1941", adminPw: "1942" } ] },
    { eupMyeon: "상서면", villages: [ { name: "노적마을", initialPw: "2011", adminPw: "2012" }, { name: "장동마을", initialPw: "2021", adminPw: "2022" }, { name: "용서마을", initialPw: "2031", adminPw: "2032" }, { name: "청등마을", initialPw: "2041", adminPw: "2042" } ] },
    { eupMyeon: "하서면", villages: [ { name: "운암마을", initialPw: "2111", adminPw: "2112" }, { name: "마전마을", initialPw: "2121", adminPw: "2122" }, { name: "석하마을", initialPw: "2131", adminPw: "2132" }, { name: "송림마을", initialPw: "2141", adminPw: "2142" } ] },
    { eupMyeon: "줄포면", villages: [ { name: "월평마을", initialPw: "2211", adminPw: "2212" }, { name: "관동마을", initialPw: "2221", adminPw: "2222" }, { name: "서파산마을", initialPw: "2231", adminPw: "2232" }, { name: "동파산마을", initialPw: "2241", adminPw: "2242" } ] },
    { eupMyeon: "위도면", villages: [ { name: "진리마을", initialPw: "2311", adminPw: "2312" }, { name: "대리마을", initialPw: "2321", adminPw: "2322" } ] },
];

const programCategories = {
  'senior_university': '노인대학 프로그램',
  'buan_county': '부안군청 프로그램',
  'rural_support': '농어촌종합지원센터 프로그램',
  'village_self': '마을 자치 프로그램',
};

// 스타일
const styles = {
  container: `p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans text-lg sm:text-xl text-gray-800`,
  card: "bg-white p-6 rounded-xl shadow-lg mb-6",
  title: `text-3xl sm:text-4xl font-bold text-[${VIVA_MAGENTA}] mb-6 text-center`,
  subtitle: `text-2xl font-semibold text-[${VIVA_MAGENTA}] mb-4 border-b-2 border-[${VIVA_MAGENTA}] pb-2`,
  button: `bg-[${VIVA_MAGENTA}] hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl w-full transition duration-150 ease-in-out disabled:opacity-50 text-xl`,
  secondaryButton: `bg-gray-600 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl w-full transition duration-150 ease-in-out text-xl`,
  input: "shadow-inner appearance-none border-2 border-gray-200 rounded-lg w-full py-3 px-4 text-gray-800 leading-tight focus:outline-none focus:border-[#BB2649] mb-4 text-lg",
  label: "block text-gray-700 text-xl font-bold mb-2",
  modalOverlay: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50",
  modalContent: "bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-lg",
  floatingButton: `fixed bottom-6 right-6 bg-[${VIVA_MAGENTA}] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl text-3xl z-10`,
  dashboardSection: `bg-white p-5 rounded-xl shadow-lg mb-6`,
  dashboardSectionHeader: `flex justify-between items-center mb-3`,
  dashboardSectionTitle: `text-2xl font-bold text-gray-800`,
  dashboardMoreButton: `text-lg font-semibold text-[${VIVA_MAGENTA}]`,
  recentPostItem: `bg-gray-50 p-4 rounded-lg hover:bg-gray-100 cursor-pointer`,
  splashScreen: `w-screen h-screen flex flex-col justify-center items-center bg-white`,
  splashTitle: `text-5xl font-bold text-[${VIVA_MAGENTA}]`,
};

// 랜딩(로딩) 화면
function SplashScreen({ error }) {
    return (
        <div className={styles.splashScreen}>
            <h1 className={styles.splashTitle}>{APP_NAME}</h1>
            {error ? (
                <p className="text-red-500 mt-4 text-center p-4">{error}</p>
            ) : (
                <p className="text-gray-500 mt-4">앱을 준비하고 있습니다...</p>
            )}
        </div>
    );
}

// --- 달력 컴포넌트 ---
function CalendarComponent({ village, refreshKey }) {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [events, setEvents] = useState({});
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
      const fetchEvents = async () => {
        if (!village) return;
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        const eventsCollection = `artifacts/${appId}/public/data/calendarEvents`;
        const q = query(collection(db, eventsCollection), where("village", "==", village));
        const snapshot = await getDocs(q);
        const fetchedEvents = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            const eventDate = data.date.toDate();
            if (eventDate >= startOfMonth && eventDate <= endOfMonth) {
                const day = eventDate.getDate();
                if (!fetchedEvents[day]) fetchedEvents[day] = [];
                fetchedEvents[day].push(data.title);
            }
        });
        setEvents(fetchedEvents);
      };
      fetchEvents();
    }, [village, month, year, refreshKey]);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="p-1"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const eventTitles = events[day];
        const hasEvent = !!eventTitles;
        days.push(
            <div key={day} className="text-center p-1">
                <div className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full text-lg ${isToday ? `bg-[${VIVA_MAGENTA}] text-white` : ''} ${hasEvent ? 'border-2 border-blue-400' : ''}`}>
                    {day}
                </div>
                {hasEvent && <p className="text-xs mt-1 truncate text-blue-500 font-semibold" title={eventTitles.join(', ')}>{eventTitles[0]}</p>}
            </div>
        );
    }

    return (
        <>
            <div className="flex justify-between items-center px-2 mb-4">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="text-2xl font-bold">‹</button>
                <h3 className="text-2xl font-bold">{`${year}년 ${month + 1}월`}</h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="text-2xl font-bold">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </>
    );
}

// --- 메인 앱 컴포넌트 ---
function App() {
  const [screen, setScreen] = useState('loading');
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appState, setAppState] = useState({ name: null, eupMyeon: null, village: null, isMember: false, isAdmin: false });
  const [modal, setModal] = useState({ show: false, message: '', type: 'alert', component: null });
  const [adminAction, setAdminAction] = useState({ callback: null });
  const [context, setContext] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/main`);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAppState({ ...data, isAdmin: false });
            if (!data.name) {
              setScreen('registration');
            } else {
              setScreen('dashboard');
            }
          } else {
            setScreen('eupMyeonSelection');
          }
        } catch (error) {
           console.error("Firestore Get Document Failed:", error);
           let detailedMessage = `데이터를 불러오는 데 실패했습니다. (오류: ${error.code})`;
            if (error.code === 'permission-denied') {
                 detailedMessage = "데이터베이스 접근 권한이 없습니다. Firebase 콘솔에서 Firestore 데이터베이스의 '규칙'을 수정해야 합니다.";
            } else if (error.code === 'unavailable' || error.message.includes('offline')) {
                detailedMessage = "데이터베이스에 연결할 수 없습니다. Firestore 데이터베이스가 생성되었는지, Cloud Firestore API가 활성화되었는지 확인해주세요.";
            }
            setModal({show: true, message: detailedMessage});
        }
      } else {
        signInAnonymously(auth).catch(err => { 
            console.error("Anonymous Sign-In Failed:", err);
            let detailedMessage = `인증에 실패했습니다. (오류: ${err.code})`;
            if (err.code === 'auth/admin-restricted-operation') {
                detailedMessage = "인증에 실패했습니다. Firebase의 고급 보안 기능(Identity Platform)이 익명 로그인을 막고 있습니다. Google Cloud 콘솔에서 '아이덴티티 플랫폼' > '설정' > '보안' 탭의 '익명 사용자 생성 허용'이 체크되었는지 최종 확인해주세요.";
            } else if (err.code === 'auth/configuration-not-found') {
                detailedMessage = "인증에 실패했습니다. 현재 접속 환경이 Firebase에 등록되지 않았습니다. Firebase 콘솔의 'Authentication' > 'Settings' > '승인된 도메인'에 'usercontent.goog'를 추가해주세요.";
            }
            setModal({show: true, message: detailedMessage});
        });
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const saveAppState = useCallback(async (newState) => {
    if (!userId) return;
    const finalState = { ...appState, ...newState };
    setAppState(finalState);
    const { isAdmin, ...stateToSave } = finalState;
    await setDoc(doc(db, `artifacts/${appId}/users/${userId}/profile/main`), stateToSave, { merge: true });
  }, [userId, appState]);
  
  const navigate = (screenName, ctx = {}) => {
    setContext(ctx);
    setScreen(screenName);
  };
  
  const checkAdminPassword = (password) => {
    const townData = buanTowns.find(t => t.eupMyeon === appState.eupMyeon);
    const villageData = townData?.villages.find(v => v.name === appState.village);
    if (villageData && password === villageData.adminPw) {
      setAppState(s => ({ ...s, isAdmin: true }));
      setModal({ show: false });
      if (adminAction.callback) adminAction.callback();
    } else {
      setModal(m => ({ ...m, message: "관리자 비밀번호가 틀렸습니다." }));
    }
  };

  const requestAdmin = (callback) => {
    if (appState.isAdmin) {
      callback();
    } else {
      setAdminAction({ callback });
      setModal({ show: true, type: 'adminPassword' });
    }
  };

  const renderScreen = () => {
    if (screen === 'loading' || !isAuthReady) {
        return <SplashScreen />;
    }

    const screens = {
        eupMyeonSelection: <EupMyeonSelectionScreen onSelect={(eupMyeon) => navigate('villageSelection', { eupMyeon })} />,
        villageSelection: <VillageSelectionScreen eupMyeon={context.eupMyeon} onSelect={(village) => navigate('villagePassword', { village })} onBack={() => navigate('eupMyeonSelection')} />,
        villagePassword: <VillagePasswordScreen village={context.village} onConfirm={() => { saveAppState({ eupMyeon: context.village.eupMyeon, village: context.village.name, isMember: true }); navigate('registration'); }} setModal={setModal} />,
        registration: <RegistrationScreen onRegister={(name) => { saveAppState({ name }); navigate('dashboard'); }} />,
        dashboard: <DashboardScreen navigate={navigate} appState={appState} requestAdmin={requestAdmin} setModal={setModal} />,
        notices: <NoticesScreen navigate={navigate} appState={appState} requestAdmin={requestAdmin} />,
        maeulbung: <MaeulbungScreen navigate={navigate} appState={appState} userId={userId} />,
        programs: <ProgramNewsScreen navigate={navigate} appState={appState} requestAdmin={requestAdmin} />,
        jobs: <JobsScreen navigate={navigate} appState={appState} />,
        addPost: <AddPostScreen navigate={navigate} context={context} appState={appState} userId={userId} />,
        programApplication: <ProgramApplicationScreen navigate={navigate} context={context} appState={appState} userId={userId} />,
    };
    return screens[screen] || <div className={styles.container}><h1 className={styles.title}>오류가 발생했습니다. 앱을 다시 시작해주세요.</h1></div>;
  };

  return (
    <div className={styles.container}>
      {renderScreen()}
      {modal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            {modal.component ? modal.component : (
              <>
                <p className="font-bold text-xl mb-6">{modal.message || '관리자 권한이 필요합니다.'}</p>
                {modal.type === 'adminPassword' ? (
                  <form onSubmit={(e) => { e.preventDefault(); checkAdminPassword(e.target.password.value); }}>
                    <input name="password" type="password" className={styles.input} autoFocus />
                    <div className="flex gap-4 mt-4">
                      <button type="button" onClick={() => setModal({ show: false })} className={styles.secondaryButton}>취소</button>
                      <button type="submit" className={styles.button}>확인</button>
                    </div>
                  </form>
                ) : (
                  <button onClick={() => setModal({ show: false })} className={styles.button}>확인</button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EupMyeonSelectionScreen({ onSelect }) {
  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{APP_NAME}</h1>
      <h2 className={styles.subtitle}>읍/면을 선택해주세요</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {buanTowns.map(town => (
          <button key={town.eupMyeon} onClick={() => onSelect(town.eupMyeon)} className={styles.button}>{town.eupMyeon}</button>
        ))}
      </div>
    </div>
  );
}

function VillageSelectionScreen({ eupMyeon, onSelect, onBack }) {
    const townData = buanTowns.find(t => t.eupMyeon === eupMyeon);
    const villages = townData ? townData.villages : [];
    return (
        <div className={styles.card}>
            <button onClick={onBack} className="text-left mb-4 text-gray-600 font-bold"> &lt; 뒤로가기</button>
            <h1 className={styles.title}>{eupMyeon}</h1>
            <h2 className={styles.subtitle}>마을을 선택해주세요</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {villages.map(village => (
                    <button key={village.name} onClick={() => onSelect({ ...village, eupMyeon })} className={styles.button}>{village.name}</button>
                ))}
            </div>
        </div>
    );
}

function VillagePasswordScreen({ village, onConfirm, setModal }) {
    const [password, setPassword] = useState('');
    const handleConfirm = () => {
        if (password === village.initialPw) {
            onConfirm();
        } else {
            setModal({show: true, message: '마을 비밀번호가 틀렸습니다.'});
        }
    };
    return (
        <div className={styles.card}>
            <h1 className={styles.title}>마을 입장</h1>
            <h2 className={styles.subtitle}>{village.name}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} placeholder="입장 비밀번호를 입력하세요" />
                <button type="submit" className={styles.button}>입장하기</button>
            </form>
        </div>
    );
}

function RegistrationScreen({ onRegister }) {
    const [name, setName] = useState('');
    return (
        <div className={styles.card}>
            <h1 className={styles.title}>이름 등록</h1>
            <h2 className={styles.subtitle}>마을에서 사용하실 이름을 입력해주세요.</h2>
            <form onSubmit={(e) => { e.preventDefault(); if(name.trim()) onRegister(name.trim()); }}>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} placeholder="예) 홍길동" required/>
                <button type="submit" className={styles.button}>마을벙 시작하기</button>
            </form>
        </div>
    );
}

function DashboardScreen({ navigate, appState, requestAdmin, setModal }) {
    const dashboardSections = [
        { title: "이장님 공지", screen: 'notices', collection: 'notices' },
        { title: "마을벙", screen: 'maeulbung', collection: 'maeulbungs' },
        { title: "프로그램 소식", screen: 'programs', collection: 'programNews' },
        { title: "마을 일자리", screen: 'jobs', collection: 'jobs' },
    ];
    
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAddEvent = () => {
        const AddEventFormComponent = ({ closeModal }) => {
            const [title, setTitle] = useState('');
            const [date, setDate] = useState('');
            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!title || !date) { alert('일정 제목과 날짜를 모두 입력해주세요.'); return; }
                const eventDate = new Date(date);
                const fullCollectionPath = `artifacts/${appId}/public/data/calendarEvents`;
                await addDoc(collection(db, fullCollectionPath), {
                    title, date: Timestamp.fromDate(eventDate), village: appState.village, createdAt: Timestamp.now(),
                });
                alert('일정이 추가되었습니다.');
                setRefreshKey(k => k + 1);
                closeModal();
            };
            return (
                <form onSubmit={handleSubmit}>
                    <h2 className={styles.subtitle}>새 일정 추가</h2>
                    <label className={styles.label}>일정 제목</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} required />
                    <label className={styles.label}>날짜</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.input} required />
                    <div className="flex gap-4 mt-4">
                        <button type="button" onClick={closeModal} className={styles.secondaryButton}>취소</button>
                        <button type="submit" className={styles.button}>추가</button>
                    </div>
                </form>
            );
        };
        requestAdmin(() => {
            setModal({ show: true, component: <AddEventFormComponent closeModal={() => setModal({ show: false })} /> });
        });
    };

    return (
        <div>
            <h1 className={styles.title}>{appState.village}</h1>
            <div className={styles.dashboardSection}>
                 <div className={styles.dashboardSectionHeader}>
                    <h2 className={styles.dashboardSectionTitle}>마을 주요 일정</h2>
                 </div>
                <CalendarComponent village={appState.village} refreshKey={refreshKey} />
                <button onClick={handleAddEvent} className={`${styles.button} !bg-blue-600 hover:!bg-blue-800 mt-4`}>일정 추가하기</button>
            </div>
            
            {dashboardSections.map(section => (
                <DashboardSection
                    key={section.screen}
                    title={section.title}
                    collectionName={section.collection}
                    village={appState.village}
                    onMore={() => navigate(section.screen)}
                />
            ))}
        </div>
    );
}

function DashboardSection({ title, collectionName, village, onMore }) {
    const [latestPost, setLatestPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLatestPost = async () => {
            if (!village) return;
            setLoading(true);
            try {
                const fullCollectionPath = `artifacts/${appId}/public/data/${collectionName}`;
                const q = query(
                    collection(db, fullCollectionPath),
                    where("village", "==", village)
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                    const allPosts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                    allPosts.sort((a, b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
                    setLatestPost(allPosts[0]);
                } else {
                    setLatestPost(null);
                }
            } catch (error) {
                console.error(`Error fetching latest post from ${collectionName}:`, error);
                setLatestPost(null);
            }
            setLoading(false);
        };
        fetchLatestPost();
    }, [collectionName, village]);

    return (
        <div className={styles.dashboardSection}>
            <div className={styles.dashboardSectionHeader}>
                <h2 className={styles.dashboardSectionTitle}>{title}</h2>
                <button onClick={onMore} className={styles.dashboardMoreButton}>더보기 &gt;</button>
            </div>
            {loading ? <p className="text-gray-500">불러오는 중...</p> : 
                latestPost ? (
                    <div className={styles.recentPostItem}>
                        <h3 className="font-bold truncate">{latestPost.title}</h3>
                        <p className="text-gray-600 truncate">{latestPost.content}</p>
                    </div>
                ) : (
                    <p className="text-gray-500">최신 글이 없습니다.</p>
                )
            }
        </div>
    );
}

function PostList({ navigate, collectionName, appState, requestAdmin, canAnyonePost, postType, title, addPostContext, userId }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0);

    const fetchPosts = useCallback(async () => {
        if (!appState.village) return;
        setLoading(true);
        const fullCollectionPath = `artifacts/${appId}/public/data/${collectionName}`;
        const q = query(collection(db, fullCollectionPath), where("village", "==", appState.village));
        const snapshot = await getDocs(q);
        const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        postList.sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
        setPosts(postList);
        setLoading(false);
    }, [appState.village, collectionName]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, key]);

    const handleAddPost = () => {
        const action = () => navigate('addPost', { ...addPostContext, onPostAdded: () => setKey(k => k + 1) });
        if (canAnyonePost) action();
        else requestAdmin(action);
    };
    
    return (
        <div>
             <button onClick={() => navigate('dashboard')} className="text-left mb-4 text-gray-600 font-bold"> &lt; {appState.village} 홈</button>
            <h1 className={styles.title}>{title}</h1>
            {loading ? <p>로딩 중...</p> : (
                posts.length === 0 
                ? <p className="text-center text-gray-500 py-8">등록된 글이 없습니다.</p>
                : posts.map(post => <PostItem key={post.id} post={post} postType={postType} userId={userId} collectionName={collectionName} refreshList={fetchPosts} navigate={navigate} />)
            )}
            <button onClick={handleAddPost} className={styles.floatingButton}>+</button>
        </div>
    );
}

function PostItem({ post, postType, userId, collectionName, refreshList, navigate }) {
  const handleAttend = async () => {
    if (!userId || !post.id) return;
    const postRef = doc(db, `artifacts/${appId}/public/data/${collectionName}/${post.id}`);
    try {
      await updateDoc(postRef, {
        attendees: arrayUnion(userId)
      });
      alert('참석 처리되었습니다!');
      refreshList(); 
    } catch (error) {
      console.error("Error attending:", error);
      alert('참석 처리에 실패했습니다.');
    }
  };

  const MaeulbungExtra = () => (
    <>
      <p className="font-bold mt-2">모임 날짜: {post.eventDate ? new Date(post.eventDate).toLocaleString() : '미정'}</p>
      <div className="mt-2 flex gap-4">
        <button onClick={handleAttend} className={`${styles.button} w-auto !py-2 !px-4 !text-base !bg-green-600`}>참석 ({post.attendees?.length || 0})</button>
        <button className={`${styles.secondaryButton} w-auto !py-2 !px-4 !text-base`}>미참석</button>
      </div>
    </>
  );

  return (
    <div className={styles.card}>
      <h3 className="text-xl font-bold">{post.title}</h3>
      <p className="text-sm text-gray-500 mb-2">작성자: {post.authorName || '주민'} · {post.createdAt?.toDate().toLocaleDateString()}</p>
      <p className="whitespace-pre-wrap">{post.content}</p>
      {postType === 'maeulbung' && <MaeulbungExtra />}
      {postType === 'program' && <button onClick={() => navigate('programApplication', { program: post })} className={`${styles.button} mt-4 w-auto !py-2 !text-lg bg-green-600`}>신청하기</button>}
    </div>
  );
}


function NoticesScreen({ navigate, appState, requestAdmin }) {
    return <PostList 
        navigate={navigate}
        collectionName="notices"
        appState={appState}
        requestAdmin={requestAdmin}
        canAnyonePost={false}
        title="이장님 공지"
        addPostContext={{ collectionName: 'notices', postType: 'notice', title: '공지사항 작성', returnScreen: 'notices' }}
    />;
}

function MaeulbungScreen({ navigate, appState, userId }) {
     return <PostList 
        navigate={navigate}
        collectionName="maeulbungs"
        appState={appState}
        canAnyonePost={true}
        title="마을벙"
        postType="maeulbung"
        userId={userId}
        addPostContext={{ collectionName: 'maeulbungs', postType: 'maeulbung', title: '새로운 마을벙 만들기', returnScreen: 'maeulbung' }}
    />;
}
function JobsScreen({ navigate, appState }) {
     return <PostList 
        navigate={navigate}
        collectionName="jobs"
        appState={appState}
        canAnyonePost={true}
        title="마을 일자리"
        postType="job"
        addPostContext={{ collectionName: 'jobs', postType: 'job', title: '일손 구하기', returnScreen: 'jobs' }}
    />;
}

function ProgramNewsScreen({ navigate, appState, requestAdmin }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [key, setKey] = useState(0);

    useEffect(() => {
        const fetchPrograms = async () => {
            setLoading(true);
            const fullCollectionPath = `artifacts/${appId}/public/data/programNews`;
            const q = query(collection(db, fullCollectionPath));
            const snapshot = await getDocs(q);
            let postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (filter !== 'all') {
                postList = postList.filter(post => post.category === filter);
            }
            postList.sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
            setPosts(postList);
            setLoading(false);
        };
        fetchPrograms();
    }, [filter, key]);
    
    const handleAddPost = () => {
      requestAdmin(() => navigate('addPost', { 
          collectionName: 'programNews', 
          postType: 'program', 
          title: '새 프로그램 소식 작성', 
          returnScreen: 'programs',
          onPostAdded: () => setKey(k => k + 1)
      }));
    };

    return (
        <div>
            <button onClick={() => navigate('dashboard')} className="text-left mb-4 text-gray-600 font-bold"> &lt; {appState.village} 홈</button>
            <h1 className={styles.title}>프로그램 소식</h1>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? `${styles.button} !py-2 !text-lg` : `${styles.secondaryButton} !py-2 !text-lg`}>전체</button>
                {Object.entries(programCategories).map(([key, value]) => (
                    <button key={key} onClick={() => setFilter(key)} className={filter === key ? `${styles.button} !py-2 !text-lg` : `${styles.secondaryButton} !py-2 !text-lg`}>{value}</button>
                ))}
            </div>
            {loading ? <p>로딩 중...</p> : posts.map(post => (<PostItem key={post.id} post={post} postType="program" navigate={navigate} />))}
            <button onClick={handleAddPost} className={styles.floatingButton}>+</button>
        </div>
    );
}

function AddPostScreen({ navigate, context, appState, userId }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [extraFields, setExtraFields] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCollectionPath = `artifacts/${appId}/public/data/${context.collectionName}`;
        await addDoc(collection(db, fullCollectionPath), {
            title,
            content,
            village: appState.village,
            authorId: userId,
            authorName: appState.name || '주민',
            createdAt: Timestamp.now(),
            ...extraFields
        });
        if (context.onPostAdded) {
            context.onPostAdded();
        }
        navigate(context.returnScreen);
    };

    return (
        <div className={styles.card}>
            <h1 className={styles.title}>{context.title}</h1>
            <form onSubmit={handleSubmit}>
                <label className={styles.label}>제목</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} required/>
                {context.postType === 'maeulbung' && (<><label className={styles.label}>모임 날짜</label><input type="datetime-local" onChange={(e) => setExtraFields(f => ({...f, eventDate: e.target.value }))} className={styles.input} required/></>)}
                {context.postType === 'program' && (<><label className={styles.label}>프로그램 카테고리</label><select onChange={(e) => setExtraFields(f => ({...f, category: e.target.value }))} className={styles.input} defaultValue="" required><option value="" disabled>카테고리 선택</option>{Object.entries(programCategories).map(([key, value]) => <option key={key} value={key}>{value}</option>)}</select></>)}
                <label className={styles.label}>내용</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`${styles.input} h-48`} required/>
                <div className="flex gap-4 mt-4">
                    <button type="button" onClick={() => navigate(context.returnScreen)} className={styles.secondaryButton}>취소</button>
                    <button type="submit" className={styles.button}>작성 완료</button>
                </div>
            </form>
        </div>
    );
}

function ProgramApplicationScreen({ navigate, context, appState, userId }) {
    const { program } = context;
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { name: e.target.name.value, phone: e.target.phone.value, dob: e.target.dob.value };
        const fullCollectionPath = `artifacts/${appId}/public/data/applications`;
        await addDoc(collection(db, fullCollectionPath), {
            userId, village: appState.village, programId: program.id, programTitle: program.title,
            formData, status: 'submitted', createdAt: Timestamp.now(),
        });
        alert(`${program.title} 프로그램 신청이 완료되었습니다.`);
        navigate('programs');
    };
    return (
        <div className={styles.card}>
            <h1 className={styles.title}>{program.title}</h1>
            <h2 className={styles.subtitle}>프로그램 신청서 작성</h2>
            <form onSubmit={handleSubmit}>
                <label className={styles.label}>이름</label>
                <input name="name" type="text" className={styles.input} required />
                <label className={styles.label}>연락처</label>
                <input name="phone" type="tel" className={styles.input} required />
                <label className={styles.label}>생년월일</label>
                <input name="dob" type="date" className={styles.input} required />
                 <div className="flex gap-4 mt-4">
                    <button type="button" onClick={() => navigate('programs')} className={styles.secondaryButton}>취소</button>
                    <button type="submit" className={styles.button}>제출하기</button>
                </div>
            </form>
        </div>
    );
}

export default App;
