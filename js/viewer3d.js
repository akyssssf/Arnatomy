/* ==========================================================================
   viewer3d.js — Penampil model organ 3D (FR-03 & FR-04)
   Modul ES6 yang memakai Three.js dari CDN. Dimuat sebagai <script type="module">
   sehingga berjalan setelah script klasik lain; kesiapannya diumumkan lewat
   event "viewer3d:siap".

   Tanggung jawab modul ini hanya scene 3D dan posisi layar tiap titik.
   Markup dan atribut ARIA titik interaktif tetap dibuat oleh halaman.
   ========================================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

window.App = window.App || {};

(function (App) {
  'use strict';

  const POSISI_KAMERA_AWAL = new THREE.Vector3(0, 0.12, 1.85);

  let sesi = null;          // seluruh objek Three.js untuk tampilan yang aktif

  /* ------------------------------------------------------------------ *
   * Pemuatan berkas model
   * ------------------------------------------------------------------ */
  function muatModel(loader, url, saatProgres) {
    return new Promise(function (resolve, reject) {
      loader.load(url, resolve, function (peristiwa) {
        if (saatProgres && peristiwa.total) {
          saatProgres(Math.round((peristiwa.loaded / peristiwa.total) * 100));
        }
      }, function () {
        reject(new Error('berkas model 3D gagal dimuat.'));
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Lapisan anatomi buatan di sekeliling organ (FR-05)
   * Model organ hanya berisi jantung, sehingga kulit, otot, dan tulang
   * dibentuk dari geometri sederhana sebagai selubung.
   * ------------------------------------------------------------------ */
  function buatLapisan() {
    function selubung(radius, panjang, warna, opasitas) {
      const bahan = new THREE.MeshStandardMaterial({
        color: warna, transparent: true, opacity: opasitas,
        roughness: 0.85, metalness: 0, side: THREE.DoubleSide, depthWrite: false
      });
      return new THREE.Mesh(new THREE.CapsuleGeometry(radius, panjang, 6, 32), bahan);
    }

    const kulit = selubung(0.66, 0.52, 0xf0c4a2, 0.13);
    const otot = selubung(0.58, 0.46, 0xb2495a, 0.15);

    const tulang = new THREE.Group();
    const bahanTulang = new THREE.MeshStandardMaterial({
      color: 0xdde5f0, transparent: true, opacity: 0.6, roughness: 0.6, metalness: 0
    });
    for (let i = 0; i < 5; i += 1) {
      const y = 0.42 - i * 0.2;
      const radius = 0.44 + Math.sin((i + 1) / 6 * Math.PI) * 0.1;
      [1, -1].forEach(function (arah) {
        const rusuk = new THREE.Mesh(
          new THREE.TorusGeometry(radius, 0.016, 8, 40, Math.PI * 0.72), bahanTulang
        );
        rusuk.rotation.x = Math.PI / 2;
        rusuk.rotation.z = arah > 0 ? Math.PI * 0.14 : Math.PI * 0.86;
        rusuk.position.y = y;
        tulang.add(rusuk);
      });
    }
    const tulangDada = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.05), bahanTulang);
    tulangDada.position.set(0, 0.05, 0.5);
    tulang.add(tulangDada);

    return { kulit: kulit, otot: otot, tulang: tulang };
  }

  /* ------------------------------------------------------------------ *
   * Membangun tampilan
   * @param {{wadah:HTMLElement, urlModel:string, titik:Array, saatProgres:Function}} opsi
   * ------------------------------------------------------------------ */
  async function init(opsi) {
    bersihkan();

    const wadah = opsi.wadah;
    /* Mode dekoratif dipakai hero halaman lain: tanpa titik, berputar pelan */
    const dekoratif = Boolean(opsi.dekoratif);
    const posisiAwal = POSISI_KAMERA_AWAL.clone();
    if (opsi.jarak) posisiAwal.setLength(opsi.jarak);
    let lebar = wadah.clientWidth || 1;
    let tinggi = wadah.clientHeight || 1;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (kesalahan) {
      throw new Error('peramban ini tidak mendukung WebGL.');
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(lebar, tinggi);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    wadah.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(42, lebar / tinggi, 0.01, 100);
    camera.position.copy(posisiAwal);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.rotateSpeed = 0.85;
    controls.zoomSpeed = 0.8;
    /* Roda mouse dibiarkan menggulir halaman; zoom lewat Ctrl/Cmd + gulir,
       cubit trackpad, atau tombol perbesar dan perkecil. */
    controls.enableZoom = false;
    if (dekoratif) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = opsi.kecepatanPutar || 0.9;
      controls.enableRotate = opsi.bolehSeret !== false;
      controls.minPolarAngle = Math.PI * 0.35;
      controls.maxPolarAngle = Math.PI * 0.65;
    }
    controls.minDistance = 1.1;
    controls.maxDistance = 4;
    controls.autoRotateSpeed = 1.4;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x93a8cc, 0.45));
    const cahayaUtama = new THREE.DirectionalLight(0xffffff, 1.5);
    cahayaUtama.position.set(2.5, 3, 4);
    scene.add(cahayaUtama);
    const cahayaIsi = new THREE.DirectionalLight(0xd9e5ff, 0.6);
    cahayaIsi.position.set(-3, 0.5, -2.5);
    scene.add(cahayaIsi);

    const panggung = new THREE.Group();
    scene.add(panggung);

    /* --- Memuat organ dan menormalkan ukuran serta titik pusatnya --- */
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);

    const gltf = await muatModel(loader, opsi.urlModel, opsi.saatProgres);
    const organ = gltf.scene;

    const kotak = new THREE.Box3().setFromObject(organ);
    const ukuran = kotak.getSize(new THREE.Vector3());
    const pusat = kotak.getCenter(new THREE.Vector3());
    const skala = 1 / Math.max(ukuran.x, ukuran.y, ukuran.z);

    organ.position.sub(pusat);
    const pembungkus = new THREE.Group();
    pembungkus.add(organ);
    pembungkus.scale.setScalar(skala);
    panggung.add(pembungkus);

    /* Ukuran kotak batas setelah dinormalkan, dipakai menerjemahkan
       posisi_koordinat_3d (pecahan) menjadi titik di ruang 3D. */
    const ukuranNormal = ukuran.clone().multiplyScalar(skala);

    const lapisan = buatLapisan();
    Object.keys(lapisan).forEach(function (nama) {
      lapisan[nama].visible = false;
      panggung.add(lapisan[nama]);
    });

    const raycaster = new THREE.Raycaster();

    /* Matriks dunia perlu diperbarui lebih dulu; tanpa ini raycast dijalankan
       terhadap posisi objek sebelum diskalakan dan tidak mengenai apa pun. */
    panggung.updateMatrixWorld(true);

    /* posisi_koordinat_3d dipakai sebagai titik bidik. Sinar ditembakkan dari
       posisi kamera awal ke arah titik itu, lalu penanda diletakkan pada
       permukaan pertama yang terkena, sehingga penanda selalu terlihat dari
       sudut pandang awal dan tetap menempel pada organ. */
    function tempelkanKePermukaan(sasaran) {
      const arah = sasaran.clone().sub(posisiAwal).normalize();
      raycaster.set(posisiAwal, arah);
      const kena = raycaster.intersectObject(pembungkus, true);
      if (!kena.length) return sasaran;
      return kena[0].point.clone().addScaledVector(arah, -0.035);
    }

    const titik = (opsi.titik || []).map(function (t) {
      const sasaran = new THREE.Vector3(
        t.x * ukuranNormal.x, t.y * ukuranNormal.y, t.z * ukuranNormal.z
      );
      const posisi = tempelkanKePermukaan(sasaran);
      return {
        id: t.id,
        el: t.el,
        posisi: posisi,
        /* Arah keluar permukaan, dipakai menguji apakah titik menghadap kamera */
        normal: posisi.clone().normalize(),
        tertutup: false,
        tersembunyi: false
      };
    });
    const layar = new THREE.Vector3();
    const arahPandang = new THREE.Vector3();
    let targetKamera = null;   // tujuan animasi kamera saat sebuah titik dipilih
    let perluGambar = true;    // penanda render sesuai kebutuhan

    function mintaGambar() { perluGambar = true; }
    controls.addEventListener('change', mintaGambar);

    function perbaruiTitik() {
      camera.getWorldDirection(arahPandang);

      titik.forEach(function (t) {
        layar.copy(t.posisi).project(camera);
        const tersembunyi = layar.z > 1;
        const x = (layar.x * 0.5 + 0.5) * lebar;
        const y = (-layar.y * 0.5 + 0.5) * tinggi;

        t.el.style.transform = 'translate(' + x + 'px, ' + y + 'px) translate(-50%, -50%)';
        if (t.tersembunyi !== tersembunyi) {
          t.el.hidden = tersembunyi;
          t.tersembunyi = tersembunyi;
        }
        if (tersembunyi) return;

        /* Titik di sisi belakang organ diredupkan. Cukup dibandingkan arah
           keluar permukaan dengan arah pandang kamera, jauh lebih murah
           daripada menembakkan sinar ke mesh setiap frame. */
        const tertutup = t.normal.dot(arahPandang) > -0.12;
        if (t.tertutup !== tertutup) {
          t.el.classList.toggle('titik-tertutup', tertutup);
          t.tertutup = tertutup;
        }
      });
    }

    /* Render hanya saat ada perubahan: kamera bergerak, ukuran berubah, atau
       putar otomatis menyala. Saat diam, halaman tidak dibebani sama sekali. */
    function gambar() {
      if (targetKamera) {
        camera.position.lerp(targetKamera, 0.09);
        if (camera.position.distanceTo(targetKamera) < 0.005) targetKamera = null;
        perluGambar = true;
      }
      const kameraBergerak = controls.update();
      if (!perluGambar && !kameraBergerak && !controls.autoRotate) return;
      perluGambar = false;
      renderer.render(scene, camera);
      perbaruiTitik();
    }
    renderer.setAnimationLoop(gambar);

    const pengamat = new ResizeObserver(function () {
      lebar = wadah.clientWidth || 1;
      tinggi = wadah.clientHeight || 1;
      camera.aspect = lebar / tinggi;
      camera.updateProjectionMatrix();
      renderer.setSize(lebar, tinggi);
      mintaGambar();
    });
    pengamat.observe(wadah);

    /* Penampil dihentikan total ketika tergulir keluar layar */
    const pengamatTampak = new IntersectionObserver(function (entri) {
      renderer.setAnimationLoop(entri[0].isIntersecting ? gambar : null);
      if (entri[0].isIntersecting) mintaGambar();
    }, { threshold: 0 });
    pengamatTampak.observe(wadah);

    /* Zoom roda hanya bila Ctrl/Cmd ditahan (atau cubit trackpad),
       supaya menggulir halaman di atas model tetap normal. */
    function saatRoda(e) {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      ubahJarak(e.deltaY > 0 ? 1.08 : 0.93);
      mintaGambar();
    }
    renderer.domElement.addEventListener('wheel', saatRoda, { passive: false });

    sesi = {
      renderer: renderer, scene: scene, camera: camera, controls: controls,
      pmrem: pmrem, pengamat: pengamat, pengamatTampak: pengamatTampak,
      wadah: wadah, lapisan: lapisan, titik: titik, panggung: panggung,
      mintaGambar: mintaGambar,
      arahkanKamera: function (posisi) { targetKamera = posisi; perluGambar = true; }
    };
  }

  /* ------------------------------------------------------------------ *
   * Kendali dari halaman
   * ------------------------------------------------------------------ */
  function setLapisan(nama, terlihat) {
    if (!sesi) return;
    if (nama === 'organ_dalam') {
      sesi.panggung.children[0].visible = terlihat;
      sesi.mintaGambar();
      return;
    }
    if (sesi.lapisan[nama]) sesi.lapisan[nama].visible = terlihat;
    sesi.mintaGambar();
    sesuaikanJarak();
  }

  /* Selubung kulit, otot, dan tulang lebih besar daripada organ, sehingga
     kamera dimundurkan otomatis agar seluruh lapisan tetap masuk bingkai. */
  function sesuaikanJarak() {
    if (!sesi) return;
    const adaSelubung = Object.keys(sesi.lapisan).some(function (nama) {
      return sesi.lapisan[nama].visible;
    });
    const jarakSekarang = sesi.camera.position.distanceTo(sesi.controls.target);
    const jarakTujuan = adaSelubung ? 2.55 : 1.85;
    if (Math.abs(jarakSekarang - jarakTujuan) < 0.05) return;
    if (adaSelubung && jarakSekarang > jarakTujuan) return;
    const arah = sesi.camera.position.clone().sub(sesi.controls.target).setLength(jarakTujuan);
    sesi.arahkanKamera(sesi.controls.target.clone().add(arah));
  }

  function setAutoRotasi(nyala) {
    if (!sesi) return;
    sesi.controls.autoRotate = nyala;
    sesi.mintaGambar();
  }

  function ubahJarak(faktor) {
    if (!sesi) return;
    const arah = sesi.camera.position.clone().sub(sesi.controls.target);
    const jarak = THREE.MathUtils.clamp(
      arah.length() * faktor, sesi.controls.minDistance, sesi.controls.maxDistance
    );
    sesi.camera.position.copy(sesi.controls.target).add(arah.setLength(jarak));
    sesi.mintaGambar();
  }

  function reset() {
    if (!sesi) return;
    sesi.controls.autoRotate = false;
    sesi.arahkanKamera(POSISI_KAMERA_AWAL.clone());
  }

  /** Memutar kamera sampai menghadap titik yang dipilih pengguna. */
  function hadapkanKe(idTitik) {
    if (!sesi) return;
    const t = sesi.titik.find(function (x) { return x.id === idTitik; });
    if (!t) return;
    const jarak = sesi.camera.position.distanceTo(sesi.controls.target);
    const arah = t.posisi.clone().normalize();
    if (arah.lengthSq() === 0) return;
    arah.y = Math.max(arah.y, -0.2) + 0.18;
    sesi.controls.autoRotate = false;
    sesi.arahkanKamera(arah.normalize().multiplyScalar(jarak));
  }

  /** Mengembalikan isi kanvas saat ini sebagai data URL gambar. */
  function cuplikan(jenis, mutu) {
    if (!sesi) return null;
    sesi.renderer.render(sesi.scene, sesi.camera);
    return sesi.renderer.domElement.toDataURL(jenis || 'image/webp', mutu || 0.92);
  }

  function bersihkan() {
    if (!sesi) return;
    sesi.renderer.setAnimationLoop(null);
    sesi.pengamat.disconnect();
    sesi.pengamatTampak.disconnect();
    sesi.controls.dispose();
    sesi.scene.traverse(function (objek) {
      if (objek.geometry) objek.geometry.dispose();
      if (!objek.material) return;
      const bahan = Array.isArray(objek.material) ? objek.material : [objek.material];
      bahan.forEach(function (m) {
        Object.keys(m).forEach(function (kunci) {
          const nilai = m[kunci];
          if (nilai && nilai.isTexture) nilai.dispose();
        });
        m.dispose();
      });
    });
    sesi.pmrem.dispose();
    sesi.renderer.dispose();
    if (sesi.renderer.domElement.parentNode) {
      sesi.renderer.domElement.parentNode.removeChild(sesi.renderer.domElement);
    }
    sesi = null;
  }

  App.viewer3d = {
    init: init,
    bersihkan: bersihkan,
    setLapisan: setLapisan,
    setAutoRotasi: setAutoRotasi,
    ubahJarak: ubahJarak,
    reset: reset,
    hadapkanKe: hadapkanKe,
    cuplikan: cuplikan
  };

  document.dispatchEvent(new CustomEvent('viewer3d:siap'));
})(window.App);
