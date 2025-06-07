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
  deleteDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

// --- 기본 설정 ---
const APP_NAME = "마을엔";
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

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 데이터 구조
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
  container: `p-4 sm:p-6 bg-gray-50 min-h-screen font-sans text-xl text-gray-800`,
  card: "bg-white p-6 rounded-2xl shadow-md mb-6",
  title: `text-4xl sm:text-5xl font-bold text-[${VIVA_MAGENTA}] mb-6 text-center`,
  subtitle: `text-3xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200`,
  button: `bg-[${VIVA_MAGENTA}] hover:opacity-90 text-white font-bold py-4 px-6 rounded-xl w-full transition duration-150 ease-in-out disabled:opacity-50 text-xl shadow-md`,
  secondaryButton: `bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl w-full transition duration-150 ease-in-out text-xl shadow-md`,
  input: "shadow-inner appearance-none border-2 border-gray-200 rounded-lg w-full py-4 px-4 text-gray-800 leading-tight focus:outline-none focus:border-[#BB2649] mb-4 text-xl",
  label: "block text-gray-800 text-2xl font-bold mb-2",
  modalOverlay: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50",
  modalContent: "bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg text-lg",
  splashScreen: `w-screen h-screen flex flex-col justify-center items-center bg-white`,
  splashTitle: `text-5xl font-bold text-[${VIVA_MAGENTA}]`,
  bottomNav: "fixed bottom-0 left-0 right-0 h-20 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around items-center z-20",
  navButton: "flex flex-col items-center justify-center text-gray-500",
  navButtonActive: "flex flex-col items-center justify-center text-[#BB2649] font-bold",
  dashboardSection: `bg-white p-5 rounded-2xl shadow-lg mb-6`,
  dashboardSectionHeader: `flex justify-between items-center mb-3`,
  dashboardSectionTitle: `text-2xl font-bold text-gray-800`,
  dashboardMoreButton: `text-lg font-semibold text-[${VIVA_MAGENTA}]`,
  recentPostItem: `bg-gray-50 p-4 rounded-lg hover:bg-gray-100 cursor-pointer`,
};

// SVG 아이콘 컴포넌트
const icons = {
  home: (active) => <svg className={`w-8 h-8 mb-1 ${active ? 'text-[#BB2649]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  add: (active) => <svg className={`w-10 h-10 ${active ? 'text-white' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>,
  settings: (active) => <svg className={`w-8 h-8 mb-1 ${active ? 'text-[#BB2649]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
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

// 달력
function CalendarComponent({ village, refreshKey, showMaeulbung }) {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(today);
    const [events, setEvents] = useState({});
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
      const fetchEvents = async () => {
        if (!village) return;
        const eventsCollection = `artifacts/${appId}/public/data/calendarEvents`;
        const q = query(collection(db, eventsCollection), where("village", "==", village));
        const snapshot = await getDocs(q);
        const fetchedEvents = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.type === 'maeulbung' && !showMaeulbung) return;
            const eventDate = data.date.toDate();
            if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
                const day = eventDate.getDate();
                if (!fetchedEvents[day]) fetchedEvents[day] = [];
                fetchedEvents[day].push({id: doc.id, title: data.title, type: data.type});
            }
        });
        setEvents(fetchedEvents);
      };
      fetchEvents();
    }, [village, month, year, refreshKey, showMaeulbung]);

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="p-1"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const eventData = events[day];
        const hasEvent = !!eventData;
        const isMaeulbungEvent = hasEvent && eventData.some(e => e.type === 'maeulbung');
        
        let dayStyle = '';
        if (isToday) dayStyle = `bg-[${VIVA_MAGENTA}] text-white`;
        else if (isMaeulbungEvent) dayStyle = 'border-2 border-green-400';
        else if (hasEvent) dayStyle = 'border-2 border-blue-400';

        days.push(
            <div key={day} className="text-center p-1">
                <div className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full text-lg ${dayStyle}`}>
                    {day}
                </div>
                {hasEvent && <p className="text-xs mt-1 truncate text-gray-600 font-semibold" title={eventData.map(e => e.title).join(', ')}>{eventData[0].title}</p>}
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
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [appState, setAppState] = useState({ name: null, eupMyeon: null, village: null, isMember: false, isAdmin: false, userId: null });
  const [modal, setModal] = useState({ show: false, message: '', type: 'alert', component: null });
  const [adminAction, setAdminAction] = useState({ callback: null });
  const [context, setContext] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile/main`);
        try {
          const userDoc = await getDoc(userDocRef);
          const newState = { userId: user.uid, isAdmin: false };
          if (userDoc.exists()) {
            const data = userDoc.data();
            Object.assign(newState, data);
            setAppState(newState);
            if (!data.name) {
              setScreen('registration');
            } else {
              setScreen('dashboard');
            }
          } else {
            setAppState(newState);
            setScreen('eupMyeonSelection');
          }
        } catch (error) {
           console.error("Firestore Get Document Failed:", error);
           let detailedMessage = `데이터를 불러오는 데 실패했습니다. (오류: ${error.code})`;
            if (error.code === 'permission-denied') {
                 detailedMessage = "데이터베이스 접근 권한이 없습니다. Firebase 콘솔에서 Firestore 데이터베이스의 '규칙'을 수정해야 합니다.";
            }
            setModal({show: true, message: detailedMessage});
        }
      } else {
        signInAnonymously(auth).catch(err => { 
            console.error("Anonymous Sign-In Failed:", err);
            let detailedMessage = `인증에 실패했습니다. (오류: ${err.code})`;
            setModal({show: true, message: detailedMessage});
        });
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const saveAppState = useCallback(async (newState) => {
    if (!appState.userId) return;
    const finalState = { ...appState, ...newState };
    setAppState(finalState);
    const { isAdmin, ...stateToSave } = finalState;
    await setDoc(doc(db, `artifacts/${appId}/users/${appState.userId}/profile/main`), stateToSave, { merge: true });
  }, [appState]);
  
  const navigate = (screenName, ctx = {}) => {
    setContext(ctx);
    setScreen(screenName);
  };
  
  const checkAdminPassword = (password) => {
    const adminPassword = buanTowns
      .find(t => t.eupMyeon === appState.eupMyeon)?.villages
      .find(v => v.name === appState.village)?.adminPw;
      
    if (adminPassword && password === adminPassword) {
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
    const currentAppState = { ...appState };

    const screens = {
        eupMyeonSelection: <EupMyeonSelectionScreen onSelect={(eupMyeon) => navigate('villageSelection', { eupMyeon })} />,
        villageSelection: <VillageSelectionScreen eupMyeon={context.eupMyeon} onSelect={(village) => navigate('villagePassword', { village })} onBack={() => navigate('eupMyeonSelection')} />,
        villagePassword: <VillagePasswordScreen village={context.village} onConfirm={() => { saveAppState({ eupMyeon: context.village.eupMyeon, village: context.village.name, isMember: true }); navigate('registration'); }} setModal={setModal} />,
        registration: <RegistrationScreen onRegister={(name) => { saveAppState({ name }); navigate('dashboard'); }} />,
        dashboard: <DashboardScreen navigate={navigate} appState={currentAppState} />,
        settings: <SettingsScreen navigate={navigate} requestAdmin={requestAdmin} isAdmin={appState.isAdmin} />,
        calendarManagement: <CalendarManagementScreen navigate={navigate} appState={currentAppState} setModal={setModal} />,
        notices: <NoticesScreen navigate={navigate} appState={currentAppState} requestAdmin={requestAdmin} setModal={setModal} />,
        maeulbung: <MaeulbungScreen navigate={navigate} appState={currentAppState} requestAdmin={requestAdmin} setModal={setModal} />,
        programs: <ProgramNewsScreen navigate={navigate} appState={currentAppState} requestAdmin={requestAdmin} setModal={setModal} />,
        jobs: <JobsScreen navigate={navigate} appState={currentAppState} requestAdmin={requestAdmin} setModal={setModal} />,
        addPost: <AddPostScreen navigate={navigate} context={context} appState={currentAppState} />,
        editPost: <EditPostScreen navigate={navigate} context={context} />,
        applicantList: <ApplicantListScreen navigate={navigate} />,
    };
    return screens[screen] || <div className={styles.container}><h1 className={styles.title}>오류가 발생했습니다. 앱을 다시 시작해주세요.</h1></div>;
  };

  return (
    <div className="pb-20"> {/* BottomNav height */}
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
      { (screen !== 'loading' && screen !== 'eupMyeonSelection' && screen !== 'villageSelection' && screen !== 'villagePassword' && screen !== 'registration') && 
        <BottomNavBar activeScreen={screen} navigate={navigate} setModal={setModal} requestAdmin={requestAdmin} />
      }
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
                <button type="submit" className={styles.button}>마을엔 시작하기</button>
            </form>
        </div>
    );
}

function DashboardScreen({ navigate, appState }) {
    const [showMaeulbung, setShowMaeulbung] = useState(true);

    const dashboardSections = [
        { title: "이장님 공지", screen: 'notices', collection: 'notices' },
        { title: "마을벙", screen: 'maeulbung', collection: 'maeulbungs' },
        { title: "프로그램 소식", screen: 'programs', collection: 'programNews' },
        { title: "마을 일자리", screen: 'jobs', collection: 'jobs' },
    ];

    return (
        <div className="p-4">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">{appState.village}</h1>
            
            <div className={styles.dashboardSection}>
                 <div className={styles.dashboardSectionHeader}>
                    <h2 className="text-2xl font-bold text-gray-800">마을 주요 일정</h2>
                 </div>
                <CalendarComponent village={appState.village} showMaeulbung={showMaeulbung} />
                <button onClick={() => setShowMaeulbung(!showMaeulbung)} className={`${styles.button} !text-lg !py-2 !bg-green-600 hover:!bg-green-800 mt-4`}>
                    {showMaeulbung ? '마을벙 일정 숨기기' : '마을벙 일정 보이기'}
                </button>
            </div>
            
            {dashboardSections.map(section => (
                <DashboardSection
                    key={section.screen}
                    title={section.title}
                    onMore={() => navigate(section.screen)}
                    village={appState.village}
                    collectionName={section.collection}
                />
            ))}
        </div>
    );
}

function SettingsScreen({ navigate, requestAdmin, isAdmin }) {
    return (
        <div className="p-4">
            <h1 className={styles.title}>설정</h1>
            <div className={styles.card}>
                {!isAdmin ? (
                    <button onClick={() => requestAdmin(() => {})} className={styles.button}>관리자 로그인</button>
                ) : (
                    <div className="space-y-4">
                        <h2 className={styles.subtitle}>관리자 메뉴</h2>
                        <button onClick={() => navigate('calendarManagement')} className={styles.button}>마을 일정 관리</button>
                        <button onClick={() => navigate('applicantList')} className={styles.button}>프로그램 신청자 목록</button>
                         <p className="text-center text-green-600 font-bold mt-4">관리자로 로그인되었습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function CalendarManagementScreen({ navigate, appState, setModal }) {
    const [events, setEvents] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchAllEvents = async () => {
            if (!appState.village) return;
            const eventsCollection = `artifacts/${appId}/public/data/calendarEvents`;
            const q = query(collection(db, eventsCollection), where("village", "==", appState.village));
            const snapshot = await getDocs(q);
            const eventList = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
            eventList.sort((a,b) => b.date.toDate() - a.date.toDate());
            setEvents(eventList);
        };
        fetchAllEvents();
    }, [appState.village, refreshKey]);

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
                    title, date: Timestamp.fromDate(eventDate), village: appState.village, type: 'admin', createdAt: Timestamp.now(),
                });
                setModal({ show: true, message: "일정이 추가되었습니다." });
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
        setModal({ show: true, component: <AddEventFormComponent closeModal={() => setModal({ show: false })} /> });
    };

    const handleDeleteEvent = async (eventId) => {
        setModal({
            show: true,
            component: (
              <div>
                <p className="font-bold text-xl mb-6">이 일정을 삭제하시겠습니까?</p>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setModal({ show: false })} className={styles.secondaryButton}>취소</button>
                  <button onClick={async () => {
                     const eventRef = doc(db, `artifacts/${appId}/public/data/calendarEvents`, eventId);
                     await deleteDoc(eventRef);
                     setModal({ show: true, message: "일정이 삭제되었습니다." });
                     setRefreshKey(k => k + 1);
                  }} className={`${styles.button} !bg-red-500`}>삭제</button>
                </div>
              </div>
            )
          });
    }

    return (
        <div className="p-4">
            <h1 className={styles.title}>마을 일정 관리</h1>
            <div className={styles.card}>
                <button onClick={handleAddEvent} className={`${styles.button} !bg-blue-600 hover:!bg-blue-800 mb-6`}>새 일정 추가하기</button>
                <div className="space-y-3">
                    {events.map(event => (
                        <div key={event.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold">{event.title}</p>
                                <p className="text-sm text-gray-600">{event.date.toDate().toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => handleDeleteEvent(event.id)} className={`${styles.button} !w-auto !py-1 !px-3 !text-base !bg-red-500`}>삭제</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


function ApplicantListScreen() {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplicants = async () => {
            setLoading(true);
            const snapshot = await getDocs(collection(db, `artifacts/${appId}/public/data/applications`));
            const appsByProgram = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!appsByProgram[data.programTitle]) {
                    appsByProgram[data.programTitle] = [];
                }
                appsByProgram[data.programTitle].push(data.formData);
            });
            setApplicants(Object.entries(appsByProgram));
            setLoading(false);
        };
        fetchApplicants();
    }, []);

    return (
        <div className="p-4">
            <h1 className={styles.title}>신청자 목록</h1>
            <div className={styles.card}>
            {loading ? <p>불러오는 중...</p> : (
                applicants.length === 0 
                ? <p>신청자가 없습니다.</p>
                : applicants.map(([programTitle, users]) => (
                    <div key={programTitle} className="mb-6">
                        <h2 className={styles.subtitle}>{programTitle}</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            {users.map((user, index) => (
                                <li key={index}>{user.name} ({user.dob}, {user.phone})</li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
            </div>
        </div>
    )
}

function DashboardSection({ title, onMore, village, collectionName }) {
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
                    <div className={styles.recentPostItem} onClick={onMore}>
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

function PostListScreen({ navigate, collectionName, appState, requestAdmin, canAnyonePost, postType, title, addPostContext, setModal }) {
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
    
    return (
        <div className="p-4">
            <h1 className={styles.title}>{title}</h1>
            {loading ? <p>로딩 중...</p> : (
                posts.length === 0 
                ? <p className="text-center text-gray-500 py-8">등록된 글이 없습니다.</p>
                : posts.map(post => <PostItem key={post.id} post={post} postType={postType} appState={appState} requestAdmin={requestAdmin} collectionName={collectionName} refreshList={fetchPosts} navigate={navigate} setModal={setModal} />)
            )}
        </div>
    );
}

function PostItem({ post, postType, appState, requestAdmin, collectionName, refreshList, navigate, setModal }) {
  const { userId, isAdmin } = appState;
  const isAuthor = userId === post.authorId;
  const [attendeeNames, setAttendeeNames] = useState([]);
  
  useEffect(() => {
    const fetchAttendeeNames = async () => {
        if(postType === 'maeulbung' && post.attendees && post.attendees.length > 0) {
            const names = [];
            for (const attendeeId of post.attendees) {
                const userDocRef = doc(db, `artifacts/${appId}/users/${attendeeId}/profile/main`);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    names.push(userDoc.data().name);
                }
            }
            setAttendeeNames(names);
        }
    }
    fetchAttendeeNames();
  }, [post.attendees, postType]);

  const handleAttend = async () => {
    if (!userId || !post.id) return;
    const postRef = doc(db, `artifacts/${appId}/public/data/${collectionName}/${post.id}`);
    try {
      await updateDoc(postRef, {
        attendees: arrayUnion(userId)
      });
      setModal({ show: true, message: "참석 처리되었습니다!" });
      refreshList(); 
    } catch (error) {
      console.error("Error attending:", error);
      setModal({ show: true, message: "참석 처리에 실패했습니다." });
    }
  };

  const handleDelete = () => {
      const performDelete = async () => {
          const postRef = doc(db, `artifacts/${appId}/public/data/${collectionName}/${post.id}`);
          await deleteDoc(postRef);

          if (post.type === 'maeulbung' || postType === 'maeulbung') {
              const eventsRef = collection(db, `artifacts/${appId}/public/data/calendarEvents`);
              const q = query(eventsRef, where("relatedPostId", "==", post.id));
              const snapshot = await getDocs(q);
              snapshot.forEach(async (eventDoc) => {
                  await deleteDoc(doc(db, `artifacts/${appId}/public/data/calendarEvents`, eventDoc.id));
              });
          }
          refreshList();
          setModal({ show: true, message: "삭제되었습니다." });
      };

      const showConfirmModal = () => {
        setModal({
            show: true,
            component: (
              <div>
                <p className="font-bold text-xl mb-6">정말로 이 글을 삭제하시겠습니까?</p>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => setModal({ show: false })} className={styles.secondaryButton}>취소</button>
                  <button onClick={() => {
                      setModal({ show: false });
                      performDelete();
                  }} className={`${styles.button} !bg-red-500`}>삭제</button>
                </div>
              </div>
            )
          });
      };

      if (isAuthor || isAdmin) {
          showConfirmModal();
      }
  }

  return (
    <div className={styles.card}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{post.title}</h3>
          <p className="text-sm text-gray-500 mb-2">작성자: {post.authorName || '주민'} · {post.createdAt?.toDate().toLocaleDateString()}</p>
        </div>
        {(isAuthor || isAdmin) && (
            <div className="flex gap-2">
                <button onClick={() => navigate('editPost', { post, collectionName, returnScreen: collectionName.replace(/s$/, ''), onPostAdded: refreshList })} className={`${styles.secondaryButton} !w-auto !py-1 !px-3 !text-base`}>수정</button>
                <button onClick={handleDelete} className={`${styles.button} !w-auto !py-1 !px-3 !text-base !bg-red-500`}>삭제</button>
            </div>
        )}
      </div>
      <p className="whitespace-pre-wrap mt-2">{post.content}</p>
      
      {postType === 'program' && <ProgramApplicationForm programId={post.id} programTitle={post.title} appState={appState} setModal={setModal}/>}

      {postType === 'maeulbung' && (
        <div className="mt-4 border-t pt-4">
          <button onClick={handleAttend} className={`${styles.button} w-auto !py-2 !px-4 !text-base !bg-green-600`}>참석하기</button>
          <div className="mt-3">
              <h4 className="font-bold">참석자 ({attendeeNames.length}명)</h4>
              {attendeeNames.length > 0 ? (
                  <p className="text-gray-600">{attendeeNames.join(', ')}</p>
              ) : (
                  <p className="text-gray-500">아직 참석자가 없습니다.</p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramApplicationForm({ programId, programTitle, appState, setModal }) {
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = { name: e.target.name.value, phone: e.target.phone.value, dob: e.target.dob.value };
        if (!formData.name || !formData.phone || !formData.dob) {
            setModal({show: true, message: "모든 정보를 입력해주세요."});
            return;
        }
        const fullCollectionPath = `artifacts/${appId}/public/data/applications`;
        await addDoc(collection(db, fullCollectionPath), {
            userId: appState.userId,
            village: appState.village,
            programId,
            programTitle,
            formData,
            status: 'submitted',
            createdAt: Timestamp.now(),
        });
        setModal({show: true, message: `${programTitle} 프로그램 신청이 완료되었습니다.`});
        e.target.reset();
    };
    return (
        <div className="mt-4 border-t-2 pt-4">
            <h3 className={styles.subtitle} style={{fontSize: '1.25rem'}}>프로그램 신청하기</h3>
            <form onSubmit={handleSubmit}>
                <label className={styles.label}>이름</label>
                <input name="name" type="text" className={styles.input} required />
                <label className={styles.label}>연락처</label>
                <input name="phone" type="tel" className={styles.input} required />
                <label className={styles.label}>생년월일</label>
                <input name="dob" type="date" className={styles.input} required />
                <button type="submit" className={styles.button}>신청서 제출</button>
            </form>
        </div>
    );
}


function NoticesScreen({ navigate, appState, requestAdmin, setModal }) {
    return <PostListScreen
        navigate={navigate}
        collectionName="notices"
        appState={appState}
        requestAdmin={requestAdmin}
        canAnyonePost={false}
        title="이장님 공지"
        addPostContext={{ collectionName: 'notices', postType: 'notice', title: '공지사항 작성', returnScreen: 'notices' }}
        setModal={setModal}
    />;
}

function MaeulbungScreen({ navigate, appState, requestAdmin, setModal }) {
     return <PostListScreen
        navigate={navigate}
        collectionName="maeulbungs"
        appState={appState}
        requestAdmin={requestAdmin}
        canAnyonePost={true}
        postType="maeulbung"
        title="마을벙"
        addPostContext={{ collectionName: 'maeulbungs', postType: 'maeulbung', title: '새로운 마을벙 만들기', returnScreen: 'maeulbung' }}
        setModal={setModal}
    />;
}
function JobsScreen({ navigate, appState, requestAdmin, setModal }) {
     return <PostListScreen
        navigate={navigate}
        collectionName="jobs"
        appState={appState}
        requestAdmin={requestAdmin}
        canAnyonePost={true}
        postType="job"
        title="마을 일자리"
        addPostContext={{ collectionName: 'jobs', postType: 'job', title: '일손 구하기', returnScreen: 'jobs' }}
        setModal={setModal}
    />;
}

function ProgramNewsScreen({ navigate, appState, requestAdmin, setModal }) {
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
        <div className="p-4">
            <h1 className={styles.title}>프로그램 소식</h1>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? `${styles.button} !py-2 !text-lg` : `${styles.secondaryButton} !py-2 !text-lg`}>전체</button>
                {Object.entries(programCategories).map(([key, value]) => (
                    <button key={key} onClick={() => setFilter(key)} className={filter === key ? `${styles.button} !py-2 !text-lg` : `${styles.secondaryButton} !py-2 !text-lg`}>{value}</button>
                ))}
            </div>
            {loading ? <p>로딩 중...</p> : posts.map(post => (<PostItem key={post.id} post={post} postType="program" navigate={navigate} appState={appState} collectionName="programNews" refreshList={() => setKey(k=>k+1)} requestAdmin={requestAdmin} setModal={setModal} />))}
        </div>
    );
}

function AddPostScreen({ navigate, context, appState }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [extraFields, setExtraFields] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCollectionPath = `artifacts/${appId}/public/data/${context.collectionName}`;
        const newPostData = {
            title,
            content,
            village: appState.village,
            authorId: appState.userId,
            authorName: appState.name || '주민',
            createdAt: Timestamp.now(),
            ...extraFields
        };

        if (context.postType === 'maeulbung') {
            newPostData.attendees = [];
        }

        const newPostRef = await addDoc(collection(db, fullCollectionPath), newPostData);

        if (context.postType === 'maeulbung' && extraFields.eventDate) {
            const eventDate = new Date(extraFields.eventDate);
            await addDoc(collection(db, `artifacts/${appId}/public/data/calendarEvents`), {
                title: `[마을벙] ${title}`,
                date: Timestamp.fromDate(eventDate),
                village: appState.village,
                type: 'maeulbung',
                relatedPostId: newPostRef.id,
                createdAt: Timestamp.now(),
            });
        }

        if (context.onPostAdded) {
            context.onPostAdded();
        }
        navigate(context.returnScreen);
    };

    return (
        <div className="p-4">
            <h1 className={styles.title}>{context.title}</h1>
            <div className={styles.card}>
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
        </div>
    );
}

function EditPostScreen({ navigate, context }) {
    const { post, collectionName, returnScreen, onPostAdded } = context;
    const [title, setTitle] = useState(post.title);
    const [content, setContent] = useState(post.content);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const postRef = doc(db, `artifacts/${appId}/public/data/${collectionName}/${post.id}`);
        await updateDoc(postRef, {
            title,
            content
        });
        if (onPostAdded) {
            onPostAdded();
        }
        navigate(returnScreen);
    };
    
    return (
        <div className="p-4">
            <h1 className={styles.title}>글 수정하기</h1>
            <div className={styles.card}>
                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>제목</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} required/>
                    <label className={styles.label}>내용</label>
                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`${styles.input} h-48`} required/>
                    <div className="flex gap-4 mt-4">
                        <button type="button" onClick={() => navigate(returnScreen)} className={styles.secondaryButton}>취소</button>
                        <button type="submit" className={styles.button}>수정 완료</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function BottomNavBar({ activeScreen, navigate, requestAdmin, setModal }) {
  const navItems = [
    { name: "홈", screen: "dashboard", icon: icons.home },
    { name: "글쓰기", screen: "addPost", icon: icons.add, special: true },
    { name: "설정", screen: "settings", icon: icons.settings },
  ];

  const handleAddClick = () => {
    const AddPostChoiceComponent = ({ closeModal }) => {
        return (
            <div>
                 <h2 className={styles.subtitle}>어떤 글을 쓰시겠어요?</h2>
                 <div className="space-y-4">
                     <button className={styles.button} onClick={() => { closeModal(); requestAdmin(() => navigate('addPost', { collectionName: 'notices', postType: 'notice', title: '공지사항 작성', returnScreen: 'notices' }))}}>이장님 공지</button>
                     <button className={styles.button} onClick={() => { closeModal(); navigate('addPost', { collectionName: 'maeulbungs', postType: 'maeulbung', title: '새로운 마을벙 만들기', returnScreen: 'maeulbung' })}}>마을벙</button>
                     <button className={styles.button} onClick={() => { closeModal(); navigate('addPost', { collectionName: 'jobs', postType: 'job', title: '일손 구하기', returnScreen: 'jobs' })}}>마을 일자리</button>
                     <button className={styles.button} onClick={() => { closeModal(); requestAdmin(()=> navigate('addPost', { collectionName: 'programNews', postType: 'program', title: '새 프로그램 소식 작성', returnScreen: 'programs' }))}}>프로그램 소식</button>
                 </div>
            </div>
        )
    }
    setModal({ show: true, component: <AddPostChoiceComponent closeModal={() => setModal({ show: false })} /> });
  }

  return (
    <div className={styles.bottomNav}>
      {navItems.map(item => {
        const isActive = activeScreen === item.screen;
        const clickHandler = item.special ? handleAddClick : () => navigate(item.screen);
        
        if (item.special) {
          return (
             <button key={item.name} onClick={clickHandler} className="bg-[#BB2649] w-16 h-16 rounded-full flex items-center justify-center -mt-8 shadow-lg">
                {item.icon(true)}
            </button>
          )
        }
        
        return (
          <button key={item.name} onClick={clickHandler} className={isActive ? styles.navButtonActive : styles.navButton}>
            {item.icon(isActive)}
            <span className="text-xs">{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}


export default App;
