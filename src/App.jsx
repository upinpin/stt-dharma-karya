import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AdminPanel } from './AdminPanel';
import logoStt from './assets/logo.png';

const SECRET_ADMIN_PATH = "/prajuru-stt-secret-2026";

function HomePublic() {
  const [activeSection, setActiveSection] = useState('beranda');
  const [profil, setProfil] = useState({});
  const [presidium, setPresidium] = useState([]);
  const [berita, setBerita] = useState([]);
  const [galeri, setGaleri] = useState([]);
  
  // State Filter & Detail
  const [selectedBerita, setSelectedBerita] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [fontSizeLarge, setFontSizeLarge] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Jam Realtime WIB (Waktu Indonesia Barat)
  const [currentTimeWIB, setCurrentTimeWIB] = useState('');

  useEffect(() => {
    const updateWIBClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' WIB';
      setCurrentTimeWIB(timeStr);
    };
    updateWIBClock();
    const timer = setInterval(updateWIBClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch murni dari database Firestore (tanpa data buatan/mock)
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [pSnap, prSnap, bSnap, gSnap] = await Promise.all([
          getDocs(collection(db, "koleksi_profil")),
          getDocs(collection(db, "koleksi_presidium")),
          getDocs(collection(db, "koleksi_berita")),
          getDocs(collection(db, "koleksi_galeri"))
        ]);

        if (!pSnap.empty) setProfil(pSnap.docs[0].data());
        setPresidium(prSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setBerita(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setGaleri(gSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Gagal mengambil data dari Firestore:", err);
      }
    };
    loadAll();
  }, []);

  const handleNavClick = (sectionId) => {
    setSelectedBerita(null);
    setActiveSection(sectionId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "Tanggal Belum Diatur";
    try {
      const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
      return date.toLocaleDateString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return "Tanggal Belum Diatur";
    }
  };

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('📋 Tautan lembaran berita disalin!');
  };

  // Filter berita berdasarkan query pencarian
  const filteredBerita = berita.filter(b => 
    b.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isi_berita?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hierarki Presidium Inti
  const ketua = presidium.find(p => p.jabatan?.toLowerCase().includes('ketua') && !p.jabatan?.toLowerCase().includes('wakil')) || presidium[0];
  const pengurusInti3 = presidium.filter(p => {
    const j = p.jabatan ? p.jabatan.toLowerCase() : '';
    return (j.includes('wakil') || j.includes('sekretaris') || j.includes('bendahara')) && p.id !== ketua?.id;
  });
  const anggotaLainnya = presidium.filter(p => p.id !== ketua?.id && !pengurusInti3.some(i => i.id === p.id));

  // Logo Utama
  const displayLogo = (profil.logo_url && profil.logo_url.trim().length > 5) ? profil.logo_url : logoStt;

  // Alokasi Grid Berita Otomatis dari Database
  const leadHeadline = filteredBerita[0] || null;
  const leftTopStory = filteredBerita[1] || null;
  const leftBottomStory = filteredBerita[2] || null;
  const centerBottomStory = filteredBerita[3] || null;
  const restStories = filteredBerita.slice(4);

  return (
    <div className="min-h-screen bg-[#EDE7DF] text-[#1A1817] selection:bg-[#E05A36] selection:text-white px-1 sm:px-3 md:px-6 py-2 sm:py-4">
      
      {/* TOAST NOTIFIKASI */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171513] text-[#FAF8F3] px-4 py-2 rounded shadow-2xl border border-[#FAF8F3] font-ui text-xs font-bold animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* LIGHTBOX MODAL PREVIEW FOTO */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 p-4 flex items-center justify-center cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="max-w-4xl w-full bg-[#FAF8F3] border-2 border-[#1c1917] p-3 sm:p-5 space-y-3 cursor-default shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1c1917] pb-2 text-xs font-ui">
              <span className="font-bold text-[#E05A36] uppercase tracking-wider">
                Dokumentasi Arsip Visual
              </span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="font-bold text-sm px-2 py-0.5 hover:bg-stone-200 rounded cursor-pointer"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="w-full max-h-[72vh] overflow-hidden bg-stone-900 border border-[#1c1917] flex items-center justify-center">
              <img 
                src={previewImage.url} 
                alt={previewImage.title || 'Foto'} 
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
            {previewImage.title && (
              <p className="font-bold font-newspaper text-sm sm:text-base text-[#171513]">
                {previewImage.title}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CONTAINER BROADSHEET UTAMA (PAPERIO KORAN STYLE) */}
      <div className="max-w-7xl mx-auto bg-[#FAF8F3] border-2 border-[#1c1917] shadow-2xl relative overflow-hidden">
        
        {/* 1. TOP METADATA BAR (TANGGAL & JAM REALTIME WIB) */}
        <div className="border-b border-[#1c1917] bg-[#F4F1EA] px-3 sm:px-6 py-2 flex items-center justify-between text-[11px] font-ui font-semibold text-[#5A554E]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="w-5 h-5 rounded-full bg-[#1c1917] p-0.5 flex items-center justify-center overflow-hidden shrink-0">
              <img src={displayLogo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-black text-[#1c1917] tracking-wider uppercase font-masthead">
              STT DHARMA KARYA
            </span>
            <span className="text-[#A8A29E]">•</span>
            <span>📅 {getTodayFormatted()}</span>
            <span className="text-[#A8A29E]">•</span>
            <span className="text-[#E05A36] font-mono font-bold flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E05A36] animate-pulse"></span>
              ⏰ {currentTimeWIB || 'WIB'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden md:inline text-[10px] text-stone-500 font-press uppercase">
              Edisi Resmi Banjar
            </span>
            <div className="flex items-center gap-1 bg-[#FAF8F3] border border-[#1c1917] px-1.5 py-0.5 rounded text-[9px] font-bold">
              <span className="text-stone-500">Font:</span>
              <button 
                onClick={() => setFontSizeLarge(false)}
                className={`px-1 rounded cursor-pointer ${!fontSizeLarge ? 'bg-[#1c1917] text-white' : 'hover:bg-stone-200'}`}
                title="Ukuran Standar"
              >
                A
              </button>
              <button 
                onClick={() => setFontSizeLarge(true)}
                className={`px-1 rounded cursor-pointer ${fontSizeLarge ? 'bg-[#1c1917] text-white' : 'hover:bg-stone-200'}`}
                title="Ukuran Besar"
              >
                A+
              </button>
            </div>
          </div>
        </div>

        {/* 2. GRAND MASTHEAD (PERSIS "BREAKING NEWS PORTAL" PADA GAMBAR ACUAN PAPERIO) */}
        <header className="border-b-2 border-[#1c1917] px-4 sm:px-8 py-5 sm:py-8 bg-[#FAF8F3]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo Kiri di Layar Desktop */}
            <div 
              onClick={() => handleNavClick('beranda')}
              className="hidden md:flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#1c1917] p-1 border-2 border-[#1c1917] shadow-sm flex items-center justify-center overflow-hidden transition group-hover:rotate-6 shrink-0">
                <img src={displayLogo} alt="Logo STT" className="w-full h-full object-cover scale-105" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#78716C] font-ui">
                  Sekaa Truna Truni
                </p>
                <p className="text-xs font-black font-masthead text-[#171513] tracking-wider">
                  SANGGAR BUANA
                </p>
              </div>
            </div>

            {/* Judul Megah di Tengah (Modern Editorial Typography) */}
            <div className="text-center flex-1">
              <h1 
                onClick={() => handleNavClick('beranda')}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black font-newspaper tracking-tight text-[#171513] cursor-pointer hover:opacity-90 transition leading-none select-none uppercase"
              >
                Breaking News Portal
              </h1>
              <p className="text-xs sm:text-sm font-editorial text-stone-600 mt-2 italic tracking-wide">
                Warta Resmi Sekaa Truna Truni Dharma Karya — Sanggar Buana, Bali
              </p>
            </div>

            {/* Tag Redaksi Kanan */}
            <div className="hidden md:flex flex-col items-end text-right text-[11px] font-ui text-[#57524A] border-l border-[#D5CFC2] pl-6 shrink-0 space-y-1">
              <span className="bg-[#E05A36] text-white text-[9px] font-bold font-ui px-2 py-0.5 rounded-full uppercase tracking-wider">
                Terbitan Resmi
              </span>
              <span className="font-bold text-[#171513] uppercase tracking-wider text-[10px]">
                Sanggar Buana Press
              </span>
              <span className="text-[10px] text-[#78716C]">Denpasar, Bali ID</span>
            </div>

          </div>
        </header>

        {/* 3. NEWSPAPER CATEGORY STRIP (DENGAN PEMISAH GARIS VERTIKAL PAPERIO) */}
        <nav className="border-b-2 border-[#1c1917] bg-[#EFECE5] flex items-stretch justify-between font-ui text-xs font-bold uppercase tracking-wider overflow-x-auto nav-scroll">
          <div className="flex items-stretch divide-x divide-[#1c1917] overflow-x-auto nav-scroll w-full md:w-auto">
            <div className="px-3 sm:px-4 py-2.5 bg-[#171513] text-[#FAF8F3] flex items-center gap-1.5 shrink-0 text-[11px] font-bold">
              <span>📰</span>
              <span>KORAN STT ⌵</span>
            </div>
            {[
              { id: 'beranda', label: 'BERITA UTAMA' },
              { id: 'profil', label: 'PROFIL' },
              { id: 'presidium', label: 'PRAJURU' },
              { id: 'kegiatan', label: 'KEGIATAN' },
              { id: 'galeri', label: 'GALERI FOTO' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`px-3.5 sm:px-4 py-2.5 transition duration-150 shrink-0 flex items-center gap-1 cursor-pointer ${
                  activeSection === tab.id && !selectedBerita
                    ? 'bg-[#DDD7CA] text-[#171513] font-black underline decoration-2 underline-offset-4'
                    : 'text-[#44403C] hover:bg-[#E4DFD3] hover:text-[#171513]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Kolom Pencarian Cepat */}
          <div className="hidden md:flex items-center px-3 py-1.5 border-l border-[#1c1917] bg-[#F7F5EF]">
            <span className="text-stone-400 mr-2 text-xs">🔍</span>
            <input 
              type="text" 
              placeholder="Cari berita..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-[#171513] placeholder-stone-500 focus:outline-none w-36 lg:w-44"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs text-stone-500 font-bold ml-1 cursor-pointer">✕</button>
            )}
          </div>
        </nav>

        {/* 4. MAIN CONTENT AREA */}
        <main className={`p-3 sm:p-5 md:p-6 ${fontSizeLarge ? 'text-lg' : 'text-base'}`}>

          {/* DETAIL BERITA (SAAT ARTIKEL DIKLIK) */}
          {selectedBerita ? (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b border-[#1c1917] pb-2 sm:pb-3">
                <button 
                  onClick={() => setSelectedBerita(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171513] hover:text-[#E05A36] transition font-ui cursor-pointer"
                >
                  &larr; Kembali ke Warta
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 border border-[#171513] text-[10px] font-bold font-ui uppercase tracking-wider hover:bg-[#171513] hover:text-white transition cursor-pointer"
                  >
                    🔗 Salin Tautan
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="hidden sm:inline-block px-2.5 py-1 border border-[#171513] text-[10px] font-bold font-ui uppercase tracking-wider hover:bg-[#171513] hover:text-white transition cursor-pointer"
                  >
                    🖨️ Cetak
                  </button>
                </div>
              </div>

              <article className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E05A36] font-ui">
                    <span>{selectedBerita.kategori || 'Warta Kegiatan'}</span>
                    <span>•</span>
                    <span>{selectedBerita.penulis || 'Media STT'}</span>
                    <span>•</span>
                    <span>{formatDate(selectedBerita.created_at)}</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-newspaper text-[#171513] leading-tight">
                    {selectedBerita.judul}
                  </h1>
                </div>

                {selectedBerita.gambar_url && (
                  <div 
                    onClick={() => setPreviewImage({ url: selectedBerita.gambar_url, title: selectedBerita.judul })}
                    className="border border-[#1c1917] p-1 bg-[#FAF8F3] cursor-pointer group"
                  >
                    <div className="w-full max-h-[500px] overflow-hidden bg-stone-100 border border-[#D5CFC2]">
                      <img 
                        src={selectedBerita.gambar_url} 
                        alt={selectedBerita.judul} 
                        className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                      />
                    </div>
                    <p className="text-[11px] font-editorial italic text-stone-500 mt-1 px-1 text-center">
                      Dokumentasi resmi Sekaa Truna Truni Dharma Karya Sanggar Buana.
                    </p>
                  </div>
                )}

                <div className={`text-[#171513] font-editorial leading-relaxed whitespace-pre-line pt-2 dropcap ${fontSizeLarge ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
                  {selectedBerita.isi_berita}
                </div>

                <div className="border-t-2 border-[#1c1917] pt-4 mt-6 flex items-center justify-between text-xs font-ui text-[#57524A]">
                  <span>Penerbit: Redaksi Warta Dharma Karya</span>
                  <button 
                    onClick={() => { setSelectedBerita(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="font-bold text-[#E05A36] hover:underline cursor-pointer"
                  >
                    Tutup & Kembali &uarr;
                  </button>
                </div>
              </article>
            </div>
          ) : (
            <>
              {/* SECTION: BERANDA / KEGIATAN */}
              {(activeSection === 'beranda' || activeSection === 'kegiatan') && (
                <div className="space-y-6">

                  {/* KONDISI SAAT BELUM ADA BERITA SAMA SEKALI DARI DATABASE */}
                  {filteredBerita.length === 0 ? (
                    <div className="border-2 border-[#1c1917] bg-[#F7F5EF] p-8 sm:p-14 text-center my-6 space-y-3 font-editorial">
                      <span className="stamp-seal text-[9px]">LEMBARAN KORAN</span>
                      <h3 className="text-2xl sm:text-3xl font-black font-newspaper text-[#171513] mt-2">
                        Belum Ada Warta Berita yang Diterbitkan
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                        {searchQuery 
                          ? `Tidak ditemukan berita yang cocok dengan kata kunci "${searchQuery}".` 
                          : 'Warta kegiatan dan kabar resmi akan segera diterbitkan oleh pengurus STT Dharma Karya melalui portal admin.'}
                      </p>
                    </div>
                  ) : (
                    /* GRID 3-KOLOM PERSIS ACUAN GAMBAR PAPERIO */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                      
                      {/* ===== KOLOM 1 (KIRI - 3 COLS): ARTIKEL SEKUNDER + RETRO AD ===== */}
                      <div className="lg:col-span-3 space-y-6 lg:border-r lg:border-[#1c1917] lg:pr-5">
                        
                        {/* ARTIKEL KIRI ATAS */}
                        {leftTopStory && (
                          <article 
                            onClick={() => { setSelectedBerita(leftTopStory); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="group cursor-pointer border border-[#1c1917] p-3 bg-[#FAF8F3] newspaper-shadow-hover flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <h3 className="text-base sm:text-lg font-black font-newspaper text-[#171513] group-hover:text-[#E05A36] transition leading-snug">
                                {leftTopStory.judul}
                              </h3>

                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#78716C] font-ui border-b border-[#D5CFC2] pb-1.5">
                                <span>{leftTopStory.kategori || 'Kegiatan'} • {formatDate(leftTopStory.created_at)}</span>
                                <span className="text-[#E05A36] text-xs font-bold">↗</span>
                              </div>

                              {leftTopStory.gambar_url && (
                                <div className="w-full h-36 overflow-hidden border border-[#1c1917] bg-stone-100 my-2">
                                  <img 
                                    src={leftTopStory.gambar_url} 
                                    alt={leftTopStory.judul} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                  />
                                </div>
                              )}

                              <p className="text-stone-700 font-editorial text-xs leading-relaxed line-clamp-3">
                                {leftTopStory.isi_berita}
                              </p>
                            </div>
                          </article>
                        )}

                        {/* ARTIKEL KIRI BAWAH */}
                        {leftBottomStory && (
                          <article 
                            onClick={() => { setSelectedBerita(leftBottomStory); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="group cursor-pointer border border-[#1c1917] p-3 bg-[#FAF8F3] newspaper-shadow-hover"
                          >
                            <h4 className="text-sm sm:text-base font-black font-newspaper text-[#171513] group-hover:text-[#E05A36] transition leading-snug">
                              {leftBottomStory.judul}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#78716C] font-ui border-b border-[#D5CFC2] pb-1 my-1.5">
                              <span>{leftBottomStory.kategori || 'Warta'} • {formatDate(leftBottomStory.created_at)}</span>
                              <span className="text-[#E05A36] text-xs font-bold">↗</span>
                            </div>
                            {leftBottomStory.gambar_url && (
                              <div className="w-full h-32 overflow-hidden border border-[#1c1917] bg-stone-100 my-2">
                                <img src={leftBottomStory.gambar_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <p className="text-stone-700 font-editorial text-xs leading-relaxed line-clamp-2">
                              {leftBottomStory.isi_berita}
                            </p>
                          </article>
                        )}

                        {/* RETRO MAKLUMAT ORGANISASI (PERSIS COMPOSER NEEDED DI GAMBAR) */}
                        <div className="border-2 border-[#1c1917] p-3.5 bg-[#F2EDE2] space-y-2 relative">
                          <div className="border-b border-[#1c1917] pb-1.5 flex items-center justify-between">
                            <span className="font-black text-xs uppercase tracking-wider text-[#1c1917] font-ui flex items-center gap-1">
                              <span>🏛️</span> Maklumat Sanggar Buana
                            </span>
                            <span className="text-[9px] font-bold bg-[#E05A36] text-white px-1.5 py-0.2 rounded font-ui uppercase">
                              Resmi
                            </span>
                          </div>
                          <p className="text-[11px] font-editorial italic text-stone-700">
                            Wadah Kebersamaan & Pelestarian Tradisi:
                          </p>
                          <ul className="text-[10px] font-ui text-stone-800 space-y-1 list-decimal list-inside font-medium">
                            <li>Terbuka bagi seluruh truna-truni banjar</li>
                            <li>Menjunjung nilai Tri Hita Karana & Adat</li>
                            <li>Melatih kesenian tari, tabuh, dan kepemudaan</li>
                            <li>Sekretariat: Wantilan Balai Banjar</li>
                          </ul>
                        </div>

                      </div>

                      {/* ===== KOLOM 2 (TENGAH - 6 COLS): LEAD STORY RAKSASA & FEATURE BAWAH ===== */}
                      <div className="lg:col-span-6 space-y-6">
                        
                        {/* HEADLINE UTAMA RAKSASA (PERSIS CATASTROPHIC ERUPTION DI GAMBAR ACUAN) */}
                        {leadHeadline && (
                          <article 
                            onClick={() => { setSelectedBerita(leadHeadline); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="group cursor-pointer border border-[#1c1917] p-3.5 sm:p-4 bg-[#FAF8F3] newspaper-shadow-hover space-y-3"
                          >
                            <div className="space-y-1">
                              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-black font-newspaper text-[#171513] group-hover:text-[#E05A36] transition leading-tight">
                                {leadHeadline.judul}
                              </h2>

                              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#78716C] font-ui border-b border-[#1c1917] pb-2 pt-1">
                                <span>{leadHeadline.kategori || 'Warta Utama'} • {leadHeadline.penulis || 'Redaksi'} • {formatDate(leadHeadline.created_at)}</span>
                                <span className="text-[#E05A36] text-sm font-bold">↗</span>
                              </div>
                            </div>

                            {leadHeadline.gambar_url && (
                              <div className="border border-[#1c1917] overflow-hidden bg-stone-100">
                                <div className="w-full aspect-[16/10] overflow-hidden">
                                  <img 
                                    src={leadHeadline.gambar_url} 
                                    alt={leadHeadline.judul} 
                                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                                  />
                                </div>
                              </div>
                            )}

                            <div className="text-stone-800 font-editorial text-sm sm:text-base leading-relaxed dropcap">
                              {leadHeadline.isi_berita}
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold font-ui text-[#1c1917] pt-2 border-t border-[#EAE5DB]">
                              <span className="text-[#E05A36] group-hover:underline">
                                Baca Berita Lengkap &rarr;
                              </span>
                              <span className="text-stone-400 font-press text-[10px]">
                                EDISI UTAMA
                              </span>
                            </div>
                          </article>
                        )}

                        {/* FEATURE ARTIKEL TENGAH BAWAH */}
                        {centerBottomStory && (
                          <article 
                            onClick={() => { setSelectedBerita(centerBottomStory); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="group cursor-pointer border border-[#1c1917] p-3.5 bg-[#FAF8F3] newspaper-shadow-hover space-y-3"
                          >
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black font-newspaper text-[#171513] group-hover:text-[#E05A36] transition leading-snug">
                                {centerBottomStory.judul}
                              </h3>
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#78716C] font-ui border-b border-[#D5CFC2] pb-1.5 mt-1">
                                <span>{centerBottomStory.kategori || 'Kegiatan'} • {formatDate(centerBottomStory.created_at)}</span>
                                <span className="text-[#E05A36] font-bold">↗</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                              {centerBottomStory.gambar_url && (
                                <div className="h-44 overflow-hidden border border-[#1c1917] bg-stone-100">
                                  <img src={centerBottomStory.gambar_url} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                              <p className="text-stone-700 font-editorial text-xs leading-relaxed line-clamp-6">
                                {centerBottomStory.isi_berita}
                              </p>
                            </div>
                          </article>
                        )}

                        {/* JIKA ADA BERITA TAMBAHAN LAINNYA */}
                        {restStories.length > 0 && (
                          <div className="pt-2 border-t border-[#1c1917] space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#1c1917] font-ui border-b border-[#1c1917] pb-1">
                              Warta Tambahan Lainnya
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {restStories.map((item) => (
                                <div 
                                  key={item.id}
                                  onClick={() => { setSelectedBerita(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                  className="p-2.5 border border-[#1c1917] bg-[#FAF8F3] group cursor-pointer hover:border-[#E05A36]"
                                >
                                  <h5 className="font-bold font-newspaper text-sm line-clamp-2 group-hover:text-[#E05A36]">
                                    {item.judul}
                                  </h5>
                                  <p className="text-[10px] font-ui text-stone-500 mt-1">
                                    {formatDate(item.created_at)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* ===== KOLOM 3 (KANAN - 3 COLS): POPULAR ARTICLE NOW & RETRO BOX ===== */}
                      <div className="lg:col-span-3 space-y-6 lg:border-l lg:border-[#1c1917] lg:pl-5">
                        
                        {/* POPULAR ARTICLE NOW DENGAN NOMOR BROADSHEET 01, 02, 03 (PERSIS DI GAMBAR) */}
                        <div className="border border-[#1c1917] p-3.5 bg-[#F7F5EF] space-y-3">
                          <div className="flex items-center justify-between border-b border-[#1c1917] pb-2">
                            <h4 className="font-black font-newspaper text-base text-[#1c1917] tracking-tight">
                              Popular Article Now
                            </h4>
                            <span className="bg-[#E05A36] text-white text-[9px] font-bold font-ui px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {berita.length} Berita
                            </span>
                          </div>

                          {berita.length === 0 ? (
                            <p className="text-xs font-editorial italic text-stone-500 py-3 text-center">
                              Belum ada warta terbit.
                            </p>
                          ) : (
                            <div className="divide-y divide-[#D5CFC2]">
                              {berita.slice(0, 5).map((pop, idx) => (
                                <div 
                                  key={pop.id}
                                  onClick={() => { setSelectedBerita(pop); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                  className="py-2.5 group cursor-pointer flex items-start gap-2.5 transition"
                                >
                                  {/* Nomor 01, 02, 03... */}
                                  <span className="text-xl sm:text-2xl font-black font-newspaper text-[#171513] group-hover:text-[#E05A36] leading-none shrink-0 w-7">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  <div className="space-y-0.5">
                                    <h5 className="text-xs font-bold font-newspaper text-[#171513] group-hover:text-[#E05A36] transition leading-snug line-clamp-2">
                                      {pop.judul}
                                    </h5>
                                    <p className="text-[10px] font-ui text-[#78716C]">
                                      {formatDate(pop.created_at)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* RETRO KOTAK MAKLUMAT RESMI PEMUDA */}
                        <div className="border-2 border-[#1c1917] p-3.5 bg-[#F4EDE1] space-y-2.5 relative">
                          <div className="border-b border-[#1c1917] pb-1.5 text-center">
                            <h4 className="text-base font-black font-masthead text-[#1c1917] leading-tight">
                              Seka Truna Truni
                            </h4>
                            <p className="text-[10px] font-press text-[#78716C] uppercase mt-0.5">
                              Sanggar Buana Denpasar
                            </p>
                          </div>

                          <ul className="text-[10px] font-ui text-stone-800 space-y-1 list-decimal list-inside font-medium">
                            <li>Menjaga kesucian adat & tradisi Bali</li>
                            <li>Menggalang gotong royong krama muda</li>
                            <li>Kreativitas seni ogoh-ogoh & tari</li>
                            <li>Wadah musyawarah pemuda banjar</li>
                          </ul>

                          <div className="border-t border-[#1c1917] pt-1.5 text-center">
                            <span className="text-[10px] font-bold text-[#E05A36] font-ui uppercase tracking-wider">
                              "Sagopo Satya, Nangun Dharma Karya"
                            </span>
                          </div>
                        </div>

                        {/* KOTAK KONTAK / SEKRETARIAT */}
                        <div className="border border-dashed border-[#1c1917] p-3 bg-[#FAF8F3] space-y-1.5 text-xs font-ui">
                          <span className="font-bold text-[#1c1917] uppercase tracking-wider text-[10px] block border-b border-[#EAE5DB] pb-1">
                            📍 Sekretariat STT Dharma Karya
                          </span>
                          <p className="text-stone-600 text-[11px] font-editorial leading-relaxed">
                            Banjar Sanggar Buana, Denpasar - Bali.<br />
                            Instagram & TikTok: <b>@sttdharmakarya17</b>
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* SECTION: PROFIL & SEJARAH (SESUAI DENGAN FORMAT AWAL) */}
              {activeSection === 'profil' && (
                <div className="border border-[#1c1917] bg-[#FAF8F3] p-6 sm:p-10 md:p-12 space-y-8 max-w-5xl mx-auto">
                  <div>
                    <span className="text-[#E05A36] font-bold text-xs uppercase tracking-widest font-ui">
                      Tentang Organisasi
                    </span>
                    <h2 className="text-2xl sm:text-4xl font-black font-newspaper text-[#171513] mt-1 mb-2">
                      Sejarah STT Dharma Karya
                    </h2>
                    <div className="w-20 h-1 bg-[#1c1917] mb-6"></div>
                    <p className="text-stone-800 font-editorial leading-relaxed whitespace-pre-line text-sm md:text-base">
                      {profil.sejarah || 'Sejarah belum dikonfigurasi oleh prajuru.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="border border-[#1c1917] bg-[#F8F6F0] p-6 space-y-2.5">
                      <h3 className="font-black text-[#171513] text-xl font-masthead border-b border-[#1c1917] pb-1.5">
                        Visi
                      </h3>
                      <p className="text-xs md:text-sm text-stone-700 font-editorial leading-relaxed whitespace-pre-line">
                        {profil.visi || 'Visi belum diisi.'}
                      </p>
                    </div>

                    <div className="border border-[#1c1917] bg-[#F8F6F0] p-6 space-y-2.5">
                      <h3 className="font-black text-[#171513] text-xl font-masthead border-b border-[#1c1917] pb-1.5">
                        Misi
                      </h3>
                      <p className="text-xs md:text-sm text-stone-700 font-editorial leading-relaxed whitespace-pre-line">
                        {profil.misi || 'Misi belum diisi.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#D5CFC2] flex flex-col md:flex-row items-center gap-8">
                    {/* Logo Bulat di Halaman Profil */}
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-[#1c1917] p-1 border-4 border-[#1c1917] shadow-xl shrink-0 flex items-center justify-center overflow-hidden">
                      <img 
                        src={displayLogo} 
                        alt="Logo STT" 
                        className="w-full h-full object-cover scale-105" 
                        onError={(e) => { e.target.onerror = null; e.target.src = logoStt; }}
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <span className="text-[#E05A36] font-bold text-xs uppercase tracking-widest font-ui">
                        Identitas Visual
                      </span>
                      <h3 className="font-black text-[#171513] text-2xl font-newspaper">
                        Filosofi & Makna Logo
                      </h3>
                      <p className="text-stone-700 font-editorial text-sm leading-relaxed whitespace-pre-line">
                        {profil.makna_logo || 'Makna logo belum diisi.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PRESIDIUM / PRAJURU */}
              {activeSection === 'presidium' && (
                <div className="space-y-8 max-w-5xl mx-auto">
                  <div className="border-b-2 border-[#1c1917] pb-3 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E05A36] font-ui">
                      DEWAN PRAJURU RESMI
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-black font-newspaper text-[#171513] mt-1 mb-1">
                      Struktur Kepengurusan STT
                    </h2>
                    <p className="text-xs font-editorial text-stone-600 italic">
                      Dharma Karya Sanggar Buana — Periode Bakti Aktif
                    </p>
                  </div>

                  {presidium.length === 0 ? (
                    <div className="bg-[#FAF8F3] p-12 text-center text-stone-500 border border-dashed border-[#171513] font-editorial">
                      Data prajuru belum diinputkan oleh pengurus.
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {ketua && (
                        <div className="flex flex-col items-center">
                          <div className="bg-[#FAF8F3] p-3.5 border-2 border-[#171513] text-center w-64 sm:w-72 relative newspaper-shadow-hover">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#171513] text-[#FAF8F3] font-bold text-[9px] font-ui px-3 py-0.5 uppercase tracking-widest border border-[#171513]">
                              Pimpinan Utama
                            </div>
                            <div className="w-full aspect-[4/5] overflow-hidden bg-stone-200 border border-[#171513] mb-2.5 mt-1">
                              <img src={ketua.foto_url} alt={ketua.nama} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-bold font-newspaper text-[#171513] text-base leading-tight">
                              {ketua.nama}
                            </h3>
                            <p className="text-[11px] text-[#E05A36] font-bold font-ui uppercase tracking-wider mt-1 border-t border-[#D5CFC2] pt-1">
                              {ketua.jabatan}
                            </p>
                          </div>
                        </div>
                      )}

                      {pengurusInti3.length > 0 && (
                        <div className="space-y-3">
                          <div className="border-b border-[#1c1917] pb-1 text-center">
                            <span className="text-[10px] font-bold font-ui uppercase tracking-widest text-[#171513]">
                              PENGURUS HARIAN INTI
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {pengurusInti3.map((p) => (
                              <div key={p.id} className="bg-[#FAF8F3] p-3 border border-[#171513] text-center flex flex-col newspaper-shadow-hover">
                                <div className="w-full aspect-[4/5] overflow-hidden bg-stone-200 border border-[#171513] mb-2">
                                  <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" />
                                </div>
                                <h4 className="font-bold font-newspaper text-[#171513] text-sm">
                                  {p.nama}
                                </h4>
                                <p className="text-[10px] text-[#E05A36] font-bold font-ui uppercase tracking-wider mt-1 border-t border-[#EAE5DB] pt-1">
                                  {p.jabatan}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {anggotaLainnya.length > 0 && (
                        <div className="space-y-3 pt-4 border-t-2 border-[#1c1917]">
                          <div className="border-b border-[#1c1917] pb-1 text-center">
                            <span className="text-[10px] font-bold font-ui uppercase tracking-widest text-[#78716C]">
                              KOORDINATOR SEKSI & ANGGOTA PRAJURU
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {anggotaLainnya.map((p) => (
                              <div key={p.id} className="bg-[#FAF8F3] p-2 border border-[#D5CFC2] text-center flex flex-col hover:border-[#171513] transition">
                                <div className="w-full aspect-square overflow-hidden bg-stone-100 border border-[#D5CFC2] mb-1.5">
                                  <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" />
                                </div>
                                <h5 className="font-bold font-newspaper text-[#171513] text-xs truncate">
                                  {p.nama}
                                </h5>
                                <p className="text-[9px] text-stone-600 font-ui font-semibold uppercase mt-0.5 truncate">
                                  {p.jabatan}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: GALERI FOTO */}
              {activeSection === 'galeri' && (
                <div className="space-y-4">
                  <div className="border-b-2 border-[#1c1917] pb-2 flex flex-wrap items-end justify-between gap-1.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E05A36] font-ui">
                        LEMBARAN DOKUMENTASI VISUAL
                      </span>
                      <h2 className="text-2xl sm:text-4xl font-black font-newspaper text-[#171513]">
                        Galeri Arsip Kegiatan
                      </h2>
                    </div>
                    <span className="text-xs font-editorial italic text-stone-500">
                      Klik foto untuk resolusi penuh
                    </span>
                  </div>

                  {galeri.length === 0 ? (
                    <div className="bg-[#FAF8F3] p-12 text-center text-stone-500 border border-dashed border-[#171513] font-editorial">
                      Belum ada foto galeri yang terunggah.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {galeri.map((g, idx) => (
                        <div 
                          key={g.id} 
                          onClick={() => setPreviewImage({ url: g.gambar_url, title: g.judul || 'Dokumentasi' })}
                          className="bg-[#FAF8F3] p-1.5 border border-[#171513] newspaper-shadow-hover transition group cursor-pointer"
                        >
                          <div className="aspect-square overflow-hidden bg-stone-100 border border-[#D5CFC2] relative">
                            <img 
                              src={g.gambar_url} 
                              alt={g.judul || 'Dokumentasi'} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-ui font-bold">
                              🔍 Perbesar
                            </div>
                          </div>
                          <div className="pt-1.5 px-1">
                            <span className="text-[8px] font-press text-[#78716C] uppercase block">
                              ARSIP #{String(idx + 1).padStart(2, '0')}
                            </span>
                            <p className="text-[11px] font-bold font-newspaper text-[#171513] truncate mt-0.5">
                              {g.judul || 'Foto Kegiatan'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </main>

        {/* 5. GIANT NEWSPAPER FOOTER (PERSIS PAPERIO NEWS PADA GAMBAR ACUAN) */}
        <footer className="border-t-2 border-[#1c1917] bg-[#EFECE5] pt-6 sm:pt-10 pb-6 px-4 sm:px-8">
          
          <div className="text-center pb-6 border-b border-[#1c1917]">
            <p className="text-xs text-stone-500 uppercase tracking-widest font-ui mb-1">
              We're Located At
            </p>
            <p className="text-xs font-editorial text-stone-700">
              Banjar Sanggar Buana, Denpasar - Bali, Indonesia • Kontak: (0361) 420-9421
            </p>
            
            {/* Judul Raksasa Surat Kabar di Footer */}
            <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black font-newspaper text-[#171513] tracking-tighter uppercase select-none opacity-90 leading-none mt-4">
              Paperio News
            </h2>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs font-ui text-[#57524A] gap-3">
            <span>© 2026 STT DHARMA KARYA SANGGAR BUANA. ALL RIGHTS RESERVED.</span>
            <div className="flex flex-wrap gap-4 font-bold">
              <span className="hover:text-[#171513] cursor-pointer" onClick={() => handleNavClick('beranda')}>Beranda</span>
              <span>•</span>
              <span className="hover:text-[#171513] cursor-pointer" onClick={() => handleNavClick('profil')}>Profil</span>
              <span>•</span>
              <span className="hover:text-[#171513] cursor-pointer" onClick={() => handleNavClick('presidium')}>Prajuru</span>
              <span>•</span>
              <span className="hover:text-[#171513] cursor-pointer" onClick={() => handleNavClick('galeri')}>Galeri</span>
              <span>•</span>
              <a href="https://www.instagram.com/sttdharmakarya17" target="_blank" rel="noreferrer" className="text-[#E05A36] hover:underline">
                Instagram ↗
              </a>
            </div>
          </div>

        </footer>

      </div>

    </div>
  );
}

// LOGIN ADMIN & DASHBOARD
function AdminLogin({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === 'pengurus@stt.id' && password === 'PrajuruSTT2026!') {
      localStorage.setItem('stt_auth', 'true');
      setIsAuthenticated(true);
      navigate(`${SECRET_ADMIN_PATH}/dashboard`);
    } else {
      alert("Email atau Kata Sandi salah!");
    }
  };

  return (
    <div className="min-h-screen bg-[#EDE7DF] flex items-center justify-center p-4 font-ui">
      <form onSubmit={handleLogin} className="bg-[#FAF8F3] p-6 sm:p-8 md:p-10 border-2 border-[#171513] shadow-2xl max-w-md w-full space-y-5">
        <div className="text-center space-y-2 border-b-2 border-[#171513] pb-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#171513] p-1 border-2 border-[#171513] shadow-md flex items-center justify-center overflow-hidden">
            <img src={logoStt} alt="Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#E05A36] block">
            PORTAL KHUSUS PRAJURU
          </span>
          <h2 className="text-2xl font-black font-newspaper text-[#171513]">
            Portal Prajuru STT
          </h2>
          <p className="text-xs font-editorial text-stone-600">
            Dharma Karya Sanggar Buana
          </p>
        </div>

        <div className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171513] mb-1 font-ui">
              Email Prajuru
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border border-[#171513] bg-[#F7F5EF] p-2.5 text-xs text-[#171513] focus:outline-none" 
              placeholder="pengurus@stt.id" 
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171513] mb-1 font-ui">
              Kata Sandi
            </label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border border-[#171513] bg-[#F7F5EF] p-2.5 text-xs text-[#171513] focus:outline-none" 
              placeholder="••••••••" 
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-[#171513] text-[#FAF8F3] py-3 text-xs font-black uppercase tracking-wider hover:bg-[#E05A36] transition duration-200 border border-[#171513] cursor-pointer"
          >
            Masuk Lembaran Admin &rarr;
          </button>
        </div>

        <div className="text-center pt-2 border-t border-[#D5CFC2]">
          <a href="/" className="text-xs text-stone-500 hover:text-[#171513] underline font-editorial">
            &larr; Kembali ke Warta Publik
          </a>
        </div>
      </form>
    </div>
  );
}

function AdminDashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#EDE7DF] font-ui">
      <nav className="bg-[#FAF8F3] text-[#171513] px-4 sm:px-6 py-3.5 flex justify-between items-center shadow-md border-b-2 border-[#171513]">
        <div className="flex items-center space-x-2.5">
          <span className="font-black font-newspaper text-base sm:text-lg tracking-wide text-[#171513]">
            PANEL PRAJURU STT
          </span>
          <span className="text-[9px] sm:text-[10px] bg-[#171513] text-[#FAF8F3] px-2 py-0.5 border border-[#171513] font-bold uppercase">
            Sanggar Buana
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs text-stone-600 hover:text-[#171513] underline">
            Lihat Portal Warta
          </a>
          <button 
            onClick={() => { localStorage.removeItem('stt_auth'); setIsAuthenticated(false); navigate('/'); }} 
            className="bg-[#E05A36] hover:bg-[#c94928] text-white px-3 sm:px-4 py-1.5 text-xs font-bold transition border border-[#171513] cursor-pointer"
          >
            Keluar (Logout)
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6">
        <AdminPanel />
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('stt_auth') === 'true');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePublic />} />
        <Route path={SECRET_ADMIN_PATH} element={<AdminLogin setIsAuthenticated={setIsAuthenticated} />} />
        <Route 
          path={`${SECRET_ADMIN_PATH}/dashboard`} 
          element={isAuthenticated ? <AdminDashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={SECRET_ADMIN_PATH} replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;