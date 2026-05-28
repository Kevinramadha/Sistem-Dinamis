# SDEverywhere Model Integration Guide

## Status: ✅ INTEGRATED

Vensim model (`model-fix.mdl`) telah berhasil dikonversi ke JavaScript menggunakan SDEverywhere CLI dan terintegrasi dengan aplikasi Next.js.

## Instalasi SDEverywhere CLI

```bash
npm install -g @sdeverywhere/cli
# Versi yang digunakan: 0.7.40
```

## Konversi Model Vensim

```bash
cd /Users/kevinramadha/Documents/[06]\ Tingkat\ IV/[00]\ Skripsi/Sistem\ Dinamis

# Konversi model-fix.mdl ke JavaScript
sde build model-fix.mdl --genformat js --builddir lib/
```

Output:
- `lib/model-fix.js` (46 KB) - Model lengkap dengan 114+ variabel
- `lib/main.js` (146 bytes) - CLI runner

## Struktur Model

Model JavaScript memiliki struktur sebagai berikut:

### Inisialisasi
```typescript
const sdeModel = await loadSDEModel(); // Load async
sdeModel.setModelFunctions(fns);       // Set math functions
sdeModel.initConstants();               // Init parameters
sdeModel.initLevels();                  // Init stock levels
```

### Set Parameters (Input)
```typescript
sdeModel.setConstant('_laju_pertumbuhan_wisatawan_nusantara_dasar', value);
sdeModel.setConstant('_laju_pertumbuhan_wisatawan_mancanegara_dasar', value);
sdeModel.setConstant('_laju_konstruksi_hotel_dasar', value);
sdeModel.setConstant('_proporsi_pengolahan_air_limbah', value);
sdeModel.setConstant('_proporsi_pengolahan_limbah_padat', value);
sdeModel.setConstant('_ekstraksi_air_tanah_yang_diizinkan', value);
sdeModel.setConstant('_normal_infiltration_rate', value);
sdeModel.setConstant('_lahan_diizinkan_untuk_resort', value);
sdeModel.setConstant('_luas_lahan_per_unit_akomodasi', value);
```

### Simulasi (Loop)
```typescript
const initialTime = sdeModel.getInitialTime();
const finalTime = sdeModel.getFinalTime();
const timeStep = sdeModel.getTimeStep();

for (let time = initialTime; time <= finalTime; time += timeStep) {
  sdeModel.setTime(time);      // Set waktu simulasi
  sdeModel.evalAux();          // Evaluate auxiliary variables
  sdeModel.evalLevels();       // Evaluate stock levels
  
  // Get output
  const value = sdeModel.storeOutput('_jumlah_wisatawan_nusantara');
}
```

## Parameter Mapping

Mapping antara input parameters dan variabel Vensim:

| Parameter Input | Vensim Variable | Unit |
|---|---|---|
| `laju_wisnus` | `_laju_pertumbuhan_wisatawan_nusantara_dasar` | % (× 100) |
| `laju_wisman` | `_laju_pertumbuhan_wisatawan_mancanegara_dasar` | % (× 100) |
| `laju_konstruksi_hotel` | `_laju_konstruksi_hotel_dasar` | unit/tahun |
| `proporsi_olah_limbah_cair` | `_proporsi_pengolahan_air_limbah` | % |
| `proporsi_olah_limbah_padat` | `_proporsi_pengolahan_limbah_padat` | % |
| `ekstraksi_air_diizinkan` | `_ekstraksi_air_tanah_yang_diizinkan` | m³ |
| `infiltrasi_normal` | `_normal_infiltration_rate` | m³ |
| `lahan_diizinkan_resort` | `_lahan_diizinkan_untuk_resort` | % |
| `luas_lahan_per_unit` | `_luas_lahan_per_unit_akomodasi` | hektar |

## Output Variables

10 variabel output yang tersedia dari model:

1. `_jumlah_wisatawan_nusantara` - Domestic tourists
2. `_jumlah_wisatawan_mancanegara` - International tourists
3. `_jumlah_unit_akomodasi` - Accommodation units
4. `_populasi_penduduk_diy` - DIY population
5. `_stok_air_tanah` - Groundwater stock (m³)
6. `_luas_area_terbangun` - Built-up area (hectare)
7. `_akumulasi_polusi` - Pollution accumulation
8. `_indeks_kualitas_lingkungan` - Environmental quality index
9. `_lapangan_kerja_pariwisata` - Tourism employment
10. `_rasio_demand_supply_air_` - Water demand-supply ratio

## File Integration

### `lib/model.ts`

File utama yang menghubungkan model dengan aplikasi:

```typescript
export async function runModel(params: SimulationParams): Promise<SimulationData>
```

Fungsi ini:
1. Mencoba load SDEverywhere model (`model-fix.js`)
2. Jika tersedia, menggunakan model asli
3. Jika tidak tersedia, fallback ke dummy data generator
4. Returns SimulationData dengan 10 output variables

### `lib/scenarios.ts`

Berisi 5 skenario kebijakan dengan parameter yang sudah ditentukan:
- S1: Baseline (BAU)
- S2: Keberlanjutan
- S3: Konservasi
- S4: Pengembangan Agresif
- S5: Adaptasi Iklim

### `app/skenario/page.tsx` & `app/simulasi/page.tsx`

Pages yang memanggil `runModel()` untuk simulasi:

```typescript
const data = await runModel(scenarioParams);
// Gunakan data untuk chart dan analisis
```

## Testing

### Dev Server
```bash
npm run dev
# Server berjalan di http://localhost:3000
```

### Build Production
```bash
npm run build
# Build successful jika tidak ada error
```

## Fallback Mechanism

Jika model SDEverywhere tidak tersedia, aplikasi menggunakan dummy data generator yang mempertahankan logika simulasi:
- Exponential growth untuk wisatawan
- Linear growth untuk akomodasi
- Depletion untuk air tanah
- Accumulation untuk polusi

Ini memastikan aplikasi tetap berfungsi bahkan tanpa model native.

## Next Steps (Optional Improvements)

1. **Direct Vensim Integration** - Gunakan `@sdeverywhere/bridge` untuk koneksi real-time
2. **Performance Optimization** - Cache hasil simulasi untuk parameter yang sama
3. **Model Validation** - Compare output dengan original Vensim
4. **Parameter Sensitivity Analysis** - Automated parameter sweep

## Troubleshooting

### Model tidak loading
```typescript
// Cek error di browser console
// fallback akan otomatis ke dummy data
```

### Parameter nilai tidak berpengaruh
- Verifikasi nama parameter di Vensim match dengan `setConstant()` call
- Check unit conversion (% vs decimal)

### Output values tidak masuk akal
- Verify initial values di `generateDummyData()`
- Check model time step dan final time
