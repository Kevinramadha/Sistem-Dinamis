// Model variables
let __lookup1;
let __lookup2;
let __lookup3;
let __lookup4;
let __lookup5;
let __lookup6;
let __lookup7;
let __lookup8;
let __lookup9;
let __penggunaan_air_per_kamar_hotel_non_bintang_;
let __rasio_demand_supply_air_;
let __rata_rata_anggota_per_keluarga_;
let __rata_rata_kamar_per_unit_akomodasi_;
let _air_limbah_awal;
let _akumulasi_polusi;
let _angkatan_kerja;
let _area_destinasi_wisata;
let _carrying_capacity_per_ha;
let _clean_water_from_rainfall;
let _crowding_index;
let _decay_rate;
let _demolisi_akomodasi;
let _effect_of_crowding_on_tourism;
let _effect_of_labour_jobs_on_immigration;
let _effect_of_land_availability_on_construction;
let _effect_of_natural_beauty_on_tourism;
let _effect_of_pollution_on_death_rate;
let _effect_of_pollution_on_tourism;
let _effect_of_room_demand_on_construction;
let _effect_of_vegetation_cover_on_infiltration;
let _effect_of_water_availability_on_tourism;
let _ekstraksi_air_tanah;
let _ekstraksi_air_tanah_yang_diizinkan;
let _emigrasi;
let _final_time;
let _fraksi_air_limbah;
let _hari_per_tahun;
let _imbuhan_air_tanah;
let _imigrasi;
let _indeks_kualitas_lingkungan;
let _indeks_polusi_air;
let _indeks_polusi_gabungan;
let _indeks_polusi_padat;
let _initial_time;
let _jobs_per_room;
let _jumlah_keluarga;
let _jumlah_unit_akomodasi;
let _jumlah_wisatawan_mancanegara;
let _jumlah_wisatawan_nusantara;
let _kebutuhan_air_domestik;
let _kebutuhan_air_hotel;
let _kebutuhan_air_total;
let _kebutuhan_kamar_hotel;
let _kelahiran;
let _kematian;
let _ketersediaan_kamar;
let _konversi_lahan_ke_terbangun;
let _labour_force_fraction;
let _lahan_diizinkan_untuk_resort;
let _lahan_tersedia_untuk_pengembangan;
let _laju_konstruksi_hotel_dasar;
let _laju_pertumbuhan_wisatawan_mancanegara_dasar;
let _laju_pertumbuhan_wisatawan_nusantara_dasar;
let _lama_tinggal_wisatawan_mancanegara;
let _lama_tinggal_wisatawan_nusantara;
let _land_used_fraction;
let _lapangan_kerja_pariwisata;
let _leaking_rate_jaringan_air;
let _limbah_padat_awal;
let _limbah_padat_domestik;
let _limbah_padat_hotel;
let _luas_area_terbangun;
let _luas_hutan_awal;
let _luas_hutan_vegetasi;
let _luas_lahan_per_unit_akomodasi;
let _luas_lahan_pertanian;
let _natural_beauty_index;
let _normal_infiltration_rate;
let _normalisasi_air_limbah;
let _normalisasi_limbah_padat;
let _occupancy_rate_hotel;
let _pasokan_air;
let _peluruhan_polusi_alami;
let _pembangunan_akomodasi_baru;
let _penggunaan_air_per_kamar_hotel_bintang;
let _penggunaan_air_per_keluarga;
let _pengolahan_limbah;
let _pengurangan_hutan_vegetasi;
let _pengurangan_lahan_pertanian;
let _pertumbuhan_wisatawan_mancanegara;
let _pertumbuhan_wisatawan_nusantara;
let _populasi_penduduk_diy;
let _produksi_air_limbah;
let _produksi_limbah_padat;
let _proporsi_pengolahan_air_limbah;
let _proporsi_pengolahan_limbah_padat;
let _rainfall_collection_per_household;
let _rasio_pengangguran;
let _rembesan_air_ke_laut;
let _resevoir;
let _room_demand_ratio;
let _sampah_padat_per_kamar_hotel_bintang;
let _sampah_padat_per_kamar_hotel_non_bintang;
let _sampah_padat_per_keluarga;
let _saveper;
let _seasonal_loading_factor;
let _stok_air_tanah;
let _time_step;
let _tingkat_emigrasi;
let _tingkat_imigrasi_dasar;
let _tingkat_kelahiran_cbr;
let _tingkat_kematian_cdr;
let _total_hari_bermalam;
let _total_pekerjaan_tersedia;
let _tourism_growth_multiplier;
let _treated_groundwater;
let _umur_akomodasi_hotel_lifespan;
let _vegetation_cover_ratio;
let _visitor_per_room;
let _waktu_pengolahan;
let _waktu_rembesan;

// Array dimensions


// Dimension mappings


// Lookup data arrays
const __lookup1_data_ = [0.0, 0.8, 5000.0, 1.0, 10000.0, 0.95, 15000.0, 0.85, 20000.0, 0.8];
const __lookup2_data_ = [0.0, 0.8, 1.0, 1.0, 5.0, 1.2, 10.0, 1.3, 15.0, 1.3, 25.0, 1.3];
const __lookup3_data_ = [0.0, 1.0, 0.2, 0.95, 0.4, 0.85, 0.6, 0.7, 0.8, 0.55, 0.9, 0.5, 1.0, 0.5];
const __lookup4_data_ = [0.0, 0.2, 0.5, 0.5, 0.8, 0.8, 1.0, 1.0, 1.2, 1.2];
const __lookup5_data_ = [0.0, 1.0, 0.5, 1.0, 1.0, 1.0, 1.5, 1.1, 2.0, 1.2, 3.0, 1.35, 10.0, 1.4];
const __lookup6_data_ = [0.0, 1.2, 0.5, 1.1, 1.0, 1.0, 1.5, 0.9, 2.0, 0.85, 3.0, 0.8, 4.0, 0.8];
const __lookup7_data_ = [0.0, 0.6, 0.5, 0.7, 1.0, 1.0, 1.5, 1.3, 2.0, 1.4, 10.0, 1.4, 15.0, 1.4];
const __lookup8_data_ = [0.0, 0.8, 0.5, 0.9, 1.0, 1.0, 1.2, 1.0];
const __lookup9_data_ = [0.0, 1.2, 1.0, 1.0, 5.0, 0.85, 10.0, 0.8, 20.0, 0.8, 30.0, 0.8];


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

function initLookups0() {
  __lookup1 = fns.createLookup(5, __lookup1_data_);
  __lookup2 = fns.createLookup(6, __lookup2_data_);
  __lookup3 = fns.createLookup(7, __lookup3_data_);
  __lookup4 = fns.createLookup(5, __lookup4_data_);
  __lookup5 = fns.createLookup(7, __lookup5_data_);
  __lookup6 = fns.createLookup(7, __lookup6_data_);
  __lookup7 = fns.createLookup(7, __lookup7_data_);
  __lookup8 = fns.createLookup(4, __lookup8_data_);
  __lookup9 = fns.createLookup(6, __lookup9_data_);
}

function initLookups() {
  // Initialize lookups
  if (!lookups_initialized) {
    initLookups0();
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
  // "Penggunaan Air per Kamar Hotel Non-Bintang" = 210
  __penggunaan_air_per_kamar_hotel_non_bintang_ = 210.0;
  // "Rata-rata Anggota per Keluarga" = 3.5
  __rata_rata_anggota_per_keluarga_ = 3.5;
  // "Rata-rata Kamar per Unit Akomodasi" = 15
  __rata_rata_kamar_per_unit_akomodasi_ = 15.0;
  // Air Limbah Awal = 1.48e+08
  _air_limbah_awal = 148000000.0;
  // Area Destinasi Wisata = 318.6
  _area_destinasi_wisata = 318.6;
  // Carrying Capacity per ha = 142.4
  _carrying_capacity_per_ha = 142.4;
  // Decay Rate = 0.1
  _decay_rate = 0.1;
  // Ekstraksi Air Tanah yang Diizinkan = 4e+07
  _ekstraksi_air_tanah_yang_diizinkan = 40000000.0;
  // FINAL TIME = 2050
  _final_time = 2050.0;
  // Fraksi Air Limbah = 0.8
  _fraksi_air_limbah = 0.8;
  // Hari per Tahun = 365
  _hari_per_tahun = 365.0;
  // INITIAL TIME = 2024
  _initial_time = 2024.0;
  // Jobs per Room = 0.75
  _jobs_per_room = 0.75;
  // Labour Force Fraction = 0.48
  _labour_force_fraction = 0.48;
  // Lahan Diizinkan untuk Resort = 1200
  _lahan_diizinkan_untuk_resort = 1200.0;
  // Laju Konstruksi Hotel Dasar = 166
  _laju_konstruksi_hotel_dasar = 166.0;
  // Laju Pertumbuhan Wisatawan Mancanegara Dasar = 0.045
  _laju_pertumbuhan_wisatawan_mancanegara_dasar = 0.045;
  // Laju Pertumbuhan Wisatawan Nusantara Dasar = 0.045
  _laju_pertumbuhan_wisatawan_nusantara_dasar = 0.045;
  // Lama Tinggal Wisatawan Mancanegara = 4
  _lama_tinggal_wisatawan_mancanegara = 4.0;
  // Lama Tinggal Wisatawan Nusantara = 3
  _lama_tinggal_wisatawan_nusantara = 3.0;
  // Leaking Rate Jaringan Air = 0.4
  _leaking_rate_jaringan_air = 0.4;
  // Limbah Padat Awal = 3.46e+08
  _limbah_padat_awal = 346000000.0;
  // Luas Hutan Awal = 1220
  _luas_hutan_awal = 1220.0;
  // Luas Lahan per Unit Akomodasi = 0.15
  _luas_lahan_per_unit_akomodasi = 0.15;
  // Normal Infiltration Rate = 4.35e+07
  _normal_infiltration_rate = 43500000.0;
  // Normalisasi Air Limbah = 3.36e+10
  _normalisasi_air_limbah = 33600000000.0;
  // Normalisasi Limbah Padat = 1.82e+10
  _normalisasi_limbah_padat = 18200000000.0;
  // Occupancy Rate Hotel = 0.65
  _occupancy_rate_hotel = 0.65;
  // Penggunaan Air per Kamar Hotel Bintang = 160
  _penggunaan_air_per_kamar_hotel_bintang = 160.0;
  // Penggunaan Air per Keluarga = 175
  _penggunaan_air_per_keluarga = 175.0;
}

function initConstants1() {
  // Proporsi Pengolahan Air Limbah = 0.05
  _proporsi_pengolahan_air_limbah = 0.05;
  // Proporsi Pengolahan Limbah Padat = 0.02
  _proporsi_pengolahan_limbah_padat = 0.02;
  // Rainfall Collection per Household = 5
  _rainfall_collection_per_household = 5.0;
  // Resevoir = 1.2e+08
  _resevoir = 120000000.0;
  // Sampah Padat per Kamar Hotel Bintang = 730
  _sampah_padat_per_kamar_hotel_bintang = 730.0;
  // Sampah Padat per Kamar Hotel Non Bintang = 912.5
  _sampah_padat_per_kamar_hotel_non_bintang = 912.5;
  // Sampah Padat per Keluarga = 292
  _sampah_padat_per_keluarga = 292.0;
  // Seasonal Loading Factor = 2
  _seasonal_loading_factor = 2.0;
  // TIME STEP = 1
  _time_step = 1.0;
  // Tingkat Emigrasi = 0.003
  _tingkat_emigrasi = 0.003;
  // Tingkat Imigrasi Dasar = 0.013
  _tingkat_imigrasi_dasar = 0.013;
  // Tingkat Kelahiran CBR = 6.5
  _tingkat_kelahiran_cbr = 6.5;
  // Tingkat Kematian CDR = 5.5
  _tingkat_kematian_cdr = 5.5;
  // Umur Akomodasi Hotel Lifespan = 50
  _umur_akomodasi_hotel_lifespan = 50.0;
  // Visitor per Room = 2
  _visitor_per_room = 2.0;
  // Waktu Pengolahan = 1
  _waktu_pengolahan = 1.0;
  // Waktu Rembesan = 1
  _waktu_rembesan = 1.0;
}

/*export*/ function initConstants() {
  // Initialize constants
  initConstants0();
  initConstants1();
  initLookups();
  initData();
}

function initLevels0() {
  // Akumulasi Polusi = INTEG(Produksi Air Limbah+Produksi Limbah Padat-Peluruhan Polusi Alami-Pengolahan Limbah,0.174)
  _akumulasi_polusi = 0.174;
  // Jumlah Unit Akomodasi = INTEG(Pembangunan Akomodasi Baru-Demolisi Akomodasi,5850)
  _jumlah_unit_akomodasi = 5850.0;
  // Jumlah Wisatawan Mancanegara = INTEG(Pertumbuhan Wisatawan Mancanegara,7.167e+06)
  _jumlah_wisatawan_mancanegara = 7167000.0;
  // Jumlah Wisatawan Nusantara = INTEG(Pertumbuhan Wisatawan Nusantara,3.82e+07)
  _jumlah_wisatawan_nusantara = 38200000.0;
  // Luas Area Terbangun = INTEG(Konversi Lahan ke Terbangun,428)
  _luas_area_terbangun = 428.0;
  // Luas Hutan Vegetasi = INTEG(-Pengurangan Hutan Vegetasi,1220)
  _luas_hutan_vegetasi = 1220.0;
  // Luas Lahan Pertanian = INTEG(-Pengurangan Lahan Pertanian,930)
  _luas_lahan_pertanian = 930.0;
  // Populasi Penduduk DIY = INTEG(Imigrasi+Kelahiran-Emigrasi-Kematian,3.68872e+06)
  _populasi_penduduk_diy = 3688720.0;
  // Stok Air Tanah = INTEG(Imbuhan Air Tanah-Ekstraksi Air Tanah-Rembesan Air ke Laut,4.4e+08)
  _stok_air_tanah = 440000000.0;
}

/*export*/ function initLevels() {
  // Initialize variables with initialization values, such as levels, and the variables they depend on
  initLevels0();
}

function evalAux0() {
  // Demolisi Akomodasi = Jumlah Unit Akomodasi/Umur Akomodasi Hotel Lifespan
  _demolisi_akomodasi = _jumlah_unit_akomodasi / _umur_akomodasi_hotel_lifespan;
  // Emigrasi = Populasi Penduduk DIY*Tingkat Emigrasi
  _emigrasi = _populasi_penduduk_diy * _tingkat_emigrasi;
  // Indeks Kualitas Lingkungan = 1/(1+Akumulasi Polusi)
  _indeks_kualitas_lingkungan = 1.0 / (1.0 + _akumulasi_polusi);
  // Kelahiran = Populasi Penduduk DIY*Tingkat Kelahiran CBR/1000
  _kelahiran = _populasi_penduduk_diy * _tingkat_kelahiran_cbr / 1000.0;
  // Lahan Tersedia untuk Pengembangan = Lahan Diizinkan untuk Resort-Luas Area Terbangun
  _lahan_tersedia_untuk_pengembangan = _lahan_diizinkan_untuk_resort - _luas_area_terbangun;
  // Peluruhan Polusi Alami = Akumulasi Polusi*Decay Rate
  _peluruhan_polusi_alami = _akumulasi_polusi * _decay_rate;
  // Pengolahan Limbah = Akumulasi Polusi*(0.6*Proporsi Pengolahan Air Limbah+0.4*Proporsi Pengolahan Limbah Padat)/Waktu Pengolahan
  _pengolahan_limbah = _akumulasi_polusi * (0.6 * _proporsi_pengolahan_air_limbah + 0.4 * _proporsi_pengolahan_limbah_padat) / _waktu_pengolahan;
  // Rembesan Air ke Laut = MAX(Stok Air Tanah-4.5e+08,0)/Waktu Rembesan
  _rembesan_air_ke_laut = fns.MAX(_stok_air_tanah - 450000000.0, 0.0) / _waktu_rembesan;
  // SAVEPER = TIME STEP
  _saveper = _time_step;
  // Ketersediaan Kamar = Jumlah Unit Akomodasi*"Rata-rata Kamar per Unit Akomodasi"
  _ketersediaan_kamar = _jumlah_unit_akomodasi * __rata_rata_kamar_per_unit_akomodasi_;
  // Lapangan Kerja Pariwisata = Ketersediaan Kamar*Jobs per Room
  _lapangan_kerja_pariwisata = _ketersediaan_kamar * _jobs_per_room;
  // Total Pekerjaan Tersedia = Lapangan Kerja Pariwisata*(1+2.5)
  _total_pekerjaan_tersedia = _lapangan_kerja_pariwisata * (1.0 + 2.5);
  // Angkatan Kerja = Populasi Penduduk DIY*Labour Force Fraction
  _angkatan_kerja = _populasi_penduduk_diy * _labour_force_fraction;
  // Jumlah Keluarga = Populasi Penduduk DIY/"Rata-rata Anggota per Keluarga"
  _jumlah_keluarga = _populasi_penduduk_diy / __rata_rata_anggota_per_keluarga_;
  // Limbah Padat Domestik = Jumlah Keluarga*Sampah Padat per Keluarga
  _limbah_padat_domestik = _jumlah_keluarga * _sampah_padat_per_keluarga;
  // Limbah Padat Hotel = Ketersediaan Kamar*Occupancy Rate Hotel*(0.6*Sampah Padat per Kamar Hotel Bintang+0.4*Sampah Padat per Kamar Hotel Non Bintang)
  _limbah_padat_hotel = _ketersediaan_kamar * _occupancy_rate_hotel * (0.6 * _sampah_padat_per_kamar_hotel_bintang + 0.4 * _sampah_padat_per_kamar_hotel_non_bintang);
  // Produksi Limbah Padat = (Limbah Padat Hotel+Limbah Padat Domestik)/Normalisasi Limbah Padat
  _produksi_limbah_padat = (_limbah_padat_hotel + _limbah_padat_domestik) / _normalisasi_limbah_padat;
  // Kebutuhan Air Domestik = Jumlah Keluarga*Penggunaan Air per Keluarga
  _kebutuhan_air_domestik = _jumlah_keluarga * _penggunaan_air_per_keluarga;
  // Kebutuhan Air Hotel = Ketersediaan Kamar*Occupancy Rate Hotel*(0.6*Penggunaan Air per Kamar Hotel Bintang+0.4*"Penggunaan Air per Kamar Hotel Non-Bintang")
  _kebutuhan_air_hotel = _ketersediaan_kamar * _occupancy_rate_hotel * (0.6 * _penggunaan_air_per_kamar_hotel_bintang + 0.4 * __penggunaan_air_per_kamar_hotel_non_bintang_);
  // Kebutuhan Air Total = Kebutuhan Air Hotel+Kebutuhan Air Domestik
  _kebutuhan_air_total = _kebutuhan_air_hotel + _kebutuhan_air_domestik;
  // Produksi Air Limbah = Kebutuhan Air Total*Fraksi Air Limbah/Normalisasi Air Limbah
  _produksi_air_limbah = _kebutuhan_air_total * _fraksi_air_limbah / _normalisasi_air_limbah;
  // Vegetation Cover Ratio = Luas Hutan Vegetasi/Luas Hutan Awal
  _vegetation_cover_ratio = _luas_hutan_vegetasi / _luas_hutan_awal;
  // Natural Beauty Index = Vegetation Cover Ratio
  _natural_beauty_index = _vegetation_cover_ratio;
  // Effect of Natural Beauty on Tourism = WITH LOOKUP(Natural Beauty Index,([(0,0)-(2,1.5)],(0,0.2),(0.5,0.5),(0.8,0.8),(1,1),(1.2,1.2)))
  _effect_of_natural_beauty_on_tourism = fns.WITH_LOOKUP(_natural_beauty_index, __lookup4);
  // Crowding Index = (Jumlah Wisatawan Nusantara+Jumlah Wisatawan Mancanegara)/(Area Destinasi Wisata*Carrying Capacity per ha)
  _crowding_index = (_jumlah_wisatawan_nusantara + _jumlah_wisatawan_mancanegara) / (_area_destinasi_wisata * _carrying_capacity_per_ha);
  // Effect of Crowding on Tourism = WITH LOOKUP(Crowding Index,([(0,0)-(20000,1.5)],(0,0.8),(5000,1),(10000,0.95),(15000,0.85),(20000,0.8)))
  _effect_of_crowding_on_tourism = fns.WITH_LOOKUP(_crowding_index, __lookup1);
  // Indeks Polusi Padat = (Limbah Padat Hotel+Limbah Padat Domestik)*(1-Proporsi Pengolahan Limbah Padat)/Limbah Padat Awal
  _indeks_polusi_padat = (_limbah_padat_hotel + _limbah_padat_domestik) * (1.0 - _proporsi_pengolahan_limbah_padat) / _limbah_padat_awal;
  // Indeks Polusi Air = Kebutuhan Air Total*Fraksi Air Limbah*(1-Proporsi Pengolahan Air Limbah)/Air Limbah Awal
  _indeks_polusi_air = _kebutuhan_air_total * _fraksi_air_limbah * (1.0 - _proporsi_pengolahan_air_limbah) / _air_limbah_awal;
  // Indeks Polusi Gabungan = 0.6*Indeks Polusi Air+0.4*Indeks Polusi Padat
  _indeks_polusi_gabungan = 0.6 * _indeks_polusi_air + 0.4 * _indeks_polusi_padat;
  // Effect of Pollution on Tourism = WITH LOOKUP(Indeks Polusi Gabungan,([(0,0)-(4,1.5)],(0,1.2),(0.5,1.1),(1,1),(1.5,0.9),(2,0.85),(3,0.8),(4,0.8)))
  _effect_of_pollution_on_tourism = fns.WITH_LOOKUP(_indeks_polusi_gabungan, __lookup6);
}

function evalAux1() {
  // Clean Water from Rainfall = Jumlah Keluarga*Rainfall Collection per Household
  _clean_water_from_rainfall = _jumlah_keluarga * _rainfall_collection_per_household;
  // Ekstraksi Air Tanah = MIN(Kebutuhan Air Total,Ekstraksi Air Tanah yang Diizinkan)
  _ekstraksi_air_tanah = fns.MIN(_kebutuhan_air_total, _ekstraksi_air_tanah_yang_diizinkan);
  // Treated Groundwater = Ekstraksi Air Tanah*(1-Leaking Rate Jaringan Air)
  _treated_groundwater = _ekstraksi_air_tanah * (1.0 - _leaking_rate_jaringan_air);
  // Pasokan Air = Treated Groundwater+Clean Water from Rainfall+Resevoir
  _pasokan_air = _treated_groundwater + _clean_water_from_rainfall + _resevoir;
  // "Rasio Demand-Supply Air" = Kebutuhan Air Total/Pasokan Air
  __rasio_demand_supply_air_ = _kebutuhan_air_total / _pasokan_air;
  // Effect of Water Availability on Tourism = WITH LOOKUP("Rasio Demand-Supply Air",([(0,0)-(20,1.5)],(0,1.2),(1,1),(5,0.85),(10,0.8),(20,0.8),(30,0.8)))
  _effect_of_water_availability_on_tourism = fns.WITH_LOOKUP(__rasio_demand_supply_air_, __lookup9);
  // Tourism Growth Multiplier = Effect of Water Availability on Tourism*Effect of Pollution on Tourism*Effect of Crowding on Tourism*Effect of Natural Beauty on Tourism
  _tourism_growth_multiplier = _effect_of_water_availability_on_tourism * _effect_of_pollution_on_tourism * _effect_of_crowding_on_tourism * _effect_of_natural_beauty_on_tourism;
  // Pertumbuhan Wisatawan Nusantara = Jumlah Wisatawan Nusantara*Laju Pertumbuhan Wisatawan Nusantara Dasar*Tourism Growth Multiplier
  _pertumbuhan_wisatawan_nusantara = _jumlah_wisatawan_nusantara * _laju_pertumbuhan_wisatawan_nusantara_dasar * _tourism_growth_multiplier;
  // Pertumbuhan Wisatawan Mancanegara = Jumlah Wisatawan Mancanegara*Laju Pertumbuhan Wisatawan Mancanegara Dasar*Tourism Growth Multiplier
  _pertumbuhan_wisatawan_mancanegara = _jumlah_wisatawan_mancanegara * _laju_pertumbuhan_wisatawan_mancanegara_dasar * _tourism_growth_multiplier;
  // Land Used Fraction = Luas Area Terbangun/Lahan Diizinkan untuk Resort
  _land_used_fraction = _luas_area_terbangun / _lahan_diizinkan_untuk_resort;
  // Effect of Land Availability on Construction = WITH LOOKUP(Land Used Fraction,([(0,0)-(1,1)],(0,1),(0.2,0.95),(0.4,0.85),(0.6,0.7),(0.8,0.55),(0.9,0.5),(1,0.5)))
  _effect_of_land_availability_on_construction = fns.WITH_LOOKUP(_land_used_fraction, __lookup3);
  // Total Hari Bermalam = (Jumlah Wisatawan Nusantara*Lama Tinggal Wisatawan Nusantara)+(Jumlah Wisatawan Mancanegara*Lama Tinggal Wisatawan Mancanegara)
  _total_hari_bermalam = (_jumlah_wisatawan_nusantara * _lama_tinggal_wisatawan_nusantara) + (_jumlah_wisatawan_mancanegara * _lama_tinggal_wisatawan_mancanegara);
  // Kebutuhan Kamar Hotel = Total Hari Bermalam/(Hari per Tahun*Occupancy Rate Hotel*Visitor per Room*Seasonal Loading Factor)
  _kebutuhan_kamar_hotel = _total_hari_bermalam / (_hari_per_tahun * _occupancy_rate_hotel * _visitor_per_room * _seasonal_loading_factor);
  // Room Demand Ratio = Kebutuhan Kamar Hotel/Ketersediaan Kamar
  _room_demand_ratio = _kebutuhan_kamar_hotel / _ketersediaan_kamar;
  // Effect of Room Demand on Construction = WITH LOOKUP(Room Demand Ratio,([(0,0)-(15,1.5)],(0,0.6),(0.5,0.7),(1,1),(1.5,1.3),(2,1.4),(10,1.4),(15,1.4)))
  _effect_of_room_demand_on_construction = fns.WITH_LOOKUP(_room_demand_ratio, __lookup7);
  // Pembangunan Akomodasi Baru = Laju Konstruksi Hotel Dasar*Effect of Room Demand on Construction*Effect of Land Availability on Construction
  _pembangunan_akomodasi_baru = _laju_konstruksi_hotel_dasar * _effect_of_room_demand_on_construction * _effect_of_land_availability_on_construction;
  // Konversi Lahan ke Terbangun = Pembangunan Akomodasi Baru*Luas Lahan per Unit Akomodasi
  _konversi_lahan_ke_terbangun = _pembangunan_akomodasi_baru * _luas_lahan_per_unit_akomodasi;
  // Pengurangan Lahan Pertanian = Konversi Lahan ke Terbangun*0.5
  _pengurangan_lahan_pertanian = _konversi_lahan_ke_terbangun * 0.5;
  // Pengurangan Hutan Vegetasi = Konversi Lahan ke Terbangun*0.5
  _pengurangan_hutan_vegetasi = _konversi_lahan_ke_terbangun * 0.5;
  // Effect of Pollution on Death Rate = WITH LOOKUP(Indeks Polusi Gabungan,([(0,0)-(10,1.5)],(0,1),(0.5,1),(1,1),(1.5,1.1),(2,1.2),(3,1.35),(10,1.4)))
  _effect_of_pollution_on_death_rate = fns.WITH_LOOKUP(_indeks_polusi_gabungan, __lookup5);
  // Kematian = Populasi Penduduk DIY*Tingkat Kematian CDR/1000*Effect of Pollution on Death Rate
  _kematian = _populasi_penduduk_diy * _tingkat_kematian_cdr / 1000.0 * _effect_of_pollution_on_death_rate;
  // Rasio Pengangguran = Angkatan Kerja/Total Pekerjaan Tersedia
  _rasio_pengangguran = _angkatan_kerja / _total_pekerjaan_tersedia;
  // Effect of Labour Jobs on Immigration = WITH LOOKUP(Rasio Pengangguran,([(0,0)-(25,1.5)],(0,0.8),(1,1),(5,1.2),(10,1.3),(15,1.3),(25,1.3)))
  _effect_of_labour_jobs_on_immigration = fns.WITH_LOOKUP(_rasio_pengangguran, __lookup2);
  // Imigrasi = Populasi Penduduk DIY*Tingkat Imigrasi Dasar*Effect of Labour Jobs on Immigration
  _imigrasi = _populasi_penduduk_diy * _tingkat_imigrasi_dasar * _effect_of_labour_jobs_on_immigration;
  // Effect of Vegetation Cover on Infiltration = WITH LOOKUP(Vegetation Cover Ratio,([(0,0)-(1.5,1.5)],(0,0.8),(0.5,0.9),(1,1),(1.2,1)))
  _effect_of_vegetation_cover_on_infiltration = fns.WITH_LOOKUP(_vegetation_cover_ratio, __lookup8);
  // Imbuhan Air Tanah = Normal Infiltration Rate*Effect of Vegetation Cover on Infiltration
  _imbuhan_air_tanah = _normal_infiltration_rate * _effect_of_vegetation_cover_on_infiltration;
}

/*export*/ function evalAux() {
  // Evaluate auxiliaries in order from the bottom up
  evalAux0();
  evalAux1();
}

function evalLevels0() {
  // Akumulasi Polusi = INTEG(Produksi Air Limbah+Produksi Limbah Padat-Peluruhan Polusi Alami-Pengolahan Limbah,0.174)
  _akumulasi_polusi = fns.INTEG(_akumulasi_polusi, _produksi_air_limbah + _produksi_limbah_padat - _peluruhan_polusi_alami - _pengolahan_limbah);
  // Jumlah Unit Akomodasi = INTEG(Pembangunan Akomodasi Baru-Demolisi Akomodasi,5850)
  _jumlah_unit_akomodasi = fns.INTEG(_jumlah_unit_akomodasi, _pembangunan_akomodasi_baru - _demolisi_akomodasi);
  // Jumlah Wisatawan Mancanegara = INTEG(Pertumbuhan Wisatawan Mancanegara,7.167e+06)
  _jumlah_wisatawan_mancanegara = fns.INTEG(_jumlah_wisatawan_mancanegara, _pertumbuhan_wisatawan_mancanegara);
  // Jumlah Wisatawan Nusantara = INTEG(Pertumbuhan Wisatawan Nusantara,3.82e+07)
  _jumlah_wisatawan_nusantara = fns.INTEG(_jumlah_wisatawan_nusantara, _pertumbuhan_wisatawan_nusantara);
  // Luas Area Terbangun = INTEG(Konversi Lahan ke Terbangun,428)
  _luas_area_terbangun = fns.INTEG(_luas_area_terbangun, _konversi_lahan_ke_terbangun);
  // Luas Hutan Vegetasi = INTEG(-Pengurangan Hutan Vegetasi,1220)
  _luas_hutan_vegetasi = fns.INTEG(_luas_hutan_vegetasi, -_pengurangan_hutan_vegetasi);
  // Luas Lahan Pertanian = INTEG(-Pengurangan Lahan Pertanian,930)
  _luas_lahan_pertanian = fns.INTEG(_luas_lahan_pertanian, -_pengurangan_lahan_pertanian);
  // Populasi Penduduk DIY = INTEG(Imigrasi+Kelahiran-Emigrasi-Kematian,3.68872e+06)
  _populasi_penduduk_diy = fns.INTEG(_populasi_penduduk_diy, _imigrasi + _kelahiran - _emigrasi - _kematian);
  // Stok Air Tanah = INTEG(Imbuhan Air Tanah-Ekstraksi Air Tanah-Rembesan Air ke Laut,4.4e+08)
  _stok_air_tanah = fns.INTEG(_stok_air_tanah, _imbuhan_air_tanah - _ekstraksi_air_tanah - _rembesan_air_ke_laut);
}

/*export*/ function evalLevels() {
  // Evaluate levels
  evalLevels0();
}

/*export*/ function setInputs(valueAtIndex /*: (index: number) => number*/) {}

/*export*/ function setConstant(varSpec /*: VarSpec*/, value /*: number*/) {
  throw new Error('The setConstant function was not enabled for the generated model. Set the customConstants property in the spec/config file to allow for overriding constants at runtime.');
}

/*export*/ function setLookup(varSpec /*: VarSpec*/, points /*: Float64Array | undefined*/) {
  throw new Error('The setLookup function was not enabled for the generated model. Set the customLookups property in the spec/config file to allow for overriding lookups at runtime.');
}

/*export*/ const outputVarIds = [
  '__penggunaan_air_per_kamar_hotel_non_bintang_',
  '__rasio_demand_supply_air_',
  '__rata_rata_anggota_per_keluarga_',
  '__rata_rata_kamar_per_unit_akomodasi_',
  '_air_limbah_awal',
  '_akumulasi_polusi',
  '_angkatan_kerja',
  '_area_destinasi_wisata',
  '_carrying_capacity_per_ha',
  '_clean_water_from_rainfall',
  '_crowding_index',
  '_decay_rate',
  '_demolisi_akomodasi',
  '_effect_of_crowding_on_tourism',
  '_effect_of_labour_jobs_on_immigration',
  '_effect_of_land_availability_on_construction',
  '_effect_of_natural_beauty_on_tourism',
  '_effect_of_pollution_on_death_rate',
  '_effect_of_pollution_on_tourism',
  '_effect_of_room_demand_on_construction',
  '_effect_of_vegetation_cover_on_infiltration',
  '_effect_of_water_availability_on_tourism',
  '_ekstraksi_air_tanah',
  '_ekstraksi_air_tanah_yang_diizinkan',
  '_emigrasi',
  '_final_time',
  '_fraksi_air_limbah',
  '_hari_per_tahun',
  '_imbuhan_air_tanah',
  '_imigrasi',
  '_indeks_kualitas_lingkungan',
  '_indeks_polusi_air',
  '_indeks_polusi_gabungan',
  '_indeks_polusi_padat',
  '_initial_time',
  '_jobs_per_room',
  '_jumlah_keluarga',
  '_jumlah_unit_akomodasi',
  '_jumlah_wisatawan_mancanegara',
  '_jumlah_wisatawan_nusantara',
  '_kebutuhan_air_domestik',
  '_kebutuhan_air_hotel',
  '_kebutuhan_air_total',
  '_kebutuhan_kamar_hotel',
  '_kelahiran',
  '_kematian',
  '_ketersediaan_kamar',
  '_konversi_lahan_ke_terbangun',
  '_labour_force_fraction',
  '_lahan_diizinkan_untuk_resort',
  '_lahan_tersedia_untuk_pengembangan',
  '_laju_konstruksi_hotel_dasar',
  '_laju_pertumbuhan_wisatawan_mancanegara_dasar',
  '_laju_pertumbuhan_wisatawan_nusantara_dasar',
  '_lama_tinggal_wisatawan_mancanegara',
  '_lama_tinggal_wisatawan_nusantara',
  '_land_used_fraction',
  '_lapangan_kerja_pariwisata',
  '_leaking_rate_jaringan_air',
  '_limbah_padat_awal',
  '_limbah_padat_domestik',
  '_limbah_padat_hotel',
  '_luas_area_terbangun',
  '_luas_hutan_awal',
  '_luas_hutan_vegetasi',
  '_luas_lahan_per_unit_akomodasi',
  '_luas_lahan_pertanian',
  '_natural_beauty_index',
  '_normal_infiltration_rate',
  '_normalisasi_air_limbah',
  '_normalisasi_limbah_padat',
  '_occupancy_rate_hotel',
  '_pasokan_air',
  '_peluruhan_polusi_alami',
  '_pembangunan_akomodasi_baru',
  '_penggunaan_air_per_kamar_hotel_bintang',
  '_penggunaan_air_per_keluarga',
  '_pengolahan_limbah',
  '_pengurangan_hutan_vegetasi',
  '_pengurangan_lahan_pertanian',
  '_pertumbuhan_wisatawan_mancanegara',
  '_pertumbuhan_wisatawan_nusantara',
  '_populasi_penduduk_diy',
  '_produksi_air_limbah',
  '_produksi_limbah_padat',
  '_proporsi_pengolahan_air_limbah',
  '_proporsi_pengolahan_limbah_padat',
  '_rainfall_collection_per_household',
  '_rasio_pengangguran',
  '_rembesan_air_ke_laut',
  '_resevoir',
  '_room_demand_ratio',
  '_sampah_padat_per_kamar_hotel_bintang',
  '_sampah_padat_per_kamar_hotel_non_bintang',
  '_sampah_padat_per_keluarga',
  '_saveper',
  '_seasonal_loading_factor',
  '_stok_air_tanah',
  '_time',
  '_time_step',
  '_tingkat_emigrasi',
  '_tingkat_imigrasi_dasar',
  '_tingkat_kelahiran_cbr',
  '_tingkat_kematian_cdr',
  '_total_hari_bermalam',
  '_total_pekerjaan_tersedia',
  '_tourism_growth_multiplier',
  '_treated_groundwater',
  '_umur_akomodasi_hotel_lifespan',
  '_vegetation_cover_ratio',
  '_visitor_per_room',
  '_waktu_pengolahan',
  '_waktu_rembesan'
];

/*export*/ const outputVarNames = [
  '"Penggunaan Air per Kamar Hotel Non-Bintang"',
  '"Rasio Demand-Supply Air"',
  '"Rata-rata Anggota per Keluarga"',
  '"Rata-rata Kamar per Unit Akomodasi"',
  'Air Limbah Awal',
  'Akumulasi Polusi',
  'Angkatan Kerja',
  'Area Destinasi Wisata',
  'Carrying Capacity per ha',
  'Clean Water from Rainfall',
  'Crowding Index',
  'Decay Rate',
  'Demolisi Akomodasi',
  'Effect of Crowding on Tourism',
  'Effect of Labour Jobs on Immigration',
  'Effect of Land Availability on Construction',
  'Effect of Natural Beauty on Tourism',
  'Effect of Pollution on Death Rate',
  'Effect of Pollution on Tourism',
  'Effect of Room Demand on Construction',
  'Effect of Vegetation Cover on Infiltration',
  'Effect of Water Availability on Tourism',
  'Ekstraksi Air Tanah',
  'Ekstraksi Air Tanah yang Diizinkan',
  'Emigrasi',
  'FINAL TIME',
  'Fraksi Air Limbah',
  'Hari per Tahun',
  'Imbuhan Air Tanah',
  'Imigrasi',
  'Indeks Kualitas Lingkungan',
  'Indeks Polusi Air',
  'Indeks Polusi Gabungan',
  'Indeks Polusi Padat',
  'INITIAL TIME',
  'Jobs per Room',
  'Jumlah Keluarga',
  'Jumlah Unit Akomodasi',
  'Jumlah Wisatawan Mancanegara',
  'Jumlah Wisatawan Nusantara',
  'Kebutuhan Air Domestik',
  'Kebutuhan Air Hotel',
  'Kebutuhan Air Total',
  'Kebutuhan Kamar Hotel',
  'Kelahiran',
  'Kematian',
  'Ketersediaan Kamar',
  'Konversi Lahan ke Terbangun',
  'Labour Force Fraction',
  'Lahan Diizinkan untuk Resort',
  'Lahan Tersedia untuk Pengembangan',
  'Laju Konstruksi Hotel Dasar',
  'Laju Pertumbuhan Wisatawan Mancanegara Dasar',
  'Laju Pertumbuhan Wisatawan Nusantara Dasar',
  'Lama Tinggal Wisatawan Mancanegara',
  'Lama Tinggal Wisatawan Nusantara',
  'Land Used Fraction',
  'Lapangan Kerja Pariwisata',
  'Leaking Rate Jaringan Air',
  'Limbah Padat Awal',
  'Limbah Padat Domestik',
  'Limbah Padat Hotel',
  'Luas Area Terbangun',
  'Luas Hutan Awal',
  'Luas Hutan Vegetasi',
  'Luas Lahan per Unit Akomodasi',
  'Luas Lahan Pertanian',
  'Natural Beauty Index',
  'Normal Infiltration Rate',
  'Normalisasi Air Limbah',
  'Normalisasi Limbah Padat',
  'Occupancy Rate Hotel',
  'Pasokan Air',
  'Peluruhan Polusi Alami',
  'Pembangunan Akomodasi Baru',
  'Penggunaan Air per Kamar Hotel Bintang',
  'Penggunaan Air per Keluarga',
  'Pengolahan Limbah',
  'Pengurangan Hutan Vegetasi',
  'Pengurangan Lahan Pertanian',
  'Pertumbuhan Wisatawan Mancanegara',
  'Pertumbuhan Wisatawan Nusantara',
  'Populasi Penduduk DIY',
  'Produksi Air Limbah',
  'Produksi Limbah Padat',
  'Proporsi Pengolahan Air Limbah',
  'Proporsi Pengolahan Limbah Padat',
  'Rainfall Collection per Household',
  'Rasio Pengangguran',
  'Rembesan Air ke Laut',
  'Resevoir',
  'Room Demand Ratio',
  'Sampah Padat per Kamar Hotel Bintang',
  'Sampah Padat per Kamar Hotel Non Bintang',
  'Sampah Padat per Keluarga',
  'SAVEPER',
  'Seasonal Loading Factor',
  'Stok Air Tanah',
  'Time',
  'TIME STEP',
  'Tingkat Emigrasi',
  'Tingkat Imigrasi Dasar',
  'Tingkat Kelahiran CBR',
  'Tingkat Kematian CDR',
  'Total Hari Bermalam',
  'Total Pekerjaan Tersedia',
  'Tourism Growth Multiplier',
  'Treated Groundwater',
  'Umur Akomodasi Hotel Lifespan',
  'Vegetation Cover Ratio',
  'Visitor per Room',
  'Waktu Pengolahan',
  'Waktu Rembesan'
];

/*export*/ function storeOutputs(storeValue /*: (value: number) => void*/) {
  storeValue(__penggunaan_air_per_kamar_hotel_non_bintang_);
  storeValue(__rasio_demand_supply_air_);
  storeValue(__rata_rata_anggota_per_keluarga_);
  storeValue(__rata_rata_kamar_per_unit_akomodasi_);
  storeValue(_air_limbah_awal);
  storeValue(_akumulasi_polusi);
  storeValue(_angkatan_kerja);
  storeValue(_area_destinasi_wisata);
  storeValue(_carrying_capacity_per_ha);
  storeValue(_clean_water_from_rainfall);
  storeValue(_crowding_index);
  storeValue(_decay_rate);
  storeValue(_demolisi_akomodasi);
  storeValue(_effect_of_crowding_on_tourism);
  storeValue(_effect_of_labour_jobs_on_immigration);
  storeValue(_effect_of_land_availability_on_construction);
  storeValue(_effect_of_natural_beauty_on_tourism);
  storeValue(_effect_of_pollution_on_death_rate);
  storeValue(_effect_of_pollution_on_tourism);
  storeValue(_effect_of_room_demand_on_construction);
  storeValue(_effect_of_vegetation_cover_on_infiltration);
  storeValue(_effect_of_water_availability_on_tourism);
  storeValue(_ekstraksi_air_tanah);
  storeValue(_ekstraksi_air_tanah_yang_diizinkan);
  storeValue(_emigrasi);
  storeValue(_final_time);
  storeValue(_fraksi_air_limbah);
  storeValue(_hari_per_tahun);
  storeValue(_imbuhan_air_tanah);
  storeValue(_imigrasi);
  storeValue(_indeks_kualitas_lingkungan);
  storeValue(_indeks_polusi_air);
  storeValue(_indeks_polusi_gabungan);
  storeValue(_indeks_polusi_padat);
  storeValue(_initial_time);
  storeValue(_jobs_per_room);
  storeValue(_jumlah_keluarga);
  storeValue(_jumlah_unit_akomodasi);
  storeValue(_jumlah_wisatawan_mancanegara);
  storeValue(_jumlah_wisatawan_nusantara);
  storeValue(_kebutuhan_air_domestik);
  storeValue(_kebutuhan_air_hotel);
  storeValue(_kebutuhan_air_total);
  storeValue(_kebutuhan_kamar_hotel);
  storeValue(_kelahiran);
  storeValue(_kematian);
  storeValue(_ketersediaan_kamar);
  storeValue(_konversi_lahan_ke_terbangun);
  storeValue(_labour_force_fraction);
  storeValue(_lahan_diizinkan_untuk_resort);
  storeValue(_lahan_tersedia_untuk_pengembangan);
  storeValue(_laju_konstruksi_hotel_dasar);
  storeValue(_laju_pertumbuhan_wisatawan_mancanegara_dasar);
  storeValue(_laju_pertumbuhan_wisatawan_nusantara_dasar);
  storeValue(_lama_tinggal_wisatawan_mancanegara);
  storeValue(_lama_tinggal_wisatawan_nusantara);
  storeValue(_land_used_fraction);
  storeValue(_lapangan_kerja_pariwisata);
  storeValue(_leaking_rate_jaringan_air);
  storeValue(_limbah_padat_awal);
  storeValue(_limbah_padat_domestik);
  storeValue(_limbah_padat_hotel);
  storeValue(_luas_area_terbangun);
  storeValue(_luas_hutan_awal);
  storeValue(_luas_hutan_vegetasi);
  storeValue(_luas_lahan_per_unit_akomodasi);
  storeValue(_luas_lahan_pertanian);
  storeValue(_natural_beauty_index);
  storeValue(_normal_infiltration_rate);
  storeValue(_normalisasi_air_limbah);
  storeValue(_normalisasi_limbah_padat);
  storeValue(_occupancy_rate_hotel);
  storeValue(_pasokan_air);
  storeValue(_peluruhan_polusi_alami);
  storeValue(_pembangunan_akomodasi_baru);
  storeValue(_penggunaan_air_per_kamar_hotel_bintang);
  storeValue(_penggunaan_air_per_keluarga);
  storeValue(_pengolahan_limbah);
  storeValue(_pengurangan_hutan_vegetasi);
  storeValue(_pengurangan_lahan_pertanian);
  storeValue(_pertumbuhan_wisatawan_mancanegara);
  storeValue(_pertumbuhan_wisatawan_nusantara);
  storeValue(_populasi_penduduk_diy);
  storeValue(_produksi_air_limbah);
  storeValue(_produksi_limbah_padat);
  storeValue(_proporsi_pengolahan_air_limbah);
  storeValue(_proporsi_pengolahan_limbah_padat);
  storeValue(_rainfall_collection_per_household);
  storeValue(_rasio_pengangguran);
  storeValue(_rembesan_air_ke_laut);
  storeValue(_resevoir);
  storeValue(_room_demand_ratio);
  storeValue(_sampah_padat_per_kamar_hotel_bintang);
  storeValue(_sampah_padat_per_kamar_hotel_non_bintang);
  storeValue(_sampah_padat_per_keluarga);
  storeValue(_saveper);
  storeValue(_seasonal_loading_factor);
  storeValue(_stok_air_tanah);
  storeValue(_time);
  storeValue(_time_step);
  storeValue(_tingkat_emigrasi);
  storeValue(_tingkat_imigrasi_dasar);
  storeValue(_tingkat_kelahiran_cbr);
  storeValue(_tingkat_kematian_cdr);
  storeValue(_total_hari_bermalam);
  storeValue(_total_pekerjaan_tersedia);
  storeValue(_tourism_growth_multiplier);
  storeValue(_treated_groundwater);
  storeValue(_umur_akomodasi_hotel_lifespan);
  storeValue(_vegetation_cover_ratio);
  storeValue(_visitor_per_room);
  storeValue(_waktu_pengolahan);
  storeValue(_waktu_rembesan);
}

/*export*/ function storeOutput(varSpec /*: VarSpec*/, storeValue /*: (value: number) => void*/) {
  throw new Error('The storeOutput function was not enabled for the generated model. Set the customOutputs property in the spec/config file to allow for capturing arbitrary variables at runtime.');
}

/*export*/ const modelListing = {
  dimensions: [],
  variables: [
    {
      id: '__penggunaan_air_per_kamar_hotel_non_bintang_',
      index: 1
    },
    {
      id: '__rata_rata_anggota_per_keluarga_',
      index: 2
    },
    {
      id: '__rata_rata_kamar_per_unit_akomodasi_',
      index: 3
    },
    {
      id: '_air_limbah_awal',
      index: 4
    },
    {
      id: '_area_destinasi_wisata',
      index: 5
    },
    {
      id: '_carrying_capacity_per_ha',
      index: 6
    },
    {
      id: '_decay_rate',
      index: 7
    },
    {
      id: '_ekstraksi_air_tanah_yang_diizinkan',
      index: 8
    },
    {
      id: '_final_time',
      index: 9
    },
    {
      id: '_fraksi_air_limbah',
      index: 10
    },
    {
      id: '_hari_per_tahun',
      index: 11
    },
    {
      id: '_initial_time',
      index: 12
    },
    {
      id: '_jobs_per_room',
      index: 13
    },
    {
      id: '_labour_force_fraction',
      index: 14
    },
    {
      id: '_lahan_diizinkan_untuk_resort',
      index: 15
    },
    {
      id: '_laju_konstruksi_hotel_dasar',
      index: 16
    },
    {
      id: '_laju_pertumbuhan_wisatawan_mancanegara_dasar',
      index: 17
    },
    {
      id: '_laju_pertumbuhan_wisatawan_nusantara_dasar',
      index: 18
    },
    {
      id: '_lama_tinggal_wisatawan_mancanegara',
      index: 19
    },
    {
      id: '_lama_tinggal_wisatawan_nusantara',
      index: 20
    },
    {
      id: '_leaking_rate_jaringan_air',
      index: 21
    },
    {
      id: '_limbah_padat_awal',
      index: 22
    },
    {
      id: '_luas_hutan_awal',
      index: 23
    },
    {
      id: '_luas_lahan_per_unit_akomodasi',
      index: 24
    },
    {
      id: '_normal_infiltration_rate',
      index: 25
    },
    {
      id: '_normalisasi_air_limbah',
      index: 26
    },
    {
      id: '_normalisasi_limbah_padat',
      index: 27
    },
    {
      id: '_occupancy_rate_hotel',
      index: 28
    },
    {
      id: '_penggunaan_air_per_kamar_hotel_bintang',
      index: 29
    },
    {
      id: '_penggunaan_air_per_keluarga',
      index: 30
    },
    {
      id: '_proporsi_pengolahan_air_limbah',
      index: 31
    },
    {
      id: '_proporsi_pengolahan_limbah_padat',
      index: 32
    },
    {
      id: '_rainfall_collection_per_household',
      index: 33
    },
    {
      id: '_resevoir',
      index: 34
    },
    {
      id: '_sampah_padat_per_kamar_hotel_bintang',
      index: 35
    },
    {
      id: '_sampah_padat_per_kamar_hotel_non_bintang',
      index: 36
    },
    {
      id: '_sampah_padat_per_keluarga',
      index: 37
    },
    {
      id: '_seasonal_loading_factor',
      index: 38
    },
    {
      id: '_time_step',
      index: 39
    },
    {
      id: '_tingkat_emigrasi',
      index: 40
    },
    {
      id: '_tingkat_imigrasi_dasar',
      index: 41
    },
    {
      id: '_tingkat_kelahiran_cbr',
      index: 42
    },
    {
      id: '_tingkat_kematian_cdr',
      index: 43
    },
    {
      id: '_umur_akomodasi_hotel_lifespan',
      index: 44
    },
    {
      id: '_visitor_per_room',
      index: 45
    },
    {
      id: '_waktu_pengolahan',
      index: 46
    },
    {
      id: '_waktu_rembesan',
      index: 47
    },
    {
      id: '_time',
      index: 48
    },
    {
      id: '_akumulasi_polusi',
      index: 49
    },
    {
      id: '_jumlah_unit_akomodasi',
      index: 50
    },
    {
      id: '_jumlah_wisatawan_mancanegara',
      index: 51
    },
    {
      id: '_jumlah_wisatawan_nusantara',
      index: 52
    },
    {
      id: '_luas_area_terbangun',
      index: 53
    },
    {
      id: '_luas_hutan_vegetasi',
      index: 54
    },
    {
      id: '_luas_lahan_pertanian',
      index: 55
    },
    {
      id: '_populasi_penduduk_diy',
      index: 56
    },
    {
      id: '_stok_air_tanah',
      index: 57
    },
    {
      id: '_demolisi_akomodasi',
      index: 58
    },
    {
      id: '_emigrasi',
      index: 59
    },
    {
      id: '_indeks_kualitas_lingkungan',
      index: 60
    },
    {
      id: '_kelahiran',
      index: 61
    },
    {
      id: '_lahan_tersedia_untuk_pengembangan',
      index: 62
    },
    {
      id: '_peluruhan_polusi_alami',
      index: 63
    },
    {
      id: '_pengolahan_limbah',
      index: 64
    },
    {
      id: '_rembesan_air_ke_laut',
      index: 65
    },
    {
      id: '_saveper',
      index: 66
    },
    {
      id: '_ketersediaan_kamar',
      index: 67
    },
    {
      id: '_lapangan_kerja_pariwisata',
      index: 68
    },
    {
      id: '_total_pekerjaan_tersedia',
      index: 69
    },
    {
      id: '_angkatan_kerja',
      index: 70
    },
    {
      id: '_jumlah_keluarga',
      index: 71
    },
    {
      id: '_limbah_padat_domestik',
      index: 72
    },
    {
      id: '_limbah_padat_hotel',
      index: 73
    },
    {
      id: '_produksi_limbah_padat',
      index: 74
    },
    {
      id: '_kebutuhan_air_domestik',
      index: 75
    },
    {
      id: '_kebutuhan_air_hotel',
      index: 76
    },
    {
      id: '_kebutuhan_air_total',
      index: 77
    },
    {
      id: '_produksi_air_limbah',
      index: 78
    },
    {
      id: '_vegetation_cover_ratio',
      index: 79
    },
    {
      id: '_natural_beauty_index',
      index: 80
    },
    {
      id: '_effect_of_natural_beauty_on_tourism',
      index: 81
    },
    {
      id: '_crowding_index',
      index: 82
    },
    {
      id: '_effect_of_crowding_on_tourism',
      index: 83
    },
    {
      id: '_indeks_polusi_padat',
      index: 84
    },
    {
      id: '_indeks_polusi_air',
      index: 85
    },
    {
      id: '_indeks_polusi_gabungan',
      index: 86
    },
    {
      id: '_effect_of_pollution_on_tourism',
      index: 87
    },
    {
      id: '_clean_water_from_rainfall',
      index: 88
    },
    {
      id: '_ekstraksi_air_tanah',
      index: 89
    },
    {
      id: '_treated_groundwater',
      index: 90
    },
    {
      id: '_pasokan_air',
      index: 91
    },
    {
      id: '__rasio_demand_supply_air_',
      index: 92
    },
    {
      id: '_effect_of_water_availability_on_tourism',
      index: 93
    },
    {
      id: '_tourism_growth_multiplier',
      index: 94
    },
    {
      id: '_pertumbuhan_wisatawan_nusantara',
      index: 95
    },
    {
      id: '_pertumbuhan_wisatawan_mancanegara',
      index: 96
    },
    {
      id: '_land_used_fraction',
      index: 97
    },
    {
      id: '_effect_of_land_availability_on_construction',
      index: 98
    },
    {
      id: '_total_hari_bermalam',
      index: 99
    },
    {
      id: '_kebutuhan_kamar_hotel',
      index: 100
    },
    {
      id: '_room_demand_ratio',
      index: 101
    },
    {
      id: '_effect_of_room_demand_on_construction',
      index: 102
    },
    {
      id: '_pembangunan_akomodasi_baru',
      index: 103
    },
    {
      id: '_konversi_lahan_ke_terbangun',
      index: 104
    },
    {
      id: '_pengurangan_lahan_pertanian',
      index: 105
    },
    {
      id: '_pengurangan_hutan_vegetasi',
      index: 106
    },
    {
      id: '_effect_of_pollution_on_death_rate',
      index: 107
    },
    {
      id: '_kematian',
      index: 108
    },
    {
      id: '_rasio_pengangguran',
      index: 109
    },
    {
      id: '_effect_of_labour_jobs_on_immigration',
      index: 110
    },
    {
      id: '_imigrasi',
      index: 111
    },
    {
      id: '_effect_of_vegetation_cover_on_infiltration',
      index: 112
    },
    {
      id: '_imbuhan_air_tanah',
      index: 113
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
