'use client';

import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image'; 

export default function Navbar() {
  // 1. logout 함수를 직접 가져옵니다. (리액티브 연결 보장)
  const { user, logout } = useAuthStore() as any;
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    // 2. 토큰 먼저 삭제
    localStorage.removeItem('accessToken'); 
    
    // 3. 훅에서 가져온 logout을 실행해야 Navbar가 즉시 바뀝니다.
    logout(); 
    
    alert('로그아웃 되었습니다.');
    
    // 4. 확실하게 UI를 초기화하기 위해 replace를 사용합니다.
    window.location.replace('/'); 
  };

  // 마운트 전에는 레이아웃 깨짐 방지를 위해 빈 바만 렌더링
  if (!isMounted) return <nav className="h-[73px] bg-white border-b sticky top-0 z-50" />;

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50 text-black">
      {/* 왼쪽 로고 영역 */}
      <Link href="/" className="flex items-center group">
        <div className="relative w-16 h-8 md:w-20 md:h-10">
          <Image 
            src="/logo.png"          
            alt="Bix Logo"           
            fill
            className="object-contain"
            priority                 
          />
        </div>
      </Link>
      
      {/* 오른쪽 메뉴 영역 */}
      <div className="flex items-center gap-4">
        {user ? (
          // 로그인한 상태
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 flex items-center">
              <strong className="font-bold text-black text-base">
                {/* 5. LoginPage에서 저장한 필드 후보군을 모두 체크 */}
                {user.name || user.nickname || user.userName || '사용자'}
              </strong>
              {/* 이메일 아이디 표시 (모바일에서는 숨김) */}
              <span className="text-gray-400 ml-1 text-xs hidden md:inline">
                ({user.userId || user.email || user.username})
              </span>
              <span className="ml-1 text-black font-medium">님</span>
            </span>
            <button 
              onClick={handleLogout}
              className="text-xs px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-600 shadow-sm active:scale-95"
            >
              로그아웃
            </button>
          </div>
        ) : (
          // 로그인하지 않은 상태
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors px-2 py-1"
            >
              로그인
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}