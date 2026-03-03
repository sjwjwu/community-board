'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

export default function LandingPage() {
  const { user, logout } = useAuthStore() as any;
  const [isMounted, setIsMounted] = useState(false);

  // Hydration 이슈 방지: 컴포넌트가 마운트된 후에만 렌더링하도록 설정
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    if (logout) {
      logout();
    }
    alert('로그아웃 되었습니다.');
    window.location.replace('/');
  };

  // 서버와 클라이언트의 초기 HTML 불일치 방지
  if (!isMounted) return null;

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* 서비스 타이틀 */}
        <h1 className="text-5xl font-black text-blue-600 tracking-tighter sm:text-6xl">
          BIX
        </h1>
        <p className="text-xl font-medium text-gray-400">
          함께 소통하고 나누는 즐거운 커뮤니티
        </p>

        {user ? (
          // [로그인 후 메인 화면]
          <div className="bg-blue-50/50 p-10 rounded-3xl space-y-8">
            <div className="space-y-2">
              <p className="text-gray-500 text-lg">반가워요!</p>
              <h2 className="text-3xl font-bold text-black">
                <span className="text-blue-600">{user.name}</span>님, 환영합니다.
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link 
                href="/board" 
                className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                게시판 바로가기
              </Link>
              {/* 로그아웃 버튼: 테두리를 없애고 배경색과 호버 효과만 강조 */}
              <button 
                onClick={handleLogout}
                className="px-10 py-4 bg-transparent text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
              >
                로그아웃
              </button>
            </div>
          </div>
        ) : (
          // [로그인 전 메인 화면]
          <div className="bg-gray-50 p-10 rounded-3xl space-y-8">
            <div className="space-y-2">
              <p className="text-gray-500 text-lg">새로운 소식이 기다리고 있어요</p>
              <h2 className="text-2xl font-bold text-gray-800">로그인하고 대화에 참여해보세요</h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link 
                href="/login" 
                className="px-10 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                로그인하기
              </Link>
              <Link 
                href="/signup" 
                className="px-10 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-sm hover:bg-blue-50 transition-all active:scale-95"
              >
                회원가입
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}