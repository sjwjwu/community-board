'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/api/axios';

export default function BoardWritePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('FREE'); 
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // 미리보기 상태 추가
  const router = useRouter();

  // 파일 선택 및 미리보기 로직 (수정 페이지와 동일)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      const boardData = { title, content, category };

      // JSON 데이터를 Blob으로 변환하여 'request' 키로 추가
      const jsonBlob = new Blob([JSON.stringify(boardData)], { type: 'application/json' });
      formData.append('request', jsonBlob);
      
      if (file) {
        formData.append('file', file); 
      }

      const res = await api.post('/boards', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200 || res.status === 201) {
        alert('게시글이 성공적으로 등록되었습니다!');
        router.push('/board');
        router.refresh(); 
      }
    } catch (err: any) {
      console.error("서버 응답 에러 상세:", err.response?.data);
      const serverMsg = err.response?.data?.message || "데이터 형식을 확인해주세요.";
      alert(`등록 실패: ${serverMsg}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white shadow-lg mt-10 rounded-xl border text-black">
      <h1 className="text-2xl font-bold mb-6 border-b pb-4">새 게시글 작성</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* 카테고리 선택 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">카테고리</label>
          <select 
            className="border p-3 rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="NOTICE">공지</option>
            <option value="FREE">자유</option>
            <option value="QNA">Q&A</option>
            <option value="ETC">기타</option>
          </select>
        </div>

        {/* 제목 입력 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">제목</label>
          <input
            className="border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 내용 입력 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">내용</label>
          <textarea
            className="border p-3 rounded-lg h-64 text-black focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* 📷 파일 첨부 섹션 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">사진 첨부</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center gap-3 bg-gray-50 relative hover:bg-gray-100 transition-all cursor-pointer">
            {preview ? (
              <img src={preview} alt="미리보기" className="max-h-48 rounded shadow-sm border bg-white" />
            ) : (
              <div className="text-gray-400 text-center py-4">
                <p className="text-sm font-medium">클릭하거나 사진을 드래그하여 업로드</p>
                <p className="text-xs mt-1">PNG, JPG, GIF 지원</p>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          {file && (
            <p className="text-xs text-blue-600 font-medium ml-1">선택된 파일: {file.name}</p>
          )}
        </div>

        {/* 버튼 섹션 */}
        <div className="flex gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="w-24 bg-gray-100 text-gray-600 p-4 rounded-lg font-bold hover:bg-gray-200 transition-all"
          >
            취소
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all"
          >
            등록하기
          </button>
        </div>
      </form>
    </div>
  );
}