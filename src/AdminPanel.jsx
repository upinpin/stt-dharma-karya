import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('profil');
  const IMGBB_API_KEY = "a6288cb176fa0f7196331b5dde463174";

  // --- STATE PROFIL & MAKNA LOGO ---
  const [sejarah, setSejarah] = useState('');
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [maknaLogo, setMaknaLogo] = useState('');
  const [loadingProfil, setLoadingProfil] = useState(false);

  // --- STATE PRESIDIUM INTI (PRAJURU) ---
  const [presidiumList, setPresidiumList] = useState([]);
  const [namaPrajuru, setNamaPrajuru] = useState('');
  const [jabatanPrajuru, setJabatanPrajuru] = useState('');
  const [fotoPrajuru, setFotoPrajuru] = useState(null);
  const [loadingPrajuru, setLoadingPrajuru] = useState(false);
  const [editPrajuru, setEditPrajuru] = useState(null);

  // --- STATE BERITA & KEGIATAN ---
  const [beritaList, setBeritaList] = useState([]);
  const [judulBerita, setJudulBerita] = useState('');
  const [isiBerita, setIsiBerita] = useState('');
  const [gambarBerita, setGambarBerita] = useState(null);
  const [loadingBerita, setLoadingBerita] = useState(false);
  const [editBerita, setEditBerita] = useState(null);

  // --- STATE GALERI FOTO ---
  const [galeriList, setGaleriList] = useState([]);
  const [judulFoto, setJudulFoto] = useState('');
  const [gambarGaleri, setGambarGaleri] = useState(null);
  const [loadingGaleri, setLoadingGaleri] = useState(false);
  const [editGaleri, setEditGaleri] = useState(null);

  // --- STATE ABSENSI & EKSPOR ---
  const [namaAnggotaBaru, setNamaAnggotaBaru] = useState('');
  const [namaAcara, setNamaAcara] = useState('');
  const [tanggalAcara, setTanggalAcara] = useState(new Date().toISOString().split('T')[0]);
  const [dataKehadiran, setDataKehadiran] = useState([]);
  const [absensiList, setAbsensiList] = useState([]);
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loadingAbsen, setLoadingAbsen] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);
  const [tglMulai, setTglMulai] = useState('');
  const [tglSelesai, setTglSelesai] = useState('');

  // Fetch Semua Data dari Firestore
  const fetchAllData = async () => {
    try {
      const [pSnap, prSnap, bSnap, gSnap, aSnap, abSnap] = await Promise.all([
        getDocs(collection(db, "koleksi_profil")),
        getDocs(collection(db, "koleksi_presidium")),
        getDocs(collection(db, "koleksi_berita")),
        getDocs(collection(db, "koleksi_galeri")),
        getDocs(collection(db, "koleksi_anggota")),
        getDocs(collection(db, "koleksi_absensi"))
      ]);

      if (!pSnap.empty) {
        const d = pSnap.docs[0].data();
        setSejarah(d.sejarah || '');
        setVisi(d.visi || '');
        setMisi(d.misi || '');
        setLogoUrl(d.logo_url || '');
        setMaknaLogo(d.makna_logo || '');
      }
      
      setPresidiumList(prSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBeritaList(bSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setGaleriList(gSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const listA = aSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setDataKehadiran(listA.map(a => ({ id: a.id, nama: a.nama, status: 'Hadir' })));
      setAbsensiList(abSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAllData(); }, []);

  // --- HELPER UPLOAD IMGBB ---
  const uploadImageToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
    const data = await res.json();
    return data.data.url;
  };

  // --- 1. SIMPAN PROFIL & LOGO ---
  const handleSaveProfil = async (e) => {
    e.preventDefault();
    setLoadingProfil(true);
    try {
      await setDoc(doc(db, "koleksi_profil", "info_stt"), {
        sejarah, visi, misi, logo_url: logoUrl, makna_logo: maknaLogo, updated_at: new Date()
      });
      alert("Profil, Visi-Misi, dan Makna Logo berhasil disimpan!");
    } catch (err) { console.error(err); } finally { setLoadingProfil(false); }
  };

  // --- 2. PRESIDIUM INTI ---
  const handleAddPresidium = async (e) => {
    e.preventDefault();
    if (!fotoPrajuru) return alert("Pilih foto prajuru!");
    setLoadingPrajuru(true);
    try {
      const url = await uploadImageToImgBB(fotoPrajuru);
      await addDoc(collection(db, "koleksi_presidium"), {
        nama: namaPrajuru, jabatan: jabatanPrajuru, foto_url: url, created_at: new Date()
      });
      setNamaPrajuru(''); setJabatanPrajuru(''); setFotoPrajuru(null);
      fetchAllData();
      alert("Prajuru berhasil ditambahkan!");
    } catch (err) { console.error(err); } finally { setLoadingPrajuru(false); }
  };

  const handleUpdatePresidium = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "koleksi_presidium", editPrajuru.id), {
        nama: editPrajuru.nama,
        jabatan: editPrajuru.jabatan,
        foto_url: editPrajuru.foto_url
      });
      setEditPrajuru(null);
      fetchAllData();
      alert("Data Prajuru berhasil diperbarui!");
    } catch (err) { console.error(err); }
  };

  const handleDeletePresidium = async (id) => {
    if (!confirm("Hapus prajuru ini?")) return;
    await deleteDoc(doc(db, "koleksi_presidium", id));
    fetchAllData();
  };

  // --- 3. BERITA / KEGIATAN ---
  const handleCreateBerita = async (e) => {
    e.preventDefault();
    if (!gambarBerita) return alert("Pilih foto kegiatan!");
    setLoadingBerita(true);
    try {
      const url = await uploadImageToImgBB(gambarBerita);
      await addDoc(collection(db, "koleksi_berita"), {
        judul: judulBerita, isi_berita: isiBerita, gambar_url: url, created_at: new Date()
      });
      setJudulBerita(''); setIsiBerita(''); setGambarBerita(null);
      fetchAllData();
      alert("Berita kegiatan diterbitkan!");
    } catch (err) { console.error(err); } finally { setLoadingBerita(false); }
  };

  const handleUpdateBerita = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "koleksi_berita", editBerita.id), {
        judul: editBerita.judul,
        isi_berita: editBerita.isi_berita,
        gambar_url: editBerita.gambar_url
      });
      setEditBerita(null);
      fetchAllData();
      alert("Berita kegiatan berhasil diperbarui!");
    } catch (err) { console.error(err); }
  };

  const handleDeleteBerita = async (id) => {
    if (!confirm("Hapus berita kegiatan ini?")) return;
    await deleteDoc(doc(db, "koleksi_berita", id));
    fetchAllData();
  };

  // --- 4. GALERI FOTO ---
  const handleAddGaleri = async (e) => {
    e.preventDefault();
    if (!gambarGaleri) return alert("Pilih foto untuk galeri!");
    setLoadingGaleri(true);
    try {
      const url = await uploadImageToImgBB(gambarGaleri);
      await addDoc(collection(db, "koleksi_galeri"), {
        judul: judulFoto, gambar_url: url, created_at: new Date()
      });
      setJudulFoto(''); setGambarGaleri(null);
      fetchAllData();
      alert("Foto ditambahkan ke galeri!");
    } catch (err) { console.error(err); } finally { setLoadingGaleri(false); }
  };

  const handleUpdateGaleri = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "koleksi_galeri", editGaleri.id), {
        judul: editGaleri.judul,
        gambar_url: editGaleri.gambar_url
      });
      setEditGaleri(null);
      fetchAllData();
      alert("Foto galeri berhasil diperbarui!");
    } catch (err) { console.error(err); }
  };

  const handleDeleteGaleri = async (id) => {
    if (!confirm("Hapus foto galeri ini?")) return;
    await deleteDoc(doc(db, "koleksi_galeri", id));
    fetchAllData();
  };

  // --- 5. ABSENSI & EKSPOR ---
  const handleTambahAnggotaMaster = async (e) => {
    e.preventDefault();
    if (!namaAnggotaBaru.trim()) return;
    await addDoc(collection(db, "koleksi_anggota"), { nama: namaAnggotaBaru.trim() });
    setNamaAnggotaBaru('');
    fetchAllData();
  };

  const handleDeleteAnggota = async (id, nama) => {
    if (!confirm(`Hapus anggota "${nama}" dari database master?`)) return;
    try {
      await deleteDoc(doc(db, "koleksi_anggota", id));
      fetchAllData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus anggota!");
    }
  };

  const handleSimpanAbsen = async (e) => {
    e.preventDefault();
    if (!namaAcara) return alert("Isi nama acara!");
    setLoadingAbsen(true);
    try {
      await addDoc(collection(db, "koleksi_absensi"), {
        nama_acara: namaAcara, 
        tanggal: tanggalAcara, 
        rekap_kehadiran: dataKehadiran, 
        created_at: new Date()
      });
      alert("Absensi berhasil disimpan!");
      setNamaAcara('');
      fetchAllData(); // Refresh list riwayat absensi
    } catch (err) { console.error(err); } finally { setLoadingAbsen(false); }
  };

  // Update Status Kehadiran Secara Realtime (Edit Absensi Susulan)
  const handleUpdateStatusAbsen = async (rekapId, anggotaId, newStatus) => {
    const target = absensiList.find(a => a.id === rekapId);
    if (!target) return;
    
    const updatedKehadiran = target.rekap_kehadiran.map(k =>
      k.id === anggotaId ? { ...k, status: newStatus } : k
    );

    try {
      await updateDoc(doc(db, "koleksi_absensi", rekapId), {
        rekap_kehadiran: updatedKehadiran
      });
      fetchAllData(); // Memuat ulang data secara live
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui status kehadiran!");
    }
  };

  const handleClearAllAbsensi = async () => {
    if (absensiList.length === 0) return alert("Belum ada riwayat absensi untuk dibersihkan.");
    if (!confirm("Hapus semua riwayat absensi? Data yang sudah dihapus tidak dapat dikembalikan.")) return;

    setLoadingRiwayat(true);
    try {
      await Promise.all(absensiList.map(item => deleteDoc(doc(db, "koleksi_absensi", item.id))));
      setAbsensiList([]);
      alert("Semua riwayat absensi berhasil dibersihkan.");
    } catch (err) {
      console.error(err);
      alert("Gagal membersihkan riwayat absensi!");
    } finally {
      setLoadingRiwayat(false);
    }
  };

  const getFilteredAbsensiData = async () => {
    if (!tglMulai || !tglSelesai) { alert("Pilih rentang tanggal!"); return null; }
    const snap = await getDocs(collection(db, "koleksi_absensi"));
    const filtered = snap.docs.map(d => d.data()).filter(item => item.tanggal >= tglMulai && item.tanggal <= tglSelesai);
    if (filtered.length === 0) { alert("Data tidak ditemukan pada periode ini."); return null; }
    return filtered;
  };

  const handleEksporExcel = async () => {
    const data = await getFilteredAbsensiData();
    if (!data) return;
    let csvString = "No;Tanggal;Nama Agenda / Acara;Nama Anggota;Status Kehadiran\n";
    let no = 1;
    data.forEach(row => {
      row.rekap_kehadiran.forEach(k => {
        csvString += `${no};${row.tanggal};"${row.nama_acara}";"${k.nama}";${k.status}\n`;
        no++;
      });
    });
    const blob = new Blob(["\ufeff" + csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `Rekap_Absensi_STT_${tglMulai}_sd_${tglSelesai}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEksporPDF = async () => {
    const data = await getFilteredAbsensiData();
    if (!data) return;
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const autoTable = autoTableModule.default;
      const doc = new jsPDF();
      doc.setFontSize(14);
      doc.text("LAPORAN REKAP ABSENSI STT DHARMA KARYA SANGGAR BUANA", 14, 15);
      doc.setFontSize(10);
      doc.text(`Periode: ${tglMulai} s/d ${tglSelesai}`, 14, 22);

      const tableRows = [];
      let no = 1;
      data.forEach(row => {
        row.rekap_kehadiran.forEach(k => {
          tableRows.push([no, row.tanggal, row.nama_acara, k.nama, k.status]);
          no++;
        });
      });

      autoTable(doc, {
        startY: 28,
        head: [['No', 'Tanggal', 'Nama Agenda / Acara', 'Nama Anggota', 'Status']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [120, 28, 28], textColor: [255, 215, 0], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 }
      });

      doc.save(`Laporan_Absensi_STT_${tglMulai}_sd_${tglSelesai}.pdf`);
    } catch (err) { alert("Gagal PDF: " + err.message); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden font-sans relative">
      {/* Header Tab Admin */}
      <div className="flex border-b bg-stone-100 overflow-x-auto text-xs font-bold uppercase tracking-wider">
        <button onClick={() => setActiveTab('profil')} className={`min-w-max flex-1 py-4 px-3 ${activeTab === 'profil' ? 'bg-white text-red-900 border-b-4 border-amber-500 shadow-sm' : 'text-stone-500'}`}>
          1. Edit Profil & Logo
        </button>
        <button onClick={() => setActiveTab('presidium')} className={`min-w-max flex-1 py-4 px-3 ${activeTab === 'presidium' ? 'bg-white text-red-900 border-b-4 border-amber-500 shadow-sm' : 'text-stone-500'}`}>
          2. Presidium Inti
        </button>
        <button onClick={() => setActiveTab('berita')} className={`min-w-max flex-1 py-4 px-3 ${activeTab === 'berita' ? 'bg-white text-red-900 border-b-4 border-amber-500 shadow-sm' : 'text-stone-500'}`}>
          3. Berita & Kegiatan
        </button>
        <button onClick={() => setActiveTab('galeri')} className={`min-w-max flex-1 py-4 px-3 ${activeTab === 'galeri' ? 'bg-white text-red-900 border-b-4 border-amber-500 shadow-sm' : 'text-stone-500'}`}>
          4. Galeri
        </button>
        <button onClick={() => setActiveTab('absensi')} className={`min-w-max flex-1 py-4 px-3 ${activeTab === 'absensi' ? 'bg-white text-red-900 border-b-4 border-amber-500 shadow-sm' : 'text-stone-500'}`}>
          5. Absensi Ngayah
        </button>
        <button onClick={() => setActiveTab('ekspor')} className={`min-w-max flex-1 py-4 px-3 ${activeTab === 'ekspor' ? 'bg-white text-red-900 border-b-4 border-amber-500 shadow-sm' : 'text-stone-500'}`}>
          6. Ekspor Rekap
        </button>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* TAB 1: PROFIL & LOGO */}
        {activeTab === 'profil' && (
          <form onSubmit={handleSaveProfil} className="space-y-4">
            <h3 className="text-xl font-extrabold text-stone-900 mb-2">Edit Sejarah, Visi-Misi & Makna Logo</h3>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">URL Logo STT (Link ImgBB/Gambar)</label>
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://i.ibb.co/..." className="w-full border p-3 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Sejarah STT</label>
              <textarea value={sejarah} onChange={e => setSejarah(e.target.value)} className="w-full border p-3 rounded-xl h-28 text-sm" placeholder="Tuliskan sejarah berdirinya STT..." required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Visi STT</label>
                <textarea value={visi} onChange={e => setVisi(e.target.value)} className="w-full border p-3 rounded-xl h-24 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Misi STT</label>
                <textarea value={misi} onChange={e => setMisi(e.target.value)} className="w-full border p-3 rounded-xl h-24 text-sm" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Makna Logo STT</label>
              <textarea value={maknaLogo} onChange={e => setMaknaLogo(e.target.value)} className="w-full border p-3 rounded-xl h-28 text-sm" placeholder="Jelaskan filosofi & makna logo..." required />
            </div>
            <button type="submit" disabled={loadingProfil} className="w-full bg-red-950 text-amber-300 py-3.5 rounded-xl font-bold shadow hover:bg-red-900">
              {loadingProfil ? "Menyimpan..." : "Simpan Profil & Makna Logo"}
            </button>
          </form>
        )}

        {/* TAB 2: PRESIDIUM INTI */}
        {activeTab === 'presidium' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-stone-900">Kelola Presidium Inti (Prajuru)</h3>
            <form onSubmit={handleAddPresidium} className="space-y-4 bg-stone-50 p-5 rounded-2xl border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="Nama Lengkap Prajuru" value={namaPrajuru} onChange={e => setNamaPrajuru(e.target.value)} className="border p-3 rounded-xl text-sm" required />
                <input type="text" placeholder="Jabatan (Contoh: Ketua / Sekretaris)" value={jabatanPrajuru} onChange={e => setJabatanPrajuru(e.target.value)} className="border p-3 rounded-xl text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Foto Prajuru</label>
                <input type="file" accept="image/*" onChange={e => setFotoPrajuru(e.target.files[0])} className="w-full text-sm" required />
              </div>
              <button type="submit" disabled={loadingPrajuru} className="w-full bg-amber-800 text-white py-3 rounded-xl font-bold shadow">
                {loadingPrajuru ? "Mengunggah..." : "+ Tambah Prajuru Inti"}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presidiumList.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-xl border text-center relative shadow-sm">
                  <img src={item.foto_url} alt="" loading="lazy" decoding="async" className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-amber-400 mb-2" />
                  <h5 className="font-bold text-sm text-stone-900">{item.nama}</h5>
                  <p className="text-xs text-amber-800 font-semibold">{item.jabatan}</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <button onClick={() => setEditPrajuru(item)} className="text-xs bg-amber-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDeletePresidium(item.id)} className="text-xs bg-red-700 text-white px-3 py-1 rounded">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BERITA & KEGIATAN */}
        {activeTab === 'berita' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-stone-900">Posting Berita Kegiatan STT</h3>
            <form onSubmit={handleCreateBerita} className="space-y-4">
              <input type="text" placeholder="Judul Kegiatan" value={judulBerita} onChange={e => setJudulBerita(e.target.value)} className="w-full border p-3 rounded-xl text-sm" required />
              <textarea placeholder="Isi berita kegiatan..." value={isiBerita} onChange={e => setIsiBerita(e.target.value)} className="w-full border p-3 rounded-xl h-28 text-sm" required />
              <input type="file" accept="image/*" onChange={e => setGambarBerita(e.target.files[0])} className="w-full text-sm" required />
              <button type="submit" disabled={loadingBerita} className="w-full bg-red-950 text-amber-300 py-3 rounded-xl font-bold shadow">
                {loadingBerita ? "Mengunggah..." : "Terbitkan Berita Kegiatan"}
              </button>
            </form>

            <div className="space-y-2">
              {beritaList.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-stone-50 rounded-xl border text-sm">
                  <div className="flex items-center space-x-3">
                    <img src={item.gambar_url} alt="" loading="lazy" decoding="async" className="w-12 h-12 object-cover rounded-lg border" />
                    <span className="font-bold text-stone-800">{item.judul}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => setEditBerita(item)} className="bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg">Edit</button>
                    <button onClick={() => handleDeleteBerita(item.id)} className="bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GALERI FOTO */}
        {activeTab === 'galeri' && (
          <div className="space-y-6">
            <h3 className="text-xl font-extrabold text-stone-900">Upload Foto Galeri STT</h3>
            <form onSubmit={handleAddGaleri} className="space-y-4 bg-stone-50 p-5 rounded-2xl border">
              <input type="text" placeholder="Judul / Keterangan Foto" value={judulFoto} onChange={e => setJudulFoto(e.target.value)} className="w-full border p-3 rounded-xl text-sm" required />
              <input type="file" accept="image/*" onChange={e => setGambarGaleri(e.target.files[0])} className="w-full text-sm" required />
              <button type="submit" disabled={loadingGaleri} className="w-full bg-amber-800 text-white py-3 rounded-xl font-bold shadow">
                {loadingGaleri ? "Mengunggah..." : "+ Upload ke Galeri"}
              </button>
            </form>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galeriList.map(item => (
                <div key={item.id} className="bg-white p-2 rounded-xl border text-center shadow-sm">
                  <img src={item.gambar_url} alt="" loading="lazy" decoding="async" className="w-full h-28 object-cover rounded-lg mb-2" />
                  <p className="text-xs font-bold text-stone-800 truncate mb-1">{item.judul}</p>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => setEditGaleri(item)} className="text-xs bg-amber-500 text-white px-3 py-1 rounded">Edit</button>
                    <button onClick={() => handleDeleteGaleri(item.id)} className="text-xs bg-red-700 text-white px-3 py-1 rounded">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: ABSENSI & RIWAYAT (BISA EDIT KEHADIRAN) */}
        {activeTab === 'absensi' && (
          <div className="space-y-8">
            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/80">
              <h4 className="text-xs font-bold text-amber-900 uppercase mb-2">1. Master Database Anggota STT</h4>
              <form onSubmit={handleTambahAnggotaMaster} className="flex gap-2">
                <input type="text" placeholder="Ketik nama anggota baru..." value={namaAnggotaBaru} onChange={e => setNamaAnggotaBaru(e.target.value)} className="flex-1 border p-2.5 rounded-xl text-sm bg-white" required />
                <button type="submit" className="bg-amber-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm">+ Simpan</button>
              </form>
            </div>

            <form onSubmit={handleSimpanAbsen} className="space-y-4">
              <h4 className="text-sm font-bold text-stone-900 uppercase">2. Form Input Absensi Harian</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nama Acara (Sangkep, dsb)" value={namaAcara} onChange={e => setNamaAcara(e.target.value)} className="border p-3 rounded-xl text-sm" required />
                <input type="date" value={tanggalAcara} onChange={e => setTanggalAcara(e.target.value)} className="border p-3 rounded-xl text-sm" required />
              </div>

              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full min-w-[560px] text-sm border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b text-stone-700">
                      <th className="p-3.5 text-left font-bold">Nama Anggota</th>
                      <th className="p-3.5 text-left font-bold w-48">Status Kehadiran</th>
                      <th className="p-3.5 text-left font-bold w-24">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataKehadiran.map((item, idx) => (
                      <tr key={idx} className="border-b hover:bg-stone-50">
                        <td className="p-3.5 font-semibold text-stone-800">{item.nama}</td>
                        <td className="p-3.5">
                          <select 
                            value={item.status} 
                            onChange={e => {
                              const temp = [...dataKehadiran];
                              temp[idx].status = e.target.value;
                              setDataKehadiran(temp);
                            }} 
                            className="border w-full p-2 rounded-lg bg-white text-xs font-bold outline-none"
                          >
                            <option value="Hadir">Hadir</option>
                            <option value="Izin">Izin</option>
                            <option value="Alpha">Alpha</option>
                          </select>
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => handleDeleteAnggota(item.id, item.nama)}
                            className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-800"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="submit" disabled={loadingAbsen} className="w-full bg-red-950 text-amber-300 py-3.5 rounded-xl font-bold shadow">
                {loadingAbsen ? "Menyimpan..." : "Simpan Rekap Absensi"}
              </button>
            </form>

            {/* SEKSI EDIT ABSENSI (SUSULAN / TELAT) */}
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 mt-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5 pb-4 border-b border-stone-300">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 uppercase">3. Riwayat & Edit Kehadiran (Susulan)</h4>
                  <p className="text-xs text-stone-500 mt-1">Ubah status anggota jika ada yang datang terlambat.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    type="date" 
                    value={filterTanggal} 
                    onChange={e => setFilterTanggal(e.target.value)} 
                    className="border p-2 rounded-xl text-sm font-bold shadow-sm outline-none" 
                  />
                  <button
                    type="button"
                    onClick={handleClearAllAbsensi}
                    disabled={loadingRiwayat}
                    className="rounded-xl bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingRiwayat ? "Membersihkan..." : "Bersihkan Semua"}
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {absensiList.filter(a => a.tanggal === filterTanggal).length === 0 ? (
                  <p className="text-xs text-stone-400 italic text-center py-4">Belum ada riwayat absensi pada tanggal ini.</p>
                ) : (
                  absensiList.filter(a => a.tanggal === filterTanggal).map(absen => (
                    <div key={absen.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                      <div className="mb-4">
                        <h5 className="font-extrabold text-[#3B0707] text-base">{absen.nama_acara}</h5>
                        <p className="text-xs text-stone-500 font-semibold">{absen.tanggal}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {absen.rekap_kehadiran.map(k => (
                          <div key={k.id} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-sm">
                            <span className="font-bold text-stone-800">{k.nama}</span>
                            <select
                              value={k.status}
                              onChange={e => handleUpdateStatusAbsen(absen.id, k.id, e.target.value)}
                              className={`p-1.5 rounded-lg font-bold text-xs border outline-none ${
                                k.status === 'Hadir' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 
                                k.status === 'Izin' ? 'bg-amber-100 text-amber-800 border-amber-300' : 
                                'bg-red-100 text-red-800 border-red-300'
                              }`}
                            >
                              <option value="Hadir">Hadir</option>
                              <option value="Izin">Izin</option>
                              <option value="Alpha">Alpha</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: EKSPOR */}
        {activeTab === 'ekspor' && (
          <div className="bg-amber-50/80 border border-amber-200/80 p-8 rounded-2xl space-y-6">
            <h3 className="text-xl font-bold text-amber-950">Unduh Rekap Laporan Absensi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="date" value={tglMulai} onChange={e => setTglMulai(e.target.value)} className="border p-3 rounded-xl text-sm bg-white" />
              <input type="date" value={tglSelesai} onChange={e => setTglSelesai(e.target.value)} className="border p-3 rounded-xl text-sm bg-white" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
              <button onClick={handleEksporPDF} className="flex-1 bg-red-900 text-amber-200 py-3.5 rounded-xl font-bold">📄 Download PDF</button>
              <button onClick={handleEksporExcel} className="flex-1 bg-amber-800 text-white py-3.5 rounded-xl font-bold">📊 Download Excel / CSV</button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT PRAJURU */}
      {editPrajuru && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <form onSubmit={handleUpdatePresidium} className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg border-b pb-2 text-[#3B0707]">Edit Data Prajuru</h3>
            <input type="text" value={editPrajuru.nama} onChange={e => setEditPrajuru({ ...editPrajuru, nama: e.target.value })} className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <input type="text" value={editPrajuru.jabatan} onChange={e => setEditPrajuru({ ...editPrajuru, jabatan: e.target.value })} className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <input type="url" value={editPrajuru.foto_url} onChange={e => setEditPrajuru({ ...editPrajuru, foto_url: e.target.value })} placeholder="URL Foto" className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditPrajuru(null)} className="flex-1 bg-stone-300 py-2.5 rounded-xl font-bold">Batal</button>
              <button type="submit" className="flex-1 bg-amber-800 text-white py-2.5 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT BERITA */}
      {editBerita && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdateBerita} className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg border-b pb-2 text-[#3B0707]">Edit Berita Kegiatan</h3>
            <input type="text" value={editBerita.judul} onChange={e => setEditBerita({ ...editBerita, judul: e.target.value })} className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <textarea value={editBerita.isi_berita} onChange={e => setEditBerita({ ...editBerita, isi_berita: e.target.value })} className="w-full border border-stone-300 p-3 rounded-xl h-32 focus:outline-none" required />
            <input type="url" value={editBerita.gambar_url} onChange={e => setEditBerita({ ...editBerita, gambar_url: e.target.value })} placeholder="URL Gambar" className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditBerita(null)} className="flex-1 bg-stone-300 py-2.5 rounded-xl font-bold">Batal</button>
              <button type="submit" className="flex-1 bg-amber-800 text-white py-2.5 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDIT GALERI */}
      {editGaleri && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleUpdateGaleri} className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-4">
            <h3 className="font-extrabold text-lg border-b pb-2 text-[#3B0707]">Edit Galeri Foto</h3>
            <input type="text" value={editGaleri.judul} onChange={e => setEditGaleri({ ...editGaleri, judul: e.target.value })} className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <input type="url" value={editGaleri.gambar_url} onChange={e => setEditGaleri({ ...editGaleri, gambar_url: e.target.value })} placeholder="URL Gambar" className="w-full border border-stone-300 p-3 rounded-xl focus:outline-none" required />
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditGaleri(null)} className="flex-1 bg-stone-300 py-2.5 rounded-xl font-bold">Batal</button>
              <button type="submit" className="flex-1 bg-amber-800 text-white py-2.5 rounded-xl font-bold">Simpan</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}