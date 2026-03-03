'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function LoginPage() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loginData = {
        username: userId,
        password: password
      };

      console.log("로그인 시도 중 (URL: /auth/signin):", loginData);

      const res = await api.post('/auth/signin', loginData);
      
      const data = res.data;
      // 토큰 추출
      const token = data.accessToken || data.token || data.data?.accessToken;

      if (token) {
        localStorage.setItem('accessToken', token);

        // 🔥 [수정 포인트] 서버 응답 데이터(data) 전체를 넘겨주되, 
        // 이름 정보가 없을 경우를 대비해 필드 후보군을 명시합니다.
        // 서버에서 이름이 'name' 혹은 'nickname'으로 올 경우 자동으로 매칭됩니다.
        const displayName = data.name || data.nickname || data.username || userId.split('@')[0];
        
        setUser({ 
          ...data, 
          userId: userId, 
          name: displayName
        });

        alert(`${displayName}님, 환영합니다!`);
        router.push('/');
        router.refresh(); // 헤더 상태 갱신을 위해 추가
      } else {
        alert("로그인은 성공했으나 토큰이 없습니다. 서버 응답을 확인하세요.");
      }

    } catch (err: any) {
      const status = err.response?.status;
      const serverData = err.response?.data;

      console.error("로그인 에러 상세:", status, serverData);

      if (status === 404) {
        alert("API 주소를 찾을 수 없습니다. (/auth/signin)");
      } else if (status === 401) {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
      } else {
        alert("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] px-4">
      <div className="w-full max-w-md p-8 bg-white border rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-8 text-black">로그인</h2>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">아이디 (이메일)</label>
            <input
              type="email"
              required
              placeholder="example@email.com"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              required
              placeholder="비밀번호를 입력하세요"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
          >
            로그인
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 font-bold">
          아직 회원이 아니신가요?{' '}
          <Link href="/signup" className="text-blue-600 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}