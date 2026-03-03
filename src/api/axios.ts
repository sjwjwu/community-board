import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore'; // 1. 스토어 임포트 (경로를 본인의 프로젝트에 맞게 확인하세요)

const api = axios.create({
  baseURL: 'https://front-mission.bigs.or.kr',
});

// [핵심] 모든 요청 전에 실행되는 인터셉터
api.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 로그인 시 저장했던 토큰을 가져옴
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    // 토큰이 있는 경우 헤더에 주입
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// [핵심] 모든 응답 직전에 실행되는 인터셉터
api.interceptors.response.use(
  (response) => {
    // 서버 응답이 성공(200번대)이면 그대로 반환
    return response;
  },
  (error) => {
    // 서버가 401(Unauthorized) 에러를 보냈을 경우
    if (error.response && error.response.status === 401) {
      console.error("인증 에러 발생: 토큰이 만료되었거나 유효하지 않습니다.");
      
      if (typeof window !== 'undefined') {
        // 2. 만료된 토큰 삭제 (로컬 스토리지)
        localStorage.removeItem('accessToken');
        
        // 3. [가장 중요] Zustand 스토어 상태 초기화 (사용자 이름 등 UI 정보 삭제)
        // useAuthStore 내부에 logout 함수가 정의되어 있어야 합니다.
        useAuthStore.getState().logout(); 
        
        // 4. 사용자에게 알리고 로그인 페이지로 강제 이동
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;