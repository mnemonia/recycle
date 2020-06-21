export enum MaterialId {
    ALU = 2,
    METALL = 3,
    GLAS = 5,
    GLAS_BOTTLE = 6,
    PET = 8,
    BATTERY = 9,
    CARDBOARD = 13,
    ELECTRIC_HOUSEHOLD = 28,
    PE_DAIRY_PRODUCE_BOTTLES = 30, // PE Dairy Produce Bottles
    PE_KUNSTSTOFF_FLASCHEN = 37, // Plastic bottles
    SAMMELSACK_CH = 100,
    MIGROS_GENERATION_M = 101
}
export class Material {
    id: number;
}
export class SammelstelleMunicipality {
    name: string;
    material_regional: string;
    remote_id: number;
}
export class SammelstelleCity {
    id: number;
    zip: string;
    name: string;
    file: string;
    outdated: string;
    municipality: SammelstelleMunicipality;
}

export class Sammelstelle {
    city: SammelstelleCity;
    id: number;
    full_name: string;
    lat: number;
    lng: number;
    materials: Material[];
    active: number;
    exactness: number;
    inaccurate: boolean;
}
export class LocationAttrs {
    detail: string;//  "glarus nord gl"
    featureId: string;// "1630"
    geom_quadindex: string;//"030"
    geom_st_box2d: string;// "BOX(2714690.326 1211186.713,2733163.974 1225966.591)"
    label: string;// "<b>Glarus Nord (GL)</b>"
    lat: number;// 47.10641860961914
    lon: number;// 9.079218864440918
    num: number;// 1
    origin: string;// "gg25"
    rank: number;// 2
    x: number;// 1218570.375
    y: number;// 2724521
    zoomlevel: number;
}

export class Location {
    is_search_history: boolean;
    result: string;
    attrs: LocationAttrs;
    address_canonical: string;
}
export class Price {
    value: number;
    value_per_kg: number;
}

export class JobStatus {
    state: number;
}
export class Interval {
    repeat_weekday_number: number; // 0 monday, 1 thuesday, .., 6 sunday
    repeat_dayhour_number: number; // 0 00:00, 12 12:00, 18 18:00
    repeat_weeks: number; // 1 = every week
    is_active: boolean;
}

export class Job {
    type: string;
    description: string;
    status: JobStatus;
    first_start_date: string;
    last_done_date: string;
    image_name: string;
    price: Price;
    material_id: MaterialId;
    is_selected: boolean;
    sammelstellen: Sammelstelle[];
}

export class Subscription {
    surname: string;
    lastname: string;
    street: string;
    number: string;
    plz4: string;
    plzname: string;
    is_address_identified: boolean;
    jobs: Job[];
    interval: Interval;
    timestamp: string;
    price_per_month: Price;
    gdekt: string;
    gdname: string;
    gdid: number;
    total_saved_km_per_year: number;
    total_saved_co2_per_year: number;
    total_saved_fuel_per_year_in_liter: number;
    total_saved_fuel_per_year_in_fr: number;
    estimated_weight_in_kg: number;
    address_canonical: string;
}
