'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/api/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function EditPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { logout } = useAuthStore() as any;
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(''); 
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/boards/${id}`);
        const data = res.data;

        setTitle(data.title || '');
        setContent(data.content || '');
        const rawCat = data.category || data.boardCategory || data.categoryName || '';
        setCategory(rawCat.toUpperCase().trim()); 
        
        const imageUrl = data.fileUrl || data.imageUrl || data.imagePath;
        
        const isInvalid = !imageUrl || 
                          imageUrl === "null" || 
                          imageUrl === "undefined" || 
                          imageUrl.trim() === "" || 
                          imageUrl.includes("undefined") || 
                          imageUrl.endsWith("/null");

        if (!isInvalid) {
          const fullUrl = imageUrl.startsWith('http') 
            ? imageUrl 
            : `https://front-mission.bigs.or.kr${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
          setPreview(fullUrl);
          setIsImageDeleted(false);
        } else {
          setPreview(null);
          setIsImageDeleted(true);
        }
        
        setIsLoaded(true);
      } catch (err: any) {
        if (err.response?.status === 401) {
          alert("세션이 만료되었습니다.");
          localStorage.removeItem('accessToken');
          logout();
          window.location.href = '/login';
        } else {
          alert("데이터 로드 실패");
          router.back();
        }
      }
    };
    fetchPost();
  }, [id, router, logout]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile) {
      setFile(selectedFile);
      setIsImageDeleted(false); 
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("첨부된 사진을 삭제하시겠습니까?")) {
      setFile(null);
      setPreview(null);
      setIsImageDeleted(true); 
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // 이미지 삭제
    const updateData = { title, content, category };
    formData.append('request', new Blob([JSON.stringify(updateData)], { type: 'application/json' }));
    
    // [수정]
    if (file) {
      // 1. 새로운 파일을 선택한 경우: 파일 추가
      formData.append('file', file);
    } else if (isImageDeleted) {
      // 2. 이미지를 삭제한 경우: 
      formData.append('file', new Blob([], { type: 'application/octet-stream' }));
    } 
    // 3. 아무것도 건드리지 않은 경우: 기존 이미지 유지 (formData에 파일 필드 없음)

    try {
      await api.patch(`/boards/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("수정 완료!");
      
      // ✅ 캐시 문제를 방지 및 상태 강제 갱신하기 위해 replace 사용
      window.location.replace(`/board/${id}`);
    } catch { 
      alert("수정 실패"); 
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-lg mt-10 rounded-xl border text-black">
      <h1 className="text-2xl font-bold mb-6 border-b pb-4">게시글 수정</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">카테고리</label>
          <select className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="NOTICE">공지</option>
            <option value="FREE">자유</option>
            <option value="QNA">Q&A</option>
            <option value="ETC">기타</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">제목</label>
          <input className="border p-3 rounded-lg text-black" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">내용</label>
          <textarea className="border p-3 rounded-lg h-64 resize-none text-black" value={content} onChange={e => setContent(e.target.value)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">사진 수정</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center gap-3 bg-gray-50 relative min-h-[200px] justify-center hover:bg-gray-100 transition-all">
            
            {!isImageDeleted && preview ? (
              <div className="relative inline-block">
                <img 
                  src={preview} 
                  alt="미리보기" 
                  className="max-h-60 rounded shadow-md border bg-white block" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    setPreview(null);
                    setIsImageDeleted(true);
                  }}
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-all z-20 font-bold border-2 border-white"
                  type="button"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-6 pointer-events-none">
                <p className="text-sm font-medium italic mb-1">이미지가 없습니다.</p>
                <p className="text-xs">새로운 이미지를 업로드하려면 클릭하세요</p>
              </div>
            )}

            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">
            수정 완료
          </button>
          <button type="button" onClick={() => router.back()} className="w-24 bg-gray-100 text-gray-600 p-4 rounded-lg font-bold hover:bg-gray-200 transition-all">
            취소
          </button>
        </div>
      </form>
    </div>
  );
}