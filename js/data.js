/* ==========================================================================
   data.js — Data awal (seed) mengikuti kamus data SKPL Bab VI
   Tabel: users, organs, body_parts, layers, part_content
   Catatan: seluruh data hanya hidup di memori (tanpa localStorage/sessionStorage).
   ========================================================================== */
window.App = window.App || {};

(function (App) {
  'use strict';

  /* Akun dummy (password sengaja plain text — prototipe front-end saja.
     Pada sistem nyata NFR-01 mewajibkan hashing bcrypt di sisi server). */
  const users = [
    { id_user: 1, nama: 'Nehan Raki Alfawzi', email: 'siswa@arnatomy.id', password: 'siswa123', role: 'siswa', asal_sekolah: 'SMPN 1 Madiun' },
    { id_user: 2, nama: 'Bu Ratna, S.Pd.',    email: 'guru@arnatomy.id',  password: 'guru123',  role: 'guru',  asal_sekolah: 'SMAN 2 Madiun' },
    { id_user: 3, nama: 'Admin Konten',       email: 'admin@arnatomy.id', password: 'admin123', role: 'admin', asal_sekolah: null }
  ];

  const organs = [
    {
      id_organ: 1,
      nama_organ: 'Jantung',
      sistem_organ: 'Sistem Peredaran Darah',
      julukan: 'Pompa yang tidak pernah libur',
      file_model_3d: 'assets/models/heart.glb',
      deskripsi: 'Organ berotot seukuran kepalan tangan yang memompa darah ke seluruh tubuh, ' +
        'mengantar oksigen dan zat gizi ke setiap sel, lalu membawa pulang karbon dioksida untuk dibuang.',
      fakta: [
        { label: 'Ukuran', nilai: 'Sebesar kepalan tangan pemiliknya' },
        { label: 'Berat', nilai: '250 sampai 350 gram' },
        { label: 'Denyut', nilai: 'Sekitar 100.000 kali per hari' },
        { label: 'Letak', nilai: 'Di belakang tulang dada, condong ke kiri' },
        { label: 'Suplai darah', nilai: 'Arteri koroner kiri dan kanan' },
        { label: 'Jumlah ruang', nilai: '4 ruang, 4 katup' }
      ]
    }
  ];

  /* Urutan render layer dari luar ke dalam (SKPL: tabel layers) */
  const layers = [
    { id_layer: 1, id_organ: 1, nama_layer: 'kulit',       label: 'Kulit',       urutan_tampil: 1 },
    { id_layer: 2, id_organ: 1, nama_layer: 'otot',        label: 'Otot',        urutan_tampil: 2 },
    { id_layer: 3, id_organ: 1, nama_layer: 'tulang',      label: 'Tulang',      urutan_tampil: 3 },
    { id_layer: 4, id_organ: 1, nama_layer: 'organ_dalam', label: 'Organ Dalam', urutan_tampil: 4 }
  ];

  /* posisi_koordinat_3d disimpan "x,y,z" sesuai SKPL, dinyatakan sebagai pecahan
     terhadap kotak batas (bounding box) model sehingga tidak bergantung skala file.
     posisi_2d dipakai ilustrasi SVG cadangan bila WebGL atau model 3D gagal dimuat. */
  const body_parts = [
    {
      id_bagian: 1, id_organ: 1, nama_bagian_internal: 'Atrium Kanan', parent_bagian_id: null,
      posisi_koordinat_3d: '-0.24,0.14,0.24', posisi_2d: '35,39',
      fakta: [
        { label: 'Tebal dinding', nilai: 'Sekitar 2 mm' },
        { label: 'Menerima dari', nilai: 'Vena cava superior dan inferior' },
        { label: 'Mengalir ke', nilai: 'Ventrikel kanan' }
      ]
    },
    {
      id_bagian: 2, id_organ: 1, nama_bagian_internal: 'Atrium Kiri', parent_bagian_id: null,
      posisi_koordinat_3d: '0.25,0.17,0.10', posisi_2d: '63,39',
      fakta: [
        { label: 'Menerima dari', nilai: 'Empat vena pulmonalis' },
        { label: 'Mengalir ke', nilai: 'Ventrikel kiri' },
        { label: 'Posisi', nilai: 'Ruang jantung paling belakang' }
      ]
    },
    {
      id_bagian: 3, id_organ: 1, nama_bagian_internal: 'Ventrikel Kanan', parent_bagian_id: null,
      posisi_koordinat_3d: '-0.16,-0.22,0.30', posisi_2d: '40,64',
      fakta: [
        { label: 'Tebal dinding', nilai: '3 sampai 5 mm' },
        { label: 'Memompa ke', nilai: 'Paru-paru lewat arteri pulmonalis' },
        { label: 'Tekanan', nilai: 'Sekitar 25 mmHg' }
      ]
    },
    {
      id_bagian: 4, id_organ: 1, nama_bagian_internal: 'Ventrikel Kiri', parent_bagian_id: null,
      posisi_koordinat_3d: '0.18,-0.26,0.18', posisi_2d: '63,66',
      fakta: [
        { label: 'Tebal dinding', nilai: '8 sampai 15 mm' },
        { label: 'Memompa ke', nilai: 'Seluruh tubuh lewat aorta' },
        { label: 'Tekanan', nilai: 'Sekitar 120 mmHg' }
      ]
    },
    {
      id_bagian: 5, id_organ: 1, nama_bagian_internal: 'Aorta', parent_bagian_id: null,
      posisi_koordinat_3d: '0.00,0.44,-0.02', posisi_2d: '50,19',
      fakta: [
        { label: 'Diameter', nilai: '2,5 sampai 3,5 cm' },
        { label: 'Jenis', nilai: 'Arteri terbesar dalam tubuh' },
        { label: 'Bagian', nilai: 'Aorta asenden, arkus, aorta desenden' }
      ]
    },
    {
      id_bagian: 6, id_organ: 1, nama_bagian_internal: 'Katup Mitral', parent_bagian_id: 2,
      posisi_koordinat_3d: '0.16,0.02,0.22', posisi_2d: '58,52',
      fakta: [
        { label: 'Jumlah daun', nilai: '2 daun katup (bikuspidalis)' },
        { label: 'Letak', nilai: 'Antara atrium kiri dan ventrikel kiri' },
        { label: 'Menutup saat', nilai: 'Ventrikel berkontraksi (sistol)' }
      ]
    }
  ];

  /* part_content: jenis_konten 'dasar' (FR-06) & 'dimmed' (FR-07) */
  const part_content = [
    {
      id_konten: 1, id_bagian: 1, jenis_konten: 'dasar', judul_tampil: 'Atrium Kanan',
      deskripsi: 'Ruang jantung kanan atas yang menerima darah miskin oksigen dari seluruh tubuh melalui vena cava superior dan vena cava inferior, lalu mengalirkannya ke ventrikel kanan.',
      status_tampilan: 'aktif', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 2, id_bagian: 1, jenis_konten: 'dimmed', judul_tampil: 'Nodus SA & dinding atrium',
      deskripsi: 'Dinding atrium kanan hanya setebal ± 2 mm karena cukup mendorong darah sejauh satu ruang. Di dindingnya terdapat nodus sinoatrial (SA node), pemacu alami jantung yang memicu 60–100 denyut per menit tanpa perintah dari otak.',
      status_tampilan: 'dimmed', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 3, id_bagian: 2, jenis_konten: 'dasar', judul_tampil: 'Atrium Kiri',
      deskripsi: 'Ruang jantung kiri atas yang menerima darah kaya oksigen dari paru-paru melalui empat vena pulmonalis, kemudian meneruskannya ke ventrikel kiri lewat katup mitral.',
      status_tampilan: 'aktif', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 4, id_bagian: 2, jenis_konten: 'dimmed', judul_tampil: 'Posisi paling belakang',
      deskripsi: 'Atrium kiri adalah ruang jantung yang letaknya paling belakang, tepat di depan kerongkongan (esofagus). Karena itu pembesaran atrium kiri kadang terlihat menekan esofagus pada pemeriksaan pencitraan.',
      status_tampilan: 'dimmed', status_validasi: 'draft'
    },
    {
      id_konten: 5, id_bagian: 3, jenis_konten: 'dasar', judul_tampil: 'Ventrikel Kanan',
      deskripsi: 'Ruang pompa kanan bawah yang mendorong darah miskin oksigen menuju paru-paru melalui arteri pulmonalis untuk mengambil oksigen (peredaran darah kecil).',
      status_tampilan: 'aktif', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 6, id_bagian: 4, jenis_konten: 'dasar', judul_tampil: 'Ventrikel Kiri',
      deskripsi: 'Ruang pompa kiri bawah yang memompa darah kaya oksigen ke seluruh tubuh melalui aorta. Dindingnya paling tebal di antara empat ruang jantung (peredaran darah besar).',
      status_tampilan: 'aktif', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 7, id_bagian: 4, jenis_konten: 'dimmed', judul_tampil: 'Mengapa dindingnya paling tebal?',
      deskripsi: 'Tebal dinding ventrikel kiri 8–15 mm, kira-kira tiga kali ventrikel kanan. Sebabnya, ia harus melawan tekanan sistemik sekitar 120 mmHg untuk mengedarkan darah sampai ujung jari kaki, sementara ventrikel kanan hanya melawan ± 25 mmHg menuju paru-paru.',
      status_tampilan: 'dimmed', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 8, id_bagian: 5, jenis_konten: 'dasar', judul_tampil: 'Aorta',
      deskripsi: 'Pembuluh arteri terbesar dalam tubuh. Aorta membawa darah kaya oksigen keluar dari ventrikel kiri, melengkung membentuk arkus aorta, lalu bercabang ke kepala, lengan, dan seluruh tubuh bagian bawah.',
      status_tampilan: 'aktif', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 9, id_bagian: 5, jenis_konten: 'dimmed', judul_tampil: 'Dinding elastis (efek Windkessel)',
      deskripsi: 'Diameter aorta orang dewasa sekitar 2,5–3,5 cm. Dindingnya kaya serat elastin sehingga meregang saat jantung memompa (sistol) dan memantul balik saat jantung mengisi (diastol). Pantulan inilah yang membuat aliran darah tetap mengalir walau jantung sedang tidak berkontraksi.',
      status_tampilan: 'dimmed', status_validasi: 'tervalidasi'
    },
    {
      id_konten: 10, id_bagian: 6, jenis_konten: 'dasar', judul_tampil: 'Katup Mitral',
      deskripsi: 'Katup berdaun dua (bikuspidalis) di antara atrium kiri dan ventrikel kiri. Katup ini menutup saat ventrikel berkontraksi sehingga darah tidak kembali ke atrium — bunyi penutupannya menjadi bagian dari suara "lub" jantung.',
      status_tampilan: 'aktif', status_validasi: 'draft'
    }
  ];

  /* Basis pengetahuan untuk simulasi jawaban Asisten AI (FR-08).
     Bahasa disederhanakan untuk jenjang SMP-SMA. */
  const pengetahuan_ai = {
    1: {
      fungsi: 'Atrium kanan bertugas menampung darah kotor yang pulang dari seluruh tubuh, lalu meneruskannya ke ventrikel kanan.',
      letak: 'Letaknya di bagian kanan atas jantung, persis di ujung masuknya vena cava superior dan inferior.',
      gangguan: 'Gangguan yang sering dibahas adalah aritmia, karena nodus SA (pemacu jantung) berada di dinding atrium kanan.',
      ringkas: 'Anggap atrium kanan sebagai "ruang tunggu" darah kotor sebelum dipompa ke paru-paru.'
    },
    2: {
      fungsi: 'Atrium kiri menerima darah bersih dari paru-paru dan meneruskannya ke ventrikel kiri.',
      letak: 'Berada di kiri atas jantung dan merupakan ruang jantung yang posisinya paling belakang.',
      gangguan: 'Pada penyakit katup mitral, atrium kiri bisa membesar karena darah tertahan di dalamnya.',
      ringkas: 'Atrium kiri adalah pintu masuk darah kaya oksigen yang baru selesai "diisi ulang" di paru-paru.'
    },
    3: {
      fungsi: 'Ventrikel kanan memompa darah miskin oksigen ke paru-paru melalui arteri pulmonalis.',
      letak: 'Menempati bagian depan-bawah jantung, tepat di belakang tulang dada.',
      gangguan: 'Kalau tekanan di paru-paru tinggi, ventrikel kanan bisa menebal dan melemah.',
      ringkas: 'Ventrikel kanan adalah pompa jarak dekat: tujuannya hanya sampai paru-paru.'
    },
    4: {
      fungsi: 'Ventrikel kiri memompa darah kaya oksigen ke seluruh tubuh lewat aorta.',
      letak: 'Berada di kiri bawah jantung dan membentuk ujung runcing jantung (apeks).',
      gangguan: 'Tekanan darah tinggi yang lama membuat dinding ventrikel kiri menebal (hipertrofi).',
      ringkas: 'Ventrikel kiri adalah pompa terkuat: satu tekanannya harus sampai ke ujung jari kaki.'
    },
    5: {
      fungsi: 'Aorta menyalurkan darah kaya oksigen dari ventrikel kiri ke seluruh cabang tubuh.',
      letak: 'Keluar dari ventrikel kiri, melengkung di atas jantung, lalu turun di depan tulang belakang.',
      gangguan: 'Pelebaran dinding aorta (aneurisma) termasuk gangguan yang berbahaya.',
      ringkas: 'Aorta ibarat jalan tol utama peredaran darah sebelum bercabang ke jalan-jalan kecil.'
    },
    6: {
      fungsi: 'Katup mitral mencegah darah kembali ke atrium kiri ketika ventrikel kiri berkontraksi.',
      letak: 'Terletak di antara atrium kiri dan ventrikel kiri.',
      gangguan: 'Jika katup bocor (regurgitasi), sebagian darah berbalik arah dan jantung bekerja lebih berat.',
      ringkas: 'Katup mitral bekerja seperti pintu satu arah di dalam jantung.'
    }
  };

  App.seed = { users, organs, layers, body_parts, part_content, pengetahuan_ai };
})(window.App);
