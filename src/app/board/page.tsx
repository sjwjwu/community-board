'use client';

import { useEffect, useState, useMemo } from 'react';
import api from '@/api/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const CATEGORY_THEMES: { [key: string]: { label: string; color: string; bgColor: string; borderColor: string } } = {
  NOTICE: { label: '공지', color: 'text-rose-600', bgColor: 'bg-rose-50', borderColor: 'border-rose-100' },
  FREE: { label: '자유', color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-100' },
  QNA: { label: 'Q&A', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-100' },
  ETC: { label: '기타', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-100' },
};

export default function BoardListPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const [currentCategory, setCurrentCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // 🔍 검색어 상태 추가
  const router = useRouter();

  const categories = [
    { label: '전체', value: 'ALL' },
    { label: '공지', value: 'NOTICE' },
    { label: '자유', value: 'FREE' },
    { label: 'Q&A', value: 'QNA' },
    { label: '기타', value: 'ETC' },
  ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      router.push('/login');
    }
  }, [router]);

  const fetchPosts = async (page: number, category: string) => {
    setIsLoading(true);
    try {
      const categoryQuery = category === 'ALL' ? '' : `&category=${category}`;
      const res = await api.get(`/boards?page=${page}&size=10${categoryQuery}`);
      
      let fetchedPosts = res.data.content || [];

      if (category !== 'ALL') {
        fetchedPosts = fetchedPosts.filter((post: any) => post.category === category);
      }

      setPosts(fetchedPosts); 
      setTotalPages(res.data.totalPages || 0);
    } catch (err: any) {
      console.error("목록 로드 실패:", err);
      if (err.response?.status === 401) {
        alert("로그인 세션이 만료되었습니다.");
        localStorage.removeItem('accessToken');
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchPosts(currentPage, currentCategory);
    }
  }, [currentPage, currentCategory]);

  // 🔍 실시간 필터링 로직: 원본 posts는 유지하고 화면에 보일 때만 계산 (메모이제이션)
  const filteredPosts = useMemo(() => {
    if (!searchTerm.trim()) return posts;
    const lowerTerm = searchTerm.toLowerCase();
    return posts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(lowerTerm);
      const writerMatch = (post.writerName || '').toLowerCase().includes(lowerTerm);
      return titleMatch || writerMatch;
    });
  }, [posts, searchTerm]);

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">커뮤니티 게시판</h1>
        <Link href="/board/write" className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-lg font-bold hover:bg-black transition-all shadow-xl active:scale-95">
          글쓰기
        </Link>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-4 mb-6 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setCurrentCategory(cat.value);
              setCurrentPage(0);
              setSearchTerm(''); // 카테고리 이동 시 검색어 초기화
            }}
            className={`pb-4 px-8 whitespace-nowrap transition-all text-lg font-bold ${
              currentCategory === cat.value 
                ? 'border-b-4 border-slate-900 text-slate-900' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 🔍 검색창 영역 추가 */}
      <div className="mb-10 flex justify-end">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="제목 또는 작성자 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-lg font-medium text-slate-900"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-200 text-slate-600 rounded-full hover:bg-slate-300 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 게시글 목록 테이블 */}
      <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/60 mb-10 relative min-h-[500px]">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[4px] flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-900">Loading</span>
            </div>
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-wider">카테고리</th>
              <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-wider">제목</th>
              <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-wider text-center">작성자</th>
              <th className="px-10 py-6 text-sm font-black text-slate-400 uppercase tracking-wider text-right">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-900">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post: any) => {
                const rawCat = (post.category || '').toUpperCase();
                const theme = CATEGORY_THEMES[rawCat] || { 
                  label: '일반', color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-100' 
                };

                return (
                  <tr 
                    key={post.id} 
                    className="hover:bg-slate-50/80 transition-all group cursor-pointer" 
                    onClick={() => router.push(`/board/${post.id}`)}
                  >
                    <td className="px-10 py-7">
                      <span className={`inline-block ${theme.bgColor} ${theme.color} ${theme.borderColor} px-4 py-1.5 rounded-xl text-sm font-black border uppercase tracking-tighter shadow-sm`}>
                        {theme.label}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <Link href={`/board/${post.id}`} className="text-xl font-bold hover:text-blue-600 transition-colors block truncate max-w-md">
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-10 py-7 text-lg font-semibold text-slate-600 text-center">{post.writerName || '익명'}</td>
                    <td className="px-10 py-7 text-slate-400 text-base font-medium text-right">
                      {post.createdAt ? post.createdAt.split('T')[0] : '-'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-10 py-32 text-center text-slate-400 font-bold italic text-lg">
                  {searchTerm ? `'${searchTerm}'에 대한 검색 결과가 없습니다.` : (isLoading ? '' : '등록된 게시글이 없습니다.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-12 h-12 rounded-2xl font-black text-lg transition-all shadow-sm ${
                currentPage === i 
                  ? 'bg-slate-900 text-white shadow-slate-300 scale-110' 
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}