// Model variables
let __laju_pembangunan_penambahan_odtw_;
let __rata_rata_kamar_per_unit_akomodasi_;
let __rata_rata_lama_menginap_tamu_;
let __tingkat_penghunian_kamar__tpk__;
let _batas_maksimum_efek_odtw;
let _bobot_daya_dukung_lahan;
let _bobot_kepadatan;
let _bobot_odtw;
let _daya_tarik_destinasi_wisata;
let _elastisitas_daya_tarik_odtw;
let _final_time;
let _initial_time;
let _insentif_kebijakan;
let _intensitas_tenaga_kerja;
let _intensitas_tenaga_kerja_awal;
let _investasi_sektor_pariwisata;
let _jumlah_hotel_dan_akomodasi;
let _jumlah_objek_daya_tarik_wisata;
let _jumlah_wisatawan;
let _kebijakan_konservasi_lahan;
let _kepadatan_referensi;
let _kepadatan_wisatawan;
let _lahan_per_hotel_dan_akomodasi;
let _lahan_per_odtw;
let _lahan_terbangun;
let _laju_demolisi_dasar;
let _laju_demolisi_hotel_dan_akomodasi;
let _laju_kedatangan_wisatawan;
let _laju_keluar_dasar_tenaga_kerja;
let _laju_keluar_tenaga_kerja_pariwisata;
let _laju_kenaikan_produktivitas;
let _laju_konstruksi_hotel_dan_akomodasi;
let _laju_konversi_dasar;
let _laju_konversi_lahan_non_pariwisata;
let _laju_konversi_lahan_pariwisata;
let _laju_pembangunan_odtw_non_investasi;
let _laju_penurunan_dasar;
let _laju_penurunan_wisatawan;
let _laju_penutupan_dasar_odtw;
let _laju_penutupan_odtw;
let _laju_penyerapan_tenaga_kerja_pariwisata;
let _laju_pertumbuhan_eksternal;
let _luas_lahan_tersedia;
let _malam_tersedia_per_kamar;
let _odtw_referensi;
let _pdrb_sektor_pariwisata;
let _pengeluaran_per_kunjungan;
let _pengeluaran_wisatawan;
let _proporsi_wisatawan_menginap;
let _rasio_daya_dukung_lahan;
let _rasio_daya_dukung_lahan_referensi;
let _rasio_investasi_terhadap_pdrb;
let _rasio_nilai_tambah_pariwisata;
let _rasio_permintaan_terhadap_kapasitas_kamar;
let _saveper;
let _sensitivitas_konstruksi_terhadap_tpk;
let _sensitivitas_odtw_terhadap_investasi;
let _tahun_dasar_intensitas_tenaga_kerja;
let _tenaga_kerja_dibutuhkan;
let _tenaga_kerja_pariwisata;
let _time_step;
let _tingkat_penghunian_ganda_kamar;
let _total_malam_menginap;
let _tpk_ambang;
let _waktu_penyesuaian_tenaga_kerja;

// Array dimensions


// Dimension mappings


// Lookup data arrays



// Time variable
let _time;
/*export*/ function setTime(time) {
  _time = time;
}

// Control variables
let controlParamsInitialized = false;
function initControlParamsIfNeeded() {
  if (controlParamsInitialized) {
    return;
  }

  if (fns === undefined) {
    throw new Error('Must call setModelFunctions() before running the model');
  }

  // We currently require INITIAL TIME and TIME STEP to be defined
  // as constant values.  Some models may define SAVEPER in terms of
  // TIME STEP (or FINAL TIME in terms of INITIAL TIME), which means
  // that the compiler may treat them as an aux, not as a constant.
  // We call initConstants() to ensure that we have initial values
  // for these control parameters.
  initConstants();
  if (_initial_time === undefined) {
    throw new Error('INITIAL TIME must be defined as a constant value');
  }
  if (_time_step === undefined) {
    throw new Error('TIME STEP must be defined as a constant value');
  }

  if (_final_time === undefined || _saveper === undefined) {
    // If _final_time or _saveper is undefined after calling initConstants(),
    // it means one or both is defined as an aux, in which case we perform
    // an initial step of the run loop in order to initialize the value(s).
    // First, set the time and initial function context.
    setTime(_initial_time);
    fns.setContext({
      timeStep: _time_step,
      currentTime: _time
    });

    // Perform initial step to initialize _final_time and/or _saveper
    initLevels();
    evalAux();
    if (_final_time === undefined) {
      throw new Error('FINAL TIME must be defined');
    }
    if (_saveper === undefined) {
      throw new Error('SAVEPER must be defined');
    }
  }

  controlParamsInitialized = true;
}
/*export*/ function getInitialTime() {
  initControlParamsIfNeeded();
  return _initial_time;
}
/*export*/ function getFinalTime() {
  initControlParamsIfNeeded();
  return _final_time;
}
/*export*/ function getTimeStep() {
  initControlParamsIfNeeded();
  return _time_step;
}
/*export*/ function getSaveFreq() {
  initControlParamsIfNeeded();
  return _saveper;
}

// Model functions
let fns;
/*export*/ function getModelFunctions() {
  return fns;
}
/*export*/ function setModelFunctions(functions /*: JsModelFunctions*/) {
  fns = functions;
}

// Internal helper functions
function multiDimArray(dimLengths) {
  if (dimLengths.length > 0) {
    const len = dimLengths[0]
    const arr = new Array(len)
    for (let i = 0; i < len; i++) {
      arr[i] = multiDimArray(dimLengths.slice(1))
    }
    return arr
  } else {
    return 0
  }
}

// Internal constants
const _NA_ = -Number.MAX_VALUE;

// Internal state
let lookups_initialized = false;
let data_initialized = false;

function initLookups() {
  // Initialize lookups
  if (!lookups_initialized) {
    lookups_initialized = true;
  }
}

function initData() {
  // Initialize data
  if (!data_initialized) {
    data_initialized = true;
  }
}

function initConstants0() {
  // "Rata-rata Kamar per Unit Akomodasi" = 21.4168
  __rata_rata_kamar_per_unit_akomodasi_ = 21.4168;
  // "Rata-rata Lama Menginap Tamu" = 1.427
  __rata_rata_lama_menginap_tamu_ = 1.427;
  // Batas Maksimum Efek ODTW = 1.5
  _batas_maksimum_efek_odtw = 1.5;
  // Bobot Daya Dukung Lahan = 0.25
  _bobot_daya_dukung_lahan = 0.25;
  // Bobot Kepadatan = 0.35
  _bobot_kepadatan = 0.35;
  // Bobot ODTW = 0.4
  _bobot_odtw = 0.4;
  // Elastisitas Daya Tarik ODTW = 0.3
  _elastisitas_daya_tarik_odtw = 0.3;
  // FINAL TIME = 2050
  _final_time = 2050.0;
  // INITIAL TIME = 2025
  _initial_time = 2025.0;
  // Insentif Kebijakan = 0
  _insentif_kebijakan = 0.0;
  // Intensitas Tenaga Kerja Awal = 21.5366
  _intensitas_tenaga_kerja_awal = 21.5366;
  // Kebijakan Konservasi Lahan = 0
  _kebijakan_konservasi_lahan = 0.0;
  // Kepadatan Referensi = 128.363
  _kepadatan_referensi = 128.363;
  // Lahan Per Hotel dan Akomodasi = 0.1
  _lahan_per_hotel_dan_akomodasi = 0.1;
  // Lahan Per ODTW = 0.5
  _lahan_per_odtw = 0.5;
  // Laju Demolisi Dasar = 0.05
  _laju_demolisi_dasar = 0.05;
  // Laju Keluar Dasar Tenaga Kerja = 0.03
  _laju_keluar_dasar_tenaga_kerja = 0.03;
  // Laju Kenaikan Produktivitas = 0.0110205
  _laju_kenaikan_produktivitas = 0.0110205;
  // Laju Konversi Dasar = 0.0436052
  _laju_konversi_dasar = 0.0436052;
  // Laju Pembangunan ODTW Non Investasi = 5.427
  _laju_pembangunan_odtw_non_investasi = 5.427;
  // Laju Penurunan Dasar = 0.207945
  _laju_penurunan_dasar = 0.207945;
  // Laju Penutupan Dasar ODTW = 0.0499327
  _laju_penutupan_dasar_odtw = 0.0499327;
  // Laju Pertumbuhan Eksternal = 0.27726
  _laju_pertumbuhan_eksternal = 0.27726;
  // Luas Lahan Tersedia = 317036
  _luas_lahan_tersedia = 317036.0;
  // Malam Tersedia per Kamar = 329.03
  _malam_tersedia_per_kamar = 329.03;
  // ODTW Referensi = 201
  _odtw_referensi = 201.0;
  // Pengeluaran per Kunjungan = 0.00272021
  _pengeluaran_per_kunjungan = 0.00272021;
  // Proporsi Wisatawan Menginap = 0.2058
  _proporsi_wisatawan_menginap = 0.2058;
  // Rasio Daya Dukung Lahan Referensi = 0.826425
  _rasio_daya_dukung_lahan_referensi = 0.826425;
  // Rasio Investasi terhadap PDRB = 0.0488174
  _rasio_investasi_terhadap_pdrb = 0.0488174;
}

function initConstants1() {
  // Rasio Nilai Tambah Pariwisata = 0.153094
  _rasio_nilai_tambah_pariwisata = 0.153094;
  // Sensitivitas Konstruksi terhadap TPK = 2.31385
  _sensitivitas_konstruksi_terhadap_tpk = 2.31385;
  // Sensitivitas ODTW terhadap Investasi = 0.01052
  _sensitivitas_odtw_terhadap_investasi = 0.01052;
  // TIME STEP = 1
  _time_step = 1.0;
  // TPK Ambang = 0.275
  _tpk_ambang = 0.275;
  // Tahun Dasar Intensitas Tenaga Kerja = 2025
  _tahun_dasar_intensitas_tenaga_kerja = 2025.0;
  // Tingkat Penghunian Ganda Kamar = 2.07
  _tingkat_penghunian_ganda_kamar = 2.07;
  // Waktu Penyesuaian Tenaga Kerja = 1
  _waktu_penyesuaian_tenaga_kerja = 1.0;
}

/*export*/ function initConstants() {
  // Initialize constants
  initConstants0();
  initConstants1();
  initLookups();
  initData();
}

function initLevels0() {
  // Jumlah Hotel dan Akomodasi = INTEG(Laju Konstruksi Hotel dan Akomodasi-Laju Demolisi Hotel dan Akomodasi,2291)
  _jumlah_hotel_dan_akomodasi = 2291.0;
  // Jumlah Objek Daya Tarik Wisata = INTEG("Laju Pembangunan/Penambahan ODTW"-Laju Penutupan ODTW,201)
  _jumlah_objek_daya_tarik_wisata = 201.0;
  // Jumlah Wisatawan = INTEG(Laju Kedatangan Wisatawan-Laju Penurunan Wisatawan,4.06957e+07)
  _jumlah_wisatawan = 40695700.0;
  // Lahan Terbangun = INTEG(Laju Konversi Lahan Non Pariwisata+Laju Konversi Lahan Pariwisata,55029.5)
  _lahan_terbangun = 55029.5;
  // Tenaga Kerja Pariwisata = INTEG(Laju Penyerapan Tenaga Kerja Pariwisata-Laju Keluar Tenaga Kerja Pariwisata,364994)
  _tenaga_kerja_pariwisata = 364994.0;
}

/*export*/ function initLevels() {
  // Initialize variables with initialization values, such as levels, and the variables they depend on
  initLevels0();
}

function evalAux0() {
  // Laju Demolisi Hotel dan Akomodasi = Jumlah Hotel dan Akomodasi*Laju Demolisi Dasar
  _laju_demolisi_hotel_dan_akomodasi = _jumlah_hotel_dan_akomodasi * _laju_demolisi_dasar;
  // Laju Penurunan Wisatawan = Jumlah Wisatawan*Laju Penurunan Dasar
  _laju_penurunan_wisatawan = _jumlah_wisatawan * _laju_penurunan_dasar;
  // Laju Penutupan ODTW = Jumlah Objek Daya Tarik Wisata*Laju Penutupan Dasar ODTW
  _laju_penutupan_odtw = _jumlah_objek_daya_tarik_wisata * _laju_penutupan_dasar_odtw;
  // SAVEPER = TIME STEP
  _saveper = _time_step;
  // Pengeluaran Wisatawan = Jumlah Wisatawan*Pengeluaran per Kunjungan
  _pengeluaran_wisatawan = _jumlah_wisatawan * _pengeluaran_per_kunjungan;
  // Rasio Daya Dukung Lahan = MAX(0,1-(Lahan Terbangun/Luas Lahan Tersedia))
  _rasio_daya_dukung_lahan = fns.MAX(0.0, 1.0 - (_lahan_terbangun / _luas_lahan_tersedia));
  // Kepadatan Wisatawan = Jumlah Wisatawan/Luas Lahan Tersedia
  _kepadatan_wisatawan = _jumlah_wisatawan / _luas_lahan_tersedia;
  // Daya Tarik Destinasi Wisata = Bobot ODTW*MIN(Batas Maksimum Efek ODTW,(Jumlah Objek Daya Tarik Wisata/ODTW Referensi)^Elastisitas Daya Tarik ODTW)+Bobot Kepadatan*MIN(1,Kepadatan Referensi/Kepadatan Wisatawan)+Bobot Daya Dukung Lahan*(Rasio Daya Dukung Lahan/Rasio Daya Dukung Lahan Referensi)
  _daya_tarik_destinasi_wisata = _bobot_odtw * fns.MIN(_batas_maksimum_efek_odtw, fns.POW((_jumlah_objek_daya_tarik_wisata / _odtw_referensi), _elastisitas_daya_tarik_odtw)) + _bobot_kepadatan * fns.MIN(1.0, _kepadatan_referensi / _kepadatan_wisatawan) + _bobot_daya_dukung_lahan * (_rasio_daya_dukung_lahan / _rasio_daya_dukung_lahan_referensi);
  // Laju Kedatangan Wisatawan = Jumlah Wisatawan*Laju Pertumbuhan Eksternal*Daya Tarik Destinasi Wisata
  _laju_kedatangan_wisatawan = _jumlah_wisatawan * _laju_pertumbuhan_eksternal * _daya_tarik_destinasi_wisata;
  // Laju Konversi Lahan Non Pariwisata = Laju Konversi Dasar*Lahan Terbangun*Rasio Daya Dukung Lahan
  _laju_konversi_lahan_non_pariwisata = _laju_konversi_dasar * _lahan_terbangun * _rasio_daya_dukung_lahan;
  // Intensitas Tenaga Kerja = Intensitas Tenaga Kerja Awal*EXP(-Laju Kenaikan Produktivitas*(Time-Tahun Dasar Intensitas Tenaga Kerja))
  _intensitas_tenaga_kerja = _intensitas_tenaga_kerja_awal * fns.EXP(-_laju_kenaikan_produktivitas * (_time - _tahun_dasar_intensitas_tenaga_kerja));
  // PDRB Sektor Pariwisata = Pengeluaran Wisatawan*Rasio Nilai Tambah Pariwisata
  _pdrb_sektor_pariwisata = _pengeluaran_wisatawan * _rasio_nilai_tambah_pariwisata;
  // Tenaga Kerja Dibutuhkan = PDRB Sektor Pariwisata*Intensitas Tenaga Kerja
  _tenaga_kerja_dibutuhkan = _pdrb_sektor_pariwisata * _intensitas_tenaga_kerja;
  // Laju Keluar Tenaga Kerja Pariwisata = Tenaga Kerja Pariwisata*Laju Keluar Dasar Tenaga Kerja
  _laju_keluar_tenaga_kerja_pariwisata = _tenaga_kerja_pariwisata * _laju_keluar_dasar_tenaga_kerja;
  // Laju Penyerapan Tenaga Kerja Pariwisata = MAX(0,Laju Keluar Tenaga Kerja Pariwisata+(Tenaga Kerja Dibutuhkan-Tenaga Kerja Pariwisata)/Waktu Penyesuaian Tenaga Kerja)
  _laju_penyerapan_tenaga_kerja_pariwisata = fns.MAX(0.0, _laju_keluar_tenaga_kerja_pariwisata + (_tenaga_kerja_dibutuhkan - _tenaga_kerja_pariwisata) / _waktu_penyesuaian_tenaga_kerja);
  // Total Malam Menginap = Jumlah Wisatawan*Proporsi Wisatawan Menginap*"Rata-rata Lama Menginap Tamu"
  _total_malam_menginap = _jumlah_wisatawan * _proporsi_wisatawan_menginap * __rata_rata_lama_menginap_tamu_;
  // Investasi Sektor Pariwisata = (PDRB Sektor Pariwisata*Rasio Investasi terhadap PDRB)*(1+Insentif Kebijakan)
  _investasi_sektor_pariwisata = (_pdrb_sektor_pariwisata * _rasio_investasi_terhadap_pdrb) * (1.0 + _insentif_kebijakan);
  // Rasio Permintaan terhadap Kapasitas Kamar = (Total Malam Menginap/Tingkat Penghunian Ganda Kamar)/(Jumlah Hotel dan Akomodasi*"Rata-rata Kamar per Unit Akomodasi"*Malam Tersedia per Kamar)
  _rasio_permintaan_terhadap_kapasitas_kamar = (_total_malam_menginap / _tingkat_penghunian_ganda_kamar) / (_jumlah_hotel_dan_akomodasi * __rata_rata_kamar_per_unit_akomodasi_ * _malam_tersedia_per_kamar);
  // "Tingkat Penghunian Kamar (TPK)" = MIN(1,Rasio Permintaan terhadap Kapasitas Kamar)
  __tingkat_penghunian_kamar__tpk__ = fns.MIN(1.0, _rasio_permintaan_terhadap_kapasitas_kamar);
  // "Laju Pembangunan/Penambahan ODTW" = Investasi Sektor Pariwisata*Sensitivitas ODTW terhadap Investasi+Laju Pembangunan ODTW Non Investasi
  __laju_pembangunan_penambahan_odtw_ = _investasi_sektor_pariwisata * _sensitivitas_odtw_terhadap_investasi + _laju_pembangunan_odtw_non_investasi;
  // Laju Konstruksi Hotel dan Akomodasi = Investasi Sektor Pariwisata*Sensitivitas Konstruksi terhadap TPK*MAX(0,Rasio Permintaan terhadap Kapasitas Kamar-TPK Ambang)
  _laju_konstruksi_hotel_dan_akomodasi = _investasi_sektor_pariwisata * _sensitivitas_konstruksi_terhadap_tpk * fns.MAX(0.0, _rasio_permintaan_terhadap_kapasitas_kamar - _tpk_ambang);
  // Laju Konversi Lahan Pariwisata = ((Laju Konstruksi Hotel dan Akomodasi*Lahan Per Hotel dan Akomodasi)+("Laju Pembangunan/Penambahan ODTW"*Lahan Per ODTW))*(1-Kebijakan Konservasi Lahan)*(Rasio Daya Dukung Lahan/Rasio Daya Dukung Lahan Referensi)
  _laju_konversi_lahan_pariwisata = ((_laju_konstruksi_hotel_dan_akomodasi * _lahan_per_hotel_dan_akomodasi) + (__laju_pembangunan_penambahan_odtw_ * _lahan_per_odtw)) * (1.0 - _kebijakan_konservasi_lahan) * (_rasio_daya_dukung_lahan / _rasio_daya_dukung_lahan_referensi);
}

/*export*/ function evalAux() {
  // Evaluate auxiliaries in order from the bottom up
  evalAux0();
}

function evalLevels0() {
  // Jumlah Hotel dan Akomodasi = INTEG(Laju Konstruksi Hotel dan Akomodasi-Laju Demolisi Hotel dan Akomodasi,2291)
  _jumlah_hotel_dan_akomodasi = fns.INTEG(_jumlah_hotel_dan_akomodasi, _laju_konstruksi_hotel_dan_akomodasi - _laju_demolisi_hotel_dan_akomodasi);
  // Jumlah Objek Daya Tarik Wisata = INTEG("Laju Pembangunan/Penambahan ODTW"-Laju Penutupan ODTW,201)
  _jumlah_objek_daya_tarik_wisata = fns.INTEG(_jumlah_objek_daya_tarik_wisata, __laju_pembangunan_penambahan_odtw_ - _laju_penutupan_odtw);
  // Jumlah Wisatawan = INTEG(Laju Kedatangan Wisatawan-Laju Penurunan Wisatawan,4.06957e+07)
  _jumlah_wisatawan = fns.INTEG(_jumlah_wisatawan, _laju_kedatangan_wisatawan - _laju_penurunan_wisatawan);
  // Lahan Terbangun = INTEG(Laju Konversi Lahan Non Pariwisata+Laju Konversi Lahan Pariwisata,55029.5)
  _lahan_terbangun = fns.INTEG(_lahan_terbangun, _laju_konversi_lahan_non_pariwisata + _laju_konversi_lahan_pariwisata);
  // Tenaga Kerja Pariwisata = INTEG(Laju Penyerapan Tenaga Kerja Pariwisata-Laju Keluar Tenaga Kerja Pariwisata,364994)
  _tenaga_kerja_pariwisata = fns.INTEG(_tenaga_kerja_pariwisata, _laju_penyerapan_tenaga_kerja_pariwisata - _laju_keluar_tenaga_kerja_pariwisata);
}

/*export*/ function evalLevels() {
  // Evaluate levels
  evalLevels0();
}

/*export*/ function setInputs(valueAtIndex /*: (index: number) => number*/) {}

/*export*/ function setConstant(varSpec /*: VarSpec*/, value /*: number*/) {
  if (!varSpec) {
    throw new Error('Got undefined varSpec in setConstant');
  }
  const varIndex = varSpec.varIndex;
  const subs = varSpec.subscriptIndices;
  switch (varIndex) {
    case 1:
      __rata_rata_kamar_per_unit_akomodasi_ = value;
      break;
    case 2:
      __rata_rata_lama_menginap_tamu_ = value;
      break;
    case 3:
      _batas_maksimum_efek_odtw = value;
      break;
    case 4:
      _bobot_daya_dukung_lahan = value;
      break;
    case 5:
      _bobot_kepadatan = value;
      break;
    case 6:
      _bobot_odtw = value;
      break;
    case 7:
      _elastisitas_daya_tarik_odtw = value;
      break;
    case 8:
      _final_time = value;
      break;
    case 9:
      _initial_time = value;
      break;
    case 10:
      _insentif_kebijakan = value;
      break;
    case 11:
      _intensitas_tenaga_kerja_awal = value;
      break;
    case 12:
      _kebijakan_konservasi_lahan = value;
      break;
    case 13:
      _kepadatan_referensi = value;
      break;
    case 14:
      _lahan_per_hotel_dan_akomodasi = value;
      break;
    case 15:
      _lahan_per_odtw = value;
      break;
    case 16:
      _laju_demolisi_dasar = value;
      break;
    case 17:
      _laju_keluar_dasar_tenaga_kerja = value;
      break;
    case 18:
      _laju_kenaikan_produktivitas = value;
      break;
    case 19:
      _laju_konversi_dasar = value;
      break;
    case 20:
      _laju_pembangunan_odtw_non_investasi = value;
      break;
    case 21:
      _laju_penurunan_dasar = value;
      break;
    case 22:
      _laju_penutupan_dasar_odtw = value;
      break;
    case 23:
      _laju_pertumbuhan_eksternal = value;
      break;
    case 24:
      _luas_lahan_tersedia = value;
      break;
    case 25:
      _malam_tersedia_per_kamar = value;
      break;
    case 26:
      _odtw_referensi = value;
      break;
    case 27:
      _pengeluaran_per_kunjungan = value;
      break;
    case 28:
      _proporsi_wisatawan_menginap = value;
      break;
    case 29:
      _rasio_daya_dukung_lahan_referensi = value;
      break;
    case 30:
      _rasio_investasi_terhadap_pdrb = value;
      break;
    case 31:
      _rasio_nilai_tambah_pariwisata = value;
      break;
    case 32:
      _sensitivitas_konstruksi_terhadap_tpk = value;
      break;
    case 33:
      _sensitivitas_odtw_terhadap_investasi = value;
      break;
    case 34:
      _time_step = value;
      break;
    case 35:
      _tpk_ambang = value;
      break;
    case 36:
      _tahun_dasar_intensitas_tenaga_kerja = value;
      break;
    case 37:
      _tingkat_penghunian_ganda_kamar = value;
      break;
    case 38:
      _waktu_penyesuaian_tenaga_kerja = value;
      break;
    case 39:
      _time = value;
      break;
    default:
      throw new Error(`No constant found for var index ${varIndex} in setConstant`);
  }
}

/*export*/ function setLookup(varSpec /*: VarSpec*/, points /*: Float64Array | undefined*/) {
  throw new Error('The setLookup function was not enabled for the generated model. Set the customLookups property in the spec/config file to allow for overriding lookups at runtime.');
}

/*export*/ const outputVarIds = [
  '__laju_pembangunan_penambahan_odtw_',
  '__rata_rata_kamar_per_unit_akomodasi_',
  '__rata_rata_lama_menginap_tamu_',
  '__tingkat_penghunian_kamar__tpk__',
  '_batas_maksimum_efek_odtw',
  '_bobot_daya_dukung_lahan',
  '_bobot_kepadatan',
  '_bobot_odtw',
  '_daya_tarik_destinasi_wisata',
  '_elastisitas_daya_tarik_odtw',
  '_final_time',
  '_initial_time',
  '_insentif_kebijakan',
  '_intensitas_tenaga_kerja',
  '_intensitas_tenaga_kerja_awal',
  '_investasi_sektor_pariwisata',
  '_jumlah_hotel_dan_akomodasi',
  '_jumlah_objek_daya_tarik_wisata',
  '_jumlah_wisatawan',
  '_kebijakan_konservasi_lahan',
  '_kepadatan_referensi',
  '_kepadatan_wisatawan',
  '_lahan_per_hotel_dan_akomodasi',
  '_lahan_per_odtw',
  '_lahan_terbangun',
  '_laju_demolisi_dasar',
  '_laju_demolisi_hotel_dan_akomodasi',
  '_laju_kedatangan_wisatawan',
  '_laju_keluar_dasar_tenaga_kerja',
  '_laju_keluar_tenaga_kerja_pariwisata',
  '_laju_kenaikan_produktivitas',
  '_laju_konstruksi_hotel_dan_akomodasi',
  '_laju_konversi_dasar',
  '_laju_konversi_lahan_non_pariwisata',
  '_laju_konversi_lahan_pariwisata',
  '_laju_pembangunan_odtw_non_investasi',
  '_laju_penurunan_dasar',
  '_laju_penurunan_wisatawan',
  '_laju_penutupan_dasar_odtw',
  '_laju_penutupan_odtw',
  '_laju_penyerapan_tenaga_kerja_pariwisata',
  '_laju_pertumbuhan_eksternal',
  '_luas_lahan_tersedia',
  '_malam_tersedia_per_kamar',
  '_odtw_referensi',
  '_pdrb_sektor_pariwisata',
  '_pengeluaran_per_kunjungan',
  '_pengeluaran_wisatawan',
  '_proporsi_wisatawan_menginap',
  '_rasio_daya_dukung_lahan',
  '_rasio_daya_dukung_lahan_referensi',
  '_rasio_investasi_terhadap_pdrb',
  '_rasio_nilai_tambah_pariwisata',
  '_rasio_permintaan_terhadap_kapasitas_kamar',
  '_saveper',
  '_sensitivitas_konstruksi_terhadap_tpk',
  '_sensitivitas_odtw_terhadap_investasi',
  '_tahun_dasar_intensitas_tenaga_kerja',
  '_tenaga_kerja_dibutuhkan',
  '_tenaga_kerja_pariwisata',
  '_time',
  '_time_step',
  '_tingkat_penghunian_ganda_kamar',
  '_total_malam_menginap',
  '_tpk_ambang',
  '_waktu_penyesuaian_tenaga_kerja'
];

/*export*/ const outputVarNames = [
  '"Laju Pembangunan/Penambahan ODTW"',
  '"Rata-rata Kamar per Unit Akomodasi"',
  '"Rata-rata Lama Menginap Tamu"',
  '"Tingkat Penghunian Kamar (TPK)"',
  'Batas Maksimum Efek ODTW',
  'Bobot Daya Dukung Lahan',
  'Bobot Kepadatan',
  'Bobot ODTW',
  'Daya Tarik Destinasi Wisata',
  'Elastisitas Daya Tarik ODTW',
  'FINAL TIME',
  'INITIAL TIME',
  'Insentif Kebijakan',
  'Intensitas Tenaga Kerja',
  'Intensitas Tenaga Kerja Awal',
  'Investasi Sektor Pariwisata',
  'Jumlah Hotel dan Akomodasi',
  'Jumlah Objek Daya Tarik Wisata',
  'Jumlah Wisatawan',
  'Kebijakan Konservasi Lahan',
  'Kepadatan Referensi',
  'Kepadatan Wisatawan',
  'Lahan Per Hotel dan Akomodasi',
  'Lahan Per ODTW',
  'Lahan Terbangun',
  'Laju Demolisi Dasar',
  'Laju Demolisi Hotel dan Akomodasi',
  'Laju Kedatangan Wisatawan',
  'Laju Keluar Dasar Tenaga Kerja',
  'Laju Keluar Tenaga Kerja Pariwisata',
  'Laju Kenaikan Produktivitas',
  'Laju Konstruksi Hotel dan Akomodasi',
  'Laju Konversi Dasar',
  'Laju Konversi Lahan Non Pariwisata',
  'Laju Konversi Lahan Pariwisata',
  'Laju Pembangunan ODTW Non Investasi',
  'Laju Penurunan Dasar',
  'Laju Penurunan Wisatawan',
  'Laju Penutupan Dasar ODTW',
  'Laju Penutupan ODTW',
  'Laju Penyerapan Tenaga Kerja Pariwisata',
  'Laju Pertumbuhan Eksternal',
  'Luas Lahan Tersedia',
  'Malam Tersedia per Kamar',
  'ODTW Referensi',
  'PDRB Sektor Pariwisata',
  'Pengeluaran per Kunjungan',
  'Pengeluaran Wisatawan',
  'Proporsi Wisatawan Menginap',
  'Rasio Daya Dukung Lahan',
  'Rasio Daya Dukung Lahan Referensi',
  'Rasio Investasi terhadap PDRB',
  'Rasio Nilai Tambah Pariwisata',
  'Rasio Permintaan terhadap Kapasitas Kamar',
  'SAVEPER',
  'Sensitivitas Konstruksi terhadap TPK',
  'Sensitivitas ODTW terhadap Investasi',
  'Tahun Dasar Intensitas Tenaga Kerja',
  'Tenaga Kerja Dibutuhkan',
  'Tenaga Kerja Pariwisata',
  'Time',
  'TIME STEP',
  'Tingkat Penghunian Ganda Kamar',
  'Total Malam Menginap',
  'TPK Ambang',
  'Waktu Penyesuaian Tenaga Kerja'
];

/*export*/ function storeOutputs(storeValue /*: (value: number) => void*/) {
  storeValue(__laju_pembangunan_penambahan_odtw_);
  storeValue(__rata_rata_kamar_per_unit_akomodasi_);
  storeValue(__rata_rata_lama_menginap_tamu_);
  storeValue(__tingkat_penghunian_kamar__tpk__);
  storeValue(_batas_maksimum_efek_odtw);
  storeValue(_bobot_daya_dukung_lahan);
  storeValue(_bobot_kepadatan);
  storeValue(_bobot_odtw);
  storeValue(_daya_tarik_destinasi_wisata);
  storeValue(_elastisitas_daya_tarik_odtw);
  storeValue(_final_time);
  storeValue(_initial_time);
  storeValue(_insentif_kebijakan);
  storeValue(_intensitas_tenaga_kerja);
  storeValue(_intensitas_tenaga_kerja_awal);
  storeValue(_investasi_sektor_pariwisata);
  storeValue(_jumlah_hotel_dan_akomodasi);
  storeValue(_jumlah_objek_daya_tarik_wisata);
  storeValue(_jumlah_wisatawan);
  storeValue(_kebijakan_konservasi_lahan);
  storeValue(_kepadatan_referensi);
  storeValue(_kepadatan_wisatawan);
  storeValue(_lahan_per_hotel_dan_akomodasi);
  storeValue(_lahan_per_odtw);
  storeValue(_lahan_terbangun);
  storeValue(_laju_demolisi_dasar);
  storeValue(_laju_demolisi_hotel_dan_akomodasi);
  storeValue(_laju_kedatangan_wisatawan);
  storeValue(_laju_keluar_dasar_tenaga_kerja);
  storeValue(_laju_keluar_tenaga_kerja_pariwisata);
  storeValue(_laju_kenaikan_produktivitas);
  storeValue(_laju_konstruksi_hotel_dan_akomodasi);
  storeValue(_laju_konversi_dasar);
  storeValue(_laju_konversi_lahan_non_pariwisata);
  storeValue(_laju_konversi_lahan_pariwisata);
  storeValue(_laju_pembangunan_odtw_non_investasi);
  storeValue(_laju_penurunan_dasar);
  storeValue(_laju_penurunan_wisatawan);
  storeValue(_laju_penutupan_dasar_odtw);
  storeValue(_laju_penutupan_odtw);
  storeValue(_laju_penyerapan_tenaga_kerja_pariwisata);
  storeValue(_laju_pertumbuhan_eksternal);
  storeValue(_luas_lahan_tersedia);
  storeValue(_malam_tersedia_per_kamar);
  storeValue(_odtw_referensi);
  storeValue(_pdrb_sektor_pariwisata);
  storeValue(_pengeluaran_per_kunjungan);
  storeValue(_pengeluaran_wisatawan);
  storeValue(_proporsi_wisatawan_menginap);
  storeValue(_rasio_daya_dukung_lahan);
  storeValue(_rasio_daya_dukung_lahan_referensi);
  storeValue(_rasio_investasi_terhadap_pdrb);
  storeValue(_rasio_nilai_tambah_pariwisata);
  storeValue(_rasio_permintaan_terhadap_kapasitas_kamar);
  storeValue(_saveper);
  storeValue(_sensitivitas_konstruksi_terhadap_tpk);
  storeValue(_sensitivitas_odtw_terhadap_investasi);
  storeValue(_tahun_dasar_intensitas_tenaga_kerja);
  storeValue(_tenaga_kerja_dibutuhkan);
  storeValue(_tenaga_kerja_pariwisata);
  storeValue(_time);
  storeValue(_time_step);
  storeValue(_tingkat_penghunian_ganda_kamar);
  storeValue(_total_malam_menginap);
  storeValue(_tpk_ambang);
  storeValue(_waktu_penyesuaian_tenaga_kerja);
}

/*export*/ function storeOutput(varSpec /*: VarSpec*/, storeValue /*: (value: number) => void*/) {
  if (!varSpec) {
    throw new Error('Got undefined varSpec in storeOutput');
  }
  const varIndex = varSpec.varIndex;
  const subs = varSpec.subscriptIndices;
  switch (varIndex) {
    case 1:
      storeValue(__rata_rata_kamar_per_unit_akomodasi_);
      break;
    case 2:
      storeValue(__rata_rata_lama_menginap_tamu_);
      break;
    case 3:
      storeValue(_batas_maksimum_efek_odtw);
      break;
    case 4:
      storeValue(_bobot_daya_dukung_lahan);
      break;
    case 5:
      storeValue(_bobot_kepadatan);
      break;
    case 6:
      storeValue(_bobot_odtw);
      break;
    case 7:
      storeValue(_elastisitas_daya_tarik_odtw);
      break;
    case 8:
      storeValue(_final_time);
      break;
    case 9:
      storeValue(_initial_time);
      break;
    case 10:
      storeValue(_insentif_kebijakan);
      break;
    case 11:
      storeValue(_intensitas_tenaga_kerja_awal);
      break;
    case 12:
      storeValue(_kebijakan_konservasi_lahan);
      break;
    case 13:
      storeValue(_kepadatan_referensi);
      break;
    case 14:
      storeValue(_lahan_per_hotel_dan_akomodasi);
      break;
    case 15:
      storeValue(_lahan_per_odtw);
      break;
    case 16:
      storeValue(_laju_demolisi_dasar);
      break;
    case 17:
      storeValue(_laju_keluar_dasar_tenaga_kerja);
      break;
    case 18:
      storeValue(_laju_kenaikan_produktivitas);
      break;
    case 19:
      storeValue(_laju_konversi_dasar);
      break;
    case 20:
      storeValue(_laju_pembangunan_odtw_non_investasi);
      break;
    case 21:
      storeValue(_laju_penurunan_dasar);
      break;
    case 22:
      storeValue(_laju_penutupan_dasar_odtw);
      break;
    case 23:
      storeValue(_laju_pertumbuhan_eksternal);
      break;
    case 24:
      storeValue(_luas_lahan_tersedia);
      break;
    case 25:
      storeValue(_malam_tersedia_per_kamar);
      break;
    case 26:
      storeValue(_odtw_referensi);
      break;
    case 27:
      storeValue(_pengeluaran_per_kunjungan);
      break;
    case 28:
      storeValue(_proporsi_wisatawan_menginap);
      break;
    case 29:
      storeValue(_rasio_daya_dukung_lahan_referensi);
      break;
    case 30:
      storeValue(_rasio_investasi_terhadap_pdrb);
      break;
    case 31:
      storeValue(_rasio_nilai_tambah_pariwisata);
      break;
    case 32:
      storeValue(_sensitivitas_konstruksi_terhadap_tpk);
      break;
    case 33:
      storeValue(_sensitivitas_odtw_terhadap_investasi);
      break;
    case 34:
      storeValue(_time_step);
      break;
    case 35:
      storeValue(_tpk_ambang);
      break;
    case 36:
      storeValue(_tahun_dasar_intensitas_tenaga_kerja);
      break;
    case 37:
      storeValue(_tingkat_penghunian_ganda_kamar);
      break;
    case 38:
      storeValue(_waktu_penyesuaian_tenaga_kerja);
      break;
    case 39:
      storeValue(_time);
      break;
    case 40:
      storeValue(_jumlah_hotel_dan_akomodasi);
      break;
    case 41:
      storeValue(_jumlah_objek_daya_tarik_wisata);
      break;
    case 42:
      storeValue(_jumlah_wisatawan);
      break;
    case 43:
      storeValue(_lahan_terbangun);
      break;
    case 44:
      storeValue(_tenaga_kerja_pariwisata);
      break;
    case 45:
      storeValue(_laju_demolisi_hotel_dan_akomodasi);
      break;
    case 46:
      storeValue(_laju_penurunan_wisatawan);
      break;
    case 47:
      storeValue(_laju_penutupan_odtw);
      break;
    case 48:
      storeValue(_saveper);
      break;
    case 49:
      storeValue(_pengeluaran_wisatawan);
      break;
    case 50:
      storeValue(_rasio_daya_dukung_lahan);
      break;
    case 51:
      storeValue(_kepadatan_wisatawan);
      break;
    case 52:
      storeValue(_daya_tarik_destinasi_wisata);
      break;
    case 53:
      storeValue(_laju_kedatangan_wisatawan);
      break;
    case 54:
      storeValue(_laju_konversi_lahan_non_pariwisata);
      break;
    case 55:
      storeValue(_intensitas_tenaga_kerja);
      break;
    case 56:
      storeValue(_pdrb_sektor_pariwisata);
      break;
    case 57:
      storeValue(_tenaga_kerja_dibutuhkan);
      break;
    case 58:
      storeValue(_laju_keluar_tenaga_kerja_pariwisata);
      break;
    case 59:
      storeValue(_laju_penyerapan_tenaga_kerja_pariwisata);
      break;
    case 60:
      storeValue(_total_malam_menginap);
      break;
    case 61:
      storeValue(_investasi_sektor_pariwisata);
      break;
    case 62:
      storeValue(_rasio_permintaan_terhadap_kapasitas_kamar);
      break;
    case 63:
      storeValue(__tingkat_penghunian_kamar__tpk__);
      break;
    case 64:
      storeValue(__laju_pembangunan_penambahan_odtw_);
      break;
    case 65:
      storeValue(_laju_konstruksi_hotel_dan_akomodasi);
      break;
    case 66:
      storeValue(_laju_konversi_lahan_pariwisata);
      break;
    default:
      throw new Error(`No variable found for var index ${varIndex} in storeOutput`);
  }
}

/*export*/ const modelListing = {
  dimensions: [],
  variables: [
    {
      id: '__rata_rata_kamar_per_unit_akomodasi_',
      index: 1
    },
    {
      id: '__rata_rata_lama_menginap_tamu_',
      index: 2
    },
    {
      id: '_batas_maksimum_efek_odtw',
      index: 3
    },
    {
      id: '_bobot_daya_dukung_lahan',
      index: 4
    },
    {
      id: '_bobot_kepadatan',
      index: 5
    },
    {
      id: '_bobot_odtw',
      index: 6
    },
    {
      id: '_elastisitas_daya_tarik_odtw',
      index: 7
    },
    {
      id: '_final_time',
      index: 8
    },
    {
      id: '_initial_time',
      index: 9
    },
    {
      id: '_insentif_kebijakan',
      index: 10
    },
    {
      id: '_intensitas_tenaga_kerja_awal',
      index: 11
    },
    {
      id: '_kebijakan_konservasi_lahan',
      index: 12
    },
    {
      id: '_kepadatan_referensi',
      index: 13
    },
    {
      id: '_lahan_per_hotel_dan_akomodasi',
      index: 14
    },
    {
      id: '_lahan_per_odtw',
      index: 15
    },
    {
      id: '_laju_demolisi_dasar',
      index: 16
    },
    {
      id: '_laju_keluar_dasar_tenaga_kerja',
      index: 17
    },
    {
      id: '_laju_kenaikan_produktivitas',
      index: 18
    },
    {
      id: '_laju_konversi_dasar',
      index: 19
    },
    {
      id: '_laju_pembangunan_odtw_non_investasi',
      index: 20
    },
    {
      id: '_laju_penurunan_dasar',
      index: 21
    },
    {
      id: '_laju_penutupan_dasar_odtw',
      index: 22
    },
    {
      id: '_laju_pertumbuhan_eksternal',
      index: 23
    },
    {
      id: '_luas_lahan_tersedia',
      index: 24
    },
    {
      id: '_malam_tersedia_per_kamar',
      index: 25
    },
    {
      id: '_odtw_referensi',
      index: 26
    },
    {
      id: '_pengeluaran_per_kunjungan',
      index: 27
    },
    {
      id: '_proporsi_wisatawan_menginap',
      index: 28
    },
    {
      id: '_rasio_daya_dukung_lahan_referensi',
      index: 29
    },
    {
      id: '_rasio_investasi_terhadap_pdrb',
      index: 30
    },
    {
      id: '_rasio_nilai_tambah_pariwisata',
      index: 31
    },
    {
      id: '_sensitivitas_konstruksi_terhadap_tpk',
      index: 32
    },
    {
      id: '_sensitivitas_odtw_terhadap_investasi',
      index: 33
    },
    {
      id: '_time_step',
      index: 34
    },
    {
      id: '_tpk_ambang',
      index: 35
    },
    {
      id: '_tahun_dasar_intensitas_tenaga_kerja',
      index: 36
    },
    {
      id: '_tingkat_penghunian_ganda_kamar',
      index: 37
    },
    {
      id: '_waktu_penyesuaian_tenaga_kerja',
      index: 38
    },
    {
      id: '_time',
      index: 39
    },
    {
      id: '_jumlah_hotel_dan_akomodasi',
      index: 40
    },
    {
      id: '_jumlah_objek_daya_tarik_wisata',
      index: 41
    },
    {
      id: '_jumlah_wisatawan',
      index: 42
    },
    {
      id: '_lahan_terbangun',
      index: 43
    },
    {
      id: '_tenaga_kerja_pariwisata',
      index: 44
    },
    {
      id: '_laju_demolisi_hotel_dan_akomodasi',
      index: 45
    },
    {
      id: '_laju_penurunan_wisatawan',
      index: 46
    },
    {
      id: '_laju_penutupan_odtw',
      index: 47
    },
    {
      id: '_saveper',
      index: 48
    },
    {
      id: '_pengeluaran_wisatawan',
      index: 49
    },
    {
      id: '_rasio_daya_dukung_lahan',
      index: 50
    },
    {
      id: '_kepadatan_wisatawan',
      index: 51
    },
    {
      id: '_daya_tarik_destinasi_wisata',
      index: 52
    },
    {
      id: '_laju_kedatangan_wisatawan',
      index: 53
    },
    {
      id: '_laju_konversi_lahan_non_pariwisata',
      index: 54
    },
    {
      id: '_intensitas_tenaga_kerja',
      index: 55
    },
    {
      id: '_pdrb_sektor_pariwisata',
      index: 56
    },
    {
      id: '_tenaga_kerja_dibutuhkan',
      index: 57
    },
    {
      id: '_laju_keluar_tenaga_kerja_pariwisata',
      index: 58
    },
    {
      id: '_laju_penyerapan_tenaga_kerja_pariwisata',
      index: 59
    },
    {
      id: '_total_malam_menginap',
      index: 60
    },
    {
      id: '_investasi_sektor_pariwisata',
      index: 61
    },
    {
      id: '_rasio_permintaan_terhadap_kapasitas_kamar',
      index: 62
    },
    {
      id: '__tingkat_penghunian_kamar__tpk__',
      index: 63
    },
    {
      id: '__laju_pembangunan_penambahan_odtw_',
      index: 64
    },
    {
      id: '_laju_konstruksi_hotel_dan_akomodasi',
      index: 65
    },
    {
      id: '_laju_konversi_lahan_pariwisata',
      index: 66
    }
  ]
}

export default async function () {
  return {
    kind: 'js',
    outputVarIds,
    outputVarNames,
    modelListing,

    getInitialTime,
    getFinalTime,
    getTimeStep,
    getSaveFreq,

    getModelFunctions,
    setModelFunctions,

    setTime,
    setInputs,
    setConstant,
    setLookup,

    storeOutputs,
    storeOutput,

    initConstants,
    initLevels,
    evalAux,
    evalLevels
  }
}
