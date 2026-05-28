export interface SimulationParams {
  laju_wisnus: number;
  laju_wisman: number;
  laju_konstruksi_hotel: number;
  proporsi_olah_limbah_cair: number;
  proporsi_olah_limbah_padat: number;
  ekstraksi_air_diizinkan: number;
  infiltrasi_normal: number;
  lahan_diizinkan_resort: number;
  luas_lahan_per_unit: number;
}

export interface SimulationData {
  years: number[];
  jumlah_wisnus: number[];
  jumlah_wisman: number[];
  jumlah_akomodasi: number[];
  populasi: number[];
  stok_air_tanah: number[];
  luas_area_terbangun: number[];
  akumulasi_polusi: number[];
  indeks_kualitas: number[];
  lapangan_kerja: number[];
  rasio_demand_supply: number[];
}

// Dynamic import for SDEverywhere model
async function loadSDEModel() {
  try {
    // @ts-ignore
    const moduleSpec = await import('./model-fix.js');
    return await moduleSpec.default();
  } catch (error) {
    console.warn('SDEverywhere model not available, using fallback', error);
    return null;
  }
}

// Fallback: Dummy data generator if SDE model unavailable
function generateDummyData(params: SimulationParams): SimulationData {
  const years = Array.from({ length: 27 }, (_, i) => 2024 + i);

  // Initial values
  const wisnus_base = 3_820_000;
  const wisman_base = 1_340_000;
  const akomodasi_base = 23_400;
  const populasi_base = 3_743_052;
  const air_base = 440_000_000;
  const luas_base = 15_000;
  const polusi_base = 1.0;

  const data: SimulationData = {
    years,
    jumlah_wisnus: [],
    jumlah_wisman: [],
    jumlah_akomodasi: [],
    populasi: [],
    stok_air_tanah: [],
    luas_area_terbangun: [],
    akumulasi_polusi: [],
    indeks_kualitas: [],
    lapangan_kerja: [],
    rasio_demand_supply: [],
  };

  for (let t = 0; t < 27; t++) {
    // Wisatawan Nusantara exponential growth
    const wisnus = wisnus_base * Math.pow(1 + params.laju_wisnus, t);
    data.jumlah_wisnus.push(Math.floor(wisnus));

    // Wisatawan Mancanegara exponential growth
    const wisman = wisman_base * Math.pow(1 + params.laju_wisman, t);
    data.jumlah_wisman.push(Math.floor(wisman));

    // Akomodasi linear growth
    const akomodasi = akomodasi_base + params.laju_konstruksi_hotel * t;
    data.jumlah_akomodasi.push(Math.floor(akomodasi));

    // Populasi dengan net growth rate
    const net_growth = 0.008;
    const populasi = populasi_base * Math.pow(1 + net_growth, t);
    data.populasi.push(Math.floor(populasi));

    // Stok Air Tanah (depletion)
    const annual_ekstraksi = params.ekstraksi_air_diizinkan;
    const stok = Math.max(
      1.8e7,
      air_base - annual_ekstraksi * t + params.infiltrasi_normal * t
    );
    data.stok_air_tanah.push(Math.floor(stok / 1e6));

    // Luas Area Terbangun
    const luas_terbentuk = luas_base + params.lahan_diizinkan_resort * luas_base * t;
    data.luas_area_terbangun.push(Math.floor(luas_terbentuk));

    // Akumulasi Polusi
    const polusi = polusi_base + t * 0.08 * (1 - params.proporsi_olah_limbah_cair);
    data.akumulasi_polusi.push(Math.max(0, Math.min(5, polusi)));

    // Indeks Kualitas Lingkungan (inverse of pollution)
    const kualitas = 1 / (1 + data.akumulasi_polusi[t]);
    data.indeks_kualitas.push(Math.max(0, Math.min(1, kualitas)));

    // Lapangan Kerja
    const jobs_per_unit = 8;
    const lapangan =
      akomodasi * jobs_per_unit + (wisnus + wisman) * 0.02;
    data.lapangan_kerja.push(Math.floor(lapangan));

    // Rasio Demand-Supply Air
    const demand_air = (wisnus + wisman + populasi) * 100; // m³/tahun
    const supply = stok * 1e6;
    const rasio = demand_air / supply;
    data.rasio_demand_supply.push(Math.max(0, Math.min(2, rasio)));
  }

  return data;
}

export async function runModel(
  params: SimulationParams
): Promise<SimulationData> {
  try {
    // Try to load and run SDEverywhere model
    const sdeModel = await loadSDEModel();

    if (sdeModel) {
      try {
        // Set up SDE model with parameters
        const fns = {
          ABS: Math.abs,
          IF: (c: boolean, t: number, f: number) => (c ? t : f),
          MAX: Math.max,
          MIN: Math.min,
          SQRT: Math.sqrt,
          ROUND: Math.round,
          INT: Math.floor,
          LOG: Math.log,
          RANDOM: Math.random,
          SIN: Math.sin,
          COS: Math.cos,
        };

        sdeModel.setModelFunctions(fns);
        sdeModel.initConstants();
        sdeModel.initLevels();

        // Set model parameters
        const paramMapping = {
          laju_pertumbuhan_wisatawan_nusantara_dasar: params.laju_wisnus * 100,
          laju_pertumbuhan_wisatawan_mancanegara_dasar: params.laju_wisman * 100,
          laju_konstruksi_hotel_dasar: params.laju_konstruksi_hotel,
          proporsi_pengolahan_air_limbah: params.proporsi_olah_limbah_cair,
          proporsi_pengolahan_limbah_padat: params.proporsi_olah_limbah_padat,
          ekstraksi_air_tanah_yang_diizinkan: params.ekstraksi_air_diizinkan,
          normal_infiltration_rate: params.infiltrasi_normal,
          lahan_diizinkan_untuk_resort: params.lahan_diizinkan_resort,
          luas_lahan_per_unit_akomodasi: params.luas_lahan_per_unit,
        };

        Object.entries(paramMapping).forEach(([key, value]) => {
          try {
            sdeModel.setConstant(key, value);
          } catch (e) {
            // Silently skip if parameter not found
          }
        });

        const initialTime = sdeModel.getInitialTime();
        const finalTime = sdeModel.getFinalTime();
        const timeStep = sdeModel.getTimeStep();

        const data: SimulationData = {
          years: [],
          jumlah_wisnus: [],
          jumlah_wisman: [],
          jumlah_akomodasi: [],
          populasi: [],
          stok_air_tanah: [],
          luas_area_terbangun: [],
          akumulasi_polusi: [],
          indeks_kualitas: [],
          lapangan_kerja: [],
          rasio_demand_supply: [],
        };

        for (let time = initialTime; time <= finalTime; time += timeStep) {
          sdeModel.setTime(time);
          sdeModel.evalAux();
          sdeModel.evalLevels();

          data.years.push(Math.round(time));

          // Store outputs from SDE model
          const getVar = (varName: string, defaultVal = 0) => {
            try {
              const result = sdeModel.storeOutput(varName);
              return (result !== undefined && result !== null) ? result : defaultVal;
            } catch {
              return defaultVal;
            }
          };

          data.jumlah_wisnus.push(Math.floor(getVar('_jumlah_wisatawan_nusantara', 3820000)));
          data.jumlah_wisman.push(Math.floor(getVar('_jumlah_wisatawan_mancanegara', 1340000)));
          data.jumlah_akomodasi.push(Math.floor(getVar('_jumlah_unit_akomodasi', 23400)));
          data.populasi.push(Math.floor(getVar('_populasi_penduduk_diy', 3743052)));
          data.stok_air_tanah.push(Math.floor(getVar('_stok_air_tanah', 440000000) / 1e6));
          data.luas_area_terbangun.push(Math.floor(getVar('_luas_area_terbangun', 15000)));
          data.akumulasi_polusi.push(Math.max(0, getVar('_akumulasi_polusi', 1)));
          data.indeks_kualitas.push(Math.max(0, Math.min(1, getVar('_indeks_kualitas_lingkungan', 0.8))));
          data.lapangan_kerja.push(Math.floor(getVar('_lapangan_kerja_pariwisata', 100000)));

          const rasio = getVar('_rasio_demand_supply_air_', 0.5);
          data.rasio_demand_supply.push(Math.max(0, Math.min(2, rasio)));
        }

        return data;
      } catch (sdeError) {
        console.warn('Error executing SDE model, falling back to dummy data', sdeError);
        return generateDummyData(params);
      }
    } else {
      console.info('SDE model not loaded, using dummy data generator');
      return generateDummyData(params);
    }
  } catch (error) {
    console.error('Model execution error:', error);
    return generateDummyData(params);
  }
}
