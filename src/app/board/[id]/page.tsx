'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';

// 🎨 1. 카테고리별 테마 설정 
const CATEGORY_THEMES: { [key: string]: { label: string; color: string; bgColor: string; borderColor: string } } = {
  NOTICE: { label: '공지사항', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100' },
  FREE: { label: '자유', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  QNA: { label: 'Q&A', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
  ETC: { label: '기타', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
};

export default function BoardDetailPage() {
  const { id } = useParams(); 
  const router = useRouter();
  const { user } = useAuthStore() as any; 
  
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const SERVER_URL = 'https://front-mission.bigs.or.kr';

  useEffect(() => {
    setPost(null);
    setIsLoading(true);

    const fetchPost = async () => {
      try {
        const res = await api.get(`/boards/${id}`);
        setPost(res.data);
      } catch (err) {
        alert("글을 불러올 수 없습니다.");
        router.push('/board');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/boards/${id}`);
      alert("삭제되었습니다.");
      router.push('/board');
    } catch (err) {
      alert("삭제 권한이 없거나 오류가 발생했습니다.");
    }
  };

  if (isLoading || !post) {
    return (
      <div className="max-w-4xl mx-auto p-10 bg-white shadow-lg mt-10 rounded-xl border flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🎨 2. 현재 포스트의 테마 결정
  const rawCat = (post.category || post.boardCategory || '').toUpperCase();
  const theme = CATEGORY_THEMES[rawCat] || { label: '일반글', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-100' };

  const getFullImageUrl = (path: string | null | undefined) => {
    if (!path || path === "null" || path === "undefined" || path.trim() === "" || path.endsWith("/null")) return null;
    if (path.startsWith('http')) return path; 
    return `${SERVER_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const displayImageUrl = getFullImageUrl(post.fileUrl || post.imageUrl || post.filePath);

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-2xl mt-10 rounded-3xl border border-gray-100 text-black">
      
      {/* 🏷️ 카테고리 뱃지 (선택된 테마 색상 적용) */}
      <div className="mb-6">
        <span className={`inline-block ${theme.bgColor} ${theme.color} ${theme.borderColor} px-5 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest shadow-sm`}>
          {theme.label}
        </span>
      </div>
      
      {/* 제목 영역 (테마 색상으로 포인트 가능) */}
      <h1 className="text-4xl font-black mb-6 text-slate-900 leading-tight tracking-tight">
        {post.title}
      </h1>
      
      <div className="flex justify-between items-center text-gray-400 mb-10 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            작성자 <strong className="text-slate-800">{post.writerName || '익명'}</strong>
          </span>
          <span className="text-slate-200">|</span>
          <span>{post.createdAt ? post.createdAt.split('T')[0] : '-'}</span>
        </div>
      </div>

      {/* 본문 내용 */}
      <div className="text-slate-800 text-xl leading-relaxed whitespace-pre-wrap mb-12 min-h-[250px] px-2 font-medium">
        {post.content}
      </div>

      {/* 이미지 출력 */}
      {displayImageUrl && (
        <div className="border-2 border-slate-50 rounded-3xl overflow-hidden mb-12 bg-slate-50 shadow-inner group">
          <div className="p-6">
            <img 
              src={displayImageUrl} 
              alt="첨부 이미지" 
              className="max-h-[700px] w-auto mx-auto block rounded-2xl shadow-xl transition-transform duration-500 group-hover:scale-[1.02]"
              onError={(e) => {
                const parent = e.currentTarget.closest('.border-2');
                if (parent instanceof HTMLElement) parent.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* 하단 버튼 영역 */}
      <div className="flex gap-4 border-t border-slate-100 pt-10">
        <button 
          onClick={() => router.push('/board')} 
          className="bg-white border border-slate-200 text-slate-600 px-10 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
        >
          목록으로
        </button>
        
        {(String(user?.userId) === String(post.writerId) || String(user?.id) === String(post.writerId)) && (
          <div className="flex gap-4 ml-auto">
            <button 
              onClick={() => router.push(`/board/${id}/edit`)}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
            >
              수정하기
            </button>
            <button 
              onClick={handleDelete}
              className="bg-rose-50 text-rose-600 border border-rose-100 px-10 py-4 rounded-2xl font-bold hover:bg-rose-100 transition-all active:scale-95"
            >
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}