

// "use client";

// import React, { useRef, useState } from "react";
// import * as XLSX from "xlsx";
// import {
//   Search,
//   Download,
//   Users,
//   CheckCircle2,
//   Building2,
//   GraduationCap,
//   Info,
//   X,
// } from "lucide-react";

// // 1. Import JSON
// import DATA_MAHASISWA from "../app/rekapan/data-mahasiswa.json";

// // Interface MahasiswaRecord
// export interface MahasiswaRecord {
//   no: number | string;
//   namaMahasiswa: string;
//   ttl: string;
//   jenisKelamin: string;
//   namaKampus: string;
//   jurusan: string;
//   nim: string;
//   tahunMasuk: string;
//   suratKet: string;
//   semester: string;
//   ipk: string;
//   nik: string;
//   nokk: string;
//   asalKk: string;
//   noRek: string;
//   bank: string;
//   noHp: string;
//   portalDikti: string;
//   verifikasi: string;
// }

// export default function RekapanMahasiswaPage() {
//   // 2. Ambil data dengan fallback Array Kosong jika DATA_MAHASISWA undefined/bukan array
//   const initialData: MahasiswaRecord[] = Array.isArray(DATA_MAHASISWA)
//     ? (DATA_MAHASISWA as unknown as MahasiswaRecord[])
//     : ((DATA_MAHASISWA as any)?.data as MahasiswaRecord[]) || []; // Jaga-jaga jika JSON dibungkus object { "data": [...] }

//   const [data] = useState<MahasiswaRecord[]>(initialData);

//   // Indikator scroll horizontal buatan (lebih andal daripada scrollbar native, terutama di HP)
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [scrollBar, setScrollBar] = useState({ widthPct: 100, leftPct: 0 });

//   const handleTableScroll = () => {
//     const el = scrollRef.current;
//     if (!el) return;
//     const { scrollLeft, scrollWidth, clientWidth } = el;
//     if (scrollWidth <= clientWidth) {
//       setScrollBar({ widthPct: 100, leftPct: 0 });
//       return;
//     }
//     const widthPct = Math.max((clientWidth / scrollWidth) * 100, 8);
//     const leftPct = (scrollLeft / (scrollWidth - clientWidth)) * (100 - widthPct);
//     setScrollBar({ widthPct, leftPct });
//   };

//   // Filter & Search states
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [verifikasiFilter, setVerifikasiFilter] = useState<
//     "ALL" | "P1" | "P2" | "KP"
//   >("ALL");

//   // 3. Gunakan Guard Optional Chaining (data?.map) agar tidak pernah memicu runtime error
//   const listKampus = Array.from(
//     new Set((data || []).map((d) => d?.namaKampus))
//   ).filter((k) => k && k !== "-" && k !== "");

//   // Indikator apakah pengguna sedang melakukan pencarian
//   const isSearchActive =
//     searchTerm.trim().length > 0 || verifikasiFilter !== "ALL";

//   // Logic Pencarian Real-Time
//   const filteredData = isSearchActive
//     ? (data || []).filter((item) => {
//         const matchesSearch =
//           searchTerm.trim() === ""
//             ? true
//             : item?.namaMahasiswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//               item?.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//               item?.jurusan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//               item?.nim?.toLowerCase().includes(searchTerm.toLowerCase());

//         const verifText = (item?.verifikasi || "").toLowerCase();
//         const matchesVerifikasi =
//           verifikasiFilter === "ALL"
//             ? true
//             : verifikasiFilter === "P1"
//             ? verifText.includes("lolos verifikasi") && verifText.includes("prioritas 1")
//             : verifikasiFilter === "P2"
//             ? verifText.includes("lolos verifikasi") && verifText.includes("prioritas 2")
//             : verifText.includes("lolos verifikasi") && verifText.includes("kelangkaan profesi");

//         return matchesSearch && matchesVerifikasi;
//       })
//     : [];

//   // Export Hasil Pencarian ke Excel — mengikuti kolom yang ditampilkan
//   const exportToExcel = () => {
//     if (filteredData.length === 0) return;

//     const exportRows = filteredData.map((d) => ({
//       "NAMA MAHASISWA": d.namaMahasiswa,
//       "JENIS KELAMIN": d.jenisKelamin,
//       "NAMA KAMPUS": d.namaKampus,
//       "JURUSAN": d.jurusan,
//       "TAHUN MASUK AKADEMIK": d.tahunMasuk,
//       "SURAT KETERANGAN TUGAS AKHIR": d.suratKet,
//       "PORTAL DIKTI": d.portalDikti,
//       "VERIFIKASI": d.verifikasi,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportRows);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil_Pencarian");
//     XLSX.writeFile(workbook, "Hasil_Pencarian_Mahasiswa.xlsx");
//   };

//   const resetSearch = () => {
//     setSearchTerm("");
//     setVerifikasiFilter("ALL");
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-8 md:px-8 ">
//       <div className="mx-auto max-w-[1700px] space-y-6">
//         {/* Header Section — Kop Surat */}
//         <div className="rounded-sm border border-slate-200/80 bg-white px-4 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] sm:px-6 sm:py-7 md:px-10">
//           <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
//             <img
//               src="/logo-deiyai.png"
//               alt="Logo Kabupaten Deiyai"
//               className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24"
//             />
//             <div className="w-full pb-3 sm:pb-0">
//               <h2 className="text-base font-bold uppercase leading-snug tracking-wide text-slate-900 underline underline-offset-4 sm:text-lg md:text-2xl">
//                 Pemerintah Kabupaten Deiyai
//               </h2>
//               <p className="mt-0.5 text-sm font-semibold uppercase tracking-wide text-slate-800 sm:text-base md:text-lg">
//                 Sekretariat Daerah - Bagian Umum
//               </p>
//               <p className="mt-1 text-[11px] italic text-slate-500 underline underline-offset-2 sm:text-xs md:text-sm">
//                 Alamat : Kompleks Perkantoran Pemda Deiyai - Papua Tengah
//               </p>
//             </div>
//           </div>

//           <div className="mx-auto mt-5 h-[3px] w-full bg-slate-800" />

//           <div className="mt-5 flex flex-col items-center gap-3 text-center">
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-purple-600/30">
//               <GraduationCap className="h-5 w-5" />
//             </div>
//             <div>
//               <h1 className="text-base font-bold uppercase leading-snug tracking-tight text-slate-900 sm:text-lg md:text-xl">
//                 Hasil Verifikasi <br></br>Bantuan Tugas Akhir Mahasiswa<br></br> Kabupaten Deiyai Tahun 2026
//               </h1>
//               <p className="mt-1 text-sm text-slate-500">
//                 Sistem pencarian cepat data mahasiswa terverifikasi.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Ringkasan Statistik */}
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <StatCard
//             icon={<Users className="h-5 w-5" />}
//             iconBg="bg-blue-50 text-blue-600"
//             label="Total Database"
//             value={`${data?.length || 0} Mahasiswa`}
//           />
//           <StatCard
//             icon={<CheckCircle2 className="h-5 w-5" />}
//             iconBg="bg-emerald-50 text-emerald-600"
//             label="Hasil Ditemukan"
//             value={isSearchActive ? filteredData.length : 0}
//           />
         
//         </div>

//         {/* Input Pencarian & Filter */}
//         <div className="space-y-4 rounded-sm border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
//           <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
//             {/* Input Form Search */}
//             <div className="relative flex-1">
//               <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-blue-500" />
//               <input
//                 type="text"
//                 placeholder="Ketik Nama Mahasiswa, NIK, NIM, atau Jurusan untuk mencari..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-10 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
//                 autoFocus
//               />
//               {searchTerm && (
//                 <button
//                   onClick={() => setSearchTerm("")}
//                   aria-label="Hapus pencarian"
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>

//             {/* Tombol Export */}
       
//           </div>

//           {/* Filter Verifikasi */}
//           <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
//             <div className="flex flex-wrap gap-2">
//               <StatusButton
//                 active={verifikasiFilter === "ALL"}
//                 onClick={() => setVerifikasiFilter("ALL")}
//                 activeClass="bg-blue-600 text-white shadow-sm shadow-blue-600/25"
//               >
//                 Semua Data
//               </StatusButton>
//               <StatusButton
//                 active={verifikasiFilter === "P1"}
//                 onClick={() => setVerifikasiFilter("P1")}
//                 activeClass="bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
//               >
//                 Lolos Verifikasi 1
//               </StatusButton>
//               <StatusButton
//                 active={verifikasiFilter === "P2"}
//                 onClick={() => setVerifikasiFilter("P2")}
//                 activeClass="bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
//               >
//                 Lolos Verifikasi 2
//               </StatusButton>
//               <StatusButton
//                 active={verifikasiFilter === "KP"}
//                 onClick={() => setVerifikasiFilter("KP")}
//                 activeClass="bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
//               >
//                 Lolos Verifikasi - Kelangkaan Profesi
//               </StatusButton>
//             </div>

//             {isSearchActive && (
//               <button
//                 onClick={resetSearch}
//                 className="text-xs font-semibold text-rose-600 transition hover:text-rose-700 hover:underline"
//               >
//                 Reset Pencarian
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Tampilan 1: Belum Melakukan Pencarian */}
//         {!isSearchActive && (
//           <div className="space-y-3 rounded-sm border border-dashed border-slate-300 bg-white p-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
//             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
//               <Search className="h-7 w-7" />
//             </div>
//             <h3 className="text-base font-bold text-slate-800">
//               Ketik Kata Kunci Untuk Menampilkan Data
//             </h3>
//             <p className="mx-auto max-w-md text-sm text-slate-500">
//               Silakan ketikkan <strong className="text-slate-700">Nama Mahasiswa</strong>,{" "}
//               <strong className="text-slate-700">NIK</strong>, atau{" "}
//               <strong className="text-slate-700">NIM</strong> pada kolom pencarian di atas.
//             </p>
//           </div>
//         )}

//         {/* Tampilan 2: Tabel Hasil Pencarian — gaya grid rapi seperti SIPD */}
//         {isSearchActive && (
//           <div className="overflow-hidden rounded-sm border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-14px_rgba(15,23,42,0.14)]">
//           <div
//             ref={scrollRef}
//             onScroll={handleTableScroll}
//             className="overflow-x-auto overscroll-x-contain border-t border-slate-200 [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
//           >
//               <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
//                 <thead>
//                   <tr className="bg-slate-100 text-[11px] font-extrabold uppercase tracking-wide text-slate-700">
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Nama Mahasiswa
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Jenis Kelamin
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Nama Kampus
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Jurusan
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Tahun Masuk Akademik
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Surat Keterangan Tugas Akhir
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Portal Dikti
//                     </th>
//                     <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-left">
//                       Verifikasi
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredData.length === 0 ? (
//                     <tr>
//                       <td colSpan={8} className="border border-slate-300 p-12 text-center">
//                         <Info className="mx-auto mb-2 h-8 w-8 text-amber-500" />
//                         <p className="text-sm font-semibold text-slate-700">
//                           Data Tidak Ditemukan
//                         </p>
//                         <p className="mt-0.5 text-xs text-slate-400">
//                           Tidak ada mahasiswa dengan kata kunci &quot;{searchTerm}&quot;.
//                         </p>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredData.map((row, idx) => {
//                       const isAktif =
//                         row?.portalDikti?.toUpperCase().includes("AKTIF") &&
//                         !row?.portalDikti?.toUpperCase().includes("NON");

//                       return (
//                         <tr
//                           key={idx}
//                           className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-purple-50/50"
//                         >
//                           <td className="border border-slate-200 px-4 py-2.5 align-top font-semibold text-slate-800">
//                             {row.namaMahasiswa}
//                           </td>
//                           <td className="whitespace-nowrap border border-slate-200 px-4 py-2.5 align-top text-slate-600">
//                             {row.jenisKelamin}
//                           </td>
//                           <td className="border border-slate-200 px-4 py-2.5 align-top font-medium text-purple-900">
//                             {row.namaKampus}
//                           </td>
//                           <td className="border border-slate-200 px-4 py-2.5 align-top text-slate-600">
//                             {row.jurusan}
//                           </td>
//                           <td className="whitespace-nowrap border border-slate-200 px-4 py-2.5 align-top text-slate-600">
//                             {row.tahunMasuk}
//                           </td>
//                           <td className="max-w-[220px] border border-slate-200 px-4 py-2.5 align-top text-slate-600">
//                             <span className="block truncate" title={row.suratKet}>
//                               {row.suratKet}
//                             </span>
//                           </td>
//                           <td className="whitespace-nowrap border border-slate-200 px-4 py-2.5 align-top">
//                             <span
//                               className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
//                                 isAktif
//                                   ? "border-emerald-200 bg-emerald-50 text-emerald-700"
//                                   : "border-rose-200 bg-rose-50 text-rose-700"
//                               }`}
//                             >
//                               {row.portalDikti}
//                             </span>
//                           </td>
//                           <td className="max-w-[240px] border border-slate-200 px-4 py-2.5 align-top text-slate-600">
//                             {row.verifikasi && row.verifikasi !== "nan" ? (
//                               <span title={row.verifikasi}>{row.verifikasi}</span>
//                             ) : (
//                               <span className="text-slate-300">—</span>
//                             )}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Indikator scroll horizontal buatan */}
//             <div className="relative h-2.5 w-full overflow-hidden bg-slate-100">
//               <div
//                 className="absolute inset-y-0 rounded-full bg-slate-400 transition-[left,width] duration-100"
//                 style={{
//                   width: `${scrollBar.widthPct}%`,
//                   left: `${scrollBar.leftPct}%`,
//                 }}
//               />
//             </div>

//             <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
//               <span>
//                 Ditemukan{" "}
//                 <strong className="font-semibold text-slate-700">
//                   {filteredData.length}
//                 </strong>{" "}
//                 baris data yang cocok
//               </span>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }

// function StatCard({
//   icon,
//   iconBg,
//   label,
//   value,
// }: {
//   icon: React.ReactNode;
//   iconBg: string;
//   label: string;
//   value: React.ReactNode;
// }) {
//   return (
//     <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-14px_rgba(15,23,42,0.10)] transition hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-12px_rgba(15,23,42,0.16)]">
//       <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-xs font-medium text-slate-500">{label}</p>
//         <p className="text-xl font-bold text-slate-900">{value}</p>
//       </div>
//     </div>
//   );
// }

// function StatusButton({
//   active,
//   onClick,
//   activeClass,
//   children,
// }: {
//   active: boolean;
//   onClick: () => void;
//   activeClass: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <button
//       onClick={onClick}
//       className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
//         active ? activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//       }`}
//     >
//       {children}
//     </button>
//   );
// }

"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  Users,
  CheckCircle2,
  GraduationCap,
  Info,
  X,
  Sparkles,
} from "lucide-react";

// 1. Import JSON
import DATA_MAHASISWA from "../app/rekapan/data-mahasiswa.json";

// Interface MahasiswaRecord
export interface MahasiswaRecord {
  no: number | string;
  namaMahasiswa: string;
  ttl: string;
  jenisKelamin: string;
  namaKampus: string;
  jurusan: string;
  nim: string;
  tahunMasuk: string;
  suratKet: string;
  semester: string;
  ipk: string;
  nik: string;
  nokk: string;
  asalKk: string;
  noRek: string;
  bank: string;
  noHp: string;
  portalDikti: string;
  verifikasi: string;
}

type VerifikasiFilter = "ALL" | "P1" | "P2" | "KP";

export default function RekapanMahasiswaPage() {
  // 2. Ambil data dengan fallback Array Kosong jika DATA_MAHASISWA undefined/bukan array
  const initialData: MahasiswaRecord[] = Array.isArray(DATA_MAHASISWA)
    ? (DATA_MAHASISWA as unknown as MahasiswaRecord[])
    : ((DATA_MAHASISWA as any)?.data as MahasiswaRecord[]) || [];

  const [data] = useState<MahasiswaRecord[]>(initialData);

  // Indikator scroll horizontal buatan
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollBar, setScrollBar] = useState({ widthPct: 100, leftPct: 0 });

  const handleTableScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth <= clientWidth) {
      setScrollBar({ widthPct: 100, leftPct: 0 });
      return;
    }
    const widthPct = Math.max((clientWidth / scrollWidth) * 100, 8);
    const leftPct = (scrollLeft / (scrollWidth - clientWidth)) * (100 - widthPct);
    setScrollBar({ widthPct, leftPct });
  };

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [verifikasiFilter, setVerifikasiFilter] = useState<VerifikasiFilter>("ALL");

  const isSearchActive = searchTerm.trim().length > 0 || verifikasiFilter !== "ALL";

  const filteredData = isSearchActive
    ? (data || []).filter((item) => {
        const matchesSearch =
          searchTerm.trim() === ""
            ? true
            : item?.namaMahasiswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.jurusan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.nim?.toLowerCase().includes(searchTerm.toLowerCase());

        const verifText = (item?.verifikasi || "").toLowerCase();
        const matchesVerifikasi =
          verifikasiFilter === "ALL"
            ? true
            : verifikasiFilter === "P1"
            ? verifText.includes("lolos verifikasi") && verifText.includes("prioritas 1")
            : verifikasiFilter === "P2"
            ? verifText.includes("lolos verifikasi") && verifText.includes("prioritas 2")
            : verifText.includes("lolos verifikasi") && verifText.includes("kelangkaan profesi");

        return matchesSearch && matchesVerifikasi;
      })
    : [];

  const exportToExcel = () => {
    if (filteredData.length === 0) return;

    const exportRows = filteredData.map((d) => ({
      "NAMA MAHASISWA": d.namaMahasiswa,
      "JENIS KELAMIN": d.jenisKelamin,
      "NAMA KAMPUS": d.namaKampus,
      "JURUSAN": d.jurusan,
      "TAHUN MASUK AKADEMIK": d.tahunMasuk,
      "SURAT KETERANGAN TUGAS AKHIR": d.suratKet,
      "PORTAL DIKTI": d.portalDikti,
      "VERIFIKASI": d.verifikasi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil_Pencarian");
    XLSX.writeFile(workbook, "Hasil_Pencarian_Mahasiswa.xlsx");
  };

  const resetSearch = () => {
    setSearchTerm("");
    setVerifikasiFilter("ALL");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#eef2ff_0%,_#f8fafc_45%,_#f8fafc_100%)] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-[1500px] space-y-5">
        {/* Header Section — Kop Surat + Hero judul, gaya lebih modern */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-20px_rgba(79,70,229,0.25)]">
          {/* Kop surat */}
          <div className="flex flex-col items-center gap-3 px-6 pt-6 text-center sm:flex-row sm:items-center sm:gap-4 sm:px-8 sm:text-left">
            <img
              src="/logo-deiyai.png"
              alt="Logo Kabupaten Deiyai"
              className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
            />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800 sm:text-base">
                Pemerintah Kabupaten Deiyai
              </h2>
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 sm:text-sm">
                Sekretariat Daerah - Bagian Umum
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs">
                Kompleks Perkantoran Pemda Deiyai - Papua Tengah
              </p>
            </div>
          </div>

          {/* Hero judul — gradient banner */}
          <div className="relative mt-6 overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 px-6 py-7 sm:px-10 sm:py-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold leading-snug tracking-tight text-white sm:text-xl md:text-2xl">
                  Hasil Verifikasi <br></br>  Bantuan Tugas Akhir Mahasiswa
                  <br className="hidden sm:block" /> Kabupaten Deiyai Tahun 2026
                </h1>
              
              </div>
            </div>
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            gradient="from-indigo-500 to-blue-500"
            label="Total Database"
            value={`${data?.length || 0} Mahasiswa`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            gradient="from-emerald-500 to-teal-500"
            label="Hasil Ditemukan"
            value={isSearchActive ? filteredData.length : 0}
          />
        </div>

        {/* Input Pencarian & Filter */}
        <div className="space-y-4 rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_32px_-18px_rgba(15,23,42,0.14)] sm:p-6">
          <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-indigo-400" />
              <input
                type="text"
                placeholder="Ketik Nama Mahasiswa, NIK, NIM, atau Jurusan untuk mencari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 transition focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

         
          </div>

          {/* Filter Verifikasi — pill berwarna */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="flex flex-wrap gap-2">
              <FilterPill
                active={verifikasiFilter === "ALL"}
                onClick={() => setVerifikasiFilter("ALL")}
                colorClass="from-indigo-500 to-blue-500 shadow-indigo-500/25"
              >
                Semua Data
              </FilterPill>
              <FilterPill
                active={verifikasiFilter === "P1"}
                onClick={() => setVerifikasiFilter("P1")}
                colorClass="from-emerald-500 to-teal-500 shadow-emerald-500/25"
              >
                Lolos Verifikasi Prioritas 1
              </FilterPill>
              <FilterPill
                active={verifikasiFilter === "P2"}
                onClick={() => setVerifikasiFilter("P2")}
                colorClass="from-cyan-500 to-sky-500 shadow-cyan-500/25"
              >
                Lolos Verifikasi Prioritas 2
              </FilterPill>
              <FilterPill
                active={verifikasiFilter === "KP"}
                onClick={() => setVerifikasiFilter("KP")}
                colorClass="from-amber-500 to-orange-500 shadow-amber-500/25"
              >
                Lolos Verifikasi - Kelangkaan Profesi
              </FilterPill>
            </div>

            {isSearchActive && (
              <button
                onClick={resetSearch}
                className="text-xs font-semibold text-rose-500 transition hover:text-rose-600 hover:underline"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        </div>

        {/* Tampilan 1: Belum Melakukan Pencarian */}
        {!isSearchActive && (
          <div className="space-y-3 rounded-xl border border-dashed border-indigo-200 bg-white/70 p-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/25">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Ketik Kata Kunci Untuk Menampilkan Data
            </h3>
            <p className="mx-auto max-w-md text-sm text-slate-500">
              Silakan ketikkan <strong className="text-slate-700">Nama Mahasiswa</strong>,{" "}
              <strong className="text-slate-700">NIK</strong>, atau{" "}
              <strong className="text-slate-700">NIM</strong> pada kolom pencarian di atas.
            </p>
          </div>
        )}

        {/* Tampilan 2: Tabel Hasil Pencarian */}
        {isSearchActive && (
          <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-20px_rgba(15,23,42,0.16)]">
            <div
              ref={scrollRef}
              onScroll={handleTableScroll}
              className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            >
              <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 via-blue-50 to-sky-50 text-[11px] font-extrabold uppercase tracking-wide text-indigo-800">
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Nama Mahasiswa
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Jenis Kelamin
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Nama Kampus
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Jurusan
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Tahun Masuk Akademik
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Surat Keterangan Tugas Akhir
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Portal Dikti
                    </th>
                    <th className="whitespace-nowrap border-b-2 border-indigo-100 px-4 py-3.5 text-left">
                      Verifikasi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                          <Info className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          Data Tidak Ditemukan
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Tidak ada mahasiswa dengan kata kunci &quot;{searchTerm}&quot;.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => {
                      const isAktif =
                        row?.portalDikti?.toUpperCase().includes("AKTIF") &&
                        !row?.portalDikti?.toUpperCase().includes("NON");

                      return (
                        <tr
                          key={idx}
                          className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-indigo-50/50"
                        >
                          <td className="px-4 py-3 align-top font-semibold text-slate-800">
                            {row.namaMahasiswa}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-slate-600">
                            {row.jenisKelamin}
                          </td>
                          <td className="px-4 py-3 align-top font-medium text-indigo-700">
                            {row.namaKampus}
                          </td>
                          <td className="px-4 py-3 align-top text-slate-600">{row.jurusan}</td>
                          <td className="whitespace-nowrap px-4 py-3 align-top text-slate-600">
                            {row.tahunMasuk}
                          </td>
                          <td className="max-w-[220px] px-4 py-3 align-top text-slate-600">
                            <span className="block truncate" title={row.suratKet}>
                              {row.suratKet}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 align-top">
                            <span
                              className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                                isAktif
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                              }`}
                            >
                              {row.portalDikti}
                            </span>
                          </td>
                          <td className="max-w-[240px] px-4 py-3 align-top text-slate-600">
                            {row.verifikasi && row.verifikasi !== "nan" ? (
                              <span title={row.verifikasi}>{row.verifikasi}</span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Indikator scroll horizontal buatan */}
            <div className="relative h-1.5 w-full overflow-hidden bg-slate-100">
              <div
                className="absolute inset-y-0 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 transition-[left,width] duration-100"
                style={{
                  width: `${scrollBar.widthPct}%`,
                  left: `${scrollBar.leftPct}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-6 py-3 text-xs text-slate-500">
              <span>
                Ditemukan{" "}
                <strong className="font-semibold text-indigo-700">
                  {filteredData.length}
                </strong>{" "}
                baris data yang cocok
              </span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  icon,
  gradient,
  label,
  value,
}: {
  icon: React.ReactNode;
  gradient: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_26px_-16px_rgba(15,23,42,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_32px_-14px_rgba(79,70,229,0.20)]">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md ${gradient}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  colorClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  colorClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? `bg-gradient-to-r text-white shadow-md ${colorClass}`
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

