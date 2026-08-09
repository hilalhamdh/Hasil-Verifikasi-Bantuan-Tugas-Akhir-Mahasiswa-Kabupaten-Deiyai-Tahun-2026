

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
import DATA_MAHASISWA from "./data-mahasiswa.json";

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
    <main className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 px-4 py-8 md:px-8 lg:py-10">
      <div className="mx-auto max-w-[1800px] space-y-6">
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
              {/* <StatusButton
                active={statusFilter === "AKTIF"}
                onClick={() => setStatusFilter("AKTIF")}
                activeClass="bg-emerald-600 text-white shadow-sm shadow-emerald-600/25"
              >
                Mahasiswa Aktif
              </StatusButton>
              <StatusButton
                active={statusFilter === "NON"}
                onClick={() => setStatusFilter("NON")}
                activeClass="bg-rose-600 text-white shadow-sm shadow-rose-600/25"
              >
                Non-Aktif / Lulus
              </StatusButton> */}
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

        {/* Tampilan 2: Tabel Hasil Pencarian */}
        {isSearchActive && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-14px_rgba(15,23,42,0.14)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="whitespace-nowrap px-4 py-3.5">Nama Mahasiswa</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Jenis Kelamin</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Nama Kampus</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Jurusan</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Tahun Masuk Akademik</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Surat Keterangan Tugas Akhir</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Portal Dikti</th>
                    <th className="whitespace-nowrap px-4 py-3.5">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
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
                          className="transition-colors odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/60"
                        >
                          <td className="px-4 py-3.5 font-semibold text-slate-800">
                            {row.namaMahasiswa}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                            {row.jenisKelamin}
                          </td>
                          <td className="px-4 py-3.5 font-medium text-purple-900">
                            {row.namaKampus}
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">{row.jurusan}</td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">
                            {row.tahunMasuk}
                          </td>
                          <td className="max-w-[220px] px-4 py-3.5 text-slate-600">
                            <span className="block truncate" title={row.suratKet}>
                              {row.suratKet}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5">
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
                          <td className="max-w-[220px] px-4 py-3.5">
                            {row.verifikasi && row.verifikasi !== "nan" ? (
                              <span
                                className="block truncate rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-800"
                                title={row.verifikasi}
                              >
                                {row.verifikasi}
                              </span>
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
                Ditemukan <strong className="font-semibold text-slate-700">{filteredData.length}</strong> baris data yang cocok
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
