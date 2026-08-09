

// "use client";

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import { Download, AlertTriangle, CheckCircle, Search, FileSpreadsheet, Fingerprint } from "lucide-react";

// interface MatchResult {
//   no: number | string;
//   namaMahasiswa: string;
//   nikMahasiswa: string;
//   asalKkMahasiswa: string;
//   isAsn: boolean;
//   matchReason: string;
//   matchedAsnData?: {
//     namaAsn: string;
//     nip: string;
//     nikAsn: string;
//     alamatAsn: string;
//     statusAsn: string;
//   };
// }

// export default function ExcelMatchPage() {
//   const [fileAsn, setFileAsn] = useState<File | null>(null);
//   const [fileTarget, setFileTarget] = useState<File | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [results, setResults] = useState<MatchResult[]>([]);
//   const [filterType, setFilterType] = useState<"ALL" | "ASN_ONLY" | "NON_ASN">("ALL");
//   const [searchTerm, setSearchTerm] = useState<string>("");

//   // Mode pencocokan nama cadangan apabila NIK target kosong/tidak diisi
//   const [enableNameFallback, setEnableNameFallback] = useState<boolean>(false);

//   // Fungsi Pembersihan NIK Murni (Hanya Ambil Angka 0-9)
//   const cleanNik = (nik: any): string => {
//     if (!nik) return "";
//     return String(nik).replace(/[^0-9]/g, "").trim();
//   };

//   // Normalisasi Teks Nama untuk Cadangan Matching
//   const cleanName = (str: any): string => {
//     if (!str) return "";
//     return String(str)
//       .toLowerCase()
//       .replace(/[,.]/g, " ")
//       .replace(/\b(s\.stp|sstp|s\.ip|sip|s\.si|ssi|s\.pd|spd|s\.st|sst|s\.e|se|s\.h|sh|s\.sos|ssos|m\.si|msi|m\.pd|mpd|a\.md|amd|s\.tr|str|dr|drs|dra|st|md)\b/gi, "")
//       .replace(/[^a-z0-9\s]/g, "")
//       .replace(/\s+/g, " ")
//       .trim();
//   };

//   const processMatching = async () => {
//     if (!fileAsn || !fileTarget) {
//       alert("Harap unggah kedua file Excel terlebih dahulu.");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 1. Baca File 1 (Data Master ASN)
//       const dataAsnBuffer = await fileAsn.arrayBuffer();
//       const wbAsn = XLSX.read(dataAsnBuffer, { type: "array" });
//       const sheetAsn = wbAsn.Sheets[wbAsn.SheetNames[0]];
//       const jsonAsn: any[] = XLSX.utils.sheet_to_json(sheetAsn);

//       // 2. Baca File 2 (Data Target / Mahasiswa)
//       const dataTargetBuffer = await fileTarget.arrayBuffer();
//       const wbTarget = XLSX.read(dataTargetBuffer, { type: "array" });
//       const sheetTarget = wbTarget.Sheets[wbTarget.SheetNames[0]];
//       const rawTargetData: any[][] = XLSX.utils.sheet_to_json(sheetTarget, { header: 1 });

//       let headerRowIndex = rawTargetData.findIndex((row) =>
//         row.some(
//           (cell) =>
//             String(cell).toUpperCase().includes("NAMA MAHASISWA") ||
//             String(cell).toUpperCase().includes("NO. KTP") ||
//             String(cell).toUpperCase().includes("NIK")
//         )
//       );

//       if (headerRowIndex === -1) headerRowIndex = 0;

//       const headers = rawTargetData[headerRowIndex].map((h) => String(h).trim().toUpperCase());
//       const dataRows = rawTargetData.slice(headerRowIndex + 1);

//       const colIdxNama = headers.findIndex((h) => h.includes("NAMA MAHASISWA") || h.includes("NAMA"));
//       const colIdxNik = headers.findIndex((h) => h.includes("NO. KTP") || h.includes("NIK"));
//       const colIdxAlamat = headers.findIndex((h) => h.includes("ASAL KK") || h.includes("ALAMAT"));
//       const colIdxNo = headers.findIndex((h) => h === "NO");

//       // Buat Hash Map NIK ASN untuk Lookup Cepat
//       const asnByNikMap = new Map<string, any>();
//       const asnListByName: { cleanNama: string; raw: any }[] = [];

//       jsonAsn.forEach((row) => {
//         const rawNik = row["NIK Pegawai"] || row["NIK"] || row["NO. KTP"];
//         const cNik = cleanNik(rawNik);

//         if (cNik && cNik.length >= 10) {
//           asnByNikMap.set(cNik, row);
//         }

//         const rawNama = row["Nama Pegawai"] || row["NAMA"] || row["Nama"];
//         if (rawNama) {
//           asnListByName.push({ cleanNama: cleanName(rawNama), raw: row });
//         }
//       });

//       // Process Matching Berdasarkan NIK
//       const matchResults: MatchResult[] = dataRows
//         .filter((row) => row[colIdxNama] || row[colIdxNik]) // Baris tidak kosong
//         .map((row) => {
//           const rawNamaMhs = String(row[colIdxNama] || "");
//           const rawNikMhs = String(row[colIdxNik] || "");
//           const rawAlamatMhs = String(row[colIdxAlamat] || "");
//           const noMhs = row[colIdxNo] || "";

//           const cNikMhs = cleanNik(rawNikMhs);

//           let isMatched = false;
//           let matchReason = "Bukan ASN";
//           let matchedAsn: any = null;

//           // ==================== UTAMA: FILTER BERDASARKAN NIK ====================
//           if (cNikMhs && cNikMhs.length >= 10 && asnByNikMap.has(cNikMhs)) {
//             isMatched = true;
//             matchedAsn = asnByNikMap.get(cNikMhs);
//             matchReason = "NIK Cocok Dengan Data Master ASN";
//           }

//           // ==================== CADANGAN: NAMA (JIKA DISUASANAKAN) ====================
//           if (!isMatched && enableNameFallback && cleanName(rawNamaMhs).length > 3) {
//             const cNamaMhs = cleanName(rawNamaMhs);
//             const foundByName = asnListByName.find(
//               (item) => item.cleanNama.includes(cNamaMhs) || cNamaMhs.includes(item.cleanNama)
//             );

//             if (foundByName) {
//               isMatched = true;
//               matchedAsn = foundByName.raw;
//               matchReason = "Nama Terdeteksi di Master ASN (NIK Berbeda/Kosong)";
//             }
//           }

//           return {
//             no: noMhs,
//             namaMahasiswa: rawNamaMhs,
//             nikMahasiswa: rawNikMhs,
//             asalKkMahasiswa: rawAlamatMhs,
//             isAsn: isMatched,
//             matchReason: matchReason,
//             matchedAsnData: matchedAsn
//               ? {
//                   namaAsn: matchedAsn["Nama Pegawai"] || matchedAsn["NAMA"] || "-",
//                   nip: matchedAsn["NIP Pegawai"] || matchedAsn["NIP"] || "-",
//                   nikAsn: matchedAsn["NIK Pegawai"] || matchedAsn["NIK"] || "-",
//                   alamatAsn: matchedAsn["Alamat"] || "-",
//                   statusAsn: matchedAsn["Status ASN"] || "ASN",
//                 }
//               : undefined,
//           };
//         });

//       setResults(matchResults);
//     } catch (err) {
//       console.error(err);
//       alert("Terjadi kesalahan saat mengolah file Excel.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const exportToExcel = () => {
//     const exportData = filteredResults.map((r) => ({
//       "No Target": r.no,
//       "Nama Target": r.namaMahasiswa,
//       "NIK Target": r.nikMahasiswa,
//       "Alamat / Asal KK Target": r.asalKkMahasiswa,
//       "Status Terdeteksi": r.isAsn ? "ASN" : "BUKAN ASN",
//       "Kriteria Matched": r.matchReason,
//       "NIP ASN (Data 1)": r.matchedAsnData?.nip || "-",
//       "Nama ASN (Data 1)": r.matchedAsnData?.namaAsn || "-",
//       "NIK ASN (Data 1)": r.matchedAsnData?.nikAsn || "-",
//       "Alamat ASN (Data 1)": r.matchedAsnData?.alamatAsn || "-",
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil_Verifikasi_NIK");
//     XLSX.writeFile(workbook, "Hasil_Verifikasi_ASN_NIK.xlsx");
//   };

//   const filteredResults = results.filter((r) => {
//     const matchesFilter =
//       filterType === "ALL" ? true : filterType === "ASN_ONLY" ? r.isAsn : !r.isAsn;
//     const matchesSearch =
//       r.namaMahasiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       String(r.nikMahasiswa).includes(searchTerm) ||
//       r.asalKkMahasiswa.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesFilter && matchesSearch;
//   });

//   const totalAsn = results.filter((r) => r.isAsn).length;

//   return (
//     <main className="min-h-screen bg-slate-50 p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
//           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <Fingerprint className="w-7 h-7 text-purple-600" />
//             Sistem Verifikasi ASN Berdasarkan NIK Murni
//           </h1>
//           <p className="text-slate-500 text-sm mt-1">
//             Penyeleksian ASN diprioritaskan 100% pada kesamaan Nomor NIK / No. KTP. Perbedaan penulisan nama diabaikan.
//           </p>
//         </div>

//         {/* Input File Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               1. File Master Data ASN (Data 1)
//             </label>
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={(e) => setFileAsn(e.target.files?.[0] || null)}
//               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
//             />
//             {fileAsn && <p className="text-xs text-emerald-600 mt-2">✓ {fileAsn.name}</p>}
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
//             <label className="block text-sm font-semibold text-slate-700 mb-2">
//               2. File Data Target / Pembanding (Data 2)
//             </label>
//             <input
//               type="file"
//               accept=".xlsx, .xls"
//               onChange={(e) => setFileTarget(e.target.files?.[0] || null)}
//               className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
//             />
//             {fileTarget && <p className="text-xs text-emerald-600 mt-2">✓ {fileTarget.name}</p>}
//           </div>
//         </div>

//         {/* Opsi Opsional Pencocokan Nama */}
//         <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
//           <div className="text-sm">
//             <span className="font-semibold text-slate-800">Cek Cadangan Berdasarkan Nama?</span>
//             <p className="text-xs text-slate-500">Gunakan jika ada NIK target yang kosong namun ingin dicari berdasarkan nama.</p>
//           </div>
//           <label className="relative inline-flex items-center cursor-pointer">
//             <input
//               type="checkbox"
//               checked={enableNameFallback}
//               onChange={(e) => setEnableNameFallback(e.target.checked)}
//               className="sr-only peer"
//             />
//             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
//           </label>
//         </div>

//         {/* Action Button */}
//         <button
//           onClick={processMatching}
//           disabled={loading || !fileAsn || !fileTarget}
//           className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
//         >
//           {loading ? "Memproses Data NIK..." : "Jalankan Filter NIK ASN"}
//         </button>

//         {/* Results Section */}
//         {results.length > 0 && (
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
//             <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
//               <div>
//                 <h2 className="text-lg font-bold text-slate-800">Hasil Analisis Berdasarkan NIK</h2>
//                 <p className="text-sm text-slate-500">
//                   Total Target: {results.length} | Terdeteksi ASN:{" "}
//                   <span className="font-semibold text-rose-600">{totalAsn}</span>
//                 </p>
//               </div>

//               <button
//                 onClick={exportToExcel}
//                 className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition cursor-pointer"
//               >
//                 <Download className="w-4 h-4" /> Export Hasil Excel
//               </button>
//             </div>

//             {/* Filter & Search Bar */}
//             <div className="flex flex-col sm:flex-row gap-3 justify-between">
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setFilterType("ALL")}
//                   className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
//                     filterType === "ALL" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-600"
//                   }`}
//                 >
//                   Semua ({results.length})
//                 </button>
//                 <button
//                   onClick={() => setFilterType("ASN_ONLY")}
//                   className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
//                     filterType === "ASN_ONLY" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600"
//                   }`}
//                 >
//                   Terdeteksi ASN ({totalAsn})
//                 </button>
//                 <button
//                   onClick={() => setFilterType("NON_ASN")}
//                   className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer ${
//                     filterType === "NON_ASN" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
//                   }`}
//                 >
//                   Bukan ASN ({results.length - totalAsn})
//                 </button>
//               </div>

//               <div className="relative w-full sm:w-64">
//                 <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Cari Nama / NIK..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>
//             </div>

//             {/* Table */}
//             <div className="overflow-x-auto rounded-lg border border-slate-200">
//               <table className="w-full text-left text-xs">
//                 <thead className="bg-slate-100 text-slate-700 uppercase font-semibold">
//                   <tr>
//                     <th className="p-3">No</th>
//                     <th className="p-3">Nama Target (Data 2)</th>
//                     <th className="p-3">NIK Target</th>
//                     <th className="p-3">Alamat / Asal KK</th>
//                     <th className="p-3">Status ASN</th>
//                     <th className="p-3">Detail Padanan Data Master ASN</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filteredResults.map((item, index) => (
//                     <tr key={index} className={item.isAsn ? "bg-rose-50/50" : "hover:bg-slate-50"}>
//                       <td className="p-3 font-medium text-slate-600">{item.no || index + 1}</td>
//                       <td className="p-3 font-semibold text-slate-800">{item.namaMahasiswa}</td>
//                       <td className="p-3 text-slate-600 font-mono font-bold">{item.nikMahasiswa || "-"}</td>
//                       <td className="p-3 text-slate-600">{item.asalKkMahasiswa || "-"}</td>
//                       <td className="p-3">
//                         {item.isAsn ? (
//                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
//                             <AlertTriangle className="w-3.5 h-3.5" /> Terdeteksi ASN
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
//                             <CheckCircle className="w-3.5 h-3.5" /> Bukan ASN
//                           </span>
//                         )}
//                       </td>
//                       <td className="p-3">
//                         {item.isAsn && item.matchedAsnData ? (
//                           <div className="space-y-0.5 text-slate-700">
//                             <p className="font-semibold text-rose-800">{item.matchedAsnData.namaAsn}</p>
//                             <p className="text-[11px] text-slate-500">NIP: {item.matchedAsnData.nip}</p>
//                             <p className="text-[11px] text-slate-500 font-mono font-semibold">NIK Master: {item.matchedAsnData.nikAsn}</p>
//                             <span className="inline-block mt-1 text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded font-medium">
//                               {item.matchReason}
//                             </span>
//                           </div>
//                         ) : (
//                           <span className="text-slate-400">-</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }




// "use client";

// import React, { useState } from "react";
// import * as XLSX from "xlsx";
// import {
//   Search,
//   Download,
//   Filter,
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

//   // Filter & Search states
//   const [searchTerm, setSearchTerm] = useState<string>("");
//   const [selectedKampus, setSelectedKampus] = useState<string>("ALL");
//   const [statusFilter, setStatusFilter] = useState<string>("ALL");

//   // 3. Gunakan Guard Optional Chaining (data?.map) agar tidak pernah memicu runtime error
//   const listKampus = Array.from(
//     new Set((data || []).map((d) => d?.namaKampus))
//   ).filter((k) => k && k !== "-" && k !== "");

//   // Indikator apakah pengguna sedang melakukan pencarian
//   const isSearchActive =
//     searchTerm.trim().length > 0 ||
//     selectedKampus !== "ALL" ||
//     statusFilter !== "ALL";

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

//         const matchesKampus =
//           selectedKampus === "ALL" ? true : item?.namaKampus === selectedKampus;

//         const statusPortal = item?.portalDikti ? item.portalDikti.toUpperCase() : "";
//         const matchesStatus =
//           statusFilter === "ALL"
//             ? true
//             : statusFilter === "AKTIF"
//             ? statusPortal.includes("AKTIF") && !statusPortal.includes("NON")
//             : statusPortal.includes(statusFilter);

//         return matchesSearch && matchesKampus && matchesStatus;
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
//     setSelectedKampus("ALL");
//     setStatusFilter("ALL");
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-8 md:px-8 sm:py-0">
//       <div className="mx-auto max-w-[1700px] space-y-6">
//         {/* Header Section — Kop Surat */}
//         <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] md:px-10">
//           <div className="relative flex flex-col items-center gap-2 text-center">
//             <img
//               src="/logo-deiyai.png"
//               alt="Logo Kabupaten Deiyai"
//               className="absolute left-0 top-0 h-20 w-20 shrink-0 object-contain md:h-24 md:w-24"
//             />
//             <div className="w-full  pb-3">
//               <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900 underline underline-offset-4 md:text-2xl">
//                 Pemerintah Kabupaten Deiyai
//               </h2>
//               <p className="mt-0.5 text-base font-semibold uppercase tracking-wide text-slate-800 md:text-lg">
//                 Sekretariat Daerah
//               </p>
//               <p className="mt-1 text-xs italic text-slate-500 underline underline-offset-2 md:text-sm">
//                 Alamat : Kompleks Perkantoran Pemda Deiyai - Papua Tengah
//               </p>
//             </div>
//           </div>

//           <div className="mx-auto mt-5 h-[3px] w-full bg-slate-800" />

//           <div className="mt-5 flex items-center gap-3">
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-600/30">
//               <GraduationCap className="h-5 w-5" />
//             </div>
//             <div>
//               <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900 md:text-xl">
//                 Hasil Verifikasi Bantuan Tugas Akhir Mahasiswa Kabupaten Deiyai Tahun 2026
//               </h1>
//               <p className="mt-0.5 text-sm text-slate-500">
//                 Sistem pencarian cepat data mahasiswa terverifikasi.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Ringkasan Statistik */}
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <StatCard
//             icon={<Users className="h-5 w-5" />}
//             iconBg="bg-purple-50 text-purple-600"
//             label="Total Database"
//             value={`${data?.length || 0} Mahasiswa`}
//           />
//           <StatCard
//             icon={<CheckCircle2 className="h-5 w-5" />}
//             iconBg="bg-emerald-50 text-emerald-600"
//             label="Hasil Ditemukan"
//             value={isSearchActive ? filteredData.length : 0}
//           />
//           <StatCard
//             icon={<Building2 className="h-5 w-5" />}
//             iconBg="bg-blue-50 text-blue-600"
//             label="Total Kampus"
//             value={listKampus.length}
//           />
//         </div>

//         {/* Input Pencarian & Filter */}
//         <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
//           <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
//             {/* Input Form Search */}
//             <div className="relative flex-1">
//               <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />
//               <input
//                 type="text"
//                 placeholder="Ketik Nama Mahasiswa, NIK, NIM, atau Jurusan untuk mencari..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-10 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 transition focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10"
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

//             {/* Filter Kampus & Button Export */}
//             <div className="flex flex-wrap items-center gap-3">
//               <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-600">
//                 <Filter className="h-4 w-4 text-purple-500" />
//                 <select
//                   value={selectedKampus}
//                   onChange={(e) => setSelectedKampus(e.target.value)}
//                   className="max-w-[200px] cursor-pointer bg-transparent focus:outline-none"
//                 >
//                   <option value="ALL">Semua Kampus ({listKampus.length})</option>
//                   {listKampus.map((k, i) => (
//                     <option key={i} value={k}>
//                       {k}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {isSearchActive && filteredData.length > 0 && (
//                 <button
//                   onClick={exportToExcel}
//                   className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
//                 >
//                   <Download className="h-4 w-4" />
//                   Export Hasil
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Filter Status Dikti */}
//           <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
//             <div className="flex gap-2">
//               <StatusButton
//                 active={statusFilter === "ALL"}
//                 onClick={() => setStatusFilter("ALL")}
//                 activeClass="bg-purple-600 text-white shadow-sm shadow-purple-600/25"
//               >
//                 Semua Status
//               </StatusButton>
//               {/* <StatusButton
//                 active={statusFilter === "AKTIF"}
//                 onClick={() => setStatusFilter("AKTIF")}
//                 activeClass="bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
//               >
//                 Mahasiswa Aktif
//               </StatusButton>
//               <StatusButton
//                 active={statusFilter === "NON"}
//                 onClick={() => setStatusFilter("NON")}
//                 activeClass="bg-rose-600 text-white shadow-sm shadow-rose-600/25"
//               >
//                 Non-Aktif / Lulus
//               </StatusButton> */}
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
//           <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
//             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
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

//         {/* Tampilan 2: Tabel Hasil Pencarian */}
//         {isSearchActive && (
//           <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-14px_rgba(15,23,42,0.14)]">
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[900px] border-collapse text-left text-xs">
//                 <thead>
//                   <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
//                     <th className="whitespace-nowrap px-4 py-3.5">Nama Mahasiswa</th>
//                     <th className="whitespace-nowrap px-4 py-3.5">Jenis Kelamin</th>
//                     <th className="whitespace-nowrap px-4 py-3.5">Nama Kampus</th>
//                     <th className="whitespace-nowrap px-4 py-3.5">Jurusan</th>
//                     <th className="whitespace-nowrap px-4 py-3.5">Tahun Masuk Akademik</th>
//                     <th className="whitespace-nowrap px-4 py-3.5">Surat Keterangan Tugas Akhir</th>
//                     <th className="whitespace-nowrap px-4 py-3.5">Portal Dikti</th>
//                     <th className="whitespace-nowrap px-6 py-3.5">Verifikasi</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {filteredData.length === 0 ? (
//                     <tr>
//                       <td colSpan={8} className="p-12 text-center">
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
//                           className="transition-colors odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/60"
//                         >
//                           <td className="px-4 py-3.5 font-semibold text-slate-800">
//                             {row.namaMahasiswa}
//                           </td>
//                           <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
//                             {row.jenisKelamin}
//                           </td>
//                           <td className="px-4 py-3.5 font-medium text-purple-900">
//                             {row.namaKampus}
//                           </td>
//                           <td className="px-4 py-3.5 text-slate-600">{row.jurusan}</td>
//                           <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
//                             {row.tahunMasuk}
//                           </td>
//                           <td className="max-w-[220px] px-4 py-3.5 text-slate-600">
//                             <span className="block truncate" title={row.suratKet}>
//                               {row.suratKet}
//                             </span>
//                           </td>
//                           <td className="whitespace-nowrap px-4 py-3.5">
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
//                           <td className="max-w-[600px] px-10 py-8">
//                             {row.verifikasi && row.verifikasi !== "nan" ? (
//                               <span
//                                 className=" rounded-sm  px-8 py-1   text-[14px]"
//                                 title={row.verifikasi}
//                               >
//                                 {row.verifikasi}
//                               </span>
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

//             <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
//               <span>
//                 Ditemukan <strong className="font-semibold text-slate-700">{filteredData.length}</strong> baris data yang cocok
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

import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Search,
  Download,
  Filter,
  Users,
  CheckCircle2,
  Building2,
  GraduationCap,
  Info,
  X,
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

export default function RekapanMahasiswaPage() {
  // 2. Ambil data dengan fallback Array Kosong jika DATA_MAHASISWA undefined/bukan array
  const initialData: MahasiswaRecord[] = Array.isArray(DATA_MAHASISWA)
    ? (DATA_MAHASISWA as unknown as MahasiswaRecord[])
    : ((DATA_MAHASISWA as any)?.data as MahasiswaRecord[]) || []; // Jaga-jaga jika JSON dibungkus object { "data": [...] }

  const [data] = useState<MahasiswaRecord[]>(initialData);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedKampus, setSelectedKampus] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // 3. Gunakan Guard Optional Chaining (data?.map) agar tidak pernah memicu runtime error
  const listKampus = Array.from(
    new Set((data || []).map((d) => d?.namaKampus))
  ).filter((k) => k && k !== "-" && k !== "");

  // Indikator apakah pengguna sedang melakukan pencarian
  const isSearchActive =
    searchTerm.trim().length > 0 ||
    selectedKampus !== "ALL" ||
    statusFilter !== "ALL";

  // Logic Pencarian Real-Time
  const filteredData = isSearchActive
    ? (data || []).filter((item) => {
        const matchesSearch =
          searchTerm.trim() === ""
            ? true
            : item?.namaMahasiswa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.nik?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.jurusan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item?.nim?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesKampus =
          selectedKampus === "ALL" ? true : item?.namaKampus === selectedKampus;

        const statusPortal = item?.portalDikti ? item.portalDikti.toUpperCase() : "";
        const matchesStatus =
          statusFilter === "ALL"
            ? true
            : statusFilter === "AKTIF"
            ? statusPortal.includes("AKTIF") && !statusPortal.includes("NON")
            : statusPortal.includes(statusFilter);

        return matchesSearch && matchesKampus && matchesStatus;
      })
    : [];

  // Export Hasil Pencarian ke Excel — mengikuti kolom yang ditampilkan
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
    setSelectedKampus("ALL");
    setStatusFilter("ALL");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-8 md:px-8 lg:py-1">
      <div className="mx-auto max-w-[1700px] space-y-6">
        {/* Header Section — Kop Surat */}
        <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)] md:px-10">
          <div className="relative flex flex-col items-center gap-2 text-center">
            <img
              src="/logo-deiyai.png"
              alt="Logo Kabupaten Deiyai"
              className="absolute left-0 top-0 h-20 w-20 shrink-0 object-contain md:h-24 md:w-24"
            />
            <div className="w-full  pb-3">
              <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900 underline underline-offset-4 md:text-2xl">
                Pemerintah Kabupaten Deiyai
              </h2>
              <p className="mt-0.5 text-base font-semibold uppercase tracking-wide text-slate-800 md:text-lg">
                Sekretariat Daerah
              </p>
              <p className="mt-1 text-xs italic text-slate-500 underline underline-offset-2 md:text-sm">
                Alamat : Kompleks Perkantoran Pemda Deiyai - Papua Tengah
              </p>
            </div>
          </div>

          <div className="mx-auto mt-5 h-[3px] w-full bg-slate-800" />

          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-600/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900 md:text-xl">
                Hasil Verifikasi Bantuan Tugas Akhir Mahasiswa Kabupaten Deiyai Tahun 2026
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Sistem pencarian cepat data mahasiswa terverifikasi.
              </p>
            </div>
          </div>
        </div>

        {/* Ringkasan Statistik */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-purple-50 text-purple-600"
            label="Total Database"
            value={`${data?.length || 0} Mahasiswa`}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-emerald-50 text-emerald-600"
            label="Hasil Ditemukan"
            value={isSearchActive ? filteredData.length : 0}
          />
          <StatCard
            icon={<Building2 className="h-5 w-5" />}
            iconBg="bg-blue-50 text-blue-600"
            label="Total Kampus"
            value={listKampus.length}
          />
        </div>

        {/* Input Pencarian & Filter */}
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.10)]">
          <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
            {/* Input Form Search */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-purple-500" />
              <input
                type="text"
                placeholder="Ketik Nama Mahasiswa, NIK, NIM, atau Jurusan untuk mencari..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-11 pr-10 text-sm font-medium text-slate-800 placeholder:font-normal placeholder:text-slate-400 transition focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Hapus pencarian"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Kampus & Button Export */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-600">
                <Filter className="h-4 w-4 text-purple-500" />
                <select
                  value={selectedKampus}
                  onChange={(e) => setSelectedKampus(e.target.value)}
                  className="max-w-[200px] cursor-pointer bg-transparent focus:outline-none"
                >
                  <option value="ALL">Semua Kampus ({listKampus.length})</option>
                  {listKampus.map((k, i) => (
                    <option key={i} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              {isSearchActive && filteredData.length > 0 && (
                <button
                  onClick={exportToExcel}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/20 transition hover:bg-emerald-700"
                >
                  <Download className="h-4 w-4" />
                  Export Hasil
                </button>
              )}
            </div>
          </div>

          {/* Filter Status Dikti */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
            <div className="flex gap-2">
              <StatusButton
                active={statusFilter === "ALL"}
                onClick={() => setStatusFilter("ALL")}
                activeClass="bg-purple-600 text-white shadow-sm shadow-purple-600/25"
              >
                Semua Status
              </StatusButton>
            </div>

            {isSearchActive && (
              <button
                onClick={resetSearch}
                className="text-xs font-semibold text-rose-600 transition hover:text-rose-700 hover:underline"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        </div>

        {/* Tampilan 1: Belum Melakukan Pencarian */}
        {!isSearchActive && (
          <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 text-purple-600">
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

        {/* Tampilan 2: Tabel Hasil Pencarian — gaya grid rapi seperti SIPD */}
        {isSearchActive && (
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-14px_rgba(15,23,42,0.14)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-slate-100 text-[11px] text-bold uppercase tracking-wide text-slate-700">
                    <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-center">
                      Nama Mahasiswa
                    </th>
                    <th className="whitespace-nowrap border border-slate-300 px-4 py-3 text-bold  text-center">
                      Jenis Kelamin
                    </th>
                    <th className="whitespace-nowrap border text-bold  border-slate-300 px-4 py-3 text-center">
                      Nama Kampus
                    </th>
                    <th className="whitespace-nowrap border text-bold  border-slate-300 px-4 py-3 text-center">
                      Jurusan
                    </th>
                    <th className="whitespace-nowrap border  text-bold  border-slate-300 px-4 py-3 text-center">
                      Tahun Masuk Akademik
                    </th>
                    <th className="whitespace-nowrap border text-bold  border-slate-300 px-4 py-3 text-center">
                      Surat Keterangan Tugas Akhir
                    </th>
                    <th className="whitespace-nowrap border text-bold border-slate-300 px-4 py-3 text-center">
                      Portal Dikti
                    </th>
                    <th className="whitespace-nowrap border text-bold border-slate-300 px- py-3 text-center">
                      Verifikasi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-slate-300 p-12 text-center">
                        <Info className="mx-auto mb-2 h-8 w-8 text-amber-500" />
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
                          className="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-purple-50/50"
                        >
                          <td className="border border-slate-200 px-4 py-2.5 align-top font-semibold text-slate-800">
                            {row.namaMahasiswa}
                          </td>
                          <td className="whitespace-nowrap border border-slate-200 px-4 py-2.5 align-top text-slate-600">
                            {row.jenisKelamin}
                          </td>
                          <td className="border border-slate-200 px-4 py-2.5 align-top font-medium text-purple-900">
                            {row.namaKampus}
                          </td>
                          <td className="border border-slate-200 px-4 py-2.5 align-top text-slate-600">
                            {row.jurusan}
                          </td>
                          <td className="whitespace-nowrap border border-slate-200 px-4 py-2.5 align-top text-slate-600">
                            {row.tahunMasuk}
                          </td>
                          <td className="max-w-[220px] border border-slate-200 px-4 py-2.5 align-top text-slate-600">
                            <span className="block truncate" title={row.suratKet}>
                              {row.suratKet}
                            </span>
                          </td>
                          <td className="whitespace-nowrap border border-slate-200 px-4 py-2.5 align-top">
                            <span
                              className={`inline-block rounded-sm border px-2.5 py-1 text-[11px] font-semibold ${
                                isAktif
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                              }`}
                            >
                              {row.portalDikti}
                            </span>
                          </td>
                          <td className="max-w-[240px] border border-slate-200 px-6 py-2.5 align-top text-md">
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

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3 text-xs text-slate-500">
              <span>
                Ditemukan{" "}
                <strong className="font-semibold text-slate-700">
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
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-14px_rgba(15,23,42,0.10)] transition hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-12px_rgba(15,23,42,0.16)]">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function StatusButton({
  active,
  onClick,
  activeClass,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeClass: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active ? activeClass : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
