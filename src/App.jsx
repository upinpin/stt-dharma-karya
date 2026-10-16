import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { AdminPanel } from './AdminPanel';
import logoStt from './assets/logo.png';

const SECRET_ADMIN_PATH = "/prajuru-stt-secret-2026";

// KONTEN RESMI AWAL UNTUK VISI, MISI, SEJARAH & MAKNA LOGO
const DEFAULT_SEJARAH = "Sekaa Truna Truni (STT) Dharma Karya Banjar Sanggar Buana didirikan atas dasar kebulatan tekad dan semangat persatuan pemuda banjar dalam mengabdi kepada desa adat, menjaga keluhuran yadnya, serta menjadi garda terdepan dalam merawat seni dan kebudayaan Bali secara turun-temurun.\n\nSebagai wadah kepemudaan, STT Dharma Karya senantiasa membina persaudaraan, kepemimpinan, dan gotong royong truna-truni dalam menyukseskan berbagai kegiatan sosial kemasyarakatan, pelestarian seni tabuh, tari tradisional, serta pembuatan karya ogoh-ogoh ramah lingkungan.";

const DEFAULT_VISI = "Mewujudkan generasi muda Sekaa Truna Truni Dharma Karya yang berkarakter satya, berwawasan luas, inovatif, serta menjunjung tinggi persaudaraan, adat, dan kearifan lokal Bali berlandaskan ajaran Tri Hita Karana.";

const DEFAULT_MISI = "1. Melestarikan seni budaya, adat istiadat, dan tradisi luhur Bali secara berkelanjutan.\n2. Menggalang persatuan, kekompakan, dan gotong royong truna-truni dalam setiap kegiatan banjar.\n3. Berpartisipasi aktif dan tulus ikhlas (ngayah) dalam upacara keagamaan dan sosial kemasyarakatan.\n4. Membangun wadah kreativitas positif generasi muda di bidang kesenian, olahraga, dan kepemimpinan.";

const DEFAULT_MAKNA_LOGO = "Lambang resmi Sekaa Truna Truni Dharma Karya Sanggar Buana memadukan simbol Padma dan Tri Murti yang melambangkan kesucian hati, kebulatan tekad, dan kobaran semangat pemuda dalam mengabdi bagi kemajuan banjar. Warna emas melambangkan keluhuran budi pekerti, sedangkan lingkaran melambangkan keutuhan persaudaraan truna-truni yang abadi.";

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

  // Fetch data dari Firestore
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
    if (!dateObj) return "24 Agustus 2026";
    try {
      const date = dateObj.toDate ? dateObj.toDate() : new Date(dateObj);
      return date.toLocaleDateString('id-ID', { 
        timeZone: 'Asia/Jakarta',
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return "24 Agustus 2026";
    }
  };

  const getTodayFormatted = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast('📋 Tautan berita berhasil disalin!');
  };

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

  // Menentukan sumber logo utama
  const displayLogo = (profil.logo_url && profil.logo_url.trim().length > 5) ? profil.logo_url : logoStt;

  // Konten Profil Resmi
  const sejarahContent = profil.sejarah && profil.sejarah.trim().length > 0 ? profil.sejarah : DEFAULT_SEJARAH;
  const visiContent = profil.visi && profil.visi.trim().length > 0 ? profil.visi : DEFAULT_VISI;
  const misiContent = profil.misi && profil.misi.trim().length > 0 ? profil.misi : DEFAULT_MISI;
  const maknaLogoContent = profil.makna_logo && profil.makna_logo.trim().length > 0 ? profil.makna_logo : DEFAULT_MAKNA_LOGO;

  return (
    <div className="min-h-screen bg-[#EDE7DF] text-[#1A1817] selection:bg-[#E05A36] selection:text-white px-1 sm:px-3 md:px-6 py-2 sm:py-4">
      
      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#171513] text-[#FAF8F3] px-4 py-2 rounded shadow-2xl border border-[#FAF8F3] font-ui text-xs font-bold animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* LIGHTBOX MODAL FOTO */}
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
                Dokumentasi Visual
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

      {/* CONTAINER BROADSHEET UTAMA */}
      <div className="max-w-7xl mx-auto bg-[#FAF8F3] border-2 border-[#1c1917] shadow-2xl relative overflow-hidden">
        
        {/* 1. TOP METADATA BAR (TANGGAL & JAM WIB REALTIME) */}
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
              Sanggar Buana, Bali
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

        {/* 2. GRAND NEWSPAPER MASTHEAD (KONTEN ASLI STT DHARMA KARYA) */}
        <header className="border-b-2 border-[#1c1917] px-4 sm:px-8 py-5 sm:py-8 bg-[#FAF8F3]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo Kiri di Desktop */}
            <div 
              onClick={() => handleNavClick('beranda')}
              className="hidden md:flex items-center gap-3.5 cursor-pointer group shrink-0"
            >
              <div className="w-16 h-16 rounded-full bg-[#1c1917] p-1 border-2 border-[#1c1917] shadow-sm flex items-center justify-center overflow-hidden transition group-hover:rotate-6">
                <img src={displayLogo} alt="Logo STT" className="w-full h-full object-cover scale-105" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-[#78716C] font-ui">
                  Sekaa Truna Truni
                </p>
                <p className="text-sm font-black font-masthead text-[#171513] tracking-wider">
                  SANGGAR BUANA
                </p>
              </div>
            </div>

            {/* Judul Utama Megah di Tengah (Konten Asli Sesuai Awal) */}
            <div className="text-center flex-1">
              <div className="border-y border-[#1c1917] py-0.5 mb-1.5 inline-block px-5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#57524A] font-ui">
                  Sanggar Buana / Media Resmi
                </span>
              </div>
              <h1 
                onClick={() => handleNavClick('beranda')}
                className="text-3xl sm:text-5xl md:text-6xl font-black font-newspaper tracking-tight text-[#171513] cursor-pointer hover:opacity-90 transition leading-none py-1 select-none uppercase"
              >
                STT DHARMA KARYA
              </h1>
              <p className="text-xs sm:text-sm font-editorial text-stone-600 mt-1 italic tracking-wide">
                Portal Resmi Sekaa Truna Truni Dharma Karya Sanggar Buana
              </p>
            </div>

            {/* Tag Redaksi Kanan */}
            <div className="hidden md:flex flex-col items-end text-right text-[11px] font-ui text-[#57524A] border-l border-[#D5CFC2] pl-6 shrink-0 space-y-1">
              <span className="bg-[#E05A36] text-white text-[9px] font-bold font-ui px-2 py-0.5 rounded-full uppercase tracking-wider">
                Portal Resmi
              </span>
              <span className="font-bold text-[#171513] uppercase tracking-wider text-[10px]">
                Sanggar Buana Press
              </span>
              <span className="text-[10px] text-[#78716C]">Denpasar, Bali ID</span>
            </div>

          </div>
        </header>

        {/* 3. NEWSPAPER CATEGORY STRIP */}
        <nav className="border-b-2 border-[#1c1917] bg-[#EFECE5] flex items-stretch justify-between font-ui text-xs font-bold uppercase tracking-wider overflow-x-auto nav-scroll">
          <div className="flex items-stretch divide-x divide-[#1c1917] overflow-x-auto nav-scroll w-full md:w-auto">
            <div className="px-3 sm:px-4 py-2.5 bg-[#171513] text-[#FAF8F3] flex items-center gap-1.5 shrink-0 text-[11px] font-bold">
              <span>📰</span>
              <span>WARTA UTAMA</span>
            </div>
            {[
              { id: 'beranda', label: 'BERANDA' },
              { id: 'profil', label: 'PROFIL' },
              { id: 'presidium', label: 'PRESIDIUM' },
              { id: 'kegiatan', label: 'KEGIATAN' },
              { id: 'galeri', label: 'GALERI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`px-4 sm:px-5 py-2.5 transition duration-150 shrink-0 flex items-center gap-1 cursor-pointer ${
                  activeSection === tab.id && !selectedBerita
                    ? 'bg-[#DDD7CA] text-[#171513] font-black underline decoration-2 underline-offset-4'
                    : 'text-[#44403C] hover:bg-[#E4DFD3] hover:text-[#171513]'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Kolom Pencarian */}
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
        <main className={`p-4 sm:p-6 md:p-8 ${fontSizeLarge ? 'text-lg' : 'text-base'}`}>

          {/* DETAIL BERITA (SAAT ARTIKEL DIKLIK) */}
          {selectedBerita ? (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#1c1917] pb-3">
                <button 
                  onClick={() => setSelectedBerita(null)}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#171513] hover:text-[#E05A36] transition font-ui cursor-pointer"
                >
                  &larr; Kembali ke Berita
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

              <article className="border border-[#1c1917] bg-[#FAF8F3] p-6 md:p-10 shadow-sm space-y-6">
                <h1 className="text-2xl md:text-4xl font-extrabold font-newspaper text-[#171513] leading-tight">
                  {selectedBerita.judul}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 font-semibold border-y border-[#1c1917] py-2.5 font-ui">
                  <span>📁 Kegiatan STT</span>
                  <span>|</span>
                  <span>👤 Media dan Informasi</span>
                  <span>|</span>
                  <span>📅 {formatDate(selectedBerita.created_at)}</span>
                </div>

                {selectedBerita.gambar_url && (
                  <div 
                    onClick={() => setPreviewImage({ url: selectedBerita.gambar_url, title: selectedBerita.judul })}
                    className="w-full max-h-[500px] overflow-hidden bg-stone-100 border border-[#1c1917] cursor-pointer group"
                  >
                    <img 
                      src={selectedBerita.gambar_url} 
                      alt={selectedBerita.judul} 
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-500" 
                    />
                  </div>
                )}

                <div className={`text-stone-800 font-editorial leading-relaxed whitespace-pre-line pt-2 dropcap ${fontSizeLarge ? 'text-lg sm:text-xl' : 'text-base md:text-lg'}`}>
                  {selectedBerita.isi_berita}
                </div>
              </article>
            </div>
          ) : (
            <>
              {/* SECTION: BERANDA / KEGIATAN (PERSIS STRUKTUR AWAL DENGAN SENTUHAN KORAN) */}
              {(activeSection === 'beranda' || activeSection === 'kegiatan') && (
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
                  
                  {/* DAFTAR BERITA */}
                  <div className="flex-1 space-y-6">
                    {filteredBerita.length === 0 ? (
                      <div className="border-2 border-[#1c1917] bg-[#F7F5EF] p-8 sm:p-12 text-center text-stone-600 font-editorial">
                        <p className="text-xl font-bold font-newspaper text-[#171513] mb-1">
                          Belum ada berita kegiatan yang diterbitkan.
                        </p>
                        <p className="text-xs sm:text-sm">
                          {searchQuery ? `Tidak ditemukan berita dengan kata kunci "${searchQuery}".` : 'Berita kegiatan resmi akan diterbitkan oleh prajuru melalui panel admin.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                        {filteredBerita.map((item) => (
                          <article 
                            key={item.id}
                            onClick={() => { setSelectedBerita(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                            className="bg-[#FAF8F3] border border-[#1c1917] shadow-sm hover:shadow-lg transition duration-300 overflow-hidden cursor-pointer group flex flex-col justify-between h-full p-4 space-y-3 newspaper-shadow-hover"
                          >
                            <div>
                              {item.gambar_url && (
                                <div className="w-full h-48 md:h-52 overflow-hidden bg-stone-100 mb-3 border border-[#1c1917]">
                                  <img 
                                    src={item.gambar_url} 
                                    alt={item.judul} 
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                                  />
                                </div>
                              )}

                              <h4 className="text-base font-extrabold font-newspaper text-[#171513] group-hover:text-[#E05A36] transition leading-snug mb-2 line-clamp-2">
                                {item.judul}
                              </h4>

                              <div className="flex items-center gap-2 text-[11px] text-stone-600 font-semibold mb-2 font-ui">
                                <span>📁 Kegiatan STT</span>
                                <span>|</span>
                                <span>👤 Media dan Informasi</span>
                              </div>

                              <p className="text-stone-700 font-editorial text-xs leading-relaxed line-clamp-3 mb-3">
                                {item.isi_berita} [...]
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-stone-500 border-t border-[#D5CFC2] pt-2 mt-auto font-ui">
                              <span>📅 {formatDate(item.created_at)}</span>
                              <span className="text-[#E05A36] font-bold group-hover:underline">Baca Selengkapnya &rarr;</span>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SIDEBAR PERSIS FORMAT AWAL */}
                  <aside className="w-full lg:w-80 space-y-6 shrink-0 lg:border-l lg:border-[#1c1917] lg:pl-8">
                    {/* Kotak Cari */}
                    <div className="space-y-2">
                      <div className="flex border border-[#1c1917] bg-[#FAF8F3]">
                        <input 
                          type="text" 
                          placeholder="Search ..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full p-2.5 text-xs text-[#171513] bg-transparent focus:outline-none"
                        />
                        <button className="bg-[#171513] text-[#FAF8F3] px-4 text-xs font-bold hover:bg-[#E05A36] transition cursor-pointer">
                          🔍
                        </button>
                      </div>
                    </div>

                    {/* Postingan Terbaru */}
                    <div className="space-y-3 border border-[#1c1917] p-4 bg-[#F7F5EF]">
                      <h3 className="text-xs font-black font-ui text-[#171513] border-l-4 border-[#171513] pl-2 uppercase tracking-widest">
                        Postingan Terbaru
                      </h3>
                      {berita.length === 0 ? (
                        <p className="text-xs font-editorial italic text-stone-500">Belum ada postingan terbaru.</p>
                      ) : (
                        <ul className="space-y-2 text-xs text-stone-800 font-bold font-newspaper">
                          {berita.slice(0, 5).map((b) => (
                            <li 
                              key={b.id} 
                              onClick={() => { setSelectedBerita(b); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className="hover:text-[#E05A36] cursor-pointer border-b border-[#D5CFC2] pb-1.5 transition line-clamp-2"
                            >
                              📑 {b.judul}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Arsip */}
                    <div className="space-y-3 border border-[#1c1917] p-4 bg-[#F7F5EF]">
                      <h3 className="text-xs font-black font-ui text-[#171513] border-l-4 border-[#171513] pl-2 uppercase tracking-widest">
                        Arsip
                      </h3>
                      <ul className="space-y-2 text-xs text-stone-700 font-semibold font-ui">
                        <li className="flex justify-between items-center hover:text-[#E05A36] cursor-pointer border-b border-[#D5CFC2] pb-1">
                          <span>📅 {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                          <span className="text-stone-500">({berita.length})</span>
                        </li>
                      </ul>
                    </div>
                  </aside>

                </div>
              )}

              {/* SECTION: PROFIL & SEJARAH (PERSIS KONTEN RESMI AWAL DENGAN VISI MISI LENGKAP) */}
              {activeSection === 'profil' && (
                <div className="border border-[#1c1917] bg-[#FAF8F3] p-6 sm:p-10 md:p-12 space-y-8 max-w-5xl mx-auto shadow-sm">
                  <div>
                    <span className="text-[#E05A36] font-bold text-xs uppercase tracking-widest font-ui">
                      Tentang Organisasi
                    </span>
                    <h2 className="text-3xl font-black font-newspaper text-[#171513] mt-1 mb-2">
                      Sejarah STT Dharma Karya
                    </h2>
                    <div className="w-20 h-1.5 bg-[#171513] mb-6"></div>
                    <p className="text-stone-800 font-editorial leading-relaxed whitespace-pre-line text-sm md:text-base dropcap">
                      {sejarahContent}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="border border-[#1c1917] bg-[#F8F6F0] p-6 space-y-2.5">
                      <h3 className="font-black text-[#171513] text-xl font-masthead border-b border-[#1c1917] pb-1.5">
                        Visi
                      </h3>
                      <p className="text-xs md:text-sm text-stone-800 font-editorial leading-relaxed whitespace-pre-line">
                        {visiContent}
                      </p>
                    </div>

                    <div className="border border-[#1c1917] bg-[#F8F6F0] p-6 space-y-2.5">
                      <h3 className="font-black text-[#171513] text-xl font-masthead border-b border-[#1c1917] pb-1.5">
                        Misi
                      </h3>
                      <p className="text-xs md:text-sm text-stone-800 font-editorial leading-relaxed whitespace-pre-line">
                        {misiContent}
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-[#D5CFC2] flex flex-col md:flex-row items-center gap-8">
                    {/* Logo Bulat di Halaman Profil */}
                    <div className="w-40 h-40 rounded-full bg-[#1c1917] p-1.5 border-4 border-[#1c1917] shadow-xl shrink-0 flex items-center justify-center overflow-hidden">
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
                        {maknaLogoContent}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: PRESIDIUM INTI (PERSIS STRUKTUR AWAL) */}
              {activeSection === 'presidium' && (
                <div className="space-y-10 max-w-5xl mx-auto">
                  <div className="border-b-2 border-[#1c1917] pb-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-black font-newspaper text-[#171513] mt-2">
                      Struktur Kepengurusan STT
                    </h2>
                    <p className="text-xs text-stone-600 font-bold uppercase tracking-wider mt-1 font-ui">
                      Dharma Karya Sanggar Buana
                    </p>
                  </div>

                  {presidium.length === 0 ? (
                    <div className="border border-[#1c1917] bg-[#FAF8F3] p-12 text-center text-stone-500 font-editorial">
                      Data prajuru inti belum diinputkan.
                    </div>
                  ) : (
                    <div className="space-y-10">
                      
                      {/* KETUA STT */}
                      {ketua && (
                        <div className="flex flex-col items-center">
                          <div className="bg-[#FAF8F3] p-4 border-2 border-[#171513] shadow-md text-center w-72 relative newspaper-shadow-hover">
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#171513] text-[#FAF8F3] font-black text-[10px] px-4 py-1 uppercase tracking-widest font-ui border border-[#171513]">
                              Pimpinan Utama
                            </div>

                            <div className="w-full aspect-[4/5] overflow-hidden bg-stone-900 border border-[#1c1917] mb-3 mt-1">
                              <img src={ketua.foto_url} alt={ketua.nama} className="w-full h-full object-cover" />
                            </div>

                            <h3 className="font-black text-stone-900 text-lg leading-tight font-newspaper">
                              {ketua.nama}
                            </h3>
                            <p className="text-xs text-[#E05A36] font-black uppercase tracking-wider mt-1.5 bg-[#FAF8F3] border border-[#1c1917] px-3 py-1 font-ui">
                              {ketua.jabatan}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* PENGURUS HARIAN INTI (WAKIL, SEKRETARIS, BENDAHARA) */}
                      {pengurusInti3.length > 0 && (
                        <div className="space-y-4">
                          <div className="text-center">
                            <span className="text-[10px] font-black bg-[#171513] text-[#FAF8F3] px-4 py-1 uppercase tracking-widest font-ui border border-[#1c1917]">
                              Pengurus Harian Inti
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {pengurusInti3.map((p) => (
                              <div key={p.id} className="bg-[#FAF8F3] p-4 border border-[#1c1917] shadow-sm text-center flex flex-col newspaper-shadow-hover">
                                <div className="w-full aspect-[4/5] overflow-hidden bg-stone-900 border border-[#1c1917] mb-3">
                                  <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-extrabold text-stone-900 text-base font-newspaper">
                                  {p.nama}
                                </h3>
                                <p className="text-[11px] text-[#E05A36] font-extrabold uppercase tracking-wider mt-1.5 border border-[#1c1917] px-3 py-1 font-ui">
                                  {p.jabatan}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ANGGOTA / SEKSI */}
                      {anggotaLainnya.length > 0 && (
                        <div className="space-y-4 pt-6 border-t-2 border-[#1c1917]">
                          <div className="text-center">
                            <span className="text-[10px] font-extrabold bg-[#F4F1EA] text-stone-800 px-4 py-1 uppercase tracking-widest font-ui border border-[#1c1917]">
                              Seksi & Anggota Prajuru
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {anggotaLainnya.map((p) => (
                              <div key={p.id} className="bg-[#FAF8F3] p-3 border border-[#D5CFC2] text-center flex flex-col hover:border-[#1c1917] transition">
                                <div className="w-full aspect-square overflow-hidden bg-stone-100 border border-[#D5CFC2] mb-2">
                                  <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-bold text-stone-800 text-sm font-newspaper truncate">
                                  {p.nama}
                                </h3>
                                <p className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider mt-1 font-ui truncate">
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

              {/* SECTION: GALERI (PERSIS FORMAT AWAL) */}
              {activeSection === 'galeri' && (
                <div className="space-y-6">
                  <div className="border-b-2 border-[#1c1917] pb-3">
                    <h2 className="text-2xl sm:text-3xl font-black font-newspaper text-[#171513]">
                      Galeri Foto Kegiatan
                    </h2>
                    <p className="text-xs text-stone-600 mt-1 font-editorial">
                      Kumpulan dokumentasi foto kepemudaan Sanggar Buana
                    </p>
                  </div>

                  {galeri.length === 0 ? (
                    <div className="border border-[#1c1917] bg-[#FAF8F3] p-12 text-center text-stone-500 font-editorial">
                      Belum ada foto galeri terunggah.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {galeri.map((g) => (
                        <div 
                          key={g.id} 
                          onClick={() => setPreviewImage({ url: g.gambar_url, title: g.judul || 'Foto Dokumentasi' })}
                          className="bg-[#FAF8F3] p-2 border border-[#1c1917] shadow-sm overflow-hidden group cursor-pointer newspaper-shadow-hover"
                        >
                          <div className="h-40 overflow-hidden bg-stone-100 border border-[#D5CFC2]">
                            <img 
                              src={g.gambar_url} 
                              alt={g.judul || 'Foto'} 
                              loading="lazy" 
                              decoding="async" 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                            />
                          </div>
                          <p className="text-xs font-bold text-stone-800 text-center truncate px-2 py-2 font-newspaper">
                            {g.judul}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </>
          )}

        </main>

        {/* 5. FOOTER RESMI STT DHARMA KARYA (PERSIS FORMAT & IDENTITAS ASLI) */}
        <footer className="border-t-2 border-[#1c1917] bg-[#EFECE5] py-8 sm:py-10 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1c1917] p-0.5 border-2 border-[#1c1917] shadow flex items-center justify-center overflow-hidden">
                <img 
                  src={displayLogo} 
                  alt="Logo Footer" 
                  className="w-full h-full object-cover" 
                  onError={(e) => { e.target.onerror = null; e.target.src = logoStt; }}
                />
              </div>
              <span className="font-black text-[#171513] text-lg sm:text-xl tracking-wider font-newspaper">
                STT DHARMA KARYA
              </span>
            </div>

            <p className="text-xs sm:text-sm text-stone-700 max-w-md leading-relaxed font-editorial italic">
              Sanggar Buana — Melestarikan Seni, Menjaga Budaya, dan Mempererat Persaudaraan Sekaa Truna Truni.
            </p>

            <div className="w-24 h-0.5 bg-[#1c1917] my-2"></div>

            {/* Media Sosial Asli */}
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://www.instagram.com/sttdharmakarya17?stkn=MTJiZnRqandqcmFzeg=="
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram STT Dharma Karya"
                title="Instagram STT Dharma Karya"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1c1917] rounded text-xs font-bold text-[#171513] hover:bg-[#171513] hover:text-[#FAF8F3] transition font-ui"
              >
                <span>📸 Instagram</span>
              </a>
              <a
                href="https://www.tiktok.com/@sttdharmakarya17?_r=1&_t=ZS-99a0QfPUzwL"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok STT Dharma Karya"
                title="TikTok STT Dharma Karya"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1c1917] rounded text-xs font-bold text-[#171513] hover:bg-[#171513] hover:text-[#FAF8F3] transition font-ui"
              >
                <span>🎵 TikTok</span>
              </a>
            </div>

            <p className="text-[11px] font-bold text-stone-600 tracking-widest uppercase font-ui pt-2">
              © 2026 Media & Informasi STT Dharma Karya
            </p>

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
        <div className="text-center space-y-2 border-b-2 border-[#1c1917] pb-5">
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