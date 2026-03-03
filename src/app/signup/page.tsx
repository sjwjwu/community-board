'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  // 과제 요구사항: 8자 이상, 숫자, 영문자, 특수문자(!@#$%^&*?) 조합
  // 테스트용 비번 123qwe!@# 가 통과되도록 특수문자 범위를 넓혔습니다.
  const validatePassword = (pw: string) => {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*?])[A-Za-z\d!@#$%^&*?]{8,}$/;
    return regex.test(pw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. 유효성 검사
    if (!validatePassword(formData.password)) {
      setError('비밀번호는 8자 이상, 영문, 숫자, 특수문자(!@#$%^&*?) 조합이어야 합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      // 2. 서버가 요구하는 필드명(name)으로 정확히 매핑
      const requestData = {
        username: formData.userId.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
      };

      console.log("전송 데이터 확인:", requestData);

      // 3. API 호출
      const res = await api.post('/auth/signup', requestData);
      
     // 2. 서버 응답이 오면 무조건 성공 알럿 띄우기
      console.log("서버 응답 성공:", res.data);
      alert('회원가입이 완료되었습니다!');
      router.push('/login');

    } catch (err: any) {
      // 3. 중복 아이디일 경우 서버가 주는 메시지 확인
      const serverData = err.response?.data;
      console.error("서버 응답 에러 상세:", serverData);

      // 에러 객체가 비어있을 경우를 대비한 처리
      if (err.response?.status === 409 || serverData?.message?.includes("already")) {
        setError("이미 사용 중인 아이디입니다.");
      } else {
        setError(serverData?.message || "회원가입 실패 (아이디 중복 혹은 형식 오류)");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-100px)] px-4 py-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl border shadow-sm">
        <h1 className="text-2xl font-bold text-center text-gray-800">회원가입</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">아이디 (이메일)</label>
            <input
              type="email"
              required
              className="w-full mt-1 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="example@email.com"
              value={formData.userId || ''} // Controlled input 에러 방지
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">이름</label>
            <input
              type="text"
              required
              className="w-full mt-1 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="실명을 입력하세요"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호</label>
            <input
              type="password"
              required
              className="w-full mt-1 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="영문, 숫자, 특수문자 포함 8자 이상"
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">비밀번호 확인</label>
            <input
              type="password"
              required
              className="w-full mt-1 p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword || ''}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {error && <p className="text-red-500 text-xs mt-2 font-semibold">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            가입하기
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}