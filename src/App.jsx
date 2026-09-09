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
      } catch (err) { console.error(err); }
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
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return "24 Agustus 2026";
    }
  };

  const filteredBerita = berita.filter(b => 
    b.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.isi_berita.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HIERARKI PRESIDIUM INTI ---
  const ketua = presidium.find(p => p.jabatan.toLowerCase().includes('ketua') && !p.jabatan.toLowerCase().includes('wakil')) || presidium[0];
  const pengurusInti3 = presidium.filter(p => {
    const j = p.jabatan.toLowerCase();
    return (j.includes('wakil') || j.includes('sekretaris') || j.includes('bendahara')) && p.id !== ketua?.id;
  });
  const anggotaLainnya = presidium.filter(p => p.id !== ketua?.id && !pengurusInti3.some(i => i.id === p.id));

  // Menentukan sumber logo utama (jika URL profil error, kembali ke logoStt lokal)
  const displayLogo = (profil.logo_url && profil.logo_url.trim().length > 5) ? profil.logo_url : logoStt;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-stone-800 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* 1. TOP HEADER / BRAND NAVBAR (BERSIH, TERANG & MODERN) */}
      <header className="bg-white/95 backdrop-blur-md border-b-2 border-[#D4AF37]/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => handleNavClick('beranda')}>
            <div className="w-12 h-12 rounded-full bg-[#3D0808] p-0.5 border-2 border-[#D4AF37] shadow-md flex items-center justify-center overflow-hidden transition group-hover:scale-105">
              <img 
                src={displayLogo} 
                alt="Logo STT" 
                className="w-full h-full object-cover scale-110" 
                onError={(e) => { e.target.onerror = null; e.target.src = logoStt; }}
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#5C0A0A] leading-none tracking-wide group-hover:text-[#801010] transition">
                STT DHARMA KARYA
              </h1>
              <p className="text-[11px] font-bold text-[#C59B27] tracking-widest uppercase mt-0.5">
                Sanggar Buana
              </p>
            </div>
          </div>

          <nav className="w-full md:w-auto flex items-center justify-start md:justify-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-600">
            {[
              { id: 'beranda', label: 'BERANDA' },
              { id: 'profil', label: 'PROFIL' },
              { id: 'presidium', label: 'PRESIDIUM INTI' },
              { id: 'kegiatan', label: 'KEGIATAN' },
              { id: 'galeri', label: 'GALERI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleNavClick(tab.id)}
                className={`shrink-0 px-3.5 py-2 rounded-xl transition duration-200 ${
                  activeSection === tab.id && !selectedBerita
                    ? 'bg-[#5C0A0A] text-amber-300 font-extrabold shadow-md border border-[#D4AF37]/40'
                    : 'hover:text-[#5C0A0A] hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* 2. HERO BANNER HEADER */}
      <section className="relative min-h-[280px] md:min-h-[340px] bg-gradient-to-r from-[#3D0505] via-[#5C0A0A] to-[#3D0505] overflow-hidden flex items-center border-b-4 border-[#D4AF37] shadow-lg">

        <div className="relative z-20 max-w-7xl w-full mx-auto px-6 md:px-10 py-12 flex items-center gap-8">
          {/* Logo Hero Bulat Sempurna */}
          <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#2D0404] p-1.5 border-4 border-[#D4AF37] shadow-2xl flex items-center justify-center overflow-hidden flex-shrink-0 hidden sm:flex">
            <img 
              src={displayLogo} 
              alt="Logo STT" 
              className="w-full h-full object-cover scale-105" 
              onError={(e) => { e.target.onerror = null; e.target.src = logoStt; }}
            />
          </div>
          <div className="text-white space-y-2">
            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-200 font-bold mb-3">
              Sanggar Buana / Media Resmi
            </p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-amber-100 max-w-2xl leading-[1.05]">
              Cerita, kegiatan, dan kabar terbaru
            </h2>
            <p className="text-amber-200/90 text-sm md:text-base font-medium max-w-xl mt-4">
              Portal Resmi Sekaa Truna Truni Dharma Karya Sanggar Buana
            </p>
          </div>
        </div>
      </section>

      {/* 3. LAYOUT UTAMA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-5 md:px-8 py-8 md:py-16">

        {selectedBerita ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <button 
              onClick={() => setSelectedBerita(null)}
              className="inline-flex items-center gap-2 bg-[#5C0A0A] text-amber-300 font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-[#3D0505] transition shadow border border-[#D4AF37]/50"
            >
              &larr; Kembali ke Berita
            </button>

            <article className="bg-white rounded-3xl p-6 md:p-10 border border-stone-200/90 shadow-lg space-y-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#5C0A0A] leading-tight">
                {selectedBerita.judul}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-semibold border-y border-stone-100 py-3">
                <span>📁 Kegiatan STT</span>
                <span>|</span>
                <span>👤 Media dan Informasi</span>
                <span>|</span>
                <span>📅 {formatDate(selectedBerita.created_at)}</span>
              </div>

              <div className="w-full max-h-[480px] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img 
                  src={selectedBerita.gambar_url} 
                  alt={selectedBerita.judul} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="text-stone-700 text-base leading-relaxed whitespace-pre-line pt-2">
                {selectedBerita.isi_berita}
              </div>
            </article>
          </div>
        ) : (
          <>
            {/* BERANDA / KEGIATAN */}
            {(activeSection === 'beranda' || activeSection === 'kegiatan') && (
              <div className="flex flex-col lg:flex-row gap-10">
                
                <div className="flex-1 space-y-8">
                  {filteredBerita.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl text-center text-stone-400 border border-dashed border-stone-300 shadow-sm">
                      Belum ada berita kegiatan yang diterbitkan.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {filteredBerita.map((item) => (
                        <article 
                          key={item.id}
                          onClick={() => { setSelectedBerita(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition duration-300 overflow-hidden cursor-pointer group flex flex-col justify-between h-full p-4.5 space-y-3 hover:border-[#D4AF37]"
                        >
                          <div>
                            <div className="w-full h-48 md:h-52 rounded-xl overflow-hidden bg-stone-100 mb-4 border border-stone-200">
                              <img 
                                src={item.gambar_url} 
                                alt={item.judul} 
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                              />
                            </div>

                            <h4 className="text-base font-extrabold text-[#5C0A0A] group-hover:text-[#C59B27] transition leading-snug mb-2 line-clamp-2">
                              {item.judul}
                            </h4>

                            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-semibold mb-2">
                              <span>📁 Kegiatan STT</span>
                              <span>|</span>
                              <span>👤 Media dan Informasi</span>
                            </div>

                            <p className="text-stone-600 text-xs leading-relaxed line-clamp-3 mb-3">
                              {item.isi_berita} [...]
                            </p>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-stone-500 border-t border-stone-100 pt-2.5 mt-auto font-medium">
                            <span>📅 {formatDate(item.created_at)}</span>
                            <span>|</span>
                            <span>💬 Leave a Comment</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                <aside className="w-full lg:w-80 space-y-8 flex-shrink-0 border-l border-[#D9C9B4] pl-0 lg:pl-8">
                  <div className="space-y-2">
                    <div className="flex">
                      <input 
                        type="text" 
                        placeholder="Search ..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-stone-300 p-2.5 rounded-l-xl text-xs focus:outline-none focus:border-[#5C0A0A]"
                      />
                      <button className="bg-[#5C0A0A] text-amber-300 px-4 rounded-r-xl text-xs font-bold hover:bg-[#3D0505] transition border border-[#D4AF37]/50">
                        🔍
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-[#5C0A0A] border-l-4 border-[#D4AF37] pl-2 uppercase tracking-widest">
                      Postingan Terbaru
                    </h3>
                    <ul className="space-y-2.5 text-xs text-stone-700 font-bold">
                      {berita.slice(0, 5).map((b) => (
                        <li 
                          key={b.id} 
                          onClick={() => { setSelectedBerita(b); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="hover:text-[#5C0A0A] cursor-pointer border-b border-stone-100 pb-2 transition line-clamp-2"
                        >
                          📑 {b.judul}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-[#5C0A0A] border-l-4 border-[#D4AF37] pl-2 uppercase tracking-widest">
                      Arsip
                    </h3>
                    <ul className="space-y-2 text-xs text-stone-600 font-semibold">
                      <li className="flex justify-between items-center hover:text-[#5C0A0A] cursor-pointer border-b border-stone-100 pb-1">
                        <span>📅 Agustus 2026</span>
                        <span className="text-stone-400">({berita.length})</span>
                      </li>
                    </ul>
                  </div>
                </aside>

              </div>
            )}

            {/* PROFIL */}
            {activeSection === 'profil' && (
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-md border border-stone-200/90 space-y-8">
                <div>
                  <span className="text-[#C59B27] font-black text-xs uppercase tracking-widest">Tentang Organisasi</span>
                  <h2 className="text-3xl font-black text-[#5C0A0A] mt-1 mb-3">Sejarah STT Dharma Karya</h2>
                  <div className="w-20 h-1.5 bg-[#D4AF37] rounded-full mb-6"></div>
                  <p className="text-stone-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {profil.sejarah || 'Sejarah belum dikonfigurasi oleh prajuru.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border-l-4 border-[#5C0A0A] shadow-sm">
                    <h3 className="font-black text-[#5C0A0A] text-xl mb-3">Visi</h3>
                    <p className="text-xs md:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                      {profil.visi || 'Visi belum diisi.'}
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-6 rounded-2xl border-l-4 border-[#D4AF37] shadow-sm">
                    <h3 className="font-black text-[#B38F24] text-xl mb-3">Misi</h3>
                    <p className="text-xs md:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                      {profil.misi || 'Misi belum diisi.'}
                    </p>
                  </div>
                </div>

                <div className="pt-8 border-t border-stone-200 flex flex-col md:flex-row items-center gap-8">
                  {/* Logo Bulat di Halaman Profil */}
                  <div className="w-44 h-44 rounded-full bg-[#2D0404] p-1.5 border-4 border-[#D4AF37] shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <img 
                      src={displayLogo} 
                      alt="Logo STT" 
                      className="w-full h-full object-cover scale-105" 
                      onError={(e) => { e.target.onerror = null; e.target.src = logoStt; }}
                    />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[#C59B27] font-black text-xs uppercase tracking-widest">Identitas Visual</span>
                    <h3 className="font-black text-stone-900 text-2xl">Filosofi & Makna Logo</h3>
                    <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                      {profil.makna_logo || 'Makna logo belum diisi.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* PRESIDIUM INTI */}
            {activeSection === 'presidium' && (
              <div className="space-y-12 max-w-5xl mx-auto">
                <div className="border-b-2 border-[#D4AF37] pb-4 text-center">
                  <h2 className="text-3xl md:text-4xl font-black text-[#5C0A0A] mt-3">
                    Struktur Kepengurusan STT
                  </h2>
                  <p className="text-xs text-stone-500 font-bold uppercase tracking-wider mt-1">
                    Dharma Karya Sanggar Buana
                  </p>
                </div>

                {presidium.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl text-center text-stone-400 border border-dashed border-stone-300">
                    Data prajuru inti belum diinputkan.
                  </div>
                ) : (
                  <div className="space-y-12">
                    
                    {/* KETUA STT */}
                    {ketua && (
                      <div className="flex flex-col items-center">
                        <div className="bg-white rounded-3xl p-4 border-2 border-[#D4AF37] shadow-xl text-center w-72 relative group hover:scale-105 transition duration-300">
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#5C0A0A] text-[#D4AF37] font-black text-[10px] px-4 py-1 rounded-full border border-[#D4AF37] shadow uppercase tracking-widest z-10">
                            Pimpinan Utama
                          </div>

                          <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-900 border-2 border-[#D4AF37] shadow-md mb-4 relative">
                            <img src={ketua.foto_url} alt={ketua.nama} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          </div>

                          <h3 className="font-black text-stone-900 text-lg leading-tight">{ketua.nama}</h3>
                          <p className="text-xs text-[#2D0404] font-black uppercase tracking-wider mt-1.5 bg-[#D4AF37] px-3 py-1 rounded-xl shadow-sm">
                            {ketua.jabatan}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* WAKIL, SEKRETARIS, BENDAHARA */}
                    {pengurusInti3.length > 0 && (
                      <div className="space-y-4">
                        <div className="text-center">
                          <span className="text-[10px] font-black bg-[#5C0A0A] text-amber-300 px-4 py-1 rounded-full uppercase tracking-widest border border-[#D4AF37]">
                            Pengurus Harian Inti
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {pengurusInti3.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-3xl border-2 border-stone-200/90 shadow-md text-center flex flex-col hover:border-[#D4AF37] hover:shadow-xl transition group">
                              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden bg-stone-900 border border-[#D4AF37] shadow mb-3">
                                <img src={p.foto_url} alt={p.nama} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              </div>
                              <h3 className="font-extrabold text-stone-900 text-base">{p.nama}</h3>
                              <p className="text-[11px] text-[#5C0A0A] font-extrabold uppercase tracking-wider mt-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-[#D4AF37]/40">
                                {p.jabatan}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ANGGOTA */}
                    {anggotaLainnya.length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-stone-200">
                        <div className="text-center">
                          <span className="text-[10px] font-extrabold bg-stone-200 text-stone-700 px-4 py-1 rounded-full uppercase tracking-widest">
                            Seksi & Anggota Prajuru
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {anggotaLainnya.map((p) => (
                            <div key={p.id} className="bg-white p-3 rounded-2xl border border-stone-200 shadow-sm text-center flex flex-col hover:shadow-md transition group">
                              <div className="w-full aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-300 mb-2.5">
                                <img src={p.foto_url} alt={p.nama} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              </div>
                              <h3 className="font-bold text-stone-800 text-sm">{p.nama}</h3>
                              <p className="text-[10px] text-stone-600 font-extrabold uppercase tracking-wider mt-1 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
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

            {/* GALERI */}
            {activeSection === 'galeri' && (
              <div className="space-y-6">
                <div className="border-b border-stone-200 pb-3">
                  <h2 className="text-2xl font-black text-[#5C0A0A]">Galeri Foto Kegiatan</h2>
                  <p className="text-xs text-stone-500 mt-1">Kumpulan dokumentasi foto kepemudaan Sanggar Buana</p>
                </div>

                {galeri.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl text-center text-stone-400 border border-dashed">
                    Belum ada foto galeri terunggah.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {galeri.map((g) => (
                      <div key={g.id} className="bg-white p-2 rounded-2xl border border-stone-200 shadow-sm overflow-hidden group">
                        <div className="h-40 overflow-hidden rounded-xl bg-stone-100">
                          <img src={g.gambar_url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        </div>
                        <p className="text-xs font-bold text-stone-800 text-center truncate px-2 py-2">{g.judul}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>

      {/* FOOTER ADAT ELEGAN */}
      {/* FOOTER ADAT ELEGAN */}
      <footer className="bg-[#2D0404] text-stone-300 py-10 border-t-4 border-[#D4AF37] mt-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5C0A0A] p-0.5 border border-[#D4AF37] shadow flex items-center justify-center overflow-hidden">
              <img 
                src={displayLogo} 
                alt="Logo Footer" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.onerror = null; e.target.src = logoStt; }}
              />
            </div>
            <span className="font-black text-amber-100 text-lg tracking-wider">STT DHARMA KARYA</span>
          </div>

          <p className="text-xs text-amber-200/80 max-w-md leading-relaxed font-medium">
            Sanggar Buana — Melestarikan Seni, Menjaga Budaya, dan Mempererat Persaudaraan Sekaa Truna Truni.
          </p>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-2"></div>

          <p className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">
            © 2026 Media & Informasi STT Dharma Karya
          </p>
        </div>
      </footer>

    </div>
  );
}

// LOGIN ADMIN & ROUTING
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
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 font-sans">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border-t-8 border-[#D4AF37] space-y-5">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#2D0404] p-1 border-2 border-[#D4AF37] shadow-md flex items-center justify-center overflow-hidden">
            <img src={logoStt} alt="Logo" className="w-full h-full object-cover scale-105" />
          </div>
          <h2 className="text-2xl font-black text-[#5C0A0A]">Portal Prajuru STT</h2>
          <p className="text-xs text-stone-500">Dharma Karya Sanggar Buana</p>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Email Prajuru</label>
            <input 
              type="email" value={email} onChange={e => setEmail(e.target.value)} 
              className="w-full border border-stone-300 p-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none text-sm" 
              placeholder="pengurus@stt.id" required 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Kata Sandi</label>
            <input 
              type="password" value={password} onChange={e => setPassword(e.target.value)} 
              className="w-full border border-stone-300 p-3 rounded-xl focus:ring-2 focus:ring-[#D4AF37] focus:outline-none text-sm" 
              placeholder="••••••••" required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-[#5C0A0A] text-amber-300 py-3 rounded-xl font-black hover:bg-[#2D0404] transition shadow-lg text-sm"
          >
            Masuk Panel Admin
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminDashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans">
      <nav className="bg-[#5C0A0A] text-white px-6 py-4 flex justify-between items-center shadow-lg border-b border-[#D4AF37]">
        <div className="flex items-center space-x-3">
          <span className="font-black text-amber-300 text-lg tracking-wide">PANEL PRAJURU STT</span>
          <span className="text-[10px] bg-[#2D0404] text-amber-400 px-2.5 py-0.5 rounded-full border border-[#D4AF37] font-bold uppercase">
            Sanggar Buana
          </span>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('stt_auth'); setIsAuthenticated(false); navigate('/'); }} 
          className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow"
        >
          Logout
        </button>
      </nav>
      <div className="max-w-6xl mx-auto p-6">
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