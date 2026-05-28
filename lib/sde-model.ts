import loadModel from './model-fix.js'

export interface SimulationParams {
  laju_wisnus: number
  laju_wisman: number
  laju_konstruksi_hotel: number
  proporsi_olah_limbah_cair: number
  proporsi_olah_limbah_padat: number
  ekstraksi_air_diizinkan: number
  infiltrasi_normal: number
  lahan_diizinkan_resort: number
  luas_lahan_per_unit: number
}

export interface SimulationData {
  years: number[]
  jumlah_wisnus: number[]
  jumlah_wisman: number[]
  jumlah_akomodasi: number[]
  populasi: number[]
  stok_air_tanah: number[]
  luas_area_terbangun: number[]
  akumulasi_polusi: number[]
  indeks_kualitas: number[]
  lapangan_kerja: number[]
  rasio_demand_supply: number[]
}

let modelInstance: any = null

async function initializeModel() {
  if (!modelInstance) {
    modelInstance = await loadModel()
  }
  return modelInstance
}

export async function runModel(
  params: SimulationParams
): Promise<SimulationData> {
  try {
    const model = await initializeModel()

    // Initialize model
    const fns = {
      ABS: Math.abs,
      DELAY: (value: number, delayTime: number) => value,
      IF: (condition: boolean, thenValue: number, elseValue: number) =>
        condition ? thenValue : elseValue,
      MAX: Math.max,
      MIN: Math.min,
      RANDOM: Math.random,
      SQRT: Math.sqrt,
      INT: Math.floor,
    }

    model.setModelFunctions(fns)
    model.initConstants()
    model.initLevels()

    // Map parameters to model variable names
    // Note: The model variable names use underscores prefix (e.g., _laju_pertumbuhan_wisatawan_nusantara_dasar)
    const paramMapping: Record<string, string> = {
      laju_pertumbuhan_wisatawan_nusantara_dasar: (params.laju_wisnus * 100).toString(),
      laju_pertumbuhan_wisatawan_mancanegara_dasar: (
        params.laju_wisman * 100
      ).toString(),
      laju_konstruksi_hotel_dasar: params.laju_konstruksi_hotel.toString(),
      proporsi_pengolahan_air_limbah: params.proporsi_olah_limbah_cair.toString(),
      proporsi_pengolahan_limbah_padat: params.proporsi_olah_limbah_padat.toString(),
      ekstraksi_air_tanah_yang_diizinkan: params.ekstraksi_air_diizinkan.toString(),
      normal_infiltration_rate: params.infiltrasi_normal.toString(),
      lahan_diizinkan_untuk_resort: params.lahan_diizinkan_resort.toString(),
      luas_lahan_per_unit_akomodasi: params.luas_lahan_per_unit.toString(),
    }

    // Set initial time
    const initialTime = model.getInitialTime()
    const finalTime = model.getFinalTime()
    const timeStep = model.getTimeStep()

    // Set inputs - try to set constants directly
    Object.entries(paramMapping).forEach(([varName, value]) => {
      try {
        model.setConstant(varName, parseFloat(value))
      } catch (e) {
        // Variable might not be a constant, skip
      }
    })

    // Run simulation and collect outputs
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
    }

    // Simulation loop
    for (let time = initialTime; time <= finalTime; time += timeStep) {
      model.setTime(time)
      model.evalAux()
      model.evalLevels()

      data.years.push(Math.round(time))
      data.jumlah_wisnus.push(Math.floor(model.storeOutput('_jumlah_wisatawan_nusantara')))
      data.jumlah_wisman.push(Math.floor(model.storeOutput('_jumlah_wisatawan_mancanegara')))
      data.jumlah_akomodasi.push(
        Math.floor(model.storeOutput('_jumlah_unit_akomodasi'))
      )
      data.populasi.push(Math.floor(model.storeOutput('_populasi_penduduk_diy')))
      data.stok_air_tanah.push(
        Math.floor(model.storeOutput('_stok_air_tanah') / 1e6)
      )
      data.luas_area_terbangun.push(
        Math.floor(model.storeOutput('_luas_area_terbangun'))
      )
      data.akumulasi_polusi.push(model.storeOutput('_akumulasi_polusi'))
      data.indeks_kualitas.push(model.storeOutput('_indeks_kualitas_lingkungan'))
      data.lapangan_kerja.push(
        Math.floor(model.storeOutput('_lapangan_kerja_pariwisata'))
      )

      // Rasio demand/supply dari model
      const demand = (data.jumlah_wisnus[data.jumlah_wisnus.length - 1] +
        data.jumlah_wisman[data.jumlah_wisman.length - 1] +
        data.populasi[data.populasi.length - 1]) as number
      const supply = (data.stok_air_tanah[data.stok_air_tanah.length - 1] *
        1e6) as number
      data.rasio_demand_supply.push(Math.max(0, Math.min(2, demand * 100 / supply)))
    }

    return data
  } catch (error) {
    console.error('Model execution error:', error)
    throw error
  }
}
